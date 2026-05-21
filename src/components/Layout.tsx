import { useThemeStore } from '../store/themeStore';
import MacOSLayout from './MacOSLayout';
import TopNav from './TopNav';
import { cn } from '../lib/utils';
import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isMacOS, mode } = useThemeStore();

  // Apply .dark class to <html> so CSS selectors work globally
  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  if (isMacOS) {
    return <MacOSLayout>{children}</MacOSLayout>;
  }

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-300",
      mode === 'dark' ? "text-slate-100" : "text-slate-900"
    )}>
      <TopNav />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
