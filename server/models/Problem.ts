import mongoose, { Schema, Document } from 'mongoose';
import { ProblemRequest } from '../../src/data/portalData';

export interface IProblemDocument extends Omit<ProblemRequest, 'id'>, Document {
  id: string;
}

const ProblemSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    student: { type: String, required: true },
    roll: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    faculty: { type: String, required: true, index: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      default: 'Academic Doubt',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Important', 'Medium', 'Low'],
      required: true,
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
      index: true,
    },
    submitted: { type: String, required: true },
    reply: { type: String, default: '' },
    next_step: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: Record<string, any>) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Problem =
  mongoose.models.Problem || mongoose.model<IProblemDocument>('Problem', ProblemSchema);

export default Problem;
