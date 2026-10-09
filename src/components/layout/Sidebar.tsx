import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  AlertTriangle,
  Users,
  LifeBuoy,
  Database,
  FileSpreadsheet,
  Settings,
  Activity,
  X,
  Sparkles,
  BookOpen,
  UserCheck,
  ShieldAlert,
  LogOut,
} from 'lucide-react';

export type NavigationPage =
  | 'overview'
  | 'student-intelligence'
  | 'risk-analysis'
  | 'student-segments'
  | 'intervention-centre'
  | 'data-integration'
  | 'reports'
  | 'users'
  | 'departments'
  | 'assignments'
  | 'permissions'
  | 'settings';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenAnalyst?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  mobileOpen,
  setMobileOpen,
  onOpenAnalyst,
  onLogout,
}) => {
  const navItems: { id: NavigationPage; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'College Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'student-intelligence', label: 'Student Intelligence', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'risk-analysis', label: 'Risk Analysis', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'student-segments', label: 'Student Segments', icon: <Users className="w-4 h-4" /> },
    { id: 'intervention-centre', label: 'Intervention Centre', icon: <LifeBuoy className="w-4 h-4" /> },
    { id: 'data-integration', label: 'Data Integration', icon: <Database className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'departments', label: 'Departments & Subjects', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'assignments', label: 'Faculty Assignments', icon: <Users className="w-4 h-4" /> },
    { id: 'permissions', label: 'Access Permissions', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings & Profile', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#03050c] border-r border-[#14224a] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand */}
        <div className="p-4 border-b border-[#14224a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_16px_rgba(47,123,255,0.4)]">
              <Activity className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight gradient-title">EduPulse</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'nav-active text-cyan-400'
                    : 'text-slate-400 hover:bg-[#0b1226] hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>{item.icon}</span>
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#14224a] text-slate-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* AI Campus Assistant Callout Button */}
        {onOpenAnalyst && (
          <div className="p-3 mx-2.5 mb-2 rounded-xl bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-white">AI Campus Analyst</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
              Query risk cohorts, placement readiness & department gaps.
            </p>
            <button
              onClick={() => {
                onOpenAnalyst();
                setMobileOpen(false);
              }}
              className="w-full text-xs font-bold py-1.5 px-2.5 rounded-lg btn-primary text-white shadow-glow-blue"
            >
              Ask Campus Analyst
            </button>
          </div>
        )}

        {/* Logout button */}
        {onLogout && (
          <div className="p-2.5 border-t border-[#14224a]">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Portal / Log Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
