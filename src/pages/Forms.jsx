import { Link } from "react-router-dom";
import ProjectWorkspaceShell from "../components/ProjectWorkspaceShell";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

export default function Forms() {
  const workspace = useProjectWorkspace("forms");
  const project = workspace.selectedProject;
  const statuses = workspace.insights?.project?.statuses || [];
  const members = workspace.insights?.project?.members || [];

  return (
    <ProjectWorkspaceShell
      {...workspace}
      actions={
        <Link
          className="btn btn-primary btn-sm"
          to={`/create-issue${workspace.selectedProjectId ? `?projectId=${workspace.selectedProjectId}` : ""}`}
        >
          New intake
        </Link>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-6)",
        }}
      >
        <div className="card">
          <div className="card-header">
            <h3>Issue intake defaults</h3>
          </div>
          <div className="card-body" style={{ display: "grid", gap: "var(--space-4)" }}>
            <InfoRow label="Project" value={project?.projectName || "-"} />
            <InfoRow
              label="Default status"
              value={statuses.find((status) => status.isDefault)?.name || statuses[0]?.name || "-"}
            />
            <InfoRow label="Assignable members" value={members.length} />
            <InfoRow
              label="Suggested due soon"
              value={`${workspace.insights?.upcomingTasks?.length || 0} scheduled tasks`}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recommended templates</h3>
          </div>
          <div className="card-body" style={{ display: "grid", gap: 12 }}>
            <TemplateCard
              title="Bug report"
              body="Expected behavior, actual behavior, environment, and reproduction steps."
            />
            <TemplateCard
              title="Feature request"
              body="Problem statement, user value, acceptance criteria, and rollout notes."
            />
            <TemplateCard
              title="Sprint carry-over"
              body="Reason for carry-over, blockers, owner, and revised due date."
            />
          </div>
        </div>
      </div>
    </ProjectWorkspaceShell>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TemplateCard({ title, body }) {
  return (
    <div
      style={{
        padding: "var(--space-4)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{body}</div>
    </div>
  );
}
