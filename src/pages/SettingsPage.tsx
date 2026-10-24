import React, { useState } from 'react';
import { useCampusData } from '../context/CampusDataContext';
import { ScoreWeights } from '../types/scoring';
import { AcademicRiskThresholds, PlacementRiskThresholds } from '../types/risk';
import {
  Sliders, AlertTriangle, CheckCircle2, RotateCcw, Info, Settings,
  Database, RefreshCw, Server, ShieldCheck, Check, Sparkles, AlertCircle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    weights,
    academicThresholds,
    placementThresholds,
    updateWeights,
    updateAcademicThresholds,
    updatePlacementThresholds,
    resetToDemoData,
    students,
    dbStatus,
    dbHealth,
    isSyncing,
    refreshFromDatabase,
    seedToDatabase,
  } = useCampusData();

  // Local state for weights form
  const [localWeights, setLocalWeights] = useState<ScoreWeights>({ ...weights });
  const [weightSuccessMsg, setWeightSuccessMsg] = useState(false);

  // Local state for academic thresholds
  const [localAcad, setLocalAcad] = useState<AcademicRiskThresholds>({ ...academicThresholds });
  const [acadSuccessMsg, setAcadSuccessMsg] = useState(false);

  // Local state for placement thresholds
  const [localPlace, setLocalPlace] = useState<PlacementRiskThresholds>({ ...placementThresholds });
  const [placeSuccessMsg, setPlaceSuccessMsg] = useState(false);

  // DB feedback state
  const [dbNotice, setDbNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Weight sum check
  const totalWeight =
    localWeights.academic +
    localWeights.attendance +
    localWeights.lms +
    localWeights.engagement +
    localWeights.placement +
    localWeights.skills;

  const isWeightValid = totalWeight === 100;

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWeightValid) return;
    updateWeights(localWeights);
    setWeightSuccessMsg(true);
    setTimeout(() => setWeightSuccessMsg(false), 3000);
  };

  const handleSaveAcad = (e: React.FormEvent) => {
    e.preventDefault();
    updateAcademicThresholds(localAcad);
    setAcadSuccessMsg(true);
    setTimeout(() => setAcadSuccessMsg(false), 3000);
  };

  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlacementThresholds(localPlace);
    setPlaceSuccessMsg(true);
    setTimeout(() => setPlaceSuccessMsg(false), 3000);
  };

  const handleSyncFromDatabase = async () => {
    setDbNotice({ message: 'Syncing students and configurations from MongoDB...', type: 'info' });
    const success = await refreshFromDatabase();
    if (success) {
      setDbNotice({ message: 'Successfully synced all records from MongoDB database!', type: 'success' });
    } else {
      setDbNotice({
        message: 'Could not connect to MongoDB server. Falling back to local offline storage.',
        type: 'error',
      });
    }
    setTimeout(() => setDbNotice(null), 5000);
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm('Seed / reset MongoDB database with standard university demo dataset (135 students)?')) return;
    setDbNotice({ message: 'Seeding MongoDB database...', type: 'info' });
    const success = await seedToDatabase();
    if (success) {
      setDbNotice({ message: 'MongoDB database initialized with 135 student records!', type: 'success' });
    } else {
      setDbNotice({
        message: 'Database seeding failed. Ensure MongoDB server is active (npm run server).',
        type: 'error',
      });
    }
    setTimeout(() => setDbNotice(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-5xl animate-fade-up">
      {/* 0. MongoDB Fullstack Persistence & Sync Panel */}
      <div className="spec-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-text">MongoDB Database & Fullstack API</h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    dbStatus === 'connected'
                      ? 'bg-status-success/15 text-status-success border-status-success/30'
                      : dbStatus === 'checking'
                      ? 'bg-accent/15 text-accent border-accent/30 animate-pulse'
                      : 'bg-status-warning/15 text-status-warning border-status-warning/30'
                  }`}
                >
                  {dbStatus === 'connected' ? '● Connected (Live Sync)' : dbStatus === 'checking' ? 'Connecting...' : '○ Offline (Local Storage Mode)'}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Full CRUD persistence over Express REST API & Mongoose schemas with seamless local fallback.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncFromDatabase}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-card border border-border hover:border-accent hover:text-accent transition disabled:opacity-50"
              title="Refresh from MongoDB database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-accent' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync DB'}</span>
            </button>

            <button
              onClick={handleSeedDatabase}
              disabled={isSyncing}
              className="btn-spec-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
              title="Seed MongoDB database collection"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Seed DB</span>
            </button>
          </div>
        </div>

        {/* Real-time DB Diagnostics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-card border border-border">
            <span className="text-[10px] uppercase font-bold text-text-muted block">Connection State</span>
            <strong className={`capitalize ${dbStatus === 'connected' ? 'text-status-success' : 'text-status-warning'}`}>
              {dbHealth?.state || (dbStatus === 'connected' ? 'Connected' : 'Offline')}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border">
            <span className="text-[10px] uppercase font-bold text-text-muted block">Engine Mode</span>
            <strong className="text-accent">
              {dbHealth?.mode === 'embedded-persistent' ? 'Embedded (WiredTiger)' : 'External / Atlas'}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border">
            <span className="text-[10px] uppercase font-bold text-text-muted block">Target Database</span>
            <strong className="text-text font-mono">{dbHealth?.name || 'edupulse'}</strong>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border">
            <span className="text-[10px] uppercase font-bold text-text-muted block">MongoDB Students</span>
            <strong className="text-accent font-mono">{dbHealth?.studentCount ?? students.length} Records</strong>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border">
            <span className="text-[10px] uppercase font-bold text-text-muted block">Interventions</span>
            <strong className="text-text font-mono">{dbHealth?.interventionCount ?? 0} Tracked</strong>
          </div>
        </div>

        {dbNotice && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              dbNotice.type === 'success'
                ? 'bg-status-success/15 border-status-success/30 text-status-success'
                : dbNotice.type === 'error'
                ? 'bg-status-danger/15 border-status-danger/30 text-status-danger'
                : 'bg-accent/15 border-accent/30 text-accent'
            }`}
          >
            {dbNotice.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{dbNotice.message}</span>
          </div>
        )}
      </div>

      {/* Institutional Calibration Notice */}
      <div className="p-4 rounded-xl bg-accent/10 border border-accent/25 flex items-start gap-3">
        <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-text">Institutional Governance & Calibration Notice</h4>
          <p className="text-text-muted leading-relaxed">
            The initial weights and risk cutoffs configured below represent prototype baseline standards designed for university demonstration. Before production campus deployment, these parameters should be validated with the Academic Council and Placement Directorate against longitudinal historical outcomes.
          </p>
        </div>
      </div>

      {/* 1. Student Success Score Component Weights */}
      <div className="spec-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-text">Success Score Component Weights</h3>
            <p className="text-xs text-text-muted">
              Weights must total precisely 100%. Dynamic re-normalization will preserve these relative proportions when student data is partially incomplete.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                isWeightValid
                  ? 'bg-status-success/15 text-status-success border-status-success/30'
                  : 'bg-status-danger/15 text-status-danger border-status-danger/30'
              }`}
            >
              Sum: {totalWeight}% {isWeightValid ? '✓ Valid' : '⚠️ Must equal 100%'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveWeights} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-text mb-1">
                Academic Performance (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={localWeights.academic}
                onChange={e => setLocalWeights({ ...localWeights, academic: Number(e.target.value) })}
                className="input-spec w-full font-bold"
              />
              <span className="text-[10px] text-text-muted">70% CGPA + 30% Internals</span>
            </div>

            <div>
              <label className="block font-semibold text-text mb-1">Attendance Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={localWeights.attendance}
                onChange={e => setLocalWeights({ ...localWeights, attendance: Number(e.target.value) })}
                className="input-spec w-full font-bold"
              />
              <span className="text-[10px] text-text-muted">Overall verified presence</span>
            </div>

            <div>
              <label className="block font-semibold text-text mb-1">LMS Engagement (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={localWeights.lms}
                onChange={e => setLocalWeights({ ...localWeights, lms: Number(e.target.value) })}
                className="input-spec w-full font-bold"
              />
              <span className="text-[10px] text-text-muted">50% Logins + 50% Assignments</span>
            </div>

            <div>
              <label className="block font-semibold text-text mb-1">
                Co-curricular & Certs (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={localWeights.engagement}
                onChange={e => setLocalWeights({ ...localWeights, engagement: Number(e.target.value) })}
                className="input-spec w-full font-bold"
              />
              <span className="text-[10px] text-text-muted">Events, Clubs & Certifications</span>
            </div>

            <div>
              <label className="block font-semibold text-text mb-1">
                Placement Readiness (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={localWeights.placement}
                onChange={e => setLocalWeights({ ...localWeights, placement: Number(e.target.value) })}
                className="input-spec w-full font-bold"
              />
              <span className="text-[10px] text-text-muted">Aptitude, Coding & Interview</span>
            </div>

            <div>
              <label className="block font-semibold text-text mb-1">Skills Assessment (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={localWeights.skills}
                onChange={e => setLocalWeights({ ...localWeights, skills: Number(e.target.value) })}
                className="input-spec w-full font-bold"
              />
              <span className="text-[10px] text-text-muted">60% Tech + 40% Soft Skills</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {weightSuccessMsg ? (
              <span className="text-status-success font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Weights updated and persisted!
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={!isWeightValid}
              className="btn-spec-primary text-xs py-2 px-4 disabled:opacity-50"
            >
              Save Weight Configuration
            </button>
          </div>
        </form>
      </div>

      {/* 2. Academic Risk Thresholds */}
      <div className="spec-card space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="text-sm font-bold text-text">Academic Risk Rule Thresholds</h3>
          <p className="text-xs text-text-muted">
            Configure early warning boundaries that trigger Academic Risk flags.
          </p>
        </div>

        <form onSubmit={handleSaveAcad} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-text mb-1">
                Critical Attendance (&lt; %)
              </label>
              <input
                type="number"
                value={localAcad.min_attendance_critical}
                onChange={e => setLocalAcad({ ...localAcad, min_attendance_critical: Number(e.target.value) })}
                className="input-spec w-full font-bold"
              />
              <span className="text-[10px] text-text-muted">Exam debarment risk</span>
            </div>

            <div>
              <label className="block font-semibold text-text mb-1">
                Warning Attendance (&lt; %)
              </label>
              <input
                type="number"
                value={localAcad.min_attendance_low}
                onChange={e => setLocalAcad({ ...localAcad, min_attendance_low: Number(e.target.value) })}
                className="input-spec w-full font-bold"
              />
              <span className="text-[10px] text-text-muted">Borderline watch</span>
            </div>

            <div>
              <label className="block font-semibold text-text mb-1">Critical CGPA (&lt;)</label>
              <input
                type="number"
                step="0.1"
                value={localAcad.min_cgpa_critical}
                onChange={e => setLocalAcad({ ...localAcad, min_cgpa_critical: Number(e.target.value) })}
                className="input-spec w-full font-bold"
              />
              <span className="text-[10px] text-text-muted">Academic probation</span>
            </div>

            <div>
              <label className="block font-semibold text-text mb-1">
                Critical Internals (&lt; %)
              </label>
              <input
                type="number"
                value={localAcad.min_internal_marks_critical}
                onChange={e => setLocalAcad({ ...localAcad, min_internal_marks_critical: Number(e.target.value) })}
                className="input-spec w-full font-bold"
              />
              <span className="text-[10px] text-text-muted">Continuous assessment fail</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {acadSuccessMsg ? (
              <span className="text-status-success font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Academic rules updated!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="btn-spec-primary text-xs py-2 px-4"
            >
              Save Academic Thresholds
            </button>
          </div>
        </form>
      </div>

      {/* 3. Placement Risk Thresholds */}
      <div className="spec-card space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="text-sm font-bold text-text">Placement Screening Cutoffs</h3>
          <p className="text-xs text-text-muted">
            Recruiter benchmark cutoffs for aptitude, coding, and mock assessments.
          </p>
        </div>

        <form onSubmit={handleSavePlace} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-text mb-1">
                Min Aptitude Benchmark (/100)
              </label>
              <input
                type="number"
                value={localPlace.min_aptitude_score}
                onChange={e => setLocalPlace({ ...localPlace, min_aptitude_score: Number(e.target.value) })}
                className="input-spec w-full font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-text mb-1">
                Min Coding Benchmark (/100)
              </label>
              <input
                type="number"
                value={localPlace.min_coding_score}
                onChange={e => setLocalPlace({ ...localPlace, min_coding_score: Number(e.target.value) })}
                className="input-spec w-full font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-text mb-1">
                Min Mock Interview Benchmark (/100)
              </label>
              <input
                type="number"
                value={localPlace.min_mock_interview_score}
                onChange={e => setLocalPlace({ ...localPlace, min_mock_interview_score: Number(e.target.value) })}
                className="input-spec w-full font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {placeSuccessMsg ? (
              <span className="text-status-success font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Placement benchmarks updated!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="btn-spec-primary text-xs py-2 px-4"
            >
              Save Placement Thresholds
            </button>
          </div>
        </form>
      </div>

      {/* 4. Demonstration Reset & System Information */}
      <div className="spec-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-text">Demonstration Reset & Data Purge</h3>
            <p className="text-xs text-text-muted">
              Reset all student profiles, interventions, and rules back to initial 135-student seed dataset.
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Reset all campus data to default initial demonstration state?')) {
                resetToDemoData();
                setLocalWeights({ academic: 30, attendance: 20, lms: 15, engagement: 10, placement: 15, skills: 10 });
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-status-danger bg-status-danger/10 border border-status-danger/30 hover:bg-status-danger/20 rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Dataset</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1 text-text-muted">
          <div>
            <span className="text-[10px] uppercase font-bold text-text-muted block">Platform Architecture</span>
            <strong className="text-text">React 19 + TypeScript + Vite</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-text-muted block">Scoring Engine</span>
            <strong className="text-text">Deterministic Re-normalizing</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-text-muted block">Active Student Cohort</span>
            <strong className="text-accent font-semibold">{students.length} Records</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-text-muted block">Data Layer</span>
            <strong className="text-status-success font-semibold">MongoDB + Local Cache</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

