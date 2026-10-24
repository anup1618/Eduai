import { INITIAL_STUDENTS } from './initialStudents';
import { UnifiedStudent } from '../types/student';

export type PortalRole = 'login' | 'student' | 'faculty' | 'admin' | 'tpo';

// ─── Demo Credentials ──────────────────────────────────────────────────────────
export interface DemoCredential {
  role: Exclude<PortalRole, 'login'>;
  studentId?: string;
  facultyIdx?: number;
  label: string;
  email: string;
  password: string;
  name: string;
  subtitle: string;
  avatarInitials: string;
  color: string;        // Tailwind gradient classes
  accentColor: string;  // Tailwind text color class for badge
  badgeBg: string;      // Tailwind bg class for badge
  risk?: 'Low' | 'Medium' | 'High' | 'Moderate';
}

// ─── Featured Demo Students for Quick Login & Testing ─────────────────────────
export const FEATURED_DEMO_STUDENTS = [
  {
    id: 'STU001',
    name: 'Anup Kumar',
    email: 'anup.kumar@edupulse.edu',
    altEmail: 'anup.kumar@example.com',
    password: 'student@123',
    department: 'Computer Science',
    course: 'B Tech CSE',
    yearSem: '3rd Year · Sem 5',
    rollNo: 'CS21B021',
    risk: 'Medium' as const,
    cgpa: 7.8,
    attendance: 78,
    backlogs: 0,
    initials: 'AS',
    badge: 'Standard Track (Medium)',
    color: 'from-blue-600 to-cyan-500',
  },
  {
    id: 'STU002',
    name: 'Priya Singh',
    email: 'priya.singh@edupulse.edu',
    altEmail: 'priya.singh02@example.com',
    password: 'student@123',
    department: 'Information Technology',
    course: 'B Sc IT',
    yearSem: '2nd Year · Sem 4',
    rollNo: 'IT22B002',
    risk: 'Low' as const,
    cgpa: 7.9,
    attendance: 68,
    backlogs: 1,
    initials: 'PS',
    badge: 'Watchlist / 1 Backlog',
    color: 'from-pink-600 to-rose-500',
  },
  {
    id: 'STU003',
    name: 'Rohan Verma',
    email: 'rohan.verma@edupulse.edu',
    altEmail: 'rohan.verma03@example.com',
    password: 'student@123',
    department: 'Mechanical Eng.',
    course: 'B Com',
    yearSem: '3rd Year · Sem 5',
    rollNo: 'ME21B003',
    risk: 'Low' as const,
    cgpa: 7.6,
    attendance: 79,
    backlogs: 0,
    initials: 'RV',
    badge: 'Consistent Performer',
    color: 'from-emerald-600 to-teal-500',
  },
  {
    id: 'STU006',
    name: 'Sneha Joshi',
    email: 'sneha.joshi@edupulse.edu',
    altEmail: 'sneha.joshi06@example.com',
    password: 'student@123',
    department: 'Computer Science',
    course: 'B Tech CSE',
    yearSem: '4th Year · Sem 7',
    rollNo: 'CS19B006',
    risk: 'Low' as const,
    cgpa: 8.8,
    attendance: 82,
    backlogs: 0,
    initials: 'SJ',
    badge: "Dean's Honor List (8.8 CGPA)",
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'STU007',
    name: 'Aditya Shah',
    email: 'aditya.shah@edupulse.edu',
    altEmail: 'aditya.shah07@example.com',
    password: 'student@123',
    department: 'Information Technology',
    course: 'B Sc IT',
    yearSem: '1st Year · Sem 1',
    rollNo: 'IT25B007',
    risk: 'High' as const,
    cgpa: 5.8,
    attendance: 50,
    backlogs: 0,
    initials: 'AS',
    badge: 'Critical High Risk (50% Attd)',
    color: 'from-red-600 to-rose-600',
  },
  {
    id: 'STU017',
    name: 'Dev Chavan',
    email: 'dev.chavan@edupulse.edu',
    altEmail: 'dev.chavan17@example.com',
    password: 'student@123',
    department: 'Computer Science',
    course: 'B Sc Computer Science',
    yearSem: '3rd Year · Sem 5',
    rollNo: 'CS21B017',
    risk: 'Medium' as const,
    cgpa: 6.4,
    attendance: 66,
    backlogs: 2,
    initials: 'DC',
    badge: '2 Backlogs Alert',
    color: 'from-purple-600 to-indigo-500',
  },
];

