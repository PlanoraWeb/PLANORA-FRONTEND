import api from './authService';

export const getProfile = () => api.get('/users/me');
export const getAllUsers = () => api.get('/users');
export const updateProfile = (data) => api.put('/users/me', data);
export const updatePassword = (data) => api.patch('/users/me/password', data);
