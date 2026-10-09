import React, { useState, useRef, useEffect } from 'react';
import {
  Activity, Eye, EyeOff, Lock, LogIn,
  Sparkles, GraduationCap, Users, Shield,
  CheckCircle2, AlertCircle, Quote, ChevronLeft, ChevronRight,
  TrendingUp, BarChart3, Award, BookOpen, Building2,
  Clock, Check, Search, ArrowRight, X, User, ChevronDown
} from 'lucide-react';
import {
  FEATURED_DEMO_FACULTY,
  type PortalRole
} from '../data/portalData';
import { useCampusData } from '../context/CampusDataContext';

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
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: 2,
    quote: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
    designation: "Cultural Icon & Lifelong Learner",
    tag: "Lifelong Mastery",
    color: "from-purple-500 to-indigo-400",
  },
  {
    id: 3,
    quote: "An investment in knowledge pays the best interest for future generations.",
    author: "Benjamin Franklin",
    designation: "Founding Polymath & Scientist",
    tag: "Knowledge Growth",
    color: "from-amber-500 to-orange-400",
  },
  {
    id: 4,
    quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
    designation: "Philosopher & Pioneer",
    tag: "Continuous Evolution",
    color: "from-emerald-500 to-teal-400",
  },
  {
    id: 5,
    quote: "Intelligence plus character — that is the goal of true education.",
    author: "Dr. Martin Luther King Jr.",
    designation: "Civil Rights Leader & Scholar",
    tag: "Excellence & Purpose",
    color: "from-rose-500 to-pink-400",
  },
];

// ─── Background Ambient Floating Particles ─────────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 5) % 100}%`,
  top: `${(i * 23 + 10) % 100}%`,
  size: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5,
  duration: 7 + (i % 5),
  delay: (i * 0.4) % 4,
  opacity: 0.05 + (i % 4) * 0.03,
}));

