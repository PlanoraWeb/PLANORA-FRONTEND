import ProjectWorkspaceShell from "../components/ProjectWorkspaceShell";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

export default function Code() {
  const workspace = useProjectWorkspace("code");
  const insights = workspace.insights;
  const done = insights?.summary?.completedTasks || 0;
  const open = insights?.summary?.openTasks || 0;
  const overdue = insights?.summary?.overdueTasks || 0;

  return (
    <ProjectWorkspaceShell {...workspace}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <ReleaseCard label="Shipped work" value={done} />
        <ReleaseCard label="Open work" value={open} />
        <ReleaseCard label="Release blockers" value={overdue} />
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent completed changes</h3>
        </div>
        <div className="card-body" style={{ display: "grid", gap: 12 }}>
          {(insights?.archivedTasks || []).slice(0, 8).map((task) => (
            <div
              key={task.id}
              style={{
                padding: "var(--space-4)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xl)",
              }}
            >
              <div style={{ fontWeight: 600 }}>{task.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {task.type} · {task.priority} · {new Date(task.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProjectWorkspaceShell>
  );
}

function ReleaseCard({ label, value }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-value">{value}</div>
      <div className="dashboard-card-label">{label}</div>
    </div>
  );
}
