import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import { getDashboardSummary } from "../services/dashboardService";


function Dashboard() {
  const navigate = useNavigate();
  const [userName] = useState(() => {
  const storedUser = localStorage.getItem("user");
  
  // SADECE veri varsa VE "undefined" kelimesine eşit değilse parse et
  if (storedUser && storedUser !== "undefined") {
    try {
      const user = JSON.parse(storedUser);
      return user.firstName || "User";
    } catch (error) {
      console.error("User data parse error:", error);
      return "User";
    }
  }
  return "Guest"; // Veri yoksa veya bozuksa Guest dön
});
  const [summary, setSummary] = useState({
    projectCount: 0,
    openTaskCount: 0,
    totalTaskCount: 0,
    activeSprint: null,
    unreadNotificationCount: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!userName) {
      navigate("/login")
      return;
    }

    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await getDashboardSummary();
        if (res.data) {
          setSummary(res.data);
        }
      } catch (error) {
        console.error("Dashboard veri çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userName, navigate]);
  if (!userName) return null;
  
  return (
    <AppLayout>

      <div className="app-content">
        <div className="page-header">
          <h1 className="page-title">Good morning, {userName} 👋</h1>
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
            <div className="dashboard-card-value">{loading ? "..." : summary.projectCount}</div>
            <div className="dashboard-card-label">Active Projects</div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon accent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div className="dashboard-card-value">{loading ? "..." : summary.openTaskCount}</div>
            <div className="dashboard-card-label">My Open Tasks</div>
            <div className="dashboard-card-trend">{loading ? "" : `${summary.totalTaskCount} total tasks`}</div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="dashboard-card-value">
              {loading ? "..." : summary.activeSprint ? summary.activeSprint.name : "No Sprint"}
            </div>
            <div className="dashboard-card-label">Active Sprint</div>
            <div className="dashboard-card-trend">
              {summary.activeSprint ? `${summary.activeSprint.taskCount} tasks in sprint` : 'Ready to plan'}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div className="dashboard-card-value">{loading ? "..." : summary.unreadNotificationCount}</div>
            <div className="dashboard-card-label">Unread Notifications</div>
          </div>

        </div>

      </div>

    </AppLayout>
  );
}

export default Dashboard;