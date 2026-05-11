import React, { useState, useEffect, useCallback } from "react";
import "../styles/App.css";
import AppLayout from "../layouts/AppLayout";
import { getProjects } from "../services/projectService";
import { 
  getSprintsByProject, 
  getActiveSprint, 
  getSprintVelocity, 
  createSprint 
} from "../services/sprintService";

export default function Sprints() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  
  const [sprints, setSprints] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [velocity, setVelocity] = useState(0);
  const [loading, setLoading] = useState(false);

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

  const loadSprintData = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const [sprintsRes, activeRes, velocityRes] = await Promise.all([
        getSprintsByProject(selectedProjectId),
        getActiveSprint(selectedProjectId),
        getSprintVelocity(selectedProjectId)
      ]);

      setSprints(sprintsRes.data?.data || []);
      setActiveSprint(activeRes.data?.data || null);
      setVelocity(velocityRes.data?.data?.velocity || 0);
    } catch (err) {
      console.error("Failed to load sprint data", err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadSprintData();
  }, [selectedProjectId, loadSprintData]);

  const handleCreateSprint = async () => {
    if (!selectedProjectId) {
      alert("Please select a project first.");
      return;
    }
    const name = window.prompt("Enter sprint name (e.g. Sprint 14):");
    if (!name) return;

    try {
      await createSprint(selectedProjectId, {
        name,
        // Default logic: start today, end in 14 days
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });
      loadSprintData();
    } catch (err) {
      console.error("Failed to create sprint", err);
      alert("Failed to create sprint.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <AppLayout>
        {/* CONTENT */}
        <div className="app-content">

          {/* HEADER */}
          <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <h1 className="page-title">Sprint Management</h1>
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
            <button className="btn btn-primary btn-sm" onClick={handleCreateSprint}>Create sprint</button>
          </div>

          {loading ? (
            <div style={{ padding: 20, textAlign: "center" }}>Loading sprint data...</div>
          ) : (
            <div className="sprint-layout" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)" }}>

              {/* LEFT */}
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
                          {formatDate(activeSprint.startDate)} – {formatDate(activeSprint.endDate)} · {activeSprint.tasks?.length || 0} tasks
                        </p>

                        <div
                          style={{
                            height: 280,
                            background: "var(--bg-tertiary)",
                            borderRadius: "var(--radius-xl)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-tertiary)",
                            border: "2px dashed var(--border-default)"
                          }}
                        >
                          Burndown Chart (Placeholder)
                        </div>
                      </>
                    ) : (
                      <p style={{ color: "var(--text-secondary)" }}>There is no active sprint for this project.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
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

                {/* Sprint Items */}
                {sprints.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>No sprints found.</p>
                ) : (
                  sprints.map(sprint => (
                    <div 
                      key={sprint.id} 
                      className="sprint-list-item" 
                      style={{ 
                        opacity: sprint.status === 'COMPLETED' ? 0.7 : 1,
                        borderColor: sprint.status === 'ACTIVE' ? "var(--primary-500)" : "",
                        background: sprint.status === 'ACTIVE' ? "var(--primary-50)" : ""
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{sprint.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                          {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
                        </div>
                      </div>
                      <span className={`badge ${sprint.status === 'ACTIVE' ? 'badge-primary' : sprint.status === 'COMPLETED' ? 'badge-gray' : 'badge-success'}`}>
                        {sprint.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
    </AppLayout>
  );
}