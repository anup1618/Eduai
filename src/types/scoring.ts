// Student Success Score Types

export interface ScoreWeights {
  academic: number;    // default: 30%
  attendance: number;  // default: 20%
  lms: number;         // default: 15%
  engagement: number;  // default: 10%
  placement: number;   // default: 15%
  skills: number;      // default: 10%
}

export interface ComponentBreakdown {
  score: number | null; // 0-100 or null if missing
  raw_value?: string;
  weight: number; // configured percentage
  effective_weight: number; // re-normalized percentage when components missing
  weighted_points: number; // score * effective_weight / 100
  is_available: boolean;
  notes: string;
}

export interface SuccessScoreResult {
  student_id: string;
  final_score: number | null; // 0-100 or null if insufficient data (<50% coverage)
  is_insufficient_data: boolean;
  data_coverage_percentage: number;
  components: {
    academic: ComponentBreakdown;
    attendance: ComponentBreakdown;
    lms: ComponentBreakdown;
    engagement: ComponentBreakdown;
    placement: ComponentBreakdown;
    skills: ComponentBreakdown;
  };
  positive_indicators: string[];
  areas_needing_attention: string[];
  explanation_summary: string;
}
