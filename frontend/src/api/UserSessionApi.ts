import {UserSessionDetailsDto} from "../utils/dtos/UserSessionDetailsDto";
import {apiSlice} from "./ApiSlice";

export const userSessionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserSessionDetailsBySessionId: builder.query<
      UserSessionDetailsDto[],
      { sessionId: number }
    >({
      query: ({ sessionId }) =>
        `/user-session-details/user-session?sessionId=${sessionId}`
    })
  })
});

export const { useGetUserSessionDetailsBySessionIdQuery } = userSessionApi;
