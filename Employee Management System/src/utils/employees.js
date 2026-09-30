const employeeStorageKey = "employeeManagementDashboardEmployees";

export function getEmployeeInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getEmployeesFromStorage() {
  try {
    const savedEmployees = JSON.parse(
      window.localStorage.getItem(employeeStorageKey) || "[]"
    );

    if (!Array.isArray(savedEmployees)) return [];

    return savedEmployees
      .filter(
        (employee) =>
          employee &&
          typeof employee.name === "string" &&
          typeof employee.department === "string"
      )
      .map((employee, index) => ({
        ...employee,
        id: employee.id ?? index + 1,
        initials: employee.initials || getEmployeeInitials(employee.name),
        designation: employee.designation || "Employee",
        email: employee.email || "",
        status: employee.status || "Active",
        color: employee.color || "blue",
      }));
  } catch {
    return [];
  }
}

export function saveEmployeesToStorage(employees) {
  try {
    window.localStorage.setItem(employeeStorageKey, JSON.stringify(employees));
  } catch {
    return;
  }
}

export function createEmployeeId(employees) {
  const nextNumber = employees.reduce((highestNumber, employee) => {
    const numericId = Number(String(employee.id).replace(/\D/g, "")) || 0;
    return Math.max(highestNumber, numericId);
  }, 0) + 1;

  return `EMP${String(nextNumber).padStart(3, "0")}`;
}