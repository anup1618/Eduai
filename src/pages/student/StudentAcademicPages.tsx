import React, { useState } from 'react';
import {
  TrendingUp, Award, AlertTriangle, BookOpen, ChevronRight,
  Star, TrendingDown, Calendar, CheckCircle2, AlertCircle, Clock,
  ArrowRight, Sparkles, Filter
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, AreaChart, Area, BarChart, Bar
} from 'recharts';
import {
  MONTHLY_MARKS, MONTHLY_ATTENDANCE,
  ASSESSMENT_HISTORY, ATTENDANCE_CALENDAR_OCT, DAY_LECTURES
} from '../../data/portalData';
import { useCurrentStudent } from '../../context/CampusDataContext';
import { SpecKpiCard, SpecPageHeader, SpecProgressBar } from '../../components/common/SpecComponents';

// ─── TOOLTIP STYLE ACCORDING TO SPEC ──────────────────────────────────────────
const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'var(--card)',
    borderColor: 'var(--border)',
    borderRadius: '12px',
    color: 'var(--text)',
    boxShadow: 'var(--shadow-card-hover)',
    fontSize: '12px',
    padding: '8px 12px',
  },
  itemStyle: {
    color: 'var(--text)',
  },
};

// ─── STUDENT DASHBOARD / COCKPIT ──────────────────────────────────────────────

interface StudentDashboardProps {
  onNavigateTab?: (page: any) => void;
}

