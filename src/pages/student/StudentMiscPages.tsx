import React, { useState } from 'react';
import {
  MessageSquare, Send, CheckCircle2, Clock, AlertCircle,
  User, Shield, Mail, Phone, MapPin, Camera, Moon, Sun, Lock, Sparkles
} from 'lucide-react';
import { DEMO_PROBLEMS } from '../../data/portalData';
import { useCurrentStudent } from '../../context/CampusDataContext';
import { useTheme } from '../../context/ThemeContext';
import { SpecPageHeader, SpecKpiCard } from '../../components/common/SpecComponents';

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
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <SpecPageHeader
        title="My Problem Requests"
        semesterChip={s.semester}
        subtitle="Submit academic queries, assignment doubts, and remediation requests directly to faculty mentors"
        sessionText="Direct Mentorship"
        standingChip={{ text: `${requests.length} Total Requests`, variant: 'accent' }}
      />

      {submittedAlert && (
        <div className="p-4 rounded-xl bg-status-success/15 border border-status-success/30 text-status-success text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {submittedAlert}
        </div>
      )}

      {/* 12-Column Bento Grid: Form (5 cols) & History (7 cols) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Submit Form (5 cols) */}
        <div className="spec-card col-span-12 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h2 className="title-section mb-1">New Support Request</h2>
            <p className="text-xs text-text-muted mb-4">Direct ticket routed to course professor</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-spec block mb-1.5">Select Subject:</label>
                <select
                  value={subject}
                  onChange={e => handleSubjectChange(e.target.value)}
                  className="input-spec w-full text-xs"
                >
                  {s.subjects.map(sub => (
                    <option key={sub.name} value={sub.name} className="bg-card text-text">
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-spec block mb-1.5">Assigned Faculty:</label>
                <input
                  type="text"
                  value={faculty}
                  readOnly
                  className="input-spec w-full text-xs opacity-75 cursor-not-allowed bg-card-hover"
                />
              </div>

              <div>
                <label className="label-spec block mb-1.5">Topic / Concept:</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Backpropagation algorithm doubt"
                  className="input-spec w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="label-spec block mb-1.5">Problem Details:</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your question or difficulty in detail..."
                  className="input-spec w-full text-xs resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="priorityFlag"
                    checked={priority === 'Important'}
                    onChange={e => setPriority(e.target.checked ? 'Important' : 'Normal')}
                    className="accent-[var(--accent)] rounded"
                  />
                  <label htmlFor="priorityFlag" className="text-xs text-text-muted">
                    Mark as Important
                  </label>
                </div>

                <button type="submit" className="btn-spec-primary text-xs py-2 px-4">
                  <Send className="w-3.5 h-3.5" /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Existing Requests History (7 cols) */}
        <div className="spec-card col-span-12 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="title-section">Request History</h2>
              <span className="label-spec text-[10px]">FACULTY AUDIT</span>
            </div>

            <div className="space-y-3">
              {requests.map(req => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-card border border-border hover:border-accent transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-accent">{req.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'Resolved'
                          ? 'bg-status-success/15 text-status-success'
                          : 'bg-status-warning/15 text-status-warning'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-text">{req.topic}</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {req.subject} · To: {req.faculty} · {req.submitted}
                  </p>
                  <p className="text-xs text-text-muted mt-2 bg-card-hover/40 p-2.5 rounded-lg border border-border/40">
                    "{req.description}"
                  </p>

                  {req.reply && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-xs">
                      <span className="font-bold text-accent">Faculty Response: </span>
                      <span className="text-text">{req.reply}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. STUDENT PROFILE PAGE ──────────────────────────────────────────────────

export function StudentProfilePage() {
  const s = useCurrentStudent();

  return (
    <div className="space-y-6 animate-fade-up">
      <SpecPageHeader
        title="Student Profile"
        semesterChip={s.semester}
        subtitle="Official campus registrar information, academic credentials, and institutional contact"
        sessionText="Registrar Record"
        standingChip={{ text: 'Verified', variant: 'success' }}
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Profile Card (4 cols) */}
        <div className="spec-card col-span-12 lg:col-span-4 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-royal to-accent text-accent-contrast font-bold text-3xl flex items-center justify-center mb-4 shadow-spec-card">
            {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-text">{s.name}</h2>
          <span className="text-xs font-mono text-accent mt-0.5">{s.roll_no}</span>
          <p className="text-xs text-text-muted mt-1">{s.department}</p>
          <span className="mt-3 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/30">
            {s.semester}
          </span>
        </div>

        {/* Details (8 cols) */}
        <div className="spec-card col-span-12 lg:col-span-8">
          <h2 className="title-section mb-4">Academic & Personal Particulars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-card border border-border">
              <span className="label-spec text-[10px]">EMAIL ADDRESS</span>
              <p className="font-semibold text-text mt-1">{s.email || `${s.name.toLowerCase().replace(' ', '.')}@campus.edu`}</p>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border">
              <span className="label-spec text-[10px]">BATCH / SESSION</span>
              <p className="font-semibold text-text mt-1">2023 - 2027 (Undergraduate B.Tech)</p>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border">
              <span className="label-spec text-[10px]">CURRENT CGPA</span>
              <p className="font-semibold text-accent mt-1">{s.cgpa.toFixed(2)} / 10.0</p>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border">
              <span className="label-spec text-[10px]">TOTAL ATTENDANCE</span>
              <p className="font-semibold text-text mt-1">{s.overall_attendance}% Cumulative</p>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border">
              <span className="label-spec text-[10px]">PLACEMENTS ELIGIBILITY</span>
              <p className="font-semibold text-status-success mt-1">Eligible (Zero Active Backlogs)</p>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border">
              <span className="label-spec text-[10px]">CAMPUS MENTOR</span>
              <p className="font-semibold text-text mt-1">Dr. Priya Menon (Dept of CSE)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. SETTINGS PAGE ─────────────────────────────────────────────────────────

export function StudentSettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 animate-fade-up">
      <SpecPageHeader
        title="Settings & Preferences"
        subtitle="Theme configuration, alert thresholds, and security parameters"
        sessionText="User Configuration"
        standingChip={{ text: 'Personalized', variant: 'accent' }}
      />

      <div className="spec-card max-w-2xl space-y-6">
        <div>
          <h2 className="title-section mb-1">Visual Theme</h2>
          <p className="text-xs text-text-muted mb-4">
            Toggle between Dark Theme (Electric Mint) and Light Theme (Royal Blue)
          </p>
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
            <div>
              <span className="text-xs font-bold text-text">Active Theme: </span>
              <span className="text-xs text-accent font-semibold capitalize">{theme} Mode</span>
            </div>
            <button onClick={toggleTheme} className="btn-spec-primary text-xs py-1.5 px-4">
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h2 className="title-section mb-1">Notification Preferences</h2>
          <p className="text-xs text-text-muted mb-3">Manage automated early warnings and exam notifications</p>
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-[var(--accent)]" />
              <span className="text-xs text-text font-medium">Email alert when subject attendance drops below 75%</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-[var(--accent)]" />
              <span className="text-xs text-text font-medium">Weekly AI Progress Synthesis notification</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-[var(--accent)]" />
              <span className="text-xs text-text font-medium">Placement drive qualification alerts</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
