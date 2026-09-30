import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Payroll.css";
import PageSurface from "../Components/PageSurface";
import { getEmployeesFromStorage } from "../utils/employees";
import { createCsvContent, downloadCsv } from "../utils/csv";
import {
  getPayrollRecord,
  getPayrollRecordsFromStorage,
  savePayrollRecordsToStorage,
} from "../utils/payroll";

function getCurrentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function Payroll() {
  const [employees] = useState(getEmployeesFromStorage);
  const [payrollRecords, setPayrollRecords] = useState(getPayrollRecordsFromStorage);
  const [period, setPeriod] = useState(getCurrentPeriod);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [selectedIds, setSelectedIds] = useState([]);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    savePayrollRecordsToStorage(payrollRecords);
  }, [payrollRecords]);

  const departments = [...new Set(employees.map((employee) => employee.department))];
  const getRecord = (employeeId) => getPayrollRecord(payrollRecords, period, employeeId);
  const filteredEmployees = employees.filter((employee) => {
    const searchTerm = search.trim().toLowerCase();
    const matchesSearch = [employee.name, employee.id, employee.department]
      .some((value) => String(value).toLowerCase().includes(searchTerm));
    const matchesDepartment = department === "All Departments" || employee.department === department;
    const matchesStatus = status === "All Status" || getRecord(employee.id).status === status;
    return matchesSearch && matchesDepartment && matchesStatus;
  });
  const paySummaries = employees.map((employee) => ({
    employee,
    ...getRecord(employee.id),
  }));
  const processedCount = paySummaries.filter((record) => record.status === "Processed").length;
  const pendingCount = paySummaries.filter((record) => record.status === "Pending").length;
  const payrollTotal = paySummaries.reduce(
    (total, record) => total + Math.max(record.salary - record.deductions, 0),
    0
  );
  const allVisibleSelected = filteredEmployees.length > 0 && filteredEmployees.every(
    (employee) => selectedIds.includes(String(employee.id))
  );

  const toggleAllVisible = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !filteredEmployees.some((employee) => String(employee.id) === id));
      }
      return [...new Set([...current, ...filteredEmployees.map((employee) => String(employee.id))])];
    });
  };

  const updateAmount = (employeeId, field, value) => {
    const amount = Math.max(Number(value) || 0, 0);
    setPayrollRecords((current) => {
      const existing = getPayrollRecord(current, period, employeeId);
      const nextSalary = field === "salary" ? amount : existing.salary;
      const nextDeductions = field === "deductions"
        ? Math.min(amount, nextSalary)
        : Math.min(existing.deductions, nextSalary);
      return {
        ...current,
        [period]: {
          ...current[period],
          [String(employeeId)]: {
            ...existing,
            salary: nextSalary,
            deductions: nextDeductions,
            status: "Pending",
            processedAt: "",
          },
        },
      };
    });
    setFeedback("");
  };

  const processPayroll = () => {
    const employeeIds = selectedIds.length
      ? selectedIds
      : employees.map((employee) => String(employee.id));
    const eligibleIds = employeeIds.filter((employeeId) => {
      const record = getRecord(employeeId);
      return record.salary > 0 && record.status === "Pending";
    });

    if (!eligibleIds.length) {
      setFeedback(employees.length
        ? "Enter a salary above zero for pending employees before processing."
        : "Add employees before processing payroll.");
      return;
    }

    const processedAt = new Date().toISOString();
    setPayrollRecords((current) => ({
      ...current,
      [period]: {
        ...current[period],
        ...Object.fromEntries(eligibleIds.map((employeeId) => [employeeId, {
          ...getPayrollRecord(current, period, employeeId),
          status: "Processed",
          processedAt,
        }])),
      },
    }));
    setSelectedIds([]);
    setFeedback(`${eligibleIds.length} payroll record${eligibleIds.length === 1 ? "" : "s"} processed.`);
  };

  const downloadStatement = (employee) => {
    const record = getRecord(employee.id);
    const rows = [
      ["Employee ID", "Employee", "Department", "Period", "Basic salary", "Deductions", "Net salary", "Status"],
      [employee.id, employee.name, employee.department, period, record.salary, record.deductions, Math.max(record.salary - record.deductions, 0), record.status],
    ];
    downloadCsv(`payslip-${employee.id}-${period}.csv`, createCsvContent(rows));
  };

  const resetFilters = () => {
    setSearch("");
    setDepartment("All Departments");
    setStatus("All Status");
    setSelectedIds([]);
  };

  return (
    <PageSurface
      title="Payroll"
      subtitle="Manage salaries, payslips and payment history."
      icon="fa-credit-card"
      actionLabel="Process Payroll"
      onAction={processPayroll}
      stats={[
        { label: "Total employees", value: employees.length, note: "From employee directory" },
        { label: "Payroll processed", value: processedCount, note: `of ${employees.length} employees` },
        { label: "Pending payments", value: pendingCount, note: `For ${period}`, tone: "warning" },
        { label: "Total payroll", value: formatCurrency(payrollTotal), note: `Net amount for ${period}` },
      ]}
    >

      {/* Main Content */}
      <section className="workspace-panel workspace-panel-wide payroll-directory">

        {/* Filters */}
        <section className="filter-box">

          <div className="filter-group">
            <label htmlFor="payroll-period">Month</label>
            <input id="payroll-period" type="month" value={period} onChange={(event) => { setPeriod(event.target.value); setSelectedIds([]); }} />
          </div>

          <div className="filter-group">
            <label htmlFor="payroll-department">Department</label>
            <select id="payroll-department" value={department} onChange={(event) => setDepartment(event.target.value)}>
              <option>All Departments</option>
              {departments.map((departmentName) => <option key={departmentName}>{departmentName}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="payroll-status">Status</label>
            <select id="payroll-status" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>All Status</option>
              <option>Processed</option>
              <option>Pending</option>
            </select>
          </div>

          <div className="filter-actions">

            <div className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                type="text"
                aria-label="Search employees"
                placeholder="Search name, ID, or department"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <button
              className="reset-btn"
              type="button"
              onClick={resetFilters}
            >
              Clear filters
            </button>

          </div>
        </section>

        {/* Payroll Table */}
        <section className="table-container">

          <table>

            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="Select all visible employees" />
                </th>
                <th>#</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Basic Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length === 0 ? <tr><td className="empty-state" colSpan="9">
                {employees.length === 0 ? <>No employees yet. <Link to="/Employees">Open the employee directory</Link> to add payroll records.</> : "No employees match these filters."}
              </td></tr> : filteredEmployees.map((employee, index) => {
                const record = getRecord(employee.id);
                const netSalary = Math.max(record.salary - record.deductions, 0);
                return <tr key={employee.id}>

                  <td>
                    <input type="checkbox" checked={selectedIds.includes(String(employee.id))} onChange={() => setSelectedIds((current) => current.includes(String(employee.id)) ? current.filter((id) => id !== String(employee.id)) : [...current, String(employee.id)])} aria-label={`Select ${employee.name} for payroll`} />
                  </td>

                  <td>{index + 1}</td>

                  <td>
                    <div className="employee-info">

                      <div className={`avatar avatar-${index % 5}`}>
                        {employee.initials}
                      </div>

                      <div>
                        <strong>{employee.name}</strong>
                        <small>{employee.id}</small>
                      </div>

                    </div>
                  </td>

                  <td>
                    <span className="department">
                      {employee.department}
                    </span>
                  </td>

                  <td><input className="payroll-amount" type="number" min="0" step="0.01" aria-label={`Basic salary for ${employee.name}`} value={record.salary || ""} placeholder="Set amount" onChange={(event) => updateAmount(employee.id, "salary", event.target.value)} /></td>

                  <td><input className="payroll-amount" type="number" min="0" max={record.salary} step="0.01" aria-label={`Deductions for ${employee.name}`} value={record.deductions || ""} placeholder="0.00" onChange={(event) => updateAmount(employee.id, "deductions", event.target.value)} /></td>

                  <td>{formatCurrency(netSalary)}</td>

                  <td>
                    <span
                      className={
                        record.status === "Processed"
                          ? "status processed"
                          : "status pending"
                      }
                    >
                      {record.status}
                    </span>
                  </td>

                  <td>
                    <div className="actions">

                      <button type="button" title="Download payslip" aria-label={`Download ${employee.name}'s payslip`} onClick={() => downloadStatement(employee)}>
                        <i className="fa-solid fa-download" aria-hidden="true"></i>
                      </button>

                    </div>
                  </td>

                </tr>;
              })}
            </tbody>

          </table>

          {/* Table Footer */}
          <div className="table-footer">

            <span>Showing {filteredEmployees.length} of {employees.length} employees</span>
            {feedback && <span className="payroll-feedback" role="status">{feedback}</span>}

          </div>

        </section>

      </section>

      {/* Footer */}
    </PageSurface>
  );
}

export default Payroll;