// src/dtos/paper.dto.ts

import {
  PaperStage,
  ImpactScore,
  ResearchDomain,
  SortableField,
  SortDirection,
  TimePeriod,
} from "../types/paper.types.js";

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreatePaperDto {
  title: string;
  authors: string[];
  domain: ResearchDomain;
  stage: PaperStage;
  citations: number;
  impactScore: ImpactScore;
}

export interface UpdatePaperDto {
  title?: string;
  authors?: string[];
  domain?: ResearchDomain;
  stage?: PaperStage;
  citations?: number;
  impactScore?: ImpactScore;
}

export interface ListPapersQueryDto {
  // Pagination
  page?: number;
  limit?: number;

  // Search
  q?: string;

  // Filters
  domain?: ResearchDomain[];
  stage?: PaperStage[];
  impactScore?: ImpactScore[];
  timePeriod?: TimePeriod;

  // Sort
  sortBy?: SortableField;
  sortDir?: SortDirection;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface PaperResponseDto {
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