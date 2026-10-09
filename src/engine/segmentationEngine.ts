import { UnifiedStudent } from '../types/student';
import { SegmentType, SegmentInfo, SegmentAssignment } from '../types/segmentation';
import { evaluateAcademicRisk } from './academicRiskEngine';
import { evaluatePlacementRisk } from './placementRiskEngine';

export const SEGMENT_METADATA: Record<SegmentType, SegmentInfo> = {
  'Strong Academics, Strong Placement Readiness': {
    type: 'Strong Academics, Strong Placement Readiness',
    title: 'Top Achievers (Dual Excellence)',
    description: 'Students who excel academically and possess industry-ready coding, aptitude, and interview skills.',
    color: 'emerald',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'text-emerald-700',
    typicalIndicators: ['CGPA >= 7.5', 'Placement Score >= 70', 'Zero Backlogs', 'High LMS Engagement'],
    recommendedInterventions: [
      'Nominate for Tier-1 dream company recruitment drives',
      'Invite to lead student tech chapters and hackathon teams',
      'Offer advanced honors research and patent mentorship',
    ],
  },
  'Strong Academics, Low Placement Readiness': {
    type: 'Strong Academics, Low Placement Readiness',
    title: 'Academic Star, Skill-Bridging Needed',
    description: 'High GPA students with theoretical mastery but lower practical coding, aptitude, or interview performance.',
    color: 'amber',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeText: 'text-amber-700',
    typicalIndicators: ['CGPA >= 7.5', 'Placement Score < 60', 'Low Coding/Mock Scores'],
    recommendedInterventions: [
      'Targeted Data Structures & Algorithms bootcamps',
      'Alumni-paired 1-on-1 mock technical interviews',
      'Aptitude question drill sessions and corporate case studies',
    ],
  },
  'Academic Support Needed': {
    type: 'Academic Support Needed',
    title: 'Academic Guidance & Mentorship',
    description: 'Students experiencing course comprehension challenges, active backlogs, or attendance deficits.',
    color: 'rose',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeText: 'text-rose-700',
    typicalIndicators: ['CGPA < 6.0', 'Active Backlogs >= 1', 'Attendance < 65%', 'Low Internals'],
    recommendedInterventions: [
      'Assign dedicated faculty academic mentor',
      'Remedial coursework and peer-assisted study circles',
      'Attendance tracking and proctor counseling',
    ],
  },
  'Placement Preparation Needed': {
    type: 'Placement Preparation Needed',
    title: 'Career Readiness Focus',
    description: 'Students with moderate academic stability who need focused preparation to clear placement screening rounds.',
    color: 'orange',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeText: 'text-orange-700',
    typicalIndicators: ['CGPA 6.0 - 7.4', 'Placement Score < 60', 'Low Aptitude or Soft Skills'],
    recommendedInterventions: [
      'Weekly aptitude tests and mock online assessments',
      'Resume reviews and communication soft-skill workshops',
      'Group discussion drills and corporate etiquettes',
    ],
  },
  'Low LMS Participation': {
    type: 'Low LMS Participation',
    title: 'Digital Disengagement Risk',
    description: 'Students with low login activity or assignment submission delays despite passing internal grades.',
    color: 'purple',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeText: 'text-purple-700',
    typicalIndicators: ['LMS Logins < 10/month', 'Assignment Completion < 50%', 'CGPA >= 6.0'],
    recommendedInterventions: [
      'Automated LMS deadline push notifications',
      'Check student device/connectivity access constraints',
      'Gamified learning modules and interactive lab submissions',
    ],
  },
  'Balanced Performers': {
    type: 'Balanced Performers',
    title: 'Steady & Consistent Cohort',
    description: 'Students showing well-rounded, consistent progress across academics, attendance, and campus activities.',
    color: 'blue',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeText: 'text-blue-700',
    typicalIndicators: ['CGPA 6.5 - 7.4', 'Attendance >= 75%', 'Placement Score 60 - 74', 'Active Participation'],
    recommendedInterventions: [
      'Encourage participation in hackathons and industry certifications',
      'Career path specialization counseling (Higher Studies vs Placements)',
      'Leadership opportunities in departmental clubs',
    ],
  },
  'Insufficient Data': {
    type: 'Insufficient Data',
    title: 'Pending Telemetry / Profile Incomplete',
    description: 'Students with incomplete departmental records (< 50% data coverage) requiring data synchronization.',
    color: 'slate',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
    badgeText: 'text-slate-700',
    typicalIndicators: ['Completeness < 50%', 'Missing Transcripts or Assessment Logs'],
    recommendedInterventions: [
      'Notify department coordinator to upload missing student records',
      'Audit student integration status in Data Integration hub',
    ],
  },
};

