import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Library,
    LineChart,
    Settings,
    ChevronLeft,
    ChevronRight,
    Menu,
    BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    currentView: string;
    onViewChange: (view: string) => void;
}

const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "library", label: "Library", icon: Library },
    { id: "analytics", label: "Analytics", icon: LineChart },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const navContent = (
        <div className="flex flex-col h-full py-6">
            <div className={cn("flex items-center mb-10 px-6 transition-all", isCollapsed && !isMobile ? "justify-center px-0" : "")}>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-md shrink-0">
                    <BookOpen className="w-6 h-6" />
                </div>
                {(!isCollapsed || isMobile) && (
                    <span className="ml-3 font-semibold text-lg tracking-tight whitespace-nowrap">
                        ScholarTrack
                    </span>
                )}
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                onViewChange(item.id);
                                if (isMobile) setIsMobileOpen(false);
                            }}
                            className={cn(
                                "flex items-center w-full p-3 rounded-lg transition-all duration-200 group",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                                isCollapsed && !isMobile ? "justify-center" : ""
                            )}
                            title={isCollapsed && !isMobile ? item.label : undefined}
                        >
                            <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary-foreground" : "")} />
                            {(!isCollapsed || isMobile) && (
                                <span className="ml-3 font-medium whitespace-nowrap">{item.label}</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="px-4 mt-auto">
                <button className={cn(
                    "flex items-center w-full p-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 group",
                    isCollapsed && !isMobile ? "justify-center" : ""
                )}>
                    <Settings className="w-5 h-5 shrink-0" />
                    {(!isCollapsed || isMobile) && (
                        <span className="ml-3 font-medium whitespace-nowrap">Settings</span>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden flex items-center justify-between p-4 bg-background border-b z-20 sticky top-0">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-lg">ScholarTrack</span>
                </div>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" onClick={() => setIsMobileOpen(true)}>
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Drawer Overlay */}
            <AnimatePresence>
                {isMobile && isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="fixed inset-y-0 left-0 w-72 bg-background border-r z-50 shadow-2xl"
                        >
                            {navContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 280 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="hidden md:flex flex-col sticky top-0 h-screen border-r bg-background/50 backdrop-blur-xl relative z-30"
            >
                {navContent}

                {/* Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-12 w-6 h-6 rounded-full bg-border border border-background flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm hover:scale-110 transition-transform"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </motion.aside>
        </>
    );
}
