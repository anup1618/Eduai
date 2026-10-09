import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trendText?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'warning';
  badge?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trendText,
  trendType = 'neutral',
  badge,
  onClick,
}) => {
  const getTrendStyle = () => {
    switch (trendType) {
      case 'positive':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'negative':
        return 'text-rose-700 bg-rose-50 border-rose-100';
      case 'warning':
        return 'text-amber-700 bg-amber-50 border-amber-100';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-teal-500/50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100/60">{icon}</div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        {badge && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {badge}
          </span>
        )}
      </div>
      {(subtitle || trendText) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trendText && (
            <span className={`inline-flex items-center font-medium px-1.5 py-0.5 rounded border text-[11px] ${getTrendStyle()}`}>
              {trendText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
