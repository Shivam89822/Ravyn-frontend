import axios from "axios";

const defaultApiBaseUrl = "https://ravyn-backend.onrender.com";
const hostname =
  typeof window !== "undefined" ? window.location.hostname : "localhost";
const apiBaseUrl =
  process.env.REACT_APP_API_BASE_URL || defaultApiBaseUrl;

if (typeof window !== "undefined") {
  console.log("[api] base URL configured", {
    apiBaseUrl,
    envValue: process.env.REACT_APP_API_BASE_URL || null,
    hostname,
  });

  if (!process.env.REACT_APP_API_BASE_URL) {
    console.warn(
      "[api] REACT_APP_API_BASE_URL is missing. Falling back to default deployed backend.",
      defaultApiBaseUrl
    );
  }
}

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[api] request failed", {
      url: err.config?.url || null,
      baseURL: err.config?.baseURL || apiBaseUrl,
      method: err.config?.method || null,
      status: err.response?.status || null,
      message: err.message,
    });
    if (err.response && err.response.status === 401) {
      window.location.href = "/"; // redirect to intro/login
    }
    return Promise.reject(err);
  }
);

export default api;
