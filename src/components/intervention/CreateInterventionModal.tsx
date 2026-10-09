import React, { useState, useEffect } from 'react';
import { UnifiedStudent } from '../../types/student';
import { InterventionCategory } from '../../types/intervention';
import { useCampusData } from '../../context/CampusDataContext';
import { Modal } from '../common/Modal';
import { LifeBuoy, Calendar, UserCheck } from 'lucide-react';

interface CreateInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudent?: UnifiedStudent | null;
}

const CATEGORIES: InterventionCategory[] = [
  'Academic Mentoring',
  'Attendance Support',
  'Assignment Support',
  'Coding Practice',
  'Aptitude Training',
  'Mock Interview',
  'Skills Development',
  'Student Feedback Follow-up',
];

export const CreateInterventionModal: React.FC<CreateInterventionModalProps> = ({
  isOpen,
  onClose,
  preselectedStudent,
}) => {
  const { students, addIntervention } = useCampusData();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(preselectedStudent?.student_id ?? '');
  const [category, setCategory] = useState<InterventionCategory>('Academic Mentoring');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [facultyAssigned, setFacultyAssigned] = useState<string>('Dr. S. Ramanathan');
  const [targetDate, setTargetDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  useEffect(() => {
    if (preselectedStudent) {
      setSelectedStudentId(preselectedStudent.student_id);
      setTitle(`${category} for ${preselectedStudent.name}`);
    } else if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].student_id);
      setTitle(`${category} for ${students[0].name}`);
    }
  }, [preselectedStudent, students, category]);

  if (!isOpen) return null;

  const currentTargetStudent = students.find(s => s.student_id === selectedStudentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTargetStudent) return;

    addIntervention({
      student_id: currentTargetStudent.student_id,
      student_name: currentTargetStudent.name,
      department: currentTargetStudent.department,
      category,
      title: title || `${category} Plan`,
      description: description || `Targeted faculty remediation for ${category.toLowerCase()}.`,
      faculty_assigned: facultyAssigned,
      target_date: targetDate,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Student Intervention"
      subtitle="Establish a targeted faculty action plan with scheduled milestones."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Student Selector */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Target Student</label>
          <select
            value={selectedStudentId}
            onChange={e => {
              setSelectedStudentId(e.target.value);
              const st = students.find(s => s.student_id === e.target.value);
              if (st) setTitle(`${category} for ${st.name}`);
            }}
            disabled={!!preselectedStudent}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
          >
            {students.map(s => (
              <option key={s.student_id} value={s.student_id}>
                {s.name} ({s.student_id}) — {s.department}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Intervention Category</label>
          <select
            value={category}
            onChange={e => {
              const cat = e.target.value as InterventionCategory;
              setCategory(cat);
              if (currentTargetStudent) setTitle(`${cat} for ${currentTargetStudent.name}`);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-teal-500"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Action Title */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Intervention Plan Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Description / Action items */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Prescribed Action & Goals</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="e.g., Weekly 1-on-1 tutoring on core concepts, monitoring attendance logs, and submitting 3 mock problem sets..."
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Faculty and Target Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Faculty Mentor</label>
            <input
              type="text"
              value={facultyAssigned}
              onChange={e => setFacultyAssigned(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Milestone Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-slate-600 hover:text-slate-800 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition"
          >
            Save Intervention
          </button>
        </div>
      </form>
    </Modal>
  );
};
