// src/components/LibraryView.tsx
// DESIGN: unchanged — mock data + client-side filter/sort replaced with RTK Query

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { PaperStage, ResearchDomain, ImpactScore } from "../../types/api.types";
import {
  Search, Filter, ArrowUpDown, MoreHorizontal, ChevronDown,
  ChevronLeft, ChevronRight, Pencil, Trash2, X, Check, Loader2, AlertCircle,
} from "lucide-react";
import { AddPaperDialog } from "@/components/dialogs/AddPaperDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetPapersQuery,
  useDeletePaperMutation,
  useUpdatePaperMutation,
} from "../../services/apiSlice";
import { useConfirm } from "../../hooks/useConfirm";
import { toast } from "sonner";
import type { ListPapersParams } from "../../types/api.types";

/* ──────────── constants ──────────── */
const ALL_DOMAINS: ResearchDomain[] = [
  "Computer Science", "Biology", "Physics", "Chemistry",
  "Mathematics", "Medicine", "Psychology", "Economics", "Engineering",
];
// FIX 3: "To Read" was missing — users couldn't update a paper back to that stage.
const ALL_STAGES: PaperStage[] = [
  "To Read", "Abstract Read", "Introduction Done", "Methods Reviewed",
  "Results Analyzed", "Fully Read", "Notes Completed",
];
const ALL_IMPACTS: ImpactScore[] = ["High", "Medium", "Low", "Unknown"];
const TIME_OPTIONS = [
  { label: "All Time",      value: "all"     },
  { label: "This Week",     value: "week"    },
  { label: "This Month",    value: "month"   },
  { label: "Last 3 Months", value: "3months" },
] as const;
const ITEMS_PER_PAGE = 10;

/* ──────────── color helpers (unchanged) ──────────── */
const getStageColor = (stage: string) => {
  switch (stage) {
    case "To Read":           return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    case "Abstract Read":     return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "Introduction Done": return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    case "Methods Reviewed":  return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800";
    case "Results Analyzed":  return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800";
    case "Fully Read":        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "Notes Completed":   return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    default:                  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200";
  }
};
const getImpactColor = (impact: string) => {
  switch (impact) {
    case "High":   return "text-red-600 dark:text-red-400";
    case "Medium": return "text-amber-600 dark:text-amber-400";
    case "Low":    return "text-slate-500 dark:text-slate-400";
    default:       return "text-gray-500";
  }
};