export function StudentDashboardPage({ onNavigateTab }: StudentDashboardProps) {
  const [perfTab, setPerfTab] = useState<'semester' | 'monthly'>('semester');
  const [calMonth] = useState('October 2025');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const s = useCurrentStudent();
  const bestSem  = s.sgpa_history.reduce((a, b) => a.sgpa > b.sgpa ? a : b);
  const worstSem = s.sgpa_history.reduce((a, b) => a.sgpa < b.sgpa ? a : b);
  const strongSub = [...s.subjects].sort((a, b) => b.internal_pct - a.internal_pct)[0];
  const weakSub   = [...s.subjects].sort((a, b) => a.internal_pct - b.internal_pct)[0];

  // Build calendar grid for Oct 2025 (starts Wednesday = col 3)
  const daysInOct = 31;
  const startDay  = 3; // Wed
  const calCells  = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInOct }, (_, i) => i + 1),
  ];

  const dayStatus = (day: number | null) => {
    if (!day) return null;
    const key = `2025-10-${String(day).padStart(2, '0')}`;
    return ATTENDANCE_CALENDAR_OCT[key] ?? null;
  };

  const standingVariant = s.overall_attendance >= 75 && s.cgpa >= 7.5
    ? 'success'
    : s.overall_attendance < 75
    ? 'danger'
    : 'warning';

  const standingLabel = s.overall_attendance >= 75 && s.cgpa >= 7.5
    ? 'Safe Standing'
    : s.overall_attendance < 75
    ? 'Attendance Risk'
    : 'Monitor Academic';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* PAGE HEADER (DESIGN SPEC) */}
      <SpecPageHeader
        title="Student Cockpit"
        semesterChip={s.semester}
        subtitle={`Welcome back, ${s.name} · ${s.department} · ${s.roll_no}`}
        sessionText="Active Session · 2025-26"
        standingChip={{
          text: standingLabel,
          variant: standingVariant,
        }}
      />

      {/* 12-COLUMN BENTO GRID: ROW 1 - 4 KPI CARDS (3 cols each) */}
      <div className="grid grid-cols-12 gap-4">
        {/* KPI 1: Success Score */}
        <SpecKpiCard
          icon={<Award className="w-5 h-5 text-accent" />}
          statusChip={{ text: 'Top 15%', variant: 'accent' }}
          number={`${s.success_score}/100`}
          caption="Composite AI Readiness Index"
          label="AI PROGRESS TRACKER"
          percent={s.success_score}
          onClick={() => onNavigateTab && onNavigateTab('ai-progress')}
        />

        {/* KPI 2: Current CGPA */}
        <SpecKpiCard
          icon={<TrendingUp className="w-5 h-5 text-accent" />}
          statusChip={{
            text: s.cgpa >= 8.5 ? 'Tier 1' : s.cgpa >= 7.0 ? 'Tier 2' : 'Tier 3',
            variant: s.cgpa >= 8.0 ? 'success' : 'warning',
          }}
          number={s.cgpa.toFixed(2)}
          caption="Cumulative Overall (5 Semesters)"
          label="VIEW PERFORMANCE"
          percent={(s.cgpa / 10) * 100}
          onClick={() => onNavigateTab && onNavigateTab('performance')}
        />

        {/* KPI 3: Attendance */}
        <SpecKpiCard
          icon={<Calendar className="w-5 h-5 text-accent" />}
          statusChip={{
            text: s.overall_attendance >= 75 ? 'Safe Standing' : 'Critical Risk',
            variant: s.overall_attendance >= 75 ? 'success' : 'danger',
          }}
          number={`${s.overall_attendance}%`}
          caption={`${s.classes_attended}/${s.classes_conducted} Lectures Attended`}
          label="VIEW ATTENDANCE"
          percent={s.overall_attendance}
          onClick={() => onNavigateTab && onNavigateTab('attendance')}
        />

        {/* KPI 4: Academic Alerts */}
        <SpecKpiCard
          icon={<AlertTriangle className="w-5 h-5 text-accent" />}
          statusChip={{
            text: s.overall_attendance < 75 ? 'Action Needed' : 'All Clear',
            variant: s.overall_attendance < 75 ? 'danger' : 'success',
          }}
          number={s.overall_attendance < 75 ? 2 : 0}
          caption={s.overall_attendance < 75 ? 'Attendance below threshold' : 'No active alerts'}
          label="VIEW ANALYTICS"
          onClick={() => onNavigateTab && onNavigateTab('analytics')}
        />
      </div>

      {/* 12-COLUMN BENTO GRID: ROW 2 - Performance Trend (8 cols) & Attendance Calendar (4 cols) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Performance Trend Chart (8 cols) */}
        <div className="spec-card col-span-12 lg:col-span-8 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="title-section">Academic Performance Trajectory</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Semester SGPA progression and internal test marks
              </p>
            </div>

            {/* Tab switch */}
            <div className="flex gap-1.5 p-1 rounded-xl bg-card-hover border border-border">
              <button
                onClick={() => setPerfTab('semester')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  perfTab === 'semester'
                    ? 'btn-spec-primary shadow-sm text-xs py-1 px-3'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Semester-wise
              </button>
              <button
                onClick={() => setPerfTab('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  perfTab === 'monthly'
                    ? 'btn-spec-primary shadow-sm text-xs py-1 px-3'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Month-wise Internals
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            {perfTab === 'semester' ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={s.sgpa_history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                  <XAxis
                    dataKey="semester"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis
                    domain={[5, 10]}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="sgpa"
                    stroke="var(--chart-1)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--chart-1)', r: 5 }}
                    activeDot={{ r: 7, stroke: 'var(--card)', strokeWidth: 2 }}
                    name="SGPA"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_MARKS}>
                  <defs>
                    <linearGradient id="markGradSpec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis
                    domain={[60, 95]}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="marks"
                    stroke="var(--chart-1)"
                    fill="url(#markGradSpec)"
                    strokeWidth={3}
                    name="Internal Marks %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
            <span>Overall Pace: Steady Progress (+0.3 SGPA across last 2 sems)</span>
            <span className="font-semibold text-accent">Target SGPA: 8.50</span>
          </div>
        </div>

        {/* Attendance Calendar (4 cols) with exact Spec rounded day cells */}
        <div className="spec-card col-span-12 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="title-section">Attendance</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-card-hover border border-border text-text-muted">
                {calMonth}
              </span>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-[10px] font-bold text-text-muted">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calCells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const st = dayStatus(day);
                const key = `2025-10-${String(day).padStart(2, '0')}`;
                const isSelected = selectedDate === key;
                const isToday = day === 24; // Oct 24th

                // Calendar cell styles per Design Spec:
                // Present = emerald tint, Absent = red tint, Holiday = muted, Today = accent outline, selected day = accent fill
                let cellClass = 'border border-transparent text-text-muted hover:border-border';

                if (st === 'present') {
                  cellClass = 'bg-status-success/15 text-status-success border-status-success/30 font-semibold';
                } else if (st === 'absent') {
                  cellClass = 'bg-status-danger/15 text-status-danger border-status-danger/30 font-semibold';
                } else if (st === 'partial') {
                  cellClass = 'bg-status-warning/15 text-status-warning border-status-warning/30 font-semibold';
                } else if (st === 'holiday') {
                  cellClass = 'bg-card-hover/60 text-text-muted/60 border-border/40';
                }

                if (isToday) {
                  cellClass += ' ring-2 ring-accent';
                }

                if (isSelected) {
                  cellClass = 'bg-accent text-accent-contrast font-bold shadow-sm';
                }

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : key)}
                    className={`aspect-square flex items-center justify-center text-xs rounded-xl transition-all duration-150 ${cellClass}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2.5 mt-3 pt-2.5 border-t border-border text-[11px] text-text-muted">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-status-success" />
                <span>Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-status-danger" />
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-status-warning" />
                <span>Partial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <span>Holiday</span>
              </div>
            </div>

            {/* Selected day preview */}
            {selectedDate && DAY_LECTURES[selectedDate] && (
              <div className="mt-3 p-3 rounded-xl bg-card-hover border border-border space-y-1.5">
                <p className="text-xs font-bold text-text">{selectedDate} Schedule</p>
                {DAY_LECTURES[selectedDate].map((lec, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-text-muted truncate max-w-[140px]">{lec.subject}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        lec.status === 'Present'
                          ? 'bg-status-success/15 text-status-success'
                          : 'bg-status-danger/15 text-status-danger'
                      }`}
                    >
                      {lec.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 12-COLUMN BENTO GRID: ROW 3 - Recent Activity (6 cols) & Subject Diagnostics (6 cols) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Recent Academic Activity (6 cols) */}
        <div className="spec-card col-span-12 lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="title-section">Recent Assessment Log</h2>
              <span className="label-spec text-[10px]">LATEST EXAMS</span>
            </div>

            <div className="space-y-2.5">
              {ASSESSMENT_HISTORY.slice(0, 4).map((a, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-card border border-border hover:bg-card-hover transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text truncate">{a.subject}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {a.type} · {a.date}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-text">{a.score}/{a.max}</span>
                    <span
                      className={`block text-[10px] font-bold ${
                        a.pct >= 80
                          ? 'text-status-success'
                          : a.pct >= 60
                          ? 'text-status-warning'
                          : 'text-status-danger'
                      }`}
                    >
                      {a.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Attendance Alert Notice */}
            {s.overall_attendance < 75 && (
              <div className="mt-4 p-3 rounded-xl bg-status-danger/10 border border-status-danger/25 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-status-danger flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-status-danger">Attendance Notice: </span>
                  <span className="text-text-muted">
                    Attendance is currently {s.overall_attendance}%. University regulations require ≥75% to appear for end-term exams without condonation.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Diagnostic Insights (6 cols) */}
        <div className="spec-card col-span-12 lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="title-section">Semester Diagnostics</h2>
              <span className="label-spec text-[10px]">AI ANALYSIS</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Strong Subject */}
              <div className="p-3.5 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-1.5 text-status-success text-[11px] font-semibold mb-1">
                  <Star className="w-3.5 h-3.5" />
                  <span>Strong Subject</span>
                </div>
                <p className="text-xs font-bold text-text truncate">{strongSub.name}</p>
                <p className="text-xs text-text-muted mt-1">{strongSub.internal_pct}% internal marks</p>
              </div>

              {/* Focus Area */}
              <div className="p-3.5 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-1.5 text-status-danger text-[11px] font-semibold mb-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Focus Area</span>
                </div>
                <p className="text-xs font-bold text-text truncate">{weakSub.name}</p>
                <p className="text-xs text-text-muted mt-1">{weakSub.internal_pct}% internal marks</p>
              </div>

              {/* Best Semester */}
              <div className="p-3.5 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-1.5 text-accent text-[11px] font-semibold mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Peak Semester</span>
                </div>
                <p className="text-sm font-bold text-accent">{bestSem.sgpa.toFixed(2)} SGPA</p>
                <p className="text-xs text-text-muted mt-0.5">{bestSem.semester}</p>
              </div>

              {/* Active Backlogs */}
              <div className="p-3.5 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-semibold mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Active Backlogs</span>
                </div>
                <p className={`text-sm font-bold ${s.backlogs > 0 ? 'text-status-danger' : 'text-status-success'}`}>
                  {s.backlogs} {s.backlogs === 0 ? 'Clear' : 'Pending'}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {s.backlogs === 0 ? 'Fully eligible for placements' : 'Requires remedial clearing'}
                </p>
              </div>
            </div>

            {/* Smart Recommendation Banner */}
            <div className="mt-4 p-3 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-xs text-text font-medium">
                  Boost {weakSub.name} by 4% to secure a Tier-1 placement badge.
                </span>
              </div>
              <button
                onClick={() => onNavigateTab && onNavigateTab('ai-progress')}
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1 flex-shrink-0 ml-2"
              >
                Plan <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT ANALYTICS PAGE ───────────────────────────────────────────────────

export function StudentAnalyticsPage() {
  const s = useCurrentStudent();
  const [semFilter, setSemFilter] = useState('All');

  const subjectComparison = s.subjects.map(sub => ({
    subject: sub.name.split(' ').slice(-1)[0],
    internals: sub.internal_pct,
    attendance: s.subject_attendance.find(a => a.subject === sub.name)?.pct ?? 0,
  }));

  const monthDelta = MONTHLY_MARKS.map((m, i) => ({
    month: m.month,
    marks: m.marks,
    delta: i === 0 ? 0 : m.marks - MONTHLY_MARKS[i - 1].marks,
  }));

  const riskIndicators = [
    { label: 'Computer Networks attendance below 75%', level: 'High' as const, note: 'Currently 71% · Minimum 75% required' },
    { label: 'Software Engineering attendance below 75%', level: 'High' as const, note: 'Currently 71% · Minimum 75% required' },
    { label: 'Coding assessment score (58/100) below placement threshold', level: 'Watch' as const, note: 'Target ≥65 for Tier-1 eligibility' },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <SpecPageHeader
        title="Student Analytics"
        semesterChip={s.semester}
        subtitle="Detailed academic trajectory, threshold risk analysis, and engagement matrix"
        sessionText="Academic Intelligence"
        standingChip={{ text: 'Detailed Diagnostics', variant: 'accent' }}
      />

      {/* Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-text-muted" />
        <span className="label-spec text-[10px]">SEMESTER:</span>
        {['All', 'Sem 3', 'Sem 4', 'Sem 5'].map(v => (
          <button
            key={v}
            onClick={() => setSemFilter(v)}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              semFilter === v
                ? 'btn-spec-primary py-1 px-3.5 text-xs'
                : 'bg-card border border-border text-text-muted hover:text-text hover:border-accent'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* 12-Column Bento Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* SGPA Long-Term Trend (6 cols) */}
        <div className="spec-card col-span-12 lg:col-span-6 flex flex-col justify-between">
          <div>
            <h2 className="title-section mb-1">SGPA Historical Trend</h2>
            <p className="text-xs text-text-muted mb-4">Semester-by-semester Grade Point Average progression</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={s.sgpa_history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                  <XAxis dataKey="semester" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis domain={[5, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="sgpa"
                    stroke="var(--chart-1)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--chart-1)', r: 4 }}
                    name="SGPA"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Subject Comparison (6 cols) */}
        <div className="spec-card col-span-12 lg:col-span-6 flex flex-col justify-between">
          <div>
            <h2 className="title-section mb-1">Subject Correlation</h2>
            <p className="text-xs text-text-muted mb-4">Internal Marks vs Subject Attendance</p>
            <div className="space-y-3.5">
              {subjectComparison.map((sub, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text font-medium">{sub.subject}</span>
                    <span className="text-text-muted">
                      {sub.internals}% Marks · {sub.attendance}% Att
                    </span>
                  </div>
                  <div className="space-y-1">
                    <SpecProgressBar value={sub.internals} fillClassName="bg-chart-2" />
                    <SpecProgressBar
                      value={sub.attendance}
                      fillClassName={sub.attendance < 75 ? 'bg-status-danger' : 'bg-chart-1'}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-text-muted">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-chart-2" /> Internals
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-chart-1" /> Safe Attendance
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-danger" /> Below 75%
              </span>
            </div>
          </div>
        </div>

        {/* Month-on-Month Internal Marks (6 cols) */}
        <div className="spec-card col-span-12 lg:col-span-6 flex flex-col justify-between">
          <div>
            <h2 className="title-section mb-1">Monthly Delta</h2>
            <p className="text-xs text-text-muted mb-4">Internal score movements across consecutive months</p>
            <div className="grid grid-cols-5 gap-2">
              {monthDelta.map(m => (
                <div
                  key={m.month}
                  className="p-3 rounded-xl bg-card border border-border text-center"
                >
                  <p className="text-[10px] text-text-muted uppercase font-semibold">{m.month}</p>
                  <p className="text-sm font-bold text-text mt-0.5">{m.marks}%</p>
                  {m.delta !== 0 && (
                    <span
                      className={`text-[10px] font-bold mt-1 block ${
                        m.delta > 0 ? 'text-status-success' : 'text-status-danger'
                      }`}
                    >
                      {m.delta > 0 ? `+${m.delta}%` : `${m.delta}%`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Indicators (6 cols) */}
        <div className="spec-card col-span-12 lg:col-span-6 flex flex-col justify-between">
          <div>
            <h2 className="title-section mb-1">Rule-Based Risk Indicators</h2>
            <p className="text-xs text-text-muted mb-4">Automated threshold triggers evaluated against university standards</p>
            <div className="space-y-2.5">
              {riskIndicators.map((r, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border flex items-start gap-3 ${
                    r.level === 'High'
                      ? 'bg-status-danger/10 border-status-danger/25'
                      : 'bg-status-warning/10 border-status-warning/25'
                  }`}
                >
                  <AlertCircle
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      r.level === 'High' ? 'text-status-danger' : 'text-status-warning'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-text">{r.label}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{r.note}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.level === 'High'
                        ? 'bg-status-danger/20 text-status-danger'
                        : 'bg-status-warning/20 text-status-warning'
                    }`}
                  >
                    {r.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT PERFORMANCE PAGE ─────────────────────────────────────────────────

export function StudentPerformancePage() {
  const s = useCurrentStudent();
  const [selSem, setSelSem] = useState(s.semester || 'Sem 5');
  const curSgpa = s.sgpa_history.find(h => h.semester === selSem)?.sgpa ?? s.cgpa;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <SpecPageHeader
        title="Academic Performance"
        semesterChip={selSem}
        subtitle="Subject-wise grading, internal tests, practical scores, and semester historical records"
        sessionText="Transcript View"
        standingChip={{ text: `${s.cgpa.toFixed(2)} CGPA`, variant: 'success' }}
      />

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-12 gap-4">
        <SpecKpiCard
          icon={<Award className="w-5 h-5 text-accent" />}
          statusChip={{ text: 'Overall', variant: 'success' }}
          number={s.cgpa.toFixed(2)}
          caption="Cumulative Grade Point Average"
          label="OVERALL CGPA"
          percent={(s.cgpa / 10) * 100}
        />
        <SpecKpiCard
          icon={<TrendingUp className="w-5 h-5 text-accent" />}
          statusChip={{ text: selSem, variant: 'accent' }}
          number={curSgpa.toFixed(2)}
          caption={`Selected Semester Performance`}
          label="SEMESTER SGPA"
          percent={(curSgpa / 10) * 100}
        />
        <SpecKpiCard
          icon={<BookOpen className="w-5 h-5 text-accent" />}
          statusChip={{ text: 'Internal', variant: 'neutral' }}
          number={`${s.internal_marks}%`}
          caption="Aggregate Internal Test Score"
          label="INTERNAL MARKS"
          percent={s.internal_marks}
        />
        <SpecKpiCard
          icon={<AlertTriangle className="w-5 h-5 text-accent" />}
          statusChip={{
            text: s.backlogs === 0 ? 'Clear' : 'Pending',
            variant: s.backlogs === 0 ? 'success' : 'danger',
          }}
          number={s.backlogs}
          caption={s.backlogs === 0 ? 'Zero active backlogs' : 'Active subject backlogs'}
          label="BACKLOG STATUS"
        />
      </div>

      {/* Semester Selector */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="label-spec text-[10px]">CHOOSE SEMESTER:</span>
        {s.sgpa_history.map(h => (
          <button
            key={h.semester}
            onClick={() => setSelSem(h.semester)}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              selSem === h.semester
                ? 'btn-spec-primary py-1 px-3.5 text-xs'
                : 'bg-card border border-border text-text-muted hover:text-text hover:border-accent'
            }`}
          >
            {h.semester}
          </button>
        ))}
      </div>

      {/* Subject Performance Table (DESIGN SPEC Tables) */}
      <div className="spec-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="title-section">{selSem} Subject Scorecard</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Comprehensive internal assessments, assignments, practicals, and provisional letter grades
            </p>
          </div>
          <span className="label-spec text-[10px]">{s.subjects.length} REGISTERED COURSES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {['Course Name', 'Test 1', 'Test 2', 'Assignment', 'Practical', 'Internal %', 'Grade', 'Standing'].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 label-spec text-[10px]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.subjects.map((sub, i) => (
                <tr
                  key={i}
                  className="border-b border-border/60 hover:bg-card-hover transition-colors"
                >
                  <td className="py-3 px-3 font-semibold text-text">{sub.name}</td>
                  <td className="py-3 px-3 text-text-muted">{sub.test1}/20</td>
                  <td className="py-3 px-3 text-text-muted">{sub.test2}/20</td>
                  <td className="py-3 px-3 text-text-muted">{sub.assignment}/10</td>
                  <td className="py-3 px-3 text-text-muted">{sub.practical}/25</td>
                  <td className="py-3 px-3 font-bold text-accent">{sub.internal_pct}%</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-lg bg-accent/15 text-accent font-bold border border-accent/25">
                      {sub.grade}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'Safe'
                          ? 'bg-status-success/15 text-status-success'
                          : 'bg-status-warning/15 text-status-warning'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
