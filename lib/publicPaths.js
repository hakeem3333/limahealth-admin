// Routes reachable while logged out — shared between AuthContext (which redirects
// unauthenticated users elsewhere) and the axios interceptor (which redirects on
// refresh-token failure). Both must agree, or a logged-out visit to one of these
// pages (e.g. clicking a password-reset link from email) gets bounced to /login
// before the page can render.
export const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/super-admin/login",
];

export const isPublicPath = (path) => PUBLIC_PATHS.some((p) => path.startsWith(p));
