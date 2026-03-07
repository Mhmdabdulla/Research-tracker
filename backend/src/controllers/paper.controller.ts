// src/controllers/paper.controller.ts

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { IPaperController } from "./interfaces/IPaper.controller";
import { IPaperService } from "../services/interfaces/IPaper.service";
import {
  CreatePaperDto,
  ListPapersQueryDto,
  UpdatePaperDto,
} from "../dtos/paper.dto";
import { ResponseHelper } from "../utils/response.helper";
import {
  ImpactScore,
  PaperStage,
  ResearchDomain,
  SortDirection,
} from "../types/paper.types";

export class PaperController implements IPaperController {
  constructor(private readonly paperService: IPaperService) {}

  // ── GET /api/papers ───────────────────────────────────────────────────────

  listPapers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const {
        page,
        limit,
        q,
        timePeriod,
        sortBy,
        sortDir,
        domain,
        stage,
        impactScore,
      } = req.query as Record<string, string | string[]>;

      // Coerce array-like query params: domain=CS&domain=Bio → ["CS","Bio"]
      const toArray = (val: string | string[] | undefined): string[] | undefined =>
        val === undefined ? undefined : Array.isArray(val) ? val : [val];

      const query: ListPapersQueryDto = {
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        q: q as string | undefined,
        timePeriod: timePeriod as ListPapersQueryDto["timePeriod"],
        sortBy: sortBy as ListPapersQueryDto["sortBy"],
        sortDir: sortDir as SortDirection | undefined,
        domain: toArray(domain) as ResearchDomain[] | undefined,
        stage: toArray(stage) as PaperStage[] | undefined,
        impactScore: toArray(impactScore) as ImpactScore[] | undefined,
      };

      const result = await this.paperService.listPapers(query);
      ResponseHelper.paginated(res, result);
    } catch (err) {
      next(err);
    }
  };

  // ── GET /api/papers/:id ───────────────────────────────────────────────────

  getPaperById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const paper = await this.paperService.getPaperById(req.params.id as string);
      ResponseHelper.success(res, paper);
    } catch (err) {
      next(err);
    }
  };

  // ── POST /api/papers ──────────────────────────────────────────────────────

  createPaper = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto: CreatePaperDto = req.body;
      const paper = await this.paperService.createPaper(dto);
      ResponseHelper.created(res, paper, "Paper created successfully");
    } catch (err) {
      next(err);
    }
  };

  // ── PATCH /api/papers/:id ─────────────────────────────────────────────────

  updatePaper = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto: UpdatePaperDto = req.body;
      const paper = await this.paperService.updatePaper(req.params.id as string, dto);
      ResponseHelper.success(res, paper, "Paper updated successfully");
    } catch (err) {
      next(err);
    }
  };

  // ── DELETE /api/papers/:id ────────────────────────────────────────────────

  deletePaper = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.paperService.deletePaper(req.params.id as string);
      ResponseHelper.noContent(res);
    } catch (err) {
      next(err);
    }
  };
}