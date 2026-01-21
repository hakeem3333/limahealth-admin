// import axios from "axios";

// export const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
//   withCredentials: true,
// });

import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// Use an object to track refreshing states independently for each portal
let refreshingState = {
  super: false,
  school: false,
};

// Separate queues so Super Admin retries don't mix with School Admin retries
let queues = {
  super: [],
  school: [],
};

const processQueue = (type, error, token = null) => {
  queues[type].forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  queues[type] = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Detect which portal context we are in
    const isSuper = window.location.pathname.startsWith("/super-admin");
    const context = isSuper ? "super" : "school";

    if (error.response?.status === 401 && !originalRequest._retry) {
      // If the specific portal is already refreshing, queue this request
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
        processQueue(context, refreshError, null);

        // Redirect only the specific context to its respective login
        const loginUrl = isSuper ? "/super-admin/login" : "/login";

        // Prevent redirect loop if already on login page
        if (!window.location.pathname.includes(loginUrl)) {
          window.location.href = loginUrl;
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);