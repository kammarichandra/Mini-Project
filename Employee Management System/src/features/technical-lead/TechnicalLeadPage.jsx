import { useState } from "react";
import PageSurface from "@/shared/components/PageSurface";
import { getCurrentUser, normalizeRole } from "@/shared/utils/auth";
import { getEmployeeInitials, getEmployeesFromStorage,} from "@/shared/utils/employees";
import { getTeamTasks, saveTeamTask, updateTeamTaskStatus,} from "@/shared/utils/teamTasks";
import "./TechnicalLeadPage.css";

// Keep page labels and summary numbers together so each workspace page is easy to scan.

const pageDetails = {
  dashboard: {
    title: "Technical Lead Dashboard",
    subtitle: "Manage your team, projects, tasks, and technical progress.",
    icon: "fa-gauge-high",
    stats: [

      { label: "Team members", value: 14, note: "Across engineering" },
      { label: "Active projects", value: 3, note: "6 total projects" },
      { label: "Pending tasks", value: 7, note: "For current sprint", tone: "warning" },
      { label: "Code reviews", value: 5, note: "Awaiting review" },
    ],
  },
  team: {
    title: "My Team",
    subtitle: "View your team members and their current availability.",
    icon: "fa-people-group",
    stats: [
      { label: "Total members", value: 14, note: "Engineering team" },
      { label: "Active", value: 9, note: "Available today" },
      { label: "On leave", value: 3, note: "Away today", tone: "warning" },
      { label: "In notice", value: 2, note: "Transitioning" },
    ],
  },
  projects: {
    title: "Projects",
    subtitle: "Track project progress, ownership, and delivery dates.",
    icon: "fa-diagram-project",
    stats: [
      { label: "Total projects", value: 6, note: "In the portfolio" },
      { label: "Active projects", value: 3, note: "Work in progress" },
      { label: "Completed", value: 2, note: "Delivered" },
      { label: "On hold", value: 1, note: "Needs follow-up", tone: "warning" },
    ],
  },

  tasks: {
    title: "Task Management",
    subtitle: "Create, assign, and track technical team tasks.",
    icon: "fa-list-check",
    stats: [
      { label: "All tasks", value: 11, note: "Across projects" },
      { label: "My tasks", value: 4, note: "Assigned to you" },
      { label: "Pending", value: 7, note: "Not completed", tone: "warning" },
      { label: "Completed", value: 4, note: "This sprint" },
    ],
  },

  reviews: {
    title: "Code Reviews",
    subtitle: "Review pull requests and help maintain code quality.",
    icon: "fa-code-branch",
    stats: [
      { label: "Pending", value: 5, note: "Ready for review", tone: "warning" },
      { label: "Reviewed", value: 12, note: "This sprint" },
      { label: "All reviews", value: 17, note: "Current sprint" },
      { label: "Approved", value: 8, note: "Ready to merge" },
    ],
  },
  
  bugs: {
    title: "Bug Tracking",
    subtitle: "Report and manage issues affecting your projects.",
    icon: "fa-bug",
    stats: [
      { label: "All bugs", value: 8, note: "Across projects" },
      { label: "Open", value: 5, note: "Needs attention", tone: "warning" },
      { label: "In progress", value: 2, note: "Being fixed" },
      { label: "Resolved", value: 1, note: "Recently closed" },
    ],
  },
  performance: {
    title: "Team Performance",
    subtitle: "Review team productivity and individual progress.",
    icon: "fa-arrow-trend-up",
    stats: [
      { label: "Team members", value: 14, note: "Engineering team" },
      { label: "Tasks completed", value: 68, note: "This sprint" },
      { label: "On-time delivery", value: "92%", note: "Across projects" },
      { label: "Needs attention", value: 2, note: "Follow up this week", tone: "warning" },
    ],
  },
  sprint: {
    title: "Sprint Planning",
    subtitle: "Plan sprint goals and keep the backlog ready.",
    icon: "fa-rotate",
    stats: [
      { label: "Current sprint", value: "11", note: "Active sprint" },
      { label: "Completed", value: "68%", note: "12 of 18 tasks" },
      { label: "Sprint length", value: "14 days", note: "Standard cycle" },
      { label: "Backlog", value: 7, note: "Ready to plan" },
    ],
  },
  reports: {
    title: "Reports",
    subtitle: "Review clear summaries of project and team progress.",
    icon: "fa-chart-column",
    stats: [
      { label: "Projects", value: 6, note: "Tracked projects" },
      { label: "Tasks", value: 11, note: "Current task list" },
      { label: "Team members", value: 14, note: "Engineering team" },
      { label: "Attendance", value: "86%", note: "Team availability" },
    ],
  },
};

