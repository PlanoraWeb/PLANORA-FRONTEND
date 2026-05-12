export default function ProjectTabs({
  activeTab,
  onTabChange,
  projectName = "Project workspace",
  projectMeta = "Project",
  actions = null,
}) {
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "board", label: "Board" },
    { key: "backlog", label: "Backlog" },
    { key: "sprints", label: "Sprints" },
    { key: "timeline", label: "Timeline" },
    { key: "calendar", label: "Calendar" },
    { key: "forms", label: "Intake" },
    { key: "goals", label: "Goals" },
    { key: "development", label: "Development" },
    { key: "archive", label: "Archive" },
    { key: "pages", label: "Knowledge" },
    { key: "scope", label: "Scope" },
    { key: "code", label: "Release" },
  ];

  return (
    <>
      <div className="board-project-context">
        <span className="board-area-label">{projectMeta}</span>
        <h1 className="board-project-title">{projectName}</h1>

        <div className="board-header-actions">{actions}</div>
      </div>

      <nav className="project-main-nav">
        {tabs.map((tab) => (
          <button
            type="button"
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
