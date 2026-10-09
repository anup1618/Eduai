import React, { useState } from 'react';
import {
  TrendingUp, Award, AlertTriangle, BookOpen, ChevronRight,
  Star, TrendingDown, ChevronLeft
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, AreaChart, Area
} from 'recharts';
import {
  DEMO_STUDENT, MONTHLY_MARKS, MONTHLY_ATTENDANCE,
  ASSESSMENT_HISTORY, ATTENDANCE_CALENDAR_OCT, DAY_LECTURES
} from '../../data/portalData';

// ─── Shared mini helpers ──────────────────────────────────────────────────────

const CHART_STYLE = {
  tooltip: { contentStyle: { background: '#0b1226', border: '1px solid #14224a', borderRadius: 8, color: '#e2e8f0' } }
};

function MetricTile({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className={`glow-card panel metric-accent-top p-5 flex flex-col gap-1`}>
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={`text-2xl font-extrabold ${accent || 'text-white'}`}>{value}</span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  );
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="glow-card panel p-5 flex flex-col gap-4">
      {title && <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">{title}</h3>}
      {children}
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function StudentDashboardPage() {
  const [perfTab, setPerfTab] = useState<'semester' | 'monthly'>('semester');
  const [calMonth] = useState('October 2025');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const s = DEMO_STUDENT;
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

  const statusColor: Record<string, string> = {
    present: 'bg-green-500/20 text-green-400 border-green-500/30',
    absent:  'bg-red-500/20 text-red-400 border-red-500/30',
    partial: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    holiday: 'bg-slate-700/40 text-slate-500 border-slate-700/40',
  };

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-extrabold gradient-title">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Welcome back, {s.name} — {s.department}, {s.semester}</p>
      </div>

      {/* Demo note */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold w-fit">
        ⚠ Demo Data — All figures are synthetic and for demonstration only
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile label="Success Score"  value={`${s.success_score}/100`} sub='See AI Progress Tracker' accent="text-blue-400" />
        <MetricTile label="Current CGPA"   value={s.cgpa.toFixed(2)}        sub="Overall (5 semesters)"  accent="text-cyan-400"  />
        <MetricTile label="Attendance"     value={`${s.overall_attendance}%`} sub={`${s.classes_attended}/${s.classes_conducted} classes`} accent={s.overall_attendance < 75 ? 'text-red-400' : 'text-green-400'} />
        <MetricTile label="Academic Alerts" value={s.overall_attendance < 75 ? 2 : 1} sub="View in Analytics" accent="text-amber-400" />
      </div>

      {/* Middle row: Performance + Attendance calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance trend */}
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="Performance Trend">
            {/* Tab switch */}
            <div className="flex gap-2">
              {(['semester','monthly'] as const).map(t => (
                <button key={t} onClick={() => setPerfTab(t)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${perfTab === t ? 'btn-primary text-white' : 'bg-[#0b1226] text-slate-400 hover:text-white border border-[#14224a]'}`}>
                  {t === 'semester' ? 'Semester-wise' : 'Month-wise (Internals)'}
                </button>
              ))}
            </div>

            {perfTab === 'semester' ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={s.sgpa_history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#173066" />
                  <XAxis dataKey="semester" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[5, 10]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip {...CHART_STYLE.tooltip} />
                  <Line type="monotone" dataKey="sgpa" stroke="#2f7bff" strokeWidth={2.5} dot={{ fill: '#2f7bff', r: 4 }} name="SGPA" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={MONTHLY_MARKS}>
                  <defs>
                    <linearGradient id="markGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2f7bff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2f7bff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#173066" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[60, 90]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip {...CHART_STYLE.tooltip} />
                  <Area type="monotone" dataKey="marks" stroke="#2f7bff" fill="url(#markGrad)" strokeWidth={2.5} name="Internal Marks %" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          {/* Attendance mini chart */}
          <SectionCard title="Monthly Attendance Trend">
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={MONTHLY_ATTENDANCE}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#173066" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[60, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip {...CHART_STYLE.tooltip} />
                <Area type="monotone" dataKey="pct" stroke="#22d3ee" fill="url(#attGrad)" strokeWidth={2} name="Attendance %" />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* Attendance calendar */}
        <SectionCard title={`Attendance — ${calMonth}`}>
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-[10px] font-bold text-slate-500">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calCells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const st = dayStatus(day);
              const key = `2025-10-${String(day).padStart(2,'0')}`;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(selectedDate === key ? null : key)}
                  className={`aspect-square flex items-center justify-center text-xs rounded-lg border transition-all
                    ${st ? statusColor[st] : 'text-slate-600 border-transparent'}
                    ${selectedDate === key ? 'ring-2 ring-blue-400' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-2">
            {[['present','Present','bg-green-500'],['absent','Absent','bg-red-500'],['partial','Partial','bg-amber-500'],['holiday','Holiday','bg-slate-600']].map(([k,l,c]) => (
              <div key={k} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${c}`} />
                <span className="text-[10px] text-slate-500">{l}</span>
              </div>
            ))}
          </div>
          {/* Day detail */}
          {selectedDate && DAY_LECTURES[selectedDate] && (
            <div className="mt-3 space-y-1.5 border-t border-[#14224a] pt-3">
              <p className="text-xs font-bold text-slate-300">{selectedDate}</p>
              {DAY_LECTURES[selectedDate].map((lec, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{lec.subject}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lec.status === 'Present' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {lec.status}
                  </span>
                </div>
              ))}
            </div>
          )}
          {selectedDate && !DAY_LECTURES[selectedDate] && (
            <p className="text-xs text-slate-500 mt-2 border-t border-[#14224a] pt-2">No lecture detail recorded for this date.</p>
          )}
        </SectionCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent academic activity */}
        <SectionCard title="Recent Academic Activity">
          <div className="space-y-2.5">
            {ASSESSMENT_HISTORY.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-200">{a.subject}</p>
                  <p className="text-[10px] text-slate-500">{a.type} · {a.date}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${a.pct >= 80 ? 'bg-green-500/20 text-green-400' : a.pct >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                  {a.score}/{a.max}
                </span>
              </div>
            ))}
          </div>
          {/* Low attendance alert */}
          <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">Computer Networks attendance is 71% — below the 75% threshold. Attend all remaining classes.</p>
          </div>
        </SectionCard>

        {/* Quick stats */}
        <SectionCard title="Quick Stats">
          <div className="grid grid-cols-2 gap-3">
            <div className="panel-raised p-4 rounded-xl">
              <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> Strong Subject</div>
              <p className="text-sm font-bold text-white">{strongSub.name}</p>
              <p className="text-xs text-slate-400">{strongSub.internal_pct}% internal</p>
            </div>
            <div className="panel-raised p-4 rounded-xl">
              <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3 text-red-400" /> Focus Area</div>
              <p className="text-sm font-bold text-white">{weakSub.name}</p>
              <p className="text-xs text-slate-400">{weakSub.internal_pct}% internal</p>
            </div>
            <div className="panel-raised p-4 rounded-xl bg-green-500/5 border border-green-500/20">
              <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-green-400" /> Best Semester</div>
              <p className="text-sm font-bold text-green-400">{bestSem.sgpa.toFixed(2)} SGPA</p>
              <p className="text-xs text-slate-400">{bestSem.semester}</p>
            </div>
            <div className="panel-raised p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3 text-red-400" /> Lowest Semester</div>
              <p className="text-sm font-bold text-red-400">{worstSem.sgpa.toFixed(2)} SGPA</p>
              <p className="text-xs text-slate-400">{worstSem.semester}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export function StudentAnalyticsPage() {
  const s = DEMO_STUDENT;
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
    { label: 'Computer Networks attendance below 75%', level: 'High' as const, note: 'Currently 71%' },
    { label: 'Software Engineering attendance below 75%', level: 'High' as const, note: 'Currently 71%' },
    { label: 'Coding score (58/100) below placement threshold', level: 'Watch' as const, note: 'Target ≥65' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold gradient-title">Analytics</h1>
        <p className="text-sm text-slate-400 mt-0.5">Detailed academic and engagement analysis</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {['All','Sem 3','Sem 4','Sem 5'].map(v => (
          <button key={v} onClick={() => setSemFilter(v)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${semFilter === v ? 'btn-primary text-white' : 'bg-[#0b1226] text-slate-400 border border-[#14224a] hover:text-white'}`}>
            {v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SGPA trend */}
        <SectionCard title="SGPA Trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={s.sgpa_history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#173066" />
              <XAxis dataKey="semester" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={[5, 10]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip {...CHART_STYLE.tooltip} />
              <Line type="monotone" dataKey="sgpa" stroke="#2f7bff" strokeWidth={2.5} dot={{ fill: '#2f7bff', r: 4 }} name="SGPA" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Subject comparison */}
        <SectionCard title="Subject Comparison (Internals vs Attendance)">
          <div className="space-y-3">
            {subjectComparison.map((sub, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">{sub.subject}</span>
                  <span className="text-slate-400">{sub.internals}% int · {sub.attendance}% att</span>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 bg-[#14224a] rounded-full overflow-hidden">
                    <div className="h-full bg-[#2f7bff] rounded-full" style={{ width: `${sub.internals}%` }} />
                  </div>
                  <div className="h-1.5 bg-[#14224a] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${sub.attendance < 75 ? 'bg-red-400' : 'bg-cyan-400'}`} style={{ width: `${sub.attendance}%` }} />
                  </div>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-slate-500 italic">Blue = internals, Cyan/Red = attendance. Charts do not imply causation.</p>
          </div>
        </SectionCard>

        {/* Month-on-month delta */}
        <SectionCard title="Month-on-Month Internal Marks Change">
          <div className="grid grid-cols-5 gap-2">
            {monthDelta.map((m) => (
              <div key={m.month} className={`panel-raised p-3 rounded-xl text-center ${m.delta > 0 ? 'bg-green-500/5 border-green-500/20' : m.delta < 0 ? 'bg-red-500/5 border-red-500/20' : ''}`}>
                <p className="text-[10px] text-slate-500">{m.month}</p>
                <p className="text-sm font-bold text-white">{m.marks}%</p>
                {m.delta !== 0 && (
                  <p className={`text-[10px] font-bold ${m.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {m.delta > 0 ? '+' : ''}{m.delta}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Risk indicators */}
        <SectionCard title="Risk Indicators (Rule-Based)">
          <p className="text-[10px] text-slate-500 italic mb-2">These are rule-based threshold checks, not trained AI predictions.</p>
          <div className="space-y-2.5">
            {riskIndicators.map((r, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${r.level === 'High' ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${r.level === 'High' ? 'text-red-400' : 'text-amber-400'}`} />
                <div>
                  <p className={`text-xs font-semibold ${r.level === 'High' ? 'text-red-300' : 'text-amber-300'}`}>{r.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{r.note}</p>
                </div>
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${r.level === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {r.level}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Performance ─────────────────────────────────────────────────────────────

export function StudentPerformancePage() {
  const s = DEMO_STUDENT;
  const [selSem, setSelSem] = useState('Sem 5');
  const curSgpa = s.sgpa_history.find(h => h.semester === selSem)?.sgpa ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold gradient-title">Performance</h1>
        <p className="text-sm text-slate-400 mt-0.5">Academic records, marks, and subject analysis</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile label="CGPA (Overall)" value={s.cgpa.toFixed(2)} accent="text-blue-400" />
        <MetricTile label={`SGPA (${selSem})`} value={curSgpa.toFixed(2)} accent="text-cyan-400" />
        <MetricTile label="Internal Avg" value={`${s.internal_marks}%`} accent="text-green-400" />
        <MetricTile label="Active Backlogs" value={s.backlogs} accent={s.backlogs > 0 ? 'text-red-400' : 'text-green-400'} sub={s.backlogs === 0 ? 'Clear!' : 'Subjects with backlog'} />
      </div>

      {/* Semester selector */}
      <div className="flex gap-2 flex-wrap">
        {s.sgpa_history.map(h => (
          <button key={h.semester} onClick={() => setSelSem(h.semester)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selSem === h.semester ? 'btn-primary text-white' : 'bg-[#0b1226] text-slate-400 border border-[#14224a] hover:text-white'}`}>
            {h.semester}
          </button>
        ))}
      </div>

      {/* SGPA bar chart */}
      <SectionCard title="Semester SGPA">
        <div className="flex items-end gap-2 h-32">
          {s.sgpa_history.map(h => {
            const pct = ((h.sgpa - 5) / 5) * 100;
            const isSelected = h.semester === selSem;
            return (
              <div key={h.semester} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-bold text-white">{h.sgpa.toFixed(1)}</span>
                <div className="w-full relative" style={{ height: `${Math.max(pct, 10)}%` }}>
                  <div className={`absolute inset-0 rounded-t-lg ${isSelected ? 'bg-gradient-to-t from-blue-600 to-cyan-400' : 'bg-[#14224a]'}`} />
                </div>
                <span className="text-[10px] text-slate-500">{h.semester.replace('Sem ','S')}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-500">Best: {s.sgpa_history.reduce((a,b)=>a.sgpa>b.sgpa?a:b).semester} · Lowest: {s.sgpa_history.reduce((a,b)=>a.sgpa<b.sgpa?a:b).semester}</p>
      </SectionCard>

      {/* Subject table */}
      <SectionCard title="Subject Performance — Sem 5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#14224a]">
                {['Subject','Test 1','Test 2','Assignment','Practical','Internal %','Grade','Status'].map(h => (
                  <th key={h} className="text-left py-2 px-2 text-slate-400 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.subjects.map((sub, i) => (
                <tr key={i} className="border-b border-[#14224a]/50 hover:bg-[#0b1226] transition-colors">
                  <td className="py-2.5 px-2 font-semibold text-slate-200">{sub.name}</td>
                  <td className="py-2.5 px-2 text-slate-300">{sub.test1}/20</td>
                  <td className="py-2.5 px-2 text-slate-300">{sub.test2}/20</td>
                  <td className="py-2.5 px-2 text-slate-300">{sub.assignment}/10</td>
                  <td className="py-2.5 px-2 text-slate-300">{sub.practical}/25</td>
                  <td className="py-2.5 px-2 font-bold text-white">{sub.internal_pct}%</td>
                  <td className="py-2.5 px-2">
                    <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 font-bold">{sub.grade}</span>
                    <span className="text-[9px] text-slate-600 ml-1">(provisional)</span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sub.status==='Safe' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Assessment history */}
      <SectionCard title="Assessment History">
        <div className="space-y-2">
          {ASSESSMENT_HISTORY.map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[#14224a]/50">
              <div>
                <p className="text-xs font-semibold text-slate-200">{a.subject} — {a.type}</p>
                <p className="text-[10px] text-slate-500">{a.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{a.score}/{a.max}</p>
                <span className={`text-[10px] font-bold ${a.pct>=80?'text-green-400':a.pct>=60?'text-amber-400':'text-red-400'}`}>
                  {a.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
