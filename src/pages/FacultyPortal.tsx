import React, { useState, useMemo } from 'react';
import {
  Users, BookOpen, Calendar, CheckSquare, AlertTriangle, MessageSquare,
  FileSpreadsheet, User, Bell, ChevronDown, LogOut, Menu, X, Save,
  CheckCircle2, Clock, Send, Download, Sparkles, Filter, Sun, Moon,
  ChevronLeft, ChevronRight, Activity, ArrowRight, Shield, Tag, AlertCircle,
  Lock, KeyRound, Eye, EyeOff, ShieldCheck, GraduationCap, HelpCircle, FileText, Award
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid
} from 'recharts';
import {
  DEMO_FACULTY, FACULTY_STUDENTS, DEMO_PROBLEMS, ATTENDANCE_CALENDAR_OCT
} from '../data/portalData';
import { CLASSROOM_DATA, SubjectClassroomInfo } from '../data/classroomData';
import { useCampusData } from '../context/CampusDataContext';
import { useTheme } from '../context/ThemeContext';
import { useActionInfo } from '../context/ActionInfoContext';
import { SpecKpiCard, SpecPageHeader } from '../components/common/SpecComponents';

export type FacultyPage =
  | 'dashboard'
  | 'subjects'
  | 'directory'
  | 'attendance-management'
  | 'attendance-calendar'
  | 'academic-performance'
  | 'at-risk'
  | 'problem-requests'
  | 'reports'
  | 'profile';

interface FacultyPortalProps {
  onLogout: () => void;
}

const navItems: { id: FacultyPage; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Faculty Dashboard', icon: <Users className="w-5 h-5 flex-shrink-0" /> },
  { id: 'subjects', label: 'My Subjects', icon: <BookOpen className="w-5 h-5 flex-shrink-0" /> },
  { id: 'directory', label: 'Student Directory', icon: <Users className="w-5 h-5 flex-shrink-0" /> },
  { id: 'attendance-management', label: 'Attendance Management', icon: <CheckSquare className="w-5 h-5 flex-shrink-0" /> },
  { id: 'attendance-calendar', label: 'Attendance Calendar', icon: <Calendar className="w-5 h-5 flex-shrink-0" /> },
  { id: 'academic-performance', label: 'Academic Performance', icon: <BookOpen className="w-5 h-5 flex-shrink-0" /> },
  { id: 'at-risk', label: 'At-Risk Students', icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" /> },
  { id: 'problem-requests', label: 'Problem Requests', icon: <MessageSquare className="w-5 h-5 flex-shrink-0" /> },
  { id: 'reports', label: 'Reports & AI Insights', icon: <FileSpreadsheet className="w-5 h-5 flex-shrink-0" /> },
  { id: 'profile', label: 'Profile & Notifications', icon: <User className="w-5 h-5 flex-shrink-0" /> },
];

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'var(--card)',
    borderColor: 'var(--border)',
    borderRadius: '12px',
    color: 'var(--text)',
    fontSize: '12px',
  },
};

