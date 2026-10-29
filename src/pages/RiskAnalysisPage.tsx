import React, { useState } from 'react';
import { useCampusData } from '../context/CampusDataContext';
import { useActionInfo } from '../context/ActionInfoContext';
import { evaluateAcademicRisk } from '../engine/academicRiskEngine';
import { evaluatePlacementRisk } from '../engine/placementRiskEngine';
import { Badge } from '../components/common/Badge';
import { CreateInterventionModal } from '../components/intervention/CreateInterventionModal';
import { UnifiedStudent } from '../types/student';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  HelpCircle,
  LifeBuoy,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export const RiskAnalysisPage: React.FC = () => {
  const { filteredStudents, academicThresholds, placementThresholds, setSelectedStudent } = useCampusData();
  const { showActionInfo } = useActionInfo();

  const [activeTab, setActiveTab] = useState<'matrix' | 'academic' | 'placement'>('matrix');
  const [selectedStudentForIntervention, setSelectedStudentForIntervention] = useState<UnifiedStudent | null>(null);

  // 1. Cross-tabulation Matrix (Academic Risk vs Placement Risk)
  const matrix: Record<string, Record<string, UnifiedStudent[]>> = {
    High: { High: [], Moderate: [], Low: [] },
    Moderate: { High: [], Moderate: [], Low: [] },
    Low: { High: [], Moderate: [], Low: [] },
  };

  const highPriorityRoster: {
    student: UnifiedStudent;
    acadRisk: ReturnType<typeof evaluateAcademicRisk>;
    placeRisk: ReturnType<typeof evaluatePlacementRisk>;
  }[] = [];

  // 2. Count rule frequencies
  const ruleCounts: Record<string, { name: string; count: number; category: string; severity: string }> = {};

  filteredStudents.forEach(s => {
    const acad = evaluateAcademicRisk(s, academicThresholds);
    const place = evaluatePlacementRisk(s, placementThresholds);

    if (matrix[acad.risk_level]?.[place.risk_level]) {
      matrix[acad.risk_level][place.risk_level].push(s);
    }

    if (acad.risk_level === 'High' || place.risk_level === 'High') {
      highPriorityRoster.push({ student: s, acadRisk: acad, placeRisk: place });
    }

    acad.triggered_rules.forEach(r => {
      if (!ruleCounts[r.id]) {
        ruleCounts[r.id] = { name: r.rule_name, count: 0, category: r.category, severity: r.severity };
      }
      ruleCounts[r.id].count += 1;
    });

    place.triggered_rules.forEach(r => {
      if (!ruleCounts[r.id]) {
        ruleCounts[r.id] = { name: r.rule_name, count: 0, category: r.category, severity: r.severity };
      }
      ruleCounts[r.id].count += 1;
    });
  });

  const sortedRules = Object.values(ruleCounts).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-5">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'matrix'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Dual Risk Matrix (Academic vs Placement)
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'academic'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Academic Risk Rules & Audit ({filteredStudents.filter(s => evaluateAcademicRisk(s, academicThresholds).risk_level !== 'Low').length})
        </button>
        <button
          onClick={() => setActiveTab('placement')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'placement'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Placement Risk Rules & Readiness ({filteredStudents.filter(s => evaluatePlacementRisk(s, placementThresholds).risk_level !== 'Low').length})
        </button>
      </div>

      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Dual Risk Cross-Tabulation Grid */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dual Risk Cross-Tabulation Grid</h3>
              <p className="text-xs text-slate-500">
                Segmenting students across both Academic Support criteria (Vertical) and Career Placement Readiness (Horizontal).
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left font-semibold text-slate-400 uppercase text-[10px] w-36">
                      Academic Risk ↓ / Placement →
                    </th>
                    <th className="p-3 font-bold text-rose-700 bg-rose-50/50 border border-slate-200 rounded-t-lg">
                      Placement: High Risk
                    </th>
                    <th className="p-3 font-bold text-amber-700 bg-amber-50/50 border border-slate-200">
                      Placement: Moderate
                    </th>
                    <th className="p-3 font-bold text-emerald-700 bg-emerald-50/50 border border-slate-200 rounded-t-lg">
                      Placement: Low Risk
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1: Academic High */}
                  <tr>
                    <td className="p-3 font-bold text-left text-rose-700 bg-rose-50/50 border border-slate-200">
                      Academic High
                    </td>
                    <td
                      onClick={() => {
                        const cohort = matrix.High.High;
                        showActionInfo({
                          title: 'Urgent Dual Intervention Cohort (High Academic + High Placement Risk)',
                          badge: `${cohort.length} Candidates Flagged`,
                          category: 'danger',
                          message: 'Students in this quadrant face severe academic retention risk combined with acute career placement deficiencies. Urgent multidisciplinary faculty and TPO intervention required.',
                          details: [
                            `Cohort Size: ${cohort.length} students (${Math.round((cohort.length / (filteredStudents.length || 1)) * 100)}% of cohort)`,
                            `Academic Indicators: CGPA < 6.5, Backlogs > 0, Attendance < 75%`,
                            `Placement Indicators: Coding Score < 50, Resume ATS < 60`,
                            `Sample Students: ${cohort.slice(0, 3).map(s => s.name).join(', ') || 'None in current filter'}`
                          ]
                        });
                      }}
                      className="p-4 border border-slate-200 bg-rose-100/40 hover:bg-rose-200/60 transition cursor-pointer"
                      title="Click for Urgent Dual Intervention Breakdown"
                    >
                      <div className="text-xl font-extrabold text-rose-800">{matrix.High.High.length}</div>
                      <div className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider mt-0.5">
                        Urgent Dual Intervention
                      </div>
                    </td>
                    <td
                      onClick={() => {
                        const cohort = matrix.High.Moderate;
                        showActionInfo({
                          title: 'Academic Focus First Cohort (High Academic + Moderate Placement Risk)',
                          badge: `${cohort.length} Candidates Flagged`,
                          category: 'warning',
                          message: 'Students possess foundational career potential but are in danger of semester debarment or low degree completion probability. Focus on clearing backlogs and attendance recovery.',
                          details: [
                            `Cohort Size: ${cohort.length} students`,
                            `Priority: Assign departmental remedial mentor`,
                            `Action: Attendance recovery contract & remedial tutorials`,
                            `Sample Students: ${cohort.slice(0, 3).map(s => s.name).join(', ') || 'None in current filter'}`
                          ]
                        });
                      }}
                      className="p-4 border border-slate-200 bg-rose-50/20 hover:bg-rose-100/40 transition cursor-pointer"
                      title="Click for Academic Focus First Breakdown"
                    >
                      <div className="text-xl font-extrabold text-rose-700">{matrix.High.Moderate.length}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Academic Focus First</div>
                    </td>
                    <td
                      onClick={() => {
                        const cohort = matrix.High.Low;
                        showActionInfo({
                          title: 'Good Skills, Clear Arrears Cohort (High Academic + Low Placement Risk)',
                          badge: `${cohort.length} Candidates`,
                          category: 'warning',
                          message: 'Technically competent students with high coding scores and placement aptitude who are held back exclusively by academic backlogs or attendance deficits.',
                          details: [
                            `Cohort Size: ${cohort.length} students`,
                            `Insight: Strong employability if academic arrears are cleared`,
                            `Target: Accelerated backlog clearance before final year placement drive`,
                            `Sample Students: ${cohort.slice(0, 3).map(s => s.name).join(', ') || 'None in current filter'}`
                          ]
                        });
                      }}
                      className="p-4 border border-slate-200 bg-amber-50/30 hover:bg-amber-100/50 transition cursor-pointer"
                      title="Click for Skill vs Arrears Breakdown"
                    >
                      <div className="text-xl font-extrabold text-amber-700">{matrix.High.Low.length}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Good Skills, Clear Arrears</div>
                    </td>
                  </tr>

                  {/* Row 2: Academic Moderate */}
                  <tr>
                    <td className="p-3 font-bold text-left text-amber-700 bg-amber-50/50 border border-slate-200">
                      Academic Moderate
                    </td>
                    <td
                      onClick={() => {
                        const cohort = matrix.Moderate.High;
                        showActionInfo({
                          title: 'Placement Priority Cohort (Moderate Academic + High Placement Risk)',
                          badge: `${cohort.length} Candidates`,
                          category: 'placement',
                          message: 'Students maintaining fair academic passing marks but lacking practical problem-solving speed, technical projects, and interview preparation.',
                          details: [
                            `Cohort Size: ${cohort.length} students`,
                            `TPO Recommendation: Mandatory Coding Bootcamp & Resume Clinic`,
                            `Sample Students: ${cohort.slice(0, 3).map(s => s.name).join(', ') || 'None in current filter'}`
                          ]
                        });
                      }}
                      className="p-4 border border-slate-200 bg-rose-50/20 hover:bg-rose-100/40 transition cursor-pointer"
                      title="Click for Placement Priority Breakdown"
                    >
                      <div className="text-xl font-extrabold text-amber-800">{matrix.Moderate.High.length}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Placement Priority</div>
                    </td>
                    <td
                      onClick={() => {
                        const cohort = matrix.Moderate.Moderate;
                        showActionInfo({
                          title: 'Balanced Support Cohort (Moderate Academic + Moderate Placement Risk)',
                          badge: `${cohort.length} Candidates`,
                          category: 'info',
                          message: 'Core mainstream cohort maintaining baseline progression across academics and skills. Routine academic advisement ensures trajectory remains positive.',
                          details: [
                            `Cohort Size: ${cohort.length} students`,
                            `Status: Balanced Trajectory`,
                            `Target: Push into Top Quartile through structured peer mentoring`
                          ]
                        });
                      }}
                      className="p-4 border border-slate-200 bg-amber-50/20 hover:bg-amber-100/40 transition cursor-pointer"
                      title="Click for Balanced Support Breakdown"
                    >
                      <div className="text-xl font-extrabold text-amber-700">{matrix.Moderate.Moderate.length}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Balanced Support</div>
                    </td>
                    <td
                      onClick={() => {
                        const cohort = matrix.Moderate.Low;
                        showActionInfo({
                          title: 'Monitor Attendance Cohort (Moderate Academic + Low Placement Risk)',
                          badge: `${cohort.length} Candidates`,
                          category: 'info',
                          message: 'Students with reliable placement profiles whose academic performance is stable but requires attendance vigilance.',
                          details: [
                            `Cohort Size: ${cohort.length} students`,
                            `Placement Readiness: High`,
                            `Attendance Floor: Keep above 75% statutory boundary`
                          ]
                        });
                      }}
                      className="p-4 border border-slate-200 bg-emerald-50/20 hover:bg-emerald-100/40 transition cursor-pointer"
                      title="Click for Monitor Attendance Breakdown"
                    >
                      <div className="text-xl font-extrabold text-teal-700">{matrix.Moderate.Low.length}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Monitor Attendance</div>
                    </td>
                  </tr>

                  {/* Row 3: Academic Low */}
                  <tr>
                    <td className="p-3 font-bold text-left text-emerald-700 bg-emerald-50/50 border border-slate-200">
                      Academic Low
                    </td>
                    <td
                      onClick={() => {
                        const cohort = matrix.Low.High;
                        showActionInfo({
                          title: 'High GPA / Low Skill Gap Cohort (Low Academic + High Placement Risk)',
                          badge: `${cohort.length} Candidates`,
                          category: 'placement',
                          message: 'High academic achievers (CGPA >= 7.5) with a critical practical skill bottleneck. They risk missing Tier-1 software engineering shortlists due to low coding assessment scores.',
                          details: [
                            `Cohort Size: ${cohort.length} students`,
                            `Anomaly Type: Academic Overperformance / Practical Underperformance`,
                            `Immediate Fix: Data Structures & Algorithms intensive preparation`,
                            `Sample Students: ${cohort.slice(0, 3).map(s => s.name).join(', ') || 'None in current filter'}`
                          ]
                        });
                      }}
                      className="p-4 border border-slate-200 bg-amber-50/40 hover:bg-amber-100/60 transition cursor-pointer"
                      title="Click for High GPA / Low Skill Gap Breakdown"
                    >
                      <div className="text-xl font-extrabold text-amber-800">{matrix.Low.High.length}</div>
                      <div className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider mt-0.5">
                        High GPA / Low Skill Gap
                      </div>
                    </td>
                    <td
                      onClick={() => {
                        const cohort = matrix.Low.Moderate;
                        showActionInfo({
                          title: 'Placement Preparation Needed Cohort',
                          badge: `${cohort.length} Candidates`,
                          category: 'info',
                          message: 'Solid academic students needing dedicated placement preparation: mock interview cycles and portfolio review.',
                          details: [
                            `Cohort Size: ${cohort.length} students`,
                            `Academic Status: Good Standing (CGPA >= 7.0)`,
                            `Target: Elevate mock interview score above 75%`
                          ]
                        });
                      }}
                      className="p-4 border border-slate-200 bg-emerald-50/20 hover:bg-emerald-100/40 transition cursor-pointer"
                      title="Click for Prep Needed Breakdown"
                    >
                      <div className="text-xl font-extrabold text-teal-700">{matrix.Low.Moderate.length}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Prep Needed</div>
                    </td>
                    <td
                      onClick={() => {
                        const cohort = matrix.Low.Low;
                        showActionInfo({
                          title: 'Dual Excellence Cohort (Low Academic Risk + Low Placement Risk)',
                          badge: `${cohort.length} Candidates`,
                          category: 'success',
                          message: 'Top institutional performers with exemplary academic CGPA, consistent 85%+ attendance, and top-tier placement test scores. Prime candidates for Tier-1 dream company placements.',
                          details: [
                            `Cohort Size: ${cohort.length} students (${Math.round((cohort.length / (filteredStudents.length || 1)) * 100)}% of cohort)`,
                            `Average CGPA: ${(cohort.reduce((acc, s) => acc + (s.academic.cgpa || 0), 0) / (cohort.length || 1)).toFixed(2)}`,
                            `Average Attendance: ${(cohort.reduce((acc, s) => acc + (s.attendance.overall_attendance || 0), 0) / (cohort.length || 1)).toFixed(0)}%`,
                            `Career Pathway: Leadership & High-Package Shortlists`
                          ]
                        });
                      }}
                      className="p-4 border border-slate-200 bg-emerald-100/50 hover:bg-emerald-200/60 transition cursor-pointer"
                      title="Click for Dual Excellence Breakdown"
                    >
                      <div className="text-xl font-extrabold text-emerald-800">{matrix.Low.Low.length}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider mt-0.5">
                        Dual Excellence
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rule Trigger Frequency Leaderboard */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Campus-Wide Rule Trigger Frequency</h3>
            <p className="text-xs text-slate-500">
              Institutional rules triggered most frequently across active students in descending order.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {sortedRules.slice(0, 6).map((rule, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    showActionInfo({
                      title: `Risk Rule Trigger: ${rule.name}`,
                      badge: `${rule.count} Students Impacted`,
                      category: rule.severity === 'High' ? 'danger' : 'warning',
                      message: `Rule "${rule.name}" belongs to the ${rule.category} telemetry category. Currently triggered across ${rule.count} students in active enrollment.`,
                      details: [
                        `Category: ${rule.category}`,
                        `Severity Level: ${rule.severity}`,
                        `Impacted Roster: ${rule.count} students (${Math.round((rule.count / (filteredStudents.length || 1)) * 100)}% of cohort)`,
                        `Recommended Mitigation: Target structured remedial assignments and departmental tutoring`
                      ]
                    });
                  }}
                  className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70 hover:border-teal-400 transition cursor-pointer flex items-center justify-between"
                  title="Click for Rule Details and Remedial Strategy"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{rule.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        {rule.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Severity: <strong className={rule.severity === 'High' ? 'text-rose-600' : 'text-amber-600'}>{rule.severity}</strong>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">{rule.count}</span>
                    <span className="text-[10px] text-slate-400 block">students affected</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Priority Urgent Review Roster */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Urgent Priority Review Roster ({highPriorityRoster.length} Students)
                </h3>
                <p className="text-xs text-slate-500">
                  Students flagged with Critical High Risk in either Academic Standing or Placement Screening.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto pr-1">
              {highPriorityRoster.map(({ student, acadRisk, placeRisk }) => (
                <div
                  key={student.student_id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-lg transition"
                >
                  <div
                    className="cursor-pointer space-y-0.5 flex-1 min-w-[200px]"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 hover:text-teal-700 transition">
                        {student.name}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {student.student_id}
                      </span>
                      <span className="text-xs text-slate-400">• {student.department}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      CGPA: <strong>{student.academic.cgpa?.toFixed(2) ?? '—'}</strong> | Backlogs:{' '}
                      <strong className="text-rose-600">{student.academic.backlogs ?? 0}</strong> | Att:{' '}
                      <strong>{student.attendance.overall_attendance?.toFixed(0) ?? '—'}%</strong> | Coding:{' '}
                      <strong>{student.placement.coding_score ?? '—'}</strong>
                    </div>
                  </div>

                  {/* Risk Badges */}
                  <div className="flex items-center gap-2">
                    <Badge label={`Acad: ${acadRisk.risk_level}`} riskLevel={acadRisk.risk_level} size="sm" />
                    <Badge label={`Place: ${placeRisk.risk_level}`} riskLevel={placeRisk.risk_level} size="sm" />
                    <button
                      onClick={() => setSelectedStudentForIntervention(student)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition flex items-center gap-1"
                    >
                      <LifeBuoy className="w-3 h-3" />
                      Intervene
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACADEMIC TAB */}
      {activeTab === 'academic' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Academic Risk Rule Thresholds</h3>
            <p className="text-xs text-slate-500">
              Deterministic academic rules evaluated: Attendance &lt; {academicThresholds.min_attendance_critical}% (Critical), CGPA &lt; {academicThresholds.min_cgpa_critical} (Critical), Backlogs &gt; 0, and Internals &lt; {academicThresholds.min_internal_marks_critical}%.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents
              .filter(s => evaluateAcademicRisk(s, academicThresholds).risk_level !== 'Low')
              .map(student => {
                const risk = evaluateAcademicRisk(student, academicThresholds);
                return (
                  <div
                    key={student.student_id}
                    onClick={() => setSelectedStudent(student)}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-teal-500 transition cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">{student.name}</h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          {student.student_id} • {student.department}
                        </span>
                      </div>
                      <Badge label={risk.risk_level} riskLevel={risk.risk_level} size="sm" />
                    </div>

                    <div className="space-y-1 text-xs">
                      {risk.triggered_rules.map(r => (
                        <div key={r.id} className="p-2 rounded bg-rose-50/50 border border-rose-100">
                          <div className="font-semibold text-rose-900">{r.rule_name}</div>
                          <div className="text-[11px] text-slate-600">{r.evidence}</div>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] font-semibold text-teal-700 pt-1">
                      Next Step: {risk.suggested_next_steps[0]}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* PLACEMENT TAB */}
      {activeTab === 'placement' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Placement Screening Risk Engine</h3>
            <p className="text-xs text-slate-500">
              Evaluates aptitude (cutoff {placementThresholds.min_aptitude_score}), coding (cutoff {placementThresholds.min_coding_score}), mock interviews, and training attendance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents
              .filter(s => evaluatePlacementRisk(s, placementThresholds).risk_level !== 'Low')
              .map(student => {
                const place = evaluatePlacementRisk(student, placementThresholds);
                return (
                  <div
                    key={student.student_id}
                    onClick={() => setSelectedStudent(student)}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-teal-500 transition cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">{student.name}</h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          {student.student_id} • {student.department}
                        </span>
                      </div>
                      <div className="text-right">
                        <Badge label={place.risk_level} riskLevel={place.risk_level} size="sm" />
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Readiness: {place.readiness_score ?? 'N/A'}/100
                        </span>
                      </div>
                    </div>

                    {place.patterns.length > 0 && (
                      <div className="p-2 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold">
                        Pattern: {place.patterns[0]}
                      </div>
                    )}

                    <div className="space-y-1 text-xs">
                      {place.triggered_rules.map(r => (
                        <div key={r.id} className="p-2 rounded bg-slate-50 border border-slate-200">
                          <div className="font-semibold text-slate-900">{r.rule_name}</div>
                          <div className="text-[11px] text-slate-600">{r.evidence}</div>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] font-semibold text-teal-700 pt-1">
                      Suggested Action: {place.suggested_next_steps[0]}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Intervention Modal */}
      <CreateInterventionModal
        isOpen={!!selectedStudentForIntervention}
        onClose={() => setSelectedStudentForIntervention(null)}
        preselectedStudent={selectedStudentForIntervention}
      />
    </div>
  );
};
