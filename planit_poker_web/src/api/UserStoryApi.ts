import { EstimationPercentStoryDto } from "../utils/dtos/EstimationPercentStoryDto";
import { UserStoryDetailsDto } from "../utils/dtos/UserStoryDetailsDto";
import { apiSlice } from "./ApiSlice";

export const userStoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserStoriesBySessionId: builder.query<
      UserStoryDetailsDto[],
      { sessionId: number }
    >({
      query: ({ sessionId }) =>
        `/user-story-details/all-session?sessionId=${sessionId}`
    }),
    getEstimationPercentInSessionStories: builder.query<
      EstimationPercentStoryDto[],
      { sessionId: number }
    >({
      query: ({ sessionId }) =>
        `/user-story-details/stories-voted-percent?sessionId=${sessionId}`
    })
  })
});

export const {
  useGetUserStoriesBySessionIdQuery,
  useGetEstimationPercentInSessionStoriesQuery
} = userStoryApi;
