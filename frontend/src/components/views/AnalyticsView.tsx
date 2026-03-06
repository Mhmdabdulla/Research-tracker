import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    ZAxis,
    ComposedChart,
    Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPapers } from "@/lib/mockData";

export function AnalyticsView() {
    // 1. Funnel Data (Using a ComposedChart with Area/Bar to simulate a Funnel)
    const funnelData = useMemo(() => {
        const stages = ["To Read", "Abstract Read", "Introduction Done", "Methods Reviewed", "Results Analyzed", "Fully Read", "Notes Completed"];

        // Calculate how many papers reached AT LEAST each stage to form a funnel
        const stageCounts = stages.map(stage => {
            const count = mockPapers.filter(p => {
                const pIndex = stages.indexOf(p.stage);
                const sIndex = stages.indexOf(stage);
                return pIndex >= sIndex;
            }).length;
            return { name: stage, count };
        });

        return stageCounts;
    }, []);

    // 2. Scatter Plot Data (Citations vs Impact Score)
    const scatterData = useMemo(() => {
        const impactMap = { Low: 1, Medium: 2, High: 3, Unknown: 0 };
        return mockPapers.map(p => ({
            title: p.title,
            citations: p.citations,
            impact: impactMap[p.impactScore as keyof typeof impactMap],
            impactLabel: p.impactScore,
            domain: p.domain
        }));
    }, []);

    // 3. Stacked Bar Chart Data (Domain vs Reading Stage)
    const stackedData = useMemo(() => {
        const domains = Array.from(new Set(mockPapers.map(p => p.domain)));
        return domains.map(domain => {
            const papersInDomain = mockPapers.filter(p => p.domain === domain);
            return {
                domain,
                "To Read": papersInDomain.filter(p => p.stage === "To Read").length,
                "Abstract Read": papersInDomain.filter(p => p.stage === "Abstract Read").length,
                "Introduction Done": papersInDomain.filter(p => p.stage === "Introduction Done").length,
                "Methods Reviewed": papersInDomain.filter(p => p.stage === "Methods Reviewed").length,
                "Results Analyzed": papersInDomain.filter(p => p.stage === "Results Analyzed").length,
                "Fully Read": papersInDomain.filter(p => p.stage === "Fully Read").length,
                "Notes Completed": papersInDomain.filter(p => p.stage === "Notes Completed").length,
            };
        });
    }, []);

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 w-full h-full overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground">
                    Visual insights into your research reading habits and paper metrics.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
                {/* Funnel Chart - Reading Progression */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="glass-card shadow-sm h-[450px] flex flex-col">
                        <CardHeader>
                            <CardTitle>Reading Progression Funnel</CardTitle>
                            <CardDescription>Drop-off rate across different reading stages</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart layout="vertical" data={funnelData} margin={{ top: 20, right: 30, bottom: 20, left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} width={120} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" barSize={32} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stacked Bar Chart - Domain vs Stage */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="glass-card shadow-sm h-[450px] flex flex-col">
                        <CardHeader>
                            <CardTitle>Reading Status by Domain</CardTitle>
                            <CardDescription>Breakdown of paper stages across research fields</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stackedData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="domain" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} tickMargin={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="To Read" stackId="a" fill="#cbd5e1" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="Abstract Read" stackId="a" fill="#93c5fd" />
                                    <Bar dataKey="Introduction Done" stackId="a" fill="#c084fc" />
                                    <Bar dataKey="Methods Reviewed" stackId="a" fill="#fb923c" />
                                    <Bar dataKey="Results Analyzed" stackId="a" fill="#22d3ee" />
                                    <Bar dataKey="Fully Read" stackId="a" fill="#34d399" />
                                    <Bar dataKey="Notes Completed" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Scatter Plot - Citations vs Impact */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="xl:col-span-2">
                    <Card className="glass-card shadow-sm h-[500px] flex flex-col">
                        <CardHeader>
                            <CardTitle>Citation Count vs. Assessed Impact</CardTitle>
                            <CardDescription>Correlation between external citations and personal impact score</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis
                                        type="number"
                                        dataKey="citations"
                                        name="Citations"
                                        tickFormatter={(val) => val > 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="impact"
                                        name="Impact Score"
                                        domain={[0, 4]}
                                        ticks={[1, 2, 3]}
                                        tickFormatter={(val) => {
                                            if (val === 1) return "Low";
                                            if (val === 2) return "Medium";
                                            if (val === 3) return "High";
                                            return "";
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                                    />
                                    <ZAxis type="category" dataKey="domain" name="Domain" />
                                    <Tooltip
                                        cursor={{ strokeDasharray: '3 3' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-lg">
                                                        <p className="font-semibold text-sm max-w-[200px] truncate">{data.title}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">Domain: {data.domain}</p>
                                                        <p className="text-xs text-muted-foreground">Impact: {data.impactLabel}</p>
                                                        <p className="text-xs text-muted-foreground">Citations: {data.citations.toLocaleString()}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Scatter name="Papers" data={scatterData} fill="hsl(var(--primary))">
                                        {scatterData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                entry.impact === 3 ? "#ef4444" : // High - Red
                                                    entry.impact === 2 ? "#f59e0b" : // Medium - Amber
                                                        "#64748b" // Low - Slate
                                            } />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
