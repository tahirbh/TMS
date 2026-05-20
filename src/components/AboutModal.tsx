import { X, Sparkles, ShieldCheck, Globe2, Building, Ship } from 'lucide-react';
import { Button } from './ui/button';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  const verticals = [
    {
      title: "Logistics & Heavy Transport",
      desc: "Comprehensive heavy machinery, containers, tractor-trailer combinations, trip allowances, and live tracking across long-haul domestic and international routes.",
      icon: Ship,
      color: "text-blue-500 bg-blue-50 border-blue-100"
    },
    {
      title: "Oil & Gas Operations",
      desc: "Extreme safety compliance tracking, specialized rig mobilization coordination, driver safety gate checks, and hazardous material haul credentials audit systems.",
      icon: ShieldCheck,
      color: "text-emerald-500 bg-emerald-50 border-emerald-100"
    },
    {
      title: "Contracting & Construction",
      desc: "Assign earthmovers, mixers, and trailers to active site locations. Control dispatch orders and log breakdowns instantly to ensure uninterrupted site progress.",
      icon: Building,
      color: "text-amber-500 bg-amber-50 border-amber-100"
    },
    {
      title: "Workforce & HR Leasing",
      desc: "Handle massive rosters of drivers and laborers. Link workforce profiles automatically with legal sponsor registries (MOI verification) to ensure compliance.",
      icon: Globe2,
      color: "text-purple-500 bg-purple-50 border-purple-100"
    }
  ];

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header Block */}
        <div className="bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 text-white p-6 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">About TMS Pro</h2>
                <p className="text-[10px] text-teal-100 font-black uppercase tracking-widest mt-0.5">Enterprise Fleet & Workforce Mobilization</p>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
          
          {/* Main Visual Feature */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50 p-6 rounded-[24px] border border-slate-150">
            <div className="md:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100 text-teal-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                <Sparkles size={10} /> Modern Platform Dossier
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                The Next Generation of Fleet Orchestration
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                TMS Pro is a high-performance, secure, and intuitive transport management ecosystem. Purpose-built with a clean interface and robust data-linking protocols, it seamlessly automates heavy haul fleet dispatches, workforce compliance, and global document management.
              </p>
            </div>
            <div className="md:col-span-5 flex justify-center">
              <img 
                src="/about_illustration.png" 
                alt="About Verticals Illustration" 
                className="w-full max-w-[280px] h-auto object-contain rounded-2xl shadow-md border border-slate-100 bg-white p-1"
              />
            </div>
          </div>

          {/* Industry Application Verticals */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b pb-2">
              <Globe2 size={12} className="text-teal-600" /> Supported Industry Verticals
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verticals.map((vert, idx) => (
                <div key={idx} className="bg-white border border-slate-100 hover:border-slate-200 p-5 rounded-2xl shadow-sm transition-all flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${vert.color}`}>
                    <vert.icon size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-950 uppercase tracking-wider">{vert.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-medium">{vert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Stack / Platform Architecture highlights */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-[24px] border border-slate-900 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <ShieldCheck size={14} className="text-teal-400" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Premium Infrastructure Highlights
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[9px] text-teal-400 font-bold uppercase tracking-wider block">Security</span>
                <span className="text-[11px] font-black text-white block mt-1">Row-Level Security Policies</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[9px] text-teal-400 font-bold uppercase tracking-wider block">Database</span>
                <span className="text-[11px] font-black text-white block mt-1">Supabase Realtime Ingress</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[9px] text-teal-400 font-bold uppercase tracking-wider block">UI Design</span>
                <span className="text-[11px] font-black text-white block mt-1">Smooth Micro-Animations</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50">
          <Button 
            onClick={onClose}
            className="rounded-2xl px-6 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition"
          >
            Acknowledge & Close
          </Button>
        </div>

      </div>
    </div>
  );
}
