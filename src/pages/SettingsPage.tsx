import { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useConfirmStore } from '../store/confirmStore';
import { supabase } from '../lib/supabase';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Lock, 
  Globe,
  Check,
  Trash2,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';

const SettingsPage = () => {
  const confirm = useConfirmStore(state => state.confirm);
  const { mode, isMacOS, toggleMode, toggleMacOS } = useThemeStore();
  const [purging, setPurging] = useState(false);

  const handlePurgeData = async () => {
    const confirmed1 = await confirm({
      title: 'Purge System Dummy Data',
      message: '⚠️ WARNING: This will delete ALL simulated fleet vehicles, workforce employees, sponsors, sites, trips, and uploaded documents to prepare your database for production data.\n\nAre you sure you want to proceed?',
      confirmText: 'Yes, Proceed',
      cancelText: 'Cancel',
      type: 'warning'
    });
    if (!confirmed1) return;

    const confirmed2 = await confirm({
      title: 'CRITICAL CONFIRMATION',
      message: '🚨 CRITICAL CONFIRMATION:\n\nAre you absolutely certain? This operation is permanent and cannot be undone.',
      confirmText: 'Yes, Clear All Data',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed2) return;

    setPurging(true);
    try {
      // 1. Purge trip records & ledger
      await supabase.from('trip_ledger').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await (supabase as any).from('trip_status_updates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('trips').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await (supabase as any).from('inspections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // 2. Purge orders
      await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 3. Purge labor mobilization & documents
      await supabase.from('labor_mobilization').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('breakdown_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 4. Purge vehicles
      await supabase.from('vehicles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 5. Purge workforce & profiles
      // Delete employees
      await (supabase as any).from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Delete driver records in driver (legacy driver table just in case)
      await supabase.from('drivers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Delete profiles that are not admin role
      await supabase.from('profiles').delete().neq('role', 'admin');

      // 6. Purge sponsors and sites
      await (supabase as any).from('sponsors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('sites').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      alert('🎉 System data successfully purged! All old dummy records have been cleared. You are ready to start with clean real-world data.');
    } catch (err: any) {
      alert(`Error purging system data: ${err.message}`);
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <SettingsIcon className="text-blue-600" size={32} />
          System Settings
        </h1>
        <p className="text-slate-500">Configure your personal workspace and enterprise preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-1">
          <SettingsNavButton active icon={Monitor} label="Appearance" />
          <SettingsNavButton icon={Bell} label="Notifications" />
          <SettingsNavButton icon={Lock} label="Security" />
          <SettingsNavButton icon={Globe} label="Localization" />
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Visual Experience</h3>
            
            <div className="space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Interface Mode</p>
              <div className="grid grid-cols-2 gap-4">
                <ThemeOption 
                  active={mode === 'light'} 
                  onClick={() => mode !== 'light' && toggleMode()}
                  icon={Sun}
                  label="Light Mode"
                  desc="Clean and professional"
                />
                <ThemeOption 
                  active={mode === 'dark'} 
                  onClick={() => mode !== 'dark' && toggleMode()}
                  icon={Moon}
                  label="Dark Mode"
                  desc="Reduced eye strain"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    MacOS Look-Alike Theme
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[8px] font-black uppercase">Premium</span>
                  </h4>
                  <p className="text-xs text-slate-500">Transforms the entire app into a high-end desktop experience.</p>
                </div>
                <button 
                  onClick={toggleMacOS}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    isMacOS ? "bg-blue-600" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                    isMacOS ? "left-7" : "left-1"
                  )} />
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Regional Support</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-700">Arabic / Hijri Support</p>
                  <p className="text-xs text-slate-500">Enable automatic Hijri date conversion across the platform.</p>
                </div>
                <Check className="text-emerald-500" />
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[32px] border border-red-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="text-rose-500" size={22} />
              Administrative Actions
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Purge Dummy Data</h4>
                  <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
                    Delete all seeded vehicles, drivers, labor staff, sponsors, sites, and documents to start entering clean, real-world data. Currently active administrator profiles will be preserved.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handlePurgeData}
                disabled={purging}
                className={cn(
                  "w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-lg flex items-center justify-center gap-2",
                  purging 
                    ? "bg-slate-400 cursor-not-allowed shadow-none" 
                    : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20 active:scale-[0.98]"
                )}
              >
                {purging ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Purging System Data...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Purge System Dummy Data
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const SettingsNavButton = ({ icon: Icon, label, active }: any) => (
  <button className={cn(
    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
    active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
  )}>
    <Icon size={18} />
    {label}
  </button>
);

const ThemeOption = ({ active, onClick, icon: Icon, label, desc }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "p-4 rounded-2xl border-2 text-left transition-all",
      active ? "border-blue-600 bg-blue-50/30" : "border-slate-100 hover:border-blue-200"
    )}
  >
    <Icon className={cn("mb-3", active ? "text-blue-600" : "text-slate-400")} size={24} />
    <p className="font-bold text-slate-900 text-sm">{label}</p>
    <p className="text-[10px] text-slate-500">{desc}</p>
  </button>
);

export default SettingsPage;
