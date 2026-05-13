import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiArrowUpRight, FiCheckCircle, FiClock } from "react-icons/fi";
import AppLayout from "../layouts/AppLayout";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import "../styles/Tasks.css";
import { getMyTasks } from "../services/taskService";
import {
  AVATAR_GRADIENTS,
  TASK_LANES,
  formatIssueKey,
  formatRelativeTime,
  formatShortDate,
  getInitials,
  getTaskLane,
} from "../utils/workflowUi";

function hashCode(str = "") {
  let hash = 0;
  for (let index = 0; index < str.length; index += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function getPriorityTone(priority) {
  if (priority === "URGENT" || priority === "HIGH") return "risk";
  if (priority === "MEDIUM") return "warning";
  if (priority === "LOW") return "success";
  return "neutral";
}

function getLaneCards(tasks) {
  const empty = TASK_LANES.reduce((accumulator, lane) => {
    accumulator[lane.key] = [];
    return accumulator;
  }, {});

  return tasks.reduce((accumulator, task) => {
    const laneKey = getTaskLane(task.status?.name || task.status?.code || "");
    accumulator[laneKey] = [...(accumulator[laneKey] || []), task];
    return accumulator;
  }, empty);
}

function getDueState(task) {
  if (!task.dueDate) return { label: "No due date", tone: "neutral" };
  const due = new Date(task.dueDate);
  const isOverdue = due < new Date() && task.status?.name !== "DONE";

  return {
    label: formatShortDate(task.dueDate),
    tone: isOverdue ? "risk" : "neutral",
  };
}

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getMyTasks();
        setTasks(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const summary = useMemo(() => {
    const open = tasks.filter((task) => task.status?.name !== "DONE").length;
    const done = tasks.filter((task) => task.status?.name === "DONE").length;
    const highPriority = tasks.filter((task) =>
      ["HIGH", "URGENT"].includes(task.priority)
    ).length;
    const overdue = tasks.filter(
      (task) =>
        task.dueDate &&
        task.status?.name !== "DONE" &&
        new Date(task.dueDate) < new Date()
    ).length;

    return { open, done, highPriority, overdue };
  }, [tasks]);

  const tasksByLane = useMemo(() => getLaneCards(tasks), [tasks]);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">
            A darker task command surface inspired by the shared reference board.
          </p>
        </div>
      </div>

      <div className="tasks-overview-grid">
        <SummaryCard label="Open" value={summary.open} icon={FiClock} />
        <SummaryCard label="Completed" value={summary.done} icon={FiCheckCircle} />
        <SummaryCard
          label="High priority"
          value={summary.highPriority}
          icon={FiAlertCircle}
        />
        <SummaryCard label="Overdue" value={summary.overdue} icon={FiArrowUpRight} />
      </div>

      <section className="tasks-canvas">
        <div className="tasks-canvas-header">
          <div>
            <h3>Assigned to me</h3>
            <p>
              Grouped by delivery lane so current work reads closer to a live issue
              board.
            </p>
          </div>
          <span>{tasks.length} issues</span>
        </div>

        {loading ? (
          <div className="dashboard-empty-panel">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="dashboard-empty-panel">No tasks assigned to you.</div>
        ) : (
          <div className="tasks-lane-grid">
            {TASK_LANES.map((lane) => (
              <TaskLaneColumn
                key={lane.key}
                lane={lane}
                tasks={tasksByLane[lane.key] || []}
              />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="tasks-overview-card">
      <div className="tasks-overview-icon">
        <Icon size={16} />
      </div>
      <div className="tasks-overview-value">{value}</div>
      <div className="tasks-overview-label">{label}</div>
    </div>
  );
}

function TaskLaneColumn({ lane, tasks }) {
  return (
    <div className="tasks-lane-column">
      <div className="tasks-lane-header">
        <div>
          <strong>{lane.label}</strong>
          <span>{tasks.length} issues</span>
        </div>
        <div className="tasks-lane-count">{tasks.length}</div>
      </div>

      <div className="tasks-lane-body">
        {tasks.length === 0 ? (
          <div className="tasks-lane-empty">No issues in this lane.</div>
        ) : (
          tasks.map((task) => <TaskBoardCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}

function TaskBoardCard({ task }) {
  const dueState = getDueState(task);

  return (
    <Link to={`/task-details/${task.id}`} className="tasks-board-card">
      <div className="tasks-board-card-top">
        <span className="tasks-board-key">{formatIssueKey(task.id)}</span>
        <span className="tasks-board-state">
          {task.status?.name || "Queued"}
        </span>
      </div>

      <h3>{task.title}</h3>

      <div className="tasks-board-tags">
        <span className="tasks-board-tag">{task.project?.projectName || "Workspace"}</span>
        <span className="tasks-board-tag subtle">{task.type || "Task"}</span>
        <span className={`tasks-board-tag ${getPriorityTone(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      <div className="tasks-board-footer">
        <div className={`tasks-board-due ${dueState.tone}`}>
          <FiClock size={12} />
          {dueState.label}
        </div>

        <div className="tasks-board-assignee-group">
          {task.assignee ? (
            <div
              className="tasks-board-assignee"
              style={{
                background:
                  AVATAR_GRADIENTS[
                    Math.abs(hashCode(task.assignee.id)) % AVATAR_GRADIENTS.length
                  ],
              }}
              title={`${task.assignee.firstName} ${task.assignee.lastName}`}
            >
              {getInitials(task.assignee.firstName, task.assignee.lastName)}
            </div>
          ) : (
            <div className="tasks-board-assignee is-empty">?</div>
          )}
          <small>{formatRelativeTime(task.updatedAt || task.createdAt)}</small>
        </div>
      </div>
    </Link>
  );
}
