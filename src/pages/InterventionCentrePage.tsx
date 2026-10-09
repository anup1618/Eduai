import React, { useState } from 'react';
import { useCampusData } from '../context/CampusDataContext';
import { InterventionItem, InterventionStatus } from '../types/intervention';
import { Badge } from '../components/common/Badge';
import { CreateInterventionModal } from '../components/intervention/CreateInterventionModal';
import {
  LifeBuoy,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  MessageSquare,
  Search,
  Filter,
} from 'lucide-react';

export const InterventionCentrePage: React.FC = () => {
  const { interventions, updateInterventionStatus, setSelectedStudent, students } = useCampusData();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<InterventionStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Statistics
  const totalCount = interventions.length;
  const completedCount = interventions.filter(i => i.status === 'Completed').length;
  const inProgressCount = interventions.filter(i => i.status === 'In Progress').length;
  const plannedCount = interventions.filter(i => i.status === 'Planned').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered interventions
  const filteredList = interventions.filter(item => {
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchName = item.student_name.toLowerCase().includes(q);
      const matchId = item.student_id.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchFaculty = item.faculty_assigned.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchCat && !matchFaculty) return false;
    }
    return true;
  });

  const handleAddNote = (id: string) => {
    if (!newNoteText.trim()) return;
    updateInterventionStatus(id, 'In Progress', newNoteText.trim());
    setNewNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Total Interventions
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</div>
            <span className="text-xs text-slate-400">Institutional action plans</span>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700">
            <LifeBuoy className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              In Progress
            </span>
            <div className="text-2xl font-extrabold text-blue-700 mt-1">{inProgressCount}</div>
            <span className="text-xs text-slate-400">Active mentor sessions</span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Completed
            </span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">{completedCount}</div>
            <span className="text-xs text-slate-400">{completionRate}% resolution rate</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Planned / Backlog
            </span>
            <div className="text-2xl font-extrabold text-slate-700 mt-1">{plannedCount}</div>
            <span className="text-xs text-slate-400">Pending initial intake</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Create Button Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by student, mentor, or category..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          {(['All', 'In Progress', 'Planned', 'Completed', 'Follow-up Needed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Create Intervention Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Intervention</span>
        </button>
      </div>

      {/* Interventions List */}
      <div className="space-y-3">
        {filteredList.map(item => {
          const isExpanded = expandedId === item.id;
          const targetStudent = students.find(s => s.student_id === item.student_id);

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition space-y-3"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <Badge label={item.status} variant="status" size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1.5">{item.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <button
                      onClick={() => targetStudent && setSelectedStudent(targetStudent)}
                      className="font-bold text-teal-700 hover:underline flex items-center gap-1"
                    >
                      {item.student_name} ({item.student_id})
                    </button>
                    <span>• {item.department}</span>
                    <span>• Assigned to: <strong className="text-slate-700">{item.faculty_assigned}</strong></span>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2">
                  <select
                    value={item.status}
                    onChange={e => updateInterventionStatus(item.id, e.target.value as InterventionStatus)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none focus:border-teal-500"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Follow-up Needed">Follow-up Needed</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                {item.description}
              </p>

              {/* Milestones & Note Accordion */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Target: <strong>{item.target_date}</strong>
                  </span>
                  <span>Logged: {item.created_at}</span>
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="text-teal-700 font-semibold flex items-center gap-1 hover:underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{item.notes.length} Progress Notes</span>
                </button>
              </div>

              {/* Expanded Notes Section */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                  <h5 className="text-xs font-bold text-slate-800">Faculty Log & Progress Audit</h5>

                  {item.notes.length > 0 ? (
                    <div className="space-y-2">
                      {item.notes.map(note => (
                        <div key={note.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
                          <div className="flex justify-between font-semibold text-slate-700 mb-1">
                            <span>{note.author}</span>
                            <span className="text-[10px] text-slate-400">{note.created_at}</span>
                          </div>
                          <p className="text-slate-600">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No follow-up notes logged yet.</p>
                  )}

                  {/* Add note input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      placeholder="Add follow-up faculty note..."
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      onClick={() => handleAddNote(item.id)}
                      className="px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                      Post Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No interventions found matching current search or status filter.
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateInterventionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
