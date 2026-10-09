import { UnifiedStudent } from '../types/student';
import { AcademicRiskResult, AcademicRiskThresholds, TriggeredRule, RiskLevel } from '../types/risk';

export const DEFAULT_ACADEMIC_THRESHOLDS: AcademicRiskThresholds = {
  min_attendance_low: 75,
  min_attendance_critical: 65,
  min_cgpa_low: 6.5,
  min_cgpa_critical: 5.5,
  max_acceptable_backlogs: 0,
  min_internal_marks_critical: 50,
  min_assignment_completion_critical: 50,
};

/**
 * Deterministic Academic Risk Engine
 * Evaluates multiple academic risk rules with transparent threshold checking,
 * evidence logging, and prescriptive interventions.
 */
export function evaluateAcademicRisk(
  student: UnifiedStudent,
  thresholds: AcademicRiskThresholds = DEFAULT_ACADEMIC_THRESHOLDS
): AcademicRiskResult {
  const triggeredRules: TriggeredRule[] = [];
  const evidenceSummary: string[] = [];
  const suggestedNextSteps: string[] = [];

  const { cgpa, internal_marks, backlogs } = student.academic;
  const { overall_attendance } = student.attendance;
  const { assignment_completion } = student.lms;

  // Check if minimum data exists to evaluate academic risk
  const hasAcademicData = cgpa !== null || internal_marks !== null;
  const hasAttendanceData = overall_attendance !== null;

  if (!hasAcademicData && !hasAttendanceData) {
    return {
      risk_level: 'Insufficient Data',
      risk_score: 0,
      triggered_rules: [],
      evidence_summary: ['Academic and attendance metrics are unrecorded for this student.'],
      suggested_next_steps: ['Upload student transcript and semester attendance roster in Data Integration.'],
    };
  }

  let highSeverityCount = 0;
  let moderateSeverityCount = 0;
  let riskScore = 0;

  // 1. Attendance Check
  if (overall_attendance !== null) {
    if (overall_attendance < thresholds.min_attendance_critical) {
      triggeredRules.push({
        id: 'ACAD-RULE-ATT-CRIT',
        rule_name: 'Critical Attendance Deficit',
        category: 'Attendance',
        actual_value: `${overall_attendance.toFixed(1)}%`,
        threshold: `< ${thresholds.min_attendance_critical}%`,
        severity: 'High',
        evidence: `Attendance is at ${overall_attendance.toFixed(1)}%, well below the institutional threshold of ${thresholds.min_attendance_critical}%. Student is at risk of exam debarment.`,
        suggested_action: 'Initiate mandatory attendance counseling and notify academic proctor.',
      });
      highSeverityCount += 2;
      riskScore += 35;
      evidenceSummary.push(`Attendance deficit (${overall_attendance.toFixed(1)}%) requires urgent dean approval.`);
      suggestedNextSteps.push('Schedule attendance counseling session with academic advisor');
    } else if (overall_attendance < thresholds.min_attendance_low) {
      triggeredRules.push({
        id: 'ACAD-RULE-ATT-WARN',
        rule_name: 'Attendance Warning Borderline',
        category: 'Attendance',
        actual_value: `${overall_attendance.toFixed(1)}%`,
        threshold: `< ${thresholds.min_attendance_low}%`,
        severity: 'Moderate',
        evidence: `Attendance is ${overall_attendance.toFixed(1)}%, hovering below the recommended 75% threshold.`,
        suggested_action: 'Send automated attendance alert to student and course mentors.',
      });
      moderateSeverityCount += 1;
      riskScore += 15;
      evidenceSummary.push(`Borderline attendance (${overall_attendance.toFixed(1)}%) may slip below threshold.`);
    }
  }

  // 2. Backlogs Check
  if (backlogs !== null && backlogs > thresholds.max_acceptable_backlogs) {
    if (backlogs >= 2) {
      triggeredRules.push({
        id: 'ACAD-RULE-BACKLOG-MULTI',
        rule_name: 'Multiple Active Backlogs',
        category: 'Academic',
        actual_value: `${backlogs} backlogs`,
        threshold: `> 1 backlog`,
        severity: 'High',
        evidence: `Student holds ${backlogs} uncleared subject backlogs, impeding degree progression.`,
        suggested_action: 'Assign remedial coaching and subject-specific tutoring plan.',
      });
      highSeverityCount += 2;
      riskScore += 30;
      evidenceSummary.push(`Multiple backlogs (${backlogs}) create severe academic strain.`);
      suggestedNextSteps.push('Enroll in subject remedial classes for active arrears');
    } else {
      triggeredRules.push({
        id: 'ACAD-RULE-BACKLOG-SINGLE',
        rule_name: 'Single Active Backlog',
        category: 'Academic',
        actual_value: '1 backlog',
        threshold: '> 0 backlogs',
        severity: 'Moderate',
        evidence: 'Student has 1 pending backlog to clear in the upcoming supplementary examination.',
        suggested_action: 'Monitor re-sit exam preparation schedule.',
      });
      moderateSeverityCount += 1;
      riskScore += 15;
      evidenceSummary.push('1 uncleared backlog registered.');
    }
  }

  // 3. CGPA Check
  if (cgpa !== null) {
    if (cgpa < thresholds.min_cgpa_critical) {
      triggeredRules.push({
        id: 'ACAD-RULE-CGPA-CRIT',
        rule_name: 'Critical Grade Point Deficit',
        category: 'Academic',
        actual_value: `CGPA ${cgpa.toFixed(2)}`,
        threshold: `< ${thresholds.min_cgpa_critical}`,
        severity: 'High',
        evidence: `Cumulative GPA (${cgpa.toFixed(2)}) is below minimum academic standing (${thresholds.min_cgpa_critical}).`,
        suggested_action: 'Place student on formal academic probation and mentor review.',
      });
      highSeverityCount += 2;
      riskScore += 30;
      evidenceSummary.push(`CGPA (${cgpa.toFixed(2)}) falls below minimum good standing.`);
      suggestedNextSteps.push('Set up weekly 1-on-1 faculty mentoring sessions');
    } else if (cgpa < thresholds.min_cgpa_low) {
      triggeredRules.push({
        id: 'ACAD-RULE-CGPA-WARN',
        rule_name: 'Low Cumulative GPA',
        category: 'Academic',
        actual_value: `CGPA ${cgpa.toFixed(2)}`,
        threshold: `< ${thresholds.min_cgpa_low}`,
        severity: 'Moderate',
        evidence: `Cumulative GPA (${cgpa.toFixed(2)}) is below the median institutional target of ${thresholds.min_cgpa_low}.`,
        suggested_action: 'Provide academic study skills and peer study group assignment.',
      });
      moderateSeverityCount += 1;
      riskScore += 15;
    }
  }

  // 4. Internal Assessment Marks
  if (internal_marks !== null && internal_marks < thresholds.min_internal_marks_critical) {
    triggeredRules.push({
      id: 'ACAD-RULE-INTERNAL-FAIL',
      rule_name: 'Low Continuous Assessment Score',
      category: 'Academic',
      actual_value: `${internal_marks}%`,
      threshold: `< ${thresholds.min_internal_marks_critical}%`,
      severity: 'Moderate',
      evidence: `Internal continuous assessment (${internal_marks}%) indicates potential risk of failing end-semester exams.`,
      suggested_action: 'Conduct mid-term revision and diagnostic test.',
    });
    moderateSeverityCount += 1;
    riskScore += 15;
    evidenceSummary.push(`Low internal assessment score (${internal_marks}%).`);
  }

  // 5. Assignment Completion
  if (assignment_completion !== null && assignment_completion < thresholds.min_assignment_completion_critical) {
    triggeredRules.push({
      id: 'ACAD-RULE-ASSIGN-DROP',
      rule_name: 'Poor Assignment Submission Rate',
      category: 'LMS',
      actual_value: `${assignment_completion}%`,
      threshold: `< ${thresholds.min_assignment_completion_critical}%`,
      severity: 'Moderate',
      evidence: `Assignment completion rate is ${assignment_completion}%, demonstrating low coursework submission.`,
      suggested_action: 'Assign academic assistant to follow up on pending submissions.',
    });
    moderateSeverityCount += 1;
    riskScore += 10;
  }

  // Determine overall risk level
  let riskLevel: RiskLevel = 'Low';
  if (highSeverityCount >= 2 || (highSeverityCount >= 1 && moderateSeverityCount >= 2) || riskScore >= 50) {
    riskLevel = 'High';
  } else if (highSeverityCount >= 1 || moderateSeverityCount >= 2 || riskScore >= 25) {
    riskLevel = 'Moderate';
  }

  if (suggestedNextSteps.length === 0) {
    suggestedNextSteps.push('Maintain current performance track; conduct standard end-term progress review.');
  }

  return {
    risk_level: riskLevel,
    risk_score: Math.min(100, riskScore),
    triggered_rules: triggeredRules,
    evidence_summary: evidenceSummary.length > 0 ? evidenceSummary : ['Student exhibits consistent academic progress within institutional standards.'],
    suggested_next_steps: suggestedNextSteps,
  };
}