const projects = [
  { name: "TeamSync EMS", progress: "75%", team: "4 members", deadline: "Dec 30, 2026", status: "On Track" },
  { name: "Payroll Enhancement", progress: "60%", team: "3 members", deadline: "Dec 20, 2026", status: "In Progress" },
  { name: "Task Management App", progress: "90%", team: "5 members", deadline: "Dec 15, 2026", status: "On Track" },
  { name: "Bug Fixes & UI Update", progress: "25%", team: "2 members", deadline: "Dec 10, 2026", status: "At Risk" },
  { name: "Mobile App Support", progress: "80%", team: "3 members", deadline: "Dec 08, 2026", status: "Delayed" },
];

const tasks = [
  { task: "Implement JWT Auth", project: "TeamSync EMS", assignee: "Anil Kumar", priority: "High", due: "Nov 20, 2026", status: "In Progress" },
  { task: "Fix Dashboard Chart", project: "Payroll Module", assignee: "Riya Sharma", priority: "Medium", due: "Nov 18, 2026", status: "Pending" },
  { task: "API Integration", project: "TeamSync EMS", assignee: "Vamsi P", priority: "High", due: "Nov 17, 2026", status: "In Review" },
  { task: "Optimize Queries", project: "Reports Module", assignee: "Sneha K", priority: "Low", due: "Nov 15, 2026", status: "Completed" },
];

const reviews = [
  { pr: "#245", title: "Fix login issue", author: "Anil Kumar", project: "TeamSync EMS", changes: "+12 / -3", status: "Review" },
  { pr: "#242", title: "Update charts", author: "Riya Sharma", project: "Payroll Module", changes: "+87 / -20", status: "Review" },
  { pr: "#239", title: "Refactor API", author: "Vamsi P", project: "TeamSync EMS", changes: "+45 / -10", status: "Review" },
  { pr: "#238", title: "UI improvements", author: "Sneha K", project: "Reports Module", changes: "+30 / -18", status: "Approved" },
];

const bugs = [
  { id: "BUG-001", title: "Dashboard not loading", project: "TeamSync EMS", priority: "High", status: "Open" },
  { id: "BUG-002", title: "Print not working", project: "Payroll Module", priority: "Medium", status: "In Progress" },
  { id: "BUG-003", title: "Data mismatch", project: "Reports Module", priority: "High", status: "Open" },
  { id: "BUG-004", title: "UI alignment issue", project: "TeamSync EMS", priority: "Low", status: "Resolved" },
];

const teamPerformance = [
  { name: "Anil Kumar", role: "Frontend Developer", score: 95 },
  { name: "Riya Sharma", role: "Backend Developer", score: 92 },
  { name: "Vamsi P", role: "Full Stack Developer", score: 90 },
  { name: "Sneha K", role: "QA Engineer", score: 88 },
];

const sprintGoals = [
  { label: "Complete API integration", done: true },
  { label: "Fix critical bugs", done: true },
  { label: "Improve performance", done: false },
];

function StatusBadge({ children }) {
  const tone = children.toLowerCase().replaceAll(" ", "-");
  return <span className={`lead-status lead-status-${tone}`}>{children}</span>;
}

