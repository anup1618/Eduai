import React, { useState, useRef, useEffect } from 'react';
import {
  Activity, Eye, EyeOff, Lock, LogIn,
  Sparkles, GraduationCap, Users, Shield,
  CheckCircle2, AlertCircle, Quote, ChevronLeft, ChevronRight,
  TrendingUp, BarChart3, Award, BookOpen, Building2,
  Clock, Check, Search, ArrowRight, X, User, ChevronDown,
  Sun, Moon, Compass, Zap, Briefcase
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
    color: "from-brand-royal to-accent",
  },
  {
    id: 2,
    quote: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
    designation: "Cultural Icon & Lifelong Learner",
    tag: "Lifelong Mastery",
    color: "from-accent to-brand-royal",
  },
  {
    id: 3,
    quote: "An investment in knowledge pays the best interest for future generations.",
    author: "Benjamin Franklin",
    designation: "Founding Polymath & Scientist",
    tag: "Knowledge Growth",
    color: "from-brand-royal to-accent",
  },
  {
    id: 4,
    quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
    designation: "Philosopher & Pioneer",
    tag: "Continuous Evolution",
    color: "from-accent to-brand-royal",
  },
  {
    id: 5,
    quote: "Intelligence plus character — that is the goal of true education.",
    author: "Dr. Martin Luther King Jr.",
    designation: "Civil Rights Leader & Scholar",
    tag: "Excellence & Purpose",
    color: "from-brand-royal to-accent",
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onSelectRole }) => {
  const { students, selectStudentForPortal, setLoggedInFacultyIdx, loginUser } = useCampusData();
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

  // Spotlight and Parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroCardRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Mouse move handler for tilt & spotlight
  const handleMouseMove = (e: React.MouseEvent) => {
    // Check if touch device / mobile
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const { clientX, clientY } = e;
    setMousePos({ x: clientX, y: clientY });
  };

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
          roleName: 'Student Portal (Protected Session)',
          subtext: `${activeStudent.student_id} · ${activeStudent.department} · Private Academic Record`,
          avatarInitials: initials,
          gradient: 'from-brand-royal to-accent',
        });

        setIsLoading(false);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          onSelectRole('student');
        }, 950);
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
          gradient: 'from-brand-royal to-accent',
        });

        setIsLoading(false);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          onSelectRole('faculty');
        }, 950);
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
          roleName: 'Campus Administration (Full Access)',
          subtext: 'Central Intelligence & Institutional Governance',
          avatarInitials: 'AD',
          gradient: 'from-brand-royal to-accent',
        });

        setIsLoading(false);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          onSelectRole('admin');
        }, 950);
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
          roleName: 'Training & Placement Officer (TPO)',
          subtext: 'Corporate Relations & Campus Recruitment Hub',
          avatarInitials: 'VM',
          gradient: 'from-amber-600 to-orange-500',
        });

        setIsLoading(false);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          onSelectRole('tpo');
        }, 950);
      } catch (err: any) {
        setIsLoading(false);
        triggerShake(err.message || 'TPO authentication failed.');
      }
      return;
    }
  };

  const currentQuote = INSPIRATIONAL_QUOTES[activeQuoteIndex];

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-bg text-text flex flex-col justify-between selection:bg-accent selection:text-accent-contrast relative overflow-x-hidden font-sans"
    >
      {/* ── TOP HEADER / NAVBAR ─────────────────────────────────────────────── */}
      <header className="relative z-20 w-full border-b border-border bg-sidebar/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Logo & Platform identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-sm">
              <Activity className="w-5 h-5 text-accent stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-text">EduPulse AI</span>
                <span className="text-[10px] uppercase font-bold tracking-spec-label px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                  Institutional OS
                </span>
              </div>
              <p className="text-[11px] text-text-muted hidden sm:block">
                Predictive Student Retention & Academic Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Links & Status */}
          <div className="hidden md:flex items-center gap-6 text-xs text-text-muted font-medium">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-status-success/15 border border-status-success/30 text-status-success">
              <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
              <span className="font-semibold">Campus Cloud: Online</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span>Academic Session 2025-26</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted">
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span>FERPA & NEP Aligned</span>
            </div>
          </div>

          {/* Theme Toggle & Sign In Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-text hover:border-accent hover:text-accent transition-colors shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => openLoginModal('student')}
              className="btn-spec-primary text-xs py-2 px-4"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Launch Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN LANDING PAGE CONTENT ───────────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col items-center justify-center space-y-12">
        {/* ── HERO BANNER ───────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl space-y-4 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/12 border border-accent/25 text-accent text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>AI-Driven Retention & Academic Excellence Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-text tracking-tight leading-[1.14]">
            Transforming Campus Data into <br className="hidden sm:inline" />
            <span className="text-accent underline decoration-accent/30 decoration-wavy decoration-2">
              Predictive Student Achievement.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
            A unified institutional operating system for real-time academic analytics, attendance radar,
            mentorship counseling, and predictive early-warning advisories.
          </p>
        </div>

        {/* ── INSPIRATIONAL QUOTE CAROUSEL ───────────────────────────────────── */}
        <section
          className="w-full max-w-3xl animate-fade-up"
          onMouseEnter={() => setIsQuotePaused(true)}
          onMouseLeave={() => setIsQuotePaused(false)}
        >
          <div className="spec-card relative overflow-hidden transition-all duration-300">
            {/* Top decorative badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-spec-label text-accent">
                <Quote className="w-4 h-4 text-accent" />
                Words of Wisdom & Inspiration
              </span>

              <span className="text-[10px] font-bold uppercase tracking-spec-label px-3 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                {currentQuote.tag}
              </span>
            </div>

            {/* Quote Body */}
            <div className="min-h-[95px] flex flex-col justify-center">
              <p className="text-base sm:text-lg md:text-xl font-medium text-text leading-snug italic">
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
                    className="p-1.5 rounded-xl bg-card border border-border hover:border-accent text-text-muted hover:text-text transition-colors"
                    title="Previous quote"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveQuoteIndex(prev => (prev + 1) % INSPIRATIONAL_QUOTES.length)}
                    className="p-1.5 rounded-xl bg-card border border-border hover:border-accent text-text-muted hover:text-text transition-colors"
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
                    idx === activeQuoteIndex ? 'w-8 bg-accent' : 'w-2 bg-border hover:bg-text-muted'
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

        {/* ── INSTITUTIONAL PORTAL OPTIONS (12-COL BENTO) ────────────────────── */}
        <section className="w-full">
          <div className="text-center mb-8">
            <h2 className="title-page text-2xl sm:text-3xl">
              Select Your Institutional Portal
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-lg mx-auto">
              Choose your role below to launch the dedicated workspace login panel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Student Portal Card */}
            <div
              onClick={() => openLoginModal('student')}
              className="spec-card flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-text group-hover:text-accent transition-colors">
                      Student Cockpit
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                      Enrolled
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    Access SGPA tracking, real-time attendance thresholds, internal test breakdowns, syllabus progress, and AI study roadmaps.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-accent">
                <span>Launch Student Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Faculty Mentorship Hub Card */}
            <div
              onClick={() => openLoginModal('faculty')}
              className="spec-card flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-text group-hover:text-accent transition-colors">
                      Faculty Mentorship Hub
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-warning/15 text-status-warning border border-status-warning/25">
                      Advisory
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    Monitor assigned class rosters, early-risk alerts, counseling notes, subject performance matrices, and intervention advisories.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-accent">
                <span>Launch Faculty Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. Training & Placement Officer (TPO) Card */}
            <div
              onClick={() => openLoginModal('tpo')}
              className="spec-card flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-text group-hover:text-accent transition-colors">
                      Placement Cell (TPO)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Corporate
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    Manage corporate recruitment drives, recruiter screening criteria, student coding readiness, ATS resumes, and CTC analytics.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-accent">
                <span>Launch TPO Platform</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 4. Administrator Governance Center Card */}
            <div
              onClick={() => openLoginModal('admin')}
              className="spec-card flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-text group-hover:text-accent transition-colors">
                      Campus Administration
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-success/15 text-status-success border border-status-success/25">
                      Executive
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    Institution-wide retention KPIs, NAAC / NIRF accreditation data, department comparison matrices, and campus governance controls.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-accent">
                <span>Launch Admin Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* ── BOTTOM SECTION: ACTION CALLOUT ─────────────────────────────────── */}
        <section className="w-full max-w-3xl spec-card text-center">
          <h3 className="text-xl font-bold text-text tracking-tight">
            Ready to Access Your Campus Workspace?
          </h3>
          <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-xl mx-auto">
            Click below to open the secure institutional login panel. Authenticate with your enrolled student profile or campus credentials.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openLoginModal('student')}
              className="btn-spec-primary text-sm py-3 px-8"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Institutional Portal</span>
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center justify-center gap-6 text-[11px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-accent" />
              256-Bit SSL SSO
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-accent" />
              Dataset Profile Lookup
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-accent" />
              Multi-Role Access Control
            </span>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="relative z-20 border-t border-border bg-sidebar/60 py-4 px-4 text-xs text-text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© 2026 EduPulse AI Corporation. All rights reserved. Institutional Intelligence Platform.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-text cursor-pointer">Security Protocol</span>
            <span className="hover:text-text cursor-pointer">NEP 2020 Compliance</span>
            <span className="hover:text-text cursor-pointer">Institutional Privacy</span>
          </div>
        </div>
      </footer>

      {/* ── POPUP LOGIN MODAL (DESIGN SPEC) ─────────────────────────────────── */}
      {isLoginModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-up"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className={`relative w-full max-w-md spec-card shadow-spec-hover p-6 sm:p-7 backdrop-blur-2xl transition-all duration-200 ${
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
                <span className="text-xl font-bold text-text">Campus Portal Login</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                  Secure SSO
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Enter your campus name or roll number to access your portal profile.
              </p>
            </div>

            {/* ── SUCCESS STATE FLASH ───────────────────────────────────────── */}
            {successInfo ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center animate-fade-up">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${successInfo.gradient} flex items-center justify-center text-accent-contrast text-xl font-bold shadow-2xl`}>
                  {successInfo.avatarInitials}
                </div>
                <div>
                  <CheckCircle2 className="w-8 h-8 text-status-success mx-auto mb-1 animate-bounce" />
                  <h3 className="text-lg font-bold text-text">Welcome, {successInfo.name}!</h3>
                  <p className="text-xs text-text-muted mt-0.5">{successInfo.subtext}</p>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-accent font-semibold">
                  <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
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
                        ? 'btn-spec-primary py-1.5 text-xs'
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
                        ? 'btn-spec-primary py-1.5 text-xs'
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
                        ? 'btn-spec-primary py-1.5 text-xs'
                        : 'text-text-muted hover:text-text'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>TPO Cell</span>
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
                        ? 'btn-spec-primary py-1.5 text-xs'
                        : 'text-text-muted hover:text-text'
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
                        <label htmlFor="modal-student-name" className="label-spec text-[10px]">
                          Student Name or Roll Number / ID
                        </label>
                        <span className="text-[10px] text-accent font-mono">Database Match</span>
                      </div>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                        <input
                          id="modal-student-name"
                          ref={inputRef}
                          type="text"
                          placeholder="e.g. Arjun Sharma, Priya, Sneha, STU001..."
                          value={studentInput}
                          onChange={e => {
                            setStudentInput(e.target.value);
                            setErrorMessage('');
                          }}
                          className={`input-spec w-full pl-10 pr-4 text-xs ${
                            errorMessage ? 'border-status-danger' : ''
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-text-muted leading-tight">
                        Demo profiles: <span className="text-accent font-semibold cursor-pointer hover:underline" onClick={() => setStudentInput('Arjun Sharma')}>Arjun Sharma</span>, <span className="text-accent font-semibold cursor-pointer hover:underline" onClick={() => setStudentInput('Priya Singh')}>Priya Singh</span>, <span className="text-accent font-semibold cursor-pointer hover:underline" onClick={() => setStudentInput('Sneha Joshi')}>Sneha Joshi</span>, or <span className="text-accent font-semibold cursor-pointer hover:underline" onClick={() => setStudentInput('Dev Chavan')}>Dev Chavan</span>.
                      </p>
                    </div>
                  )}

                  {/* FACULTY ROLE INPUT */}
                  {modalRole === 'faculty' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="modal-faculty-name" className="label-spec text-[10px]">
                          Faculty Name or Email
                        </label>
                        <span className="text-[10px] text-accent font-mono">Directory Match</span>
                      </div>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
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
                          className={`input-spec w-full pl-10 pr-4 text-xs ${
                            errorMessage ? 'border-status-danger' : ''
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-text-muted leading-tight">
                        Available faculty: <span className="text-accent font-semibold cursor-pointer hover:underline" onClick={() => setFacultyInput('Dr. Priya Menon')}>Dr. Priya Menon</span>, <span className="text-accent font-semibold cursor-pointer hover:underline" onClick={() => setFacultyInput('Prof. Suresh Kumar')}>Prof. Suresh Kumar</span>.
                      </p>
                    </div>
                  )}

                  {/* TPO ROLE INPUT */}
                  {modalRole === 'tpo' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="modal-tpo-email" className="label-spec text-[10px]">
                          Placement Officer Campus Email
                        </label>
                        <span className="text-[10px] text-accent font-mono">TPO Cell</span>
                      </div>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
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
                          className={`input-spec w-full pl-10 pr-4 text-xs ${
                            errorMessage ? 'border-status-danger' : ''
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-text-muted leading-tight">
                        Demo Account: <span className="text-accent font-semibold cursor-pointer hover:underline" onClick={() => setTpoEmail('tpo@edupulse.edu')}>Prof. Vikram Malhotra (tpo@edupulse.edu)</span> · Password: <code className="text-accent font-mono">tpo@123</code>.
                      </p>
                    </div>
                  )}

                  {/* ADMIN ROLE INPUT */}
                  {modalRole === 'admin' && (
                    <div className="space-y-1.5">
                      <label htmlFor="modal-admin-email" className="label-spec text-[10px]">
                        Administrator Campus Email
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
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
                          className={`input-spec w-full pl-10 pr-4 text-xs ${
                            errorMessage ? 'border-status-danger' : ''
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="modal-password" className="label-spec text-[10px]">
                      Security Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                      <input
                        id="modal-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="input-spec w-full pl-10 pr-10 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Notification Alert */}
                  {errorMessage && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-status-danger/15 border border-status-danger/40 text-status-danger text-xs leading-relaxed animate-fade-up">
                      <AlertCircle className="w-4 h-4 text-status-danger flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Authentication Error</div>
                        <span>{errorMessage}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-spec-primary w-full py-2.5 text-xs font-bold mt-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin text-accent-contrast" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span>Verifying Database…</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to {modalRole === 'student' ? 'Student' : modalRole === 'faculty' ? 'Faculty' : modalRole === 'tpo' ? 'TPO' : 'Admin'} Portal</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-accent" />
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
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15%  { transform: translateX(-6px); }
          30%  { transform: translateX(5px); }
          45%  { transform: translateX(-4px); }
          60%  { transform: translateX(3px); }
          75%  { transform: translateX(-2px); }
          90%  { transform: translateX(1px); }
        }
      `}</style>
    </div>
  );
};
