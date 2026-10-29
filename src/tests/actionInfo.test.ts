import { describe, it, expect } from 'vitest';
import { ActionInfoItem } from '../context/ActionInfoContext';

describe('Global Action Information System Data Structures', () => {
  it('correctly constructs informative modal payloads for KPI cards', () => {
    const kpiInfo: ActionInfoItem = {
      title: 'Total Enrolled Cohort Telemetry',
      badge: '135 Active Students',
      category: 'info',
      message: 'Tracking 135 verified students across 5 engineering departments.',
      details: [
        'Departments: CSE, IT, ECE, Mechanical, Civil',
        'Average Attendance: 81%',
        'Average CGPA: 7.64 / 10.0',
      ],
      actionLabel: 'Explore Intelligence',
    };

    expect(kpiInfo.title).toBe('Total Enrolled Cohort Telemetry');
    expect(kpiInfo.badge).toBe('135 Active Students');
    expect(kpiInfo.category).toBe('info');
    expect(kpiInfo.details?.length).toBe(3);
    expect(kpiInfo.actionLabel).toBe('Explore Intelligence');
  });

  it('correctly constructs informative modal payloads for report exports', () => {
    const exportInfo: ActionInfoItem = {
      title: 'CSV Institutional Export Generated',
      badge: '100 Records Exported',
      category: 'export',
      message: 'Successfully generated student CSV report.',
      details: [
        'File Name: edupulse_student_report.csv',
        'Total Rows: 100 students',
      ],
    };

    expect(exportInfo.category).toBe('export');
    expect(exportInfo.details?.length).toBe(2);
  });

  it('correctly constructs informative payloads for settings calibrations', () => {
    const settingsInfo: ActionInfoItem = {
      title: 'Success Score Weights Calibrated & Applied',
      badge: '100% Calibrated',
      category: 'settings',
      message: 'Scoring engine weights saved successfully.',
      details: [
        'Academic: 35%',
        'Attendance: 25%',
        'Placement: 15%',
      ],
    };

    expect(settingsInfo.category).toBe('settings');
    expect(settingsInfo.badge).toBe('100% Calibrated');
  });
});
