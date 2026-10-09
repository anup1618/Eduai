import React from 'react';
import { useCampusData } from '../context/CampusDataContext';
import { calculateStudentSuccessScore } from '../engine/scoringEngine';
import { evaluateAcademicRisk } from '../engine/academicRiskEngine';
import { evaluatePlacementRisk } from '../engine/placementRiskEngine';
import { MetricCard } from '../components/common/MetricCard';
import {
  Users,
  GraduationCap,
  AlertTriangle,
  Briefcase,
  Database,
  LifeBuoy,
  Sparkles,
  Info,
  ArrowUpRight,
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

export const OverviewPage: React.FC = () => {
  const { filteredStudents, students, weights, academicThresholds, placementThresholds, setSelectedStudent } = useCampusData();

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

  // 2. Chart Data: Success Score Distribution (Histogram buckets: 0-40, 41-55, 56-70, 71-85, 86-100)
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
    { name: 'Low Risk', value: acadRisks.filter(r => r.risk_level === 'Low').length, color: '#10b981' },
    { name: 'Moderate Risk', value: acadRisks.filter(r => r.risk_level === 'Moderate').length, color: '#f59e0b' },
    { name: 'High Risk', value: flaggedAcademicHigh, color: '#f43f5e' },
    { name: 'Incomplete', value: acadRisks.filter(r => r.risk_level === 'Insufficient Data').length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  // 4. Placement Risk Distribution
  const placeRiskData = [
    { name: 'Low Risk', value: placeRisks.filter(r => r.risk_level === 'Low').length, color: '#10b981' },
    { name: 'Moderate Risk', value: placeRisks.filter(r => r.risk_level === 'Moderate').length, color: '#f59e0b' },
    { name: 'High Risk', value: flaggedPlacementHigh, color: '#f43f5e' },
    { name: 'Incomplete', value: placeRisks.filter(r => r.risk_level === 'Insufficient Data').length, color: '#94a3b8' },
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

  // 8. Priority Insights (Dynamically computed from actual dataset)
  // Insight 1: Department with highest academic risk
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

  // Insight 2: Attendance threshold breach
  const attendanceDebarredCount = filteredStudents.filter(
    s => s.attendance.overall_attendance !== null && s.attendance.overall_attendance < 65
  ).length;

  // Insight 3: High Academic but Low Placement Gap
  const highGpaLowPlacement = filteredStudents.filter(
    s => (s.academic.cgpa ?? 0) >= 7.5 && (evaluatePlacementRisk(s, placementThresholds).readiness_score ?? 100) < 60
  ).length;

  // Insight 4: Coding benchmark gap
  const codingGapCount = filteredStudents.filter(
    s => s.placement.coding_score !== null && s.placement.coding_score < 50
  ).length;

  return (
    <div className="space-y-6">
      {/* 6 Core Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <MetricCard
          title="Total Students"
          value={totalStudents}
          subtitle={`Across ${new Set(filteredStudents.map(s => s.department)).size} departments`}
          icon={<Users className="w-4 h-4" />}
          badge="Verified"
        />
        <MetricCard
          title="Avg Success Score"
          value={`${avgSuccessScore}/100`}
          subtitle="Institutional composite"
          icon={<GraduationCap className="w-4 h-4" />}
          trendText={avgSuccessScore >= 70 ? 'Benchmark Met' : 'Attention Needed'}
          trendType={avgSuccessScore >= 70 ? 'positive' : 'warning'}
        />
        <MetricCard
          title="Academic Review"
          value={flaggedAcademic}
          subtitle={`${flaggedAcademicHigh} High, ${flaggedAcademic - flaggedAcademicHigh} Moderate`}
          icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
          trendText={`${Math.round((flaggedAcademic / (totalStudents || 1)) * 100)}% of cohort`}
          trendType={flaggedAcademicHigh > 0 ? 'negative' : 'neutral'}
        />
        <MetricCard
          title="Placement Review"
          value={flaggedPlacement}
          subtitle={`${flaggedPlacementHigh} High, ${flaggedPlacement - flaggedPlacementHigh} Moderate`}
          icon={<Briefcase className="w-4 h-4 text-amber-600" />}
          trendText={`${Math.round((flaggedPlacement / (totalStudents || 1)) * 100)}% of cohort`}
          trendType="warning"
        />
        <MetricCard
          title="Incomplete Data"
          value={incompleteDataCount}
          subtitle="< 50% system completeness"
          icon={<Database className="w-4 h-4 text-slate-500" />}
          trendText={incompleteDataCount > 0 ? 'Sync Pending' : '100% Synced'}
          trendType={incompleteDataCount > 0 ? 'warning' : 'positive'}
        />
        <MetricCard
          title="Active Interventions"
          value={recordedInterventionsCount}
          subtitle="With assigned mentors"
          icon={<LifeBuoy className="w-4 h-4 text-teal-600" />}
          trendText={`${Math.round((recordedInterventionsCount / (totalStudents || 1)) * 100)}% covered`}
          trendType="positive"
        />
      </div>

      {/* Priority Insights Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Priority Campus Insights
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Calculated in real-time from active cohort data
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Priority Insight 1 */}
          <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-700">Departmental Risk Concentration</span>
            <div className="text-base font-extrabold text-slate-900">
              {highestRiskDept?.dept || 'None'}
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              Has highest critical academic risk with{' '}
              <strong className="text-rose-700">{Math.round(highestRiskDept?.rate || 0)}%</strong> students flagged
              ({highestRiskDept?.high} of {highestRiskDept?.total} students).
            </p>
          </div>

          {/* Priority Insight 2 */}
          <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-700">Exam Debarment Alert</span>
            <div className="text-base font-extrabold text-slate-900">
              {attendanceDebarredCount} Students &lt; 65%
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              Severe attendance deficit violates university regulations and places these candidates at immediate risk of debarment.
            </p>
          </div>

          {/* Priority Insight 3 */}
          <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-700">The Practical Skill-Gap Cohort</span>
            <div className="text-base font-extrabold text-slate-900">
              {highGpaLowPlacement} High-GPA Students
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              Possess CGPA ≥ 7.5 but score &lt; 60% in coding/aptitude assessments. Immediate candidate pool for corporate bootcamps.
            </p>
          </div>

          {/* Priority Insight 4 */}
          <div className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-teal-700">Technical Screening Bottleneck</span>
            <div className="text-base font-extrabold text-slate-900">
              {codingGapCount} Below Coding Cutoff
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              Scored below 50 in DSA/coding assessments, representing the primary friction point for campus hiring drives.
            </p>
          </div>
        </div>
      </div>

      {/* Visualizations Row 1: Score Distribution & Department Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Success Score Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Student Success Score Distribution
              </h4>
              <p className="text-[11px] text-slate-400">0–100 Normalized composite scores across active cohort</p>
            </div>
            <span className="text-xs font-bold text-teal-700">Mean: {avgSuccessScore}</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBuckets}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department-wise Average Success Score */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Department Performance Benchmarks
              </h4>
              <p className="text-[11px] text-slate-400">Mean composite score comparison across academic divisions</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentScores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="department" width={110} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="avgScore" fill="#2563eb" radius={[0, 4, 4, 0]} name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Visualizations Row 2: Academic Risk & Placement Risk Donuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Donut 1: Academic Risk */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Academic Risk Breakdown
          </h4>
          <p className="text-[11px] text-slate-400">Based on CGPA, attendance, backlogs, and internals</p>
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
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut 2: Placement Risk */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Placement Readiness Risk Breakdown
          </h4>
          <p className="text-[11px] text-slate-400">Based on aptitude, coding, mock interviews, and training</p>
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
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Visualizations Row 3: Correlation Analysis (Attendance vs CGPA & CGPA vs Placement) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Correlation 1: Attendance vs CGPA */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Attendance vs. Academic Standing (CGPA)
              </h4>
              <p className="text-[11px] text-slate-400">Evaluating correlation between class presence and semester GPA</p>
            </div>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="attendance"
                  name="Attendance"
                  unit="%"
                  domain={[40, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  type="number"
                  dataKey="cgpa"
                  name="CGPA"
                  domain={[3.0, 10.0]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2 rounded-lg text-xs">
                          <div className="font-bold">{data.name} ({data.id})</div>
                          <div>Attendance: {data.attendance}%</div>
                          <div>CGPA: {data.cgpa}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Students" data={attendanceVsAcademic} fill="#0d9488" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Correlation 2: Academic CGPA vs Placement Readiness */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Academic Performance vs. Placement Readiness
              </h4>
              <p className="text-[11px] text-slate-400">Detecting divergence between theoretical GPA and recruiter screening</p>
            </div>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="cgpa"
                  name="CGPA"
                  domain={[4.0, 10.0]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  type="number"
                  dataKey="placementScore"
                  name="Placement Score"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2 rounded-lg text-xs">
                          <div className="font-bold">{data.name} ({data.id})</div>
                          <div>CGPA: {data.cgpa}</div>
                          <div>Placement Score: {data.placementScore}/100</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Students" data={academicVsPlacement} fill="#2563eb" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Monthly Trend Analysis Callout */}
      {/* Required by rule: "Do not invent historical trends if historical data is unavailable. In that case, show a helpful message explaining that trend analysis requires historical records." */}
      <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h5 className="font-bold text-slate-800">Longitudinal Trend Analysis Notice</h5>
          <p className="text-slate-600 leading-relaxed">
            Historical monthly trend charts are purposefully withheld for the current ingestion batch because semester-over-semester longitudinal telemetry has not yet been connected. Historical progress tracking will automatically activate once recurring semester audits are registered via the Data Integration hub.
          </p>
        </div>
      </div>
    </div>
  );
};
