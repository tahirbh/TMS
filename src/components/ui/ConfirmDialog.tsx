import { useConfirmStore } from '../../store/confirmStore';
import { AlertTriangle, Trash2, Info, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

export default function ConfirmDialog() {
  const { isOpen, options, onConfirm, onCancel } = useConfirmStore();

  if (!isOpen) return null;

  const isDanger = options.type === 'danger';
  const isWarning = options.type === 'warning';

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className={cn(
          "bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-6 animate-in zoom-in-95 duration-200",
          "dark:bg-slate-900 dark:border-slate-800"
        )}
      >
        {/* Header Row */}
        <div className="flex items-start gap-4">
          <div 
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
              isDanger ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400" :
              isWarning ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" :
              "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
            )}
          >
            {isDanger ? <Trash2 size={22} /> :
             isWarning ? <AlertTriangle size={22} /> :
             <Info size={22} />}
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {options.title}
            </h3>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
              System Confirmation Requested
            </p>
          </div>
          <button 
            type="button" 
            onClick={onCancel} 
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message Content */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-350 leading-relaxed">
            {options.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 pt-2">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            className="text-xs rounded-xl font-bold dark:text-slate-300"
          >
            {options.cancelText}
          </Button>
          <Button 
            type="button" 
            onClick={onConfirm}
            className={cn(
              "rounded-xl px-5 font-bold text-xs gap-1.5 text-white shadow-lg",
              isDanger ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20" :
              isWarning ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20" :
              "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            )}
          >
            {isDanger ? <Trash2 size={13} /> :
             isWarning ? <AlertTriangle size={13} /> :
             <Info size={13} />}
            {options.confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
