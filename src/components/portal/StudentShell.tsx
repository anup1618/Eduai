import React, { useState } from 'react';
import {
  Activity, LayoutDashboard, BarChart2, BookOpen, Calendar,
  Brain, MessageSquare, User, Settings, LogOut, Menu, X, Bell, ChevronDown,
  ArrowRightLeft, Check, ShieldAlert, Sparkles, Search
} from 'lucide-react';
import type { PortalRole } from '../../data/portalData';
import { FEATURED_DEMO_STUDENTS } from '../../data/portalData';
import { useCurrentStudent, useCampusData } from '../../context/CampusDataContext';

export type StudentPage =
  | 'dashboard' | 'analytics' | 'performance' | 'attendance'
  | 'ai-progress' | 'my-problem' | 'profile' | 'settings';

interface StudentShellProps {
  currentPage: StudentPage;
  onNavigate: (page: StudentPage) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems: { id: StudentPage; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',   label: 'Dashboard',          icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'analytics',   label: 'Analytics',           icon: <BarChart2 className="w-5 h-5" /> },
  { id: 'performance', label: 'Performance',          icon: <BookOpen className="w-5 h-5" /> },
  { id: 'attendance',  label: 'Attendance',           icon: <Calendar className="w-5 h-5" /> },
  { id: 'ai-progress', label: 'AI Progress Tracker',  icon: <Brain className="w-5 h-5" /> },
  { id: 'my-problem',  label: 'My Problem',           icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'profile',     label: 'My Profile',           icon: <User className="w-5 h-5" /> },
  { id: 'settings',    label: 'Settings',             icon: <Settings className="w-5 h-5" /> },
];

export const StudentShell: React.FC<StudentShellProps> = ({ currentPage, onNavigate, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const s = useCurrentStudent();
  const { students, selectStudentForPortal } = useCampusData();

  const notifications = [
    { id: 1, text: 'Prof. Suresh Kumar responded to your request REQ-001', time: '2h ago', unread: true },
    { id: 2, text: 'Test 2 marks for Machine Learning have been uploaded', time: '1d ago', unread: true },
    { id: 3, text: 'Attendance for Oct 7 marked — 3 absences recorded', time: '2d ago', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  const filteredSearchStudents = searchQuery.trim()
    ? students.filter(st =>
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.email.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-[#14224a] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-[0_0_16px_rgba(47,123,255,0.3)]">
            <Activity className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight gradient-title">EduPulse AI</div>
            <div className="text-[10px] text-slate-500 font-medium">Student Portal</div>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'nav-active text-cyan-400'
                  : 'text-slate-400 hover:bg-[#0b1226] hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Demo note */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <p className="text-[10px] text-amber-400 font-semibold">⚠ Demo Data</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Showing synthetic student data for demonstration.</p>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-[#14224a]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#03050c] border-r border-[#14224a] transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-[#03050c]/80 backdrop-blur-md border-b border-[#14224a] flex items-center px-4 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white p-1">
            <Menu className="w-5 h-5" />
          </button>

          {/* Portal badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/30">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-bold text-blue-400">Student Portal</span>
          </div>

          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#0b1226] transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-[#0b1226] border border-[#14224a] rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#14224a] flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Notifications</span>
                  <button className="text-xs text-blue-400 hover:text-blue-300">Mark all read</button>
                </div>
                {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-[#14224a]/50 flex gap-3 ${n.unread ? 'bg-blue-600/5' : ''}`}>
                    {n.unread && <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />}
                    {!n.unread && <div className="w-2 h-2 flex-shrink-0" />}
                    <div>
                      <p className="text-xs text-slate-300">{n.text}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Switch Student Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => { setSwitcherOpen(!switcherOpen); setNotifOpen(false); setProfileOpen(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 text-xs text-cyan-300 font-semibold transition-all hover:bg-cyan-500/20 shadow-sm"
              title="Switch demo student to test different academic profiles"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Switch Student:</span>
              <span className="font-bold text-white max-w-[120px] truncate">{s.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-400/20 text-cyan-200 font-mono">
                {s.roll_no}
              </span>
              <ChevronDown className="w-3 h-3 text-cyan-400" />
            </button>

            {/* Switcher Dropdown Modal */}
            {switcherOpen && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#0b1226] border border-[#14224a] rounded-2xl shadow-2xl z-50 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#14224a]">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Switch Active Student</span>
                  </div>
                  <button
                    onClick={() => setSwitcherOpen(false)}
                    className="text-slate-400 hover:text-white text-xs p-1"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Select a student below or search from all 100 campus profiles to observe their real-time grades, attendance, and risk analytics:
                </p>

                {/* Quick Featured Students */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {FEATURED_DEMO_STUDENTS.map(demo => {
                    const isCurrent = s.name.toLowerCase() === demo.name.toLowerCase() || s.id === demo.id;
                    return (
                      <button
                        key={demo.id}
                        onClick={() => {
                          selectStudentForPortal(demo.id);
                          setSwitcherOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                          isCurrent
                            ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                            : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${demo.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {demo.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span className="truncate">{demo.name}</span>
                              {isCurrent && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {demo.rollNo} · {demo.course}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            demo.risk === 'High'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : demo.risk === 'Medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {demo.risk} Risk
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {demo.cgpa} CGPA · {demo.attendance}%
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Search all 100 students */}
                <div className="pt-2 border-t border-[#14224a]">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search all 100 students (e.g. STU015, Aditi)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                    />
                  </div>

                  {filteredSearchStudents.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-36 overflow-y-auto">
                      {filteredSearchStudents.map(st => (
                        <button
                          key={st.student_id}
                          onClick={() => {
                            selectStudentForPortal(st);
                            setSwitcherOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] text-xs flex items-center justify-between"
                        >
                          <span className="font-semibold text-white">{st.name} ({st.student_id})</span>
                          <span className="text-[10px] text-slate-400">{st.department}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setSwitcherOpen(false); }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#0b1226] border border-[#14224a] hover:border-[#2f7bff] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                {s.avatar_initials}
              </div>
              <span className="text-sm font-semibold text-white hidden sm:block">{s.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 w-56 bg-[#0b1226] border border-[#14224a] rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-4 bg-gradient-to-br from-blue-600/10 to-cyan-600/5 border-b border-[#14224a]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold mb-2">
                    {s.avatar_initials}
                  </div>
                  <p className="text-sm font-bold text-white">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.roll_no} · {s.department}</p>
                </div>
                <div className="p-2">
                  <button onClick={() => { setSwitcherOpen(true); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                    <ArrowRightLeft className="w-4 h-4" /> Switch Student
                  </button>
                  <button onClick={() => { onNavigate('profile'); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-[#14224a] hover:text-white transition-colors">
                    <User className="w-4 h-4" /> View Profile
                  </button>
                  <button onClick={() => { onNavigate('settings'); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-[#14224a] hover:text-white transition-colors">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <div className="border-t border-[#14224a] my-1" />
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
