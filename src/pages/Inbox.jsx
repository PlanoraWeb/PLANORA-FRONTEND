import React, { useEffect } from "react";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css"
import "../styles/Inbox.css";
import AppLayout from "../layouts/AppLayout";

function Inbox() {
  useEffect(() => {
    const t = localStorage.getItem("planora-theme");
    if (t === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  return (
    <AppLayout>
    <div className="app-layout">
      
      

      {/* MAIN */}
      <main className="app-main">
        

        {/* CONTENT */}
        <div className="app-content">
          
          <div className="page-header">
            <div>
              <h1 className="page-title">Inbox</h1>
              <p className="page-subtitle">
                Notifications and mentions across your projects.
              </p>
            </div>

            <button className="btn btn-ghost btn-sm">
              Mark all as read
            </button>
          </div>

          {/* FILTERS */}
          <div className="inbox-filters">
            <button className="inbox-filter-btn active">All</button>
            <button className="inbox-filter-btn">Mentions</button>
            <button className="inbox-filter-btn">Assignments</button>
            <button className="inbox-filter-btn">Status changes</button>
            <button className="inbox-filter-btn">Comments</button>
          </div>

          {/* INBOX LIST */}
          <div className="card">

            <div
              className="inbox-item unread"
              onClick={() => (window.location.href = "/task-detail")}
            >
              <div className="inbox-dot"></div>
              <div className="avatar">SC</div>

              <div className="inbox-content">
                <div className="inbox-meta">
                  <strong>Sarah Chen</strong> mentioned you in PRO-123 · 15 min ago
                </div>
                <div className="inbox-preview">
                  "Hey @Alex, can you review the auth flow?"
                </div>
              </div>
            </div>

            <div className="inbox-item unread">
              <div className="inbox-dot"></div>
              <div className="avatar">MR</div>

              <div className="inbox-content">
                <div className="inbox-meta">
                  <strong>Mike Ross</strong> assigned you · 2 hours ago
                </div>
                <div className="inbox-preview">
                  Fix SceneDelegate memory leak
                </div>
              </div>
            </div>

            <div className="inbox-item">
              <div style={{ width: 8 }}></div>
              <div className="avatar">MR</div>

              <div className="inbox-content">
                <div className="inbox-meta">
                  <strong>Mike Ross</strong> created project · 2 days ago
                </div>
                <div className="inbox-preview">
                  New project added
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
    </AppLayout>
  );
}

export default Inbox;