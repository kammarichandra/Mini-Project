export const leaveStorageKey = "employeeManagementDashboardLeaveRequests";

const initialRequests = [
  { id: "leave-1", name: "Priya Shah", type: "Annual leave", startDate: "2026-10-12", endDate: "2026-10-14", status: "Pending" },
  { id: "leave-2", name: "Arun Kumar", type: "Personal leave", startDate: "2026-10-05", endDate: "2026-10-05", status: "Approved" },
  { id: "leave-3", name: "Meera Joshi", type: "Sick leave", startDate: "2026-10-19", endDate: "2026-10-20", status: "Pending" },
];

export function getLeaveRequests() {
  
  try {
    const savedRequests = JSON.parse(
      window.localStorage.getItem(leaveStorageKey) || "null"
    );

    return Array.isArray(savedRequests) ? savedRequests : initialRequests;
  } catch {
    return initialRequests;
  }
}

export function saveLeaveRequestsToStorage(requests) {
  try {
    window.localStorage.setItem(leaveStorageKey, JSON.stringify(requests));
  } catch {
    return;
  }
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getEmployeesOnLeave(employees, requests = getLeaveRequests(), today = new Date()) {
  const currentDate = formatLocalDate(today);
  const employeeEmailsOnLeave = new Set();
  const employeeNamesOnLeave = new Set();

  requests.forEach((request) => {
    if (
      !request ||
      request.status !== "Approved" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(request.startDate || "") ||
      !/^\d{4}-\d{2}-\d{2}$/.test(request.endDate || "") ||
      request.startDate > currentDate ||
      request.endDate < currentDate
    ) {
      return;
    }

    if (typeof request.employeeEmail === "string" && request.employeeEmail.trim()) {
      employeeEmailsOnLeave.add(request.employeeEmail.trim().toLowerCase());
    } else if (typeof request.name === "string" && request.name.trim()) {
      employeeNamesOnLeave.add(request.name.trim().toLowerCase());
    }
  });

  return employees.filter((employee) => {
    if (employee.status === "On Leave") return true;
    if (employee.email && employeeEmailsOnLeave.has(employee.email.trim().toLowerCase())) {
      return true;
    }
    return employee.name &&
      employeeNamesOnLeave.has(employee.name.trim().toLowerCase());
  });
}
