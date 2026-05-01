import React from "react";
import AppLayout from "../layouts/AppLayout";  
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import "../styles/Board.css";
import ProjectTabs from "../components/ProjectTabs";
import { useState } from "react";

const Code = () => {
    const [activeTab, setActiveTab] = useState("code");
        
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
      <ProjectTabs activeTab={activeTab} onTabChange={handleTab} />
          {/* Empty State */}
          <div className="card" style={{ minHeight: "400px" }}>
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>

                <h3 className="empty-state-title">Kod</h3>
                <p className="empty-state-description">
                  Repository bağlayarak branch ve commit'leri görüntüleyin.
                </p>
              </div>
            </div>
          </div>
    </AppLayout>
  );
};

export default Code;