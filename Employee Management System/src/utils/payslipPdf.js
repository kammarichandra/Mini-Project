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

function addLogoBadge(commands) {
  const x = 48;
  const y = 685;
  const size = 62;
  const radius = 11;
  const curve = radius * 0.5523;

  commands.push(
    `q 1 1 1 rg 0.76 0.86 0.97 RG 1.2 w ` +
      `${x + radius} ${y} m ${x + size - radius} ${y} l ` +
      `${x + size - radius + curve} ${y} ${x + size} ${y + radius - curve} ${x + size} ${y + radius} c ` +
      `${x + size} ${y + size - radius} l ` +
      `${x + size} ${y + size - radius + curve} ${x + size - radius + curve} ${y + size} ${x + size - radius} ${y + size} c ` +
      `${x + radius} ${y + size} l ` +
      `${x + radius - curve} ${y + size} ${x} ${y + size - radius + curve} ${x} ${y + size - radius} c ` +
      `${x} ${y + radius} l ` +
      `${x} ${y + radius - curve} ${x + radius - curve} ${y} ${x + radius} ${y} c B Q`
  );
  commands.push("q 48 0 0 48 55 692 cm /Im1 Do Q");
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

  const sourceHeight = image.naturalHeight * 0.68;
  const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / sourceHeight);
  const width = image.naturalWidth * scale;
  const height = sourceHeight * scale;
  context.drawImage(
    image,
    0,
    image.naturalHeight * 0.04,
    image.naturalWidth,
    sourceHeight,
    (canvas.width - width) / 2,
    (canvas.height - height) / 2,
    width,
    height
  );

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
  const netSalary = Math.max(Number(record.salary) - Number(record.deductions), 0);
  const formatAmount = (amount) =>
    `INR ${new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  const [year, month] = period.split("-");
  const periodLabel = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
    "en-IN",
    { month: "long", year: "numeric" }
  );
  const processedDate = record.processedAt
    ? new Date(record.processedAt).toLocaleDateString("en-IN")
    : "Not processed";
  const commands = [];

  addRectangle(commands, 0, 650, 612, 142, "0.03 0.17 0.35");
  addRectangle(commands, 0, 646, 612, 4, "0.09 0.41 0.91");
  addLogoBadge(commands);
  addText(commands, "TeamSync", 126, 741, 12, "0.72 0.87 1");
  addText(commands, "PAYSLIP", 126, 708, 23, "1 1 1");
  addText(commands, periodLabel, 126, 684, 12, "0.82 0.89 0.97");

  addText(commands, "EMPLOYEE DETAILS", 48, 610, 10, "0.09 0.41 0.91");
  addText(commands, "Employee", 48, 580, 9, "0.43 0.50 0.59");
  addText(commands, employee.name, 48, 562, 13);
  addText(commands, "Employee ID", 330, 580, 9, "0.43 0.50 0.59");
  addText(commands, employee.id, 330, 562, 13);
  addText(commands, "Department", 48, 530, 9, "0.43 0.50 0.59");
  addText(commands, employee.department, 48, 512, 11);
  addText(commands, "Status", 330, 530, 9, "0.43 0.50 0.59");
  addText(commands, record.status, 330, 512, 11);
  addLine(commands, 48, 488, 564, 488);

  addText(commands, "PAYMENT SUMMARY", 48, 458, 10, "0.09 0.41 0.91");
  addText(commands, "Description", 48, 428, 9, "0.43 0.50 0.59");
  addText(commands, "Amount", 442, 428, 9, "0.43 0.50 0.59");
  addLine(commands, 48, 416, 564, 416);

  addText(commands, "Basic salary", 48, 389, 11);
  addText(commands, formatAmount(record.salary), 442, 389, 11);
  addLine(commands, 48, 372, 564, 372);
  addText(commands, "Deductions", 48, 347, 11);
  addText(commands, `- ${formatAmount(record.deductions)}`, 442, 347, 11);
  addLine(commands, 48, 330, 564, 330);
  addRectangle(commands, 38, 268, 536, 48, "0.91 0.96 1");
  addText(commands, "NET PAY", 54, 286, 11, "0.03 0.17 0.35");
  addText(commands, formatAmount(netSalary), 414, 284, 16, "0.03 0.17 0.35");

  addText(commands, `Processed on: ${processedDate}`, 48, 226, 9, "0.43 0.50 0.59");
  addLine(commands, 48, 72, 564, 72);
  addText(commands, "This payslip was generated by TeamSync.", 48, 52, 9, "0.43 0.50 0.59");

  const safeEmployeeId = String(employee.id).replace(/[^a-zA-Z0-9_-]/g, "_");
  const safePeriod = period.replace(/[^0-9-]/g, "");
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
