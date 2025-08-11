export const RoutePaths = {
  LANDING_PAGE: "/",
  LOGIN: "/login",
  SESSION_EXPIRED_LOGIN: "/login?redirected=true",
  ADMIN_USERS: "/admin/users-list",
  ADMIN_SESSIONS: "/admin/sessions-list",
  ADMIN_USER_MANAGER_HOME: "/admin-user-manager/home",
  USER_MANAGER_SESSIONS: "/user-manager/sessions",
  SESSION_OVERVIEW: "/session-overview/session/:id",
  NOT_FOUND_FORBIDDEN: "/*",
  SESSION_ENDED: "/session-overview/session/end/:id"
};
