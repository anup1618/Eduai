import React, { useState } from 'react';
import {
  Users, BookOpen, Calendar, CheckSquare, AlertTriangle, MessageSquare,
  FileSpreadsheet, User, Bell, ChevronDown, LogOut, Menu, X, Save,
  CheckCircle2, Clock, Send, Download, Sparkles, Filter
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid
} from 'recharts';
import {
  DEMO_FACULTY, FACULTY_STUDENTS, DEMO_PROBLEMS, DEMO_STUDENT, ATTENDANCE_CALENDAR_OCT
} from '../data/portalData';

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
  { id: 'dashboard', label: 'Faculty Dashboard', icon: <Users className="w-5 h-5" /> },
  { id: 'subjects', label: 'My Subjects', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'directory', label: 'Student Directory', icon: <Users className="w-5 h-5" /> },
  { id: 'attendance-management', label: 'Attendance Management', icon: <CheckSquare className="w-5 h-5" /> },
  { id: 'attendance-calendar', label: 'Attendance Calendar', icon: <Calendar className="w-5 h-5" /> },
  { id: 'academic-performance', label: 'Academic Performance', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'at-risk', label: 'At-Risk Students', icon: <AlertTriangle className="w-5 h-5" /> },
  { id: 'problem-requests', label: 'Problem Requests', icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'reports', label: 'Reports & AI Insights', icon: <FileSpreadsheet className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile & Notifications', icon: <User className="w-5 h-5" /> },
];

