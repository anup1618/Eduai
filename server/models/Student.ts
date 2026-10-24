import mongoose, { Schema, Document } from 'mongoose';
import { UnifiedStudent } from '../../src/types/student';

export interface IStudentDocument extends Omit<UnifiedStudent, 'student_id'>, Document {
  student_id: string;
}

const SubjectPerformanceSchema = new Schema(
  {
    subject_code: { type: String, required: true },
    subject_name: { type: String, required: true },
    internal_mark: { type: Number, default: 0 },
    attendance_pct: { type: Number, default: 0 },
    status: { type: String, enum: ['Pass', 'Fail', 'Borderline'], default: 'Pass' },
  },
  { _id: false }
);

const StudentInterventionHistorySchema = new Schema(
  {
    id: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    faculty_assigned: { type: String, required: true },
    target_date: { type: String, required: true },
    status: {
      type: String,
      enum: ['Planned', 'In Progress', 'Completed', 'Follow-up Needed'],
      default: 'Planned',
    },
    created_at: { type: String, required: true },
    follow_up_notes: [{ type: String }],
  },
  { _id: false }
);

const StudentSchema = new Schema(
  {
    student_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    department: {
      type: String,
      required: true,
      index: true,
    },
    academic_year: { type: String, required: true },
    semester: { type: String, required: true },
    email: { type: String, required: true },

    academic: {
      cgpa: { type: Number, default: null },
      internal_marks: { type: Number, default: null },
      backlogs: { type: Number, default: null },
      subject_performance: [SubjectPerformanceSchema],
    },

    attendance: {
      overall_attendance: { type: Number, default: null },
      subject_attendance: { type: Schema.Types.Mixed, default: {} },
    },

    lms: {
      lms_logins: { type: Number, default: null },
      assignment_completion: { type: Number, default: null },
    },

    engagement: {
      events_participated: { type: Number, default: null },
      club_participation: { type: Number, default: null },
      hackathons: { type: Number, default: null },
      certifications: { type: Number, default: null },
    },

    placement: {
      aptitude_score: { type: Number, default: null },
      coding_score: { type: Number, default: null },
      mock_interview_score: { type: Number, default: null },
      placement_preparation_participation: { type: Boolean, default: null },
    },

    skills: {
      technical_skill_score: { type: Number, default: null },
      soft_skill_score: { type: Number, default: null },
    },

    feedback: {
      student_satisfaction: { type: Number, default: null },
      faculty_feedback: { type: String, default: null },
    },

    data_quality: {
      available_fields: { type: Number, default: 0 },
      total_fields: { type: Number, default: 13 },
      missing_fields: [{ type: String }],
      data_completeness_percentage: { type: Number, default: 0 },
      has_minimum_evidence: { type: Boolean, default: false },
    },

    interventions: [StudentInterventionHistorySchema],
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

export const Student = mongoose.models.Student || mongoose.model<IStudentDocument>('Student', StudentSchema);
export default Student;
