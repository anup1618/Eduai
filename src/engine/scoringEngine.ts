import { UnifiedStudent } from '../types/student';
import { ScoreWeights, SuccessScoreResult, ComponentBreakdown } from '../types/scoring';

export const DEFAULT_WEIGHTS: ScoreWeights = {
  academic: 30,
  attendance: 20,
  lms: 15,
  placement: 20,
  skills: 10,
  engagement: 5,
};

/**
 * Deterministic Student Success Score Engine
 * Computes unified success score (0-100) with explainable component breakdowns,
 * transparent missing-data handling, and dynamic weight re-normalization.
 */
export function calculateStudentSuccessScore(
  student: UnifiedStudent,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): SuccessScoreResult {
  const positiveIndicators: string[] = [];
  const areasNeedingAttention: string[] = [];

  // 1. ACADEMIC COMPONENT (Default weight: 30%)
  // Formula: 70% CGPA (normalized 0-100) + 30% Internal Marks, with backlog penalty (-5 pts per backlog)
  let academicScore: number | null = null;
  let academicNotes = '';
  const { cgpa, internal_marks, backlogs } = student.academic;

  if (cgpa !== null || internal_marks !== null) {
    if (cgpa !== null && internal_marks !== null) {
      const normalizedCgpa = (cgpa / 10) * 100;
      let base = 0.7 * normalizedCgpa + 0.3 * internal_marks;
      const backlogCount = backlogs ?? 0;
      if (backlogCount > 0) {
        const penalty = backlogCount * 5;
        base = Math.max(0, base - penalty);
        academicNotes = `70% CGPA (${cgpa.toFixed(2)}) + 30% Internals (${internal_marks}%) with -${penalty} backlog penalty (${backlogCount} backlogs)`;
        areasNeedingAttention.push(`Active backlogs: ${backlogCount}`);
      } else {
        academicNotes = `70% CGPA (${cgpa.toFixed(2)}) + 30% Internals (${internal_marks}%) [No backlogs]`;
      }
      academicScore = Math.min(100, Math.max(0, Math.round(base * 10) / 10));
    } else if (cgpa !== null) {
      const base = (cgpa / 10) * 100 - (backlogs ?? 0) * 5;
      academicScore = Math.min(100, Math.max(0, Math.round(base * 10) / 10));
      academicNotes = `Derived purely from CGPA (${cgpa.toFixed(2)}) as internals are missing`;
    } else if (internal_marks !== null) {
      const base = internal_marks - (backlogs ?? 0) * 5;
      academicScore = Math.min(100, Math.max(0, Math.round(base * 10) / 10));
      academicNotes = `Derived from internal marks (${internal_marks}%) as CGPA is missing`;
    }

    if (academicScore !== null) {
      if (academicScore >= 80) positiveIndicators.push(`Strong academic record (${academicScore.toFixed(1)}/100)`);
      else if (academicScore < 60) areasNeedingAttention.push(`Academic score needs improvement (${academicScore.toFixed(1)}/100)`);
    }
  } else {
    academicNotes = 'Missing academic performance data';
  }

  // 2. ATTENDANCE COMPONENT (Default weight: 20%)
  // Formula: Overall attendance percentage (0-100)
  let attendanceScore: number | null = null;
  let attendanceNotes = '';
  if (student.attendance.overall_attendance !== null) {
    attendanceScore = Math.min(100, Math.max(0, student.attendance.overall_attendance));
    attendanceNotes = `Overall verified attendance: ${attendanceScore.toFixed(1)}%`;
    if (attendanceScore >= 85) positiveIndicators.push(`Consistent attendance (${attendanceScore.toFixed(1)}%)`);
    else if (attendanceScore < 75) areasNeedingAttention.push(`Low attendance (${attendanceScore.toFixed(1)}%, below 75% threshold)`);
  } else {
    attendanceNotes = 'Attendance record not yet uploaded';
  }

  // 3. LMS PARTICIPATION (Default weight: 15%)
  // Formula: 50% LMS activity index (capped at 30 logins/month = 100%) + 50% Assignment completion
  let lmsScore: number | null = null;
  let lmsNotes = '';
  const { lms_logins, assignment_completion } = student.lms;

  if (lms_logins !== null || assignment_completion !== null) {
    if (lms_logins !== null && assignment_completion !== null) {
      const normalizedLogins = Math.min(100, (lms_logins / 30) * 100);
      const composite = 0.5 * normalizedLogins + 0.5 * assignment_completion;
      lmsScore = Math.min(100, Math.max(0, Math.round(composite * 10) / 10));
      lmsNotes = `50% Portal Logins (${lms_logins}/mo benchmark 30) + 50% Assignment Completion (${assignment_completion}%)`;
    } else if (assignment_completion !== null) {
      lmsScore = assignment_completion;
      lmsNotes = `Assignment completion rate (${assignment_completion}%) [Logins unrecorded]`;
    } else if (lms_logins !== null) {
      lmsScore = Math.min(100, Math.round((lms_logins / 30) * 100));
      lmsNotes = `Portal activity index based on ${lms_logins} logins [Assignments pending]`;
    }

    if (lmsScore !== null) {
      if (lmsScore >= 80) positiveIndicators.push(`Active LMS engagement (${lmsScore.toFixed(1)}/100)`);
      else if (lmsScore < 60) areasNeedingAttention.push(`Low LMS engagement & assignment completion (${lmsScore.toFixed(1)}/100)`);
    }
  } else {
    lmsNotes = 'LMS telemetry data missing';
  }

  // 4. ENGAGEMENT (Default weight: 10%)
  // Formula: Bounded composite: events (10 pts each, cap 30) + clubs (15 pts each, cap 30) + hackathons (20 pts each, cap 40) + certs (20 pts each, cap 40), total max 100
  let engagementScore: number | null = null;
  let engagementNotes = '';
  const { events_participated, club_participation, hackathons, certifications } = student.engagement;

  const hasEngagementData = events_participated !== null || club_participation !== null || hackathons !== null || certifications !== null;
  if (hasEngagementData) {
    const ev = Math.min(30, (events_participated ?? 0) * 10);
    const cl = Math.min(30, (club_participation ?? 0) * 15);
    const hk = Math.min(40, (hackathons ?? 0) * 20);
    const ct = Math.min(40, (certifications ?? 0) * 20);
    const total = Math.min(100, ev + cl + hk + ct);
    engagementScore = total;
    engagementNotes = `Campus events: ${events_participated ?? 0}, Clubs: ${club_participation ?? 0}, Hackathons: ${hackathons ?? 0}, Certifications: ${certifications ?? 0}`;
    if (engagementScore >= 60) positiveIndicators.push(`Strong co-curricular participation (${engagementScore}/100)`);
    else if (engagementScore < 30) areasNeedingAttention.push(`Minimal co-curricular & certification involvement`);
  } else {
    engagementNotes = 'Co-curricular participation unrecorded';
  }

  // 5. PLACEMENT READINESS (Default weight: 15%)
  // Formula: 30% Aptitude + 40% Coding + 30% Mock Interview
  let placementScore: number | null = null;
  let placementNotes = '';
  const { aptitude_score, coding_score, mock_interview_score } = student.placement;

  const validPlacementMetrics = [
    { val: aptitude_score, w: 0.3, label: 'Aptitude' },
    { val: coding_score, w: 0.4, label: 'Coding' },
    { val: mock_interview_score, w: 0.3, label: 'Mock Interview' },
  ].filter(m => m.val !== null);

  if (validPlacementMetrics.length > 0) {
    const totalWeight = validPlacementMetrics.reduce((sum, m) => sum + m.w, 0);
    const weightedSum = validPlacementMetrics.reduce((sum, m) => sum + (m.val as number) * m.w, 0);
    placementScore = Math.min(100, Math.max(0, Math.round((weightedSum / totalWeight) * 10) / 10));
    placementNotes = validPlacementMetrics.map(m => `${m.label}: ${m.val}`).join(' | ');

    if (placementScore >= 75) positiveIndicators.push(`High placement readiness (${placementScore.toFixed(1)}/100)`);
    else if (placementScore < 55) areasNeedingAttention.push(`Placement assessment scores below benchmark (${placementScore.toFixed(1)}/100)`);
  } else {
    placementNotes = 'No placement assessments recorded yet';
  }

  // 6. SKILLS ASSESSMENT (Default weight: 10%)
  // Formula: 60% Technical + 40% Soft Skills
  let skillsScore: number | null = null;
  let skillsNotes = '';
  const { technical_skill_score, soft_skill_score } = student.skills;

  if (technical_skill_score !== null || soft_skill_score !== null) {
    if (technical_skill_score !== null && soft_skill_score !== null) {
      skillsScore = Math.round((0.6 * technical_skill_score + 0.4 * soft_skill_score) * 10) / 10;
      skillsNotes = `60% Tech (${technical_skill_score}/100) + 40% Soft Skills (${soft_skill_score}/100)`;
    } else if (technical_skill_score !== null) {
      skillsScore = technical_skill_score;
      skillsNotes = `Technical skills (${technical_skill_score}/100) [Soft skills pending]`;
    } else if (soft_skill_score !== null) {
      skillsScore = soft_skill_score;
      skillsNotes = `Soft skills assessment (${soft_skill_score}/100) [Tech skills pending]`;
    }

    if (skillsScore !== null) {
      if (skillsScore >= 75) positiveIndicators.push(`Well-rounded skill profile (${skillsScore.toFixed(1)}/100)`);
      else if (skillsScore < 50) areasNeedingAttention.push(`Skill development required (${skillsScore.toFixed(1)}/100)`);
    }
  } else {
    skillsNotes = 'Skill matrix evaluation pending';
  }

  // RE-NORMALIZATION & FINAL COMPOSITE CALCULATION
  const componentConfig = [
    { key: 'academic' as const, score: academicScore, nominalWeight: weights.academic, notes: academicNotes, raw: cgpa !== null ? `CGPA: ${cgpa}` : undefined },
    { key: 'attendance' as const, score: attendanceScore, nominalWeight: weights.attendance, notes: attendanceNotes, raw: attendanceScore !== null ? `${attendanceScore}%` : undefined },
    { key: 'lms' as const, score: lmsScore, nominalWeight: weights.lms, notes: lmsNotes, raw: student.lms.assignment_completion !== null ? `${student.lms.assignment_completion}%` : undefined },
    { key: 'engagement' as const, score: engagementScore, nominalWeight: weights.engagement, notes: engagementNotes, raw: engagementScore !== null ? `${engagementScore}/100` : undefined },
    { key: 'placement' as const, score: placementScore, nominalWeight: weights.placement, notes: placementNotes, raw: placementScore !== null ? `${placementScore}/100` : undefined },
    { key: 'skills' as const, score: skillsScore, nominalWeight: weights.skills, notes: skillsNotes, raw: skillsScore !== null ? `${skillsScore}/100` : undefined },
  ];

  const availableComponents = componentConfig.filter(c => c.score !== null);
  const totalNominalWeightAvailable = availableComponents.reduce((sum, c) => sum + c.nominalWeight, 0);

  // Data coverage percentage: portion of original weight available
  const dataCoveragePct = Math.round((totalNominalWeightAvailable / 100) * 100);

  // If coverage < 50%, mark as Insufficient Data
  const isInsufficientData = dataCoveragePct < 50;

  let finalScore: number | null = null;
  const componentsRecord: Record<string, ComponentBreakdown> = {};

  if (!isInsufficientData && totalNominalWeightAvailable > 0) {
    let weightedAcc = 0;
    componentConfig.forEach(c => {
      if (c.score !== null) {
        const effectiveWeight = Math.round((c.nominalWeight / totalNominalWeightAvailable) * 1000) / 10;
        const weightedPoints = Math.round(((c.score * effectiveWeight) / 100) * 10) / 10;
        weightedAcc += weightedPoints;

        componentsRecord[c.key] = {
          score: c.score,
          raw_value: c.raw,
          weight: c.nominalWeight,
          effective_weight: effectiveWeight,
          weighted_points: weightedPoints,
          is_available: true,
          notes: c.notes,
        };
      } else {
        componentsRecord[c.key] = {
          score: null,
          weight: c.nominalWeight,
          effective_weight: 0,
          weighted_points: 0,
          is_available: false,
          notes: c.notes,
        };
      }
    });

    finalScore = Math.min(100, Math.max(0, Math.round(weightedAcc * 10) / 10));
  } else {
    // Insufficient data
    componentConfig.forEach(c => {
      componentsRecord[c.key] = {
        score: c.score,
        weight: c.nominalWeight,
        effective_weight: 0,
        weighted_points: 0,
        is_available: c.score !== null,
        notes: c.notes,
      };
    });
  }

  const summary = isInsufficientData
    ? `Student has only ${dataCoveragePct}% data coverage across campus systems. Minimum 50% coverage required for an authenticated success score.`
    : `Composite success score of ${finalScore}/100 computed across ${dataCoveragePct}% verified data coverage.`;

  return {
    student_id: student.student_id,
    final_score: finalScore,
    is_insufficient_data: isInsufficientData,
    data_coverage_percentage: dataCoveragePct,
    components: componentsRecord as SuccessScoreResult['components'],
    positive_indicators: positiveIndicators,
    areas_needing_attention: areasNeedingAttention,
    explanation_summary: summary,
  };
}
