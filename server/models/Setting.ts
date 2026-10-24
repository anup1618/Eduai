import mongoose, { Schema, Document } from 'mongoose';
import { ScoreWeights } from '../../src/types/scoring';
import { AcademicRiskThresholds, PlacementRiskThresholds } from '../../src/types/risk';

export interface ISettingDocument extends Document {
  key: string;
  weights: ScoreWeights;
  academicThresholds: AcademicRiskThresholds;
  placementThresholds: PlacementRiskThresholds;
  updatedAt: Date;
}

const SettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global_settings' },
    weights: { type: Schema.Types.Mixed, required: true },
    academicThresholds: { type: Schema.Types.Mixed, required: true },
    placementThresholds: { type: Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
  }
);

export const Setting = mongoose.models.Setting || mongoose.model<ISettingDocument>('Setting', SettingSchema);
export default Setting;
