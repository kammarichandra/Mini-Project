import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployeesFromStorage } from "../utils/employees";
import {
  getPayrollRecord,
  getPayrollRecordsFromStorage,
} from "../utils/payroll";
import { hasRoleAccess, normalizeRole } from "../utils/auth";
import "./Notifications.css";

const leaveStorageKey = "employeeManagementDashboardLeaveRequests";
const readNotificationsKey = "teamSyncReadNotifications";
const clearedNotificationsKey = "teamSyncClearedNotifications";
const leavePath = "/Leave_Management";
const payrollPath = "/Payroll";

function getLeaveRequests() {
  try {
    const requests = JSON.parse(
      window.localStorage.getItem(leaveStorageKey) || "[]"
    );
    return Array.isArray(requests) ? requests : [];
  } catch {
    return [];
  }
}

function getNotifications(user) {
  const role = normalizeRole(user?.role);
  const email = user?.email?.toLowerCase();
  const employees = getEmployeesFromStorage();
  const notices = [];

  if (hasRoleAccess(role, leavePath)) {
    const teamEmails = role === "Manager"
      ? employees
          .filter(
            (employee) =>
              employee.managerEmail?.toLowerCase() === email
          )
          .map((employee) => employee.email.toLowerCase())
      : null;
    const leaveRequests = getLeaveRequests();
    const visibleRequests = role === "Employee"
      ? leaveRequests.filter(
          (request) => request.employeeEmail?.toLowerCase() === email
        )
      : role === "Manager"
        ? leaveRequests.filter(
            (request) =>
              request.status === "Pending" &&
              teamEmails.includes(request.employeeEmail?.toLowerCase())
          )
        : leaveRequests.filter((request) => request.status === "Pending");

    visibleRequests.forEach((request) => {
      const isEmployee = role === "Employee";
      const status = request.status || "Pending";
      notices.push({
        id: `leave:${request.id}:${status}`,
        title: isEmployee
          ? `Leave request ${status.toLowerCase()}`
          : `${request.name || "Employee"}'s leave request`,
        message: isEmployee
          ? `${request.type || "Leave"} · ${status}`
          : `${request.type || "Leave"} needs your review.`,
        path: leavePath,
      });
    });
  }

  if (hasRoleAccess(role, payrollPath)) {
    const payrollRecords = getPayrollRecordsFromStorage();

    if (role === "Employee") {
      const employee = employees.find(
        (record) => record.email.toLowerCase() === email
      );

      if (employee) {
        Object.keys(payrollRecords).forEach((period) => {
          const payroll = getPayrollRecord(
            payrollRecords,
            period,
            employee.id
          );
          if (payroll.status === "Processed") {
            notices.push({
              id: `payroll:${period}:${employee.id}:Processed`,
              title: "Payslip available",
              message: `Your ${period} payslip is ready to view.`,
              path: payrollPath,
            });
          }
        });
      }
    } else {
      const pendingEmployees = employees.filter((employee) => {
        const payroll = getPayrollRecord(
          payrollRecords,
          getCurrentPeriod(),
          employee.id
        );
        return payroll.status === "Pending" && payroll.salary > 0;
      });

      if (pendingEmployees.length > 0) {
        notices.push({
          id: `payroll:${getCurrentPeriod()}:${pendingEmployees
            .map((employee) => employee.id)
            .join(",")}`,
          title: "Payroll awaiting processing",
          message: `${pendingEmployees.length} employee payment${pendingEmployees.length === 1 ? "" : "s"} need attention.`,
          path: payrollPath,
        });
      }
    }
  }

  return notices;
}

function getCurrentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getStoredNotificationIds(storageKey, user) {
  const email = user?.email?.toLowerCase() || "guest";
  try {
    const savedIds = JSON.parse(
      window.localStorage.getItem(`${storageKey}:${email}`) || "[]"
    );
    return new Set(Array.isArray(savedIds) ? savedIds : []);
  } catch {
    return new Set();
  }
}

function Notifications({ user }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [clearedIds, setClearedIds] = useState(() =>
    getStoredNotificationIds(clearedNotificationsKey, user)
  );
  const [notices, setNotices] = useState(() =>
    getNotifications(user).filter(
      (notice) => !clearedIds.has(notice.id)
    )
  );
  const [readIds, setReadIds] = useState(() =>
    getStoredNotificationIds(readNotificationsKey, user)
  );
  const [storageError, setStorageError] = useState("");
  const unreadCount = notices.filter((notice) => !readIds.has(notice.id)).length;

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const refreshNotifications = () => {
    const nextClearedIds = getStoredNotificationIds(clearedNotificationsKey, user);
    setClearedIds(nextClearedIds);
    setNotices(
      getNotifications(user).filter((notice) => !nextClearedIds.has(notice.id))
    );
    setReadIds(getStoredNotificationIds(readNotificationsKey, user));
    setStorageError("");
  };

  const saveNotificationIds = (storageKey, nextIds) => {
    const email = user?.email?.toLowerCase() || "guest";
    try {
      window.localStorage.setItem(
        `${storageKey}:${email}`,
        JSON.stringify([...nextIds])
      );
      setStorageError("");
      return true;
    } catch {
      setStorageError("Unable to save notification changes in this browser.");
      return false;
    }
  };

  const saveReadIds = (nextReadIds) => {
    if (saveNotificationIds(readNotificationsKey, nextReadIds)) {
      setReadIds(nextReadIds);
    }
  };

  const markAllAsRead = () => {
    saveReadIds(new Set([...readIds, ...notices.map((notice) => notice.id)]));
  };

  const clearAll = () => {
    const nextClearedIds = new Set([
      ...clearedIds,
      ...notices.map((notice) => notice.id),
    ]);
    if (saveNotificationIds(clearedNotificationsKey, nextClearedIds)) {
      setClearedIds(nextClearedIds);
      setNotices([]);
    }
  };

  const openNotice = (notice) => {
    saveReadIds(new Set([...readIds, notice.id]));
    setIsOpen(false);
    navigate(notice.path);
  };

  return (
    <div className="notification-center" ref={containerRef}>
      <button
        className="icon-button notification-trigger"
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        aria-controls="notifications-panel"
        onClick={() => {
          if (!isOpen) refreshNotifications();
          setIsOpen((open) => !open);
        }}
      >
        <i className="fa-regular fa-bell" aria-hidden="true"></i>
        {unreadCount > 0 && (
          <span className="notification-count" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          className="notification-panel"
          id="notifications-panel"
          aria-label="Notifications"
        >
          <div className="notification-panel-header">
            <h2>Notifications</h2>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={notices.length === 0}
            >
              Clear all
            </button>
          </div>
          {storageError && (
            <p className="notification-error" role="alert">{storageError}</p>
          )}
          {notices.length > 0 ? (
            <ul className="notification-list">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <button
                    className={`notification-item${readIds.has(notice.id) ? " is-read" : ""}`}
                    type="button"
                    onClick={() => openNotice(notice)}
                  >
                    <span className="notification-item-title">{notice.title}</span>
                    <span className="notification-item-message">{notice.message}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="notification-empty">You're all caught up.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default Notifications;
