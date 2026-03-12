// src/store/store.ts
// Root Redux store: combines the RTK Query cache reducer with the auth slice.

import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../services/apiSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    // Auth slice — stores token (from localStorage) + current user object
    auth: authReducer,

    // RTK Query cache — handles all API requests and tag-based invalidation
    [apiSlice.reducerPath]: apiSlice.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    // apiSlice.middleware MUST be added for:
    //  • cache lifetime management
    //  • tag invalidation & automatic re-fetching
    //  • subscription ref-counting
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;