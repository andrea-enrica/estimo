import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../services/ReduxService";

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: [
    "usersCache",
    "sessionsCache",
    "userProfileCache",
    "userInvitedSessionsCache",
    "userParticipatedSessionsCache",
    "userManagedSessionsCache",
    "joinedSessionsCache",
    "storyCache",
    "userSessionDetailsCache"
  ]
});
