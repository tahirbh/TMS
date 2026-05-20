

export function Label({ className, children, ...props }: any) {
  return (
    <label className={`text-xs font-bold text-slate-500 uppercase ${className}`} {...props}>
      {children}
    </label>
  );
}
