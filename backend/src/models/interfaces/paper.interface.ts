import { Document, Types } from 'mongoose';

export interface IPaper extends Document {
  user: Types.ObjectId; // Reference to User ID
  title: string;
  authors: string[];
  domain: "Computer Science" | "Biology" | "Physics" | "Mathematics" | "Medicine" | "Engineering" | "Psychology" | "Chemistry" | "Economics";
  stage: "To Read" | "Abstract Read" | "Introduction Done" | "Methods Reviewed" | "Results Analyzed" | "Fully Read" | "Notes Completed";
  citations: number;
  impactScore: "High" | "Medium" | "Low" | "Unknown";
  dateAdded: Date;
  createdAt: Date;
  updatedAt: Date;
}