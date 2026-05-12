import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAtSign,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiMessageSquare,
  FiSend,
  FiUserPlus,
} from "react-icons/fi";
import AppLayout from "../layouts/AppLayout";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import "../styles/Inbox.css";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../services/notificationService";
import { formatRelativeTime } from "../utils/workflowUi";

const FILTERS = [
  { id: "ALL", label: "All" },
  { id: "MENTIONS", label: "Mentions" },
  { id: "ASSIGNMENTS", label: "Assignments" },
  { id: "STATUS", label: "Status Changes" },
  { id: "COMMENTS", label: "Comments" },
];

function matchesFilter(notification, filter) {
  if (filter === "ALL") return true;
  if (filter === "MENTIONS") return notification.type === "TASK_MENTION";
  if (filter === "ASSIGNMENTS") {
    return [
      "TASK_ASSIGNED",
      "TASK_UNASSIGNED",
      "PROJECT_MEMBER_ADDED",
      "PROJECT_MEMBER_REMOVED",
    ].includes(notification.type);
  }
  if (filter === "STATUS") {
    return ["TASK_STATUS_CHANGED", "SPRINT_STARTED", "SPRINT_COMPLETED"].includes(
      notification.type
    );
  }
  if (filter === "COMMENTS") return notification.type === "TASK_COMMENT";
  return true;
}

