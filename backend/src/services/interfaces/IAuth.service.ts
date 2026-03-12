// src/interfaces/auth.service.interface.ts

import {
  AuthResponseDto,
  LoginDto,
  SignupDto,
  UpdateProfileDto,
  UserResponseDto,
} from "../../dtos/auth.dto.js";

export interface IAuthService {
  /**
   * Register a new user. Throws ConflictError if email already taken.
   * Returns user data (no password) + signed JWT.
   */
  signup(dto: SignupDto): Promise<AuthResponseDto>;

  /**
   * Validate credentials. Throws UnauthorizedError on bad email/password.
   * Returns user data (no password) + signed JWT.
   */
  login(dto: LoginDto): Promise<AuthResponseDto>;

  /**
   * Return the profile of the currently authenticated user.
   * Throws NotFoundError if user has been deleted since token was issued.
   */
  getMe(userId: string): Promise<UserResponseDto>;

  /**
   * Update name and/or email. Throws ConflictError if new email is taken.
   * Returns the updated profile (no password).
   */
  updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto>;
}