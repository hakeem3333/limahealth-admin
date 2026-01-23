// import axios from "axios";

// export const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
//   withCredentials: true,
// });

import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 15000, // optional but recommended
});

// Track refreshing states independently for each portal
let refreshingState = {
  super: false,
  school: false,
};

// Separate queues per portal
let queues = {
  super: [],
  school: [],
};

const processQueue = (type, error) => {
  queues[type].forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve();
  });
  queues[type] = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔴 NETWORK / CONNECTION ERROR (server down, refused, timeout, CORS failure)
    if (!error.response) {
      console.error("Network error or server unreachable", {
        message: error.message,
        baseURL: api.defaults.baseURL,
      });

      // Optional: global event, toast, or UI state
      // window.dispatchEvent(new Event("api:offline"));

      return Promise.reject({
        type: "NETWORK_ERROR",
        message: "Unable to connect to server. Please try again later.",
        originalError: error,
      });
    }

    // Detect portal context
    const isSuper = window.location.pathname.startsWith("/super-admin");
    const context = isSuper ? "super" : "school";

    // 🔐 AUTH ERROR — handle token refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      if (refreshingState[context]) {
        return new Promise((resolve, reject) => {
          queues[context].push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      refreshingState[context] = true;

      const refreshUrl = isSuper
        ? "/super-admin/refresh-token"
        : "/auth/refresh-token";

      try {
        await api.post(refreshUrl);

        refreshingState[context] = false;
        processQueue(context, null);

        return api(originalRequest);
      } catch (refreshError) {
        refreshingState[context] = false;
        processQueue(context, refreshError);

        const loginUrl = isSuper ? "/super-admin/login" : "/login";

        if (!window.location.pathname.startsWith(loginUrl)) {
          window.location.href = loginUrl;
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
