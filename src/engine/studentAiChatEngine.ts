import { UnifiedStudent } from '../types/student';
import { evaluateAcademicRisk } from './academicRiskEngine';
import { evaluatePlacementRisk } from './placementRiskEngine';
import { assignStudentSegment } from './segmentationEngine';
import { calculateStudentSuccessScore } from './scoringEngine';
import { getStudentPortalData, FEATURED_DEMO_FACULTY } from '../data/portalData';
import { DEMO_PLACEMENT_DRIVES } from '../data/tpoData';

export interface StudentDetailCardData {
  student: UnifiedStudent;
  portalData: ReturnType<typeof getStudentPortalData>;
  academicRisk: {
    risk_level: string;
    risk_score: number;
    primary_factors: string[];
    recommended_interventions: string[];
  };
  placementRisk: {
    risk_level: string;
    risk_score: number;
    primary_factors: string[];
    recommended_interventions: string[];
  };
  successScore: number;
  segment: string;
  placementTier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Needs Preparation';
  eligibleDrives: string[];
  attendanceStatus: 'Critical' | 'Warning' | 'Safe';
  mentorName: string;
  mentorDept: string;
  mentorEmail: string;
  overallAttendance: number;
  cgpa: number;
  backlogs: number;
  codingScore: number;
  aptitudeScore: number;
  mockScore: number;
  atsResumeScore: number;
}

export interface StudentSummaryChip {
  id: string;
  name: string;
  dept: string;
  cgpa: number;
  attendance: number;
  risk: string;
  placementTier: string;
  backlogs: number;
}

export interface StudentAiResponse {
  replyText: string;
  intent: 'student_detail' | 'student_attribute' | 'student_cohort' | 'campus_analytics' | 'general_help';
  matchedStudent?: StudentDetailCardData;
  matchedStudentsList?: StudentSummaryChip[];
  attributeQueried?: string;
  attributeValue?: string | number;
  metrics?: { label: string; value: string | number; sublabel?: string }[];
  suggestedPrompts: string[];
  actionLink?: {
    label: string;
    studentId?: string;
    actionType: 'open_profile' | 'open_dossier' | 'filter_list';
  };
}

/**
 * Helper to compute placement tier
 */
function derivePlacementTier(cgpa: number, codingScore: number, backlogs: number): 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Needs Preparation' {
  if (backlogs > 0) return 'Needs Preparation';
  if (cgpa >= 8.0 && codingScore >= 70) return 'Tier 1';
  if (cgpa >= 7.0 && codingScore >= 55) return 'Tier 2';
  if (cgpa >= 6.0) return 'Tier 3';
  return 'Needs Preparation';
}

/**
 * Computes list of eligible campus placement drives for a student
 */
function getEligibleDrives(cgpa: number, backlogs: number, codingScore: number): string[] {
  return DEMO_PLACEMENT_DRIVES.filter(drive => {
    const minCgpa = drive.minCgpa ?? 6.5;
    const maxBacklogs = drive.maxBacklogs ?? 0;
    const minCoding = drive.minCodingScore ?? 40;
    return cgpa >= minCgpa && backlogs <= maxBacklogs && codingScore >= minCoding;
  }).map(d => `${d.company} (₹${d.ctc} LPA)`);
}

/**
 * Compiles a rich 360-degree data bundle for a single student
 */
