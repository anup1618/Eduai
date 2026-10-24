import React, { useState, useMemo } from 'react';
import {
  Briefcase, TrendingUp, Users, Award, Calendar, Search, Filter,
  CheckCircle2, AlertTriangle, Clock, Download, Plus, ChevronRight,
  ChevronLeft, Building2, BookOpen, FileSpreadsheet, Shield, ArrowUpRight,
  X, Check, LogOut, Sun, Moon, Bell, Sparkles, ExternalLink, RefreshCw,
  Send, UserCheck, AlertCircle, FileText, BarChart3, Star, Layers,
  CheckSquare, MessageSquare, Menu
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { useCampusData } from '../context/CampusDataContext';
import { useTheme } from '../context/ThemeContext';
import { evaluatePlacementRisk } from '../engine/placementRiskEngine';
import {
  DEMO_TPO_OFFICER,
  DEMO_PLACEMENT_DRIVES,
  DEMO_TRAINING_MODULES,
  DEMO_PLACEMENT_OFFERS,
  DEMO_RESUME_VERIFICATIONS,
  CTC_TIER_DATA,
  DEPT_PLACEMENT_DATA
} from '../data/tpoData';
import {
  PlacementDrive,
  PlacementTrainingProgram,
  PlacementOffer,
  ResumeVerificationItem,
  TPOPage,
  PlacementTier,
  DriveStatus
} from '../types/tpo';
import { Department, UnifiedStudent } from '../types/student';
import { SpecKpiCard, SpecPageHeader } from '../components/common/SpecComponents';

interface TPOPlatformProps {
  onLogout: () => void;
}

const TPO_NAV_ITEMS: { id: TPOPage; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'dashboard', label: 'Placement Cockpit', icon: <Briefcase className="w-5 h-5 flex-shrink-0" /> },
  { id: 'drives', label: 'Campus Drives', icon: <Building2 className="w-5 h-5 flex-shrink-0" />, badge: '14 Active' },
  { id: 'readiness', label: 'Student Readiness', icon: <Users className="w-5 h-5 flex-shrink-0" /> },
  { id: 'screening', label: 'Recruiter Screener', icon: <Filter className="w-5 h-5 flex-shrink-0" /> },
  { id: 'training', label: 'Training & Bootcamps', icon: <BookOpen className="w-5 h-5 flex-shrink-0" />, badge: '5 Tracks' },
  { id: 'offers', label: 'Offers & CTC Hub', icon: <Award className="w-5 h-5 flex-shrink-0" /> },
  { id: 'resumes', label: 'ATS Resume Desk', icon: <FileSpreadsheet className="w-5 h-5 flex-shrink-0" />, badge: 'New' },
  { id: 'profile', label: 'TPO Cell & Policies', icon: <Shield className="w-5 h-5 flex-shrink-0" /> },
];

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'var(--card)',
    borderColor: 'var(--border)',
    borderRadius: '12px',
    color: 'var(--text)',
    boxShadow: 'var(--shadow-card-hover)',
    fontSize: '12px',
  },
};

