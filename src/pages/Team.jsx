import { useEffect, useMemo, useState } from "react";
import { FiTrash2, FiUserPlus, FiUsers } from "react-icons/fi";
import AppLayout from "../layouts/AppLayout";
import {
  addProjectMember,
  getProjects,
  removeProjectMember,
} from "../services/projectService";
import { getAllUsers } from "../services/userService";
import "../styles/PageForms.css";

function getErrorMessage(error, fallback) {
  return (
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    fallback
  );
}

function Team() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [memberForm, setMemberForm] = useState({
    userId: "",
    role: "MEMBER",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingUserId, setRemovingUserId] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [projectRes, userRes] = await Promise.all([
        getProjects(),
        getAllUsers(),
      ]);
      const projectList = projectRes.data?.data ?? [];
      setProjects(projectList);
      setUsers(userRes.data?.data ?? []);
      setSelectedProjectId((current) => current || projectList[0]?.id || "");
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Team data could not be loaded."),
      });
    } finally {
      setLoading(false);
    }
  }

  async function refreshProjects() {
    const res = await getProjects();
    const projectList = res.data?.data ?? [];
    setProjects(projectList);
    setSelectedProjectId((current) => {
      if (projectList.some((project) => project.id === current)) return current;
      return projectList[0]?.id || "";
    });
  }

  function updateMemberForm(name, value) {
    setMemberForm((current) => ({ ...current, [name]: value }));
    setMessage(null);
  }

  async function handleAddMember(event) {
    event.preventDefault();
    if (!selectedProjectId || !memberForm.userId) return;

    setSaving(true);
    try {
      await addProjectMember(selectedProjectId, {
        userId: memberForm.userId,
        role: memberForm.role,
      });
      await refreshProjects();
      setMemberForm({ userId: "", role: "MEMBER" });
      setMessage({ type: "success", text: "Member added to project." });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Member could not be added."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveMember(userId) {
    if (!selectedProjectId || !userId) return;

    setRemovingUserId(userId);
    try {
      await removeProjectMember(selectedProjectId, userId);
      await refreshProjects();
      setMessage({ type: "success", text: "Member removed from project." });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Member could not be removed."),
      });
    } finally {
      setRemovingUserId("");
    }
  }

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const members = selectedProject?.members ?? [];
  const memberUserIds = new Set(
    members.map((member) => member.user?.id || member.userId)
  );
  const availableUsers = users.filter((user) => !memberUserIds.has(user.id));

  return (
    <AppLayout>
      <div className="service-page-header">
        <div>
          <h1>Team</h1>
          <p>Manage your project team members.</p>
        </div>
      </div>

      {message && (
        <div className={`service-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="service-grid">
        <section className="service-panel">
          <div className="service-panel-header">
            <div>
              <h2>Project members</h2>
              <p>Select a project to manage its team.</p>
            </div>
            <FiUsers size={20} />
          </div>

          {loading ? (
            <div className="service-empty">Loading team data...</div>
          ) : (
            <>
              <div className="service-field">
                <label htmlFor="team-project">Project</label>
                <select
                  id="team-project"
                  value={selectedProjectId}
                  onChange={(event) => {
                    setSelectedProjectId(event.target.value);
                    setMemberForm({ userId: "", role: "MEMBER" });
                    setMessage(null);
                  }}
                >
                  {projects.length === 0 && (
                    <option value="">No projects available</option>
                  )}
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="service-list">
                {members.length === 0 ? (
                  <div className="service-empty">No members in this project.</div>
                ) : (
                  members.map((member) => {
                    const user = member.user;
                    const userId = user?.id || member.userId;
                    return (
                      <div className="service-list-item" key={member.id || userId}>
                        <div className="service-avatar">
                          {getInitials(user?.firstName, user?.lastName)}
                        </div>
                        <div className="service-list-content">
                          <strong>
                            {user?.firstName} {user?.lastName}
                          </strong>
                          <span>
                            {user?.email || "Project member"} -{" "}
                            {member.role?.name || "Member"}
                          </span>
                        </div>
                        <button
                          className="btn btn-secondary btn-sm"
                          type="button"
                          onClick={() => handleRemoveMember(userId)}
                          disabled={removingUserId === userId}
                        >
                          <FiTrash2 size={14} />
                          {removingUserId === userId ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </section>

        <aside className="service-panel">
          <div className="service-panel-header">
            <div>
              <h2>Add member</h2>
              <p>Choose a user and project role.</p>
            </div>
            <FiUserPlus size={20} />
          </div>

          <form className="service-form" onSubmit={handleAddMember}>
            <div className="service-field">
              <label htmlFor="team-user">User</label>
              <select
                id="team-user"
                value={memberForm.userId}
                onChange={(event) => updateMemberForm("userId", event.target.value)}
                disabled={!selectedProjectId || availableUsers.length === 0}
                required
              >
                <option value="">
                  {availableUsers.length === 0
                    ? "No users available"
                    : "Select a user"}
                </option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="service-field">
              <label htmlFor="team-role">Role</label>
              <select
                id="team-role"
                value={memberForm.role}
                onChange={(event) => updateMemberForm("role", event.target.value)}
              >
                <option value="MEMBER">Member</option>
                <option value="PROJECT_ADMIN">Project admin</option>
              </select>
            </div>

            <div className="service-actions">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={!memberForm.userId || saving}
              >
                <FiUserPlus size={16} />
                {saving ? "Adding..." : "Add member"}
              </button>
            </div>
          </form>
        </aside>
      </div>
    </AppLayout>
  );
}

function getInitials(firstName = "", lastName = "") {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
}

export default Team;
