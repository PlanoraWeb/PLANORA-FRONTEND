import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import AppLayout from "../layouts/AppLayout";

export default function Reports() {
  return (
    <AppLayout>
      <div className="app-content">
          <div className="page-header">
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">
              Track productivity and performance across your projects.
            </p>
          </div>

          <div
            className="reports-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "var(--space-6)",
            }}
          >
            {/* PRODUCTIVITY */}
            <div className="card">
              <div className="card-header">
                <h3>Productivity</h3>
                <select
                  style={{
                    padding: "var(--space-1) var(--space-2)",
                    fontSize: "var(--text-xs)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <option>Last 30 days</option>
                </select>
              </div>

              <div className="card-body">
                <div
                  style={{
                    height: 320,
                    background: "var(--bg-tertiary)",
                    borderRadius: "var(--radius-xl)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-tertiary)",
                    border: "2px dashed var(--border-default)",
                  }}
                >
                  Productivity Charts Placeholder
                </div>
              </div>
            </div>

            {/* TASK DISTRIBUTION */}
            <div className="card">
              <div className="card-header">
                <h3>Task Distribution</h3>
                <select
                  style={{
                    padding: "var(--space-1) var(--space-2)",
                    fontSize: "var(--text-xs)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <option>By status</option>
                </select>
              </div>

              <div className="card-body">
                <div
                  style={{
                    height: 260,
                    background: "var(--bg-tertiary)",
                    borderRadius: "var(--radius-xl)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-tertiary)",
                    border: "2px dashed var(--border-default)",
                  }}
                >
                  Task Distribution Placeholder
                </div>
              </div>
            </div>

            {/* SPRINT PERFORMANCE */}
            <div className="card">
              <div className="card-header">
                <h3>Sprint Performance</h3>
              </div>

              <div className="card-body">
                <div
                  style={{
                    height: 260,
                    background: "var(--bg-tertiary)",
                    borderRadius: "var(--radius-xl)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-tertiary)",
                    border: "2px dashed var(--border-default)",
                  }}
                >
                  Sprint Performance Placeholder
                </div>
              </div>
            </div>

            {/* COMPLETION */}
            <div className="card">
              <div className="card-header">
                <h3>Completion Rates</h3>
                <span style={{ color: "var(--success)", fontWeight: 600 }}>
                  ↑ 12%
                </span>
              </div>

              <div className="card-body">
                <div
                  style={{
                    height: 260,
                    background: "var(--bg-tertiary)",
                    borderRadius: "var(--radius-xl)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-tertiary)",
                    border: "2px dashed var(--border-default)",
                  }}
                >
                  Completion Rates Placeholder
                </div>
              </div>
            </div>
          </div>
          </div>
    </AppLayout>
  );
}