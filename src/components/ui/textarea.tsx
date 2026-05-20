import React from 'react';

export const Textarea = React.forwardRef(({ className, ...props }: any, ref: any) => {
  return (
    <textarea
      ref={ref}
      className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all min-h-[80px] ${className}`}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
