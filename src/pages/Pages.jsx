import ProjectWorkspaceShell from "../components/ProjectWorkspaceShell";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

export default function Pages() {
  const workspace = useProjectWorkspace("pages");
  const insights = workspace.insights;

  const knowledgeCards = [
    {
      title: "Project brief",
      body: insights?.project?.description || "Add a project description to document the brief.",
    },
    {
      title: "Current sprint goal",
      body:
        insights?.summary?.activeSprint?.goal ||
        "No active sprint goal has been defined yet.",
    },
    {
      title: "Team roster",
      body: `${insights?.summary?.memberCount || 0} team members are currently in this workspace.`,
    },
  ];

  return (
    <ProjectWorkspaceShell {...workspace}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {knowledgeCards.map((card) => (
          <div className="card" key={card.title}>
            <div className="card-header">
              <h3>{card.title}</h3>
            </div>
            <div className="card-body">
              <div className="task-description">{card.body}</div>
            </div>
          </div>
        ))}
      </div>
    </ProjectWorkspaceShell>
  );
}
