import api from './authService';

// ── Task CRUD ──────────────────────────────────────────────────
export const getMyTasks = () => api.get('/tasks/me');
export const getTasksByProject = (projectId, params) => api.get(`/tasks/project/${projectId}`, { params });
export const createTask = (projectId, data) => api.post(`/tasks/project/${projectId}`, data);
export const getTaskById = (id) => api.get(`/tasks/${id}`);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const changeTaskStatus = (id, statusId, newOrder) => api.patch(`/tasks/${id}/status`, { statusId, newOrder });
export const assignTask = (id, assigneeId) => api.patch(`/tasks/${id}/assign`, { assigneeId });

// ── Task Statuses (Kanban Columns) ────────────────────────────
export const getStatusesByProject = (projectId) => api.get(`/task-statuses/project/${projectId}`);
