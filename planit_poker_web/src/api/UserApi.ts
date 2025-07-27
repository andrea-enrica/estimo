import { clearAuthenticatedUserData } from "../services/AuthService";
import { AuthInfoDto } from "../utils/dtos/AuthInfoDto";
import { InviteRequestDto } from "../utils/dtos/InviteRequestDto";
import { LoginCredentialsDto } from "../utils/dtos/LoginCredentialsDto";
import { SessionDto } from "../utils/dtos/SessionDto";
import { SimpleUserDto } from "../utils/dtos/SimpleUserDto";
import { UserDto } from "../utils/dtos/UserDto";
import { UserProfileDto } from "../utils/dtos/UserProfileDto";
import { LocalStorageProperties } from "../utils/Enums";
import { apiSlice } from "./ApiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    editUser: builder.mutation<
      UserProfileDto,
      { userId: number; newUser: UserDto }
    >({
      query: ({ userId, newUser }) => ({
        url: `/users/${userId}`,
        method: "PATCH",
        body: newUser
      }),
      invalidatesTags: ["usersCache", "userProfileCache"]
    }),

    loginUser: builder.mutation<
      AuthInfoDto,
      { loginCredentials: LoginCredentialsDto }
    >({
      query: ({ loginCredentials }) => ({
        url: `/login`,
        method: "POST",
        body: loginCredentials
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          debugger;
          const { data } = await queryFulfilled;

          if (data.token) {
            const decodedToken = JSON.parse(atob(data.token.split(".")[1]));

            localStorage.setItem(LocalStorageProperties.token, data.token);
            localStorage.setItem(LocalStorageProperties.id, decodedToken.sub);
            localStorage.setItem(
              LocalStorageProperties.role,
              decodedToken.role
            );
            localStorage.setItem(
              LocalStorageProperties.email,
              decodedToken.email
            );
          } else {
            clearAuthenticatedUserData();
          }
        } catch (error) {
          console.error(error);
        }
      }
    }),

    getUserProfile: builder.query<UserProfileDto, { userId: number }>({
      query: ({ userId }) => `/users/${userId}`,
      providesTags: ["userProfileCache"],
      keepUnusedDataFor: 5000
    }),

    getManagers: builder.query<UserDto[], void>({
      query: () => `/users/managers`,
      providesTags: ["usersCache"],
      keepUnusedDataFor: 1000
    }),

    getUsersProfiles: builder.query<UserProfileDto[], void>({
      query: () => `/users/profiles`,
      providesTags: ["usersCache"],
      keepUnusedDataFor: 1000
    }),

    inviteUsersToSession: builder.mutation<
      void,
      { newInvitedUsers: InviteRequestDto }
    >({
      query: ({ newInvitedUsers }) => ({
        url: `/user-session-details/invite`,
        method: "POST",
        body: newInvitedUsers
      }),
      invalidatesTags: [
        "userInvitedSessionsCache",
        "userParticipatedSessionsCache"
      ]
    }),

    assignManagerToSession: builder.mutation<void, { request: SessionDto }>({
      query: ({ request }) => ({
        url: `user-session-details/assign`,
        method: "POST",
        body: request
      }),
      invalidatesTags: [
        "userParticipatedSessionsCache",
        "userManagedSessionsCache"
      ]
    }),
    getSimpleUsersInSession: builder.query<
      SimpleUserDto[],
      { sessionId: number }
    >({
      query: ({ sessionId }) => `session/users/${sessionId}`
    })
  })
});

export const {
  useGetUserProfileQuery,
  useEditUserMutation,
  useLoginUserMutation,
  useGetManagersQuery,
  useInviteUsersToSessionMutation,
  useAssignManagerToSessionMutation,
  useGetUsersProfilesQuery,
  useGetSimpleUsersInSessionQuery
} = userApi;
