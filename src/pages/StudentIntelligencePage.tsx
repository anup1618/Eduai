import React, { useState, useMemo } from 'react';
import { useCampusData } from '../context/CampusDataContext';
import { calculateStudentSuccessScore } from '../engine/scoringEngine';
import { evaluateAcademicRisk } from '../engine/academicRiskEngine';
import { evaluatePlacementRisk } from '../engine/placementRiskEngine';
import { assignStudentSegment } from '../engine/segmentationEngine';
import { Badge } from '../components/common/Badge';
import { ScoreBreakdownModal } from '../components/student/ScoreBreakdownModal';
import { WhatIfSimulatorModal } from '../components/student/WhatIfSimulatorModal';
import { CreateInterventionModal } from '../components/intervention/CreateInterventionModal';
import { UnifiedStudent } from '../types/student';
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronDown,
  HelpCircle,
  Sliders,
  LifeBuoy,
  ArrowUpDown,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const StudentIntelligencePage: React.FC = () => {
  const { filteredStudents, weights, academicThresholds, placementThresholds, setSelectedStudent } = useCampusData();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<'score' | 'cgpa' | 'attendance' | 'placement' | 'completeness'>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modal states for direct actions
  const [targetStudentForScore, setTargetStudentForScore] = useState<UnifiedStudent | null>(null);
  const [targetStudentForWhatIf, setTargetStudentForWhatIf] = useState<UnifiedStudent | null>(null);
  const [targetStudentForIntervention, setTargetStudentForIntervention] = useState<UnifiedStudent | null>(null);

  // Sorting
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortField === 'score') {
        valA = calculateStudentSuccessScore(a, weights).final_score ?? -1;
        valB = calculateStudentSuccessScore(b, weights).final_score ?? -1;
      } else if (sortField === 'cgpa') {
        valA = a.academic.cgpa ?? -1;
        valB = b.academic.cgpa ?? -1;
      } else if (sortField === 'attendance') {
        valA = a.attendance.overall_attendance ?? -1;
        valB = b.attendance.overall_attendance ?? -1;
      } else if (sortField === 'placement') {
        valA = evaluatePlacementRisk(a, placementThresholds).readiness_score ?? -1;
        valB = evaluatePlacementRisk(b, placementThresholds).readiness_score ?? -1;
      } else if (sortField === 'completeness') {
        valA = a.data_quality.data_completeness_percentage;
        valB = b.data_quality.data_completeness_percentage;
      }

      if (sortDirection === 'desc') {
        return valB - valA;
      }
      return valA - valB;
    });
  }, [filteredStudents, sortField, sortDirection, weights, placementThresholds]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* View & Sort Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Cohort Roster: <strong className="text-slate-900">{sortedStudents.length}</strong> students
          </span>
        </div>

        {/* Sorting controls & view toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Sort by:</span>
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-semibold focus:outline-none"
            >
              <option value="score">Success Score</option>
              <option value="cgpa">Academic CGPA</option>
              <option value="attendance">Attendance Rate</option>
              <option value="placement">Placement Score</option>
              <option value="completeness">Data Completeness</option>
            </select>
            <button
              onClick={() => setSortDirection(prev => (prev === 'desc' ? 'asc' : 'desc'))}
              className="p-1 text-slate-400 hover:text-slate-700 rounded bg-slate-50 border border-slate-200"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">Student ID & Name</th>
                  <th className="py-3 px-3 font-semibold">Department & Year</th>
                  <th
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-teal-700"
                    onClick={() => toggleSort('score')}
                  >
                    Success Score
                  </th>
                  <th
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-teal-700"
                    onClick={() => toggleSort('cgpa')}
                  >
                    CGPA / Backlogs
                  </th>
                  <th
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-teal-700"
                    onClick={() => toggleSort('attendance')}
                  >
                    Attendance
                  </th>
                  <th className="py-3 px-3 font-semibold">Academic Risk</th>
                  <th className="py-3 px-3 font-semibold">Placement Risk</th>
                  <th className="py-3 px-3 font-semibold">Segment</th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStudents.map(student => {
                  const scoreRes = calculateStudentSuccessScore(student, weights);
                  const acad = evaluateAcademicRisk(student, academicThresholds);
                  const place = evaluatePlacementRisk(student, placementThresholds);
                  const seg = assignStudentSegment(student);

                  return (
                    <tr
                      key={student.student_id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudent(student)}
                    >
                      {/* Identity */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 group-hover:text-teal-700 transition">
                          {student.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">{student.student_id}</div>
                      </td>

                      {/* Dept & Year */}
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium">{student.department}</div>
                        <div className="text-[11px] text-slate-400">
                          {student.academic_year} • {student.semester}
                        </div>
                      </td>

                      {/* Success Score */}
                      <td className="py-3 px-3">
                        {scoreRes.final_score !== null ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-extrabold ${
                                scoreRes.final_score >= 75
                                  ? 'text-emerald-700'
                                  : scoreRes.final_score >= 60
                                  ? 'text-teal-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              {scoreRes.final_score}
                            </span>
                            <span className="text-[10px] text-slate-400">/100</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Insufficient Data</span>
                        )}
                      </td>

                      {/* CGPA */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {student.academic.cgpa !== null ? student.academic.cgpa.toFixed(2) : '—'}
                        </div>
                        <div className="text-[11px]">
                          {(student.academic.backlogs ?? 0) > 0 ? (
                            <span className="text-rose-600 font-semibold">{student.academic.backlogs} backlogs</span>
                          ) : (
                            <span className="text-slate-400">0 backlogs</span>
                          )}
                        </div>
                      </td>

                      {/* Attendance */}
                      <td className="py-3 px-3">
                        {student.attendance.overall_attendance !== null ? (
                          <span
                            className={`font-semibold ${
                              student.attendance.overall_attendance < 65
                                ? 'text-rose-600 font-bold'
                                : student.attendance.overall_attendance < 75
                                ? 'text-amber-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {student.attendance.overall_attendance.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Academic Risk */}
                      <td className="py-3 px-3">
                        <Badge label={acad.risk_level} riskLevel={acad.risk_level} size="sm" />
                      </td>

                      {/* Placement Risk */}
                      <td className="py-3 px-3">
                        <Badge label={place.risk_level} riskLevel={place.risk_level} size="sm" />
                      </td>

                      {/* Segment */}
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-medium text-slate-700 line-clamp-1 max-w-[150px]">
                          {seg.segment}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setTargetStudentForScore(student)}
                            title="Why this score?"
                            className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTargetStudentForWhatIf(student)}
                            title="What-If Simulator"
                            className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTargetStudentForIntervention(student)}
                            title="Add Intervention"
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <LifeBuoy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedStudents.map(student => {
            const scoreRes = calculateStudentSuccessScore(student, weights);
            const acad = evaluateAcademicRisk(student, academicThresholds);
            const place = evaluatePlacementRisk(student, placementThresholds);
            const seg = assignStudentSegment(student);

            return (
              <div
                key={student.student_id}
                onClick={() => setSelectedStudent(student)}
                className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:shadow hover:border-teal-500/50 transition cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {student.student_id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{student.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {student.department} • {student.academic_year}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-teal-800">
                        {scoreRes.final_score !== null ? `${scoreRes.final_score}/100` : 'Insufficient'}
                      </div>
                      <span className="text-[10px] text-slate-400">Success Score</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <Badge label={acad.risk_level} riskLevel={acad.risk_level} size="sm" />
                    <Badge label={place.risk_level} riskLevel={place.risk_level} size="sm" />
                    <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                      {student.data_quality.data_completeness_percentage}% Data
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    <strong>{seg.segment}:</strong> {seg.primary_reason}
                  </p>
                </div>

                {/* Footer metrics & actions */}
                <div
                  className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="text-[11px] text-slate-500">
                    CGPA: <strong>{student.academic.cgpa?.toFixed(2) ?? '—'}</strong> | Att:{' '}
                    <strong>{student.attendance.overall_attendance?.toFixed(0) ?? '—'}%</strong>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setTargetStudentForScore(student)}
                      className="p-1 text-slate-400 hover:text-teal-700"
                      title="Why this score?"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTargetStudentForWhatIf(student)}
                      className="p-1 text-slate-400 hover:text-blue-700"
                      title="What-If"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTargetStudentForIntervention(student)}
                      className="p-1 text-slate-400 hover:text-emerald-700"
                      title="Intervene"
                    >
                      <LifeBuoy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub-modals launched directly from table/grid */}
      <ScoreBreakdownModal
        isOpen={!!targetStudentForScore}
        onClose={() => setTargetStudentForScore(null)}
        student={targetStudentForScore}
      />
      <WhatIfSimulatorModal
        isOpen={!!targetStudentForWhatIf}
        onClose={() => setTargetStudentForWhatIf(null)}
        student={targetStudentForWhatIf}
      />
      <CreateInterventionModal
        isOpen={!!targetStudentForIntervention}
        onClose={() => setTargetStudentForIntervention(null)}
        preselectedStudent={targetStudentForIntervention}
      />
    </div>
  );
};