// ─── Featured Demo Faculty ────────────────────────────────────────────────────
export const FEATURED_DEMO_FACULTY = [
  {
    id: 'FAC-01',
    idx: 0,
    name: 'Dr. Priya Menon',
    email: 'priya.menon@edupulse.edu',
    password: 'faculty@123',
    department: 'Computer Science',
    designation: 'Associate Professor & ML Lead',
    subjects: ['Machine Learning', 'Database Systems'],
    students_count: 54,
    avatar_initials: 'PM',
    color: 'from-violet-600 to-purple-500',
  },
  {
    id: 'FAC-02',
    idx: 1,
    name: 'Prof. Suresh Kumar',
    email: 'suresh.kumar@edupulse.edu',
    password: 'faculty@123',
    department: 'Computer Science',
    designation: 'Assistant Professor · Networks',
    subjects: ['Computer Networks', 'Software Engineering'],
    students_count: 48,
    avatar_initials: 'SK',
    color: 'from-blue-600 to-indigo-500',
  },
  {
    id: 'FAC-03',
    idx: 2,
    name: 'Dr. Anita Bose',
    email: 'anita.bose@edupulse.edu',
    password: 'faculty@123',
    department: 'Computer Science',
    designation: 'Professor · Systems & OS',
    subjects: ['Operating Systems', 'Algorithm Design'],
    students_count: 52,
    avatar_initials: 'AB',
    color: 'from-emerald-600 to-teal-500',
  },
  {
    id: 'FAC-04',
    idx: 3,
    name: 'Dr. Rajesh Verma',
    email: 'rajesh.verma@edupulse.edu',
    password: 'faculty@123',
    department: 'Computer Science',
    designation: 'Professor · AI Systems',
    subjects: ['Artificial Intelligence', 'Data Science'],
    students_count: 60,
    avatar_initials: 'RV',
    color: 'from-cyan-600 to-blue-500',
  },
];

export const DEMO_CREDENTIALS: DemoCredential[] = [
  // Primary Student: Arjun Sharma
  {
    role: 'student',
    studentId: 'STU001',
    label: 'Student',
    email: 'arjun.sharma@edupulse.edu',
    password: 'student@123',
    name: 'Arjun Sharma',
    subtitle: 'B Tech CSE · 3rd Year · STU001',
    avatarInitials: 'AS',
    color: 'from-blue-600 to-cyan-500',
    accentColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30',
    risk: 'Medium',
  },
  // Second Student: Priya Singh (Watchlist)
  {
    role: 'student',
    studentId: 'STU002',
    label: 'Student',
    email: 'priya.singh@edupulse.edu',
    password: 'student@123',
    name: 'Priya Singh',
    subtitle: 'B Sc IT · 2nd Year · STU002',
    avatarInitials: 'PS',
    color: 'from-pink-600 to-rose-500',
    accentColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 border-rose-500/30',
    risk: 'Low',
  },
  // Third Student: Aditya Shah (Critical High Risk)
  {
    role: 'student',
    studentId: 'STU007',
    label: 'Student',
    email: 'aditya.shah@edupulse.edu',
    password: 'student@123',
    name: 'Aditya Shah',
    subtitle: 'B Sc IT · 1st Year · High Risk',
    avatarInitials: 'AS',
    color: 'from-red-600 to-rose-600',
    accentColor: 'text-red-400',
    badgeBg: 'bg-red-500/10 border-red-500/30',
    risk: 'High',
  },
  // Fourth Student: Sneha Joshi (Honor List)
  {
    role: 'student',
    studentId: 'STU006',
    label: 'Student',
    email: 'sneha.joshi@edupulse.edu',
    password: 'student@123',
    name: 'Sneha Joshi',
    subtitle: 'B Tech CSE · 4th Year · 8.8 CGPA',
    avatarInitials: 'SJ',
    color: 'from-amber-500 to-orange-500',
    accentColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/30',
    risk: 'Low',
  },
  // Faculty 1: Dr. Priya Menon
  {
    role: 'faculty',
    facultyIdx: 0,
    label: 'Faculty',
    email: 'priya.menon@edupulse.edu',
    password: 'faculty@123',
    name: 'Dr. Priya Menon',
    subtitle: 'Computer Science · ML & DB Systems',
    avatarInitials: 'PM',
    color: 'from-violet-600 to-purple-500',
    accentColor: 'text-violet-400',
    badgeBg: 'bg-violet-500/10 border-violet-500/30',
  },
  // Faculty 2: Prof. Suresh Kumar
  {
    role: 'faculty',
    facultyIdx: 1,
    label: 'Faculty',
    email: 'suresh.kumar@edupulse.edu',
    password: 'faculty@123',
    name: 'Prof. Suresh Kumar',
    subtitle: 'Computer Science · Networks & Software Eng',
    avatarInitials: 'SK',
    color: 'from-blue-600 to-indigo-500',
    accentColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 border-blue-500/30',
  },
  // Admin
  {
    role: 'admin',
    label: 'Admin',
    email: 'admin@edupulse.edu',
    password: 'admin@123',
    name: 'Campus Administrator',
    subtitle: 'EduPulse AI · Full Access',
    avatarInitials: 'CA',
    color: 'from-teal-600 to-emerald-500',
    accentColor: 'text-teal-400',
    badgeBg: 'bg-teal-500/10 border-teal-500/30',
  },
  // Training & Placement Officer (TPO)
  {
    role: 'tpo',
    label: 'TPO',
    email: 'tpo@edupulse.edu',
    password: 'tpo@123',
    name: 'Prof. Vikram Malhotra',
    subtitle: 'Training & Placement Officer · Corporate Relations',
    avatarInitials: 'VM',
    color: 'from-amber-600 to-orange-500',
    accentColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/30',
  },
];

