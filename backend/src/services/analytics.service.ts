// src/services/analytics.service.ts

import { IAnalyticsService } from "./interfaces/IAnalytics.service.js";
import { IPaperRepository } from "../repositories/interfaces/IPaper.repository.js";
import {
  CitationsImpactDataPointDto,
  CitationsImpactResponseDto,
  DashboardSummaryDto,
  DomainStagesDataPointDto,
  DomainStagesResponseDto,
  FunnelDataPointDto,
  FunnelResponseDto,
  RecentPaperDto,
  RecentPapersResponseDto,
  StageCountDto,
} from "../dtos/analytics.dto.js";
import { PaperStage, ResearchPaper } from "../types/paper.types.js";

// Ordered pipeline — used for funnel computation and progress bars
const STAGE_ORDER: PaperStage[] = [
  PaperStage.TO_READ,
  PaperStage.ABSTRACT_READ,
  PaperStage.INTRODUCTION_DONE,
  PaperStage.METHODS_REVIEWED,
  PaperStage.RESULTS_ANALYZED,
  PaperStage.FULLY_READ,
  PaperStage.NOTES_COMPLETED,
];

// Stages shown in the Reading Progress card (excludes "To Read")
const PROGRESS_STAGES: PaperStage[] = [
  PaperStage.ABSTRACT_READ,
  PaperStage.INTRODUCTION_DONE,
  PaperStage.METHODS_REVIEWED,
  PaperStage.RESULTS_ANALYZED,
  PaperStage.FULLY_READ,
  PaperStage.NOTES_COMPLETED,
];

const IMPACT_NUMERIC: Record<string, number> = {
  Unknown: 0,
  Low: 1,
  Medium: 2,
  High: 3,
};

const FULLY_READ_STAGES = new Set<PaperStage>([
  PaperStage.FULLY_READ,
  PaperStage.NOTES_COMPLETED,
]);

const DEFAULT_RECENT_LIMIT = 5;

export class AnalyticsService implements IAnalyticsService {
  constructor(private readonly paperRepository: IPaperRepository) {}

  async getDashboardSummary(): Promise<DashboardSummaryDto> {
    const papers = await this.paperRepository.findAllRaw();

    const totalPapers = papers.length;
    const avgCitations =
      totalPapers > 0
        ? Math.round(papers.reduce((sum, p) => sum + p.citations, 0) / totalPapers)
        : 0;

    const fullyReadCount = papers.filter((p) => FULLY_READ_STAGES.has(p.stage)).length;
    const completionRate =
      totalPapers > 0 ? Math.round((fullyReadCount / totalPapers) * 100) : 0;

    // Per-stage counts for the Reading Progress progress bars
    const stageBreakdown: StageCountDto[] = PROGRESS_STAGES.map((stage) => ({
      stage,
      count: papers.filter((p) => p.stage === stage).length,
    }));

    return { totalPapers, avgCitations, fullyReadCount, completionRate, stageBreakdown };
  }

  async getFunnelData(): Promise<FunnelResponseDto> {
    const papers = await this.paperRepository.findAllRaw();

    return STAGE_ORDER.map((stage): FunnelDataPointDto => {
      const stageIndex = STAGE_ORDER.indexOf(stage);
      const count = papers.filter((p) => {
        const pIndex = STAGE_ORDER.indexOf(p.stage);
        return pIndex >= stageIndex;
      }).length;

      return { name: stage, count };
    });
  }

  async getDomainStages(): Promise<DomainStagesResponseDto> {
    const papers = await this.paperRepository.findAllRaw();

    const domains = Array.from(new Set(papers.map((p) => p.domain)));

    return domains.map((domain): DomainStagesDataPointDto => {
      const domainPapers = papers.filter((p) => p.domain === domain);
      const countByStage = (stage: PaperStage): number =>
        domainPapers.filter((p) => p.stage === stage).length;

      return {
        domain,
        "To Read": countByStage(PaperStage.TO_READ),
        "Abstract Read": countByStage(PaperStage.ABSTRACT_READ),
        "Introduction Done": countByStage(PaperStage.INTRODUCTION_DONE),
        "Methods Reviewed": countByStage(PaperStage.METHODS_REVIEWED),
        "Results Analyzed": countByStage(PaperStage.RESULTS_ANALYZED),
        "Fully Read": countByStage(PaperStage.FULLY_READ),
        "Notes Completed": countByStage(PaperStage.NOTES_COMPLETED),
      };
    });
  }

  async getCitationsImpact(): Promise<CitationsImpactResponseDto> {
    const papers = await this.paperRepository.findAllRaw();

    return papers.map((p: ResearchPaper): CitationsImpactDataPointDto => ({
      id: p.id,
      title: p.title,
      citations: p.citations,
      impact: IMPACT_NUMERIC[p.impactScore] ?? 0,
      impactLabel: p.impactScore,
      domain: p.domain,
    }));
  }

  async getRecentPapers(limit = DEFAULT_RECENT_LIMIT): Promise<RecentPapersResponseDto> {
    const papers = await this.paperRepository.findAllRaw();

    return papers
      .slice() // avoid mutating the store's array
      .sort(
        (a, b) =>
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
      )
      .slice(0, limit)
      .map((p): RecentPaperDto => ({
        id: p.id,
        title: p.title,
        authors: p.authors,
        impactScore: p.impactScore,
        domain: p.domain,
        stage: p.stage,
        dateAdded: p.dateAdded,
      }));
  }
}