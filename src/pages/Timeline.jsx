import ProjectWorkspaceShell from "../components/ProjectWorkspaceShell";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

export default function TimelinePage() {
  const workspace = useProjectWorkspace("timeline");
  const timeline = workspace.insights?.dueTimeline || [];

  return (
    <ProjectWorkspaceShell {...workspace}>
      <div className="card">
        <div className="card-header">
          <h3>Delivery timeline</h3>
        </div>
        <div className="card-body" style={{ display: "grid", gap: "var(--space-4)" }}>
          {timeline.length === 0 ? (
            <div className="service-empty">No dated tasks available yet.</div>
          ) : (
            timeline.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr auto",
                  gap: 16,
                  alignItems: "center",
                  padding: "var(--space-4)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-xl)",
                  background: "var(--bg-primary)",
                }}
              >
                <div style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                  {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "No date"}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    {item.status} · {item.priority}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {item.assignee
                    ? `${item.assignee.firstName} ${item.assignee.lastName}`
                    : "Unassigned"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ProjectWorkspaceShell>
  );
}
