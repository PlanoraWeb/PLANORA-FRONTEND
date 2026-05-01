import React from "react";
import AppLayout from "../layouts/AppLayout";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import "../styles/Board.css";
import ProjectTabs from "../components/ProjectTabs";
import { useState } from "react";

const Scope = () => {
     const [activeTab, setActiveTab] = useState("scope");
    
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
          <div className="card" style={{ minHeight: "400px" }}>
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>

                <h3 className="empty-state-title">Kapsam</h3>
                <p className="empty-state-description">
                  Proje kapsamı ve scope yönetimi.
                </p>
              </div>
            </div>
          </div>
    </AppLayout>
  );
};

export default Scope;