// --- The logged-in demo student ---
export const DEMO_STUDENT = {
  id: 'EP-CS-021',
  name: 'Arjun Sharma',
  department: 'Computer Science',
  academic_year: '3rd Year',
  semester: 'Sem 5',
  email: 'arjun.sharma21@edupulse.edu',
  roll_no: 'CS21B021',
  phone: '+91 9876543210',
  dob: '2003-04-15',
  address: 'Chennai, Tamil Nadu',
  guardian: 'Rajesh Sharma',
  avatar_initials: 'AS',

  // Academic
  cgpa: 7.8,
  sgpa_history: [
    { semester: 'Sem 1', sgpa: 8.2 },
    { semester: 'Sem 2', sgpa: 7.9 },
    { semester: 'Sem 3', sgpa: 7.6 },
    { semester: 'Sem 4', sgpa: 7.8 },
    { semester: 'Sem 5', sgpa: 7.8 },
  ],
  backlogs: 0,
  internal_marks: 72,

  // Current semester subjects
  subjects: [
    { code: 'CS501', name: 'Machine Learning', faculty: 'Dr. Priya Menon',   test1: 18, test2: 19, assignment: 9,  practical: 24, internal_pct: 78, grade: 'B+', status: 'Safe' },
    { code: 'CS502', name: 'Computer Networks', faculty: 'Prof. Suresh Kumar',  test1: 15, test2: 16, assignment: 8,  practical: 22, internal_pct: 68, grade: 'B',  status: 'Watch' },
    { code: 'CS503', name: 'Operating Systems',  faculty: 'Dr. Anita Bose',    test1: 20, test2: 19, assignment: 10, practical: 25, internal_pct: 84, grade: 'A',  status: 'Safe' },
    { code: 'CS504', name: 'Database Systems',   faculty: 'Dr. Priya Menon',   test1: 17, test2: 18, assignment: 9,  practical: 23, internal_pct: 74, grade: 'B+', status: 'Safe' },
    { code: 'CS505', name: 'Software Engineering',faculty: 'Prof. Suresh Kumar', test1: 16, test2: 17, assignment: 8,  practical: 21, internal_pct: 70, grade: 'B',  status: 'Safe' },
  ],

  // Attendance
  overall_attendance: 78,
  classes_conducted: 120,
  classes_attended: 94,
  subject_attendance: [
    { subject: 'Machine Learning',     pct: 85, conducted: 24, attended: 20, status: 'Safe' },
    { subject: 'Computer Networks',    pct: 71, conducted: 24, attended: 17, status: 'Low' },
    { subject: 'Operating Systems',    pct: 88, conducted: 24, attended: 21, status: 'Safe' },
    { subject: 'Database Systems',     pct: 75, conducted: 24, attended: 18, status: 'Safe' },
    { subject: 'Software Engineering', pct: 71, conducted: 24, attended: 17, status: 'Low' },
  ],

  // LMS
  lms_logins: 18,
  assignment_completion: 80,

  // Engagement
  events_participated: 3,
  club_participation: 1,
  hackathons: 1,
  certifications: 2,

  // Placement
  aptitude_score: 65,
  coding_score: 58,
  mock_interview_score: 62,
  placement_prep: true,

  // Skills
  technical_skill_score: 68,
  soft_skill_score: 72,

  // Feedback
  student_satisfaction: 4.0,
  faculty_feedback: 'Good' as const,

  // Success score (pre-computed)
  success_score: 72,
  academic_risk: 'Low' as const,
  placement_risk: 'Moderate' as const,
};

