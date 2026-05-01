import AppLayout from "../layouts/AppLayout";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import "../styles/Board.css";
import "../styles/App.css";
import { useState } from "react";
import Board from "../components/ProjectTabs";

export default function Goals() {
  const [activeTab, setActiveTab] = useState("goals");

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
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>

            <h3 className="empty-state-title">Amaçlar</h3>

            <p className="empty-state-description">
              Proje hedeflerini belirleyin ve ilerlemeyi takip edin.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}