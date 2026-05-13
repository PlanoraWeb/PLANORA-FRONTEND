import { useEffect, useState } from "react";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import AppLayout from "../layouts/AppLayout";
import { Link, useParams } from "react-router-dom";
import { getTaskById, updateTask } from "../services/taskService";
import { getProjectById } from "../services/projectService";

const getPriorityClass = (priority) => {
  switch (priority) {
    case "LOW":
      return "priority-low";
    case "MEDIUM":
      return "priority-medium";
    case "HIGH":
      return "priority-high";
    case "URGENT":
      return "priority-urgent";
    default:
      return "priority-medium";
  }
};

function formatDateInput(date) {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

export default function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await getTaskById(id);
        const taskData = res.data?.data;
        setTask(taskData);

        if (taskData?.project?.id) {
          const projectRes = await getProjectById(taskData.project.id);
          setProject(projectRes.data?.data);
        }

        setForm({
          title: taskData?.title || "",
          description: taskData?.description || "",
          priority: taskData?.priority || "MEDIUM",
          type: taskData?.type || "TASK",
          statusId: taskData?.statusId || taskData?.status?.id || "",
          assigneeId: taskData?.assignee?.id || "",
          dueDate: formatDateInput(taskData?.dueDate),
        });
      } catch (err) {
        console.error("Failed to fetch task", err);
        setMessage("Task details could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTask();
  }, [id]);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setMessage("");
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        type: form.type,
        statusId: form.statusId,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      };
      const res = await updateTask(id, payload);
      const updatedTask = res.data?.data;
      setTask((current) => ({
        ...current,
        ...updatedTask,
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        type: payload.type,
        dueDate: payload.dueDate,
        statusId: payload.statusId,
      }));
      setMessage("Task updated successfully.");
    } catch (err) {
      console.error("Failed to update task", err);
      setMessage(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Task could not be updated."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <AppLayout>
        <div className="app-content">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">{task?.title}</h1>
          <p className="page-subtitle">Task detail and execution settings.</p>
        </div>
      </div>

      {message && (
        <div className="card" style={{ marginBottom: "var(--space-4)" }}>
          <div className="card-body">{message}</div>
        </div>
      )}

      <div className="task-detail-layout">
        <div className="task-detail-main">
          <div className="card">
            <div className="card-header">
              <h3>Task content</h3>
            </div>
            <div className="card-body" style={{ display: "grid", gap: "var(--space-4)" }}>
              <div className="service-field">
                <label htmlFor="task-title">Title</label>
                <input
                  id="task-title"
                  className="input"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </div>

              <div className="service-field">
                <label htmlFor="task-description">Description</label>
                <textarea
                  id="task-description"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="service-field">
                  <label htmlFor="task-type">Type</label>
                  <select
                    id="task-type"
                    value={form.type}
                    onChange={(event) => updateField("type", event.target.value)}
                  >
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                    <option value="STORY">Story</option>
                  </select>
                </div>

                <div className="service-field">
                  <label htmlFor="task-priority">Priority</label>
                  <select
                    id="task-priority"
                    value={form.priority}
                    onChange={(event) => updateField("priority", event.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="service-field">
                  <label htmlFor="task-status">Status</label>
                  <select
                    id="task-status"
                    value={form.statusId}
                    onChange={(event) => updateField("statusId", event.target.value)}
                  >
                    {(project?.statuses || []).map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="service-field">
                  <label htmlFor="task-assignee">Assignee</label>
                  <select
                    id="task-assignee"
                    value={form.assigneeId}
                    onChange={(event) => updateField("assigneeId", event.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {(project?.members || []).map((member) => (
                      <option
                        key={member.user?.id || member.userId}
                        value={member.user?.id || member.userId}
                      >
                        {member.user?.firstName} {member.user?.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="service-field">
                <label htmlFor="task-due-date">Due date</label>
                <input
                  id="task-due-date"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => updateField("dueDate", event.target.value)}
                />
              </div>

              <div className="service-actions">
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save task"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="task-detail-sidebar">
          <div className="card" style={{ marginBottom: "var(--space-4)" }}>
            <div className="card-header">
              <h3>Meta</h3>
            </div>
            <div className="card-body" style={{ display: "grid", gap: 12 }}>
              <MetaRow label="Task ID" value={task?.id} />
              <MetaRow
                label="Project"
                value={
                  <Link to={`/project-detail?projectId=${task?.project?.id}`}>
                    {task?.project?.projectName || "-"}
                  </Link>
                }
              />
              <MetaRow
                label="Status"
                value={<span className="badge badge-primary">{task?.status?.name || "-"}</span>}
              />
              <MetaRow label="Created" value={new Date(task?.createdAt).toLocaleString()} />
              <MetaRow label="Updated" value={new Date(task?.updatedAt).toLocaleString()} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Execution snapshot</h3>
            </div>
            <div className="card-body" style={{ display: "grid", gap: 12 }}>
              <div className={`badge ${getPriorityClass(form.priority)}`}>{form.priority}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                {form.assigneeId ? "Assigned and ready for execution." : "Waiting for assignment."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function MetaRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <strong style={{ textAlign: "right", wordBreak: "break-word" }}>{value}</strong>
    </div>
  );
}