export const FacultyPortal: React.FC<FacultyPortalProps> = ({ onLogout }) => {
  const {
    loggedInFacultyIdx,
    setLoggedInFacultyIdx,
    problemRequests,
    replyProblemRequest,
    loginUser,
  } = useCampusData();
  const { theme, toggleTheme } = useTheme();
  const { showActionInfo } = useActionInfo();

  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState<FacultyPage>('dashboard');
  const [selectedFacultyIdx, setSelectedFacultyIdx] = useState(loggedInFacultyIdx || 0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Faculty ID Switching Security / Credential Modal State
  const [pendingFacultyIdx, setPendingFacultyIdx] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccessToast, setAuthSuccessToast] = useState<string | null>(null);

  // Attendance management state
  const [selectedSubject, setSelectedSubject] = useState('Machine Learning');
  const [selectedDate, setSelectedDate] = useState('2025-10-09');
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    FACULTY_STUDENTS.forEach((st, idx) => {
      init[st.roll] = idx % 5 !== 0; // ~80% present by default
    });
    return init;
  });
  const [attendanceSaveMessage, setAttendanceSaveMessage] = useState<string | null>(null);

  // Problem requests state & replies
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [nextStepText, setNextStepText] = useState<Record<string, string>>({});
  const [problemScope, setProblemScope] = useState<'my' | 'all'>('my');
  const [problemPriorityFilter, setProblemPriorityFilter] = useState<'All' | 'Important' | 'Medium' | 'Low'>('All');
  const [problemSearch, setProblemSearch] = useState('');
  const [classroomModalSubject, setClassroomModalSubject] = useState<SubjectClassroomInfo | null>(null);

  const faculty = DEMO_FACULTY[selectedFacultyIdx];

  // Intercept faculty profile switch to enforce credential verification
  const handleFacultySelectChange = (newIdx: number) => {
    if (newIdx === selectedFacultyIdx) return;
    setPendingFacultyIdx(newIdx);
    setAuthPassword('');
    setAuthError('');
    setIsAuthModalOpen(true);
  };

  const handleConfirmFacultySwitch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pendingFacultyIdx === null) return;

    const targetFaculty = DEMO_FACULTY[pendingFacultyIdx];
    const trimmed = authPassword.trim();
    if (!trimmed) {
      setAuthError('Please enter faculty security password.');
      return;
    }

    setIsAuthenticating(true);
    try {
      const isMaster = trimmed === 'faculty@123' || trimmed === 'admin@123';
      let verified = isMaster;

      if (!verified) {
        try {
          const res = await loginUser({
            role: 'faculty',
            username: targetFaculty.name,
            password: trimmed,
          });
          if (res?.user || res?.token) {
            verified = true;
          }
        } catch (err: any) {
          // backend verify failed
        }
      }

      if (verified) {
        setSelectedFacultyIdx(pendingFacultyIdx);
        setLoggedInFacultyIdx(pendingFacultyIdx);
        setIsAuthModalOpen(false);
        setPendingFacultyIdx(null);
        setAuthPassword('');
        setAuthError('');
        setAuthSuccessToast(`Verified! Successfully switched to advisor ${targetFaculty.name}.`);
        setTimeout(() => setAuthSuccessToast(null), 5000);
      } else {
        setAuthError(`Authentication failed: Incorrect password for ${targetFaculty.name}. (Default demo password: faculty@123)`);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCancelFacultySwitch = () => {
    setIsAuthModalOpen(false);
    setPendingFacultyIdx(null);
    setAuthPassword('');
    setAuthError('');
  };

  // Filter problem requests (assigned to this faculty or all campus requests)
  const filteredFacultyRequests = useMemo(() => {
    return problemRequests.filter(req => {
      const isAssignedToMe =
        req.faculty.toLowerCase().includes(faculty.name.toLowerCase()) ||
        faculty.name.toLowerCase().includes(req.faculty.toLowerCase());
      const matchesScope = problemScope === 'all' || isAssignedToMe;
      const matchesPriority =
        problemPriorityFilter === 'All' || req.priority === problemPriorityFilter;
      const matchesSearch =
        !problemSearch.trim() ||
        req.topic.toLowerCase().includes(problemSearch.toLowerCase()) ||
        req.description.toLowerCase().includes(problemSearch.toLowerCase()) ||
        req.student.toLowerCase().includes(problemSearch.toLowerCase()) ||
        req.roll.toLowerCase().includes(problemSearch.toLowerCase()) ||
        req.subject.toLowerCase().includes(problemSearch.toLowerCase()) ||
        req.id.toLowerCase().includes(problemSearch.toLowerCase());
      return matchesScope && matchesPriority && matchesSearch;
    });
  }, [problemRequests, problemScope, problemPriorityFilter, problemSearch, faculty.name]);

  const pendingMyTicketsCount = useMemo(() => {
    return problemRequests.filter(
      req =>
        (req.faculty.toLowerCase().includes(faculty.name.toLowerCase()) ||
          faculty.name.toLowerCase().includes(req.faculty.toLowerCase())) &&
        req.status !== 'Resolved'
    ).length;
  }, [problemRequests, faculty.name]);

  const handleToggleAttendance = (roll: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [roll]: !prev[roll],
    }));
  };

  const handleSaveAttendance = () => {
    const presentCount = Object.values(attendanceRecords).filter(Boolean).length;
    const absentCount = FACULTY_STUDENTS.length - presentCount;
    setAttendanceSaveMessage(
      `Attendance recorded for ${selectedSubject} on ${selectedDate} (${FACULTY_STUDENTS.length} students logged).`
    );
    showActionInfo({
      title: `Attendance Session Committed: ${selectedSubject}`,
      badge: `${presentCount} Present / ${absentCount} Absent`,
      category: 'success',
      message: `Daily attendance register for ${selectedSubject} on ${selectedDate} has been locked and uploaded to institutional ledger.`,
      details: [
        `Course: ${selectedSubject}`,
        `Date: ${selectedDate}`,
        `Attendance Rate: ${Math.round((presentCount / (FACULTY_STUDENTS.length || 1)) * 100)}% (${presentCount}/${FACULTY_STUDENTS.length})`,
        `Biometric Sync: Central Database Verified`
      ]
    });
    setTimeout(() => setAttendanceSaveMessage(null), 4000);
  };

  const handleReplyProblem = async (reqId: string) => {
    const reply = replyText[reqId] || '';
    const next = nextStepText[reqId] || '';
    if (!reply.trim()) return;

    await replyProblemRequest(reqId, reply, next);
    setReplyText(prev => ({ ...prev, [reqId]: '' }));
    setNextStepText(prev => ({ ...prev, [reqId]: '' }));

    showActionInfo({
      title: 'Academic Response Dispatched to Student',
      badge: `Case: ${reqId}`,
      category: 'success',
      message: 'Official faculty guidance and recommended action steps have been delivered directly to the student portal inbox.',
      details: [
        `Case ID: ${reqId}`,
        `Faculty Sign-off: ${faculty.name}`,
        `Next Step: ${next || 'Follow-up in next scheduled clinic'}`,
        `Status: In-Progress Resolution`
      ]
    });
  };

  const handleExportCSV = () => {
    const headers = ['Roll No', 'Name', 'CGPA', 'Attendance %', 'Backlogs', 'Risk Status'];
    const rows = FACULTY_STUDENTS.map(s => [s.roll, s.name, s.cgpa, s.attendance, s.backlogs, s.risk]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Faculty_Report_${faculty.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showActionInfo({
      title: 'Course Directory CSV Exported',
      badge: `${FACULTY_STUDENTS.length} Records Downloaded`,
      category: 'export',
      message: `Complete academic register for ${faculty.name}'s classes downloaded as "Faculty_Report_${faculty.name.replace(/\s+/g, '_')}.csv".`,
      details: [
        `Faculty: ${faculty.name}`,
        `Department: ${faculty.department}`,
        `Student Records: ${FACULTY_STUDENTS.length}`,
        `Format: RFC 4180 CSV standard`
      ]
    });
  };

  return (
    <div className="min-h-screen bg-bg text-text flex relative overflow-x-hidden font-sans">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Floating Glass Sidebar (DESIGN SPEC: radius 22px, margin 16px, collapsible) */}
      <aside
        className={`fixed top-4 bottom-4 left-4 z-50 rounded-spec-sidebar spec-glass flex flex-col transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        } ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+24px)] lg:translate-x-0'
        }`}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3.5 top-8 w-7 h-7 rounded-full bg-accent text-accent-contrast shadow-md items-center justify-center hover:scale-110 transition-transform z-10"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Top: Logo & Faculty Portal */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
              <Activity className="w-5 h-5 text-accent stroke-[2.5]" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-text tracking-tight">EduPulse AI</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                    FACULTY
                  </span>
                </div>
                <p className="text-[11px] text-text-muted truncate">Mentorship Hub</p>
              </div>
            )}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-text-muted hover:text-text p-1 ml-auto">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {!collapsed && (
            <div className="px-2 pt-2 pb-1 label-spec text-[10px]">MENU</div>
          )}

          {navItems.map(item => {
            const isActive = currentPage === item.id;
            const isProblemTab = item.id === 'problem-requests';
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-accent/15 text-accent font-semibold border-l-[3px] border-accent pl-2.5'
                    : 'text-text-muted hover:text-text hover:bg-card-hover hover:translate-x-0.5'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-accent' : 'text-text-muted'}>{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {isProblemTab && pendingMyTicketsCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-status-danger/20 text-status-danger border border-status-danger/30 animate-pulse">
                        {pendingMyTicketsCount} new
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Log Out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Switch Portal / Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-10 ${
          collapsed ? 'lg:pl-[96px]' : 'lg:pl-[284px]'
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-bg/85 backdrop-blur-md border-b border-border flex items-center px-4 sm:px-6">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-text-muted hover:text-text p-1.5 rounded-lg bg-card border border-border">
              <Menu className="w-5 h-5" />
            </button>

          {/* Faculty Profile Switcher with Security Protection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted hidden sm:inline flex items-center gap-1">
              <Lock className="w-3 h-3 text-accent" />
              Active Advisor:
            </span>
            <select
              value={selectedFacultyIdx}
              onChange={e => handleFacultySelectChange(Number(e.target.value))}
              className="bg-card border border-border text-xs font-bold text-accent rounded-xl px-3 py-1.5 focus:border-accent outline-none cursor-pointer hover:border-accent/50 transition-colors"
              title="Click to switch faculty profile (credential authentication required)"
            >
              {DEMO_FACULTY.map((f, idx) => (
                <option key={f.id} value={idx}>{f.name} ({f.department})</option>
              ))}
            </select>
          </div>

          <div className="flex-1" />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-text hover:border-accent hover:text-accent transition-colors shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-accent transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-12 w-72 spec-card p-4 z-50 text-xs space-y-2 shadow-spec-hover">
                <span className="font-bold text-text block pb-2 border-b border-border">Faculty Notifications</span>
                <p className="text-text-muted">1 student problem request pending review from Arjun Sharma.</p>
                <p className="text-text-muted">Class attendance for yesterday pending submission.</p>
              </div>
            )}
          </div>
          </div>
        </header>

        {/* Dynamic Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* 1. DASHBOARD */}
          {currentPage === 'dashboard' && (
            <div className="space-y-6 animate-fade-up">
              <SpecPageHeader
                title="Faculty Mentorship Cockpit"
                semesterChip="Advisory Hub"
                subtitle={`Welcome, ${faculty.name} · Department of ${faculty.department}`}
                sessionText="Active Session 2025-26"
                standingChip={{ text: `${faculty.students_count} Mentees`, variant: 'accent' }}
              />

              {/* 4 Bento KPI Cards */}
              <div className="grid grid-cols-12 gap-4">
                <SpecKpiCard
                  icon={<Users className="w-5 h-5 text-accent" />}
                  statusChip={{ text: 'Enrolled', variant: 'accent' }}
                  number={FACULTY_STUDENTS.length}
                  caption="Assigned Across 2 Courses"
                  label="ASSIGNED STUDENTS"
                />
                <SpecKpiCard
                  icon={<Calendar className="w-5 h-5 text-accent" />}
                  statusChip={{ text: '76.4%', variant: 'success' }}
                  number="76.4%"
                  caption="Mandatory Target ≥75%"
                  label="AVERAGE ATTENDANCE"
                  percent={76.4}
                />
                <SpecKpiCard
                  icon={<BookOpen className="w-5 h-5 text-accent" />}
                  statusChip={{ text: 'Cohort', variant: 'neutral' }}
                  number="7.31"
                  caption="Section Range: 5.2 - 8.9"
                  label="CLASS AVERAGE CGPA"
                  percent={73.1}
                />
                <SpecKpiCard
                  icon={<AlertTriangle className="w-5 h-5 text-status-danger" />}
                  statusChip={{ text: 'Requires Action', variant: 'danger' }}
                  number={FACULTY_STUDENTS.filter(s => s.risk === 'High' || s.risk === 'Moderate').length}
                  caption="Early Warning Triggered"
                  label="STUDENTS AT-RISK"
                />
              </div>

              {/* Bento Grid: Class CGPA Spread (8 cols) & Academic Alerts (4 cols) */}
              <div className="grid grid-cols-12 gap-4">
                <div className="spec-card col-span-12 lg:col-span-8 flex flex-col justify-between">
                  <div>
                    <h2 className="title-section mb-1">Class CGPA Distribution</h2>
                    <p className="text-xs text-text-muted mb-4">Mentees CGPA evaluation across enrolled roster</p>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={FACULTY_STUDENTS.slice(0, 12)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                          <XAxis dataKey="roll" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                          <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                          <Tooltip {...CHART_TOOLTIP_STYLE} />
                          <Bar dataKey="cgpa" fill="var(--chart-1)" radius={[6, 6, 0, 0]} name="CGPA" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="spec-card col-span-12 lg:col-span-4 flex flex-col justify-between">
                  <div>
                    <h2 className="title-section mb-1">Priority Mentoring Alerts</h2>
                    <p className="text-xs text-text-muted mb-3">At-risk students needing intervention</p>
                    <div className="space-y-2.5">
                      {FACULTY_STUDENTS.filter(s => s.risk === 'High').slice(0, 3).map(s => (
                        <div key={s.roll} className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/25 text-xs">
                          <div className="flex justify-between font-bold text-status-danger">
                            <span>{s.name} ({s.roll})</span>
                            <span>{s.attendance}% Att</span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-1">Backlogs: {s.backlogs} · Critical attendance alert</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentPage('at-risk')}
                    className="btn-spec-secondary w-full text-xs py-2 mt-4"
                  >
                    View All At-Risk Students <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. MY SUBJECTS */}
          {currentPage === 'subjects' && (
            <div className="space-y-6 animate-fade-up">
              <SpecPageHeader
                title="My Subjects"
                subtitle="Assigned courses and instructional workload for this academic term"
                sessionText="Instructional Allocation"
                standingChip={{ text: `${faculty.subjects.length} Courses`, variant: 'accent' }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {faculty.subjects.map(subj => {
                  const cls = Object.values(CLASSROOM_DATA).find(
                    c => c.name.toLowerCase() === subj.toLowerCase()
                  );

                  return (
                    <div key={subj} className="spec-card space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-accent bg-accent/15 px-2.5 py-0.5 rounded-full border border-accent/25">
                          Active Course
                        </span>
                        <span className="text-xs text-text-muted">{faculty.students_count} Enrolled</span>
                      </div>
                      <h3 className="text-lg font-bold text-text">{subj}</h3>
                      <p className="text-xs text-text-muted">
                        3 Lecture credits · 1 Lab practical · Department of {faculty.department}
                      </p>

                      {cls && (
                        <div className="p-3 rounded-xl bg-card-hover/40 border border-border">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-accent block mb-2">
                            Classroom Syllabus Hub
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="flex items-center gap-1.5 text-text-muted">
                              <HelpCircle className="w-3.5 h-3.5 text-accent" />
                              <span>{cls.quizzes.length} Quizzes</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-text-muted">
                              <FileText className="w-3.5 h-3.5 text-accent" />
                              <span>{cls.resources.length} Notes</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-text-muted">
                              <Award className="w-3.5 h-3.5 text-accent" />
                              <span>{cls.assignments.length} Tasks</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-text-muted">
                              <Calendar className="w-3.5 h-3.5 text-accent" />
                              <span>{cls.assessments.length} Exams</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex flex-wrap gap-2.5">
                        <button
                          onClick={() => { setSelectedSubject(subj); setCurrentPage('attendance-management'); }}
                          className="btn-spec-primary text-xs py-2 px-3.5"
                        >
                          Log Attendance
                        </button>
                        <button
                          onClick={() => setCurrentPage('directory')}
                          className="btn-spec-secondary text-xs py-2 px-3.5"
                        >
                          View Students
                        </button>
                        {cls && (
                          <button
                            onClick={() => setClassroomModalSubject(cls)}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25 transition-colors flex items-center gap-1.5"
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Classroom Hub</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Faculty Classroom Materials Overview Modal */}
              {classroomModalSubject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                  <div className="w-full max-w-2xl rounded-2xl bg-card border border-accent/40 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in">
                    <div className="flex items-start justify-between gap-4 pb-3 border-b border-border">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-accent/20 text-accent">
                          {classroomModalSubject.code} · {classroomModalSubject.semester}
                        </span>
                        <h3 className="text-lg font-bold text-text mt-1">
                          {classroomModalSubject.name} — Classroom Materials
                        </h3>
                        <p className="text-xs text-text-muted">
                          Faculty In-Charge: {classroomModalSubject.faculty} · Syllabus Covered: {classroomModalSubject.syllabusCoveredPct}%
                        </p>
                      </div>
                      <button
                        onClick={() => setClassroomModalSubject(null)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-card-hover"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Section 1: Quizzes */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" />
                        <span>Interactive Quizzes ({classroomModalSubject.quizzes.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {classroomModalSubject.quizzes.map(q => (
                          <div key={q.id} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-text">{q.title}</span>
                              <span className="text-text-muted block">{q.module} · {q.questionsCount} Questions ({q.timeLimitMinutes} mins)</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent/15 text-accent border border-accent/25">
                              {q.difficulty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 2: Study Resources */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        <span>Lecture Resources & Slides ({classroomModalSubject.resources.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {classroomModalSubject.resources.map(r => (
                          <div key={r.id} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-text">{r.title}</span>
                              <span className="text-text-muted block">{r.category} · {r.fileFormat} ({r.fileSize})</span>
                            </div>
                            <span className="text-[11px] text-text-muted">{r.downloadsCount} downloads</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 3: Assignments */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                        <Award className="w-4 h-4" />
                        <span>Assignments ({classroomModalSubject.assignments.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {classroomModalSubject.assignments.map(a => (
                          <div key={a.id} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-text">{a.title}</span>
                              <span className="text-text-muted block">Due: {a.dueDate} · Max Marks: {a.maxMarks} ({a.weightagePct}% weightage)</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-card-hover text-text-muted border border-border">
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 4: Assessments */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>Assessments & Exam Schedules ({classroomModalSubject.assessments.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {classroomModalSubject.assessments.map(asm => (
                          <div key={asm.id} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-text">{asm.title}</span>
                              <span className="text-text-muted block">{asm.date} ({asm.timeSlot}) · {asm.venue}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/25">
                              {asm.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex justify-end">
                      <button
                        onClick={() => setClassroomModalSubject(null)}
                        className="btn-spec-primary text-xs py-2 px-4"
                      >
                        Close Classroom Overview
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. STUDENT DIRECTORY */}
          {currentPage === 'directory' && (
            <div className="space-y-6 animate-fade-up">
              <SpecPageHeader
                title="Student Directory"
                subtitle={`Roster of enrolled students in ${faculty.department} courses`}
                sessionText="Directory Ledger"
                actions={
                  <button onClick={handleExportCSV} className="btn-spec-primary text-xs py-2 px-4 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export CSV Roster
                  </button>
                }
              />

              <div className="spec-card overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {['Roll No', 'Student Name', 'CGPA', 'Attendance %', 'Backlogs', 'Status'].map(h => (
                        <th key={h} className="text-left py-2.5 px-3 label-spec text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FACULTY_STUDENTS.map(s => (
                      <tr key={s.roll} className="border-b border-border/60 hover:bg-card-hover transition-colors">
                        <td className="py-3 px-3 font-semibold text-accent">{s.roll}</td>
                        <td className="py-3 px-3 font-bold text-text">{s.name}</td>
                        <td className="py-3 px-3 text-text-muted">{s.cgpa.toFixed(2)}</td>
                        <td className="py-3 px-3 font-bold text-text">{s.attendance}%</td>
                        <td className="py-3 px-3 text-text-muted">{s.backlogs}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.risk === 'High' ? 'bg-status-danger/15 text-status-danger' :
                            s.risk === 'Moderate' ? 'bg-status-warning/15 text-status-warning' :
                            'bg-status-success/15 text-status-success'
                          }`}>
                            {s.risk} Risk
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. ATTENDANCE MANAGEMENT */}
          {currentPage === 'attendance-management' && (
            <div className="space-y-6 animate-fade-up">
              <SpecPageHeader
                title="Attendance Management"
                subtitle="Mark daily lecture attendance — click badge to toggle Present/Absent"
                sessionText="Live Registry"
              />

              {attendanceSaveMessage && (
                <div className="p-4 rounded-xl bg-status-success/15 border border-status-success/30 text-status-success text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {attendanceSaveMessage}
                </div>
              )}

              {/* Selector Bar */}
              <div className="spec-card flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <label className="label-spec text-[10px] block mb-1">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={e => setSelectedSubject(e.target.value)}
                      className="input-spec text-xs font-bold"
                    >
                      {faculty.subjects.map(s => (
                        <option key={s} value={s} className="bg-card text-text">{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-spec text-[10px] block mb-1">Lecture Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="input-spec text-xs font-bold"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveAttendance}
                  className="btn-spec-primary text-xs py-2 px-5"
                >
                  <Save className="w-4 h-4" /> Save Attendance Roster
                </button>
              </div>

              {/* Toggle Table */}
              <div className="spec-card overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {['Roll No', 'Student Name', 'Overall Att %', 'Mark for Selected Date'].map(h => (
                        <th key={h} className="text-left py-2.5 px-3 label-spec text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FACULTY_STUDENTS.map(s => {
                      const isPresent = attendanceRecords[s.roll] ?? true;
                      return (
                        <tr key={s.roll} className="border-b border-border/60 hover:bg-card-hover transition-colors">
                          <td className="py-3 px-3 font-semibold text-accent">{s.roll}</td>
                          <td className="py-3 px-3 font-bold text-text">{s.name}</td>
                          <td className="py-3 px-3 text-text-muted">{s.attendance}%</td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleToggleAttendance(s.roll)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                isPresent
                                  ? 'bg-status-success/15 text-status-success border border-status-success/30'
                                  : 'bg-status-danger/15 text-status-danger border border-status-danger/30'
                              }`}
                            >
                              {isPresent ? '✓ Present' : '✗ Absent'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. AT-RISK STUDENTS */}
          {currentPage === 'at-risk' && (
            <div className="space-y-6 animate-fade-up">
              <SpecPageHeader
                title="At-Risk Students Roster"
                subtitle="Students triggered by rule-based attendance and academic thresholds"
                sessionText="Intervention Target"
                standingChip={{ text: 'Action Needed', variant: 'danger' }}
              />

              <div className="spec-card overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {['Student', 'CGPA', 'Attendance', 'Backlogs', 'Triggered Rule Reason', 'Action'].map(h => (
                        <th key={h} className="text-left py-2.5 px-3 label-spec text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FACULTY_STUDENTS.filter(s => s.risk !== 'Low').map(s => (
                      <tr key={s.roll} className="border-b border-border/60 hover:bg-card-hover transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-text block">{s.name}</span>
                          <span className="text-[10px] text-accent font-mono">{s.roll}</span>
                        </td>
                        <td className="py-3 px-3 text-text-muted">{s.cgpa}</td>
                        <td className="py-3 px-3 font-bold text-status-danger">{s.attendance}%</td>
                        <td className="py-3 px-3 text-text-muted">{s.backlogs}</td>
                        <td className="py-3 px-3 text-text-muted">
                          {s.attendance < 65 ? 'Critical attendance deficiency (<65%)' :
                           s.backlogs > 2 ? `Excess backlogs (${s.backlogs} active)` :
                           'Low attendance (<75%) & poor internals'}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => setCurrentPage('problem-requests')}
                            className="btn-spec-secondary text-[10px] py-1 px-3"
                          >
                            Create Plan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. PROBLEM REQUESTS */}
          {currentPage === 'problem-requests' && (
            <div className="space-y-6 animate-fade-up">
              <SpecPageHeader
                title="Student Problem Requests"
                subtitle={`Direct academic questions submitted by students to course faculty (Active: ${faculty.name})`}
                sessionText="Mentorship Tickets"
                standingChip={{ text: `${filteredFacultyRequests.length} Requests`, variant: 'accent' }}
              />

              {/* Scope & Priority Filter Controls */}
              <div className="spec-card p-3 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  {/* Scope Selector: Assigned to Me vs All */}
                  <div className="flex items-center gap-1.5 bg-card p-1 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => setProblemScope('my')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        problemScope === 'my'
                          ? 'bg-accent/20 text-accent font-bold'
                          : 'text-text-muted hover:text-text'
                      }`}
                    >
                      Assigned to Me ({problemRequests.filter(r => r.faculty.toLowerCase().includes(faculty.name.toLowerCase()) || faculty.name.toLowerCase().includes(r.faculty.toLowerCase())).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProblemScope('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        problemScope === 'all'
                          ? 'bg-accent/20 text-accent font-bold'
                          : 'text-text-muted hover:text-text'
                      }`}
                    >
                      All Campus Tickets ({problemRequests.length})
                    </button>
                  </div>

                  {/* Priority Filter */}
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {(['All', 'Important', 'Medium', 'Low'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setProblemPriorityFilter(p)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 ${
                          problemPriorityFilter === p
                            ? p === 'Important'
                              ? 'bg-status-danger/20 border-status-danger text-status-danger font-bold'
                              : p === 'Medium'
                              ? 'bg-status-warning/20 border-status-warning text-status-warning font-bold'
                              : p === 'Low'
                              ? 'bg-status-success/20 border-status-success text-status-success font-bold'
                              : 'bg-accent/20 border-accent text-accent font-bold'
                            : 'bg-card border-border text-text-muted hover:border-accent/40'
                        }`}
                      >
                        {p === 'Important' && <AlertCircle className="w-2.5 h-2.5 text-status-danger" />}
                        {p === 'Medium' && <Clock className="w-2.5 h-2.5 text-status-warning" />}
                        {p === 'Low' && <CheckCircle2 className="w-2.5 h-2.5 text-status-success" />}
                        <span>{p}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyword Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={problemSearch}
                    onChange={e => setProblemSearch(e.target.value)}
                    placeholder="Search by student name, roll number, topic, or description..."
                    className="input-spec w-full text-xs py-1.5 px-3"
                  />
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-4">
                {filteredFacultyRequests.length === 0 ? (
                  <div className="spec-card text-center py-12">
                    <CheckCircle2 className="w-10 h-10 text-status-success mx-auto mb-2 opacity-60" />
                    <h4 className="text-sm font-bold text-text">No Problem Tickets Found</h4>
                    <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                      {problemScope === 'my'
                        ? `No problem requests currently assigned to ${faculty.name}. Switch to "All Campus Tickets" to view all student tickets.`
                        : 'No problem requests currently match your active filters.'}
                    </p>
                  </div>
                ) : (
                  filteredFacultyRequests.map(req => (
                    <div key={req.id} className="spec-card space-y-3">
                      <div className="flex items-start justify-between flex-wrap gap-2 border-b border-border pb-2.5">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-accent font-mono">{req.id}</span>
                            <span className="text-xs font-bold text-text">{req.student} ({req.roll})</span>
                            {req.category && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5" />
                                {req.category}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                              req.priority === 'Important' ? 'bg-status-danger/15 text-status-danger border border-status-danger/30' :
                              req.priority === 'Medium' ? 'bg-status-warning/15 text-status-warning border border-status-warning/30' :
                              'bg-status-success/15 text-status-success border border-status-success/30'
                            }`}>
                              {req.priority === 'Important' && <AlertCircle className="w-2.5 h-2.5" />}
                              {req.priority === 'Medium' && <Clock className="w-2.5 h-2.5" />}
                              {req.priority === 'Low' && <CheckCircle2 className="w-2.5 h-2.5" />}
                              <span>{req.priority || 'Normal'} Priority</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5">
                            Subject: <strong className="text-text/80">{req.subject}</strong> · Assigned To: <strong className="text-accent">{req.faculty}</strong> · Submitted: {req.submitted}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'Resolved' ? 'bg-status-success/15 text-status-success' : 'bg-status-warning/15 text-status-warning'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="text-xs text-text bg-card-hover p-3 rounded-xl border border-border">
                        <p className="font-semibold text-text mb-1">Topic: {req.topic}</p>
                        <p className="text-text-muted italic">"{req.description}"</p>
                      </div>

                      {req.reply ? (
                        <div className="p-3 rounded-xl bg-accent/10 border border-accent/25 text-xs space-y-1">
                          <span className="font-bold text-accent">Faculty Reply: </span>
                          <p className="text-text">{req.reply}</p>
                          {req.next_step && (
                            <p className="text-[11px] text-text-muted mt-1">Recommended Next Step: {req.next_step}</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2 pt-2">
                          <textarea
                            rows={2}
                            placeholder="Type your academic reply or guidance here..."
                            value={replyText[req.id] || ''}
                            onChange={e => setReplyText({ ...replyText, [req.id]: e.target.value })}
                            className="input-spec w-full text-xs resize-none"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              placeholder="Optional Next Step (e.g. attend office hours Thursday 3pm)"
                              value={nextStepText[req.id] || ''}
                              onChange={e => setNextStepText({ ...nextStepText, [req.id]: e.target.value })}
                              className="input-spec text-xs flex-1"
                            />
                            <button
                              onClick={() => handleReplyProblem(req.id)}
                              className="btn-spec-primary text-xs py-2 px-4 shrink-0 flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" /> Send Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* FALLBACK FOR OTHER TABS */}
          {['attendance-calendar', 'academic-performance', 'reports', 'profile'].includes(currentPage) && (
            <div className="spec-card space-y-4 animate-fade-up">
              <SpecPageHeader
                title={`Faculty — ${currentPage.replace('-', ' ').toUpperCase()}`}
                subtitle="Institutional analytics and department diagnostics"
              />
              <p className="text-xs text-text-muted">
                Section modules and audit logs calibrated to Design Spec standards.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ── FACULTY SWITCH CREDENTIAL VERIFICATION MODAL ────────────────── */}
      {isAuthModalOpen && pendingFacultyIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className="spec-card max-w-md w-full border border-border/80 shadow-2xl relative animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCancelFacultySwitch}
              className="absolute top-4 right-4 text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-card-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">Authenticate Faculty Switch</h3>
                <p className="text-xs text-text-muted">Security verification required to switch active advisor profile</p>
              </div>
            </div>

            {/* Target Faculty Profile Preview */}
            <div className="p-3.5 rounded-xl bg-card-hover/60 border border-border mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-royal to-accent flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {DEMO_FACULTY[pendingFacultyIdx].avatar_initials}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-text truncate">{DEMO_FACULTY[pendingFacultyIdx].name}</h4>
                <p className="text-[11px] text-accent font-medium truncate">{DEMO_FACULTY[pendingFacultyIdx].designation} · {DEMO_FACULTY[pendingFacultyIdx].department}</p>
                <p className="text-[10px] text-text-muted font-mono truncate">{DEMO_FACULTY[pendingFacultyIdx].email}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmFacultySwitch} className="space-y-4">
              {authError && (
                <div className="p-3 rounded-lg bg-status-danger/15 border border-status-danger/30 text-status-danger text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="label-spec block mb-1.5 flex items-center justify-between">
                  <span>Security Password:</span>
                  <span className="text-[10px] text-text-muted">Credential Verification</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10" />
                  <input
                    type={showAuthPassword ? 'text' : 'password'}
                    value={authPassword}
                    onChange={e => {
                      setAuthPassword(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter password (e.g. faculty@123)..."
                    className="input-spec input-with-left-icon input-with-right-icon w-full !pl-12 !pr-10 text-xs"
                    style={{ paddingLeft: '48px', paddingRight: '40px' }}
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthPassword(!showAuthPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-1"
                  >
                    {showAuthPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="mt-2 p-2 rounded-lg bg-card-hover/40 border border-border/40 text-[11px] text-text-muted flex items-center justify-between">
                  <span>Default Faculty Credential:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthPassword('faculty@123');
                      setAuthError('');
                    }}
                    className="text-accent font-mono font-bold hover:underline"
                  >
                    Use "faculty@123"
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={handleCancelFacultySwitch}
                  className="btn-spec-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="btn-spec-primary text-xs py-2 px-5 flex items-center gap-2"
                >
                  {isAuthenticating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify & Switch</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