/**
 * Deterministic Student Segmentation with strict precedence rules
 */
export function assignStudentSegment(student: UnifiedStudent): SegmentAssignment {
  // Precedence Rule 1: Insufficient Data check
  if (student.data_quality.data_completeness_percentage < 50) {
    return {
      segment: 'Insufficient Data',
      primary_reason: `Record completeness is only ${student.data_quality.data_completeness_percentage}%, below the 50% threshold for classification.`,
      supporting_metrics: {
        completeness: `${student.data_quality.data_completeness_percentage}%`,
        missing_fields: student.data_quality.missing_fields.length,
      },
    };
  }

  const acadRisk = evaluateAcademicRisk(student);
  const placeRisk = evaluatePlacementRisk(student);
  const cgpa = student.academic.cgpa ?? 0;
  const backlogs = student.academic.backlogs ?? 0;
  const attendance = student.attendance.overall_attendance ?? 0;
  const assignment = student.lms.assignment_completion ?? 100;
  const logins = student.lms.lms_logins ?? 30;
  const placementScore = placeRisk.readiness_score ?? 0;

  // Precedence Rule 2: Academic Support Needed (safety net first)
  if (acadRisk.risk_level === 'High' || cgpa < 6.0 || backlogs >= 1 || attendance < 65) {
    return {
      segment: 'Academic Support Needed',
      primary_reason: backlogs > 0
        ? `Student has ${backlogs} active backlog(s) requiring academic remediation.`
        : attendance < 65
        ? `Critically low attendance (${attendance.toFixed(1)}%) risks academic debarment.`
        : `Academic standing (CGPA ${cgpa.toFixed(2)}) requires continuous faculty support.`,
      supporting_metrics: {
        cgpa,
        backlogs,
        attendance: `${attendance}%`,
        academic_risk: acadRisk.risk_level,
      },
    };
  }

  // Precedence Rule 3: Strong Academics, Low Placement Readiness
  if (cgpa >= 7.5 && (placementScore < 60 || (student.placement.coding_score !== null && student.placement.coding_score < 50))) {
    return {
      segment: 'Strong Academics, Low Placement Readiness',
      primary_reason: `Demonstrates high academic ability (CGPA ${cgpa.toFixed(2)}) but requires targeted coaching in coding and placements (${placementScore}/100).`,
      supporting_metrics: {
        cgpa,
        placement_score: placementScore,
        coding_score: student.placement.coding_score ?? 'N/A',
        aptitude_score: student.placement.aptitude_score ?? 'N/A',
      },
    };
  }

  // Precedence Rule 4: Strong Academics, Strong Placement Readiness
  if (cgpa >= 7.5 && placementScore >= 70 && backlogs === 0) {
    return {
      segment: 'Strong Academics, Strong Placement Readiness',
      primary_reason: `Exceptional dual competence with CGPA ${cgpa.toFixed(2)} and placement readiness score of ${placementScore}/100.`,
      supporting_metrics: {
        cgpa,
        placement_score: placementScore,
        attendance: `${attendance}%`,
      },
    };
  }

  // Precedence Rule 5: Placement Preparation Needed
  if (placementScore < 60 || placeRisk.risk_level === 'High' || placeRisk.risk_level === 'Moderate') {
    return {
      segment: 'Placement Preparation Needed',
      primary_reason: `Academically steady (CGPA ${cgpa.toFixed(2)}) but placement screening scores (${placementScore}/100) are below recruitment benchmarks.`,
      supporting_metrics: {
        cgpa,
        placement_score: placementScore,
        aptitude: student.placement.aptitude_score ?? 'N/A',
      },
    };
  }

  // Precedence Rule 6: Low LMS Participation
  if (assignment < 50 || logins < 10) {
    return {
      segment: 'Low LMS Participation',
      primary_reason: `Underutilizing online course platforms (Assignment completion: ${assignment}%, Logins: ${logins}/mo).`,
      supporting_metrics: {
        assignment_completion: `${assignment}%`,
        lms_logins: logins,
        cgpa,
      },
    };
  }

  // Precedence Rule 7: Balanced Performers
  return {
    segment: 'Balanced Performers',
    primary_reason: `Consistent and stable performance across academic (CGPA ${cgpa.toFixed(2)}), attendance (${attendance}%), and skills metrics.`,
    supporting_metrics: {
      cgpa,
      attendance: `${attendance}%`,
      placement_score: placementScore,
    },
  };
}
