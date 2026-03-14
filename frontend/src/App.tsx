// src/App.tsx
// Route structure:
//   Public  (PublicRoute):  /login  /signup  /  → redirect to /login
//   Private (ProtectedRoute): /dashboard  /library  /analytics  /profile

import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Router guards
import { ProtectedRoute, PublicRoute } from "./router/ProtectedRoute";

// App initializer (rehydrates user on startup)
import { AppInitializer } from "./components/layout/AppInitializer";
import { ConfirmModal } from "./components/ui/ConfirmModal";
import { Toaster } from "sonner";

// Public pages
import { LoginPage }  from "./components/auth/LoginPage";
import { SignupPage } from "./components/auth/SignupPage";

// Private layout + views
// NOTE: These imports use the paths from your existing project structure.
// Update the aliases (@/...) to match your tsconfig/vite.config paths.
import { Sidebar }       from "@/components/layout/Sidebar";
import { DashboardView } from "@/components/views/DashboardView";
import { LibraryView }   from "@/components/views/LibraryView";
import { AnalyticsView } from "@/components/views/AnalyticsView";
import { ProfilePage }   from "./components/profile/ProfilePage";

// ─── Private Layout ───────────────────────────────────────────────────────────
// Shared chrome (Sidebar) wrapping all protected views.
// Uses React Router's <Outlet /> so child routes render inside it.

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Map route path to the sidebar's currentView prop
  const viewFromPath = (path: string): string => {
    if (path.startsWith("/library"))   return "library";
    if (path.startsWith("/analytics")) return "analytics";
    if (path.startsWith("/profile"))   return "profile";
    return "dashboard";
  };

  const currentView = viewFromPath(location.pathname);

  const handleViewChange = (view: string) => {
    navigate(`/${view}`);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-indigo-500/30">
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />

      <main className="flex-1 min-h-0 w-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Child route component renders here */}
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    // AppInitializer fires getMe on startup when a token is present,
    // restoring the user object in Redux without blocking the UI.
    <AppInitializer>
      <Toaster position="top-right" expand={false} richColors />
      <ConfirmModal />
      <Routes>

        {/* ── Public routes (redirect to /dashboard if already logged in) ── */}
        <Route element={<PublicRoute />}>
          <Route path="/login"  element={<LoginPage />}  />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* ── Protected routes (redirect to /login if not authenticated) ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardView onViewChange={(v) => { /* handled by AppLayout */ void v; }} />} />
            <Route path="/library"   element={<LibraryView />}   />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/profile"   element={<ProfilePage />}   />
          </Route>
        </Route>

        {/* ── Default redirect ── */}
        {/* / → /login for unauthenticated, PublicRoute bounces logged-in → /dashboard */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </AppInitializer>
  );
}
