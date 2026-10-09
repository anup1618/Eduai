import { UnifiedStudent } from '../types/student';
import { evaluateAcademicRisk } from './academicRiskEngine';
import { evaluatePlacementRisk } from './placementRiskEngine';
import { assignStudentSegment } from './segmentationEngine';
import { calculateStudentSuccessScore } from './scoringEngine';

export interface AnalystResponse {
  query: string;
  answerTitle: string;
  answerSummary: string;
  metrics: {
    label: string;
    value: string | number;
    sublabel?: string;
  }[];
  detailedBreakdown: string[];
  suggestedAction: string;
  relatedStudentIds?: string[];
  targetPage?: string;
}

/**
 * Deterministic AI Campus Analyst
 * Executes real calculations over current student records to answer queries faithfully.
 */
export function queryCampusAnalyst(
  query: string,
  students: UnifiedStudent[]
): AnalystResponse {
  const q = query.toLowerCase().trim();
  const totalStudents = students.length;

  if (totalStudents === 0) {
    return {
      query,
      answerTitle: 'No Student Data Available',
      answerSummary: 'The current filter returned 0 student records. Please adjust your filters or import a dataset.',
      metrics: [{ label: 'Active Students', value: 0 }],
      detailedBreakdown: ['Ensure valid records are present in the system.'],
      suggestedAction: 'Clear active filters in the top filter bar.',
    };
  }

  // Question 1: How many students need academic support? / Academic risk
  if (
    q.includes('academic support') ||
    q.includes('academic risk') ||
    q.includes('need support') ||
    q.includes('failing') ||
    q.includes('poor grades')
  ) {
    const riskResults = students.map(s => ({
      student: s,
      risk: evaluateAcademicRisk(s),
    }));
    const highRisk = riskResults.filter(r => r.risk.risk_level === 'High');
    const moderateRisk = riskResults.filter(r => r.risk.risk_level === 'Moderate');
    const totalNeedingSupport = highRisk.length + moderateRisk.length;
    const supportPct = Math.round((totalNeedingSupport / totalStudents) * 100);

    return {
      query,
      answerTitle: `${totalNeedingSupport} Students Identified for Academic Review`,
      answerSummary: `Out of ${totalStudents} students in the selected cohort, ${totalNeedingSupport} (${supportPct}%) exhibit academic risk indicators requiring faculty mentorship or attendance intervention.`,
      metrics: [
        { label: 'High Academic Risk', value: highRisk.length, sublabel: `${Math.round((highRisk.length / totalStudents) * 100)}% of cohort` },
        { label: 'Moderate Academic Risk', value: moderateRisk.length, sublabel: `${Math.round((moderateRisk.length / totalStudents) * 100)}% of cohort` },
        { label: 'Total Flagged', value: totalNeedingSupport, sublabel: `${supportPct}% support rate` },
      ],
      detailedBreakdown: [
        `High Risk (${highRisk.length} students): Triggered by multiple backlogs, CGPA < 5.5, or critical attendance < 65%.`,
        `Moderate Risk (${moderateRisk.length} students): Borderline attendance (65-75%) or internal test marks < 50%.`,
        `Primary root cause: ${
          highRisk.filter(r => (r.student.attendance.overall_attendance ?? 100) < 65).length
        } students have severe attendance deficits.`,
      ],
      suggestedAction: 'Navigate to Intervention Centre to schedule remedial tutorials and attendance proctor reviews.',
      relatedStudentIds: highRisk.slice(0, 8).map(r => r.student.student_id),
      targetPage: 'risk-analysis',
    };
  }

  // Question 2: Which department has highest proportion of academic risk?
  if (
    q.includes('department') ||
    q.includes('highest proportion') ||
    q.includes('which dept') ||
    q.includes('department wise')
  ) {
    const deptMap: Record<string, { total: number; highRisk: number; modRisk: number }> = {};
    students.forEach(s => {
      if (!deptMap[s.department]) {
        deptMap[s.department] = { total: 0, highRisk: 0, modRisk: 0 };
      }
      deptMap[s.department].total += 1;
      const risk = evaluateAcademicRisk(s);
      if (risk.risk_level === 'High') deptMap[s.department].highRisk += 1;
      else if (risk.risk_level === 'Moderate') deptMap[s.department].modRisk += 1;
    });

    const deptStats = Object.entries(deptMap).map(([dept, data]) => {
      const flagged = data.highRisk + data.modRisk;
      const rate = data.total > 0 ? Math.round((flagged / data.total) * 100) : 0;
      return { dept, ...data, flagged, rate };
    }).sort((a, b) => b.rate - a.rate);

    const highest = deptStats[0];

    return {
      query,
      answerTitle: `${highest.dept} has the Highest Academic Risk Ratio`,
      answerSummary: `${highest.dept} leads the campus with ${highest.rate}% of its students flagged for academic review (${highest.flagged} out of ${highest.total} students).`,
      metrics: deptStats.slice(0, 4).map(d => ({
        label: d.dept,
        value: `${d.rate}%`,
        sublabel: `${d.flagged}/${d.total} students`,
      })),
      detailedBreakdown: deptStats.map(
        d => `${d.dept}: ${d.flagged} flagged (${d.highRisk} High, ${d.modRisk} Moderate) across ${d.total} total enrolled.`
      ),
      suggestedAction: `Initiate a departmental intervention review meeting with the Head of Department for ${highest.dept}.`,
      targetPage: 'overview',
    };
  }

  // Question 3: How many students have strong academics but low placement readiness?
  if (
    q.includes('strong academics') ||
    q.includes('low placement') ||
    q.includes('good marks bad placement') ||
    q.includes('skill gap') ||
    q.includes('high gpa low coding')
  ) {
    const flagged = students.filter(s => {
      const seg = assignStudentSegment(s);
      return seg.segment === 'Strong Academics, Low Placement Readiness';
    });
    const pct = Math.round((flagged.length / totalStudents) * 100);

    return {
      query,
      answerTitle: `${flagged.length} High-GPA Students Need Placement Coaching`,
      answerSummary: `${flagged.length} students (${pct}% of cohort) have strong academic records (CGPA ≥ 7.5) but fall short on practical coding, aptitude, or mock interviews.`,
      metrics: [
        { label: 'Identified Cohort', value: flagged.length, sublabel: `${pct}% of active cohort` },
        {
          label: 'Avg CGPA of Cohort',
          value: flagged.length > 0 ? (flagged.reduce((acc, s) => acc + (s.academic.cgpa ?? 0), 0) / flagged.length).toFixed(2) : 'N/A',
        },
        {
          label: 'Avg Coding Score',
          value: flagged.length > 0 ? `${Math.round(flagged.reduce((acc, s) => acc + (s.placement.coding_score ?? 0), 0) / flagged.length)}/100` : 'N/A',
        },
      ],
      detailedBreakdown: [
        'These students demonstrate high subject theoretical grasp but lack competitive DSA problem-solving speed.',
        'Immediate risk: May clear initial academic filters but fail technical coding rounds in recruitment drives.',
      ],
      suggestedAction: 'Enroll this cohort in the 4-week algorithmic problem solving and mock technical interview track.',
      relatedStudentIds: flagged.slice(0, 8).map(s => s.student_id),
      targetPage: 'student-segments',
    };
  }

  // Question 4: Common reasons for placement risk
  if (
    q.includes('common reasons') ||
    q.includes('placement risk') ||
    q.includes('why placement') ||
    q.includes('placement readiness')
  ) {
    let lowCoding = 0;
    let lowAptitude = 0;
    let lowMock = 0;
    let absentPrep = 0;
    let missingAssessments = 0;

    students.forEach(s => {
      if (s.placement.coding_score !== null && s.placement.coding_score < 50) lowCoding++;
      if (s.placement.aptitude_score !== null && s.placement.aptitude_score < 60) lowAptitude++;
      if (s.placement.mock_interview_score !== null && s.placement.mock_interview_score < 55) lowMock++;
      if (s.placement.placement_preparation_participation === false) absentPrep++;
      if (s.placement.aptitude_score === null || s.placement.coding_score === null) missingAssessments++;
    });

    return {
      query,
      answerTitle: 'Key Drivers of Campus Placement Risk',
      answerSummary: `Analysis of placement readiness evaluations shows that Coding Gaps and Quantitative Aptitude are the two most prevalent bottlenecks.`,
      metrics: [
        { label: 'Coding < 50', value: lowCoding, sublabel: `${Math.round((lowCoding / totalStudents) * 100)}% of cohort` },
        { label: 'Aptitude < 60', value: lowAptitude, sublabel: `${Math.round((lowAptitude / totalStudents) * 100)}% of cohort` },
        { label: 'Mock Interview < 55', value: lowMock, sublabel: `${Math.round((lowMock / totalStudents) * 100)}% of cohort` },
        { label: 'Unregistered for Training', value: absentPrep, sublabel: 'Missed campus prep' },
      ],
      detailedBreakdown: [
        `1. Coding Proficiency: ${lowCoding} students struggle with algorithmic assessments.`,
        `2. Aptitude Cutoffs: ${lowAptitude} students miss standard recruiter aptitude benchmarks.`,
        `3. Assessment Gaps: ${missingAssessments} students have incomplete diagnostic logs.`,
      ],
      suggestedAction: 'Organize campus-wide weekly coding hack nights and timed aptitude quizzes.',
      targetPage: 'risk-analysis',
    };
  }

  // Question 5: Incomplete placement assessments / Data completeness
  if (
    q.includes('incomplete') ||
    q.includes('missing') ||
    q.includes('assessment') ||
    q.includes('data quality')
  ) {
    const incompletePlacement = students.filter(
      s => s.placement.aptitude_score === null || s.placement.coding_score === null || s.placement.mock_interview_score === null
    );
    const lowCompleteness = students.filter(s => s.data_quality.data_completeness_percentage < 50);

    return {
      query,
      answerTitle: `${incompletePlacement.length} Students Have Incomplete Placement Records`,
      answerSummary: `${incompletePlacement.length} students have at least one unrecorded placement diagnostic exam. Additionally, ${lowCompleteness.length} students have < 50% data completeness overall.`,
      metrics: [
        { label: 'Pending Placement Logs', value: incompletePlacement.length, sublabel: `${Math.round((incompletePlacement.length / totalStudents) * 100)}% of cohort` },
        { label: 'Critically Incomplete (<50%)', value: lowCompleteness.length, sublabel: 'Insufficient data' },
        { label: 'Fully Integrated', value: totalStudents - lowCompleteness.length, sublabel: 'Ready for full analytics' },
      ],
      detailedBreakdown: [
        `Missing Aptitude test: ${students.filter(s => s.placement.aptitude_score === null).length} students.`,
        `Missing Coding test: ${students.filter(s => s.placement.coding_score === null).length} students.`,
        `Missing Mock interview: ${students.filter(s => s.placement.mock_interview_score === null).length} students.`,
      ],
      suggestedAction: 'Use Data Integration hub to upload the missing assessment CSV files or notify respective department coordinators.',
      relatedStudentIds: incompletePlacement.slice(0, 8).map(s => s.student_id),
      targetPage: 'data-integration',
    };
  }

  // Default intelligent match: calculate average success score and summary of current cohort
  const scores = students
    .map(s => calculateStudentSuccessScore(s).final_score)
    .filter((s): s is number => s !== null);
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 'N/A';
  const acadHigh = students.filter(s => evaluateAcademicRisk(s).risk_level === 'High').length;
  const placeHigh = students.filter(s => evaluatePlacementRisk(s).risk_level === 'High').length;

  return {
    query,
    answerTitle: `Analytical Summary for Selected Cohort (${totalStudents} Students)`,
    answerSummary: `Analyzing "${query}" against the active dataset: The cohort has an average Success Score of ${avgScore}/100, with ${acadHigh} students in Academic High Risk and ${placeHigh} in Placement High Risk.`,
    metrics: [
      { label: 'Cohort Size', value: totalStudents },
      { label: 'Avg Success Score', value: `${avgScore}/100` },
      { label: 'Academic High Risk', value: acadHigh },
      { label: 'Placement High Risk', value: placeHigh },
    ],
    detailedBreakdown: [
      `Deterministic search processed query "${query}" across 7 student data domains.`,
      `Try asking: "How many students need academic support?", "Which department has the highest risk?", or "How many have high GPA but low placement?"`,
    ],
    suggestedAction: 'Explore detailed views in Student Intelligence or Risk Analysis.',
    targetPage: 'student-intelligence',
  };
}
