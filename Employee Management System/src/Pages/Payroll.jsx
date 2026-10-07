import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Payroll.css";
import PageSurface from "../Components/PageSurface";
import { getEmployeesFromStorage } from "../utils/employees";
import { downloadPayslipPdf } from "../utils/payslipPdf";
import { getCurrentUser, normalizeRole } from "../utils/auth";
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

function formatPeriod(periodValue) {
  const [year, month] = periodValue.split("-").map(Number);
  if (!year || !month || month > 12) return periodValue;
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function Payroll() {
  const currentUser = getCurrentUser();
  const role = normalizeRole(currentUser?.role);
  const isEmployee = role === "Employee";
  const canManagePayroll = ["Super Admin", "HR Admin", "Finance"].includes(role);
  const [employees] = useState(getEmployeesFromStorage);
  const [payrollRecords, setPayrollRecords] = useState(getPayrollRecordsFromStorage);
  const [period, setPeriod] = useState(getCurrentPeriod);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [selectedIds, setSelectedIds] = useState([]);
  const [feedback, setFeedback] = useState("");

  useEffect(() => { savePayrollRecordsToStorage(payrollRecords);
  }, [payrollRecords]);

  const visibleEmployees = isEmployee
    ? employees.filter(
        (employee) =>
          employee.email.toLowerCase() === currentUser?.email?.toLowerCase()
      )
    : employees;
  const departments = [...new Set(visibleEmployees.map((employee) => employee.department))];
  const getRecord = (employeeId) => getPayrollRecord(payrollRecords, period, employeeId);
  const filteredEmployees = visibleEmployees.filter((employee) => {
  const searchTerm = search.trim().toLowerCase();
  const matchesSearch = [employee.name, employee.id, employee.department]
      .some((value) => String(value).toLowerCase().includes(searchTerm));
    const matchesDepartment = department === "All Departments" || employee.department === department;
    const matchesStatus = status === "All Status" || getRecord(employee.id).status === status;
    return matchesSearch && matchesDepartment && matchesStatus;
  });
  const paySummaries = visibleEmployees.map((employee) => ({
    employee,
    ...getRecord(employee.id),
  }));
  const employeePayslips = isEmployee
    ? visibleEmployees.flatMap((employee) =>
        Object.keys(payrollRecords)
          .map((recordPeriod) => ({
            employee,
            period: recordPeriod,
            ...getPayrollRecord(payrollRecords, recordPeriod, employee.id),
          }))
          .filter((record) => record.status === "Processed")
      ).sort((first, second) => second.period.localeCompare(first.period))
    : [];
  const processedCount = isEmployee
    ? employeePayslips.length
    : paySummaries.filter((record) => record.status === "Processed").length;
  const pendingCount = paySummaries.filter(
    (record) =>
      record.status === "Pending" && (!isEmployee || record.salary > 0)
  ).length;
  const payrollTotal = isEmployee
    ? employeePayslips.reduce(
        (total, record) => total + Math.max(record.salary - record.deductions, 0),
        0
      )
    : paySummaries.reduce(
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

  const downloadStatement = (employee, record = getRecord(employee.id), recordPeriod = period) => {
    downloadPayslipPdf(employee, record, recordPeriod).catch((error) => {
      setFeedback(
        error instanceof Error ? error.message : "Unable to generate the payslip PDF."
      );
    });
  };

  const resetFilters = () => {
    setSearch("");
    setDepartment("All Departments");
    setStatus("All Status");
    setSelectedIds([]);
  };

  return (
    <PageSurface
      title={isEmployee ? "My Payslips" : "Payroll"}
      subtitle={isEmployee ? "View and download your processed payslips." : "Manage salaries, payslips and payment history."}
      icon="fa-credit-card"
      actionLabel={canManagePayroll ? "Process Payroll" : undefined}
      onAction={canManagePayroll ? processPayroll : undefined}
      stats={[
        { label: isEmployee ? "Payslips" : "Total employees", value: isEmployee ? processedCount : visibleEmployees.length, note: isEmployee ? "Across all available periods" : "From employee directory" },
        { label: isEmployee ? "Processed payslips" : "Payroll processed", value: processedCount, note: isEmployee ? "Ready to download" : `of ${visibleEmployees.length} employees` },
        { label: "Pending payments", value: pendingCount, note: `For ${period}`, tone: "warning" },
        { label: isEmployee ? "Total net paid" : "Total payroll", value: formatCurrency(payrollTotal), note: isEmployee ? "Across all payslips" : `Net amount for ${period}` },
      ]}
    >

      {/* Main Content */}
      <section className="workspace-panel workspace-panel-wide payroll-directory">
        {isEmployee ? (
          <section className="table-container">
            <div className="panel-heading">
              <h2>Payslip history</h2>
              <span>{employeePayslips.length} payslip{employeePayslips.length === 1 ? "" : "s"}</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Pay period</th>
                  <th>Basic salary</th>
                  <th>Deductions</th>
                  <th>Net salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employeePayslips.length === 0 ? (
                  <tr><td className="empty-state" colSpan="7">
                    {visibleEmployees.length
                      ? "No processed payslips are available yet."
                      : "No payslip profile is linked to this account yet."}
                  </td></tr>
                ) : employeePayslips.map((payslip, index) => (
                  <tr key={`${payslip.employee.id}-${payslip.period}`}>
                    <td>{index + 1}</td>
                    <td>{formatPeriod(payslip.period)}</td>
                    <td>{formatCurrency(payslip.salary)}</td>
                    <td>{formatCurrency(payslip.deductions)}</td>
                    <td>{formatCurrency(Math.max(payslip.salary - payslip.deductions, 0))}</td>
                    <td><span className="status processed">{payslip.status}</span></td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          title="Download payslip"
                          aria-label={`Download ${payslip.employee.name}'s ${formatPeriod(payslip.period)} payslip`}
                          onClick={() => downloadStatement(payslip.employee, payslip, payslip.period)}
                        >
                          <i className="fa-solid fa-download" aria-hidden="true"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              <span>Showing {employeePayslips.length} of {employeePayslips.length} payslips</span>
              {feedback && <span className="payroll-feedback" role="status">{feedback}</span>}
            </div>
          </section>
        ) : (
          <>

        {/* Filters */}
        <section className="filter-box">

          <div className="filter-group">
            <label htmlFor="payroll-period">Month</label>
            <input id="payroll-period" type="month" value={period} onChange={(event) => { setPeriod(event.target.value); setSelectedIds([]); }} />
          </div>

          {!isEmployee && <>
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
          </>}
        </section>

        {/* Payroll Table */}
        <section className="table-container">

          <table>

            <thead>
              <tr>
                <th>{canManagePayroll && <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="Select all visible employees" />}</th>
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
                {isEmployee
                  ? "No payslip profile is linked to this account yet."
                  : visibleEmployees.length === 0 && canManagePayroll
                    ? <>No employees yet. <Link to="/Employees">Open the employee directory</Link> to add payroll records.</>
                    : "No employees match these filters."}
              </td></tr> : filteredEmployees.map((employee, index) => {
                const record = getRecord(employee.id);
                const netSalary = Math.max(record.salary - record.deductions, 0);
                return <tr key={employee.id}>

                  <td>
                    {canManagePayroll && <input type="checkbox" checked={selectedIds.includes(String(employee.id))} onChange={() => setSelectedIds((current) => current.includes(String(employee.id)) ? current.filter((id) => id !== String(employee.id)) : [...current, String(employee.id)])} aria-label={`Select ${employee.name} for payroll`} />}
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

                  <td>{canManagePayroll ? <input className="payroll-amount" type="number" min="0" step="0.01" aria-label={`Basic salary for ${employee.name}`} value={record.salary || ""} placeholder="Set amount" onChange={(event) => updateAmount(employee.id, "salary", event.target.value)} /> : formatCurrency(record.salary)}</td>

                  <td>{canManagePayroll ? <input className="payroll-amount" type="number" min="0" max={record.salary} step="0.01" aria-label={`Deductions for ${employee.name}`} value={record.deductions || ""} placeholder="0.00" onChange={(event) => updateAmount(employee.id, "deductions", event.target.value)} /> : formatCurrency(record.deductions)}</td>

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
          </>
        )}

      </section>

      {/* Footer */}
    </PageSurface>
  );
}

export default Payroll;