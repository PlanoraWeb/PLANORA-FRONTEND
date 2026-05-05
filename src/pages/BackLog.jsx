import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "../layouts/AppLayout";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import "../styles/App.css";
import Button from "../components/Button";
import { getProjects } from "../services/projectService";
import { getTasksByProject } from "../services/taskService";

function Backlog() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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
      }
    })();
  }, []);

  const loadBacklog = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      // backlog=true query parameter is passed here to only get unassigned sprint tasks
      const res = await getTasksByProject(selectedProjectId, { backlog: true });
      setTasks(res.data?.data ?? []);
    } catch (err) {
      console.error("Failed to load backlog tasks", err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadBacklog();
  }, [selectedProjectId, loadBacklog]);

  return (
    <AppLayout>
          <div className="app-content">
            {/* Header */}
            <div className="backlog-header">
              <div className="board-header-left" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <h1 className="page-title">Backlog</h1>
                <select
                  className="input"
                  style={{ width: 200, marginTop: 0 }}
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  {projects.length === 0 && <option value="">No projects</option>}
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary btn-sm">
                Convert to sprint
              </button>
            </div>

            {/* Table */}
            <div className="card">
              <div className="card-body" style={{ padding: 0 }}>
                {/* Header Row */}
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
                  <span style={{ width: 16 }}></span>
                  <span style={{ width: 18 }}></span>
                  <span style={{ flex: 1 }}>ID</span>
                  <span style={{ flex: 2 }}>Title</span>
                  <span>Priority</span>
                  <span style={{ minWidth: 60, textAlign: "center" }}>
                    Type
                  </span>
                </div>

                {loading ? (
                   <div style={{ padding: 20, textAlign: "center" }}>Loading tasks...</div>
                ) : tasks.length === 0 ? (
                   <div style={{ padding: 20, textAlign: "center" }}>No backlog tasks found.</div>
                ) : (
                  tasks.map((task) => (
                    <div className="backlog-row" key={task.id}>
                      <input type="checkbox" />
                      <span style={{ flex: 1, fontSize: 12 }}>{task.id.slice(0, 8)}</span>
                      <span style={{ flex: 2 }}>{task.title}</span>
                      <span className={`badge ${task.priority === 'HIGH' || task.priority === 'URGENT' ? 'badge-error' : task.priority === 'MEDIUM' ? 'badge-warning' : 'badge-gray'}`}>
                        {task.priority}
                      </span>
                      <span style={{ minWidth: 60, textAlign: "center", textTransform: 'capitalize' }}>
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
              Drag rows to reorder. Checkbox and last column = Task Type.
            </p>
          </div>
    </AppLayout>
  );
}

export default Backlog;