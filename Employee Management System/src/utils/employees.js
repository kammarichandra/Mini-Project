const employeeStorageKey = "employeeManagementDashboardEmployees";

const departmentAvatarColors = [
  { background: "linear-gradient(135deg, #e4f2ff, #d7ebff)", color: "#006eff", row: "#f0f7ff" },
  { background: "linear-gradient(135deg, #ffe8f6, #ffdef1)", color: "#d52b91", row: "#fff2f9" },
  { background: "linear-gradient(135deg, #e3faeb, #d5f5e1)", color: "#07984d", row: "#effaf3" },
  { background: "linear-gradient(135deg, #eee5ff, #e3d6ff)", color: "#7641cf", row: "#f5f1ff" },
  { background: "linear-gradient(135deg, #fff5d6, #ffebae)", color: "#a97b00", row: "#fff9e8" },
  { background: "linear-gradient(135deg, #def8f5, #c9f0eb)", color: "#087f75", row: "#eefaf8" },
  { background: "linear-gradient(135deg, #ffebdf, #ffdcc7)", color: "#bd541e", row: "#fff4ed" },
  { background: "linear-gradient(135deg, #e5eaff, #d5ddff)", color: "#4054bd", row: "#f1f3ff" },
  { background: "linear-gradient(135deg, #e8f5d8, #d8edbd)", color: "#527b1c", row: "#f4f9ed" },
  { background: "linear-gradient(135deg, #fce8e5, #f8d5d0)", color: "#ba4335", row: "#fff3f1" },
  { background: "linear-gradient(135deg, #e1f1fa, #cce8f5)", color: "#176c91", row: "#eff8fc" },
  { background: "linear-gradient(135deg, #f5e6f7, #ead5ee)", color: "#91449b", row: "#faf2fb" },
];

const departmentAvatarColorIndexes = {
  development: 0,
  testing: 1,
  hr: 2,
  "human resources": 2,
  management: 3,
  design: 4,
  engineering: 5,
  marketing: 6,
  finance: 7,
  operations: 8,
  support: 9,
  "research and development": 10,
  "product management": 11,
};

export function getEmployeeInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getDepartmentAvatarStyle(department) {
  const normalizedDepartment =
    typeof department === "string" ? department.trim().toLowerCase() : "";
  const mappedColorIndex = departmentAvatarColorIndexes[normalizedDepartment];
  if (Object.hasOwn(departmentAvatarColorIndexes, normalizedDepartment)) {
    return departmentAvatarColors[mappedColorIndex];
  }

  let departmentHash = 0;

  for (const character of normalizedDepartment) {
    departmentHash = (departmentHash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return departmentAvatarColors[
    departmentHash % departmentAvatarColors.length
  ];
}

export function getDepartmentRowStyle(department) {
  return {
    backgroundColor: getDepartmentAvatarStyle(department).row,
  };
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