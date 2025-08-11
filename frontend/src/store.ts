import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {apiSlice} from "./api/ApiSlice";

export const store = configureStore({
  reducer: combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer
  }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      apiSlice.middleware
    )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
