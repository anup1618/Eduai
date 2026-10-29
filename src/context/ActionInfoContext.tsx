import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Sparkles, CheckCircle2, AlertTriangle, Info, Download,
  Sliders, Briefcase, GraduationCap, X, ChevronRight, ExternalLink,
  Shield, Activity, Clock
} from 'lucide-react';

export interface ActionInfoItem {
  id?: string;
  title: string;
  message: string;
  badge?: string;
  category?: 'info' | 'success' | 'warning' | 'danger' | 'export' | 'settings' | 'placement' | 'audit';
  details?: string[];
  actionLabel?: string;
  onAction?: () => void;
  autoCloseMs?: number;
}

interface ActionInfoContextType {
  showActionInfo: (item: ActionInfoItem) => void;
  closeActionInfo: () => void;
  currentInfo: ActionInfoItem | null;
}

const ActionInfoContext = createContext<ActionInfoContextType | undefined>(undefined);

export const ActionInfoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentInfo, setCurrentInfo] = useState<ActionInfoItem | null>(null);

  const showActionInfo = (item: ActionInfoItem) => {
    setCurrentInfo({
      id: `act-${Date.now()}`,
      ...item,
    });
  };

  const closeActionInfo = () => {
    setCurrentInfo(null);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeActionInfo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global data-info listener for declarative buttons across any page
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-info-title]');
      if (!target) return;

      const title = target.getAttribute('data-info-title');
      if (title) {
        const message =
          target.getAttribute('data-info-desc') ||
          target.getAttribute('data-info-message') ||
          'Institutional action details and telemetry status.';
        const badge = target.getAttribute('data-info-badge') || undefined;
        const category = (target.getAttribute('data-info-category') as any) || 'info';
        const detailsStr = target.getAttribute('data-info-details');
        const details = detailsStr ? detailsStr.split('|').map(s => s.trim()).filter(Boolean) : undefined;
        const actionLabel = target.getAttribute('data-info-action') || undefined;

        showActionInfo({
          title,
          message,
          badge,
          category,
          details,
          actionLabel,
        });
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <ActionInfoContext.Provider value={{ showActionInfo, closeActionInfo, currentInfo }}>
      {children}

      {/* Global Interactive Information Modal / Banner */}
      {currentInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={closeActionInfo}
        >
          <div
            className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden p-6 relative animate-scale-up space-y-4"
            onClick={e => e.stopPropagation()}
            style={{ backdropFilter: 'blur(20px)' }}
          >
            {/* Close Button */}
            <button
              onClick={closeActionInfo}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-text-muted hover:text-text hover:bg-card-hover border border-transparent hover:border-border transition"
              title="Close Dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Category Icon */}
            <div className="flex items-start gap-3.5 pr-8">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md ${
                  currentInfo.category === 'danger'
                    ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20'
                    : currentInfo.category === 'warning'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20'
                    : currentInfo.category === 'success' || currentInfo.category === 'export'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
                    : currentInfo.category === 'placement'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20'
                    : currentInfo.category === 'audit'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/20'
                    : 'bg-gradient-to-br from-[#FF3B5C] to-[#10B981] shadow-[#FF3B5C]/20'
                }`}
              >
                {currentInfo.category === 'danger' && <AlertTriangle className="w-5 h-5" />}
                {currentInfo.category === 'warning' && <AlertTriangle className="w-5 h-5" />}
                {currentInfo.category === 'success' && <CheckCircle2 className="w-5 h-5" />}
                {currentInfo.category === 'export' && <Download className="w-5 h-5" />}
                {currentInfo.category === 'settings' && <Sliders className="w-5 h-5" />}
                {currentInfo.category === 'placement' && <Briefcase className="w-5 h-5" />}
                {currentInfo.category === 'audit' && <Shield className="w-5 h-5" />}
                {(!currentInfo.category || currentInfo.category === 'info') && <Sparkles className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-text leading-snug">
                    {currentInfo.title}
                  </h3>
                  {currentInfo.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                      {currentInfo.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">
                  <Activity className="w-3 h-3 text-[#10B981]" />
                  <span>EduPulse Telemetry &amp; Action Intelligence</span>
                </div>
              </div>
            </div>

            {/* Description Body */}
            <div className="p-3.5 rounded-2xl bg-bg/80 border border-border/70 text-xs text-text leading-relaxed">
              {currentInfo.message}
            </div>

            {/* Additional Bullet Details */}
            {currentInfo.details && currentInfo.details.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                  Operational Parameters &amp; Insights
                </span>
                <ul className="space-y-1.5 text-xs text-text-muted bg-card-hover/40 p-3 rounded-2xl border border-border/50">
                  {currentInfo.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#10B981] font-bold">✓</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-2 flex items-center justify-between gap-2.5 border-t border-border/60">
              <span className="text-[10px] text-text-muted flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" /> Live Institutional Telemetry
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeActionInfo}
                  className="px-4 py-2 rounded-xl border border-border text-text-muted hover:text-text hover:bg-card-hover text-xs font-semibold transition"
                >
                  Dismiss
                </button>

                {currentInfo.actionLabel && (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentInfo.onAction) currentInfo.onAction();
                      closeActionInfo();
                    }}
                    className="btn-watermelon text-xs py-2 px-4 shadow-sm"
                  >
                    <span>{currentInfo.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ActionInfoContext.Provider>
  );
};

export const useActionInfo = (): ActionInfoContextType => {
  const context = useContext(ActionInfoContext);
  if (!context) {
    throw new Error('useActionInfo must be used within an ActionInfoProvider');
  }
  return context;
};

