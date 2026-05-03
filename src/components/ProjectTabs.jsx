export default function ProjectTabs({ activeTab, onTabChange }) {
  const tabs = [
    { key: "overview", label: "Özet" },
    { key: "board", label: "Durum panosu" },
    { key: "backlog", label: "Liste" },
    { key: "sprints", label: "Sprint" },
    { key: "timeline", label: "Zaman Çizelgesi" },
    { key: "calendar", label: "Takvim" },
    { key: "forms", label: "Formlar" },
    { key: "goals", label: "Amaçlar" },
    { key: "development", label: "Geliştirme" },
    { key: "archive", label: "Arşivlenen Biletler" },
    { key: "pages", label: "Sayfalar" },
    { key: "scope", label: "Kapsam" },
    { key: "code", label: "Kod" },
  ];

  return (
    <>
      {/* PROJECT HEADER */}
      <div className="board-project-context">
        <span className="board-area-label">Alan</span>
        <h1 className="board-project-title">Q3 Roadmap</h1>

        <div className="board-header-actions">
          <button className="navbar-btn">⋯</button>
        </div>
      </div>

      {/* TABS */}
      <nav className="project-main-nav">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`project-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  );
}