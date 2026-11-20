import { useState } from "react";
import PageSurface from "@/shared/components/PageSurface";
import { getCurrentUser, normalizeRole } from "@/shared/utils/auth";
import { getEmployeeInitials, getEmployeesFromStorage,} from "@/shared/utils/employees";
import { getTeamTasks, saveTeamTask, updateTeamTaskStatus,} from "@/shared/utils/teamTasks";
import { bugs, isUnresolvedBug } from "@/shared/data/bugs";
import Modal from "@/shared/components/common/Modal";
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
    title: " Project Code Reviews",
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
    title: " Project Sprint Planning",
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
  { pr: "#245", title: "Fix login issue", purpose: "Resolve a login failure and make authentication more reliable.", author: "Anil Kumar", project: "TeamSync EMS", changes: "+12 / -3", status: "Review" },
  { pr: "#242", title: "Update charts", purpose: "Improve the payroll dashboard charts so salary data is easier to understand.", author: "Riya Sharma", project: "Payroll Module", changes: "+87 / -20", status: "Review" },
  { pr: "#239", title: "Refactor API", purpose: "Simplify the project API integration and improve request handling.", author: "Vamsi P", project: "TeamSync EMS", changes: "+45 / -10", status: "Review" },
  { pr: "#238", title: "UI improvements", purpose: "Make report screens clearer and improve their visual consistency.", author: "Sneha K", project: "Reports Module", changes: "+30 / -18", status: "Approved" },
];

const reviewProjectDescriptions = {
  "TeamSync EMS": "Employee management platform for organizing people, attendance, tasks, and team workflows.",
  "Payroll Module": "Payroll tools for managing employee salary information and clear payroll reporting.",
  "Reports Module": "Reporting tools that help teams review operational data and project outcomes.",
};

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

const sprintProjectsStorageKey = "teamSyncSprintProjects";
const sprintProjectStatuses = ["Not Started", "In Progress", "On Hold", "Completed"];
const emptySprintProjectForm = {
  name: "",
  description: "",
  goals: "",
  requirements: "",
  startDate: "",
  endDate: "",
  teamMembers: [],
  status: "Not Started",
};

function getLeadSprintProjects(ownerEmail) {
  const savedProjects = window.localStorage.getItem(sprintProjectsStorageKey);
  if (!savedProjects) return [];

  const parsedProjects = JSON.parse(savedProjects);
  if (!Array.isArray(parsedProjects)) {
    throw new Error("Saved projects are not in a valid format.");
  }

  return parsedProjects.filter(
    (project) => project && project.ownerEmail?.toLowerCase() === ownerEmail.toLowerCase()
  );
}

function getLeadSprintProjectName(project) {
  const projectName = [project.name, project.projectName, project.title].find(
    (value) => typeof value === "string" && value.trim()
  );
  return projectName?.trim() || "Untitled project";
}

function getReviewProjectTasks(projectName, project, teamTasks) {
  const projectNameKey = projectName.trim().toLowerCase();
  const backlogTasks = (Array.isArray(project?.backlog) ? project.backlog : [])
    .map((task, index) => ({
      ...task,
      id: `backlog-${task.id || index}`,
      task: getProjectTaskTitle(task),
      status: task.status || "Pending",
    }));
  const sprintTasks = (Array.isArray(project?.sprints) ? project.sprints : [])
    .flatMap((sprint) =>
      (Array.isArray(sprint.tasks) ? sprint.tasks : []).map((task, index) => ({
        ...task,
        id: `sprint-${sprint.id || sprint.sprintNumber || "plan"}-${task.taskId || index}`,
        task: task.title || task.task || "Untitled task",
        status: task.status || sprint.status || "Planned",
      }))
    );
  const assignedTasks = teamTasks
    .filter((task) => String(task.project || "").trim().toLowerCase() === projectNameKey)
    .map((task, index) => ({
      ...task,
      id: `assigned-${task.id || index}`,
      task: task.task || task.title || "Untitled task",
      assigneeName: task.assigneeName || task.assignee,
      status: task.status || "Pending",
    }));
  const sampleTasks = tasks
    .filter((task) => task.project.trim().toLowerCase() === projectNameKey)
    .map((task, index) => ({
      ...task,
      id: `sample-${projectNameKey}-${index}`,
      task: task.task,
      assigneeName: task.assignee,
      description: task.description || "No task description recorded.",
    }));
  return [...backlogTasks, ...sprintTasks, ...assignedTasks, ...sampleTasks];
}

function getProjectOverviewValue(project, fields, emptyMessage) {
  for (const field of fields) {
    const value = project[field];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (Array.isArray(value)) {
      const entries = value
        .map((item) => typeof item === "string"
          ? item.trim()
          : item?.title || item?.name || item?.description || "")
        .filter(Boolean);
      if (entries.length > 0) return entries.map((entry) => `- ${entry}`).join("\n");
    }
  }
  return emptyMessage;
}

function StatusBadge({ children }) {
  const tone = children.toLowerCase().replaceAll(" ", "-");
  return <span className={`lead-status lead-status-${tone}`}>{children}</span>;
}

function getProjectTaskTitle(task) {
  return task.title || task.task || "Untitled task";
}

function addCalendarDays(date, days) {
  const result = new Date(`${date}T12:00:00`);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
}

