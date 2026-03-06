// src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/errors";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Operational errors (our custom AppError subclasses)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  // Unexpected/programming errors — don't leak internals in production
  console.error("[UnhandledError]", err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "Route not found",
    statusCode: StatusCodes.NOT_FOUND,
  });
}