import AppLayout from "../layouts/AppLayout";
import ProjectTabs from "./ProjectTabs";

export default function ProjectWorkspaceShell({
  activeTab,
  projects,
  selectedProjectId,
  selectedProject,
  loading,
  insightsLoading,
  error,
  onProjectChange,
  onTabChange,
  actions = null,
  children,
}) {
  return (
    <AppLayout>
      <ProjectTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        projectMeta="Workspace"
        projectName={selectedProject?.projectName || "Project workspace"}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select
              className="input"
              style={{ width: 220, marginTop: 0 }}
              value={selectedProjectId}
              onChange={(event) => onProjectChange(event.target.value)}
              disabled={loading}
            >
              {projects.length === 0 && <option value="">No projects</option>}
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectName}
                </option>
              ))}
            </select>
            {actions}
          </div>
        }
      />

      {error && (
        <div className="card" style={{ marginBottom: "var(--space-4)" }}>
          <div className="card-body">{error}</div>
        </div>
      )}

      {loading || insightsLoading ? (
        <div className="card">
          <div className="card-body" style={{ padding: 24, textAlign: "center" }}>
            Loading workspace...
          </div>
        </div>
      ) : (
        children
      )}
    </AppLayout>
  );
}
