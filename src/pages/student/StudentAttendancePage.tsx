import React, { useState } from 'react';
import {
  Calendar, CheckCircle, AlertTriangle, Clock, ArrowRight,
  TrendingUp, Calculator, CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceLine
} from 'recharts';
import {
  MONTHLY_ATTENDANCE, ATTENDANCE_CALENDAR_OCT, DAY_LECTURES
} from '../../data/portalData';
import { useCurrentStudent } from '../../context/CampusDataContext';
import { SpecKpiCard, SpecPageHeader, SpecProgressBar } from '../../components/common/SpecComponents';
import { MotionCounter } from '../../components/common/MotionCounter';

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
};

export function StudentAttendancePage() {
  const s = useCurrentStudent();
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [targetAttendance, setTargetAttendance] = useState<number>(75);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const dayStatus = (day: number | null) => {
    if (!day) return null;
    const key = `2025-10-${String(day).padStart(2, '0')}`;
    return ATTENDANCE_CALENDAR_OCT[key] ?? null;
  };

  const filteredSubjectAttendance = selectedSubject === 'All' 
    ? s.subject_attendance 
    : s.subject_attendance.filter(sub => sub.subject === selectedSubject);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <SpecPageHeader
        title="Attendance Tracking"
        semesterChip={s.semester}
        subtitle="Real-time attendance logs, subject breakdown, threshold warnings, and projection calculator"
        sessionText="Biometric Audit Trail"
        standingChip={{
          text: s.overall_attendance >= 75 ? 'Safe Standing' : 'Below 75%',
          variant: s.overall_attendance >= 75 ? 'success' : 'danger',
        }}
      />

      {/* 4 KPI Cards (12-col Bento) */}
      <div className="grid grid-cols-12 gap-4">
        <SpecKpiCard
          icon={<Calendar className="w-5 h-5 text-accent" />}
          statusChip={{
            text: s.overall_attendance >= 75 ? 'Compliant' : 'Shortage',
            variant: s.overall_attendance >= 75 ? 'success' : 'danger',
          }}
          number={<MotionCounter value={s.overall_attendance} suffix="%" />}
          caption="Mandatory 75% threshold required"
          label="OVERALL ATTENDANCE"
          percent={s.overall_attendance}
        />
        <SpecKpiCard
          icon={<CheckCircle className="w-5 h-5 text-status-success" />}
          statusChip={{ text: 'Verified', variant: 'success' }}
          number={<MotionCounter value={s.classes_attended} />}
          caption="Total sessions physically attended"
          label="CLASSES ATTENDED"
          percent={(s.classes_attended / s.classes_conducted) * 100}
        />
        <SpecKpiCard
          icon={<Clock className="w-5 h-5 text-text-muted" />}
          statusChip={{ text: 'Conducted', variant: 'neutral' }}
          number={<MotionCounter value={s.classes_conducted} />}
          caption="Delivered across all subjects"
          label="TOTAL CLASSES"
        />
        <SpecKpiCard
          icon={<AlertTriangle className="w-5 h-5 text-status-danger" />}
          statusChip={{ text: 'Missed', variant: 'danger' }}
          number={<MotionCounter value={s.classes_conducted - s.classes_attended} />}
          caption="Absences recorded to date"
          label="CLASSES MISSED"
        />
      </div>

      {/* Low Attendance Warning Box */}
      {s.overall_attendance < 75 && (
        <div className="p-4 rounded-spec-card bg-status-danger/10 border border-status-danger/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-status-danger flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-status-danger">Urgent: Low Attendance Warning</h4>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              You are below the university 75% cutoff. You must attend consecutive upcoming classes without absence to regain exam eligibility.
            </p>
          </div>
        </div>
      )}

      {/* 12-Column Bento Grid: Table (7 cols) + Projection Calculator (5 cols) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Subject-wise Table (7 cols) */}
        <div className="spec-card col-span-12 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="title-section">Subject-wise Breakdown</h2>
                <p className="text-xs text-text-muted mt-0.5">Physical presence across registered coursework</p>
              </div>
              <span className="label-spec text-[10px]">SEM 5</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {['Course Name', 'Attended', 'Conducted', 'Percentage', 'Status'].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 label-spec text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjectAttendance.map((sub, i) => (
                    <tr key={i} className="border-b border-border/60 hover:bg-card-hover transition-colors">
                      <td className="py-3 px-3 font-semibold text-text">{sub.subject}</td>
                      <td className="py-3 px-3 text-text-muted">{sub.attended}</td>
                      <td className="py-3 px-3 text-text-muted">{sub.conducted}</td>
                      <td className="py-3 px-3 font-bold text-accent">{sub.pct}%</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.pct >= 75 ? 'bg-status-success/15 text-status-success' : 'bg-status-danger/15 text-status-danger'
                        }`}>
                          {sub.pct >= 75 ? 'Safe' : 'Shortage'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Projection Calculator (5 cols) */}
        <div className="spec-card col-span-12 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5 text-accent" />
              <h2 className="title-section">Attendance Simulator</h2>
            </div>
            <p className="text-xs text-text-muted mb-4 leading-relaxed">
              Calculate how many consecutive lectures you need to attend to achieve your target percentage.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text font-medium">Target Attendance Goal:</span>
                  <span className="font-bold text-accent">{targetAttendance}%</span>
                </div>
                <input
                  type="range"
                  min="65"
                  max="90"
                  step="1"
                  value={targetAttendance}
                  onChange={e => setTargetAttendance(Number(e.target.value))}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-xs text-text-muted">Consecutive Classes Required:</div>
                <div className="text-3xl font-bold text-accent mt-1">
                  {classesNeeded > 0 ? `${classesNeeded} Classes` : 'Goal Already Achieved!'}
                </div>
                <p className="text-[11px] text-text-muted mt-2">
                  {classesNeeded > 0
                    ? `Attending next ${classesNeeded} lectures without absence brings attendance to ${targetAttendance}%.`
                    : `Your current attendance is already at or above ${targetAttendance}%. Keep it up!`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
