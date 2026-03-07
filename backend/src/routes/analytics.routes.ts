// src/routes/analytics.routes.ts

import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { AnalyticsService } from "../services/analytics.service.js";
import { paperRepository } from "./paper.routes.js";

const router = Router();

// ── Reuse the same repository instance so analytics reflect live paper state ──
const analyticsService = new AnalyticsService(paperRepository);
const analyticsController = new AnalyticsController(analyticsService);

/**
 * GET /api/analytics/summary          - Dashboard totals, completion rate & stage breakdown
 * GET /api/analytics/funnel           - Reading progression funnel
 * GET /api/analytics/domain-stages    - Stage breakdown per research domain
 * GET /api/analytics/citations-impact - Scatter plot data: citations vs impact
 * GET /api/analytics/recent-papers    - 5 most recently added papers (configurable via ?limit=N)
 */

router.get("/summary", analyticsController.getSummary);
router.get("/funnel", analyticsController.getFunnel);
router.get("/domain-stages", analyticsController.getDomainStages);
router.get("/citations-impact", analyticsController.getCitationsImpact);
router.get("/recent-papers", analyticsController.getRecentPapers);

export { router as analyticsRouter };