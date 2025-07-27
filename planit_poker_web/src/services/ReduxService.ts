import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError
} from "@reduxjs/toolkit/query";
import { LocalStorageProperties } from "../utils/Enums";
import { SerializedError } from "@reduxjs/toolkit";
import {
  clearAuthenticatedUserData,
  getAuthenticatedUserClaim
} from "./AuthService";
import { RoutePaths } from "../utils/constants/RoutePaths";
import appConfig from "../config";

type BaseQueryFnResult = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError | SerializedError
>;

export const baseQueryWithReauth: BaseQueryFnResult = async (
  args,
  api,
  extraOptions
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: `${appConfig.baseUrl}`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const userToken = getAuthenticatedUserClaim(LocalStorageProperties.token);

      if (userToken) {
        headers.set("App-Auth", `${userToken}`);
      }
      headers.set("Content-Type", "application/json");

      return headers;
    }
  });

  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    clearAuthenticatedUserData();
    // Checking if the actual error was produced by missing authorization credentials,
    // which result in a response only with a 401 status code, but without any data in the body
    if (!result.error.data) {
      window.location.href = RoutePaths.SESSION_EXPIRED_LOGIN;
    }
  }

  return result;
};
