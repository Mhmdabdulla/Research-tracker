// src/interfaces/paper.repository.interface.ts

import { ResearchPaper } from "../../types/paper.types";
import { CreatePaperDto, ListPapersQueryDto, UpdatePaperDto } from "../../dtos/paper.dto";

export interface IPaperRepository {
  /**
   * Retrieve a paginated, filtered, sorted list of papers.
   */
  findAll(query: ListPapersQueryDto): Promise<{ papers: ResearchPaper[]; total: number }>;

  /**
   * Find a single paper by its unique ID.
   * Returns null if not found.
   */
  findById(id: string): Promise<ResearchPaper | null>;

  /**
   * Persist a new paper and return the created entity.
   */
  create(dto: CreatePaperDto): Promise<ResearchPaper>;

  /**
   * Apply a partial update to an existing paper.
   * Returns null if the paper does not exist.
   */
  update(id: string, dto: UpdatePaperDto): Promise<ResearchPaper | null>;

  /**
   * Remove a paper by ID.
   * Returns true if deleted, false if not found.
   */
  delete(id: string): Promise<boolean>;

  /**
   * Return every paper (used by analytics layer).
   */
  findAllRaw(): Promise<ResearchPaper[]>;
}