export type StudentPortalProfile = typeof DEMO_STUDENT;

// Converts ANY student record (from 100 campus students) into full student portal profile
export function getStudentPortalData(input?: string | UnifiedStudent | null): StudentPortalProfile {
  if (!input) return DEMO_STUDENT;

  let st: UnifiedStudent | undefined;
  if (typeof input === 'object' && input !== null && 'student_id' in input) {
    st = input;
  } else if (typeof input === 'string') {
    const q = input.trim().toLowerCase();
    st = INITIAL_STUDENTS.find(s =>
      s.student_id.toLowerCase() === q ||
      s.email.toLowerCase() === q ||
      s.name.toLowerCase() === q ||
      s.name.toLowerCase().includes(q)
    );
  }

  if (!st || st.student_id === 'STU001') {
    return DEMO_STUDENT;
  }

  // Derive department-specific subjects & faculty
  const dept = st.department;
  const isCS = dept === 'Computer Science';
  const isIT = dept === 'Information Technology';
  const isEC = dept === 'Electronics & Comm.';

  const subjectTemplates = isCS ? [
    { code: 'CS501', name: 'Machine Learning', faculty: 'Dr. Priya Menon' },
    { code: 'CS502', name: 'Computer Networks', faculty: 'Prof. Suresh Kumar' },
    { code: 'CS503', name: 'Operating Systems', faculty: 'Dr. Anita Bose' },
    { code: 'CS504', name: 'Database Systems', faculty: 'Dr. Priya Menon' },
    { code: 'CS505', name: 'Software Engineering', faculty: 'Prof. Suresh Kumar' },
  ] : isIT ? [
    { code: 'IT401', name: 'Cloud Computing', faculty: 'Prof. Suresh Kumar' },
    { code: 'IT402', name: 'Web Architecture', faculty: 'Dr. Priya Menon' },
    { code: 'IT403', name: 'Database Engineering', faculty: 'Dr. Priya Menon' },
    { code: 'IT404', name: 'Network Security', faculty: 'Dr. Anita Bose' },
    { code: 'IT405', name: 'DevOps Pipelines', faculty: 'Prof. Suresh Kumar' },
  ] : isEC ? [
    { code: 'EC501', name: 'Digital Signal Processing', faculty: 'Dr. Anita Bose' },
    { code: 'EC502', name: 'Embedded Systems', faculty: 'Prof. Suresh Kumar' },
    { code: 'EC503', name: 'VLSI Design', faculty: 'Dr. Priya Menon' },
    { code: 'EC504', name: 'Microcontrollers', faculty: 'Prof. Suresh Kumar' },
    { code: 'EC505', name: 'Communication Networks', faculty: 'Dr. Anita Bose' },
  ] : [
    { code: 'ME301', name: 'Applied Mechanics', faculty: 'Dr. Anita Bose' },
    { code: 'ME302', name: 'Thermodynamics', faculty: 'Prof. Suresh Kumar' },
    { code: 'ME303', name: 'Manufacturing Systems', faculty: 'Dr. Priya Menon' },
    { code: 'ME304', name: 'Fluid Mechanics', faculty: 'Prof. Suresh Kumar' },
    { code: 'ME305', name: 'Engineering Design', faculty: 'Dr. Anita Bose' },
  ];

  const baseInternal = st.academic?.internal_marks ?? 72;
  const baseAttendance = st.attendance?.overall_attendance ?? 75;
  const cgpa = st.academic?.cgpa ?? 7.5;
  const backlogs = st.academic?.backlogs ?? 0;

  // Build subject scores based on actual student performance
  const subjects = subjectTemplates.map((sub, idx) => {
    const variance = (idx % 2 === 0 ? 1 : -1) * (idx * 3);
    const internalPct = Math.max(35, Math.min(98, Math.round(baseInternal + variance)));
    const test1 = Math.max(8, Math.min(20, Math.round((internalPct / 100) * 20)));
    const test2 = Math.max(8, Math.min(20, Math.round((internalPct / 100) * 19) + (idx % 2 === 0 ? 1 : 0)));
    const assignment = Math.max(4, Math.min(10, Math.round((internalPct / 100) * 10)));
    const practical = Math.max(10, Math.min(25, Math.round((internalPct / 100) * 25)));

    const grade = internalPct >= 85 ? 'A+' : internalPct >= 75 ? 'A' : internalPct >= 65 ? 'B+' : internalPct >= 55 ? 'B' : 'C';
    const status: 'Safe' | 'Watch' | 'Critical' = internalPct >= 75 ? 'Safe' : internalPct >= 60 ? 'Watch' : 'Critical';

    return {
      ...sub,
      test1,
      test2,
      assignment,
      practical,
      internal_pct: internalPct,
      grade,
      status,
    };
  });

  const subjectAttendance = subjects.map((sub, idx) => {
    const variance = (idx % 2 === 0 ? 3 : -4) * (idx + 1);
    const pct = Math.max(30, Math.min(100, Math.round(baseAttendance + variance)));
    const conducted = 24;
    const attended = Math.round((pct / 100) * conducted);
    return {
      subject: sub.name,
      pct,
      conducted,
      attended,
      status: pct >= 75 ? ('Safe' as const) : ('Low' as const),
    };
  });

  // Calculate initials
  const initials = st.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';
  const rollNo = (isCS ? 'CS' : isIT ? 'IT' : isEC ? 'EC' : 'ME') +
    '2' + (st.academic_year.includes('1') ? '5' : st.academic_year.includes('2') ? '4' : st.academic_year.includes('3') ? '3' : '2') +
    'B0' + st.student_id.replace('STU', '').padStart(2, '0');

  // SGPA history
  const semNum = parseInt(st.semester.replace('Sem ', '')) || 5;
  const sgpaHistory = Array.from({ length: semNum }, (_, i) => {
    const factor = (i === semNum - 1) ? 0 : (i % 2 === 0 ? 0.2 : -0.2);
    const sgpa = Math.max(4.0, Math.min(10.0, parseFloat((cgpa + factor).toFixed(2))));
    return {
      semester: `Sem ${i + 1}`,
      sgpa,
    };
  });

  const conducted = 120;
  const attended = Math.round((baseAttendance / 100) * conducted);

  return {
    id: st.student_id,
    name: st.name,
    department: st.department,
    academic_year: st.academic_year,
    semester: st.semester,
    email: st.email,
    roll_no: rollNo,
    phone: `+91 90000 000${st.student_id.replace('STU', '').padStart(2, '0')}`,
    dob: '2003-08-20',
    address: 'Campus Hostel Block 4, Mumbai',
    guardian: `${st.name.split(' ').pop()} Family`,
    avatar_initials: initials,

    cgpa,
    sgpa_history: sgpaHistory,
    backlogs,
    internal_marks: baseInternal,

    subjects,
    overall_attendance: baseAttendance,
    classes_conducted: conducted,
    classes_attended: attended,
    subject_attendance: subjectAttendance,

    lms_logins: st.lms?.lms_logins ?? 16,
    assignment_completion: Math.round(st.lms?.assignment_completion ?? 78),

    events_participated: st.engagement?.events_participated ?? 2,
    club_participation: st.engagement?.club_participation ?? 1,
    hackathons: st.engagement?.hackathons ?? 0,
    certifications: st.engagement?.certifications ?? 1,

    aptitude_score: st.placement?.aptitude_score ?? 65,
    coding_score: st.placement?.coding_score ?? 58,
    mock_interview_score: st.placement?.mock_interview_score ?? 62,
    placement_prep: st.placement?.placement_preparation_participation ?? true,

    technical_skill_score: st.skills?.technical_skill_score ?? 68,
    soft_skill_score: st.skills?.soft_skill_score ?? 70,

    student_satisfaction: st.feedback?.student_satisfaction ?? 4.0,
    faculty_feedback: (st.feedback?.faculty_feedback as any) || 'Good',

    success_score: Math.max(45, Math.min(99, Math.round(cgpa * 9.5 + (baseAttendance > 75 ? 3 : -4)))),
    academic_risk: (backlogs > 0 || baseAttendance < 65 || cgpa < 5.8 ? 'High' : (baseAttendance < 75 || cgpa < 6.8) ? 'Moderate' : 'Low') as any,
    placement_risk: (cgpa < 6.0 || (st.placement?.coding_score && st.placement.coding_score < 50) ? 'High' : cgpa < 7.2 ? 'Moderate' : 'Low') as any,
  };
}

