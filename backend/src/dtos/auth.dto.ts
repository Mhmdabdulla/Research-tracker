// src/dtos/auth.dto.ts

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface SignupDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────
// Password is NEVER included — these are the only shapes that leave the server.

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  token: string;
}