import { useState, useEffect, useCallback } from "react";
import AppLayout from "../layouts/AppLayout";
import "../styles/Board.css";
import "../styles/Component.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  FiPlus,
  FiCalendar,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiLayout,
} from "react-icons/fi";
import { getProjects } from "../services/projectService";
import {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  changeTaskStatus,
  getStatusesByProject,
} from "../services/taskService";

/* ── Avatar Colors ────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "linear-gradient(135deg, #6c5ce7, #a29bfe)",
  "linear-gradient(135deg, #00b894, #00cec9)",
  "linear-gradient(135deg, #fd79a8, #e84393)",
  "linear-gradient(135deg, #fdcb6e, #e17055)",
  "linear-gradient(135deg, #0984e3, #74b9ff)",
];

const COL_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

/* ── Helpers ──────────────────────────────────────────────────── */
function getInitials(first = "", last = "") {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function formatDueDate(d) {
  if (!d) return null;
  const date = new Date(d);
  const now = new Date();
  const isOverdue = date < now;
  return {
    text: date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
    isOverdue,
  };
}

/* ================================================================
   BOARD PAGE
   ================================================================ */
function Board() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalStatus, setCreateModalStatus] = useState(null); // statusId or null
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  /* ── Load projects ──────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await getProjects();
        const list = res.data?.data ?? [];
        setProjects(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, taskRes] = await Promise.all([
        getStatusesByProject(selectedProjectId),
        getTasksByProject(selectedProjectId),
      ]);
      setStatuses(statusRes.data?.data ?? []);
      setTasks(taskRes.data?.data ?? []);
    } catch (err) {
      console.error("Failed to load board", err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  /* ── Load board data when project changes ───────────────────── */
  useEffect(() => {
    if (!selectedProjectId) return;
    loadBoard();
  }, [selectedProjectId, loadBoard]);

  /* ── Drag & Drop ────────────────────────────────────────────── */
  async function onDragEnd(result) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Optimistic UI update
    const draggedTask = tasks.find((t) => t.id === draggableId);
    if (!draggedTask) return;

    const newTasks = tasks.map((t) =>
      t.id === draggableId
        ? { ...t, statusId: destination.droppableId, status: statuses.find((s) => s.id === destination.droppableId) || t.status }
        : t
    );
    setTasks(newTasks);

    // API call
    try {
      await changeTaskStatus(draggableId, destination.droppableId, destination.index);
    } catch (err) {
      console.error("Failed to change status", err);
      loadBoard(); // rollback
    }
  }

  /* ── Create Task ────────────────────────────────────────────── */
  async function handleCreateTask(data) {
    try {
      await createTask(selectedProjectId, data);
      setCreateModalStatus(null);
      loadBoard();
    } catch (err) {
      console.error("Failed to create task", err);
    }
  }

  /* ── Update Task ────────────────────────────────────────────── */
  async function handleUpdateTask(id, data) {
    try {
      await updateTask(id, data);
      setEditingTask(null);
      loadBoard();
    } catch (err) {
      console.error("Failed to update task", err);
    }
  }

  /* ── Delete Task ────────────────────────────────────────────── */
  async function handleDeleteTask(id) {
    try {
      await deleteTask(id);
      setDeletingTask(null);
      loadBoard();
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  }

  /* ── Group tasks by status ──────────────────────────────────── */
  function getTasksForStatus(statusId) {
    return tasks.filter((t) => t.statusId === statusId);
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="board-header">
        <div className="board-header-left">
          <h1>Board</h1>
          <p>
            {selectedProject
              ? `Kanban board for ${selectedProject.projectName}`
              : "Select a project to view its board."}
          </p>
        </div>
        <div className="board-project-selector">
          <select
            className="board-project-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            id="board-project-selector"
          >
            {projects.length === 0 && (
              <option value="">No projects available</option>
            )}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <BoardLoading />
      ) : !selectedProjectId ? (
        <BoardEmpty type="noProject" />
      ) : statuses.length === 0 ? (
        <BoardEmpty type="noStatuses" />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-container">
            {statuses.map((status, idx) => {
              const columnTasks = getTasksForStatus(status.id);
              return (
                <KanbanColumn
                  key={status.id}
                  status={status}
                  tasks={columnTasks}
                  colorIndex={idx}
                  onAddTask={() => setCreateModalStatus(status.id)}
                  onEditTask={(task) => setEditingTask(task)}
                  onDeleteTask={(task) => setDeletingTask(task)}
                />
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Create Task Modal */}
      {createModalStatus && (
        <CreateTaskModal
          statusId={createModalStatus}
          members={selectedProject?.members ?? []}
          onClose={() => setCreateModalStatus(null)}
          onCreate={handleCreateTask}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          statuses={statuses}
          members={selectedProject?.members ?? []}
          onClose={() => setEditingTask(null)}
          onSave={handleUpdateTask}
        />
      )}

      {/* Delete Task Confirm */}
      {deletingTask && (
        <DeleteTaskConfirm
          task={deletingTask}
          onCancel={() => setDeletingTask(null)}
          onConfirm={() => handleDeleteTask(deletingTask.id)}
        />
      )}
    </AppLayout>
  );
}

/* ================================================================
   KANBAN COLUMN
   ================================================================ */
function KanbanColumn({ status, tasks, colorIndex, onAddTask, onEditTask, onDeleteTask }) {
  const color = COL_COLORS[colorIndex % COL_COLORS.length];

  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <div className="kanban-column-title">
          <span className="kanban-column-dot" style={{ background: color }} />
          {status.name}
          <span className="kanban-column-count">{tasks.length}</span>
        </div>
        <button className="kanban-column-add" onClick={onAddTask} title="Add task">
          <FiPlus size={16} />
        </button>
      </div>

      <Droppable droppableId={status.id}>
        {(provided, snapshot) => (
          <div
            className="kanban-column-body"
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              background: snapshot.isDraggingOver
                ? `${color}08`
                : "transparent",
            }}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`task-card ${snapshot.isDragging ? "is-dragging" : ""}`}
                    onClick={() => onEditTask(task)}
                  >
                    <TaskCardContent task={task} onDelete={onDeleteTask} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {tasks.length === 0 && (
              <button className="kanban-add-task" onClick={onAddTask}>
                <FiPlus size={14} /> Add a task
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

/* ================================================================
   TASK CARD CONTENT
   ================================================================ */
function TaskCardContent({ task, onDelete }) {
  const due = formatDueDate(task.dueDate);

  return (
    <>
      <div className="task-card-header">
        <div className="task-card-badges">
          <span className={`task-type-badge ${task.type}`}>{task.type}</span>
          <span className={`task-priority-badge ${task.priority}`}>
            {task.priority}
          </span>
        </div>
        <button
          className="task-card-menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task);
          }}
          title="Delete task"
        >
          <FiTrash2 size={13} />
        </button>
      </div>
      <div className="task-card-title">{task.title}</div>
      <div className="task-card-footer">
        {due ? (
          <span className={`task-card-due ${due.isOverdue ? "overdue" : ""}`}>
            <FiCalendar size={11} />
            {due.text}
          </span>
        ) : (
          <span />
        )}
        {task.assignee ? (
          <div
            className="task-card-assignee"
            style={{
              background:
                AVATAR_COLORS[
                  Math.abs(hashStr(task.assignee.id)) % AVATAR_COLORS.length
                ],
            }}
            title={`${task.assignee.firstName} ${task.assignee.lastName}`}
          >
            {getInitials(task.assignee.firstName, task.assignee.lastName)}
          </div>
        ) : (
          <div className="task-card-assignee unassigned" title="Unassigned">?</div>
        )}
      </div>
    </>
  );
}

/* ================================================================
   CREATE TASK MODAL
   ================================================================ */
function CreateTaskModal({ statusId, members, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [type, setType] = useState("TASK");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      type,
      statusId,
      assigneeId: assigneeId || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });
    setSubmitting(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">Create New Task</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="create-task-form">
              {/* Title */}
              <div className="input-group">
                <label className="input-label" htmlFor="task-title">Title *</label>
                <input
                  className="input"
                  id="task-title"
                  type="text"
                  placeholder="e.g. Fix login button alignment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {/* Description */}
              <div className="input-group">
                <label className="input-label" htmlFor="task-desc">Description</label>
                <textarea
                  id="task-desc"
                  placeholder="Add a brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Priority & Type */}
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                    <option value="STORY">Story</option>
                  </select>
                </div>
              </div>

              {/* Assignee & Due Date */}
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Assignee</label>
                  <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user?.id || m.id} value={m.user?.id || m.userId}>
                        {m.user?.firstName} {m.user?.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Due Date</label>
                  <input
                    className="input"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim() || submitting}
              id="submit-create-task"
            >
              {submitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================================================================
   EDIT TASK MODAL
   ================================================================ */
function EditTaskModal({ task, statuses, members, onClose, onSave }) {
  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "MEDIUM");
  const [type, setType] = useState(task.type || "TASK");
  const [statusId, setStatusId] = useState(task.statusId || "");
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || "");
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await onSave(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      type,
      statusId,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
    setSubmitting(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">Edit Task</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="create-task-form">
              <div className="input-group">
                <label className="input-label" htmlFor="edit-task-title">Title *</label>
                <input
                  className="input"
                  id="edit-task-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="edit-task-desc">Description</label>
                <textarea
                  id="edit-task-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                    <option value="STORY">Story</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Status</label>
                  <select value={statusId} onChange={(e) => setStatusId(e.target.value)}>
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Assignee</label>
                  <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user?.id || m.id} value={m.user?.id || m.userId}>
                        {m.user?.firstName} {m.user?.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Due Date</label>
                <input
                  className="input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim() || submitting}
              id="submit-edit-task"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================================================================
   DELETE TASK CONFIRM
   ================================================================ */
function DeleteTaskConfirm({ task, onCancel, onConfirm }) {
  return (
    <div className="delete-confirm-overlay" onClick={onCancel}>
      <div className="delete-confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Delete Task</h3>
        <p>
          Are you sure you want to delete <strong>{task.title}</strong>? This action
          cannot be undone.
        </p>
        <div className="delete-confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} id="confirm-delete-task">
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   EMPTY STATE
   ================================================================ */
function BoardEmpty({ type }) {
  return (
    <div className="board-empty">
      <div className="board-empty-icon">
        <FiLayout size={32} />
      </div>
      <h3>{type === "noProject" ? "No projects found" : "Board is empty"}</h3>
      <p>
        {type === "noProject"
          ? "Create a project first to start using the Kanban board."
          : "This project has no columns yet. Columns are created automatically when a project is set up."}
      </p>
    </div>
  );
}

/* ================================================================
   LOADING
   ================================================================ */
function BoardLoading() {
  return (
    <div className="board-loading">
      {[1, 2, 3].map((i) => (
        <div key={i} className="board-skeleton-col">
          <div className="skeleton" style={{ width: "60%", height: 16 }} />
          <div className="skeleton" style={{ width: "100%", height: 80 }} />
          <div className="skeleton" style={{ width: "100%", height: 80 }} />
          <div className="skeleton" style={{ width: "100%", height: 60 }} />
        </div>
      ))}
    </div>
  );
}

/* ── Hash helper ──────────────────────────────────────────────── */
function hashStr(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export default Board;
