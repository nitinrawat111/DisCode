import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IProblem extends Document {
  problem_id: string;
  title: string;
  statementKey: string;
  testKeys: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema: Schema = new Schema(
  {
    problem_id: { type: String, default: uuidv4, unique: true },
    title: { type: String, required: true },
    statementKey: { type: String, required: true },
    testKeys: { type: [String], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    tags: { type: [String], required: true },
    createdBy: { type: String, required: true },
  },
  {
    _id: false,
    timestamps: true,
  }
);

const Problem = mongoose.model<IProblem>('Problem', ProblemSchema);
export default Problem;