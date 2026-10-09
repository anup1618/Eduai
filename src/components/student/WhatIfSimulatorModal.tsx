import React, { useState, useEffect } from 'react';
import { UnifiedStudent } from '../../types/student';
import { useCampusData } from '../../context/CampusDataContext';
import { simulateWhatIfScenario, WhatIfAdjustments } from '../../engine/whatIfSimulator';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Sliders, ArrowRight, RotateCcw, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';

interface WhatIfSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: UnifiedStudent | null;
}

export const WhatIfSimulatorModal: React.FC<WhatIfSimulatorModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { weights } = useCampusData();

  const [adjustments, setAdjustments] = useState<WhatIfAdjustments>({
    attendance: student?.attendance.overall_attendance ?? 75,
    internal_marks: student?.academic.internal_marks ?? 65,
    assignment_completion: student?.lms.assignment_completion ?? 70,
    aptitude_score: student?.placement.aptitude_score ?? 60,
    coding_score: student?.placement.coding_score ?? 55,
    mock_interview_score: student?.placement.mock_interview_score ?? 60,
  });

  // Sync adjustments whenever student changes
  useEffect(() => {
    if (student) {
      setAdjustments({
        attendance: student.attendance.overall_attendance ?? 75,
        internal_marks: student.academic.internal_marks ?? 65,
        assignment_completion: student.lms.assignment_completion ?? 70,
        aptitude_score: student.placement.aptitude_score ?? 60,
        coding_score: student.placement.coding_score ?? 55,
        mock_interview_score: student.placement.mock_interview_score ?? 60,
      });
    }
  }, [student]);

  if (!student) return null;

  const simulation = simulateWhatIfScenario(student, adjustments, weights);
  const {
    originalScore,
    simulatedScore,
    scoreDelta,
    originalAcademicRisk,
    simulatedAcademicRisk,
    originalPlacementRisk,
    simulatedPlacementRisk,
    componentDeltas,
    keyTakeaways,
  } = simulation;

  const resetValues = () => {
    setAdjustments({
      attendance: student.attendance.overall_attendance ?? 75,
      internal_marks: student.academic.internal_marks ?? 65,
      assignment_completion: student.lms.assignment_completion ?? 70,
      aptitude_score: student.placement.aptitude_score ?? 60,
      coding_score: student.placement.coding_score ?? 55,
      mock_interview_score: student.placement.mock_interview_score ?? 60,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Interactive What-If Simulator"
      subtitle={`Simulate hypothetical performance trajectories for ${student.name} (${student.student_id})`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Advisory banner */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <strong>Hypothetical Projection:</strong> Simulated scores evaluate sensitivity to specific interventions and are not a guarantee of future outcomes.
          </span>
        </div>

        {/* Score & Risk Comparison Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Success score comparison */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Success Score Projection</span>
            <div className="my-2 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Current</span>
                <div className="text-2xl font-bold text-slate-700">
                  {originalScore.final_score ?? 'N/A'}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
              <div>
                <span className="text-xs text-teal-600 font-semibold">Simulated</span>
                <div className="text-3xl font-extrabold text-teal-700">
                  {simulatedScore.final_score ?? 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
              <span className="text-slate-500">Net Impact</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  scoreDelta > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : scoreDelta < 0
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`} pts
              </span>
            </div>
          </div>

          {/* Academic Risk Transition */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Risk Status</span>
            <div className="my-3 flex items-center justify-between gap-2">
              <Badge label={originalAcademicRisk.risk_level} riskLevel={originalAcademicRisk.risk_level} />
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge label={simulatedAcademicRisk.risk_level} riskLevel={simulatedAcademicRisk.risk_level} />
            </div>
            <p className="text-[11px] text-slate-500">
              Triggered rules: {simulatedAcademicRisk.triggered_rules.length} (originally {originalAcademicRisk.triggered_rules.length})
            </p>
          </div>

          {/* Placement Risk Transition */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Placement Readiness Status</span>
            <div className="my-3 flex items-center justify-between gap-2">
              <Badge label={originalPlacementRisk.risk_level} riskLevel={originalPlacementRisk.risk_level} />
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge label={simulatedPlacementRisk.risk_level} riskLevel={simulatedPlacementRisk.risk_level} />
            </div>
            <p className="text-[11px] text-slate-500">
              Readiness Score: {simulatedPlacementRisk.readiness_score ?? 'N/A'}/100
            </p>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-teal-600" />
              Hypothetical Indicator Controls
            </h4>
            <button
              onClick={resetValues}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Sliders
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
            {/* Attendance */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">Hypothetical Attendance (%)</span>
                <span className="font-bold text-teal-700">{adjustments.attendance}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={adjustments.attendance}
                onChange={e => setAdjustments({ ...adjustments, attendance: Number(e.target.value) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>30%</span>
                <span>Original: {student.attendance.overall_attendance ?? 0}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Internal Marks */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">Internal Marks (%)</span>
                <span className="font-bold text-teal-700">{adjustments.internal_marks}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={adjustments.internal_marks}
                onChange={e => setAdjustments({ ...adjustments, internal_marks: Number(e.target.value) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>20%</span>
                <span>Original: {student.academic.internal_marks ?? 0}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* LMS Assignment Completion */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">LMS Assignment Completion (%)</span>
                <span className="font-bold text-teal-700">{adjustments.assignment_completion}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={adjustments.assignment_completion}
                onChange={e => setAdjustments({ ...adjustments, assignment_completion: Number(e.target.value) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10%</span>
                <span>Original: {student.lms.assignment_completion ?? 0}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Coding Score */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">Coding Assessment Score</span>
                <span className="font-bold text-teal-700">{adjustments.coding_score}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.coding_score}
                onChange={e => setAdjustments({ ...adjustments, coding_score: Number(e.target.value) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0</span>
                <span>Original: {student.placement.coding_score ?? 0}</span>
                <span>100</span>
              </div>
            </div>

            {/* Aptitude Score */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">Aptitude Score</span>
                <span className="font-bold text-teal-700">{adjustments.aptitude_score}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.aptitude_score}
                onChange={e => setAdjustments({ ...adjustments, aptitude_score: Number(e.target.value) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0</span>
                <span>Original: {student.placement.aptitude_score ?? 0}</span>
                <span>100</span>
              </div>
            </div>

            {/* Mock Interview */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">Mock Interview Score</span>
                <span className="font-bold text-teal-700">{adjustments.mock_interview_score}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.mock_interview_score}
                onChange={e => setAdjustments({ ...adjustments, mock_interview_score: Number(e.target.value) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0</span>
                <span>Original: {student.placement.mock_interview_score ?? 0}</span>
                <span>100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Takeaways & Strategic Recommendation */}
        <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 mb-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Scenario Key Insights</span>
          </div>
          <ul className="space-y-1 text-xs text-teal-900">
            {keyTakeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Done Simulating
          </button>
        </div>
      </div>
    </Modal>
  );
};
