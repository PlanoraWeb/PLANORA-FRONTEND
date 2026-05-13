import ProjectWorkspaceShell from "../components/ProjectWorkspaceShell";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

export default function Scope() {
  const workspace = useProjectWorkspace("scope");
  const insights = workspace.insights;

  return (
    <ProjectWorkspaceShell {...workspace}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-6)",
        }}
      >
        <ScopeCard title="Work by type" items={insights?.tasksByType || []} itemKey="type" />
        <ScopeCard
          title="Work by priority"
          items={insights?.tasksByPriority || []}
          itemKey="priority"
        />
      </div>
    </ProjectWorkspaceShell>
  );
}

function ScopeCard({ title, items, itemKey }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-body" style={{ display: "grid", gap: "var(--space-4)" }}>
        {items.map((item) => (
          <div key={item[itemKey]}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong>{item[itemKey]}</strong>
              <span style={{ color: "var(--text-secondary)" }}>{item.count}</span>
            </div>
            <div
              style={{
                height: 12,
                borderRadius: 999,
                overflow: "hidden",
                background: "var(--bg-tertiary)",
              }}
            >
              <div
                style={{
                  width: `${total ? Math.round((item.count / total) * 100) : 0}%`,
                  height: "100%",
                  background: "var(--primary-500)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
