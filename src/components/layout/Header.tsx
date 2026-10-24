import React from 'react';
import { Menu, Sparkles, Filter, RefreshCw, Shield, Sun, Moon } from 'lucide-react';
import { useCampusData } from '../../context/CampusDataContext';
import { useTheme } from '../../context/ThemeContext';
import { NavigationPage } from './Sidebar';

interface HeaderProps {
  currentPage: NavigationPage;
  onOpenMobileNav: () => void;
  onOpenAnalyst: () => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const PAGE_METADATA: Record<NavigationPage, { title: string; subtitle: string }> = {
  overview: {
    title: 'College Overview',
    subtitle: 'Institutional metrics, distributions, and calculated priority insights.',
  },
  'student-intelligence': {
    title: 'Student Intelligence',
    subtitle: 'Holistic multi-dimensional student profiles, explainable scores, and telemetry.',
  },
  'risk-analysis': {
    title: 'Risk Analysis Matrix',
    subtitle: 'Early warning indicators across academic criteria and placement readiness.',
  },
  'student-segments': {
    title: 'Student Segments',
    subtitle: 'Targeted cohorts categorized by academic standing and career preparation.',
  },
  'intervention-centre': {
    title: 'Intervention Centre',
    subtitle: 'Prescriptive action plans, mentoring assignments, and outcome tracking.',
  },
  'data-integration': {
    title: 'Data Integration Hub',
    subtitle: 'Multi-source CSV ingestion, range validation, duplicate handling, and schema sync.',
  },
  reports: {
    title: 'Institutional Reports',
    subtitle: 'Exportable student profiles, departmental audits, and print-ready documentation.',
  },
  users: {
    title: 'User Management',
    subtitle: 'Manage enrolled student rosters, faculty credentials, and role status.',
  },
  departments: {
    title: 'Departments & Subjects',
    subtitle: 'Curriculum structure, department heads, and academic offerings.',
  },
  assignments: {
    title: 'Faculty Course Assignments',
    subtitle: 'Teaching assignments, section allocations, and instructional workload.',
  },
  permissions: {
    title: 'Role-Based Access Permissions',
    subtitle: 'Enforce portal boundaries and feature authorization across roles.',
  },
  settings: {
    title: 'Platform Settings & Calibration',
    subtitle: 'Configure scoring weights, risk thresholds, and manage demo datasets.',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onOpenMobileNav,
  onOpenAnalyst,
  showFilters,
  setShowFilters,
}) => {
  const { students, filteredStudents, resetFilters, filters } = useCampusData();
  const { theme, toggleTheme } = useTheme();
  const pageMeta = PAGE_METADATA[currentPage] || { title: 'EduPulse AI', subtitle: 'Institutional Intelligence OS' };

  const hasActiveFilters =
    filters.department !== 'All' ||
    filters.academic_year !== 'All' ||
    filters.semester !== 'All' ||
    filters.academic_risk !== 'All' ||
    filters.placement_risk !== 'All' ||
    filters.segment !== 'All' ||
    filters.searchQuery.trim() !== '';

  return (
    <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="p-1.5 text-text-muted hover:text-text rounded-xl hover:bg-card-hover border border-border lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-text tracking-tight">{pageMeta.title}</h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 border border-accent/25 text-[10px] font-bold text-accent">
                <Shield className="w-2.5 h-2.5" /> Admin
              </span>
            </div>
            <p className="text-xs text-text-muted hidden sm:block">{pageMeta.subtitle}</p>
          </div>
        </div>

        {/* Right: Actions, Theme Toggle, & Cohort Counts */}
        <div className="flex items-center gap-2.5">
          {/* Cohort size pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs">
            <span className="font-bold text-accent">{filteredStudents.length}</span>
            <span className="text-text-muted">/</span>
            <span className="text-text-muted">{students.length} students</span>
          </div>

          {/* Toggle Filter Bar */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-accent/15 text-accent border-accent/40 shadow-sm'
                : 'bg-card text-text-muted border-border hover:border-accent hover:text-text'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </button>

          {/* Clear filters if active */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="p-1.5 text-text-muted hover:text-text rounded-xl hover:bg-card-hover border border-border"
              title="Reset all filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-text hover:border-accent hover:text-accent transition-colors shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Campus Analyst Button */}
          <button
            onClick={onOpenAnalyst}
            className="btn-spec-primary text-xs py-1.5 px-3.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Campus Analyst</span>
          </button>
        </div>
      </div>
    </header>
  );
};
