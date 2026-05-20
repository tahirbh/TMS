import { useThemeStore } from '../store/themeStore';
import MacOSLayout from './MacOSLayout';
import TopNav from './TopNav';
import { cn } from '../lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isMacOS, mode } = useThemeStore();

  if (isMacOS) {
    return <MacOSLayout>{children}</MacOSLayout>;
  }

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-300",
      mode === 'dark' ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      <TopNav />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
