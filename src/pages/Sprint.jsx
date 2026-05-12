import React, { useCallback, useEffect, useState } from "react";
import "../styles/App.css";
import AppLayout from "../layouts/AppLayout";
import { getProjects } from "../services/projectService";
import {
  createSprint,
  deleteSprint,
  getActiveSprint,
  getSprintBurndown,
  getSprintVelocity,
  getSprintsByProject,
  updateSprint,
} from "../services/sprintService";
import { useSearchParams } from "react-router-dom";
import {
  getRememberedProjectId,
  rememberProjectId,
  resolveProjectSelection,
} from "../utils/workflowUi";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getErrorMessage(error, fallback) {
  return (
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    fallback
  );
}

export default function Sprints() {
  const [searchParams] = useSearchParams();
  const requestedProjectId = searchParams.get("projectId") || "";
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [sprints, setSprints] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [velocity, setVelocity] = useState(0);
  const [burndown, setBurndown] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    goal: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  useEffect(() => {
    let isCancelled = false;

    (async () => {
      try {
        const res = await getProjects();
        const list = res.data?.data ?? [];
        const rememberedProjectId = getRememberedProjectId();
        const hasPinnedProject = Boolean(requestedProjectId || rememberedProjectId);

        if (isCancelled) return;
        setProjects(list);

        if (list.length === 0) {
          setSelectedProjectId("");
          setLoading(false);
          return;
        }

        let initialProjectId = resolveProjectSelection(list, requestedProjectId);

        if (!hasPinnedProject) {
          const sprintSignals = await Promise.all(
            list.map(async (project) => {
              const sprintRes = await getSprintsByProject(project.id);
              const sprintList = sprintRes.data?.data ?? [];

              return {
                projectId: project.id,
                planningCount: sprintList.filter((sprint) => sprint.status === "PLANNING").length,
                activeCount: sprintList.filter((sprint) => sprint.status === "ACTIVE").length,
                totalCount: sprintList.length,
              };
            })
          );

          initialProjectId =
            sprintSignals.find((project) => project.planningCount > 0)?.projectId ||
            sprintSignals.find((project) => project.activeCount > 0)?.projectId ||
            sprintSignals.find((project) => project.totalCount > 0)?.projectId ||
            initialProjectId;
        }

        if (!isCancelled) {
          setSelectedProjectId(initialProjectId);
          rememberProjectId(initialProjectId);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
        if (!isCancelled) {
          setError("Projects could not be loaded.");
          setLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [requestedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      rememberProjectId(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadSprintData = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    setError("");
    try {
      const [sprintsRes, activeRes, velocityRes] = await Promise.all([
        getSprintsByProject(selectedProjectId),
        getActiveSprint(selectedProjectId),
        getSprintVelocity(selectedProjectId),
      ]);

      const sprintList = sprintsRes.data?.data || [];
      const active = activeRes.data?.data || null;

      setSprints(sprintList);
      setActiveSprint(active);
      setVelocity(velocityRes.data?.data?.avgVelocity || 0);

      if (active?.id) {
        const burndownRes = await getSprintBurndown(active.id);
        setBurndown(burndownRes.data?.data?.burndown || []);
      } else {
        setBurndown([]);
      }
    } catch (err) {
      console.error("Failed to load sprint data", err);
      setError(getErrorMessage(err, "Sprint data could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadSprintData();
  }, [selectedProjectId, loadSprintData]);

  const handleFormChange = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateSprint = async (event) => {
    event.preventDefault();
    if (!selectedProjectId || !form.name.trim()) return;

    setSaving(true);
    setError("");
    try {
      await createSprint(selectedProjectId, {
        name: form.name.trim(),
        goal: form.goal.trim() || undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      });
      setShowCreateForm(false);
      setForm({
        name: "",
        goal: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });
      await loadSprintData();
    } catch (err) {
      console.error("Failed to create sprint", err);
      setError(getErrorMessage(err, "Sprint could not be created."));
    } finally {
      setSaving(false);
    }
  };

  const handleSprintStatus = async (sprintId, status) => {
    setSaving(true);
    setError("");
    try {
      await updateSprint(sprintId, { status });
      await loadSprintData();
    } catch (err) {
      console.error("Failed to update sprint", err);
      setError(getErrorMessage(err, "Sprint status could not be updated."));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSprint = async (sprintId) => {
    setSaving(true);
    setError("");
    try {
      await deleteSprint(sprintId);
      await loadSprintData();
    } catch (err) {
      console.error("Failed to delete sprint", err);
      setError(getErrorMessage(err, "Sprint could not be deleted."));
    } finally {
      setSaving(false);
    }
  };

  const sprintSummary = {
    total: sprints.length,
    active: sprints.filter((sprint) => sprint.status === "ACTIVE").length,
    planning: sprints.filter((sprint) => sprint.status === "PLANNING").length,
    completed: sprints.filter((sprint) => sprint.status === "COMPLETED").length,
  };

  return (
    <AppLayout>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 className="page-title">Sprint Management</h1>
            <p className="page-subtitle">Manage planning, active, and completed sprints.</p>
          </div>
          <select
            className="input"
            style={{ width: 220, marginTop: 0 }}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.length === 0 && <option value="">No projects</option>}
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.projectName}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => setShowCreateForm((current) => !current)}
        >
          {showCreateForm ? "Hide form" : "Create sprint"}
        </button>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: "var(--space-4)" }}>
          <div className="card-body" style={{ color: "var(--error)" }}>
            {error}
          </div>
        </div>
      )}

      <div className="reports-summary-grid" style={{ marginBottom: "var(--space-5)" }}>
        <SummaryCard label="Total sprints" value={sprintSummary.total} />
        <SummaryCard label="Active" value={sprintSummary.active} />
        <SummaryCard label="Planning" value={sprintSummary.planning} />
        <SummaryCard label="Completed" value={sprintSummary.completed} />
      </div>

      {showCreateForm && (
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="card-header">
            <h3>New Sprint</h3>
          </div>
          <div className="card-body">
            <form
              onSubmit={handleCreateSprint}
              style={{ display: "grid", gap: "var(--space-4)" }}
            >
              <input
                className="input"
                placeholder="Sprint name"
                value={form.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                required
              />
              <textarea
                placeholder="Goal"
                value={form.goal}
                onChange={(e) => handleFormChange("goal", e.target.value)}
              />
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Start date</label>
                  <input
                    className="input"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => handleFormChange("startDate", e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">End date</label>
                  <input
                    className="input"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => handleFormChange("endDate", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? "Creating..." : "Save sprint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: "center", padding: 20 }}>
            Loading sprint data...
          </div>
        </div>
      ) : (
        <div
          className="sprint-layout"
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)" }}
        >
          <div>
            <div className="card" style={{ marginBottom: "var(--space-6)" }}>
              <div className="card-header">
                <h3>Active Sprint: {activeSprint ? activeSprint.name : "None"}</h3>
                {activeSprint && <span className="badge badge-primary">Active</span>}
              </div>

              <div className="card-body">
                {activeSprint ? (
                  <>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
                      {formatDate(activeSprint.startDate)} - {formatDate(activeSprint.endDate)} ·{" "}
                      {activeSprint.tasks?.length || 0} tasks
                    </p>
                    <BurndownChart points={burndown} />
                    <div style={{ marginTop: "var(--space-4)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        type="button"
                        disabled={saving}
                        onClick={() => handleSprintStatus(activeSprint.id, "COMPLETED")}
                      >
                        Complete sprint
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        type="button"
                        disabled={saving}
                        onClick={() => handleSprintStatus(activeSprint.id, "CANCELLED")}
                      >
                        Cancel sprint
                      </button>
                    </div>
                  </>
                ) : (
                  <p style={{ color: "var(--text-secondary)" }}>
                    There is no active sprint for this project.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: "var(--space-6)" }}>
              <div className="card-body" style={{ textAlign: "center", padding: "var(--space-6)" }}>
                <div style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--primary-600)" }}>
                  {velocity} pts
                </div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                  Average Velocity
                </div>
              </div>
            </div>

            <h3 style={{ marginBottom: "var(--space-4)" }}>Sprint List</h3>

            {sprints.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                No sprints found.
              </p>
            ) : (
              sprints.map((sprint) => (
                <div
                  key={sprint.id}
                  className="sprint-list-item"
                  style={{
                    opacity: sprint.status === "COMPLETED" ? 0.7 : 1,
                    borderColor: sprint.status === "ACTIVE" ? "var(--primary-500)" : "",
                    background: sprint.status === "ACTIVE" ? "var(--primary-50)" : "",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{sprint.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                      {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                    </div>
                    {sprint.goal && (
                      <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                        {sprint.goal}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      {sprint.status === "PLANNING" && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            type="button"
                            disabled={saving || !!activeSprint}
                            onClick={() => handleSprintStatus(sprint.id, "ACTIVE")}
                            title={
                              activeSprint
                                ? `Complete ${activeSprint.name} before starting another sprint.`
                                : "Start sprint"
                            }
                          >
                            Start
                          </button>
                          {activeSprint ? (
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--text-tertiary)",
                                alignSelf: "center",
                              }}
                            >
                              Complete the active sprint first.
                            </span>
                          ) : null}
                        </>
                      )}
                      {sprint.status !== "ACTIVE" && (
                        <button
                          className="btn btn-secondary btn-sm"
                          type="button"
                          disabled={saving}
                          onClick={() => handleDeleteSprint(sprint.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      sprint.status === "ACTIVE"
                        ? "badge-primary"
                        : sprint.status === "COMPLETED"
                        ? "badge-gray"
                        : "badge-success"
                    }`}
                  >
                    {sprint.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-value">{value}</div>
      <div className="dashboard-card-label">{label}</div>
    </div>
  );
}

function BurndownChart({ points }) {
  const hasMeaningfulBurndown =
    Array.isArray(points) &&
    points.length > 0 &&
    points.some((point) => point.remaining > 0 || point.ideal > 0);

  if (!hasMeaningfulBurndown) {
    return (
      <div
        style={{
          minHeight: 240,
          borderRadius: "var(--radius-xl)",
          background: "var(--bg-tertiary)",
          display: "grid",
          placeItems: "center",
          color: "var(--text-secondary)",
          padding: 24,
          textAlign: "center",
        }}
      >
        No burndown data available yet.
        <div style={{ fontSize: 13, marginTop: 8 }}>
          Add tasks to the active sprint to generate a burndown curve.
        </div>
      </div>
    );
  }

  const width = 520;
  const height = 220;
  const padding = 20;
  const maxRemaining = Math.max(...points.map((point) => point.remaining), 1);

  const buildPath = (key) =>
    points
      .map((point, index) => {
        const x =
          padding +
          (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
        const y =
          height -
          padding -
          (point[key] * (height - padding * 2)) / Math.max(maxRemaining, 1);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
        <path d={buildPath("ideal")} fill="none" stroke="#94a3b8" strokeDasharray="6 6" strokeWidth="2" />
        <path d={buildPath("remaining")} fill="none" stroke="#2563eb" strokeWidth="3" />
      </svg>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          gap: 12,
          fontSize: 12,
          color: "var(--text-secondary)",
        }}
      >
        <span>{points[0]?.date}</span>
        <span>{points[points.length - 1]?.date}</span>
      </div>
    </div>
  );
}
