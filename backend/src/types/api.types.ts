// src/types/api.types.ts

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: ValidationError[];
  statusCode: number;
}

export interface ValidationError {
  field: string;
  message: string;
}