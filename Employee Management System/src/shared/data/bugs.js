export const bugs = [
  { id: "BUG-001", title: "Dashboard not loading", description: "The dashboard remains in a loading state instead of displaying its summary widgets.", project: "TeamSync EMS", priority: "High", status: "Open" },
  { id: "BUG-002", title: "Print not working", description: "The payroll report print action does not open or produce the expected print output.", project: "Payroll Module", priority: "Medium", status: "In Progress" },
  { id: "BUG-003", title: "Data mismatch", description: "Report totals do not match the source records for the same reporting period.", project: "Reports Module", priority: "High", status: "Open" },
  { id: "BUG-004", title: "UI alignment issue", description: "Some dashboard controls are misaligned at narrow viewport widths.", project: "TeamSync EMS", priority: "Low", status: "Resolved" },
];

export function isUnresolvedBug(bug) {
  return !["resolved", "fixed", "closed", "completed"].includes(
    String(bug.status || "").trim().toLowerCase()
  );
}

export const hasUnresolvedBugs = bugs.some(isUnresolvedBug);
