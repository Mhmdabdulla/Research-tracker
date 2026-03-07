// src/utils/response.helper.ts

import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse, PaginatedResponse } from "../types/api.types.js";

export class ResponseHelper {
  static success<T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode = StatusCodes.OK,
  ): Response {
    const body: ApiResponse<T> = { success: true, data, message };
    return res.status(statusCode).json(body);
  }

  static created<T>(res: Response, data: T, message = "Created"): Response {
    return ResponseHelper.success(res, data, message, StatusCodes.CREATED);
  }

  static noContent(res: Response): Response {
    return res.status(StatusCodes.NO_CONTENT).send();
  }

  static paginated<T>(res: Response, response: PaginatedResponse<T>): Response {
    return res.status(StatusCodes.OK).json(response);
  }
}