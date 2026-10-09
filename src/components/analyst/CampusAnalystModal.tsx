import React, { useState } from 'react';
import { useCampusData } from '../../context/CampusDataContext';
import { queryCampusAnalyst, AnalystResponse } from '../../engine/aiCampusAnalyst';
import { Modal } from '../common/Modal';
import { Sparkles, Send, HelpCircle, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { NavigationPage } from '../layout/Sidebar';

interface CampusAnalystModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: NavigationPage) => void;
}

const PRESET_QUERIES = [
  'How many students need academic support?',
  'Which department has the highest proportion of academic risk flags?',
  'How many students have strong academics but low placement readiness?',
  'What are the most common reasons for placement risk?',
  'Which students have incomplete placement assessments?',
];

export const CampusAnalystModal: React.FC<CampusAnalystModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { filteredStudents, setSelectedStudent } = useCampusData();

  const [inputQuery, setInputQuery] = useState('');
  const [history, setHistory] = useState<AnalystResponse[]>([
    queryCampusAnalyst('How many students need academic support?', filteredStudents),
  ]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const response = queryCampusAnalyst(q, filteredStudents);
    setHistory(prev => [response, ...prev]);
    setInputQuery('');
  };

  const handleStudentClick = (studentId: string) => {
    const found = filteredStudents.find(s => s.student_id === studentId);
    if (found) {
      setSelectedStudent(found);
      onClose();
    }
  };

  const handleNavigatePage = (target?: string) => {
    if (target && onNavigate) {
      onNavigate(target as NavigationPage);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Campus Analyst"
      subtitle="Deterministic, privacy-preserving institutional intelligence engine."
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Privacy & Deterministic Guarantee */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
          <span>
            <strong>Local Deterministic Calculation:</strong> Calculations execute locally over your authenticated cohort ({filteredStudents.length} students). Zero private student data is transmitted externally.
          </span>
        </div>

        {/* Query Input Box */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Ask an analytical question about risk, departments, or cohorts..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
            <button
              onClick={() => handleSend()}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Analyze</span>
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" /> Presets:
            </span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(preset)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700 border border-slate-200/60 transition"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Responses Stream */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {history.map((resp, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
              {/* Question badge */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-600 italic">"{resp.query}"</span>
                <span className="text-[10px] font-mono">Calculated locally</span>
              </div>

              {/* Title & Summary */}
              <div>
                <h4 className="text-sm font-bold text-slate-900">{resp.answerTitle}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{resp.answerSummary}</p>
              </div>

              {/* Metric Cards Grid */}
              {resp.metrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {resp.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                      <div className="text-[10px] font-semibold text-slate-500 truncate">{m.label}</div>
                      <div className="text-base font-extrabold text-slate-900 mt-0.5">{m.value}</div>
                      {m.sublabel && <div className="text-[10px] text-teal-700 font-medium">{m.sublabel}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Detailed Breakdown */}
              <div className="space-y-1 bg-slate-50/60 p-3 rounded-lg border border-slate-200/60 text-xs text-slate-700">
                <div className="font-semibold text-slate-900 text-[11px] mb-1">Underlying Conditions & Telemetry:</div>
                {resp.detailedBreakdown.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-1.5 text-[11px]">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Related Student Links if present */}
              {resp.relatedStudentIds && resp.relatedStudentIds.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Direct Cohort Links:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {resp.relatedStudentIds.map(sId => (
                      <button
                        key={sId}
                        onClick={() => handleStudentClick(sId)}
                        className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition"
                      >
                        {sId}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Action & Navigation Link */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-600 font-medium">{resp.suggestedAction}</span>
                {resp.targetPage && (
                  <button
                    onClick={() => handleNavigatePage(resp.targetPage)}
                    className="flex items-center gap-1 text-teal-700 hover:text-teal-900 font-bold ml-2"
                  >
                    <span>View Section</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
