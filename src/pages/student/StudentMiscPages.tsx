import React, { useState } from 'react';
import {
  MessageSquare, Send, CheckCircle2, Clock, AlertCircle,
  User, Shield, Mail, Phone, MapPin, Camera, Moon, Sun, Lock
} from 'lucide-react';
import { DEMO_STUDENT, DEMO_PROBLEMS } from '../../data/portalData';
import { useCurrentStudent } from '../../context/CampusDataContext';

// ─── 1. MY PROBLEM REQUESTS PAGE ──────────────────────────────────────────────

export function StudentMyProblemPage() {
  const s = useCurrentStudent();
  const [requests, setRequests] = useState(DEMO_PROBLEMS);
  const [subject, setSubject] = useState(s.subjects[0]?.name || 'Machine Learning');
  const [topic, setTopic] = useState('');
  const [faculty, setFaculty] = useState(s.subjects[0]?.faculty || 'Dr. Priya Menon');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'Important'>('Normal');
  const [submittedAlert, setSubmittedAlert] = useState<string | null>(null);

  // Sync faculty when subject changes
  const handleSubjectChange = (newSub: string) => {
    setSubject(newSub);
    const match = s.subjects.find(sub => sub.name === newSub);
    if (match) setFaculty(match.faculty);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.length < 10) return;

    const newId = `REQ-00${requests.length + 1}`;
    const newReq = {
      id: newId,
      student: s.name,
      roll: s.roll_no,
      subject,
      topic: topic.trim() || 'General Query',
      faculty,
      description,
      priority,
      status: 'Pending' as const,
      submitted: new Date().toISOString().split('T')[0],
      reply: '',
      next_step: '',
    };

    setRequests([newReq, ...requests]);
    setSubmittedAlert(`Request ${newId} submitted. Status: Pending`);
    setDescription('');
    setTopic('');
    setTimeout(() => setSubmittedAlert(null), 5000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold gradient-title">My Problem Requests</h1>
        <p className="text-sm text-slate-400 mt-0.5">Submit academic queries and support requests directly to assigned course faculty</p>
      </div>

      {submittedAlert && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {submittedAlert}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Submission Form (5 cols) */}
        <div className="lg:col-span-5 glow-card panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Submit New Academic Request</h3>
          <p className="text-xs text-slate-400">
            Faculty will be notified and can propose one-on-one reviews or assignment revisions.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Subject</label>
              <select
                value={subject}
                onChange={e => handleSubjectChange(e.target.value)}
                className="w-full bg-[#0b1226] border border-[#14224a] rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 outline-none"
              >
                {s.subjects.map(sub => (
                  <option key={sub.name} value={sub.name}>{sub.name} ({sub.faculty})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Faculty In-Charge</label>
              <input
                type="text"
                disabled
                value={faculty}
                className="w-full bg-[#0b1226]/50 border border-[#14224a] rounded-lg px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Topic / Specific Concept (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Dynamic Programming memoization"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full bg-[#0b1226] border border-[#14224a] rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Priority Level</label>
              <div className="flex gap-3">
                {(['Normal', 'Important'] as const).map(p => (
                  <label key={p} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      checked={priority === p}
                      onChange={() => setPriority(p)}
                      className="accent-cyan-400"
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Detailed Description <span className="text-[10px] text-slate-500">(min. 10 chars)</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe specifically what concept you are struggling with..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-[#0b1226] border border-[#14224a] rounded-lg p-3 text-xs text-slate-200 focus:border-cyan-400 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={description.trim().length < 10}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                description.trim().length >= 10
                  ? 'btn-primary text-white shadow-glow-blue'
                  : 'bg-[#14224a] text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" /> Submit Request
            </button>
          </form>
        </div>

        {/* Right: Request History & Replies (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Your Submitted Requests ({requests.length})</h3>

          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="glow-card panel p-4 space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-2 border-b border-[#14224a] pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-cyan-400">{req.id}</span>
                      <span className="text-xs font-bold text-slate-200">{req.subject}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Faculty: {req.faculty} · Submitted: {req.submitted}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.priority === 'Important' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Important
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      req.status === 'Resolved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      req.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Topic: {req.topic}</p>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{req.description}</p>
                </div>

                {/* Faculty Response if available */}
                {req.reply ? (
                  <div className="p-3 rounded-lg bg-[#0b1226] border border-blue-500/30 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-cyan-400 font-bold">
                      <span>Faculty Response ({req.faculty})</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs text-slate-300">{req.reply}</p>
                    {req.next_step && (
                      <p className="text-[11px] text-amber-300 font-semibold pt-1 border-t border-[#14224a]">
                        Next Step: {req.next_step}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-[#0b1226]/50 border border-[#14224a] text-[11px] text-slate-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Awaiting faculty review and response.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. STUDENT PROFILE & SETTINGS ────────────────────────────────────────────

export function StudentProfilePage() {
  const s = useCurrentStudent();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold gradient-title">My Profile</h1>
        <p className="text-sm text-slate-400 mt-0.5">Academic registration details, institutional credentials, and student snapshot</p>
      </div>

      {/* Header banner card */}
      <div className="glow-card panel overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-blue-900/60 via-cyan-900/40 to-blue-950/80 border-b border-[#14224a]" />
        <div className="p-6 relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 gap-4 pb-4 border-b border-[#14224a]">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white text-3xl font-extrabold shadow-[0_0_24px_rgba(47,123,255,0.4)] border-4 border-[#05070f]">
                {s.avatar_initials}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">{s.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{s.department} · {s.academic_year} ({s.semester})</p>
                <div className="flex items-center gap-2 justify-center sm:justify-start mt-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                    Roll: {s.roll_no}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                    Enrolled Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Snapshot Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="panel-raised p-3 rounded-xl border border-[#14224a]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Cumulative CGPA</span>
              <div className="text-lg font-bold text-cyan-400 mt-0.5">{s.cgpa.toFixed(2)}</div>
            </div>
            <div className="panel-raised p-3 rounded-xl border border-[#14224a]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Overall Attendance</span>
              <div className="text-lg font-bold text-green-400 mt-0.5">{s.overall_attendance}%</div>
            </div>
            <div className="panel-raised p-3 rounded-xl border border-[#14224a]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Success Score</span>
              <div className="text-lg font-bold text-blue-400 mt-0.5">{s.success_score}/100</div>
            </div>
            <div className="panel-raised p-3 rounded-xl border border-[#14224a]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Backlogs</span>
              <div className="text-lg font-bold text-white mt-0.5">{s.backlogs}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glow-card panel p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-200">Contact & Institutional Info</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#14224a]/50">
              <span className="text-slate-400">Institutional Email</span>
              <span className="text-slate-200 font-medium">{s.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#14224a]/50">
              <span className="text-slate-400">Contact Number</span>
              <span className="text-slate-200 font-medium">{s.phone}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#14224a]/50">
              <span className="text-slate-400">Date of Birth</span>
              <span className="text-slate-200 font-medium">{s.dob}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#14224a]/50">
              <span className="text-slate-400">Parent / Guardian</span>
              <span className="text-slate-200 font-medium">{s.guardian}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Permanent Address</span>
              <span className="text-slate-200 font-medium">{s.address}</span>
            </div>
          </div>
        </div>

        <div className="glow-card panel p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-200">Current Semester Enrolled Subjects</h3>
          <div className="space-y-2 text-xs">
            {s.subjects.map(sub => (
              <div key={sub.code} className="flex items-center justify-between p-2 rounded-lg bg-[#0b1226] border border-[#14224a]">
                <div>
                  <span className="font-bold text-white">{sub.code}: {sub.name}</span>
                  <p className="text-[10px] text-slate-400">{sub.faculty}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                  {sub.internal_pct}% int
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. SETTINGS PAGE ─────────────────────────────────────────────────────────

export function StudentSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold gradient-title">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Portal preferences, appearance, and credentials</p>
      </div>

      <div className="glow-card panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Interface Theme</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-blue-600/10 border-2 border-cyan-400 flex items-center gap-3 cursor-pointer">
            <Moon className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-xs font-bold text-white">Pure Black (Default)</p>
              <p className="text-[10px] text-slate-400">Optimized for hackathon judging</p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0b1226] border border-[#14224a] opacity-50 flex items-center gap-3 cursor-not-allowed">
            <Sun className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-xs font-bold text-slate-400">Light Theme</p>
              <p className="text-[10px] text-slate-500">Disabled in hackathon MVP</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glow-card panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Security Credentials</h3>
        <p className="text-xs text-slate-400">
          Single sign-on managed via institutional directory. Password reset requires IT helpdesk ticket.
        </p>
        <button
          disabled
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#14224a] text-slate-500 cursor-not-allowed flex items-center gap-2"
        >
          <Lock className="w-4 h-4" /> Change Password (Managed by College SSO)
        </button>
      </div>
    </div>
  );
}
