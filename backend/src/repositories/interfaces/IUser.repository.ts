// src/interfaces/user.repository.interface.ts

import { SignupDto, UpdateProfileDto } from "../../dtos/auth.dto.js";
import { IUser } from "../../models/interfaces/user.interface.js";

export interface IUserRepository {
  /**
   * Find user by email. Returns null when not found.
   * Password field IS selected — needed for login comparison.
   */
  findByEmail(email: string): Promise<IUser | null>;

  /**
   * Find user by id. Password NOT selected.
   * Returns null when not found.
   */
  findById(id: string): Promise<IUser | null>;

  /**
   * Persist a new user and return the saved document.
   * Password hashing happens in the Mongoose pre-save hook.
   */
  create(dto: SignupDto): Promise<IUser>;

  /**
   * Partially update a user's profile fields.
   * Returns the updated document or null when not found.
   */
  update(id: string, dto: UpdateProfileDto): Promise<IUser | null>;
}