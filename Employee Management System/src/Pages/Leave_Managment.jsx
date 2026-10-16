import { useEffect, useState } from "react";
import PageSurface from "../Components/PageSurface";
import { getCurrentUser, normalizeRole } from "../utils/auth";
import { getEmployeesFromStorage } from "../utils/employees";
import {
  getLeaveRequests,
  saveLeaveRequestsToStorage,
} from "../utils/leave";

const emptyRequest = {
  name: "",
  type: "Annual leave",
  startDate: "",
  endDate: "",
};

const annualLeaveAllowance = 20;

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function getWeekdaysInCurrentYear(startDate, endDate, year) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }

  let weekdays = 0;
  const day = new Date(start);
  while (day <= end) {
    if (day.getFullYear() === year && day.getDay() !== 0 && day.getDay() !== 6) {
      weekdays += 1;
    }
    day.setDate(day.getDate() + 1);
  }
  return weekdays;
}

function formatDateRange(startDate, endDate) {
  const start = formatDate(startDate);
  return startDate === endDate ? start : `${start} - ${formatDate(endDate)}`;
}

function Leave_Managment() {
  const currentUser = getCurrentUser();
  const role = normalizeRole(currentUser?.role);
  const isEmployee = role === "Employee";
  const canReview = ["Super Admin", "HR Admin", "Manager"].includes(role);
  const [requests, setRequests] = useState(getLeaveRequests);
  const [showForm, setShowForm] = useState(false);
  const [requestForm, setRequestForm] = useState(() => ({ ...emptyRequest,name: isEmployee ? currentUser?.fullName || "" : "", }));
  
  const [formError, setFormError] = useState("");
  const teamEmails = getEmployeesFromStorage()
    .filter(
      (employee) =>
        employee.managerEmail?.toLowerCase() ===
        currentUser?.email?.toLowerCase()
    )
    .map((employee) => employee.email.toLowerCase());
  const visibleRequests = isEmployee
    ? requests.filter(
        (request) =>
          request.employeeEmail?.toLowerCase() ===
          currentUser?.email?.toLowerCase()
      )
    : role === "Manager"
      ? requests.filter((request) =>
          teamEmails.includes(request.employeeEmail?.toLowerCase())
        )
      : requests;

  useEffect(() => {
    saveLeaveRequestsToStorage(requests);
  }, [requests]);

  const pendingCount = visibleRequests.filter((request) => request.status === "Pending").length;
  const approvedCount = visibleRequests.filter((request) => request.status === "Approved").length;
  const rejectedCount = visibleRequests.filter((request) => request.status === "Rejected").length;
  const reviewedCount = approvedCount + rejectedCount;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();
  const peopleOnLeave = visibleRequests.filter((request) => {
    const startDate = new Date(`${request.startDate}T00:00:00`);
    const endDate = new Date(`${request.endDate}T00:00:00`);
    return request.status === "Approved" && startDate <= today && endDate >= today;
  }).length;
  const currentUserEmail = currentUser?.email?.toLowerCase();
  const currentUserName = currentUser?.fullName?.trim().toLowerCase();
  const personalAnnualRequests = requests.filter((request) => {
    const belongsToCurrentUser =
      (currentUserEmail &&
        request.employeeEmail?.toLowerCase() === currentUserEmail) ||
      (!request.employeeEmail &&
        currentUserName &&
        request.name?.trim().toLowerCase() === currentUserName);
    return belongsToCurrentUser && request.type === "Annual leave";
  });
  const annualLeaveUsed = personalAnnualRequests
    .filter((request) => request.status === "Approved")
    .reduce(
      (total, request) =>
        total +
        getWeekdaysInCurrentYear(request.startDate, request.endDate, currentYear),
      0
    );
  const annualLeavePending = personalAnnualRequests
    .filter((request) => request.status === "Pending")
    .reduce(
      (total, request) =>
        total +
        getWeekdaysInCurrentYear(request.startDate, request.endDate, currentYear),
      0
    );
  const annualLeaveRemaining = Math.max(annualLeaveAllowance - annualLeaveUsed, 0);
  const annualLeaveUsedPercent = Math.min(
    (annualLeaveUsed / annualLeaveAllowance) * 100,
    100
  );
  const upcomingLeave = visibleRequests
    .filter((request) => {
      const startDate = new Date(`${request.startDate}T00:00:00`);
      return request.status === "Approved" && startDate >= today;
    })
    .sort((first, second) => first.startDate.localeCompare(second.startDate))
    .slice(0, 3);

  const toggleRequestForm = () => {
    setShowForm((current) => !current);
    setRequestForm({
      ...emptyRequest,
      name: isEmployee ? currentUser?.fullName || "" : "",
    });
    setFormError("");
  };

  const submitRequest = (event) => {
    event.preventDefault();
    const name = requestForm.name.trim();
    if (!name || !requestForm.startDate || !requestForm.endDate) {
      setFormError("Complete all fields before submitting.");
      return;
    }
    if (requestForm.endDate < requestForm.startDate) {
      setFormError("The end date must be on or after the start date.");
      return;
    }

    const linkedEmployee = getEmployeesFromStorage().find(
      (employee) => employee.name.toLowerCase() === name.toLowerCase()
    );
    setRequests((current) => [
      {
        ...requestForm,
        name,
        employeeEmail: isEmployee
          ? currentUser?.email
          : linkedEmployee?.email || "",
        id: `leave-${Date.now()}`,
        status: "Pending",
      },
      ...current,
    ]);
    setRequestForm({
      ...emptyRequest,
      name: isEmployee ? currentUser?.fullName || "" : "",
    });
    setFormError("");
    setShowForm(false);
  };

  const updateRequestStatus = (id, status) => {
    setRequests((current) =>
      current.map((request) => request.id === id ? { ...request, status } : request)
    );
  };

  return (
    <PageSurface title="Leave Management" subtitle="Review requests, balances, and upcoming time away." icon="fa-plane-departure" actionLabel={showForm ? "Cancel Request" : "New Request"} onAction={toggleRequestForm} stats={[
      { label: "Pending requests", value: pendingCount, note: "Needs review", tone: "warning" },
      { label: "Approved requests", value: approvedCount, note: `${rejectedCount} rejected` },
      { label: "People on leave", value: peopleOnLeave, note: "Today" },
      { label: "Approval rate", value: reviewedCount ? `${Math.round((approvedCount / reviewedCount) * 100)}%` : "--", note: "Reviewed requests" },
    ]}>
      <section className="workspace-panel workspace-panel-wide leave-requests-panel">
        <div className="panel-heading">
          <h2>{isEmployee ? "My leave requests" : "Leave requests"}</h2>
          <span>{pendingCount} pending</span>
        </div>

        {showForm && <form className="leave-request-form" onSubmit={submitRequest}>
          <label><span>Employee</span><input value={requestForm.name} disabled={isEmployee} onChange={(event) => setRequestForm((current) => ({ ...current, name: event.target.value }))} required /></label>
          <label><span>Leave type</span><select value={requestForm.type} onChange={(event) => setRequestForm((current) => ({ ...current, type: event.target.value }))}><option>Annual leave</option><option>Personal leave</option><option>Sick leave</option><option>Parental leave</option></select></label>
          <label><span>From</span><input type="date" value={requestForm.startDate} onChange={(event) => setRequestForm((current) => ({ ...current, startDate: event.target.value }))} required /></label>
          <label><span>To</span><input type="date" min={requestForm.startDate || undefined} value={requestForm.endDate} onChange={(event) => setRequestForm((current) => ({ ...current, endDate: event.target.value }))} required /></label>
          <button className="panel-button leave-submit" type="submit">Submit request</button>
          {formError && <p className="leave-form-error" role="alert">{formError}</p>}
        </form>}

        <div className="request-list">
          {visibleRequests.map((request) => <div className="request-row" key={request.id}>
            <div className="large-avatar small-avatar">
              {request.name.split(" ").map((part) => part[0]).join("")}
            </div>
            <div>
              <strong>{request.name}</strong>
              <p>{request.type} · {formatDateRange(request.startDate, request.endDate)}</p>
            </div>
            <em className={request.status === "Pending" ? "warning" : request.status === "Approved" ? "positive" : "negative"}>{request.status}</em>
            {canReview && request.status === "Pending" && <div className="leave-actions">
              <button type="button" onClick={() => updateRequestStatus(request.id, "Approved")} aria-label={`Approve ${request.name}'s request`}>Approve</button>
              <button type="button" onClick={() => updateRequestStatus(request.id, "Rejected")} aria-label={`Reject ${request.name}'s request`}>Reject</button>
            </div>}
          </div>)}
          {visibleRequests.length === 0 && <p className="panel-note">No leave requests yet.</p>}
        </div></section>
      <section className="workspace-panel leave-balance-panel">
        <div className="panel-heading">
          <h2>Annual leave balance</h2>
          <span>{currentYear}</span>
        </div>
        <div
          className="balance-ring leave-balance-ring"
          style={{ "--leave-used-percent": `${annualLeaveUsedPercent}%` }}
          role="img"
          aria-label={`${annualLeaveRemaining} of ${annualLeaveAllowance} annual leave days remaining`}
        >
          <strong>{annualLeaveRemaining}</strong>
          <span>days left</span>
        </div>
        <p className="leave-balance-caption">
          Based on a {annualLeaveAllowance}-day annual allowance. Weekends are excluded.
        </p>
        <div className="leave-balance-breakdown">
          <div><span>Allowance</span><strong>{annualLeaveAllowance} days</strong></div>
          <div><span>Approved and used</span><strong>{annualLeaveUsed} days</strong></div>
          <div><span>Pending request</span><strong>{annualLeavePending} days</strong></div>
        </div>
        {annualLeaveUsed > annualLeaveAllowance && (
          <p className="leave-balance-warning" role="status">
            Approved annual leave is {annualLeaveUsed - annualLeaveAllowance} days over the allowance.
          </p>
        )}
      </section>

      <section className="workspace-panel upcoming-leave-panel">
        <div className="panel-heading">
          <h2>Upcoming time off</h2>
          <span>Approved</span>
        </div>
        {upcomingLeave.length ? (
          <div className="request-list">
            {upcomingLeave.map((request) => (
              <div className="request-row" key={request.id}>
                <div className="upcoming-leave-date" aria-hidden="true">
                  <i className="fa-regular fa-calendar"></i>
                </div>
                <div>
                  <strong>{isEmployee ? request.type : request.name}</strong>
                  <p>
                    {isEmployee ? formatDateRange(request.startDate, request.endDate) : `${request.type} · ${formatDateRange(request.startDate, request.endDate)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="panel-note">No upcoming approved leave is scheduled.</p>
        )}
      </section>
    </PageSurface>
  )
}

export default Leave_Managment