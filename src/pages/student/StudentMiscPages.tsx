import React, { useState, useMemo } from 'react';
import {
  MessageSquare, Send, CheckCircle2, Clock, AlertCircle, AlertTriangle,
  User, Shield, Mail, Phone, MapPin, Camera, Moon, Sun, Lock, Sparkles,
  Tag, Filter, Layers, Search, BookOpen, ChevronRight, HelpCircle, Download
} from 'lucide-react';
import {
  DEMO_PROBLEMS,
  ProblemRequest,
  ProblemPriority,
  ProblemCategory,
  PROBLEM_CATEGORIES
} from '../../data/portalData';
import { useCampusData, useCurrentStudent } from '../../context/CampusDataContext';
import { useTheme } from '../../context/ThemeContext';
import { SpecPageHeader, SpecKpiCard } from '../../components/common/SpecComponents';
import { useActionInfo } from '../../context/ActionInfoContext';

// ─── 1. MY PROBLEM REQUESTS PAGE ──────────────────────────────────────────────

export function StudentMyProblemPage() {
  const s = useCurrentStudent();
  const { problemRequests, addProblemRequest } = useCampusData();
  const { showActionInfo } = useActionInfo();
  const [subject, setSubject] = useState(s.subjects[0]?.name || 'Machine Learning');
  const [category, setCategory] = useState<ProblemCategory>('Academic Doubt');
  const [priority, setPriority] = useState<ProblemPriority>('Medium');
  const [topic, setTopic] = useState('');
  const [faculty, setFaculty] = useState(s.subjects[0]?.faculty || 'Dr. Priya Menon');
  const [description, setDescription] = useState('');
  const [submittedAlert, setSubmittedAlert] = useState<string | null>(null);

  // Filters for request history
  const [scopeFilter, setScopeFilter] = useState<'mine' | 'all'>('mine');
  const [priorityFilter, setPriorityFilter] = useState<'All' | ProblemPriority>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ProblemCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubjectChange = (newSub: string) => {
    setSubject(newSub);
    const match = s.subjects.find(sub => sub.name === newSub);
    if (match) setFaculty(match.faculty);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.length < 10) return;

    const newId = `REQ-00${problemRequests.length + 1}`;
    const newReq: ProblemRequest = {
      id: newId,
      student: s.name,
      roll: s.roll_no,
      subject,
      topic: topic.trim() || 'General Query',
      faculty,
      description,
      category,
      priority,
      status: 'Pending',
      submitted: new Date().toISOString().split('T')[0],
      reply: '',
      next_step: '',
    };

    await addProblemRequest(newReq);
    setSubmittedAlert(`Problem Request ${newId} logged with [${priority.toUpperCase()}] priority under "${category}". Ticket dispatched directly to ${faculty}.`);
    showActionInfo({
      title: 'Problem Request Registered with Faculty Mentorship Cell',
      badge: `Ticket: ${newId}`,
      category: 'success',
      message: `Your query has been logged and dispatched directly to ${faculty} (${s.department}).`,
      details: [
        `Subject: ${subject}`,
        `Topic: ${topic.trim() || 'General Query'}`,
        `Priority: ${priority.toUpperCase()}`,
        `Expected Resolution: Mentor response within 24-48 institutional hours`,
      ],
    });
    setDescription('');
    setTopic('');
    setTimeout(() => setSubmittedAlert(null), 6000);
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return problemRequests.filter(req => {
      const matchesScope =
        scopeFilter === 'all' ||
        req.roll === s.roll_no ||
        req.student.toLowerCase() === s.name.toLowerCase();
      const matchesPriority = priorityFilter === 'All' || req.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'All' || req.category === categoryFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        req.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.category && req.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesScope && matchesPriority && matchesCategory && matchesSearch;
    });
  }, [problemRequests, scopeFilter, priorityFilter, categoryFilter, searchQuery, s.name, s.roll_no]);

  // Priority counts for quick badges
  const counts = useMemo(() => {
    const baseList = problemRequests.filter(req =>
      scopeFilter === 'all' || req.roll === s.roll_no || req.student.toLowerCase() === s.name.toLowerCase()
    );
    return {
      total: baseList.length,
      important: baseList.filter(r => r.priority === 'Important').length,
      medium: baseList.filter(r => r.priority === 'Medium').length,
      low: baseList.filter(r => r.priority === 'Low').length,
      resolved: baseList.filter(r => r.status === 'Resolved').length,
    };
  }, [problemRequests, scopeFilter, s.name, s.roll_no]);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <SpecPageHeader
        title="My Problem Requests"
        semesterChip={s.semester}
        subtitle="Categorize and submit academic doubts, attendance concerns, and remediation requests with Important, Medium, or Low priority"
        sessionText="Direct Mentorship"
        standingChip={{ text: `${problemRequests.length} Total Requests`, variant: 'accent' }}
      />

      {/* KPI Priority Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => setPriorityFilter('All')}
          className={`spec-card p-3.5 cursor-pointer transition-all ${
            priorityFilter === 'All' ? 'ring-2 ring-accent' : 'hover:border-accent/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="label-spec text-[10px]">TOTAL TICKETS</span>
            <Layers className="w-3.5 h-3.5 text-accent" />
          </div>
          <p className="text-xl font-black text-text mt-1">{counts.total}</p>
          <p className="text-[10px] text-text-muted mt-0.5">{counts.resolved} resolved ({Math.round((counts.resolved / (counts.total || 1)) * 100)}%)</p>
        </div>

        <div
          onClick={() => setPriorityFilter('Important')}
          className={`spec-card p-3.5 cursor-pointer transition-all ${
            priorityFilter === 'Important' ? 'ring-2 ring-status-danger' : 'hover:border-status-danger/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="label-spec text-[10px] text-status-danger">IMPORTANT</span>
            <AlertCircle className="w-3.5 h-3.5 text-status-danger" />
          </div>
          <p className="text-xl font-black text-status-danger mt-1">{counts.important}</p>
          <p className="text-[10px] text-text-muted mt-0.5">High urgency / critical</p>
        </div>

        <div
          onClick={() => setPriorityFilter('Medium')}
          className={`spec-card p-3.5 cursor-pointer transition-all ${
            priorityFilter === 'Medium' ? 'ring-2 ring-status-warning' : 'hover:border-status-warning/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="label-spec text-[10px] text-status-warning">MEDIUM</span>
            <Clock className="w-3.5 h-3.5 text-status-warning" />
          </div>
          <p className="text-xl font-black text-status-warning mt-1">{counts.medium}</p>
          <p className="text-[10px] text-text-muted mt-0.5">Standard review cycle</p>
        </div>

        <div
          onClick={() => setPriorityFilter('Low')}
          className={`spec-card p-3.5 cursor-pointer transition-all ${
            priorityFilter === 'Low' ? 'ring-2 ring-status-success' : 'hover:border-status-success/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="label-spec text-[10px] text-status-success">LOW</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
          </div>
          <p className="text-xl font-black text-status-success mt-1">{counts.low}</p>
          <p className="text-[10px] text-text-muted mt-0.5">Routine / informational</p>
        </div>
      </div>

      {submittedAlert && (
        <div className="p-4 rounded-xl bg-status-success/15 border border-status-success/30 text-status-success text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{submittedAlert}</span>
        </div>
      )}

      {/* 12-Column Bento Grid: Form (5 cols) & History (7 cols) */}
      <div className="grid grid-cols-12 gap-5">
        {/* Submit Form (5 cols) */}
        <div className="spec-card col-span-12 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="title-section">New Support Request</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent/10 text-accent font-bold">
                TICKET DISPATCH
              </span>
            </div>
            <p className="text-xs text-text-muted mb-4">Direct ticket routed to course professor with priority triage</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Subject */}
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

              {/* Assigned Faculty */}
              <div>
                <label className="label-spec block mb-1.5">Assigned Faculty Mentor:</label>
                <input
                  type="text"
                  value={faculty}
                  readOnly
                  className="input-spec w-full text-xs opacity-75 cursor-not-allowed bg-card-hover"
                />
              </div>

              {/* Problem Category */}
              <div>
                <label className="label-spec block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-accent" />
                    Problem Category:
                  </span>
                  <span className="text-[10px] text-text-muted lowercase">categorize your inquiry</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ProblemCategory)}
                  className="input-spec w-full text-xs"
                >
                  {PROBLEM_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-card text-text">
                      {cat.label} — {cat.description}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-text-muted mt-1 italic">
                  💡 {PROBLEM_CATEGORIES.find(c => c.id === category)?.description}
                </p>
              </div>

              {/* Priority Selection: Important, Medium, Low */}
              <div>
                <label className="label-spec block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-accent" />
                    Select Priority Level:
                  </span>
                  <span className="text-[10px] font-mono text-text-muted uppercase">
                    Current: <strong className={priority === 'Important' ? 'text-status-danger' : priority === 'Medium' ? 'text-status-warning' : 'text-status-success'}>{priority}</strong>
                  </span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {/* Important */}
                  <button
                    type="button"
                    onClick={() => setPriority('Important')}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      priority === 'Important'
                        ? 'bg-status-danger/15 border-status-danger text-status-danger shadow-[0_0_15px_rgba(239,68,68,0.25)] ring-1 ring-status-danger font-bold'
                        : 'bg-card border-border text-text-muted hover:border-status-danger/40 hover:text-text'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-bold text-status-danger">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Important
                      </span>
                      {priority === 'Important' && (
                        <span className="w-2 h-2 rounded-full bg-status-danger animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10px] opacity-80 mt-1 leading-tight">Urgent / critical</span>
                  </button>

                  {/* Medium */}
                  <button
                    type="button"
                    onClick={() => setPriority('Medium')}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      priority === 'Medium'
                        ? 'bg-status-warning/15 border-status-warning text-status-warning shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-status-warning font-bold'
                        : 'bg-card border-border text-text-muted hover:border-status-warning/40 hover:text-text'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-bold text-status-warning">
                        <Clock className="w-3.5 h-3.5" />
                        Medium
                      </span>
                      {priority === 'Medium' && (
                        <span className="w-2 h-2 rounded-full bg-status-warning" />
                      )}
                    </div>
                    <span className="text-[10px] opacity-80 mt-1 leading-tight">Standard doubt</span>
                  </button>

                  {/* Low */}
                  <button
                    type="button"
                    onClick={() => setPriority('Low')}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      priority === 'Low'
                        ? 'bg-status-success/15 border-status-success text-status-success shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-1 ring-status-success font-bold'
                        : 'bg-card border-border text-text-muted hover:border-status-success/40 hover:text-text'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-bold text-status-success">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Low
                      </span>
                      {priority === 'Low' && (
                        <span className="w-2 h-2 rounded-full bg-status-success" />
                      )}
                    </div>
                    <span className="text-[10px] opacity-80 mt-1 leading-tight">Routine query</span>
                  </button>
                </div>
              </div>

              {/* Topic / Concept */}
              <div>
                <label className="label-spec block mb-1.5">Topic / Specific Subject Matter:</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Backpropagation algorithm doubt or Medical attendance reconciliation"
                  className="input-spec w-full text-xs"
                  required
                />
              </div>

              {/* Problem Details */}
              <div>
                <label className="label-spec block mb-1.5">Problem Details & Context:</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your question, difficulty, or situation in detail (minimum 10 characters)..."
                  className="input-spec w-full text-xs resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-text-muted">
                  Routed with <strong className="text-accent">{priority}</strong> priority
                </div>

                <button type="submit" className="btn-spec-primary text-xs py-2 px-5 flex items-center gap-2">
                  <Send className="w-3.5 h-3.5" /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Existing Requests History (7 cols) */}
        <div className="spec-card col-span-12 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <h2 className="title-section">Request History</h2>
                <p className="text-xs text-text-muted">Faculty audit ledger & mentorship responses</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Scope selector */}
                <div className="flex items-center bg-card rounded-lg p-0.5 border border-border text-[11px]">
                  <button
                    type="button"
                    onClick={() => setScopeFilter('mine')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      scopeFilter === 'mine' ? 'bg-accent/20 text-accent font-bold' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    My Tickets ({problemRequests.filter(r => r.roll === s.roll_no || r.student.toLowerCase() === s.name.toLowerCase()).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScopeFilter('all')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      scopeFilter === 'all' ? 'bg-accent/20 text-accent font-bold' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    All Campus ({problemRequests.length})
                  </button>
                </div>

                <span className="label-spec text-[10px] font-mono bg-card px-2 py-0.5 rounded border border-border">
                  {filteredRequests.length} SHOWN
                </span>
              </div>
            </div>

            {/* Filters Row: Priority Tabs + Category Dropdown + Search */}
            <div className="space-y-2.5 mb-4">
              {/* Priority Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(['All', 'Important', 'Medium', 'Low'] as const).map(p => {
                  const isActive = priorityFilter === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriorityFilter(p)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        isActive
                          ? p === 'Important'
                            ? 'bg-status-danger/20 border-status-danger text-status-danger font-bold'
                            : p === 'Medium'
                            ? 'bg-status-warning/20 border-status-warning text-status-warning font-bold'
                            : p === 'Low'
                            ? 'bg-status-success/20 border-status-success text-status-success font-bold'
                            : 'bg-accent/20 border-accent text-accent font-bold'
                          : 'bg-card border-border text-text-muted hover:border-accent/40 hover:text-text'
                      }`}
                    >
                      {p === 'Important' && <AlertCircle className="w-3 h-3 text-status-danger" />}
                      {p === 'Medium' && <Clock className="w-3 h-3 text-status-warning" />}
                      {p === 'Low' && <CheckCircle2 className="w-3 h-3 text-status-success" />}
                      {p === 'All' && <Layers className="w-3 h-3" />}
                      <span>{p}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-card-hover/80 font-mono">
                        {p === 'All' ? counts.total : counts[p.toLowerCase() as keyof typeof counts]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Category Dropdown and Search */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value as 'All' | ProblemCategory)}
                    className="input-spec w-full text-xs py-1.5 pl-2.5 pr-8"
                  >
                    <option value="All">All Categories ({problemRequests.length})</option>
                    {PROBLEM_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label} ({problemRequests.filter(r => r.category === cat.id).length})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search requests by keyword..."
                    className="input-spec w-full text-xs py-1.5 pl-8 pr-3"
                  />
                </div>
              </div>
            </div>

            {/* Requests List */}
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-border bg-card/50">
                  <HelpCircle className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-text">No problem requests match this filter</p>
                  <p className="text-[11px] text-text-muted mt-1">
                    Try switching priority tabs or changing the category filter.
                  </p>
                  <button
                    onClick={() => { setPriorityFilter('All'); setCategoryFilter('All'); setSearchQuery(''); }}
                    className="btn-spec-secondary text-xs py-1.5 px-3 mt-3"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredRequests.map(req => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-card border border-border hover:border-accent/60 transition-all space-y-2.5"
                  >
                    {/* Top Row: ID, Category, Priority, Status */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-accent">{req.id}</span>

                        {/* Category Badge */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent/10 text-accent border border-accent/25 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          {req.category || 'Academic Doubt'}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            req.priority === 'Important'
                              ? 'bg-status-danger/15 text-status-danger border border-status-danger/30'
                              : req.priority === 'Medium'
                              ? 'bg-status-warning/15 text-status-warning border border-status-warning/30'
                              : 'bg-status-success/15 text-status-success border border-status-success/30'
                          }`}
                        >
                          {req.priority === 'Important' && <AlertCircle className="w-2.5 h-2.5" />}
                          {req.priority === 'Medium' && <Clock className="w-2.5 h-2.5" />}
                          {req.priority === 'Low' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          <span>{req.priority || 'Normal'} Priority</span>
                        </span>
                      </div>

                      {/* Status */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'Resolved'
                            ? 'bg-status-success/15 text-status-success border border-status-success/30'
                            : req.status === 'In Progress'
                            ? 'bg-accent/15 text-accent border border-accent/30'
                            : 'bg-status-warning/15 text-status-warning border border-status-warning/30'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    {/* Topic */}
                    <h4 className="text-xs font-bold text-text">{req.topic}</h4>

                    {/* Meta line */}
                    <p className="text-[11px] text-text-muted">
                      <strong className="text-text/80">{req.subject}</strong> · To: {req.faculty} · Submitted: {req.submitted}
                    </p>

                    {/* Description quote */}
                    <p className="text-xs text-text-muted bg-card-hover/50 p-2.5 rounded-lg border border-border/50 italic">
                      "{req.description}"
                    </p>

                    {/* Faculty Response if present */}
                    {req.reply && (
                      <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/25 text-xs space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-accent" />
                          <span className="font-bold text-accent">Faculty Response:</span>
                        </div>
                        <p className="text-text">{req.reply}</p>
                        {req.next_step && (
                          <div className="mt-1 text-[11px] text-text-muted flex items-center gap-1">
                            <span className="font-semibold text-accent">Action Step:</span>
                            <span>{req.next_step}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
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
  const { showActionInfo } = useActionInfo();

  return (
    <div className="space-y-6 animate-fade-up">
      <SpecPageHeader
        title="Student Profile"
        semesterChip={s.semester}
        subtitle="Official campus registrar information, academic credentials, and institutional contact"
        sessionText="Registrar Record"
        standingChip={{ text: 'Verified', variant: 'success' }}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                showActionInfo({
                  title: `Official Academic Transcript Export: ${s.name}`,
                  badge: `${s.roll_no} · ${s.semester}`,
                  category: 'export',
                  message: `Official semester marksheet and consolidated grade card generated for ${s.name} (${s.roll_no}). Authenticated with university digital seal.`,
                  details: [
                    `Student: ${s.name}`,
                    `Current CGPA: ${s.cgpa.toFixed(2)}`,
                    `Overall Attendance: ${s.overall_attendance}%`,
                    `Active Backlogs: ${s.backlogs ?? 0}`,
                    `Format: Digital Verifiable Transcript (PDF)`
                  ]
                });
              }}
              className="btn-spec-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Generate Official Transcript"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Transcript</span>
            </button>
            <button
              onClick={() => {
                showActionInfo({
                  title: 'Faculty Mentor Consultation Protocol',
                  badge: 'Dr. Priya Menon',
                  category: 'info',
                  message: 'Your appointed departmental academic mentor is Dr. Priya Menon. Office hours are Tuesday & Thursday 2:00 PM - 4:00 PM in Room 412.',
                  details: [
                    'Mentor: Dr. Priya Menon (Dept of CSE)',
                    'Office Location: Tech Block Room 412',
                    'Contact: priya.menon@campus.edu',
                    'Direct Booking: Dispatched through My Problem Requests tab'
                  ]
                });
              }}
              className="btn-spec-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
              title="Contact Appointed Faculty Mentor"
            >
              <User className="w-3.5 h-3.5" />
              <span>Contact Mentor</span>
            </button>
          </div>
        }
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
  const { showActionInfo } = useActionInfo();

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

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                showActionInfo({
                  title: 'Student Notification Preferences Saved',
                  badge: 'Preferences Synced',
                  category: 'success',
                  message: 'Your automated alert thresholds and AI digest settings have been saved to local preferences.',
                  details: [
                    '75% Attendance Drop Alerts: ENABLED',
                    'Weekly AI Synthesis Notifications: ENABLED',
                    'Placement Drive Qualification Radar: ENABLED',
                    'Delivery Channel: Institutional Email & Portal Toast'
                  ]
                });
              }}
              className="btn-spec-primary text-xs py-2 px-5 cursor-pointer shadow-sm"
              title="Save Student Notification Preferences"
            >
              Save Notification Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