function DataTable({ title, columns, rows }) {
  return (
    <section className="workspace-panel workspace-panel-wide">
      <div className="panel-heading">
        <h2>{title}</h2>
        <span>{rows.length} items</span>
      </div>
      <div className="lead-table-wrap">
        <table className="lead-table">
          <thead>
            <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id || row.pr || row.task || row.name}>
                {columns.map(({ key, render }) => (
                  <td key={key}>
                    {render
                      ? render(row)
                      : key === "status" ? <StatusBadge>{row[key]}</StatusBadge> : row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MemberCards({ members }) {
  return (
    <section className="workspace-panel workspace-panel-wide">
      <div className="panel-heading">
        <h2>Development team</h2>
        <span>{members.length} employees</span>
      </div>
      <div className="lead-member-grid">

        {members.map((member) => (

          <article className="lead-member-card" key={member.id}>
            <span className="lead-member-avatar">{member.initials || getEmployeeInitials(member.name)}</span>
            <strong>{member.name}</strong>
            <span>{member.designation}</span>
            <span>{member.email || "No email on file"}</span>
            <StatusBadge>{member.status}</StatusBadge>
          </article>

        ))}

        {members.length === 0 && (
          <p className="panel-note">No employees are currently assigned to the Development department.</p>
        )}
      </div>
    </section>
  );
}

function PerformancePanel() {
  return (
    <section className="workspace-panel">
      <div className="panel-heading"><h2>Developer performance</h2><span>This sprint</span></div>
      <div className="lead-performance-list">
        {teamPerformance.map((member) => (
          <div className="lead-performance-row" key={member.name}>
            <div className="lead-performance-copy">
              <strong>{member.name}</strong>
              <span>{member.role}</span>
            </div>
            <div className="lead-progress-track" aria-label={`${member.score}% complete`}>
              <span style={{ width: `${member.score}%` }} />
            </div>
            <b>{member.score}%</b>
          </div>
        ))}
      </div>
    </section>
  );
}

const emptyTaskForm = {
  task: "",
  project: "",
  description: "",
  assigneeEmail: "",
  priority: "Medium",
  due: "",
};

function TaskManagement({ employees, teamTasks, onTasksChange, taskLoadError }) {
  const currentUser = getCurrentUser();
  const isTechnicalLead = normalizeRole(currentUser?.role) === "Technical Lead";
  const [form, setForm] = useState(emptyTaskForm);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [statusError, setStatusError] = useState("");

  const visibleTasks = isTechnicalLead
    ? teamTasks
    : teamTasks.filter(
      (task) => task.assigneeEmail?.toLowerCase() === currentUser?.email?.toLowerCase()
    );
  const developmentEmployees = employees.filter(
    (employee) =>
      employee.department.trim().toLowerCase() === "development" &&
      employee.email.trim()
  );
  const taskRows = [
    ...visibleTasks.map((task) => ({
      ...task,
      assigned: task.assignee,
    })),
    ...(isTechnicalLead ? tasks : []),
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");
    setFormMessage("");

    const assignee = developmentEmployees.find(
      (employee) => employee.email.toLowerCase() === form.assigneeEmail
    );
    if (!assignee) {
      setFormError("Select a Development team member with an email address.");
      return;
    }

    const newTask = {
      task: form.task.trim(),
      project: form.project.trim(),
      description: form.description.trim(),
      assignee: assignee.name,
      assigneeEmail: assignee.email.toLowerCase(),
      priority: form.priority,
      due: form.due,
      status: "Pending",
      assignedBy: currentUser?.email || "",
    };

    if (!newTask.task || !newTask.project || !newTask.description || !newTask.due) {
      setFormError("Complete all task fields before assigning.");
      return;
    }

    try {
      onTasksChange(saveTeamTask(newTask));
      setForm(emptyTaskForm);
      setFormMessage(`Task assigned to ${assignee.name}.`);
    } catch {
      setFormError("Could not save this task. Check browser storage and try again.");
    }
  };

  const handleStatusChange = (task, status) => {
    setStatusError("");
    try {
      onTasksChange(updateTeamTaskStatus(task.id, status));
    } catch (error) {
      setStatusError(
        error instanceof Error ? error.message : "Could not update this task."
      );
    }
  };

  return (
    <>
      {taskLoadError && (
        <section className="workspace-panel workspace-panel-wide">
          <p className="lead-task-message lead-task-error" role="alert">
            Saved task assignments could not be loaded: {taskLoadError}
          </p>
        </section>
      )}
      {!isTechnicalLead && statusError && (
        <section className="workspace-panel workspace-panel-wide">
          <p className="lead-task-message lead-task-error" role="alert">{statusError}</p>
        </section>
      )}
      {isTechnicalLead && (
        <section className="workspace-panel workspace-panel-wide">
          <div className="panel-heading">
            <h2>Assign a task</h2>
            <span>Development team</span>
          </div>
          {developmentEmployees.length === 0 ? (
            <p className="panel-note">Add Development employees with email addresses before assigning tasks.</p>
          ) : (
            <form className="lead-task-form" onSubmit={handleSubmit}>
              <label>
                Task
                <input
                  required
                  value={form.task}
                  onChange={(event) => setForm({ ...form, task: event.target.value })}
                  placeholder="e.g. Build employee search"
                />
              </label>
              <label>
                Project
                <input
                  required
                  value={form.project}
                  onChange={(event) => setForm({ ...form, project: event.target.value })}
                  placeholder="Project name"
                />
              </label>
              <label>
                Assign to
                <select
                  required
                  value={form.assigneeEmail}
                  onChange={(event) => setForm({ ...form, assigneeEmail: event.target.value })}
                >
                  <option value="">Select a team member</option>
                  {developmentEmployees.map((employee) => (
                    <option key={employee.id} value={employee.email.toLowerCase()}>
                      {employee.name} ({employee.email})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value })}
                >
                  {["Low", "Medium", "High"].map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </label>
              <label>
                Due date
                <input
                  required
                  type="date"
                  value={form.due}
                  onChange={(event) => setForm({ ...form, due: event.target.value })}
                />
              </label>
              <label className="lead-task-description">
                Description
                <textarea
                  required
                  rows="3"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Describe the expected work"
                />
              </label>
              <div className="lead-task-submit">
                {formError && <p className="lead-task-message lead-task-error" role="alert">{formError}</p>}
                {formMessage && <p className="lead-task-message" role="status">{formMessage}</p>}
                <button className="workspace-action" type="submit">Assign task</button>
              </div>
            </form>
          )}
        </section>
      )}
      <DataTable
        title={isTechnicalLead ? "Team tasks" : "Tasks assigned to me"}
        columns={[
          { key: "task", label: "Task" }, { key: "project", label: "Project" },
          { key: "description", label: "Details" },
          ...(isTechnicalLead ? [{ key: "assigned", label: "Assignee" }] : []),
          { key: "priority", label: "Priority" }, { key: "due", label: "Due date" },
          {
            key: "status",
            label: "Status",
            render: (task) => isTechnicalLead
              ? <StatusBadge>{task.status}</StatusBadge>
              : (
                <select
                  className="lead-task-status"
                  aria-label={`Update status for ${task.task}`}
                  value={task.status}
                  onChange={(event) => handleStatusChange(task, event.target.value)}
                >
                  {["Pending", "In Progress", "Completed"].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              ),
          },
        ]}
        rows={taskRows}
      />
      {visibleTasks.length === 0 && !isTechnicalLead && (
        <section className="workspace-panel workspace-panel-wide">
          <p className="panel-note">You do not have any tasks assigned yet.</p>
        </section>
      )}
    </>
  );
}

// Render each role page from the same small set of reusable panels and tables.

function TechnicalLeadPage({ page }) {
  const [employees] = useState(getEmployeesFromStorage);
  const [taskStorage, setTaskStorage] = useState(() => {
    try {
      return { tasks: getTeamTasks(), error: "" };
    } catch (error) {
      return {
        tasks: [],
        error: error instanceof Error ? error.message : "Unknown storage error.",
      };
    }
  });
  const teamTasks = taskStorage.tasks;
  const currentUser = getCurrentUser();
  const isTechnicalLead = normalizeRole(currentUser?.role) === "Technical Lead";
  const developmentEmployees = employees.filter(
    (employee) => employee.department.trim().toLowerCase() === "development"
  );
  const details = pageDetails[page] || pageDetails.dashboard;
  const stats = page === "tasks"
    ? (() => {
      const tasksForUser = isTechnicalLead
        ? teamTasks
        : teamTasks.filter(
          (task) => task.assigneeEmail?.toLowerCase() === currentUser?.email?.toLowerCase()
        );
      return [
        { label: isTechnicalLead ? "Assigned tasks" : "My tasks", value: tasksForUser.length, note: "Saved task assignments" },
        { label: "Pending", value: tasksForUser.filter((task) => task.status === "Pending").length, note: "Not started", tone: "warning" },
        { label: "In progress", value: tasksForUser.filter((task) => task.status === "In Progress").length, note: "Being worked on" },
        { label: "Completed", value: tasksForUser.filter((task) => task.status === "Completed").length, note: "Finished" },
      ];
    })()
    : page === "team"
    ? [
        { label: "Development team", value: developmentEmployees.length, note: "Employees in Development" },
        { label: "Active", value: developmentEmployees.filter((employee) => employee.status === "Active").length, note: "Currently active" },
        { label: "On leave", value: developmentEmployees.filter((employee) => employee.status === "On Leave").length, note: "Currently away", tone: "warning" },
        { label: "Other status", value: developmentEmployees.filter((employee) => !["Active", "On Leave"].includes(employee.status)).length, note: "Needs follow-up" },
      ]
    : page === "dashboard"
      ? details.stats.map((stat) => stat.label === "Team members"
        ? { ...stat, value: developmentEmployees.length, note: "In Development" }
        : stat)
      : details.stats;

  let content;
  switch (page) {
    case "team":
      content = <MemberCards members={developmentEmployees} />;
      break;
    case "projects":
      content = <DataTable title="Project overview" columns={[
        { key: "name", label: "Project" }, { key: "progress", label: "Progress" },
        { key: "team", label: "Team" }, { key: "deadline", label: "Deadline" },
        { key: "status", label: "Status" },
      ]} rows={projects} />;
      break;
    case "tasks":
      content = (
        <TaskManagement
          employees={employees}
          teamTasks={teamTasks}
          onTasksChange={(tasks) => setTaskStorage({ tasks, error: "" })}
          taskLoadError={taskStorage.error}
        />
      );
      break;
    case "reviews":
      content = <DataTable title="Pull requests" columns={[
        { key: "pr", label: "PR" }, { key: "title", label: "Title" },
        { key: "author", label: "Author" }, { key: "project", label: "Project" },
        { key: "changes", label: "Changes" }, { key: "status", label: "Status" },
      ]} rows={reviews} />;
      break;
    case "bugs":
      content = <DataTable title="Reported bugs" columns={[
        { key: "id", label: "ID" }, { key: "title", label: "Title" },
        { key: "project", label: "Project" }, { key: "priority", label: "Priority" },
        { key: "status", label: "Status" },
      ]} rows={bugs} />;
      break;
    case "performance":
      content = <PerformancePanel />;
      break;
    case "sprint":
      content = (
        <>
          <section className="workspace-panel">
            <div className="panel-heading"><h2>Current sprint</h2><StatusBadge>Active</StatusBadge></div>
            <h3 className="lead-sprint-title">Sprint 11</h3>
            <p className="lead-sprint-dates">Nov 01 – Nov 15, 2026</p>
            <div className="lead-progress-track lead-sprint-progress" aria-label="68% complete"><span style={{ width: "68%" }} /></div>
            <p className="panel-note">68% completed · 12 of 18 tasks</p>
          </section>
          <section className="workspace-panel">
            <div className="panel-heading"><h2>Sprint goals</h2><span>3 goals</span></div>
            <ul className="lead-goal-list">
              {sprintGoals.map((goal) => (
                <li key={goal.label}>
                  <i className={`fa-solid ${goal.done ? "fa-circle-check" : "fa-circle"}`} aria-hidden="true" />
                  <span>{goal.label}</span>
                </li>
              ))}
            </ul>
          </section>
          <DataTable title="Sprint backlog" columns={[
            { key: "task", label: "Task" }, { key: "project", label: "Project" },
            { key: "priority", label: "Priority" }, { key: "status", label: "Status" },
          ]} rows={tasks.filter((task) => task.status !== "Completed")} />
        </>
      );
      break;
    case "reports":
      content = (
        <>
          <DataTable title="Project summary" columns={[
            { key: "name", label: "Project" }, { key: "progress", label: "Progress" },
            { key: "team", label: "Team" }, { key: "status", label: "Status" },
          ]} rows={projects} />
          <DataTable title="Task status" columns={[
            { key: "task", label: "Task" }, { key: "project", label: "Project" },
            { key: "assignee", label: "Assignee" }, { key: "status", label: "Status" },
          ]} rows={tasks} />
        </>
      );
      break;
    default:
      content = (
        <>
          <DataTable title="Project overview" columns={[
            { key: "name", label: "Project" }, { key: "progress", label: "Progress" },
            { key: "team", label: "Team" }, { key: "deadline", label: "Deadline" },
            { key: "status", label: "Status" },
          ]} rows={projects.slice(0, 4)} />
          <PerformancePanel />
          <DataTable title="Recent tasks" columns={[
            { key: "task", label: "Task" }, { key: "project", label: "Project" },
            { key: "assignee", label: "Assignee" }, { key: "status", label: "Status" },
          ]} rows={tasks.slice(0, 3)} />
          <section className="workspace-panel">
            <div className="panel-heading"><h2>Quick overview</h2><span>Current sprint</span></div>
            <p className="panel-note">Sprint 11 is 68% complete. Review open tasks, code reviews, and bugs to keep delivery on track.</p>
          </section>
        </>
      );
  }

  return (
    <PageSurface {...details} stats={stats} className="technical-lead-page">
      {content}
    </PageSurface>
  );
}

export default TechnicalLeadPage;
