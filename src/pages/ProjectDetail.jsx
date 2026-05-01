import { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import ProjectTabs from "../components/ProjectTabs";

export default function ProjectDetail() {
  const [activeTab, setActiveTab] = useState("overview");

  const handleTab = (tab) => {
    if (tab === "overview") return (window.location.href = "/project-detail");
    if (tab === "board") return (window.location.href = "/board");
    if (tab === "backlog") return (window.location.href = "/backlog");
    if (tab === "sprints") return (window.location.href = "/sprint");
    if (tab === "timeline") return (window.location.href = "/timeline");
    if (tab === "calendar") return (window.location.href = "/calendar");
    if (tab === "forms") return (window.location.href = "/forms");
    if (tab === "goals") return (window.location.href = "/goals");
    if (tab === "development") return (window.location.href = "/development");
    if (tab === "archive") return (window.location.href = "/archive");
    if (tab === "pages") return (window.location.href = "/pages");
    if (tab === "scope") return (window.location.href = "/scope");
    if (tab === "code") return (window.location.href = "/code");
    setActiveTab(tab);
  };

  return (
    
    <AppLayout>
        <div className="app-content">
          
            <ProjectTabs activeTab={activeTab} onTabChange={handleTab} />
          
          {/* OVERVIEW PANEL */}
          {activeTab === "overview" && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "var(--space-4)",
                  marginBottom: "var(--space-6)",
                }}
              >
                <div className="dashboard-card">
                  <div className="dashboard-card-value">24</div>
                  <div className="dashboard-card-label">Open issues</div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-card-value">12</div>
                  <div className="dashboard-card-label">Done this sprint</div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-card-value">Sprint 12</div>
                  <div className="dashboard-card-label">Active</div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-card-value">38 pts</div>
                  <div className="dashboard-card-label">Velocity</div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Recent activity</h3>
                </div>

                <div className="card-body">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Issue</th>
                        <th>Status</th>
                        <th>Assignee</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td>QRM-45 Design auth flow</td>
                        <td>In Progress</td>
                        <td>AM</td>
                      </tr>
                      <tr>
                        <td>QRM-44 API documentation</td>
                        <td>Done</td>
                        <td>SC</td>
                      </tr>
                      <tr>
                        <td>QRM-43 Dashboard widgets</td>
                        <td>Review</td>
                        <td>MR</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* OTHER PANELS */}
          {activeTab !== "overview" && (
            <div className="card">
              <div className="card-body">
                <p>
                  Bu bölüm şu an için ayrı sayfaya yönlendirilmiştir.
                </p>
              </div>
            </div>
          )}
        </div>
    </AppLayout>
  );
}