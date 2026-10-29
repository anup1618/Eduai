import { describe, it, expect } from 'vitest';
import {
  DEMO_PLACEMENT_DRIVES,
  DEMO_TRAINING_MODULES,
  DEMO_PLACEMENT_OFFERS,
  DEMO_TPO_OFFICER,
  DEMO_OPPORTUNITIES_CATALOG,
  INITIAL_STUDENT_OPPORTUNITY_ALLOCATIONS,
  matchStudentToOpportunity
} from '../data/tpoData';
import { evaluatePlacementRisk } from '../engine/placementRiskEngine';
import { calculateStudentSuccessScore } from '../engine/scoringEngine';
import { INITIAL_STUDENTS } from '../data/initialStudents';

describe('Training & Placement Officer (TPO) Platform Models & Data', () => {
  it('loads valid TPO profile configuration', () => {
    expect(DEMO_TPO_OFFICER.name).toBe('Prof. Vikram Malhotra');
    expect(DEMO_TPO_OFFICER.email).toBe('tpo@edupulse.edu');
    expect(DEMO_TPO_OFFICER.avatar_initials).toBe('VM');
  });

  it('contains registered campus placement drives across multiple tiers', () => {
    expect(DEMO_PLACEMENT_DRIVES.length).toBeGreaterThan(0);
    const superDreamDrives = DEMO_PLACEMENT_DRIVES.filter(d => d.tier === 'Super Dream');
    expect(superDreamDrives.length).toBeGreaterThanOrEqual(2);
    expect(superDreamDrives.some(d => d.company === 'Microsoft' && d.ctc >= 40)).toBe(true);
  });

  it('contains active placement training bootcamps with valid progress metrics', () => {
    expect(DEMO_TRAINING_MODULES.length).toBeGreaterThan(0);
    const dsaModule = DEMO_TRAINING_MODULES.find(m => m.category === 'Coding & DSA');
    expect(dsaModule).toBeDefined();
    expect(dsaModule?.attendanceRate).toBeGreaterThan(80);
  });

  it('contains appointment-letter verified placement offers', () => {
    expect(DEMO_PLACEMENT_OFFERS.length).toBeGreaterThan(0);
    expect(DEMO_PLACEMENT_OFFERS.every(o => o.ctc > 0)).toBe(true);
    const highestOffer = Math.max(...DEMO_PLACEMENT_OFFERS.map(o => o.ctc));
    expect(highestOffer).toBeGreaterThanOrEqual(44.0);
  });

  it('correctly filters eligible candidates using dynamic recruiter screening criteria', () => {
    const minCgpa = 7.5;
    const maxBacklogs = 0;
    const minCoding = 50;

    const screened = INITIAL_STUDENTS.filter(st => {
      const cgpa = st.academic.cgpa ?? 0;
      const backlogs = st.academic.backlogs ?? 0;
      const coding = st.placement.coding_score ?? 0;
      return cgpa >= minCgpa && backlogs <= maxBacklogs && coding >= minCoding;
    });

    expect(screened.length).toBeGreaterThan(0);
    expect(screened.every(s => (s.academic.cgpa ?? 0) >= minCgpa)).toBe(true);
    expect(screened.every(s => (s.academic.backlogs ?? 0) <= maxBacklogs)).toBe(true);
  });

  // ── NEW FEATURE TESTS: Student Academics, Success & Opportunity Allocation ──
  it('loads valid opportunity catalog with varied corporate drives, internships and bootcamps', () => {
    expect(DEMO_OPPORTUNITIES_CATALOG.length).toBeGreaterThanOrEqual(8);
    const superDreamOpps = DEMO_OPPORTUNITIES_CATALOG.filter(o => o.tier === 'Super Dream');
    expect(superDreamOpps.length).toBeGreaterThanOrEqual(3);

    const internships = DEMO_OPPORTUNITIES_CATALOG.filter(o => o.type === 'Elite Summer Internship');
    expect(internships.length).toBeGreaterThanOrEqual(2);

    const bootcamps = DEMO_OPPORTUNITIES_CATALOG.filter(o => o.type === 'Pre-Placement Fast-track Bootcamp');
    expect(bootcamps.length).toBeGreaterThanOrEqual(1);

    const deanReferral = DEMO_OPPORTUNITIES_CATALOG.find(o => o.type === 'Dean TPO Corporate Referral');
    expect(deanReferral).toBeDefined();
  });

  it('contains pre-seeded student opportunity allocations with verified statuses', () => {
    expect(INITIAL_STUDENT_OPPORTUNITY_ALLOCATIONS.length).toBeGreaterThan(0);
    expect(INITIAL_STUDENT_OPPORTUNITY_ALLOCATIONS.every(a => Boolean(a.studentId && a.opportunityTitle))).toBe(true);
    expect(INITIAL_STUDENT_OPPORTUNITY_ALLOCATIONS.some(a => a.status === 'Offer Extended')).toBe(true);
    expect(INITIAL_STUDENT_OPPORTUNITY_ALLOCATIONS.some(a => a.status === 'Shortlisted')).toBe(true);
  });

  it('matches high-academic student with top Super Dream opportunities with high compatibility', () => {
    // Find a student with strong academics (CGPA >= 8.0, 0 backlogs, high coding)
    const topStudent = INITIAL_STUDENTS.find(
      s => (s.academic.cgpa ?? 0) >= 8.5 && (s.academic.backlogs ?? 0) === 0
    );
    expect(topStudent).toBeDefined();

    const microsoftDrive = DEMO_OPPORTUNITIES_CATALOG.find(o => o.companyOrPartner === 'Microsoft');
    expect(microsoftDrive).toBeDefined();

    if (topStudent && microsoftDrive) {
      const match = matchStudentToOpportunity(topStudent, microsoftDrive);
      expect(match.matchScore).toBeGreaterThanOrEqual(75);
      expect(match.matchReasons.length).toBeGreaterThan(0);
      expect(match.matchReasons.some(r => r.includes('CGPA') || r.includes('discipline'))).toBe(true);
    }
  });

  it('identifies backlog gap warnings for students who do not meet zero-backlog criteria', () => {
    const studentWithBacklogs = INITIAL_STUDENTS.find(s => (s.academic.backlogs ?? 0) > 0);
    expect(studentWithBacklogs).toBeDefined();

    const strictSuperDream = DEMO_OPPORTUNITIES_CATALOG.find(o => o.maxBacklogs === 0);
    expect(strictSuperDream).toBeDefined();

    if (studentWithBacklogs && strictSuperDream) {
      const match = matchStudentToOpportunity(studentWithBacklogs, strictSuperDream);
      expect(match.isEligible).toBe(false);
      expect(match.gapWarnings.some(w => w.includes('backlog'))).toBe(true);
    }
  });

  it('evaluates student success score alongside academics for holistic opportunity recommendation', () => {
    const candidate = INITIAL_STUDENTS[0];
    const successResult = calculateStudentSuccessScore(candidate);
    expect(successResult.final_score).toBeGreaterThan(0);
    expect(successResult.components.academic.score).toBeDefined();
    expect(successResult.components.placement.score).toBeDefined();
  });
});

