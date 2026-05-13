import { useMemo } from "react";
import ProjectWorkspaceShell from "../components/ProjectWorkspaceShell";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

export default function CalendarPage() {
  const workspace = useProjectWorkspace("calendar");
  const dueTimeline = workspace.insights?.dueTimeline || [];

  const grouped = useMemo(() => {
    const map = new Map();
    dueTimeline.forEach((item) => {
      const key = item.dueDate
        ? new Date(item.dueDate).toLocaleDateString()
        : "No due date";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return Array.from(map.entries());
  }, [dueTimeline]);

  return (
    <ProjectWorkspaceShell {...workspace}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {grouped.length === 0 ? (
          <div className="card">
            <div className="card-body">No due dates planned yet.</div>
          </div>
        ) : (
          grouped.map(([date, items]) => (
            <div className="card" key={date}>
              <div className="card-header">
                <h3>{date}</h3>
              </div>
              <div className="card-body" style={{ display: "grid", gap: 12 }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {item.status} · {item.priority}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </ProjectWorkspaceShell>
  );
}
