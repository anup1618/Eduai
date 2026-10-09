import { UnifiedStudent, Department, AcademicYear, Semester } from '../types/student';

// ─── Dataset Column Mapping ────────────────────────────────────────────────────
// Source columns: StudentID | Full Name | Email | Age | Gender | Phone | City |
//   Course | Year of Study | Semester | Attendance% | Assignments Completed (÷10→%) |
//   Internal Marks | Backlogs | Scholarship | Enrollment Status | Gap Years | Risk Level
//
// Course → Department mapping:
//   B Tech CSE        → Computer Science
//   B Tech IT         → Information Technology
//   B Sc IT           → Information Technology
//   B Tech AI & DS    → Computer Science
//   BCA               → Computer Science
//   B Sc Computer Sc. → Computer Science
//   B Com             → Mechanical Eng.   (closest non-tech dept available)
//   BBA               → Civil Eng.        (closest non-tech dept available)
// ──────────────────────────────────────────────────────────────────────────────

function courseToMeta(course: string, yearNum: number): {
  department: Department;
  academic_year: AcademicYear;
  semester: Semester;
} {
  let department: Department;
  if (course === 'B Tech CSE' || course === 'BCA' || course === 'B Sc Computer Science' || course === 'B Tech AI & DS') {
    department = 'Computer Science';
  } else if (course === 'B Tech IT' || course === 'B Sc IT') {
    department = 'Information Technology';
  } else if (course === 'B Com') {
    department = 'Mechanical Eng.';
  } else if (course === 'BBA') {
    department = 'Civil Eng.';
  } else {
    department = 'Electronics & Comm.';
  }

  const yearMap: AcademicYear[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const academic_year = yearMap[Math.min(yearNum - 1, 3)];

  // Derive semester from year (each year = 2 sems; odd sem = first half)
  const semBase = (yearNum - 1) * 2 + 1;
  const semLabel = `Sem ${semBase}` as Semester;

  return { department, academic_year, semester: semLabel };
}

function riskToFaculty(risk: string): 'Excellent' | 'Good' | 'Average' | 'Needs Attention' {
  if (risk === 'High') return 'Needs Attention';
  if (risk === 'Medium') return 'Average';
  return 'Good';
}

function riskToSatisfaction(risk: string): number {
  if (risk === 'High') return 2.8;
  if (risk === 'Medium') return 3.4;
  return 4.2;
}

function assignmentPctFromRaw(raw: number): number {
  // Dataset stores assignments completed as e.g. 6.8 out of 10 → convert to %
  return Math.round(raw * 10);
}

function deriveScores(attendance: number, internalMarks: number, backlogs: number, risk: string) {
  // Derive correlated placement / skill scores from available data
  const base = (attendance * 0.4 + internalMarks * 0.6) / 100;
  const riskPenalty = risk === 'High' ? 0.75 : risk === 'Medium' ? 0.88 : 1.0;
  const backlogPenalty = Math.max(0.7, 1 - backlogs * 0.08);
  const factor = base * riskPenalty * backlogPenalty;

  const aptitude_score = Math.round(40 + factor * 58);
  const coding_score   = Math.round(35 + factor * 62);
  const mock_interview_score = Math.round(38 + factor * 55);
  const technical_skill_score = Math.round(42 + factor * 55);
  const soft_skill_score = Math.round(50 + factor * 45);
  const lms_logins = Math.max(2, Math.round(factor * 30));
  const events_participated = risk === 'Low' ? 2 : risk === 'Medium' ? 1 : 0;
  const certifications = risk === 'Low' ? 2 : risk === 'Medium' ? 1 : 0;

  return {
    aptitude_score,
    coding_score,
    mock_interview_score,
    technical_skill_score,
    soft_skill_score,
    lms_logins,
    events_participated,
    certifications,
  };
}

function computeDataQuality(fields: (number | boolean | null | undefined)[]): {
  available_fields: number;
  total_fields: number;
  missing_fields: string[];
  data_completeness_percentage: number;
  has_minimum_evidence: boolean;
} {
  const labels = ['CGPA', 'Internal Marks', 'Backlogs', 'Attendance', 'LMS Logins', 'Aptitude Score', 'Coding Score', 'Technical Skills', 'Soft Skills', 'Satisfaction'];
  const available = fields.filter(f => f !== null && f !== undefined).length;
  const total = fields.length;
  const missing = labels.filter((_, i) => fields[i] === null || fields[i] === undefined);
  const pct = Math.round((available / total) * 100);
  return {
    available_fields: available,
    total_fields: total,
    missing_fields: missing,
    data_completeness_percentage: pct,
    has_minimum_evidence: pct >= 50,
  };
}

// ─── Raw Dataset (50 Students) ─────────────────────────────────────────────────
// Parsed from provided spreadsheet image
// Columns: id | name | email | age | gender | phone | city | course | year | sem | attendance | assignments(raw/10) | internalMarks | backlogs | scholarship | enrollmentStatus | gapYears | risk

const RAW_STUDENTS = [
  { id: 'STU001', name: 'Arjun Sharma',      email: 'aarav.sharma019@example.com',      age: 19, gender: 'Male',   phone: '9000000001', city: 'Mumbai',       course: 'B Tech CSE',           year: 3, sem: 5, attendance: 85, assignments: 6.8, internalMarks: 82, backlogs: 0, scholarship: false, enrolled: true, gapYears: 2, risk: 'Medium' },
  { id: 'STU002', name: 'Priya Singh',       email: 'priya.singh02@example.com',        age: 21, gender: 'Female', phone: '9000000002', city: 'Kolhapur',     course: 'B Sc IT',              year: 2, sem: 4, attendance: 68, assignments: 8.1, internalMarks: 60, backlogs: 1, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU003', name: 'Rohan Verma',       email: 'rohan.verma03@example.com',        age: 20, gender: 'Male',   phone: '9000000003', city: 'Nagpur',       course: 'B Com',                year: 3, sem: 5, attendance: 79, assignments: 7.2, internalMarks: 70, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU004', name: 'Ananya Singh',      email: 'ananya.singh04@example.com',       age: 21, gender: 'Female', phone: '9000000004', city: 'Pune',         course: 'B Tech IT',            year: 4, sem: 7, attendance: 72, assignments: 6.6, internalMarks: 70, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Medium' },
  { id: 'STU005', name: 'Kabir Khan',        email: 'kabir.khan05@example.com',         age: 21, gender: 'Male',   phone: '9000000005', city: 'Vitar',        course: 'BCA',                  year: 4, sem: 7, attendance: 79, assignments: 7.6, internalMarks: 70, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU006', name: 'Sneha Joshi',       email: 'sneha.joshi06@example.com',        age: 20, gender: 'Female', phone: '9000000006', city: 'Mumbai',       course: 'B Tech CSE',           year: 4, sem: 7, attendance: 82, assignments: 8.2, internalMarks: 78, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU007', name: 'Aditya Shah',       email: 'aditya.shah07@example.com',        age: 22, gender: 'Male',   phone: '9000000007', city: 'Nashik',       course: 'B Sc IT',              year: 1, sem: 1, attendance: 50, assignments: 6.4, internalMarks: 55, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'High' },
  { id: 'STU008', name: 'Isha Deshmukh',     email: 'isha.deshmukh08@example.com',      age: 20, gender: 'Female', phone: '9000000008', city: 'Kalyan',       course: 'B Com',                year: 4, sem: 8, attendance: 79, assignments: 7.7, internalMarks: 77, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU009', name: 'Aaditya More',      email: 'aaditya.more09@example.com',       age: 21, gender: 'Male',   phone: '9000000009', city: 'Pune',         course: 'BBA',                  year: 2, sem: 3, attendance: 77, assignments: 7.7, internalMarks: 65, backlogs: 1, scholarship: false, enrolled: true, gapYears: 0, risk: 'Medium' },
  { id: 'STU010', name: 'Anisha Shah',       email: 'anisha.shah10@example.com',        age: 20, gender: 'Female', phone: '9000000010', city: 'Aurangabad',   course: 'BCA',                  year: 3, sem: 5, attendance: 75, assignments: 6.5, internalMarks: 68, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU011', name: 'Arjun Kulkarni',    email: 'arjun.kulkarni11@example.com',     age: 23, gender: 'Male',   phone: '9000000011', city: 'Mumbai',       course: 'B Tech CSE',           year: 3, sem: 6, attendance: 86, assignments: 6.2, internalMarks: 95, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU012', name: 'Kavya Mehta',       email: 'kavya.mehta12@example.com',        age: 21, gender: 'Female', phone: '9000000012', city: 'Thane',        course: 'B Sc Computer Science', year: 4, sem: 7, attendance: 81, assignments: 8.2, internalMarks: 85, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU013', name: 'Saurabh Yadav',     email: 'saurabh.yadav13@example.com',      age: 22, gender: 'Male',   phone: '9000000013', city: 'Nashik',       course: 'B Tech AI & DS',       year: 4, sem: 7, attendance: 79, assignments: 5.7, internalMarks: 75, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Medium' },
  { id: 'STU014', name: 'Aditi Reddy',       email: 'aditi.reddy14@example.com',        age: 20, gender: 'Female', phone: '9000000014', city: 'Thane',        course: 'BCA',                  year: 2, sem: 4, attendance: 66, assignments: 7.3, internalMarks: 98, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU015', name: 'Ishan Naik',        email: 'ishan.naik15@example.com',         age: 21, gender: 'Male',   phone: '9000000015', city: 'Aurangabad',   course: 'BBA',                  year: 2, sem: 4, attendance: 84, assignments: 8.4, internalMarks: 80, backlogs: 0, scholarship: true,  enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU016', name: 'Devyansh Yadav',    email: 'devyansh.yadav16@example.com',     age: 20, gender: 'Male',   phone: '9000000016', city: 'Nashik',       course: 'B Tech IT',            year: 2, sem: 4, attendance: 79, assignments: 6.6, internalMarks: 70, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU017', name: 'Dev Chavan',        email: 'dev.chavan17@example.com',         age: 25, gender: 'Male',   phone: '9000000017', city: 'Pune',         course: 'B Sc Computer Science', year: 3, sem: 5, attendance: 66, assignments: 8.2, internalMarks: 72, backlogs: 2, scholarship: false, enrolled: true, gapYears: 2, risk: 'Medium' },
  { id: 'STU018', name: 'Neha Jadhav',       email: 'neha.jadhav18@example.com',        age: 21, gender: 'Female', phone: '9000000018', city: 'Aurangabad',   course: 'BCA',                  year: 1, sem: 1, attendance: 91, assignments: 5.6, internalMarks: 48, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'High' },
  { id: 'STU019', name: 'Keshav Malhotra',   email: 'keshav.malhotra19@example.com',    age: 20, gender: 'Male',   phone: '9000000019', city: 'Aurangabad',   course: 'BBA',                  year: 1, sem: 1, attendance: 88, assignments: 5.8, internalMarks: 60, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'High' },
  { id: 'STU020', name: 'Riya Bansal',       email: 'riya.bansal20@example.com',        age: 20, gender: 'Female', phone: '9000000020', city: 'Nashik',       course: 'BBA',                  year: 2, sem: 4, attendance: 69, assignments: 5.5, internalMarks: 85, backlogs: 1, scholarship: false, enrolled: true, gapYears: 0, risk: 'High' },
  { id: 'STU021', name: 'Atharva Mahonia',   email: 'atharva.mahonia21@example.com',    age: 22, gender: 'Male',   phone: '9000000021', city: 'Nashik',       course: 'B Tech IT',            year: 3, sem: 5, attendance: 79, assignments: 9.1, internalMarks: 68, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU022', name: 'Tanvi Sood',        email: 'tanvi.sood22@example.com',         age: 22, gender: 'Female', phone: '9000000022', city: 'Nagpur',       course: 'BCA',                  year: 1, sem: 2, attendance: 75, assignments: 5.3, internalMarks: 65, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU023', name: 'Yash Thakur',       email: 'yash.thakur23@example.com',        age: 23, gender: 'Male',   phone: '9000000023', city: 'Nagpur',       course: 'B Tech AI & DS',       year: 3, sem: 5, attendance: 68, assignments: 9.3, internalMarks: 60, backlogs: 0, scholarship: false, enrolled: true, gapYears: 1, risk: 'Medium' },
  { id: 'STU024', name: 'Tanu Sawant',       email: 'tanu.sawant24@example.com',        age: 21, gender: 'Female', phone: '9000000024', city: 'Vitar',        course: 'B Com',                year: 3, sem: 6, attendance: 51, assignments: 6.7, internalMarks: 52, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Medium' },
  { id: 'STU025', name: 'Om Gandhi',         email: 'om.gandhi25@example.com',          age: 20, gender: 'Male',   phone: '9000000025', city: 'Vitar',        course: 'B Tech CSE',           year: 2, sem: 4, attendance: 88, assignments: 9.5, internalMarks: 90, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU026', name: 'Simran Saxena',     email: 'simran.saxena26@example.com',      age: 20, gender: 'Female', phone: '9000000026', city: 'Navi Mumbai',  course: 'B Tech IT',            year: 2, sem: 4, attendance: 79, assignments: 4.0, internalMarks: 60, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU027', name: 'Rahul Roy',         email: 'rahul.roy27@example.com',          age: 21, gender: 'Male',   phone: '9000000027', city: 'Vitar',        course: 'BBA',                  year: 1, sem: 2, attendance: 50, assignments: 8.5, internalMarks: 73, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'High' },
  { id: 'STU028', name: 'Disha Kapoor',      email: 'disha.kapoor28@example.com',       age: 20, gender: 'Female', phone: '9000000028', city: 'Vitar',        course: 'BCA',                  year: 4, sem: 7, attendance: 88, assignments: 6.5, internalMarks: 80, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU029', name: 'Siddharth Bhat',    email: 'siddharth.bhat29@example.com',     age: 23, gender: 'Male',   phone: '9000000029', city: 'Aurangabad',   course: 'B Sc IT',              year: 1, sem: 1, attendance: 76, assignments: 9.1, internalMarks: 77, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU030', name: 'Nisha Shenoy',      email: 'nisha.shenoy30@example.com',       age: 21, gender: 'Female', phone: '9000000030', city: 'Kalyan',       course: 'B Tech IT',            year: 3, sem: 5, attendance: 55, assignments: 6.9, internalMarks: 60, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU031', name: 'Manasi Bane',       email: 'manasi.bane31@example.com',        age: 21, gender: 'Female', phone: '9000000031', city: 'Mumbai',       course: 'B Tech IT',            year: 1, sem: 2, attendance: 75, assignments: 7.5, internalMarks: 65, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU032', name: 'Shreya Naik',       email: 'shreya.naik32@example.com',        age: 20, gender: 'Female', phone: '9000000032', city: 'Kolhapur',     course: 'B Sc Computer Science', year: 4, sem: 7, attendance: 79, assignments: 9.0, internalMarks: 89, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU033', name: 'Kunal Bose',        email: 'kunal.bose33@example.com',         age: 21, gender: 'Male',   phone: '9000000033', city: 'Mumbai',       course: 'B Sc IT',              year: 2, sem: 3, attendance: 63, assignments: 3.5, internalMarks: 50, backlogs: 2, scholarship: false, enrolled: true, gapYears: 0, risk: 'High' },
  { id: 'STU034', name: 'Lalita Goel',       email: 'lalita.goel34@example.com',        age: 20, gender: 'Female', phone: '9000000034', city: 'Mumbai',       course: 'B Tech CSE',           year: 4, sem: 8, attendance: 79, assignments: 9.4, internalMarks: 88, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU035', name: 'Harsh Kale',        email: 'harsh.kale35@example.com',         age: 23, gender: 'Male',   phone: '9000000035', city: 'Vitar',        course: 'B Com',                year: 2, sem: 4, attendance: 91, assignments: 8.7, internalMarks: 97, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU036', name: 'Ayesha Mane',       email: 'ayesha.mane36@example.com',        age: 21, gender: 'Female', phone: '9000000036', city: 'Navi Mumbai',  course: 'B Tech IT',            year: 2, sem: 4, attendance: 97, assignments: 6.7, internalMarks: 91, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU037', name: 'Varun Shimpi',      email: 'varun.shimpi37@example.com',       age: 22, gender: 'Male',   phone: '9000000037', city: 'Vitar',        course: 'B Sc IT',              year: 1, sem: 1, attendance: 50, assignments: 9.7, internalMarks: 45, backlogs: 1, scholarship: false, enrolled: true, gapYears: 0, risk: 'High' },
  { id: 'STU038', name: 'Pallavi D\'Souza',  email: 'pallavi.dsouza38@example.com',     age: 20, gender: 'Female', phone: '9000000038', city: 'Kalyan',       course: 'B Tech CSE',           year: 2, sem: 4, attendance: 73, assignments: 6.5, internalMarks: 59, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'High' },
  { id: 'STU039', name: 'Varun Pillai',      email: 'varun.pillai39@example.com',       age: 22, gender: 'Male',   phone: '9000000039', city: 'Vitar',        course: 'BCA',                  year: 1, sem: 1, attendance: 56, assignments: 7.3, internalMarks: 33, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'High' },
  { id: 'STU040', name: 'Ritu Tiwari',       email: 'ritu.tiwari40@example.com',        age: 20, gender: 'Female', phone: '9000000040', city: 'Nashik',       course: 'B Tech IT',            year: 4, sem: 7, attendance: 75, assignments: 8.7, internalMarks: 87, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU041', name: 'Samar Gokhale',     email: 'samar.gokhale41@example.com',      age: 23, gender: 'Male',   phone: '9000000041', city: 'Mumbai',       course: 'BCA',                  year: 1, sem: 1, attendance: 52, assignments: 3.5, internalMarks: 85, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU042', name: 'Tanya Banerjee',    email: 'tanya.banerjee42@example.com',     age: 21, gender: 'Female', phone: '9000000042', city: 'Kolhapur',     course: 'B Com',                year: 2, sem: 3, attendance: 53, assignments: 5.7, internalMarks: 55, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU043', name: 'Nikhil Kumar',      email: 'nikhil.kumar43@example.com',       age: 22, gender: 'Male',   phone: '9000000043', city: 'Nagpur',       course: 'B Tech CSE',           year: 1, sem: 1, attendance: 85, assignments: 8.1, internalMarks: 69, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'High' },
  { id: 'STU044', name: 'Anika Pradhan',     email: 'anika.pradhan44@example.com',      age: 20, gender: 'Female', phone: '9000000044', city: 'Thane',        course: 'B Sc IT',              year: 4, sem: 8, attendance: 85, assignments: 8.1, internalMarks: 78, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Low' },
  { id: 'STU045', name: 'Parth Koli',        email: 'parth.koli45@example.com',         age: 21, gender: 'Male',   phone: '9000000045', city: 'Nagpur',       course: 'B Tech AI & DS',       year: 1, sem: 1, attendance: 61, assignments: 5.6, internalMarks: 40, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'High' },
  { id: 'STU046', name: 'Vedant Rane',       email: 'vedant.rane46@example.com',        age: 20, gender: 'Male',   phone: '9000000046', city: 'Nagpur',       course: 'B Com',                year: 2, sem: 3, attendance: 72, assignments: 5.8, internalMarks: 70, backlogs: 0, scholarship: false, enrolled: true, gapYears: 0, risk: 'Medium' },
  { id: 'STU047', name: 'Vedant Ghosh',      email: 'vedant.ghosh47@example.com',       age: 23, gender: 'Male',   phone: '9000000047', city: 'Pune',         course: 'BBA',                  year: 3, sem: 5, attendance: 55, assignments: 7.2, internalMarks: 48, backlogs: 2, scholarship: false, enrolled: true, gapYears: 2, risk: 'High' },
  { id: 'STU048', name: 'Pooja Kulkarni',    email: 'pooja.kulkarni48@example.com',     age: 21, gender: 'Female', phone: '9000000048', city: 'Kolhapur',     course: 'B Tech CSE',           year: 3, sem: 5, attendance: 58, assignments: 3.4, internalMarks: 55, backlogs: 2, scholarship: false, enrolled: true, gapYears: 0, risk: 'High' },
  { id: 'STU049', name: 'Akash Bhane',       email: 'akash.bhane49@example.com',        age: 22, gender: 'Male',   phone: '9000000049', city: 'Nagpur',       course: 'B Sc Computer Science', year: 2, sem: 3, attendance: 63, assignments: 7.9, internalMarks: 48, backlogs: 2, scholarship: false, enrolled: true, gapYears: 0, risk: 'Medium' },
  { id: 'STU050', name: 'Sarika Kamble',     email: 'sarika.kamble50@example.com',      age: 20, gender: 'Female', phone: '9000000050', city: 'Nashik',       course: 'B Tech AI & DS',       year: 2, sem: 3, attendance: 63, assignments: 7.7, internalMarks: 72, backlogs: 1, scholarship: false, enrolled: true, gapYears: 0, risk: 'Medium' },
];

// ─── Transform Raw Dataset → UnifiedStudent[] ─────────────────────────────────

function buildStudents(): UnifiedStudent[] {
  return RAW_STUDENTS.map((raw, idx) => {
    const { department, academic_year, semester } = courseToMeta(raw.course, raw.year);

    // Convert raw assignment score (out of 10) to percentage
    const assignment_completion = assignmentPctFromRaw(raw.assignments);

    // CGPA derived from internal marks (scale 0–100 → 0–10)
    const cgpa = Math.round((raw.internalMarks / 10) * 10) / 10;

    const derived = deriveScores(raw.attendance, raw.internalMarks, raw.backlogs, raw.risk);

    const faculty_feedback = riskToFaculty(raw.risk);
    const student_satisfaction = riskToSatisfaction(raw.risk);

    // Interventions for at-risk students
    const interventions: UnifiedStudent['interventions'] = [];
    if (raw.risk === 'High' || raw.backlogs > 1 || raw.attendance < 60) {
      const interventionTypes = [
        raw.backlogs > 0 ? 'Academic Mentoring' : raw.attendance < 60 ? 'Attendance Support' : 'Counseling',
      ];
      const descriptions = [
        raw.backlogs > 0
          ? `Remedial tutoring scheduled for ${raw.backlogs} uncleared subject(s).`
          : raw.attendance < 60
          ? 'Attendance alert issued. Mentor counseling and weekly attendance tracking active.'
          : 'Risk assessment triggered. Counseling and goal-setting session scheduled.',
      ];
      interventions.push({
        id: `INT-${raw.id}`,
        category: interventionTypes[0],
        description: descriptions[0],
        faculty_assigned: 'Dr. S. Ramanathan',
        target_date: '2026-11-30',
        status: idx % 3 === 0 ? 'Completed' : idx % 2 === 0 ? 'In Progress' : 'Planned',
        created_at: '2026-09-15',
        follow_up_notes: ['Initial counseling completed. Progress tracked weekly.'],
      });
    }

    const qFields = [cgpa, raw.internalMarks, raw.backlogs, raw.attendance, derived.lms_logins, derived.aptitude_score, derived.coding_score, derived.technical_skill_score, derived.soft_skill_score, student_satisfaction];
    const dq = computeDataQuality(qFields);

    const student: UnifiedStudent = {
      student_id: raw.id,
      name: raw.name,
      department,
      academic_year,
      semester,
      email: raw.email,

      academic: {
        cgpa,
        internal_marks: raw.internalMarks,
        backlogs: raw.backlogs,
      },

      attendance: {
        overall_attendance: raw.attendance,
      },

      lms: {
        lms_logins: derived.lms_logins,
        assignment_completion,
      },

      engagement: {
        events_participated: derived.events_participated,
        club_participation: raw.risk === 'Low' ? 1 : 0,
        hackathons: raw.risk === 'Low' && raw.internalMarks > 75 ? 1 : 0,
        certifications: derived.certifications,
      },

      placement: {
        aptitude_score: derived.aptitude_score,
        coding_score: derived.coding_score,
        mock_interview_score: derived.mock_interview_score,
        placement_preparation_participation: raw.risk !== 'High',
      },

      skills: {
        technical_skill_score: derived.technical_skill_score,
        soft_skill_score: derived.soft_skill_score,
      },

      feedback: {
        student_satisfaction,
        faculty_feedback,
      },

      data_quality: dq,
      interventions,
    };

    return student;
  });
}

export const INITIAL_STUDENTS: UnifiedStudent[] = buildStudents();
