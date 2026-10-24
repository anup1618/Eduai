import mongoose, { Schema, Document } from 'mongoose';
import { InterventionItem } from '../../src/types/intervention';

export interface IInterventionDocument extends Omit<InterventionItem, 'id'>, Document {
  id: string;
}

const InterventionNoteSchema = new Schema(
  {
    id: { type: String, required: true },
    author: { type: String, required: true },
    note: { type: String, required: true },
    created_at: { type: String, required: true },
  },
  { _id: false }
);

const InterventionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    student_id: { type: String, required: true, index: true },
    student_name: { type: String, required: true },
    department: { type: String, required: true, index: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    faculty_assigned: { type: String, required: true },
    target_date: { type: String, required: true },
    status: {
      type: String,
      enum: ['Planned', 'In Progress', 'Completed', 'Follow-up Needed'],
      default: 'Planned',
      index: true,
    },
    created_at: { type: String, required: true },
    updated_at: { type: String, required: true },
    notes: [InterventionNoteSchema],
    outcome_notes: { type: String, default: '' },
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

export const Intervention =
  mongoose.models.Intervention || mongoose.model<IInterventionDocument>('Intervention', InterventionSchema);
export default Intervention;
