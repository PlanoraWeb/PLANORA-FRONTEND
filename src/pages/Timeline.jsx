import AppLayout from "../layouts/AppLayout";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import "../styles/Board.css";
import Board from "../components/ProjectTabs";
import { CiViewTimeline } from "react-icons/ci";
import { useState } from "react";


export default function TimelinePage() {
    const [activeTab, setActiveTab] = useState("timeline");
    
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
        {/* CONTENT */}
        <div className="app-content">

          <Board activeTab={activeTab} onTabChange={handleTab} />

          {/* EMPTY STATE */}
          <div className="card" style={{ minHeight: "400px" }}>
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <CiViewTimeline style={{ fontSize: "48px" }}/>
                </div>

                <h3 className="empty-state-title">
                  Zaman Çizelgesi
                </h3>

                <p className="empty-state-description">
                  Görevleri tarih bazlı Gantt görünümünde görüntüleyin.
                </p>
              </div>
            </div>
          </div>
        </div>
    </AppLayout>
  );
}