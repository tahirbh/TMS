import { motion } from 'framer-motion';
import { Loader2, ScanLine, Languages, CheckCircle2 } from 'lucide-react';

const steps = [
  { label: 'Uploading document...', icon: Loader2 },
  { label: 'Scanning & extracting text...', icon: ScanLine },
  { label: 'Translating Arabic to English...', icon: Languages },
  { label: 'Structuring fields...', icon: CheckCircle2 },
];

export default function ExtractionProgress({ currentStep }: any) {
  return (
    <div className="py-12 flex flex-col items-center">
      {/* Animated scanner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 mb-8 shadow-md"
      />

      <div className="space-y-4 w-full max-w-sm">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                isActive
                  ? 'bg-indigo-50/50 text-indigo-600 border border-indigo-100/50'
                  : isDone
                  ? 'text-emerald-600 bg-emerald-50/30'
                  : 'text-slate-450/40'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : isActive ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Loader2 className="w-5 h-5 shrink-0" />
                </motion.div>
              ) : (
                <step.icon className="w-5 h-5 shrink-0" />
              )}
              <span className="text-xs font-black uppercase tracking-wider">{step.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
