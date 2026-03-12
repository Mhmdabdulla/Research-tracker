// src/routes/paper.routes.ts

import { Router } from "express";
import { PaperController } from "../controllers/paper.controller.js";
import { PaperService } from "../services/paper.service.js";
import {  MongoPaperRepository } from "../repositories/paper.repository.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createPaperValidation,
  updatePaperValidation,
  listPapersValidation,
  paperIdValidation,
} from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

// ── Dependency wiring  ────────────
const paperRepository = new MongoPaperRepository();
const paperService = new PaperService(paperRepository);
const paperController = new PaperController(paperService);

/**
 * GET    /api/papers         - List papers with filters, sort, pagination
 * POST   /api/papers         - Create a new paper
 * GET    /api/papers/:id     - Get a single paper
 * PATCH  /api/papers/:id     - Partially update a paper
 * DELETE /api/papers/:id     - Delete a paper
 */

router.use(protect); // applies to every route below
  
router.get(
  "/",
  validate(listPapersValidation),
  paperController.listPapers,
);

router.post(
  "/",
  validate(createPaperValidation),
  paperController.createPaper,
);

router.get(
  "/:id",
  validate(paperIdValidation),
  paperController.getPaperById,
);

router.patch(
  "/:id",
  validate(updatePaperValidation),
  paperController.updatePaper,
);

router.delete(
  "/:id",
  validate(paperIdValidation),
  paperController.deletePaper,
);

export { router as paperRouter, paperRepository };