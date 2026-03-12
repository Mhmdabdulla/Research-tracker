// src/routes/auth.routes.ts

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { AuthService } from "../services/auth.service.js";
import { MongoUserRepository } from "../repositories/user.repository.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  signupValidation,
  loginValidation,
  updateProfileValidation,
} from "../middlewares/auth.validate.js";

const router = Router();

// ── Dependency wiring ─────────────────────────────────────────────────────────
const userRepository = new MongoUserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

/**
 * POST  /api/auth/signup  — register a new user
 * POST  /api/auth/login   — authenticate and receive JWT
 * GET   /api/auth/me      — get current user profile  [protected]
 * PATCH /api/auth/me      — update name / email        [protected]
 */

router.post("/signup", signupValidation, authController.signup);
router.post("/login",  loginValidation,  authController.login);
router.get( "/me",     protect,          authController.getMe);
router.patch("/me",    protect, updateProfileValidation, authController.updateProfile);

export { router as authRouter };