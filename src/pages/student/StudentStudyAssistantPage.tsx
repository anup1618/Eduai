import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Send, RotateCcw, Copy, Check, Info, Bot, User,
  HelpCircle, Code2, BookOpen, Layers, Terminal, AlertCircle,
  Cpu, Award, MessageSquare, ChevronDown, CheckCircle2, Shield
} from 'lucide-react';
import { useCurrentStudent } from '../../context/CampusDataContext';
import { SpecPageHeader } from '../../components/common/SpecComponents';
import api from '../../services/api';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  subject?: string;
  isCode?: boolean;
}

const SUPPORTED_SUBJECTS = [
  'DBMS',
  'DAA',
  'AI/ML',
  'Computer Networks',
  'Cloud Computing',
  'Theory of Computation',
  'Operating Systems',
  'Software Engineering'
];

const PRESET_QUESTIONS = [
  { label: 'What is DBMS?', query: 'What is DBMS?' },
  { label: 'Explain Normalization in DBMS', query: 'Explain normalization in DBMS.' },
  { label: 'Python Binary Search Program', query: 'Write a Python binary search program.' },
  { label: 'Explain Code Line by Line', query: 'Explain binary search line by line.' },
  { label: '5 MCQs on Normalization', query: 'Give me five MCQs on normalization.' },
  { label: 'Explain in Simpler Words', query: 'Explain normalization in simpler words.' },
];

