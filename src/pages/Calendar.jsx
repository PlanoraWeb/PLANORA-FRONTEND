import AppLayout from "../layouts/AppLayout";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import "../styles/Board.css";
import "../styles/App.css";
import Board from "../components/ProjectTabs";
import { useState } from "react";


export default function CalendarPage() {
    const [activeTab, setActiveTab] = useState("calendar");
        
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


        <Board activeTab={activeTab} onTabChange={handleTab} />
          {/* EMPTY STATE */}
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
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>

                <h3 className="empty-state-title">
                  Takvim
                </h3>

                <p className="empty-state-description">
                  Vade tarihleri ve sprintleri takvim görünümünde planlayın.
                </p>

              </div>

            </div>
          </div>
    </AppLayout>
  );
}