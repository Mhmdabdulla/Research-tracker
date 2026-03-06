// src/dtos/analytics.dto.ts

// ─── Dashboard Summary ────────────────────────────────────────────────────────

export interface StageCountDto {
  stage: string;
  count: number;
}

export interface DashboardSummaryDto {
  totalPapers: number;
  avgCitations: number;
  fullyReadCount: number;
  completionRate: number;          // percentage 0–100
  stageBreakdown: StageCountDto[]; // per-stage counts for the Reading Progress bars
}

// ─── Recent Papers ────────────────────────────────────────────────────────────

export interface RecentPaperDto {
  id: string;
  title: string;
  authors: string[];
  impactScore: string;
  domain: string;
  stage: string;
  dateAdded: string;
}

export type RecentPapersResponseDto = RecentPaperDto[];

// ─── Funnel ───────────────────────────────────────────────────────────────────

export interface FunnelDataPointDto {
  name: string;  // stage name
  count: number; // cumulative papers that reached at least this stage
}

export type FunnelResponseDto = FunnelDataPointDto[];

// ─── Domain Stages ────────────────────────────────────────────────────────────

export interface DomainStagesDataPointDto {
  domain: string;
  "To Read": number;
  "Abstract Read": number;
  "Introduction Done": number;
  "Methods Reviewed": number;
  "Results Analyzed": number;
  "Fully Read": number;
  "Notes Completed": number;
}

export type DomainStagesResponseDto = DomainStagesDataPointDto[];

// ─── Citations vs Impact ──────────────────────────────────────────────────────

export interface CitationsImpactDataPointDto {
  id: string;
  title: string;
  citations: number;
  impact: number;        // numeric: Low=1, Medium=2, High=3, Unknown=0
  impactLabel: string;
  domain: string;
}

export type CitationsImpactResponseDto = CitationsImpactDataPointDto[];