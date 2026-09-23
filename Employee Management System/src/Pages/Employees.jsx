import { useState } from "react";
import PageSurface from "../Components/PageSurface";


const employeeData = [
  {
    id: "EMP001",
    initials: "RM",
    name: "Rahul Mehta",
    department: "Engineering",
    designation: "Software Engineer",
    email: "rahul@teamsync.com",
    status: "Active",
    color: "blue",
  },
  {
    id: "EMP002",
    initials: "SI",
    name: "Sneha Iyer",
    department: "Marketing",
    designation: "Marketing Executive",
    email: "sneha@teamsync.com",
    status: "Active",
    color: "pink",
  },
  {
    id: "EMP003",
    initials: "AK",
    name: "Amit Kumar",
    department: "HR",
    designation: "HR Manager",
    email: "amit@teamsync.com",
    status: "On Leave",
    color: "green",
  },
  {
    id: "EMP004",
    initials: "NS",
    name: "Neha Singh",
    department: "Finance",
    designation: "Accountant",
    email: "neha@teamsync.com",
    status: "Active",
    color: "purple",
  },
  {
    id: "EMP005",
    initials: "VR",
    name: "Vikram Rao",
    department: "Operations",
    designation: "Operations Executive",
    email: "vikram@teamsync.com",
    status: "Active",
    color: "yellow",
  },
];

function Employees() {
  const [employees, setEmployees] = useState(employeeData);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredEmployees = employees.filter((employee) => {
    const normalizedSearch = search.trim().toLowerCase();
    const searchMatch =
      employee.name.toLowerCase().includes(normalizedSearch) ||
      employee.email.toLowerCase().includes(normalizedSearch) ||
      employee.department.toLowerCase().includes(normalizedSearch) ||
      employee.designation.toLowerCase().includes(normalizedSearch) ||
      employee.id.toLowerCase().includes(normalizedSearch);

    const departmentMatch =
      department === "All Departments" ||
      employee.department === department;

    const statusMatch =
      status === "All Status" || employee.status === status;

    return searchMatch && departmentMatch && statusMatch;
  });

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;
  const employeesOnLeave = employees.filter(
    (employee) => employee.status === "On Leave"
  ).length;

  const hasActiveFilters =
    search.trim() !== "" ||
    department !== "All Departments" ||
    status !== "All Status";

  const allVisibleSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((employee) => selectedIds.includes(employee.id));

  const toggleEmployee = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  };

  const toggleAllVisible = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter(
          (id) => !filteredEmployees.some((employee) => employee.id === id)
        );
      }

      return [
        ...new Set([...current, ...filteredEmployees.map((employee) => employee.id)]),
      ];
    });
  };

  const addEmployee = () => {
    const name = window.prompt("Employee name");
    if (!name?.trim()) return;

    const nextNumber = employees.length + 1;
    const newEmployee = {
      id: `EMP${String(nextNumber).padStart(3, "0")}`,
      initials: name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      name: name.trim(),
      department: "Engineering",
      designation: "New Employee",
      email: `${name.trim().toLowerCase().replace(/\s+/g, ".")}@teamsync.com`,
      status: "Active",
      color: "blue",
    };

    setEmployees((current) => [...current, newEmployee]);
  };

  const deleteEmployee = (id) => {
    setEmployees((current) => current.filter((employee) => employee.id !== id));
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
  };

  const clearFilters = () => {
    setSearch("");
    setDepartment("All Departments");
    setStatus("All Status");
  };

  return (
    <PageSurface
      title="Employees"
      subtitle="Manage your team, roles and employee records."
      icon="fa-users"
      actionLabel="Add Employee"
      onAction={addEmployee}
      stats={[
        { label: "Total employees", value: totalEmployees, note: "+8.2% vs last month" },
        { label: "Active employees", value: activeEmployees, note: "+2.1% this month" },
        { label: "On leave", value: employeesOnLeave, note: "6.2% of workforce", tone: "warning" },
        { label: "New joiners", value: "0", note: "This month" },
      ]}
    >

    
      {/* ================= MAIN CONTENT ================= */}
      <section className="workspace-panel workspace-panel-wide directory-panel">
        <div className="panel-heading">
          <h2>Employee directory</h2>
          <span>{filteredEmployees.length} of {employees.length} employees</span>
        </div>

        
        {/* ================= SEARCH / FILTER ================= */}
        <div className="filter-box">

          <div className="search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search by name, ID, email, department, designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>


          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Marketing</option>
            <option>HR</option>
            <option>Finance</option>
            <option>Operations</option>
          </select>


          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>On Leave</option>
          </select>


          {/* <button className="add-employee-btn" onClick={addEmployee}>
            <span>＋</span>
            Add Employee
          </button> */}

          {hasActiveFilters && (
            <button
              className="clear-filters-btn"
              type="button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}

        </div>


        {/* ================= EMPLOYEE TABLE ================= */}
        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    aria-label="Select all visible employees"
                  />
                </th>

                <th>#</th>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>


            <tbody>

              {filteredEmployees.length === 0 ? (
                <tr>
                  <td className="empty-state" colSpan="9">
                    No employees match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee, index) => (

                <tr key={employee.id}>

                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(employee.id)}
                      onChange={() => toggleEmployee(employee.id)}
                      aria-label={`Select ${employee.name}`}
                    />
                  </td>

                  <td>{index + 1}</td>

                  <td>
                    <div className="employee-name">

                      <div
                        className={`employee-avatar ${employee.color}`}
                      >
                        {employee.initials}
                      </div>

                      <strong>{employee.name}</strong>

                    </div>
                  </td>

                  <td className="employee-id">
                    {employee.id}
                  </td>

                  <td>{employee.department}</td>

                  <td>{employee.designation}</td>

                  <td className="email">
                    {employee.email}
                  </td>

                  <td>
                    <span
                      className={
                        employee.status === "Active"
                          ? "status active-status"
                          : "status leave-status"
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

                      <button title="Edit">
                        ✎
                      </button>

                      <button
                        className="delete-btn"
                        title="Delete"
                        onClick={() => deleteEmployee(employee.id)}
                      >
                        ♜
                      </button>

                    </div>
                  </td>

                </tr>

                ))
              )}

            </tbody>

          </table>


          {/* ================= TABLE FOOTER ================= */}
          <div className="table-footer">

            <span>
              Showing {filteredEmployees.length > 0 ? 1 : 0} –{" "}
              {filteredEmployees.length} of{" "}
              {employees.length} employees
            </span>

            <div className="pagination">

              <button disabled aria-label="Previous page">‹</button>
              <button className="current-page">1</button>
              <button disabled aria-label="Next page">›</button>

            </div>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
    </PageSurface>
  );
}

export default Employees;
