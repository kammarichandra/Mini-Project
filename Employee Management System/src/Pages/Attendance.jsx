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

function getCalendarDates(date) {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const calendarStart = new Date(firstOfMonth);
  calendarStart.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(calendarStart);
    day.setDate(calendarStart.getDate() + index);
    return day;
  });
}

function isSameDate(first, second) {
  return getDateKey(first) === getDateKey(second);
}

function csvValue(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function Attendance() {
  const currentUser = getCurrentUser();
  const role = normalizeRole(currentUser?.role);
  const [employees] = useState(getEmployeesFromStorage);
  const [attendanceHistory, setAttendanceHistory] = useState(getAttendanceHistory);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = getDateKey(today);
  const todayRecords = attendanceHistory[todayKey] || {};
  const selectedDateKey = getDateKey(selectedDate);
  const selectedDateRecords = attendanceHistory[selectedDateKey] || {};
  const isSelectedDateToday = selectedDateKey === todayKey;
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
      const currentDay = current[selectedDateKey] || {};
      const previousRecord = currentDay[employeeId] || {};
      const checkIn = ["Present", "Late"].includes(status)
        ? previousRecord.checkIn || formatTime(new Date())
        : "";

      return {
        ...current,
        [selectedDateKey]: {
          ...currentDay,
          [employeeId]: {
            ...previousRecord,
            status,
            checkIn,
            checkOut: checkIn ? previousRecord.checkOut || "" : "",
          },
        },
      };
    });
  };

  const checkInEmployee = (employeeId) => {
    setAttendanceHistory((current) => {
      const currentDay = current[todayKey] || {};
      const previousRecord = currentDay[employeeId] || {};
      if (previousRecord.checkIn) return current;

      return {
        ...current,
        [todayKey]: {
          ...currentDay,
          [employeeId]: {
            ...previousRecord,
            status: "Present",
            checkIn: formatTime(new Date()),
            checkOut: "",
          },
        },
      };
    });
  };

  const checkOutEmployee = (employeeId) => {
    setAttendanceHistory((current) => {
      const currentDay = current[todayKey] || {};
      const previousRecord = currentDay[employeeId];
      if (!previousRecord?.checkIn || previousRecord.checkOut) return current;

      return {
        ...current,
        [todayKey]: {
          ...currentDay,
          [employeeId]: {
            ...previousRecord,
            checkOut: formatTime(new Date()),
          },
        },
      };
    });
  };

  const changeCalendarMonth = (monthOffset) => {
    setSelectedDate((current) => {
      const targetMonth = new Date(
        current.getFullYear(),
        current.getMonth() + monthOffset,
        1
      );
      const lastDay = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth() + 1,
        0
      ).getDate();
      targetMonth.setDate(Math.min(current.getDate(), lastDay));
      return targetMonth;
    });
  };

  const calendarDates = getCalendarDates(selectedDate);
  const calendarMonthLabel = selectedDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const selectedDateLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
      ["Employee ID", "Employee", "Department", "Date", "Check-in", "Check-out", "Status"],
      ...visibleEmployees.map((employee) => {
        const record = selectedDateRecords[employee.id];
        const status = employee.status === "On Leave"
          ? "On leave"
          : record?.status || "Not marked";
        return [employee.id, employee.name, employee.department, selectedDateKey, record?.checkIn || "", record?.checkOut || "", status];
      }),
    ];
    const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");
    const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(file);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = `attendance-${selectedDateKey}.csv`;
    downloadLink.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <PageSurface
      className="attendance-page"
      title="Attendance"
      subtitle="Review attendance by date and check in or out for your team."
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
      <section className="workspace-panel workspace-panel-wide attendance-main-panel">
        <div className="panel-heading">
          <h2><i className="fa-solid fa-users" aria-hidden="true"></i>{isSelectedDateToday ? "Today's attendance" : "Attendance details"}</h2>
          <span className="attendance-date"><i className="fa-regular fa-calendar" aria-hidden="true"></i>{selectedDateLabel}</span>
        </div>
        {/* <div className="progress-summary attendance-progress">
          <strong>{attendanceRate}<small>%</small></strong>
          <div>
            <div
              className="wide-progress"
              role="progressbar"
              aria-label="Today's attendance rate"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={attendanceRate}
            >
              <span style={{ width: `${attendanceRate}%` }}></span>
            </div>
            <small>{presentCount} of {activeEmployees.length} active employees present today</small>
          </div>
        </div> */}
        {!isSelectedDateToday && <p className="attendance-date-note">Viewing a previous or future date. Check-in and check-out are available for today.</p>}
        {visibleEmployees.length ? <div className="mini-table attendance-table">
          <div className="attendance-table-head"><b>Employee</b><b>Department</b><b>Check-in</b><b>Check-out</b><b>Status</b><b>Actions</b></div>
          {visibleEmployees.map((employee) => {
            const record = selectedDateRecords[employee.id];
            const status = employee.status === "On Leave"
              ? "On leave"
              : record?.status || "Not marked";
            const initials = employee.name
              .split(/\s+/)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return <div className="attendance-table-row" key={employee.id}>
              <span className="attendance-employee">
                <span className="attendance-avatar" aria-hidden="true">{initials}</span>
                <span>{employee.name}<small>{employee.id}</small></span>
              </span>
              <span className="attendance-department">{employee.department}</span>
              <span className="attendance-checkin">
                <i className="fa-regular fa-clock" aria-hidden="true"></i>
                {record?.checkIn || "Not checked in"}
              </span>
              <span className="attendance-checkin attendance-checkout">
                <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
                {record?.checkOut || "Not checked out"}
              </span>
              <select
                className={`attendance-status attendance-status-${status.toLowerCase().replaceAll(" ", "-")}`}
                aria-label={`Attendance status for ${employee.name}`}
                value={status}
                disabled={employee.status === "On Leave" || !isSelectedDateToday}
                onChange={(event) => updateAttendance(employee.id, event.target.value)}
              >
                {employee.status === "On Leave" && <option>On leave</option>}
                {attendanceStatuses.map((attendanceStatus) => <option key={attendanceStatus}>{attendanceStatus}</option>)}
              </select>
              <span className="attendance-actions">
                <button
                  className="attendance-action-check-in"
                  type="button"
                  disabled={!isSelectedDateToday || employee.status === "On Leave" || Boolean(record?.checkIn)}
                  onClick={() => checkInEmployee(employee.id)}
                  aria-label={`Check in ${employee.name}`}
                >
                  <i className="fa-solid fa-arrow-right-to-bracket" aria-hidden="true"></i>
                  Check in
                </button>
                <button
                  className="attendance-action-check-out"
                  type="button"
                  disabled={!isSelectedDateToday || employee.status === "On Leave" || !record?.checkIn || Boolean(record?.checkOut)}
                  onClick={() => checkOutEmployee(employee.id)}
                  aria-label={`Check out ${employee.name}`}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
                  {record?.checkOut ? "Done" : "Check out"}
                </button>
              </span>
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
      <section className="workspace-panel attendance-calendar-panel">
        <div className="panel-heading">
          <h2><i className="fa-regular fa-calendar-days" aria-hidden="true"></i>Attendance calendar</h2>
          <span>Choose a date to view</span>
        </div>
        <div className="attendance-calendar-toolbar">
          <button type="button" onClick={() => changeCalendarMonth(-1)} aria-label="Previous month">
            <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>
          <strong>{calendarMonthLabel}</strong>
          <button type="button" onClick={() => changeCalendarMonth(1)} aria-label="Next month">
            <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
        <div className="attendance-calendar-grid" role="grid" aria-label={calendarMonthLabel}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span className="attendance-calendar-weekday" key={day} role="columnheader">{day}</span>
          ))}
          {calendarDates.map((date) => {
            const dateKey = getDateKey(date);
            const dayRecords = attendanceHistory[dateKey] || {};
            const dayPresent = activeEmployees.filter((employee) =>
              ["Present", "Late"].includes(dayRecords[employee.id]?.status)
            ).length;
            const dateIsCurrentMonth = date.getMonth() === selectedDate.getMonth();
            const isFuture = date > today;
            return (
              <button
                className={[
                  "attendance-calendar-day",
                  dateIsCurrentMonth ? "" : "attendance-calendar-day-outside",
                  isSameDate(date, today) ? "attendance-calendar-day-today" : "",
                  isSameDate(date, selectedDate) ? "attendance-calendar-day-selected" : "",
                  dayPresent ? "attendance-calendar-day-recorded" : "",
                  isFuture ? "attendance-calendar-day-future" : "",
                ].filter(Boolean).join(" ")}
                type="button"
                key={dateKey}
                role="gridcell"
                aria-pressed={isSameDate(date, selectedDate)}
                aria-label={`${date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}, ${dayPresent} present or late`}
                title={`${dayPresent} present or late`}
                onClick={() => setSelectedDate(date)}
              >
                {date.getDate()}
                {dayPresent > 0 && <span aria-hidden="true"></span>}
              </button>
            );
          })}
        </div>
        <div className="attendance-calendar-legend">
          <span><i className="attendance-calendar-legend-today"></i>Today</span>
          <span><i className="attendance-calendar-legend-recorded"></i>Attendance recorded</span>
        </div>
      </section>
      <section className="workspace-panel attendance-trend-panel">
        <div className="panel-heading">
          <h2><i className="fa-solid fa-chart-column" aria-hidden="true"></i>Weekly trend</h2>
          <span>Last 7 days</span>
        </div>
        <div className="trend-bars attendance-trend-bars">
          {getWeeklyTrend().map((day) => (
            <div key={day.date} title={`${day.rate}% present`}>
              <small className="attendance-trend-rate">{day.rate}%</small>
              <span style={{ height: `${Math.max(day.rate, 3)}%` }}></span>
              <small className="attendance-trend-day">{day.label}</small>
            </div>
          ))}
        </div>
        <div className="attendance-trend-legend">
          <span><i aria-hidden="true"></i>Present or late</span>
          <span>Daily attendance rate</span>
        </div>
      </section>
    </PageSurface>
  );
}

export default Attendance;