import { X, BookOpen, HelpCircle, Activity, CheckCircle, Sparkles, HelpCircle as QuestionIcon } from 'lucide-react';
import { Button } from './ui/button';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
  if (!isOpen) return null;

  const sopSteps = [
    {
      title: "1. Workforce Enrollment",
      desc: "Upload a Muqeem scan (PDF/Image) or perform a bulk CSV import. The system validates residency details and performs a pre-flight registration check to auto-create legal sponsors.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "2. Fleet Combination",
      desc: "Link heavy-duty tractors (vehicles) with trailers to construct active fleet combinations. Assign licensed driver profiles to active units inside the Asset console.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "3. Dispatch & Control Tower",
      desc: "Assign orders to fleet combinations. Dispatchers configure weather route maps, track progress, manage trip allowances, and monitor real-time breakdowns.",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const qnaList = [
    {
      q: "Why is Sponsor MOI registration mandatory during enrollment?",
      a: "TMS Pro operates on strict referential integrity. In Saudi Arabia and the GCC, every worker must be legally tied to a sponsor (Sponsor MOI). The pre-flight sponsor auto-creation checks if the MOI is registered; if not, it instantly provisions the sponsor to prevent database constraint locks."
    },
    {
      q: "How does the AI OCR extractor read Muqeem documents?",
      a: "Our backend document ingestion pipeline parses layout structures and performs key-value pair mapping on Muqeem scanned receipts. It extracts Arabic and English fields including Full Name, Iqama Number, Hijri DOB, Hijri Expiry, Profession, and Nationality."
    },
    {
      q: "How do we resolve email signup rate limit errors?",
      a: "To register large numbers of workforce employees back-to-back, we securely delegate signups to our backend Edge Function. This bypasses client-side signup caps and allows up to 400+ employees to be imported simultaneously."
    }
  ];

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header Block */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">SOP & FAQ Learning Module</h2>
                <p className="text-[10px] text-blue-100 font-black uppercase tracking-widest mt-0.5">Platform Operations Manual & Guides</p>
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
          
          {/* Visual Highlight Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50 p-6 rounded-[24px] border border-slate-150">
            <div className="md:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                <Sparkles size={10} /> Active Learning
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Mastering the TMS Pro Ecosystem
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Our Standard Operating Procedure (SOP) ensures complete data integrity, legal compliance with labor regulations, and highly efficient fleet distribution. Study this module to leverage AI extraction and dispatch pipelines successfully.
              </p>
            </div>
            <div className="md:col-span-5 flex justify-center">
              <img 
                src="/faq_illustration.png" 
                alt="SOP Operations Illustration" 
                className="w-full max-w-[280px] h-auto object-contain rounded-2xl shadow-md border border-slate-100 bg-white p-1"
              />
            </div>
          </div>

          {/* Standard Operating Procedure (SOP) */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b pb-2">
              <Activity size={12} className="text-indigo-500" /> Standard Operating Procedure (SOP)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sopSteps.map((step, idx) => (
                <div key={idx} className="bg-white border border-slate-100 hover:border-slate-200 p-5 rounded-2xl shadow-sm transition-all flex flex-col space-y-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${step.color} text-white flex items-center justify-center text-xs font-black`}>
                    0{idx+1}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-950 uppercase tracking-wider">{step.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works Pipeline */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-[24px] border border-indigo-950 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <CheckCircle size={14} className="text-emerald-400" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Automated System Pipeline Flow
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block">Step 01</span>
                <span className="text-[11px] font-black text-white block mt-1">Upload Muqeem / CSV</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block">Step 02</span>
                <span className="text-[11px] font-black text-white block mt-1">Sponsor Validation Check</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block">Step 03</span>
                <span className="text-[11px] font-black text-white block mt-1">Asset link & Combination</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block">Step 04</span>
                <span className="text-[11px] font-black text-white block mt-1">Active Operations Ingress</span>
              </div>
            </div>
          </div>

          {/* Interactive Q&A Accordion */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b pb-2">
              <HelpCircle size={12} className="text-purple-500" /> Platform Knowledgebase & Q&A
            </h4>

            <div className="space-y-4">
              {qnaList.map((item, idx) => (
                <div key={idx} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl p-5 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <QuestionIcon size={12} />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">{item.q}</h5>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed font-medium">{item.a}</p>
                    </div>
                  </div>
                </div>
              ))}
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
