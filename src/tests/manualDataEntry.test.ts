import { describe, it, expect } from 'vitest';
import { UnifiedStudent } from '../types/student';
import { calculateStudentSuccessScore, DEFAULT_WEIGHTS } from '../engine/scoringEngine';
import { evaluateAcademicRisk, DEFAULT_ACADEMIC_THRESHOLDS } from '../engine/academicRiskEngine';
import { evaluatePlacementRisk, DEFAULT_PLACEMENT_THRESHOLDS } from '../engine/placementRiskEngine';

describe('Manual Student Record Entry & Metrics Integrity', () => {
  const sampleManualStudent: UnifiedStudent = {
    student_id: 'STU099',
    name: 'Ananya Verma',
    department: 'Computer Science',
    academic_year: '3rd Year',
    semester: 'Sem 6',
    email: 'ananya.verma@edupulse.edu',
    academic: {
      cgpa: 8.75,
      internal_marks: 82,
      backlogs: 0,
      subject_performance: [],
    },
    attendance: {
      overall_attendance: 88,
      subject_attendance: {},
    },
    lms: {
      lms_logins: 55,
      assignment_completion: 92,
    },
    engagement: {
      events_participated: 3,
      club_participation: 2,
      hackathons: 2,
      certifications: 3,
    },
    placement: {
      aptitude_score: 80,
      coding_score: 85,
      mock_interview_score: 78,
      placement_preparation_participation: true,
    },
    skills: {
      technical_skill_score: 85,
      soft_skill_score: 82,
    },
    feedback: {
      student_satisfaction: 5,
      faculty_feedback: 'Excellent',
    },
    data_quality: {
      available_fields: 13,
      total_fields: 13,
      missing_fields: [],
      data_completeness_percentage: 100,
      has_minimum_evidence: true,
    },
    interventions: [],
  };

  it('1. Correctly calculates high success score for manually created complete student', () => {
    const scoreResult = calculateStudentSuccessScore(sampleManualStudent, DEFAULT_WEIGHTS);
    expect(scoreResult.final_score).toBeGreaterThan(80);
    expect(scoreResult.is_insufficient_data).toBe(false);
    expect(scoreResult.data_coverage_percentage).toBe(100);
    expect(scoreResult.components.academic.is_available).toBe(true);
  });

  it('2. Evaluates low academic and placement risk for manually entered top performer', () => {
    const acadRisk = evaluateAcademicRisk(sampleManualStudent, DEFAULT_ACADEMIC_THRESHOLDS);
    expect(acadRisk.risk_level).toBe('Low');
    expect(acadRisk.triggered_rules).toHaveLength(0);

    const placeRisk = evaluatePlacementRisk(sampleManualStudent, DEFAULT_PLACEMENT_THRESHOLDS);
    expect(placeRisk.risk_level).toBe('Low');
    expect(placeRisk.readiness_score).toBeGreaterThan(75);
  });

  it('3. Dynamically flags risk when manual edits introduce backlogs or low attendance', () => {
    const updatedStudent: UnifiedStudent = {
      ...sampleManualStudent,
      academic: {
        ...sampleManualStudent.academic,
        cgpa: 5.8,
        backlogs: 3,
      },
      attendance: {
        ...sampleManualStudent.attendance,
        overall_attendance: 62,
      },
    };

    const acadRisk = evaluateAcademicRisk(updatedStudent, DEFAULT_ACADEMIC_THRESHOLDS);
    expect(acadRisk.risk_level).toBe('High');
    expect(acadRisk.triggered_rules.some(r => r.category === 'Academic' || r.rule_name.includes('Backlog'))).toBe(true);
    expect(acadRisk.triggered_rules.some(r => r.category === 'Attendance' || r.rule_name.includes('Attendance'))).toBe(true);
  });

  it('4. Handles partial manual data entry with missing field reporting', () => {
    const partialStudent: UnifiedStudent = {
      ...sampleManualStudent,
      academic: {
        cgpa: null,
        internal_marks: null,
        backlogs: null,
      },
      placement: {
        aptitude_score: null,
        coding_score: null,
        mock_interview_score: null,
        placement_preparation_participation: false,
      },
    };

    const scoreResult = calculateStudentSuccessScore(partialStudent, DEFAULT_WEIGHTS);
    expect(scoreResult.components.academic.is_available).toBe(false);
    expect(scoreResult.components.placement.is_available).toBe(false);
    expect(scoreResult.data_coverage_percentage).toBeLessThan(100);
  });
});
