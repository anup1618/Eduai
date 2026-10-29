import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Shield
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
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  mobileOpen,
  setMobileOpen,
  onOpenAnalyst,
  onLogout,
  collapsed: controlledCollapsed,
  onToggleCollapse,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(prev => !prev));

  const navItems: { id: NavigationPage; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'College Overview', icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" /> },
    { id: 'student-intelligence', label: 'Student Intelligence', icon: <GraduationCap className="w-5 h-5 flex-shrink-0" /> },
    { id: 'risk-analysis', label: 'Risk Analysis', icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" /> },
    { id: 'student-segments', label: 'Student Segments', icon: <Users className="w-5 h-5 flex-shrink-0" /> },
    { id: 'intervention-centre', label: 'Intervention Centre', icon: <LifeBuoy className="w-5 h-5 flex-shrink-0" /> },
    { id: 'data-integration', label: 'Data Integration', icon: <Database className="w-5 h-5 flex-shrink-0" /> },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet className="w-5 h-5 flex-shrink-0" /> },
    { id: 'users', label: 'Users & Rosters', icon: <UserCheck className="w-5 h-5 flex-shrink-0" /> },
    { id: 'departments', label: 'Departments & Courses', icon: <BookOpen className="w-5 h-5 flex-shrink-0" /> },
    { id: 'assignments', label: 'Faculty Workload', icon: <Users className="w-5 h-5 flex-shrink-0" /> },
    { id: 'permissions', label: 'Access Permissions', icon: <ShieldAlert className="w-5 h-5 flex-shrink-0" /> },
    { id: 'settings', label: 'Settings & Weights', icon: <Settings className="w-5 h-5 flex-shrink-0" /> },
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

      {/* Floating Glass Sidebar (DESIGN SPEC: radius 22px, margin 16px, collapsible) */}
      <aside
        className={`fixed top-4 bottom-4 left-4 z-40 rounded-spec-sidebar spec-glass flex flex-col transition-all duration-300 ${
          isCollapsed ? 'w-[72px]' : 'w-[260px]'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-[calc(100%+24px)] lg:translate-x-0'
        }`}
      >
        {/* Collapse Toggle Button (Right Edge) */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3.5 top-8 w-7 h-7 rounded-full bg-accent text-accent-contrast shadow-md items-center justify-center hover:scale-110 transition-transform z-10"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Logo and Brand */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
              <Activity className="w-5 h-5 text-accent stroke-[2.5]" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-text tracking-tight">EduPulse AI</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                    ADMIN
                  </span>
                </div>
                <p className="text-[11px] text-text-muted truncate">Institutional Intelligence OS</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-xl text-text-muted hover:text-text lg:hidden ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {!isCollapsed && (
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-accent/15 text-accent font-semibold border-l-[3px] border-accent pl-2.5'
                    : 'text-text-muted hover:text-text hover:bg-card-hover hover:translate-x-0.5'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-accent' : 'text-text-muted'}>{item.icon}</span>
                {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-border text-text-muted">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* AI Campus Assistant Callout Button */}
        {onOpenAnalyst && !isCollapsed && (
          <div className="p-3 mx-3 mb-2 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-bold text-text">Campus Analyst</span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed mb-2">
              Query risk cohorts, placement readiness & department gaps.
            </p>
            <button
              onClick={() => {
                onOpenAnalyst();
                setMobileOpen(false);
              }}
              className="w-full btn-spec-primary text-xs py-1.5 px-3"
            >
              Ask Campus Analyst
            </button>
          </div>
        )}

        {/* Logout button */}
        {onLogout && (
          <div className="p-3 border-t border-border">
            <button
              onClick={onLogout}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Switch Portal / Log Out"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Switch Portal / Log Out</span>}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
