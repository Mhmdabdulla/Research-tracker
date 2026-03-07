// src/types/api.types.ts
// Mirrors backend DTOs 1-to-1 — do NOT diverge from these shapes

// ─── Enums (match backend exactly) ───────────────────────────────────────────

export type PaperStage =
  | "To Read"
  | "Abstract Read"
  | "Introduction Done"
  | "Methods Reviewed"
  | "Results Analyzed"
  | "Fully Read"
  | "Notes Completed";

export type ImpactScore = "High" | "Medium" | "Low" | "Unknown";

export type ResearchDomain =
  | "Computer Science"
  | "Biology"
  | "Physics"
  | "Chemistry"
  | "Mathematics"
  | "Medicine"
  | "Psychology"
  | "Economics"
  | "Engineering";

export type SortableField = "title" | "citations" | "dateAdded";
export type SortDirection = "asc" | "desc";
export type TimePeriod = "all" | "week" | "month" | "3months";

// ─── Paper ────────────────────────────────────────────────────────────────────

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  domain: ResearchDomain;
  stage: PaperStage;
  citations: number;
  impactScore: ImpactScore;
  dateAdded: string;
  updatedAt: string;
}

// ─── Request shapes ───────────────────────────────────────────────────────────

export interface CreatePaperRequest {
  title: string;
  authors: string[];
  domain: ResearchDomain;
  stage: PaperStage;
  citations: number;
  impactScore: ImpactScore;
}

export interface UpdatePaperRequest {
  title?: string;
  authors?: string[];
  domain?: ResearchDomain;
  stage?: PaperStage;
  citations?: number;
  impactScore?: ImpactScore;
}

export interface ListPapersParams {
  page?: number;
  limit?: number;
  q?: string;
  domain?: ResearchDomain[];
  stage?: PaperStage[];
  impactScore?: ImpactScore[];
  timePeriod?: TimePeriod;
  sortBy?: SortableField;
  sortDir?: SortDirection;
}

// ─── Generic API response wrappers (match backend ResponseHelper) ─────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface StageCount {
  stage: string;
  count: number;
}

export interface DashboardSummary {
  totalPapers: number;
  avgCitations: number;
  fullyReadCount: number;
  completionRate: number;
  stageBreakdown: StageCount[];
}

export interface RecentPaper {
  id: string;
  title: string;
  authors: string[];
  impactScore: string;
  domain: string;
  stage: string;
  dateAdded: string;
}

export interface FunnelDataPoint {
  name: string;
  count: number;
}

export interface DomainStagesDataPoint {
  domain: string;
  "To Read": number;
  "Abstract Read": number;
  "Introduction Done": number;
  "Methods Reviewed": number;
  "Results Analyzed": number;
  "Fully Read": number;
  "Notes Completed": number;
}

export interface CitationsImpactDataPoint {
  id: string;
  title: string;
  citations: number;
  impact: number;
  impactLabel: string;
  domain: string;
}