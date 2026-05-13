import ProjectWorkspaceShell from "../components/ProjectWorkspaceShell";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

export default function ArchivePage() {
  const workspace = useProjectWorkspace("archive");
  const archivedTasks = workspace.insights?.archivedTasks || [];

  return (
    <ProjectWorkspaceShell {...workspace}>
      <div className="card">
        <div className="card-header">
          <h3>Completed work archive</h3>
        </div>
        <div className="card-body">
          {archivedTasks.length === 0 ? (
            <div className="service-empty">No archived tasks yet.</div>
          ) : (
            <div className="table-container" style={{ border: "none" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Finished</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedTasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td>{task.type}</td>
                      <td>{task.priority}</td>
                      <td>{new Date(task.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProjectWorkspaceShell>
  );
}
