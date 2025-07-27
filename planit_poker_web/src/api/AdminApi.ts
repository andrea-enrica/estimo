import { PaginatedResponseDto } from "../utils/dtos/PaginatedResponseDto";
import { UserDto } from "../utils/dtos/UserDto";
import { apiSlice } from "./ApiSlice";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsersPaged: builder.query<
      PaginatedResponseDto<UserDto>,
      { page: number; size: number }
    >({
      query: ({ page, size }) => `/admin/paged?size=${size}&page=${page}`,
      providesTags: ["usersCache"],
      keepUnusedDataFor: 1000
    }),

    getUser: builder.query<UserDto, { userId: number }>({
      query: ({ userId }) => `/admin/users/${userId}`
    }),

    saveUser: builder.mutation<UserDto, { newUser: UserDto }>({
      query: ({ newUser }) => ({
        url: `admin/users`,
        method: "POST",
        body: newUser
      }),

      invalidatesTags: ["usersCache"]
    }),

    updateUser: builder.mutation<UserDto, { userId: number; newUser: UserDto }>(
      {
        query: ({ userId, newUser }) => ({
          url: `/admin/users/${userId}`,
          method: "PUT",
          body: newUser
        }),
        invalidatesTags: ["usersCache", "userProfileCache"]
      }
    ),

    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/users/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["usersCache"]
    })
  })
});

export const {
  useGetUsersPagedQuery,
  useLazyGetUsersPagedQuery,
  useGetUserQuery,
  useSaveUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation
} = adminApi;
