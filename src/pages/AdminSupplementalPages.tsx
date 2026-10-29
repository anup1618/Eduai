import React, { useState } from 'react';
import {
  Users, BookOpen, Shield, Key, Check, Plus, Edit2, Trash2, Award
} from 'lucide-react';
import { DEMO_FACULTY } from '../data/portalData';
import { useActionInfo } from '../context/ActionInfoContext';

// ─── 1. ADMIN USERS MANAGEMENT ────────────────────────────────────────────────

export function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<'students' | 'faculty'>('students');
  const { showActionInfo } = useActionInfo();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold gradient-title">User Management</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage student enrollments, faculty profiles, and institutional credentials</p>
      </div>

      <div className="flex gap-2 border-b border-[#14224a] pb-3">
        <button
          onClick={() => {
            setActiveTab('students');
            showActionInfo({
              title: 'Student Enrollment Ledger',
              badge: '135 Active Students',
              category: 'info',
              message: 'Institutional student body directory synchronized with Central Database.',
              details: [
                'Total Enrolled: 135 students across 5 engineering departments',
                'Status: Biometric and LMS synchronized',
                'Access: Student Intelligence page available for deep metrics'
              ]
            });
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'btn-primary text-white shadow-glow-blue'
              : 'bg-[#0b1226] text-slate-400 border border-[#14224a]'
          }`}
        >
          Enrolled Students (135 Active)
        </button>
        <button
          onClick={() => {
            setActiveTab('faculty');
            showActionInfo({
              title: 'Faculty Academic Senate Directory',
              badge: '18 Active Professors',
              category: 'info',
              message: 'Verified instructional staff with role-based portal permissions and course allocations.',
              details: [
                'Total Faculty: 18 professors & instructors',
                'Department Heads: 5 appointed HODs',
                'Security Status: Multi-factor authenticated faculty accounts'
              ]
            });
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'faculty'
              ? 'btn-primary text-white shadow-glow-blue'
              : 'bg-[#0b1226] text-slate-400 border border-[#14224a]'
          }`}
        >
          Faculty Members (18 Active)
        </button>
      </div>

      {activeTab === 'students' ? (
        <div className="glow-card panel p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200">Registered Student Cohort</h3>
            <span className="text-xs text-cyan-400 font-semibold">Managed via SIS Sync</span>
          </div>
          <p className="text-xs text-slate-400">
            For full student exploration, deep filtering, and risk indicators, visit the <strong>Student Intelligence</strong> page.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { dept: 'Computer Science', count: 27, code: 'CS' },
              { dept: 'Information Technology', count: 27, code: 'IT' },
              { dept: 'Electronics & Comm.', count: 27, code: 'EC' }
            ].map(d => (
              <div
                key={d.code}
                onClick={() => {
                  showActionInfo({
                    title: `${d.dept} Cohort Telemetry`,
                    badge: `${d.count} Students Active`,
                    category: 'info',
                    message: `${d.dept} has ${d.count} full-time students enrolled in the academic year. Complete semester audit records are synchronized.`,
                    details: [
                      `Department Code: ${d.code}`,
                      `Active Students: ${d.count}`,
                      `Faculty Ratio: 1:3.4`,
                      `Laboratory Status: 4 Dedicated Departmental Labs`
                    ]
                  });
                }}
                className="panel-raised p-4 rounded-xl border border-[#14224a] hover:border-cyan-500 transition cursor-pointer"
                title="Click for Department Cohort Details"
              >
                <span className="text-xs text-slate-400 font-bold uppercase">{d.dept}</span>
                <div className="text-xl font-extrabold text-white mt-1">{d.count} Students</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glow-card panel p-5 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#14224a] text-slate-400">
                <th className="text-left py-2 px-3">Faculty Name</th>
                <th className="text-left py-2 px-3">Department</th>
                <th className="text-left py-2 px-3">Assigned Courses</th>
                <th className="text-center py-2 px-3">Students</th>
                <th className="text-right py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_FACULTY.map(f => (
                <tr
                  key={f.id}
                  onClick={() => {
                    showActionInfo({
                      title: `Faculty Profile: ${f.name}`,
                      badge: `${f.department}`,
                      category: 'info',
                      message: `${f.name} is a senior faculty member in ${f.department}, responsible for ${f.subjects.join(', ')}.`,
                      details: [
                        `Institutional ID: ${f.id}`,
                        `Assigned Courses: ${f.subjects.join(', ')}`,
                        `Total Students Mentored: ${f.students_count} active candidates`,
                        `Faculty Portal Access: Verified Active`
                      ]
                    });
                  }}
                  className="border-b border-[#14224a]/40 hover:bg-[#0b1226] cursor-pointer transition"
                  title="Click for Faculty Profile Details"
                >
                  <td className="py-2.5 px-3 font-bold text-white">{f.name}</td>
                  <td className="py-2.5 px-3 text-slate-300">{f.department}</td>
                  <td className="py-2.5 px-3 text-cyan-400">{f.subjects.join(', ')}</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">{f.students_count}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── 2. DEPARTMENTS & SUBJECTS ────────────────────────────────────────────────

export function AdminDepartmentsPage() {
  const { showActionInfo } = useActionInfo();
  const departments = [
    { name: 'Computer Science', code: 'CS', hod: 'Dr. Priya Menon', facultyCount: 8, studentCount: 27, subjects: ['Machine Learning', 'Database Systems', 'Algorithms'] },
    { name: 'Information Technology', code: 'IT', hod: 'Prof. Suresh Kumar', facultyCount: 6, studentCount: 27, subjects: ['Computer Networks', 'Cloud Computing', 'Web Tech'] },
    { name: 'Electronics & Comm.', code: 'EC', hod: 'Dr. Anita Bose', facultyCount: 7, studentCount: 27, subjects: ['Signals & Systems', 'VLSI Design', 'Embedded Systems'] },
    { name: 'Mechanical Eng.', code: 'ME', hod: 'Dr. R. K. Sharma', facultyCount: 6, studentCount: 27, subjects: ['Thermodynamics', 'Fluid Mechanics', 'Robotics'] },
    { name: 'Civil Eng.', code: 'CE', hod: 'Dr. V. K. Patel', facultyCount: 5, studentCount: 27, subjects: ['Structural Analysis', 'Geotechnical Eng', 'Surveying'] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold gradient-title">Departments & Subjects</h1>
        <p className="text-sm text-slate-400 mt-0.5">Academic structures, department heads, and curriculum offerings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map(d => (
          <div
            key={d.code}
            onClick={() => {
              showActionInfo({
                title: `Department Portfolio: ${d.name} (${d.code})`,
                badge: `${d.studentCount} Students · ${d.facultyCount} Faculty`,
                category: 'info',
                message: `Administering academic curriculum, examination boards, and research laboratories for the Department of ${d.name}.`,
                details: [
                  `Department Head: ${d.hod}`,
                  `Total Enrolled Cohort: ${d.studentCount} students`,
                  `Instructional Faculty: ${d.facultyCount} professors & lab instructors`,
                  `Core Curriculum: ${d.subjects.join(', ')}`
                ]
              });
            }}
            className="glow-card panel p-5 space-y-3 hover:border-cyan-500 cursor-pointer transition"
            title="Click for Full Department Academic Portfolio"
          >
            <div className="flex items-center justify-between border-b border-[#14224a] pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Dept Code: {d.code}</span>
                <h3 className="text-base font-bold text-white">{d.name}</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20">
                {d.studentCount} Students
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p><strong className="text-slate-400">Head of Dept:</strong> {d.hod}</p>
              <p><strong className="text-slate-400">Faculty Count:</strong> {d.facultyCount} Professors</p>
              <div className="pt-1">
                <strong className="text-slate-400 block mb-1">Core Offerings:</strong>
                <div className="flex flex-wrap gap-1.5">
                  {d.subjects.map(s => (
                    <span
                      key={s}
                      onClick={e => {
                        e.stopPropagation();
                        showActionInfo({
                          title: `Course Syllabus: ${s}`,
                          badge: `${d.code} Curriculum`,
                          category: 'info',
                          message: `Core credit course accredited under the Department of ${d.name}. Evaluated with continuous internal assessments and university terminal exams.`,
                          details: [
                            `Course Title: ${s}`,
                            `Department: ${d.name}`,
                            `Credits: 4.0 Institutional Units`,
                            `LMS Status: Digital Courseware Live`
                          ]
                        });
                      }}
                      className="px-2 py-0.5 rounded bg-[#0b1226] border border-[#14224a] text-[11px] text-cyan-300 hover:border-cyan-400 transition cursor-pointer"
                      title="Click for Course Syllabus Telemetry"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 3. FACULTY ASSIGNMENTS ───────────────────────────────────────────────────

export function AdminAssignmentsPage() {
  const { showActionInfo } = useActionInfo();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold gradient-title">Faculty Course Assignments</h1>
        <p className="text-sm text-slate-400 mt-0.5">Teaching assignments, section allocations, and course workload distribution</p>
      </div>

      <div className="glow-card panel p-5 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#14224a] text-slate-400">
              <th className="text-left py-2 px-3">Faculty Member</th>
              <th className="text-left py-2 px-3">Subject / Course</th>
              <th className="text-center py-2 px-3">Section</th>
              <th className="text-center py-2 px-3">Weekly Hours</th>
              <th className="text-right py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Dr. Priya Menon', subject: 'Machine Learning', sec: 'CS-A', hours: 4, status: 'Active' },
              { name: 'Dr. Priya Menon', subject: 'Database Systems', sec: 'CS-B', hours: 4, status: 'Active' },
              { name: 'Prof. Suresh Kumar', subject: 'Computer Networks', sec: 'CS-A', hours: 4, status: 'Active' },
              { name: 'Prof. Suresh Kumar', subject: 'Software Engineering', sec: 'CS-A', hours: 3, status: 'Active' },
              { name: 'Dr. Anita Bose', subject: 'Operating Systems', sec: 'CS-A', hours: 4, status: 'Active' },
              { name: 'Dr. Anita Bose', subject: 'Algorithm Design', sec: 'CS-B', hours: 4, status: 'Active' },
            ].map((row, idx) => (
              <tr
                key={idx}
                onClick={() => {
                  showActionInfo({
                    title: `Instructional Workload: ${row.name}`,
                    badge: `${row.subject} (${row.sec})`,
                    category: 'info',
                    message: `Official faculty teaching timetable for semester session. Allocated ${row.hours} lecture hours per week for section ${row.sec}.`,
                    details: [
                      `Instructor: ${row.name}`,
                      `Course: ${row.subject}`,
                      `Section Allocation: Section ${row.sec}`,
                      `Instructional Load: ${row.hours} credit hours/week`,
                      `Attendance Portal: Synced for class registers`
                    ]
                  });
                }}
                className="border-b border-[#14224a]/40 hover:bg-[#0b1226] cursor-pointer transition"
                title="Click for Faculty Workload Schedule"
              >
                <td className="py-2.5 px-3 font-bold text-white">{row.name}</td>
                <td className="py-2.5 px-3 text-cyan-400 font-semibold">{row.subject}</td>
                <td className="py-2.5 px-3 text-center text-slate-300">{row.sec}</td>
                <td className="py-2.5 px-3 text-center text-slate-300">{row.hours} hrs/wk</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 4. ACCESS PERMISSIONS ────────────────────────────────────────────────────

export function AdminPermissionsPage() {
  const { showActionInfo } = useActionInfo();
  const [permissions, setPermissions] = useState([
    { role: 'Student Portal', feature: 'View Personal Success Score & Breakdown', enabled: true },
    { role: 'Student Portal', feature: 'Submit Academic Problem Requests', enabled: true },
    { role: 'Student Portal', feature: 'View Other Students Data (Strictly Disabled)', enabled: false },
    { role: 'Faculty Portal', feature: 'Mark & Update Class Attendance', enabled: true },
    { role: 'Faculty Portal', feature: 'Create Student Interventions', enabled: true },
    { role: 'Faculty Portal', feature: 'Respond to Problem Requests', enabled: true },
    { role: 'Admin Portal', feature: 'Configure Institution Success Weights', enabled: true },
    { role: 'Admin Portal', feature: 'Upload & Merge CSV Cohort Datasets', enabled: true },
    { role: 'Admin Portal', feature: 'Purge & Reset Synthetic Demonstration Data', enabled: true },
  ]);

  const togglePerm = (idx: number) => {
    const target = permissions[idx];
    const newStatus = !target.enabled;
    setPermissions(prev =>
      prev.map((p, i) => (i === idx ? { ...p, enabled: newStatus } : p))
    );
    showActionInfo({
      title: `Access Policy ${newStatus ? 'Granted' : 'Revoked'}`,
      badge: target.role,
      category: newStatus ? 'success' : 'danger',
      message: `Role boundary for "${target.feature}" under ${target.role} was updated to ${newStatus ? 'GRANTED' : 'DENIED'}.`,
      details: [
        `Target Role: ${target.role}`,
        `Feature Capability: ${target.feature}`,
        `Policy Status: ${newStatus ? 'Authorized Active' : 'Restricted / Denied'}`,
        `Security Log: Institutional RBAC rule verified & applied`
      ]
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold gradient-title">Role-Based Access Permissions</h1>
        <p className="text-sm text-slate-400 mt-0.5">Enforce role isolation and access control across Student, Faculty, and Admin portals</p>
      </div>

      <div className="glow-card panel p-5 space-y-3">
        {permissions.map((p, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#0b1226] border border-[#14224a]">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide block">{p.role}</span>
              <p className="text-xs font-semibold text-white mt-0.5">{p.feature}</p>
            </div>
            <button
              onClick={() => togglePerm(idx)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                p.enabled
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
              }`}
              title="Click to toggle permission state"
            >
              {p.enabled ? 'Granted' : 'Denied'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
