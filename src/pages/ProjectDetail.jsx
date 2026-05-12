
import AppLayout from "../layouts/AppLayout";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import ProjectTabs from "../components/ProjectTabs";
import { useNavigate, useLocation } from "react-router-dom";

export default function ProjectDetail() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathTabMap = {
    "/project-detail": "overview",
    "/board": "board",
    "/backlog": "backlog",
    "/sprint": "sprints",
    "/timeline": "timeline",
    "/calendar": "calendar",
    "/forms": "forms",
    "/goals": "goals",
    "/development": "development",
    "/archive": "archive",
    "/pages": "pages",
    "/scope": "scope",
    "/code": "code",
  };

  const activeTab = pathTabMap[location.pathname] || "overview";

  const handleTab = (tab) => {
    const pathMap = {
      overview: "/project-detail",
      board: "/board",
      backlog: "/backlog",
      sprints: "/sprint",
      timeline: "/timeline",
      calendar: "/calendar",
      forms: "/forms",
      goals: "/goals",
      development: "/development",
      archive: "/archive",
      pages: "/pages",
      scope: "/scope",
      code: "/code",
    };

    navigate(pathMap[tab]);
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
              <p>Bu bölüm şu an için ayrı sayfaya yönlendirilmiştir.</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}