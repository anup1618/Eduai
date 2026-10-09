import { describe, it, expect } from 'vitest';
import { simulateWhatIfScenario } from '../engine/whatIfSimulator';
import { UnifiedStudent } from '../types/student';

const createBaseStudent = (): UnifiedStudent => ({
  student_id: 'EP-CS-004',
  name: 'Sim Student',
  department: 'Computer Science',
  academic_year: '3rd Year',
  semester: 'Sem 6',
  email: 'sim@univ.edu',
  academic: { cgpa: 6.0, internal_marks: 50, backlogs: 1 },
  attendance: { overall_attendance: 60 },
  lms: { lms_logins: 10, assignment_completion: 50 },
  engagement: { events_participated: 0, club_participation: 0, hackathons: 0, certifications: 0 },
  placement: { aptitude_score: 45, coding_score: 40, mock_interview_score: 45, placement_preparation_participation: false },
  skills: { technical_skill_score: 50, soft_skill_score: 50 },
  feedback: { student_satisfaction: 3.0, faculty_feedback: 'Average' },
  data_quality: {
    available_fields: 13,
    total_fields: 13,
    missing_fields: [],
    data_completeness_percentage: 100,
    has_minimum_evidence: true,
  },
  interventions: [],
});

describe('What-If Simulator Engine', () => {
  it('correctly calculates score improvement and risk transition when indicators improve', () => {
    const student = createBaseStudent();

    // Hypothetically improve attendance and coding score
    const simulation = simulateWhatIfScenario(student, {
      attendance: 90,
      coding_score: 85,
      aptitude_score: 80,
    });

    expect(simulation.scoreDelta).toBeGreaterThan(0);
    expect(simulation.simulatedScore.final_score!).toBeGreaterThan(simulation.originalScore.final_score!);
    expect(simulation.simulatedAcademicRisk.risk_score).toBeLessThanOrEqual(simulation.originalAcademicRisk.risk_score);
    expect(simulation.keyTakeaways.length).toBeGreaterThan(0);
  });
});
