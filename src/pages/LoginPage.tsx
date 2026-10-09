import React, { useState, useRef, useEffect } from 'react';
import {
  Activity, Eye, EyeOff, Mail, Lock, LogIn,
  Sparkles, GraduationCap, Users, Shield,
  CheckCircle2, AlertCircle, Quote, ChevronLeft, ChevronRight,
  TrendingUp, BarChart3, Award, BookOpen, Building2,
  Clock, Check, Search, ArrowRight, UserCheck, Layers
} from 'lucide-react';
import {
  DEMO_CREDENTIALS, FEATURED_DEMO_STUDENTS, FEATURED_DEMO_FACULTY,
  type PortalRole, type DemoCredential
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

// ─── Campus Dummy Metrics (Header Statistics) ──────────────────────────────────
const DUMMY_CAMPUS_METRICS = [
  {
    label: "Active Students Monitored",
    value: "52,480+",
    change: "+14.2% YoY",
    icon: <GraduationCap className="w-4 h-4 text-cyan-400" />,
    badgeBg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  },
  {
    label: "Placement & Graduation Rate",
    value: "94.8%",
    change: "Tier-1 Benchmark",
    icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
    badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  },
  {
    label: "Early Dropout Risk Radar",
    value: "18 Days",
    change: "Early Intervention",
    icon: <Award className="w-4 h-4 text-purple-400" />,
    badgeBg: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  },
  {
    label: "Departments & Labs Integrated",
    value: "140+",
    change: "Unified Data Mesh",
    icon: <Building2 className="w-4 h-4 text-blue-400" />,
    badgeBg: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  },
];

// ─── Background Ambient Particles ──────────────────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 5) % 100}%`,
  top: `${(i * 23 + 10) % 100}%`,
  size: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5,
  duration: 7 + (i % 5),
  delay: (i * 0.4) % 4,
  opacity: 0.05 + (i % 4) * 0.03,
}));

