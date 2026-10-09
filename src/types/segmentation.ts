// Student Segmentation Types

export type SegmentType =
  | 'Strong Academics, Strong Placement Readiness'
  | 'Strong Academics, Low Placement Readiness'
  | 'Academic Support Needed'
  | 'Placement Preparation Needed'
  | 'Low LMS Participation'
  | 'Balanced Performers'
  | 'Insufficient Data';

export interface SegmentInfo {
  type: SegmentType;
  title: string;
  description: string;
  color: string; // Tailwind color class
  badgeBg: string;
  badgeText: string;
  typicalIndicators: string[];
  recommendedInterventions: string[];
}

export interface SegmentAssignment {
  segment: SegmentType;
  primary_reason: string;
  supporting_metrics: Record<string, string | number>;
}
