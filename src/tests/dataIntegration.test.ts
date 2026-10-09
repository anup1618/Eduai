import { describe, it, expect } from 'vitest';
import { parseCSV, validateDataset, mergeValidatedRecords } from '../engine/dataValidator';
import { UnifiedStudent } from '../types/student';

describe('Data Integration & CSV Validator', () => {
  it('parses CSV text into rows and headers correctly', () => {
    const csv = `student_id,cgpa,internal_marks,backlogs
EP-CS-001,8.5,88,0
EP-CS-002,7.2,70,1`;

    const { headers, rows } = parseCSV(csv);
    expect(headers).toEqual(['student_id', 'cgpa', 'internal_marks', 'backlogs']);
    expect(rows.length).toBe(2);
    expect(rows[0]['student_id']).toBe('EP-CS-001');
    expect(rows[0]['cgpa']).toBe('8.5');
  });

  it('validates ranges and catches invalid CGPA (> 10)', () => {
    const headers = ['student_id', 'cgpa'];
    const rows = [
      { student_id: 'EP-CS-001', cgpa: '11.5' }, // Invalid!
      { student_id: 'EP-CS-002', cgpa: '8.4' },  // Valid
    ];

    const result = validateDataset('academic', headers, rows);
    expect(result.validRows).toBe(1);
    expect(result.invalidRows).toBe(1);
    expect(result.errors.some(e => e.field === 'cgpa')).toBe(true);
  });

  it('detects duplicate student IDs in uploaded dataset', () => {
    const headers = ['student_id', 'overall_attendance'];
    const rows = [
      { student_id: 'EP-CS-001', overall_attendance: '85' },
      { student_id: 'EP-CS-001', overall_attendance: '90' }, // Duplicate!
    ];

    const result = validateDataset('attendance', headers, rows);
    expect(result.duplicateIds).toContain('EP-CS-001');
  });

  it('merges records without silently overwriting when in merge mode', () => {
    const existing: UnifiedStudent[] = [
      {
        student_id: 'EP-CS-001',
        name: 'Existing Student',
        department: 'Computer Science',
        academic_year: '3rd Year',
        semester: 'Sem 6',
        email: 'test@univ.edu',
        academic: { cgpa: 8.0, internal_marks: 80, backlogs: 0 },
        attendance: { overall_attendance: null }, // Missing attendance
        lms: { lms_logins: null, assignment_completion: null },
        engagement: { events_participated: 0, club_participation: 0, hackathons: 0, certifications: 0 },
        placement: { aptitude_score: null, coding_score: null, mock_interview_score: null, placement_preparation_participation: null },
        skills: { technical_skill_score: null, soft_skill_score: null },
        feedback: { student_satisfaction: null, faculty_feedback: null },
        data_quality: { available_fields: 2, total_fields: 13, missing_fields: [], data_completeness_percentage: 20, has_minimum_evidence: false },
        interventions: [],
      },
    ];

    const newAttendanceRecords = [{ student_id: 'EP-CS-001', overall_attendance: 92 }];
    const mergeRes = mergeValidatedRecords(existing, 'attendance', newAttendanceRecords, 'merge');

    expect(mergeRes.updatedStudents).toBe(1);
    expect(mergeRes.mergedStudents[0].attendance.overall_attendance).toBe(92);
    expect(mergeRes.mergedStudents[0].academic.cgpa).toBe(8.0); // Preserved
  });
});
