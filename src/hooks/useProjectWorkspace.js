import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProjectInsights, getProjects } from "../services/projectService";

const TAB_PATHS = {
  overview: "/project-detail",
  board: "/board",
  backlog: "/backlog",
  sprints: "/sprint",
  timeline: "/timeline",
  calendar: "/calendar",
  forms: "/forms",
  goals: "/goals",
  development: "/development",
  archive: "/archive",
  pages: "/pages",
  scope: "/scope",
  code: "/code",
};

export function useProjectWorkspace(activeTab) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const res = await getProjects();
        const projectList = res.data?.data ?? [];
        setProjects(projectList);
        const requestedProjectId = searchParams.get("projectId");
        const initialProjectId =
          (requestedProjectId &&
            projectList.some((project) => project.id === requestedProjectId) &&
            requestedProjectId) ||
          projectList[0]?.id ||
          "";
        setSelectedProjectId(initialProjectId);
        if (initialProjectId) {
          setSearchParams({ projectId: initialProjectId }, { replace: true });
        }
      } catch (loadError) {
        console.error("Failed to load projects", loadError);
        setError("Projects could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [setSearchParams]);

  const loadInsights = useCallback(async () => {
    if (!selectedProjectId) {
      setInsights(null);
      return;
    }

    setInsightsLoading(true);
    setError("");
    try {
      const res = await getProjectInsights(selectedProjectId);
      setInsights(res.data?.data ?? null);
    } catch (loadError) {
      console.error("Failed to load project insights", loadError);
      setError("Project insights could not be loaded.");
    } finally {
      setInsightsLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const handleProjectChange = (projectId) => {
    setSelectedProjectId(projectId);
    setSearchParams({ projectId }, { replace: true });
  };

  const handleTabChange = (tab) => {
    const path = TAB_PATHS[tab];
    if (!path) return;
    const query = selectedProjectId ? `?projectId=${selectedProjectId}` : "";
    navigate(`${path}${query}`);
  };

  const selectedProject = useMemo(
    () =>
      insights?.project ||
      projects.find((project) => project.id === selectedProjectId) ||
      null,
    [insights, projects, selectedProjectId]
  );

  return {
    activeTab,
    projects,
    selectedProjectId,
    selectedProject,
    insights,
    loading,
    insightsLoading,
    error,
    onProjectChange: handleProjectChange,
    onTabChange: handleTabChange,
    handleProjectChange,
    handleTabChange,
    refreshInsights: loadInsights,
  };
}
