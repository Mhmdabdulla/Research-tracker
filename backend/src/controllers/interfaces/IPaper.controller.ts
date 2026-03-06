// src/interfaces/paper.controller.interface.ts

import { Request, Response, NextFunction } from "express";

export interface IPaperController {
  /**
   * GET /api/papers
   * Query: page, limit, q, domain[], stage[], impactScore[], timePeriod, sortBy, sortDir
   */
  listPapers(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * GET /api/papers/:id
   */
  getPaperById(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * POST /api/papers
   * Body: CreatePaperDto
   */
  createPaper(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * PATCH /api/papers/:id
   * Body: UpdatePaperDto
   */
  updatePaper(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * DELETE /api/papers/:id
   */
  deletePaper(req: Request, res: Response, next: NextFunction): Promise<void>;
}