import React from'react';
import { useApp } from'../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from'lucide-react';

export const ToastContainer: React.FC = () => {
 const { toasts, removeToast } = useApp();

 if (toasts.length === 0) return null;

 return (
 <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
 {toasts.map((toast) => {
 const isSuccess = toast.type ==='success';
 const isError = toast.type ==='error';
 const isWarning = toast.type ==='warning';

 return (
 <div
 key={toast.id}
 className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border p-4 shadow-origin-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${
 isSuccess
 ?'border-emerald-200 bg-white/95 text-emerald-900'
 : isError
 ?'border-rose-200 bg-white/95 text-rose-900'
 : isWarning
 ?'border-amber-200 bg-white/95 text-amber-900'
 :'border-slate-200 bg-white/95 text-slate-900'
 }`}
 >
 <div className="flex items-center gap-3">
 {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0"/>}
 {isError && <AlertCircle className="h-5 w-5 text-rose-600 shrink-0"/>}
 {isWarning && <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0"/>}
 {!isSuccess && !isError && !isWarning && <Info className="h-5 w-5 text-sky-600 shrink-0"/>}
 <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
 </div>

 <button
 onClick={() => removeToast(toast.id)}
 className="text-slate-400 hover:text-slate-700 shrink-0"
 >
 <X className="h-4 w-4"/>
 </button>
 </div>
 );
 })}
 </div>
 );
};
