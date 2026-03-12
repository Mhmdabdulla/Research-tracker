// src/interfaces/analytics.service.interface.ts

import {
  CitationsImpactResponseDto,
  DashboardSummaryDto,
  DomainStagesResponseDto,
  FunnelResponseDto,
  RecentPapersResponseDto,
} from "../../dtos/analytics.dto.js";

export interface IAnalyticsService {
  getDashboardSummary(userId: string): Promise<DashboardSummaryDto>;
  getFunnelData(userId: string): Promise<FunnelResponseDto>;
  getDomainStages(userId: string): Promise<DomainStagesResponseDto>;
  getCitationsImpact(userId: string): Promise<CitationsImpactResponseDto>;
  /** Returns the N most recently added papers (default N = 5). */
  getRecentPapers(userId: string, limit?: number): Promise<RecentPapersResponseDto>;
}

