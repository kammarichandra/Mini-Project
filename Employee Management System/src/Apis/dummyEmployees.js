import { getEmployeeInitials } from "../utils/employees";

export async function getDummyEmployees() {
  const response = await fetch("https://dummyjson.com/users?limit=10");
  if (!response.ok) {
    throw new Error("Could not load sample employees.");
  }

  const data = await response.json();
  if (!Array.isArray(data?.users)) {
    throw new Error("The sample employee response was invalid.");
  }

  return data.users.map((user) => {
    const name = `${user.firstName} ${user.lastName}`;
    return {
      id: `EMP${String(user.id).padStart(3, "0")}`,
      name,
      initials: getEmployeeInitials(name),
      department: user.company?.department || "Operations",
      designation: user.company?.title || "Employee",
      email: user.email,
      status: "Active",
      color: "blue",
      addedAt: new Date().toISOString(),
    };
  });
}
