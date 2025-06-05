import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IProblem extends Document {
  problemId: string;
  title: string;
  markdownKey: string;
  testKeys: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  /**
   * Additional field for relevancy score while performing text search
   * @note Always check if score exists beforehand
   */
  textSearchScore?: number;
}

const ProblemSchema: Schema = new Schema(
  {
    problemId: { type: String, default: uuidv4, unique: true },
    title: { type: String, required: true, maxlength: 100 },
    markdownKey: { type: String, required: true },
    testKeys: { type: [String], required: true, minlength: 1 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    tags: { type: [String], required: true, minlength: 1 },
    createdBy: { type: Number, required: true },
  },
  {
    _id: false,
    timestamps: true,
  }
);

ProblemSchema.index({ title: 'text', tags: 'text' });

const Problem = mongoose.model<IProblem>('Problem', ProblemSchema);
export default Problem;