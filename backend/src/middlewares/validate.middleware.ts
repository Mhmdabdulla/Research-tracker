// src/middlewares/validate.middleware.ts

import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult, ValidationChain } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { ImpactScore, PaperStage, ResearchDomain } from "../types/paper.types.js";

// ─── Runner ───────────────────────────────────────────────────────────────────

export const validate = (chains: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(chains.map((c) => c.run(req)));
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: "Validation failed",
      errors: result.array().map((e) => ({
        field: e.type === "field" ? e.path : e.type,
        message: e.msg,
      })),
    });
  };
};

// ─── Shared enum values ───────────────────────────────────────────────────────

const DOMAINS = Object.values(ResearchDomain);
const STAGES = Object.values(PaperStage);
const IMPACTS = Object.values(ImpactScore);

// ─── Paper validators ─────────────────────────────────────────────────────────

export const createPaperValidation: ValidationChain[] = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 500 }).withMessage("Title must be at most 500 characters"),

  body("authors")
    .isArray({ min: 1 }).withMessage("At least one author is required"),
  body("authors.*")
    .trim()
    .notEmpty().withMessage("Author names cannot be empty")
    .isLength({ max: 200 }).withMessage("Author name too long"),

  body("domain")
    .notEmpty().withMessage("Domain is required")
    .isIn(DOMAINS).withMessage(`Domain must be one of: ${DOMAINS.join(", ")}`),

  body("stage")
    .notEmpty().withMessage("Stage is required")
    .isIn(STAGES).withMessage(`Stage must be one of: ${STAGES.join(", ")}`),

  body("citations")
    .optional()
    .isInt({ min: 0 }).withMessage("Citations must be a non-negative integer"),

  body("impactScore")
    .notEmpty().withMessage("Impact score is required")
    .isIn(IMPACTS).withMessage(`Impact score must be one of: ${IMPACTS.join(", ")}`),
];

export const updatePaperValidation: ValidationChain[] = [
  param("id").notEmpty().withMessage("Paper ID is required"),

  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("Title cannot be empty")
    .isLength({ max: 500 }).withMessage("Title must be at most 500 characters"),

  body("authors")
    .optional()
    .isArray({ min: 1 }).withMessage("Authors must be a non-empty array"),
  body("authors.*")
    .optional()
    .trim()
    .notEmpty().withMessage("Author names cannot be empty"),

  body("domain")
    .optional()
    .isIn(DOMAINS).withMessage(`Domain must be one of: ${DOMAINS.join(", ")}`),

  body("stage")
    .optional()
    .isIn(STAGES).withMessage(`Stage must be one of: ${STAGES.join(", ")}`),

  body("citations")
    .optional()
    .isInt({ min: 0 }).withMessage("Citations must be a non-negative integer"),

  body("impactScore")
    .optional()
    .isIn(IMPACTS).withMessage(`Impact score must be one of: ${IMPACTS.join(", ")}`),
];

export const listPapersValidation: ValidationChain[] = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
  query("q")
    .optional()
    .isString().trim(),
  query("domain")
    .optional()
    .custom((val) => {
      const arr = Array.isArray(val) ? val : [val];
      return arr.every((v: string) => DOMAINS.includes(v as ResearchDomain));
    }).withMessage(`domain filter values must be valid domains`),
  query("stage")
    .optional()
    .custom((val) => {
      const arr = Array.isArray(val) ? val : [val];
      return arr.every((v: string) => STAGES.includes(v as PaperStage));
    }).withMessage(`stage filter values must be valid stages`),
  query("impactScore")
    .optional()
    .custom((val) => {
      const arr = Array.isArray(val) ? val : [val];
      return arr.every((v: string) => IMPACTS.includes(v as ImpactScore));
    }).withMessage(`impactScore filter values must be valid impact scores`),
  query("timePeriod")
    .optional()
    .isIn(["all", "week", "month", "3months"]).withMessage("timePeriod must be one of: all, week, month, 3months"),
  query("sortBy")
    .optional()
    .isIn(["title", "citations", "dateAdded"]).withMessage("sortBy must be one of: title, citations, dateAdded"),
  query("sortDir")
    .optional()
    .isIn(["asc", "desc"]).withMessage("sortDir must be asc or desc"),
];

export const paperIdValidation: ValidationChain[] = [
  param("id").notEmpty().withMessage("Paper ID is required"),
];