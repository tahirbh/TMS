import React from 'react';
import { FileText, Calendar, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface DocumentCardProps {
  name: string;
  type: string;
  expiryDate: string;
  status: 'valid' | 'near_expiry' | 'expired';
  selected?: boolean;
  onToggle?: () => void;
  onView?: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  name,
  type,
  expiryDate,
  status,
  selected,
  onToggle,
  onView
}) => {
  const statusConfig = {
    valid: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    near_expiry: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    expired: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' }
  };

  const config = statusConfig[status];

  return (
    <div 
      className={cn(
        "group relative p-5 rounded-[28px] border-2 transition-all cursor-pointer",
        selected ? "border-blue-500 bg-blue-50/30 ring-4 ring-blue-500/10" : "border-slate-100 bg-white hover:shadow-xl hover:border-blue-200"
      )}
      onClick={onToggle}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", config.bg, config.color)}>
          <FileText size={24} />
        </div>
        <div className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          selected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200"
        )}>
          {selected && <CheckCircle2 size={14} />}
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="font-bold text-slate-900 truncate">{name}</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{type}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className={config.color} />
          <span className="text-[10px] font-bold text-slate-600">{expiryDate}</span>
        </div>
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter",
          config.bg, config.color
        )}>
          {status}
        </span>
      </div>

      {onView && (
        <button 
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-[28px] text-white font-bold gap-2"
        >
          <FileText size={18} />
          Open Viewer
        </button>
      )}
    </div>
  );
};
