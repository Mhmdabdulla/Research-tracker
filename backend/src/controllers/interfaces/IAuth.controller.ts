// src/interfaces/auth.controller.interface.ts

import { Request, Response, NextFunction } from "express";

export interface IAuthController {
  /** POST /api/auth/signup */
  signup(req: Request, res: Response, next: NextFunction): Promise<void>;

  /** POST /api/auth/login */
  login(req: Request, res: Response, next: NextFunction): Promise<void>;

  /** GET  /api/auth/me  — requires protect middleware */
  getMe(req: Request, res: Response, next: NextFunction): Promise<void>;

  /** PATCH /api/auth/me — requires protect middleware */
  updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
}