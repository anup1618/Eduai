import React from 'react';
import { RiskLevel } from '../../types/risk';

interface BadgeProps {
  label: string;
  variant?: 'academicRisk' | 'placementRisk' | 'segment' | 'status' | 'default';
  riskLevel?: RiskLevel;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  riskLevel,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-1 text-xs font-semibold';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (variant === 'academicRisk' || variant === 'placementRisk' || riskLevel) {
    const level = riskLevel || label;
    switch (level) {
      case 'High':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/80';
        break;
      case 'Moderate':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/80';
        break;
      case 'Low':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
        break;
      case 'Insufficient Data':
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        break;
    }
  } else if (variant === 'status') {
    switch (label) {
      case 'Completed':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'In Progress':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'Planned':
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
      case 'Follow-up Needed':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-tight transition-colors ${sizeClasses} ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
};
