
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: any) {
  return (
    <div 
      className={cn("bg-white border border-slate-100 shadow-sm rounded-3xl p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}
