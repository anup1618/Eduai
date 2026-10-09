// Unified Student Data Model

export type Department = 'Computer Science' | 'Information Technology' | 'Electronics & Comm.' | 'Mechanical Eng.' | 'Civil Eng.';
export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
export type Semester = 'Sem 1' | 'Sem 2' | 'Sem 3' | 'Sem 4' | 'Sem 5' | 'Sem 6' | 'Sem 7' | 'Sem 8';

export interface SubjectPerformance {
  subject_code: string;
  subject_name: string;
  internal_mark: number;
  attendance_pct: number;
  status: 'Pass' | 'Fail' | 'Borderline';
}

export interface StudentIdentity {
  student_id: string;
  name: string;
  department: Department;
  academic_year: AcademicYear;
  semester: Semester;
  email: string;
}

export interface StudentAcademic {
  cgpa: number | null; // 0 - 10
  internal_marks: number | null; // 0 - 100
  backlogs: number | null; // count >= 0
  subject_performance?: SubjectPerformance[];
}

export interface StudentAttendance {
  overall_attendance: number | null; // 0 - 100%
  subject_attendance?: Record<string, number>;
}

export interface StudentLMS {
  lms_logins: number | null; // monthly count
  assignment_completion: number | null; // 0 - 100%
}

export interface StudentEngagement {
  events_participated: number | null; // count
  club_participation: number | null; // count
  hackathons: number | null; // count
  certifications: number | null; // count
}

export interface StudentPlacement {
  aptitude_score: number | null; // 0 - 100
  coding_score: number | null; // 0 - 100
  mock_interview_score: number | null; // 0 - 100
  placement_preparation_participation: boolean | null;
}

export interface StudentSkills {
  technical_skill_score: number | null; // 0 - 100
  soft_skill_score: number | null; // 0 - 100
}

export interface StudentFeedback {
  student_satisfaction: number | null; // 1 - 5 scale
  faculty_feedback: 'Excellent' | 'Good' | 'Average' | 'Needs Attention' | null;
}

export interface StudentDataQuality {
  available_fields: number;
  total_fields: number;
  missing_fields: string[];
  data_completeness_percentage: number;
  has_minimum_evidence: boolean;
}

export interface StudentInterventionHistory {
  id: string;
  category: string;
  description: string;
  faculty_assigned: string;
  target_date: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Follow-up Needed';
  created_at: string;
  follow_up_notes?: string[];
}

export interface UnifiedStudent {
  // Identity
  student_id: string;
  name: string;
  department: Department;
  academic_year: AcademicYear;
  semester: Semester;
  email: string;

  // 7 Core Data Domains
  academic: StudentAcademic;
  attendance: StudentAttendance;
  lms: StudentLMS;
  engagement: StudentEngagement;
  placement: StudentPlacement;
  skills: StudentSkills;
  feedback: StudentFeedback;

  // Data Quality & Intervention History
  data_quality: StudentDataQuality;
  interventions: StudentInterventionHistory[];
}
