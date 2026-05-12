import { useState, useEffect } from "react";
import AppLayout from "../layouts/AppLayout";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import { getMyTasks } from "../services/taskService";
import { Link } from "react-router-dom";


function getStatusClass(statusName) {
  if (!statusName) return "badge";
  const status = statusName.toUpperCase();
  switch (status) {
    case "IN PROGRESS":
    case "DOING":
      return "badge badge-primary";
    case "TO DO":
    case "TODO":
      return "badge badge-gray";
    case "REVIEW":
    case "TEST":
      return "badge badge-warning";
    case "DONE":
      return "badge badge-success";
    default:
      return "badge";
  }
}

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getMyTasks();
        // Backend returns standard response structure { success: true, data: [...] }
        setTasks(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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
              {loading ? (
                <div style={{ padding: "12px", color: "var(--text-tertiary)" }}>Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div style={{ padding: "12px", color: "var(--text-tertiary)" }}>No tasks assigned to you.</div>
              ) : (
                tasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/task-details/${task.id}`}
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
                        {task.project?.projectName} · Priority: {task.priority}
                      </div>
                    </div>

                    <span className={getStatusClass(task.status?.name)}>
                      {task.status?.name || 'Unknown'}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
