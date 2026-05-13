import React, { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import "../styles/App.css";
import { getProjects } from "../services/projectService";
import { addSprintTasks, getSprintsByProject } from "../services/sprintService";
import { getTasksByProject } from "../services/taskService";
import { useSearchParams } from "react-router-dom";
import {
  getRememberedProjectId,
  rememberProjectId,
  resolveProjectSelection,
  sortTasksByDisplayOrder,
} from "../utils/workflowUi";

function Backlog() {
  const [searchParams] = useSearchParams();
  const requestedProjectId = searchParams.get("projectId") || "";
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
          const projectSignals = await Promise.all(
            list.map(async (project) => {
              const [tasksRes, sprintsRes] = await Promise.all([
                getTasksByProject(project.id, {
                  backlog: true,
                  limit: 100,
                  sortBy: "order",
                  sortOrder: "asc",
                }),
                getSprintsByProject(project.id),
              ]);

              const backlogCount = tasksRes.data?.data?.length ?? 0;
              const actionableSprintCount = (sprintsRes.data?.data ?? []).filter(
                (sprint) => sprint.status === "PLANNING" || sprint.status === "ACTIVE"
              ).length;

              return {
                projectId: project.id,
                backlogCount,
                actionableSprintCount,
              };
            })
          );

          initialProjectId =
            projectSignals.find((project) => project.backlogCount > 0)?.projectId ||
            projectSignals.find((project) => project.actionableSprintCount > 0)?.projectId ||
            initialProjectId;
        }

        if (!isCancelled) {
          setSelectedProjectId(initialProjectId);
          rememberProjectId(initialProjectId);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
        if (!isCancelled) {
          setMessage("Projects could not be loaded.");
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

  const loadBacklog = useCallback(async () => {
    if (!selectedProjectId) {
      setTasks([]);
      setSprints([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const [tasksRes, sprintsRes] = await Promise.all([
        getTasksByProject(selectedProjectId, {
          backlog: true,
          limit: 100,
          sortBy: "order",
          sortOrder: "asc",
        }),
        getSprintsByProject(selectedProjectId),
      ]);
      const backlogTasks = sortTasksByDisplayOrder(tasksRes.data?.data ?? []);
      const availableSprints = (sprintsRes.data?.data ?? []).filter(
        (sprint) => sprint.status === "PLANNING" || sprint.status === "ACTIVE"
      );

      setTasks(backlogTasks);
      setSprints(availableSprints);
      setSelectedTaskIds([]);
      setSelectedSprintId((current) => {
        if (current && availableSprints.some((sprint) => sprint.id === current)) {
          return current;
        }
        return availableSprints[0]?.id || "";
      });
    } catch (err) {
      console.error("Failed to load backlog tasks", err);
      setMessage("Backlog tasks could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadBacklog();
  }, [selectedProjectId, loadBacklog]);

  const allSelected = useMemo(
    () => tasks.length > 0 && selectedTaskIds.length === tasks.length,
    [selectedTaskIds.length, tasks.length]
  );
  const taskSummary = useMemo(
    () => ({
      total: tasks.length,
      highPriority: tasks.filter((task) => ["HIGH", "URGENT"].includes(task.priority)).length,
      stories: tasks.filter((task) => task.type === "STORY").length,
      sprintReady: sprints.length,
    }),
    [sprints.length, tasks]
  );

  const toggleTask = (taskId) => {
    setSelectedTaskIds((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId]
    );
  };

  const toggleAllTasks = () => {
    setSelectedTaskIds(allSelected ? [] : tasks.map((task) => task.id));
  };

  const handleMoveToSprint = async () => {
    if (!selectedSprintId || selectedTaskIds.length === 0) return;

    setSaving(true);
    setMessage("");
    try {
      await addSprintTasks(selectedSprintId, selectedTaskIds);
      setMessage("Selected backlog tasks were added to the sprint.");
      await loadBacklog();
    } catch (err) {
      console.error("Failed to move tasks to sprint", err);
      setMessage(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Selected tasks could not be added to the sprint."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div className="board-header-left" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 className="page-title">Backlog</h1>
            <p className="page-subtitle">Plan work before it enters a sprint.</p>
          </div>
          <select
            className="input"
            style={{ width: 200, marginTop: 0 }}
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

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="input"
            style={{ width: 220, marginTop: 0 }}
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            disabled={sprints.length === 0}
          >
            {sprints.length === 0 && <option value="">No active or planning sprints</option>}
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name} ({sprint.status})
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary btn-sm"
            type="button"
            disabled={!selectedSprintId || selectedTaskIds.length === 0 || saving}
            onClick={handleMoveToSprint}
          >
            {saving ? "Moving..." : "Move to sprint"}
          </button>
        </div>
      </div>

      {message && (
        <div className="card" style={{ marginBottom: "var(--space-4)" }}>
          <div className="card-body">{message}</div>
        </div>
      )}

      <div className="reports-summary-grid" style={{ marginBottom: "var(--space-5)" }}>
        <SummaryCard label="Backlog tasks" value={taskSummary.total} />
        <SummaryCard label="High priority" value={taskSummary.highPriority} />
        <SummaryCard label="Stories" value={taskSummary.stories} />
        <SummaryCard label="Available sprints" value={taskSummary.sprintReady} />
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div
            className="backlog-row"
            style={{
              background: "var(--bg-secondary)",
              fontWeight: 600,
              color: "var(--text-tertiary)",
              fontSize: "var(--text-xs)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <input type="checkbox" checked={allSelected} onChange={toggleAllTasks} />
            <span style={{ flex: 1 }}>ID</span>
            <span style={{ flex: 2 }}>Title</span>
            <span>Priority</span>
            <span style={{ minWidth: 80, textAlign: "center" }}>Type</span>
          </div>

          {loading ? (
            <div style={{ padding: 20, textAlign: "center" }}>Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center" }}>No backlog tasks found.</div>
          ) : (
            tasks.map((task) => (
              <div className="backlog-row" key={task.id}>
                <input
                  type="checkbox"
                  checked={selectedTaskIds.includes(task.id)}
                  onChange={() => toggleTask(task.id)}
                />
                <span style={{ flex: 1, fontSize: 12 }}>{task.id.slice(0, 8)}</span>
                <span style={{ flex: 2 }}>{task.title}</span>
                <span
                  className={`badge ${
                    task.priority === "HIGH" || task.priority === "URGENT"
                      ? "badge-error"
                      : task.priority === "MEDIUM"
                      ? "badge-warning"
                      : "badge-gray"
                  }`}
                >
                  {task.priority}
                </span>
                <span
                  style={{
                    minWidth: 80,
                    textAlign: "center",
                    textTransform: "capitalize",
                  }}
                >
                  {task.type.toLowerCase()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--text-tertiary)",
          marginTop: "var(--space-4)",
        }}
      >
        Select backlog tasks and move them into an active or planning sprint.
      </p>
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

export default Backlog;
