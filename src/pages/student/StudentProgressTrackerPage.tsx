import React, { useState } from 'react';
import {
  Brain, Target, TrendingUp, AlertTriangle, CheckCircle2,
  Calendar, Mail, ShieldAlert, Award, ArrowUpRight, Sparkles, Check
} from 'lucide-react';
import { RECOMMENDATIONS } from '../../data/portalData';
import { useCurrentStudent } from '../../context/CampusDataContext';
import { SpecKpiCard, SpecPageHeader, SpecProgressBar } from '../../components/common/SpecComponents';
import { MotionCounter } from '../../components/common/MotionCounter';

export function StudentProgressTrackerPage() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'recommendations' | 'history' | 'email'>('weekly');
  const [weeklyEmailEnabled, setWeeklyEmailEnabled] = useState(true);
  const [monthlyEmailEnabled, setMonthlyEmailEnabled] = useState(false);

  const s = useCurrentStudent();

  const acadScore = Math.min(100, Math.round((s.cgpa / 10) * 100));
  const attScore = s.overall_attendance;
  const placeScore = Math.round((s.coding_score + s.aptitude_score + s.mock_interview_score) / 3);
  const lmsScore = s.assignment_completion;
  const skillsScore = Math.round((s.technical_skill_score + s.soft_skill_score) / 2);
  const engagScore = Math.min(100, (s.events_participated * 20) + (s.certifications * 25));

  const scoreBreakdown = [
    { component: 'Academic Performance', score: acadScore, weight: 30, contribution: Number(((acadScore * 0.3)).toFixed(1)), notes: `CGPA ${s.cgpa.toFixed(2)}, Internals ${s.internal_marks}%` },
    { component: 'Attendance Record', score: attScore, weight: 20, contribution: Number(((attScore * 0.2)).toFixed(1)), notes: `${s.overall_attendance}% overall attendance` },
    { component: 'Placement Readiness', score: placeScore, weight: 20, contribution: Number(((placeScore * 0.2)).toFixed(1)), notes: `Coding ${s.coding_score}, Aptitude ${s.aptitude_score}, Interview ${s.mock_interview_score}` },
    { component: 'LMS Engagement', score: lmsScore, weight: 15, contribution: Number(((lmsScore * 0.15)).toFixed(1)), notes: `${s.lms_logins} logins/mo, ${s.assignment_completion}% assignments` },
    { component: 'Skills Assessment', score: skillsScore, weight: 10, contribution: Number(((skillsScore * 0.1)).toFixed(1)), notes: `Technical ${s.technical_skill_score}, Soft Skills ${s.soft_skill_score}` },
    { component: 'Extracurricular Engagement', score: engagScore, weight: 5, contribution: Number(((engagScore * 0.05)).toFixed(1)), notes: `${s.club_participation} clubs, ${s.hackathons} hackathons, ${s.certifications} certs` },
  ];

  const totalCalculated = Math.round(scoreBreakdown.reduce((sum, item) => sum + item.contribution, 0));

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <SpecPageHeader
        title="AI Progress Tracker"
        semesterChip={s.semester}
        subtitle="Automated progress synthesis, explainable success score breakdowns, and prescriptive next steps"
        sessionText="Continuous AI Monitoring"
        standingChip={{ text: `${totalCalculated}/100 Score`, variant: 'accent' }}
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pb-2">
        {[
          { id: 'weekly', label: 'Weekly Synthesis' },
          { id: 'monthly', label: 'Monthly Report' },
          { id: 'recommendations', label: 'Actionable Remedials' },
          { id: 'history', label: 'Archive' },
          { id: 'email', label: 'Alert Preferences' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'btn-spec-primary py-1 px-4 text-xs'
                : 'bg-card border border-border text-text-muted hover:text-text hover:border-accent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 4 KPI Cards (12-col Bento) */}
      <div className="grid grid-cols-12 gap-4">
        <SpecKpiCard
          icon={<Brain className="w-5 h-5 text-accent" />}
          statusChip={{ text: 'Calculated', variant: 'accent' }}
          number={<MotionCounter value={totalCalculated} suffix="/100" />}
          caption="Composite Multi-Factor Metric"
          label="OVERALL SUCCESS SCORE"
          percent={totalCalculated}
        />
        <SpecKpiCard
          icon={<Target className="w-5 h-5 text-status-success" />}
          statusChip={{ text: 'Target', variant: 'success' }}
          number="85/100"
          caption="Tier-1 Placement Target Threshold"
          label="GOAL BENCHMARK"
          percent={85}
        />
        <SpecKpiCard
          icon={<TrendingUp className="w-5 h-5 text-accent" />}
          statusChip={{ text: 'Pace', variant: 'neutral' }}
          number="+4.2 pts"
          caption="Change versus previous evaluation"
          label="SEMESTER DELTA"
        />
        <SpecKpiCard
          icon={<Award className="w-5 h-5 text-accent" />}
          statusChip={{ text: 'Percentile', variant: 'accent' }}
          number="Top 15%"
          caption="Position within branch cohort"
          label="CAMPUS STANDING"
        />
      </div>

      {/* 12-Column Bento Content */}
      <div className="grid grid-cols-12 gap-4">
        {/* Score Breakdown (8 cols) */}
        <div className="spec-card col-span-12 lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="title-section">Weighted Score Composition</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Explainable attribution of each academic and behavioral pillar
                </p>
              </div>
              <span className="label-spec text-[10px]">WEIGHTED MODEL</span>
            </div>

            <div className="space-y-4">
              {scoreBreakdown.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-card border border-border">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div>
                      <span className="font-bold text-text">{item.component}</span>
                      <span className="text-text-muted ml-2 text-[11px]">({item.weight}% weight)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-accent">+{item.contribution}</span>
                      <span className="text-text-muted text-[11px]"> / {item.weight} pts</span>
                    </div>
                  </div>
                  <SpecProgressBar value={item.score} className="mb-2" />
                  <p className="text-[11px] text-text-muted">{item.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actionable Recommendations (4 cols) */}
        <div className="spec-card col-span-12 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="title-section">Prescriptive Remedials</h2>
            </div>
            <p className="text-xs text-text-muted mb-4 leading-relaxed">
              AI-generated intervention steps to bridge your score gaps this month.
            </p>

            <div className="space-y-3">
              {RECOMMENDATIONS.slice(0, 3).map((rec, i) => (
                <div key={i} className="p-3 rounded-xl bg-card border border-border hover:border-accent transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                      {rec.category}
                    </span>
                    <span className="text-[10px] text-text-muted font-medium">{rec.priority} Priority</span>
                  </div>
                  <h4 className="text-xs font-bold text-text mt-1">{rec.title}</h4>
                  <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{rec.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