// Monthly internal marks trend (for analytics)
export const MONTHLY_MARKS = [
  { month: 'Jun', marks: 68 },
  { month: 'Jul', marks: 72 },
  { month: 'Aug', marks: 70 },
  { month: 'Sep', marks: 75 },
  { month: 'Oct', marks: 72 },
];

// Monthly attendance trend
export const MONTHLY_ATTENDANCE = [
  { month: 'Jun', pct: 80 },
  { month: 'Jul', pct: 75 },
  { month: 'Aug', pct: 82 },
  { month: 'Sep', pct: 76 },
  { month: 'Oct', pct: 78 },
];

// Assessment history
export const ASSESSMENT_HISTORY = [
  { date: '2025-09-28', subject: 'Operating Systems',   type: 'Test 2',     score: 19, max: 20, pct: 95 },
  { date: '2025-09-22', subject: 'Machine Learning',    type: 'Test 2',     score: 19, max: 20, pct: 95 },
  { date: '2025-09-15', subject: 'Database Systems',    type: 'Assignment', score: 9,  max: 10, pct: 90 },
  { date: '2025-09-10', subject: 'Computer Networks',   type: 'Test 2',     score: 16, max: 20, pct: 80 },
  { date: '2025-08-30', subject: 'Software Engineering',type: 'Test 1',     score: 16, max: 20, pct: 80 },
  { date: '2025-08-20', subject: 'Machine Learning',    type: 'Test 1',     score: 18, max: 20, pct: 90 },
  { date: '2025-08-15', subject: 'Operating Systems',   type: 'Test 1',     score: 20, max: 20, pct: 100},
];

