import { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import "../styles/Board.css";
import ProjectTabs from "../components/ProjectTabs";

export default function Pages() {
    const [activeTab, setActiveTab] = useState("pages");
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
          {/* EMPTY STATE */}
          <div className="card" style={{ minHeight: "400px" }}>
            <div className="card-body">

              <div className="empty-state">

                <div className="empty-state-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>

                <h3 className="empty-state-title">Sayfalar</h3>

                <p className="empty-state-description">
                  Proje dokümantasyonu ve wiki sayfaları oluşturun.
                </p>

              </div>

            </div>
          </div>
    </AppLayout>
  );
}