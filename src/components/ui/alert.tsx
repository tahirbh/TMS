

export function Alert({ className, children, ...props }: any) {
  return (
    <div className={`p-4 rounded-3xl border border-slate-100 bg-slate-50 flex gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AlertTitle({ className, children, ...props }: any) {
  return (
    <h5 className={`font-black text-slate-800 text-xs ${className}`} {...props}>
      {children}
    </h5>
  );
}

export function AlertDescription({ className, children, ...props }: any) {
  return (
    <div className={`text-slate-505 text-[11px] font-medium leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
}
