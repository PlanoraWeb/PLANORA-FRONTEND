import { useState, useEffect } from "react";
import "../styles/App.css";
import "../styles/Component.css";
import "../styles/DesignSystem.css";
import AppLayout from "../layouts/AppLayout";
import { useParams, useNavigate } from "react-router-dom";
import { getTaskById, updateTask } from "../services/taskService";



const getPriorityClass = (priority) => {
  switch (priority) {
    case "LOW":
      return "priority-low";
    case "MEDIUM":
      return "priority-medium";
    case "HIGH":
      return "priority-high";
    case "URGENT":
      return "priority-urgent";
    default:
      return "priority-medium";
  }
};

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await getTaskById(id);
        setTask(res.data?.data);
        setComments(res.data?.data?.comments || []);
      } catch (err) {
        console.error("Failed to fetch task", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTask();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setTask((prev) => ({
      ...prev,
      status: { ...(prev?.status || {}), code: newStatus },
    }));

    try {
      await updateTask(id, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleAddComment = async () => {
      if (!commentText.trim()) return;

      const newComment = {
        id: Date.now().toString(),
        text: commentText,
        author: {
          firstName: "You",
          lastName: "",
        },
        createdAt: new Date().toISOString(),
      };

      // optimistic update
      setComments((prev) => [...prev, newComment]);
      setCommentText("");

      try {
        // backend varsa buraya API koyarsın
        // await createComment(task.id, commentText);
      } catch (err) {
        console.error("Failed to add comment", err);
      }
    };

  if (loading) {
    return (
      <AppLayout>
        <div className="app-content">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="app-main">
        <div className="app-content">

          {/* PROJECT HEADER (Planora style) */}
          <div className="board-project-context" style={{ marginBottom: "var(--space-4)" }}>
            <span className="board-area-label">Task</span>

            <h1 className="board-project-title" style={{ flex: 1 }}>
              {task?.title}
            </h1>

            <div className="board-header-actions">
              <button className="btn btn-ghost btn-sm">⋯</button>
            </div>
          </div>

          {/* MAIN LAYOUT */}
          <div className="task-detail-layout" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)" }}>

            {/* LEFT */}
            <div className="task-detail-main">

              {/* PROJECT LINK */}
              <div style={{ marginBottom: 12 }}>
                <div className="board-area-label">Project</div>

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "var(--primary-600)",
                    cursor: "pointer",
                    letterSpacing: "-0.2px",
                  }}
                  onClick={() =>
                    navigate(`/project-detail/${task?.project?.id}`)
                  }
                >
                  {task?.project?.projectName || "-"}
                </div>
              </div>

              {/* TASK ID */}
              <div className="badge badge-gray" style={{ marginBottom: 10 }}>
                {task?.id}
              </div>

              {/* DESCRIPTION CARD */}
              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-header">
                  <h3>Description</h3>
                </div>
                <div className="card-body">
                  <div className="task-description">
                    {task?.description || "No description"}
                  </div>
                </div>
              </div>

              {/* COMMENTS */}
              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-header">
                  <h3>Comments</h3>
                </div>

                <div className="card-body">

                  {/* Comment List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                    {comments.length === 0 && (
                      <span style={{ color: "var(--text-tertiary)", fontSize: 14 }}>
                        No comments yet
                      </span>
                    )}

                    {comments.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          padding: 10,
                          border: "1px solid var(--border-subtle)",
                          borderRadius: 8,
                          background: "var(--bg-secondary)",
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {c.author?.firstName} {c.author?.lastName}
                        </div>

                        <div style={{ fontSize: 14, marginTop: 4 }}>
                          {c.text}
                        </div>

                        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 6 }}>
                          {new Date(c.createdAt).toLocaleString("tr-TR")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="input"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleAddComment}
                    >
                      Send
                    </button>
                  </div>

                </div>
              </div>

            </div>

            
            {/* RIGHT SIDEBAR */}
            <div className="task-detail-sidebar">

              <div className="card">
                <div className="card-header">
                  <h3>Details</h3>
                </div>

                <div className="card-body">

                  {/* STATUS */}
                  <div className="task-field task-field-editable">
                    <span>Status</span>

                    <select
                      className="status-select"
                      value={task?.status?.code || ""}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>

                  {/* ASSIGNEE */}
                  <div className="task-field">
                    <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                      Assignee
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      {task?.assignee?.firstName} {task?.assignee?.lastName}
                    </span>
                  </div>

                  {/* PRIORITY */}
                 <div className="task-field">
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    Priority
                  </span>
                  <span className={`badge ${getPriorityClass(task?.priority)}`}>
                    {task?.priority}
                  </span>
                </div>

                  {/* DUE DATE */}
                  <div className="task-field">
                    <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Due Date </span>
                    <span>
                      {task?.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("tr-TR")
                        : "-"}
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </AppLayout>
  );
}