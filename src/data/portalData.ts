/**
 * Portal Data — shared demo student/faculty data for Student and Faculty portals.
 * All data is synthetic demo data. No real student information.
 */

export type PortalRole = 'login' | 'student' | 'faculty' | 'admin';

// ─── Demo Credentials ──────────────────────────────────────────────────────────
// Used by the LoginPage to authenticate demo users.
export interface DemoCredential {
  role: Exclude<PortalRole, 'login'>;
  label: string;
  email: string;
  password: string;
  name: string;
  subtitle: string;
  avatarInitials: string;
  color: string;        // Tailwind gradient classes
  accentColor: string;  // Tailwind text color class for badge
  badgeBg: string;      // Tailwind bg class for badge
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    role: 'student',
    label: 'Student',
    email: 'arjun.sharma@edupulse.edu',
    password: 'student@123',
    name: 'Arjun Sharma',
    subtitle: 'B Tech CSE · 3rd Year · STU001',
    avatarInitials: 'AS',
    color: 'from-blue-600 to-cyan-500',
    accentColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30',
  },
  {
    role: 'faculty',
    label: 'Faculty',
    email: 'priya.menon@edupulse.edu',
    password: 'faculty@123',
    name: 'Dr. Priya Menon',
    subtitle: 'Computer Science · Machine Learning',
    avatarInitials: 'PM',
    color: 'from-violet-600 to-purple-500',
    accentColor: 'text-violet-400',
    badgeBg: 'bg-violet-500/10 border-violet-500/30',
  },
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
  { id: 'FAC-01', name: 'Dr. Priya Menon',    department: 'Computer Science', subjects: ['Machine Learning', 'Database Systems'], students_count: 54, avatar_initials: 'PM' },
  { id: 'FAC-02', name: 'Prof. Suresh Kumar', department: 'Computer Science', subjects: ['Computer Networks', 'Software Engineering'], students_count: 54, avatar_initials: 'SK' },
  { id: 'FAC-03', name: 'Dr. Anita Bose',     department: 'Computer Science', subjects: ['Operating Systems', 'Algorithm Design'], students_count: 54, avatar_initials: 'AB' },
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

export interface ProblemRequest {
  id: string;
  student: string;
  roll: string;
  subject: string;
  topic: string;
  faculty: string;
  description: string;
  priority: 'Normal' | 'Important';
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
    topic: 'Subnetting confusion',
    faculty: 'Prof. Suresh Kumar',
    description: 'I am struggling to understand variable-length subnet masking (VLSM) and how to correctly allocate IP addresses across multiple subnets.',
    priority: 'Important' as const,
    status: 'In Progress' as const,
    submitted: '2025-10-05',
    reply: 'I will schedule an extra session on Thursday at 4pm. Please review the first 3 chapters before then.',
    next_step: 'Attend extra session on 2025-10-10',
  },
  {
    id: 'REQ-002',
    student: 'Ananya Verma',
    roll: 'CS21B002',
    subject: 'Machine Learning',
    topic: 'Gradient descent implementation',
    faculty: 'Dr. Priya Menon',
    description: 'My implementation of gradient descent is not converging for the assignment. I have checked the code multiple times but the loss keeps increasing.',
    priority: 'Important' as const,
    status: 'Pending' as const,
    submitted: '2025-10-07',
    reply: '',
    next_step: '',
  },
  {
    id: 'REQ-003',
    student: 'Rohan Patel',
    roll: 'CS21B003',
    subject: 'Operating Systems',
    topic: 'Process scheduling',
    faculty: 'Dr. Anita Bose',
    description: 'I do not understand the difference between preemptive and non-preemptive scheduling with regard to the examples in lecture 8.',
    priority: 'Normal' as const,
    status: 'Resolved' as const,
    submitted: '2025-09-28',
    reply: 'Great question. Preemptive means the OS can interrupt a running process. Check lecture 9 slides for the diagram — it should clarify things.',
    next_step: 'Resolved. Check lecture 9.',
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
