const payrollStorageKey = "employeeManagementDashboardPayroll";

export function getPayrollRecordsFromStorage() {
  try {
    const records = JSON.parse(
      window.localStorage.getItem(payrollStorageKey) || "{}"
    );

    return records && typeof records === "object" && !Array.isArray(records)
      ? records
      : {};
  } catch {
    return {};
  }
}

export function savePayrollRecordsToStorage(records) {
  try {
    window.localStorage.setItem(payrollStorageKey, JSON.stringify(records));
  } catch {
    return;
  }
}

export function getPayrollRecord(records, period, employeeId) {
  const record = records[period]?.[String(employeeId)] || {};
  const salary = Number(record.salary);
  const deductions = Number(record.deductions);

  return {
    salary: Number.isFinite(salary) && salary > 0 ? salary : 0,
    deductions: Number.isFinite(deductions) && deductions > 0 ? deductions : 0,
    status: record.status === "Processed" ? "Processed" : "Pending",
    processedAt: typeof record.processedAt === "string" ? record.processedAt : "",
  };
}
