import { describe, it, expect } from 'vitest';
import { calculateStudentSuccessScore, DEFAULT_WEIGHTS } from '../engine/scoringEngine';
import { UnifiedStudent } from '../types/student';

const createMockStudent = (overrides?: Partial<UnifiedStudent>): UnifiedStudent => ({
  student_id: 'EP-CS-001',
  name: 'Test Student',
  department: 'Computer Science',
  academic_year: '3rd Year',
  semester: 'Sem 6',
  email: 'test@univ.edu',
  academic: {
    cgpa: 8.0,
    internal_marks: 80,
    backlogs: 0,
  },
  attendance: {
    overall_attendance: 85,
  },
  lms: {
    lms_logins: 30,
    assignment_completion: 90,
  },
  engagement: {
    events_participated: 2,
    club_participation: 1,
    hackathons: 1,
    certifications: 1,
  },
  placement: {
    aptitude_score: 80,
    coding_score: 85,
    mock_interview_score: 75,
    placement_preparation_participation: true,
  },
  skills: {
    technical_skill_score: 80,
    soft_skill_score: 80,
  },
  feedback: {
    student_satisfaction: 4.5,
    faculty_feedback: 'Good',
  },
  data_quality: {
    available_fields: 13,
    total_fields: 13,
    missing_fields: [],
    data_completeness_percentage: 100,
    has_minimum_evidence: true,
  },
  interventions: [],
  ...overrides,
});

describe('Deterministic Scoring Engine', () => {
  it('calculates a valid score for full data student', () => {
    const student = createMockStudent();
    const result = calculateStudentSuccessScore(student);

    expect(result.final_score).not.toBeNull();
    expect(result.final_score).toBeGreaterThanOrEqual(0);
    expect(result.final_score).toBeLessThanOrEqual(100);
    expect(result.is_insufficient_data).toBe(false);
    expect(result.data_coverage_percentage).toBe(100);
  });

  it('applies backlog penalty correctly in academic score', () => {
    const cleanStudent = createMockStudent({
      academic: { cgpa: 8.0, internal_marks: 80, backlogs: 0 },
    });
    const backlogStudent = createMockStudent({
      academic: { cgpa: 8.0, internal_marks: 80, backlogs: 2 }, // 2 * 5 = 10 pts penalty
    });

    const cleanRes = calculateStudentSuccessScore(cleanStudent);
    const backlogRes = calculateStudentSuccessScore(backlogStudent);

    expect(cleanRes.components.academic.score!).toBe(80);
    expect(backlogRes.components.academic.score!).toBe(70);
    expect(backlogRes.final_score!).toBeLessThan(cleanRes.final_score!);
  });

  it('handles missing components transparently via dynamic weight re-normalization', () => {
    const missingLmsStudent = createMockStudent({
      lms: { lms_logins: null, assignment_completion: null },
    });

    const result = calculateStudentSuccessScore(missingLmsStudent);

    // LMS missing should NOT penalize as zero
    expect(result.components.lms.score).toBeNull();
    expect(result.components.lms.is_available).toBe(false);
    // Other components effective weights must scale up
    expect(result.components.academic.effective_weight).toBeGreaterThan(DEFAULT_WEIGHTS.academic);
    expect(result.final_score).toBeGreaterThan(70);
  });

  it('flags student as Insufficient Data when data coverage is under 50%', () => {
    const sparseStudent = createMockStudent({
      academic: { cgpa: null, internal_marks: null, backlogs: 0 },
      attendance: { overall_attendance: null },
      lms: { lms_logins: null, assignment_completion: null },
      placement: { aptitude_score: null, coding_score: null, mock_interview_score: null, placement_preparation_participation: null },
    });

    const result = calculateStudentSuccessScore(sparseStudent);

    expect(result.is_insufficient_data).toBe(true);
    expect(result.final_score).toBeNull();
    expect(result.data_coverage_percentage).toBeLessThan(50);
  });
});
