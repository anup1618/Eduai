import React, { useState } from 'react';
import {
  Activity, LayoutDashboard, BarChart2, BookOpen, Calendar,
  Brain, MessageSquare, User, Settings, LogOut, Menu, X, Bell,
  ChevronDown, ChevronLeft, ChevronRight, ArrowRightLeft, Check, Search,
  Sun, Moon, Sparkles, Zap, GraduationCap
} from 'lucide-react';
import { FEATURED_DEMO_STUDENTS } from '../../data/portalData';
import { useCurrentStudent, useCampusData } from '../../context/CampusDataContext';
import { useTheme } from '../../context/ThemeContext';

export type StudentPage =
  | 'dashboard' | 'study-assistant' | 'classroom' | 'analytics' | 'performance' | 'attendance'
  | 'ai-progress' | 'my-problem' | 'profile' | 'settings';

interface StudentShellProps {
  currentPage: StudentPage;
  onNavigate: (page: StudentPage) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

interface NavItemConfig {
  id: StudentPage;
  label: string;
  icon: React.ReactNode;
  badge?: { text: string; variant: 'live' | 'alert' | 'neutral' };
}

export const StudentShell: React.FC<StudentShellProps> = ({
  currentPage,
  onNavigate,
  onLogout,
  children
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { theme, toggleTheme } = useTheme();
  const s = useCurrentStudent();
  const { students, selectStudentForPortal } = useCampusData();

  const notifications = [
    { id: 1, text: 'Prof. Suresh Kumar responded to your request REQ-001', time: '2h ago', unread: true },
    { id: 2, text: 'Test 2 marks for Machine Learning have been uploaded', time: '1d ago', unread: true },
    { id: 3, text: 'Attendance for Oct 7 marked — 3 absences recorded', time: '2d ago', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  const navItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
      badge: { text: 'Live', variant: 'live' }
    },
    {
      id: 'classroom',
      label: 'Classroom',
      icon: <GraduationCap className="w-5 h-5 flex-shrink-0 text-cyan-400" />,
      badge: { text: 'Hub', variant: 'live' }
    },
    {
      id: 'study-assistant',
      label: 'Study Assistant',
      icon: <Sparkles className="w-5 h-5 flex-shrink-0 text-accent" />,
      badge: { text: 'AI Bot', variant: 'live' }
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart2 className="w-5 h-5 flex-shrink-0" />,
      badge: s.overall_attendance < 75 ? { text: `${s.overall_attendance}% Alert`, variant: 'alert' } : undefined
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <BookOpen className="w-5 h-5 flex-shrink-0" />
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <Calendar className="w-5 h-5 flex-shrink-0" />,
      badge: { text: `${s.overall_attendance}%`, variant: s.overall_attendance < 75 ? 'alert' : 'neutral' }
    },
    {
      id: 'ai-progress',
      label: 'AI Progress',
      icon: <Brain className="w-5 h-5 flex-shrink-0" />,
      badge: { text: 'AI', variant: 'live' }
    },
    {
      id: 'my-problem',
      label: 'My Problem',
      icon: <MessageSquare className="w-5 h-5 flex-shrink-0" />,
      badge: { text: '2 Active', variant: 'neutral' }
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: <User className="w-5 h-5 flex-shrink-0" />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5 flex-shrink-0" />
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const studentInitials = getInitials(s.name);

  return (
    <div className="min-h-screen bg-bg text-text flex relative overflow-x-hidden">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Floating Glass Sidebar (DESIGN SPEC) */}
      <aside
        className={`fixed top-4 bottom-4 left-4 z-50 rounded-spec-sidebar spec-glass transition-all duration-300 flex flex-col ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-[calc(100%+24px)] lg:translate-x-0'
        }`}
      >
        {/* Collapse Toggle Button (Right Edge) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3.5 top-8 w-7 h-7 rounded-full bg-accent text-accent-contrast shadow-md items-center justify-center hover:scale-110 transition-transform z-10"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Top: Logo Mark + EduPulse AI bold + STUDENT chip + subtitle */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-accent stroke-[2.5]" />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-text tracking-tight">EduPulse AI</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                    STUDENT
                  </span>
                </div>
                <p className="text-[11px] text-text-muted truncate">Intelligent Student OS</p>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-text-muted hover:text-text p-1 ml-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Below Logo: Student Card */}
        {!collapsed ? (
          <div className="px-4 py-3 border-b border-border bg-card/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-royal to-accent flex items-center justify-center text-accent-contrast font-bold text-sm shadow-sm flex-shrink-0">
                {studentInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-text truncate">{s.name}</div>
                <div className="text-[11px] text-text-muted truncate">
                  {s.department} · {s.semester}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-3 border-b border-border flex justify-center">
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-royal to-accent flex items-center justify-center text-accent-contrast font-bold text-xs"
              title={`${s.name} (${s.department})`}
            >
              {studentInitials}
            </div>
          </div>
        )}

        {/* Search Field (if expanded) */}
        {!collapsed && (
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search portal..."
                className="w-full bg-card/60 border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        )}

        {/* Menu Label & Nav Items */}
        <div className="flex-1 px-3 py-2 overflow-y-auto space-y-1">
          {!collapsed && (
            <div className="px-2 pt-2 pb-1 label-spec text-[10px]">MENU</div>
          )}

          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-all duration-200 relative group motion-pressable ${
                  isActive
                    ? 'bg-accent/15 text-accent font-semibold border-l-[3px] border-accent pl-2.5 shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-card-hover hover:translate-x-1'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-accent' : 'text-text-muted group-hover:text-text'}>
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.badge.variant === 'live'
                        ? 'bg-accent/20 text-accent border border-accent/30'
                        : item.badge.variant === 'alert'
                        ? 'bg-status-warning/20 text-status-warning border border-status-warning/30'
                        : 'bg-border text-text-muted'
                    }`}
                  >
                    {item.badge.text}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: EduPulse Pro Mini Card & Logout */}
        <div className="p-3 border-t border-border space-y-2">
          {!collapsed ? (
            <div className="p-3 rounded-xl bg-card border border-border relative overflow-hidden">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-bold text-text">EduPulse Pro</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Semester 5 AI Diagnostics & Remedial Roadmap Active
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/25 flex items-center justify-center text-accent" title="EduPulse Pro Active">
                <Zap className="w-4 h-4" />
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Switch Portal / Log Out"
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
        {/* Top Bar (DESIGN SPEC) */}
        <header className="sticky top-0 z-30 h-16 bg-bg/80 backdrop-blur-md border-b border-border flex items-center px-4 sm:px-6">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-text-muted hover:text-text p-1.5 rounded-lg bg-card border border-border"
            >
              <Menu className="w-5 h-5" />
            </button>

          {/* Left: Rounded "Student Portal" pill with accent dot + Academic Session text */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-bold text-accent">Student Portal</span>
            </div>
            <span className="hidden md:inline text-xs text-text-muted font-medium">
              Academic Session 2025-26 · {s.semester}
            </span>
          </div>

          {/* Centre: Rounded Search Bar */}
          <div className="flex-1 max-w-md mx-auto hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses, exams, attendance..."
                className="w-full bg-card border border-border rounded-full pl-10 pr-4 py-1.5 text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Right Controls: Theme Toggle, Notifications, Avatar Pill */}
          <div className="flex items-center gap-2.5 ml-auto">
            {/* Theme Toggle (Sun/Moon in a round button) */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-text hover:border-accent hover:text-accent transition-colors shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell with red count badge */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                  setSwitcherOpen(false);
                }}
                className="relative w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-accent transition-colors shadow-sm"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-status-danger text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-spec-hover z-50 p-3 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-bold text-text">Campus Notifications</span>
                    <span className="text-[10px] text-accent font-semibold">{unreadCount} new</span>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-left transition-colors ${
                          n.unread
                            ? 'bg-accent/10 border-accent/25'
                            : 'bg-card-hover/40 border-border text-text-muted'
                        }`}
                      >
                        <p className="text-xs text-text font-medium">{n.text}</p>
                        <span className="text-[10px] text-text-muted mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Student Switcher & Profile Avatar Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setSwitcherOpen(!switcherOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-card border border-border hover:border-accent transition-all shadow-sm group"
                title="Switch student profile"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-royal to-accent text-accent-contrast font-bold text-xs flex items-center justify-center">
                  {studentInitials}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-text truncate max-w-[110px]">{s.name}</span>
                  <span className="text-[9px] text-text-muted font-mono">{s.roll_no}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-transform" />
              </button>

              {/* Switcher Modal */}
              {switcherOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-spec-hover z-50 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-accent" />
                      <span className="text-xs font-bold text-text uppercase tracking-spec-label">
                        Switch Active Student
                      </span>
                    </div>
                    <button
                      onClick={() => setSwitcherOpen(false)}
                      className="text-text-muted hover:text-text text-xs p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-[11px] text-text-muted">
                    Test different student profiles to see how the dashboard dynamically adapts:
                  </p>

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
                              ? 'bg-accent/15 border-accent text-text'
                              : 'bg-card border-border hover:bg-card-hover text-text-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${demo.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                              {demo.initials}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-text flex items-center gap-1.5">
                                <span className="truncate">{demo.name}</span>
                                {isCurrent && <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />}
                              </div>
                              <div className="text-[10px] text-text-muted truncate">
                                {demo.rollNo} · {demo.course}
                              </div>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            demo.risk === 'High' ? 'bg-status-danger/15 text-status-danger' :
                            demo.risk === 'Medium' ? 'bg-status-warning/15 text-status-warning' :
                            'bg-status-success/15 text-status-success'
                          }`}>
                            {demo.risk} Risk
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
