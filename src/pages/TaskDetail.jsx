import { useState } from "react";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import AppLayout from "../layouts/AppLayout";

export default function TaskDetail() {
  const [status, setStatus] = useState("In Progress");

  return (
    <AppLayout>
  

      {/* MAIN */}
      <main className="app-main">

        <div className="app-content">
          <div className="task-detail-layout">
            
            {/* LEFT */}
            <div className="task-detail-main">
              <div className="task-id">PRO-123</div>

              <h1 className="task-title">
                Design new authentication flow screens
              </h1>

              <div className="task-section">
                <h3 className="task-section-title">Description</h3>

                <div className="card card-body">
                  <div className="task-description">
                    Create authentication flow screens...
                  </div>
                </div>
              </div>

              <div className="task-section">
                <h3 className="task-section-title">Comments</h3>

                <textarea className="input" placeholder="Add a comment..." rows={3} />

                <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                  Post comment
                </button>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="task-detail-sidebar">
              <div className="card">
                <div className="card-body">

                  <div className="task-field task-field-editable">
                    <span>Status</span>

                    <select
                      className="status-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option>Backlog</option>
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Review</option>
                      <option>Done</option>
                    </select>
                  </div>

                  <div className="task-field">
                    <span>Assignee</span>
                    <span>Alex Morgan</span>
                  </div>

                  <div className="task-field">
                    <span>Priority</span>
                    <span className="badge badge-error">High</span>
                  </div>

                  <div className="task-field">
                    <span>Due date</span>
                    <span>Mar 10, 2025</span>
                  </div>

                </div>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-header">
                  <h3>Activity</h3>
                </div>

                <div className="card-body">
                  <p>Activity log...</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

    </AppLayout>
  );
}