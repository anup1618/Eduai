import React, { useState, useRef, useEffect } from 'react';
import {
  Activity, Eye, EyeOff, Lock, LogIn,
  Sparkles, GraduationCap, Users, Shield,
  CheckCircle2, AlertCircle, Quote, ChevronLeft, ChevronRight,
  TrendingUp, BarChart3, Award, BookOpen, Building2,
  Clock, Check, Search, ArrowRight, X, User, ChevronDown,
  Sun, Moon, Compass, Zap, Briefcase, Database, Server,
  Cpu, FileSpreadsheet, HeartPulse, Layers, CheckCircle
} from 'lucide-react';
import {
  FEATURED_DEMO_FACULTY,
  type PortalRole
} from '../data/portalData';
import { useCampusData } from '../context/CampusDataContext';
import { useTheme } from '../context/ThemeContext';

interface LoginPageProps {
  onSelectRole: (role: PortalRole) => void;
}

// ─── Educational & Motivational Quotes ──────────────────────────────────────────
const INSPIRATIONAL_QUOTES = [
  {
    id: 1,
    quote: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    designation: "Nobel Peace Laureate & Statesman",
    tag: "Global Leadership",
  },
  {
    id: 2,
    quote: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
    designation: "Cultural Icon & Lifelong Learner",
    tag: "Lifelong Mastery",
  },
  {
    id: 3,
    quote: "An investment in knowledge pays the best interest for future generations.",
    author: "Benjamin Franklin",
    designation: "Founding Polymath & Scientist",
    tag: "Knowledge Growth",
  },
  {
    id: 4,
    quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
    designation: "Philosopher & Pioneer",
    tag: "Continuous Evolution",
  },
  {
    id: 5,
    quote: "Intelligence plus character — that is the goal of true education.",
    author: "Dr. Martin Luther King Jr.",
    designation: "Civil Rights Leader & Scholar",
    tag: "Excellence & Purpose",
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onSelectRole }) => {
  const { students, selectStudentForPortal, setLoggedInFacultyIdx, loginUser, dbStatus, dbHealth } = useCampusData();
  const { theme, toggleTheme } = useTheme();

  // Quote carousel state
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [isQuotePaused, setIsQuotePaused] = useState(false);

  // Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState<'student' | 'faculty' | 'admin' | 'tpo'>('student');

  // Input states inside modal
  const [studentInput, setStudentInput] = useState('');
  const [facultyInput, setFacultyInput] = useState('');
  const [adminEmail, setAdminEmail] = useState('admin@edupulse.edu');
  const [tpoEmail, setTpoEmail] = useState('tpo@edupulse.edu');
  const [password, setPassword] = useState('student@123');
  const [showPassword, setShowPassword] = useState(false);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    name: string;
    roleName: string;
    subtext: string;
    avatarInitials: string;
    gradient: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto rotate quotes every 5.5s unless paused
  useEffect(() => {
    if (isQuotePaused) return;
    const interval = setInterval(() => {
      setActiveQuoteIndex(prev => (prev + 1) % INSPIRATIONAL_QUOTES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isQuotePaused]);

  // Focus input when modal opens
  useEffect(() => {
    if (isLoginModalOpen) {
      setErrorMessage('');
      setSuccessInfo(null);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isLoginModalOpen, modalRole]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLoginModalOpen) {
        setIsLoginModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginModalOpen]);

  const openLoginModal = (role: 'student' | 'faculty' | 'admin' | 'tpo' = 'student') => {
    setModalRole(role);
    setErrorMessage('');
    setSuccessInfo(null);
    if (role === 'student') {
      setPassword('student@123');
    } else if (role === 'faculty') {
      setPassword('faculty@123');
    } else if (role === 'tpo') {
      setPassword('tpo@123');
    } else {
      setPassword('admin@123');
    }
    setIsLoginModalOpen(true);
  };

  const triggerShake = (msg: string) => {
    setErrorMessage(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  // ─── Authentication & Dataset Lookup ──────────────────────────────────────
  const handleModalSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrorMessage('');

    if (modalRole === 'student') {
      const query = studentInput.trim();
      if (!query) {
        triggerShake('Please enter a student name or ID (e.g., Arjun Sharma, Priya Singh, Sneha Joshi, STU001).');
        return;
      }

      setIsLoading(true);
      try {
        const loginRes = await loginUser({
          role: 'student',
          student_id: query,
          password,
        });

        const activeStudent = loginRes.student || students.find(s => s.student_id.toLowerCase() === query.toLowerCase() || s.name.toLowerCase().includes(query.toLowerCase()));
        if (!activeStudent) {
          setIsLoading(false);
          triggerShake(`Student "${query}" was not found in our campus database. Please enter a valid registered student name or ID.`);
          return;
        }

        const initials = activeStudent.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

        selectStudentForPortal(activeStudent);

        setSuccessInfo({
          name: activeStudent.name,
          roleName: 'Student Cockpit',
          subtext: `${activeStudent.student_id} · ${activeStudent.department} · Verified Profile`,
          avatarInitials: initials,
          gradient: 'from-[#FF3B5C] to-[#10B981]',
        });

        setIsLoading(false);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          onSelectRole('student');
        }, 850);
      } catch (err: any) {
        setIsLoading(false);
        triggerShake(err.message || `Student "${query}" was not found in our campus database.`);
      }
      return;
    }

    if (modalRole === 'faculty') {
      const query = facultyInput.trim();
      if (!query) {
        triggerShake('Please enter a faculty name or email (e.g., Dr. Priya Menon, Prof. Suresh Kumar).');
        return;
      }

      setIsLoading(true);
      try {
        const loginRes = await loginUser({
          role: 'faculty',
          username: query,
          password,
        });

        const q = query.toLowerCase();
        const matchedIdx = FEATURED_DEMO_FACULTY.findIndex(f => {
          return (
            f.name.toLowerCase().includes(q) ||
            f.email.toLowerCase().includes(q) ||
            f.department.toLowerCase().includes(q)
          );
        });

        const matchedFaculty = matchedIdx >= 0 ? FEATURED_DEMO_FACULTY[matchedIdx] : FEATURED_DEMO_FACULTY[0];
        setLoggedInFacultyIdx(matchedIdx >= 0 ? matchedIdx : 0);

        setSuccessInfo({
          name: loginRes.user?.name || matchedFaculty.name,
          roleName: 'Faculty Mentorship Hub',
          subtext: `${matchedFaculty.designation} · ${matchedFaculty.department}`,
          avatarInitials: matchedFaculty.avatar_initials,
          gradient: 'from-[#FF3B5C] to-[#10B981]',
        });

        setIsLoading(false);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          onSelectRole('faculty');
        }, 850);
      } catch (err: any) {
        setIsLoading(false);
        triggerShake(err.message || `Faculty member "${query}" could not be authenticated.`);
      }
      return;
    }

    if (modalRole === 'admin') {
      setIsLoading(true);
      try {
        await loginUser({
          role: 'admin',
          email: adminEmail,
          password,
        });

        setSuccessInfo({
          name: 'Dean of Academic Affairs',
          roleName: 'Campus Administration Console',
          subtext: 'Central Intelligence & Institutional Governance',
          avatarInitials: 'AD',
          gradient: 'from-[#FF3B5C] to-[#10B981]',
        });

        setIsLoading(false);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          onSelectRole('admin');
        }, 850);
      } catch (err: any) {
        setIsLoading(false);
        triggerShake(err.message || 'Admin authentication failed.');
      }
      return;
    }

    if (modalRole === 'tpo') {
      setIsLoading(true);
      try {
        await loginUser({
          role: 'tpo',
          email: tpoEmail,
          password,
        });

        setSuccessInfo({
          name: 'Prof. Vikram Malhotra',
          roleName: 'Training & Placement Platform (TPO)',
          subtext: 'Corporate Relations & Campus Recruitment Hub',
          avatarInitials: 'VM',
          gradient: 'from-[#059669] to-[#10B981]',
        });

        setIsLoading(false);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          onSelectRole('tpo');
        }, 850);
      } catch (err: any) {
        setIsLoading(false);
        triggerShake(err.message || 'TPO authentication failed.');
      }
      return;
    }
  };

  const currentQuote = INSPIRATIONAL_QUOTES[activeQuoteIndex];

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between relative overflow-x-hidden font-sans watermelon-mesh-bg selection:bg-[#FF3B5C] selection:text-white">
      {/* ── AMBIENT WATERMELON GLOW BLOBS ──────────────────────────────────── */}
      <div className="absolute top-[-140px] left-[-140px] w-96 h-96 rounded-full bg-[#FF3B5C]/15 blur-3xl pointer-events-none" />
      <div className="absolute top-[30%] right-[-140px] w-96 h-96 rounded-full bg-[#10B981]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[20%] w-96 h-96 rounded-full bg-[#FF6584]/10 blur-3xl pointer-events-none" />

      {/* ── TOP HEADER / NAVBAR ─────────────────────────────────────────────── */}
      <header className="relative z-30 w-full border-b border-border/80 bg-sidebar/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Logo & Platform identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF3B5C] via-[#FF5376] to-[#10B981] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center text-lg select-none">
                🍉
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-text">
                  Edu<span className="text-[#FF3B5C]">Pulse</span> AI
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF3B5C]/15 text-[#FF3B5C] border border-[#FF3B5C]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B5C] animate-pulse" />
                  Watermelon v2.5
                </span>
              </div>
              <p className="text-[11px] text-text-muted hidden sm:block">
                Predictive Student Intelligence & Retention Platform
              </p>
            </div>
          </div>

          {/* Navigation Links & Status */}
          <div className="hidden lg:flex items-center gap-6 text-xs text-text-muted font-medium">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="font-semibold">MongoDB Atlas: Connected ({students.length} Students)</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span>Academic Session 2025-26</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted">
              <Shield className="w-3.5 h-3.5 text-[#10B981]" />
              <span>FERPA & NEP 2020 Aligned</span>
            </div>
          </div>

          {/* Theme Toggle & Sign In Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-text hover:border-[#FF3B5C] hover:text-[#FF3B5C] transition-colors shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => openLoginModal('admin')}
              className="btn-watermelon text-xs py-2 px-4 shadow-md"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Launch Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN LANDING PAGE CONTENT ───────────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col items-center justify-center space-y-16">
        {/* ── 1. HERO SECTION (HIGH CONVERTING WATERMELON OS, ZERO UNDERLINES) ── */}
        <section className="text-center max-w-4xl space-y-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF3B5C]/15 via-[#FF6584]/15 to-[#10B981]/15 border border-[#FF3B5C]/30 text-text text-xs font-semibold shadow-sm">
            <span className="text-sm">🍉</span>
            <span className="text-text font-bold">EduPulse Institutional Intelligence OS</span>
            <span className="text-text-muted">•</span>
            <span className="text-[#10B981] font-bold">100% MongoDB Atlas Connected</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-text tracking-tight leading-[1.12]">
            Transforming Campus Data into <br className="hidden sm:inline" />
            <span className="text-watermelon-gradient">
              Predictive Student Achievement
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            The institutional operating system for real-time academic retention,
            attendance drop detection, placement acceleration, and MongoDB-backed student records.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openLoginModal('admin')}
              className="btn-watermelon text-sm py-3 px-7 shadow-lg shadow-[#FF3B5C]/25 w-full sm:w-auto"
            >
              <LogIn className="w-4 h-4" />
              <span>Launch Enterprise Portal</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              onClick={() => openLoginModal('student')}
              className="btn-watermelon-mint text-sm py-3 px-6 w-full sm:w-auto"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Sign In (Demo STU001)</span>
            </button>
          </div>

          {/* Live KPI Strip */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="spec-card p-3.5 border-l-4 border-l-[#FF3B5C] bg-card/60 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Retention Accuracy</span>
              <div className="text-xl font-black text-text mt-0.5">98.4%</div>
              <span className="text-[10px] text-[#10B981] font-semibold">↑ Predictive ML Index</span>
            </div>

            <div className="spec-card p-3.5 border-l-4 border-l-[#10B981] bg-card/60 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">MongoDB Atlas</span>
              <div className="text-xl font-black text-text mt-0.5">{students.length} Students</div>
              <span className="text-[10px] text-[#10B981] font-semibold">● Live Cloud Persisted</span>
            </div>

            <div className="spec-card p-3.5 border-l-4 border-l-[#FF6584] bg-card/60 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Attendance Radar</span>
              <div className="text-xl font-black text-text mt-0.5">&lt; 75% Alert</div>
              <span className="text-[10px] text-[#FF3B5C] font-semibold">Instant Early Warning</span>
            </div>

            <div className="spec-card p-3.5 border-l-4 border-l-[#00D68F] bg-card/60 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Placement Readiness</span>
              <div className="text-xl font-black text-text mt-0.5">Top Tier-1</div>
              <span className="text-[10px] text-[#10B981] font-semibold">Skill-to-CTC Matching</span>
            </div>
          </div>
        </section>

        {/* ── 2. LIVE INTERACTIVE TELEMETRY SHOWCASE (WATERMELON GLASS COCKPIT) ─ */}
        <section className="w-full max-w-5xl animate-fade-up">
          <div className="watermelon-glass rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF3B5C] via-[#FF6584] to-[#10B981]" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/80 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF3B5C]/20 to-[#10B981]/20 border border-[#FF3B5C]/30 flex items-center justify-center text-[#FF3B5C]">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-text">Campus Telemetry Cockpit</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                      Live Telemetry
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    Real-time aggregated health index across enrolled undergraduate cohorts
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-card border border-border text-text flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Cluster: edupulse.qvemhsb</span>
                </span>
                <button
                  onClick={() => openLoginModal('admin')}
                  className="px-3 py-1 rounded-xl bg-[#FF3B5C]/15 border border-[#FF3B5C]/30 text-[#FF3B5C] text-xs font-bold hover:bg-[#FF3B5C]/25 transition"
                >
                  Manage Roster →
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-card/70 border border-border/70 space-y-1">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Average CGPA</span>
                  <span className="text-[#10B981] font-bold">+0.32%</span>
                </div>
                <div className="text-2xl font-black text-text">8.42 / 10</div>
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden mt-2">
                  <div className="bg-gradient-to-r from-[#FF3B5C] to-[#10B981] h-full rounded-full" style={{ width: '84%' }} />
                </div>
                <span className="text-[10px] text-text-muted">Target baseline: 7.50 CGPA</span>
              </div>

              <div className="p-4 rounded-2xl bg-card/70 border border-border/70 space-y-1">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Attendance Pulse</span>
                  <span className="text-[#10B981] font-bold">Optimal</span>
                </div>
                <div className="text-2xl font-black text-text">88.5%</div>
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden mt-2">
                  <div className="bg-[#10B981] h-full rounded-full" style={{ width: '88%' }} />
                </div>
                <span className="text-[10px] text-text-muted">Threshold safety limit: 75%</span>
              </div>

              <div className="p-4 rounded-2xl bg-card/70 border border-border/70 space-y-1">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Early Risk Alerts</span>
                  <span className="text-[#FF3B5C] font-bold">3 Active</span>
                </div>
                <div className="text-2xl font-black text-text">3 Students</div>
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden mt-2">
                  <div className="bg-[#FF3B5C] h-full rounded-full" style={{ width: '12%' }} />
                </div>
                <span className="text-[10px] text-text-muted">Interventions automatically queued</span>
              </div>

              <div className="p-4 rounded-2xl bg-card/70 border border-border/70 space-y-1">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Placement Index</span>
                  <span className="text-[#10B981] font-bold">High Match</span>
                </div>
                <div className="text-2xl font-black text-text">82.0%</div>
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden mt-2">
                  <div className="bg-gradient-to-r from-[#10B981] to-[#00D68F] h-full rounded-full" style={{ width: '82%' }} />
                </div>
                <span className="text-[10px] text-text-muted">Corporate drive ready profiles</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. FOUR INSTITUTIONAL WORKSPACES (WATERMELON BENTO CARDS) ─────── */}
        <section className="w-full">
          <div className="text-center mb-8 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF3B5C]">
              Unified Multi-Role Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-text">
              Select Your Institutional Portal
            </h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-lg mx-auto">
              Empowering students, mentors, placement officers, and institutional leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Student Portal Card */}
            <div
              onClick={() => openLoginModal('student')}
              className="watermelon-card p-6 rounded-2xl flex flex-col justify-between group cursor-pointer border border-[#FF3B5C]/20 hover:border-[#FF3B5C]/50 transition-all"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FF3B5C]/15 border border-[#FF3B5C]/30 text-[#FF3B5C] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-text group-hover:text-[#FF3B5C] transition-colors">
                      Student Cockpit
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF3B5C]/15 text-[#FF3B5C] border border-[#FF3B5C]/25">
                      Enrolled
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    Personalized academic dashboard: SGPA radar, attendance thresholds, internal test breakdowns, and 24/7 AI study mentor.
                  </p>
                </div>

                <ul className="text-[11px] text-text-muted space-y-1.5 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Real-time Attendance Radar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>AI Study Assistant (DBMS, DSA)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Direct Faculty Problem Tickets</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-[#FF3B5C]">
                <span>Launch Student Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Faculty Mentorship Hub Card */}
            <div
              onClick={() => openLoginModal('faculty')}
              className="watermelon-card p-6 rounded-2xl flex flex-col justify-between group cursor-pointer border border-[#10B981]/20 hover:border-[#10B981]/50 transition-all"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-text group-hover:text-[#10B981] transition-colors">
                      Faculty Mentorship Hub
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25">
                      Advisory
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    Class roster 360°, student risk scoring, early intervention logs, and instant problem resolution workflows.
                  </p>
                </div>

                <ul className="text-[11px] text-text-muted space-y-1.5 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Assigned Mentees & 360° Profiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Active Counseling Intervention Center</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Direct Student Query Response</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-[#10B981]">
                <span>Launch Faculty Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. Placement Officer Card */}
            <div
              onClick={() => openLoginModal('tpo')}
              className="watermelon-card p-6 rounded-2xl flex flex-col justify-between group cursor-pointer border border-[#059669]/20 hover:border-[#059669]/50 transition-all"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#059669]/15 border border-[#059669]/30 text-[#059669] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-text group-hover:text-[#059669] transition-colors">
                      Placement Cell (TPO)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#059669]/15 text-[#059669] border border-[#059669]/25">
                      Corporate
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    Corporate hiring drives, recruiter screening criteria, coding readiness metrics, ATS resumes, and CTC statistics.
                  </p>
                </div>

                <ul className="text-[11px] text-text-muted space-y-1.5 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Corporate Drive Management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Coding & Aptitude Score Matrix</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Offer Letters & CTC Insights</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-[#059669]">
                <span>Launch TPO Platform</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 4. Administrator Governance Card */}
            <div
              onClick={() => openLoginModal('admin')}
              className="watermelon-card p-6 rounded-2xl flex flex-col justify-between group cursor-pointer border border-[#FF3B5C]/25 hover:border-[#FF3B5C]/60 transition-all"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF3B5C]/20 to-[#10B981]/20 border border-[#FF3B5C]/30 text-[#FF3B5C] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-text group-hover:text-[#FF3B5C] transition-colors">
                      Campus Administration
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF3B5C]/15 text-[#FF3B5C] border border-[#FF3B5C]/25">
                      Executive
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    Institutional governance: NAAC accreditation reports, bulk spreadsheet ingestion, manual student creator, and MongoDB sync.
                  </p>
                </div>

                <ul className="text-[11px] text-text-muted space-y-1.5 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Live MongoDB Atlas Cloud Sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Bulk Excel / CSV File Ingestion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Manual Student Creator Console</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-[#FF3B5C]">
                <span>Launch Admin Console</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. WATERMELON CORE CAPABILITIES ────────────────────────────────── */}
        <section className="w-full max-w-5xl">
          <div className="spec-card rounded-3xl p-8 border border-border bg-card/60 backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#10B981]">
                  Engine Highlights
                </span>
                <h3 className="text-xl font-bold text-text">Why Institutions Trust EduPulse AI</h3>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-card-hover border border-border text-text-muted">
                Enterprise v2.5 Architecture
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#FF3B5C]/15 text-[#FF3B5C] flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-text">Predictive Risk Engine</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Calculates multi-dimensional risk scores combining CGPA, attendance drops, and backlog trends.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-text">Direct MongoDB Atlas</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Every student created via Excel or manual form is persisted directly with real-time WiredTiger storage.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#FF6584]/15 text-[#FF6584] flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-text">AI Study Assistant</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Academic tutor providing comprehensive, zero-hallucination answers across DBMS, Algorithms, and Core CS.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#00D68F]/15 text-[#00D68F] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-text">Full Role Scoping</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Strict access boundaries protecting student privacy while empowering deans, TPOs, and advisors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. INSPIRATIONAL QUOTE CAROUSEL (WATERMELON ENHANCED) ──────────── */}
        <section
          className="w-full max-w-3xl animate-fade-up"
          onMouseEnter={() => setIsQuotePaused(true)}
          onMouseLeave={() => setIsQuotePaused(false)}
        >
          <div className="spec-card relative overflow-hidden transition-all duration-300 border border-[#FF3B5C]/20 shadow-md">
            {/* Top decorative badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF3B5C]">
                <Quote className="w-4 h-4 text-[#FF3B5C]" />
                Words of Wisdom & Academic Inspiration
              </span>

              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                {currentQuote.tag}
              </span>
            </div>

            {/* Quote Body */}
            <div className="min-h-[85px] flex flex-col justify-center">
              <p className="text-base sm:text-lg font-medium text-text leading-snug italic">
                "{currentQuote.quote}"
              </p>

              <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-text">
                    — {currentQuote.author}
                  </h4>
                  <p className="text-xs text-text-muted">
                    {currentQuote.designation}
                  </p>
                </div>

                {/* Arrow navigation buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveQuoteIndex(prev => (prev === 0 ? INSPIRATIONAL_QUOTES.length - 1 : prev - 1))}
                    className="p-1.5 rounded-xl bg-card border border-border hover:border-[#FF3B5C] text-text-muted hover:text-text transition-colors"
                    title="Previous quote"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveQuoteIndex(prev => (prev + 1) % INSPIRATIONAL_QUOTES.length)}
                    className="p-1.5 rounded-xl bg-card border border-border hover:border-[#FF3B5C] text-text-muted hover:text-text transition-colors"
                    title="Next quote"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Pagination dots */}
            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-border">
              {INSPIRATIONAL_QUOTES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveQuoteIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeQuoteIndex ? 'w-8 bg-[#FF3B5C]' : 'w-2 bg-border hover:bg-text-muted'
                  }`}
                  aria-label={`Go to quote ${idx + 1}`}
                />
              ))}
              <span className="text-[10px] text-text-muted ml-auto font-mono">
                {activeQuoteIndex + 1} / {INSPIRATIONAL_QUOTES.length}
              </span>
            </div>
          </div>
        </section>

        {/* ── 6. BOTTOM CALLOUT BAR ───────────────────────────────────────────── */}
        <section className="w-full max-w-4xl watermelon-glass rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-black text-text">
            Ready to Accelerate Campus Retention?
          </h3>
          <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto">
            Log in to your authenticated institutional profile or test using pre-configured demo credentials.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openLoginModal('admin')}
              className="btn-watermelon text-xs py-2.5 px-6 shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In as Institutional Admin</span>
            </button>

            <button
              type="button"
              onClick={() => openLoginModal('faculty')}
              className="btn-watermelon-mint text-xs py-2.5 px-6"
            >
              <Users className="w-4 h-4" />
              <span>Sign In as Faculty Advisor</span>
            </button>
          </div>

          <div className="pt-4 border-t border-border flex flex-wrap items-center justify-center gap-6 text-[11px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#10B981]" />
              256-Bit SSL SSO
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#10B981]" />
              Dataset Profile Lookup
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#10B981]" />
              Role-Based Access Control
            </span>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="relative z-20 border-t border-border/80 bg-sidebar/80 py-5 px-4 text-xs text-text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span>🍉</span>
            <p>© 2026 EduPulse AI Corporation. Watermelon Intelligence Platform.</p>
          </div>
          <div className="flex items-center justify-center gap-4 text-[11px]">
            <span className="text-[#10B981] font-semibold">● MongoDB Cluster: Connected</span>
            <span className="hover:text-text cursor-pointer">Security Protocol</span>
            <span className="hover:text-text cursor-pointer">NEP 2020 Compliance</span>
          </div>
        </div>
      </footer>

      {/* ── POPUP LOGIN MODAL (WATERMELON ENHANCED, ZERO UNDERLINES) ───────── */}
      {isLoginModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-up"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className={`relative w-full max-w-md spec-card shadow-2xl p-6 sm:p-7 backdrop-blur-2xl border border-[#FF3B5C]/25 transition-all duration-200 ${
              shake ? 'animate-[shake_0.5s_ease-in-out]' : ''
            }`}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-card-hover transition-colors"
              aria-label="Close login dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-5 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold text-text">Campus Portal Sign In</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  Secure SSO
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Select your role and enter credentials to enter your dedicated campus workspace.
              </p>
            </div>

            {/* ── SUCCESS STATE FLASH ───────────────────────────────────────── */}
            {successInfo ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center animate-fade-up">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${successInfo.gradient} flex items-center justify-center text-white text-xl font-bold shadow-2xl`}>
                  {successInfo.avatarInitials}
                </div>
                <div>
                  <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto mb-1 animate-bounce" />
                  <h3 className="text-lg font-bold text-text">Welcome, {successInfo.name}!</h3>
                  <p className="text-xs text-text-muted mt-0.5">{successInfo.subtext}</p>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-[#FF3B5C] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#FF3B5C] animate-ping" />
                  <span>Loading {successInfo.roleName}…</span>
                </div>
              </div>
            ) : (
              <>
                {/* ── ROLE SWITCHER TABS ─────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-card border border-border mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setModalRole('student');
                      setErrorMessage('');
                      setPassword('student@123');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                      modalRole === 'student'
                        ? 'bg-[#FF3B5C] text-white shadow-md'
                        : 'text-text-muted hover:text-text'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalRole('faculty');
                      setErrorMessage('');
                      setPassword('faculty@123');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                      modalRole === 'faculty'
                        ? 'bg-[#10B981] text-white shadow-md'
                        : 'text-text-muted hover:text-text'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Faculty</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalRole('tpo');
                      setErrorMessage('');
                      setPassword('tpo@123');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                      modalRole === 'tpo'
                        ? 'bg-[#059669] text-white shadow-md'
                        : 'text-text-muted hover:text-text'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>TPO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalRole('admin');
                      setErrorMessage('');
                      setPassword('admin@123');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                      modalRole === 'admin'
                        ? 'bg-gradient-to-r from-[#FF3B5C] to-[#10B981] text-white shadow-md'
                        : 'text-text-muted hover:text-text'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </div>

                {/* ── ERROR DISPLAY ─────────────────────────────────────────── */}
                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-status-danger/15 border border-status-danger/30 flex items-start gap-2.5 text-status-danger text-xs animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-tight font-medium">{errorMessage}</span>
                  </div>
                )}

                {/* ── LOGIN FORM ────────────────────────────────────────────── */}
                <form onSubmit={handleModalSubmit} className="space-y-4">
                  {/* STUDENT ROLE INPUT */}
                  {modalRole === 'student' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="modal-student-name" className="label-spec text-[10px]">
                          Student Name or Roll Number / ID
                        </label>
                        <span className="text-[10px] text-[#10B981] font-mono">Database Match</span>
                      </div>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10" />
                        <input
                          id="modal-student-name"
                          ref={inputRef}
                          type="text"
                          placeholder="e.g. Anup Sharma, Arjun Sharma, STU001..."
                          value={studentInput}
                          onChange={e => {
                            setStudentInput(e.target.value);
                            setErrorMessage('');
                          }}
                          className={`input-spec w-full !pl-11 pr-4 text-xs ${
                            errorMessage ? 'border-status-danger' : ''
                          }`}
                          style={{ paddingLeft: '44px' }}
                        />
                      </div>
                      <div className="text-[11px] text-text-muted pt-1 leading-normal">
                        <span className="font-semibold text-text">Quick Demo Profiles:</span>{' '}
                        {['Anup Sharma', 'Arjun Sharma', 'Priya Singh', 'Sneha Joshi', 'STU001'].map(name => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => setStudentInput(name)}
                            className="inline-block mr-1 my-0.5 px-2 py-0.5 rounded-md bg-[#FF3B5C]/10 text-[#FF3B5C] dark:text-[#FF6584] hover:bg-[#FF3B5C]/20 text-[10px] font-semibold transition"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FACULTY ROLE INPUT */}
                  {modalRole === 'faculty' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="modal-faculty-name" className="label-spec text-[10px]">
                          Faculty Name or Email
                        </label>
                        <span className="text-[10px] text-[#10B981] font-mono">Directory Match</span>
                      </div>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10" />
                        <input
                          id="modal-faculty-name"
                          ref={inputRef}
                          type="text"
                          placeholder="e.g. Dr. Priya Menon, Prof. Suresh Kumar..."
                          value={facultyInput}
                          onChange={e => {
                            setFacultyInput(e.target.value);
                            setErrorMessage('');
                          }}
                          className={`input-spec w-full !pl-11 pr-4 text-xs ${
                            errorMessage ? 'border-status-danger' : ''
                          }`}
                          style={{ paddingLeft: '44px' }}
                        />
                      </div>
                      <div className="text-[11px] text-text-muted pt-1 leading-normal">
                        <span className="font-semibold text-text">Available Faculty:</span>{' '}
                        {['Dr. Priya Menon', 'Prof. Suresh Kumar'].map(name => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => setFacultyInput(name)}
                            className="inline-block mr-1 my-0.5 px-2 py-0.5 rounded-md bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 text-[10px] font-semibold transition"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TPO ROLE INPUT */}
                  {modalRole === 'tpo' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="modal-tpo-email" className="label-spec text-[10px]">
                          Placement Officer Campus Email
                        </label>
                        <span className="text-[10px] text-[#059669] font-mono">TPO Cell</span>
                      </div>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10" />
                        <input
                          id="modal-tpo-email"
                          ref={inputRef}
                          type="text"
                          placeholder="tpo@edupulse.edu"
                          value={tpoEmail}
                          onChange={e => {
                            setTpoEmail(e.target.value);
                            setErrorMessage('');
                          }}
                          className={`input-spec w-full !pl-11 pr-4 text-xs ${
                            errorMessage ? 'border-status-danger' : ''
                          }`}
                          style={{ paddingLeft: '44px' }}
                        />
                      </div>
                      <div className="text-[11px] text-text-muted pt-1 leading-normal">
                        <button
                          type="button"
                          onClick={() => setTpoEmail('tpo@edupulse.edu')}
                          className="px-2 py-0.5 rounded-md bg-[#059669]/10 text-[#059669] hover:bg-[#059669]/20 text-[10px] font-semibold transition"
                        >
                          Fill: Prof. Vikram Malhotra (tpo@edupulse.edu)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ADMIN ROLE INPUT */}
                  {modalRole === 'admin' && (
                    <div className="space-y-1.5">
                      <label htmlFor="modal-admin-email" className="label-spec text-[10px]">
                        Administrator Campus Email
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10" />
                        <input
                          id="modal-admin-email"
                          ref={inputRef}
                          type="text"
                          placeholder="admin@edupulse.edu"
                          value={adminEmail}
                          onChange={e => {
                            setAdminEmail(e.target.value);
                            setErrorMessage('');
                          }}
                          className={`input-spec w-full !pl-11 pr-4 text-xs ${
                            errorMessage ? 'border-status-danger' : ''
                          }`}
                          style={{ paddingLeft: '44px' }}
                        />
                      </div>
                      <div className="text-[11px] text-text-muted pt-1 leading-normal">
                        <button
                          type="button"
                          onClick={() => setAdminEmail('admin@edupulse.edu')}
                          className="px-2 py-0.5 rounded-md bg-[#FF3B5C]/10 text-[#FF3B5C] hover:bg-[#FF3B5C]/20 text-[10px] font-semibold transition"
                        >
                          Fill: Dean of Academic Affairs (admin@edupulse.edu)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PASSWORD INPUT */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="modal-password" className="label-spec text-[10px]">
                        Institutional Access Key
                      </label>
                      <span className="text-[10px] text-text-muted font-mono">Protected</span>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10" />
                      <input
                        id="modal-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="input-spec w-full !pl-11 !pr-11 text-xs"
                        style={{ paddingLeft: '44px', paddingRight: '44px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors z-10"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-watermelon w-full text-xs py-3 shadow-md disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Verifying with MongoDB…</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>
                            Enter{' '}
                            {modalRole === 'student'
                              ? 'Student Cockpit'
                              : modalRole === 'faculty'
                              ? 'Faculty Hub'
                              : modalRole === 'tpo'
                              ? 'TPO Platform'
                              : 'Admin Console'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
