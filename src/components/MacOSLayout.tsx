import { useState, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useAuth } from '../context/AuthContext';
import { useRouter } from './Router';
import { 
  Wifi,
  Battery,
  Search,
  LayoutDashboard,
  Truck,
  Users,
  FileText,
  Settings,
  LogOut,
  UserCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { MENU_STRUCTURE } from './TopNav';
import FAQModal from './FAQModal';
import AboutModal from './AboutModal';

const DockItem = ({ icon: Icon, label, active, onClick }: any) => (
  <motion.div
    whileHover={{ y: -10, scale: 1.2 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={cn(
      "relative group cursor-pointer p-3 rounded-2xl transition-all duration-300",
      active ? "bg-white/20 shadow-lg backdrop-blur-md" : "hover:bg-white/10"
    )}
  >
    <Icon className="w-6 h-6 text-white" />
    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {label}
    </span>
    {active && (
      <motion.div 
        layoutId="dock-dot"
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
      />
    )}
  </motion.div>
);

const MacOSLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode, toggleMacOS } = useThemeStore();
  const { signOut } = useAuth();
  const { navigate, pathname } = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAppleMenu, setShowAppleMenu] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Truck, label: 'Fleet Master', path: '/vehicle-master' },
    { icon: Users, label: 'Employee Master', path: '/employee-master' },
    { icon: FileText, label: 'DMS Engine', path: '/dms' },
    { icon: Search, label: 'Relational Search', path: '/search' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className={cn(
      "fixed inset-0 overflow-hidden flex flex-col font-sans",
      mode === 'dark' ? "bg-[#1e1e1e]" : "bg-[#f5f5f7]"
    )}>
      {/* Dynamic Wallpaper Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[120px]" />
      </div>

      {/* Menu Bar */}
      <header className="h-8 bg-white/10 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 text-xs font-medium text-white z-50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowAppleMenu(!showAppleMenu)}
              className="font-bold flex items-center gap-1 hover:bg-white/20 px-2 py-0.5 rounded transition"
            >
               <span className="ml-1">TMS Pro</span>
            </button>
            {showAppleMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[#2d2d2d]/90 backdrop-blur-2xl border border-white/10 rounded-lg shadow-2xl py-1 z-[100] text-white">
                <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 transition text-[11px]">About TMS Pro</button>
                <div className="h-px bg-white/10 my-1 mx-2" />
                <button 
                  onClick={() => { toggleMacOS(); setShowAppleMenu(false); }}
                  className="w-full text-left px-4 py-1.5 hover:bg-blue-600 transition text-[11px] font-bold text-orange-400"
                >
                  Exit MacOS Mode
                </button>
                <div className="h-px bg-white/10 my-1 mx-2" />
                <button onClick={signOut} className="w-full text-left px-4 py-1.5 hover:bg-blue-600 transition text-[11px]">Log Out...</button>
              </div>
            )}
          </div>

          {/* Functional Menus */}
          {MENU_STRUCTURE.map((group) => (
            <div key={group.label} className="relative group/menu">
              <button className="px-2 py-0.5 hover:bg-white/20 rounded transition opacity-90 group-hover/menu:opacity-100">
                {group.label}
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#2d2d2d]/90 backdrop-blur-2xl border border-white/10 rounded-lg shadow-2xl py-1 z-[100] text-white opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200">
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
                    }}
                    className="w-full flex items-center gap-3 px-4 py-1.5 hover:bg-blue-600 transition text-[11px]"
                  >
                    <item.icon size={12} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-3.5 h-3.5" />
            <Search className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative p-6 overflow-hidden z-10 flex flex-col items-center">
        <motion.div 
          key={pathname}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={cn(
            "w-full max-w-7xl h-full rounded-2xl shadow-2xl overflow-hidden border flex flex-col backdrop-blur-xl",
            mode === 'dark' ? "bg-black/40 border-white/10" : "bg-white/70 border-white/20"
          )}
        >
          {/* Window Title Bar */}
          <div className="h-10 flex items-center px-4 border-b border-white/10 shrink-0">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 text-center text-sm font-medium opacity-60">
              Enterprise Fleet Management
            </div>
          </div>
          
          {/* Page Content */}
          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>
        </motion.div>
      </main>

      <footer className="h-16 flex items-center justify-center pb-2 z-50">
        <div className="flex items-center gap-1 px-2 py-1.5 bg-black/20 backdrop-blur-2xl rounded-[20px] border border-white/10 shadow-2xl">
          {navItems.map((item) => (
            <DockItem 
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={pathname === item.path}
              onClick={() => {
                console.log('Navigating to:', item.path);
                navigate(item.path);
              }}
            />
          ))}
          <div className="w-px h-6 bg-white/20 mx-1" />
          <DockItem 
            icon={UserCircle} 
            label="Settings" 
            active={pathname === '/settings'}
            onClick={() => navigate('/settings')}
          />
          <DockItem 
            icon={LogOut} 
            label="Logout" 
            onClick={signOut}
          />
        </div>
      </footer>

      <FAQModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};

export default MacOSLayout;