export const FacultyPortal: React.FC<FacultyPortalProps> = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState<FacultyPage>('dashboard');
  const [selectedFacultyIdx, setSelectedFacultyIdx] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

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

  // Problem requests state
  const [requests, setRequests] = useState(DEMO_PROBLEMS);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [nextStepText, setNextStepText] = useState<Record<string, string>>({});

  const faculty = DEMO_FACULTY[selectedFacultyIdx];

  const handleToggleAttendance = (roll: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [roll]: !prev[roll],
    }));
  };

  const handleSaveAttendance = () => {
    setAttendanceSaveMessage(`Attendance successfully recorded for ${selectedSubject} on ${selectedDate} (${FACULTY_STUDENTS.length} students logged).`);
    setTimeout(() => setAttendanceSaveMessage(null), 4000);
  };

  const handleReplyProblem = (reqId: string) => {
    const reply = replyText[reqId] || '';
    const next = nextStepText[reqId] || '';
    if (!reply.trim()) return;

    setRequests(prev =>
      prev.map(r =>
        r.id === reqId
          ? { ...r, reply, next_step: next, status: 'Resolved' as const }
          : r
      )
    );
    setReplyText(prev => ({ ...prev, [reqId]: '' }));
    setNextStepText(prev => ({ ...prev, [reqId]: '' }));
  };

  // CSV export for faculty reports
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
  };

  return (
    <div className="min-h-screen bg-black flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#03050c] border-r border-[#14224a] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-5 border-b border-[#14224a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-[0_0_16px_rgba(139,92,246,0.3)]">
              <Users className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight gradient-title">EduPulse AI</div>
              <div className="text-[10px] text-purple-400 font-semibold">Faculty Portal</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'nav-active text-cyan-400'
                    : 'text-slate-400 hover:bg-[#0b1226] hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#14224a]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Header with Faculty Switcher */}
        <header className="sticky top-0 z-30 h-16 bg-[#03050c]/80 backdrop-blur-md border-b border-[#14224a] flex items-center px-4 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white p-1">
            <Menu className="w-5 h-5" />
          </button>

          {/* Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Logged in as:</span>
            <select
              value={selectedFacultyIdx}
              onChange={e => setSelectedFacultyIdx(Number(e.target.value))}
              className="bg-[#0b1226] border border-[#14224a] text-xs font-bold text-cyan-400 rounded-lg px-3 py-1.5 focus:border-cyan-400 outline-none cursor-pointer"
            >
              {DEMO_FACULTY.map((f, idx) => (
                <option key={f.id} value={idx}>{f.name} ({f.department})</option>
              ))}
            </select>
          </div>

          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#0b1226] relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-12 w-72 bg-[#0b1226] border border-[#14224a] rounded-xl shadow-2xl p-4 z-50 text-xs space-y-2">
                <span className="font-bold text-white block pb-2 border-b border-[#14224a]">Faculty Notifications</span>
                <p className="text-slate-300">1 student problem request pending review from Arjun Sharma.</p>
                <p className="text-slate-300">Class attendance for yesterday pending submission.</p>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* 1. DASHBOARD */}
          {currentPage === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold gradient-title">Faculty Dashboard</h1>
                <p className="text-sm text-slate-400 mt-0.5">Welcome, {faculty.name} · Department of {faculty.department}</p>
              </div>

              {/* 4 Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glow-card panel metric-accent-top p-5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Assigned Students</span>
                  <div className="text-2xl font-extrabold text-white mt-1">{FACULTY_STUDENTS.length}</div>
                  <span className="text-xs text-slate-500">Across 2 courses</span>
                </div>
                <div className="glow-card panel metric-accent-top p-5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Class Avg Attendance</span>
                  <div className="text-2xl font-extrabold text-cyan-400 mt-1">76.4%</div>
                  <span className="text-xs text-slate-500">Institutional target 75%</span>
                </div>
                <div className="glow-card panel metric-accent-top p-5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Class Avg CGPA</span>
                  <div className="text-2xl font-extrabold text-blue-400 mt-1">7.31</div>
                  <span className="text-xs text-slate-500">Range: 5.2 - 8.9</span>
                </div>
                <div className="glow-card panel metric-accent-top p-5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Students At-Risk</span>
                  <div className="text-2xl font-extrabold text-red-400 mt-1">
                    {FACULTY_STUDENTS.filter(s => s.risk === 'High' || s.risk === 'Moderate').length}
                  </div>
                  <span className="text-xs text-slate-500">Require intervention</span>
                </div>
              </div>

              {/* Trend Chart + Academic Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glow-card panel p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Class CGPA Distribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={FACULTY_STUDENTS.slice(0, 12)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#173066" />
                      <XAxis dataKey="roll" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#0b1226', border: '1px solid #14224a', color: '#fff' }} />
                      <Bar dataKey="cgpa" fill="#2f7bff" radius={[4, 4, 0, 0]} name="CGPA" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="glow-card panel p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Academic Alerts</h3>
                  <div className="space-y-2">
                    {FACULTY_STUDENTS.filter(s => s.risk === 'High').slice(0, 3).map(s => (
                      <div key={s.roll} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs">
                        <div className="flex justify-between font-bold text-red-400">
                          <span>{s.name} ({s.roll})</span>
                          <span>{s.attendance}% Att</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Backlogs: {s.backlogs} · Critical attendance alert</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. MY SUBJECTS */}
          {currentPage === 'subjects' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold gradient-title">My Subjects</h1>
                <p className="text-sm text-slate-400 mt-0.5">Assigned courses and cohort rosters for this academic session</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faculty.subjects.map(subj => (
                  <div key={subj} className="glow-card panel p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                        Active Course
                      </span>
                      <span className="text-xs text-slate-400">{faculty.students_count} Enrolled</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{subj}</h3>
                    <p className="text-xs text-slate-400">
                      3 Lecture credits · 1 Lab practical · Department of {faculty.department}
                    </p>
                    <div className="pt-2 flex gap-3">
                      <button
                        onClick={() => { setSelectedSubject(subj); setCurrentPage('attendance-management'); }}
                        className="btn-primary text-white text-xs font-bold px-4 py-2 rounded-xl"
                      >
                        Log Attendance
                      </button>
                      <button
                        onClick={() => setCurrentPage('directory')}
                        className="bg-[#0b1226] border border-[#14224a] text-slate-300 text-xs font-bold px-4 py-2 rounded-xl hover:text-white"
                      >
                        View Students
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. STUDENT DIRECTORY */}
          {currentPage === 'directory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold gradient-title">Student Directory</h1>
                  <p className="text-sm text-slate-400 mt-0.5">Enrolled students in {faculty.department} courses</p>
                </div>
                <button onClick={handleExportCSV} className="btn-primary text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export CSV Roster
                </button>
              </div>

              <div className="glow-card panel p-5 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#14224a] text-slate-400">
                      <th className="text-left py-2 px-3">Roll No</th>
                      <th className="text-left py-2 px-3">Student Name</th>
                      <th className="text-center py-2 px-3">CGPA</th>
                      <th className="text-center py-2 px-3">Attendance %</th>
                      <th className="text-center py-2 px-3">Backlogs</th>
                      <th className="text-right py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FACULTY_STUDENTS.map(s => (
                      <tr key={s.roll} className="border-b border-[#14224a]/40 hover:bg-[#0b1226]">
                        <td className="py-2.5 px-3 font-semibold text-cyan-400">{s.roll}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{s.name}</td>
                        <td className="py-2.5 px-3 text-center text-slate-300">{s.cgpa.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-200">{s.attendance}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-300">{s.backlogs}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.risk === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            s.risk === 'Moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-green-500/20 text-green-400 border border-green-500/30'
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
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold gradient-title">Attendance Management</h1>
                <p className="text-sm text-slate-400 mt-0.5">Mark daily lecture attendance — click badge to toggle Present/Absent</p>
              </div>

              {attendanceSaveMessage && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {attendanceSaveMessage}
                </div>
              )}

              {/* Selector Bar */}
              <div className="glow-card panel p-4 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={e => setSelectedSubject(e.target.value)}
                      className="bg-[#0b1226] border border-[#14224a] text-xs font-bold text-white rounded-lg px-3 py-1.5 focus:border-cyan-400 outline-none"
                    >
                      {faculty.subjects.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Lecture Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="bg-[#0b1226] border border-[#14224a] text-xs font-bold text-white rounded-lg px-3 py-1.5 focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveAttendance}
                  className="btn-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-glow-blue"
                >
                  <Save className="w-4 h-4" /> Save Attendance Roster
                </button>
              </div>

              {/* Toggle Table */}
              <div className="glow-card panel p-5 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#14224a] text-slate-400">
                      <th className="text-left py-2 px-3">Roll No</th>
                      <th className="text-left py-2 px-3">Student Name</th>
                      <th className="text-center py-2 px-3">Overall Att %</th>
                      <th className="text-right py-2 px-3">Mark for {selectedDate}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FACULTY_STUDENTS.map(s => {
                      const isPresent = attendanceRecords[s.roll] ?? true;
                      return (
                        <tr key={s.roll} className="border-b border-[#14224a]/40 hover:bg-[#0b1226]">
                          <td className="py-2.5 px-3 font-semibold text-cyan-400">{s.roll}</td>
                          <td className="py-2.5 px-3 font-bold text-white">{s.name}</td>
                          <td className="py-2.5 px-3 text-center text-slate-300">{s.attendance}%</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleToggleAttendance(s.roll)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                isPresent
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
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

          {/* 5. ATTENDANCE CALENDAR */}
          {currentPage === 'attendance-calendar' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold gradient-title">Class Attendance Calendar</h1>
                <p className="text-sm text-slate-400 mt-0.5">Monthly overview of lecture dates and cohort attendance averages</p>
              </div>

              <div className="glow-card panel p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">October 2025 Conducted Lectures</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { date: 'Oct 01, 2025', count: '29 / 32 present', pct: '90.6%' },
                    { date: 'Oct 02, 2025', count: '27 / 32 present', pct: '84.4%' },
                    { date: 'Oct 06, 2025', count: '28 / 32 present', pct: '87.5%' },
                    { date: 'Oct 07, 2025', count: '21 / 32 present', pct: '65.6%' },
                    { date: 'Oct 08, 2025', count: '30 / 32 present', pct: '93.8%' },
                    { date: 'Oct 09, 2025', count: '28 / 32 present', pct: '87.5%' },
                  ].map((d, i) => (
                    <div key={i} className="panel-raised p-4 rounded-xl border border-[#14224a]">
                      <span className="text-xs font-bold text-white block">{d.date}</span>
                      <p className="text-xs text-slate-400 mt-1">{d.count}</p>
                      <span className="text-xs font-extrabold text-cyan-400 block mt-1">{d.pct} Average</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. ACADEMIC PERFORMANCE */}
          {currentPage === 'academic-performance' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold gradient-title">Academic Performance</h1>
                <p className="text-sm text-slate-400 mt-0.5">Assessment distributions and cohort performance across sections</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="panel-raised p-5 rounded-xl border border-[#14224a] text-center">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Section Average CGPA</span>
                  <div className="text-3xl font-extrabold text-cyan-400 mt-1">7.31</div>
                </div>
                <div className="panel-raised p-5 rounded-xl border border-[#14224a] text-center">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Highest CGPA</span>
                  <div className="text-3xl font-extrabold text-green-400 mt-1">8.90</div>
                </div>
                <div className="panel-raised p-5 rounded-xl border border-[#14224a] text-center">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Lowest CGPA</span>
                  <div className="text-3xl font-extrabold text-red-400 mt-1">5.20</div>
                </div>
              </div>

              <div className="glow-card panel p-5">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">CGPA Spread Across All Students</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={FACULTY_STUDENTS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#173066" />
                    <XAxis dataKey="roll" tick={{ fill: '#64748b', fontSize: 9 }} interval={1} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0b1226', border: '1px solid #14224a', color: '#fff' }} />
                    <Bar dataKey="cgpa" fill="#2f7bff" radius={[3, 3, 0, 0]} name="CGPA" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 7. AT-RISK STUDENTS */}
          {currentPage === 'at-risk' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold gradient-title">At-Risk Students Roster</h1>
                <p className="text-sm text-slate-400 mt-0.5">Students triggered by rule-based attendance and academic thresholds</p>
              </div>

              <div className="glow-card panel p-5 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#14224a] text-slate-400">
                      <th className="text-left py-2 px-3">Student</th>
                      <th className="text-center py-2 px-3">CGPA</th>
                      <th className="text-center py-2 px-3">Attendance</th>
                      <th className="text-center py-2 px-3">Backlogs</th>
                      <th className="text-left py-2 px-3">Triggered Rule Reason</th>
                      <th className="text-right py-2 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FACULTY_STUDENTS.filter(s => s.risk !== 'Low').map(s => (
                      <tr key={s.roll} className="border-b border-[#14224a]/40 hover:bg-[#0b1226]">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-white block">{s.name}</span>
                          <span className="text-[10px] text-cyan-400">{s.roll}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-300">{s.cgpa}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-red-400">{s.attendance}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-300">{s.backlogs}</td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {s.attendance < 65 ? 'Critical attendance deficiency (<65%)' :
                           s.backlogs > 2 ? `Excess backlogs (${s.backlogs} active)` :
                           'Low attendance (<75%) & poor internals'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setCurrentPage('problem-requests')}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/20 text-cyan-400 border border-blue-500/30 hover:bg-blue-500/30"
                          >
                            Create Intervention
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. PROBLEM REQUESTS */}
          {currentPage === 'problem-requests' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold gradient-title">Student Problem Requests</h1>
                <p className="text-sm text-slate-400 mt-0.5">Direct academic questions submitted by students</p>
              </div>

              <div className="space-y-4">
                {requests.map(req => (
                  <div key={req.id} className="glow-card panel p-5 space-y-3">
                    <div className="flex items-start justify-between flex-wrap gap-2 border-b border-[#14224a] pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-cyan-400">{req.id}</span>
                          <span className="text-xs font-bold text-white">{req.student} ({req.roll})</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Subject: {req.subject} · Submitted: {req.submitted}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        req.status === 'Resolved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-cyan-300">Topic: {req.topic}</p>
                      <p className="text-xs text-slate-300 mt-1">{req.description}</p>
                    </div>

                    {req.reply ? (
                      <div className="p-3 rounded-lg bg-[#0b1226] border border-green-500/30 space-y-1">
                        <span className="text-xs font-bold text-green-400">Response Recorded:</span>
                        <p className="text-xs text-slate-300">{req.reply}</p>
                        {req.next_step && <p className="text-[11px] text-cyan-300">Action: {req.next_step}</p>}
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2 border-t border-[#14224a]">
                        <textarea
                          rows={2}
                          placeholder="Type your response to the student..."
                          value={replyText[req.id] || ''}
                          onChange={e => setReplyText({ ...replyText, [req.id]: e.target.value })}
                          className="w-full bg-[#0b1226] border border-[#14224a] rounded-lg p-2.5 text-xs text-slate-200 focus:border-cyan-400 outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Next recommended step (e.g., Attend office hours on Thursday)"
                            value={nextStepText[req.id] || ''}
                            onChange={e => setNextStepText({ ...nextStepText, [req.id]: e.target.value })}
                            className="flex-1 bg-[#0b1226] border border-[#14224a] rounded-lg p-2 text-xs text-slate-200 focus:border-cyan-400 outline-none"
                          />
                          <button
                            onClick={() => handleReplyProblem(req.id)}
                            className="btn-primary text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" /> Send Response
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. REPORTS & AI INSIGHTS */}
          {currentPage === 'reports' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold gradient-title">Reports & AI Insights</h1>
                  <p className="text-sm text-slate-400 mt-0.5">Faculty course analytics and automated cohort summaries</p>
                </div>
                <button onClick={handleExportCSV} className="btn-primary text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download Section Report (CSV)
                </button>
              </div>

              <div className="glow-card panel p-5 space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" /> Automated Section Intelligence Digest
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Based on recent assessment scores, <strong>Machine Learning Section A</strong> displays an average internal score of 78%. 
                  However, 6 students have attendance below 70%, creating a direct exam eligibility risk. 
                  Recommended intervention: Schedule a remedial problem-solving review before Mid-Sem examinations.
                </p>
              </div>
            </div>
          )}

          {/* 10. PROFILE */}
          {currentPage === 'profile' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="text-2xl font-extrabold gradient-title">Faculty Profile</h1>
                <p className="text-sm text-slate-400 mt-0.5">Faculty credentials and department assignments</p>
              </div>

              <div className="glow-card panel p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                    {faculty.avatar_initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{faculty.name}</h3>
                    <p className="text-xs text-slate-400">Department of {faculty.department}</p>
                    <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold mt-1 inline-block">
                      Faculty ID: {faculty.id}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#14224a] space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#14224a]/50">
                    <span className="text-slate-400">Designation</span>
                    <span className="text-white font-medium">Associate Professor</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#14224a]/50">
                    <span className="text-slate-400">Institutional Email</span>
                    <span className="text-white font-medium">{faculty.name.toLowerCase().replace(/\s+/g, '.')}@edupulse.edu</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Assigned Courses</span>
                    <span className="text-cyan-400 font-bold">{faculty.subjects.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
