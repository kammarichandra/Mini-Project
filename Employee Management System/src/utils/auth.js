const usersKey = "teamSyncUsers";
const currentUserKey = "teamSyncCurrentUser";

export const roles = [
  "Super Admin",
  "HR Admin",
  "Manager",
  "Employee",
  "Finance",
  "Recruiter",
];

const roleAliases = {
  Admin: "Super Admin",
  HR: "HR Admin",
};

const roleAccess = {
  "Super Admin": ["*"],
  "HR Admin": [
    "/dashboard",
    "/employees",
    "/leave_management",
    "/attendance",
    "/payroll",
  ],
  Manager: [
    "/dashboard",
    "/employees",
    "/attendance",
    "/leave_management",
    "/performance",
  ],
  Employee: [
    "/dashboard",
    "/employees",
    "/settings",
    "/attendance",
    "/leave_management",
    "/payroll",
  ],
  Finance: [
    "/dashboard",
    "/payroll",
    "/reports",
  ],
  Recruiter: [
    "/dashboard",
    "/candidates",
    "/interviews",
    "/hiring",
  ],
};

const roleHomePaths = {
  "Super Admin": "/dashboard",
  "HR Admin": "/dashboard",
  Manager: "/dashboard",
  Employee: "/dashboard",
  Finance: "/dashboard",
  Recruiter: "/dashboard",
};

export function normalizeRole(role) {
  return roleAliases[role] || role;
}

export function getUsers() {
  return JSON.parse(localStorage.getItem(usersKey) || "[]");
}

export function registerUser(user) {
  const users = getUsers();
  const email = user.email.trim().toLowerCase();
  const role = normalizeRole(user.role || "Employee");

  if (users.some((registeredUser) => registeredUser.email === email)) {
    throw new Error("An account with this email already exists.");
  }

  if (!roles.includes(role)) {
    throw new Error("Please select a valid role.");
  }

  users.push({ ...user, email, role });
  localStorage.setItem(usersKey, JSON.stringify(users));
}

export function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = getUsers().find(
    (registeredUser) =>
      registeredUser.email === normalizedEmail &&
      registeredUser.password === password
  );

  if (!user) return null;

  const currentUser = {
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
  localStorage.setItem(currentUserKey, JSON.stringify(currentUser));
  localStorage.setItem("isLoggedIn", "true");
  return currentUser;
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(currentUserKey) || "null");
}

export function logoutUser() {
  localStorage.removeItem(currentUserKey);
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
}

export function hasRoleAccess(role, path) {
  const normalizedRole = normalizeRole(role);
  const normalizedPath = path.toLowerCase();
  if (normalizedPath === "/welcome") return true;
  const allowedPaths = roleAccess[normalizedRole] || [];
  return allowedPaths.includes("*") || allowedPaths.includes(normalizedPath);
}

export function getRoleHomePath(role) {
  return roleHomePaths[normalizeRole(role)] || "/welcome";
}
