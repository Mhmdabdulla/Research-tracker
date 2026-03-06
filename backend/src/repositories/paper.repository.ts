// src/repositories/paper.repository.ts

import { v4 as uuidv4 } from "uuid";
import { IPaperRepository } from "./interfaces/IPaper.repository";
import { CreatePaperDto, ListPapersQueryDto, UpdatePaperDto } from "../dtos/paper.dto";
import { ResearchPaper, PaperStage, ImpactScore, ResearchDomain } from "../types/paper.types";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedPapers: ResearchPaper[] = [
  {
    id: "p1",
    title: "Attention Is All You Need",
    authors: ["Vaswani, A.", "Shazeer, N.", "Parmar, N."],
    domain: ResearchDomain.COMPUTER_SCIENCE,
    stage: PaperStage.NOTES_COMPLETED,
    citations: 92400,
    impactScore: ImpactScore.HIGH,
    dateAdded: "2023-11-10T08:00:00Z",
    updatedAt: "2023-11-10T08:00:00Z",
  },
  {
    id: "p2",
    title: "Deep Residual Learning for Image Recognition",
    authors: ["He, K.", "Zhang, X.", "Ren, S."],
    domain: ResearchDomain.COMPUTER_SCIENCE,
    stage: PaperStage.FULLY_READ,
    citations: 154000,
    impactScore: ImpactScore.HIGH,
    dateAdded: "2023-12-05T09:30:00Z",
    updatedAt: "2023-12-05T09:30:00Z",
  },
  {
    id: "p3",
    title: "CRISPR/Cas9 for genome editing",
    authors: ["Doudna, J.", "Charpentier, E."],
    domain: ResearchDomain.BIOLOGY,
    stage: PaperStage.INTRODUCTION_DONE,
    citations: 28000,
    impactScore: ImpactScore.HIGH,
    dateAdded: "2024-01-15T10:15:00Z",
    updatedAt: "2024-01-15T10:15:00Z",
  },
  {
    id: "p4",
    title: "Quantum Supremacy Using a Programmable Superconducting Processor",
    authors: ["Arute, F.", "Arya, K."],
    domain: ResearchDomain.PHYSICS,
    stage: PaperStage.TO_READ,
    citations: 5600,
    impactScore: ImpactScore.HIGH,
    dateAdded: "2024-02-20T14:45:00Z",
    updatedAt: "2024-02-20T14:45:00Z",
  },
  {
    id: "p5",
    title: "AlphaFold: a solution to a 50-year-old grand challenge in biology",
    authors: ["Jumper, J.", "Evans, R."],
    domain: ResearchDomain.BIOLOGY,
    stage: PaperStage.ABSTRACT_READ,
    citations: 12500,
    impactScore: ImpactScore.HIGH,
    dateAdded: "2024-03-01T11:20:00Z",
    updatedAt: "2024-03-01T11:20:00Z",
  },
  {
    id: "p6",
    title: "Generative Adversarial Nets",
    authors: ["Goodfellow, I.", "Pouget-Abadie, J."],
    domain: ResearchDomain.COMPUTER_SCIENCE,
    stage: PaperStage.NOTES_COMPLETED,
    citations: 46000,
    impactScore: ImpactScore.MEDIUM,
    dateAdded: "2024-03-10T16:00:00Z",
    updatedAt: "2024-03-10T16:00:00Z",
  },
  {
    id: "p7",
    title: "The impact of COVID-19 on global health",
    authors: ["Smith, J.", "Doe, J."],
    domain: ResearchDomain.MEDICINE,
    stage: PaperStage.FULLY_READ,
    citations: 3200,
    impactScore: ImpactScore.HIGH,
    dateAdded: "2024-03-12T08:30:00Z",
    updatedAt: "2024-03-12T08:30:00Z",
  },
  {
    id: "p8",
    title: "Blockchain technology: A comprehensive review",
    authors: ["Wang, H.", "Zheng, Z."],
    domain: ResearchDomain.COMPUTER_SCIENCE,
    stage: PaperStage.INTRODUCTION_DONE,
    citations: 1500,
    impactScore: ImpactScore.MEDIUM,
    dateAdded: "2024-03-18T13:45:00Z",
    updatedAt: "2024-03-18T13:45:00Z",
  },
  {
    id: "p9",
    title: "Graphene: Status and Prospects",
    authors: ["Geim, A. K."],
    domain: ResearchDomain.PHYSICS,
    stage: PaperStage.ABSTRACT_READ,
    citations: 38000,
    impactScore: ImpactScore.HIGH,
    dateAdded: "2024-03-25T09:10:00Z",
    updatedAt: "2024-03-25T09:10:00Z",
  },
  {
    id: "p10",
    title: "A survey on Internet of Things architectures",
    authors: ["Al-Fuqaha, A."],
    domain: ResearchDomain.ENGINEERING,
    stage: PaperStage.TO_READ,
    citations: 8200,
    impactScore: ImpactScore.MEDIUM,
    dateAdded: "2024-03-28T15:20:00Z",
    updatedAt: "2024-03-28T15:20:00Z",
  },
  {
    id: "p11",
    title: "Advances in Neural Information Processing Systems",
    authors: ["Bengio, Y.", "LeCun, Y."],
    domain: ResearchDomain.COMPUTER_SCIENCE,
    stage: PaperStage.FULLY_READ,
    citations: 12000,
    impactScore: ImpactScore.LOW,
    dateAdded: "2025-01-10T11:00:00Z",
    updatedAt: "2025-01-10T11:00:00Z",
  },
  {
    id: "p12",
    title: "On the Origin of Species by Means of Natural Selection",
    authors: ["Darwin, C."],
    domain: ResearchDomain.BIOLOGY,
    stage: PaperStage.NOTES_COMPLETED,
    citations: 80000,
    impactScore: ImpactScore.HIGH,
    dateAdded: "2025-02-05T14:30:00Z",
    updatedAt: "2025-02-05T14:30:00Z",
  },
  {
    id: "p13",
    title: "Cognitive Behavioral Therapy: A Meta-Analysis",
    authors: ["Hofmann, S.", "Smits, J."],
    domain: ResearchDomain.PSYCHOLOGY,
    stage: PaperStage.METHODS_REVIEWED,
    citations: 4560,
    impactScore: ImpactScore.MEDIUM,
    dateAdded: "2024-04-15T10:00:00Z",
    updatedAt: "2024-04-15T10:00:00Z",
  },
  {
    id: "p14",
    title: "Economic Growth in the Age of AI",
    authors: ["Aghion, P.", "Jones, B."],
    domain: ResearchDomain.ECONOMICS,
    stage: PaperStage.RESULTS_ANALYZED,
    citations: 890,
    impactScore: ImpactScore.LOW,
    dateAdded: "2024-03-25T09:00:00Z",
    updatedAt: "2024-03-25T09:00:00Z",
  },
  {
    id: "p15",
    title: "Sustainable Engineering Practices for Climate Mitigation",
    authors: ["Smith, R.", "Patel, K."],
    domain: ResearchDomain.ENGINEERING,
    stage: PaperStage.ABSTRACT_READ,
    citations: 560,
    impactScore: ImpactScore.LOW,
    dateAdded: "2024-04-05T11:30:00Z",
    updatedAt: "2024-04-05T11:30:00Z",
  },
];

