import React, { useState } from 'react';
import { useCampusData } from '../context/CampusDataContext';
import { calculateStudentSuccessScore } from '../engine/scoringEngine';
import { evaluateAcademicRisk } from '../engine/academicRiskEngine';
import { evaluatePlacementRisk } from '../engine/placementRiskEngine';
import { assignStudentSegment, SEGMENT_METADATA } from '../engine/segmentationEngine';
import { SegmentType } from '../types/segmentation';
import { Printer, Download, FileText, CheckCircle2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { filteredStudents, weights, academicThresholds, placementThresholds, filters } = useCampusData();

  const [reportType, setReportType] = useState<
    'student' | 'department' | 'academic_risk' | 'placement_risk' | 'segment' | 'data_quality'
  >('student');

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // CSV Export for active report type
  const handleExportCSV = () => {
    let csvContent = '';
    const dateStr = new Date().toISOString().split('T')[0];

    if (reportType === 'student') {
      csvContent = 'Student_ID,Name,Department,Year,Semester,Success_Score,Academic_Risk,Placement_Risk,Segment,CGPA,Attendance_Pct,Backlogs\n';
      filteredStudents.forEach(s => {
        const sc = calculateStudentSuccessScore(s, weights).final_score ?? 'N/A';
        const ar = evaluateAcademicRisk(s, academicThresholds).risk_level;
        const pr = evaluatePlacementRisk(s, placementThresholds).risk_level;
        const seg = assignStudentSegment(s).segment;
        csvContent += `"${s.student_id}","${s.name}","${s.department}","${s.academic_year}","${s.semester}",${sc},"${ar}","${pr}","${seg}",${s.academic.cgpa ?? ''},${s.attendance.overall_attendance ?? ''},${s.academic.backlogs ?? 0}\n`;
      });
    } else if (reportType === 'department') {
      csvContent = 'Department,Total_Students,Avg_Success_Score,High_Academic_Risk,High_Placement_Risk,Avg_Attendance\n';
      const depts = Array.from(new Set(filteredStudents.map(s => s.department)));
      depts.forEach(d => {
        const cohort = filteredStudents.filter(s => s.department === d);
        const scores = cohort.map(s => calculateStudentSuccessScore(s, weights).final_score).filter((s): s is number => s !== null);
        const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 'N/A';
        const hiAcad = cohort.filter(s => evaluateAcademicRisk(s, academicThresholds).risk_level === 'High').length;
        const hiPlace = cohort.filter(s => evaluatePlacementRisk(s, placementThresholds).risk_level === 'High').length;
        const atts = cohort.map(s => s.attendance.overall_attendance).filter((a): a is number => a !== null);
        const avgAtt = atts.length > 0 ? (atts.reduce((a, b) => a + b, 0) / atts.length).toFixed(1) : 'N/A';
        csvContent += `"${d}",${cohort.length},${avg},${hiAcad},${hiPlace},${avgAtt}\n`;
      });
    } else if (reportType === 'academic_risk') {
      csvContent = 'Student_ID,Name,Department,Academic_Risk,CGPA,Backlogs,Attendance_Pct,Triggered_Rules\n';
      filteredStudents.forEach(s => {
        const ar = evaluateAcademicRisk(s, academicThresholds);
        const rules = ar.triggered_rules.map(r => r.rule_name).join('; ');
        csvContent += `"${s.student_id}","${s.name}","${s.department}","${ar.risk_level}",${s.academic.cgpa ?? ''},${s.academic.backlogs ?? 0},${s.attendance.overall_attendance ?? ''},"${rules}"\n`;
      });
    } else if (reportType === 'placement_risk') {
      csvContent = 'Student_ID,Name,Department,Placement_Risk,Readiness_Score,Aptitude,Coding,Mock_Interview,Patterns\n';
      filteredStudents.forEach(s => {
        const pr = evaluatePlacementRisk(s, placementThresholds);
        const patterns = pr.patterns.join('; ');
        csvContent += `"${s.student_id}","${s.name}","${s.department}","${pr.risk_level}",${pr.readiness_score ?? ''},${s.placement.aptitude_score ?? ''},${s.placement.coding_score ?? ''},${s.placement.mock_interview_score ?? ''},"${patterns}"\n`;
      });
    } else if (reportType === 'segment') {
      csvContent = 'Segment_Name,Student_Count,Percentage,Typical_Indicators\n';
      const segTypes = Object.keys(SEGMENT_METADATA) as SegmentType[];
      segTypes.forEach(t => {
        const count = filteredStudents.filter(s => assignStudentSegment(s).segment === t).length;
        const pct = Math.round((count / (filteredStudents.length || 1)) * 100);
        csvContent += `"${t}",${count},${pct}%,"${SEGMENT_METADATA[t].typicalIndicators.join('; ')}"\n`;
      });
    } else if (reportType === 'data_quality') {
      csvContent = 'Student_ID,Name,Department,Completeness_Pct,Available_Fields,Missing_Fields\n';
      filteredStudents.forEach(s => {
        csvContent += `"${s.student_id}","${s.name}","${s.department}",${s.data_quality.data_completeness_percentage}%,${s.data_quality.available_fields},"${s.data_quality.missing_fields.join('; ')}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edupulse_${reportType}_report_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Report Selector & Action Header */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'student', label: 'Student Summaries' },
            { id: 'department', label: 'Department Audit' },
            { id: 'academic_risk', label: 'Academic Risk Report' },
            { id: 'placement_risk', label: 'Placement Readiness Report' },
            { id: 'segment', label: 'Segment Breakdown' },
            { id: 'data_quality', label: 'Data Quality & Telemetry' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                reportType === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Institutional Report Letterhead */}
        <div className="border-b border-slate-200 pb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-slate-900">EduPulse AI</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                Institutional Audit
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Turn Campus Data Into Student Success</p>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <div>Generated: <strong>{new Date().toLocaleDateString()}</strong></div>
            <div>Active Filter Scope: <strong>{filters.department} • {filters.academic_year}</strong></div>
            <div>Cohort Size: <strong>{filteredStudents.length} Students</strong></div>
          </div>
        </div>

        {/* 1. Student-level Summaries */}
        {reportType === 'student' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Student Master Performance Summary
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-right">Success Score</th>
                    <th className="py-2.5 px-3 text-right">CGPA</th>
                    <th className="py-2.5 px-3 text-right">Attendance</th>
                    <th className="py-2.5 px-3">Academic Risk</th>
                    <th className="py-2.5 px-3">Placement Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map(s => {
                    const score = calculateStudentSuccessScore(s, weights).final_score;
                    const acad = evaluateAcademicRisk(s, academicThresholds).risk_level;
                    const place = evaluatePlacementRisk(s, placementThresholds).risk_level;
                    return (
                      <tr key={s.student_id}>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{s.student_id}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{s.name}</td>
                        <td className="py-2 px-3 text-slate-600">{s.department}</td>
                        <td className="py-2 px-3 text-right font-bold text-teal-800">{score ?? '—'}</td>
                        <td className="py-2 px-3 text-right text-slate-800">{s.academic.cgpa?.toFixed(2) ?? '—'}</td>
                        <td className="py-2 px-3 text-right text-slate-800">{s.attendance.overall_attendance?.toFixed(0) ?? '—'}%</td>
                        <td className="py-2 px-3">{acad}</td>
                        <td className="py-2 px-3">{place}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Department-level Summaries */}
        {reportType === 'department' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Departmental Institutional Audit
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-right">Enrolled</th>
                    <th className="py-2.5 px-3 text-right">Mean Success Score</th>
                    <th className="py-2.5 px-3 text-right">High Academic Risk</th>
                    <th className="py-2.5 px-3 text-right">High Placement Risk</th>
                    <th className="py-2.5 px-3 text-right">Mean Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array.from(new Set(filteredStudents.map(s => s.department as string))).map((dept: string) => {
                    const cohort = filteredStudents.filter(s => s.department === dept);
                    const scores = cohort.map(s => calculateStudentSuccessScore(s, weights).final_score).filter((s): s is number => s !== null);
                    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 'N/A';
                    const hiAcad = cohort.filter(s => evaluateAcademicRisk(s, academicThresholds).risk_level === 'High').length;
                    const hiPlace = cohort.filter(s => evaluatePlacementRisk(s, placementThresholds).risk_level === 'High').length;
                    const atts = cohort.map(s => s.attendance.overall_attendance).filter((a): a is number => a !== null);
                    const avgAtt = atts.length > 0 ? (atts.reduce((a, b) => a + b, 0) / atts.length).toFixed(1) : 'N/A';

                    return (
                      <tr key={dept}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{dept}</td>
                        <td className="py-2.5 px-3 text-right">{cohort.length}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-teal-800">{avg}</td>
                        <td className="py-2.5 px-3 text-right text-rose-600 font-bold">{hiAcad}</td>
                        <td className="py-2.5 px-3 text-right text-amber-600 font-bold">{hiPlace}</td>
                        <td className="py-2.5 px-3 text-right text-slate-800">{avgAtt}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Academic Risk Report */}
        {reportType === 'academic_risk' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Academic Risk & Intervention Priority Audit
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">CGPA</th>
                    <th className="py-2.5 px-3">Backlogs</th>
                    <th className="py-2.5 px-3">Attendance</th>
                    <th className="py-2.5 px-3">Primary Triggered Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents
                    .filter(s => evaluateAcademicRisk(s, academicThresholds).risk_level !== 'Low')
                    .map(s => {
                      const risk = evaluateAcademicRisk(s, academicThresholds);
                      return (
                        <tr key={s.student_id}>
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {s.name} ({s.student_id})
                          </td>
                          <td className="py-2 px-3 font-bold text-rose-700">{risk.risk_level}</td>
                          <td className="py-2 px-3 text-slate-800">{s.academic.cgpa?.toFixed(2) ?? '—'}</td>
                          <td className="py-2 px-3 text-rose-600 font-bold">{s.academic.backlogs ?? 0}</td>
                          <td className="py-2 px-3">{s.attendance.overall_attendance?.toFixed(0) ?? '—'}%</td>
                          <td className="py-2 px-3 text-slate-600 text-[11px]">
                            {risk.triggered_rules[0]?.rule_name || 'General Academic Concern'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Placement Risk Report */}
        {reportType === 'placement_risk' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Placement Readiness & Corporate Screening Audit
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3 text-right">Readiness Score</th>
                    <th className="py-2.5 px-3 text-right">Aptitude</th>
                    <th className="py-2.5 px-3 text-right">Coding</th>
                    <th className="py-2.5 px-3">Detected Pattern</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents
                    .filter(s => evaluatePlacementRisk(s, placementThresholds).risk_level !== 'Low')
                    .map(s => {
                      const pr = evaluatePlacementRisk(s, placementThresholds);
                      return (
                        <tr key={s.student_id}>
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {s.name} ({s.student_id})
                          </td>
                          <td className="py-2 px-3 font-bold text-amber-700">{pr.risk_level}</td>
                          <td className="py-2 px-3 text-right font-bold text-teal-800">{pr.readiness_score ?? '—'}</td>
                          <td className="py-2 px-3 text-right">{s.placement.aptitude_score ?? '—'}</td>
                          <td className="py-2 px-3 text-right">{s.placement.coding_score ?? '—'}</td>
                          <td className="py-2 px-3 text-slate-600 text-[11px]">
                            {pr.patterns[0] || 'Benchmark Gap'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Segment Breakdown */}
        {reportType === 'segment' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Cohort Segmentation Distribution
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Segment Name</th>
                    <th className="py-2.5 px-3 text-right">Count</th>
                    <th className="py-2.5 px-3 text-right">Percentage</th>
                    <th className="py-2.5 px-3">Key Criteria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(Object.keys(SEGMENT_METADATA) as SegmentType[]).map(t => {
                    const cnt = filteredStudents.filter(s => assignStudentSegment(s).segment === t).length;
                    const pct = Math.round((cnt / (filteredStudents.length || 1)) * 100);
                    return (
                      <tr key={t}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{t}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-teal-800">{cnt}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-700">{pct}%</td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {SEGMENT_METADATA[t].typicalIndicators.join(' • ')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Data Quality */}
        {reportType === 'data_quality' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Data Quality & Field Completeness Audit
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-right">Completeness</th>
                    <th className="py-2.5 px-3 text-right">Available Fields</th>
                    <th className="py-2.5 px-3">Missing Systems</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map(s => (
                    <tr key={s.student_id}>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{s.student_id}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{s.name}</td>
                      <td className="py-2 px-3 text-slate-600">{s.department}</td>
                      <td className="py-2 px-3 text-right font-extrabold text-teal-800">
                        {s.data_quality.data_completeness_percentage}%
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        {s.data_quality.available_fields} / {s.data_quality.total_fields}
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[11px]">
                        {s.data_quality.missing_fields.join(', ') || 'All Verified'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Institutional Signoff */}
        <div className="pt-8 border-t border-slate-200 text-xs text-slate-400 flex justify-between">
          <span>EduPulse AI • Validated Institutional Scoring Engine</span>
          <span>Dean of Academic Affairs & Placement Directorate</span>
        </div>
      </div>
    </div>
  );
};
