import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from './Router';
import { useThemeStore } from '../store/themeStore';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Search,
  AlertTriangle,
  Map as MapIcon,
  Bell,
  Monitor,
  ChevronDown,
  UserPlus,
  Package,
  CircleDollarSign,
  Wrench,
  Shield,
  Container,
  UserCheck,
  Radio,
  Navigation,
  HelpCircle,
  Info,
  BookOpen,
  Upload,
  Archive,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import FAQModal from './FAQModal';
import AboutModal from './AboutModal';

export const MENU_STRUCTURE = [
  {
    label: 'Operations',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: MapIcon, label: 'Control Tower', path: '/control-tower' },
      { icon: Package, label: 'Orders', path: '/orders' },
      { icon: Radio, label: 'Dispatch', path: '/dispatch' },
      { icon: Navigation, label: 'Trips', path: '/trips' },
    ]
  },
  {
    label: 'Fleet & Assets',
    items: [
      { icon: Truck, label: 'Vehicles', path: '/vehicles' },
      { icon: Container, label: 'Trailers', path: '/trailers' },
      { icon: Wrench, label: 'Fleet Combinations', path: '/fleet-combinations' },
      { icon: Settings, label: 'Breakdowns', path: '/breakdowns' },
    ]
  },
  {
    label: 'Workforce',
    items: [
      { icon: Users, label: 'Employee Master', path: '/employee-master' },
      { icon: Users, label: 'Drivers', path: '/drivers' },
      { icon: UserPlus, label: 'Labor', path: '/labor' },
      { icon: UserCheck, label: 'Mobilization', path: '/mobilization' },
      { icon: Users, label: 'Supervisors', path: '/supervisors' },
      { icon: Shield, label: 'Sponsors', path: '/sponsors' },
    ]
  },
  {
    label: 'Logistics & DMS',
    items: [
      { icon: FileText, label: 'DMS Engine', path: '/dms' },
      { icon: Search, label: 'Relational Search', path: '/search' },
      { icon: MapIcon, label: 'Sites', path: '/sites' },
      { icon: Shield, label: 'Gov Data Lookup', path: '/gov-lookup' },
    ]
  },
  {
    label: 'AI DMS',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dms-dashboard' },
      { icon: Upload, label: 'Upload Document', path: '/upload' },
      { icon: FileText, label: 'Documents Registry', path: '/documents' },
      { icon: Archive, label: 'Archived Documents', path: '/archived' },
      { icon: Sparkles, label: 'Sample Extractor', path: '/sample-results' },
    ]
  },
  {
    label: 'Financials',
    items: [
      { icon: CircleDollarSign, label: 'Trip Allowances', path: '/trip-allowances' },
    ]
  },
  {
    label: 'Knowledge',
    items: [
      { icon: BookOpen, label: 'System Spec & ERDs', path: '/knowledge' },
      { icon: HelpCircle, label: 'FAQ / SOP', path: '#faq' },
      { icon: Info, label: 'About TMS Pro', path: '#about' },
    ]
  },
  {
    label: 'Admin',
    items: [
      { icon: Users, label: 'Users', path: '/users' },
      { icon: AlertTriangle, label: 'Permissions', path: '/permissions' },
      { icon: Settings, label: 'Settings', path: '/settings' },
      { icon: Bell, label: 'Notifications', path: '/notifications' },
    ]
  }
];

export default function TopNav() {
  const { profile, signOut } = useAuth();
  const { navigate, pathname } = useRouter();
  const { mode, toggleMode, toggleMacOS } = useThemeStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const timeoutRef = useRef<any>(null);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 300);
  };

  return (
    <header className={cn(
      "h-16 border-b flex items-center justify-between px-6 sticky top-0 z-50 transition-colors duration-300",
      mode === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
    )}>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Truck size={20} />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight">TMS Pro</h1>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Enterprise</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {MENU_STRUCTURE.map((group) => (
            <div 
              key={group.label}
              className="relative"
              onMouseEnter={() => handleMouseEnter(group.label)}
              onMouseLeave={handleMouseLeave}
            >
              <button className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors",
                activeMenu === group.label 
                  ? "bg-blue-50 text-blue-600" 
                  : mode === 'dark' ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-blue-600"
              )}>
                {group.label}
                <ChevronDown size={14} className={cn("transition-transform", activeMenu === group.label && "rotate-180")} />
              </button>

              <AnimatePresence>
                {activeMenu === group.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={cn(
                      "absolute top-full left-0 mt-1 w-56 rounded-2xl border shadow-2xl py-2 z-[100]",
                      mode === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                    )}
                  >
                    {group.items.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          if (item.path.startsWith('#')) {
                            if (item.path === '#faq') setIsFaqOpen(true);
                            if (item.path === '#about') setIsAboutOpen(true);
                          } else {
                            navigate(item.path);
                          }
                          setActiveMenu(null);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                          pathname === item.path
                            ? "bg-blue-50 text-blue-600"
                            : mode === 'dark' ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                        )}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-4">
          <button 
            onClick={toggleMode}
            className={cn(
              "p-2 rounded-xl transition-colors",
              mode === 'dark' ? "bg-slate-800 text-yellow-400" : "bg-white border border-slate-200 text-slate-400"
            )}
          >
            <Monitor size={18} />
          </button>
          <button 
            onClick={toggleMacOS}
            className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
          >
            MacOS Mode
          </button>
          <button className={cn(
              "p-2 rounded-xl transition-colors",
              mode === 'dark' ? "bg-slate-800 text-slate-400" : "bg-white border border-slate-200 text-slate-400"
            )}>
            <Bell size={18} />
          </button>
        </div>

        <div className={cn(
          "flex items-center gap-3 pl-4 border-l",
          mode === 'dark' ? "border-slate-800" : "border-slate-200"
        )}>
          <div className="text-right hidden sm:block">
            <p className={cn("text-xs font-bold", mode === 'dark' ? "text-white" : "text-slate-900")}>
              {profile?.full_name || 'User'}
            </p>
            <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest">
              {profile?.role || 'Role'}
            </p>
          </div>
          <button
            onClick={signOut}
            className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <FAQModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </header>
  );
}
