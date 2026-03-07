// src/components/AnalyticsView.tsx
// DESIGN: unchanged — mock data replaced with RTK Query hooks

import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter, ZAxis, ComposedChart, Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import {
  useGetFunnelQuery,
  useGetDomainStagesQuery,
  useGetCitationsImpactQuery,
} from "../../services/apiSlice";

/* ── Shared skeleton/error helpers ── */
function ChartSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}
function ChartError({ message }: { message: string }) {
  return (
    <div className="flex-1 flex items-center justify-center gap-2 text-destructive min-h-[200px]">
      <AlertCircle className="w-5 h-5 shrink-0" /><span className="text-sm">{message}</span>
    </div>
  );
}

export function AnalyticsView() {

  // ── Data fetching ─────────────────────────────────────────────────────────
  // Each query is independent — if one fails the others still render.

  const {
    data: funnelResponse,
    isLoading: funnelLoading,
    isError: funnelError,
  } = useGetFunnelQuery();

  const {
    data: domainStagesResponse,
    isLoading: domainLoading,
    isError: domainError,
  } = useGetDomainStagesQuery();

  const {
    data: citationsResponse,
    isLoading: citationsLoading,
    isError: citationsError,
  } = useGetCitationsImpactQuery();

  // ── Unwrap data (safe defaults while loading) ─────────────────────────────
  // The API already returns data in exactly the shape Recharts expects,
  // so no client-side transformation is needed.
  const funnelData      = funnelResponse?.data      ?? [];
  const stackedData     = domainStagesResponse?.data ?? [];
  const scatterData     = citationsResponse?.data    ?? [];

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 w-full h-full overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Visual insights into your research reading habits and paper metrics.</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">

        {/* Funnel chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card shadow-sm h-[450px] flex flex-col">
            <CardHeader>
              <CardTitle>Reading Progression Funnel</CardTitle>
              <CardDescription>Drop-off rate across different reading stages</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              {funnelLoading ? <ChartSkeleton /> : funnelError ? <ChartError message="Could not load funnel data." /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart layout="vertical" data={funnelData} margin={{ top: 20, right: 30, bottom: 20, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} width={120} />
                    <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                    <Bar dataKey="count" barSize={32} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stacked bar chart — domain vs stage */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card shadow-sm h-[450px] flex flex-col">
            <CardHeader>
              <CardTitle>Reading Status by Domain</CardTitle>
              <CardDescription>Breakdown of paper stages across research fields</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              {domainLoading ? <ChartSkeleton /> : domainError ? <ChartError message="Could not load domain data." /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stackedData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="domain" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} tickMargin={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                    <Legend iconType="circle" />
                    <Bar dataKey="To Read"           stackId="a" fill="#cbd5e1" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="Abstract Read"     stackId="a" fill="#93c5fd" />
                    <Bar dataKey="Introduction Done" stackId="a" fill="#c084fc" />
                    <Bar dataKey="Methods Reviewed"  stackId="a" fill="#fb923c" />
                    <Bar dataKey="Results Analyzed"  stackId="a" fill="#22d3ee" />
                    <Bar dataKey="Fully Read"        stackId="a" fill="#34d399" />
                    <Bar dataKey="Notes Completed"   stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Scatter plot — citations vs impact */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="xl:col-span-2">
          <Card className="glass-card shadow-sm h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle>Citation Count vs. Assessed Impact</CardTitle>
              <CardDescription>Correlation between external citations and personal impact score</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              {citationsLoading ? <ChartSkeleton /> : citationsError ? <ChartError message="Could not load citation data." /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      type="number" dataKey="citations" name="Citations"
                      tickFormatter={(v) => v > 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                      axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      type="number" dataKey="impact" name="Impact Score"
                      domain={[0, 4]} ticks={[1, 2, 3]}
                      tickFormatter={(v) => v === 1 ? "Low" : v === 2 ? "Medium" : v === 3 ? "High" : ""}
                      axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <ZAxis type="category" dataKey="domain" name="Domain" />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ active, payload }) => {
                        if (active && payload?.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-lg">
                              <p className="font-semibold text-sm max-w-[200px] truncate">{d.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">Domain: {d.domain}</p>
                              <p className="text-xs text-muted-foreground">Impact: {d.impactLabel}</p>
                              <p className="text-xs text-muted-foreground">Citations: {d.citations.toLocaleString()}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Papers" data={scatterData} fill="hsl(var(--primary))">
                      {scatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.impact === 3 ? "#ef4444" :
                          entry.impact === 2 ? "#f59e0b" : "#64748b"
                        } />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
