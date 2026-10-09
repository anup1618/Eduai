import { UnifiedStudent } from '../types/student';
import { PlacementRiskResult, PlacementRiskThresholds, TriggeredRule, RiskLevel } from '../types/risk';

export const DEFAULT_PLACEMENT_THRESHOLDS: PlacementRiskThresholds = {
  min_aptitude_score: 60,
  min_coding_score: 50,
  min_mock_interview_score: 55,
  min_technical_skill: 55,
  min_soft_skill: 50,
};

/**
 * Deterministic Placement Readiness and Risk Engine
 * Computes placement readiness index, detects structural skill gaps (e.g., strong academics
 * but low coding aptitude), and provides transparent rule-based risk classification.
 */
export function evaluatePlacementRisk(
  student: UnifiedStudent,
  thresholds: PlacementRiskThresholds = DEFAULT_PLACEMENT_THRESHOLDS
): PlacementRiskResult {
  const triggeredRules: TriggeredRule[] = [];
  const patterns: string[] = [];
  const evidenceSummary: string[] = [];
  const suggestedNextSteps: string[] = [];

  const { aptitude_score, coding_score, mock_interview_score, placement_preparation_participation } = student.placement;
  const { technical_skill_score, soft_skill_score } = student.skills;
  const { cgpa } = student.academic;

  // Check how many placement metrics exist
  const placementMetrics = [aptitude_score, coding_score, mock_interview_score].filter(v => v !== null);
  const skillMetrics = [technical_skill_score, soft_skill_score].filter(v => v !== null);

  if (placementMetrics.length === 0 && skillMetrics.length === 0) {
    return {
      risk_level: 'Insufficient Data',
      readiness_score: null,
      patterns: ['Incomplete Placement Assessments: No aptitude, coding, or interview records found.'],
      triggered_rules: [],
      evidence_summary: ['Student has not yet completed placement diagnostic assessments.'],
      suggested_next_steps: ['Enroll student in the diagnostic placement readiness test suite.'],
    };
  }

  // Calculate composite placement readiness score from available values
  // Aptitude: 25%, Coding: 35%, Mock: 20%, Tech Skill: 10%, Soft Skill: 10%
  const components = [
    { val: aptitude_score, weight: 0.25, label: 'Aptitude' },
    { val: coding_score, weight: 0.35, label: 'Coding' },
    { val: mock_interview_score, weight: 0.20, label: 'Mock Interview' },
    { val: technical_skill_score, weight: 0.10, label: 'Technical Skills' },
    { val: soft_skill_score, weight: 0.10, label: 'Soft Skills' },
  ].filter(c => c.val !== null);

  let readinessScore: number | null = null;
  if (components.length > 0) {
    const totalW = components.reduce((acc, c) => acc + c.weight, 0);
    const weightedSum = components.reduce((acc, c) => acc + (c.val as number) * c.weight, 0);
    readinessScore = Math.round((weightedSum / totalW) * 10) / 10;
  }

  // Check for Pattern: Strong Academics but Low Placement Readiness
  const isHighAcademic = cgpa !== null && cgpa >= 7.5;
  const isLowPlacement = readinessScore !== null && readinessScore < 60;
  if (isHighAcademic && isLowPlacement) {
    patterns.push('High Academic Performer with Low Placement Readiness');
    evidenceSummary.push(`High CGPA (${cgpa.toFixed(2)}) contrasts with low placement readiness (${readinessScore}/100).`);
    suggestedNextSteps.push('Provide targeted technical interview coaching and coding bootcamp.');
  }

  // 1. Aptitude Evaluation
  if (aptitude_score !== null) {
    if (aptitude_score < thresholds.min_aptitude_score) {
      const isCritical = aptitude_score < 45;
      triggeredRules.push({
        id: 'PLACE-RULE-APT-LOW',
        rule_name: isCritical ? 'Critical Aptitude Deficit' : 'Aptitude Benchmark Missed',
        category: 'Placement',
        actual_value: `${aptitude_score}/100`,
        threshold: `< ${thresholds.min_aptitude_score}`,
        severity: isCritical ? 'High' : 'Moderate',
        evidence: `Quantitative & verbal aptitude score (${aptitude_score}/100) is below recruiter screening cutoffs.`,
        suggested_action: 'Enroll in quantitative aptitude and logical reasoning crash modules.',
      });
      evidenceSummary.push(`Aptitude test score (${aptitude_score}) needs improvement.`);
      suggestedNextSteps.push('Join weekly aptitude practice drills');
    }
  }

  // 2. Coding Evaluation
  if (coding_score !== null) {
    if (coding_score < thresholds.min_coding_score) {
      const isCritical = coding_score < 40;
      triggeredRules.push({
        id: 'PLACE-RULE-CODE-LOW',
        rule_name: isCritical ? 'Critical Coding Skill Gap' : 'Coding Benchmark Below Cutoff',
        category: 'Placement',
        actual_value: `${coding_score}/100`,
        threshold: `< ${thresholds.min_coding_score}`,
        severity: isCritical ? 'High' : 'Moderate',
        evidence: `Data structures & algorithmic coding score is ${coding_score}/100, impacting technical screening success.`,
        suggested_action: 'Recommend hands-on DSA problem-solving track on campus practice portal.',
      });
      patterns.push('Weak Coding Performance');
      evidenceSummary.push(`Coding assessment score (${coding_score}/100) requires intensive practice.`);
      suggestedNextSteps.push('Assign DSA coding challenges & mentor review');
    }
  }

  // 3. Mock Interview Evaluation
  if (mock_interview_score !== null) {
    if (mock_interview_score < thresholds.min_mock_interview_score) {
      triggeredRules.push({
        id: 'PLACE-RULE-INTERVIEW-LOW',
        rule_name: 'Mock Interview Performance Gap',
        category: 'Placement',
        actual_value: `${mock_interview_score}/100`,
        threshold: `< ${thresholds.min_mock_interview_score}`,
        severity: 'Moderate',
        evidence: `Mock interview evaluation scored ${mock_interview_score}/100 in communication, behavioral, and domain responses.`,
        suggested_action: 'Schedule 1-on-1 mock interview with corporate alumni panel.',
      });
      evidenceSummary.push(`Mock interview score is ${mock_interview_score}/100.`);
      suggestedNextSteps.push('Participate in alumni-led mock interview sessions');
    }
  }

  // 4. Placement Training Participation
  if (placement_preparation_participation === false) {
    triggeredRules.push({
      id: 'PLACE-RULE-PREP-ABSENT',
      rule_name: 'Placement Training Absence',
      category: 'Placement',
      actual_value: 'Not Attending',
      threshold: 'Mandatory',
      severity: 'Moderate',
      evidence: 'Student has not registered or attended scheduled campus recruitment training programs.',
      suggested_action: 'Contact student to ensure attendance in pre-placement workshops.',
    });
    suggestedNextSteps.push('Ensure registration in campus training workshops');
  }

  // 5. Incomplete assessment check
  const missingAssessments: string[] = [];
  if (aptitude_score === null) missingAssessments.push('Aptitude Test');
  if (coding_score === null) missingAssessments.push('Coding Assessment');
  if (mock_interview_score === null) missingAssessments.push('Mock Interview');

  if (missingAssessments.length > 0) {
    patterns.push(`Incomplete Placement Assessments (${missingAssessments.join(', ')})`);
    evidenceSummary.push(`Assessment gaps: Pending ${missingAssessments.join(', ')}.`);
  }

  // Determine Risk Level
  let riskLevel: RiskLevel = 'Low';
  const highSev = triggeredRules.filter(r => r.severity === 'High').length;
  const modSev = triggeredRules.filter(r => r.severity === 'Moderate').length;

  if (readinessScore !== null && readinessScore < 50) {
    riskLevel = 'High';
  } else if (highSev >= 2 || (readinessScore !== null && readinessScore < 60)) {
    riskLevel = 'High';
  } else if (highSev >= 1 || modSev >= 2 || (readinessScore !== null && readinessScore < 70)) {
    riskLevel = 'Moderate';
  } else {
    riskLevel = 'Low';
  }

  if (suggestedNextSteps.length === 0) {
    suggestedNextSteps.push('Maintain active participation in company-specific mock drives.');
  }

  return {
    risk_level: riskLevel,
    readiness_score: readinessScore,
    patterns: patterns,
    triggered_rules: triggeredRules,
    evidence_summary: evidenceSummary.length > 0 ? evidenceSummary : ['Candidate displays strong readiness indicators for corporate recruitment.'],
    suggested_next_steps: suggestedNextSteps,
  };
}
