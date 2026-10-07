import logoUrl from "../assets/logo1.png";

function pdfText(value) {
  return String(value ?? "")
    .replace(/[^\x20-\x7E]/g, "?")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function addText(commands, text, x, y, size = 11, color = "0.15 0.23 0.34") {
  commands.push(
    `BT /F1 ${size} Tf ${color} rg 1 0 0 1 ${x} ${y} Tm (${pdfText(text)}) Tj ET`
  );
}

function addLine(commands, x1, y1, x2, y2, color = "0.86 0.89 0.93") {
  commands.push(`${color} RG 0.7 w ${x1} ${y1} m ${x2} ${y2} l S`);
}

function addRectangle(commands, x, y, width, height, color) {
  commands.push(`${color} rg ${x} ${y} ${width} ${height} re f`);
}

async function loadLogoAsJpeg() {
  const image = new Image();
  image.src = logoUrl;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error("Unable to load the TeamSync logo for the payslip."));
  });

  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to prepare the TeamSync logo for the payslip.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);

  const jpegBlob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Unable to encode the TeamSync logo for the payslip.")),
      "image/jpeg",
      0.92
    );
  });

  return {
    bytes: new Uint8Array(await jpegBlob.arrayBuffer()),
    width: canvas.width,
    height: canvas.height,
  };
}

function concatenateBytes(chunks) {
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;

  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });

  return result;
}

function buildPdf(content, logoImage) {
  const encoder = new TextEncoder();
  const stream = `${content}\n`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> /XObject << /Im1 6 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    `<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}endstream`,
  ];
  const chunks = [encoder.encode("%PDF-1.4\n")];
  const offsets = [0];
  let documentLength = chunks[0].length;

  objects.forEach((object, index) => {
    offsets.push(documentLength);
    const bytes = encoder.encode(`${index + 1} 0 obj\n${object}\nendobj\n`);
    chunks.push(bytes);
    documentLength += bytes.length;
  });

  offsets.push(documentLength);
  const imageHeader = encoder.encode(
    `6 0 obj\n<< /Type /XObject /Subtype /Image /Width ${logoImage.width} /Height ${logoImage.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoImage.bytes.length} >>\nstream\n`
  );
  const imageFooter = encoder.encode("\nendstream\nendobj\n");
  chunks.push(imageHeader, logoImage.bytes, imageFooter);
  documentLength += imageHeader.length + logoImage.bytes.length + imageFooter.length;

  const crossReferenceOffset = documentLength;
  let trailer = `xref\n0 ${objects.length + 2}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    trailer += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  trailer += `trailer\n<< /Size ${objects.length + 2} /Root 1 0 R >>\nstartxref\n${crossReferenceOffset}\n%%EOF`;
  chunks.push(encoder.encode(trailer));

  return new Blob([concatenateBytes(chunks)], { type: "application/pdf" });
}

export async function downloadPayslipPdf(employee, record, period) {
  const resolvedEmployee = employee || {};
  const resolvedRecord = record || {};
  const grossSalary = Math.max(Number(resolvedRecord.salary) || 0, 0);
  const deductions = Math.max(Number(resolvedRecord.deductions) || 0, 0);
  const netSalary = Math.max(grossSalary - deductions, 0);
  const formatAmount = (amount) =>
    `INR ${new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  const periodLabel = new Date(`${period}-01T00:00:00`).toLocaleDateString(
    "en-IN",
    { month: "long", year: "numeric" }
  );
  const processedDate = resolvedRecord.processedAt
    ? new Date(resolvedRecord.processedAt).toLocaleDateString("en-IN")
    : "Pending";
  const commands = [];

  addRectangle(commands, 0, 0, 612, 792, "1 1 1");
  addRectangle(commands, 35, 650, 540, 100, "0.96 0.97 0.99");
  addRectangle(commands, 35, 647, 540, 3, "0.10 0.42 0.88");
  commands.push("q 90 0 0 90 50 655 cm /Im1 Do Q");
  addText(commands, "EMPLOYEE PAYSLIP", 170, 712, 20, "0.04 0.14 0.25");
  addText(commands, `Pay period: ${periodLabel}`, 170, 686, 12, "0.30 0.36 0.43");
  addText(commands, `Status: ${resolvedRecord.status || "Pending"}`, 170, 666, 10, "0.30 0.36 0.43");

  addRectangle(commands, 35, 575, 540, 52, "0.89 0.94 1");
  addText(commands, "EMPLOYEE DETAILS", 52, 607, 10, "0.10 0.36 0.75");
  addText(commands, `Employee: ${resolvedEmployee.name || "Not provided"}`, 52, 586, 11);
  addText(commands, `Employee ID: ${resolvedEmployee.id || "Not provided"}`, 320, 586, 11);
  addText(commands, `Department: ${resolvedEmployee.department || "Not provided"}`, 52, 559, 11);
  addText(commands, `Designation: ${resolvedEmployee.designation || "Not provided"}`, 320, 559, 11);
  addLine(commands, 35, 540, 575, 540);

  addText(commands, "PAYMENT SUMMARY", 52, 510, 10, "0.10 0.36 0.75");
  addText(commands, "Description", 52, 480, 10, "0.36 0.42 0.49");
  addText(commands, "Amount", 450, 480, 10, "0.36 0.42 0.49");
  addLine(commands, 52, 468, 560, 468);
  addText(commands, "Gross salary", 52, 440, 12);
  addText(commands, formatAmount(grossSalary), 450, 440, 12);
  addLine(commands, 52, 424, 560, 424);
  addText(commands, "Deductions", 52, 396, 12);
  addText(commands, `- ${formatAmount(deductions)}`, 450, 396, 12);
  addRectangle(commands, 35, 330, 540, 48, "0.89 0.94 1");
  addText(commands, "NET SALARY", 52, 348, 12, "0.04 0.14 0.25");
  addText(commands, formatAmount(netSalary), 420, 346, 16, "0.04 0.14 0.25");

  addText(commands, `Processed on: ${processedDate}`, 52, 290, 10, "0.36 0.42 0.49");
  addLine(commands, 52, 72, 560, 72);
  addText(commands, "This payslip was generated by TeamSync.", 52, 52, 9, "0.36 0.42 0.49");

  const safeEmployeeId = String(resolvedEmployee.id || "employee").replace(/[^a-zA-Z0-9_-]/g, "_");
  const safePeriod = String(period).replace(/[^0-9-]/g, "");
  const fileName = `payslip-${safeEmployeeId}-${safePeriod}.pdf`;
  const logoImage = await loadLogoAsJpeg();
  const downloadUrl = URL.createObjectURL(buildPdf(commands.join("\n"), logoImage));
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = fileName;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
}
