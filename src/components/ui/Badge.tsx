import React from'react';

interface BadgeProps {
 children: React.ReactNode;
 variant?:'primary'|'success'|'warning'|'danger'|'neutral'|'purple'|'amber';
 size?:'sm'|'md'|'lg';
 className?: string;
 dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
 children,
 variant ='neutral',
 size ='md',
 className ='',
 dot = false
}) => {
 const variantStyles = {
 primary:'bg-sky-50 text-sky-700 border-sky-200',
 success:'bg-emerald-50 text-emerald-700 border-emerald-200',
 warning:'bg-amber-50 text-amber-700 border-amber-200',
 danger:'bg-rose-50 text-rose-700 border-rose-200',
 purple:'bg-purple-50 text-purple-700 border-purple-200',
 amber:'bg-orange-50 text-orange-700 border-orange-200',
 neutral:'bg-slate-100 text-slate-700 border-slate-200',
 };

 const sizeStyles = {
 sm:'text-[11px] px-2 py-0.5 font-medium',
 md:'text-xs px-2.5 py-1 font-medium',
 lg:'text-sm px-3 py-1.5 font-medium'
 };

 const dotStyles = {
 primary:'bg-sky-500',
 success:'bg-emerald-500',
 warning:'bg-amber-500',
 danger:'bg-rose-500',
 purple:'bg-purple-500',
 amber:'bg-orange-500',
 neutral:'bg-slate-400'
 };

 return (
 <span className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
 {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />}
 {children}
 </span>
 );
};
