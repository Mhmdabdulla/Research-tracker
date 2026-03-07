// src/services/interfaces/IPaper.service.ts

import { CreatePaperDto, ListPapersQueryDto, PaperResponseDto, UpdatePaperDto } from "../../dtos/paper.dto.js";
import { PaginatedResponse } from "../../types/api.types.js";

export interface IPaperService {
  /**
   * Return paginated, filtered list of papers.
   */
  listPapers(query: ListPapersQueryDto): Promise<PaginatedResponse<PaperResponseDto>>;

  /**
   * Return a single paper by ID. Throws NotFoundError if absent.
   */
  getPaperById(id: string): Promise<PaperResponseDto>;

  /**
   * Create and return a new paper.
   */
  createPaper(dto: CreatePaperDto): Promise<PaperResponseDto>;

  /**
   * Partially update a paper. Throws NotFoundError if absent.
   */
  updatePaper(id: string, dto: UpdatePaperDto): Promise<PaperResponseDto>;

  /**
   * Delete a paper. Throws NotFoundError if absent.
   */
  deletePaper(id: string): Promise<void>;
}