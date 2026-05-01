import AppLayout from "../layouts/AppLayout";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import "../styles/Board.css";
import "../styles/App.css";
import { useState } from "react";
import ProjectTabs from "../components/ProjectTabs";
import { FaTools } from "react-icons/fa";

export default function Development() {
  const [activeTab, setActiveTab] = useState("development");

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

      {/* TABS */}
      <ProjectTabs activeTab={activeTab} onTabChange={handleTab} />

      {/* EMPTY STATE */}
      <div className="card" style={{ minHeight: "400px" }}>
        <div className="card-body">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FaTools style={{ fontSize: "48px" }} />
            </div>

            <h3 className="empty-state-title">Geliştirme</h3>

            <p className="empty-state-description">
              GitHub veya GitLab entegrasyonu ile branch ve PR'ları takip edin.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}