import api from './authService';

export const getProjects = () => api.get('/projects');
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.patch(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const addProjectMember = (projectId, data) => api.post(`/projects/${projectId}/members`, data);
export const removeProjectMember = (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`);
