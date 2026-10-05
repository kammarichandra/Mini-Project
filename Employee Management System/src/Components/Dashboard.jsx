
import { useEffect, useState } from "react";
import Modal from "../Components/Common/Modal";
import PageSurface from "./PageSurface";
import {
  createEmployeeId,
  getEmployeeInitials,
  getEmployeesFromStorage,
  saveEmployeesToStorage,
} from "../utils/employees";
import { getCurrentUser } from "../utils/auth";

function Dashboard() {
  const currentUser = getCurrentUser();
  const [employees, setEmployees] = useState(getEmployeesFromStorage);

  const [showModal, setShowModal] = useState(false);

  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("Development");

  useEffect(() => {
    saveEmployeesToStorage(employees);
  }, [employees]);

  const handleSave = () => {
    const name = employeeName.trim();
    if (!name) {
      alert("Please enter employee name");
      return;
    }

    setEmployees((prevEmployees) => {
      return [
        ...prevEmployees,
        {
          id: createEmployeeId(prevEmployees),
          name,
          initials: getEmployeeInitials(name),
          department,
          designation: "Employee",
          email: "",
          status: "Active",
          color: "blue",
          addedAt: new Date().toISOString(),
        },
      ];
    });

    setEmployeeName("");
    setDepartment("Development");
    setShowModal(false);
  };

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;
  const employeesOnLeave = employees.filter(
    (employee) => employee.status === "On Leave"
  ).length;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const newHiresThisMonth = employees.filter((employee) => {
    const addedAt = new Date(employee.addedAt);
    return !Number.isNaN(addedAt.getTime()) && addedAt >= monthStart;
  }).length;
  const recentEmployees = employees.slice(-4).reverse();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const currentYear = new Date().getFullYear();
  const monthlyEmployeeCounts = months.map((_, monthIndex) =>
    employees.filter((employee) => {
      const addedAt = new Date(employee.addedAt);
      return (
        !Number.isNaN(addedAt.getTime()) &&
        addedAt.getFullYear() === currentYear &&
        addedAt.getMonth() === monthIndex
      );
    }).length
  );
  const maxMonthlyEmployees = Math.max(...monthlyEmployeeCounts, 1);

  return (
    <PageSurface
      title="Dashboard"
      subtitle={`Welcome back, ${currentUser?.fullName || "User"}. Here is your team at a glance.`}
      icon="fa-gauge-high"
      actionLabel={["Admin", "Super Admin", "HR", "HR Admin"].includes(currentUser?.role) ? "Add Employee" : undefined}
      onAction={["Admin", "Super Admin", "HR", "HR Admin"].includes(currentUser?.role) ? () => setShowModal(true) : undefined}
      stats={[
        { label: "Total employees", value: employees.length, note: "Saved records" },
        { label: "Active employees", value: activeEmployees, note: "Current status" },
        { label: "On leave", value: employeesOnLeave, note: "Current status", tone: "warning" },
        { label: "New hires", value: newHiresThisMonth, note: "Added this month" },
      ]}
    >
      <div className="dashboard-sections-grid">
        <div className="card activity-card">
          <div className="card-header">
            <h3>Recent Activities</h3>
          </div>
          <div className="activity-list">
            {recentEmployees.length > 0 ? (
              recentEmployees.map((employee) => (
                <div key={employee.id} className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p className="activity-text">
                      {employee.name} was added as a new employee
                    </p>
                    <span className="activity-time">
                      {employee.addedAt
                        ? new Date(employee.addedAt).toLocaleDateString()
                        : "Added"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="activity-text">No employees added yet.</p>
            )}
          </div>
        </div>

        <div className="card attendance-card">
          <div className="card-header">
            <h3>Employee Attendance</h3>
          </div>
          <div className="attendance-content">
            <span>No attendance data available.</span>
          </div>
        </div>
      </div>

      <div className="card monthly-card">
        <div className="card-header">
          <div>
            <h3>Monthly Overview</h3>
          </div>
        </div>
        <div className="monthly-chart" aria-label="Monthly employee overview">
          {months.map((month, index) => {
            const count = monthlyEmployeeCounts[index];
            const height = count ? Math.max(10, (count / maxMonthlyEmployees) * 100) : 0;
            return (
              <div className="chart-column" key={month}>
                <div
                  className={`chart-bar chart-color-${index % 3}`}
                  style={{
                    height: `${height}%`,
                    visibility: count ? "visible" : "hidden",
                  }}
                  title={`${count} employees added`}
                ></div>
                <span>{month}</span>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        show={showModal}
        title="Add Employee"
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      >

        <div className="mb-3">

          <label className="form-label">
            Employee Name
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter employee name"
            value={employeeName}
            onChange={(e) =>
              setEmployeeName(e.target.value)
            }
          />

        </div>


        <div className="mb-3">

          <label className="form-label">
            Department
          </label>

          <select
            className="form-select"
            value={department}
            onChange={(e) =>
              setDepartment(e.target.value)
            }
          >

            <option value="Development">
              Development
            </option>

            <option value="Testing">
              Testing
            </option>

            <option value="HR">
              HR
            </option>

            <option value="Management">
              Management
            </option>

            <option value="Design">
              Design
            </option>

          </select>

        </div>

      </Modal>

    </PageSurface>
  );
}

export default Dashboard;
