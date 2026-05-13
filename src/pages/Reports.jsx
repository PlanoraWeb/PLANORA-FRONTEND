import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import { getDashboardAnalytics } from "../services/dashboardService";

function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const response = await getDashboardAnalytics();
        setAnalytics(response.data || null);
      } catch (error) {
        console.error("Failed to load report analytics:", error);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const summary = analytics?.summary || {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    openTasks: 0,
    activeSprints: 0,
    completionRate: 0,
  };

  const topProjects = useMemo(
    () => (analytics?.projectPerformance || []).sort((a, b) => b.completionRate - a.completionRate).slice(0, 5),
    [analytics]
  );

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Backend-powered delivery metrics across your workspace.</p>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="card-body" style={{ padding: 24, textAlign: "center" }}>
            Loading analytics...
          </div>
        </div>
      ) : (
        <>
          <div className="reports-summary-grid">
            <SummaryCard label="Projects" value={summary.totalProjects} />
            <SummaryCard label="Total Tasks" value={summary.totalTasks} />
            <SummaryCard label="Open Work" value={summary.openTasks} />
            <SummaryCard label="Completion" value={`${summary.completionRate}%`} />
          </div>

          <div className="reports-grid reports-grid-rich">
            <section className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h3>Completion trend</h3>
                  <p>Closed work in the last seven days.</p>
                </div>
              </div>
              <MiniBarChart items={analytics?.completionSeries || []} emptyMessage="No closed work in the last week." />
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h3>Status distribution</h3>
                  <p>How work is split across current states.</p>
                </div>
              </div>
              <ProgressList
                items={(analytics?.statusDistribution || []).map((item) => ({
                  label: item.name,
                  value: item.count,
                  percent: percentage(item.count, summary.totalTasks),
                }))}
                emptyMessage="No status data yet."
              />
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h3>Priority mix</h3>
                  <p>See how much urgent or high work is active.</p>
                </div>
              </div>
              <ProgressList
                items={(analytics?.priorityDistribution || []).map((item) => ({
                  label: item.name,
                  value: item.count,
                  percent: percentage(item.count, summary.totalTasks),
                }))}
                emptyMessage="No priority data yet."
              />
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h3>Work type mix</h3>
                  <p>Task, bug and story balance.</p>
                </div>
              </div>
              <ProgressList
                items={(analytics?.typeDistribution || []).map((item) => ({
                  label: item.name,
                  value: item.count,
                  percent: percentage(item.count, summary.totalTasks),
                }))}
                emptyMessage="No type data yet."
              />
            </section>

            <section className="dashboard-panel dashboard-panel-lg">
              <div className="dashboard-panel-header">
                <div>
                  <h3>Top project performance</h3>
                  <p>Projects with the strongest completion rate.</p>
                </div>
              </div>
              <div className="dashboard-stack">
                {topProjects.length > 0 ? (
                  topProjects.map((project) => (
                    <div key={project.id} className="reports-project-row">
                      <div>
                        <strong>{project.name}</strong>
                        <span>{project.completedTasks}/{project.totalTasks} completed</span>
                      </div>
                      <div className="reports-project-row-right">
                        <div className="dashboard-progress-track">
                          <div style={{ width: `${project.completionRate}%` }} />
                        </div>
                        <strong>{project.completionRate}%</strong>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dashboard-empty-panel">No project performance data yet.</div>
                )}
              </div>
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h3>Sprint health</h3>
                  <p>Planning and active sprint execution snapshot.</p>
                </div>
              </div>
              <div className="dashboard-stack">
                {(analytics?.sprintPerformance || []).slice(0, 6).map((sprint) => (
                  <div key={sprint.id} className="reports-sprint-card">
                    <div className="reports-sprint-top">
                      <strong>{sprint.name}</strong>
                      <span className={`badge ${sprint.status === "ACTIVE" ? "badge-primary" : "badge-gray"}`}>
                        {sprint.status}
                      </span>
                    </div>
                    <span>{sprint.projectName}</span>
                    <div className="dashboard-progress-track">
                      <div style={{ width: `${sprint.completionRate}%` }} />
                    </div>
                    <small>{sprint.completedTasks}/{sprint.totalTasks} completed</small>
                  </div>
                ))}
                {(analytics?.sprintPerformance || []).length === 0 && (
                  <div className="dashboard-empty-panel">No sprint data available.</div>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </AppLayout>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-value">{value}</div>
      <div className="dashboard-card-label">{label}</div>
    </div>
  );
}

function MiniBarChart({ items, emptyMessage }) {
  const maxValue = Math.max(...items.map((item) => item.count), 0);

  if (!items.some((item) => item.count > 0)) {
    return <div className="dashboard-empty-panel">{emptyMessage}</div>;
  }

  return (
    <div className="reports-bar-chart">
      {items.map((item) => (
        <div key={item.label} className="reports-bar-column">
          <span>{item.count}</span>
          <div
            className="reports-bar"
            style={{ height: `${Math.max(16, (item.count / Math.max(maxValue, 1)) * 160)}px` }}
          />
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  );
}

function ProgressList({ items, emptyMessage }) {
  if (items.length === 0) {
    return <div className="dashboard-empty-panel">{emptyMessage}</div>;
  }

  return (
    <div className="dashboard-stack">
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} className="dashboard-distribution-item">
          <div className="dashboard-distribution-top">
            <strong>{item.label}</strong>
            <span>{item.value}</span>
          </div>
          <div className="dashboard-progress-track">
            <div style={{ width: `${item.percent}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function percentage(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export default Reports;
