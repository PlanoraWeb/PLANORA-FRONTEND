export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #5e6ad2, #7b9cff)",
  "linear-gradient(135deg, #4d8cff, #79acff)",
  "linear-gradient(135deg, #37c77f, #5dd49a)",
  "linear-gradient(135deg, #f5b83d, #d9a22b)",
  "linear-gradient(135deg, #ff6b6b, #e68484)",
  "linear-gradient(135deg, #79829a, #9aa3bc)",
];

const PROJECT_SELECTION_KEY = "planora:selected-project-id";

export const TASK_LANES = [
  {
    key: "todo",
    label: "Todo",
    aliases: ["TODO", "TO_DO", "OPEN", "BACKLOG"],
  },
  {
    key: "in_progress",
    label: "In Progress",
    aliases: ["IN_PROGRESS", "DOING", "ACTIVE", "WORKING"],
  },
  {
    key: "review",
    label: "Review",
    aliases: ["REVIEW", "TEST", "QA"],
  },
  {
    key: "done",
    label: "Done",
    aliases: ["DONE", "COMPLETED", "FINISHED", "CLOSED"],
  },
];

function normalizeStatusName(value = "") {
  return String(value).trim().replace(/\s+/g, "_").toUpperCase();
}

export function getTaskLane(statusName = "") {
  const normalized = normalizeStatusName(statusName);
  return (
    TASK_LANES.find((lane) => lane.aliases.includes(normalized))?.key || "todo"
  );
}

export function getLaneLabel(laneKey) {
  return TASK_LANES.find((lane) => lane.key === laneKey)?.label || "Todo";
}

export function findStatusIdForLane(statuses = [], laneKey) {
  const lane = TASK_LANES.find((item) => item.key === laneKey);
  if (!lane) return null;

  const directMatch = statuses.find((status) => {
    const candidates = [status.code, status.name];
    return candidates.some((candidate) =>
      lane.aliases.includes(normalizeStatusName(candidate))
    );
  });

  if (directMatch) return directMatch.id;

  const looseMatch = statuses.find((status) => {
    const normalized = normalizeStatusName(status.code || status.name);
    return lane.aliases.some((alias) => normalized.includes(alias));
  });

  return looseMatch?.id || null;
}

export function getRememberedProjectId() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(PROJECT_SELECTION_KEY) || "";
}

export function rememberProjectId(projectId) {
  if (typeof window === "undefined") return;

  if (!projectId) {
    localStorage.removeItem(PROJECT_SELECTION_KEY);
    return;
  }

  localStorage.setItem(PROJECT_SELECTION_KEY, projectId);
}

export function resolveProjectSelection(projects = [], requestedProjectId = "") {
  const validProjectIds = new Set(projects.map((project) => project.id));
  const rememberedProjectId = getRememberedProjectId();

  if (requestedProjectId && validProjectIds.has(requestedProjectId)) {
    return requestedProjectId;
  }

  if (rememberedProjectId && validProjectIds.has(rememberedProjectId)) {
    return rememberedProjectId;
  }

  return projects[0]?.id || "";
}

export function getTaskStatusId(task) {
  return task?.statusId || task?.status?.id || "";
}

function getTaskOrderValue(task) {
  return Number.isFinite(task?.order) ? task.order : 0;
}

function getTaskCreatedAtValue(task) {
  const timestamp = new Date(task?.createdAt || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function sortTasksByDisplayOrder(tasks = []) {
  return [...tasks].sort((left, right) => {
    const orderDifference = getTaskOrderValue(left) - getTaskOrderValue(right);
    if (orderDifference !== 0) return orderDifference;

    const createdAtDifference =
      getTaskCreatedAtValue(left) - getTaskCreatedAtValue(right);
    if (createdAtDifference !== 0) return createdAtDifference;

    return String(left?.id || "").localeCompare(String(right?.id || ""));
  });
}

export function applyTaskDrag(tasks = [], draggableId, source, destination, statuses = []) {
  const draggedTask = tasks.find((task) => task.id === draggableId);
  if (!draggedTask) return tasks;

  const statusLookup = new Map(statuses.map((status) => [status.id, status]));
  const sourceStatusId = source.droppableId;
  const destinationStatusId = destination.droppableId;

  const sourceColumnTasks = sortTasksByDisplayOrder(
    tasks.filter(
      (task) => getTaskStatusId(task) === sourceStatusId && task.id !== draggableId
    )
  );

  const destinationColumnTasks =
    sourceStatusId === destinationStatusId
      ? sourceColumnTasks
      : sortTasksByDisplayOrder(
          tasks.filter(
            (task) =>
              getTaskStatusId(task) === destinationStatusId &&
              task.id !== draggableId
          )
        );

  const nextDraggedTask = {
    ...draggedTask,
    statusId: destinationStatusId,
    status: {
      ...(draggedTask.status || {}),
      ...(statusLookup.get(destinationStatusId)
        ? {
            id: statusLookup.get(destinationStatusId).id,
            name: statusLookup.get(destinationStatusId).name,
          }
        : {}),
    },
  };

  const nextDestinationTasks = [...destinationColumnTasks];
  const insertionIndex = Math.max(
    0,
    Math.min(destination.index, nextDestinationTasks.length)
  );
  nextDestinationTasks.splice(insertionIndex, 0, nextDraggedTask);

  const orderMap = new Map();

  nextDestinationTasks.forEach((task, index) => {
    orderMap.set(task.id, {
      statusId: destinationStatusId,
      order: index,
      status:
        task.id === draggableId
          ? nextDraggedTask.status
          : task.status,
    });
  });

  if (sourceStatusId !== destinationStatusId) {
    sourceColumnTasks.forEach((task, index) => {
      orderMap.set(task.id, {
        statusId: sourceStatusId,
        order: index,
        status: {
          ...(task.status || {}),
          ...(statusLookup.get(sourceStatusId)
            ? {
                id: statusLookup.get(sourceStatusId).id,
                name: statusLookup.get(sourceStatusId).name,
              }
            : {}),
        },
      });
    });
  }

  return tasks.map((task) =>
    orderMap.has(task.id) ? { ...task, ...orderMap.get(task.id) } : task
  );
}

export function getInitials(firstName = "", lastName = "") {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "PL";
}

export function formatRelativeTime(value) {
  if (!value) return "";

  const target = new Date(value);
  const delta = target.getTime() - Date.now();
  const minutes = Math.round(delta / 60000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");

  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return rtf.format(days, "day");

  const weeks = Math.round(days / 7);
  if (Math.abs(weeks) < 5) return rtf.format(weeks, "week");

  return target.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(value) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatIssueKey(value = "") {
  return value ? value.slice(0, 8).toUpperCase() : "TASK";
}
