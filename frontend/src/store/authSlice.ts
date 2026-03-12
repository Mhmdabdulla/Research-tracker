// src/store/authSlice.ts
// Manages authentication state: token + user object.
// Token is synced to localStorage so the session survives page refresh.

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import type { AuthUser } from "../types/api.types";

// ─── Persistence helpers ──────────────────────────────────────────────────────

const TOKEN_KEY = "rt_token";

function loadToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // localStorage may be unavailable (private mode, storage full)
  }
}

function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

// ─── Slice state ──────────────────────────────────────────────────────────────

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = {
  // Rehydrate token from localStorage on startup
  token: loadToken(),
  user: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    /**
     * Called after a successful login or signup.
     * Persists the token and stores the user in Redux.
     */
    setCredentials(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      saveToken(action.payload.token);
    },

    /**
     * Called after getMe succeeds on app startup.
     * Updates the user object without touching the token.
     */
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },

    /**
     * Called on logout OR when a 401 response is received.
     * Wipes both Redux state and localStorage.
     */
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      clearToken();
    },
  },
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const { setCredentials, setUser, clearCredentials } = authSlice.actions;

export default authSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectToken = (state: RootState): string | null => state.auth.token;
export const selectUser = (state: RootState): AuthUser | null => state.auth.user;
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.token !== null;