function taskMatchesDeveloperSkills(task, developer) {
  const developerSkills = Array.isArray(developer.skills)
    ? developer.skills.join(" ")
    : "";
  const profile = `${developer.designation || ""} ${developerSkills}`.toLowerCase();
  const words = `${getProjectTaskTitle(task)} ${task.description || ""}`
    .toLowerCase()
    .match(/[a-z0-9+#.]+/g) || [];
  return words.some((word) => word.length > 2 && profile.includes(word));
}

function generateProjectAutoSprints({
  project,
  tasks,
  developers,
  durationWeeks,
  weeklyCapacity,
  startDate,
  existingSprintCount,
}) {
  if (!startDate) throw new Error("Choose a start date for the sprint plan.");
  if (tasks.length === 0) throw new Error("There are no unplanned backlog tasks.");

  const weeks = Number(durationWeeks);
  const capacityPerWeek = Number(weeklyCapacity);
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > 4) {
    throw new Error("Sprint duration must be between one and four weeks.");
  }
  if (!Number.isFinite(capacityPerWeek) || capacityPerWeek <= 0) {
    throw new Error("Developer capacity must be greater than zero hours per week.");
  }

  const availableDevelopers = developers
    .filter((developer) => developer.status?.toLowerCase() !== "on leave")
    .map((developer) => {
      const availability = Number(developer.availabilityPercent);
      const percent = Number.isFinite(availability)
        ? Math.max(0, Math.min(100, availability))
        : 100;
      return {
        ...developer,
        sprintCapacity: capacityPerWeek * weeks * percent / 100,
      };
    })
    .filter((developer) => developer.sprintCapacity > 0);
  if (availableDevelopers.length === 0) {
    throw new Error("No available developers are assigned to this project.");
  }

  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const orderedTasks = [...tasks].sort((first, second) =>
    (priorityOrder[first.priority] ?? 1) - (priorityOrder[second.priority] ?? 1) ||
    String(first.dueDate || "").localeCompare(String(second.dueDate || "")) ||
    getProjectTaskTitle(first).localeCompare(getProjectTaskTitle(second))
  );
  const oversizedTask = orderedTasks.find((task) => {
    const hours = Number(task.estimatedHours);
    return Number.isFinite(hours) && hours > Math.max(
      ...availableDevelopers.map((developer) => developer.sprintCapacity)
    );
  });
  if (oversizedTask) {
    throw new Error(
      `"${getProjectTaskTitle(oversizedTask)}" exceeds the capacity of every available developer for one sprint.`
    );
  }

  const plans = [];
  const createPlan = () => {
    const sprintNumber = existingSprintCount + plans.length + 1;
    const sprintStart = addCalendarDays(startDate, plans.length * weeks * 7);
    const plan = {
      id: `${project.id}-AUTO-${sprintNumber}`,
      name: `Sprint ${sprintNumber}`,
      goal: String(project.goals || "").split(/[.!?]/)[0].trim() ||
        "Complete prioritized backlog tasks",
      sprintNumber,
      startDate: sprintStart,
      endDate: addCalendarDays(sprintStart, weeks * 7 - 1),
      planningType: "auto",
      status: "Planned",
      tasks: [],
      developerHours: {},
    };
    plans.push(plan);
    return plan;
  };

  orderedTasks.forEach((task) => {
    const hours = Number(task.estimatedHours);
    const taskHours = Number.isFinite(hours) && hours > 0 ? hours : 1;
    let assignment;

    for (const plan of plans) {
      const candidates = availableDevelopers
        .filter((developer) =>
          (plan.developerHours[developer.email] || 0) + taskHours <= developer.sprintCapacity
        )
        .sort((first, second) =>
          Number(taskMatchesDeveloperSkills(task, second)) -
            Number(taskMatchesDeveloperSkills(task, first)) ||
          (plan.developerHours[first.email] || 0) -
            (plan.developerHours[second.email] || 0) ||
          first.name.localeCompare(second.name)
        );
      if (candidates.length > 0) {
        assignment = { plan, developer: candidates[0] };
        break;
      }
    }

    if (!assignment) {
      const plan = createPlan();
      const developer = [...availableDevelopers].sort((first, second) =>
        Number(taskMatchesDeveloperSkills(task, second)) -
          Number(taskMatchesDeveloperSkills(task, first)) ||
        first.name.localeCompare(second.name)
      )[0];
      assignment = { plan, developer };
    }

    const { plan, developer } = assignment;
    plan.developerHours[developer.email] =
      (plan.developerHours[developer.email] || 0) + taskHours;
    plan.tasks.push({
      taskId: task.id,
      title: getProjectTaskTitle(task),
      description: task.description || "",
      assigneeEmail: developer.email,
      assigneeName: developer.name,
      priority: task.priority || "Medium",
      estimatedHours: taskHours,
      startDate: task.startDate || "",
      dueDate: task.dueDate || "",
      status: task.status || "To Do",
    });
  });

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    goal: plan.goal,
    sprintNumber: plan.sprintNumber,
    startDate: plan.startDate,
    endDate: plan.endDate,
    planningType: plan.planningType,
    status: plan.status,
    tasks: plan.tasks,
  }));
}

function createProjectTaskId(projectId) {
  return `${projectId}-TASK-${Date.now()}`;
}

const emptyProjectBacklogTask = {
  title: "",
  description: "",
  assigneeEmail: "",
  priority: "Medium",
  estimatedHours: 1,
  startDate: "",
  dueDate: "",
  status: "To Do",
};

