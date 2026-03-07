// src/store/store.ts

import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../services/apiSlice";

export const store = configureStore({
  reducer: {
    // Mount the RTK Query reducer at the key defined in apiSlice.reducerPath ("api")
    [apiSlice.reducerPath]: apiSlice.reducer,
  },

  // apiSlice.middleware MUST be added — it handles:
  //  • cache lifetime management
  //  • tag invalidation & automatic re-fetching
  //  • subscription ref-counting
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Inferred RootState and AppDispatch types — import these in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;