import "../styles/DesignSystem.css";
import "../styles/Board.css";
import "../styles/App.css";
import AppLayout from "../layouts/AppLayout";
import { useState } from "react";
import ProjectTabs from "../components/ProjectTabs";

export default function ArchivePage() {
    const [activeTab, setActiveTab] = useState("archive");

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
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  </svg>
                </div>

                <h3 className="empty-state-title">
                  Arşivlenen biletler
                </h3>

                <p className="empty-state-description">
                  Tamamlanan veya iptal edilen biletler burada görünür.
                </p>
              </div>

            </div>
          </div>

</AppLayout>
  );
}