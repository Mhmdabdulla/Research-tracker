import mongoose, { Schema } from 'mongoose';
import { IPaper } from './interfaces/paper.interface.js';

const PaperSchema: Schema = new Schema(
  {
    user:{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "Paper must belong to a user"],
      index: true
    },
    title: { 
      type: String, 
      required: [true, 'Paper title is required'], 
      trim: true 
    },
    authors: [{ 
      type: String, 
      required: [true, 'Author name is required'], 
      trim: true 
    }],
    domain: {
      type: String,
      required: true,
      enum: ["Computer Science", "Biology", "Physics", "Mathematics", "Medicine", "Engineering", "Psychology", "Chemistry", "Economics"],
    },
    stage: {
      type: String,
      required: true,
      enum: ["To Read", "Abstract Read", "Introduction Done", "Methods Reviewed", "Results Analyzed", "Fully Read", "Notes Completed"],
      default: 'To Read'
    },
    citations: { 
      type: Number, 
      default: 0,
      min: [0, 'Citations cannot be negative'] 
    },
    impactScore: {
      type: String,
      required: true,
      enum: ["High", "Medium", "Low", "Unknown"],
      default: 'Unknown'
    },
    dateAdded: { 
      type: Date, 
      default: Date.now 
    }
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt
    versionKey: false // Removes the __v field from documents
  }
);

// Add an index to domain and readingStage for faster filtering 
PaperSchema.index({ domain: 1, readingStage: 1 });

const Paper = mongoose.model<IPaper>('Paper', PaperSchema); 
export default Paper;