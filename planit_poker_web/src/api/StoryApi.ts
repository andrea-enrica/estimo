import { CreateStoryDto } from "../utils/dtos/CreateStoryDto";
import { StoryDto } from "../utils/dtos/StoryDto";
import { apiSlice } from "./ApiSlice";

export const storyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStories: builder.query<StoryDto[], { sessionId: number }>({
      query: ({ sessionId }) => `/stories/${sessionId}`
    }),
    createStory: builder.mutation<StoryDto, { newStory: CreateStoryDto }>({
      query: ({ newStory }) => ({
        url: `/stories`,
        method: "POST",
        body: newStory
      }),
      invalidatesTags: ["storyCache"]
    }),
    createStories: builder.mutation<
      StoryDto[],
      { newStories: CreateStoryDto[] }
    >({
      query: ({ newStories }) => ({
        url: `/stories/list`,
        method: "POST",
        body: newStories
      }),
      invalidatesTags: ["storyCache"]
    }),
    getStoriesBySessionId: builder.query<StoryDto[], { sessionId: number }>({
      query: ({ sessionId }) => `stories/${sessionId}`
    })
  })
});

export const {
  useGetStoriesQuery,
  useCreateStoryMutation,
  useCreateStoriesMutation,
  useGetStoriesBySessionIdQuery
} = storyApi;
