// Academic and Placement Risk Types

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Insufficient Data';

export interface TriggeredRule {
  id: string;
  rule_name: string;
  category: 'Academic' | 'Attendance' | 'LMS' | 'Placement' | 'Skills';
  actual_value: string;
  threshold: string;
  severity: 'Low' | 'Moderate' | 'High';
  evidence: string;
  suggested_action: string;
}

export interface AcademicRiskThresholds {
  min_attendance_low: number; // e.g., 75%
  min_attendance_critical: number; // e.g., 65%
  min_cgpa_low: number; // e.g., 6.5
  min_cgpa_critical: number; // e.g., 5.5
  max_acceptable_backlogs: number; // e.g., 0
  min_internal_marks_critical: number; // e.g., 50%
  min_assignment_completion_critical: number; // e.g., 50%
}

export interface PlacementRiskThresholds {
  min_aptitude_score: number; // e.g., 60
  min_coding_score: number; // e.g., 50
  min_mock_interview_score: number; // e.g., 55
  min_technical_skill: number; // e.g., 55
  min_soft_skill: number; // e.g., 50
}

export interface AcademicRiskResult {
  risk_level: RiskLevel;
  risk_score: number; // 0 - 100 risk index
  triggered_rules: TriggeredRule[];
  evidence_summary: string[];
  suggested_next_steps: string[];
}

export interface PlacementRiskResult {
  risk_level: RiskLevel;
  readiness_score: number | null; // 0 - 100
  patterns: string[];
  triggered_rules: TriggeredRule[];
  evidence_summary: string[];
  suggested_next_steps: string[];
}
