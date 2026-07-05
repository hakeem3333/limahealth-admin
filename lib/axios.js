import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
  timeout: 15000,
});

// Track refresh state per portal to avoid concurrent refresh races
let refreshingState = { super: false, school: false };
let queues          = { super: [],    school: []    };

const processQueue = (type, error) => {
  queues[type].forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  queues[type] = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network / server unreachable
    if (!error.response) {
      return Promise.reject({
        type: "NETWORK_ERROR",
        message: "Unable to connect to server. Please try again later.",
        originalError: error,
      });
    }

    const status   = error.response.status;
    const isSuper  = typeof window !== "undefined" && window.location.pathname.startsWith("/super-admin");
    const context  = isSuper ? "super" : "school";

    // 401 — attempt token refresh once
    if (status === 401 && !originalRequest._retry) {
      if (refreshingState[context]) {
        return new Promise((resolve, reject) => {
          queues[context].push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      refreshingState[context] = true;

      const refreshUrl = isSuper ? "/super-admin/refresh-token" : "/auth/refresh-token";

      try {
        await api.post(refreshUrl);
        refreshingState[context] = false;
        processQueue(context, null);
        return api(originalRequest);
      } catch (refreshError) {
        refreshingState[context] = false;
        processQueue(context, refreshError);

        const loginUrl = isSuper ? "/super-admin/login" : "/login";
        if (typeof window !== "undefined" && !window.location.pathname.startsWith(loginUrl)) {
          window.location.href = loginUrl;
        }
        return Promise.reject(refreshError);
      }
    }

    // 402 Payment Required — let AuthContext handle /auth/me; redirect others to billing
    if (status === 402) {
      if (originalRequest.url?.includes("/auth/me")) {
        return Promise.reject(error); // AuthContext reads the user from the error body
      }
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      if (!isSuper && !currentPath.includes("/billing") && !currentPath.includes("/login")) {
        window.location.href = "/billing";
      }
    }

    return Promise.reject(error);
  },
);