// Attendance calendar (October 2025)
export const ATTENDANCE_CALENDAR_OCT: Record<string, 'present' | 'absent' | 'holiday' | 'partial'> = {
  '2025-10-01': 'present',
  '2025-10-02': 'present',
  '2025-10-03': 'present',
  '2025-10-06': 'present',
  '2025-10-07': 'absent',
  '2025-10-08': 'present',
  '2025-10-09': 'present',
  '2025-10-13': 'holiday',
  '2025-10-14': 'present',
  '2025-10-15': 'present',
  '2025-10-16': 'partial',
  '2025-10-17': 'present',
  '2025-10-20': 'present',
  '2025-10-21': 'absent',
  '2025-10-22': 'present',
  '2025-10-23': 'present',
  '2025-10-24': 'present',
};

// Day-wise lecture details
export const DAY_LECTURES: Record<string, Array<{subject: string; time: string; faculty: string; status: 'Present' | 'Absent' | 'Holiday'}>> = {
  '2025-10-07': [
    { subject: 'Machine Learning',    time: '9:00–10:00',   faculty: 'Dr. Priya Menon',    status: 'Absent' },
    { subject: 'Computer Networks',   time: '10:00–11:00',  faculty: 'Prof. Suresh Kumar', status: 'Absent' },
    { subject: 'Operating Systems',   time: '11:00–12:00',  faculty: 'Dr. Anita Bose',     status: 'Absent' },
  ],
  '2025-10-01': [
    { subject: 'Database Systems',    time: '9:00–10:00',   faculty: 'Dr. Priya Menon',    status: 'Present' },
    { subject: 'Software Engineering',time: '10:00–11:00',  faculty: 'Prof. Suresh Kumar', status: 'Present' },
    { subject: 'Machine Learning',    time: '2:00–3:00',    faculty: 'Dr. Priya Menon',    status: 'Present' },
  ],
};

// --- Faculty Demo Data ---
export const DEMO_FACULTY = [
  { id: 'FAC-01', name: 'Dr. Priya Menon',    department: 'Computer Science', designation: 'Associate Professor & ML Lead', subjects: ['Machine Learning', 'Database Systems'], students_count: 54, avatar_initials: 'PM' },
  { id: 'FAC-02', name: 'Prof. Suresh Kumar', department: 'Computer Science', designation: 'Assistant Professor · Networks', subjects: ['Computer Networks', 'Software Engineering'], students_count: 48, avatar_initials: 'SK' },
  { id: 'FAC-03', name: 'Dr. Anita Bose',     department: 'Computer Science', designation: 'Professor · Systems & OS', subjects: ['Operating Systems', 'Algorithm Design'], students_count: 52, avatar_initials: 'AB' },
  { id: 'FAC-04', name: 'Dr. Rajesh Verma',   department: 'Computer Science', designation: 'Professor · AI Systems', subjects: ['Artificial Intelligence', 'Data Science'], students_count: 60, avatar_initials: 'RV' },
];

export const DEMO_FACULTY_CURRENT = DEMO_FACULTY[0];

