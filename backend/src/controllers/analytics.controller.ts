// src/controllers/analytics.controller.ts

import { Request, Response, NextFunction } from "express";
import { IAnalyticsController } from "./interfaces/IAnalytics.controller.js";
import { IAnalyticsService } from "../services/interfaces/IAnalytics.service.js";
import { ResponseHelper } from "../utils/response.helper.js";

export class AnalyticsController implements IAnalyticsController {
  constructor(private readonly analyticsService: IAnalyticsService) {}

  // ── GET /api/analytics/summary ────────────────────────────────────────────

  getSummary = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.analyticsService.getDashboardSummary();
      ResponseHelper.success(res, data);
    } catch (err) {
      next(err);
    }
  };

  // ── GET /api/analytics/funnel ─────────────────────────────────────────────

  getFunnel = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.analyticsService.getFunnelData();
      ResponseHelper.success(res, data);
    } catch (err) {
      next(err);
    }
  };

  // ── GET /api/analytics/domain-stages ─────────────────────────────────────

  getDomainStages = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.analyticsService.getDomainStages();
      ResponseHelper.success(res, data);
    } catch (err) {
      next(err);
    }
  };

  // ── GET /api/analytics/citations-impact ───────────────────────────────────

  getCitationsImpact = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.analyticsService.getCitationsImpact();
      ResponseHelper.success(res, data);
    } catch (err) {
      next(err);
    }
  };

  // ── GET /api/analytics/recent-papers?limit=5 ──────────────────────────────

  getRecentPapers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
      const data = await this.analyticsService.getRecentPapers(limit);
      ResponseHelper.success(res, data);
    } catch (err) {
      next(err);
    }
  };
}