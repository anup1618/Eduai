import { describe, it, expect } from 'vitest';
import { evaluateAcademicRisk } from '../engine/academicRiskEngine';
import { evaluatePlacementRisk } from '../engine/placementRiskEngine';
import { UnifiedStudent } from '../types/student';

const createBaseStudent = (): UnifiedStudent => ({
  student_id: 'EP-CS-002',
  name: 'Sample Student',
  department: 'Computer Science',
  academic_year: '3rd Year',
  semester: 'Sem 5',
  email: 'sample@univ.edu',
  academic: { cgpa: 7.5, internal_marks: 75, backlogs: 0 },
  attendance: { overall_attendance: 80 },
  lms: { lms_logins: 25, assignment_completion: 85 },
  engagement: { events_participated: 2, club_participation: 1, hackathons: 1, certifications: 1 },
  placement: { aptitude_score: 75, coding_score: 75, mock_interview_score: 75, placement_preparation_participation: true },
  skills: { technical_skill_score: 75, soft_skill_score: 75 },
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

describe('Academic Risk Engine', () => {
  it('classifies normal student as Low Risk', () => {
    const student = createBaseStudent();
    const result = evaluateAcademicRisk(student);
    expect(result.risk_level).toBe('Low');
    expect(result.triggered_rules.length).toBe(0);
  });

  it('triggers Critical Attendance Deficit rule and classifies as High Risk when attendance < 65%', () => {
    const student = createBaseStudent();
    student.attendance.overall_attendance = 58;
    student.academic.cgpa = 5.2;

    const result = evaluateAcademicRisk(student);
    expect(result.risk_level).toBe('High');
    expect(result.triggered_rules.some(r => r.id === 'ACAD-RULE-ATT-CRIT')).toBe(true);
  });

  it('flags multiple backlogs rule correctly', () => {
    const student = createBaseStudent();
    student.academic.backlogs = 3;

    const result = evaluateAcademicRisk(student);
    expect(result.triggered_rules.some(r => r.id === 'ACAD-RULE-BACKLOG-MULTI')).toBe(true);
  });
});

describe('Placement Risk Engine', () => {
  it('detects High Academic Performer with Low Placement Readiness pattern', () => {
    const student = createBaseStudent();
    student.academic.cgpa = 8.5; // High GPA
    student.placement.coding_score = 35; // Low coding
    student.placement.aptitude_score = 42; // Low aptitude
    student.placement.mock_interview_score = 45;

    const result = evaluatePlacementRisk(student);
    expect(result.risk_level).toBe('High');
    expect(result.patterns).toContain('High Academic Performer with Low Placement Readiness');
    expect(result.patterns).toContain('Weak Coding Performance');
  });

  it('handles missing placement assessment without treating it as zero', () => {
    const student = createBaseStudent();
    student.placement.coding_score = null;

    const result = evaluatePlacementRisk(student);
    expect(result.patterns.some(p => p.includes('Incomplete Placement Assessments'))).toBe(true);
    // Readiness score still calculates from available aptitude & mock
    expect(result.readiness_score).not.toBeNull();
  });
});
