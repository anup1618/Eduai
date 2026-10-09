import React, { useState } from 'react';
import {
  Activity, LayoutDashboard, BarChart2, BookOpen, Calendar,
  Brain, MessageSquare, User, Settings, LogOut, Menu, X, Bell, ChevronDown
} from 'lucide-react';
import type { PortalRole } from '../../data/portalData';
import { DEMO_STUDENT } from '../../data/portalData';

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

  const notifications = [
    { id: 1, text: 'Prof. Suresh Kumar responded to your request REQ-001', time: '2h ago', unread: true },
    { id: 2, text: 'Test 2 marks for Machine Learning have been uploaded', time: '1d ago', unread: true },
    { id: 3, text: 'Attendance for Oct 7 marked — 3 absences recorded', time: '2d ago', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

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

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#0b1226] border border-[#14224a] hover:border-[#2f7bff] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                {DEMO_STUDENT.avatar_initials}
              </div>
              <span className="text-sm font-semibold text-white hidden sm:block">{DEMO_STUDENT.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 w-56 bg-[#0b1226] border border-[#14224a] rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-4 bg-gradient-to-br from-blue-600/10 to-cyan-600/5 border-b border-[#14224a]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold mb-2">
                    {DEMO_STUDENT.avatar_initials}
                  </div>
                  <p className="text-sm font-bold text-white">{DEMO_STUDENT.name}</p>
                  <p className="text-xs text-slate-400">{DEMO_STUDENT.roll_no}</p>
                </div>
                <div className="p-2">
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
