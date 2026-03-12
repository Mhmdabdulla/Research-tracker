// src/controllers/analytics.controller.ts

import { Request, Response, NextFunction } from "express";
import { IAnalyticsController } from "./interfaces/IAnalytics.controller.js";
import { IAnalyticsService } from "../services/interfaces/IAnalytics.service.js";
import { ResponseHelper } from "../utils/response.helper.js";
import { UnauthorizedError } from "../utils/errors.js";

export class AnalyticsController implements IAnalyticsController {
  constructor(private readonly analyticsService: IAnalyticsService) {}

  // ── GET /api/analytics/summary ────────────────────────────────────────────

  getSummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = await this.analyticsService.getDashboardSummary(req.user.id);
      ResponseHelper.success(res, data);
    } catch (err) {
      next(err);
    }
  };

  // ── GET /api/analytics/funnel ─────────────────────────────────────────────

  getFunnel = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = await this.analyticsService.getFunnelData(req.user.id);
      ResponseHelper.success(res, data);
    } catch (err) {
      next(err);
    }
  };

  // ── GET /api/analytics/domain-stages ─────────────────────────────────────

  getDomainStages = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = await this.analyticsService.getDomainStages(req.user.id);
      ResponseHelper.success(res, data);
    } catch (err) {
      next(err);
    }
  };

  // ── GET /api/analytics/citations-impact ───────────────────────────────────

  getCitationsImpact = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = await this.analyticsService.getCitationsImpact(req.user.id);
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
      if (!req.user) throw new UnauthorizedError();
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
      const data = await this.analyticsService.getRecentPapers(req.user.id, limit);
      ResponseHelper.success(res, data);
    } catch (err) {
      next(err);
    }
  };
}