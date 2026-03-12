// src/services/auth.service.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IAuthService } from "./interfaces/IAuth.service.js";
import { IUserRepository } from "../repositories/interfaces/IUser.repository.js";
import {
  AuthResponseDto,
  LoginDto,
  SignupDto,
  UpdateProfileDto,
  UserResponseDto,
} from "../dtos/auth.dto.js";
import { IUser } from "../models/interfaces/user.interface.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { Types } from "mongoose";

// ── JWT helper ────────────────────────────────────────────────────────────────

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");

  return jwt.sign(
    { sub: userId },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" },
  );
}

// ── Mapper: IUser document → UserResponseDto (no password) ───────────────────

function toUserDto(user: IUser): UserResponseDto {
  return {
    id: (user._id as Types.ObjectId).toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export class AuthService implements IAuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  // ── signup ─────────────────────────────────────────────────────────────────

  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    // Guard: email must be unique
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const user = await this.userRepository.create(dto);
    const token = signToken((user._id as Types.ObjectId).toString());

    return { user: toUserDto(user), token };
  }

  // ── login ──────────────────────────────────────────────────────────────────
  // Deliberately uses the same error message for wrong email AND wrong password
  // to prevent user enumeration attacks.

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // findByEmail explicitly selects +password (see repository)
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = signToken((user._id as Types.ObjectId).toString());

    return { user: toUserDto(user), token };
  }

  // ── getMe ──────────────────────────────────────────────────────────────────

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User");
    return toUserDto(user);
  }

  // ── updateProfile ──────────────────────────────────────────────────────────

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    // Guard: new email must not collide with another account
    if (dto.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing && (existing._id as Types.ObjectId).toString() !== userId) {
        throw new ConflictError("This email is already in use by another account");
      }
    }

    const updated = await this.userRepository.update(userId, dto);
    if (!updated) throw new NotFoundError("User");

    return toUserDto(updated);
  }
}