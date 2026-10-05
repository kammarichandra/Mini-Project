import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageSurface from "../Components/PageSurface";
import { getCurrentUser, normalizeRole } from "../utils/auth";
import { getEmployeesFromStorage } from "../utils/employees";

const attendanceStorageKey = "employeeManagementDashboardAttendance";
const attendanceStatuses = ["Not marked", "Present", "Late", "Absent"];

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function csvValue(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function Attendance() {
  const currentUser = getCurrentUser();
  const role = normalizeRole(currentUser?.role);
  const [employees] = useState(getEmployeesFromStorage);
  const [attendanceHistory, setAttendanceHistory] = useState(getAttendanceHistory);
  const today = new Date();
  const todayKey = getDateKey(today);
  const todayRecords = attendanceHistory[todayKey] || {};
  const visibleEmployees = role === "Employee"
    ? employees.filter(
        (employee) =>
          employee.email.toLowerCase() === currentUser?.email?.toLowerCase()
      )
    : role === "Manager"
      ? employees.filter(
          (employee) =>
            employee.managerEmail?.toLowerCase() ===
            currentUser?.email?.toLowerCase()
        )
      : employees;
  const activeEmployees = visibleEmployees.filter((employee) => employee.status !== "On Leave");
  const onLeaveCount = visibleEmployees.length - activeEmployees.length;
  const presentCount = activeEmployees.filter((employee) =>
    ["Present", "Late"].includes(todayRecords[employee.id]?.status)
  ).length;
  const lateCount = activeEmployees.filter(
    (employee) => todayRecords[employee.id]?.status === "Late"
  ).length;
  const attendanceRate = activeEmployees.length
    ? Math.round((presentCount / activeEmployees.length) * 100)
    : 0;

  useEffect(() => {
    try {
      window.localStorage.setItem(attendanceStorageKey, JSON.stringify(attendanceHistory));
    } catch {
      return;
    }
  }, [attendanceHistory]);

  const updateAttendance = (employeeId, status) => {
    setAttendanceHistory((current) => {
      const currentDay = current[todayKey] || {};
      const previousCheckIn = currentDay[employeeId]?.checkIn;
      const checkIn = ["Present", "Late"].includes(status)
        ? previousCheckIn || formatTime(new Date())
        : "";

      return {
        ...current,
        [todayKey]: {
          ...currentDay,
          [employeeId]: { status, checkIn },
        },
      };
    });
  };

  const getWeeklyTrend = () => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const dateRecords = attendanceHistory[getDateKey(date)] || {};
    const recordedPresent = activeEmployees.filter((employee) =>
      ["Present", "Late"].includes(dateRecords[employee.id]?.status)
    ).length;

    return {
      date: getDateKey(date),
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      rate: activeEmployees.length
        ? Math.round((recordedPresent / activeEmployees.length) * 100)
        : 0,
    };
  });

  const exportReport = () => {
    const rows = [
      ["Employee ID", "Employee", "Department", "Date", "Check-in", "Status"],
      ...visibleEmployees.map((employee) => {
        const record = todayRecords[employee.id];
        const status = employee.status === "On Leave"
          ? "On leave"
          : record?.status || "Not marked";
        return [employee.id, employee.name, employee.department, todayKey, record?.checkIn || "", status];
      }),
    ];
    const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");
    const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(file);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = `attendance-${todayKey}.csv`;
    downloadLink.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const todayLabel = today.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <PageSurface
      title="Attendance"
      subtitle="Monitor daily presence and attendance trends."
      icon="fa-calendar-check"
      actionLabel="Export Report"
      onAction={exportReport}
      stats={[
        { label: "Present today", value: presentCount, note: `of ${activeEmployees.length} active employees` },
        { label: "On leave", value: onLeaveCount, note: "Employee directory", tone: "warning" },
        { label: "Late arrivals", value: lateCount, note: "Marked today" },
        { label: "Attendance rate", value: `${attendanceRate}%`, note: "Present or late" },
      ]}
    >
      <section className="workspace-panel workspace-panel-wide">
        <div className="panel-heading">
          <h2>Today&apos;s attendance</h2><span>{todayLabel}</span>
        </div>
        <div className="progress-summary">
          <strong>{attendanceRate}%</strong>
          <div>
            <div className="wide-progress"><span style={{ width: `${attendanceRate}%` }}></span></div>
            <small>{presentCount} of {activeEmployees.length} active employees present</small>
          </div>
        </div>
        {visibleEmployees.length ? <div className="mini-table attendance-table">
          <div><b>Employee</b><b>Department</b><b>Check-in</b><b>Status</b></div>
          {visibleEmployees.map((employee) => {
            const record = todayRecords[employee.id];
            const status = employee.status === "On Leave"
              ? "On leave"
              : record?.status || "Not marked";
            return <div key={employee.id}>
              <span>{employee.name}</span>
              <span>{employee.department}</span>
              <span>{record?.checkIn || "--"}</span>
              <select
                aria-label={`Attendance status for ${employee.name}`}
                value={status}
                disabled={employee.status === "On Leave"}
                onChange={(event) => updateAttendance(employee.id, event.target.value)}
              >
                {employee.status === "On Leave" && <option>On leave</option>}
                {attendanceStatuses.map((attendanceStatus) => <option key={attendanceStatus}>{attendanceStatus}</option>)}
              </select>
            </div>;
          })}
        </div> : <p className="panel-note attendance-empty">
          {role === "Employee"
            ? "No attendance profile is linked to this account yet."
            : role === "Manager"
              ? "No employees are assigned to your team yet."
              : <>No employee records yet. <Link to="/Employees">Open the employee directory</Link> to add your team.</>}
        </p>}
      </section>
      <section className="workspace-panel">
        <div className="panel-heading"><h2>Weekly trend</h2></div>
        <div className="trend-bars">{getWeeklyTrend().map((day) => <div key={day.date} title={`${day.rate}% present`}><span style={{ height: `${Math.max(day.rate, 3)}%` }}></span><small>{day.label}</small></div>)}</div>
      </section>
    </PageSurface>
  );
}

export default Attendance;