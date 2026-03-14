// src/store/store.ts
// Root Redux store: combines the RTK Query cache reducer with the auth slice.

import { configureStore, combineReducers, type Action } from "@reduxjs/toolkit";
import { apiSlice } from "../services/apiSlice";
import authReducer from "./authSlice";
import modalReducer from "./modalSlice";

const appReducer = combineReducers({
  // Auth slice — stores token (from localStorage) + current user object
  auth: authReducer,

  // Modal slice — manages confirmation modal state
  modal: modalReducer,

  // RTK Query cache — handles all API requests and tag-based invalidation
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: Action) => {
  if (action.type === "auth/clearCredentials") {
    // Reset the entire state to clear RTK Query cache and prevent leaking old session data
    state = undefined;
  }
  return appReducer(state, action as any);
};

export const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    // apiSlice.middleware MUST be added for:
    //  • cache lifetime management
    //  • tag invalidation & automatic re-fetching
    //  • subscription ref-counting
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;