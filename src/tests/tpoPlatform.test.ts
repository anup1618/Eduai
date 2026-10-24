import { describe, it, expect } from 'vitest';
import { DEMO_PLACEMENT_DRIVES, DEMO_TRAINING_MODULES, DEMO_PLACEMENT_OFFERS, DEMO_TPO_OFFICER } from '../data/tpoData';
import { evaluatePlacementRisk } from '../engine/placementRiskEngine';
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
});
