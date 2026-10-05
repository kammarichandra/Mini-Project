import { useEffect, useState } from "react";
import Modal from "../Components/Common/Modal";
import PageSurface from "../Components/PageSurface";
import { getDummyEmployees } from "../Apis/dummyEmployees";
import { getCurrentUser, normalizeRole } from "../utils/auth";
import {
  createEmployeeId,
  getEmployeeInitials,
  getEmployeesFromStorage,
  saveEmployeesToStorage,
} from "../utils/employees";

const departments = [
  "Development",
  "Testing",
  "HR",
  "Management",
  "Design",
  "Engineering",
  "Marketing",
  "Finance",
  "Operations",
];

const emptyEmployeeForm = {
  name: "",
  department: "Development",
  designation: "",
  email: "",
  managerEmail: "",
  status: "Active",
};

function Employees() {
  const currentUser = getCurrentUser();
  const role = normalizeRole(currentUser?.role);
  const canManageEmployees = ["Super Admin", "HR Admin"].includes(role);
  const isEmployee = role === "Employee";
  const isManager = role === "Manager";
  const [employees, setEmployees] = useState(getEmployeesFromStorage);
  const [loading, setLoading] = useState(
    () => getEmployeesFromStorage().length === 0
  );
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalMode, setModalMode] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState(emptyEmployeeForm);

  useEffect(() => {
    saveEmployeesToStorage(employees);
  }, [employees]);

  useEffect(() => {
    if (getEmployeesFromStorage().length > 0) return undefined;

    let cancelled = false;
    getDummyEmployees()
      .then((sampleEmployees) => {
        if (!cancelled) {
          setEmployees((current) =>
            current.length === 0 ? sampleEmployees : current
          );
        }
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleEmployees = isEmployee
    ? employees.filter(
        (employee) =>
          employee.email.toLowerCase() === currentUser?.email?.toLowerCase()
      )
    : isManager
      ? employees.filter(
          (employee) =>
            employee.managerEmail?.toLowerCase() ===
            currentUser?.email?.toLowerCase()
        )
      : employees;
  const profileEmployees =
    isEmployee && visibleEmployees.length === 0
      ? [{
          id: "PROFILE",
          name: currentUser?.fullName || "Employee",
          email: currentUser?.email || "",
          department: "Not assigned",
          designation: "Employee",
          status: "Active",
          initials: getEmployeeInitials(currentUser?.fullName || "Employee"),
          color: "blue",
        }]
      : visibleEmployees;

  const filteredEmployees = profileEmployees.filter((employee) => {
    const normalizedSearch = search.trim().toLowerCase();
    const searchMatch =
      employee.name.toLowerCase().includes(normalizedSearch) ||
      employee.email.toLowerCase().includes(normalizedSearch) ||
      employee.department.toLowerCase().includes(normalizedSearch) ||
      employee.designation.toLowerCase().includes(normalizedSearch) ||
      String(employee.id).toLowerCase().includes(normalizedSearch);

    const departmentMatch =
      department === "All Departments" ||
      employee.department === department;

    const statusMatch =
      status === "All Status" || employee.status === status;

    return searchMatch && departmentMatch && statusMatch;
  });

  const totalEmployees = profileEmployees.length;
  const activeEmployees = profileEmployees.filter(
    (employee) => employee.status === "Active"
  ).length;
  const employeesOnLeave = profileEmployees.filter(
    (employee) => employee.status === "On Leave"
  ).length;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const newJoiners = profileEmployees.filter((employee) => {
    const addedAt = new Date(employee.addedAt);
    return !Number.isNaN(addedAt.getTime()) && addedAt >= monthStart;
  }).length;

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

  const openAddEmployee = () => {
    setSelectedEmployee(null);
    setEmployeeForm(emptyEmployeeForm);
    setModalMode("add");
  };

  const openEmployeeModal = (employee, mode) => {
    setSelectedEmployee(employee);
    setEmployeeForm({
      name: employee.name,
      department: employee.department,
      designation: employee.designation,
      email: employee.email,
      managerEmail: employee.managerEmail || "",
      status: employee.status,
    });
    setModalMode(mode);
  };

  const closeEmployeeModal = () => setModalMode(null);

  const saveEmployee = () => {
    const name = employeeForm.name.trim();
    if (!name) {
      window.alert("Please enter an employee name.");
      return;
    }

    const employeeDetails = {
      ...employeeForm,
      name,
      initials: getEmployeeInitials(name),
      designation: employeeForm.designation.trim() || "Employee",
      email: employeeForm.email.trim(),
      managerEmail: employeeForm.managerEmail.trim().toLowerCase(),
      color: selectedEmployee?.color || "blue",
      addedAt: selectedEmployee?.addedAt || new Date().toISOString(),
    };

    if (selectedEmployee) {
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === selectedEmployee.id
            ? { ...employee, ...employeeDetails }
            : employee
        )
      );
    } else {
      setEmployees((current) => [
        ...current,
        { ...employeeDetails, id: createEmployeeId(current) },
      ]);
    }

    closeEmployeeModal();
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
      subtitle={isEmployee
        ? "View your employee profile."
        : isManager
          ? "View employee profiles assigned to your team."
          : "Manage your team, roles and employee records."}
      icon="fa-users"
      actionLabel={canManageEmployees ? "Add Employee" : undefined}
      onAction={canManageEmployees ? openAddEmployee : undefined}
      stats={[
        { label: "Total employees", value: totalEmployees, note: "Saved records" },
        { label: "Active employees", value: activeEmployees, note: "Current status" },
        { label: "On leave", value: employeesOnLeave, note: "Current status", tone: "warning" },
        { label: "New joiners", value: newJoiners, note: "Added this month" },
      ]}
    >

    
      {/* ================= MAIN CONTENT ================= */}
      <section className="workspace-panel workspace-panel-wide directory-panel">
        <div className="panel-heading">
          <h2>{isEmployee ? "My profile" : isManager ? "Team employees" : "Employee directory"}</h2>
          <span>{filteredEmployees.length} of {profileEmployees.length} employees</span>
        </div>

        
        {/* ================= SEARCH / FILTER ================= */}
        {!isEmployee && <div className="filter-box">

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
            {departments.map((departmentOption) => (
              <option key={departmentOption}>{departmentOption}</option>
            ))}
          </select>


          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>On Leave</option>
          </select>


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


        /* ================= EMPLOYEE TABLE ================= */}
        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>
                  {canManageEmployees && (
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      aria-label="Select all visible employees"
                    />
                  )}
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
                    {loading
                      ? "Loading sample employees..."
                      : loadError
                        ? loadError
                      : profileEmployees.length === 0
                        ? isManager
                          ? "No employees are assigned to your team yet."
                          : "No employees have been added yet."
                        : "No employees match the selected filters."}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee, index) => (

                <tr key={employee.id}>

                  <td>
                    {canManageEmployees && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(employee.id)}
                        onChange={() => toggleEmployee(employee.id)}
                        aria-label={`Select ${employee.name}`}
                      />
                    )}
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

                      <button
                        type="button"
                        title="View"
                        aria-label={`View ${employee.name}`}
                        onClick={() => openEmployeeModal(employee, "view")}
                      >
                        ◉
                      </button>

                      {canManageEmployees && (
                        <>
                          <button
                            type="button"
                            title="Edit"
                            aria-label={`Edit ${employee.name}`}
                            onClick={() => openEmployeeModal(employee, "edit")}
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            title="Delete"
                            aria-label={`Delete ${employee.name}`}
                            onClick={() => deleteEmployee(employee.id)}
                          >
                            ♜
                          </button>
                        </>
                      )}

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
              {profileEmployees.length} employees
            </span>

            <div className="pagination">

              <button disabled aria-label="Previous page">‹</button>
              <button className="current-page">1</button>
              <button disabled aria-label="Next page">›</button>

            </div>

          </div>

        </div>

      </section>

      <Modal
        show={modalMode !== null}
        title={
          modalMode === "view"
            ? "Employee Details"
            : modalMode === "edit"
              ? "Edit Employee"
              : "Add Employee"
        }
        onClose={closeEmployeeModal}
        onSave={saveEmployee}
        saveLabel={modalMode === "edit" ? "Save Changes" : "Add Employee"}
        showSave={modalMode !== "view"}
      >
        <div className="mb-3">
          <label className="form-label" htmlFor="employee-name">Name</label>
          <input
            id="employee-name"
            type="text"
            className="form-control"
            placeholder="Enter employee name"
            value={employeeForm.name}
            disabled={modalMode === "view"}
            onChange={(event) =>
              setEmployeeForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="employee-department">Department</label>
          <select
            id="employee-department"
            className="form-select"
            value={employeeForm.department}
            disabled={modalMode === "view"}
            onChange={(event) =>
              setEmployeeForm((current) => ({
                ...current,
                department: event.target.value,
              }))
            }
          >
            {departments.map((departmentOption) => (
              <option key={departmentOption} value={departmentOption}>
                {departmentOption}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="employee-designation">Designation</label>
          <input
            id="employee-designation"
            type="text"
            className="form-control"
            placeholder="Enter designation"
            value={employeeForm.designation}
            disabled={modalMode === "view"}
            onChange={(event) =>
              setEmployeeForm((current) => ({
                ...current,
                designation: event.target.value,
              }))
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="employee-email">Email</label>
          <input
            id="employee-email"
            type="email"
            className="form-control"
            placeholder="Enter email address"
            value={employeeForm.email}
            disabled={modalMode === "view"}
            onChange={(event) =>
              setEmployeeForm((current) => ({ ...current, email: event.target.value }))
            }
          />
        </div>

        {canManageEmployees && <div className="mb-3">
          <label className="form-label" htmlFor="employee-manager-email">Manager Email</label>
          <input
            id="employee-manager-email"
            type="email"
            className="form-control"
            placeholder="Assign a manager by email"
            value={employeeForm.managerEmail}
            disabled={modalMode === "view"}
            onChange={(event) =>
              setEmployeeForm((current) => ({ ...current, managerEmail: event.target.value }))
            }
          />
        </div>}

        <div className="mb-3">
          <label className="form-label" htmlFor="employee-status">Status</label>
          <select
            id="employee-status"
            className="form-select"
            value={employeeForm.status}
            disabled={modalMode === "view"}
            onChange={(event) =>
              setEmployeeForm((current) => ({ ...current, status: event.target.value }))
            }
          >
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </Modal>
    </PageSurface>
  );
}

export default Employees;
