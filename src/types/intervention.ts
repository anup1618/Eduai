export type InterventionCategory =
  | 'Academic Mentoring'
  | 'Attendance Support'
  | 'Assignment Support'
  | 'Coding Practice'
  | 'Aptitude Training'
  | 'Mock Interview'
  | 'Skills Development'
  | 'Student Feedback Follow-up';

export type InterventionStatus = 'Planned' | 'In Progress' | 'Completed' | 'Follow-up Needed';

export interface InterventionNote {
  id: string;
  author: string;
  note: string;
  created_at: string;
}

export interface InterventionItem {
  id: string;
  student_id: string;
  student_name: string;
  department: string;
  category: InterventionCategory;
  title: string;
  description: string;
  faculty_assigned: string;
  target_date: string;
  status: InterventionStatus;
  created_at: string;
  updated_at: string;
  notes: InterventionNote[];
  outcome_notes?: string;
}
