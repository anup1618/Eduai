import React, { useState } from 'react';
import {
  Calendar, CheckCircle, AlertTriangle, Clock, ArrowRight,
  TrendingUp, Calculator
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceLine
} from 'recharts';
import {
  DEMO_STUDENT, MONTHLY_ATTENDANCE, ATTENDANCE_CALENDAR_OCT, DAY_LECTURES
} from '../../data/portalData';

const CHART_STYLE = {
  tooltip: { contentStyle: { background: '#0b1226', border: '1px solid #14224a', borderRadius: 8, color: '#e2e8f0' } }
};

export function StudentAttendancePage() {
  const s = DEMO_STUDENT;
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [targetAttendance, setTargetAttendance] = useState<number>(75);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Projection math:
  // Current attended = 94, conducted = 120. If we attend next X classes:
  // (94 + X) / (120 + X) >= target / 100
  // 94 + X >= (target/100)*120 + (target/100)*X
  // X * (1 - target/100) >= (target/100)*120 - 94
  // X = ((target/100)*120 - 94) / (1 - target/100)
  const targetPct = targetAttendance / 100;
  let classesNeeded = 0;
  if (targetPct < 1 && targetPct > (s.classes_attended / s.classes_conducted)) {
    classesNeeded = Math.ceil(((targetPct * s.classes_conducted) - s.classes_attended) / (1 - targetPct));
    if (classesNeeded < 0) classesNeeded = 0;
  }

  // Calendar setup
  const daysInOct = 31;
  const startDay = 3;
  const calCells = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInOct }, (_, i) => i + 1),
  ];

  const statusColor: Record<string, string> = {
    present: 'bg-green-500/20 text-green-400 border-green-500/30',
    absent:  'bg-red-500/20 text-red-400 border-red-500/30',
    partial: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    holiday: 'bg-slate-700/40 text-slate-500 border-slate-700/40',
  };

  const filteredSubjectAttendance = selectedSubject === 'All' 
    ? s.subject_attendance 
    : s.subject_attendance.filter(sub => sub.subject === selectedSubject);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold gradient-title">Attendance Tracking</h1>
        <p className="text-sm text-slate-400 mt-0.5">Real-time attendance metrics, threshold alerts, and attendance projection</p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glow-card panel metric-accent-top p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Overall Attendance</span>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1">{s.overall_attendance}%</div>
          <span className="text-xs text-slate-500">Threshold: 75% required</span>
        </div>
        <div className="glow-card panel metric-accent-top p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Classes Attended</span>
          <div className="text-2xl font-extrabold text-green-400 mt-1">{s.classes_attended}</div>
          <span className="text-xs text-slate-500">Across 5 subjects</span>
        </div>
        <div className="glow-card panel metric-accent-top p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Classes Conducted</span>
          <div className="text-2xl font-extrabold text-white mt-1">{s.classes_conducted}</div>
          <span className="text-xs text-slate-500">Semester to date</span>
        </div>
        <div className="glow-card panel metric-accent-top p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Classes Missed</span>
          <div className="text-2xl font-extrabold text-red-400 mt-1">{s.classes_conducted - s.classes_attended}</div>
          <span className="text-xs text-slate-500">26 absences total</span>
        </div>
      </div>

      {/* Low attendance warning box if any subject < 75 */}
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-300">Action Required: Low Attendance Subjects</h4>
          <p className="text-xs text-slate-300 mt-1">
            You are below the mandatory 75% threshold in <strong className="text-red-400">Computer Networks (71%)</strong> and <strong className="text-red-400">Software Engineering (71%)</strong>.
            You must attend approximately <strong>4 consecutive classes</strong> in each subject without absence to restore safe standing.
          </p>
        </div>
      </div>

      {/* Subject-wise Table + Subject Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glow-card panel p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Subject-wise Attendance Status</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter:</span>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="bg-[#0b1226] border border-[#14224a] text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:border-cyan-400 outline-none"
              >
                <option value="All">All Subjects</option>
                {s.subject_attendance.map(sub => (
                  <option key={sub.subject} value={sub.subject}>{sub.subject}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#14224a] text-slate-400">
                  <th className="text-left py-2 px-3">Subject</th>
                  <th className="text-center py-2 px-3">Conducted</th>
                  <th className="text-center py-2 px-3">Attended</th>
                  <th className="text-center py-2 px-3">Percentage</th>
                  <th className="text-right py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjectAttendance.map((sub, i) => (
                  <tr key={i} className="border-b border-[#14224a]/40 hover:bg-[#0b1226]">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{sub.subject}</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">{sub.conducted}</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">{sub.attended}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-bold ${sub.pct < 75 ? 'text-red-400' : 'text-cyan-400'}`}>{sub.pct}%</span>
                        <div className="w-16 h-1.5 bg-[#14224a] rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${sub.pct < 75 ? 'bg-red-400' : 'bg-cyan-400'}`}
                            style={{ width: `${sub.pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.pct < 75 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {sub.pct < 75 ? 'Low (<75%)' : 'Safe'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Projection Calculator */}
        <div className="glow-card panel p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Attendance Projection</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Estimate how many consecutive future classes you need to attend to achieve your desired target percentage.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Target Percentage (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="70"
                  max="95"
                  value={targetAttendance}
                  onChange={e => setTargetAttendance(Number(e.target.value))}
                  className="flex-1 accent-cyan-400"
                />
                <span className="text-sm font-bold text-cyan-400 w-10 text-right">{targetAttendance}%</span>
              </div>
            </div>

            <div className="panel-raised p-4 rounded-xl border border-[#14224a] text-center space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Classes You Must Attend</span>
              <div className="text-3xl font-extrabold text-cyan-300">{classesNeeded}</div>
              <p className="text-[11px] text-slate-500">
                {classesNeeded === 0 
                  ? 'Your current attendance already meets or exceeds this target!'
                  : `Attend next ${classesNeeded} lectures without absence`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Month-wise Bar Chart with 75% Reference Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glow-card panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Monthly Attendance vs Institutional Threshold</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_ATTENDANCE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#173066" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={[50, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip {...CHART_STYLE.tooltip} />
              <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '75% Threshold', fill: '#ef4444', fontSize: 10, position: 'top' }} />
              <Bar dataKey="pct" fill="#2f7bff" radius={[4, 4, 0, 0]} name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Attendance Calendar Card */}
        <div className="glow-card panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">October 2025 Calendar Log</h3>
            <span className="text-xs text-slate-400">Click any date for details</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-[10px] font-bold text-slate-500">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calCells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const key = `2025-10-${String(day).padStart(2,'0')}`;
              const st = ATTENDANCE_CALENDAR_OCT[key];
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(selectedDate === key ? null : key)}
                  className={`aspect-square flex items-center justify-center text-xs rounded-lg border transition-all ${
                    st ? statusColor[st] : 'text-slate-600 border-transparent hover:bg-[#0b1226]'
                  } ${selectedDate === key ? 'ring-2 ring-cyan-400 scale-105' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 pt-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-green-500/40 border border-green-500" /> Present</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500/40 border border-red-500" /> Absent</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-500" /> Partial</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-700/60 border border-slate-600" /> Holiday</span>
          </div>

          {selectedDate && DAY_LECTURES[selectedDate] && (
            <div className="panel-raised p-3 rounded-lg border border-[#14224a] space-y-1.5">
              <span className="text-xs font-bold text-cyan-400 block mb-1">Lectures on {selectedDate}:</span>
              {DAY_LECTURES[selectedDate].map((lec, idx) => (
                <div key={idx} className="flex justify-between text-xs py-0.5">
                  <span className="text-slate-300">{lec.time} · {lec.subject} ({lec.faculty})</span>
                  <span className={`font-bold ${lec.status === 'Present' ? 'text-green-400' : 'text-red-400'}`}>{lec.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
