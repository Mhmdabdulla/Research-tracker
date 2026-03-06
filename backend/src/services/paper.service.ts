// src/services/paper.service.ts

import { IPaperService } from "./interfaces/IPaper.service";
import { IPaperRepository } from "../repositories/interfaces/IPaper.repository";
import {
  CreatePaperDto,
  ListPapersQueryDto,
  PaperResponseDto,
  UpdatePaperDto,
} from "../dtos/paper.dto";
import { PaginatedResponse } from "../types/api.types";
import { ResearchPaper } from "../types/paper.types";
import { NotFoundError } from "../utils/errors";

export class PaperService implements IPaperService {
  constructor(private readonly paperRepository: IPaperRepository) {}

  // ── Mapper ────────────────────────────────────────────────────────────────

  private toResponseDto(paper: ResearchPaper): PaperResponseDto {
    return {
      id: paper.id,
      title: paper.title,
      authors: paper.authors,
      domain: paper.domain,
      stage: paper.stage,
      citations: paper.citations,
      impactScore: paper.impactScore,
      dateAdded: paper.dateAdded,
      updatedAt: paper.updatedAt,
    };
  }

  // ── Public methods ────────────────────────────────────────────────────────

  async listPapers(
    query: ListPapersQueryDto,
  ): Promise<PaginatedResponse<PaperResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const { papers, total } = await this.paperRepository.findAll(query);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      success: true,
      data: papers.map(this.toResponseDto),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getPaperById(id: string): Promise<PaperResponseDto> {
    const paper = await this.paperRepository.findById(id);
    if (!paper) throw new NotFoundError("Paper");
    return this.toResponseDto(paper);
  }

  async createPaper(dto: CreatePaperDto): Promise<PaperResponseDto> {
    const paper = await this.paperRepository.create(dto);
    return this.toResponseDto(paper);
  }

  async updatePaper(id: string, dto: UpdatePaperDto): Promise<PaperResponseDto> {
    const paper = await this.paperRepository.update(id, dto);
    if (!paper) throw new NotFoundError("Paper");
    return this.toResponseDto(paper);
  }

  async deletePaper(id: string): Promise<void> {
    const deleted = await this.paperRepository.delete(id);
    if (!deleted) throw new NotFoundError("Paper");
  }
}