export const TPOPlatform: React.FC<TPOPlatformProps> = ({ onLogout }) => {
  const { students } = useCampusData();
  const { theme, toggleTheme } = useTheme();

  // Navigation & layout state
  const [currentPage, setCurrentPage] = useState<TPOPage>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Placement Data State
  const [drives, setDrives] = useState<PlacementDrive[]>(DEMO_PLACEMENT_DRIVES);
  const [offers, setOffers] = useState<PlacementOffer[]>(DEMO_PLACEMENT_OFFERS);
  const [trainingPrograms, setTrainingPrograms] = useState<PlacementTrainingProgram[]>(DEMO_TRAINING_MODULES);
  const [resumes, setResumes] = useState<ResumeVerificationItem[]>(DEMO_RESUME_VERIFICATIONS);

  // Filter states
  const [driveTierFilter, setDriveTierFilter] = useState<'All' | PlacementTier>('All');
  const [driveStatusFilter, setDriveStatusFilter] = useState<'All' | DriveStatus>('All');
  const [readinessDeptFilter, setReadinessDeptFilter] = useState<string>('All');
  const [readinessRiskFilter, setReadinessRiskFilter] = useState<string>('All');

  // Screener live criteria
  const [screenerMinCgpa, setScreenerMinCgpa] = useState<number>(7.0);
  const [screenerMaxBacklogs, setScreenerMaxBacklogs] = useState<number>(0);
  const [screenerMinCoding, setScreenerMinCoding] = useState<number>(50);
  const [screenerMinAptitude, setScreenerMinAptitude] = useState<number>(55);
  const [screenerDepts, setScreenerDepts] = useState<Record<string, boolean>>({
    'Computer Science': true,
    'Information Technology': true,
    'Electronics & Comm.': true,
    'Mechanical Eng.': false,
    'Civil Eng.': false,
  });

  // Modals state
  const [isCreateDriveOpen, setIsCreateDriveOpen] = useState(false);
  const [isCreateTrainingOpen, setIsCreateTrainingOpen] = useState(false);
  const [selectedDriveForCandidates, setSelectedDriveForCandidates] = useState<PlacementDrive | null>(null);
  const [selectedResumeForReview, setSelectedResumeForReview] = useState<ResumeVerificationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Drive Form state
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCtc, setNewCtc] = useState('12.0');
  const [newTier, setNewTier] = useState<PlacementTier>('Dream');
  const [newMinCgpa, setNewMinCgpa] = useState('7.0');
  const [newMaxBacklogs, setNewMaxBacklogs] = useState('0');
  const [newMinCoding, setNewMinCoding] = useState('55');
  const [newDeadline, setNewDeadline] = useState('2025-11-15');
  const [newDriveDate, setNewDriveDate] = useState('2025-11-20');
  const [newLocation, setNewLocation] = useState('Bengaluru / Hybrid');

  // New Training Workshop state
  const [newTrainingTitle, setNewTrainingTitle] = useState('');
  const [newTrainingTrainer, setNewTrainingTrainer] = useState('');
  const [newTrainingCategory, setNewTrainingCategory] = useState<PlacementTrainingProgram['category']>('Coding & DSA');
  const [newTrainingAudience, setNewTrainingAudience] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ── Compute Real Metrics from Campus Data Context ─────────────────────────────
  const studentReadinessEvaluations = useMemo(() => {
    return students.map(st => {
      const evalResult = evaluatePlacementRisk(st);
      return {
        student: st,
        eval: evalResult,
      };
    });
  }, [students]);

  const totalEligibleCount = useMemo(() => {
    return students.filter(s => (s.academic.backlogs ?? 0) === 0 && (s.academic.cgpa ?? 0) >= 6.0).length;
  }, [students]);

  const placedStudentsCount = useMemo(() => {
    const placedIds = new Set(offers.map(o => o.studentId));
    return placedIds.size;
  }, [offers]);

  const placementRate = useMemo(() => {
    if (students.length === 0) return 84;
    return Math.round((placedStudentsCount / students.length) * 100);
  }, [placedStudentsCount, students.length]);

  const averageCtc = useMemo(() => {
    if (offers.length === 0) return 9.8;
    const sum = offers.reduce((acc, o) => acc + o.ctc, 0);
    return (sum / offers.length).toFixed(1);
  }, [offers]);

  const highestCtc = useMemo(() => {
    if (offers.length === 0) return 44.0;
    return Math.max(...offers.map(o => o.ctc));
  }, [offers]);

  // Recruiter Screener filtered results
  const screenerResults = useMemo(() => {
    return students.filter(st => {
      const cgpa = st.academic.cgpa ?? 0;
      const backlogs = st.academic.backlogs ?? 0;
      const coding = st.placement.coding_score ?? 0;
      const aptitude = st.placement.aptitude_score ?? 0;
      const deptOk = screenerDepts[st.department] ?? true;

      return (
        deptOk &&
        cgpa >= screenerMinCgpa &&
        backlogs <= screenerMaxBacklogs &&
        coding >= screenerMinCoding &&
        aptitude >= screenerMinAptitude
      );
    });
  }, [students, screenerMinCgpa, screenerMaxBacklogs, screenerMinCoding, screenerMinAptitude, screenerDepts]);

  // Handle Add New Drive
  const handleCreateDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) {
      showToast('Please enter both company name and role title.');
      return;
    }

    const created: PlacementDrive = {
      id: `DRV-${Date.now().toString().slice(-3)}`,
      company: newCompany.trim(),
      logoBadge: newCompany.slice(0, 3).toUpperCase(),
      badgeBg: newTier === 'Super Dream' ? 'from-purple-600 to-indigo-600' : 'from-blue-600 to-cyan-500',
      tier: newTier,
      role: newRole.trim(),
      ctc: parseFloat(newCtc) || 10.0,
      type: 'Full-Time',
      location: newLocation,
      eligibleDepts: ['Computer Science', 'Information Technology', 'Electronics & Comm.'],
      minCgpa: parseFloat(newMinCgpa) || 7.0,
      maxBacklogs: parseInt(newMaxBacklogs) || 0,
      minCodingScore: parseInt(newMinCoding) || 50,
      minAptitudeScore: 60,
      deadline: newDeadline,
      driveDate: newDriveDate,
      status: 'Upcoming',
      rounds: ['Online Assessment', 'Technical Coding Round', 'HR & Cultural Round'],
      registeredStudentsCount: Math.round(screenerResults.length * 0.8),
      shortlistedCount: Math.round(screenerResults.length * 0.4),
      selectedCount: 0,
      description: `Newly scheduled campus placement drive by ${newCompany} for eligible graduates.`,
    };

    setDrives(prev => [created, ...prev]);
    setIsCreateDriveOpen(false);
    setNewCompany('');
    setNewRole('');
    showToast(`Campus recruitment drive for "${created.company}" successfully created and broadcasted!`);
  };

  // Handle Add New Training Program
  const handleCreateTrainingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainingTitle.trim()) return;

    const created: PlacementTrainingProgram = {
      id: `TRN-${Date.now().toString().slice(-2)}`,
      title: newTrainingTitle.trim(),
      trainer: newTrainingTrainer.trim() || 'TPO Specialist Mentors',
      category: newTrainingCategory,
      duration: '4 Weeks (32 Hours)',
      status: 'Upcoming',
      enrolledCount: 45,
      attendanceRate: 90,
      nextSession: 'Upcoming Saturday · 10:00 AM',
      targetAudience: newTrainingAudience.trim() || 'Eligible Campus Candidates',
      progressPct: 0,
    };

    setTrainingPrograms(prev => [created, ...prev]);
    setIsCreateTrainingOpen(false);
    setNewTrainingTitle('');
    setNewTrainingTrainer('');
    showToast(`Training workshop "${created.title}" successfully scheduled!`);
  };

  // Export Shortlist as CSV
  const handleExportScreenerCSV = () => {
    const headers = ['Student ID', 'Full Name', 'Department', 'Semester', 'CGPA', 'Backlogs', 'Coding Score', 'Aptitude Score', 'Placement Readiness Risk'];
    const rows = screenerResults.map(s => {
      const risk = evaluatePlacementRisk(s).risk_level;
      return [
        s.student_id,
        `"${s.name}"`,
        `"${s.department}"`,
        s.semester,
        s.academic.cgpa ?? 'N/A',
        s.academic.backlogs ?? 0,
        s.placement.coding_score ?? 'N/A',
        s.placement.aptitude_score ?? 'N/A',
        risk,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EduPulse_TPO_Shortlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${screenerResults.length} shortlisted candidates to CSV.`);
  };

  // Export Placement Accreditation Report
  const handleExportAccreditationCSV = () => {
    const headers = ['Offer ID', 'Student ID', 'Student Name', 'Department', 'Recruiter Company', 'Role Offered', 'CTC (LPA)', 'Tier', 'Offer Date', 'Verification Status'];
    const rows = offers.map(o => [
      o.id,
      o.studentId,
      `"${o.studentName}"`,
      `"${o.department}"`,
      `"${o.company}"`,
      `"${o.role}"`,
      o.ctc,
      o.offerType,
      o.offerDate,
      o.verificationStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NAAC_NIRF_Placement_Report_${DEMO_TPO_OFFICER.season.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Placement accreditation report exported successfully.');
  };

  return (
    <div className="min-h-screen bg-bg text-text flex relative overflow-x-hidden font-sans">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── FLOATING GLASS SIDEBAR (EduPulse AI Standard) ────────────────────────── */}
      <aside
        className={`fixed top-4 bottom-4 left-4 z-50 rounded-spec-sidebar spec-glass flex flex-col transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[264px]'
        } ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+24px)] lg:translate-x-0'
        }`}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3.5 top-8 w-7 h-7 rounded-full bg-accent text-accent-contrast shadow-md items-center justify-center hover:scale-110 transition-transform z-10"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Top: Logo & Platform Identity */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
              <Briefcase className="w-5 h-5 text-accent stroke-[2.5]" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-text tracking-tight">EduPulse AI</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    TPO CELL
                  </span>
                </div>
                <p className="text-[11px] text-text-muted truncate">Placement Directorate</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-text-muted hover:text-text p-1 ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <div className="px-2 pt-1 pb-1.5 label-spec text-[10px]">TPO PORTAL NAVIGATION</div>
          )}

          {TPO_NAV_ITEMS.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-accent/15 text-accent font-semibold border-l-[3px] border-accent pl-2.5'
                    : 'text-text-muted hover:text-text hover:bg-card-hover hover:translate-x-0.5'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-accent' : 'text-text-muted'}>{item.icon}</span>
                {!collapsed && (
                  <span className="flex-1 text-left truncate flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-bold border border-accent/25">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* TPO Officer Compact Card & Logout */}
        <div className="p-3 border-t border-border space-y-2">
          {!collapsed && (
            <div className="p-2.5 rounded-xl bg-card border border-border flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                {DEMO_TPO_OFFICER.avatar_initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-text truncate">{DEMO_TPO_OFFICER.name}</div>
                <div className="text-[10px] text-text-muted truncate">Chief Placement Officer</div>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Switch Portal / Log Out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Switch Portal / Log Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ─────────────────────────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-10 ${
          collapsed ? 'lg:pl-[96px]' : 'lg:pl-[288px]'
        }`}
      >
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-bg/85 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-text-muted hover:text-text p-1.5 rounded-lg bg-card border border-border"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-status-success/15 text-status-success border border-status-success/30">
                <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                Season 2025-26 Live
              </span>
              <span className="text-xs text-text-muted hidden md:inline">
                · {totalEligibleCount} Registered Eligible Students
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsCreateDriveOpen(true)}
              className="btn-spec-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Post New Drive</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-xl bg-card border border-border hover:border-accent text-text-muted hover:text-text transition-colors relative"
                title="Placement Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-card border border-border shadow-2xl p-4 z-50 animate-fade-up">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-bold text-text">Placement Activity</span>
                    <span className="text-[10px] text-accent font-semibold">3 New Updates</span>
                  </div>
                  <div className="mt-3 space-y-2.5 text-xs">
                    <div className="p-2 rounded-lg bg-bg/60 border border-border/60">
                      <div className="font-semibold text-text">Microsoft Shortlist Announced</div>
                      <div className="text-[11px] text-text-muted mt-0.5">16 students shortlisted for Round 2 Coding Interview.</div>
                    </div>
                    <div className="p-2 rounded-lg bg-bg/60 border border-border/60">
                      <div className="font-semibold text-text">New Drive: Amazon AWS SDE-1</div>
                      <div className="text-[11px] text-text-muted mt-0.5">Campus assessment scheduled for Oct 29.</div>
                    </div>
                    <div className="p-2 rounded-lg bg-bg/60 border border-border/60">
                      <div className="font-semibold text-text">Offer Verified: STU006</div>
                      <div className="text-[11px] text-text-muted mt-0.5">Sneha Joshi accepted Microsoft ₹44 LPA offer.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-card border border-border hover:border-accent text-text-muted hover:text-text transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-accent" />}
            </button>
          </div>
        </header>

        {/* Global Toast Message */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-card border border-accent shadow-2xl text-text text-xs flex items-center gap-2 animate-fade-up">
            <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── MAIN BODY ───────────────────────────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* ══════════════════════════════════════════════════════════════════════
              PAGE 1: DASHBOARD / EXECUTIVE PLACEMENT COCKPIT
             ══════════════════════════════════════════════════════════════════════ */}
          {currentPage === 'dashboard' && (
            <div className="space-y-6 animate-fade-up">
              <SpecPageHeader
                title="Training & Placement Cockpit"
                semesterChip="Season 2025-26"
                subtitle={`Welcome, ${DEMO_TPO_OFFICER.name} · Central Corporate Placement Intelligence`}
                sessionText="NAAC & NIRF Benchmark Compliance Active"
                standingChip={{
                  text: 'Optimal Drive Momentum',
                  variant: 'success',
                }}
              />

              {/* 4 SPEC KPI CARDS */}
              <div className="grid grid-cols-12 gap-4">
                <SpecKpiCard
                  icon={<Award className="w-5 h-5 text-accent" />}
                  statusChip={{ text: '+7.4% YoY', variant: 'success' }}
                  number={`${placementRate}%`}
                  caption="Eligible Student Conversion"
                  label="OVERALL PLACEMENT RATE"
                  percent={placementRate}
                  onClick={() => setCurrentPage('offers')}
                />

                <SpecKpiCard
                  icon={<TrendingUp className="w-5 h-5 text-accent" />}
                  statusChip={{ text: 'Microsoft', variant: 'accent' }}
                  number={`₹${highestCtc}L`}
                  caption="Super Dream Top Tier Package"
                  label="HIGHEST CTC OFFERED"
                  onClick={() => setCurrentPage('offers')}
                />

                <SpecKpiCard
                  icon={<BarChart3 className="w-5 h-5 text-accent" />}
                  statusChip={{ text: 'Across All Tiers', variant: 'neutral' }}
                  number={`₹${averageCtc}L`}
                  caption="Institution-wide CTC Benchmark"
                  label="AVERAGE CTC PACKAGE"
                  onClick={() => setCurrentPage('offers')}
                />

                <SpecKpiCard
                  icon={<Building2 className="w-5 h-5 text-accent" />}
                  statusChip={{ text: '68 Visited', variant: 'warning' }}
                  number={drives.length}
                  caption="Recruitment Pipeline Drives"
                  label="ACTIVE CAMPUS DRIVES"
                  onClick={() => setCurrentPage('drives')}
                />
              </div>

              {/* ROW 2: CTC Distribution & Department Breakdown Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* CTC Tier Breakdown Bar Chart */}
                <div className="lg:col-span-7 spec-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-text">CTC Tier Distribution & Package Ranges</h3>
                      <p className="text-xs text-text-muted">Student offers categorized by institutional recruitment brackets</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                      {offers.length} Offers Logged
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={CTC_TIER_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="tier" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                        <Tooltip {...CHART_TOOLTIP_STYLE} />
                        <Bar dataKey="count" name="Offers Extended" radius={[6, 6, 0, 0]}>
                          {CTC_TIER_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border text-center text-xs">
                    <div>
                      <div className="text-[10px] text-text-muted">Super Dream</div>
                      <div className="font-bold text-text">₹32.5L Avg</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-muted">Dream</div>
                      <div className="font-bold text-text">₹13.8L Avg</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-muted">Core Tech</div>
                      <div className="font-bold text-text">₹8.2L Avg</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-muted">Mass Corporate</div>
                      <div className="font-bold text-text">₹4.5L Avg</div>
                    </div>
                  </div>
                </div>

                {/* Department-wise Placement Rates */}
                <div className="lg:col-span-5 spec-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-text">Branch-Wise Placement Rates</h3>
                        <p className="text-xs text-text-muted">Placement conversion % across engineering departments</p>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      {DEPT_PLACEMENT_DATA.map(d => (
                        <div key={d.dept} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-text">{d.dept}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-text-muted">Avg ₹{d.avgCtc}L</span>
                              <span className="font-bold text-accent">{d.placedPct}%</span>
                            </div>
                          </div>
                          <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all duration-500"
                              style={{ width: `${d.placedPct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-text-muted">Highest Department: <strong className="text-text">Computer Science (88%)</strong></span>
                    <button
                      onClick={() => setCurrentPage('screening')}
                      className="text-accent font-semibold hover:underline flex items-center gap-1"
                    >
                      Screen Candidates <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ROW 3: Active Drives Showcase & Skill Gap Alert */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Active Drives Preview */}
                <div className="lg:col-span-8 spec-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-text">High-Priority Campus Drives Pipeline</h3>
                      <p className="text-xs text-text-muted">Current visiting recruiters and active evaluation rounds</p>
                    </div>
                    <button
                      onClick={() => setCurrentPage('drives')}
                      className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                    >
                      View All Drives ({drives.length}) <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {drives.slice(0, 4).map(drv => (
                      <div
                        key={drv.id}
                        onClick={() => setSelectedDriveForCandidates(drv)}
                        className="p-3.5 rounded-xl bg-card border border-border hover:border-accent/50 hover:bg-card-hover cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${drv.badgeBg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            {drv.logoBadge}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-text">{drv.company}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                drv.tier === 'Super Dream'
                                  ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                                  : drv.tier === 'Dream'
                                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              }`}>
                                {drv.tier}
                              </span>
                            </div>
                            <div className="text-xs text-text-muted mt-0.5">{drv.role}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <div className="text-right">
                            <div className="font-bold text-accent text-sm">₹{drv.ctc} LPA</div>
                            <div className="text-[10px] text-text-muted">Date: {drv.driveDate}</div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                            drv.status === 'Active'
                              ? 'bg-status-success/15 text-status-success border-status-success/30'
                              : 'bg-accent/15 text-accent border-accent/30'
                          }`}>
                            {drv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Placement Risk Radar */}
                <div className="lg:col-span-4 spec-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-accent" />
                      <h3 className="text-base font-bold text-text">AI Skill Gap Diagnostics</h3>
                    </div>
                    <p className="text-xs text-text-muted mb-4">
                      EduPulse AI flags high-academic students suffering from interview or coding score deficits.
                    </p>

                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-xs">
                        <div className="font-bold text-status-danger flex items-center justify-between">
                          <span>High CGPA, Low Coding</span>
                          <span className="font-mono">14 Students</span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-1">
                          CGPA &ge; 7.5 but Coding Score &lt; 50. In danger of elimination during Round 1 hackathons.
                        </p>
                        <button
                          onClick={() => {
                            setScreenerMinCgpa(7.5);
                            setScreenerMinCoding(0);
                            setCurrentPage('screening');
                          }}
                          className="mt-2 text-accent font-semibold hover:underline text-[11px] flex items-center gap-1"
                        >
                          View Cohort &amp; Assign Bootcamp &rarr;
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-status-warning/10 border border-status-warning/30 text-xs">
                        <div className="font-bold text-status-warning flex items-center justify-between">
                          <span>Mock Interview Deficit</span>
                          <span className="font-mono">22 Students</span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-1">
                          Scored &lt; 55 in mock technical & behavioral evaluations.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentPage('training')}
                    className="w-full btn-spec-primary text-xs py-2 mt-4"
                  >
                    Open Skill Bootcamps Hub
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              PAGE 2: CAMPUS DRIVES RECRUITMENT MANAGEMENT
             ══════════════════════════════════════════════════════════════════════ */}
          {currentPage === 'drives' && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-text">Campus Recruitment Drives</h2>
                  <p className="text-xs text-text-muted mt-1">
                    Manage corporate drives, schedule assessments, and track shortlisting pipelines.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsCreateDriveOpen(true)}
                    className="btn-spec-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Recruitment Drive</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-text-muted font-medium">Tier:</span>
                  {(['All', 'Super Dream', 'Dream', 'Standard'] as const).map(tier => (
                    <button
                      key={tier}
                      onClick={() => setDriveTierFilter(tier)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        driveTierFilter === tier
                          ? 'bg-accent text-accent-contrast font-bold'
                          : 'bg-bg text-text-muted hover:text-text'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted font-medium">Status:</span>
                  {(['All', 'Active', 'Upcoming', 'Completed'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setDriveStatusFilter(st)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        driveStatusFilter === st
                          ? 'bg-accent text-accent-contrast font-bold'
                          : 'bg-bg text-text-muted hover:text-text'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drives Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {drives
                  .filter(d => driveTierFilter === 'All' || d.tier === driveTierFilter)
                  .filter(d => driveStatusFilter === 'All' || d.status === driveStatusFilter)
                  .map(drive => (
                    <div
                      key={drive.id}
                      className="spec-card flex flex-col justify-between group hover:border-accent/60 transition-all"
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${drive.badgeBg} text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-md`}>
                              {drive.logoBadge}
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-text group-hover:text-accent transition-colors">
                                {drive.company}
                              </h3>
                              <span className="text-xs text-text-muted">{drive.location}</span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            drive.tier === 'Super Dream'
                              ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                              : drive.tier === 'Dream'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {drive.tier}
                          </span>
                        </div>

                        {/* Role & CTC */}
                        <div className="mb-4">
                          <div className="text-xs font-semibold text-text">{drive.role}</div>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-accent">₹{drive.ctc} LPA</span>
                            {drive.stipend && (
                              <span className="text-[11px] text-text-muted">({drive.stipend})</span>
                            )}
                          </div>
                        </div>

                        {/* Criteria pills */}
                        <div className="p-2.5 rounded-xl bg-bg/80 border border-border/80 space-y-1.5 text-[11px] text-text-muted mb-4">
                          <div className="flex items-center justify-between">
                            <span>Minimum CGPA:</span>
                            <span className="font-bold text-text">&ge; {drive.minCgpa}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Max Active Backlogs:</span>
                            <span className="font-bold text-text">{drive.maxBacklogs}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Minimum Coding Score:</span>
                            <span className="font-bold text-text">&ge; {drive.minCodingScore}/100</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Drive Assessment Date:</span>
                            <span className="font-bold text-accent">{drive.driveDate}</span>
                          </div>
                        </div>

                        {/* Pipeline Counters */}
                        <div className="grid grid-cols-3 gap-2 py-2 border-t border-border text-center text-xs">
                          <div>
                            <div className="font-bold text-text">{drive.registeredStudentsCount}</div>
                            <div className="text-[10px] text-text-muted">Registered</div>
                          </div>
                          <div>
                            <div className="font-bold text-accent">{drive.shortlistedCount}</div>
                            <div className="text-[10px] text-text-muted">Shortlisted</div>
                          </div>
                          <div>
                            <div className="font-bold text-status-success">{drive.selectedCount}</div>
                            <div className="text-[10px] text-text-muted">Selected</div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          drive.status === 'Active'
                            ? 'bg-status-success/15 text-status-success border-status-success/30'
                            : 'bg-card border-border text-text-muted'
                        }`}>
                          {drive.status}
                        </span>

                        <button
                          onClick={() => setSelectedDriveForCandidates(drive)}
                          className="text-accent font-semibold hover:underline flex items-center gap-1"
                        >
                          <span>Candidate Roster</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              PAGE 3: STUDENT PLACEMENT READINESS & INTELLIGENCE
             ══════════════════════════════════════════════════════════════════════ */}
          {currentPage === 'readiness' && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-text">Student Placement Readiness Intelligence</h2>
                  <p className="text-xs text-text-muted mt-1">
                    Multi-parameter diagnostic analysis powered by the EduPulse AI Placement Risk Engine.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage('screening')}
                    className="btn-spec-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Open Recruiter Screener</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Search student by name or roll..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="input-spec pl-9 pr-3 py-1.5 text-xs w-60"
                    />
                  </div>

                  <select
                    value={readinessDeptFilter}
                    onChange={e => setReadinessDeptFilter(e.target.value)}
                    className="input-spec py-1.5 text-xs"
                  >
                    <option value="All">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Comm.">Electronics & Comm.</option>
                    <option value="Mechanical Eng.">Mechanical Eng.</option>
                    <option value="Civil Eng.">Civil Eng.</option>
                  </select>

                  <select
                    value={readinessRiskFilter}
                    onChange={e => setReadinessRiskFilter(e.target.value)}
                    className="input-spec py-1.5 text-xs"
                  >
                    <option value="All">All Risk Profiles</option>
                    <option value="Low">Low Risk / High Readiness</option>
                    <option value="Moderate">Moderate Risk</option>
                    <option value="High">High Risk / Needs Bootcamp</option>
                  </select>
                </div>

                <div className="text-xs text-text-muted font-mono">
                  Showing {
                    studentReadinessEvaluations
                      .filter(i => readinessDeptFilter === 'All' || i.student.department === readinessDeptFilter)
                      .filter(i => readinessRiskFilter === 'All' || i.eval.risk_level === readinessRiskFilter)
                      .filter(i => !searchQuery || i.student.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.student.student_id.toLowerCase().includes(searchQuery.toLowerCase()))
                      .length
                  } / {students.length} Students
                </div>
              </div>

              {/* Students Table */}
              <div className="spec-card overflow-x-auto p-0">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg/80 border-b border-border text-[11px] uppercase tracking-spec-label text-text-muted">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-3">Branch &amp; Sem</th>
                      <th className="py-3 px-3 text-center">CGPA</th>
                      <th className="py-3 px-3 text-center">Coding</th>
                      <th className="py-3 px-3 text-center">Aptitude</th>
                      <th className="py-3 px-3 text-center">Interview</th>
                      <th className="py-3 px-3 text-center">Readiness</th>
                      <th className="py-3 px-3 text-center">Risk Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {studentReadinessEvaluations
                      .filter(i => readinessDeptFilter === 'All' || i.student.department === readinessDeptFilter)
                      .filter(i => readinessRiskFilter === 'All' || i.eval.risk_level === readinessRiskFilter)
                      .filter(i => !searchQuery || i.student.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.student.student_id.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(({ student, eval: evalResult }) => {
                        const coding = student.placement.coding_score ?? 0;
                        const aptitude = student.placement.aptitude_score ?? 0;
                        const mock = student.placement.mock_interview_score ?? 0;
                        const readiness = evalResult.readiness_score ?? 60;

                        return (
                          <tr key={student.student_id} className="hover:bg-card-hover transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-text">{student.name}</div>
                              <div className="text-[11px] text-text-muted font-mono">{student.student_id}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="text-text">{student.department}</div>
                              <div className="text-[10px] text-text-muted">{student.semester}</div>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-text">
                              {student.academic.cgpa?.toFixed(2) ?? '—'}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`font-semibold ${coding >= 60 ? 'text-status-success' : coding >= 45 ? 'text-status-warning' : 'text-status-danger'}`}>
                                {coding}/100
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`font-semibold ${aptitude >= 65 ? 'text-status-success' : 'text-status-warning'}`}>
                                {aptitude}/100
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`font-semibold ${mock >= 60 ? 'text-status-success' : 'text-text-muted'}`}>
                                {mock}/100
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="font-bold text-accent">{readiness}/100</div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                evalResult.risk_level === 'Low'
                                  ? 'bg-status-success/15 text-status-success border-status-success/30'
                                  : evalResult.risk_level === 'Moderate'
                                  ? 'bg-status-warning/15 text-status-warning border-status-warning/30'
                                  : 'bg-status-danger/15 text-status-danger border-status-danger/30'
                              }`}>
                                {evalResult.risk_level}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => showToast(`Added ${student.name} to DSA Bootcamp & Mock Interview Clinic.`)}
                                className="text-[11px] font-semibold text-accent hover:underline"
                              >
                                + Bootcamp
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              PAGE 4: RECRUITER ELIGIBILITY SCREENING ENGINE
             ══════════════════════════════════════════════════════════════════════ */}
          {currentPage === 'screening' && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-text">Recruiter Screening Engine</h2>
                  <p className="text-xs text-text-muted mt-1">
                    Set dynamic multi-attribute criteria to instantly isolate corporate-eligible student rosters.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportScreenerCSV}
                    className="btn-spec-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Shortlist to CSV</span>
                  </button>
                </div>
              </div>

              {/* Screener Controls Bento */}
              <div className="spec-card">
                <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                  <span className="text-xs font-bold text-text uppercase tracking-spec-label flex items-center gap-2">
                    <Filter className="w-4 h-4 text-accent" />
                    Live Recruiter Criteria Sliders
                  </span>
                  <div className="text-xs font-bold text-accent">
                    {screenerResults.length} Qualified Candidates ({Math.round((screenerResults.length / students.length) * 100)}% of campus)
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Slider 1: Min CGPA */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Minimum CGPA:</span>
                      <span className="font-bold text-accent">{screenerMinCgpa.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="5.0"
                      max="9.5"
                      step="0.1"
                      value={screenerMinCgpa}
                      onChange={e => setScreenerMinCgpa(parseFloat(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted">
                      <span>5.0</span>
                      <span>7.5</span>
                      <span>9.5</span>
                    </div>
                  </div>

                  {/* Slider 2: Max Backlogs */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Max Allowed Backlogs:</span>
                      <span className="font-bold text-accent">{screenerMaxBacklogs}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="1"
                      value={screenerMaxBacklogs}
                      onChange={e => setScreenerMaxBacklogs(parseInt(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted">
                      <span>0 (Strict)</span>
                      <span>1</span>
                      <span>3 (Relaxed)</span>
                    </div>
                  </div>

                  {/* Slider 3: Min Coding Score */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Min Coding Score:</span>
                      <span className="font-bold text-accent">{screenerMinCoding}/100</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="90"
                      step="5"
                      value={screenerMinCoding}
                      onChange={e => setScreenerMinCoding(parseInt(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted">
                      <span>30</span>
                      <span>60</span>
                      <span>90</span>
                    </div>
                  </div>

                  {/* Slider 4: Min Aptitude Score */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Min Aptitude Score:</span>
                      <span className="font-bold text-accent">{screenerMinAptitude}/100</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="90"
                      step="5"
                      value={screenerMinAptitude}
                      onChange={e => setScreenerMinAptitude(parseInt(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted">
                      <span>30</span>
                      <span>60</span>
                      <span>90</span>
                    </div>
                  </div>
                </div>

                {/* Branch Checkboxes */}
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="text-xs font-semibold text-text mb-2.5">Eligible Engineering Branches:</div>
                  <div className="flex flex-wrap items-center gap-3">
                    {Object.keys(screenerDepts).map(dept => (
                      <label
                        key={dept}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          screenerDepts[dept]
                            ? 'bg-accent/15 border-accent text-accent font-semibold'
                            : 'bg-card border-border text-text-muted'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={screenerDepts[dept]}
                          onChange={e => setScreenerDepts(prev => ({ ...prev, [dept]: e.target.checked }))}
                          className="hidden"
                        />
                        <CheckSquare className={`w-3.5 h-3.5 ${screenerDepts[dept] ? 'text-accent' : 'opacity-40'}`} />
                        <span>{dept}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instant Shortlist Table */}
              <div className="spec-card overflow-x-auto p-0">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-text">
                    Shortlisted Candidate Roster ({screenerResults.length} match criteria)
                  </span>
                  <button
                    onClick={() => showToast(`Invited ${screenerResults.length} students to register for upcoming placement test.`)}
                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Drive Invitation</span>
                  </button>
                </div>

                <table className="w-full text-left text-xs">
                  <thead className="bg-bg/80 border-b border-border text-[11px] uppercase tracking-spec-label text-text-muted">
                    <tr>
                      <th className="py-3 px-4">Roll &amp; Name</th>
                      <th className="py-3 px-3">Branch</th>
                      <th className="py-3 px-3 text-center">CGPA</th>
                      <th className="py-3 px-3 text-center">Backlogs</th>
                      <th className="py-3 px-3 text-center">Coding Score</th>
                      <th className="py-3 px-3 text-center">Aptitude Score</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {screenerResults.slice(0, 15).map(st => (
                      <tr key={st.student_id} className="hover:bg-card-hover transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-text">{st.name}</div>
                          <div className="text-[11px] text-text-muted font-mono">{st.student_id}</div>
                        </td>
                        <td className="py-3 px-3 text-text">{st.department}</td>
                        <td className="py-3 px-3 text-center font-bold text-accent">
                          {st.academic.cgpa?.toFixed(2) ?? '—'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {st.academic.backlogs ?? 0}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-status-success">
                          {st.placement.coding_score ?? 0}/100
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-text">
                          {st.placement.aptitude_score ?? 0}/100
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-success/15 text-status-success border border-status-success/30">
                            Pre-Screened
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {screenerResults.length > 15 && (
                  <div className="p-3 text-center text-xs text-text-muted border-t border-border">
                    + {screenerResults.length - 15} additional eligible candidates available. Export to CSV to view full dataset.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              PAGE 5: SKILL BOOTCAMPS & TRAINING MODULES
             ══════════════════════════════════════════════════════════════════════ */}
          {currentPage === 'training' && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-text">Placement Training Bootcamps</h2>
                  <p className="text-xs text-text-muted mt-1">
                    Pre-placement skill workshops, mock coding clinics, and corporate aptitude training.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreateTrainingOpen(true)}
                  className="btn-spec-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule Workshop</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {trainingPrograms.map(prog => (
                  <div key={prog.id} className="spec-card flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                          {prog.category}
                        </span>
                        <span className="text-xs font-semibold text-status-success flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {prog.attendanceRate}% Attd
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-text group-hover:text-accent transition-colors leading-snug">
                        {prog.title}
                      </h3>
                      <div className="text-xs text-text-muted mt-1.5 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-accent" />
                        <span>Lead: {prog.trainer}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-text-muted">Curriculum Progress</span>
                          <span className="font-bold text-accent">{prog.progressPct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all"
                            style={{ width: `${prog.progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className="mt-4 p-2.5 rounded-xl bg-bg/80 border border-border/80 text-[11px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Cohort Enrolled:</span>
                          <span className="font-bold text-text">{prog.enrolledCount} Students</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Duration:</span>
                          <span className="font-bold text-text">{prog.duration}</span>
                        </div>
                        <div className="pt-1 text-[10px] text-accent font-medium">
                          Next: {prog.nextSession}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-text-muted">{prog.status}</span>
                      <button
                        onClick={() => showToast(`Notified all ${prog.enrolledCount} students in "${prog.title}" with session materials.`)}
                        className="text-accent font-semibold hover:underline flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Reminder</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              PAGE 6: OFFERS & CTC ANALYTICS HUB
             ══════════════════════════════════════════════════════════════════════ */}
          {currentPage === 'offers' && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-text">Placement Offers &amp; Compensation Hub</h2>
                  <p className="text-xs text-text-muted mt-1">
                    Verified employment records, Dream &amp; Super Dream acceptance registries, and NAAC export.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportAccreditationCSV}
                    className="btn-spec-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download NAAC/NIRF Report</span>
                  </button>
                </div>
              </div>

              {/* Offer KPI Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="spec-card">
                  <div className="text-xs text-text-muted font-bold uppercase tracking-spec-label">Total Verified Offers</div>
                  <div className="text-3xl font-black text-text mt-1">{offers.length} Offers</div>
                  <div className="text-[11px] text-status-success mt-1">100% Appointment Letter Verified</div>
                </div>

                <div className="spec-card">
                  <div className="text-xs text-text-muted font-bold uppercase tracking-spec-label">Highest Package</div>
                  <div className="text-3xl font-black text-accent mt-1">₹44.0 LPA</div>
                  <div className="text-[11px] text-text-muted mt-1">Microsoft Core Cloud &amp; AI (Sneha Joshi)</div>
                </div>

                <div className="spec-card">
                  <div className="text-xs text-text-muted font-bold uppercase tracking-spec-label">Super Dream (&gt;20 LPA)</div>
                  <div className="text-3xl font-black text-purple-400 mt-1">
                    {offers.filter(o => o.offerType === 'Super Dream').length} Offers
                  </div>
                  <div className="text-[11px] text-text-muted mt-1">Amazon, Microsoft, Goldman Sachs</div>
                </div>
              </div>

              {/* Offers Table */}
              <div className="spec-card overflow-x-auto p-0">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg/80 border-b border-border text-[11px] uppercase tracking-spec-label text-text-muted">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-3">Branch</th>
                      <th className="py-3 px-3">Recruiter Company</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3 text-center">CTC Package</th>
                      <th className="py-3 px-3 text-center">Tier</th>
                      <th className="py-3 px-3 text-center">Acceptance</th>
                      <th className="py-3 px-4 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {offers.map(off => (
                      <tr key={off.id} className="hover:bg-card-hover transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-text">{off.studentName}</div>
                          <div className="text-[11px] text-text-muted font-mono">{off.rollNo}</div>
                        </td>
                        <td className="py-3 px-3 text-text">{off.department}</td>
                        <td className="py-3 px-3 font-semibold text-text">{off.company}</td>
                        <td className="py-3 px-3 text-text-muted">{off.role}</td>
                        <td className="py-3 px-3 text-center font-black text-accent text-sm">
                          ₹{off.ctc} LPA
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            off.offerType === 'Super Dream'
                              ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                              : off.offerType === 'Dream'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {off.offerType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            off.acceptanceStatus === 'Accepted'
                              ? 'bg-status-success/15 text-status-success border-status-success/30'
                              : 'bg-status-warning/15 text-status-warning border-status-warning/30'
                          }`}>
                            {off.acceptanceStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-bg text-text-muted border border-border">
                            {off.verificationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              PAGE 7: ATS RESUME VERIFICATION DESK
             ══════════════════════════════════════════════════════════════════════ */}
          {currentPage === 'resumes' && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-text">ATS Resume Review &amp; Verification Desk</h2>
                  <p className="text-xs text-text-muted mt-1">
                    Audit student technical resumes against institutional standards before corporate dispatch.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {resumes.map(rsm => (
                  <div key={rsm.id} className="spec-card flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-mono text-text-muted">{rsm.rollNo}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          rsm.status === 'Approved'
                            ? 'bg-status-success/15 text-status-success border-status-success/30'
                            : rsm.status === 'Needs Revision'
                            ? 'bg-status-danger/15 text-status-danger border-status-danger/30'
                            : 'bg-status-warning/15 text-status-warning border-status-warning/30'
                        }`}>
                          {rsm.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-text group-hover:text-accent transition-colors">
                        {rsm.studentName}
                      </h3>
                      <div className="text-xs text-text-muted mt-0.5">
                        {rsm.department} · CGPA {rsm.cgpa}
                      </div>

                      {/* ATS Score Gauge */}
                      <div className="mt-4 p-3 rounded-xl bg-bg/80 border border-border/80 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-text-muted">ATS Resume Score</div>
                          <div className="text-lg font-black text-accent">{rsm.atsScore}/100</div>
                        </div>
                        <FileText className="w-8 h-8 text-accent/40" />
                      </div>

                      {/* Verified Skills Tags */}
                      <div className="mt-3">
                        <div className="text-[10px] text-text-muted font-medium mb-1.5">Tagged Technologies:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {rsm.skills.map((sk, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-card border border-border text-text">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {rsm.notes && (
                        <p className="mt-3 text-[11px] text-text-muted italic border-l-2 border-accent/60 pl-2">
                          "{rsm.notes}"
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-[10px] text-text-muted">{rsm.version}</span>
                      <div className="flex items-center gap-2">
                        {rsm.status !== 'Approved' && (
                          <button
                            onClick={() => {
                              setResumes(prev => prev.map(r => r.id === rsm.id ? { ...r, status: 'Approved' } : r));
                              showToast(`Approved resume for ${rsm.studentName}.`);
                            }}
                            className="text-[11px] font-bold text-status-success hover:underline"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => showToast(`Downloaded ${rsm.version} for ${rsm.studentName}.`)}
                          className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>View PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              PAGE 8: TPO CELL & POLICIES
             ══════════════════════════════════════════════════════════════════════ */}
          {currentPage === 'profile' && (
            <div className="space-y-6 animate-fade-up">
              <SpecPageHeader
                title="TPO Directorate & Institutional Policies"
                semesterChip="Corporate Operations"
                subtitle="Training & Placement Cell Governance, Recruiter Engagement, & Dream Offer Policies"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Officer Profile Card */}
                <div className="spec-card space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
                      {DEMO_TPO_OFFICER.avatar_initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text">{DEMO_TPO_OFFICER.name}</h3>
                      <p className="text-xs text-accent font-semibold">{DEMO_TPO_OFFICER.designation}</p>
                      <p className="text-xs text-text-muted mt-0.5">{DEMO_TPO_OFFICER.department}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-bg/80 border border-border/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Office Location:</span>
                      <span className="font-semibold text-text">{DEMO_TPO_OFFICER.office}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Official Email:</span>
                      <span className="font-mono text-accent">{DEMO_TPO_OFFICER.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Emergency Direct Line:</span>
                      <span className="font-mono text-text">{DEMO_TPO_OFFICER.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Current Academic Session:</span>
                      <span className="font-bold text-text">{DEMO_TPO_OFFICER.season}</span>
                    </div>
                  </div>
                </div>

                {/* Campus Placement Policy Guidelines */}
                <div className="spec-card space-y-4">
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent" />
                    Institutional Placement Policy Framework
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-card border border-border">
                      <div className="font-bold text-text">1. Dream Offer Upgrade Clause</div>
                      <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                        A student who secures a standard placement offer (&le; ₹10 LPA) remains eligible to sit for Dream and Super Dream recruitment drives offering &ge; 1.5x of the current package.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-card border border-border">
                      <div className="font-bold text-text">2. Minimum 75% Attendance Requirement</div>
                      <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                        Students debarred from semester examinations due to attendance shortfall &lt; 75% are automatically held back from corporate interview shortlists.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-card border border-border">
                      <div className="font-bold text-text">3. Pre-Placement Diagnostic Attendance</div>
                      <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                        Attendance in the DSA Bootcamp and Weekly Aptitude Drills is mandatory for all students wishing to access Tier 1 campus assessments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── CREATE DRIVE MODAL ─────────────────────────────────────────────────── */}
      {isCreateDriveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="spec-card w-full max-w-lg p-6 relative">
            <button
              onClick={() => setIsCreateDriveOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text">Post Campus Recruitment Drive</h3>
                <p className="text-xs text-text-muted">Broadcast to eligible student cohorts and scheduling systems</p>
              </div>
            </div>

            <form onSubmit={handleCreateDriveSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-spec text-[10px] block mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Apple, Adobe..."
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    className="input-spec w-full text-xs"
                  />
                </div>
                <div>
                  <label className="label-spec text-[10px] block mb-1">Recruitment Tier</label>
                  <select
                    value={newTier}
                    onChange={e => setNewTier(e.target.value as PlacementTier)}
                    className="input-spec w-full text-xs"
                  >
                    <option value="Super Dream">Super Dream (&gt;20 LPA)</option>
                    <option value="Dream">Dream (10–20 LPA)</option>
                    <option value="Standard">Standard (6–10 LPA)</option>
                    <option value="Mass">Mass Recruitment (3.5–6 LPA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-spec text-[10px] block mb-1">Designation / Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Development Engineer - 1"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="input-spec w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-spec text-[10px] block mb-1">Annual CTC (in ₹ LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newCtc}
                    onChange={e => setNewCtc(e.target.value)}
                    className="input-spec w-full text-xs"
                  />
                </div>
                <div>
                  <label className="label-spec text-[10px] block mb-1">Minimum CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.1"
                    min="5.0"
                    max="10.0"
                    value={newMinCgpa}
                    onChange={e => setNewMinCgpa(e.target.value)}
                    className="input-spec w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-spec text-[10px] block mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    className="input-spec w-full text-xs"
                  />
                </div>
                <div>
                  <label className="label-spec text-[10px] block mb-1">Drive Assessment Date</label>
                  <input
                    type="date"
                    value={newDriveDate}
                    onChange={e => setNewDriveDate(e.target.value)}
                    className="input-spec w-full text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateDriveOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-text-muted hover:text-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-spec-primary px-5 py-2"
                >
                  Confirm &amp; Broadcast Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE TRAINING MODAL ──────────────────────────────────────────────── */}
      {isCreateTrainingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="spec-card w-full max-w-lg p-6 relative">
            <button
              onClick={() => setIsCreateTrainingOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text">Schedule Skill Bootcamp</h3>
                <p className="text-xs text-text-muted">Launch pre-placement technical &amp; interview drills</p>
              </div>
            </div>

            <form onSubmit={handleCreateTrainingSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="label-spec text-[10px] block mb-1">Bootcamp Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LeetCode Hard Patterns & Dynamic Programming"
                  value={newTrainingTitle}
                  onChange={e => setNewTrainingTitle(e.target.value)}
                  className="input-spec w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-spec text-[10px] block mb-1">Category</label>
                  <select
                    value={newTrainingCategory}
                    onChange={e => setNewTrainingCategory(e.target.value as any)}
                    className="input-spec w-full text-xs"
                  >
                    <option value="Coding & DSA">Coding &amp; DSA</option>
                    <option value="Aptitude & Logic">Aptitude &amp; Logic</option>
                    <option value="Mock Interviews">Mock Interviews</option>
                    <option value="System Design">System Design</option>
                    <option value="Soft Skills">Soft Skills &amp; GD</option>
                  </select>
                </div>
                <div>
                  <label className="label-spec text-[10px] block mb-1">Trainer / Faculty Assigned</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Priya Menon"
                    value={newTrainingTrainer}
                    onChange={e => setNewTrainingTrainer(e.target.value)}
                    className="input-spec w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="label-spec text-[10px] block mb-1">Target Cohort Description</label>
                <input
                  type="text"
                  placeholder="e.g. SDE Aspirants with Coding Score < 60"
                  value={newTrainingAudience}
                  onChange={e => setNewTrainingAudience(e.target.value)}
                  className="input-spec w-full text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTrainingOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-text-muted hover:text-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-spec-primary px-5 py-2"
                >
                  Schedule Bootcamp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MANAGE DRIVE CANDIDATES ROSTER MODAL ───────────────────────────────── */}
      {selectedDriveForCandidates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="spec-card w-full max-w-2xl max-h-[85vh] flex flex-col p-6 relative">
            <button
              onClick={() => setSelectedDriveForCandidates(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-text"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedDriveForCandidates.badgeBg} text-white font-bold text-sm flex items-center justify-center`}>
                {selectedDriveForCandidates.logoBadge}
              </div>
              <div>
                <h3 className="text-base font-bold text-text">
                  {selectedDriveForCandidates.company} · Candidate Roster
                </h3>
                <div className="text-xs text-text-muted">
                  {selectedDriveForCandidates.role} · ₹{selectedDriveForCandidates.ctc} LPA · Drive on {selectedDriveForCandidates.driveDate}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                <span>Total Campus Candidates Matching Criteria:</span>
                <span className="font-bold text-accent">{selectedDriveForCandidates.registeredStudentsCount} Students</span>
              </div>

              <div className="space-y-2">
                {students.slice(0, 8).map(st => (
                  <div
                    key={st.student_id}
                    className="p-3 rounded-xl bg-bg border border-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-text">{st.name}</div>
                      <div className="text-[11px] text-text-muted">{st.student_id} · {st.department} · CGPA {st.academic.cgpa}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-success/15 text-status-success border border-status-success/30">
                        Shortlisted
                      </span>
                      <button
                        onClick={() => showToast(`Notified ${st.name} of Round 2 Interview.`)}
                        className="text-xs text-accent font-semibold hover:underline"
                      >
                        Notify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted">Assessment Platform: HackerRank Automated Grid</span>
              <button
                onClick={() => {
                  setSelectedDriveForCandidates(null);
                  showToast(`All candidate shortlists synced for ${selectedDriveForCandidates.company}.`);
                }}
                className="btn-spec-primary px-4 py-2"
              >
                Close &amp; Save Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
