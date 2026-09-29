import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/",
});

export function getMediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/catalog-images/") || path.startsWith("/collection/")) {
    return path;
  }

  const apiUrl = new URL(api.defaults.baseURL);
  return new URL(path, `${apiUrl.origin}/`).toString();
}

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshRequest;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refresh = sessionStorage.getItem("refresh");

    if (error.response?.status !== 401 || !refresh || originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    refreshRequest ||= axios.post(
      `${api.defaults.baseURL}auth/refresh/`,
      { refresh },
    ).then((response) => {
      sessionStorage.setItem("access", response.data.access);
      if (response.data.refresh) {
        sessionStorage.setItem("refresh", response.data.refresh);
      }
      return response.data.access;
    }).finally(() => {
      refreshRequest = undefined;
    });

    try {
      const access = await refreshRequest;
      originalRequest.headers.Authorization = `Bearer ${access}`;
      return api(originalRequest);
    } catch (refreshError) {
      sessionStorage.removeItem("access");
      sessionStorage.removeItem("refresh");
      return Promise.reject(refreshError);
    }
  },
);

export default api;