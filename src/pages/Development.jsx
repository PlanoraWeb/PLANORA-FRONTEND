import ProjectWorkspaceShell from "../components/ProjectWorkspaceShell";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

export default function Development() {
  const workspace = useProjectWorkspace("development");
  const insights = workspace.insights;
  const bugs = insights?.tasksByType?.find((item) => item.type === "BUG")?.count || 0;
  const stories = insights?.tasksByType?.find((item) => item.type === "STORY")?.count || 0;
  const urgent = insights?.tasksByPriority?.find((item) => item.priority === "URGENT")?.count || 0;

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
        <MetricCard label="Bugs" value={bugs} />
        <MetricCard label="Stories" value={stories} />
        <MetricCard label="Urgent work" value={urgent} />
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Engineering workload</h3>
        </div>
        <div className="card-body" style={{ display: "grid", gap: 12 }}>
          {(insights?.workload || []).map((member) => (
            <div
              key={member.userId}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr repeat(3, minmax(0, 120px))",
                gap: 16,
                padding: "var(--space-4)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xl)",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{member.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {member.role}
                </div>
              </div>
              <StatPill label="Open" value={member.openTaskCount} />
              <StatPill label="Done" value={member.completedTaskCount} />
              <StatPill label="Overdue" value={member.overdueTaskCount} />
            </div>
          ))}
        </div>
      </div>
    </ProjectWorkspaceShell>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-value">{value}</div>
      <div className="dashboard-card-label">{label}</div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div
      style={{
        padding: "var(--space-3)",
        borderRadius: "var(--radius-lg)",
        background: "var(--bg-secondary)",
        textAlign: "center",
      }}
    >
      <div style={{ fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</div>
    </div>
  );
}
