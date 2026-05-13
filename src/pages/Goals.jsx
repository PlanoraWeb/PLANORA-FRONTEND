import ProjectWorkspaceShell from "../components/ProjectWorkspaceShell";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

export default function Goals() {
  const workspace = useProjectWorkspace("goals");
  const insights = workspace.insights;
  const activeSprint = insights?.summary?.activeSprint;
  const sprintSummaries = insights?.sprintSummaries || [];

  return (
    <ProjectWorkspaceShell {...workspace}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "var(--space-6)",
        }}
      >
        <section className="card">
          <div className="card-header">
            <h3>Active focus</h3>
          </div>
          <div className="card-body" style={{ display: "grid", gap: "var(--space-4)" }}>
            <GoalMetric
              label="Project completion"
              value={`${insights?.summary?.completionRate || 0}%`}
              percent={insights?.summary?.completionRate || 0}
            />
            <GoalMetric
              label="Open work remaining"
              value={`${insights?.summary?.openTasks || 0} tasks`}
              percent={
                insights?.summary?.totalTasks
                  ? Math.round(
                      ((insights.summary.openTasks || 0) / insights.summary.totalTasks) *
                        100
                    )
                  : 0
              }
              color="var(--warning)"
            />
            <div>
              <div className="task-section-title">Sprint goal</div>
              <div className="task-description">
                {activeSprint?.goal || "No active sprint goal defined yet."}
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h3>Sprint outcomes</h3>
          </div>
          <div className="card-body" style={{ display: "grid", gap: 12 }}>
            {sprintSummaries.length === 0 ? (
              <div className="service-empty">No sprint history yet.</div>
            ) : (
              sprintSummaries.slice(0, 5).map((sprint) => (
                <GoalMetric
                  key={sprint.id}
                  label={sprint.name}
                  value={`${sprint.completedTasks}/${sprint.totalTasks} complete`}
                  percent={sprint.completionRate}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </ProjectWorkspaceShell>
  );
}

function GoalMetric({ label, value, percent, color = "var(--primary-500)" }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 8 }}>
        <strong>{label}</strong>
        <span style={{ color: "var(--text-secondary)" }}>{value}</span>
      </div>
      <div
        style={{
          height: 12,
          background: "var(--bg-tertiary)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${percent}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
}
