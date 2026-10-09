import React from 'react';
import { Menu, Sparkles, Filter, RefreshCw, Shield } from 'lucide-react';
import { useCampusData } from '../../context/CampusDataContext';
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
  const pageMeta = PAGE_METADATA[currentPage] || { title: 'EduPulse AI', subtitle: 'Smart Campus Analytics' };

  const hasActiveFilters =
    filters.department !== 'All' ||
    filters.academic_year !== 'All' ||
    filters.semester !== 'All' ||
    filters.academic_risk !== 'All' ||
    filters.placement_risk !== 'All' ||
    filters.segment !== 'All' ||
    filters.searchQuery.trim() !== '';

  return (
    <header className="sticky top-0 z-30 bg-[#03050c]/85 backdrop-blur-md border-b border-[#14224a] px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#0b1226] lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold gradient-title tracking-tight">{pageMeta.title}</h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-cyan-400">
                <Shield className="w-2.5 h-2.5" /> Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">{pageMeta.subtitle}</p>
          </div>
        </div>

        {/* Right: Actions & Cohort Counts */}
        <div className="flex items-center gap-2.5">
          {/* Cohort size pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0b1226] border border-[#14224a] text-xs">
            <span className="font-bold text-cyan-400">{filteredStudents.length}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{students.length} students</span>
          </div>

          {/* Toggle Filter Bar */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-blue-600/20 text-cyan-300 border-cyan-400/50 shadow-glow-cyan'
                : 'bg-[#0b1226] text-slate-300 border-[#14224a] hover:border-cyan-400/30'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>

          {/* Clear filters if active */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#0b1226]"
              title="Reset all filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Campus Analyst Button */}
          <button
            onClick={onOpenAnalyst}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold btn-primary text-white shadow-glow-blue transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span className="hidden sm:inline">AI Campus Analyst</span>
          </button>
        </div>
      </div>
    </header>
  );
};