export function buildStudentDetailBundle(student: UnifiedStudent): StudentDetailCardData {
  const portalData = getStudentPortalData(student);
  const acadRisk = evaluateAcademicRisk(student);
  const placeRisk = evaluatePlacementRisk(student);
  const successScoreResult = calculateStudentSuccessScore(student);
  const segmentResult = assignStudentSegment(student);

  const cgpa = student.academic.cgpa ?? 0;
  const backlogs = student.academic.backlogs ?? 0;
  const overallAttendance = student.attendance.overall_attendance ?? 0;
  const codingScore = student.placement.coding_score ?? 0;
  const aptitudeScore = student.placement.aptitude_score ?? 0;
  const mockScore = student.placement.mock_interview_score ?? 0;
  const atsResumeScore = Math.min(98, Math.round(codingScore * 0.4 + aptitudeScore * 0.3 + (cgpa * 10) * 0.3));

  const placementTier = derivePlacementTier(cgpa, codingScore, backlogs);
  const eligibleDrives = getEligibleDrives(cgpa, backlogs, codingScore);

  let attendanceStatus: 'Critical' | 'Warning' | 'Safe' = 'Safe';
  if (overallAttendance < 65) attendanceStatus = 'Critical';
  else if (overallAttendance < 75) attendanceStatus = 'Warning';

  // Find mentor
  const mentor = FEATURED_DEMO_FACULTY.find(f => f.department === student.department) || FEATURED_DEMO_FACULTY[0];

  return {
    student,
    portalData,
    academicRisk: {
      risk_level: acadRisk.risk_level,
      risk_score: acadRisk.risk_score,
      primary_factors: acadRisk.evidence_summary || [],
      recommended_interventions: acadRisk.suggested_next_steps || [],
    },
    placementRisk: {
      risk_level: placeRisk.risk_level,
      risk_score: placeRisk.readiness_score ?? 50,
      primary_factors: placeRisk.evidence_summary || [],
      recommended_interventions: placeRisk.suggested_next_steps || [],
    },
    successScore: Math.round(successScoreResult.final_score ?? 60),
    segment: segmentResult.segment,
    placementTier,
    eligibleDrives,
    attendanceStatus,
    mentorName: mentor.name,
    mentorDept: mentor.department,
    mentorEmail: mentor.email,
    overallAttendance,
    cgpa,
    backlogs,
    codingScore,
    aptitudeScore,
    mockScore,
    atsResumeScore,
  };
}

/**
 * Searches and finds the best student match from a query
 */
export function findStudentInQuery(query: string, students: UnifiedStudent[]): UnifiedStudent | undefined {
  const q = query.toLowerCase().trim();

  // 1. Check ID pattern like STU001, stu002, stu 014
  const idMatch = q.match(/stu\s*0*(\d+)/i);
  if (idMatch) {
    const num = parseInt(idMatch[1], 10);
    const standardId = `STU${num.toString().padStart(3, '0')}`;
    const foundById = students.find(s => s.student_id.toLowerCase() === standardId.toLowerCase());
    if (foundById) return foundById;
  }

  // 2. Exact student_id or email match
  const foundExact = students.find(
    s => s.student_id.toLowerCase() === q || s.email.toLowerCase() === q
  );
  if (foundExact) return foundExact;

  // 3. Name full or partial match
  // Score candidates based on match quality
  let bestMatch: UnifiedStudent | undefined;
  let highestScore = 0;

  for (const s of students) {
    const sName = s.name.toLowerCase();
    const parts = sName.split(' ');

    if (q.includes(sName)) {
      // Full name contained in query
      return s;
    }

    // Check if query contains any of the names (e.g. "Anup", "Sharma", "Priya", "Sneha", "Aditya")
    for (const part of parts) {
      if (part.length >= 3 && q.includes(part)) {
        const score = part.length * 2;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = s;
        }
      }
    }
  }

  return bestMatch;
}

/**
 * AI Student Chat Engine
 * Evaluates queries in both Admin and TPO portal contexts.
 */
