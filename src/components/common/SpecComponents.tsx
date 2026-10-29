import React from 'react';
import { ArrowUpRight, LucideIcon } from 'lucide-react';

// ─── SPEC KPI CARD ────────────────────────────────────────────────────────────
// small icon in rounded-square tinted badge (accent at 12% opacity)
// status chip on top right with tinted background of status colour
// big number (28-36px bold)
// small muted caption
// circular progress ring or mini bar where percentage exists
// small uppercase label with arrow icon at the bottom
// clicking navigates to its detail page
// col-span-12 sm:col-span-6 lg:col-span-3

interface SpecKpiCardProps {
  icon: React.ReactNode;
  statusChip: {
    text: string;
    variant?: 'success' | 'warning' | 'danger' | 'accent' | 'neutral';
  };
  number: React.ReactNode;
  caption: string;
  label: string;
  percent?: number;
  onClick?: () => void;
  className?: string;
}

export const SpecKpiCard: React.FC<SpecKpiCardProps> = ({
  icon,
  statusChip,
  number,
  caption,
  label,
  percent,
  onClick,
  className = '',
}) => {
  const statusColors = {
    success: 'bg-status-success/15 text-status-success border-status-success/30',
    warning: 'bg-status-warning/15 text-status-warning border-status-warning/30',
    danger: 'bg-status-danger/15 text-status-danger border-status-danger/30',
    accent: 'bg-accent/15 text-accent border-accent/30',
    neutral: 'bg-border text-text-muted border-border',
  };

  const ringRadius = 14;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = percent !== undefined
    ? ringCircumference - (Math.min(100, Math.max(0, percent)) / 100) * ringCircumference
    : 0;

  return (
    <div
      onClick={onClick}
      className={`spec-card motion-card col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col justify-between group cursor-pointer ${className}`}
    >
      {/* Top Row: Icon Badge & Status Chip */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent/12 border border-accent/25 flex items-center justify-center text-accent transition-transform group-hover:scale-105">
          {icon}
        </div>
        <span
          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            statusColors[statusChip.variant || 'accent']
          }`}
        >
          {statusChip.text}
        </span>
      </div>

      {/* Middle: Big Number & Mini Progress / Ring */}
      <div className="flex items-baseline justify-between mb-1">
        <div className="kpi-number group-hover:text-accent transition-colors">
          {number}
        </div>

        {percent !== undefined && (
          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r={ringRadius}
                fill="none"
                className="stroke-border"
                strokeWidth="3.5"
              />
              <circle
                cx="18"
                cy="18"
                r={ringRadius}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3.5"
                strokeDasharray={ringCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute text-[9px] font-bold text-text-muted">
              {Math.round(percent)}%
            </span>
          </div>
        )}
      </div>

      {/* Caption */}
      <p className="text-xs text-text-muted truncate mb-4">{caption}</p>

      {/* Bottom: Uppercase Label with Arrow Icon */}
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span className="label-spec text-[10px] tracking-spec-label font-semibold">
          {label}
        </span>
        <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
    </div>
  );
};

// ─── SPEC PAGE HEADER ─────────────────────────────────────────────────────────
// Large bold title (28-32px bold) with a small semester chip beside it
// Muted welcome line below ("Welcome back, <Name> · <Branch> · <Roll>")
// Right-aligned status pill ("Active Session · 2025-26" and a standing chip)

interface SpecPageHeaderProps {
  title: string;
  semesterChip?: string;
  subtitle?: string;
  sessionText?: string;
  standingChip?: {
    text: string;
    variant?: 'success' | 'warning' | 'danger' | 'accent' | 'neutral';
  };
  actions?: React.ReactNode;
}

export const SpecPageHeader: React.FC<SpecPageHeaderProps> = ({
  title,
  semesterChip,
  subtitle,
  sessionText = 'Active Session · 2025-26',
  standingChip,
  actions,
}) => {
  const statusColors = {
    success: 'bg-status-success/15 text-status-success border-status-success/30',
    warning: 'bg-status-warning/15 text-status-warning border-status-warning/30',
    danger: 'bg-status-danger/15 text-status-danger border-status-danger/30',
    accent: 'bg-accent/15 text-accent border-accent/30',
    neutral: 'bg-border text-text-muted border-border',
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Left Title & Welcome Line */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="title-page">{title}</h1>
          {semesterChip && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent/12 text-accent border border-accent/25">
              {semesterChip}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-text-muted mt-1">{subtitle}</p>
        )}
      </div>

      {/* Right-aligned Status Pill & Standing */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {actions}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm">
          <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
          <span className="text-xs text-text-muted font-medium">{sessionText}</span>
          {standingChip && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                statusColors[standingChip.variant || 'success']
              }`}
            >
              {standingChip.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── SPEC PROGRESS BAR ────────────────────────────────────────────────────────
// 6px rounded, accent fill on a --border track

export const SpecProgressBar: React.FC<{
  value: number;
  max?: number;
  className?: string;
  fillClassName?: string;
}> = ({ value, max = 100, className = '', fillClassName = 'bg-accent' }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`h-1.5 w-full bg-border rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${fillClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};
