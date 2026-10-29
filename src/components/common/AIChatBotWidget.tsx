import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, X, Minimize2, Maximize2, User, ChevronRight,
  GraduationCap, Briefcase, AlertTriangle, CheckCircle2, Shield,
  Award, BookOpen, Clock, RefreshCw, MessageSquare, Phone, Mail,
  ExternalLink, ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { UnifiedStudent } from '../../types/student';
import {
  queryStudentAiAssistant,
  StudentAiResponse,
  StudentDetailCardData,
  StudentSummaryChip
} from '../../engine/studentAiChatEngine';

interface AIChatBotWidgetProps {
  students: UnifiedStudent[];
  context: 'admin' | 'tpo';
  onSelectStudent?: (student: UnifiedStudent) => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  responsePayload?: StudentAiResponse;
}

export const AIChatBotWidget: React.FC<AIChatBotWidgetProps> = ({
  students,
  context,
  onSelectStudent,
  isOpenExternal,
  onCloseExternal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedCardStudentId, setExpandedCardStudentId] = useState<string | null>(null);

  // Sync external open state if provided
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const sampleStudent = students[0] || { name: 'Anup Kumar', student_id: 'STU001' };
    const initialGreeting: ChatMessage = {
      id: 'msg-welcome',
      sender: 'ai',
      text: context === 'tpo'
        ? `👋 **TPO Placement Intelligence Assistant**\n\nAsk me about **any student's placement readiness**, coding score, eligibility, or backlogs. Try: *"Show details for ${sampleStudent.name}"* or *"Tier 1 candidates"*`
        : `👋 **Admin Student Intelligence Assistant**\n\nAsk me for **any student's comprehensive details**, academic records, attendance shortfall, or mentor info. Try: *"Show details for ${sampleStudent.name}"* or *"Attendance below 75%"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responsePayload: {
        replyText: '',
        intent: 'general_help',
        suggestedPrompts: [
          `Details for ${sampleStudent.name} (${sampleStudent.student_id})`,
          context === 'tpo' ? 'Tier 1 placement candidates' : 'Critical academic risk list',
          'Attendance below 75%',
          context === 'tpo' ? 'Top coders (>70)' : 'Students with active backlogs',
        ],
      },
    };
    return [initialGreeting];
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputQuery).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Realistic responsive AI thinking delay
    setTimeout(() => {
      const response = queryStudentAiAssistant(query, students, context);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responsePayload: response,
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);

      if (response.matchedStudent) {
        setExpandedCardStudentId(response.matchedStudent.student.student_id);
      }
    }, 350);
  };

  const handleQuickStudentClick = (studentId: string) => {
    handleSend(`Show full details for ${studentId}`);
  };

  const handleToggleCardExpansion = (studentId: string) => {
    setExpandedCardStudentId(prev => (prev === studentId ? null : studentId));
  };

  const handleClearChat = () => {
    setMessages(prev => [prev[0]]);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseExternal) onCloseExternal();
  };

  return (
    <>
      {/* ── 1. FLOATING LAUNCHER PILL ───────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#FF3B5C] via-[#FF6584] to-[#10B981] text-white shadow-xl shadow-[#FF3B5C]/25 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
          aria-label="Open Student AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white animate-ping" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wide leading-tight">
              {context === 'tpo' ? 'TPO AI Assistant' : 'Student AI Chatbot'}
            </span>
            <span className="text-[10px] text-white/80 font-medium leading-none">
              Instant Student Intelligence
            </span>
          </div>
        </button>
      )}

      {/* ── 2. FLOATING CHAT WINDOW ─────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={`fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 bg-card border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-fade-up ${
            isExpanded
              ? 'w-[94vw] sm:w-[720px] h-[88vh]'
              : 'w-[92vw] sm:w-[460px] h-[640px] max-h-[88vh]'
          }`}
          style={{ backdropFilter: 'blur(20px)' }}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#FF3B5C]/15 via-[#FF6584]/10 to-[#10B981]/15 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF3B5C] to-[#10B981] text-white flex items-center justify-center shadow-md shadow-[#FF3B5C]/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-text">
                    {context === 'tpo' ? 'TPO Career & Student AI' : 'Campus Student AI Assistant'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                    Live Telemetry
                  </span>
                </div>
                <p className="text-[10px] text-text-muted">
                  Query any student record, attendance, marks, or placement
                </p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-card transition"
                title="Reset Chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-card transition hidden sm:inline-flex"
                title={isExpanded ? 'Restore Size' : 'Expand View'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 text-text-muted hover:text-status-danger rounded-lg hover:bg-card transition"
                title="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Filter Strip */}
          <div className="px-3.5 py-2 bg-card-hover/40 border-b border-border/50 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            <span className="text-[10px] uppercase font-bold text-text-muted flex-shrink-0">
              Quick Queries:
            </span>
            {[
              { label: 'STU001', query: 'Show details for STU001' },
              { label: 'Attendance <75%', query: 'Students with attendance below 75%' },
              { label: context === 'tpo' ? 'Tier 1 Dream' : 'Critical Risk', query: context === 'tpo' ? 'Show Tier 1 placement candidates' : 'Show critical risk students' },
              { label: 'Backlogs', query: 'List students with backlogs' },
              { label: 'CSE Dept', query: 'Overview of Computer Science students' },
            ].map(pill => (
              <button
                key={pill.label}
                onClick={() => handleSend(pill.query)}
                className="px-2.5 py-1 rounded-full bg-card border border-border hover:border-[#FF3B5C]/50 hover:text-[#FF3B5C] text-text-muted text-[10px] font-semibold whitespace-nowrap transition flex-shrink-0"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                {/* Message Header */}
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted px-1">
                  <span>{msg.sender === 'user' ? 'You' : 'EduPulse AI'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[95%] sm:max-w-[88%] shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#FF3B5C] to-[#FF6584] text-white rounded-tr-none'
                      : 'bg-card border border-border text-text rounded-tl-none space-y-3'
                  }`}
                >
                  {/* Formatted Text Content */}
                  <div className="whitespace-pre-line font-normal">
                    {msg.text}
                  </div>

                  {/* ── EMBEDDED STUDENT DETAIL CARD ─────────────────────── */}
                  {msg.responsePayload?.matchedStudent && (
                    <StudentRichDetailCard
                      data={msg.responsePayload.matchedStudent}
                      isExpanded={expandedCardStudentId === msg.responsePayload.matchedStudent.student.student_id}
                      onToggleExpand={() => handleToggleCardExpansion(msg.responsePayload!.matchedStudent!.student.student_id)}
                      onSelectStudent={onSelectStudent}
                      context={context}
                    />
                  )}

                  {/* ── EMBEDDED STUDENT COHORT LIST ─────────────────────── */}
                  {msg.responsePayload?.matchedStudentsList && msg.responsePayload.matchedStudentsList.length > 0 && (
                    <div className="pt-2 space-y-2 border-t border-border/60">
                      <div className="text-[11px] font-bold text-text flex items-center justify-between">
                        <span>Cohort Roster ({msg.responsePayload.matchedStudentsList.length} shown)</span>
                        <span className="text-[10px] text-text-muted">Click student to inspect</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.responsePayload.matchedStudentsList.map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleQuickStudentClick(item.id)}
                            className="p-2.5 rounded-xl bg-card-hover border border-border/80 hover:border-[#10B981] flex items-center justify-between text-left group transition-all"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-[11px] font-bold text-text group-hover:text-[#10B981] truncate">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-text-muted truncate">
                                {item.id} · {item.dept}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-[11px] font-mono font-bold text-text">
                                {item.cgpa.toFixed(2)} CGPA
                              </div>
                              <div className={`text-[10px] font-semibold ${item.attendance < 75 ? 'text-[#FF3B5C]' : 'text-[#10B981]'}`}>
                                {item.attendance}% Att.
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── EMBEDDED ANALYTICAL METRICS TILES ────────────────── */}
                  {msg.responsePayload?.metrics && msg.responsePayload.metrics.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-border/50">
                      {msg.responsePayload.metrics.map(metric => (
                        <div key={metric.label} className="p-2 rounded-xl bg-bg/70 border border-border/60">
                          <div className="text-[9px] uppercase tracking-wider font-bold text-text-muted truncate">
                            {metric.label}
                          </div>
                          <div className="text-sm font-black text-text mt-0.5">
                            {metric.value}
                          </div>
                          {metric.sublabel && (
                            <div className="text-[9px] text-[#10B981] font-medium truncate">
                              {metric.sublabel}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── ACTION LINK BUTTON ──────────────────────────────── */}
                  {msg.responsePayload?.actionLink && (
                    <div className="pt-2 border-t border-border/50">
                      <button
                        onClick={() => {
                          if (msg.responsePayload?.matchedStudent && onSelectStudent) {
                            onSelectStudent(msg.responsePayload.matchedStudent.student);
                          }
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#FF3B5C]/15 to-[#10B981]/15 border border-[#FF3B5C]/30 text-text hover:border-[#FF3B5C] font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <User className="w-3.5 h-3.5 text-[#FF3B5C]" />
                        <span>{msg.responsePayload.actionLink.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-text-muted" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Suggested prompt chips below AI reply */}
                {msg.responsePayload?.suggestedPrompts && (
                  <div className="flex flex-wrap gap-1.5 pt-1 pl-1 max-w-[95%]">
                    {msg.responsePayload.suggestedPrompts.map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => handleSend(prompt)}
                        className="px-2.5 py-1 rounded-full bg-card border border-border hover:border-[#10B981] hover:text-[#10B981] text-[10px] text-text-muted transition flex items-center gap-1"
                      >
                        <span>{prompt}</span>
                        <ChevronRight className="w-2.5 h-2.5 opacity-50" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-2xl w-28 text-xs text-text-muted">
                <span className="w-2 h-2 rounded-full bg-[#FF3B5C] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#FF6584] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-card border-t border-border">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  placeholder={
                    context === 'tpo'
                      ? 'Ask student name, ID (STU001), tier, coding score...'
                      : 'Ask student name, STU001, attendance, backlogs, CGPA...'
                  }
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-bg border border-border rounded-xl text-text placeholder-text-muted focus:outline-none focus:border-[#FF3B5C] focus:ring-1 focus:ring-[#FF3B5C]"
                />
              </div>

              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF3B5C] to-[#10B981] text-white hover:opacity-90 disabled:opacity-40 transition-opacity shadow-sm flex-shrink-0"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// ─── RICH STUDENT DETAIL CARD (EMBEDDED INSIDE AI RESPONSE) ───────────────────

interface StudentRichDetailCardProps {
  data: StudentDetailCardData;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelectStudent?: (student: UnifiedStudent) => void;
  context: 'admin' | 'tpo';
}

const StudentRichDetailCard: React.FC<StudentRichDetailCardProps> = ({
  data,
  isExpanded,
  onToggleExpand,
  onSelectStudent,
  context,
}) => {
  const { student, portalData } = data;

  return (
    <div className="p-3.5 rounded-2xl bg-bg/90 border border-border/80 shadow-md space-y-3">
      {/* Student Identity Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF3B5C] to-[#10B981] text-white font-black text-sm flex items-center justify-center shadow-md">
            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-text">{student.name}</h4>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-card border border-border text-text-muted">
                {student.student_id}
              </span>
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">
              {student.department} · {student.semester}
            </div>
          </div>
        </div>

        {/* Attendance & Tier Badges */}
        <div className="flex flex-col items-end gap-1">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              data.attendanceStatus === 'Critical'
                ? 'bg-status-danger/15 text-status-danger border-status-danger/30'
                : data.attendanceStatus === 'Warning'
                ? 'bg-status-warning/15 text-status-warning border-status-warning/30'
                : 'bg-status-success/15 text-status-success border-status-success/30'
            }`}
          >
            {data.overallAttendance}% Attendance
          </span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
            {data.placementTier}
          </span>
        </div>
      </div>

      {/* Primary KPI Metrics 4-Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded-xl bg-card border border-border/60">
          <span className="text-[9px] uppercase tracking-wider font-bold text-text-muted">CGPA</span>
          <div className="text-base font-black text-text mt-0.5">
            {data.cgpa.toFixed(2)}
          </div>
          <span className="text-[9px] text-text-muted">Scale 10.0</span>
        </div>

        <div className="p-2 rounded-xl bg-card border border-border/60">
          <span className="text-[9px] uppercase tracking-wider font-bold text-text-muted">Backlogs</span>
          <div className={`text-base font-black mt-0.5 ${data.backlogs > 0 ? 'text-[#FF3B5C]' : 'text-[#10B981]'}`}>
            {data.backlogs}
          </div>
          <span className="text-[9px] text-text-muted">{data.backlogs === 0 ? 'Clean Record' : 'Active Arrears'}</span>
        </div>

        <div className="p-2 rounded-xl bg-card border border-border/60">
          <span className="text-[9px] uppercase tracking-wider font-bold text-text-muted">Coding Score</span>
          <div className="text-base font-black text-text mt-0.5">
            {data.codingScore}/100
          </div>
          <span className="text-[9px] text-[#10B981]">Practical DSA</span>
        </div>

        <div className="p-2 rounded-xl bg-card border border-border/60">
          <span className="text-[9px] uppercase tracking-wider font-bold text-text-muted">Resume ATS</span>
          <div className="text-base font-black text-[#10B981] mt-0.5">
            {data.atsResumeScore}%
          </div>
          <span className="text-[9px] text-text-muted">Recruiter Fit</span>
        </div>
      </div>

      {/* Accordion Toggle for Detailed Breakdown */}
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full py-1.5 px-2.5 rounded-xl bg-card border border-border hover:bg-card-hover flex items-center justify-between text-[11px] font-semibold text-text-muted hover:text-text transition"
      >
        <span>{isExpanded ? 'Hide Full Breakdown' : 'Show Complete Academic, Placement & Mentor Breakdown'}</span>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Expandable Tabs */}
      {isExpanded && (
        <div className="pt-2 border-t border-border/60 space-y-3 text-xs animate-fade-down">
          {/* Section A: Academic Courses */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#FF3B5C]">Subject Telemetry</span>
            <div className="space-y-1.5 pt-1">
              {portalData.subjects.slice(0, 3).map(sub => (
                <div key={sub.code} className="p-2 rounded-lg bg-card border border-border flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-semibold text-text">{sub.name}</span>
                    <span className="text-[10px] text-text-muted ml-1.5">({sub.code})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-text-muted">Internal: <strong className="text-text">{sub.internal_pct}%</strong></span>
                    <span className="font-semibold text-text px-1.5 py-0.5 rounded bg-bg border border-border text-[10px]">
                      Grade {sub.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Placement Drives & Eligibility */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#10B981]">
              Eligible Campus Drives ({data.eligibleDrives.length})
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.eligibleDrives.slice(0, 4).map(drive => (
                <span
                  key={drive}
                  className="px-2 py-0.5 rounded-md bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25 text-[10px] font-semibold"
                >
                  ✓ {drive}
                </span>
              ))}
            </div>
          </div>

          {/* Section C: Mentorship & Contact Details */}
          <div className="p-2.5 rounded-xl bg-card border border-border space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Faculty Mentor:</span>
              <span className="font-bold text-text">{data.mentorName} ({data.mentorDept})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Mentor Email:</span>
              <span className="text-[#10B981] font-mono">{data.mentorEmail}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Student Email:</span>
              <span className="text-text font-mono">{student.email}</span>
            </div>
          </div>
        </div>
      )}

      {/* Direct Click-Through to 360 Dossier / Drawer */}
      {onSelectStudent && (
        <button
          onClick={() => onSelectStudent(student)}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#FF3B5C] to-[#10B981] text-white hover:opacity-95 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>
            {context === 'tpo' ? 'Open Student Placement Dossier' : 'Open Complete 360° Profile'}
          </span>
        </button>
      )}
    </div>
  );
};