function ProjectSprintPlanningView({ project, employees, onBack, onSaveProject }) {
  const [planningMode, setPlanningMode] = useState("");
  const [sprintDuration, setSprintDuration] = useState(2);
  const [weeklyCapacity, setWeeklyCapacity] = useState(40);
  const [sprintStartDate, setSprintStartDate] = useState(project.startDate || "");
  const [generatedSprints, setGeneratedSprints] = useState([]);
  const [manualForm, setManualForm] = useState({
    name: "",
    goal: "",
    startDate: project.startDate || "",
    endDate: project.endDate || "",
    selectedTasks: {},
  });
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState("");
  const [taskForm, setTaskForm] = useState(emptyProjectBacklogTask);
  const [taskSearch, setTaskSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const projectTeamMembers = Array.isArray(project.teamMembers)
    ? project.teamMembers
    : [];
  const projectMembers = employees.filter((employee) =>
    projectTeamMembers.some(
      (email) => email.toLowerCase() === employee.email.toLowerCase()
    )
  );
  const backlog = (Array.isArray(project.backlog) ? project.backlog : [])
    .map((task, index) => ({
      ...task,
      id: String(task.id || task.taskId || `${project.id}-TASK-${index + 1}`),
    }));
  const savedSprints = Array.isArray(project.sprints) ? project.sprints : [];
  const plannedTaskIds = new Set(
    savedSprints
      .filter((sprint) => sprint.status !== "Completed")
      .flatMap((sprint) =>
        Array.isArray(sprint.tasks)
          ? sprint.tasks.map((task) => String(task.taskId))
          : []
      )
  );
  const availableTasks = backlog.filter(
    (task) =>
      task.status?.toLowerCase() !== "completed" &&
      !plannedTaskIds.has(task.id)
  );
  const visibleBacklog = backlog.filter((task) =>
    `${getProjectTaskTitle(task)} ${task.description || ""} ${task.status || ""}`
      .toLowerCase()
      .includes(taskSearch.trim().toLowerCase())
  );

  const openTaskForm = (task) => {
    setTaskForm(task
      ? { ...emptyProjectBacklogTask, ...task }
      : {
        ...emptyProjectBacklogTask,
        assigneeEmail: projectMembers[0]?.email || "",
      });
    setEditingTaskId(task?.id || "");
    setTaskFormOpen(true);
    setError("");
    setNotice("");
  };

  const saveBacklogTask = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!taskForm.title.trim() || !taskForm.description.trim() ||
      !taskForm.assigneeEmail || !taskForm.dueDate ||
      Number(taskForm.estimatedHours) <= 0) {
      setError("Complete the task details, assign a developer, and enter positive estimated hours.");
      return;
    }
    if (taskForm.startDate && taskForm.dueDate < taskForm.startDate) {
      setError("The task due date must be on or after its start date.");
      return;
    }

    const updatedTask = {
      ...taskForm,
      id: editingTaskId || createProjectTaskId(project.id),
      estimatedHours: Number(taskForm.estimatedHours),
    };
    const updatedBacklog = editingTaskId
      ? backlog.map((task) => task.id === editingTaskId ? updatedTask : task)
      : [...backlog, updatedTask];
    try {
      onSaveProject({ backlog: updatedBacklog });
      setTaskFormOpen(false);
      setEditingTaskId("");
      setNotice(editingTaskId ? "Backlog task updated." : "Backlog task added.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this task.");
    }
  };

  const deleteBacklogTask = (task) => {
    if (!window.confirm(`Delete "${getProjectTaskTitle(task)}" from the backlog?`)) return;
    try {
      onSaveProject({ backlog: backlog.filter((item) => item.id !== task.id) });
      setNotice("Backlog task deleted.");
      setError("");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not delete this task.");
    }
  };

  const generatePlan = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const plans = generateProjectAutoSprints({
        project,
        tasks: availableTasks,
        developers: projectMembers,
        durationWeeks: sprintDuration,
        weeklyCapacity,
        startDate: sprintStartDate,
        existingSprintCount: savedSprints.length,
      });
      setGeneratedSprints(plans);
    } catch (planError) {
      setError(planError instanceof Error ? planError.message : "Could not generate the sprint plan.");
    }
  };

  const saveGeneratedPlan = () => {
    if (generatedSprints.length === 0) return;
    try {
      onSaveProject({ sprints: [...savedSprints, ...generatedSprints] });
      setGeneratedSprints([]);
      setNotice("Generated sprint plan saved.");
      setError("");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the sprint plan.");
    }
  };

  const toggleManualTask = (task, checked) => {
    setManualForm((current) => {
      const selectedTasks = { ...current.selectedTasks };
      if (checked) {
        selectedTasks[task.id] = {
          assigneeEmail: task.assigneeEmail || projectMembers[0]?.email || "",
          priority: task.priority || "Medium",
          estimatedHours: task.estimatedHours || 1,
        };
      } else {
        delete selectedTasks[task.id];
      }
      return { ...current, selectedTasks };
    });
  };

  const saveManualPlan = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const selectedTaskIds = Object.keys(manualForm.selectedTasks);
    if (!manualForm.name.trim() || !manualForm.goal.trim() ||
      !manualForm.startDate || !manualForm.endDate ||
      manualForm.endDate < manualForm.startDate || selectedTaskIds.length === 0) {
      setError("Enter sprint details, valid dates, and select at least one backlog task.");
      return;
    }

    const sprintTasks = selectedTaskIds.map((taskId) => {
      const task = backlog.find((item) => item.id === taskId);
      const selection = manualForm.selectedTasks[taskId];
      const developer = projectMembers.find(
        (member) => member.email === selection.assigneeEmail
      );
      return {
        taskId,
        title: getProjectTaskTitle(task || {}),
        description: task?.description || "",
        assigneeEmail: selection.assigneeEmail,
        assigneeName: developer?.name || "",
        priority: selection.priority,
        estimatedHours: Number(selection.estimatedHours),
        startDate: task?.startDate || "",
        dueDate: task?.dueDate || "",
        status: task?.status || "To Do",
      };
    });
    if (sprintTasks.some((task) => !task.assigneeEmail || task.estimatedHours <= 0)) {
      setError("Assign each selected task to a developer and enter positive estimated hours.");
      return;
    }

    const sprintNumber = savedSprints.length + 1;
    const sprint = {
      id: `${project.id}-MANUAL-${sprintNumber}`,
      name: manualForm.name.trim(),
      goal: manualForm.goal.trim(),
      sprintNumber,
      startDate: manualForm.startDate,
      endDate: manualForm.endDate,
      planningType: "manual",
      status: "Planned",
      tasks: sprintTasks,
    };
    try {
      onSaveProject({ sprints: [...savedSprints, sprint] });
      setManualForm({
        name: "",
        goal: "",
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        selectedTasks: {},
      });
      setNotice("Manual sprint plan saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the sprint plan.");
    }
  };

  return (
    <PageSurface
      title={getLeadSprintProjectName(project)}
      subtitle="Project details and sprint planning."
      icon="fa-diagram-project"
      className="technical-lead-page"
    >
      <section className="workspace-panel workspace-panel-wide">
        <button className="btn btn-outline-secondary mb-3" type="button" onClick={onBack}>
          <i className="fa-solid fa-arrow-left me-2" aria-hidden="true" />
          Back to assigned projects
        </button>
        <div className="panel-heading">
          <h2>Project Overview</h2>
          <StatusBadge>{project.status || "Not Started"}</StatusBadge>
        </div>
        <p>{project.description}</p>
        <p className="panel-note">{project.startDate} – {project.endDate}</p>
        <div className="row g-3">
          <div className="col-md-6">
            <section className="border rounded-3 bg-light h-100 p-3">
              <h3 className="h6 text-primary">Project Goals</h3>
              <p className="mb-0" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {getProjectOverviewValue(
                  project,
                  ["goals", "projectGoals", "goal"],
                  "No project goals have been added."
                )}
              </p>
            </section>
          </div>
          <div className="col-md-6">
            <section className="border rounded-3 bg-light h-100 p-3">
              <h3 className="h6 text-primary">Project Requirements</h3>
              <p className="mb-0" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {getProjectOverviewValue(
                  project,
                  ["requirements", "projectRequirements", "requirement"],
                  "No project requirements have been added."
                )}
              </p>
            </section>
          </div>
          <div className="col-12">
            <h3 className="h6">Team Members</h3>
            <div className="lead-project-team-cell">
              {projectMembers.map((member) => (
                <span className="lead-project-team-chip" key={member.email}>
                  <span>{member.initials || getEmployeeInitials(member.name)}</span>
                  {member.name}
                </span>
              ))}
              {projectMembers.length === 0 && <span className="panel-note">No available team members.</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="workspace-panel workspace-panel-wide">
        <div className="panel-heading">
          <h2>Sprint Backlog</h2>
          <span>{backlog.length} tasks</span>
        </div>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <input
            className="form-control"
            style={{ maxWidth: "320px" }}
            aria-label="Search backlog tasks"
            placeholder="Search backlog tasks"
            value={taskSearch}
            onChange={(event) => setTaskSearch(event.target.value)}
          />
          <button className="workspace-action" type="button" onClick={() => openTaskForm()}>
            <i className="fa-solid fa-plus me-2" aria-hidden="true" />Add Task
          </button>
        </div>
        {taskFormOpen && (
          <form className="lead-task-form mb-4" onSubmit={saveBacklogTask}>
            <label>Task Title
              <input required value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} />
            </label>
            <label>Assigned Developer
              <select required value={taskForm.assigneeEmail} onChange={(event) => setTaskForm({ ...taskForm, assigneeEmail: event.target.value })}>
                <option value="">Select developer</option>
                {projectMembers.map((member) => <option key={member.email} value={member.email}>{member.name}</option>)}
              </select>
            </label>
            <label>Priority
              <select value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}>
                {["High", "Medium", "Low"].map((priority) => <option key={priority}>{priority}</option>)}
              </select>
            </label>
            <label>Estimated Hours
              <input required type="number" min="0.5" step="0.5" value={taskForm.estimatedHours} onChange={(event) => setTaskForm({ ...taskForm, estimatedHours: event.target.value })} />
            </label>
            <label>Start Date
              <input type="date" value={taskForm.startDate} onChange={(event) => setTaskForm({ ...taskForm, startDate: event.target.value })} />
            </label>
            <label>Due Date
              <input required type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })} />
            </label>
            <label>Task Status
              <select value={taskForm.status} onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value })}>
                {["To Do", "In Progress", "Completed"].map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="lead-task-description">Task Description
              <textarea required rows="2" value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} />
            </label>
            <div className="lead-task-submit">
              <div className="d-flex gap-2">
                <button className="workspace-action" type="submit">{editingTaskId ? "Save Changes" : "Save Task"}</button>
                <button className="btn btn-outline-secondary" type="button" onClick={() => setTaskFormOpen(false)}>Cancel</button>
              </div>
            </div>
          </form>
        )}
        {backlog.length === 0 ? (
          <p className="panel-note">No backlog tasks yet. Add tasks before creating a sprint plan.</p>
        ) : visibleBacklog.length === 0 ? (
          <p className="panel-note">No tasks match your search.</p>
        ) : (
          <div className="lead-table-wrap">
            <table className="lead-table">
              <thead><tr>
                <th>Task</th><th>Developer</th><th>Priority</th><th>Estimate</th><th>Due Date</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {visibleBacklog.map((task) => {
                  const developer = projectMembers.find((member) =>
                    member.email === task.assigneeEmail
                  );
                  return (
                    <tr key={task.id}>
                      <td><strong>{getProjectTaskTitle(task)}</strong><br /><small>{task.description}</small></td>
                      <td>{developer?.name || "Unassigned"}</td>
                      <td>{task.priority || "Medium"}</td>
                      <td>{task.estimatedHours || 1}h</td>
                      <td>{task.dueDate || "—"}</td>
                      <td><StatusBadge>{task.status || "To Do"}</StatusBadge></td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => openTaskForm(task)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => deleteBacklogTask(task)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="workspace-panel workspace-panel-wide">
        <div className="panel-heading"><h2>Plan a Sprint</h2></div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          <button
            className={`btn ${planningMode === "auto" ? "btn-primary" : "btn-outline-primary"}`}
            type="button"
            onClick={() => {
              setPlanningMode("auto");
              setGeneratedSprints([]);
              setError("");
              setNotice("");
            }}
          >
            <i className="fa-solid fa-wand-magic-sparkles me-2" aria-hidden="true" />Auto Planning
          </button>
          <button
            className={`btn ${planningMode === "manual" ? "btn-primary" : "btn-outline-primary"}`}
            type="button"
            onClick={() => {
              setPlanningMode("manual");
              setGeneratedSprints([]);
              setError("");
              setNotice("");
            }}
          >
            <i className="fa-solid fa-calendar-plus me-2" aria-hidden="true" />Manual Planning
          </button>
        </div>
        {error && <p className="lead-task-message lead-task-error" role="alert">{error}</p>}
        {notice && <p className="lead-task-message" role="status">{notice}</p>}

        {planningMode === "auto" && (
          <form className="lead-task-form" onSubmit={generatePlan}>
            <label>Sprint Duration
              <select value={sprintDuration} onChange={(event) => setSprintDuration(Number(event.target.value))}>
                {[1, 2, 3, 4].map((weeks) => <option key={weeks} value={weeks}>{weeks} {weeks === 1 ? "week" : "weeks"}</option>)}
              </select>
            </label>
            <label>Sprint Start Date
              <input required type="date" value={sprintStartDate} onChange={(event) => setSprintStartDate(event.target.value)} />
            </label>
            <label>Developer Capacity (hours per week)
              <input required type="number" min="1" max="60" value={weeklyCapacity} onChange={(event) => setWeeklyCapacity(Number(event.target.value))} />
            </label>
            <p className="panel-note">Plan uses {availableTasks.length} unplanned tasks, priority, estimates, developer capacity, and matching skills.</p>
            {availableTasks.length === 0 && <p className="panel-note">Add backlog tasks to this project before generating a plan.</p>}
            <div className="lead-task-submit">
              <button className="workspace-action" type="submit">Generate Sprint Plan</button>
            </div>
          </form>
        )}

        {planningMode === "manual" && (
          <form className="lead-task-form" onSubmit={saveManualPlan}>
            <label>Sprint Name
              <input required value={manualForm.name} onChange={(event) => setManualForm({ ...manualForm, name: event.target.value })} placeholder="e.g. Sprint 1" />
            </label>
            <label>Sprint Goal
              <input required value={manualForm.goal} onChange={(event) => setManualForm({ ...manualForm, goal: event.target.value })} />
            </label>
            <label>Sprint Start Date
              <input required type="date" value={manualForm.startDate} onChange={(event) => setManualForm({ ...manualForm, startDate: event.target.value })} />
            </label>
            <label>Sprint End Date
              <input required type="date" value={manualForm.endDate} onChange={(event) => setManualForm({ ...manualForm, endDate: event.target.value })} />
            </label>
            <div className="lead-task-description">
              <h3 className="h6">Select backlog tasks</h3>
              {availableTasks.length === 0 ? (
                <p className="panel-note">There are no unplanned tasks available.</p>
              ) : availableTasks.map((task) => {
                const selection = manualForm.selectedTasks[task.id];
                return (
                  <div className="border rounded p-3 mb-2" key={task.id}>
                    <label className="d-flex align-items-center gap-2">
                      <input type="checkbox" checked={Boolean(selection)} onChange={(event) => toggleManualTask(task, event.target.checked)} />
                      <span><strong>{getProjectTaskTitle(task)}</strong><small className="d-block">{task.description}</small></span>
                    </label>
                    {selection && (
                      <div className="row g-2 mt-2">
                        <div className="col-md-4">
                          <select className="form-select" aria-label={`Assign ${getProjectTaskTitle(task)}`} value={selection.assigneeEmail} onChange={(event) => setManualForm((current) => ({ ...current, selectedTasks: { ...current.selectedTasks, [task.id]: { ...current.selectedTasks[task.id], assigneeEmail: event.target.value } } }))}>
                            <option value="">Select developer</option>
                            {projectMembers.map((member) => <option key={member.email} value={member.email}>{member.name}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <select className="form-select" aria-label={`Priority for ${getProjectTaskTitle(task)}`} value={selection.priority} onChange={(event) => setManualForm((current) => ({ ...current, selectedTasks: { ...current.selectedTasks, [task.id]: { ...current.selectedTasks[task.id], priority: event.target.value } } }))}>
                            {["High", "Medium", "Low"].map((priority) => <option key={priority}>{priority}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <input className="form-control" aria-label={`Estimated hours for ${getProjectTaskTitle(task)}`} type="number" min="0.5" step="0.5" value={selection.estimatedHours} onChange={(event) => setManualForm((current) => ({ ...current, selectedTasks: { ...current.selectedTasks, [task.id]: { ...current.selectedTasks[task.id], estimatedHours: event.target.value } } }))} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="lead-task-submit">
              <button className="workspace-action" type="submit" disabled={availableTasks.length === 0}>Save Sprint Plan</button>
            </div>
          </form>
        )}
      </section>

      {generatedSprints.length > 0 && (
        <section className="workspace-panel workspace-panel-wide">
          <div className="panel-heading">
            <h2>Generated Sprint Plan</h2>
            <button className="workspace-action" type="button" onClick={saveGeneratedPlan}>Save Sprint Plan</button>
          </div>
          {generatedSprints.map((sprint) => (
            <div className="border rounded p-3 mb-2" key={sprint.id}>
              <h3 className="h6">{sprint.name} · {sprint.startDate} – {sprint.endDate}</h3>
              <p>{sprint.goal}</p>
              {sprint.tasks.map((task) => (
                <p className="mb-1" key={task.taskId}>
                  {task.title} · {task.assigneeName} · {task.priority} · {task.estimatedHours}h
                </p>
              ))}
            </div>
          ))}
        </section>
      )}

      <section className="workspace-panel workspace-panel-wide">
        <div className="panel-heading">
          <h2>Saved Sprint Plans</h2>
          <span>{savedSprints.length} sprints</span>
        </div>
        {savedSprints.length === 0 ? (
          <p className="panel-note">No sprint plans have been saved for this project yet.</p>
        ) : savedSprints.map((sprint) => {
          const sprintTasks = Array.isArray(sprint.tasks) ? sprint.tasks : [];
          const developers = [...new Set(sprintTasks.map((task) => task.assigneeName).filter(Boolean))];
          const completedTasks = sprintTasks.filter((task) => task.status === "Completed").length;
          return (
            <div className="border rounded p-3 mb-2" key={sprint.id}>
              <div className="panel-heading">
                <h3 className="h6">{sprint.name} · Sprint {sprint.sprintNumber}</h3>
                <StatusBadge>{sprint.status || "Planned"}</StatusBadge>
              </div>
              <p>{sprint.goal}</p>
              <p className="panel-note">{sprint.startDate} – {sprint.endDate} · {sprintTasks.length} tasks · {completedTasks} completed · {sprintTasks.length - completedTasks} pending</p>
              <p className="panel-note">Developers: {developers.join(", ") || "Not assigned"} · {sprint.planningType === "auto" ? "Auto planned" : "Manual plan"}</p>
            </div>
          );
        })}
      </section>
    </PageSurface>
  );
}

function DataTable({
  title,
  columns,
  rows,
  tableClassName = "",
  panelClassName = "",
  countLabel = "items",
}) {
  return (
    <section className={`workspace-panel workspace-panel-wide ${panelClassName}`.trim()}>
      <div className="panel-heading">
        <h2>{title}</h2>
        <span>{rows.length} {countLabel}</span>
      </div>
      <div className="lead-table-wrap">
        <table className={`lead-table ${tableClassName}`.trim()}>
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

function ReviewEmployeeDetails({ employee, employeeReviews, workItems, onBack }) {
  const completedTasks = workItems.filter((task) => task.status === "Completed").length;
  const activeTasks = workItems.filter((task) => task.status === "In Progress").length;

  return (
    <PageSurface
      title={`${employee.name} — Work Details`}
      subtitle="Pull requests and assigned work recorded in TeamSync."
      icon="fa-user-check"
      className="technical-lead-page"
      stats={[
        { label: "Pull requests", value: employeeReviews.length, note: "Submitted for review" },
        { label: "Assigned tasks", value: workItems.length, note: "Recorded tasks" },
        { label: "Completed", value: completedTasks, note: "Tasks marked complete" },
        { label: "In progress", value: activeTasks, note: "Currently active" },
      ]}
    >
      <section className="workspace-panel workspace-panel-wide">
        <button className="workspace-action" type="button" onClick={onBack}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to pull requests
        </button>
        <div className="lead-review-employee-profile">
          <span className="lead-member-avatar">
            {getEmployeeInitials(employee.name)}
          </span>
          <div>
            <strong>{employee.name}</strong>
            <span>{employee.designation || employee.role || "Development team member"}</span>
            {employee.email && <span>{employee.email}</span>}
          </div>
        </div>
      </section>
      <DataTable
        title="Pull requests submitted"
        columns={[
          { key: "pr", label: "PR" },
          { key: "title", label: "Title / work" },
          { key: "project", label: "Project" },
          { key: "changes", label: "Changes" },
          { key: "status", label: "Status" },
        ]}
        rows={employeeReviews}
      />
      {workItems.length > 0 ? (
        <DataTable
          title="Assigned work"
          columns={[
            { key: "task", label: "Task" },
            { key: "description", label: "Description" },
            { key: "project", label: "Project" },
            { key: "priority", label: "Priority" },
            { key: "due", label: "Due date" },
            { key: "status", label: "Status" },
          ]}
          rows={workItems}
        />
      ) : (
        <section className="workspace-panel workspace-panel-wide">
          <div className="panel-heading"><h2>Assigned work</h2></div>
          <p className="panel-note">No additional assigned tasks are recorded for this employee.</p>
        </section>
      )}
    </PageSurface>
  );
}

function ReviewProjectDetails({
  projectName,
  project,
  projectReviews,
  teamMembers,
  projectTasks,
  onBack,
  onSelectEmployee,
}) {
  return (
    <PageSurface
      title={projectName}
      subtitle="Project overview, team progress, and code submitted for review."
      icon="fa-diagram-project"
      className="technical-lead-page"
      stats={[
        { label: "Pull requests", value: projectReviews.length, note: "Submitted by project members" },
        { label: "Awaiting review", value: projectReviews.filter((review) => review.status === "Review").length, note: "Needs technical review", tone: "warning" },
        { label: "Project members", value: teamMembers.length, note: "Assigned or contributing" },
        { label: "Recorded tasks", value: projectTasks.length, note: "Project work items" },
      ]}
    >
      <section className="workspace-panel workspace-panel-wide">
        <button className="workspace-action" type="button" onClick={onBack}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to project reviews
        </button>
        <div className="lead-review-project-overview">
          <div className="panel-heading">
            <h2>Project details</h2>
            {project?.status && <StatusBadge>{project.status}</StatusBadge>}
          </div>
          <p>{project?.description || reviewProjectDescriptions[projectName] || "Project details have not been added yet."}</p>
          {(project?.startDate || project?.endDate) && (
            <p className="panel-note">
              {project.startDate || "Start date not set"} – {project.endDate || "End date not set"}
            </p>
          )}
          {project?.goals && (
            <div className="lead-review-project-meta">
              <strong>Project goals</strong>
              <p>{getProjectOverviewValue(project, ["goals", "projectGoals", "goal"], "No project goals have been added.")}</p>
            </div>
          )}
          {project?.requirements && (
            <div className="lead-review-project-meta">
              <strong>Requirements</strong>
              <p>{getProjectOverviewValue(project, ["requirements", "projectRequirements", "requirement"], "No requirements have been added.")}</p>
            </div>
          )}
        </div>
      </section>

      <section className="workspace-panel workspace-panel-wide">
        <div className="panel-heading">
          <h2>Project team</h2>
          <span>{teamMembers.length} members</span>
        </div>
        {teamMembers.length > 0 ? (
          <div className="lead-review-team-grid">
            {teamMembers.map((member) => (
              <article className="lead-review-team-member" key={member.email || member.name}>
                <span className="lead-member-avatar">
                  {member.initials || getEmployeeInitials(member.name)}
                </span>
                <div>
                  <strong>{member.name}</strong>
                  <span>{member.designation || member.role || "Development team member"}</span>
                  {member.status && <StatusBadge>{member.status}</StatusBadge>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="panel-note">No assigned team roster is available. Pull request contributors are listed below.</p>
        )}
      </section>

      <section className="workspace-panel workspace-panel-wide">
        <div className="panel-heading">
          <h2>Member code contributions</h2>
          <span>{projectReviews.length} pull requests</span>
        </div>
        <div className="lead-review-contribution-list">
          {projectReviews.map((review) => (
            <article className="lead-review-contribution" key={review.pr}>
              <div className="lead-review-contribution-heading">
                <div>
                  <span className="lead-review-pr-number">{review.pr}</span>
                  <h3>{review.title}</h3>
                </div>
                <StatusBadge>{review.status}</StatusBadge>
              </div>
              <p>{review.purpose || "Purpose not provided for this change."}</p>
              <div className="lead-review-contribution-meta">
                <span>
                  Submitted by{" "}
                  <button
                    className="lead-review-author-button"
                    type="button"
                    onClick={() => onSelectEmployee(review.author)}
                  >
                    {review.author}
                  </button>
                </span>
                <span>{review.changes} lines</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace-panel workspace-panel-wide">
        <div className="panel-heading">
          <h2>Recorded project work</h2>
          <span>{projectTasks.length} tasks</span>
        </div>
        {projectTasks.length > 0 ? (
          <div className="lead-review-project-tasks">
            {projectTasks.map((task) => (
              <article className="lead-review-project-task" key={task.id}>
                <div>
                  <strong>{getProjectTaskTitle(task)}</strong>
                  <span>{task.description || "No task description recorded."}</span>
                  <small>{task.assigneeName || task.assignee || "Unassigned"}</small>
                </div>
                <StatusBadge>{task.status || "Pending"}</StatusBadge>
              </article>
            ))}
          </div>
        ) : (
          <p className="panel-note">No project task or sprint progress has been recorded yet.</p>
        )}
      </section>
    </PageSurface>
  );
}

function MemberCards({ members, lead }) {
  const teamMembers = members.filter(
    (member) =>
      !lead?.email ||
      member.email.toLowerCase() !== lead.email.toLowerCase()
  );
  const leadName = lead?.fullName || "Technical Lead";

  return (
    <section className="workspace-panel workspace-panel-wide">
      <div className="panel-heading">
        <h2>Development team</h2>
        <span>{members.length} employees</span>
      </div>
      <div className="lead-team-tree-scroll">
        <ul className="lead-team-tree" aria-label="Development team reporting structure">
          <li className="lead-team-tree-root">
            <article className="lead-member-card lead-member-card-lead">
              <span className="lead-member-avatar">{getEmployeeInitials(leadName)}</span>
              <strong>{leadName}</strong>
              <span>Technical Lead</span>
              {lead?.email && <span>{lead.email}</span>}
            </article>
            {teamMembers.length > 0 && (
              <ul className="lead-team-tree-branches">
                {teamMembers.map((member) => (
                  <li className="lead-team-tree-branch" key={member.id}>
                    <article className="lead-member-card">
                      <span className="lead-member-avatar">
                        {member.initials || getEmployeeInitials(member.name)}
                      </span>
                      <strong>{member.name}</strong>
                      <span>{member.designation}</span>
                      <span>{member.email || "No email on file"}</span>
                      <StatusBadge>{member.status}</StatusBadge>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
        {teamMembers.length === 0 && (
          <p className="panel-note lead-team-tree-empty">
            No employees are currently assigned to the Development department.
          </p>
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
  const [selectedReviewEmployeeName, setSelectedReviewEmployeeName] = useState("");
  const [selectedReviewProjectName, setSelectedReviewProjectName] = useState("");
  const [selectedBug, setSelectedBug] = useState(null);
  const currentUser = getCurrentUser();
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
  const [sprintProjectStorage, setSprintProjectStorage] = useState(() => {
    try {
      return {
        projects: getLeadSprintProjects(currentUser?.email || ""),
        error: "",
      };
    } catch (error) {
      return {
        projects: [],
        error: error instanceof Error ? error.message : "Could not load saved projects.",
      };
    }
  });
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [projectForm, setProjectForm] = useState(emptySprintProjectForm);
  const [projectFormError, setProjectFormError] = useState("");
  const [projectNotice, setProjectNotice] = useState("");
  const [teamMemberSearch, setTeamMemberSearch] = useState("");
  const [selectedSprintProjectId, setSelectedSprintProjectId] = useState("");
  const teamTasks = taskStorage.tasks;
  const sprintProjects = sprintProjectStorage.projects;
  const isTechnicalLead = normalizeRole(currentUser?.role) === "Technical Lead";
  const developmentEmployees = employees.filter(
    (employee) => employee.department.trim().toLowerCase() === "development"
  );
  const selectedReviewEmployee = employees.find(
    (employee) => employee.name === selectedReviewEmployeeName
  ) || (selectedReviewEmployeeName
    ? { name: selectedReviewEmployeeName, designation: "Development team member", email: "" }
    : null);
  const selectedEmployeeReviews = selectedReviewEmployee
    ? reviews.filter((review) => review.author === selectedReviewEmployee.name)
    : [];
  const selectedEmployeeWork = selectedReviewEmployee
    ? [
      ...tasks
        .filter((task) => task.assignee === selectedReviewEmployee.name)
        .map((task, index) => ({
          ...task,
          id: `sample-${selectedReviewEmployee.name}-${index}`,
          description: task.description || "No task description recorded.",
        })),
      ...teamTasks
        .filter((task) =>
          (selectedReviewEmployee.email &&
            task.assigneeEmail?.toLowerCase() === selectedReviewEmployee.email.toLowerCase()) ||
          task.assignee === selectedReviewEmployee.name
        )
        .map((task) => ({
          ...task,
          id: task.id,
          task: task.task || task.title || "Untitled task",
          description: task.description || "No task description recorded.",
          due: task.due || task.dueDate || "Not set",
          status: task.status || "Pending",
          priority: task.priority || "Not set",
        })),
    ]
    : [];
  const reviewProjects = [...new Set(reviews.map((review) => review.project))].map((projectName) => {
    const projectReviews = reviews.filter((review) => review.project === projectName);
    const savedProject = sprintProjects.find(
      (project) => getLeadSprintProjectName(project).toLowerCase() === projectName.toLowerCase()
    );
    const assignedMembers = (Array.isArray(savedProject?.teamMembers) ? savedProject.teamMembers : [])
      .map((email) => typeof email === "string"
        ? employees.find(
          (employee) => employee.email?.toLowerCase() === email.toLowerCase()
        )
        : undefined)
      .filter(Boolean);
    const contributors = projectReviews.map((review) =>
      employees.find((employee) => employee.name === review.author) ||
      { name: review.author, designation: "Development team member" }
    );
    const members = [...new Map(
      [...assignedMembers, ...contributors].map((member) => [
        (member.email || member.name).toLowerCase(),
        member,
      ])
    ).values()];
    return {
      name: projectName,
      reviews: projectReviews,
      project: savedProject,
      members,
      description: savedProject?.description || reviewProjectDescriptions[projectName],
    };
  });
  const selectedReviewProject = reviewProjects.find(
    (project) => project.name === selectedReviewProjectName
  );
  const selectedSavedReviewProject = selectedReviewProject?.project;
  const selectedReviewProjectTasks = selectedReviewProject
    ? getReviewProjectTasks(selectedReviewProject.name, selectedSavedReviewProject, teamTasks)
    : [];
  const projectMemberOptions = developmentEmployees.filter((employee) =>
    employee.email &&
    `${employee.name} ${employee.email} ${employee.designation}`
      .toLowerCase()
      .includes(teamMemberSearch.trim().toLowerCase())
  );

  const handleProjectSubmit = (event) => {
    event.preventDefault();
    setProjectFormError("");
    setProjectNotice("");

    if (
      !projectForm.name.trim() ||
      !projectForm.description.trim() ||
      !projectForm.goals.trim() ||
      !projectForm.requirements.trim() ||
      !projectForm.startDate ||
      !projectForm.endDate ||
      projectForm.teamMembers.length === 0
    ) {
      setProjectFormError("Complete all project fields and select at least one team member.");
      return;
    }
    if (projectForm.endDate < projectForm.startDate) {
      setProjectFormError("The end date must be on or after the start date.");
      return;
    }

    try {
      const allProjects = JSON.parse(
        window.localStorage.getItem(sprintProjectsStorageKey) || "[]"
      );
      if (!Array.isArray(allProjects)) {
        throw new Error("Saved projects are not in a valid format.");
      }

      const project = {
        ...projectForm,
        id: `PROJECT-${Date.now()}-${sprintProjects.length + 1}`,
        ownerEmail: (currentUser?.email || "").toLowerCase(),
        createdAt: new Date().toISOString(),
        backlog: [],
        sprints: [],
      };
      const updatedProjects = [...allProjects, project];
      window.localStorage.setItem(sprintProjectsStorageKey, JSON.stringify(updatedProjects));
      setSprintProjectStorage({
        projects: [...sprintProjects, project],
        error: "",
      });
      setProjectForm(emptySprintProjectForm);
      setProjectFormOpen(false);
      setProjectNotice("Project saved successfully.");
    } catch (error) {
      setProjectFormError(
        error instanceof Error ? error.message : "Could not save this project."
      );
    }
  };

  const saveSprintProjectChanges = (projectId, changes) => {
    const allProjects = JSON.parse(
      window.localStorage.getItem(sprintProjectsStorageKey) || "[]"
    );
    if (!Array.isArray(allProjects)) {
      throw new Error("Saved projects are not in a valid format.");
    }

    const projectIndex = allProjects.findIndex(
      (project) =>
        project.id === projectId &&
        project.ownerEmail?.toLowerCase() === (currentUser?.email || "").toLowerCase()
    );
    if (projectIndex === -1) {
      throw new Error("This project is no longer available to you.");
    }

    const updatedProject = { ...allProjects[projectIndex], ...changes };
    allProjects[projectIndex] = updatedProject;
    window.localStorage.setItem(sprintProjectsStorageKey, JSON.stringify(allProjects));
    setSprintProjectStorage((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId ? updatedProject : project
      ),
    }));
    return updatedProject;
  };

  const details = pageDetails[page] || pageDetails.dashboard;
  const unresolvedBugs = bugs.filter(isUnresolvedBug);
  const stats = page === "bugs"
    ? [
      { label: "All bugs", value: bugs.length, note: "Reported issues" },
      { label: "Unfixed", value: unresolvedBugs.length, note: "Needs attention", tone: "warning" },
      { label: "In progress", value: bugs.filter((bug) => bug.status === "In Progress").length, note: "Being worked on" },
      { label: "Resolved", value: bugs.filter((bug) => !isUnresolvedBug(bug)).length, note: "Recently fixed" },
    ]
    : page === "tasks"
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

  if (page === "reviews" && selectedReviewProject) {
    return (
      <ReviewProjectDetails
        projectName={selectedReviewProject.name}
        project={selectedSavedReviewProject}
        projectReviews={selectedReviewProject.reviews}
        teamMembers={selectedReviewProject.members}
        projectTasks={selectedReviewProjectTasks}
        onBack={() => setSelectedReviewProjectName("")}
        onSelectEmployee={(name) => {
          setSelectedReviewProjectName("");
          setSelectedReviewEmployeeName(name);
        }}
      />
    );
  }

  if (page === "reviews" && selectedReviewEmployee) {
    return (
      <ReviewEmployeeDetails
        employee={selectedReviewEmployee}
        employeeReviews={selectedEmployeeReviews}
        workItems={selectedEmployeeWork}
        onBack={() => setSelectedReviewEmployeeName("")}
      />
    );
  }

  let content;
  switch (page) {
    case "team":
      content = <MemberCards members={developmentEmployees} lead={currentUser} />;
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
      content = (
        <section className="workspace-panel workspace-panel-wide">
          <div className="panel-heading">
            <h2>Projects with pull requests</h2>
            <span>{reviewProjects.length} projects</span>
          </div>
          <div className="lead-review-project-grid">
            {reviewProjects.map((project) => (
              <button
                className="lead-review-project-card"
                key={project.name}
                type="button"
                onClick={() => {
                  setSelectedReviewEmployeeName("");
                  setSelectedReviewProjectName(project.name);
                }}
                aria-label={`View ${project.name} project details and pull requests`}
              >
                <span className="lead-review-project-icon" aria-hidden="true">
                  <i className="fa-solid fa-diagram-project" />
                </span>
                <span className="lead-review-project-card-copy">
                  <strong>{project.name}</strong>
                  <span>{project.description || "Project details have not been added yet."}</span>
                </span>
                <span className="lead-review-project-card-stats">
                  <span><strong>{project.reviews.length}</strong> pull requests</span>
                  <span><strong>{project.members.length}</strong> team members</span>
                  <span><strong>{project.reviews.filter((review) => review.status === "Review").length}</strong> awaiting review</span>
                </span>
                <span className="lead-review-project-contributors">
                  {project.members.slice(0, 4).map((member) => (
                    <span
                      className="lead-review-project-avatar"
                      key={member.email || member.name}
                      title={member.name}
                    >
                      {member.initials || getEmployeeInitials(member.name)}
                    </span>
                  ))}
                  <span className="lead-review-open-label">View project details <i className="fa-solid fa-arrow-right" aria-hidden="true" /></span>
                </span>
              </button>
            ))}
          </div>
        </section>
      );
      break;
    case "bugs":
      content = (
        <>
          <DataTable
            title="Reported bugs"
            columns={[
              {
                key: "id",
                label: "Bug ID",
                render: (bug) => (
                  <span className="lead-bug-id-cell">
                    {isUnresolvedBug(bug) && (
                      <span
                        className="lead-bug-pending-dot"
                        role="img"
                        aria-label="Unfixed bug"
                        title="This bug is not fixed"
                      />
                    )}
                    {bug.id}
                  </span>
                ),
              },
              {
                key: "title",
                label: "Issue",
                render: (bug) => (
                  <button
                    className="lead-bug-table-link"
                    type="button"
                    onClick={() => setSelectedBug(bug)}
                    aria-label={`View details for ${bug.id}: ${bug.title}`}
                  >
                    {bug.title}
                  </button>
                ),
              },
              { key: "project", label: "Project" },
              { key: "priority", label: "Priority" },
              { key: "status", label: "Status" },
            ]}
            rows={bugs}
          />
          <Modal
            show={Boolean(selectedBug)}
            title={selectedBug ? `${selectedBug.id} — ${selectedBug.title}` : "Bug details"}
            onClose={() => setSelectedBug(null)}
            showSave={false}
          >
            {selectedBug && (
              <div className="lead-bug-details">
                <p>{selectedBug.description}</p>
                <dl>
                  <div><dt>Project</dt><dd>{selectedBug.project}</dd></div>
                  <div><dt>Priority</dt><dd><StatusBadge>{selectedBug.priority}</StatusBadge></dd></div>
                  <div><dt>Status</dt><dd><StatusBadge>{selectedBug.status}</StatusBadge></dd></div>
                  <div>
                    <dt>Resolution</dt>
                    <dd>{isUnresolvedBug(selectedBug) ? "Not fixed yet" : "Resolved"}</dd>
                  </div>
                </dl>
              </div>
            )}
          </Modal>
        </>
      );
      break;
    case "performance":
      content = <PerformancePanel />;
      break;
    case "sprint":
      content = (
        <>
          {sprintProjectStorage.error && (
            <section className="workspace-panel workspace-panel-wide">
              <p className="lead-task-message lead-task-error" role="alert">
                Projects could not be loaded: {sprintProjectStorage.error}
              </p>
            </section>
          )}
          {projectNotice && (
            <section className="workspace-panel workspace-panel-wide">
              <p className="lead-task-message" role="status">{projectNotice}</p>
            </section>
          )}
          {projectFormOpen && (
            <section className="workspace-panel workspace-panel-wide">
              <div className="panel-heading"><h2>Add Project</h2><span>Required fields</span></div>
              <form className="lead-task-form" onSubmit={handleProjectSubmit}>
                <label>
                  Project Name
                  <input required value={projectForm.name} onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })} />
                </label>
                <label>
                  Project Status
                  <select value={projectForm.status} onChange={(event) => setProjectForm({ ...projectForm, status: event.target.value })}>
                    {sprintProjectStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
                <label>
                  Start Date
                  <input required type="date" value={projectForm.startDate} onChange={(event) => setProjectForm({ ...projectForm, startDate: event.target.value })} />
                </label>
                <label>
                  End Date
                  <input required type="date" value={projectForm.endDate} onChange={(event) => setProjectForm({ ...projectForm, endDate: event.target.value })} />
                </label>
                <label className="lead-task-description">
                  Project Description
                  <textarea required rows="3" value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} />
                </label>
                <label className="lead-task-description">
                  Project Goals
                  <textarea required rows="3" value={projectForm.goals} onChange={(event) => setProjectForm({ ...projectForm, goals: event.target.value })} />
                </label>
                <label className="lead-task-description">
                  Project Requirements
                  <textarea required rows="3" value={projectForm.requirements} onChange={(event) => setProjectForm({ ...projectForm, requirements: event.target.value })} />
                </label>
                <fieldset className="lead-task-description lead-team-picker">
                  <legend>Team Members</legend>
                  <div className="lead-team-picker-header">
                    <p>Select developers to add to this project team.</p>
                    <span className="lead-team-count">{projectForm.teamMembers.length} selected</span>
                  </div>
                  <div className="lead-team-picker-tools">
                    <label className="lead-team-search">
                      <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                      <input
                        type="search"
                        aria-label="Search team members"
                        placeholder="Search by name, role, or email"
                        value={teamMemberSearch}
                        onChange={(event) => setTeamMemberSearch(event.target.value)}
                      />
                    </label>
                    {projectForm.teamMembers.length > 0 && (
                      <button
                        className="lead-team-clear"
                        type="button"
                        onClick={() => setProjectForm({ ...projectForm, teamMembers: [] })}
                      >
                        Clear selection
                      </button>
                    )}
                  </div>
                  {projectMemberOptions.length > 0 ? (
                    <div className="lead-team-grid">
                      {projectMemberOptions.map((employee) => {
                        const selected = projectForm.teamMembers.includes(employee.email);
                        return (
                          <label
                            className={`lead-team-option${selected ? " selected" : ""}`}
                            key={employee.email}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(event) => setProjectForm((current) => ({
                                ...current,
                                teamMembers: event.target.checked
                                  ? [...current.teamMembers, employee.email]
                                  : current.teamMembers.filter((email) => email !== employee.email),
                              }))}
                            />
                            <span className="lead-team-avatar">
                              {employee.initials || getEmployeeInitials(employee.name)}
                            </span>
                            <span className="lead-team-copy">
                              <strong>{employee.name}</strong>
                              <small>{employee.designation}</small>
                              <small>{employee.email}</small>
                            </span>
                            <span className="lead-team-check" aria-hidden="true">
                              {selected && <i className="fa-solid fa-check" />}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="lead-team-empty">
                      {developmentEmployees.some((employee) => employee.email)
                        ? "No team members match your search."
                        : "No Development team members with email addresses are available."}
                    </p>
                  )}
                  {projectForm.teamMembers.length === 0 && (
                    <small className="lead-team-hint">Choose at least one team member.</small>
                  )}
                </fieldset>
                <div className="lead-task-submit">
                  {projectFormError && <p className="lead-task-message lead-task-error" role="alert">{projectFormError}</p>}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="workspace-action" type="submit">Save Project</button>
                    <button className="btn btn-outline-secondary" type="button" onClick={() => {
                      setProjectFormOpen(false);
                      setProjectFormError("");
                    }}>Cancel</button>
                  </div>
                </div>
              </form>
            </section>
          )}
          {sprintProjects.length === 0 ? (
            <section className="workspace-panel workspace-panel-wide">
              <div className="panel-heading"><h2>Projects</h2></div>
              <p className="panel-note">No projects yet. Select Add Project to create one.</p>
            </section>
          ) : (
            <DataTable
              title="Assigned projects"
              tableClassName="lead-table-projects"
              panelClassName="lead-projects-table-panel"
              countLabel="projects"
              columns={[
                {
                  key: "name",
                  label: "Project",
                  render: (project) => (
                    <div className="lead-project-name-cell">
                      <button
                        className="btn btn-link p-0 text-start text-decoration-none fw-semibold"
                        type="button"
                        style={{
                          display: "block",
                          width: "100%",
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                          lineHeight: 1.4,
                        }}
                        title={`View details for ${getLeadSprintProjectName(project)}`}
                        onClick={() => {
                          setSelectedSprintProjectId(project.id);
                          setProjectNotice("");
                        }}
                      >
                        <strong>{getLeadSprintProjectName(project)}</strong>
                        <small className="d-block fw-normal">View details</small>
                      </button>
                    </div>
                  ),
                },
                {
                  key: "description",
                  label: "Description",
                  render: (project) => (
                    <span className="lead-project-description-cell" title={project.description}>
                      {project.description}
                    </span>
                  ),
                },
                { key: "startDate", label: "Start date" },
                { key: "endDate", label: "End date" },
                { key: "status", label: "Status" },
                {
                  key: "team",
                  label: "Team members",
                  render: (project) => (
                    <div className="lead-project-team-cell">
                      {(project.teamMembers || []).map((email) => {
                        const member = developmentEmployees.find(
                          (employee) => employee.email === email
                        );
                        const name = member?.name || email;
                        return (
                          <span className="lead-project-team-chip" key={email} title={name}>
                            <span>{member?.initials || getEmployeeInitials(name)}</span>
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  ),
                },
              ]}
              rows={sprintProjects}
            />
          )}
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

  const selectedSprintProject = sprintProjects.find(
    (project) => project.id === selectedSprintProjectId
  );
  if (page === "sprint" && selectedSprintProject) {
    return (
      <ProjectSprintPlanningView
        project={selectedSprintProject}
        employees={developmentEmployees}
        onBack={() => {
          setSelectedSprintProjectId("");
          setProjectNotice("");
        }}
        onSaveProject={(changes) =>
          saveSprintProjectChanges(selectedSprintProject.id, changes)
        }
      />
    );
  }

  return (
    <PageSurface
      {...details}
      stats={stats}
      actionLabel={page === "sprint" && !projectFormOpen ? "Add Project" : undefined}
      onAction={() => {
        setProjectForm(emptySprintProjectForm);
        setProjectFormError("");
        setProjectNotice("");
        setTeamMemberSearch("");
        setProjectFormOpen(true);
      }}
      className="technical-lead-page"
    >
      {content}
    </PageSurface>
  );
}

export default TechnicalLeadPage;