import React, { useState, useMemo } from 'react';
import { useCampusData } from '../context/CampusDataContext';
import { useActionInfo } from '../context/ActionInfoContext';
import { calculateStudentSuccessScore } from '../engine/scoringEngine';
import { evaluateAcademicRisk } from '../engine/academicRiskEngine';
import { evaluatePlacementRisk } from '../engine/placementRiskEngine';
import { assignStudentSegment } from '../engine/segmentationEngine';
import { Badge } from '../components/common/Badge';
import { ScoreBreakdownModal } from '../components/student/ScoreBreakdownModal';
import { WhatIfSimulatorModal } from '../components/student/WhatIfSimulatorModal';
import { CreateInterventionModal } from '../components/intervention/CreateInterventionModal';
import { StudentFormModal } from '../components/student/StudentFormModal';
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
  UserPlus,
  Edit2,
  Trash2,
} from 'lucide-react';

export const StudentIntelligencePage: React.FC = () => {
  const { filteredStudents, weights, academicThresholds, placementThresholds, setSelectedStudent, deleteStudent } = useCampusData();
  const { showActionInfo } = useActionInfo();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<'score' | 'cgpa' | 'attendance' | 'placement' | 'completeness'>('score');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Modal states for direct actions
  const [targetStudentForScore, setTargetStudentForScore] = useState<UnifiedStudent | null>(null);
  const [targetStudentForWhatIf, setTargetStudentForWhatIf] = useState<UnifiedStudent | null>(null);
  const [targetStudentForIntervention, setTargetStudentForIntervention] = useState<UnifiedStudent | null>(null);

  // Student Form Modal state (Create & Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<UnifiedStudent | null>(null);

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
    <div className="space-y-4 animate-fade-up">
      {/* View & Sort Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 spec-card p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted">
            Cohort Roster: <strong className="text-text">{sortedStudents.length}</strong> students
          </span>
        </div>

        {/* Sorting controls & view toggle */}
        <div className="flex items-center gap-3">
          {/* Add Student Button */}
          <button
            onClick={() => {
              setStudentToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-accent-contrast text-xs font-bold hover:opacity-90 transition shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span>Sort by:</span>
            <select
              value={sortField}
              onChange={e => {
                const val = e.target.value as any;
                setSortField(val);
                showActionInfo({
                  title: `Roster Sorted by ${val.toUpperCase()}`,
                  badge: `${sortedStudents.length} Students Rearranged`,
                  category: 'info',
                  message: `Roster ordering updated according to ${val}. The highest scoring students appear at the top.`,
                });
              }}
              className="bg-card border border-border rounded-lg px-2.5 py-1 text-text font-semibold focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="score">Success Score</option>
              <option value="cgpa">Academic CGPA</option>
              <option value="attendance">Attendance Rate</option>
              <option value="placement">Placement Score</option>
              <option value="completeness">Data Completeness</option>
            </select>
            <button
              onClick={() => {
                const nextDir = sortDirection === 'desc' ? 'asc' : 'desc';
                setSortDirection(nextDir);
                showActionInfo({
                  title: `Sort Direction: ${nextDir === 'desc' ? 'Descending (High to Low)' : 'Ascending (Low to High)'}`,
                  badge: `${sortField.toUpperCase()}`,
                  category: 'info',
                  message: `Reordered all ${sortedStudents.length} active students in ${nextDir === 'desc' ? 'descending (highest first)' : 'ascending (lowest first)'} sequence.`,
                });
              }}
              className="p-1 text-text-muted hover:text-text rounded bg-card border border-border cursor-pointer transition"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center rounded-xl border border-border p-0.5 bg-card">
            <button
              onClick={() => {
                setViewMode('table');
                showActionInfo({
                  title: 'Tabular Telemetry View Activated',
                  badge: 'Dense Roster Grid',
                  category: 'info',
                  message: 'Displaying comprehensive tabular view with columns for CGPA, Attendance, Placement Aptitude, LMS Engagement, and Data Completeness.',
                });
              }}
              className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                viewMode === 'table' ? 'bg-accent/20 text-accent font-bold shadow-sm' : 'text-text-muted hover:text-text'
              }`}
              title="Switch to Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setViewMode('grid');
                showActionInfo({
                  title: 'Bento Card Grid View Activated',
                  badge: 'Visual Card Mode',
                  category: 'info',
                  message: 'Displaying student intelligence cards with visual score dials, risk badges, and direct intervention shortcuts.',
                });
              }}
              className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-accent/20 text-accent font-bold shadow-sm' : 'text-text-muted hover:text-text'
              }`}
              title="Switch to Bento Card Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="spec-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-card-hover text-text-muted border-b border-border">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        showActionInfo({
                          title: 'Student Identity & Registration Directory',
                          badge: `${sortedStudents.length} Students Listed`,
                          category: 'info',
                          message: 'Displays student institutional roll numbers and verified names cross-referenced with Central Database records.',
                          details: [
                            'Identifier format: STU001 to STU135',
                            'Integrity check: 100% verified campus enrollment',
                            'Click any row to open student 360° analytics drawer',
                          ],
                        });
                      }}
                      className="hover:text-accent flex items-center gap-1 font-semibold"
                    >
                      Student ID & Name
                    </button>
                  </th>
                  <th className="py-3 px-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        showActionInfo({
                          title: 'Department & Academic Year Stratification',
                          badge: '5 Departments Active',
                          category: 'info',
                          message: 'Cohorts grouped by branch (Computer Science, IT, Electronics, Mechanical, Civil) and semester progression.',
                          details: [
                            'Academic Years: 1st through 4th Year',
                            'Curriculum Semesters: Semester 1 through 8',
                            'Filtered by active institutional filter bar',
                          ],
                        });
                      }}
                      className="hover:text-accent flex items-center gap-1 font-semibold"
                    >
                      Department & Year
                    </button>
                  </th>
                  <th
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-accent"
                    onClick={() => {
                      toggleSort('score');
                      showActionInfo({
                        title: 'Success Score Ranking Sort',
                        badge: `Sorted ${sortDirection === 'desc' ? 'Ascending' : 'Descending'}`,
                        category: 'settings',
                        message: `Roster re-ordered by holistic institutional success score (${weights.academic}% Academics, ${weights.attendance}% Attendance, ${weights.placement}% Placement).`,
                        details: [
                          'Score Scale: 0 to 100 composite index',
                          'High Priority (<60): Flagged for academic & mentor intervention',
                          'Dean Honour (>75): Placement accelerator eligible',
                        ],
                      });
                    }}
                  >
                    Success Score
                  </th>
                  <th
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-accent"
                    onClick={() => {
                      toggleSort('cgpa');
                      showActionInfo({
                        title: 'Cumulative GPA & Backlog Audit Sort',
                        badge: `Sorted ${sortDirection === 'desc' ? 'Ascending' : 'Descending'}`,
                        category: 'settings',
                        message: 'Roster sorted by Cumulative Grade Point Average (CGPA) and standing backlogs.',
                        details: [
                          'CGPA Scale: 10.0 institutional grading standard',
                          'Backlog Threshold: >2 backlogs triggers critical academic review',
                          'Remediation: Mandatory remedial bridge courses',
                        ],
                      });
                    }}
                  >
                    CGPA / Backlogs
                  </th>
                  <th
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-accent"
                    onClick={() => {
                      toggleSort('attendance');
                      showActionInfo({
                        title: 'Lecture Attendance Pulse Sort',
                        badge: `Sorted ${sortDirection === 'desc' ? 'Ascending' : 'Descending'}`,
                        category: 'settings',
                        message: 'Roster sorted by real-time lecture and laboratory attendance percentage.',
                        details: [
                          'Mandatory Threshold: 75% for semester exam hall ticket',
                          'Critical Warning: <65% triggers proctor & parent notification',
                          'Sync Frequency: Daily automated RFID / SIS ingestion',
                        ],
                      });
                    }}
                  >
                    Attendance
                  </th>
                  <th className="py-3 px-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        showActionInfo({
                          title: 'Institutional Academic Risk Classification',
                          badge: '3-Tier Classification',
                          category: 'warning',
                          message: 'Rule-based algorithmic risk tiering computed from CGPA, internal tests, attendance, and backlogs.',
                          details: [
                            'High Risk: Immediate proctor intervention required',
                            'Moderate Risk: Weekly academic monitoring',
                            'Low Risk: Standard academic progression',
                          ],
                        });
                      }}
                      className="hover:text-accent font-semibold"
                    >
                      Academic Risk
                    </button>
                  </th>
                  <th className="py-3 px-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        showActionInfo({
                          title: 'Placement Readiness & Tier Assessment',
                          badge: 'Corporate Readiness',
                          category: 'info',
                          message: 'Evaluated by DSA coding score, mock technical interviews, resume completeness, and eligible company CTC tiers.',
                          details: [
                            'Tier 1 (18+ LPA): Product and FAANG tracks',
                            'Tier 2 (8-18 LPA): Core engineering and fintech',
                            'Tier 3 (<8 LPA): Mass recruitment accelerators',
                          ],
                        });
                      }}
                      className="hover:text-accent font-semibold"
                    >
                      Placement Risk
                    </button>
                  </th>
                  <th className="py-3 px-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        showActionInfo({
                          title: 'Student Clinical Cohort Segment',
                          badge: '7 Segments Available',
                          category: 'info',
                          message: 'Actionable intervention grouping based on cross-domain academic and placement signals.',
                          details: [
                            'High Academic, Placement Gap: Technical aptitude boost needed',
                            'High Placement, Low Attendance: Attendance waiver & exam warning',
                            'Dual-At-Risk: Intensive multidisciplinary clinical remediation',
                          ],
                        });
                      }}
                      className="hover:text-accent font-semibold"
                    >
                      Segment
                    </button>
                  </th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedStudents.map(student => {
                  const scoreRes = calculateStudentSuccessScore(student, weights);
                  const acad = evaluateAcademicRisk(student, academicThresholds);
                  const place = evaluatePlacementRisk(student, placementThresholds);
                  const seg = assignStudentSegment(student);

                  return (
                    <tr
                      key={student.student_id}
                      className="hover:bg-card-hover transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudent(student)}
                    >
                      {/* Identity */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-text group-hover:text-accent transition">
                          {student.name}
                        </div>
                        <div className="text-[11px] font-mono text-text-muted">{student.student_id}</div>
                      </td>

                      {/* Dept & Year */}
                      <td className="py-3 px-3">
                        <div className="text-text font-medium">{student.department}</div>
                        <div className="text-[11px] text-text-muted">
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
                                  ? 'text-status-success'
                                  : scoreRes.final_score >= 60
                                  ? 'text-accent'
                                  : 'text-status-danger'
                              }`}
                            >
                              {scoreRes.final_score}
                            </span>
                            <span className="text-[10px] text-text-muted">/100</span>
                          </div>
                        ) : (
                          <span className="text-text-muted italic text-[11px]">Insufficient Data</span>
                        )}
                      </td>

                      {/* CGPA */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-text">
                          {student.academic.cgpa !== null ? student.academic.cgpa.toFixed(2) : '—'}
                        </div>
                        <div className="text-[11px]">
                          {(student.academic.backlogs ?? 0) > 0 ? (
                            <span className="text-status-danger font-semibold">{student.academic.backlogs} backlogs</span>
                          ) : (
                            <span className="text-text-muted">0 backlogs</span>
                          )}
                        </div>
                      </td>

                      {/* Attendance */}
                      <td className="py-3 px-3">
                        {student.attendance.overall_attendance !== null ? (
                          <span
                            className={`font-semibold ${
                              student.attendance.overall_attendance < 65
                                ? 'text-status-danger font-bold'
                                : student.attendance.overall_attendance < 75
                                ? 'text-status-warning'
                                : 'text-text'
                            }`}
                          >
                            {student.attendance.overall_attendance.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-text-muted italic">—</span>
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
                        <span className="text-[11px] font-medium text-text-muted line-clamp-1 max-w-[150px]">
                          {seg.segment}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setStudentToEdit(student);
                              setIsFormModalOpen(true);
                            }}
                            title="Edit Student Record"
                            className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/15 rounded-lg transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to delete student "${student.name}" (${student.student_id}) from Central Database?`)) {
                                await deleteStudent(student.student_id);
                              }
                            }}
                            title="Delete Student Record"
                            className="p-1.5 text-text-muted hover:text-status-danger hover:bg-status-danger/15 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTargetStudentForScore(student)}
                            title="Why this score?"
                            className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/15 rounded-lg transition"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTargetStudentForWhatIf(student)}
                            title="What-If Simulator"
                            className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/15 rounded-lg transition"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTargetStudentForIntervention(student)}
                            title="Add Intervention"
                            className="p-1.5 text-text-muted hover:text-status-success hover:bg-status-success/15 rounded-lg transition"
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
                className="spec-card p-4 cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-card-hover text-accent border border-border">
                        {student.student_id}
                      </span>
                      <h4 className="text-sm font-bold text-text mt-1">{student.name}</h4>
                      <p className="text-[11px] text-text-muted">
                        {student.department} • {student.academic_year}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-accent">
                        {scoreRes.final_score !== null ? `${scoreRes.final_score}/100` : 'Insufficient'}
                      </div>
                      <span className="text-[10px] text-text-muted">Success Score</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <Badge label={acad.risk_level} riskLevel={acad.risk_level} size="sm" />
                    <Badge label={place.risk_level} riskLevel={place.risk_level} size="sm" />
                    <span className="text-[10px] text-text-muted px-2 py-0.5 rounded bg-card-hover border border-border">
                      {student.data_quality.data_completeness_percentage}% Data
                    </span>
                  </div>

                  <p className="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed">
                    <strong className="text-text">{seg.segment}:</strong> {seg.primary_reason}
                  </p>
                </div>

                {/* Footer metrics & actions */}
                <div
                  className="pt-2 border-t border-border flex items-center justify-between text-xs"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="text-[11px] text-text-muted">
                    CGPA: <strong className="text-text">{student.academic.cgpa?.toFixed(2) ?? '—'}</strong> | Att:{' '}
                    <strong className="text-text">{student.attendance.overall_attendance?.toFixed(0) ?? '—'}%</strong>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setStudentToEdit(student);
                        setIsFormModalOpen(true);
                      }}
                      className="p-1 text-text-muted hover:text-accent rounded-lg"
                      title="Edit Student Record"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete student "${student.name}" (${student.student_id}) from Central Database?`)) {
                          await deleteStudent(student.student_id);
                        }
                      }}
                      className="p-1 text-text-muted hover:text-status-danger rounded-lg"
                      title="Delete Student Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTargetStudentForScore(student)}
                      className="p-1 text-text-muted hover:text-accent rounded-lg"
                      title="Why this score?"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTargetStudentForWhatIf(student)}
                      className="p-1 text-text-muted hover:text-accent rounded-lg"
                      title="What-If"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTargetStudentForIntervention(student)}
                      className="p-1 text-text-muted hover:text-status-success rounded-lg"
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

      {/* Student Add/Edit Modal with database persistence */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setStudentToEdit(null);
        }}
        initialData={studentToEdit}
      />

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