export function StudentStudyAssistantPage() {
  const currentStudent = useCurrentStudent();
  const studentId = currentStudent?.id || currentStudent?.roll_no || 'STU001';
  const studentName = currentStudent?.name || 'Student';

  const [selectedSubject, setSelectedSubject] = useState<string>('DBMS');
  const [messages, setMessages] = useState<ChatMessageItem[]>(() => {
    try {
      const saved = localStorage.getItem(`edupulse_study_chat_${studentId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}

    // Default welcome message for this student
    return [
      {
        id: 'msg-welcome-0',
        role: 'assistant',
        content: `👋 Hello **${studentName}**! I am your **EduPulse AI Study Assistant** for **Semester ${currentStudent.semester}**.\n\nI can help you with:\n- **Conceptual Explanations & Theory** (e.g. *"What is DBMS?"*)\n- **In-Depth Topic Breakdowns** (e.g. *"Explain normalization in DBMS"*)\n- **Working Code Examples** (e.g. *"Write a Python binary search program"*)\n- **Line-by-Line Code Explanations** (e.g. *"Explain binary search line by line"*)\n- **Topic-Based MCQs & Quizzes** (e.g. *"Give me 5 MCQs on normalization"*)\n- **Simpler Analogies** (e.g. *"Explain it in simple words"*)\n- **3, 5, or 6 Mark University Exam Answers**\n\nSelect your subject from the dropdown above or click any starter prompt below!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: 'DBMS',
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const [aiStatus, setAiStatus] = useState<{
    configured: boolean;
    provider: string;
    model: string;
    mode: string;
    setupInstructions?: string;
  }>({
    configured: false,
    provider: 'none',
    model: 'EduPulse Local Academic Engine v2.0',
    mode: 'offline-academic-engine',
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync messages to student-isolated localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(`edupulse_study_chat_${studentId}`, JSON.stringify(messages));
    } catch (e) {}
  }, [messages, studentId]);

  // Load AI provider status on mount
  useEffect(() => {
    let isMounted = true;
    api.getStudyAiStatus()
      .then(res => {
        if (isMounted && res) {
          setAiStatus({
            configured: Boolean(res.configured),
            provider: res.provider || 'none',
            model: res.model || 'EduPulse Local Academic Engine v2.0',
            mode: res.mode || 'offline-academic-engine',
            setupInstructions: res.setupInstructions,
          });
        }
      })
      .catch(() => {
        // Fallback default
        if (isMounted) {
          setAiStatus({
            configured: false,
            provider: 'none',
            model: 'EduPulse Local Academic Engine v2.0',
            mode: 'offline-academic-engine',
            setupInstructions: 'To activate live AI, set GEMINI_API_KEY in server/.env.',
          });
        }
      });

    return () => { isMounted = false; };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : inputMessage;
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    setErrorMessage(null);
    setInputMessage('');

    const userMsgId = `usr_${Date.now()}`;
    const userMsg: ChatMessageItem = {
      id: userMsgId,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subject: selectedSubject,
    };

    // Update conversation state immediately
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      // Send conversation history to backend
      const res = await api.sendStudyMessage({
        message: trimmed,
        subject: selectedSubject,
        conversationHistory: updatedHistory.map(m => ({
          role: m.role,
          content: m.content,
        })),
        studentId,
        studentName,
      });

      if (res && res.reply) {
        const assistantMsg: ChatMessageItem = {
          id: `ast_${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          subject: res.subject || selectedSubject,
        };
        setMessages(prev => [...prev, assistantMsg]);

        // Update provider status metadata if returned
        if (res.aiProvider) {
          setAiStatus({
            configured: res.aiProvider.configured,
            provider: res.aiProvider.provider,
            model: res.aiProvider.model,
            mode: res.aiProvider.mode,
            setupInstructions: res.aiProvider.setupInstructions,
          });
        }
      }
    } catch (err: any) {
      console.warn('[StudyAssistant] Backend request failed, providing local answer fallback:', err.message);
      // Safe fallback if server is unreachable
      const fallbackReply = generateClientAcademicFallback(trimmed, selectedSubject, updatedHistory);
      const assistantMsg: ChatMessageItem = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: selectedSubject,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Start a fresh conversation? This will clear previous chat context for this session.')) {
      const resetMsg: ChatMessageItem = {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        content: `Conversation reset. Ask any question in **${selectedSubject}** or select another subject!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: selectedSubject,
      };
      setMessages([resetMsg]);
      localStorage.removeItem(`edupulse_study_chat_${studentId}`);
    }
  };

  const handleCopyCode = (content: string, id: string) => {
    try {
      navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {}
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── PAGE HEADER ──────────────────────────────────────────────────────── */}
      <SpecPageHeader
        title="AI Study Assistant"
        semesterChip={currentStudent.semester}
        subtitle="Context-aware engineering tutor with code explanations, normalization, step-by-step algorithms & MCQs"
        sessionText="Engineering Tutor Active"
        standingChip={{ text: selectedSubject, variant: 'accent' }}
      />

      {/* ── TOP CONTROL BAR: SUBJECT SELECTOR & AI STATUS ─────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border">
        {/* Left: Subject selector & Active Student */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-text">Subject:</span>
          </div>

          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="input-spec text-xs py-1.5 px-3 min-w-[190px] font-semibold text-accent border-accent/30 bg-card"
          >
            {SUPPORTED_SUBJECTS.map(sub => (
              <option key={sub} value={sub} className="bg-card text-text">
                {sub}
              </option>
            ))}
          </select>

          <span className="hidden sm:inline-block text-[11px] text-text-muted">
            Logged in as <strong className="text-text">{studentName}</strong> ({studentId})
          </span>
        </div>

        {/* Right: AI Provider Status Badge & Clear Chat Button */}
        <div className="flex items-center gap-2">
          {/* AI Provider Status Pill */}
          <button
            onClick={() => setShowConfigModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              aiStatus.configured
                ? 'bg-status-success/15 border-status-success/30 text-status-success hover:bg-status-success/20'
                : 'bg-status-warning/15 border-status-warning/30 text-status-warning hover:bg-status-warning/20'
            }`}
            title="Click to view AI engine configuration"
          >
            <span className={`w-2 h-2 rounded-full ${aiStatus.configured ? 'bg-status-success animate-pulse' : 'bg-status-warning'}`} />
            <span>
              {aiStatus.configured ? aiStatus.model : 'Offline Academic Engine (Key Not Set)'}
            </span>
            <Info className="w-3.5 h-3.5 opacity-70 ml-0.5" />
          </button>

          {/* New Chat / Reset Button */}
          <button
            onClick={handleClearChat}
            className="btn-spec-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            title="Clear conversation history and start fresh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* ── AI CONFIGURATION INFO BANNER (IF NOT CONFIGURED) ──────────────────── */}
      {!aiStatus.configured && (
        <div className="p-3.5 rounded-2xl bg-status-warning/10 border border-status-warning/25 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text">
                Operating in <span className="text-status-warning font-bold">Offline Academic Engine Mode</span>
              </p>
              <p className="text-text-muted text-[11px] mt-0.5 leading-relaxed">
                The chatbot uses our rich local engineering knowledge base to accurately answer questions on DBMS, Normalization, DAA (Binary search code & line-by-line explanation), Computer Networks, AI/ML, and generate MCQs.
                To unlock live Google Gemini AI, set <code className="px-1 py-0.5 rounded bg-bg border border-border font-mono text-accent">GEMINI_API_KEY</code> in <code className="px-1 py-0.5 rounded bg-bg border border-border font-mono">.env</code>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-2.5 py-1 rounded-lg bg-status-warning/20 text-status-warning font-semibold text-[11px] hover:bg-status-warning/30 whitespace-nowrap"
          >
            Setup Guide
          </button>
        </div>
      )}

      {/* ── QUICK PROMPT CHIPS ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-spec-label text-text-muted flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-accent" />
          <span>Quick Prompts:</span>
        </span>
        {PRESET_QUESTIONS.map((item, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => handleSendMessage(item.query)}
            className="px-3 py-1 rounded-full text-xs bg-card border border-border text-text hover:border-accent hover:text-accent transition-all disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ── CHAT CONTAINER (MAIN WORKSPACE) ─────────────────────────────────── */}
      <div className="spec-card p-0 overflow-hidden flex flex-col h-[600px] border border-border rounded-2xl shadow-spec">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-card/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-tr from-brand-royal to-accent text-accent-contrast shadow-sm'
                    : 'bg-card border border-accent/40 text-accent shadow-sm'
                }`}
              >
                {msg.role === 'user' ? (
                  studentName.slice(0, 2).toUpperCase()
                ) : (
                  <Sparkles className="w-4 h-4 text-accent" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`flex flex-col space-y-1.5 max-w-[88%] sm:max-w-[80%] ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Meta header */}
                <div className="flex items-center gap-2 text-[10px] text-text-muted px-1">
                  <span className="font-semibold text-text">
                    {msg.role === 'user' ? studentName : 'AI Study Assistant'}
                  </span>
                  {msg.subject && (
                    <span className="px-1.5 py-0.2 rounded bg-accent/10 text-accent font-mono text-[9px]">
                      {msg.subject}
                    </span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>

                {/* Content Box */}
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed transition-all ${
                    msg.role === 'user'
                      ? 'bg-accent/20 border border-accent/35 text-text rounded-tr-sm shadow-sm'
                      : 'bg-card border border-border text-text rounded-tl-sm shadow-sm hover:border-accent/40'
                  }`}
                >
                  <FormattedMessageContent
                    content={msg.content}
                    onCopyCode={(code) => handleCopyCode(code, msg.id)}
                    isCopied={copiedId === msg.id}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-lg items-center">
              <div className="w-8 h-8 rounded-full bg-card border border-accent/40 text-accent flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-accent animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-card border border-border rounded-tl-sm flex items-center gap-2 text-xs text-text-muted">
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                <span>Formulating engineering answer...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ── INPUT CONTROL BAR ──────────────────────────────────────────────── */}
        <div className="p-3.5 border-t border-border bg-card/90 backdrop-blur-md">
          {errorMessage && (
            <div className="mb-2 p-2 rounded-xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMessage}
              </span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-status-danger hover:underline text-[10px]"
              >
                Dismiss
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2.5"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                disabled={isLoading}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask any question in ${selectedSubject} (e.g. "What is DBMS?", "Explain normalization in simpler words", "Python binary search program")...`}
                className="input-spec w-full resize-none py-2.5 pl-3.5 pr-10 text-xs min-h-[42px] max-h-32"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="btn-spec-primary py-2.5 px-4 h-[42px] flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-text-muted">
            <span>
              Press <kbd className="px-1 rounded bg-bg border border-border font-mono">Enter</kbd> to send, <kbd className="px-1 rounded bg-bg border border-border font-mono">Shift + Enter</kbd> for newline
            </span>
            <span>
              Session: <strong className="text-text">{selectedSubject}</strong> · Context active ({messages.length} messages)
            </span>
          </div>
        </div>
      </div>

      {/* ── AI SETUP INSTRUCTIONS MODAL ─────────────────────────────────────── */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <h3 className="text-sm font-bold text-text">AI Study Assistant Configuration</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-text-muted hover:text-text text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-text-muted">
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/25">
                <p className="font-semibold text-text">Current Operational Status:</p>
                <p className="mt-1">
                  <strong>Engine:</strong> {aiStatus.model} <br />
                  <strong>Mode:</strong> {aiStatus.configured ? 'Live Generative AI (Cloud Provider)' : 'Offline Academic Knowledge Base'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-text mb-1">How to enable Live Google Gemini AI:</h4>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Get a free Google Gemini API key from <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-accent underline">aistudio.google.com</a>.</li>
                  <li>Open the project's <code className="text-accent font-mono">.env</code> file.</li>
                  <li>Add this line:
                    <pre className="p-2 mt-1 rounded bg-bg border border-border font-mono text-[11px] text-text">GEMINI_API_KEY=AIzaSy...</pre>
                  </li>
                  <li>Restart the server with <code className="text-accent font-mono">npm run dev:all</code>.</li>
                </ol>
              </div>

              <div className="p-2.5 rounded-xl bg-status-success/10 border border-status-success/25 text-status-success text-[11px]">
                <p className="font-semibold">Notice:</p>
                <p>Even without an external API key, the offline academic engine accurately handles all core syllabus questions (DBMS, Normalization, DAA, Binary Search, MCQs, and Line-by-Line explanations) without repetitive generic responses.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="btn-spec-primary text-xs py-1.5 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HELPER COMPONENT FOR FORMATTING MARKDOWN & CODE BLOCKS ───────────────────

function FormattedMessageContent({
  content,
  onCopyCode,
  isCopied,
}: {
  content: string;
  onCopyCode: (code: string) => void;
  isCopied: boolean;
}) {
  // If the content contains code blocks ```...```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const language = lines[0].trim();
          const codeBody = lines.slice(1).join('\n');

          return (
            <div key={index} className="my-2 rounded-xl overflow-hidden border border-border bg-bg/90">
              <div className="flex items-center justify-between px-3 py-1.5 bg-card border-b border-border text-[10px] text-text-muted font-mono">
                <span className="flex items-center gap-1.5 text-accent font-semibold">
                  <Terminal className="w-3 h-3 text-accent" />
                  {language || 'code'}
                </span>
                <button
                  type="button"
                  onClick={() => onCopyCode(codeBody || part.slice(3, -3))}
                  className="flex items-center gap-1 text-text-muted hover:text-accent transition-colors py-0.5 px-1.5 rounded"
                  title="Copy code"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-status-success" />
                      <span className="text-status-success">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-[11px] font-mono leading-relaxed overflow-x-auto text-text">
                <code>{codeBody || lines.join('\n')}</code>
              </pre>
            </div>
          );
        }

        // Render standard text with simple markdown bold, headers, lists
        return (
          <div key={index} className="space-y-1">
            {part.split('\n').map((line, lineIdx) => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return <div key={lineIdx} className="h-1.5" />;

              if (trimmedLine.startsWith('### ')) {
                return (
                  <h4 key={lineIdx} className="text-sm font-bold text-text pt-1 border-b border-border/40 pb-0.5">
                    {trimmedLine.replace('### ', '')}
                  </h4>
                );
              }

              if (trimmedLine.startsWith('#### ')) {
                return (
                  <h5 key={lineIdx} className="text-xs font-bold text-accent pt-1">
                    {trimmedLine.replace('#### ', '')}
                  </h5>
                );
              }

              if (trimmedLine.startsWith('> ')) {
                return (
                  <blockquote key={lineIdx} className="border-l-2 border-accent pl-2.5 py-0.5 text-text-muted italic bg-accent/5 rounded-r">
                    {renderInlineFormatting(trimmedLine.replace('> ', ''))}
                  </blockquote>
                );
              }

              if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                return (
                  <div key={lineIdx} className="flex items-start gap-1.5 pl-1.5">
                    <span className="text-accent text-[10px] mt-0.5">•</span>
                    <span>{renderInlineFormatting(trimmedLine.substring(2))}</span>
                  </div>
                );
              }

              return (
                <p key={lineIdx}>
                  {renderInlineFormatting(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function renderInlineFormatting(text: string) {
  // Simple regex parser for **bold** and `code`
  const elements: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    const codeMatch = remaining.match(/`(.*?)`/);

    if (boldMatch && (!codeMatch || boldMatch.index! < codeMatch.index!)) {
      const idx = boldMatch.index!;
      if (idx > 0) {
        elements.push(remaining.substring(0, idx));
      }
      elements.push(<strong key={keyIdx++} className="font-semibold text-text">{boldMatch[1]}</strong>);
      remaining = remaining.substring(idx + boldMatch[0].length);
    } else if (codeMatch) {
      const idx = codeMatch.index!;
      if (idx > 0) {
        elements.push(remaining.substring(0, idx));
      }
      elements.push(
        <code key={keyIdx++} className="px-1 py-0.2 rounded bg-bg/80 border border-border font-mono text-accent text-[11px]">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.substring(idx + codeMatch[0].length);
    } else {
      elements.push(remaining);
      break;
    }
  }

  return elements;
}

// Client-side fallback generator in case backend is offline on static hosting
function generateClientAcademicFallback(query: string, subject: string, history: ChatMessageItem[]): string {
  const q = query.toLowerCase().trim();
  const prevContext = history.slice(-3).map(m => m.content.toLowerCase()).join(' ');

  if (q.includes('simple words') || q.includes('simpler') || q.includes('simplify')) {
    if (prevContext.includes('normalization') || q.includes('normalization')) {
      return `### 💡 Normalization in Simple Words\n\nImagine a college spreadsheet that repeats a student's full address on every row they borrow a book. If they move, you must update 20 rows (Update Anomaly). If you delete their only borrowed book, you lose their address (Delete Anomaly).\n\n**Normalization** splits that messy sheet into two linked tables: \`Students\` and \`BorrowRecords\`. In short: **Every piece of data belongs in one place, linked by an ID.**`;
    }
    return `### 💡 Simplified Explanation\n\nThink of this concept like an organized filing cabinet: instead of stacking papers into one giant pile, each topic has its own labeled folder, ensuring quick access without confusion or duplicate copies.`;
  }

  if (q.includes('line by line') && (prevContext.includes('binary search') || q.includes('binary search'))) {
    return `### 🔍 Line-by-Line Breakdown of Binary Search\n\n- \`low = 0, high = len(arr) - 1\`: Sets the search boundaries at both ends of the sorted array.\n- \`while low <= high:\`: Loops as long as the search window contains elements.\n- \`mid = low + (high - low) // 2\`: Finds the midpoint safely without integer overflow.\n- \`if arr[mid] == target:\`: Returns \`mid\` immediately if element is found ($O(1)$ best case).\n- \`elif arr[mid] < target: low = mid + 1\`: Target is larger, discard left half.\n- \`else: high = mid - 1\`: Target is smaller, discard right half.\n- \`return -1\`: Target is not in the array.`;
  }

  if (q.includes('binary search') && (q.includes('program') || q.includes('python') || q.includes('code'))) {
    return `### 🐍 Python Binary Search Program\n\n\`\`\`python\ndef binary_search(arr, target):\n    low = 0\n    high = len(arr) - 1\n    while low <= high:\n        mid = low + (high - low) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\n# Example\ndata = [10, 20, 30, 40, 50, 60, 70]\ntarget = 40\nprint("Index:", binary_search(data, target))\n\`\`\`\n\n- **Time Complexity:** $O(\\log n)$\n- **Space Complexity:** $O(1)$`;
  }

  if (q.includes('normalization') || q.includes('normal form')) {
    return `### 🗄️ Normalization in DBMS\n\n**Normalization** minimizes redundancy and prevents insertion, update, and deletion anomalies.\n\n- **1NF:** Atomic values only, no repeating groups.\n- **2NF:** In 1NF + no partial dependency on composite primary keys.\n- **3NF:** In 2NF + no transitive dependency ($A \\to B \\to C$).\n- **BCNF:** Stricter 3NF where every determinant must be a Super Key.`;
  }

  if (q.includes('what is dbms') || q.includes('explain dbms')) {
    return `### 🗄️ Database Management System (DBMS)\n\nA **DBMS** is system software for creating, managing, and querying structured databases.\n\n- **ACID Properties:** Atomicity, Consistency, Isolation, Durability.\n- **Advantages:** Eliminates file-system redundancy, provides concurrency control, secure access, and automatic crash recovery.`;
  }

  return `### 📚 Study Assistant — ${subject}\n\nRegarding: *"${query}"*\n\nThis is a core topic in **${subject}**. You can ask me for:\n- Line-by-line code explanations\n- 5 practice MCQs\n- Explanations in simple words with analogies\n- 3, 5, or 6 mark university exam answers`;
}
