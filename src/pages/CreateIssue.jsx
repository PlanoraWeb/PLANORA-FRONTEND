import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiPlus } from "react-icons/fi";
import AppLayout from "../layouts/AppLayout";
import { getProjects } from "../services/projectService";
import { createTask, getStatusesByProject } from "../services/taskService";
import "../styles/PageForms.css";
import { useSearchParams } from "react-router-dom";

const initialForm = {
  projectId: "",
  statusId: "",
  title: "",
  description: "",
  priority: "MEDIUM",
  type: "TASK",
  assigneeId: "",
  dueDate: "",
};

function getErrorMessage(error, fallback) {
  return (
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    fallback
  );
}

function CreateIssue() {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (!form.projectId) {
      setStatuses([]);
      return;
    }

    loadStatuses(form.projectId);
  }, [form.projectId]);

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await getProjects();
      const list = res.data?.data ?? [];
      const requestedProjectId = searchParams.get("projectId");
      setProjects(list);
      setForm((current) => ({
        ...current,
        projectId:
          current.projectId ||
          (requestedProjectId &&
          list.some((project) => project.id === requestedProjectId)
            ? requestedProjectId
            : list[0]?.id || ""),
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Projects could not be loaded."),
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadStatuses(projectId) {
    setStatusLoading(true);
    try {
      const res = await getStatusesByProject(projectId);
      const list = res.data?.data ?? [];
      setStatuses(list);
      setForm((current) => ({
        ...current,
        statusId: list.some((status) => status.id === current.statusId)
          ? current.statusId
          : list[0]?.id || "",
      }));
    } catch (error) {
      setStatuses([]);
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Task statuses could not be loaded."),
      });
    } finally {
      setStatusLoading(false);
    }
  }

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setMessage(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.projectId || !form.statusId || !form.title.trim()) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority,
      type: form.type,
      statusId: form.statusId,
      assigneeId: form.assigneeId || undefined,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
    };

    setSubmitting(true);
    try {
      await createTask(form.projectId, payload);
      setMessage({ type: "success", text: "Issue created successfully." });
      setForm((current) => ({
        ...initialForm,
        projectId: current.projectId,
        statusId: current.statusId,
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Issue could not be created."),
      });
    } finally {
      setSubmitting(false);
    }
  }

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === form.projectId),
    [projects, form.projectId]
  );

  const members = selectedProject?.members ?? [];
  const canSubmit =
    Boolean(form.projectId) &&
    Boolean(form.statusId) &&
    Boolean(form.title.trim()) &&
    !submitting;

  return (
    <AppLayout>
      <div className="service-page-header">
        <div>
          <h1>Create Issue</h1>
          <p>Create a task in the selected project and status column.</p>
        </div>
      </div>

      {message && (
        <div className={`service-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="service-grid">
        <section className="service-panel">
          <div className="service-panel-header">
            <div>
              <h2>Issue details</h2>
              <p>Required fields are marked with an asterisk.</p>
            </div>
          </div>

          {loading ? (
            <div className="service-empty">Loading projects...</div>
          ) : (
            <form className="service-form" onSubmit={handleSubmit}>
              <div className="service-form-grid">
                <div className="service-field">
                  <label htmlFor="issue-project">Project *</label>
                  <select
                    id="issue-project"
                    value={form.projectId}
                    onChange={(event) => updateField("projectId", event.target.value)}
                    required
                  >
                    {projects.length === 0 && (
                      <option value="">No projects available</option>
                    )}
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="service-field">
                  <label htmlFor="issue-status">Status *</label>
                  <select
                    id="issue-status"
                    value={form.statusId}
                    onChange={(event) => updateField("statusId", event.target.value)}
                    disabled={!form.projectId || statusLoading}
                    required
                  >
                    {statuses.length === 0 && (
                      <option value="">
                        {statusLoading ? "Loading statuses..." : "No statuses available"}
                      </option>
                    )}
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="service-field">
                <label htmlFor="issue-title">Title *</label>
                <input
                  id="issue-title"
                  type="text"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="e.g. Connect settings page to user service"
                  required
                />
              </div>

              <div className="service-field">
                <label htmlFor="issue-description">Description</label>
                <textarea
                  id="issue-description"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Add acceptance criteria or implementation notes..."
                />
              </div>

              <div className="service-form-grid">
                <div className="service-field">
                  <label htmlFor="issue-priority">Priority</label>
                  <select
                    id="issue-priority"
                    value={form.priority}
                    onChange={(event) => updateField("priority", event.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div className="service-field">
                  <label htmlFor="issue-type">Type</label>
                  <select
                    id="issue-type"
                    value={form.type}
                    onChange={(event) => updateField("type", event.target.value)}
                  >
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                    <option value="STORY">Story</option>
                  </select>
                </div>
              </div>

              <div className="service-form-grid">
                <div className="service-field">
                  <label htmlFor="issue-assignee">Assignee</label>
                  <select
                    id="issue-assignee"
                    value={form.assigneeId}
                    onChange={(event) => updateField("assigneeId", event.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option
                        key={member.user?.id || member.userId || member.id}
                        value={member.user?.id || member.userId}
                      >
                        {member.user?.firstName} {member.user?.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="service-field">
                  <label htmlFor="issue-due-date">Due date</label>
                  <input
                    id="issue-due-date"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => updateField("dueDate", event.target.value)}
                  />
                </div>
              </div>

              <div className="service-actions">
                <button className="btn btn-primary" type="submit" disabled={!canSubmit}>
                  <FiPlus size={16} />
                  {submitting ? "Creating..." : "Create issue"}
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="service-panel">
          <div className="service-panel-header">
            <div>
              <h2>Selected project</h2>
              <p>Issue will be added through taskService.createTask.</p>
            </div>
          </div>

          {selectedProject ? (
            <div className="service-summary">
              <div className="service-summary-icon">
                <FiCheckCircle size={22} />
              </div>
              <h3>{selectedProject.projectName}</h3>
              <p>{selectedProject.description || "No project description."}</p>
              <div className="service-stat-row">
                <span>Members</span>
                <strong>{selectedProject._count?.members ?? members.length}</strong>
              </div>
              <div className="service-stat-row">
                <span>Available statuses</span>
                <strong>{statuses.length}</strong>
              </div>
            </div>
          ) : (
            <div className="service-empty">Select a project to create an issue.</div>
          )}
        </aside>
      </div>
    </AppLayout>
  );
}

export default CreateIssue;