// Faculty student list (shared across faculty pages)
export const FACULTY_STUDENTS = Array.from({ length: 32 }, (_, i) => {
  const names = [
    'Arjun Sharma', 'Ananya Verma', 'Rohan Patel', 'Priya Reddy', 'Aditya Iyer',
    'Diya Nair', 'Karan Singh', 'Sneha Chopra', 'Vikram Gupta', 'Isha Mehta',
    'Rahul Kulkarni', 'Pooja Deshmukh', 'Kunal Joshi', 'Anika Bose', 'Dhruv Chatterjee',
    'Sanya Rao', 'Harsh Sharma', 'Tara Verma', 'Rishi Patel', 'Kavya Reddy',
    'Nikhil Iyer', 'Simran Nair', 'Dev Singh', 'Shreya Chopra', 'Gaurav Gupta',
    'Riya Mehta', 'Siddharth Kulkarni', 'Tanvi Deshmukh', 'Varun Joshi', 'Meera Bose',
    'Rahul Chatterjee', 'Isha Rao',
  ];
  const cgpas = [8.2,7.9,6.5,8.8,5.8,7.2,6.1,8.5,7.8,6.9,5.5,8.1,7.4,6.8,8.3,7.1,5.2,8.7,7.5,6.3,8.0,7.3,6.6,8.4,7.6,5.9,8.6,7.0,6.2,8.9,7.7,6.4];
  const attends = [85,78,65,92,58,76,62,88,78,70,55,83,74,68,86,72,52,91,76,63,81,74,67,87,77,60,89,71,64,93,79,66];
  const backlogs = [0,0,2,0,3,0,1,0,0,1,4,0,0,1,0,0,5,0,0,2,0,0,1,0,0,3,0,0,2,0,0,1];
  const risks = ['Low','Low','Moderate','Low','High','Low','Moderate','Low','Low','Low','High','Low','Low','Moderate','Low','Low','High','Low','Low','Moderate','Low','Low','Moderate','Low','Low','High','Low','Low','Moderate','Low','Low','Moderate'] as const;
  
  return {
    roll: `CS21B0${String(i + 1).padStart(2, '0')}`,
    name: names[i] || `Student ${i+1}`,
    cgpa: cgpas[i] || 7.0,
    backlogs: backlogs[i] || 0,
    attendance: attends[i] || 75,
    risk: risks[i] || 'Low',
    attendance_oct: {
      '2025-10-01': i % 5 === 0 ? 'Absent' : 'Present',
      '2025-10-02': i % 7 === 1 ? 'Absent' : 'Present',
      '2025-10-06': i % 4 === 2 ? 'Absent' : 'Present',
      '2025-10-07': i % 3 === 0 ? 'Absent' : 'Present',
      '2025-10-08': 'Present',
      '2025-10-09': i % 6 === 1 ? 'Absent' : 'Present',
    } as Record<string, 'Present' | 'Absent' | 'Holiday'>,
  };
});

export type ProblemPriority = 'Important' | 'Medium' | 'Low';

export type ProblemCategory =
  | 'Academic Doubt'
  | 'Attendance Shortage'
  | 'Lab & Practical'
  | 'Exam & Marks'
  | 'Assignment Submission'
  | 'Career & Placement'
  | 'General Query';

export const PROBLEM_CATEGORIES: { id: ProblemCategory; label: string; description: string }[] = [
  { id: 'Academic Doubt', label: 'Academic Doubt', description: 'Concept, theory, or syllabus doubts' },
  { id: 'Attendance Shortage', label: 'Attendance Shortage', description: 'Attendance deficit, medical leave reconciliation' },
  { id: 'Lab & Practical', label: 'Lab & Practical', description: 'Code debugging, lab experiments, viva queries' },
  { id: 'Exam & Marks', label: 'Exam & Marks', description: 'Mid-term, internal marks review, exam doubts' },
  { id: 'Assignment Submission', label: 'Assignment Submission', description: 'Extensions, problem statements, portal upload' },
  { id: 'Career & Placement', label: 'Career & Placement', description: 'Internship NOC, placement drive preparation' },
  { id: 'General Query', label: 'General Query', description: 'Campus facilities, timetable, administrative queries' },
];

export interface ProblemRequest {
  id: string;
  student: string;
  roll: string;
  subject: string;
  topic: string;
  faculty: string;
  description: string;
  category: ProblemCategory;
  priority: ProblemPriority;
  status: 'Pending' | 'In Progress' | 'Resolved';
  submitted: string;
  reply: string;
  next_step: string;
}

