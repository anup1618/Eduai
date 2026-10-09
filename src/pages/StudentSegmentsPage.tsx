import React, { useState } from 'react';
import { useCampusData } from '../context/CampusDataContext';
import { assignStudentSegment, SEGMENT_METADATA } from '../engine/segmentationEngine';
import { SegmentType } from '../types/segmentation';
import { Badge } from '../components/common/Badge';
import { calculateStudentSuccessScore } from '../engine/scoringEngine';
import { Users, CheckCircle, ArrowRight, BookOpen, Briefcase, Award } from 'lucide-react';

export const StudentSegmentsPage: React.FC = () => {
  const { filteredStudents, weights, setSelectedStudent } = useCampusData();

  const [selectedSegment, setSelectedSegment] = useState<SegmentType>(
    'Strong Academics, Low Placement Readiness'
  );

  // Group filtered students by segment
  const segmentBuckets: Record<SegmentType, typeof filteredStudents> = {
    'Strong Academics, Strong Placement Readiness': [],
    'Strong Academics, Low Placement Readiness': [],
    'Academic Support Needed': [],
    'Placement Preparation Needed': [],
    'Low LMS Participation': [],
    'Balanced Performers': [],
    'Insufficient Data': [],
  };

  filteredStudents.forEach(s => {
    const assigned = assignStudentSegment(s);
    segmentBuckets[assigned.segment].push(s);
  });

  const totalFiltered = filteredStudents.length || 1;
  const currentMeta = SEGMENT_METADATA[selectedSegment];
  const currentCohort = segmentBuckets[selectedSegment];

  // Department distribution for current cohort
  const deptDist: Record<string, number> = {};
  currentCohort.forEach(s => {
    deptDist[s.department] = (deptDist[s.department] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards for all 7 segments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(SEGMENT_METADATA) as SegmentType[]).map(segType => {
          const meta = SEGMENT_METADATA[segType];
          const count = segmentBuckets[segType].length;
          const pct = Math.round((count / totalFiltered) * 100);
          const isSelected = selectedSegment === segType;

          return (
            <div
              key={segType}
              onClick={() => setSelectedSegment(segType)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeBg}`}>
                    {meta.title}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{pct}%</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">{segType}</h4>
              </div>

              <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-2">
                <span className="text-2xl font-extrabold text-slate-900">{count}</span>
                <span className="text-[11px] text-slate-500">students</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Segment Deep Dive */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        {/* Segment Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{selectedSegment}</h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${currentMeta.badgeBg}`}>
                {currentMeta.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">{currentMeta.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-teal-800">{currentCohort.length}</div>
            <span className="text-xs text-slate-400">
              {Math.round((currentCohort.length / totalFiltered) * 100)}% of active cohort
            </span>
          </div>
        </div>

        {/* 3-Column Info (Typical Indicators, Recommended Interventions, Department Breakdown) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Typical Indicators */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Typical Trigger Criteria
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {currentMeta.typicalIndicators.map((ind, i) => (
                <li key={i} className="flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                  <span>{ind}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Recommended Interventions */}
          <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/70 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
              Recommended Campus Actions
            </span>
            <ul className="space-y-1.5 text-xs text-teal-900">
              {currentMeta.recommendedInterventions.map((action, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Department Distribution */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Department Distribution
            </span>
            <div className="space-y-1.5 text-xs">
              {Object.keys(deptDist).length > 0 ? (
                Object.entries(deptDist).map(([dept, count]) => (
                  <div key={dept} className="flex justify-between items-center text-slate-700">
                    <span className="truncate pr-2">{dept}</span>
                    <strong className="text-slate-900">{count}</strong>
                  </div>
                ))
              ) : (
                <span className="text-slate-400 italic">No students in this segment</span>
              )}
            </div>
          </div>
        </div>

        {/* Cohort Student Roster */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Enrolled Students in this Cohort ({currentCohort.length})
          </h4>

          {currentCohort.length > 0 ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Student ID & Name</th>
                    <th className="py-2.5 px-3 font-semibold">Department</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Success Score</th>
                    <th className="py-2.5 px-3 font-semibold text-right">CGPA</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Attendance</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Coding Score</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentCohort.map(student => {
                    const score = calculateStudentSuccessScore(student, weights);
                    return (
                      <tr
                        key={student.student_id}
                        onClick={() => setSelectedStudent(student)}
                        className="hover:bg-slate-50/80 transition cursor-pointer"
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{student.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{student.student_id}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{student.department}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-teal-800">
                          {score.final_score !== null ? `${score.final_score}/100` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                          {student.academic.cgpa?.toFixed(2) ?? '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                          {student.attendance.overall_attendance !== null
                            ? `${student.attendance.overall_attendance.toFixed(0)}%`
                            : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                          {student.placement.coding_score !== null ? `${student.placement.coding_score}/100` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-[11px] font-bold text-teal-700 hover:text-teal-900">
                            Profile →
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              No students in the active filtered view match this segment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
