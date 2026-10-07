import React from'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 variant?:'primary'|'secondary'|'outline'|'ghost'|'danger'|'success'|'white';
 size?:'sm'|'md'|'lg'|'icon';
 icon?: React.ReactNode;
 loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
 children,
 variant ='primary',
 size ='md',
 icon,
 loading = false,
 className ='',
 disabled,
 ...props
}) => {
 const baseStyles ='inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

 const variantStyles = {
 primary:'bg-sankara-800 hover:bg-sankara-900 text-white focus:ring-sankara-500 shadow-sm',
 secondary:'bg-slate-100 hover:bg-slate-200 text-slate-900 focus:ring-slate-400',
 outline:'border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-sankara-500',
 ghost:'hover:bg-slate-100 text-slate-700 focus:ring-slate-400',
 danger:'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm',
 success:'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm',
 white:'bg-white hover:bg-orange-50 text-orange-950 hover:text-orange-900 focus:ring-orange-500 shadow-md border border-orange-200 font-black',
 };

 const sizeStyles = {
 sm:'text-xs px-2.5 py-1.5 gap-1.5',
 md:'text-sm px-4 py-2 gap-2',
 lg:'text-base px-5 py-2.5 gap-2.5',
 icon:'p-2',
 };

 return (
 <button
 className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
 disabled={disabled || loading}
 {...props}
 >
 {loading ? (
 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"fill="none"viewBox="0 0 24 24">
 <circle className="opacity-25"cx="12"cy="12"r="10"stroke="currentColor"strokeWidth="4"/>
 <path className="opacity-75"fill="currentColor"d="M4 12a8 8 0 018-8v8H4z"/>
 </svg>
 ) : icon ? (
 <span className="shrink-0">{icon}</span>
 ) : null}
 {children}
 </button>
 );
};
