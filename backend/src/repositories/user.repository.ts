// src/repositories/user.repository.ts

import { Types } from "mongoose";
import { IUserRepository } from "./interfaces/IUser.repository.js";
import { SignupDto, UpdateProfileDto } from "../dtos/auth.dto.js";
import { IUser } from "../models/interfaces/user.interface.js";
import User from "../models/user.model.js";

export class MongoUserRepository implements IUserRepository {

  // ── findByEmail ────────────────────────────────────────────────────────────
  // Explicitly selects +password so the bcrypt comparison in AuthService works.
  // The User schema has `select: false` on password, so callers that DON'T need
  // the hash (getMe, updateProfile) use findById which omits it by default.

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() })
      .select("+password")
      .lean<IUser>({ virtuals: false });
  }

  // ── findById ───────────────────────────────────────────────────────────────
  // Password NOT selected — safe to attach to req.user or return in responses.

  async findById(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return User.findById(id).lean<IUser>({ virtuals: false });
  }

  // ── create ─────────────────────────────────────────────────────────────────
  // The Mongoose pre-save hook hashes the password before it hits the DB.
  // We call .save() (not .create()) so the hook fires.

  async create(dto: SignupDto): Promise<IUser> {
    const user = new User({
      name: dto.name,
      email: dto.email,   // lowercased by schema
      password: dto.password,
    });
    await user.save();

    // Return without the password hash
    const saved = await User.findById(user._id).lean<IUser>({ virtuals: false });
    return saved!;
  }

  // ── update ─────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateProfileDto): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const $set: Partial<IUser> = {};
    if (dto.name  !== undefined) $set.name  = dto.name;
    if (dto.email !== undefined) $set.email = dto.email.toLowerCase();

    return User.findByIdAndUpdate(
      id,
      { $set },
      { new: true, runValidators: true },
    ).lean<IUser>({ virtuals: false });
  }
}