// ─── Main Landing & Login Page Component ───────────────────────────────────────
export const LoginPage: React.FC<LoginPageProps> = ({ onSelectRole }) => {
  const { students, selectStudentForPortal, setLoggedInFacultyIdx } = useCampusData();

  // State for quote carousel
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [isQuotePaused, setIsQuotePaused] = useState(false);

  // Form states
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState<DemoCredential | null>(null);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [showStudentDirectoryModal, setShowStudentDirectoryModal] = useState(false);
  const [studentDirectorySearch, setStudentDirectorySearch] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);

  // Auto rotate quotes every 5 seconds (pausable on hover)
  useEffect(() => {
    if (isQuotePaused) return;
    const interval = setInterval(() => {
      setActiveQuoteIndex(prev => (prev + 1) % INSPIRATIONAL_QUOTES.length);
    }, 5200);
    return () => clearInterval(interval);
  }, [isQuotePaused]);

  // Initial focus
  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 400);
  }, []);

  const triggerShake = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleRoleTabSelect = (role: 'student' | 'faculty' | 'admin') => {
    setSelectedRole(role);
    setError('');
    const matchingCred = DEMO_CREDENTIALS.find(c => c.role === role);
    if (matchingCred && (!email || email.includes('@edupulse.edu'))) {
      setEmail(matchingCred.email);
      setPassword(matchingCred.password);
    }
  };

  const handleSelectFeaturedStudent = (st: typeof FEATURED_DEMO_STUDENTS[0], autoLogin = false) => {
    setEmail(st.email);
    setPassword(st.password);
    setSelectedRole('student');
    setError('');
    if (autoLogin) {
      executeLogin(st.email, st.password, 'student', st.id);
    }
  };

  const handleSelectFeaturedFaculty = (fac: typeof FEATURED_DEMO_FACULTY[0], autoLogin = false) => {
    setEmail(fac.email);
    setPassword(fac.password);
    setSelectedRole('faculty');
    setError('');
    if (autoLogin) {
      executeLogin(fac.email, fac.password, 'faculty', undefined, fac.idx);
    }
  };

  const executeLogin = async (
    targetEmail: string,
    targetPass: string,
    enforcedRole?: PortalRole,
    specificStudentId?: string,
    specificFacultyIdx?: number
  ) => {
    const trimEmail = targetEmail.trim().toLowerCase();
    const trimPass = targetPass.trim();

    if (!trimEmail) {
      triggerShake('Please enter your institutional email address or student ID.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate enterprise auth handshake
    await new Promise(res => setTimeout(res, 600));

    // 1. Resolve role
    let resolvedRole: Exclude<PortalRole, 'login'> = enforcedRole as any || selectedRole;

    // Check if matches a student in DEMO_CREDENTIALS or students dataset
    const matchedStudentInDataset = students.find(s =>
      s.student_id.toLowerCase() === (specificStudentId || trimEmail).toLowerCase() ||
      s.email.toLowerCase() === trimEmail ||
      s.name.toLowerCase() === trimEmail ||
      trimEmail.includes(s.student_id.toLowerCase())
    );

    const matchedFaculty = FEATURED_DEMO_FACULTY.find(f =>
      (specificFacultyIdx !== undefined && f.idx === specificFacultyIdx) ||
      f.email.toLowerCase() === trimEmail ||
      f.name.toLowerCase().includes(trimEmail)
    );

    if (matchedFaculty) {
      resolvedRole = 'faculty';
    } else if (matchedStudentInDataset || trimEmail.includes('stu') || specificStudentId) {
      resolvedRole = 'student';
    } else if (trimEmail.includes('admin')) {
      resolvedRole = 'admin';
    } else if (trimEmail.includes('faculty') || trimEmail.includes('prof') || trimEmail.includes('dr.')) {
      resolvedRole = 'faculty';
    }

    // 2. Build resolved credential for UI banner
    let resolvedCred: DemoCredential;

    if (resolvedRole === 'student') {
      const studentToLoad = matchedStudentInDataset || students[0];
      selectStudentForPortal(studentToLoad);

      resolvedCred = {
        role: 'student',
        studentId: studentToLoad.student_id,
        label: 'Student',
        email: studentToLoad.email,
        password: 'student@123',
        name: studentToLoad.name,
        subtitle: `${studentToLoad.department} · ${studentToLoad.academic_year}`,
        avatarInitials: studentToLoad.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        color: 'from-blue-600 to-cyan-500',
        accentColor: 'text-cyan-400',
        badgeBg: 'bg-cyan-500/10 border-cyan-500/30',
        risk: ((studentToLoad.academic?.backlogs ?? 0) > 0 || (studentToLoad.attendance?.overall_attendance ?? 100) < 65) ? 'High' : (studentToLoad.attendance?.overall_attendance ?? 100) < 75 ? 'Medium' : 'Low',
      };
    } else if (resolvedRole === 'faculty') {
      const fIdx = specificFacultyIdx !== undefined ? specificFacultyIdx : (matchedFaculty ? matchedFaculty.idx : 0);
      setLoggedInFacultyIdx(fIdx);
      const facObj = FEATURED_DEMO_FACULTY[fIdx] || FEATURED_DEMO_FACULTY[0];

      resolvedCred = {
        role: 'faculty',
        facultyIdx: fIdx,
        label: 'Faculty',
        email: facObj.email,
        password: 'faculty@123',
        name: facObj.name,
        subtitle: `${facObj.department} · ${facObj.designation}`,
        avatarInitials: facObj.avatar_initials,
        color: facObj.color,
        accentColor: 'text-violet-400',
        badgeBg: 'bg-violet-500/10 border-violet-500/30',
      };
    } else {
      resolvedCred = DEMO_CREDENTIALS.find(c => c.role === 'admin') || DEMO_CREDENTIALS[DEMO_CREDENTIALS.length - 1];
    }

    setIsLoading(false);
    setLoginSuccess(resolvedCred);

    // Brief celebration flash before routing
    await new Promise(res => setTimeout(res, 750));
    onSelectRole(resolvedRole);
  };

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    executeLogin(email, password);
  };

  const isSuccess = !!loginSuccess;
  const currentQuote = INSPIRATIONAL_QUOTES[activeQuoteIndex];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* ── Ambient Background Glows ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute top-1/3 right-0 w-[550px] h-[550px] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] rounded-full bg-teal-600/10 blur-[150px]" />

        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Floating particles */}
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-blue-400"
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

      {/* ── TOP HEADER & DUMMY DATA METRICS BAR ──────────────────────────────── */}
      <header className="relative z-20 w-full border-b border-white/[0.07] bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-[0_0_24px_rgba(37,99,235,0.45)]">
                <Activity className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white">EduPulse AI</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Campus Intelligence & Student Success System</p>
              </div>
            </div>

            {/* System Status & Institutional Badges */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium text-[11px]">System Status: 100% Operational</span>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-slate-400 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Academic Year 2025-26</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-blue-400 font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>FERPA & NEP 2020 Compliant</span>
              </div>
            </div>
          </div>

          {/* DUMMY DATA METRICS RIBBON (Above Main Content) */}
          <div className="mt-4 pt-3 border-t border-white/[0.05] grid grid-cols-2 md:grid-cols-4 gap-3">
            {DUMMY_CAMPUS_METRICS.map((metric, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-white/10 flex items-center justify-center flex-shrink-0">
                  {metric.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-white tracking-tight">{metric.value}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${metric.badgeBg}`}>
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{metric.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── MAIN LANDING AREA (LEFT: QUOTES / RIGHT: LOGIN FORM) ─────────────── */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14">
        
        {/* ── LEFT SIDE: INSPIRATIONAL QUOTES & PLATFORM HIGHLIGHTS ──────────── */}
        <div 
          className="w-full lg:w-[54%] flex flex-col justify-between space-y-6"
          onMouseEnter={() => setIsQuotePaused(true)}
          onMouseLeave={() => setIsQuotePaused(false)}
        >
          {/* Subtle Tagline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold w-fit">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Empowering Campus Minds with Predictive AI</span>
          </div>

          {/* Hero Heading */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Turning Campus Data into <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Measurable Student Success.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-3 max-w-xl leading-relaxed">
              Unified intelligence across academic performance, attendance, risk early warning, and career readiness. Welcome to your institutional portal.
            </p>
          </div>

          {/* QUOTES CAROUSEL CARD */}
          <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent border border-white/10 p-6 sm:p-7 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden">
            
            {/* Top decorative badge & quotation icon */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <Quote className="w-4 h-4 fill-cyan-400/20 text-cyan-400" />
                Words of Wisdom & Inspiration
              </span>

              {/* Quote Category Pill */}
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r ${currentQuote.color} text-white shadow-sm`}>
                {currentQuote.tag}
              </span>
            </div>

            {/* Quote Text */}
            <div className="min-h-[110px] flex flex-col justify-center transition-all duration-300">
              <p className="text-lg sm:text-xl font-medium text-slate-100 leading-snug italic tracking-normal">
                "{currentQuote.quote}"
              </p>
              
              {/* Author & Designation */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    — {currentQuote.author}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {currentQuote.designation}
                  </p>
                </div>

                {/* Carousel navigation buttons */}
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

            {/* Pagination dots & Progress */}
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

          {/* Academic Snapshot / Features Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Continuous SGPA Tracking</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">Automated assessment insights & marks radar.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Dropout Risk Radar</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">Early alerts before semester exam thresholds.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Faculty Mentorship Hub</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">Direct student-to-mentor problem resolution.</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT SIDE: PROFESSIONAL LOGIN FORM ───────────────────────────── */}
        <div className="w-full lg:w-[46%] max-w-md mx-auto">
          
          <div
            className={`relative p-7 sm:p-8 rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
              isSuccess
                ? 'border-emerald-500/40 bg-emerald-500/[0.04] shadow-[0_0_50px_rgba(16,185,129,0.15)]'
                : 'border-white/10 bg-slate-900/60 shadow-[0_24px_64px_rgba(0,0,0,0.65)] hover:border-white/15'
            } ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
          >
            {/* Top glowing edge line */}
            <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${
              isSuccess 
                ? 'from-transparent via-emerald-400/60 to-transparent' 
                : 'from-transparent via-cyan-400/40 to-transparent'
            }`} />

            {/* ── SUCCESS OVERLAY ────────────────────────────────────────────── */}
            {isSuccess && loginSuccess && (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${loginSuccess.color} flex items-center justify-center text-white text-xl font-bold shadow-2xl`}>
                  {loginSuccess.avatarInitials}
                </div>
                <div>
                  <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto mb-2.5 animate-bounce" />
                  <h3 className="text-xl font-extrabold text-white">Welcome Back, {loginSuccess.name}!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Entering <span className="font-semibold text-white">{loginSuccess.label} Portal</span>…
                  </p>
                </div>
                <div className="flex gap-1.5 mt-3">
                  {[0, 1, 2].map(i => (
                    <div 
                      key={i} 
                      className="w-2.5 h-2.5 rounded-full bg-emerald-400" 
                      style={{ animation: `bounce 0.8s ${i * 0.15}s infinite` }} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── ACTIVE FORM ─────────────────────────────────────────────────── */}
            {!isSuccess && (
              <>
                {/* Form Heading & Portal Selector */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black text-white tracking-tight">Portal Sign In</h2>
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-cyan-400" />
                      Secure 256-bit SSO
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Select your portal role and sign in with your campus credentials.
                  </p>

                  {/* Role Selector Tabs */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/5 mt-4">
                    <button
                      type="button"
                      onClick={() => handleRoleTabSelect('student')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                        selectedRole === 'student'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleTabSelect('faculty')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                        selectedRole === 'faculty'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Faculty</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleTabSelect('admin')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                        selectedRole === 'admin'
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </button>
                  </div>

                  {/* ── DEMO QUICK-SELECT ACCOUNTS ACCORDION / PILLS ───────────────── */}
                  <div className="mt-4 pt-4 border-t border-white/[0.08]">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Quick Demo Accounts (1-Click Login)
                      </span>
                      {selectedRole === 'student' && (
                        <button
                          type="button"
                          onClick={() => setShowStudentDirectoryModal(true)}
                          className="text-[11px] text-cyan-300 hover:text-cyan-200 underline font-semibold flex items-center gap-1"
                        >
                          <Search className="w-3 h-3" />
                          All 100 Students
                        </button>
                      )}
                    </div>

                    {/* Student Quick Cards */}
                    {selectedRole === 'student' && (
                      <div className="grid grid-cols-2 gap-2">
                        {FEATURED_DEMO_STUDENTS.map(st => {
                          const isSelected = email.toLowerCase() === st.email.toLowerCase() || email.toLowerCase() === st.id.toLowerCase();
                          return (
                            <div
                              key={st.id}
                              onClick={() => handleSelectFeaturedStudent(st, false)}
                              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between gap-1.5 ${
                                isSelected
                                  ? 'bg-blue-600/20 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                                  : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/15'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${st.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                    {st.initials}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-white truncate">{st.name}</div>
                                    <div className="text-[9px] text-slate-400 font-mono truncate">{st.rollNo}</div>
                                  </div>
                                </div>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  st.risk === 'High'
                                    ? 'bg-red-500/20 text-red-300'
                                    : st.risk === 'Medium'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}>
                                  {st.risk}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px]">
                                <span className="text-slate-400 font-mono">{st.cgpa} CGPA · {st.attendance}%</span>
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleSelectFeaturedStudent(st, true);
                                  }}
                                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-200"
                                >
                                  Login →
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Faculty Quick Cards */}
                    {selectedRole === 'faculty' && (
                      <div className="grid grid-cols-2 gap-2">
                        {FEATURED_DEMO_FACULTY.map(fac => {
                          const isSelected = email.toLowerCase() === fac.email.toLowerCase();
                          return (
                            <div
                              key={fac.id}
                              onClick={() => handleSelectFeaturedFaculty(fac, false)}
                              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between gap-1.5 ${
                                isSelected
                                  ? 'bg-purple-600/20 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                                  : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/15'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${fac.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                  {fac.avatar_initials}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-white truncate">{fac.name}</div>
                                  <div className="text-[10px] text-purple-300 truncate">{fac.subjects[0]}</div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px]">
                                <span className="text-slate-400 truncate">{fac.students_count} Students</span>
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleSelectFeaturedFaculty(fac, true);
                                  }}
                                  className="text-[10px] font-bold text-purple-300 hover:text-purple-200"
                                >
                                  Login →
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Admin Quick Card */}
                    {selectedRole === 'admin' && (
                      <div
                        onClick={() => {
                          const adminCred = DEMO_CREDENTIALS.find(c => c.role === 'admin')!;
                          setEmail(adminCred.email);
                          setPassword(adminCred.password);
                        }}
                        className="p-3 rounded-xl border bg-teal-500/10 border-teal-500/30 flex items-center justify-between cursor-pointer hover:bg-teal-500/15 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                            CA
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Campus Administrator</div>
                            <div className="text-[10px] text-teal-300">Executive Analytics · Data Pipelines · Full System Access</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            const adminCred = DEMO_CREDENTIALS.find(c => c.role === 'admin')!;
                            executeLogin(adminCred.email, adminCred.password, 'admin');
                          }}
                          className="text-xs font-bold text-teal-400 hover:text-teal-200 px-2.5 py-1 rounded-lg bg-teal-500/20"
                        >
                          Login →
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">
                  
                  {/* Email Field */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="landing-email" className="text-xs font-semibold text-slate-300">
                      {selectedRole === 'student' ? 'Campus Email or Student ID' : 'Campus Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        id="landing-email"
                        ref={emailRef}
                        type="text"
                        autoComplete="username"
                        placeholder={
                          selectedRole === 'student' 
                            ? 'STU002 or priya.singh@edupulse.edu' 
                            : selectedRole === 'faculty' 
                            ? 'priya.menon@edupulse.edu' 
                            : 'admin@edupulse.edu'
                        }
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-500
                          bg-white/[0.05] border transition-all duration-200 outline-none
                          focus:bg-white/[0.08] focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20
                          ${error ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="landing-password" className="text-xs font-semibold text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotNotice(true)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        id="landing-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(''); }}
                        className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-slate-500
                          bg-white/[0.05] border transition-all duration-200 outline-none
                          focus:bg-white/[0.08] focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20
                          ${error ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-white/10 border-white/20 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span>Keep me signed in on this workstation</span>
                    </label>
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Forgot Password Modal / Notice */}
                  {showForgotNotice && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white">Campus IT Helpdesk Assistance</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Password resets are managed by your institution's IT department. For assistance, contact: <span className="font-mono text-cyan-300">support@edupulse.edu</span> or room 104 Admin Block.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowForgotNotice(false)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`relative w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold
                      transition-all duration-200 overflow-hidden shadow-lg mt-1
                      ${isLoading
                        ? 'bg-blue-700/50 text-blue-300 cursor-not-allowed'
                        : selectedRole === 'student'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 hover:shadow-[0_0_24px_rgba(37,99,235,0.45)] hover:-translate-y-0.5 active:translate-y-0'
                        : selectedRole === 'faculty'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white hover:from-purple-500 hover:to-indigo-400 hover:shadow-[0_0_24px_rgba(147,51,234,0.45)] hover:-translate-y-0.5 active:translate-y-0'
                        : 'bg-gradient-to-r from-teal-600 to-emerald-500 text-white hover:from-teal-500 hover:to-emerald-400 hover:shadow-[0_0_24px_rgba(13,148,136,0.45)] hover:-translate-y-0.5 active:translate-y-0'
                      }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span>Authenticating…</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to {selectedRole === 'student' ? 'Student' : selectedRole === 'faculty' ? 'Faculty' : 'Admin'} Portal</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Campus SSO & Security Footer */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Protected by CloudFlare & AES-256</span>
                  </div>
                  <span className="hover:text-slate-400 transition-colors">v2.4.0-Enterprise</span>
                </div>
              </>
            )}

          </div>

          {/* Privacy & Institutional Note */}
          <p className="text-center text-[11px] text-slate-600 mt-4 leading-relaxed">
            By signing in, you agree to your institution's Acceptable Use Policy and Campus Data Protection Standards.
          </p>

        </div>

      </main>

      {/* ── ALL 100 STUDENTS DIRECTORY MODAL ─────────────────────────────────── */}
      {showStudentDirectoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0b1226] border border-[#14224a] rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#14224a]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-cyan-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Institutional Student Directory</h3>
                  <p className="text-xs text-slate-400">Select any student from the 100 campus profiles to test login</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStudentDirectoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by student name, ID (e.g. STU015), or department..."
                value={studentDirectorySearch}
                onChange={e => setStudentDirectorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {students
                .filter(st => {
                  const q = studentDirectorySearch.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    st.name.toLowerCase().includes(q) ||
                    st.student_id.toLowerCase().includes(q) ||
                    st.department.toLowerCase().includes(q) ||
                    st.email.toLowerCase().includes(q)
                  );
                })
                .map(st => (
                  <div
                    key={st.student_id}
                    onClick={() => {
                      selectStudentForPortal(st);
                      setEmail(st.email);
                      setPassword('student@123');
                      setShowStudentDirectoryModal(false);
                      setSelectedRole('student');
                      executeLogin(st.email, 'student@123', 'student', st.student_id);
                    }}
                    className="p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.07] hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-cyan-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {st.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-2">
                          <span>{st.name}</span>
                          <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded">
                            {st.student_id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {st.department} · {st.academic_year} · {st.semester}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 flex items-center gap-3">
                      <div>
                        <div className="text-xs font-mono text-white">
                          {st.academic?.cgpa ?? 7.0} CGPA · {st.attendance?.overall_attendance ?? 75}%
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          (st.academic?.backlogs ?? 0) > 0 || (st.attendance?.overall_attendance ?? 100) < 65
                            ? 'bg-red-500/20 text-red-300'
                            : (st.attendance?.overall_attendance ?? 100) < 75
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {(st.academic?.backlogs ?? 0) > 0 || (st.attendance?.overall_attendance ?? 100) < 65 ? 'High' : (st.attendance?.overall_attendance ?? 100) < 75 ? 'Medium' : 'Low'} Risk
                        </span>
                      </div>
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30"
                      >
                        Sign In →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LANDING PAGE BOTTOM FOOTER ───────────────────────────────────────── */}
      <footer className="relative z-20 border-t border-white/[0.06] bg-black/50 py-3.5 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>© 2026 EduPulse AI Corporation. All rights reserved. Built for Higher Education Excellence.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-slate-300 cursor-pointer">Security Whitepaper</span>
            <span className="hover:text-slate-300 cursor-pointer">NEP 2020 Compliance</span>
            <span className="hover:text-slate-300 cursor-pointer">Institutional Privacy</span>
          </div>
        </div>
      </footer>

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
        @keyframes bounce {
          0%,100% { transform: translateY(0); opacity: 1; }
          50%      { transform: translateY(-5px); opacity: 0.6; }
        }
      `}</style>

    </div>
  );
};
