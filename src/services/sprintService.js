import api from './authService';

export const createSprint = (projectId, data) => api.post(`/sprints/project/${projectId}`, data);
export const getSprintsByProject = (projectId) => api.get(`/sprints/project/${projectId}`);
export const getActiveSprint = (projectId) => api.get(`/sprints/project/${projectId}/active`);
export const getSprintVelocity = (projectId) => api.get(`/sprints/project/${projectId}/velocity`);
export const getSprintById = (id) => api.get(`/sprints/${id}`);
export const updateSprint = (id, data) => api.put(`/sprints/${id}`, data);
export const deleteSprint = (id) => api.delete(`/sprints/${id}`);
export const addSprintTasks = (id, taskIds) => api.post(`/sprints/${id}/tasks`, { taskIds });
export const removeSprintTasks = (id, taskIds) => api.delete(`/sprints/${id}/tasks`, { data: { taskIds } });
export const getSprintBurndown = (id) => api.get(`/sprints/${id}/burndown`);
