// src/interfaces/analytics.service.interface.ts

import {
  CitationsImpactResponseDto,
  DashboardSummaryDto,
  DomainStagesResponseDto,
  FunnelResponseDto,
  RecentPapersResponseDto,
} from "../../dtos/analytics.dto";

export interface IAnalyticsService {
  getDashboardSummary(): Promise<DashboardSummaryDto>;
  getFunnelData(): Promise<FunnelResponseDto>;
  getDomainStages(): Promise<DomainStagesResponseDto>;
  getCitationsImpact(): Promise<CitationsImpactResponseDto>;
  /** Returns the N most recently added papers (default N = 5). */
  getRecentPapers(limit?: number): Promise<RecentPapersResponseDto>;
}

// src/interfaces/analytics.controller.interface.ts

import { Request, Response, NextFunction } from "express";

export interface IAnalyticsController {
  /**
   * GET /api/analytics/summary
   */
  getSummary(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * GET /api/analytics/funnel
   */
  getFunnel(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * GET /api/analytics/domain-stages
   */
  getDomainStages(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * GET /api/analytics/citations-impact
   */
  getCitationsImpact(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * GET /api/analytics/recent-papers?limit=5
   */
  getRecentPapers(req: Request, res: Response, next: NextFunction): Promise<void>;
}