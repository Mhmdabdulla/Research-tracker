// src/controllers/auth.controller.ts

import { Request, Response, NextFunction } from "express";
import { IAuthController } from "./interfaces/IAuth.controller.js";
import { IAuthService } from "../services/interfaces/IAuth.service.js";
import { SignupDto, LoginDto, UpdateProfileDto } from "../dtos/auth.dto.js";
import { ResponseHelper } from "../utils/response.helper.js";
import { UnauthorizedError } from "../utils/errors.js";

export class AuthController implements IAuthController {
  constructor(private readonly authService: IAuthService) {}

  // ── POST /api/auth/signup ─────────────────────────────────────────────────

  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: SignupDto = req.body;
      const result = await this.authService.signup(dto);
      ResponseHelper.created(res, result, "Account created successfully");
    } catch (err) {
      next(err);
    }
  };

  // ── POST /api/auth/login ──────────────────────────────────────────────────

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: LoginDto = req.body;
      const result = await this.authService.login(dto);
      ResponseHelper.success(res, result, "Logged in successfully");
    } catch (err) {
      next(err);
    }
  };

  // ── GET /api/auth/me ──────────────────────────────────────────────────────

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const user = await this.authService.getMe(req.user.id);
      ResponseHelper.success(res, user);
    } catch (err) {
      next(err);
    }
  };

  // ── PATCH /api/auth/me ────────────────────────────────────────────────────

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const dto: UpdateProfileDto = req.body;
      const user = await this.authService.updateProfile(req.user.id, dto);
      ResponseHelper.success(res, user, "Profile updated successfully");
    } catch (err) {
      next(err);
    }
  };
}