export const LoginPage: React.FC<LoginPageProps> = ({ onSelectRole }) => {
  const { students, selectStudentForPortal, setLoggedInFacultyIdx } = useCampusData();

  // Quote carousel state
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [isQuotePaused, setIsQuotePaused] = useState(false);

  // Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState<'student' | 'faculty' | 'admin'>('student');

  // Input states inside modal
  const [studentInput, setStudentInput] = useState('');
  const [facultyInput, setFacultyInput] = useState('');
  const [adminEmail, setAdminEmail] = useState('admin@edupulse.edu');
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

  const openLoginModal = (role: 'student' | 'faculty' | 'admin' = 'student') => {
    setModalRole(role);
    setErrorMessage('');
    setSuccessInfo(null);
    if (role === 'student') {
      setPassword('student@123');
    } else if (role === 'faculty') {
      setPassword('faculty@123');
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

  // ─── Core Authentication & Dataset Lookup ──────────────────────────────────────
  const handleModalSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrorMessage('');

    if (modalRole === 'student') {
      const query = studentInput.trim();
      if (!query) {
        triggerShake('Please enter a student name or ID (e.g., Arjun Sharma, Priya Singh, Sneha Joshi, STU001).');
        return;
      }

      const q = query.toLowerCase();

      // Search backend dataset `students` (100 UnifiedStudent records)
      const matchedStudent = students.find(s => {
        const nameLower = s.name.toLowerCase();
        const idLower = s.student_id.toLowerCase();
        const emailLower = s.email.toLowerCase();

        // Exact match by ID, Email, or Full Name
        if (idLower === q || emailLower === q || nameLower === q) return true;

        // Prefix match or sub-string match on Name
        if (nameLower.startsWith(q) || nameLower.includes(q)) return true;

        // Multi-word token match (e.g., "Arjun" matches "Arjun Sharma")
        const tokens = q.split(/\s+/).filter(Boolean);
        if (tokens.length > 0 && tokens.every(token => nameLower.includes(token))) {
          return true;
        }

        return false;
      });

      // Strict validation: if student is NOT present in our dataset, show clear error
      if (!matchedStudent) {
        triggerShake(
          `Student "${query}" was not found in our campus database. Please enter a valid registered student name or ID (e.g. Arjun Sharma, Priya Singh, Sneha Joshi, Dev Chavan, or STU001).`
        );
        return;
      }

      // Found in dataset! Log in as this specific student
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 450));

      selectStudentForPortal(matchedStudent);

      const initials = matchedStudent.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      setSuccessInfo({
        name: matchedStudent.name,
        roleName: 'Student Portal',
        subtext: `${matchedStudent.department} · ${matchedStudent.student_id} · ${matchedStudent.academic_year}`,
        avatarInitials: initials,
        gradient: 'from-blue-600 to-cyan-500',
      });

      setIsLoading(false);

      // Brief confirmation animation before navigating
      setTimeout(() => {
        setIsLoginModalOpen(false);
        onSelectRole('student');
      }, 700);

    } else if (modalRole === 'faculty') {
      const query = facultyInput.trim();
      if (!query) {
        triggerShake('Please enter a faculty member name or ID (e.g., Dr. Priya Menon, Prof. Suresh Kumar, Dr. Anita Bose, Dr. Rajesh Verma).');
        return;
      }

      const q = query.toLowerCase();

      // Search faculty list
      const matchedFaculty = FEATURED_DEMO_FACULTY.find(f => {
        const nameLower = f.name.toLowerCase();
        const emailLower = f.email.toLowerCase();
        const idLower = f.id.toLowerCase();

        if (idLower === q || emailLower === q || nameLower === q) return true;
        if (nameLower.includes(q)) return true;

        const tokens = q.split(/\s+/).filter(Boolean);
        if (tokens.length > 0 && tokens.every(t => nameLower.includes(t))) return true;

        return false;
      });

      if (!matchedFaculty) {
        triggerShake(
          `Faculty member "${query}" not found in institutional directory. Registered faculty include Dr. Priya Menon, Prof. Suresh Kumar, Dr. Anita Bose, Dr. Rajesh Verma.`
        );
        return;
      }

      setIsLoading(true);
      await new Promise(r => setTimeout(r, 450));

      setLoggedInFacultyIdx(matchedFaculty.idx);

      setSuccessInfo({
        name: matchedFaculty.name,
        roleName: 'Faculty Hub',
        subtext: `${matchedFaculty.department} · ${matchedFaculty.designation}`,
        avatarInitials: matchedFaculty.avatar_initials,
        gradient: matchedFaculty.color,
      });

      setIsLoading(false);

      setTimeout(() => {
        setIsLoginModalOpen(false);
        onSelectRole('faculty');
      }, 700);

    } else {
      // Administrator Login
      const emailQ = adminEmail.trim().toLowerCase();
      const passQ = password.trim();

      if (!emailQ.includes('admin') || passQ !== 'admin@123') {
        triggerShake('Invalid administrator credentials. Use admin@edupulse.edu and admin@123.');
        return;
      }

      setIsLoading(true);
      await new Promise(r => setTimeout(r, 450));

      setSuccessInfo({
        name: 'Campus Administrator',
        roleName: 'Governance Portal',
        subtext: 'Executive Analytics & Campus Data Mesh',
        avatarInitials: 'CA',
        gradient: 'from-teal-600 to-emerald-500',
      });

      setIsLoading(false);

      setTimeout(() => {
        setIsLoginModalOpen(false);
        onSelectRole('admin');
      }, 700);
    }
  };

  const currentQuote = INSPIRATIONAL_QUOTES[activeQuoteIndex];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">

      {/* ── Ambient Background Lighting ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[680px] h-[680px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute top-1/3 right-0 w-[550px] h-[550px] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full bg-cyan-600/10 blur-[160px]" />

        {/* High-tech subtle dot-grid mesh */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Ambient floating particles */}
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-cyan-400"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ── TOP HEADER / NAVBAR ─────────────────────────────────────────────── */}
      <header className="relative z-20 w-full border-b border-white/[0.08] bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logo & Platform identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-[0_0_24px_rgba(37,99,235,0.4)]">
              <Activity className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">EduPulse AI</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Institutional
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Campus Intelligence & Student Success Platform</p>
            </div>
          </div>

          {/* Navigation Links & Status */}
          <div className="hidden md:flex items-center gap-6 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Campus Cloud: Online</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Academic Session 2025-26</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>FERPA & NEP 2020 Aligned</span>
            </div>
          </div>

          {/* Top Header Sign In Button */}
          <button
            type="button"
            onClick={() => openLoginModal('student')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white
              bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400
              shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:shadow-[0_0_28px_rgba(37,99,235,0.55)]
              hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* ── MAIN LANDING PAGE CONTENT ───────────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col items-center justify-center space-y-12">

        {/* ── HERO BANNER ───────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-Driven Campus Retention & Academic Excellence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Transforming Campus Data into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              Predictive Student Achievement.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A unified institutional operating system for real-time academic analytics, attendance radar, 
            mentorship counseling, and predictive early-warning advisories.
          </p>
        </div>

        {/* ── MIDDLE SECTION 1: INSPIRATIONAL QUOTE CAROUSEL ─────────────────── */}
        <section 
          className="w-full max-w-3xl"
          onMouseEnter={() => setIsQuotePaused(true)}
          onMouseLeave={() => setIsQuotePaused(false)}
        >
          <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 hover:border-white/20">
            
            {/* Top decorative badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <Quote className="w-4 h-4 fill-cyan-400/20 text-cyan-400" />
                Words of Wisdom & Inspiration
              </span>

              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r ${currentQuote.color} text-white shadow-sm`}>
                {currentQuote.tag}
              </span>
            </div>

            {/* Quote Body */}
            <div className="min-h-[105px] flex flex-col justify-center transition-all duration-300">
              <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-100 leading-snug italic tracking-normal">
                "{currentQuote.quote}"
              </p>
              
              <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    — {currentQuote.author}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {currentQuote.designation}
                  </p>
                </div>

                {/* Arrow navigation buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveQuoteIndex(prev => (prev === 0 ? INSPIRATIONAL_QUOTES.length - 1 : prev - 1))}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Previous quote"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveQuoteIndex(prev => (prev + 1) % INSPIRATIONAL_QUOTES.length)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Next quote"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Pagination dots */}
            <div className="flex items-center gap-1.5 mt-5 pt-4 border-t border-white/[0.06]">
              {INSPIRATIONAL_QUOTES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveQuoteIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeQuoteIndex ? 'w-8 bg-cyan-400' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to quote ${idx + 1}`}
                />
              ))}
              <span className="text-[10px] text-slate-500 ml-auto font-mono">
                {activeQuoteIndex + 1} / {INSPIRATIONAL_QUOTES.length}
              </span>
            </div>
          </div>
        </section>

        {/* ── MIDDLE SECTION 2: INSTITUTIONAL PORTAL OPTIONS ─────────────────── */}
        <section className="w-full">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Select Your Institutional Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
              Choose your role below to launch the dedicated workspace login panel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Student Portal Card */}
            <div
              onClick={() => openLoginModal('student')}
              className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 
                hover:border-cyan-400/50 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Student Portal
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Enrolled
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Access SGPA tracking, real-time attendance thresholds, internal test breakdowns, syllabus progress, and AI study roadmaps.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                <span>Launch Student Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Faculty Mentorship Hub Card */}
            <div
              onClick={() => openLoginModal('faculty')}
              className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 
                hover:border-purple-400/50 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                      Faculty Mentorship Hub
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      Advisory
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Monitor assigned class rosters, early-risk alerts, counseling notes, subject performance matrices, and intervention advisories.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
                <span>Launch Faculty Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. Administrator Governance Center Card */}
            <div
              onClick={() => openLoginModal('admin')}
              className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 
                hover:border-teal-400/50 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-600/20 text-teal-400 border border-teal-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                      Campus Administration
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                      Executive
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Institution-wide retention KPIs, NAAC / NIRF accreditation data, department comparison matrices, and campus governance controls.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-teal-400 group-hover:text-teal-300">
                <span>Launch Admin Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </section>

        {/* ── BOTTOM SECTION: ACTION CALLOUT & PRIMARY LOGIN BUTTON ──────────── */}
        <section className="w-full max-w-3xl rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-slate-900/40 border border-blue-500/20 p-8 text-center backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Ready to Access Your Campus Workspace?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto">
            Click below to open the secure institutional login panel. Authenticate with your enrolled student profile or campus credentials.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openLoginModal('student')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-white
                bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400
                shadow-[0_0_30px_rgba(37,99,235,0.45)] hover:shadow-[0_0_40px_rgba(37,99,235,0.65)]
                hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Institutional Portal</span>
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-cyan-400" />
              256-Bit SSL SSO
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-cyan-400" />
              Dataset Profile Lookup
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-cyan-400" />
              Multi-Role Access Control
            </span>
          </div>
        </section>

      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="relative z-20 border-t border-white/[0.06] bg-black/60 py-4 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© 2026 EduPulse AI Corporation. All rights reserved. Institutional Intelligence Platform.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-slate-300 cursor-pointer">Security Protocol</span>
            <span className="hover:text-slate-300 cursor-pointer">NEP 2020 Compliance</span>
            <span className="hover:text-slate-300 cursor-pointer">Institutional Privacy</span>
          </div>
        </div>
      </footer>

      {/* ── POPUP LOGIN MODAL / PANEL ────────────────────────────────────────── */}
      {isLoginModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className={`relative w-full max-w-md bg-[#0a1128] border border-white/15 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 sm:p-7 backdrop-blur-2xl transition-all duration-200 ${
              shake ? 'animate-[shake_0.5s_ease-in-out]' : ''
            }`}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close login dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing top line */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

            {/* Modal Header */}
            <div className="mb-5 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-black text-white">Campus Portal Login</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Secure SSO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Enter your campus name or roll number to access your portal profile.
              </p>
            </div>

            {/* ── SUCCESS STATE FLASH ───────────────────────────────────────── */}
            {successInfo ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center animate-fadeIn">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${successInfo.gradient} flex items-center justify-center text-white text-xl font-bold shadow-2xl`}>
                  {successInfo.avatarInitials}
                </div>
                <div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1 animate-bounce" />
                  <h3 className="text-lg font-black text-white">Welcome, {successInfo.name}!</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{successInfo.subtext}</p>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-cyan-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Loading {successInfo.roleName}…</span>
                </div>
              </div>
            ) : (
              <>
                {/* ── ROLE SWITCHER TABS ─────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setModalRole('student');
                      setErrorMessage('');
                      setPassword('student@123');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                      modalRole === 'student'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
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
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                      modalRole === 'faculty'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Faculty</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalRole('admin');
                      setErrorMessage('');
                      setPassword('admin@123');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                      modalRole === 'admin'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </div>

                {/* ── FORM FIELDS ────────────────────────────────────────────── */}
                <form onSubmit={handleModalSubmit} noValidate className="space-y-4">
                  
                  {/* STUDENT ROLE INPUT */}
                  {modalRole === 'student' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="modal-student-name" className="text-xs font-semibold text-slate-300">
                          Student Name or Roll Number / ID
                        </label>
                        <span className="text-[10px] text-cyan-400 font-mono">Backend Dataset Search</span>
                      </div>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                          id="modal-student-name"
                          ref={inputRef}
                          type="text"
                          placeholder="e.g. Arjun Sharma, Priya, Sneha, Dev, STU001..."
                          value={studentInput}
                          onChange={e => {
                            setStudentInput(e.target.value);
                            setErrorMessage('');
                          }}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500
                            bg-white/[0.05] border transition-all duration-200 outline-none
                            focus:bg-white/[0.08] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20
                            ${errorMessage ? 'border-red-500/60' : 'border-white/10 hover:border-white/20'}`}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Type any enrolled student name from the database (e.g., <span className="text-cyan-300 font-medium cursor-pointer hover:underline" onClick={() => setStudentInput('Arjun Sharma')}>Arjun Sharma</span>, <span className="text-cyan-300 font-medium cursor-pointer hover:underline" onClick={() => setStudentInput('Priya Singh')}>Priya Singh</span>, <span className="text-cyan-300 font-medium cursor-pointer hover:underline" onClick={() => setStudentInput('Sneha Joshi')}>Sneha Joshi</span>, <span className="text-cyan-300 font-medium cursor-pointer hover:underline" onClick={() => setStudentInput('Rohan Verma')}>Rohan Verma</span>, <span className="text-cyan-300 font-medium cursor-pointer hover:underline" onClick={() => setStudentInput('Aditya Shah')}>Aditya Shah</span>, or <span className="text-cyan-300 font-medium cursor-pointer hover:underline" onClick={() => setStudentInput('Dev Chavan')}>Dev Chavan</span>).
                      </p>
                    </div>
                  )}

                  {/* FACULTY ROLE INPUT */}
                  {modalRole === 'faculty' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="modal-faculty-name" className="text-xs font-semibold text-slate-300">
                          Faculty Name or Email
                        </label>
                        <span className="text-[10px] text-purple-400 font-mono">Directory Match</span>
                      </div>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
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
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500
                            bg-white/[0.05] border transition-all duration-200 outline-none
                            focus:bg-white/[0.08] focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20
                            ${errorMessage ? 'border-red-500/60' : 'border-white/10 hover:border-white/20'}`}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Available faculty: <span className="text-purple-300 font-medium cursor-pointer hover:underline" onClick={() => setFacultyInput('Dr. Priya Menon')}>Dr. Priya Menon</span>, <span className="text-purple-300 font-medium cursor-pointer hover:underline" onClick={() => setFacultyInput('Prof. Suresh Kumar')}>Prof. Suresh Kumar</span>, <span className="text-purple-300 font-medium cursor-pointer hover:underline" onClick={() => setFacultyInput('Dr. Anita Bose')}>Dr. Anita Bose</span>, <span className="text-purple-300 font-medium cursor-pointer hover:underline" onClick={() => setFacultyInput('Dr. Rajesh Verma')}>Dr. Rajesh Verma</span>.
                      </p>
                    </div>
                  )}

                  {/* ADMIN ROLE INPUT */}
                  {modalRole === 'admin' && (
                    <div className="space-y-1.5">
                      <label htmlFor="modal-admin-email" className="text-xs font-semibold text-slate-300">
                        Administrator Campus Email
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
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
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500
                            bg-white/[0.05] border transition-all duration-200 outline-none
                            focus:bg-white/[0.08] focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20
                            ${errorMessage ? 'border-red-500/60' : 'border-white/10 hover:border-white/20'}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="modal-password" className="text-xs font-semibold text-slate-300">
                      Security Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        id="modal-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white placeholder-slate-500
                          bg-white/[0.05] border border-white/10 hover:border-white/20 transition-all outline-none
                          focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Notification Alert */}
                  {errorMessage && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs leading-relaxed animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-red-200">Authentication Error</div>
                        <span>{errorMessage}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-lg mt-2 ${
                      isLoading
                        ? 'bg-blue-700/50 text-blue-300 cursor-not-allowed'
                        : modalRole === 'student'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                        : modalRole === 'faculty'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                        : 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white shadow-[0_0_20px_rgba(13,148,136,0.4)]'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span>Verifying Database…</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to {modalRole === 'student' ? 'Student' : modalRole === 'faculty' ? 'Faculty' : 'Admin'} Portal</span>
                      </>
                    )}
                  </button>

                </form>

                <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    AES-256 Protected
                  </span>
                  <span>EduPulse AI v2.4.0</span>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ── Keyframe Animations ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes float {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-14px) scale(1.08); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15%  { transform: translateX(-6px); }
          30%  { transform: translateX(5px); }
          45%  { transform: translateX(-4px); }
          60%  { transform: translateX(3px); }
          75%  { transform: translateX(-2px); }
          90%  { transform: translateX(1px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

    </div>
  );
};
