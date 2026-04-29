import { useState, useEffect, useRef } from "react";
import AppLayout from "../layouts/AppLayout";
import "../styles/Projects.css";
import "../styles/Component.css";
import { FiPlus, FiSearch, FiGrid, FiList, FiMoreVertical, FiEdit2, FiTrash2, FiUsers, FiCheckSquare, FiFolder, FiCalendar } from "react-icons/fi";
import { getProjects, createProject, deleteProject, updateProject } from "../services/projectService";

/* ── Random avatar color palette ───────────────────────────────── */
const AVATAR_COLORS = [
  "linear-gradient(135deg, #00b894, #00cec9)",
  "linear-gradient(135deg, #6c5ce7, #a29bfe)",
  "linear-gradient(135deg, #fd79a8, #e84393)",
  "linear-gradient(135deg, #fdcb6e, #e17055)",
  "linear-gradient(135deg, #0984e3, #74b9ff)",
  "linear-gradient(135deg, #00cec9, #81ecec)",
];

const PROJECT_COLORS = [
  "#00b894", "#6c5ce7", "#e84393", "#fdcb6e",
  "#0984e3", "#00cec9", "#e17055", "#636e72",
  "#d63031", "#2d3436",
];

/* ── Helper: initials ──────────────────────────────────────────── */
function getInitials(first = "", last = "") {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

/* ── Helper: format date ───────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Helper: generate project key ──────────────────────────────── */
function generateKey(name = "") {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 4);
}

/* ================================================================
   PROJECTS PAGE
   ================================================================ */
function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  /* ── Fetch projects ────────────────────────────────────────────── */
  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.data?.data ?? []);
    } catch (err) {
      console.error("Failed to load projects", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  /* ── Create project ────────────────────────────────────────────── */
  async function handleCreate(data) {
    try {
      await createProject(data);
      setShowCreateModal(false);
      fetchProjects();
    } catch (err) {
      console.error("Failed to create project", err);
    }
  }

  /* ── Update project ────────────────────────────────────────────── */
  async function handleUpdate(id, data) {
    try {
      await updateProject(id, data);
      setEditTarget(null);
      fetchProjects();
    } catch (err) {
      console.error("Failed to update project", err);
    }
  }

  /* ── Delete project ────────────────────────────────────────────── */
  async function handleDelete(id) {
    try {
      await deleteProject(id);
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  }

  /* ── Filter ────────────────────────────────────────────────────── */
  const filtered = projects.filter((p) =>
    (p.projectName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── Stats ─────────────────────────────────────────────────────── */
  const totalProjects = projects.length;
  const totalTasks = projects.reduce((sum, p) => sum + (p._count?.tasks ?? 0), 0);
  const totalMembers = projects.reduce((sum, p) => sum + (p._count?.members ?? 0), 0);

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="projects-header">
        <div className="projects-header-left">
          <h1>Projects</h1>
          <p>Manage and track all your team projects in one place.</p>
        </div>
        <div className="projects-header-actions">
          <button
            className="btn btn-primary"
            id="create-project-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus size={16} />
            New Project
          </button>
        </div>
      </div>

      {/* Stats Chips */}
      <div className="projects-stats">
        <div className="projects-stat-chip">
          <span className="stat-dot active" />
          <span className="stat-count">{totalProjects}</span> Projects
        </div>
        <div className="projects-stat-chip">
          <span className="stat-dot completed" />
          <span className="stat-count">{totalTasks}</span> Tasks
        </div>
        <div className="projects-stat-chip">
          <span className="stat-dot archived" />
          <span className="stat-count">{totalMembers}</span> Members
        </div>
      </div>

      {/* Toolbar */}
      <div className="projects-toolbar">
        <div className="projects-search">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="search-projects-input"
          />
        </div>
        <div className="projects-toolbar-right">
          <div className="view-toggle-group">
            <button
              className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view"
              id="grid-view-btn"
            >
              <FiGrid size={16} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view"
              id="list-view-btn"
            >
              <FiList size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingGrid />
      ) : filtered.length === 0 ? (
        <EmptyState
          hasSearch={searchQuery.length > 0}
          onCreate={() => setShowCreateModal(true)}
        />
      ) : viewMode === "grid" ? (
        <div className="projects-grid">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              onEdit={(p) => setEditTarget(p)}
              onDelete={(p) => setDeleteTarget(p)}
            />
          ))}
        </div>
      ) : (
        <ProjectListView
          projects={filtered}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          onEdit={(p) => setEditTarget(p)}
          onDelete={(p) => setDeleteTarget(p)}
        />
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Edit Project Modal */}
      {editTarget && (
        <EditProjectModal
          project={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleUpdate}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <DeleteConfirmation
          project={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      )}
    </AppLayout>
  );
}

