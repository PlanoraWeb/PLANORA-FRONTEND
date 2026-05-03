import React from "react";
import AppLayout from "../layouts/AppLayout";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import "../styles/App.css";
import Button from "../components/Button";

function Backlog() {
  return (
    <AppLayout>
      <div className="app-layout">
        
        <main className="app-main">

          <div className="app-content">
            {/* Header */}
            <div className="backlog-header">
              <h1 className="page-title">Backlog</h1>
              <button className="btn btn-primary btn-sm">
                Convert to sprint
              </button>
            </div>

            {/* Table */}
            <div className="card">
              <div className="card-body" style={{ padding: 0 }}>
                {/* Header Row */}
                <div
                  className="backlog-row"
                  style={{
                    background: "var(--bg-secondary)",
                    fontWeight: 600,
                    color: "var(--text-tertiary)",
                    fontSize: "var(--text-xs)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <span style={{ width: 16 }}></span>
                  <span style={{ width: 18 }}></span>
                  <span style={{ flex: 1 }}>ID</span>
                  <span style={{ flex: 2 }}>Title</span>
                  <span>Priority</span>
                  <span style={{ minWidth: 40, textAlign: "center" }}>
                    Points
                  </span>
                </div>

                {/* Row 1 */}
                <div className="backlog-row">
                  <input type="checkbox" />
                  <a href="/task-details" style={{ flex: 1 }}>
                    PRO-123
                  </a>
                  <span style={{ flex: 2 }}>
                    Design new authentication flow screens
                  </span>
                  <span className="badge badge-error">High</span>
                  <span style={{ minWidth: 40, textAlign: "center" }}>5</span>
                </div>

                {/* Row 2 */}
                <div className="backlog-row">
                  <input type="checkbox" />
                  <span style={{ flex: 1 }}>PRO-124</span>
                  <span style={{ flex: 2 }}>
                    User profile page redesign
                  </span>
                  <span className="badge badge-warning">Medium</span>
                  <span style={{ minWidth: 40, textAlign: "center" }}>3</span>
                </div>

                {/* Row 3 */}
                <div className="backlog-row">
                  <input type="checkbox" />
                  <span style={{ flex: 1 }}>PRO-125</span>
                  <span style={{ flex: 2 }}>
                    API documentation update
                  </span>
                  <span className="badge badge-gray">Low</span>
                  <span style={{ minWidth: 40, textAlign: "center" }}>2</span>
                </div>

                {/* Row 4 */}
                <div className="backlog-row">
                  <input type="checkbox" />
                  <span style={{ flex: 1 }}>PRO-126</span>
                  <span style={{ flex: 2 }}>
                    Setup CI/CD pipeline
                  </span>
                  <span className="badge badge-warning">Medium</span>
                  <span style={{ minWidth: 40, textAlign: "center" }}>8</span>
                </div>

                {/* Row 5 */}
                <div className="backlog-row">
                  <input type="checkbox" />
                  <span style={{ flex: 1 }}>PRO-127</span>
                  <span style={{ flex: 2 }}>
                    Mobile responsive fixes
                  </span>
                  <span className="badge badge-gray">Low</span>
                  <span style={{ minWidth: 40, textAlign: "center" }}>1</span>
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-tertiary)",
                marginTop: "var(--space-4)",
              }}
            >
              Drag rows to reorder. Checkbox and last column = Story Points.
            </p>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}

export default Backlog;