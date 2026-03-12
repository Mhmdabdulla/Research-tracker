// src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors.js";
import { RequestUser } from "../types/user.types.js";
import { MongoUserRepository } from "../repositories/user.repository.js";

// Extend Express Request so downstream handlers get full type safety on req.user
declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

const userRepository = new MongoUserRepository();

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

export async function protect(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // ── 1. Extract token ────────────────────────────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided. Please log in.");
    }
    const token = authHeader.split(" ")[1];

    // ── 2. Verify signature & expiry ────────────────────────────────────────
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET environment variable is not set");

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, secret) as JwtPayload;
    } catch {
      throw new UnauthorizedError("Token is invalid or has expired. Please log in again.");
    }

    // ── 3. Confirm user still exists ────────────────────────────────────────
    // Protects against using a valid token after the account has been deleted.
    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError("The account belonging to this token no longer exists.");
    }

    // ── 4. Attach to request ────────────────────────────────────────────────
    req.user = { id: payload.sub, email: user.email };

    next();
  } catch (err) {
    next(err);
  }
}