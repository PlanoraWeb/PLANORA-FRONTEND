import AppLayout from "../layouts/AppLayout";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";


const mockTasks = [
  {
    id: "PRO-101",
    title: "Fix login bug",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "PRO-102",
    title: "Design onboarding screen",
    status: "To Do",
    priority: "Medium",
  },
  {
    id: "PRO-103",
    title: "API integration for dashboard",
    status: "Review",
    priority: "High",
  },
  {
    id: "PRO-104",
    title: "Update UI components",
    status: "Done",
    priority: "Low",
  },
];

function getStatusClass(status) {
  switch (status) {
    case "In Progress":
      return "badge badge-primary";
    case "To Do":
      return "badge badge-gray";
    case "Review":
      return "badge badge-warning";
    case "Done":
      return "badge badge-success";
    default:
      return "badge";
  }
}

export default function MyTasks() {
  return (
    <AppLayout>
  
      

      {/* MAIN */}
      <main className="app-main">
        <header className="app-navbar">
          <h1 className="page-title">My Tasks</h1>
        </header>

        <div className="app-content">
          <div className="card">
            <div className="card-header">
              <h3>Assigned to me</h3>
            </div>

            <div className="card-body">
              {mockTasks.map((task) => (
                <a
                  key={task.id}
                  href={`/task/${task.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    borderBottom: "1px solid var(--border-subtle)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{task.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                      {task.id} · Priority: {task.priority}
                    </div>
                  </div>

                  <span className={getStatusClass(task.status)}>
                    {task.status}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}