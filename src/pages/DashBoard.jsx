import AppLayout from "../layouts/AppLayout";
// import "../styles/Das";


function Dashboard() {
  return (
    <AppLayout>

      <div className="app-content">
        <div className="page-header">
          <h1 className="page-title">Good morning, Alex 👋</h1>
          <p className="page-subtitle">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="dashboard-cards">

          <div className="dashboard-card">
            <div className="dashboard-card-icon primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="dashboard-card-value">8</div>
            <div className="dashboard-card-label">Active Projects</div>
            <div className="dashboard-card-trend">↑ +12% from last month</div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon accent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div className="dashboard-card-value">24</div>
            <div className="dashboard-card-label">My Open Tasks</div>
            <div className="dashboard-card-trend">3 due this week</div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="dashboard-card-value">Sprint 12</div>
            <div className="dashboard-card-label">Active Sprint</div>
            <div className="dashboard-card-trend">42 pts · 68% complete</div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div className="dashboard-card-value">38 pts</div>
            <div className="dashboard-card-label">Weekly Velocity</div>
            <div className="dashboard-card-trend">↑ +5% avg</div>
          </div>

        </div>

      </div>

    </AppLayout>
  );
}

export default Dashboard;