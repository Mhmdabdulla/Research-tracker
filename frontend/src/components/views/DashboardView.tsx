// src/components/DashboardView.tsx
// DESIGN: unchanged — only mock data replaced with RTK Query hooks

import { motion } from "framer-motion";
import { FileText, TrendingUp, CheckCircle, ChevronRight, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetSummaryQuery, useGetRecentPapersQuery } from "../../services/apiSlice";

/* ──────── constants (unchanged) ──────── */
const STAGE_COLORS: Record<string, string> = {
  "Abstract Read": "bg-blue-500",
  "Introduction Done": "bg-purple-500",
  "Methods Reviewed": "bg-orange-500",
  "Results Analyzed": "bg-cyan-500",
  "Fully Read": "bg-emerald-500",
  "Notes Completed": "bg-indigo-500",
};

const getImpactBadge = (impact: string) => {
  switch (impact) {
    case "High":   return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
    case "Medium": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    case "Low":    return "bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    default:       return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

/* ──────── reusable micro-components ──────── */

// Inline loading skeleton — drops into any card without layout shift
function CardSkeleton() {
  return (
    <div className="flex items-center justify-center h-24">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  );
}

// Inline error state — same height as content so grid doesn't collapse
function CardError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-destructive text-sm py-4">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/* ──────── CircularProgress ──────── */
// Declared at module scope — NOT inside DashboardView.
// Defining a component inside another component's render function causes React
// to see it as a new component type on every render, remounting it from scratch
// and breaking animations (Framer Motion's initial/animate transition would
// restart on every parent re-render instead of running once on mount).

function CircularProgress({ value }: { value: number }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="48" cy="48" r={radius} className="stroke-muted fill-transparent" strokeWidth="8" />
        <motion.circle
          cx="48" cy="48" r={radius}
          className="stroke-primary fill-transparent"
          strokeWidth="8"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xl font-bold">{value}%</span>
    </div>
  );
}

/* ──────── props ──────── */
interface DashboardViewProps {
  onViewChange?: (view: string) => void;
}

/* ──────── component ──────── */
export function DashboardView({ onViewChange }: DashboardViewProps) {

  // ── Data fetching ─────────────────────────────────────────────────────────
  // useGetSummaryQuery fetches once and re-fetches automatically whenever
  // a paper is added, updated, or deleted (tag invalidation in apiSlice).

  const {
    data: summaryResponse,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useGetSummaryQuery();

  const {
    data: recentResponse,
    isLoading: recentLoading,
    isError: recentError,
  } = useGetRecentPapersQuery(5);

  // ── Derived values from API (safe defaults while loading) ─────────────────
  const summary = summaryResponse?.data;
  const totalPapers    = summary?.totalPapers    ?? 0;
  const avgCitations   = summary?.avgCitations   ?? 0;
  const fullyRead      = summary?.fullyReadCount  ?? 0;
  const completionRate = summary?.completionRate  ?? 0;
  // stageBreakdown already in the shape { stage, count }[] — matches what the
  // progress bars below expect, no client-side re-computation needed.
  const stageCounts    = summary?.stageBreakdown  ?? [];

  const recentPapers = recentResponse?.data ?? [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 w-full h-full overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here's an overview of your research progress.</p>
      </motion.div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Total Papers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card border-none bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 shadow-sm transition-all duration-300 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Papers</CardTitle>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              {summaryLoading ? <CardSkeleton /> : summaryError ? <CardError message="Failed to load" /> : (
                <>
                  <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalPapers}</div>
                  <p className="text-xs text-muted-foreground mt-1">Across all domains</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Avg Citations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-none bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 shadow-sm transition-all duration-300 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Citations/Paper</CardTitle>
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              {summaryLoading ? <CardSkeleton /> : summaryError ? <CardError message="Failed to load" /> : (
                <>
                  <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{avgCitations.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Impact metric</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Completion Rate */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card border-none shadow-sm transition-all duration-300 hover:shadow-md flex flex-row items-center h-full p-6 space-x-6">
            {summaryLoading ? <CardSkeleton /> : summaryError ? <CardError message="Failed to load" /> : (
              <>
                <CircularProgress value={completionRate} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Completion Rate
                  </span>
                  <span className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">
                    {fullyRead} / {totalPapers}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">Papers fully read</span>
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </div>

      {/* ── Reading Progress + Recent Papers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">

        {/* Reading Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Reading Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {summaryLoading ? (
                <CardSkeleton />
              ) : summaryError ? (
                <CardError message="Could not load reading progress." />
              ) : totalPapers === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BookOpen className="w-10 h-10 opacity-30 mb-3" />
                  <p className="text-sm">No papers tracked yet. Add your first paper to see progress!</p>
                </div>
              ) : (
                // stageCounts comes directly from the API — no client-side re-computation
                stageCounts.map(({ stage, count }) => (
                  <div key={stage}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-foreground">{stage}</span>
                      <span className="text-sm font-bold tabular-nums">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${STAGE_COLORS[stage] ?? "bg-slate-400"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${totalPapers > 0 ? (count / totalPapers) * 100 : 0}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Papers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold">Recent Papers</CardTitle>
              {onViewChange && (
                <button
                  onClick={() => onViewChange("library")}
                  className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <CardSkeleton />
              ) : recentError ? (
                <CardError message="Could not load recent papers." />
              ) : recentPapers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileText className="w-10 h-10 opacity-30 mb-3" />
                  <p className="text-sm">No papers added yet. Start by adding your first paper!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentPapers.map((paper) => (
                    <div
                      key={paper.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="min-w-0 flex-1 mr-4">
                        <p className="text-sm font-medium leading-tight truncate">{paper.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{paper.authors.join(", ")}</p>
                      </div>
                      <Badge className={`${getImpactBadge(paper.impactScore)} border text-xs font-medium shrink-0`}>
                        {paper.impactScore}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
