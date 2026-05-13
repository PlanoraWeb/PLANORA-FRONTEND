import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  FiActivity,
  FiAlertCircle,
  FiCalendar,
  FiCheckSquare,
  FiChevronRight,
  FiClock,
  FiEdit2,
  FiFlag,
  FiFolder,
  FiGitBranch,
  FiGrid,
  FiList,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiShield,
  FiTarget,
  FiTool,
  FiTrash2,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import AppLayout from "../layouts/AppLayout";
import "../styles/Projects.css";
import "../styles/Component.css";
import {
  createProject,
  deleteProject,
  getProjectInsights,
  getProjects,
  updateProject,
} from "../services/projectService";
import {
  changeTaskStatus,
  getStatusesByProject,
  getTasksByProject,
} from "../services/taskService";
import {
  AVATAR_GRADIENTS,
  applyTaskDrag,
  formatIssueKey,
  formatRelativeTime,
  formatShortDate,
  getTaskStatusId,
  getInitials,
  rememberProjectId,
  resolveProjectSelection,
  sortTasksByDisplayOrder,
} from "../utils/workflowUi";

const SURFACE_MODES = [
  { id: "roadmap", label: "Roadmap", icon: FiCalendar },
  { id: "delivery", label: "Delivery", icon: FiGrid },
  { id: "portfolio", label: "Portfolio", icon: FiList },
];