/* ================================================================
   PROJECT CARD (GRID)
   ================================================================ */
function ProjectCard({ project, openMenu, setOpenMenu, onEdit, onDelete }) {
  const menuRef = useRef(null);
  const isMenuOpen = openMenu === project.id;

  const members = project.members ?? [];
  const taskCount = project._count?.tasks ?? 0;
  const memberCount = project._count?.members ?? members.length;
  const color = PROJECT_COLORS[Math.abs(hashCode(project.id)) % PROJECT_COLORS.length];
  const key = generateKey(project.projectName);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, setOpenMenu]);

  return (
    <div className="project-card" id={`project-card-${project.id}`}>
      <div className="project-card-header">
        <div className="project-card-icon" style={{ background: color }}>
          {key.slice(0, 2)}
        </div>
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            className="project-card-menu"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(isMenuOpen ? null : project.id);
            }}
          >
            <FiMoreVertical size={16} />
          </button>
          {isMenuOpen && (
            <div className="project-dropdown-menu">
              <button className="project-dropdown-item" onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(null);
                onEdit(project);
              }}>
                <FiEdit2 size={14} /> Edit
              </button>
              <button className="project-dropdown-item">
                <FiUsers size={14} /> Members
              </button>
              <div className="project-dropdown-divider" />
              <button
                className="project-dropdown-item danger"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(null);
                  onDelete(project);
                }}
              >
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="project-card-title">{project.projectName}</div>
      <div className="project-card-key">{key}</div>
      <div className="project-card-description">
        {project.description || "No description provided for this project."}
      </div>

      {/* Stats */}
      <div className="project-card-stats">
        <div className="project-card-stat">
          <FiCheckSquare size={14} />
          <span className="stat-value">{taskCount}</span> Tasks
        </div>
        <div className="project-card-stat">
          <FiUsers size={14} />
          <span className="stat-value">{memberCount}</span> Members
        </div>
      </div>

      {/* Footer */}
      <div className="project-card-footer">
        <div className="project-card-members">
          {members.slice(0, 3).map((m, i) => (
            <div
              key={m.id || i}
              className="avatar"
              style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
              title={`${m.user?.firstName ?? ""} ${m.user?.lastName ?? ""}`}
            >
              {getInitials(m.user?.firstName, m.user?.lastName)}
            </div>
          ))}
          {memberCount > 3 && (
            <div className="avatar avatar-more">+{memberCount - 3}</div>
          )}
        </div>
        <div className="project-card-date">
          <FiCalendar size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
          {formatDate(project.createdAt)}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   PROJECT LIST VIEW
   ================================================================ */
