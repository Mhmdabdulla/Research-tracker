// src/repositories/paper.repository.ts

import { FilterQuery, SortOrder, Types } from "mongoose";
import { IPaperRepository } from "./interfaces/IPaper.repository.js";
import { CreatePaperDto, ListPapersQueryDto, UpdatePaperDto } from "../dtos/paper.dto.js";
import { ResearchPaper } from "../types/paper.types.js";
import { IPaper } from "../models/interfaces/paper.interface.js";
import Paper from "../models/paper.model.js";

// ─── Mapper: Mongoose document → domain type ─────────────────────────────────

function toResearchPaper(doc: IPaper): ResearchPaper {
  return {
    id: (doc._id as Types.ObjectId).toString(),
    title: doc.title,
    authors: doc.authors,
    domain: doc.domain as ResearchPaper["domain"],
    stage: doc.stage as ResearchPaper["stage"],
    citations: doc.citations,
    impactScore: doc.impactScore as ResearchPaper["impactScore"],
    dateAdded: doc.dateAdded.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// ─── Time period helper ───────────────────────────────────────────────────────

function getCutoffDate(timePeriod: string): Date | null {
  const now = new Date();
  switch (timePeriod) {
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "3months":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    default:
      return null;
  }
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class MongoPaperRepository implements IPaperRepository {

  // ── findAll ────────────────────────────────────────────────────────────────

  async findAll(
    query: ListPapersQueryDto,
  ): Promise<{ papers: ResearchPaper[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      q,
      domain,
      stage,
      impactScore,
      timePeriod = "all",
      sortBy,
      sortDir = "asc",
    } = query;

    // ── Build filter ──────────────────────────────────────────────────────────
    const filter: FilterQuery<IPaper> = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { authors: { $regex: q, $options: "i" } },
        { domain: { $regex: q, $options: "i" } },
      ];
    }

    if (domain && domain.length > 0) filter.domain = { $in: domain };
    if (stage && stage.length > 0) filter.stage = { $in: stage };
    if (impactScore && impactScore.length > 0) filter.impactScore = { $in: impactScore };

    const cutoff = getCutoffDate(timePeriod);
    if (cutoff) filter.dateAdded = { $gte: cutoff };

    // ── Build sort ────────────────────────────────────────────────────────────
    const sortOrder: SortOrder = sortDir === "desc" ? -1 : 1;
    const sortMap: Record<string, string> = {
      title: "title",
      citations: "citations",
      dateAdded: "dateAdded",
    };
    const sortField = sortBy ? (sortMap[sortBy] ?? "dateAdded") : "dateAdded";
    const sort: Record<string, SortOrder> = { [sortField]: sortOrder };

    // ── Execute ───────────────────────────────────────────────────────────────
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      Paper.find(filter).sort(sort).skip(skip).limit(limit).lean<IPaper[]>(),
      Paper.countDocuments(filter),
    ]);

    return { papers: docs.map(toResearchPaper), total };
  }

  // ── findById ───────────────────────────────────────────────────────────────

  async findById(id: string): Promise<ResearchPaper | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await Paper.findById(id).lean<IPaper>();
    return doc ? toResearchPaper(doc) : null;
  }

  // ── create ─────────────────────────────────────────────────────────────────

  async create(dto: CreatePaperDto): Promise<ResearchPaper> {
    const doc = await Paper.create({
      title: dto.title,
      authors: dto.authors,
      domain: dto.domain,
      stage: dto.stage,
      citations: dto.citations ?? 0,
      impactScore: dto.impactScore,
      dateAdded: new Date(),
    });
    return toResearchPaper(doc);
  }

  // ── update ─────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdatePaperDto): Promise<ResearchPaper | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const $set: Partial<IPaper> = {};
    if (dto.title !== undefined)       $set.title       = dto.title;
    if (dto.authors !== undefined)     $set.authors     = dto.authors;
    if (dto.domain !== undefined)      $set.domain      = dto.domain      as IPaper["domain"];
    if (dto.stage !== undefined)       $set.stage       = dto.stage       as IPaper["stage"];
    if (dto.citations !== undefined)   $set.citations   = dto.citations;
    if (dto.impactScore !== undefined) $set.impactScore = dto.impactScore as IPaper["impactScore"];

    const doc = await Paper.findByIdAndUpdate(
      id,
      { $set },
      { new: true, runValidators: true },
    ).lean<IPaper>();

    return doc ? toResearchPaper(doc) : null;
  }

  // ── delete ─────────────────────────────────────────────────────────────────

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const result = await Paper.findByIdAndDelete(id);
    return result !== null;
  }

  // ── findAllRaw (used by analytics layer) ──────────────────────────────────

  async findAllRaw(): Promise<ResearchPaper[]> {
    const docs = await Paper.find().lean<IPaper[]>();
    return docs.map(toResearchPaper);
  }
}