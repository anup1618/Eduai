import React from 'react';
import { UnifiedStudent } from '../../types/student';
import { useCampusData } from '../../context/CampusDataContext';
import { calculateStudentSuccessScore } from '../../engine/scoringEngine';
import { Modal } from '../common/Modal';
import { CheckCircle2, AlertCircle, HelpCircle, Info } from 'lucide-react';

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: UnifiedStudent | null;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { weights } = useCampusData();

  if (!student) return null;

  const scoreResult = calculateStudentSuccessScore(student, weights);
  const { final_score, is_insufficient_data, data_coverage_percentage, components, positive_indicators, areas_needing_attention } = scoreResult;

  const componentRows = [
    { key: 'academic', label: 'Academic Performance', data: components.academic },
    { key: 'attendance', label: 'Attendance Telemetry', data: components.attendance },
    { key: 'lms', label: 'LMS Engagement', data: components.lms },
    { key: 'engagement', label: 'Co-curricular & Certifications', data: components.engagement },
    { key: 'placement', label: 'Placement Readiness', data: components.placement },
    { key: 'skills', label: 'Skills Assessment', data: components.skills },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Explainable Student Success Score"
      subtitle={`Deterministic audit for ${student.name} (${student.student_id})`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Composite Success Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              {is_insufficient_data ? (
                <span className="text-xl font-bold text-slate-500">Insufficient Data</span>
              ) : (
                <>
                  <span className="text-3xl font-extrabold text-slate-900">{final_score}</span>
                  <span className="text-sm font-semibold text-slate-500">/ 100</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Verified campus data coverage: <strong className="text-slate-800">{data_coverage_percentage}%</strong>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              Deterministic Engine
            </span>
          </div>
        </div>

        {/* Dynamic Weight Re-normalization Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-800">
          <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
          <p>
            Missing metrics are never penalized as zero. The engine transparently re-normalizes weights across present, verified indicators to prevent skewed administrative decisions.
          </p>
        </div>

        {/* Detailed Component Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Component</th>
                <th className="py-2.5 px-3 font-semibold text-right">Score</th>
                <th className="py-2.5 px-3 font-semibold text-right">Config Weight</th>
                <th className="py-2.5 px-3 font-semibold text-right">Effective Weight</th>
                <th className="py-2.5 px-3 font-semibold text-right">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {componentRows.map(row => (
                <tr key={row.key} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{row.label}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[260px]">{row.data.notes}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {row.data.is_available ? (
                      <span className="font-semibold text-slate-900">{row.data.score}</span>
                    ) : (
                      <span className="text-slate-400 italic">Missing</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500">{row.data.weight}%</td>
                  <td className="py-2.5 px-3 text-right text-slate-700 font-medium">
                    {row.data.is_available ? `${row.data.effective_weight}%` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-teal-700">
                    {row.data.is_available ? `+${row.data.weighted_points}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Evidence & Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Positive indicators */}
          <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Positive Indicators</span>
            </div>
            {positive_indicators.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-emerald-900">
                {positive_indicators.map((ind, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No exceptional strengths identified.</p>
            )}
          </div>

          {/* Areas needing attention */}
          <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Areas Needing Attention</span>
            </div>
            {areas_needing_attention.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-rose-900">
                {areas_needing_attention.map((area, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No critical performance deficits detected.</p>
            )}
          </div>
        </div>

        <div className="text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </Modal>
  );
};
