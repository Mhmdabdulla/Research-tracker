// src/interfaces/analytics.service.interface.ts

import {
  CitationsImpactResponseDto,
  DashboardSummaryDto,
  DomainStagesResponseDto,
  FunnelResponseDto,
  RecentPapersResponseDto,
} from "../../dtos/analytics.dto.js";

export interface IAnalyticsService {
  getDashboardSummary(): Promise<DashboardSummaryDto>;
  getFunnelData(): Promise<FunnelResponseDto>;
  getDomainStages(): Promise<DomainStagesResponseDto>;
  getCitationsImpact(): Promise<CitationsImpactResponseDto>;
  /** Returns the N most recently added papers (default N = 5). */
  getRecentPapers(limit?: number): Promise<RecentPapersResponseDto>;
}