function formatType(type) {
  return (type || "notification")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getNotificationVisual(type) {
  if (type === "TASK_MENTION") {
    return { icon: FiAtSign, tone: "mention" };
  }
  if (type === "TASK_COMMENT") {
    return { icon: FiMessageSquare, tone: "comment" };
  }
  if (
    type === "PROJECT_MEMBER_ADDED" ||
    type === "PROJECT_MEMBER_REMOVED" ||
    type === "TASK_ASSIGNED" ||
    type === "TASK_UNASSIGNED"
  ) {
    return { icon: FiUserPlus, tone: "member" };
  }
  if (type === "SPRINT_STARTED" || type === "SPRINT_COMPLETED") {
    return { icon: FiClock, tone: "time" };
  }
  if (type === "TASK_STATUS_CHANGED") {
    return { icon: FiCheckCircle, tone: "status" };
  }
  return { icon: FiBell, tone: "default" };
}

function getNotificationProject(notification) {
  return (
    notification.metadata?.projectName ||
    notification.metadata?.projectId ||
    "Workspace"
  );
}

function getNotificationTaskLink(notification) {
  const taskId = notification.metadata?.taskId;
  return taskId ? `/task-details/${taskId}` : null;
}

function getDraftStorageKey(notificationId) {
  return notificationId ? `planora:inbox-draft:${notificationId}` : "";
}

function readLocalDraft(notificationId) {
  if (!notificationId || typeof window === "undefined") return null;

  try {
    const rawValue = localStorage.getItem(getDraftStorageKey(notificationId));
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    localStorage.removeItem(getDraftStorageKey(notificationId));
    return null;
  }
}

function Inbox() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState("");
  const [draftReply, setDraftReply] = useState("");
  const [draftStatus, setDraftStatus] = useState("Notes stay local for now.");

  const inboxOverview = useMemo(() => {
    const mentions = notifications.filter((item) => item.type === "TASK_MENTION").length;
    const assignments = notifications.filter((item) =>
      ["TASK_ASSIGNED", "TASK_UNASSIGNED", "PROJECT_MEMBER_ADDED"].includes(item.type)
    ).length;
    const comments = notifications.filter((item) => item.type === "TASK_COMMENT").length;
    const statusChanges = notifications.filter((item) =>
      ["TASK_STATUS_CHANGED", "SPRINT_STARTED", "SPRINT_COMPLETED"].includes(item.type)
    ).length;

    return [
      { label: "Unread", value: notifications.filter((item) => !item.isRead).length, icon: FiBell },
      { label: "Mentions", value: mentions, icon: FiAtSign },
      { label: "Assignments", value: assignments, icon: FiUserPlus },
      { label: "Status", value: statusChanges + comments, icon: FiCheckCircle },
    ];
  }, [notifications]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data?.data ?? []);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((notification) =>
        matchesFilter(notification, activeFilter)
      ),
    [notifications, activeFilter]
  );

  useEffect(() => {
    if (!visibleNotifications.length) {
      setSelectedId("");
      return;
    }

    if (!visibleNotifications.some((item) => item.id === selectedId)) {
      setSelectedId(visibleNotifications[0].id);
    }
  }, [selectedId, visibleNotifications]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const selectedNotification =
    visibleNotifications.find((notification) => notification.id === selectedId) ||
    null;

  useEffect(() => {
    if (!selectedNotification) {
      setDraftReply("");
      setDraftStatus("Notes stay local for now.");
      return;
    }

    const savedDraft = readLocalDraft(selectedNotification.id);
    setDraftReply(savedDraft?.value || "");
    setDraftStatus(
      savedDraft?.savedAt
        ? `Saved ${formatRelativeTime(savedDraft.savedAt)}`
        : "Notes stay local for now."
    );
  }, [selectedNotification]);

  const relatedNotifications = useMemo(() => {
    if (!selectedNotification) return [];

    return notifications
      .filter((notification) => {
        if (notification.id === selectedNotification.id) return false;

        return (
          notification.type === selectedNotification.type ||
          notification.metadata?.projectId ===
            selectedNotification.metadata?.projectId ||
          notification.metadata?.taskId === selectedNotification.metadata?.taskId
        );
      })
      .slice(0, 3);
  }, [notifications, selectedNotification]);

  const activityFeed = useMemo(() => {
    if (!selectedNotification) return [];

    return notifications
      .filter((notification) => {
        return (
          notification.id === selectedNotification.id ||
          notification.metadata?.taskId === selectedNotification.metadata?.taskId ||
          notification.metadata?.projectId ===
            selectedNotification.metadata?.projectId
        );
      })
      .slice(0, 6);
  }, [notifications, selectedNotification]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectNotification = async (notification) => {
    setSelectedId(notification.id);

    if (notification.isRead) return;

    try {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveDraft = () => {
    if (!selectedNotification || typeof window === "undefined") return;

    const payload = {
      value: draftReply,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      getDraftStorageKey(selectedNotification.id),
      JSON.stringify(payload)
    );
    setDraftStatus(`Saved ${formatRelativeTime(payload.savedAt)}`);
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inbox</h1>
          <p className="page-subtitle">
            Mentions, assignments, status changes, and project updates in one
            focused stream.
          </p>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={handleMarkAllAsRead}>
          Mark all as read
        </button>
      </div>

      <div className="linear-inbox-overview-grid">
        {inboxOverview.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="linear-inbox-overview-card">
              <div className="linear-inbox-overview-icon">
                <Icon size={15} />
              </div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="linear-inbox-shell">
        <aside className="linear-inbox-list-pane">
          <div className="linear-pane-header">
            <div>
              <h2>Updates</h2>
              <p>{unreadCount} unread items need review.</p>
            </div>
            <span className="linear-count-pill">{visibleNotifications.length}</span>
          </div>

          <div className="linear-filter-row">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                className={`linear-filter-pill ${
                  activeFilter === filter.id ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="linear-inbox-list">
            {loading ? (
              <div className="dashboard-empty-panel">Loading inbox...</div>
            ) : visibleNotifications.length === 0 ? (
              <div className="dashboard-empty-panel">
                No notifications in this view yet.
              </div>
            ) : (
              visibleNotifications.map((notification) => {
                const visual = getNotificationVisual(notification.type);
                const Icon = visual.icon;
                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={`linear-inbox-item ${
                      selectedId === notification.id ? "active" : ""
                    } ${notification.isRead ? "" : "unread"}`}
                    onClick={() => handleSelectNotification(notification)}
                  >
                    <div className={`linear-inbox-avatar ${visual.tone}`}>
                      <Icon size={15} />
                    </div>
                    <div className="linear-inbox-copy">
                      <div className="linear-inbox-topline">
                        <strong>{notification.title}</strong>
                        <span>{formatRelativeTime(notification.createdAt)}</span>
                      </div>
                      <div className="linear-inbox-project">
                        {getNotificationProject(notification)}
                      </div>
                      <p>{notification.message}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="linear-inbox-detail">
          {!selectedNotification ? (
            <div className="dashboard-empty-panel">Select a notification.</div>
          ) : (
            <>
              <header className="linear-issue-header">
                <div className="linear-issue-kicker">
                  <span className="badge badge-gray">
                    {formatType(selectedNotification.type)}
                  </span>
                  <span className="linear-detail-meta">
                    {selectedNotification.isRead ? "Read" : "Unread"}
                  </span>
                </div>
                <h2>{selectedNotification.title}</h2>
                <p>{selectedNotification.message}</p>
              </header>

              <div className="linear-suggestion-card">
                <div className="linear-card-header">
                  <strong>Related updates</strong>
                  <span>{relatedNotifications.length}</span>
                </div>
                {relatedNotifications.length === 0 ? (
                  <div className="linear-card-empty">
                    No related workspace activity matched this update yet.
                  </div>
                ) : (
                  relatedNotifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="linear-related-row"
                      onClick={() => handleSelectNotification(item)}
                    >
                      <span>{item.title}</span>
                      <small>{formatRelativeTime(item.createdAt)}</small>
                    </button>
                  ))
                )}
              </div>

              <div className="linear-activity-block">
                <h3>Activity</h3>
                <div className="linear-activity-list">
                  {activityFeed.map((item) => {
                    const visual = getNotificationVisual(item.type);
                    const Icon = visual.icon;
                    return (
                      <div key={item.id} className="linear-activity-item">
                        <div className={`linear-activity-mark ${visual.tone}`}>
                          <Icon size={14} />
                        </div>
                        <div className="linear-activity-copy">
                          <strong>{item.title}</strong>
                          <p>{item.message}</p>
                          <span>{formatRelativeTime(item.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="linear-composer-card">
                <textarea
                  value={draftReply}
                  onChange={(event) => {
                    setDraftReply(event.target.value);
                    setDraftStatus("Unsaved changes");
                  }}
                  placeholder="@Planora ask a follow-up about this update"
                />
                <div className="linear-composer-actions">
                  <span>{draftStatus}</span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveDraft}
                  >
                    <FiSend size={14} />
                    Save draft
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <aside className="linear-inbox-meta-pane">
          <div className="linear-pane-header">
            <div>
              <h2>Context</h2>
              <p>Quick facts for the selected update.</p>
            </div>
          </div>

          {selectedNotification ? (
            <>
              <div className="linear-meta-card">
                <MetaRow label="Status" value={selectedNotification.isRead ? "Read" : "Unread"} />
                <MetaRow
                  label="Workspace"
                  value={getNotificationProject(selectedNotification)}
                />
                <MetaRow
                  label="Type"
                  value={formatType(selectedNotification.type)}
                />
                <MetaRow
                  label="Received"
                  value={new Date(selectedNotification.createdAt).toLocaleString(
                    "en-US"
                  )}
                />
              </div>

              <div className="linear-meta-card">
                <div className="linear-card-header">
                  <strong>Navigation</strong>
                </div>
                {getNotificationTaskLink(selectedNotification) ? (
                  <Link
                    className="linear-link-row"
                    to={getNotificationTaskLink(selectedNotification)}
                  >
                    <span>Open related task</span>
                    <FiExternalLink size={14} />
                  </Link>
                ) : (
                  <div className="linear-card-empty">
                    This update is not linked to a specific task.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="dashboard-empty-panel">No notification selected.</div>
          )}
        </aside>
      </div>
    </AppLayout>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="linear-meta-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default Inbox;