export function queryStudentAiAssistant(
  query: string,
  students: UnifiedStudent[],
  context: 'admin' | 'tpo' = 'admin'
): StudentAiResponse {
  const q = query.toLowerCase().trim();
  const total = students.length;

  if (total === 0) {
    return {
      replyText: 'No student records are currently loaded in the database. Please import student data via the Data Integration Hub or verify the database connection.',
      intent: 'general_help',
      suggestedPrompts: ['How to add students?', 'Check database connection'],
    };
  }

  // ─── 1. DIRECT STUDENT LOOKUP & SPECIFIC ATTRIBUTE QUERY ──────────────────
  const matchedStudentRaw = findStudentInQuery(q, students);

  if (matchedStudentRaw) {
    const bundle = buildStudentDetailBundle(matchedStudentRaw);
    const stName = bundle.student.name;
    const stId = bundle.student.student_id;

    // Detect if user asked for a specific attribute of this student
    const asksAttendance = q.includes('attendance') || q.includes('absent') || q.includes('present') || q.includes('leave');
    const asksCgpa = q.includes('cgpa') || q.includes('gpa') || q.includes('marks') || q.includes('grades') || q.includes('academic');
    const asksBacklog = q.includes('backlog') || q.includes('arrear') || q.includes('failed') || q.includes('kt');
    const asksPlacement = q.includes('placement') || q.includes('package') || q.includes('drive') || q.includes('tier') || q.includes('offer') || q.includes('company') || q.includes('job') || q.includes('ctc');
    const asksMentor = q.includes('mentor') || q.includes('faculty') || q.includes('advisor') || q.includes('guide') || q.includes('professor');
    const asksContact = q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('address') || q.includes('roll');
    const asksSkills = q.includes('skill') || q.includes('coding') || q.includes('dsa') || q.includes('resume') || q.includes('ats');

    if (asksAttendance) {
      const alertEmoji = bundle.attendanceStatus === 'Critical' ? '🚨' : bundle.attendanceStatus === 'Warning' ? '⚠️' : '✅';
      return {
        replyText: `${alertEmoji} **${stName} (${stId})** has an overall attendance of **${bundle.overallAttendance}%** (${bundle.attendanceStatus} status).\n\n• **Department:** ${bundle.student.department}\n• **Semester:** ${bundle.student.semester}\n• **Required Threshold:** 75% minimum (Shortfall: ${bundle.overallAttendance < 75 ? `${75 - bundle.overallAttendance}% below standard` : 'None, safe'})\n• **Mentor Assigned:** ${bundle.mentorName} (${bundle.mentorDept})`,
        intent: 'student_attribute',
        matchedStudent: bundle,
        attributeQueried: 'Attendance',
        attributeValue: `${bundle.overallAttendance}% (${bundle.attendanceStatus})`,
        actionLink: {
          label: `Open ${stName}'s 360° Profile`,
          studentId: stId,
          actionType: context === 'tpo' ? 'open_dossier' : 'open_profile',
        },
        suggestedPrompts: [
          `What are ${stName}'s backlogs?`,
          `Show placement details for ${stId}`,
          `Who are critical attendance students?`,
        ],
      };
    }

    if (asksCgpa) {
      return {
        replyText: `📚 **${stName} (${stId})** has an active **CGPA of ${bundle.cgpa.toFixed(2)}/10.0**.\n\n• **Internal Marks Average:** ${bundle.student.academic.internal_marks ?? 'N/A'}%\n• **Active Backlogs:** ${bundle.backlogs === 0 ? 'Zero (Clear)' : `${bundle.backlogs} Pending`}\n• **Academic Risk Tier:** ${bundle.academicRisk.risk_level}\n• **Segment:** ${bundle.segment}`,
        intent: 'student_attribute',
        matchedStudent: bundle,
        attributeQueried: 'CGPA',
        attributeValue: `${bundle.cgpa.toFixed(2)} / 10.0`,
        actionLink: {
          label: `Open ${stName}'s Academic Dossier`,
          studentId: stId,
          actionType: context === 'tpo' ? 'open_dossier' : 'open_profile',
        },
        suggestedPrompts: [
          `Show ${stName}'s attendance`,
          `Is ${stId} eligible for Tier 1 campus drives?`,
          `List students with CGPA > 8.5`,
        ],
      };
    }

    if (asksBacklog) {
      return {
        replyText: `📋 **${stName} (${stId})** currently has **${bundle.backlogs} active backlog(s)**.\n\n• **Academic Risk Status:** ${bundle.academicRisk.risk_level}\n• **Current CGPA:** ${bundle.cgpa.toFixed(2)}\n• **Impact on Placement:** ${bundle.backlogs > 0 ? '⚠️ Restricted from Tier-1 drives until backlogs cleared in re-exams.' : '✅ 100% Eligible for all placement drives.'}`,
        intent: 'student_attribute',
        matchedStudent: bundle,
        attributeQueried: 'Backlogs',
        attributeValue: bundle.backlogs,
        actionLink: {
          label: `View ${stName}'s Record`,
          studentId: stId,
          actionType: context === 'tpo' ? 'open_dossier' : 'open_profile',
        },
        suggestedPrompts: [
          `Who are students with backlogs?`,
          `Check ${stName}'s attendance`,
        ],
      };
    }

    if (asksPlacement || asksSkills) {
      return {
        replyText: `💼 **Placement Profile for ${stName} (${stId})**:\n\n• **Placement Tier:** ${bundle.placementTier}\n• **Practical Coding Score:** ${bundle.codingScore}/100\n• **Quantitative Aptitude:** ${bundle.aptitudeScore}/100\n• **Mock Interview Rating:** ${bundle.mockScore}/100\n• **ATS Resume Score:** ${bundle.atsResumeScore}%\n• **Eligible Campus Drives:** ${bundle.eligibleDrives.length > 0 ? bundle.eligibleDrives.slice(0, 4).join(', ') : 'Needs backlog clearance'}\n• **Placement Risk:** ${bundle.placementRisk.risk_level}`,
        intent: 'student_attribute',
        matchedStudent: bundle,
        attributeQueried: 'Placement Readiness',
        attributeValue: bundle.placementTier,
        actionLink: {
          label: context === 'tpo' ? `View Full Placement Dossier` : `Open ${stName}'s 360° Profile`,
          studentId: stId,
          actionType: context === 'tpo' ? 'open_dossier' : 'open_profile',
        },
        suggestedPrompts: [
          `Give opportunity to ${stName}`,
          `List Tier 1 placement candidates`,
          `Show ${stId} attendance and CGPA`,
        ],
      };
    }

    if (asksMentor) {
      return {
        replyText: `👨‍🏫 **Faculty Mentorship for ${stName} (${stId})**:\n\n• **Assigned Mentor:** ${bundle.mentorName}\n• **Department:** ${bundle.mentorDept}\n• **Mentor Email:** ${bundle.mentorEmail}\n• **Intervention Status:** ${bundle.academicRisk.risk_level === 'High' ? '⚠️ High Priority: Mentoring review requested.' : 'Normal periodic advisory.'}`,
        intent: 'student_attribute',
        matchedStudent: bundle,
        suggestedPrompts: [
          `What are ${stName}'s attendance details?`,
          `Show ${stId} complete profile`,
        ],
      };
    }

    // Default Full Student 360 Information Card
    const modeGreeting = context === 'tpo'
      ? `Here is the verified placement and academic telemetry for **${stName} (${stId})**:`
      : `Here are the complete institutional intelligence details for **${stName} (${stId})**:`;

    return {
      replyText: `${modeGreeting}\n\n• **Department:** ${bundle.student.department} · ${bundle.student.semester} (${bundle.student.academic_year})\n• **Academic:** CGPA ${bundle.cgpa.toFixed(2)} · ${bundle.backlogs} Backlogs · Risk: ${bundle.academicRisk.risk_level}\n• **Attendance:** ${bundle.overallAttendance}% (${bundle.attendanceStatus})\n• **Placement Readiness:** ${bundle.placementTier} (Coding ${bundle.codingScore}/100, Aptitude ${bundle.aptitudeScore}/100)\n• **Mentor:** ${bundle.mentorName} (${bundle.mentorDept})\n• **Email:** ${bundle.student.email}`,
      intent: 'student_detail',
      matchedStudent: bundle,
      actionLink: {
        label: context === 'tpo' ? `Open Placement Dossier (${stId})` : `Open 360° Profile (${stId})`,
        studentId: stId,
        actionType: context === 'tpo' ? 'open_dossier' : 'open_profile',
      },
      suggestedPrompts: [
        `What is ${stName}'s attendance?`,
        `Eligible placement companies for ${stId}`,
        `Show critical risk students in ${bundle.student.department}`,
        `Compare with other ${bundle.student.department} students`,
      ],
    };
  }

  // ─── 2. COHORT / FILTER QUERIES IN NATURAL LANGUAGE ───────────────────────

  // A. Critical / High Academic Risk
  if (
    q.includes('critical risk') ||
    q.includes('high risk') ||
    q.includes('need academic support') ||
    q.includes('failing students') ||
    q.includes('academic danger')
  ) {
    const highRiskStudents = students
      .filter(s => evaluateAcademicRisk(s).risk_level === 'High')
      .map(s => {
        const bundle = buildStudentDetailBundle(s);
        return {
          id: s.student_id,
          name: s.name,
          dept: s.department,
          cgpa: bundle.cgpa,
          attendance: bundle.overallAttendance,
          risk: 'High',
          placementTier: bundle.placementTier,
          backlogs: bundle.backlogs,
        };
      });

    return {
      replyText: `🚨 **Identified ${highRiskStudents.length} Students in High Academic Risk** out of ${total} students.\n\nThese students show critical triggers such as multiple backlogs, CGPA < 5.5, or severe attendance deficits (<65%). Immediate faculty intervention or proctor notices are recommended.`,
      intent: 'student_cohort',
      matchedStudentsList: highRiskStudents.slice(0, 8),
      metrics: [
        { label: 'High Risk Cohort', value: highRiskStudents.length, sublabel: `${Math.round((highRiskStudents.length / total) * 100)}% of campus` },
        { label: 'Average Attendance', value: highRiskStudents.length > 0 ? `${Math.round(highRiskStudents.reduce((a, b) => a + b.attendance, 0) / highRiskStudents.length)}%` : 'N/A' },
        { label: 'Average CGPA', value: highRiskStudents.length > 0 ? (highRiskStudents.reduce((a, b) => a + b.cgpa, 0) / highRiskStudents.length).toFixed(2) : 'N/A' },
      ],
      suggestedPrompts: [
        `Show details for ${highRiskStudents[0]?.name || 'STU001'}`,
        'Attendance below 75%',
        'List students with backlogs',
      ],
    };
  }

  // B. Attendance Deficit (< 75% or < 65%)
  if (
    q.includes('attendance < 75') ||
    q.includes('attendance below 75') ||
    q.includes('low attendance') ||
    q.includes('short attendance') ||
    q.includes('attendance warning') ||
    q.includes('attendance deficit')
  ) {
    const lowAttStudents = students
      .filter(s => (s.attendance.overall_attendance ?? 100) < 75)
      .map(s => {
        const bundle = buildStudentDetailBundle(s);
        return {
          id: s.student_id,
          name: s.name,
          dept: s.department,
          cgpa: bundle.cgpa,
          attendance: bundle.overallAttendance,
          risk: bundle.academicRisk.risk_level,
          placementTier: bundle.placementTier,
          backlogs: bundle.backlogs,
        };
      })
      .sort((a, b) => a.attendance - b.attendance);

    return {
      replyText: `⚠️ **${lowAttStudents.length} Students have Attendance below the 75% Mandatory Cutoff** (${Math.round((lowAttStudents.length / total) * 100)}% of cohort).\n\nStudents falling below 75% face examination detention unless compensatory remedial attendance is completed.`,
      intent: 'student_cohort',
      matchedStudentsList: lowAttStudents.slice(0, 8),
      metrics: [
        { label: 'Below 75% Threshold', value: lowAttStudents.length, sublabel: 'Watchlist & Critical' },
        { label: 'Severe Deficit (<65%)', value: lowAttStudents.filter(s => s.attendance < 65).length, sublabel: 'Immediate Detention Risk' },
        { label: 'Lowest Attendance Recorded', value: lowAttStudents.length > 0 ? `${lowAttStudents[0].attendance}%` : 'N/A' },
      ],
      suggestedPrompts: [
        `Show details for ${lowAttStudents[0]?.name || 'STU001'}`,
        'List high risk students',
        'CSE department attendance',
      ],
    };
  }

  // C. Students with Backlogs
  if (
    q.includes('backlog') ||
    q.includes('arrears') ||
    q.includes('failed subjects') ||
    q.includes('kt')
  ) {
    const backlogStudents = students
      .filter(s => (s.academic.backlogs ?? 0) > 0)
      .map(s => {
        const bundle = buildStudentDetailBundle(s);
        return {
          id: s.student_id,
          name: s.name,
          dept: s.department,
          cgpa: bundle.cgpa,
          attendance: bundle.overallAttendance,
          risk: bundle.academicRisk.risk_level,
          placementTier: bundle.placementTier,
          backlogs: bundle.backlogs,
        };
      })
      .sort((a, b) => b.backlogs - a.backlogs);

    return {
      replyText: `📋 **${backlogStudents.length} Students have Active Backlogs** across the campus.\n\nStudents with backlogs are prioritized for semester re-examination prep and remedial mentor clinics.`,
      intent: 'student_cohort',
      matchedStudentsList: backlogStudents.slice(0, 8),
      metrics: [
        { label: 'Students with Backlogs', value: backlogStudents.length, sublabel: `${Math.round((backlogStudents.length / total) * 100)}% of enrolled` },
        { label: 'Zero Backlogs (Clear)', value: total - backlogStudents.length, sublabel: `${Math.round(((total - backlogStudents.length) / total) * 100)}% clean record` },
      ],
      suggestedPrompts: [
        `Show details for ${backlogStudents[0]?.name || 'STU001'}`,
        'Who are Tier 1 placement candidates?',
        'High academic risk students',
      ],
    };
  }

  // D. Placement Tier 1 / Dream Company Eligible Candidates (Crucial for TPO)
  if (
    q.includes('tier 1') ||
    q.includes('tier-1') ||
    q.includes('dream') ||
    q.includes('super dream') ||
    q.includes('top coders') ||
    q.includes('top placement') ||
    q.includes('google') ||
    q.includes('microsoft') ||
    q.includes('amazon')
  ) {
    const tier1Students = students
      .filter(s => {
        const bundle = buildStudentDetailBundle(s);
        return bundle.placementTier === 'Tier 1';
      })
      .map(s => {
        const bundle = buildStudentDetailBundle(s);
        return {
          id: s.student_id,
          name: s.name,
          dept: s.department,
          cgpa: bundle.cgpa,
          attendance: bundle.overallAttendance,
          risk: bundle.placementRisk.risk_level,
          placementTier: 'Tier 1',
          backlogs: bundle.backlogs,
        };
      })
      .sort((a, b) => b.cgpa - a.cgpa);

    return {
      replyText: `🌟 **Found ${tier1Students.length} Tier-1 Placement Candidates** (Dream CTC ₹12+ LPA Eligible).\n\nThese students have **CGPA ≥ 8.0, Coding Score ≥ 70, and 0 Backlogs**, making them prime candidates for elite product campus drives like Google, Microsoft, and Amazon.`,
      intent: 'student_cohort',
      matchedStudentsList: tier1Students.slice(0, 8),
      metrics: [
        { label: 'Tier-1 Candidates', value: tier1Students.length, sublabel: 'Prime Dream Talent' },
        { label: 'Average CGPA', value: tier1Students.length > 0 ? (tier1Students.reduce((a, b) => a + b.cgpa, 0) / tier1Students.length).toFixed(2) : 'N/A' },
        { label: 'Backlogs', value: '0 (All Clean)' },
      ],
      suggestedPrompts: [
        `Show details for ${tier1Students[0]?.name || 'Sneha Joshi'}`,
        'Check placement readiness in CSE',
        'Students needing coding bootcamp',
      ],
    };
  }

  // E. Department Wise Query (e.g. CSE, IT, ECE, Civil, Mechanical)
  const deptMatch = ['computer science', 'information technology', 'electronics', 'mechanical', 'civil'].find(d => q.includes(d));
  if (deptMatch) {
    const deptStudents = students.filter(s => s.department.toLowerCase().includes(deptMatch));
    const highRiskInDept = deptStudents.filter(s => evaluateAcademicRisk(s).risk_level === 'High').length;
    const avgCgpa = (deptStudents.reduce((acc, s) => acc + (s.academic.cgpa ?? 0), 0) / Math.max(1, deptStudents.length)).toFixed(2);
    const avgAtt = Math.round(deptStudents.reduce((acc, s) => acc + (s.attendance.overall_attendance ?? 0), 0) / Math.max(1, deptStudents.length));

    return {
      replyText: `🏢 **${deptStudents[0]?.department || deptMatch.toUpperCase()} Department Overview**:\n\n• **Enrolled Students:** ${deptStudents.length}\n• **Average Department CGPA:** ${avgCgpa}\n• **Average Attendance:** ${avgAtt}%\n• **High Academic Risk Flags:** ${highRiskInDept} students`,
      intent: 'student_cohort',
      matchedStudentsList: deptStudents.slice(0, 8).map(s => {
        const bundle = buildStudentDetailBundle(s);
        return {
          id: s.student_id,
          name: s.name,
          dept: s.department,
          cgpa: bundle.cgpa,
          attendance: bundle.overallAttendance,
          risk: bundle.academicRisk.risk_level,
          placementTier: bundle.placementTier,
          backlogs: bundle.backlogs,
        };
      }),
      metrics: [
        { label: 'Department Headcount', value: deptStudents.length },
        { label: 'Avg CGPA', value: avgCgpa },
        { label: 'Avg Attendance', value: `${avgAtt}%` },
        { label: 'High Risk Flags', value: highRiskInDept },
      ],
      suggestedPrompts: [
        `Show details for ${deptStudents[0]?.name || 'STU001'}`,
        `Attendance below 75% in this department`,
        'Tier 1 candidates',
      ],
    };
  }

  // F. High Performers / Academic Toppers (CGPA > 8.5)
  if (
    q.includes('topper') ||
    q.includes('top performer') ||
    q.includes('highest cgpa') ||
    q.includes('honor list') ||
    q.includes('best student')
  ) {
    const toppers = [...students]
      .sort((a, b) => (b.academic.cgpa ?? 0) - (a.academic.cgpa ?? 0))
      .slice(0, 8)
      .map(s => {
        const bundle = buildStudentDetailBundle(s);
        return {
          id: s.student_id,
          name: s.name,
          dept: s.department,
          cgpa: bundle.cgpa,
          attendance: bundle.overallAttendance,
          risk: bundle.academicRisk.risk_level,
          placementTier: bundle.placementTier,
          backlogs: bundle.backlogs,
        };
      });

    return {
      replyText: `🏆 **Campus Academic Toppers & Honor List**:\n\nThe highest academic achiever is **${toppers[0]?.name} (${toppers[0]?.id})** with a CGPA of **${toppers[0]?.cgpa.toFixed(2)}** in ${toppers[0]?.dept}.`,
      intent: 'student_cohort',
      matchedStudentsList: toppers,
      metrics: [
        { label: 'Highest Campus CGPA', value: toppers[0]?.cgpa.toFixed(2) ?? 'N/A' },
        { label: 'Toppers Cohort', value: toppers.length },
      ],
      suggestedPrompts: [
        `Show details for ${toppers[0]?.name || 'Sneha Joshi'}`,
        'Check Tier 1 placement list',
      ],
    };
  }

  // ─── 3. GENERAL CAMPUS & REPOSITORY METRICS ────────────────────────────────
  const avgCampusCgpa = (students.reduce((a, s) => a + (s.academic.cgpa ?? 0), 0) / total).toFixed(2);
  const avgCampusAtt = Math.round(students.reduce((a, s) => a + (s.attendance.overall_attendance ?? 0), 0) / total);
  const highRiskTotal = students.filter(s => evaluateAcademicRisk(s).risk_level === 'High').length;
  const sampleStudent = students[0];

  return {
    replyText: `👋 **EduPulse AI Student Assistant (${context === 'tpo' ? 'TPO Placement Cell' : 'Admin Operations'})**:\n\nI can instantly look up **any student details** and provide institutional information. Try asking:\n\n• **Direct Student Query:** "Show details for ${sampleStudent.name}" or "What is ${sampleStudent.student_id}'s attendance?"\n• **Academic & Attendance:** "Who has attendance below 75%?" or "Students with active backlogs"\n• **Placement & Careers:** "Show Tier 1 placement candidates" or "Who is eligible for Google?"\n• **Risk & Mentorship:** "List all high-risk students" or "Who is mentoring ${sampleStudent.student_id}?"`,
    intent: 'general_help',
    metrics: [
      { label: 'Enrolled Database', value: total, sublabel: 'Cloud Verified' },
      { label: 'Campus Avg CGPA', value: avgCampusCgpa },
      { label: 'Campus Avg Attendance', value: `${avgCampusAtt}%` },
      { label: 'High Risk Alert Flags', value: highRiskTotal, sublabel: 'Needs Review' },
    ],
    suggestedPrompts: [
      `Show details for ${sampleStudent.name} (${sampleStudent.student_id})`,
      'Students with attendance < 75%',
      'High academic risk list',
      'Tier 1 placement candidates',
    ],
  };
}

