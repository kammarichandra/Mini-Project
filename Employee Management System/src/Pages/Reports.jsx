import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageSurface from "../Components/PageSurface";
import { getEmployeesFromStorage } from "../utils/employees";
import { createCsvContent, downloadCsv } from "../utils/csv";
import { getPayrollRecord, getPayrollRecordsFromStorage } from "../utils/payroll";

const reportStorageKey = "employeeManagementDashboardReports";
const attendanceStorageKey = "employeeManagementDashboardAttendance";
const reportTypes = {
  employees: "Employee directory",
  attendance: "Attendance summary",
  payroll: "Payroll costs",
};

function getSavedReports() {
  try {
    const savedReports = JSON.parse(
      window.localStorage.getItem(reportStorageKey) || "[]"
    );
    return Array.isArray(savedReports)
      ? savedReports.filter((report) => report && typeof report.csvContent === "string")
      : [];
  } catch {
    return [];
  }
}

function getAttendanceHistory() {
  try {
    const history = JSON.parse(
      window.localStorage.getItem(attendanceStorageKey) || "{}"
    );
    return history && typeof history === "object" && !Array.isArray(history)
      ? history
      : {};
  } catch {
    return {};
  }
}

function formatReportDate(date) {
  return new Date(date).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Reports() {
  const [employees] = useState(getEmployeesFromStorage);
  const [attendanceHistory] = useState(getAttendanceHistory);
  const [payrollRecords] = useState(getPayrollRecordsFromStorage);
  const [reports, setReports] = useState(getSavedReports);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState("employees");

  useEffect(() => {
    try {
      window.localStorage.setItem(reportStorageKey, JSON.stringify(reports));
    } catch {
      return;
    }
  }, [reports]);

  const attendanceRecordCount = Object.values(attendanceHistory).reduce(
    (total, dayRecords) => total + (dayRecords && typeof dayRecords === "object" ? Object.keys(dayRecords).length : 0),
    0
  );
  const payrollRecordCount = Object.values(payrollRecords).reduce(
    (total, periodRecords) => total + (periodRecords && typeof periodRecords === "object" ? Object.keys(periodRecords).length : 0),
    0
  );

  const createReportRows = (type) => {
    if (type === "employees") {
      return [
        ["Employee ID", "Name", "Department", "Designation", "Email", "Status"],
        ...employees.map((employee) => [employee.id, employee.name, employee.department, employee.designation, employee.email, employee.status]),
      ];
    }

    if (type === "attendance") {
      const rows = [["Date", "Employee ID", "Name", "Department", "Check-in", "Status"]];
      Object.entries(attendanceHistory).sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate)).forEach(([date, dayRecords]) => {
        Object.entries(dayRecords || {}).forEach(([employeeId, record]) => {
          const employee = employees.find((currentEmployee) => String(currentEmployee.id) === employeeId);
          if (employee && record && typeof record === "object") {
            rows.push([date, employee.id, employee.name, employee.department, record.checkIn || "", record.status || "Not marked"]);
          }
        });
      });
      return rows;
    }

    const rows = [["Period", "Employee ID", "Name", "Department", "Basic salary", "Deductions", "Net salary", "Status"]];
    Object.entries(payrollRecords).sort(([firstPeriod], [secondPeriod]) => firstPeriod.localeCompare(secondPeriod)).forEach(([period, periodRecords]) => {
      Object.keys(periodRecords || {}).forEach((employeeId) => {
        const employee = employees.find((currentEmployee) => String(currentEmployee.id) === employeeId);
        if (!employee) return;
        const record = getPayrollRecord(payrollRecords, period, employeeId);
        rows.push([period, employee.id, employee.name, employee.department, record.salary, record.deductions, Math.max(record.salary - record.deductions, 0), record.status]);
      });
    });
    return rows;
  };

  const generateReport = (type) => {
    const rows = createReportRows(type);
    const csvContent = createCsvContent(rows);
    const generatedAt = new Date().toISOString();
    const dateKey = generatedAt.slice(0, 10);
    const report = {
      id: `report-${Date.now()}`,
      type,
      title: reportTypes[type],
      generatedAt,
      rowCount: rows.length - 1,
      fileName: `${type}-${dateKey}.csv`,
      csvContent,
    };

    setReports((current) => [report, ...current].slice(0, 30));
    downloadCsv(report.fileName, csvContent);
    setShowForm(false);
  };

  return (
    <PageSurface
      title="Reports"
      subtitle="Turn workforce data into clear, shareable decisions."
      icon="fa-chart-column"
      actionLabel={showForm ? "Cancel" : "Generate Report"}
      onAction={() => setShowForm((current) => !current)}
      stats={[
        { label: "Saved reports", value: reports.length, note: "Downloadable snapshots" },
        { label: "Employees", value: employees.length, note: "In the directory" },
        { label: "Attendance records", value: attendanceRecordCount, note: "Saved daily marks" },
        { label: "Payroll records", value: payrollRecordCount, note: "Across all periods" },
      ]}
    >
      <section className="workspace-panel workspace-panel-wide">
        <div className="panel-heading"><h2>Report library</h2><span>{reports.length} saved</span></div>
        {showForm && <form className="report-generator" onSubmit={(event) => { event.preventDefault(); generateReport(selectedType); }}>
          <label htmlFor="report-type">Report type</label>
          <select id="report-type" value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
            {Object.entries(reportTypes).map(([type, label]) => <option key={type} value={type}>{label}</option>)}
          </select>
          <button className="panel-button" type="submit">Download CSV</button>
        </form>}
        <div className="report-list">
          {reports.map((report) => <div className="report-row" key={report.id}>
            <div className="report-icon"><i className="fa-regular fa-file-lines" aria-hidden="true"></i></div>
            <div><strong>{report.title}</strong><p>CSV · {report.rowCount} rows · {formatReportDate(report.generatedAt)}</p></div>
            <button className="panel-button" type="button" onClick={() => downloadCsv(report.fileName, report.csvContent)}>Download</button>
          </div>)}
          {reports.length === 0 && <p className="panel-note">No reports generated yet.</p>}
        </div>
      </section>
      <section className="workspace-panel">
        <div className="panel-heading"><h2>Quick export</h2></div>
        <p className="panel-note">Export a snapshot of saved workforce data.</p>
        <button className="export-option" type="button" onClick={() => generateReport("employees")}>Employee directory <i className="fa-solid fa-download" aria-hidden="true"></i></button>
        <button className="export-option" type="button" onClick={() => generateReport("attendance")}>Attendance summary <i className="fa-solid fa-download" aria-hidden="true"></i></button>
        <button className="export-option" type="button" onClick={() => generateReport("payroll")}>Payroll costs <i className="fa-solid fa-download" aria-hidden="true"></i></button>
        {employees.length === 0 && <p className="panel-note report-empty">No employees yet. <Link to="/Employees">Open the employee directory</Link> to add data.</p>}
      </section>
    </PageSurface>
  );
}

export default Reports;