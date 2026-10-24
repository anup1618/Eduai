import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { useCampusData } from '../../context/CampusDataContext';
import { Department, AcademicYear, Semester } from '../../types/student';
import { RiskLevel } from '../../types/risk';
import { SegmentType } from '../../types/segmentation';

const DEPARTMENTS: (Department | 'All')[] = [
  'All',
  'Computer Science',
  'Information Technology',
  'Electronics & Comm.',
  'Mechanical Eng.',
  'Civil Eng.',
];

const YEARS: (AcademicYear | 'All')[] = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

const SEMESTERS: (Semester | 'All')[] = [
  'All',
  'Sem 1',
  'Sem 2',
  'Sem 3',
  'Sem 4',
  'Sem 5',
  'Sem 6',
  'Sem 7',
  'Sem 8',
];

const RISK_LEVELS: (RiskLevel | 'All')[] = ['All', 'High', 'Moderate', 'Low', 'Insufficient Data'];

const SEGMENTS: (SegmentType | 'All')[] = [
  'All',
  'Strong Academics, Strong Placement Readiness',
  'Strong Academics, Low Placement Readiness',
  'Academic Support Needed',
  'Placement Preparation Needed',
  'Low LMS Participation',
  'Balanced Performers',
  'Insufficient Data',
];

export const FilterBar: React.FC = () => {
  const { filters, setFilters, resetFilters, filteredStudents, students } = useCampusData();

  const hasActiveFilters =
    filters.department !== 'All' ||
    filters.academic_year !== 'All' ||
    filters.semester !== 'All' ||
    filters.academic_risk !== 'All' ||
    filters.placement_risk !== 'All' ||
    filters.segment !== 'All' ||
    filters.searchQuery.trim() !== '';

  return (
    <div className="bg-bg/95 border-b border-border px-4 sm:px-6 py-3 space-y-3">
      {/* Top Search & Filter Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={e => setFilters({ searchQuery: e.target.value })}
            placeholder="Search by student name, ID, or department..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-card border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status & Reset */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">
            Showing <strong className="text-accent">{filteredStudents.length}</strong> of{' '}
            <strong className="text-text">{students.length}</strong> students
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl text-status-danger bg-status-danger/10 border border-status-danger/30 hover:bg-status-danger/20 transition"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Select Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
        {/* Department */}
        <div>
          <label className="block label-spec text-[10px] mb-1">
            Department
          </label>
          <select
            value={filters.department}
            onChange={e => setFilters({ department: e.target.value as any })}
            className="w-full text-xs bg-card border border-border rounded-xl px-2.5 py-1.5 text-text focus:outline-none focus:border-accent"
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d} className="bg-card text-text">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Year */}
        <div>
          <label className="block label-spec text-[10px] mb-1">
            Academic Year
          </label>
          <select
            value={filters.academic_year}
            onChange={e => setFilters({ academic_year: e.target.value as any })}
            className="w-full text-xs bg-card border border-border rounded-xl px-2.5 py-1.5 text-text focus:outline-none focus:border-accent"
          >
            {YEARS.map(y => (
              <option key={y} value={y} className="bg-card text-text">
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block label-spec text-[10px] mb-1">
            Semester
          </label>
          <select
            value={filters.semester}
            onChange={e => setFilters({ semester: e.target.value as any })}
            className="w-full text-xs bg-card border border-border rounded-xl px-2.5 py-1.5 text-text focus:outline-none focus:border-accent"
          >
            {SEMESTERS.map(s => (
              <option key={s} value={s} className="bg-card text-text">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Risk */}
        <div>
          <label className="block label-spec text-[10px] mb-1">
            Academic Risk
          </label>
          <select
            value={filters.academic_risk}
            onChange={e => setFilters({ academic_risk: e.target.value as any })}
            className="w-full text-xs bg-card border border-border rounded-xl px-2.5 py-1.5 text-text focus:outline-none focus:border-accent"
          >
            {RISK_LEVELS.map(r => (
              <option key={r} value={r} className="bg-card text-text">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Placement Risk */}
        <div>
          <label className="block label-spec text-[10px] mb-1">
            Placement Risk
          </label>
          <select
            value={filters.placement_risk}
            onChange={e => setFilters({ placement_risk: e.target.value as any })}
            className="w-full text-xs bg-card border border-border rounded-xl px-2.5 py-1.5 text-text focus:outline-none focus:border-accent"
          >
            {RISK_LEVELS.map(r => (
              <option key={r} value={r} className="bg-card text-text">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Cohort Segment */}
        <div>
          <label className="block label-spec text-[10px] mb-1">
            Student Segment
          </label>
          <select
            value={filters.segment}
            onChange={e => setFilters({ segment: e.target.value as any })}
            className="w-full text-xs bg-card border border-border rounded-xl px-2.5 py-1.5 text-text focus:outline-none focus:border-accent truncate"
          >
            {SEGMENTS.map(s => (
              <option key={s} value={s} className="bg-card text-text">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
