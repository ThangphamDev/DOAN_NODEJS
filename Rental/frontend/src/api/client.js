import axios from "axios";
import { clearToken, getToken } from "@/utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isHandlingUnauthorized = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && getToken() && !isHandlingUnauthorized) {
      isHandlingUnauthorized = true;
      clearToken();

      if (typeof window !== "undefined") {
        const redirectTo = window.location.pathname.startsWith("/admin") ? "/admin/login" : "/login";
        window.location.replace(redirectTo);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
