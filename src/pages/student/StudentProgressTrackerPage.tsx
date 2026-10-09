import React, { useState } from 'react';
import {
  Brain, Target, TrendingUp, AlertTriangle, CheckCircle2,
  Calendar, Mail, ShieldAlert, Award, ArrowUpRight
} from 'lucide-react';
import { DEMO_STUDENT, RECOMMENDATIONS } from '../../data/portalData';
import { useCurrentStudent } from '../../context/CampusDataContext';

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

  // Breakdown weights (UI_SPEC): Academic 30%, Attendance 20%, LMS 15%, Placement 20%, Skills 10%, Engagement 5%
  const scoreBreakdown = [
    { component: 'Academic Performance', score: acadScore, weight: 30, contribution: Number(((acadScore * 0.3)).toFixed(1)), notes: `CGPA ${s.cgpa}, Internals ${s.internal_marks}%` },
    { component: 'Attendance Record', score: attScore, weight: 20, contribution: Number(((attScore * 0.2)).toFixed(1)), notes: `${s.overall_attendance}% overall attendance` },
    { component: 'Placement Readiness', score: placeScore, weight: 20, contribution: Number(((placeScore * 0.2)).toFixed(1)), notes: `Coding ${s.coding_score}, Aptitude ${s.aptitude_score}, Interview ${s.mock_interview_score}` },
    { component: 'LMS Engagement', score: lmsScore, weight: 15, contribution: Number(((lmsScore * 0.15)).toFixed(1)), notes: `${s.lms_logins} logins/mo, ${s.assignment_completion}% assignments` },
    { component: 'Skills Assessment', score: skillsScore, weight: 10, contribution: Number(((skillsScore * 0.1)).toFixed(1)), notes: `Technical ${s.technical_skill_score}, Soft Skills ${s.soft_skill_score}` },
    { component: 'Extracurricular Engagement', score: engagScore, weight: 5, contribution: Number(((engagScore * 0.05)).toFixed(1)), notes: `${s.club_participation} clubs, ${s.hackathons} hackathons, ${s.certifications} certs` },
  ];

  const totalCalculated = Math.round(scoreBreakdown.reduce((sum, item) => sum + item.contribution, 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold gradient-title">AI Progress Tracker</h1>
        <p className="text-sm text-slate-400 mt-0.5">Automated progress synthesis, explainable success score breakdowns, and prescriptive next steps</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#14224a] pb-3">
        {[
          { id: 'weekly', label: 'Weekly Report' },
          { id: 'monthly', label: 'Monthly Report' },
          { id: 'recommendations', label: 'Actionable Recommendations' },
          { id: 'history', label: 'Report History' },
          { id: 'email', label: 'Email Preferences' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'btn-primary text-white shadow-glow-blue'
                : 'bg-[#0b1226] text-slate-400 hover:text-white border border-[#14224a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: WEEKLY REPORT */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          <div className="glow-card panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#14224a] pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Weekly Progress Digest (Week 41, Oct 2025)</h3>
                <p className="text-xs text-slate-400">Generated on Monday, Oct 6, 2025</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-cyan-400 border border-blue-500/30">
                Weekly Active
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">What Changed This Week</h4>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5" />
                  <span><strong>Machine Learning Test 2:</strong> Scored 19/20 (95%). Internal percentage jumped from 72% to 78%.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />
                  <span><strong>Attendance Slippage:</strong> Missed 3 consecutive lectures on Tuesday (Oct 7), bringing Networks attendance down to 71%.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5" />
                  <span><strong>Assignment Completion:</strong> Submitted Operating Systems Lab assignment ahead of the deadline.</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-3">Priority Action Goals for This Week</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="panel-raised p-4 rounded-xl border border-[#14224a] space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <Target className="w-4 h-4" /> Goal 1: Zero Absences
                  </div>
                  <p className="text-[11px] text-slate-300">Maintain 100% attendance across Computer Networks and Software Engineering this entire week.</p>
                </div>
                <div className="panel-raised p-4 rounded-xl border border-[#14224a] space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <Brain className="w-4 h-4" /> Goal 2: Coding Practice
                  </div>
                  <p className="text-[11px] text-slate-300">Complete 5 LeetCode array and string questions to prepare for the upcoming technical round.</p>
                </div>
                <div className="panel-raised p-4 rounded-xl border border-[#14224a] space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Goal 3: Faculty Connect
                  </div>
                  <p className="text-[11px] text-slate-300">Follow up with Prof. Suresh Kumar regarding problem request REQ-001 (VLSM subnetting).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MONTHLY REPORT & EXPLAINABLE BREAKDOWN */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="glow-card panel p-5 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Student Success Score — Explainable Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated deterministically using standardized institutional weights without black-box estimation.
              </p>
            </div>

            {/* Score Pill */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-500/30 flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Unified Student Success Score</span>
                <div className="text-3xl font-extrabold text-white mt-0.5">
                  <span className="text-cyan-400">{totalCalculated}</span> / 100
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs px-3 py-1 rounded-full font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                  Good Standing (Balanced Performer)
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Data Completeness: 100% (6 of 6 domains valid)</p>
              </div>
            </div>

            {/* Component breakdown table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#14224a] text-slate-400">
                    <th className="text-left py-2 px-3">Domain</th>
                    <th className="text-center py-2 px-3">Raw Score (0-100)</th>
                    <th className="text-center py-2 px-3">Configured Weight</th>
                    <th className="text-center py-2 px-3">Weighted Points</th>
                    <th className="text-left py-2 px-3">Evidence & Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreBreakdown.map((row, idx) => (
                    <tr key={idx} className="border-b border-[#14224a]/40 hover:bg-[#0b1226]">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{row.component}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-white">{row.score}</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">{row.weight}%</td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-cyan-400">{row.contribution.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-slate-400">{row.notes}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#0b1226] font-bold">
                    <td className="py-3 px-3 text-white">Total Composite Score</td>
                    <td className="py-3 px-3 text-center text-slate-400">—</td>
                    <td className="py-3 px-3 text-center text-cyan-400">100%</td>
                    <td className="py-3 px-3 text-center text-cyan-300 text-sm font-extrabold">{totalCalculated.toFixed(1)}</td>
                    <td className="py-3 px-3 text-slate-400">Deterministic linear sum</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Risk Explanation */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" /> Why Placement Risk is Flagged as "Moderate":
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                While your academic CGPA (7.8) and attendance (78%) are satisfactory, your <strong>Coding Assessment Score (58/100)</strong> falls below the 65-point benchmark. 
                Improving coding proficiency by just +15 points would raise your Placement Readiness score from 62 to 74, shifting your overall Success Score to 76/100.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Action items synthesized from your latest academic submissions, attendance records, and placement assessments:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RECOMMENDATIONS.map(rec => (
              <div key={rec.id} className="glow-card panel p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                    {rec.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rec.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    rec.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {rec.priority} Priority
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                <div className="text-xs text-slate-400">
                  <strong className="text-slate-300">Observed Evidence:</strong> {rec.evidence}
                </div>
                <div className="p-3 rounded-lg bg-[#0b1226] border border-[#14224a] text-xs text-cyan-300 flex items-start gap-2">
                  <ArrowUpRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Suggested Action:</strong> {rec.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REPORT HISTORY */}
      {activeTab === 'history' && (
        <div className="glow-card panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Archived Progress Reports</h3>
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Sample archived records
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#14224a] text-slate-400">
                  <th className="text-left py-2 px-3">Report Period</th>
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-center py-2 px-3">Success Score</th>
                  <th className="text-center py-2 px-3">CGPA Recorded</th>
                  <th className="text-center py-2 px-3">Attendance</th>
                  <th className="text-right py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { period: 'October 2025 (W1)', type: 'Weekly', score: 72, cgpa: 7.8, att: '78%', status: 'Active' },
                  { period: 'September 2025', type: 'Monthly', score: 71, cgpa: 7.8, att: '76%', status: 'Archived' },
                  { period: 'August 2025', type: 'Monthly', score: 74, cgpa: 7.7, att: '82%', status: 'Archived' },
                  { period: 'July 2025', type: 'Monthly', score: 70, cgpa: 7.6, att: '75%', status: 'Archived' },
                ].map((rep, idx) => (
                  <tr key={idx} className="border-b border-[#14224a]/40 hover:bg-[#0b1226]">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{rep.period}</td>
                    <td className="py-2.5 px-3 text-slate-400">{rep.type}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-cyan-400">{rep.score}/100</td>
                    <td className="py-2.5 px-3 text-center text-slate-300">{rep.cgpa}</td>
                    <td className="py-2.5 px-3 text-center text-slate-300">{rep.att}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                        {rep.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: EMAIL PREFERENCES */}
      {activeTab === 'email' && (
        <div className="glow-card panel p-5 space-y-6 max-w-xl">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Automated Report Email Preferences</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose how and when progress digests are dispatched to your registered college email.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0b1226] border border-[#14224a]">
              <div>
                <p className="text-xs font-bold text-white">Weekly Performance Digest</p>
                <p className="text-[11px] text-slate-400">Receive assessment updates and weekly priority goals every Monday at 8:00 AM.</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyEmailEnabled}
                onChange={e => setWeeklyEmailEnabled(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0b1226] border border-[#14224a]">
              <div>
                <p className="text-xs font-bold text-white">Monthly Success Score Summary</p>
                <p className="text-[11px] text-slate-400">Comprehensive report with domain-by-domain breakdown on the 1st of every month.</p>
              </div>
              <input
                type="checkbox"
                checked={monthlyEmailEnabled}
                onChange={e => setMonthlyEmailEnabled(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              disabled
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#14224a] text-slate-500 cursor-not-allowed flex items-center gap-2"
            >
              <Mail className="w-4 h-4" /> Send Test Email (Disabled — Requires SMTP Backend)
            </button>
            <p className="text-[10px] text-slate-500 mt-2">
              Note: Email dispatch is an enterprise backend capability and simulated in demo mode.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
