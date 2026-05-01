import AppLayout from "../layouts/AppLayout";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import "../styles/Board.css";
import "../styles/App.css";
import Board from "../components/ProjectTabs";
import { useState } from "react";

export default function Forms() {
    const [activeTab, setActiveTab] = useState("forms");
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>

                <h3 className="empty-state-title">Formlar</h3>

                <p className="empty-state-description">
                  Özel formlar oluşturup yeni issue'ları toplayın.
                </p>
              </div>
            </div>
          </div>

    </AppLayout>
  );
}