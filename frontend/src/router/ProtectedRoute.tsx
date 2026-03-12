// src/router/ProtectedRoute.tsx
// Guards private routes — redirects unauthenticated users to /login.
// Guards public routes — redirects authenticated users to /dashboard.

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";
import { selectIsAuthenticated } from "../store/authSlice";

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Wraps private routes. Passes the original path through `state.from` so
// LoginPage can redirect back after a successful login.

export function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// ─── PublicRoute ──────────────────────────────────────────────────────────────
// Wraps /login and /signup.
// If the user is already logged in, bounce them to /dashboard immediately.

export function PublicRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
