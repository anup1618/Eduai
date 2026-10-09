import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  colorScheme?: 'teal' | 'blue' | 'dynamic' | 'rose' | 'amber';
  height?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  showPercentage = true,
  colorScheme = 'dynamic',
  height = 'md',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const getColor = () => {
    if (colorScheme === 'teal') return 'bg-teal-500';
    if (colorScheme === 'blue') return 'bg-blue-600';
    if (colorScheme === 'rose') return 'bg-rose-500';
    if (colorScheme === 'amber') return 'bg-amber-500';

    // Dynamic based on percentage
    if (percentage >= 75) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-teal-500';
    if (percentage >= 45) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getHeight = () => {
    if (height === 'sm') return 'h-1.5';
    if (height === 'lg') return 'h-3';
    return 'h-2';
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="font-medium text-slate-700">{label}</span>
          <div className="flex items-center gap-1.5">
            {sublabel && <span className="text-slate-400 text-[11px]">{sublabel}</span>}
            {showPercentage && <span className="font-semibold text-slate-900">{percentage}%</span>}
          </div>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${getHeight()}`}>
        <div
          className={`${getHeight()} rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
