// src/types/user.types.ts

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

// Shape attached to req.user by the protect middleware
export interface RequestUser {
  id: string;
  email: string;
}