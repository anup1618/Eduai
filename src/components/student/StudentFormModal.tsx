import React, { useState, useEffect, useMemo } from 'react';
import { UnifiedStudent, Department, AcademicYear, Semester } from '../../types/student';
import { useCampusData } from '../../context/CampusDataContext';
import {
  X,
  User,
  GraduationCap,
  Calendar,
  Briefcase,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Save,
  Sparkles,
  Info,
} from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: UnifiedStudent | null;
  onSaved?: (student: UnifiedStudent) => void;
}

const DEPARTMENTS: Department[] = [
  'Computer Science',
  'Information Technology',
  'Electronics & Comm.',
  'Mechanical Eng.',
  'Civil Eng.',
];

const YEARS: AcademicYear[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS: Semester[] = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSaved,
}) => {
  const { saveStudent, students } = useCampusData();
  const isEditMode = Boolean(initialData);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'basic' | 'academics' | 'attendance' | 'placement' | 'skills' | 'feedback'>('basic');

  // Form states
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<Department>('Computer Science');
  const [academicYear, setAcademicYear] = useState<AcademicYear>('3rd Year');
  const [semester, setSemester] = useState<Semester>('Sem 6');

  // Academics
  const [cgpa, setCgpa] = useState<string>('');
  const [internalMarks, setInternalMarks] = useState<string>('');
  const [backlogs, setBacklogs] = useState<string>('0');

  // Attendance & LMS
  const [attendance, setAttendance] = useState<string>('');
  const [lmsLogins, setLmsLogins] = useState<string>('');
  const [assignmentCompletion, setAssignmentCompletion] = useState<string>('');

  // Engagement
  const [events, setEvents] = useState<string>('0');
  const [clubs, setClubs] = useState<string>('0');
  const [hackathons, setHackathons] = useState<string>('0');
  const [certifications, setCertifications] = useState<string>('0');

  // Placement
  const [aptitudeScore, setAptitudeScore] = useState<string>('');
  const [codingScore, setCodingScore] = useState<string>('');
  const [mockInterviewScore, setMockInterviewScore] = useState<string>('');
  const [placementPrep, setPlacementPrep] = useState<boolean>(true);

  // Skills
  const [technicalSkills, setTechnicalSkills] = useState<string>('');
  const [softSkills, setSoftSkills] = useState<string>('');

  // Feedback
  const [studentSatisfaction, setStudentSatisfaction] = useState<string>('4');
  const [facultyFeedback, setFacultyFeedback] = useState<'Excellent' | 'Good' | 'Average' | 'Needs Attention'>('Good');

  // Status & error state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-generate ID in create mode if empty
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setActiveTab('basic');

      if (initialData) {
        setStudentId(initialData.student_id);
        setName(initialData.name);
        setEmail(initialData.email || '');
        setDepartment(initialData.department);
        setAcademicYear(initialData.academic_year);
        setSemester(initialData.semester);

        setCgpa(initialData.academic.cgpa !== null ? String(initialData.academic.cgpa) : '');
        setInternalMarks(initialData.academic.internal_marks !== null ? String(initialData.academic.internal_marks) : '');
        setBacklogs(initialData.academic.backlogs !== null ? String(initialData.academic.backlogs) : '0');

        setAttendance(initialData.attendance.overall_attendance !== null ? String(initialData.attendance.overall_attendance) : '');
        setLmsLogins(initialData.lms.lms_logins !== null ? String(initialData.lms.lms_logins) : '');
        setAssignmentCompletion(initialData.lms.assignment_completion !== null ? String(initialData.lms.assignment_completion) : '');

        setEvents(String(initialData.engagement.events_participated || 0));
        setClubs(String(initialData.engagement.club_participation || 0));
        setHackathons(String(initialData.engagement.hackathons || 0));
        setCertifications(String(initialData.engagement.certifications || 0));

        setAptitudeScore(initialData.placement.aptitude_score !== null ? String(initialData.placement.aptitude_score) : '');
        setCodingScore(initialData.placement.coding_score !== null ? String(initialData.placement.coding_score) : '');
        setMockInterviewScore(initialData.placement.mock_interview_score !== null ? String(initialData.placement.mock_interview_score) : '');
        setPlacementPrep(initialData.placement.placement_preparation_participation ?? true);

        setTechnicalSkills(initialData.skills.technical_skill_score !== null ? String(initialData.skills.technical_skill_score) : '');
        setSoftSkills(initialData.skills.soft_skill_score !== null ? String(initialData.skills.soft_skill_score) : '');

        setStudentSatisfaction(initialData.feedback.student_satisfaction !== null ? String(initialData.feedback.student_satisfaction) : '4');
        setFacultyFeedback(initialData.feedback.faculty_feedback || 'Good');
      } else {
        // Auto-suggest next sequential ID
        const existingNums = students
          .map(s => {
            const m = s.student_id.match(/\d+/);
            return m ? parseInt(m[0], 10) : 0;
          })
          .filter(n => !isNaN(n));
        const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
        const suggestedId = `STU${String(nextNum).padStart(3, '0')}`;

        setStudentId(suggestedId);
        setName('');
        setEmail(`${suggestedId.toLowerCase()}@edupulse.edu`);
        setDepartment('Computer Science');
        setAcademicYear('3rd Year');
        setSemester('Sem 6');

        setCgpa('7.85');
        setInternalMarks('76');
        setBacklogs('0');

        setAttendance('82');
        setLmsLogins('45');
        setAssignmentCompletion('85');

        setEvents('2');
        setClubs('1');
        setHackathons('1');
        setCertifications('2');

        setAptitudeScore('75');
        setCodingScore('70');
        setMockInterviewScore('72');
        setPlacementPrep(true);

        setTechnicalSkills('75');
        setSoftSkills('78');

        setStudentSatisfaction('4');
        setFacultyFeedback('Good');
      }
    }
  }, [isOpen, initialData, students]);

  // Real-time completeness calculation
  const completeness = useMemo(() => {
    const fields = [
      cgpa !== '',
      internalMarks !== '',
      backlogs !== '',
      attendance !== '',
      lmsLogins !== '',
      assignmentCompletion !== '',
      events !== '',
      aptitudeScore !== '',
      codingScore !== '',
      mockInterviewScore !== '',
      technicalSkills !== '',
      softSkills !== '',
      studentSatisfaction !== '',
    ];
    const available = fields.filter(Boolean).length;
    return Math.round((available / fields.length) * 100);
  }, [
    cgpa,
    internalMarks,
    backlogs,
    attendance,
    lmsLogins,
    assignmentCompletion,
    events,
    aptitudeScore,
    codingScore,
    mockInterviewScore,
    technicalSkills,
    softSkills,
    studentSatisfaction,
  ]);

  if (!isOpen) return null;

  const parseNumOrNull = (val: string, min = 0, max = 100): number | null => {
    if (val.trim() === '') return null;
    const n = parseFloat(val);
    if (isNaN(n)) return null;
    return Math.max(min, Math.min(max, n));
  };

  const parseCount = (val: string): number => {
    const n = parseInt(val, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const sId = studentId.trim().toUpperCase();
    if (!sId) {
      setErrorMessage('Student Roll / ID is required.');
      setActiveTab('basic');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Student Full Name is required.');
      setActiveTab('basic');
      return;
    }

    // Check duplicate ID in create mode
    if (!isEditMode && students.some(s => s.student_id.toUpperCase() === sId)) {
      setErrorMessage(`A student with ID "${sId}" already exists. Please choose a unique ID.`);
      setActiveTab('basic');
      return;
    }

    setIsSubmitting(true);

    try {
      const studentPayload: UnifiedStudent = {
        student_id: sId,
        name: name.trim(),
        department,
        academic_year: academicYear,
        semester,
        email: email.trim() || `${sId.toLowerCase()}@edupulse.edu`,
        academic: {
          cgpa: parseNumOrNull(cgpa, 0, 10),
          internal_marks: parseNumOrNull(internalMarks, 0, 100),
          backlogs: parseCount(backlogs),
          subject_performance: initialData?.academic.subject_performance || [],
        },
        attendance: {
          overall_attendance: parseNumOrNull(attendance, 0, 100),
          subject_attendance: initialData?.attendance.subject_attendance || {},
        },
        lms: {
          lms_logins: parseNumOrNull(lmsLogins, 0, 5000),
          assignment_completion: parseNumOrNull(assignmentCompletion, 0, 100),
        },
        engagement: {
          events_participated: parseCount(events),
          club_participation: parseCount(clubs),
          hackathons: parseCount(hackathons),
          certifications: parseCount(certifications),
        },
        placement: {
          aptitude_score: parseNumOrNull(aptitudeScore, 0, 100),
          coding_score: parseNumOrNull(codingScore, 0, 100),
          mock_interview_score: parseNumOrNull(mockInterviewScore, 0, 100),
          placement_preparation_participation: placementPrep,
        },
        skills: {
          technical_skill_score: parseNumOrNull(technicalSkills, 0, 100),
          soft_skill_score: parseNumOrNull(softSkills, 0, 100),
        },
        feedback: {
          student_satisfaction: parseNumOrNull(studentSatisfaction, 1, 5),
          faculty_feedback: facultyFeedback,
        },
        data_quality: {
          available_fields: 13,
          total_fields: 13,
          missing_fields: [],
          data_completeness_percentage: completeness,
          has_minimum_evidence: completeness >= 50,
        },
        interventions: initialData?.interventions || [],
      };

      const res = await saveStudent(studentPayload);
      if (res.success) {
        setSuccessMessage(
          isEditMode
            ? `Student "${name}" updated successfully in Central Database!`
            : `Student "${name}" (${sId}) added successfully to Central Database!`
        );

        if (onSaved) {
          onSaved(res.data || studentPayload);
        }

        setTimeout(() => {
          setIsSubmitting(false);
          onClose();
        }, 800);
      } else {
        setErrorMessage(res.error || 'Failed to save student record to database.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-card-hover/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text">
                {isEditMode ? `Edit Student: ${initialData?.name}` : 'Manually Add Student Record'}
              </h3>
              <p className="text-xs text-text-muted">
                {isEditMode
                  ? 'Update metrics and sync changes directly to Central Database'
                  : 'Add a new institutional student profile with full metric persistence'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                completeness >= 80
                  ? 'bg-status-success/15 border-status-success/30 text-status-success'
                  : completeness >= 50
                  ? 'bg-status-warning/15 border-status-warning/30 text-status-warning'
                  : 'bg-status-danger/15 border-status-danger/30 text-status-danger'
              }`}
            >
              {completeness}% Completeness
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-card border border-transparent hover:border-border transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-border bg-card overflow-x-auto">
          {[
            { id: 'basic', label: '1. Identity', icon: User },
            { id: 'academics', label: '2. Academics', icon: GraduationCap },
            { id: 'attendance', label: '3. Attendance & LMS', icon: Calendar },
            { id: 'placement', label: '4. Placement', icon: Briefcase },
            { id: 'skills', label: '5. Skills', icon: Activity },
            { id: 'feedback', label: '6. Feedback', icon: Sparkles },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-transparent text-text-muted hover:text-text hover:bg-card-hover'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body / Tab Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-status-danger/15 border border-status-danger/30 flex items-center gap-2 text-status-danger text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-status-success/15 border border-status-success/30 flex items-center gap-2 text-status-success text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: IDENTITY & ENROLLMENT */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Institutional Identity</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Student ID / Roll No <span className="text-status-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    disabled={isEditMode}
                    placeholder="e.g. STU051"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm font-mono focus:outline-none focus:border-accent disabled:opacity-60"
                    required
                  />
                  <p className="text-[10px] text-text-muted mt-1">Unique primary key stored in Central Database</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Full Name <span className="text-status-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Aditi Sharma"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Institutional Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. aditi.sharma@edupulse.edu"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Department</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value as Department)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm focus:outline-none focus:border-accent"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Academic Year</label>
                  <select
                    value={academicYear}
                    onChange={e => setAcademicYear(e.target.value as AcademicYear)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm focus:outline-none focus:border-accent"
                  >
                    {YEARS.map(y => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={e => setSemester(e.target.value as Semester)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm focus:outline-none focus:border-accent"
                  >
                    {SEMESTERS.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC PERFORMANCE */}
          {activeTab === 'academics' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Academic Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Cumulative GPA (0.0 - 10.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={e => setCgpa(e.target.value)}
                    placeholder="e.g. 8.45"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm font-semibold focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] text-text-muted mt-1">Weight in success score: 35%</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Internal Exam Marks (0 - 100)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={internalMarks}
                    onChange={e => setInternalMarks(e.target.value)}
                    placeholder="e.g. 78"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] text-text-muted mt-1">Midterm & sessionals avg</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Active Backlogs Count</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={backlogs}
                    onChange={e => setBacklogs(e.target.value)}
                    placeholder="e.g. 0"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] text-text-muted mt-1">&gt; 0 flags academic risk</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE & LMS */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Attendance & Digital Engagement</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Overall Attendance (0 - 100%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={attendance}
                    onChange={e => setAttendance(e.target.value)}
                    placeholder="e.g. 84.5"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm font-semibold focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] text-text-muted mt-1">&lt; 75% flags attendance risk</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">LMS Logins Count</label>
                  <input
                    type="number"
                    min="0"
                    value={lmsLogins}
                    onChange={e => setLmsLogins(e.target.value)}
                    placeholder="e.g. 48"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] text-text-muted mt-1">Portal access activity</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Assignment Completion (0 - 100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={assignmentCompletion}
                    onChange={e => setAssignmentCompletion(e.target.value)}
                    placeholder="e.g. 90"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] text-text-muted mt-1">Submitted coursework ratio</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Extracurricular Activity Counts</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">Events Participated</label>
                    <input
                      type="number"
                      min="0"
                      value={events}
                      onChange={e => setEvents(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">Club Activities</label>
                    <input
                      type="number"
                      min="0"
                      value={clubs}
                      onChange={e => setClubs(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">Hackathons</label>
                    <input
                      type="number"
                      min="0"
                      value={hackathons}
                      onChange={e => setHackathons(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">Certifications</label>
                    <input
                      type="number"
                      min="0"
                      value={certifications}
                      onChange={e => setCertifications(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PLACEMENT READINESS */}
          {activeTab === 'placement' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Placement & Career Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Aptitude Score (0 - 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={aptitudeScore}
                    onChange={e => setAptitudeScore(e.target.value)}
                    placeholder="e.g. 74"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm font-semibold focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Coding Score (0 - 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={codingScore}
                    onChange={e => setCodingScore(e.target.value)}
                    placeholder="e.g. 80"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm font-semibold focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Mock Interview Score (0 - 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={mockInterviewScore}
                    onChange={e => setMockInterviewScore(e.target.value)}
                    placeholder="e.g. 72"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm font-semibold focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="placementPrep"
                  checked={placementPrep}
                  onChange={e => setPlacementPrep(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <label htmlFor="placementPrep" className="text-xs font-semibold text-text cursor-pointer">
                  Student is actively attending institutional Placement Preparation drives
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: SKILLS ASSESSMENT */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Skills Evaluation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Technical Skills Score (0 - 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={technicalSkills}
                    onChange={e => setTechnicalSkills(e.target.value)}
                    placeholder="e.g. 78"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm font-semibold focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] text-text-muted mt-1">Evaluated across core discipline competencies</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Soft Skills Score (0 - 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={softSkills}
                    onChange={e => setSoftSkills(e.target.value)}
                    placeholder="e.g. 82"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm font-semibold focus:outline-none focus:border-accent"
                  />
                  <p className="text-[10px] text-text-muted mt-1">Communication, teamwork, presentation</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FEEDBACK & REMARKS */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Satisfaction & Faculty Mentorship</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Student Satisfaction Rating (1 to 5 Stars)</label>
                  <select
                    value={studentSatisfaction}
                    onChange={e => setStudentSatisfaction(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Highly Satisfied</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Satisfied</option>
                    <option value="3">⭐⭐⭐ 3 - Neutral</option>
                    <option value="2">⭐⭐ 2 - Dissatisfied</option>
                    <option value="1">⭐ 1 - Highly Dissatisfied</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Faculty Advisor Mentorship Evaluation</label>
                  <select
                    value={facultyFeedback}
                    onChange={e => setFacultyFeedback(e.target.value as any)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-text text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="Excellent">⭐ Excellent - Proactive learner with strong initiative</option>
                    <option value="Good">👍 Good - Consistent coursework and positive conduct</option>
                    <option value="Average">⚖️ Average - Meets baseline expectations</option>
                    <option value="Needs Attention">⚠️ Needs Attention - Requires faculty mentoring & monitoring</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Info className="w-3.5 h-3.5 text-accent" />
              <span>Data is validated and committed directly to Central Database</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-text-muted hover:text-text hover:bg-card-hover border border-border transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-accent text-accent-contrast hover:opacity-90 transition shadow-lg shadow-accent/20 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Record...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditMode ? 'Update Record in Central Database' : 'Save Student Record'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
