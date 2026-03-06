import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnimatePresence, motion } from "framer-motion";

import { DashboardView, LibraryView, AnalyticsView } from "@/components/views";




function App() {
  const [currentView, setCurrentView] = useState("dashboard");

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView onViewChange={setCurrentView} />;
      case "library":
        return <LibraryView />;
      case "analytics":
        return <AnalyticsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-indigo-500/30">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 min-h-0 w-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
