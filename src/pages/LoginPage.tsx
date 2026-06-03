import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, ShieldCheck, Globe, Navigation, Scan, KeyRound, CheckCircle2, XCircle, Clock } from 'lucide-react';
import FaceScanner from '@/components/FaceScanner';
import { supabase } from '@/lib/supabase';

type ScanState = 'idle' | 'scanning' | 'recognized' | 'unrecognized' | 'pending';

const BACKGROUND_IMAGES = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69acd086051363a9fd033980/4a8ce3b35_image.png',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69acd086051363a9fd033980/850d807f5_image.png',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69acd086051363a9fd033980/a0f560c54_image.png',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69acd086051363a9fd033980/6caccf6d0_image.png',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69acd086051363a9fd033980/40c15bbe1_image.png',
];

export default function LoginPage() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<'password' | 'face'>('password');

  // Password login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Face scan state
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'warn' | 'error'>('idle');

  // Background slider
  const [currentBg, setCurrentBg] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrentBg((p) => (p + 1) % BACKGROUND_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  // Reset scan state when switching mode
  useEffect(() => {
    setScanState('idle');
    setScanMessage('');
    setScanStatus('idle');
    setError(null);
  }, [mode]);

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

  // Face recognition callbacks
  const handleRecognized = async (profile: any) => {
    setScanState('recognized');
    setScanStatus('success');

    // Check we have both email and stored password
    if (!profile.email || !profile.face_login_password) {
      setScanMessage(
        `✅ Face verified as ${profile.display_name}. ` +
        `No linked credentials found — please re-enroll with email & password, or use password login.`
      );
      return;
    }

    setScanMessage(`✅ ${profile.display_name} recognised — signing you in…`);

    // Auto sign-in: face is the biometric unlock, stored password is the key.
    // Identical concept to Face ID on a phone unlocking using the stored PIN internally.
    const { error } = await signIn(profile.email, profile.face_login_password);
    if (error) {
      // Password may have changed since enrollment — guide user to re-enroll
      setScanState('unrecognized');
      setScanStatus('error');
      setScanMessage(
        `⚠️ Face recognised as ${profile.display_name} but sign-in failed. ` +
        `Your password may have changed — please re-enroll via Admin → Face ID Enroll, or use password login.`
      );
    }
    // On success, AuthContext will detect the new session and redirect automatically
  };

  const handleUnrecognized = () => {
    setScanState('unrecognized');
    setScanStatus('error');
    setScanMessage('❌ Face not recognized. Please try again or use password login.');
    setTimeout(() => {
      setScanState('idle');
      setScanStatus('idle');
      setScanMessage('');
    }, 4000);
  };

  const handlePending = () => {
    setScanState('pending');
    setScanStatus('warn');
    setScanMessage('⏳ Your face profile is pending approval. Contact your administrator.');
    setTimeout(() => {
      setScanState('idle');
      setScanStatus('idle');
      setScanMessage('');
    }, 5000);
  };

  const scanStatusColor = {
    idle:    'text-cyan-300',
    success: 'text-emerald-400',
    warn:    'text-amber-400',
    error:   'text-red-400',
  }[scanStatus];

  const scanStatusIcon = {
    idle:    null,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    warn:    <Clock className="w-4 h-4 text-amber-400 shrink-0" />,
    error:   <XCircle className="w-4 h-4 text-red-400 shrink-0" />,
  }[scanStatus];

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-slate-950 font-sans">
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        {BACKGROUND_IMAGES.map((img, idx) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentBg ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={img} className="w-full h-full object-cover scale-110 animate-slow-zoom" alt="Background" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 opacity-60" />
          </div>
        ))}
      </div>

      {/* Left — Branding (desktop) */}
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
            Next-generation transportation management. Real-time tracking,
            automated dispatch, and intelligent analytics — now with biometric access.
          </p>
          <div className="flex items-center gap-8 pt-6">
            {[['99.9%', 'Uptime'], ['24/7', 'Support'], ['10k+', 'Fleet Units']].map(([val, label]) => (
              <div key={label} className="flex flex-col">
                <span className="text-white font-black text-2xl">{val}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
              </div>
            ))}
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

      {/* Right — Login Panel */}
      <div className="w-full lg:w-[520px] flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl animate-in fade-in slide-in-from-right-12 duration-1000">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-3xl shadow-xl shadow-blue-600/20 mb-5 mx-auto">
              <Navigation className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">LogiCore</h1>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Fleet Management</p>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-slate-800/60 rounded-2xl p-1 mb-8 gap-1">
            <button
              onClick={() => setMode('password')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                mode === 'password' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound size={14} /> Password
            </button>
            <button
              onClick={() => setMode('face')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                mode === 'face' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scan size={14} /> Face ID
            </button>
          </div>

          {/* ── PASSWORD MODE ── */}
          {mode === 'password' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight">System Login</h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Enter your credentials to access the tower.</p>
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 mb-6 animate-shake">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-rose-200 text-sm font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Security Identity (Email)</label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@logicore.io"
                    className="w-full bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl px-5 py-4 text-white placeholder-slate-600 text-sm font-bold focus:outline-none focus:border-blue-600 transition-all hover:border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Access Code (Password)</label>
                  <div className="relative group">
                    <input
                      id="login-password"
                      type={showPass ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl px-5 py-4 pr-14 text-white placeholder-slate-600 text-sm font-bold focus:outline-none focus:border-blue-600 transition-all hover:border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
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
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying…</>
                  ) : (
                    <>Initialize Access <ShieldCheck size={16} /></>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── FACE ID MODE ── */}
          {mode === 'face' && (
            <div className="flex flex-col items-center space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-black text-white tracking-tight">Face ID Login</h2>
                <p className="text-slate-400 text-sm font-medium mt-1">
                  {scanState === 'idle' ? 'Look at the camera — hold still for 2 seconds' : ''}
                  {scanState === 'scanning' ? 'Analysing biometric data…' : ''}
                  {scanState === 'recognized' ? 'Identity confirmed!' : ''}
                  {scanState === 'unrecognized' ? 'Face not recognised' : ''}
                  {scanState === 'pending' ? 'Approval pending' : ''}
                </p>
              </div>

              <FaceScanner
                scanState={scanState}
                setScanState={setScanState}
                onRecognized={handleRecognized}
                onUnrecognized={handleUnrecognized}
                onPending={handlePending}
              />

              {/* Result message */}
              {scanMessage && (
                <div className={`flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl px-4 py-3 w-full`}>
                  {scanStatusIcon}
                  <p className={`text-xs font-mono ${scanStatusColor} leading-relaxed`}>{scanMessage}</p>
                </div>
              )}

              {/* Retry button */}
              {(scanState === 'unrecognized' || scanState === 'pending') && (
                <button
                  onClick={() => { setScanState('idle'); setScanMessage(''); setScanStatus('idle'); }}
                  className="text-xs font-bold text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
                >
                  Try Again
                </button>
              )}

              <p className="text-[10px] text-slate-600 text-center font-mono">
                Make sure your face is well-lit and centred in the circle
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
              Security Node: SA-Riyadh-01 <br />
              Encryption Protocol: AES-256-GCM
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slow-zoom { from { transform: scale(1); } to { transform: scale(1.1); } }
        .animate-slow-zoom { animation: slow-zoom 20s linear infinite alternate; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
}