// ─── Stage ordering for time-period cutoff calculations ───────────────────────

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

// ─── Repository Implementation ────────────────────────────────────────────────

export class InMemoryPaperRepository implements IPaperRepository {
  // Simulate a database store
  private store: Map<string, ResearchPaper>;

  constructor() {
    this.store = new Map(seedPapers.map((p) => [p.id, { ...p }]));
  }

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

    let results = Array.from(this.store.values());

    // ── Filter: full-text search ──────────────────────────────────────────────
    if (q) {
      const lower = q.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.authors.some((a) => a.toLowerCase().includes(lower)) ||
          p.domain.toLowerCase().includes(lower),
      );
    }

    // ── Filter: domain ────────────────────────────────────────────────────────
    if (domain && domain.length > 0) {
      results = results.filter((p) => domain.includes(p.domain));
    }

    // ── Filter: stage ─────────────────────────────────────────────────────────
    if (stage && stage.length > 0) {
      results = results.filter((p) => stage.includes(p.stage));
    }

    // ── Filter: impact score ──────────────────────────────────────────────────
    if (impactScore && impactScore.length > 0) {
      results = results.filter((p) => impactScore.includes(p.impactScore));
    }

    // ── Filter: time period ───────────────────────────────────────────────────
    const cutoff = getCutoffDate(timePeriod);
    if (cutoff) {
      results = results.filter((p) => new Date(p.dateAdded) >= cutoff);
    }

    // ── Sort ──────────────────────────────────────────────────────────────────
    if (sortBy) {
      results.sort((a, b) => {
        let cmp = 0;
        if (sortBy === "title") cmp = a.title.localeCompare(b.title);
        else if (sortBy === "citations") cmp = a.citations - b.citations;
        else if (sortBy === "dateAdded")
          cmp =
            new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    const total = results.length;
    const offset = (page - 1) * limit;
    const papers = results.slice(offset, offset + limit);

    return { papers, total };
  }

  async findById(id: string): Promise<ResearchPaper | null> {
    return this.store.get(id) ?? null;
  }

  async create(dto: CreatePaperDto): Promise<ResearchPaper> {
    const now = new Date().toISOString();
    const paper: ResearchPaper = {
      id: uuidv4(),
      ...dto,
      dateAdded: now,
      updatedAt: now,
    };
    this.store.set(paper.id, paper);
    return { ...paper };
  }

  async update(id: string, dto: UpdatePaperDto): Promise<ResearchPaper | null> {
    const existing = this.store.get(id);
    if (!existing) return null;

    const updated: ResearchPaper = {
      ...existing,
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async findAllRaw(): Promise<ResearchPaper[]> {
    return Array.from(this.store.values());
  }
}