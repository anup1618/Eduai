import { describe, it, expect } from 'vitest';
import { INITIAL_STUDENTS } from '../data/initialStudents';
import {
  findStudentInQuery,
  buildStudentDetailBundle,
  queryStudentAiAssistant,
} from '../engine/studentAiChatEngine';

describe('AI Student Chat Engine - Admin and TPO Section', () => {
  it('finds students by student ID (case insensitive, format variations)', () => {
    const s1 = findStudentInQuery('What is STU001 attendance?', INITIAL_STUDENTS);
    expect(s1).toBeDefined();
    expect(s1?.student_id).toBe('STU001');

    const s2 = findStudentInQuery('details for stu002', INITIAL_STUDENTS);
    expect(s2).toBeDefined();
    expect(s2?.student_id).toBe('STU002');
  });

  it('finds students by first name, last name, or full name', () => {
    const s1 = findStudentInQuery('Tell me about Priya Singh', INITIAL_STUDENTS);
    expect(s1).toBeDefined();
    expect(s1?.name).toContain('Priya');

    const s2 = findStudentInQuery('Show Sneha record', INITIAL_STUDENTS);
    expect(s2).toBeDefined();
    expect(s2?.name).toContain('Sneha');
  });

  it('builds comprehensive 360 bundle with academic, attendance, placement and mentor telemetry', () => {
    const student = INITIAL_STUDENTS[0];
    const bundle = buildStudentDetailBundle(student);

    expect(bundle.student.student_id).toBe(student.student_id);
    expect(typeof bundle.cgpa).toBe('number');
    expect(typeof bundle.overallAttendance).toBe('number');
    expect(['Critical', 'Warning', 'Safe']).toContain(bundle.attendanceStatus);
    expect(['Tier 1', 'Tier 2', 'Tier 3', 'Needs Preparation']).toContain(bundle.placementTier);
    expect(bundle.mentorName).toBeDefined();
    expect(bundle.mentorDept).toBeDefined();
    expect(Array.isArray(bundle.eligibleDrives)).toBe(true);
    expect(typeof bundle.atsResumeScore).toBe('number');
  });

  it('handles specific student attribute queries: Attendance, CGPA, Backlogs, Placement', () => {
    const targetStudent = INITIAL_STUDENTS[0];

    // Attendance query
    const resAtt = queryStudentAiAssistant(
      `What is ${targetStudent.student_id} attendance?`,
      INITIAL_STUDENTS,
      'admin'
    );
    expect(resAtt.intent).toBe('student_attribute');
    expect(resAtt.attributeQueried).toBe('Attendance');
    expect(resAtt.matchedStudent?.student.student_id).toBe(targetStudent.student_id);

    // CGPA query
    const resCgpa = queryStudentAiAssistant(
      `What is the CGPA of ${targetStudent.name}?`,
      INITIAL_STUDENTS,
      'admin'
    );
    expect(resCgpa.intent).toBe('student_attribute');
    expect(resCgpa.attributeQueried).toBe('CGPA');

    // Backlog query
    const resBacklog = queryStudentAiAssistant(
      `Does ${targetStudent.name} have backlogs?`,
      INITIAL_STUDENTS,
      'admin'
    );
    expect(resBacklog.intent).toBe('student_attribute');
    expect(resBacklog.attributeQueried).toBe('Backlogs');

    // Placement query
    const resPlace = queryStudentAiAssistant(
      `Show placement readiness for ${targetStudent.name}`,
      INITIAL_STUDENTS,
      'tpo'
    );
    expect(resPlace.intent).toBe('student_attribute');
    expect(resPlace.attributeQueried).toBe('Placement Readiness');
  });

  it('handles cohort questions: Critical risk, attendance below 75%, backlogs, and Tier 1 placement', () => {
    // Critical risk cohort
    const resCritical = queryStudentAiAssistant(
      'Who are the critical risk students needing academic support?',
      INITIAL_STUDENTS,
      'admin'
    );
    expect(resCritical.intent).toBe('student_cohort');
    expect(resCritical.matchedStudentsList).toBeDefined();
    expect(resCritical.metrics?.length).toBeGreaterThan(0);

    // Attendance below 75%
    const resAtt75 = queryStudentAiAssistant(
      'Show students with attendance below 75%',
      INITIAL_STUDENTS,
      'admin'
    );
    expect(resAtt75.intent).toBe('student_cohort');
    expect(resAtt75.matchedStudentsList?.every(s => s.attendance < 75)).toBe(true);

    // Tier 1 placement candidates
    const resTier1 = queryStudentAiAssistant(
      'Who are Tier 1 placement candidates for dream companies?',
      INITIAL_STUDENTS,
      'tpo'
    );
    expect(resTier1.intent).toBe('student_cohort');
    expect(resTier1.matchedStudentsList?.every(s => s.placementTier === 'Tier 1')).toBe(true);
  });

  it('provides actionable direct navigation link in response payload', () => {
    const student = INITIAL_STUDENTS[0];
    const res = queryStudentAiAssistant(`Show details for ${student.name}`, INITIAL_STUDENTS, 'admin');

    expect(res.intent).toBe('student_detail');
    expect(res.actionLink).toBeDefined();
    expect(res.actionLink?.studentId).toBe(student.student_id);
    expect(res.actionLink?.actionType).toBe('open_profile');
  });
});

