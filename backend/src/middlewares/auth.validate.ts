// src/middlewares/auth.validate.ts
// Kept separate from validate.middleware.ts to avoid growing that file further.
// Uses the same validate() runner from validate.middleware.ts.

import { body } from "express-validator";
import { validate } from "./validate.middleware.js";

export const signupValidation = validate([
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ max: 100 }).withMessage("Name must be at most 100 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
]);

export const loginValidation = validate([
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
]);

export const updateProfileValidation = validate([
  body("name")
    .optional()
    .trim()
    .notEmpty().withMessage("Name cannot be empty")
    .isLength({ max: 100 }).withMessage("Name must be at most 100 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),
]);