// Problem requests (submitted by students)
export const DEMO_PROBLEMS: ProblemRequest[] = [
  {
    id: 'REQ-001',
    student: 'Arjun Sharma',
    roll: 'CS21B021',
    subject: 'Computer Networks',
    topic: 'Subnetting & VLSM confusion',
    faculty: 'Prof. Suresh Kumar',
    description: 'I am struggling to understand variable-length subnet masking (VLSM) and how to correctly allocate IP addresses across multiple subnets for next week\'s lab exam.',
    category: 'Academic Doubt',
    priority: 'Important',
    status: 'In Progress',
    submitted: '2025-10-05',
    reply: 'I will schedule an extra session on Thursday at 4pm. Please review the first 3 chapters before then.',
    next_step: 'Attend extra session on 2025-10-10',
  },
  {
    id: 'REQ-002',
    student: 'Ananya Verma',
    roll: 'CS21B002',
    subject: 'Machine Learning',
    topic: 'Gradient descent implementation failing',
    faculty: 'Dr. Priya Menon',
    description: 'My implementation of gradient descent is not converging for the assignment. I have checked the learning rate multiple times but the cost function oscillates.',
    category: 'Lab & Practical',
    priority: 'Medium',
    status: 'Pending',
    submitted: '2025-10-07',
    reply: '',
    next_step: '',
  },
  {
    id: 'REQ-003',
    student: 'Rohan Patel',
    roll: 'CS21B003',
    subject: 'Operating Systems',
    topic: 'Process scheduling preemptive examples',
    faculty: 'Dr. Anita Bose',
    description: 'I do not understand the difference between preemptive and non-preemptive scheduling with regard to the Gantt chart examples shown in lecture 8.',
    category: 'Academic Doubt',
    priority: 'Low',
    status: 'Resolved',
    submitted: '2025-09-28',
    reply: 'Great question. Preemptive means the OS can interrupt a running process. Check lecture 9 slides for the diagram — it should clarify things.',
    next_step: 'Resolved. Check lecture 9.',
  },
  {
    id: 'REQ-004',
    student: 'Arjun Sharma',
    roll: 'CS21B021',
    subject: 'Computer Networks',
    topic: 'Attendance reconciliation for medical leave',
    faculty: 'Prof. Suresh Kumar',
    description: 'I was on certified medical leave from Oct 1 to Oct 4 due to viral fever. Requesting attendance reconciliation for missed lectures to keep attendance above 75%.',
    category: 'Attendance Shortage',
    priority: 'Important',
    status: 'In Progress',
    submitted: '2025-10-08',
    reply: 'Medical certificate received and sent to HOD office for condonation approval.',
    next_step: 'Verification pending with Academic Dean',
  },
  {
    id: 'REQ-005',
    student: 'Arjun Sharma',
    roll: 'CS21B021',
    subject: 'Machine Learning',
    topic: 'Dynamic programming assignment test cases',
    faculty: 'Dr. Priya Menon',
    description: 'Could you please clarify whether negative weights are allowed in problem 2 of the reinforcement learning baseline assignment?',
    category: 'Assignment Submission',
    priority: 'Low',
    status: 'Resolved',
    submitted: '2025-10-02',
    reply: 'No, all weights are strictly non-negative as specified in Section 2.1.',
    next_step: 'Submit by Friday 11:59 PM',
  },
];

// Progress tracker recommendations
export const RECOMMENDATIONS = [
  {
    id: 'REC-01',
    category: 'Placement',
    title: 'Strengthen Coding Skills',
    evidence: 'Coding score (58/100) is below the 65-point threshold typically expected for campus placements.',
    action: 'Complete 3 LeetCode easy problems daily and join the weekly coding contest.',
    priority: 'High' as const,
  },
  {
    id: 'REC-02',
    category: 'Attendance',
    title: 'Improve Computer Networks Attendance',
    evidence: 'Computer Networks attendance is 71% — below the 75% institutional threshold.',
    action: 'Attend all remaining classes for this subject to avoid debarment from exams.',
    priority: 'High' as const,
  },
  {
    id: 'REC-03',
    category: 'Academic',
    title: 'Focus on Software Engineering',
    evidence: 'Internal percentage in Software Engineering (70%) is the lowest across subjects.',
    action: 'Review missed assignments and prepare for the next unit test thoroughly.',
    priority: 'Medium' as const,
  },
  {
    id: 'REC-04',
    category: 'Engagement',
    title: 'Consider Earning an Industry Certification',
    evidence: 'You have 2 certifications — adding one more relevant to your placement domain could strengthen your profile.',
    action: 'Explore AWS Cloud Practitioner or Google Data Analytics certificate programs.',
    priority: 'Low' as const,
  },
];
