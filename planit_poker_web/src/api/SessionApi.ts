import { apiSlice } from "./ApiSlice";
import { SessionDto } from "../utils/dtos/SessionDto";
import { PaginatedResponseDto } from "../utils/dtos/PaginatedResponseDto";
import { FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import { UserMessageDto } from "../utils/dtos/UserMessageDto";
import { SessionStatus, UserSessionRole } from "../utils/Enums";
import { AddFeedbackDto } from "../utils/dtos/AddFeedbackDto";
import { UserSessionDetailsDto } from "../utils/dtos/UserSessionDetailsDto";

export const sessionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSessions: builder.query<SessionDto[], void>({
      query: () => `/session/all`,
      providesTags: ["sessionsCache"],
      keepUnusedDataFor: 1000
    }),

    updateSessionDetails: builder.mutation<
      SessionDto,
      { sessionId: number; title: string; customValues: string }
    >({
      query: ({ sessionId, title, customValues }) => ({
        url: `/session/${sessionId}`,
        method: "PUT",
        body: { title, customValues }
      }),
      invalidatesTags: ["sessionsCache"]
    }),

    saveSession: builder.mutation<SessionDto, { newSession: SessionDto }>({
      query: ({ newSession }) => ({
        url: `/session`,
        method: "POST",
        body: newSession
      }),
      invalidatesTags: ["sessionsCache"]
    }),

    updateSessionStatus: builder.mutation<
      SessionDto,
      { newStatus: SessionStatus; sessionId: number }
    >({
      query: ({ newStatus, sessionId }) => ({
        url: `/session/${sessionId}`,
        method: "PATCH",
        body: JSON.stringify(newStatus)
      }),
      invalidatesTags: ["joinedSessionsCache"]
    }),

    getSessionsByUser: builder.query<SessionDto[], number>({
      query: (userId) => `/users/sessions/${userId}`,
      providesTags: ["sessionsCache"],
      keepUnusedDataFor: 1000
    }),
    getManagedSessions: builder.query<SessionDto[], number>({
      query: (managerId) => `/session?sessionManagerId=${managerId}`,
      providesTags: ["userManagedSessionsCache"],
      keepUnusedDataFor: 1000
    }),

    getSessionsByUserParticipated: builder.query<SessionDto[], number>({
      query: (userId) => `/users/sessions/${userId}`,
      providesTags: ["userParticipatedSessionsCache"],
      keepUnusedDataFor: 1000
    }),

    getSessionsByUserInvited: builder.query<SessionDto[], number>({
      query: (userId) => `/users/sessions/invited/${userId}`,
      providesTags: ["userInvitedSessionsCache"],
      keepUnusedDataFor: 1000
    }),

    getSessionsPaged: builder.query<
      PaginatedResponseDto<SessionDto>,
      { page: number; size: number }
    >({
      query: ({ page, size }) => `/session/paged?size=${size}&page=${page}`,
      providesTags: ["sessionsCache"],
      keepUnusedDataFor: 1000
    }),

    deleteSession: builder.mutation<void, number>({
      query: (id) => ({
        url: `session/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["sessionsCache"]
    }),

    getSession: builder.query<SessionDto, number>({
      query: (sessionId) => ({
        url: `/session/${sessionId}`,
        method: "GET"
      }),
      providesTags: ["joinedSessionsCache"]
    }),

    getUsersBySession: builder.query<UserMessageDto[], number>({
      query: (sessionId) => `/session/users/${sessionId}`,
      providesTags: ["usersCache"],
      keepUnusedDataFor: 1000
    }),

    checkUserSessionAssignment: builder.query<
      boolean,
      { sessionId: number; userId: number }
    >({
      query: ({ sessionId, userId }) => ({
        url: `/user-session-details?sessionId=${sessionId}&userId=${userId}`,
        method: "HEAD"
      }),
      transformResponse: (_: void, meta: FetchBaseQueryMeta | undefined) => {
        return meta?.response?.ok || false;
      }
    }),

    acceptInvite: builder.mutation<void, { userId: number; sessionId: number }>(
      {
        query: ({ userId, sessionId }) => ({
          url: `user-session-details/accept?userId=${userId}&sessionId=${sessionId}`,
          method: "POST"
        }),
        invalidatesTags: [
          "userInvitedSessionsCache",
          "userParticipatedSessionsCache"
        ]
      }
    ),

    declineInvite: builder.mutation<
      void,
      { userId: number; sessionId: number }
    >({
      query: ({ userId, sessionId }) => ({
        url: `user-session-details/decline?userId=${userId}&sessionId=${sessionId}`,
        method: "DELETE"
      }),
      invalidatesTags: [
        "userInvitedSessionsCache",
        "userParticipatedSessionsCache"
      ]
    }),
    addFeedback: builder.mutation<
      UserSessionDetailsDto,
      { userId: number; sessionId: number; feedback: AddFeedbackDto }
    >({
      query: ({ userId, sessionId, feedback }) => ({
        url: `/user-session-details/${userId}/${sessionId}`,
        method: "PATCH",
        body: feedback
      })
    }),
    getUserStories: builder.query<UserSessionDetailsDto[], void>({
      query: () => `/user-story-details/all`
    }),
    getSessionRoleAuthUser: builder.query<
      UserSessionRole,
      { sessionId: number; userId: number }
    >({
      query: ({ sessionId, userId }) => ({
        url: `/user-session-details/session-role`,
        method: "GET",
        params: { sessionId, userId }
      })
    }),
    updateUserSessionRole: builder.mutation<
      UserSessionDetailsDto,
      { newRole: UserSessionRole; userId: number; sessionId: number }
    >({
      query: ({ sessionId, userId, newRole }) => ({
        url: `/user-session-details/change-role/${userId}/${sessionId}`,
        method: "PATCH",
        body: JSON.stringify(newRole)
      }),
      invalidatesTags: ["userSessionDetailsCache"]
    })
  })
});

export const {
  useUpdateSessionDetailsMutation,
  useLazyGetSessionsPagedQuery,
  useGetSessionsByUserParticipatedQuery,
  useUpdateSessionStatusMutation,
  useDeleteSessionMutation,
  useSaveSessionMutation,
  useGetSessionQuery,
  useCheckUserSessionAssignmentQuery,
  useGetSessionsByUserInvitedQuery,
  useGetManagedSessionsQuery,
  useAcceptInviteMutation,
  useDeclineInviteMutation,
  useAddFeedbackMutation,
  useGetSessionRoleAuthUserQuery,
  useUpdateUserSessionRoleMutation
} = sessionApi;
