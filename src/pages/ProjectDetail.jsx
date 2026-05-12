import ProjectWorkspaceShell from "../components/ProjectWorkspaceShell";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

export default function ProjectDetail() {
  const workspace = useProjectWorkspace("overview");
  const insights = workspace.insights;

  return (
    <ProjectWorkspaceShell {...workspace}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <MetricCard label="Open tasks" value={insights?.summary?.openTasks || 0} />
        <MetricCard label="Done tasks" value={insights?.summary?.completedTasks || 0} />
        <MetricCard
          label="Active sprint"
          value={insights?.summary?.activeSprint?.name || "No sprint"}
        />
        <MetricCard
          label="Completion"
          value={`${insights?.summary?.completionRate || 0}%`}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "var(--space-6)",
        }}
      >
        <section className="card">
          <div className="card-header">
            <h3>Recent activity</h3>
          </div>
          <div className="card-body">
            <div className="table-container" style={{ border: "none" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Assignee</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {(insights?.recentActivity || []).slice(0, 6).map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.status}</td>
                      <td>
                        {item.assignee
                          ? `${item.assignee.firstName} ${item.assignee.lastName}`
                          : "Unassigned"}
                      </td>
                      <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h3>Project summary</h3>
          </div>
          <div className="card-body" style={{ display: "grid", gap: "var(--space-4)" }}>
            <SummaryRow label="Team members" value={insights?.summary?.memberCount || 0} />
            <SummaryRow label="Backlog tasks" value={insights?.summary?.backlogTasks || 0} />
            <SummaryRow label="Overdue tasks" value={insights?.summary?.overdueTasks || 0} />
            <SummaryRow label="Sprint count" value={insights?.summary?.sprintCount || 0} />
            <div>
              <div className="task-section-title">Description</div>
              <div className="task-description">
                {insights?.project?.description || "No project description yet."}
              </div>
            </div>
          </div>
        </section>
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

function SummaryRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        paddingBottom: "var(--space-3)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
