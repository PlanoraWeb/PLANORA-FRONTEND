import React, { useState, useEffect } from "react";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css"
import "../styles/Inbox.css";
import AppLayout from "../layouts/AppLayout";
import { getNotifications, markAllAsRead, markAsRead } from "../services/notificationService";

function Inbox() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data?.data ?? []);
    } catch (error) {
      console.error("Bildirimler yüklenirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = localStorage.getItem("planora-theme");
    if (t === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AppLayout>
    <div className="app-layout">
      
      

      {/* MAIN */}
      <main className="app-main">
        

        {/* CONTENT */}
        <div className="app-content">
          
          <div className="page-header">
            <div>
              <h1 className="page-title">Inbox</h1>
              <p className="page-subtitle">
                Notifications and mentions across your projects.
              </p>
            </div>

            <button className="btn btn-ghost btn-sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
          </div>

          {/* FILTERS */}
          <div className="inbox-filters">
            <button className="inbox-filter-btn active">All</button>
            <button className="inbox-filter-btn">Mentions</button>
            <button className="inbox-filter-btn">Assignments</button>
            <button className="inbox-filter-btn">Status changes</button>
            <button className="inbox-filter-btn">Comments</button>
          </div>

          {/* INBOX LIST */}
          <div className="card">
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center' }}>Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center' }}>No notifications found.</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`inbox-item ${!notif.isRead ? "unread" : ""}`}
                  onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
                >
                  <div className="inbox-dot" style={{ opacity: notif.isRead ? 0 : 1 }}></div>
                  <div className="avatar">{notif.type.charAt(0)}</div>

                  <div className="inbox-content">
                    <div className="inbox-meta">
                      <strong>{notif.title}</strong> · {new Date(notif.createdAt).toLocaleString()}
                    </div>
                    <div className="inbox-preview">
                      {notif.message}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
    </AppLayout>
  );
}

export default Inbox;