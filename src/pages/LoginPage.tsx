import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, ShieldCheck, Globe, Navigation } from 'lucide-react';

const BACKGROUND_IMAGES = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69acd086051363a9fd033980/4a8ce3b35_image.png',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69acd086051363a9fd033980/850d807f5_image.png',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69acd086051363a9fd033980/a0f560c54_image.png',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69acd086051363a9fd033980/6caccf6d0_image.png',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69acd086051363a9fd033980/40c15bbe1_image.png'

];

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-slate-950 font-sans">
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        {BACKGROUND_IMAGES.map((img, idx) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentBg ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <img src={img} className="w-full h-full object-cover scale-110 animate-slow-zoom" alt="Background" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 opacity-60" />
          </div>
        ))}
      </div>

      {/* Left Content (Desktop Only) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/40">
            <Navigation className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl tracking-tighter">LogiCore</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em]">Platform</p>
          </div>
        </div>

        <div className="max-w-xl space-y-6">
          <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">
            Smart Logistics, <br />
            <span className="text-blue-500">Accelerated.</span>
          </h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            The next generation of transportation management. Real-time tracking,
            automated dispatch, and intelligent analytics for global fleet operations.
          </p>

          <div className="flex items-center gap-8 pt-6">
            <div className="flex flex-col">
              <span className="text-white font-black text-2xl">99.9%</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Uptime</span>
            </div>
            <div className="w-[1px] h-10 bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-white font-black text-2xl">24/7</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Support</span>
            </div>
            <div className="w-[1px] h-10 bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-white font-black text-2xl">10k+</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fleet Units</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Enterprise Grade Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Global Operations</span>
          </div>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="w-full lg:w-[480px] flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in fade-in slide-in-from-right-12 duration-1000">
          <div className="lg:hidden mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-3xl shadow-xl shadow-blue-600/20 mb-6 mx-auto">
              <Navigation className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">LogiCore</h1>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Fleet Management</p>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-black text-white tracking-tight">System Login</h2>
            <p className="text-slate-400 text-sm font-medium mt-1">Enter your credentials to access the tower.</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 mb-8 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-rose-200 text-sm font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Security Identity (Email)
              </label>
              <div className="relative group">
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="agent@logicore.io"
                  className="w-full bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl px-5 py-4 text-white placeholder-slate-600 text-sm font-bold focus:outline-none focus:border-blue-600 transition-all group-hover:border-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Access Code (Password)
              </label>
              <div className="relative group">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl px-5 py-4 pr-14 text-white placeholder-slate-600 text-sm font-bold focus:outline-none focus:border-blue-600 transition-all group-hover:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-800 checked:bg-blue-600 transition-all" />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-400 transition-colors">Keep Session Active</span>
              </label>
              <button type="button" className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">Recover Access</button>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] mt-4 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Initialize Access
                  <ShieldCheck size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
              Security Node: SA-Riyadh-01 <br />
              Encryption Protocol: AES-256-GCM
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s linear infinite alternate;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}} />
    </div>
  );
}
