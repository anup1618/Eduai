import { describe, it, expect } from 'vitest';
import { assignStudentSegment } from '../engine/segmentationEngine';
import { UnifiedStudent } from '../types/student';

const createBaseStudent = (): UnifiedStudent => ({
  student_id: 'EP-EC-003',
  name: 'Seg Student',
  department: 'Electronics & Comm.',
  academic_year: '4th Year',
  semester: 'Sem 7',
  email: 'seg@univ.edu',
  academic: { cgpa: 7.0, internal_marks: 70, backlogs: 0 },
  attendance: { overall_attendance: 80 },
  lms: { lms_logins: 20, assignment_completion: 80 },
  engagement: { events_participated: 1, club_participation: 1, hackathons: 0, certifications: 1 },
  placement: { aptitude_score: 65, coding_score: 65, mock_interview_score: 65, placement_preparation_participation: true },
  skills: { technical_skill_score: 70, soft_skill_score: 70 },
  feedback: { student_satisfaction: 4.0, faculty_feedback: 'Good' },
  data_quality: {
    available_fields: 13,
    total_fields: 13,
    missing_fields: [],
    data_completeness_percentage: 100,
    has_minimum_evidence: true,
  },
  interventions: [],
});

describe('Student Segmentation Engine with Precedence Rules', () => {
  it('enforces Insufficient Data precedence when completeness < 50%', () => {
    const student = createBaseStudent();
    student.data_quality.data_completeness_percentage = 35;

    const result = assignStudentSegment(student);
    expect(result.segment).toBe('Insufficient Data');
  });

  it('assigns Academic Support Needed when backlogs or attendance breach occurs', () => {
    const student = createBaseStudent();
    student.academic.backlogs = 2;

    const result = assignStudentSegment(student);
    expect(result.segment).toBe('Academic Support Needed');
  });

  it('assigns Strong Academics, Low Placement Readiness when GPA is high but coding is low', () => {
    const student = createBaseStudent();
    student.academic.cgpa = 8.8;
    student.placement.coding_score = 40;
    student.placement.aptitude_score = 45;
    student.placement.mock_interview_score = 50;

    const result = assignStudentSegment(student);
    expect(result.segment).toBe('Strong Academics, Low Placement Readiness');
  });

  it('assigns Strong Academics, Strong Placement Readiness for dual achievers', () => {
    const student = createBaseStudent();
    student.academic.cgpa = 8.5;
    student.placement.coding_score = 85;
    student.placement.aptitude_score = 80;
    student.placement.mock_interview_score = 80;

    const result = assignStudentSegment(student);
    expect(result.segment).toBe('Strong Academics, Strong Placement Readiness');
  });
});
