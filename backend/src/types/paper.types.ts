// src/types/paper.types.ts

export enum PaperStage {
  TO_READ = "To Read",
  ABSTRACT_READ = "Abstract Read",
  INTRODUCTION_DONE = "Introduction Done",
  METHODS_REVIEWED = "Methods Reviewed",
  RESULTS_ANALYZED = "Results Analyzed",
  FULLY_READ = "Fully Read",
  NOTES_COMPLETED = "Notes Completed",
}

export enum ImpactScore {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
  UNKNOWN = "Unknown",
}

export enum ResearchDomain {
  COMPUTER_SCIENCE = "Computer Science",
  BIOLOGY = "Biology",
  PHYSICS = "Physics",
  CHEMISTRY = "Chemistry",
  MATHEMATICS = "Mathematics",
  MEDICINE = "Medicine",
  PSYCHOLOGY = "Psychology",
  ECONOMICS = "Economics",
  ENGINEERING = "Engineering",
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  domain: ResearchDomain;
  stage: PaperStage;
  citations: number;
  impactScore: ImpactScore;
  dateAdded: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type SortableField = "title" | "citations" | "dateAdded";
export type SortDirection = "asc" | "desc";
export type TimePeriod = "all" | "week" | "month" | "3months";