/* ──────────── component ──────────── */
export function LibraryView() {

  // ── Filter / sort / pagination state ─────────────────────────────────────
  const [searchQuery,     setSearchQuery]     = useState("");
  const [debouncedQuery,  setDebouncedQuery]  = useState("");
  const [showFilters,     setShowFilters]     = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<ResearchDomain[]>([]);
  const [selectedStages,  setSelectedStages]  = useState<PaperStage[]>([]);
  const [selectedImpacts, setSelectedImpacts] = useState<ImpactScore[]>([]);
  const [timePeriod,      setTimePeriod]      = useState<ListPapersParams["timePeriod"]>("all");
  const [showTimePicker,  setShowTimePicker]  = useState(false);
  const [sortKey,         setSortKey]         = useState<ListPapersParams["sortBy"]>(undefined);
  const [sortDir,         setSortDir]         = useState<"asc" | "desc">("asc");
  // FIX 1: currentPage is now reset inline inside the filter setters (see toggleFilter,
  // setTimePeriod calls, etc.) instead of in a useEffect. This avoids the "cascading
  // renders" ESLint warning — setState in an effect body triggers an extra render cycle.
  const [currentPage,     setCurrentPage]     = useState(1);

  const timeRef   = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Debounce search — resets page when the debounced value settles
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // co-located with the state it depends on, not a separate effect
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // FIX 2: Close only the filter/time dropdowns on outside click.
  // The row menu (activeRowMenu) is NOT closed here — closing it in the same
  // mousedown event that opens it caused the menu to flash open then immediately
  // close before the button's onClick could register.
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (timeRef.current   && !timeRef.current.contains(e.target as Node))   setShowTimePicker(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ── RTK Query — ALL filtering/sorting/pagination is done server-side ─────
  // The hook re-fires whenever any of its arguments change.
  const queryParams: ListPapersParams = {
    page:        currentPage,
    limit:       ITEMS_PER_PAGE,
    q:           debouncedQuery || undefined,
    domain:      selectedDomains.length > 0 ? selectedDomains : undefined,
    stage:       selectedStages.length  > 0 ? selectedStages  : undefined,
    impactScore: selectedImpacts.length > 0 ? selectedImpacts : undefined,
    timePeriod,
    sortBy:      sortKey,
    sortDir:     sortDir,
  };

  const { data, isLoading, isFetching, isError } = useGetPapersQuery(queryParams);

  const papers     = data?.data ?? [];
  const meta       = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  // ── Mutations ─────────────────────────────────────────────────────────────
  // AddPaperDialog now owns its own useAddPaperMutation — no prop needed here.
  const [deletePaper, { isLoading: isDeleting }] = useDeletePaperMutation();
  const [updatePaper, { isLoading: isUpdating }] = useUpdatePaperMutation();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const { confirm } = useConfirm();

  const handleDeletePaper = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Delete Paper",
      message: "Are you sure you want to delete this research paper? This action cannot be undone.",
      confirmText: "Delete",
      type: "danger",
    });

    if (!isConfirmed) return;

    try {
      await deletePaper(id).unwrap();
      toast.success("Paper deleted successfully");
    } catch (err) {
      toast.error("Failed to delete paper");
      console.error("Failed to delete paper:", err);
    }
  };

  const handleUpdateStage = async (id: string, newStage: PaperStage) => {
    try {
      await updatePaper({ id, body: { stage: newStage } }).unwrap();
      toast.success(`Stage updated to ${newStage}`);
    } catch (err) {
      toast.error("Failed to update stage");
      console.error("Failed to update stage:", err);
    }
  };

  const toggleSort = (key: NonNullable<ListPapersParams["sortBy"]>) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setCurrentPage(1);
  };

  const toggleFilter = <T extends string>(
    arr: T[], value: T, setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setter(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
    setCurrentPage(1);
  };

  const activeFilterCount  = selectedDomains.length + selectedStages.length + selectedImpacts.length;
  const currentTimeLabel   = TIME_OPTIONS.find(t => t.value === timePeriod)?.label ?? "All Time";

  /* ──────── render ──────── */
  return (
    <div className="p-4 md:p-8 w-full h-full flex flex-col overflow-hidden">

      {/* Header — unchanged */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0 mb-6"
      >
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground text-sm">Manage and organize your research papers.</p>
        </div>
        <div className="flex items-center gap-3">
          <AddPaperDialog />
        </div>
      </motion.div>

      {/* Toolbar — unchanged structure */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 shrink-0"
      >
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search papers..."
            className="pl-9 h-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filters toggle */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md border bg-background hover:bg-accent transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
              )}
            </button>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 top-full mt-2 w-64 bg-popover border rounded-lg shadow-xl z-50 max-h-[70vh] overflow-y-auto"
                >
                  <div className="p-3 border-b">
                    <p className="font-semibold text-sm mb-2">Research Domain</p>
                    {ALL_DOMAINS.map(d => (
                      <button key={d} onClick={() => toggleFilter(selectedDomains, d, setSelectedDomains)}
                        className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${selectedDomains.includes(d) ? "text-primary bg-primary/10" : "text-popover-foreground hover:bg-accent"}`}>
                        {selectedDomains.includes(d) && <Check className="inline w-3 h-3 mr-2" />}{d}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 border-b">
                    <p className="font-semibold text-sm mb-2">Reading Stage</p>
                    {ALL_STAGES.map(s => (
                      <button key={s} onClick={() => toggleFilter(selectedStages, s, setSelectedStages)}
                        className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${selectedStages.includes(s) ? "text-primary bg-primary/10" : "text-popover-foreground hover:bg-accent"}`}>
                        {selectedStages.includes(s) && <Check className="inline w-3 h-3 mr-2" />}{s}
                      </button>
                    ))}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm mb-2">Impact Score</p>
                    {ALL_IMPACTS.map(i => (
                      <button key={i} onClick={() => toggleFilter(selectedImpacts, i, setSelectedImpacts)}
                        className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${selectedImpacts.includes(i) ? "text-primary bg-primary/10" : "text-popover-foreground hover:bg-accent"}`}>
                        {selectedImpacts.includes(i) && <Check className="inline w-3 h-3 mr-2" />}{i}
                      </button>
                    ))}
                  </div>
                  {activeFilterCount > 0 && (
                    <div className="p-3 border-t">
                      <button onClick={() => { setSelectedDomains([]); setSelectedStages([]); setSelectedImpacts([]); setCurrentPage(1); }}
                        className="text-xs text-destructive hover:text-destructive/80">Clear all filters</button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Time period dropdown */}
          <div className="relative" ref={timeRef}>
            <button onClick={() => setShowTimePicker(!showTimePicker)}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md border bg-background hover:bg-accent transition-colors">
              {currentTimeLabel}<ChevronDown className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showTimePicker && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 top-full mt-2 w-48 bg-popover border rounded-lg shadow-xl z-50 py-1"
                >
                  {TIME_OPTIONS.map(t => (
                    <button key={t.value}
                      onClick={() => { setTimePeriod(t.value as ListPapersParams["timePeriod"]); setShowTimePicker(false); setCurrentPage(1); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${timePeriod === t.value ? "text-primary bg-primary/10" : "text-popover-foreground hover:bg-accent"}`}>
                      {t.label}{timePeriod === t.value && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Active filter pills — unchanged */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 shrink-0">
          {selectedDomains.map(d => (
            <span key={d} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {d}<X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter(selectedDomains, d, setSelectedDomains)} />
            </span>
          ))}
          {selectedStages.map(s => (
            <span key={s} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {s}<X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter(selectedStages, s, setSelectedStages)} />
            </span>
          ))}
          {selectedImpacts.map(i => (
            <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {i}<X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter(selectedImpacts, i, setSelectedImpacts)} />
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto rounded-xl border bg-card relative">
        {/* Subtle re-fetch overlay — shows when data is stale and refreshing */}
        {isFetching && !isLoading && (
          <div className="absolute top-2 right-3 z-20 flex items-center gap-1.5 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full border">
            <Loader2 className="w-3 h-3 animate-spin" /> Updating…
          </div>
        )}

        <Table className="min-w-[800px]">
          <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                <button onClick={() => toggleSort("title")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Title <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Domain</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Stage</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                <button onClick={() => toggleSort("citations")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Citations <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Impact</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                <button onClick={() => toggleSort("dateAdded")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Added <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Initial full-page load */}
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm">Loading papers…</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-destructive">
                    <AlertCircle className="w-8 h-8" />
                    <p className="text-sm">Failed to load papers. Check your connection and try again.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : papers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Search className="w-10 h-10 opacity-30" />
                    <p>No papers found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              papers.map((paper) => (
                <TableRow key={paper.id} className="hover:bg-muted/40 transition-colors group">
                  <TableCell className="py-3.5">
                    <div>
                      <p className="font-medium leading-tight text-sm">{paper.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{paper.authors.join(", ")}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{paper.domain}</TableCell>
                  <TableCell>
                    <Badge className={`${getStageColor(paper.stage)} border text-xs font-medium whitespace-nowrap`}>
                      {paper.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-sm tabular-nums">{paper.citations.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`text-sm font-medium ${getImpactColor(paper.impactScore)}`}>{paper.impactScore}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {new Date(paper.dateAdded).toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" })}
                  </TableCell>

                  {/* Row actions — Using DropdownMenu for proper portal rendering to avoid clipping */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground outline-none">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel className="flex items-center gap-2">
                          <Pencil className="w-3.5 h-3.5" /> Update Stage
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {ALL_STAGES.map(s => (
                          <DropdownMenuItem
                            key={s}
                            disabled={isUpdating}
                            onClick={() => handleUpdateStage(paper.id, s)}
                            className={paper.stage === s ? "text-primary bg-primary/10 font-medium cursor-pointer" : "cursor-pointer pl-6"}
                          >
                            {isUpdating && paper.stage === s && (
                              <Loader2 className="inline w-3 h-3 mr-2 animate-spin" />
                            )}
                            {s}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={isDeleting}
                          onClick={() => handleDeletePaper(paper.id)}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination — driven by server meta */}
      <div className="flex items-center justify-between pt-4 shrink-0">
        <span className="text-sm text-muted-foreground">
          {meta
            ? `Showing ${meta.total > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–${Math.min(currentPage * ITEMS_PER_PAGE, meta.total)} of ${meta.total} papers`
            : "Loading…"}
        </span>
        <div className="flex items-center gap-1">
          <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}
            className="p-2 rounded-md border bg-background hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${currentPage === page ? "bg-primary text-primary-foreground" : "border bg-background hover:bg-accent text-muted-foreground"}`}>
              {page}
            </button>
          ))}
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}
            className="p-2 rounded-md border bg-background hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
