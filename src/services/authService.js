import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
});

// REQUEST
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// REFRESH CONTROL FLAG (sonsuz loop engeller)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 geldi
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        logoutAndRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = res.data.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        logoutAndRedirect();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function logoutAndRedirect() {
  console.log("🚪 Logging out user");

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  window.location.href = "/login";
}

// exports
export const loginRequest = (data) => api.post("/auth/login", data);
export const refreshRequest = (refreshToken) =>
  api.post("/auth/refresh", { refreshToken });
export const registerRequest = (data) => api.post("/auth/register", data);
export const logoutRequest = () => api.post("/auth/logout");

export default api;