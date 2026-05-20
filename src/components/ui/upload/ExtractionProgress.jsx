import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, ScanLine, Languages, CheckCircle2 } from 'lucide-react';

const steps = [
  { label: 'Uploading document...', icon: Loader2 },
  { label: 'Scanning & extracting text...', icon: ScanLine },
  { label: 'Translating Arabic to English...', icon: Languages },
  { label: 'Structuring fields...', icon: CheckCircle2 },
];

export default function ExtractionProgress({ currentStep }) {
  return (
    <div className="py-12 flex flex-col items-center">
      {/* Animated scanner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary mb-8"
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
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : isDone
                  ? 'text-accent'
                  : 'text-muted-foreground/40'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
              ) : isActive ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Loader2 className="w-5 h-5 shrink-0" />
                </motion.div>
              ) : (
                <step.icon className="w-5 h-5 shrink-0" />
              )}
              <span className="text-sm font-medium">{step.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}