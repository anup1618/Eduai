import { UnifiedStudent } from '../types/student';
import { ScoreWeights, SuccessScoreResult } from '../types/scoring';
import { calculateStudentSuccessScore } from './scoringEngine';
import { evaluateAcademicRisk } from './academicRiskEngine';
import { evaluatePlacementRisk } from './placementRiskEngine';
import { AcademicRiskResult, PlacementRiskResult } from '../types/risk';

export interface WhatIfAdjustments {
  attendance?: number;
  internal_marks?: number;
  assignment_completion?: number;
  aptitude_score?: number;
  coding_score?: number;
  mock_interview_score?: number;
}

export interface WhatIfSimulationResult {
  originalScore: SuccessScoreResult;
  simulatedScore: SuccessScoreResult;
  scoreDelta: number;
  originalAcademicRisk: AcademicRiskResult;
  simulatedAcademicRisk: AcademicRiskResult;
  originalPlacementRisk: PlacementRiskResult;
  simulatedPlacementRisk: PlacementRiskResult;
  componentDeltas: {
    academic: number;
    attendance: number;
    lms: number;
    placement: number;
  };
  keyTakeaways: string[];
}

/**
 * Deterministic What-If Simulation Engine
 * Creates a hypothetical student projection by cloning and applying adjustments,
 * then executing the identical deterministic scoring and risk calculation pipelines.
 */
export function simulateWhatIfScenario(
  student: UnifiedStudent,
  adjustments: WhatIfAdjustments,
  weights?: ScoreWeights
): WhatIfSimulationResult {
  // 1. Calculate original results
  const originalScore = calculateStudentSuccessScore(student, weights);
  const originalAcademicRisk = evaluateAcademicRisk(student);
  const originalPlacementRisk = evaluatePlacementRisk(student);

  // 2. Clone student and apply adjustments
  const simulatedStudent: UnifiedStudent = JSON.parse(JSON.stringify(student));

  if (adjustments.attendance !== undefined) {
    simulatedStudent.attendance.overall_attendance = adjustments.attendance;
  }
  if (adjustments.internal_marks !== undefined) {
    simulatedStudent.academic.internal_marks = adjustments.internal_marks;
  }
  if (adjustments.assignment_completion !== undefined) {
    simulatedStudent.lms.assignment_completion = adjustments.assignment_completion;
  }
  if (adjustments.aptitude_score !== undefined) {
    simulatedStudent.placement.aptitude_score = adjustments.aptitude_score;
  }
  if (adjustments.coding_score !== undefined) {
    simulatedStudent.placement.coding_score = adjustments.coding_score;
  }
  if (adjustments.mock_interview_score !== undefined) {
    simulatedStudent.placement.mock_interview_score = adjustments.mock_interview_score;
  }

  // 3. Re-evaluate using identical engines
  const simulatedScore = calculateStudentSuccessScore(simulatedStudent, weights);
  const simulatedAcademicRisk = evaluateAcademicRisk(simulatedStudent);
  const simulatedPlacementRisk = evaluatePlacementRisk(simulatedStudent);

  const origScoreVal = originalScore.final_score ?? 0;
  const simScoreVal = simulatedScore.final_score ?? 0;
  const scoreDelta = Math.round((simScoreVal - origScoreVal) * 10) / 10;

  const getScoreDiff = (key: 'academic' | 'attendance' | 'lms' | 'placement') => {
    const orig = originalScore.components[key]?.score ?? 0;
    const sim = simulatedScore.components[key]?.score ?? 0;
    return Math.round((sim - orig) * 10) / 10;
  };

  const keyTakeaways: string[] = [];
  if (scoreDelta > 0) {
    keyTakeaways.push(`Success score projected to increase by +${scoreDelta} points.`);
  } else if (scoreDelta < 0) {
    keyTakeaways.push(`Success score projected to decrease by ${scoreDelta} points.`);
  } else {
    keyTakeaways.push('No net change in composite score with these parameters.');
  }

  if (originalAcademicRisk.risk_level !== simulatedAcademicRisk.risk_level) {
    keyTakeaways.push(`Academic risk status shifts from ${originalAcademicRisk.risk_level} to ${simulatedAcademicRisk.risk_level}.`);
  }

  if (originalPlacementRisk.risk_level !== simulatedPlacementRisk.risk_level) {
    keyTakeaways.push(`Placement risk status shifts from ${originalPlacementRisk.risk_level} to ${simulatedPlacementRisk.risk_level}.`);
  }

  return {
    originalScore,
    simulatedScore,
    scoreDelta,
    originalAcademicRisk,
    simulatedAcademicRisk,
    originalPlacementRisk,
    simulatedPlacementRisk,
    componentDeltas: {
      academic: getScoreDiff('academic'),
      attendance: getScoreDiff('attendance'),
      lms: getScoreDiff('lms'),
      placement: getScoreDiff('placement'),
    },
    keyTakeaways,
  };
}