function ProjectListView({ projects, openMenu, setOpenMenu, onEdit, onDelete }) {
  return (
    <div className="projects-list">
      <div className="project-list-header">
        <span>Project</span>
        <span>Members</span>
        <span>Tasks</span>
        <span>Created</span>
        <span></span>
      </div>
      {projects.map((project) => (
        <ProjectListItem
          key={project.id}
          project={project}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function ProjectListItem({ project, openMenu, setOpenMenu, onEdit, onDelete }) {
  const menuRef = useRef(null);
  const isMenuOpen = openMenu === project.id;
  const members = project.members ?? [];
  const color = PROJECT_COLORS[Math.abs(hashCode(project.id)) % PROJECT_COLORS.length];
  const key = generateKey(project.projectName);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, setOpenMenu]);

  return (
    <div className="project-list-item" id={`project-list-${project.id}`}>
      <div className="project-list-name">
        <div className="project-card-icon" style={{ background: color }}>
          {key.slice(0, 2)}
        </div>
        <div className="project-list-name-text">
          <h3>{project.projectName}</h3>
          <span>{key}</span>
        </div>
      </div>

      <div className="project-list-members">
        {members.slice(0, 3).map((m, i) => (
          <div
            key={m.id || i}
            className="avatar"
            style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
          >
            {getInitials(m.user?.firstName, m.user?.lastName)}
          </div>
        ))}
        {(project._count?.members ?? members.length) > 3 && (
          <span className="member-count">+{(project._count?.members ?? members.length) - 3}</span>
        )}
      </div>

      <div className="project-list-tasks">
        {project._count?.tasks ?? 0} tasks
      </div>

      <div className="project-list-date">
        {formatDate(project.createdAt)}
      </div>

      <div className="project-list-actions" style={{ position: "relative" }} ref={menuRef}>
        <button
          className="project-card-menu"
          style={{ opacity: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu(isMenuOpen ? null : project.id);
          }}
        >
          <FiMoreVertical size={16} />
        </button>
        {isMenuOpen && (
          <div className="project-dropdown-menu">
            <button className="project-dropdown-item" onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(null);
              onEdit(project);
            }}>
              <FiEdit2 size={14} /> Edit
            </button>
            <button className="project-dropdown-item">
              <FiUsers size={14} /> Members
            </button>
            <div className="project-dropdown-divider" />
            <button
              className="project-dropdown-item danger"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(null);
                onDelete(project);
              }}
            >
              <FiTrash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   CREATE PROJECT MODAL
   ================================================================ */
function CreateProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onCreate({ name: name.trim(), description: description.trim() });
    setSubmitting(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">Create New Project</span>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="create-project-form">
              {/* Project Name */}
              <div className="input-group">
                <label className="input-label" htmlFor="project-name-input">
                  Project Name *
                </label>
                <input
                  className="input"
                  id="project-name-input"
                  type="text"
                  placeholder="e.g. Mobile App Redesign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {/* Description */}
              <div className="input-group">
                <label className="input-label" htmlFor="project-desc-input">
                  Description
                </label>
                <textarea
                  id="project-desc-input"
                  placeholder="Brief description of the project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Color Picker */}
              <div className="input-group">
                <label className="input-label">Project Color</label>
                <div className="color-picker-grid">
                  {PROJECT_COLORS.map((c) => (
                    <div
                      key={c}
                      className={`color-picker-swatch ${selectedColor === c ? "selected" : ""}`}
                      style={{ background: c }}
                      onClick={() => setSelectedColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!name.trim() || submitting}
              id="submit-create-project"
            >
              {submitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================================================================
   EDIT PROJECT MODAL
   ================================================================ */
function EditProjectModal({ project, onClose, onSave }) {
  const [name, setName] = useState(project.projectName || "");
  const [description, setDescription] = useState(project.description || "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onSave(project.id, { name: name.trim(), description: description.trim() });
    setSubmitting(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">Edit Project</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="create-project-form">
              <div className="input-group">
                <label className="input-label" htmlFor="edit-project-name">Project Name *</label>
                <input
                  className="input"
                  id="edit-project-name"
                  type="text"
                  placeholder="e.g. Mobile App Redesign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="edit-project-desc">Description</label>
                <textarea
                  id="edit-project-desc"
                  placeholder="Brief description of the project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!name.trim() || submitting}
              id="submit-edit-project"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================================================================
   DELETE CONFIRMATION
   ================================================================ */
function DeleteConfirmation({ project, onCancel, onConfirm }) {
  return (
    <div className="delete-confirm-overlay" onClick={onCancel}>
      <div className="delete-confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Delete Project</h3>
        <p>
          Are you sure you want to delete <strong>{project.projectName}</strong>? This action cannot
          be undone and all associated tasks will be permanently removed.
        </p>
        <div className="delete-confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} id="confirm-delete-btn">
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   EMPTY STATE
   ================================================================ */
function EmptyState({ hasSearch, onCreate }) {
  return (
    <div className="projects-empty">
      <div className="projects-empty-icon">
        <FiFolder size={36} />
      </div>
      <h3>{hasSearch ? "No projects found" : "No projects yet"}</h3>
      <p>
        {hasSearch
          ? "Try adjusting your search query to find what you're looking for."
          : "Create your first project to start organizing your work and collaborating with your team."}
      </p>
      {!hasSearch && (
        <button className="btn btn-primary btn-lg" onClick={onCreate}>
          <FiPlus size={18} />
          Create Your First Project
        </button>
      )}
    </div>
  );
}

/* ================================================================
   LOADING SKELETON
   ================================================================ */
function LoadingGrid() {
  return (
    <div className="projects-loading">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="project-skeleton-card">
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
          <div className="skeleton skeleton-title" style={{ width: "70%" }} />
          <div className="skeleton skeleton-text" style={{ width: "40%" }} />
          <div className="skeleton skeleton-text" style={{ width: "100%", height: 40 }} />
          <div className="skeleton skeleton-text" style={{ width: "60%" }} />
        </div>
      ))}
    </div>
  );
}

/* ── hashCode helper ───────────────────────────────────────────── */
function hashCode(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}



export default Projects;