

export function Badge({ className, children, variant = 'default', ...props }: any) {
  const styles = variant === 'secondary' 
    ? 'bg-slate-100 text-slate-600'
    : variant === 'outline'
    ? 'border border-slate-200 text-slate-600'
    : 'bg-indigo-600 text-white';
  return (
    <span 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${styles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
