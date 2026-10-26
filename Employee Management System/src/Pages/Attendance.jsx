import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../Components/Common/Modal";
import PageSurface from "../Components/PageSurface";
import { getCurrentUser, normalizeRole } from "../utils/auth";
import {
  getDepartmentTagStyle,
  getEmployeesFromStorage,
} from "../utils/employees";
import { getHolidayForDate, holidays2026 } from "../utils/holidays";

const attendanceStorageKey = "employeeManagementDashboardAttendance";
const availabilityStorageKey = "employeeManagementAvailability";
const availabilityStatuses = [
  "Keep available",
  "Appear offline",
  "Do not disturb",
  "Out of office",
  "Be right back",
  "Appear away",
];
const departmentChartColors = [
  "#2785d2",
  "#26a780",
  "#e6a23c",
  "#8a6bd1",
  "#e16b78",
  "#27aabb",
  "#7993ad",
];

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

function getAvailabilityStatuses() {
  try {
    const statuses = JSON.parse(
      window.localStorage.getItem(availabilityStorageKey) || "{}"
    );
    return statuses && typeof statuses === "object" && !Array.isArray(statuses)
      ? statuses
      : {};
  } catch {
    return {};
  }
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getTimeInputValue(value = "") {
  const match = value.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return "";

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (minute > 59 || hour > (meridiem ? 12 : 23) || (meridiem && hour === 0)) {
    return "";
  }
  if (meridiem) hour = (hour % 12) + (meridiem === "PM" ? 12 : 0);

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatTimeInput(value) {
  const [hour, minute] = value.split(":").map(Number);
  const time = new Date();
  time.setHours(hour, minute, 0, 0);
  return formatTime(time);
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
  const [employeeAvailability, setEmployeeAvailability] = useState(getAvailabilityStatuses);
  const [attendanceModal, setAttendanceModal] = useState(null);
  const [openActionsEmployeeId, setOpenActionsEmployeeId] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
    status: "Not marked",
    checkIn: "",
    checkOut: "",
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);
  const todayKey = getDateKey(today);
  const todayHoliday = getHolidayForDate(today);
  const todayRecords = attendanceHistory[todayKey] || {};
  const selectedDateKey = getDateKey(selectedDate);
  const selectedDateRecords = attendanceHistory[selectedDateKey] || {};
  const isSelectedDateToday = selectedDateKey === todayKey;
  const isSelectedDateFuture = selectedDateKey > todayKey;
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

  useEffect(() => {
    try {
      window.localStorage.setItem(
        availabilityStorageKey,
        JSON.stringify(employeeAvailability)
      );
    } catch {
      return;
    }
  }, [employeeAvailability]);

  useEffect(() => {
    let timeoutId;
    const scheduleDailyRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      timeoutId = window.setTimeout(() => {
        setCurrentDate(new Date());
        scheduleDailyRefresh();
      }, nextMidnight.getTime() - now.getTime());
    };

    scheduleDailyRefresh();
    return () => window.clearTimeout(timeoutId);
  }, []);

  const updateAvailability = (employeeId, status) => {
    setEmployeeAvailability((current) => ({
      ...current,
      [employeeId]: status,
    }));
  };

  const updateAttendanceRecord = (employeeId, record) => {
    setAttendanceHistory((current) => {
      const dayRecords = { ...(current[selectedDateKey] || {}) };
      if (record) {
        dayRecords[employeeId] = record;
      } else {
        delete dayRecords[employeeId];
      }

      const nextHistory = { ...current };
      if (Object.keys(dayRecords).length) {
        nextHistory[selectedDateKey] = dayRecords;
      } else {
        delete nextHistory[selectedDateKey];
      }
      return nextHistory;
    });
  };

  const openAttendanceModal = (employee, mode) => {
    const record = selectedDateRecords[employee.id] || {};
    setAttendanceForm({
      status: record.status || "Not marked",
      checkIn: getTimeInputValue(record.checkIn),
      checkOut: getTimeInputValue(record.checkOut),
    });
    setAttendanceModal({ employee, mode });
  };

  const saveAttendance = () => {
    const { status, checkIn, checkOut } = attendanceForm;
    if (status === "Not marked" && !checkIn && !checkOut) {
      updateAttendanceRecord(attendanceModal.employee.id, null);
    } else {
      updateAttendanceRecord(attendanceModal.employee.id, {
        status: status === "Not marked" ? "" : status,
        checkIn: checkIn ? formatTimeInput(checkIn) : "",
        checkOut: checkOut ? formatTimeInput(checkOut) : "",
      });
    }
    setAttendanceModal(null);
  };

  const setAttendanceStatus = (employeeId, status) => {
    const record = selectedDateRecords[employeeId] || {};
    updateAttendanceRecord(employeeId, {
      ...record,
      status,
      ...(status === "Present"
        ? { checkIn: record.checkIn || formatTime(new Date()) }
        : {}),
      ...(status === "Absent" ? { checkIn: "", checkOut: "" } : {}),
    });
  };

  const deleteAttendance = (employee) => {
    if (
      window.confirm(
        `Delete attendance for ${employee.name} on ${selectedDateLabel}?`
      )
    ) {
      updateAttendanceRecord(employee.id, null);
    }
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
  const weeklyTrend = getWeeklyTrend();
  const departmentWeeklyAttendance = activeEmployees
    .reduce((departmentsByName, employee) => {
      const departmentName = employee.department.trim() || "Unassigned";
      if (!departmentsByName.has(departmentName)) {
        departmentsByName.set(departmentName, {
          name: departmentName,
          employeeCount: 0,
          presentCount: 0,
        });
      }

      const department = departmentsByName.get(departmentName);
      department.employeeCount += 1;
      department.presentCount += weeklyTrend.reduce((count, day) => (
        ["Present", "Late"].includes(
          attendanceHistory[day.date]?.[employee.id]?.status
        )
          ? count + 1
          : count
      ), 0);
      return departmentsByName;
    }, new Map())
    .values();
  const departmentAttendance = Array.from(departmentWeeklyAttendance)
    .sort((first, second) => first.name.localeCompare(second.name))
    .map((department, index) => ({
      ...department,
      color: departmentChartColors[index % departmentChartColors.length],
      eligibleCount: department.employeeCount * weeklyTrend.length,
      rate: department.employeeCount
        ? Math.round(
            (department.presentCount /
              (department.employeeCount * weeklyTrend.length)) *
              100
          )
        : 0,
    }));
  const totalDepartmentPresent = departmentAttendance.reduce(
    (total, department) => total + department.presentCount,
    0
  );
  const departmentChartSegments = departmentAttendance
    .filter((department) => department.presentCount > 0)
    .reduce(
      (chart, department) => {
        const nextOffset =
          chart.offset +
          (department.presentCount / totalDepartmentPresent) * 100;
        return {
          offset: nextOffset,
          segments: [
            ...chart.segments,
            `${department.color} ${chart.offset}% ${nextOffset}%`,
          ],
        };
      },
      { offset: 0, segments: [] }
    ).segments;
  const departmentChartBackground = departmentChartSegments.length
    ? `conic-gradient(${departmentChartSegments.join(", ")})`
    : "conic-gradient(#e8eef4 0% 100%)";

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
      subtitle={role === "Employee"
        ? "Review your attendance and manage your availability."
        : "Review attendance by date and update your team's records."}
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
        {todayHoliday && (
          <div className="attendance-holiday-alert" role="status">
            <i className="fa-solid fa-calendar-day" aria-hidden="true"></i>
            <span><strong>Today is a holiday:</strong> {todayHoliday.name}</span>
          </div>
        )}
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
        {!isSelectedDateToday && <p className="attendance-date-note">Viewing attendance for a different date.</p>}
        {visibleEmployees.length ? <div className="mini-table attendance-table">
          <div className="attendance-table-head"><b>Employee</b><b>Department</b><b>Check-in</b><b>Check-out</b><b>Status</b><b>Availability</b><b>Actions</b></div>
          {visibleEmployees.map((employee) => {
            const record = selectedDateRecords[employee.id];
            const availability = employeeAvailability[employee.id] || "Keep available";
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
              <span
                className="attendance-department"
                style={getDepartmentTagStyle(employee.department)}
              >
                {employee.department}
              </span>
              <span className="attendance-checkin">
                <i className="fa-regular fa-clock" aria-hidden="true"></i>
                {record?.checkIn || "Not checked in"}
              </span>
              <span className="attendance-checkin attendance-checkout">
                <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
                {record?.checkOut || "Not checked out"}
              </span>
              <span className={`attendance-record-status attendance-record-status-${(record?.status || "not-marked").toLowerCase().replaceAll(" ", "-")}`}>
                {record?.status || "Not marked"}
              </span>
              <select
                className={`attendance-status attendance-status-${availability.toLowerCase().replaceAll(" ", "-")}`}
                aria-label={`Availability for ${employee.name}`}
                value={availability}
                disabled={employee.status === "On Leave"}
                onChange={(event) => updateAvailability(employee.id, event.target.value)}
              >
                {availabilityStatuses.map((availabilityStatus) => <option key={availabilityStatus}>{availabilityStatus}</option>)}
              </select>
              <div className="attendance-actions">
                <button
                  className="attendance-action-present"
                  type="button"
                  disabled={isSelectedDateFuture || employee.status === "On Leave"}
                  onClick={() => setAttendanceStatus(employee.id, "Present")}
                  aria-label={`Mark ${employee.name} present`}
                  title="Mark present"
                >
                  <i className="fa-solid fa-plus" aria-hidden="true"></i>
                </button>
                <button
                  className="attendance-action-absent"
                  type="button"
                  disabled={isSelectedDateFuture || employee.status === "On Leave"}
                  onClick={() => setAttendanceStatus(employee.id, "Absent")}
                  aria-label={`Mark ${employee.name} absent`}
                  title="Mark absent"
                >
                  <i className="fa-solid fa-minus" aria-hidden="true"></i>
                </button>
                <button
                  className="attendance-action-view"
                  type="button"
                  onClick={() => openAttendanceModal(employee, "view")}
                  aria-label={`View attendance for ${employee.name}`}
                  title="View attendance"
                >
                  <i className="fa-solid fa-eye" aria-hidden="true"></i>
                </button>
                <div className="attendance-more-wrap">
                  <button
                    className="attendance-action-more"
                    type="button"
                    aria-label={`More attendance actions for ${employee.name}`}
                    aria-expanded={openActionsEmployeeId === employee.id}
                    title="More actions"
                    onClick={() => setOpenActionsEmployeeId((current) => (
                      current === employee.id ? null : employee.id
                    ))}
                  >
                    <i className="fa-solid fa-ellipsis" aria-hidden="true"></i>
                  </button>
                  {openActionsEmployeeId === employee.id && (
                    <div className="attendance-action-menu" role="group" aria-label={`More actions for ${employee.name}`}>
                      <button
                        type="button"
                        disabled={isSelectedDateFuture || employee.status === "On Leave"}
                        onClick={() => {
                          setOpenActionsEmployeeId(null);
                          openAttendanceModal(employee, "edit");
                        }}
                      >
                        <i className="fa-solid fa-pen" aria-hidden="true"></i>
                        Edit attendance
                      </button>
                      <button
                        type="button"
                        disabled={isSelectedDateFuture || employee.status === "On Leave"}
                        onClick={() => {
                          setOpenActionsEmployeeId(null);
                          deleteAttendance(employee);
                        }}
                      >
                        <i className="fa-solid fa-trash" aria-hidden="true"></i>
                        Delete attendance
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
        <div className="attendance-trend-content">
          <div className="attendance-weekly-chart">
            <div className="trend-bars attendance-trend-bars">
              {weeklyTrend.map((day) => (
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
          </div>

          <div className="attendance-department-chart">
            <h3>By department</h3>
            {departmentAttendance.length ? (
              <>
                <div className="attendance-department-chart-content">
                  <div
                    className="attendance-department-donut"
                    role="img"
                    aria-label={`Department attendance for the last 7 days: ${departmentAttendance
                      .map(
                        (department) =>
                          `${department.name}, ${department.presentCount} of ${department.eligibleCount} days, ${department.rate}%`
                      )
                      .join("; ")}`}
                    style={{ background: departmentChartBackground }}
                  >
                    <div>
                      <strong>{totalDepartmentPresent}</strong>
                      <span>present</span>
                    </div>
                  </div>
                  <ul className="attendance-department-legend">
                    {departmentAttendance.map((department) => (
                      <li key={department.name}>
                        <span
                          className="attendance-department-swatch"
                          style={{ backgroundColor: department.color }}
                          aria-hidden="true"
                        ></span>
                        <span className="attendance-department-name" title={department.name}>
                          {department.name}
                        </span>
                        <strong>{department.rate}%</strong>
                        <small>
                          {department.presentCount}/{department.eligibleCount}
                        </small>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="attendance-department-chart-note">
                  Present or late marks / employee-days
                </p>
              </>
            ) : (
              <p className="attendance-department-empty">
                No active employees to show.
              </p>
            )}
          </div>
        </div>
      </section>
      <section className="workspace-panel workspace-panel-wide attendance-holidays-panel">
        <div className="panel-heading">
          <h2><i className="fa-solid fa-umbrella-beach" aria-hidden="true"></i>Holiday list</h2>
          <span>Mandatory holidays · 2026</span>
        </div>
        <ul className="attendance-holiday-list">
          {holidays2026.map((holiday) => {
            const holidayDate = new Date(`${holiday.date}T00:00:00`);
            const isToday = holiday.date === todayKey;
            return (
              <li className={isToday ? "attendance-holiday-today" : ""} key={holiday.date}>
                <time dateTime={holiday.date}>
                  {holidayDate.toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })}
                </time>
                <span>{holiday.name}</span>
                <small>{isToday ? "Today" : "Mandatory"}</small>
              </li>
            );
          })}
        </ul>
      </section>
      <Modal
        show={Boolean(attendanceModal)}
        title={attendanceModal?.mode === "edit" ? "Edit attendance" : "Attendance details"}
        onClose={() => setAttendanceModal(null)}
        onSave={saveAttendance}
        saveLabel="Save attendance"
        showSave={attendanceModal?.mode === "edit"}
      >
        {attendanceModal && (
          <div className="attendance-record-details">
            <p><strong>Employee:</strong> {attendanceModal.employee.name}</p>
            <p><strong>Date:</strong> {selectedDateLabel}</p>
            {attendanceModal.mode === "edit" ? (
              <>
                <label className="form-label" htmlFor="attendance-record-status">Status</label>
                <select
                  className="form-select mb-3"
                  id="attendance-record-status"
                  value={attendanceForm.status}
                  onChange={(event) => setAttendanceForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))}
                >
                  {["Not marked", "Present", "Late", "Absent"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
                <label className="form-label" htmlFor="attendance-record-check-in">Check-in</label>
                <input
                  className="form-control mb-3"
                  id="attendance-record-check-in"
                  type="time"
                  value={attendanceForm.checkIn}
                  onChange={(event) => setAttendanceForm((current) => ({
                    ...current,
                    checkIn: event.target.value,
                  }))}
                />
                <label className="form-label" htmlFor="attendance-record-check-out">Check-out</label>
                <input
                  className="form-control"
                  id="attendance-record-check-out"
                  type="time"
                  value={attendanceForm.checkOut}
                  onChange={(event) => setAttendanceForm((current) => ({
                    ...current,
                    checkOut: event.target.value,
                  }))}
                />
              </>
            ) : (
              <>
                <p><strong>Status:</strong> {selectedDateRecords[attendanceModal.employee.id]?.status || "Not marked"}</p>
                <p><strong>Check-in:</strong> {selectedDateRecords[attendanceModal.employee.id]?.checkIn || "Not checked in"}</p>
                <p><strong>Check-out:</strong> {selectedDateRecords[attendanceModal.employee.id]?.checkOut || "Not checked out"}</p>
              </>
            )}
          </div>
        )}
      </Modal>
    </PageSurface>
  );
}

export default Attendance;