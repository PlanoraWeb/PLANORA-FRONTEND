import "../styles/App.css";
import AppLayout from "../layouts/AppLayout";

export default function Sprints() {
  
  return (
    <AppLayout>
        {/* CONTENT */}
        <div className="app-content">

          {/* HEADER */}
          <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 className="page-title">Sprint Management</h1>
            <button className="btn btn-primary btn-sm">Create sprint</button>
          </div>

          <div className="sprint-layout" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)" }}>

            {/* LEFT */}
            <div>
              <div className="card" style={{ marginBottom: "var(--space-6)" }}>
                <div className="card-header">
                  <h3>Active Sprint: Sprint 12</h3>
                  <span className="badge badge-primary">Active</span>
                </div>

                <div className="card-body">
                  <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
                    Mar 1 – Mar 10, 2025 · 42 pts committed · 68% complete
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
                    Burndown Chart Placeholder
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div>

              <div className="card" style={{ marginBottom: "var(--space-6)" }}>
                <div className="card-body" style={{ textAlign: "center", padding: "var(--space-6)" }}>
                  <div style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--primary-600)" }}>
                    38 pts
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    Average Velocity
                  </div>
                </div>
              </div>

              <h3 style={{ marginBottom: "var(--space-4)" }}>Sprint List</h3>

              {/* Sprint Items */}
              <div className="sprint-list-item" style={{ opacity: 0.7 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Sprint 11</div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    Feb 15 – Feb 28
                  </div>
                </div>
                <span className="badge badge-gray">Closed</span>
              </div>

              <div className="sprint-list-item" style={{ borderColor: "var(--primary-500)", background: "var(--primary-50)" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Sprint 12</div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    Mar 1 – Mar 10
                  </div>
                </div>
                <span className="badge badge-primary">Active</span>
              </div>

              <div className="sprint-list-item">
                <div>
                  <div style={{ fontWeight: 600 }}>Sprint 13</div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    Mar 11 – Mar 24
                  </div>
                </div>
                <span className="badge badge-success">Planned</span>
              </div>

            </div>

          </div>
        </div>


   
    </AppLayout>
  );
}