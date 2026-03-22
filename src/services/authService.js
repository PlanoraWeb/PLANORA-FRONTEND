import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:5000/api/v1"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const loginRequest = (data) => api.post("/auth/login", data);
export const refreshRequest = (refreshToken) => api.post("/auth/refresh", { refreshToken });
export const registerRequest = (data) => api.post("/auth/register", data);

export default api;