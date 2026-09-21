import { useState } from "react";
import "../Payroll.css";
import StatCard from "../Components/StatCard";

function Payroll() {
  const [search, setSearch] = useState("");

  const employees = [
    {
      id: "EMP001",
      name: "Rahul Mehta",
      initials: "RM",
      department: "Engineering",
      salary: 50000,
      deductions: 5200,
      netSalary: 44800,
      status: "Processed",
    },
    {
      id: "EMP002",
      name: "Sneha Iyer",
      initials: "SI",
      department: "Marketing",
      salary: 45000,
      deductions: 4500,
      netSalary: 40500,
      status: "Processed",
    },
    {
      id: "EMP003",
      name: "Amit Kumar",
      initials: "AK",
      department: "HR",
      salary: 60000,
      deductions: 6800,
      netSalary: 53200,
      status: "Pending",
    },
  ];

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="payroll-page">

      {/* Main Content */}
      <main className="payroll-content">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Payroll</h1>
            <p>
              Manage employee salaries, generate payslips and view payment
              history.
            </p>
          </div>

          <div className="breadcrumb">
            {/* <span>Home</span>
            <span className="arrow">›</span>
            <strong>Payroll</strong> */}
          </div>
        </div>

        {/* Statistics */}
        <section className="stats-grid">
          <StatCard
            title="Total Employees"
            value="3"
            icon="👥"
            change="+8.2%"
            changeType="positive"
            color="#2563eb"
          />
          <StatCard
            title="Payroll Processed"
            value="2"
            icon="✓"
            change="+2.1%"
            changeType="positive"
            color="#16a34a"
          />
          <StatCard
            title="Pending Payments"
            value="1"
            icon="◷"
            change="-3.4%"
            changeType="negative"
            color="#f59e0b"
          />
          <StatCard
            title="Total Payroll Amount"
            value="₹ 1,50,000"
            icon="₹"
            change="+12%"
            changeType="positive"
            color="#8b5cf6"
          />

        </section>

        {/* Filters */}
        <section className="filter-box">

          <div className="filter-group">
            <label>Month</label>
            <select>
              <option>September 2025</option>
              <option>August 2025</option>
              <option>July 2025</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Department</label>
            <select>
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>HR</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select>
              <option>All Status</option>
              <option>Processed</option>
              <option>Pending</option>
            </select>
          </div>

          <button className="process-btn">
            ＋ Process Payroll
          </button>

          <div className="filter-actions">

            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search employee"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="search-btn">
              ⌕ &nbsp; Search
            </button>

            <button
              className="reset-btn"
              onClick={() => setSearch("")}
            >
              Reset
            </button>

          </div>
        </section>

        {/* Payroll Table */}
        <section className="table-container">

          <table>

            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
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
              {filteredEmployees.map((employee, index) => (
                <tr key={employee.id}>

                  <td>
                    <input type="checkbox" />
                  </td>

                  <td>{index + 1}</td>

                  <td>
                    <div className="employee-info">

                      <div className={`avatar avatar-${index}`}>
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

                  <td>
                    ₹ {employee.salary.toLocaleString("en-IN")}
                  </td>

                  <td>
                    ₹ {employee.deductions.toLocaleString("en-IN")}
                  </td>

                  <td>
                    ₹ {employee.netSalary.toLocaleString("en-IN")}
                  </td>

                  <td>
                    <span
                      className={
                        employee.status === "Processed"
                          ? "status processed"
                          : "status pending"
                      }
                    >
                      {employee.status}
                    </span>
                  </td>

                  <td>
                    <div className="actions">

                      <button title="View">
                        ◉
                      </button>

                      <button title="Download">
                        ⇩
                      </button>

                      <button title="More">
                        ⋮
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

          {/* Table Footer */}
          <div className="table-footer">

            <span>
              Showing 1 – {filteredEmployees.length} of{" "}
              {filteredEmployees.length} employees
            </span>

            <div className="pagination">
              <button>‹</button>
              <button className="active">1</button>
              <button>›</button>
            </div>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="payroll-footer">
        <span>© 2025 TeamSync. All rights reserved.</span>

        <div>
          <a href="/">Privacy</a>
          <a href="/">Terms</a>
          <a href="/">Help</a>
        </div>
      </footer>

    </div>
  );
}

export default Payroll;