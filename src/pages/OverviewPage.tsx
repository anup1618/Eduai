import React, { useState } from 'react';
import { useCampusData } from '../context/CampusDataContext';
import { calculateStudentSuccessScore } from '../engine/scoringEngine';
import { evaluateAcademicRisk } from '../engine/academicRiskEngine';
import { evaluatePlacementRisk } from '../engine/placementRiskEngine';
import { SpecKpiCard, SpecPageHeader } from '../components/common/SpecComponents';
import { CampusIntelligence3D } from '../components/3d/CampusIntelligence3D';
import { useActionInfo } from '../context/ActionInfoContext';
import {
  Users,
  GraduationCap,
  AlertTriangle,
  Briefcase,
  Database,
  LifeBuoy,
  Sparkles,
  Info,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  CartesianGrid,
  Legend,
} from 'recharts';

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'var(--card)',
    borderColor: 'var(--border)',
    borderRadius: '12px',
    color: 'var(--text)',
    fontSize: '12px',
    boxShadow: 'var(--shadow-card-hover)',
  },
};

export const OverviewPage: React.FC = () => {
  const { filteredStudents, weights, academicThresholds, placementThresholds, setSelectedStudent } = useCampusData();
  const { showActionInfo } = useActionInfo();

  // 1. KPI Calculations from current filtered dataset
  const totalStudents = filteredStudents.length;

  const scoreResults = filteredStudents.map(s => calculateStudentSuccessScore(s, weights));
  const validScores = scoreResults.filter(r => r.final_score !== null).map(r => r.final_score as number);
  const avgSuccessScore = validScores.length > 0
    ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
    : 0;

  const acadRisks = filteredStudents.map(s => evaluateAcademicRisk(s, academicThresholds));
  const placeRisks = filteredStudents.map(s => evaluatePlacementRisk(s, placementThresholds));

  const flaggedAcademic = acadRisks.filter(r => r.risk_level === 'High' || r.risk_level === 'Moderate').length;
  const flaggedAcademicHigh = acadRisks.filter(r => r.risk_level === 'High').length;

  const flaggedPlacement = placeRisks.filter(r => r.risk_level === 'High' || r.risk_level === 'Moderate').length;
  const flaggedPlacementHigh = placeRisks.filter(r => r.risk_level === 'High').length;

  const incompleteDataCount = filteredStudents.filter(
    s => s.data_quality.data_completeness_percentage < 50
  ).length;

  const recordedInterventionsCount = filteredStudents.filter(
    s => s.interventions.length > 0
  ).length;

  // 2. Chart Data: Success Score Distribution
  const scoreBuckets = [
    { range: '< 50', count: 0 },
    { range: '50 - 64', count: 0 },
    { range: '65 - 79', count: 0 },
    { range: '80 - 89', count: 0 },
    { range: '90 - 100', count: 0 },
  ];
  validScores.forEach(score => {
    if (score < 50) scoreBuckets[0].count++;
    else if (score < 65) scoreBuckets[1].count++;
    else if (score < 80) scoreBuckets[2].count++;
    else if (score < 90) scoreBuckets[3].count++;
    else scoreBuckets[4].count++;
  });

  // 3. Academic Risk Distribution
  const acadRiskData = [
    { name: 'Low Risk', value: acadRisks.filter(r => r.risk_level === 'Low').length, color: 'var(--status-success)' },
    { name: 'Moderate Risk', value: acadRisks.filter(r => r.risk_level === 'Moderate').length, color: 'var(--status-warning)' },
    { name: 'High Risk', value: flaggedAcademicHigh, color: 'var(--status-danger)' },
    { name: 'Incomplete', value: acadRisks.filter(r => r.risk_level === 'Insufficient Data').length, color: 'var(--chart-6)' },
  ].filter(d => d.value > 0);

  // 4. Placement Risk Distribution
  const placeRiskData = [
    { name: 'Low Risk', value: placeRisks.filter(r => r.risk_level === 'Low').length, color: 'var(--status-success)' },
    { name: 'Moderate Risk', value: placeRisks.filter(r => r.risk_level === 'Moderate').length, color: 'var(--status-warning)' },
    { name: 'High Risk', value: flaggedPlacementHigh, color: 'var(--status-danger)' },
    { name: 'Incomplete', value: placeRisks.filter(r => r.risk_level === 'Insufficient Data').length, color: 'var(--chart-6)' },
  ].filter(d => d.value > 0);

  // 5. Department-wise Average Success Score
  const deptScoreMap: Record<string, { total: number; count: number }> = {};
  filteredStudents.forEach(s => {
    const sc = calculateStudentSuccessScore(s, weights).final_score;
    if (sc !== null) {
      if (!deptScoreMap[s.department]) deptScoreMap[s.department] = { total: 0, count: 0 };
      deptScoreMap[s.department].total += sc;
      deptScoreMap[s.department].count += 1;
    }
  });

  const departmentScores = Object.entries(deptScoreMap).map(([dept, data]) => ({
    department: dept.replace(' Engineering', '').replace('Eng.', ''),
    avgScore: Math.round((data.total / data.count) * 10) / 10,
    students: data.count,
  }));

  // 6. Attendance vs Academic Performance (Scatter)
  const attendanceVsAcademic = filteredStudents
    .filter(s => s.attendance.overall_attendance !== null && s.academic.cgpa !== null)
    .slice(0, 80)
    .map(s => ({
      name: s.name,
      id: s.student_id,
      attendance: s.attendance.overall_attendance as number,
      cgpa: s.academic.cgpa as number,
      score: (s.academic.cgpa as number) * 10,
    }));

  // 7. Academic Performance vs Placement Readiness (Scatter)
  const academicVsPlacement = filteredStudents
    .map(s => {
      const pScore = evaluatePlacementRisk(s, placementThresholds).readiness_score;
      if (s.academic.cgpa !== null && pScore !== null) {
        return {
          name: s.name,
          id: s.student_id,
          cgpa: s.academic.cgpa,
          placementScore: pScore,
        };
      }
      return null;
    })
    .filter((v): v is { name: string; id: string; cgpa: number; placementScore: number } => v !== null)
    .slice(0, 80);

  // 8. Priority Insights
  const deptRiskMap: Record<string, { total: number; high: number }> = {};
  filteredStudents.forEach(s => {
    if (!deptRiskMap[s.department]) deptRiskMap[s.department] = { total: 0, high: 0 };
    deptRiskMap[s.department].total += 1;
    if (evaluateAcademicRisk(s, academicThresholds).risk_level === 'High') {
      deptRiskMap[s.department].high += 1;
    }
  });
  const deptRiskSorted = Object.entries(deptRiskMap)
    .map(([dept, d]) => ({ dept, rate: d.total > 0 ? (d.high / d.total) * 100 : 0, high: d.high, total: d.total }))
    .sort((a, b) => b.rate - a.rate);
  const highestRiskDept = deptRiskSorted[0];

  const attendanceDebarredCount = filteredStudents.filter(
    s => s.attendance.overall_attendance !== null && s.attendance.overall_attendance < 65
  ).length;

  const highGpaLowPlacement = filteredStudents.filter(
    s => (s.academic.cgpa ?? 0) >= 7.5 && (evaluatePlacementRisk(s, placementThresholds).readiness_score ?? 100) < 60
  ).length;

  const codingGapCount = filteredStudents.filter(
    s => s.placement.coding_score !== null && s.placement.coding_score < 50
  ).length;

  return (
    <div className="space-y-6 animate-fade-up font-sans">
      <SpecPageHeader
        title="College Overview"
        subtitle="Institutional telemetry, predictive distributions, and calculated retention cohorts"
        sessionText="Campus Executive View"
        standingChip={{ text: `${totalStudents} Active Cohort`, variant: 'accent' }}
      />

      {/* 3D Campus AI Neural Digital Twin & Risk Telemetry Visualization */}
      <CampusIntelligence3D />

      {/* 12-Column Bento Grid: 4 Top KPI Cards */}
      <div className="grid grid-cols-12 gap-4">
        <SpecKpiCard
          icon={<Users className="w-5 h-5 text-accent" />}
          statusChip={{ text: 'Verified', variant: 'success' }}
          number={totalStudents}
          caption={`Across ${new Set(filteredStudents.map(s => s.department)).size} Departments`}
          label="TOTAL ENROLLED"
          onClick={() => {
            showActionInfo({
              title: 'Total Enrolled Cohort Telemetry',
              badge: `${totalStudents} Active Students`,
              category: 'info',
              message: `Tracking ${totalStudents} active student records across ${new Set(filteredStudents.map(s => s.department)).size} campus departments. All profile data is synchronized with MongoDB Atlas.`,
              details: [
                `Active Departments: ${Array.from(new Set(filteredStudents.map(s => s.department))).join(', ')}`,
                `Average Campus Attendance: ${Math.round(filteredStudents.reduce((a, s) => a + (s.attendance.overall_attendance ?? 0), 0) / (totalStudents || 1))}%`,
                `Average Campus CGPA: ${(filteredStudents.reduce((a, s) => a + (s.academic.cgpa ?? 0), 0) / (totalStudents || 1)).toFixed(2)} / 10.0`,
              ],
            });
          }}
        />

        <SpecKpiCard
          icon={<GraduationCap className="w-5 h-5 text-accent" />}
          statusChip={{ text: avgSuccessScore >= 70 ? 'Benchmark Met' : 'Attention', variant: avgSuccessScore >= 70 ? 'success' : 'warning' }}
          number={`${avgSuccessScore}/100`}
          caption="Institutional Composite Score"
          label="AVG SUCCESS SCORE"
          percent={avgSuccessScore}
          onClick={() => {
            showActionInfo({
              title: 'Composite Success Score Metric',
              badge: `${avgSuccessScore}/100 Campus Score`,
              category: 'success',
              message: `The Institutional Composite Score combines six core telemetry dimensions calibrated to assess student retention probability and career readiness.`,
              details: [
                `Academic Standing (${weights.academic}%): CGPA, internal exam marks, and backlog penalty deductions`,
                `Attendance Telemetry (${weights.attendance}%): Class presence against the 75% institutional threshold`,
                `Placement Readiness (${weights.placement}%): Coding score, aptitude, and mock interviews`,
                `LMS Portal Activity (${weights.lms}%): Login frequency and assignment turnaround`,
                `Holistic Skills & Co-curriculars (${weights.skills + weights.engagement}%): Technical skills and hackathons`,
              ],
            });
          }}
        />

        <SpecKpiCard
          icon={<AlertTriangle className="w-5 h-5 text-status-danger" />}
          statusChip={{ text: `${flaggedAcademicHigh} Critical`, variant: 'danger' }}
          number={flaggedAcademic}
          caption={`${Math.round((flaggedAcademic / (totalStudents || 1)) * 100)}% of Enrolled Cohort`}
          label="ACADEMIC REVIEW"
          onClick={() => {
            showActionInfo({
              title: 'Academic Retention Review Roster',
              badge: `${flaggedAcademic} Flagged (${flaggedAcademicHigh} Critical)`,
              category: 'danger',
              message: `${flaggedAcademic} students (${Math.round((flaggedAcademic / (totalStudents || 1)) * 100)}% of cohort) exhibit academic risk signals requiring faculty counseling or remedial tutorials.`,
              details: [
                `Critical High Risk: ${flaggedAcademicHigh} students with CGPA < 5.5, multiple backlogs, or attendance < 65%`,
                `Moderate Risk: ${flaggedAcademic - flaggedAcademicHigh} students with attendance in the 65-75% warning band`,
                `Recommended Action: Faculty mentors have been notified to initiate intervention clinics`,
              ],
            });
          }}
        />

        <SpecKpiCard
          icon={<Briefcase className="w-5 h-5 text-status-warning" />}
          statusChip={{ text: `${flaggedPlacementHigh} Critical`, variant: 'warning' }}
          number={flaggedPlacement}
          caption={`${Math.round((flaggedPlacement / (totalStudents || 1)) * 100)}% of Cohort`}
          label="PLACEMENT REVIEW"
          onClick={() => {
            showActionInfo({
              title: 'Placement Readiness & Skill Gap Audit',
              badge: `${flaggedPlacement} Flagged (${flaggedPlacementHigh} Critical)`,
              category: 'placement',
              message: `${flaggedPlacement} candidates demonstrate practical skill gaps that may limit shortlist rates in Tier-1 campus placement drives.`,
              details: [
                `Critical Gaps: ${flaggedPlacementHigh} candidates scoring below 50 in practical coding assessments`,
                `Moderate Gaps: ${flaggedPlacement - flaggedPlacementHigh} candidates needing quantitative aptitude or mock interview polish`,
                `Intervention Strategy: Automated enrollment in 4-week coding bootcamps and mock interview tracks`,
              ],
            });
          }}
        />
      </div>

      {/* Priority Insights Bento Section */}
      <div className="spec-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="title-section text-sm uppercase tracking-spec-label">
              Priority Campus Insights
            </h3>
          </div>
          <span className="label-spec text-[10px]">
            REAL-TIME DATASET AUDIT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Priority Insight 1 */}
          <div
            onClick={() => {
              showActionInfo({
                title: `Departmental Risk Audit: ${highestRiskDept?.dept || 'Campus'}`,
                badge: `${Math.round(highestRiskDept?.rate || 0)}% Flagged`,
                category: 'danger',
                message: `${highestRiskDept?.dept} currently exhibits the highest concentration of academic flags in the institution (${highestRiskDept?.high} of ${highestRiskDept?.total} students flagged).`,
                details: [
                  `Primary Factor: Core engineering theoretical subjects (DSA, VLSI, Networks)`,
                  `Faculty Mentor Ratio: 1:18 in ${highestRiskDept?.dept}`,
                  `Action: Scheduled departmental review meeting with HOD`,
                ],
              });
            }}
            className="p-3.5 rounded-xl border border-status-danger/30 bg-status-danger/10 space-y-1 cursor-pointer hover:border-status-danger/60 hover:bg-status-danger/15 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-status-danger">Departmental Risk</span>
              <Info className="w-3.5 h-3.5 text-status-danger opacity-60 group-hover:opacity-100" />
            </div>
            <div className="text-base font-bold text-text truncate">
              {highestRiskDept?.dept || 'None'}
            </div>
            <p className="text-xs text-text-muted leading-snug">
              Has highest critical academic risk with{' '}
              <strong className="text-status-danger">{Math.round(highestRiskDept?.rate || 0)}%</strong> students flagged
              ({highestRiskDept?.high} of {highestRiskDept?.total}).
            </p>
          </div>

          {/* Priority Insight 2 */}
          <div
            onClick={() => {
              showActionInfo({
                title: 'Mandatory Attendance Debarment Warning (< 65%)',
                badge: `${attendanceDebarredCount} Candidates at Risk`,
                category: 'warning',
                message: `${attendanceDebarredCount} candidates breach the 65% critical attendance floor. University statute mandates detention from end-semester examinations unless compensatory clinical attendance is granted.`,
                details: [
                  `Mandatory University Rule: 75% minimum required for exam hall tickets`,
                  `Debarment Cutoff: Below 65% automatic hall ticket withholding`,
                  `Remedial Action: Compulsory Saturday laboratory and tutorial make-up sessions`,
                ],
              });
            }}
            className="p-3.5 rounded-xl border border-status-warning/30 bg-status-warning/10 space-y-1 cursor-pointer hover:border-status-warning/60 hover:bg-status-warning/15 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-status-warning">Exam Debarment Alert</span>
              <Info className="w-3.5 h-3.5 text-status-warning opacity-60 group-hover:opacity-100" />
            </div>
            <div className="text-base font-bold text-text">
              {attendanceDebarredCount} Students &lt; 65%
            </div>
            <p className="text-xs text-text-muted leading-snug">
              Severe attendance deficit violates university regulations and places these candidates at immediate risk of debarment.
            </p>
          </div>

          {/* Priority Insight 3 */}
          <div
            onClick={() => {
              showActionInfo({
                title: 'High-GPA / Low-Placement Practical Gap',
                badge: `${highGpaLowPlacement} Students Identified`,
                category: 'placement',
                message: `${highGpaLowPlacement} high-performing students (CGPA ≥ 7.5) score below 60% in competitive coding assessments, indicating theoretical strength without practical problem-solving speed.`,
                details: [
                  `Identified Segment: High Academic, Low Placement Readiness`,
                  `Corporate Bottleneck: Initial academic resume filter cleared, but fails technical coding round`,
                  `Targeted Prescription: 4-week competitive programming bootcamp and mock technical interviews`,
                ],
              });
            }}
            className="p-3.5 rounded-xl border border-accent/30 bg-accent/10 space-y-1 cursor-pointer hover:border-accent/60 hover:bg-accent/15 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-accent">Practical Skill-Gap</span>
              <Info className="w-3.5 h-3.5 text-accent opacity-60 group-hover:opacity-100" />
            </div>
            <div className="text-base font-bold text-text">
              {highGpaLowPlacement} High-GPA Students
            </div>
            <p className="text-xs text-text-muted leading-snug">
              Possess CGPA ≥ 7.5 but score &lt; 60% in coding/aptitude assessments. Immediate candidate pool for corporate bootcamps.
            </p>
          </div>

          {/* Priority Insight 4 */}
          <div
            onClick={() => {
              showActionInfo({
                title: 'Campus Algorithmic Coding Diagnostic Gap',
                badge: `${codingGapCount} Below 50 Pts`,
                category: 'warning',
                message: `${codingGapCount} candidates scored below 50 in algorithmic diagnostic exams. Algorithmic problem-solving is the single largest eliminator in Tier-1 campus hiring.`,
                details: [
                  `Benchmarked Algorithms: Array manipulation, hashing, recursion, and basic dynamic programming`,
                  `Recruiter Standard: Minimum 70 points for Tier-1 product roles`,
                  `Remedial Track: Daily timed LeetCode-style problem assignments via the Classroom portal`,
                ],
              });
            }}
            className="p-3.5 rounded-xl border border-border bg-card space-y-1 cursor-pointer hover:border-accent/40 hover:bg-card-hover transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-text-muted">Coding Cutoff Gap</span>
              <Info className="w-3.5 h-3.5 text-text-muted opacity-60 group-hover:opacity-100" />
            </div>
            <div className="text-base font-bold text-text">
              {codingGapCount} Below 50 Pts
            </div>
            <p className="text-xs text-text-muted leading-snug">
              Scored below 50 in DSA/coding assessments, representing the primary friction point for campus hiring drives.
            </p>
          </div>
        </div>
      </div>

      {/* 12-Column Bento Visualizations: Score Distribution (7 cols) & Department Scores (5 cols) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Chart 1: Success Score Distribution (7 cols) */}
        <div className="spec-card col-span-12 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="title-section text-sm">
                  Student Success Score Distribution
                </h4>
                <p className="text-xs text-text-muted">Normalized composite scores across active cohort</p>
              </div>
              <span className="text-xs font-bold text-accent">Mean: {avgSuccessScore}</span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreBuckets}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Department-wise Average Success Score (5 cols) */}
        <div className="spec-card col-span-12 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="title-section text-sm">
                  Department Benchmarks
                </h4>
                <p className="text-xs text-text-muted">Mean score across academic divisions</p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentScores} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="department" width={90} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="avgScore" fill="var(--chart-2)" radius={[0, 6, 6, 0]} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 12-Column Bento: Academic Risk Donut (6 cols) & Placement Risk Donut (6 cols) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Donut 1: Academic Risk (6 cols) */}
        <div className="spec-card col-span-12 lg:col-span-6 flex flex-col justify-between">
          <div>
            <h4 className="title-section text-sm mb-1">
              Academic Risk Breakdown
            </h4>
            <p className="text-xs text-text-muted mb-2">Based on CGPA, attendance, backlogs, and internals</p>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={acadRiskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {acadRiskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Donut 2: Placement Risk (6 cols) */}
        <div className="spec-card col-span-12 lg:col-span-6 flex flex-col justify-between">
          <div>
            <h4 className="title-section text-sm mb-1">
              Placement Readiness Risk Breakdown
            </h4>
            <p className="text-xs text-text-muted mb-2">Based on aptitude, coding, mock interviews, and training</p>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={placeRiskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {placeRiskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Notice */}
      <div className="spec-card flex items-start gap-3">
        <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h5 className="font-bold text-text">Longitudinal Trend Analysis Notice</h5>
          <p className="text-text-muted leading-relaxed">
            Historical monthly trend charts are purposefully withheld for the current ingestion batch because semester-over-semester longitudinal telemetry has not yet been connected. Historical progress tracking will automatically activate once recurring semester audits are registered via the Data Integration hub.
          </p>
        </div>
      </div>
    </div>
  );
};
