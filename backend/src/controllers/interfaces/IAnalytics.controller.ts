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