function formatDate(dateStr) {
  if (!dateStr) return "No date";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function hashCode(str = "") {
  let hash = 0;
  for (let index = 0; index < str.length; index += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function normalizeLabel(value = "") {
  return String(value)
    .replaceAll("_", " ")
    .trim()
    .replace(/\s+/g, " ");
}

function getHealthModel(summary) {
  if (!summary) return { label: "Loading", tone: "steady" };
  if ((summary.overdueTasks || 0) > 0) return { label: "At risk", tone: "risk" };
  if ((summary.completionRate || 0) >= 70) {
    return { label: "On track", tone: "track" };
  }
  return { label: "In motion", tone: "steady" };
}

function getProjectColor(projectId) {
  const palette = [
    "#0ea5e9",
    "#4f46e5",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
  ];

  return palette[Math.abs(hashCode(projectId)) % palette.length];
}

function getPriorityBadge(priority) {
  if (priority === "URGENT" || priority === "HIGH") return "badge-error";
  if (priority === "MEDIUM") return "badge-warning";
  if (priority === "LOW") return "badge-success";
  return "badge-gray";
}

function getStatusClusterIcon(statusName = "") {
  const label = normalizeLabel(statusName).toLowerCase();

  if (label.includes("done") || label.includes("finish")) return FiCheckSquare;
  if (label.includes("review") || label.includes("qa") || label.includes("test")) {
    return FiShield;
  }
  if (label.includes("progress") || label.includes("doing") || label.includes("active")) {
    return FiZap;
  }
  return FiGitBranch;
}

function buildTimelineMonths(anchorDate) {
  const base = anchorDate ? new Date(anchorDate) : new Date();
  const months = [];

  for (let index = -2; index < 6; index += 1) {
    const value = new Date(base.getFullYear(), base.getMonth() + index, 1);
    months.push({
      key: `${value.getFullYear()}-${value.getMonth()}`,
      short: value.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      month: value.getMonth(),
      year: value.getFullYear(),
    });
  }

  return months;
}

function resolveMonthIndex(value, months, fallbackIndex) {
  if (!value) return fallbackIndex;

  const date = new Date(value);
  const foundIndex = months.findIndex(
    (month) => month.month === date.getMonth() && month.year === date.getFullYear()
  );

  if (foundIndex !== -1) return foundIndex;

  if (date < new Date(months[0].year, months[0].month, 1)) return 0;
  return months.length - 1;
}

function getRoadmapTone(task, index) {
  if (task.priority === "URGENT" || task.priority === "HIGH") return "risk";
  if (task.type === "BUG") return "warning";
  if (task.status?.name?.toUpperCase().includes("DONE")) return "track";

  return ["info", "steady", "track", "warning"][index % 4];
}

function getRoadmapIcon(task, index) {
  if (task.type === "BUG") return FiTool;
  if (task.type === "STORY") return FiFlag;
  if (task.priority === "URGENT" || task.priority === "HIGH") return FiAlertCircle;
  return [FiActivity, FiTarget, FiZap, FiGitBranch][index % 4];
}

function buildRoadmapRows(tasks, months) {
  const sourceTasks = [...tasks]
    .sort((left, right) => {
      const leftTime = new Date(left.dueDate || left.updatedAt || left.createdAt || 0).getTime();
      const rightTime = new Date(
        right.dueDate || right.updatedAt || right.createdAt || 0
      ).getTime();
      return leftTime - rightTime;
    })
    .slice(0, 4);

  if (!sourceTasks.length) {
    return [
      {
        id: "scaffold",
        title: "Execution scaffold",
        statusLabel: "Planning",
        tone: "steady",
        icon: FiGitBranch,
        startIndex: 1,
        endIndex: 3,
        phaseStart: "Discovery",
        phaseEnd: "Build",
      },
      {
        id: "quality-pass",
        title: "Quality pass",
        statusLabel: "Queued",
        tone: "warning",
        icon: FiShield,
        startIndex: 3,
        endIndex: 5,
        phaseStart: "Audit",
        phaseEnd: "Polish",
      },
    ];
  }

  return sourceTasks.map((task, index) => {
    const startIndex = Math.min(
      months.length - 1,
      resolveMonthIndex(task.createdAt || task.updatedAt, months, index)
    );
    const projectedEnd = resolveMonthIndex(task.dueDate, months, startIndex + 2);
    const endIndex = Math.max(startIndex + 1, Math.min(months.length - 1, projectedEnd));

    return {
      id: task.id,
      title: task.title,
      statusLabel: normalizeLabel(task.status?.name || "Queued"),
      tone: getRoadmapTone(task, index),
      icon: getRoadmapIcon(task, index),
      startIndex,
      endIndex,
      phaseStart:
        task.type === "BUG"
          ? "Fix pass"
          : task.type === "STORY"
            ? "Core flow"
            : "Build",
      phaseEnd: task.assignee ? "Polish" : "Ready",
    };
  });
}

function buildPortfolioHealth(project, selectedProjectId, summary) {
  if (project.id === selectedProjectId) {
    return getHealthModel(summary);
  }

  if ((project._count?.tasks || 0) > 8) return { label: "On track", tone: "track" };
  if ((project._count?.tasks || 0) > 0) return { label: "In motion", tone: "steady" };
  return { label: "Planning", tone: "steady" };
}

function buildConnectionInsight(selectedProject, project, row, summary) {
  const sharedTaskCount = Math.max(
    1,
    Math.min(project?._count?.tasks || 0, summary?.openTasks || 0, 5)
  );

  return {
    title: `${selectedProject?.projectName} x ${project.projectName}`,
    summary: `${selectedProject?.projectName} and ${project.projectName} share delivery timing, handoff pressure, and review checkpoints across the same stream.`,
    bullets: [
      `Shared flow anchor: ${row?.statusLabel || "Connected work"}`,
      `Current handoff: ${row?.phaseStart || "Discovery"} -> ${row?.phaseEnd || "Polish"}`,
      `${sharedTaskCount} related work items are moving across both projects`,
    ],
  };
}

function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [insights, setInsights] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [projectStatuses, setProjectStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [surfaceMode, setSurfaceMode] = useState("roadmap");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      (project.projectName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim())
    );
  }, [projects, searchQuery]);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const res = await getProjects();
        const projectList = res.data?.data ?? [];
        setProjects(projectList);
        setSelectedProjectId((current) =>
          current || resolveProjectSelection(projectList)
        );
      } catch (error) {
        console.error("Failed to load projects", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    if (!filteredProjects.length) {
      setSelectedProjectId("");
      return;
    }

    if (!filteredProjects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(filteredProjects[0].id);
    }
  }, [filteredProjects, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      rememberProjectId(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadWorkspace = useCallback(async () => {
    if (!selectedProjectId) {
      setInsights(null);
      setProjectTasks([]);
      setProjectStatuses([]);
      setWorkspaceLoading(false);
      return;
    }

    setWorkspaceLoading(true);
    setInsights(null);
    setProjectTasks([]);
    setProjectStatuses([]);
    try {
      const [insightsRes, tasksRes, statusesRes] = await Promise.all([
        getProjectInsights(selectedProjectId),
        getTasksByProject(selectedProjectId, {
          limit: 100,
          sortBy: "order",
          sortOrder: "asc",
        }),
        getStatusesByProject(selectedProjectId),
      ]);

      setInsights(insightsRes.data?.data ?? null);
      setProjectTasks(sortTasksByDisplayOrder(tasksRes.data?.data ?? []));
      setProjectStatuses(statusesRes.data?.data ?? []);
    } catch (error) {
      console.error("Failed to load project workspace", error);
      setInsights(null);
      setProjectTasks([]);
      setProjectStatuses([]);
    } finally {
      setWorkspaceLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ||
    insights?.project ||
    null;
  const summary = insights?.summary;
  const health = getHealthModel(summary);

  const statusCounts = useMemo(() => {
    return projectStatuses.map((status) => ({
      ...status,
      count: projectTasks.filter(
        (task) => getTaskStatusId(task) === status.id
      ).length,
    }));
  }, [projectStatuses, projectTasks]);

  const totalProjects = projects.length;
  const totalTasks = projects.reduce(
    (sum, project) => sum + (project._count?.tasks ?? 0),
    0
  );
  const totalMembers = projects.reduce(
    (sum, project) => sum + (project._count?.members ?? 0),
    0
  );

  const initiativeGroups = useMemo(() => {
    if (!selectedProject) return [];

    const statusChildren = statusCounts.slice(0, 4).map((status) => ({
      id: status.id,
      title: normalizeLabel(status.name),
      count: status.count,
      icon: getStatusClusterIcon(status.name),
      tone:
        status.count === 0
          ? "muted"
          : normalizeLabel(status.name).toLowerCase().includes("done")
            ? "track"
            : "steady",
    }));

    return [
      {
        id: "project-track",
        title: selectedProject.projectName,
        count: summary?.totalTasks ?? projectTasks.length,
        icon: FiFolder,
        tone: "info",
        children: statusChildren,
      },
      {
        id: "signal-track",
        title: "Delivery signals",
        count: summary?.openTasks ?? projectTasks.length,
        icon: FiTrendingUp,
        tone: health.tone,
        children: [
          {
            id: "signal-open",
            title: "Open work",
            count: summary?.openTasks || 0,
            icon: FiActivity,
            tone: "steady",
          },
          {
            id: "signal-complete",
            title: "Completed",
            count: summary?.completedTasks || 0,
            icon: FiCheckSquare,
            tone: "track",
          },
          {
            id: "signal-overdue",
            title: "Overdue",
            count: summary?.overdueTasks || 0,
            icon: FiAlertCircle,
            tone: (summary?.overdueTasks || 0) > 0 ? "risk" : "muted",
          },
        ],
      },
      {
        id: "schedule-track",
        title: "Schedule view",
        count: insights?.dueTimeline?.length || 0,
        icon: FiClock,
        tone: (insights?.dueTimeline?.length || 0) > 0 ? "warning" : "muted",
        children: (insights?.dueTimeline || []).slice(0, 3).map((item, index) => ({
          id: `schedule-${item.id || index}`,
          title: item.title,
          count: item.priority === "HIGH" || item.priority === "URGENT" ? 1 : 0,
          icon: FiCalendar,
          tone:
            item.priority === "HIGH" || item.priority === "URGENT"
              ? "warning"
              : "steady",
        })),
      },
      {
        id: "team-track",
        title: "Team load",
        count: insights?.workload?.length || 0,
        icon: FiUsers,
        tone: (insights?.workload?.length || 0) > 0 ? "info" : "muted",
        children: (insights?.workload || []).slice(0, 3).map((member, index) => ({
          id: `member-${member.userId || index}`,
          title: member.name,
          count: member.openTaskCount || 0,
          icon: FiActivity,
          tone: (member.overdueTaskCount || 0) > 0 ? "risk" : "steady",
        })),
      },
    ];
  }, [health.tone, insights?.dueTimeline, insights?.workload, projectTasks.length, selectedProject, statusCounts, summary]);

  const roadmapRows = useMemo(() => {
    const months = buildTimelineMonths(selectedProject?.createdAt || new Date());
    return {
      months,
      rows: buildRoadmapRows(projectTasks, months),
    };
  }, [projectTasks, selectedProject?.createdAt]);

  const handleCreate = async (payload) => {
    try {
      await createProject(payload);
      setShowCreateModal(false);
      const res = await getProjects();
      const projectList = res.data?.data ?? [];
      setProjects(projectList);
      setSelectedProjectId(projectList[0]?.id || "");
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  const handleUpdate = async (projectId, payload) => {
    try {
      await updateProject(projectId, payload);
      setEditTarget(null);
      const res = await getProjects();
      setProjects(res.data?.data ?? []);
      await loadWorkspace();
    } catch (error) {
      console.error("Failed to update project", error);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await deleteProject(projectId);
      setDeleteTarget(null);
      const res = await getProjects();
      const projectList = res.data?.data ?? [];
      setProjects(projectList);
      setSelectedProjectId(projectList[0]?.id || "");
    } catch (error) {
      console.error("Failed to delete project", error);
    }
  };

  const handleBoardDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const nextStatus = projectStatuses.find(
      (status) => status.id === destination.droppableId
    );
    if (!nextStatus) return;

    const previousTasks = projectTasks;
    setProjectTasks(
      applyTaskDrag(projectTasks, draggableId, source, destination, projectStatuses)
    );

    try {
      await changeTaskStatus(draggableId, destination.droppableId, destination.index);
      await loadWorkspace();
    } catch (error) {
      console.error("Failed to move task", error);
      setProjectTasks(previousTasks);
    }
  };

  return (
    <AppLayout>
      <div className="projects-page-shell">
        <div className="projects-page-header">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">
              Roadmaps, connected task movement, and portfolio health in one dark
              delivery surface.
            </p>
          </div>

          <button
            className="btn btn-primary"
            id="create-project-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus size={16} />
            New Project
          </button>
        </div>

        {surfaceMode !== "roadmap" ? (
          <div className="projects-topline-stats">
            <MetricChip label="Projects" value={totalProjects} icon={FiFolder} />
            <MetricChip label="Tasks" value={totalTasks} icon={FiCheckSquare} />
            <MetricChip label="Members" value={totalMembers} icon={FiUsers} />
          </div>
        ) : null}

        {surfaceMode === "roadmap" ? (
          <section className="projects-roadmap-experience">
            {!selectedProject ? (
              <div className="dashboard-empty-panel">Select a project to continue.</div>
            ) : workspaceLoading ? (
              <div className="dashboard-empty-panel">Loading project workspace...</div>
            ) : (
              <RoadmapSurface
                selectedProject={selectedProject}
                summary={summary}
                health={health}
                initiativeGroups={initiativeGroups}
                months={roadmapRows.months}
                rows={roadmapRows.rows}
                filteredProjects={filteredProjects}
                selectedProjectId={selectedProjectId}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                onSelectProject={setSelectedProjectId}
                onEditProject={setEditTarget}
                onDeleteProject={setDeleteTarget}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                insights={insights}
                setSurfaceMode={setSurfaceMode}
              />
            )}
          </section>
        ) : (
          <div className="projects-workspace-grid">
            <aside className="projects-rail">
              <div className="projects-rail-header">
                <div>
                  <h2>Project index</h2>
                  <p>Pick a workspace, then switch between roadmap, delivery, and portfolio.</p>
                </div>
              </div>

              <div className="projects-search">
                <FiSearch size={16} />
                <input
                  id="search-projects-input"
                  type="text"
                  placeholder="Search projects"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <div className="projects-mode-switch projects-mode-switch--triple">
                {SURFACE_MODES.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      className={surfaceMode === mode.id ? "active" : ""}
                      onClick={() => setSurfaceMode(mode.id)}
                    >
                      <Icon size={15} />
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              <div className="projects-rail-list">
                {loading ? (
                  <div className="dashboard-empty-panel">Loading projects...</div>
                ) : filteredProjects.length === 0 ? (
                  <div className="dashboard-empty-panel">No projects found.</div>
                ) : (
                  filteredProjects.map((project) => (
                    <ProjectRailItem
                      key={project.id}
                      project={project}
                      isActive={selectedProjectId === project.id}
                      openMenu={openMenu}
                      setOpenMenu={setOpenMenu}
                      onSelect={() => setSelectedProjectId(project.id)}
                      onEdit={() => setEditTarget(project)}
                      onDelete={() => setDeleteTarget(project)}
                    />
                  ))
                )}
              </div>
            </aside>

            <section className="projects-focus">
            {!selectedProject ? (
              <div className="dashboard-empty-panel">Select a project to continue.</div>
            ) : (
              <>
                <header className="project-focus-header">
                  <div>
                    <div className="project-focus-kicker">
                      <span className={`project-health-pill ${health.tone}`}>{health.label}</span>
                      <span>
                        {workspaceLoading
                          ? "Loading sprint"
                          : summary?.activeSprint?.name || "No active sprint"}
                      </span>
                      <span>
                        {!workspaceLoading && insights?.recentActivity?.[0]?.updatedAt
                          ? formatRelativeTime(insights.recentActivity[0].updatedAt)
                          : workspaceLoading
                            ? "Loading activity"
                            : "No recent activity"}
                      </span>
                    </div>
                    <h2>{selectedProject.projectName}</h2>
                    <p>
                      {selectedProject.description ||
                        "This project does not have a description yet."}
                    </p>
                  </div>

                  <div className="project-focus-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditTarget(selectedProject)}
                    >
                      <FiEdit2 size={14} />
                      Edit
                    </button>
                  </div>
                </header>

                {surfaceMode !== "roadmap" ? (
                  <div className="project-command-strip">
                    <CommandMetric
                      icon={FiCheckSquare}
                      label="Open work"
                      value={workspaceLoading ? "..." : summary?.openTasks || 0}
                      helper={
                        workspaceLoading
                          ? "Syncing project flow"
                          : `${summary?.completedTasks || 0} completed`
                      }
                    />
                    <CommandMetric
                      icon={FiTarget}
                      label="Completion"
                      value={workspaceLoading ? "..." : `${summary?.completionRate || 0}%`}
                      helper={workspaceLoading ? "Tracking velocity" : "Across all issues"}
                    />
                    <CommandMetric
                      icon={FiClock}
                      label="Sprint"
                      value={workspaceLoading ? "..." : summary?.activeSprint?.name || "None"}
                      helper={
                        workspaceLoading
                          ? "Checking schedule"
                          : summary?.sprintCount
                            ? `${summary.sprintCount} sprint records`
                            : "No sprint history"
                      }
                    />
                  </div>
                ) : null}

                {workspaceLoading ? (
                  <div className="dashboard-empty-panel">Loading project workspace...</div>
                ) : surfaceMode === "delivery" ? (
                  <DeliverySurface
                    selectedProject={selectedProject}
                    summary={summary}
                    statusCounts={statusCounts}
                    projectTasks={projectTasks}
                    onDragEnd={handleBoardDragEnd}
                  />
                ) : (
                  <PortfolioSurface
                    projects={filteredProjects}
                    selectedProjectId={selectedProjectId}
                    summary={summary}
                    spotlightTasks={projectTasks}
                    onSelectProject={setSelectedProjectId}
                  />
                )}
              </>
            )}
            </section>

            <aside className="projects-inspector">
              {!selectedProject ? (
                <div className="dashboard-empty-panel">No project selected.</div>
              ) : (
                <ProjectInspectorPanel
                  selectedProject={selectedProject}
                  summary={summary}
                  insights={insights}
                />
              )}
            </aside>
          </div>
        )}
      </div>

      {showCreateModal ? (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      ) : null}

      {editTarget ? (
        <EditProjectModal
          project={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleUpdate}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmation
          project={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      ) : null}
    </AppLayout>
  );
}

function MetricChip({ icon: Icon, label, value }) {
  return (
    <div className="projects-stat-chip">
      <span className="projects-stat-icon">
        <Icon size={14} />
      </span>
      <span className="stat-count">{value}</span>
      {label}
    </div>
  );
}

function ProjectRailItem({
  project,
  isActive,
  openMenu,
  setOpenMenu,
  onSelect,
  onEdit,
  onDelete,
}) {
  const menuRef = useRef(null);
  const isMenuOpen = openMenu === project.id;
  const projectColor = getProjectColor(project.id);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, setOpenMenu]);

  return (
    <div className={`projects-rail-item ${isActive ? "active" : ""}`}>
      <button
        type="button"
        className="projects-rail-main"
        onClick={onSelect}
      >
        <div className="projects-rail-badge" style={{ background: projectColor }}>
          {project.projectName?.slice(0, 2).toUpperCase()}
        </div>
        <div className="projects-rail-copy">
          <strong>{project.projectName}</strong>
          <span>
            {project._count?.tasks ?? 0} tasks - {project._count?.members ?? 0} members
          </span>
        </div>
      </button>
      <div className="projects-rail-actions" ref={menuRef}>
        <button
          type="button"
          className="project-card-menu"
          onClick={(event) => {
            event.stopPropagation();
            setOpenMenu(isMenuOpen ? null : project.id);
          }}
        >
          <FiMoreVertical size={16} />
        </button>
        {isMenuOpen ? (
          <div className="project-dropdown-menu">
            <button
              className="project-dropdown-item"
              onClick={(event) => {
                event.stopPropagation();
                setOpenMenu(null);
                onEdit();
              }}
            >
              <FiEdit2 size={14} />
              Edit
            </button>
            <button
              className="project-dropdown-item danger"
              onClick={(event) => {
                event.stopPropagation();
                setOpenMenu(null);
                onDelete();
              }}
            >
              <FiTrash2 size={14} />
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CommandMetric({ icon: Icon, label, value, helper }) {
  return (
    <div className="project-command-card">
      <div className="project-command-icon">
        <Icon size={16} />
      </div>
      <div className="project-command-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
    </div>
  );
}

function RoadmapSurface({
  selectedProject,
  summary,
  health,
  initiativeGroups,
  months,
  rows,
  filteredProjects,
  selectedProjectId,
  onSelectProject,
  setSurfaceMode,
}) {
  const [activeNodeId, setActiveNodeId] = useState("");
  const [localRows, setLocalRows] = useState(rows);
  const [connectionDetail, setConnectionDetail] = useState(null);

  useEffect(() => {
    setLocalRows(rows);
    setActiveNodeId(rows[0]?.id || "");
    setConnectionDetail(null);
  }, [rows]);

  const relatedProjects = useMemo(() => {
    const selectedTokens = new Set(
      String(selectedProject?.projectName || "")
        .toLowerCase()
        .split(/\s+/)
        .filter((token) => token.length > 3)
    );

    return filteredProjects
      .filter((project) => project.id !== selectedProjectId)
      .map((project) => {
        const overlap = String(project.projectName || "")
          .toLowerCase()
          .split(/\s+/)
          .filter((token) => selectedTokens.has(token)).length;

        return { project, overlap };
      })
      .sort((left, right) => right.overlap - left.overlap)
      .slice(0, 3)
      .map((entry) => entry.project);
  }, [filteredProjects, selectedProject?.projectName, selectedProjectId]);

  const activeDetail = useMemo(() => {
    const activeRow = localRows.find((row) => row.id === activeNodeId);
    if (activeRow) {
      return {
        eyebrow: activeRow.statusLabel,
        title: activeRow.title,
        meta: `${activeRow.phaseStart} to ${activeRow.phaseEnd}`,
        statA: health?.label || "In motion",
        statB: summary?.completionRate ? `${summary.completionRate}% complete` : "Planning",
      };
    }

    for (const group of initiativeGroups) {
      if (group.id === activeNodeId) {
        return {
          eyebrow: "Initiative",
          title: group.title,
          meta: `${group.count} connected items`,
          statA: health?.label || "In motion",
          statB: summary?.activeSprint?.name || "No active sprint",
        };
      }

      const child = group.children.find((item) => item.id === activeNodeId);
      if (child) {
        return {
          eyebrow: "Linked track",
          title: child.title,
          meta: `${child.count} items in this lane`,
          statA: normalizeLabel(child.tone),
          statB: selectedProject?.projectName || "Project",
        };
      }
    }

    return {
      eyebrow: "Initiative roadmap",
      title: selectedProject?.projectName || "Project",
      meta: selectedProject?.description || "Connected delivery map",
      statA: health?.label || "In motion",
      statB: summary?.activeSprint?.name || "No active sprint",
    };
  }, [activeNodeId, health?.label, initiativeGroups, localRows, selectedProject?.description, selectedProject?.projectName, summary?.activeSprint?.name, summary?.completionRate]);

  const openConnectionDetail = useCallback(
    (row, project = null) => {
      if (project) {
        setConnectionDetail(buildConnectionInsight(selectedProject, project, row, summary));
        return;
      }

      setConnectionDetail({
        title: row.title,
        summary: `${row.title} represents the delivery handoff between ${row.phaseStart} and ${row.phaseEnd}.`,
        bullets: [
          `Status signal: ${row.statusLabel}`,
          `Start phase: ${row.phaseStart}`,
          `End phase: ${row.phaseEnd}`,
        ],
      });
    },
    [selectedProject, summary]
  );

  const handleRoadmapDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    setLocalRows((current) => {
      const next = [...current];
      const [moved] = next.splice(source.index, 1);
      next.splice(destination.index, 0, moved);
      return next;
    });
  };

  return (
    <section className="projects-roadmap-shell">
      <div className="projects-roadmap-minibar">
        <div className="projects-mode-switch projects-mode-switch--triple projects-mode-switch--roadmap">
          {SURFACE_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                className={mode.id === "roadmap" ? "active" : ""}
                onClick={() => setSurfaceMode(mode.id)}
                type="button"
              >
                <Icon size={15} />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="projects-roadmap-stage">
        <div className="projects-roadmap-months">
          {months.map((month) => (
            <div key={month.key} className="projects-roadmap-month">
              <strong>{month.short}</strong>
              <span>{month.year}</span>
            </div>
          ))}
        </div>

        <div className="projects-roadmap-panel">
          <div className="projects-roadmap-tree-card">
            <div className="projects-roadmap-tree-header">
              <strong>Initiatives</strong>
              <span>{initiativeGroups.length}</span>
            </div>

            <div className="projects-roadmap-project-switch">
              {filteredProjects.length === 0 ? (
                <div className="dashboard-empty-panel">No projects found.</div>
              ) : (
                filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    className={`projects-roadmap-project-chip ${
                      selectedProjectId === project.id ? "active" : ""
                    }`}
                    onClick={() => onSelectProject(project.id)}
                    style={{
                      "--project-chip-color": getProjectColor(project.id),
                    }}
                  >
                    {project.projectName}
                  </button>
                ))
              )}
            </div>

            {relatedProjects.length > 0 ? (
              <div className="projects-roadmap-related">
                <span className="projects-roadmap-related-label">Connected projects</span>
                <div className="projects-roadmap-related-list">
                  {relatedProjects.map((project, index) => (
                    <div
                      key={project.id}
                      className="projects-roadmap-related-item"
                      style={{
                        "--related-color": getProjectColor(project.id),
                        "--related-depth": `${index * 24}px`,
                      }}
                    >
                      <button
                        type="button"
                        className="projects-roadmap-related-link"
                        onClick={() => {
                          const sourceRow = localRows[index] || localRows[0] || rows[0];
                          if (sourceRow) {
                            openConnectionDetail(sourceRow, project);
                          }
                        }}
                        aria-label={`Open relationship details between ${selectedProject?.projectName} and ${project.projectName}`}
                      >
                        <span className="projects-roadmap-related-link-line" />
                        <span className="projects-roadmap-related-link-dot" />
                      </button>

                      <button
                        type="button"
                        className="projects-roadmap-related-card"
                        onClick={() => onSelectProject(project.id)}
                      >
                        <strong>{project.projectName}</strong>
                        <span>{project._count?.tasks || 0} linked tasks</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="projects-roadmap-tree">
              {initiativeGroups.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.id} className="roadmap-tree-group">
                    <button
                      type="button"
                      className={`roadmap-tree-root roadmap-tone-${group.tone}`}
                      onClick={() => setActiveNodeId(group.id)}
                    >
                      <div className="roadmap-tree-node-icon">
                        <GroupIcon size={15} />
                      </div>
                      <div className="roadmap-tree-copy">
                        <strong>{group.title}</strong>
                      </div>
                      <span>{group.count}</span>
                    </button>

                    <div className="roadmap-tree-children">
                      {group.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isActive = activeNodeId === child.id;
                        return (
                          <button
                            key={child.id}
                            type="button"
                            className={`roadmap-tree-child ${isActive ? "active" : ""}`}
                            onClick={() => setActiveNodeId(child.id)}
                          >
                            <div className={`roadmap-tree-child-icon roadmap-tone-${child.tone}`}>
                              <ChildIcon size={13} />
                            </div>
                            <span className="roadmap-tree-child-label">{child.title}</span>
                            <span className="roadmap-tree-child-count">{child.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="projects-roadmap-canvas">
            <div className="projects-roadmap-detail">
              <div>
                <span className="projects-roadmap-kicker">{activeDetail.eyebrow}</span>
                <h3>{activeDetail.title}</h3>
                <p>{activeDetail.meta}</p>
              </div>

              <div className="projects-roadmap-detail-stats">
                <div>
                  <span>Health</span>
                  <strong>{activeDetail.statA}</strong>
                </div>
                <div>
                  <span>Signal</span>
                  <strong>{activeDetail.statB}</strong>
                </div>
              </div>
            </div>

            {connectionDetail ? (
              <div className="projects-roadmap-connection-panel">
                <div>
                  <span className="projects-roadmap-kicker">Connection detail</span>
                  <strong>{connectionDetail.title}</strong>
                  <p>{connectionDetail.summary}</p>
                </div>
                <div className="projects-roadmap-connection-bullets">
                  {connectionDetail.bullets.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            ) : null}

            <DragDropContext onDragEnd={handleRoadmapDragEnd}>
              <Droppable droppableId="roadmap-rows">
                {(provided) => (
                  <div
                    className="projects-roadmap-rows"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {localRows.map((row, index) => {
                      const Icon = row.icon;
                      const isActive =
                        activeNodeId === row.id ||
                        normalizeLabel(row.statusLabel).toLowerCase() === activeNodeId;

                      return (
                        <Draggable key={row.id} draggableId={row.id} index={index}>
                          {(draggableProvided) => (
                            <button
                              type="button"
                              key={row.id}
                              className={`projects-roadmap-row ${isActive ? "active" : ""}`}
                              ref={draggableProvided.innerRef}
                              {...draggableProvided.draggableProps}
                              {...draggableProvided.dragHandleProps}
                              onClick={() => setActiveNodeId(row.id)}
                            >
                              <div className="projects-roadmap-row-copy">
                                <span className={`projects-roadmap-row-icon roadmap-tone-${row.tone}`}>
                                  <Icon size={14} />
                                </span>
                                <div>
                                  <strong>{row.title}</strong>
                                  <span>{row.statusLabel}</span>
                                </div>
                              </div>

                              <div className="projects-roadmap-row-track">
                                <div className="projects-roadmap-gridlines">
                                  {months.map((month) => (
                                    <span key={month.key} />
                                  ))}
                                </div>
                                {index > 1 ? (
                                  <button
                                    type="button"
                                    className="projects-roadmap-curve-link"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      openConnectionDetail(row);
                                    }}
                                    aria-label={`Open connection detail for ${row.title}`}
                                  />
                                ) : null}
                                <div
                                  className={`projects-roadmap-bar roadmap-tone-${row.tone}`}
                                  style={{
                                    gridColumn: `${row.startIndex + 1} / ${row.endIndex + 2}`,
                                  }}
                                >
                                  <span className="projects-roadmap-marker" style={{ left: "38%" }} />
                                  <span className="projects-roadmap-marker" style={{ left: "78%" }} />
                                  <small className="projects-roadmap-phase projects-roadmap-phase-start">
                                    {row.phaseStart}
                                  </small>
                                  <small className="projects-roadmap-phase projects-roadmap-phase-end">
                                    {row.phaseEnd}
                                  </small>
                                </div>
                              </div>
                            </button>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectInspectorPanel({ selectedProject, summary, insights }) {
  return (
    <>
      <div className="projects-inspector-card">
        <div className="projects-inspector-header">
          <strong>Project meta</strong>
        </div>
        <InspectorRow label="Created" value={formatDate(selectedProject.createdAt)} />
        <InspectorRow
          label="Members"
          value={String(summary?.memberCount || selectedProject.members?.length || 0)}
        />
        <InspectorRow label="Backlog" value={String(summary?.backlogTasks || 0)} />
        <InspectorRow
          label="Last activity"
          value={
            insights?.recentActivity?.[0]?.updatedAt
              ? formatRelativeTime(insights.recentActivity[0].updatedAt)
              : "No recent activity"
          }
        />
      </div>

      <div className="projects-inspector-card">
        <div className="projects-inspector-header">
          <strong>Team</strong>
          <span>{selectedProject.members?.length || 0}</span>
        </div>
        <div className="projects-member-stack">
          {(selectedProject.members || []).slice(0, 6).map((member, index) => (
            <div key={member.id} className="projects-member-row">
              <div
                className="projects-member-avatar"
                style={{
                  background: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
                }}
              >
                {getInitials(member.user?.firstName, member.user?.lastName)}
              </div>
              <div>
                <strong>
                  {member.user?.firstName} {member.user?.lastName}
                </strong>
                <span>{member.role?.name || "Member"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="projects-inspector-card">
        <div className="projects-inspector-header">
          <strong>Recent activity</strong>
          <FiTrendingUp size={14} />
        </div>
        <div className="projects-activity-list">
          {(insights?.recentActivity || []).slice(0, 5).map((item) => (
            <div key={item.id} className="projects-activity-row">
              <div className="projects-activity-copy">
                <strong>{item.title}</strong>
                <span>
                  {item.status} - {item.priority}
                </span>
              </div>
              <small>{formatRelativeTime(item.updatedAt)}</small>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ProjectStatusColumn({ status, tasks, projectName }) {
  const Icon = getStatusClusterIcon(status.name);
  const label = normalizeLabel(status.name);

  return (
    <div className="project-status-column">
      <div className="project-status-header">
        <div className="project-status-heading">
          <span className="project-status-symbol">
            <Icon size={14} />
          </span>
          <div>
            <strong>{label}</strong>
            <span>{tasks.length} issues</span>
          </div>
        </div>
        <span className="project-status-count">{tasks.length}</span>
      </div>

      <Droppable droppableId={status.id}>
        {(provided) => (
          <div
            className="project-status-body"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(draggableProvided) => (
                  <article
                    className="project-task-card"
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                    {...draggableProvided.dragHandleProps}
                  >
                    <div className="project-task-topline">
                      <span>{formatIssueKey(task.id)}</span>
                      <span className="project-task-state">
                        {task.assignee ? "Working..." : "Queued"}
                      </span>
                    </div>
                    <h3>{task.title}</h3>
                    <p>{task.description || "Delivery item ready for the next pass."}</p>
                    <div className="project-task-tags">
                      <span className="badge badge-gray">{projectName}</span>
                      <span className={`badge ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="badge badge-gray">{task.type}</span>
                    </div>
                    <div className="project-task-footer">
                      <div className="project-task-assignee">
                        {task.assignee ? (
                          <>
                            <div
                              className="avatar avatar-sm"
                              style={{
                                background:
                                  AVATAR_GRADIENTS[
                                    Math.abs(hashCode(task.assignee.id)) %
                                      AVATAR_GRADIENTS.length
                                  ],
                              }}
                            >
                              {getInitials(
                                task.assignee.firstName,
                                task.assignee.lastName
                              )}
                            </div>
                            <span>
                              {task.assignee.firstName} {task.assignee.lastName}
                            </span>
                          </>
                        ) : (
                          <span>Unassigned</span>
                        )}
                      </div>
                      <small>{formatShortDate(task.dueDate)}</small>
                    </div>
                  </article>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {tasks.length === 0 ? (
              <div className="project-column-empty">No tasks in this column.</div>
            ) : null}
          </div>
        )}
      </Droppable>
    </div>
  );
}

function DeliverySurface({
  selectedProject,
  summary,
  statusCounts,
  projectTasks,
  onDragEnd,
}) {
  return (
    <section className="delivery-surface">
      <div className="delivery-surface-hero">
        <div className="delivery-surface-intro">
          <span className="projects-roadmap-kicker">Delivery control</span>
          <h3>Execution stream</h3>
          <strong>{selectedProject.projectName}</strong>
          <p>
            Backend-driven task lanes, live status grouping, and assignee-aware
            work cards for the current project.
          </p>
        </div>

        <div className="delivery-surface-hero-metrics">
          <div>
            <span>Open</span>
            <strong>{summary?.openTasks || 0}</strong>
          </div>
          <div>
            <span>Completed</span>
            <strong>{summary?.completedTasks || 0}</strong>
          </div>
          <div>
            <span>Overdue</span>
            <strong>{summary?.overdueTasks || 0}</strong>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="delivery-lane-stack">
          {statusCounts.map((status) => (
            <DeliveryLanePanel
              key={status.id}
              status={status}
              projectName={selectedProject.projectName}
              tasks={sortTasksByDisplayOrder(
                projectTasks.filter((task) => getTaskStatusId(task) === status.id)
              )}
            />
          ))}
        </div>
      </DragDropContext>
    </section>
  );
}

function DeliveryLanePanel({ status, tasks, projectName }) {
  const Icon = getStatusClusterIcon(status.name);
  const label = normalizeLabel(status.name);
  const staffedCount = tasks.filter((task) => task.assignee).length;

  return (
    <div className="delivery-lane-panel">
      <div className="delivery-lane-sidebar">
        <span className="delivery-lane-icon">
          <Icon size={15} />
        </span>
        <div>
          <strong>{label}</strong>
          <span>{tasks.length} issues in this stage</span>
        </div>
        <div className="delivery-lane-progress">
          <span>{staffedCount} active</span>
          <strong>
            {tasks.length === 0 ? "Empty" : `${Math.round((staffedCount / tasks.length) * 100)}% staffed`}
          </strong>
        </div>
      </div>

      <Droppable droppableId={status.id} direction="horizontal">
        {(provided) => (
          <div
            className="delivery-lane-track"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(draggableProvided) => (
                  <article
                    className="delivery-task-card"
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                    {...draggableProvided.dragHandleProps}
                  >
                    <div className="delivery-task-topline">
                      <span>{formatIssueKey(task.id)}</span>
                      <span className={`badge ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <h4>{task.title}</h4>
                    <p>{task.description || "This delivery item is ready for the next handoff."}</p>
                    <div className="delivery-task-meta">
                      <span>{projectName}</span>
                      <span>{task.type}</span>
                      <span>{formatShortDate(task.dueDate)}</span>
                    </div>
                    <div className="delivery-task-footer">
                      <span className="delivery-task-status">{label}</span>
                      <span>
                        {task.assignee
                          ? `${task.assignee.firstName} ${task.assignee.lastName}`
                          : "Unassigned"}
                      </span>
                    </div>
                  </article>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {tasks.length === 0 ? (
              <div className="delivery-lane-empty">Drop work here to start this stage.</div>
            ) : null}
          </div>
        )}
      </Droppable>
    </div>
  );
}

function PortfolioSurface({
  projects,
  selectedProjectId,
  summary,
  spotlightTasks,
  onSelectProject,
}) {
  const previewTasks = spotlightTasks.slice(0, 4);
  const selectedProject = projects.find((project) => project.id === selectedProjectId);
  const relatedProjects = projects
    .filter((project) => project.id !== selectedProjectId)
    .slice(0, 4);
  const selectedHealth = getHealthModel(summary);
  const featuredProject = relatedProjects[0] || null;

  return (
    <div className="portfolio-surface">
      <div className="portfolio-surface-hero">
        <div>
          <span className="projects-roadmap-kicker">Portfolio constellation</span>
          <h3>Connected project portfolio</h3>
          <p>
            Backend-linked project summaries, cross-project health, and related
            work signals around the currently selected workspace.
          </p>
        </div>
        <div className="portfolio-surface-progress">
          <span>Completion</span>
          <strong>{summary?.completionRate || 0}%</strong>
        </div>
      </div>

      <div className="portfolio-orbit-layout">
        <div className="portfolio-core-card">
          <div className="portfolio-core-topline">
            <span className="portfolio-core-badge">Core project</span>
            <span className={`projects-portfolio-health ${selectedHealth.tone}`}>
              {selectedHealth.label}
            </span>
          </div>
          <h4>{selectedProject?.projectName || "Project"}</h4>
          <p>{selectedProject?.description || "No description yet."}</p>
          <div className="portfolio-core-stats">
            <div>
              <span>Tasks</span>
              <strong>{summary?.totalTasks || spotlightTasks.length}</strong>
            </div>
            <div>
              <span>Open</span>
              <strong>{summary?.openTasks || 0}</strong>
            </div>
            <div>
              <span>Members</span>
              <strong>{summary?.memberCount || selectedProject?.members?.length || 0}</strong>
            </div>
          </div>
        </div>

        <div className="portfolio-relations-map">
          {relatedProjects.map((project, index) => {
            const projectHealth = buildPortfolioHealth(project, selectedProjectId, summary);

            return (
              <button
                key={project.id}
                type="button"
                className="portfolio-relation-card"
                style={{
                  "--orbit-accent": getProjectColor(project.id),
                }}
                onClick={() => onSelectProject(project.id)}
                aria-label={`Open ${project.projectName} project details`}
              >
                <span className="portfolio-relation-dot" />
                <div className="portfolio-relation-card-body">
                  <strong>{project.projectName}</strong>
                  <span>{project.description || "Connected delivery stream."}</span>
                  <div className="portfolio-relation-meta">
                    <small>{project._count?.tasks || 0} tasks</small>
                    <small>{project._count?.members || 0} members</small>
                    <small className={`projects-portfolio-health ${projectHealth.tone}`}>
                      {projectHealth.label}
                    </small>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="portfolio-ledger">
          <div className="portfolio-ledger-header">
            <strong>{featuredProject ? "Featured relation" : "Related work"}</strong>
            <span>{featuredProject ? featuredProject._count?.tasks || 0 : previewTasks.length}</span>
          </div>

          {featuredProject ? (
            <>
              <button
                type="button"
                className="portfolio-feature-card"
                onClick={() => onSelectProject(featuredProject.id)}
              >
                <div className="portfolio-feature-topline">
                  <strong>{featuredProject.projectName}</strong>
                  <span className="projects-portfolio-health steady">Open project</span>
                </div>
                <p>{featuredProject.description || "No description yet."}</p>
                <div className="portfolio-feature-meta">
                  <span>{featuredProject._count?.tasks || 0} tasks</span>
                  <span>{featuredProject._count?.members || 0} members</span>
                  <span>{formatDate(featuredProject.createdAt)}</span>
                </div>
              </button>

              {previewTasks.length === 0 ? (
                <div className="delivery-lane-empty">No spotlight work yet.</div>
              ) : (
                previewTasks.map((task) => (
                  <div key={task.id} className="portfolio-ledger-card">
                    <div>
                      <strong>{task.title}</strong>
                      <span>{normalizeLabel(task.status?.name || "Queued")}</span>
                    </div>
                    <small>{task.type} / {task.priority}</small>
                  </div>
                ))
              )}
            </>
          ) : (
            <div className="delivery-lane-empty">No connected projects yet.</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="projects-portfolio-surface projects-portfolio-surface--network">
      <div className="projects-portfolio-network-hero">
        <div>
          <span className="projects-roadmap-kicker">Portfolio network</span>
          <h3>{selectedProject?.projectName || "Project"} relationship ledger</h3>
        </div>
        <div className="projects-portfolio-summary-pill">
          {summary?.completionRate || 0}% complete
        </div>
      </div>

      <div className="projects-portfolio-network-grid">
        <div className="projects-portfolio-network-column">
          {projects.map((project) => {
            const projectHealth = buildPortfolioHealth(project, selectedProjectId, summary);
            const isSelected = project.id === selectedProjectId;

            return (
              <div key={project.id} className={`projects-portfolio-network-card ${isSelected ? "active" : ""}`}>
                <div className="projects-portfolio-name">
                  <div
                    className="projects-rail-badge"
                    style={{ background: getProjectColor(project.id) }}
                  >
                    {project.projectName?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <strong>{project.projectName}</strong>
                    <span>{project.description || "No description yet."}</span>
                  </div>
                </div>
                <div className="projects-portfolio-network-meta">
                  <span>{formatDate(project.createdAt)}</span>
                  <span className={`projects-portfolio-health ${projectHealth.tone}`}>
                    {projectHealth.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="projects-portfolio-network-column projects-portfolio-network-column--detail">
          {previewTasks.map((task, index) => (
            <div key={task.id} className="projects-portfolio-task-rail" style={{ "--rail-index": index }}>
              <div className="projects-portfolio-task-card">
                <strong>{task.title}</strong>
                <span>{normalizeLabel(task.status?.name || "Queued")}</span>
                <small>{task.type} • {task.priority}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InspectorRow({ label, value }) {
  return (
    <div className="projects-inspector-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CreateProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onCreate({ name: name.trim(), description: description.trim() });
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
        style={{ maxWidth: 520 }}
      >
        <div className="modal-header">
          <span className="modal-title">Create new project</span>
          <button className="modal-close" onClick={onClose}>
            x
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="create-project-form">
              <div className="input-group">
                <label className="input-label" htmlFor="project-name-input">
                  Project name
                </label>
                <input
                  className="input"
                  id="project-name-input"
                  type="text"
                  placeholder="e.g. Mobile App Redesign"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="project-desc-input">
                  Description
                </label>
                <textarea
                  id="project-desc-input"
                  placeholder="Brief description of the project..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
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

function EditProjectModal({ project, onClose, onSave }) {
  const [name, setName] = useState(project.projectName || "");
  const [description, setDescription] = useState(project.description || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onSave(project.id, {
      name: name.trim(),
      description: description.trim(),
    });
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
        style={{ maxWidth: 520 }}
      >
        <div className="modal-header">
          <span className="modal-title">Edit project</span>
          <button className="modal-close" onClick={onClose}>
            x
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="create-project-form">
              <div className="input-group">
                <label className="input-label" htmlFor="edit-project-name">
                  Project name
                </label>
                <input
                  className="input"
                  id="edit-project-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="edit-project-desc">
                  Description
                </label>
                <textarea
                  id="edit-project-desc"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
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

function DeleteConfirmation({ project, onCancel, onConfirm }) {
  return (
    <div className="delete-confirm-overlay" onClick={onCancel}>
      <div
        className="delete-confirm-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <h3>Delete project</h3>
        <p>
          Are you sure you want to delete <strong>{project.projectName}</strong>?
          This action cannot be undone and all associated tasks will be
          permanently removed.
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

export default Projects;
