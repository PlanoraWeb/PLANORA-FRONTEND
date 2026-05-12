import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import { getDashboardOverview } from "../services/dashboardService";
import { FiAlertCircle, FiArrowRight, FiBell, FiCheckCircle, FiClock, FiFolder, FiTarget } from "react-icons/fi";

function Dashboard() {
  const navigate = useNavigate();
  const [userName] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const user = JSON.parse(storedUser);
        return user.firstName || "User";
      } catch (error) {
        console.error("User data parse error:", error);
      }
    }
    return "Guest";
  });
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userName) {
      navigate("/login");
      return;
    }

    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await getDashboardOverview();
        setOverview(res.data || null);
      } catch (error) {
        console.error("Dashboard overview fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [navigate, userName]);

  const metrics = overview?.metrics || {
    activeProjectCount: 0,
    openTaskCount: 0,
    completedTaskCount: 0,
    overdueTaskCount: 0,
    unreadNotificationCount: 0,
    dueSoonTaskCount: 0,
  };

  const statusBreakdown = useMemo(() => overview?.statusBreakdown || [], [overview]);

  return (
    <AppLayout>
      <section className="dashboard-shell">
        <div className="dashboard-hero">
          <div>
            <span className="dashboard-hero-kicker">Daily command center</span>
            <h1 className="dashboard-hero-title">Good morning, {userName}</h1>
            <p className="dashboard-hero-subtitle">
              Track sprint health, upcoming work, and team signals without leaving your workspace.
            </p>
          </div>

          <div className="dashboard-hero-side">
            <div className="dashboard-highlight-card">
              <span className="dashboard-highlight-label">Active sprint</span>
              <strong>{loading ? "Loading..." : overview?.activeSprint?.name || "No active sprint"}</strong>
              <p>
                {overview?.activeSprint
                  ? `${overview.activeSprint.project.projectName} · ${overview.activeSprint.completedTaskCount}/${overview.activeSprint.taskCount} tasks closed`
                  : "Use backlog planning to start the next sprint."}
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-cards">
          <MetricCard icon={<FiFolder />} label="Active Projects" value={metrics.activeProjectCount} tone="primary" />
          <MetricCard icon={<FiTarget />} label="Open Tasks" value={metrics.openTaskCount} helper={`${metrics.completedTaskCount} completed`} tone="accent" />
          <MetricCard icon={<FiClock />} label="Due Soon" value={metrics.dueSoonTaskCount} helper="Next 7 days" tone="warning" />
          <MetricCard icon={<FiBell />} label="Unread Notifications" value={metrics.unreadNotificationCount} helper={`${metrics.overdueTaskCount} overdue tasks`} tone="info" />
        </div>

        <div className="dashboard-main-grid">
          <section className="dashboard-panel dashboard-panel-lg">
            <div className="dashboard-panel-header">
              <div>
                <h3>Project momentum</h3>
                <p>How your active projects are progressing right now.</p>
              </div>
              <Link to="/projects" className="dashboard-link-action">
                All projects <FiArrowRight size={14} />
              </Link>
            </div>

            <div className="dashboard-project-grid">
              {(overview?.activeProjects || []).map((project) => (
                <Link key={project.id} to={`/project-detail?projectId=${project.id}`} className="dashboard-project-card">
                  <div className="dashboard-project-card-top">
                    <div>
                      <strong>{project.name}</strong>
                      <span>{project.activeSprintName || "No active sprint"}</span>
                    </div>
                    <span className="dashboard-project-rate">{project.completionRate}%</span>
                  </div>
                  <p>{project.description || "Shared delivery workspace for planning, execution, and follow-up."}</p>
                  <div className="dashboard-progress-track">
                    <div style={{ width: `${project.completionRate}%` }} />
                  </div>
                  <div className="dashboard-project-stats">
                    <span>{project.openTasks} open</span>
                    <span>{project.doneTasks} done</span>
                    <span>{project.memberCount} members</span>
                  </div>
                </Link>
              ))}
              {!loading && (overview?.activeProjects || []).length === 0 && (
                <EmptyPanel text="No active projects yet." />
              )}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h3>Workload</h3>
                <p>Assigned work distribution by status.</p>
              </div>
            </div>

            <div className="dashboard-stack">
              {statusBreakdown.length > 0 ? (
                statusBreakdown.map((item) => (
                  <div key={item.name} className="dashboard-distribution-item">
                    <div className="dashboard-distribution-top">
                      <strong>{item.name}</strong>
                      <span>{item.count}</span>
                    </div>
                    <div className="dashboard-progress-track">
                      <div style={{ width: `${Math.max(10, (item.count / Math.max(metrics.openTaskCount, 1)) * 100)}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyPanel text="No open task distribution available." />
              )}
            </div>
          </section>

          <section className="dashboard-panel dashboard-panel-lg">
            <div className="dashboard-panel-header">
              <div>
                <h3>Upcoming tasks</h3>
                <p>The tasks most likely to need attention next.</p>
              </div>
              <Link to="/tasks" className="dashboard-link-action">
                My tasks <FiArrowRight size={14} />
              </Link>
            </div>

            <div className="dashboard-list">
              {(overview?.upcomingTasks || []).map((task) => (
                <Link key={task.id} to={`/task-details/${task.id}`} className="dashboard-list-item">
                  <div className="dashboard-list-badge">
                    {task.priority === "URGENT" || task.priority === "HIGH" ? <FiAlertCircle size={16} /> : <FiCheckCircle size={16} />}
                  </div>
                  <div className="dashboard-list-content">
                    <strong>{task.title}</strong>
                    <span>{task.project?.projectName} · {task.statusName}</span>
                  </div>
                  <div className="dashboard-list-meta">
                    <span className={`badge ${task.priority === "URGENT" || task.priority === "HIGH" ? "badge-error" : "badge-primary"}`}>
                      {task.priority}
                    </span>
                    <small>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</small>
                  </div>
                </Link>
              ))}
              {!loading && (overview?.upcomingTasks || []).length === 0 && (
                <EmptyPanel text="No upcoming tasks assigned yet." />
              )}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h3>Recent notifications</h3>
                <p>Latest updates across your workspace.</p>
              </div>
              <Link to="/inbox" className="dashboard-link-action">
                Inbox <FiArrowRight size={14} />
              </Link>
            </div>

            <div className="dashboard-activity-list">
              {(overview?.recentNotifications || []).map((notification) => (
                <div key={notification.id} className={`dashboard-activity-item ${notification.isRead ? "" : "unread"}`}>
                  <div className="dashboard-activity-dot" />
                  <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {!loading && (overview?.recentNotifications || []).length === 0 && (
                <EmptyPanel text="No recent notifications." />
              )}
            </div>
          </section>
        </div>
      </section>
    </AppLayout>
  );
}

function MetricCard({ icon, label, value, helper, tone }) {
  return (
    <div className="dashboard-card">
      <div className={`dashboard-card-icon ${tone}`}>{icon}</div>
      <div className="dashboard-card-value">{value}</div>
      <div className="dashboard-card-label">{label}</div>
      {helper ? <div className="dashboard-card-trend">{helper}</div> : null}
    </div>
  );
}

function EmptyPanel({ text }) {
  return <div className="dashboard-empty-panel">{text}</div>;
}

export default Dashboard;
