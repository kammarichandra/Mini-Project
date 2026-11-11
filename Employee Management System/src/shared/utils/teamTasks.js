const teamTasksStorageKey = "teamSyncTeamTasks";

export function getTeamTasks() {
  const savedTasks = window.localStorage.getItem(teamTasksStorageKey);
  if (!savedTasks) return [];

  const storedTasks = JSON.parse(savedTasks);
  if (!Array.isArray(storedTasks)) {
    throw new Error("Saved team tasks are not in a valid format.");
  }

  return storedTasks;
}

export function saveTeamTask(task) {
  const tasks = getTeamTasks();
  const updatedTasks = [{
    ...task,
    id: `TASK-${Date.now()}-${tasks.length + 1}`,
    createdAt: new Date().toISOString(),
  }, ...tasks];
  window.localStorage.setItem(teamTasksStorageKey, JSON.stringify(updatedTasks));
  return updatedTasks;
}

export function updateTeamTaskStatus(taskId, status) {
  const tasks = getTeamTasks();
  const taskExists = tasks.some((task) => task.id === taskId);
  if (!taskExists) {
    throw new Error("This task no longer exists. Refresh the page and try again.");
  }

  const updatedAt = new Date().toISOString();
  const updatedTasks = tasks.map((task) =>
    task.id === taskId
      ? {
        ...task,
        status,
        updatedAt,
        completedAt: status === "Completed" ? updatedAt : "",
      }
      : task
  );
  window.localStorage.setItem(teamTasksStorageKey, JSON.stringify(updatedTasks));
  return updatedTasks;
}
