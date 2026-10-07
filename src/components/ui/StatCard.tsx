import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'primary' | 'purple' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  badgeText,
  badgeVariant = 'success',
  icon: Icon,
  iconColor = 'text-orange-600',
  bgColor = 'bg-orange-50',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-orange-100/90 bg-white p-5 shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-md flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div>
        {/* Top Header: Title & Icon */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className={`rounded-xl p-2.5 shrink-0 ${bgColor} transition-transform duration-300 group-hover:scale-110 border border-orange-200/50`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>

        {/* Value */}
        <div className="mt-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 block">
            {value}
          </span>
        </div>
      </div>

      {/* Footer: Subtitle & Tag */}
      {(subtitle || badgeText) && (
        <div className="mt-3 pt-3 border-t border-orange-50 flex items-center justify-between gap-2 text-xs">
          {subtitle && (
            <span className="text-[11px] text-slate-500 font-semibold truncate">
              {subtitle}
            </span>
          )}
          {badgeText && (
            <span
              className={`text-[10px] font-extrabold shrink-0 px-2 py-0.5 rounded-full border ${
                badgeVariant === 'success'
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : badgeVariant === 'warning'
                  ? 'text-amber-800 bg-amber-50 border-amber-200'
                  : badgeVariant === 'purple'
                  ? 'text-purple-800 bg-purple-50 border-purple-200'
                  : 'text-orange-800 bg-orange-50 border-orange-200'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
