import { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { faceProfilesService, type FaceProfile } from '@/lib/faceProfilesService';
import { supabase } from '@/lib/supabase';
import {
  UserPlus, Trash2, CheckCircle, XCircle, Clock,
  Camera, Scan, RefreshCw, Eye, EyeOff, ShieldCheck, Globe,
} from 'lucide-react';

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

export default function FaceEnrollPage() {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [enrolling, setEnrolling]       = useState(false);
  const [profiles, setProfiles]         = useState<FaceProfile[]>([]);
  const [loading, setLoading]           = useState(true);

  // Form
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [role, setRole]           = useState('admin');

  const [status, setStatus]       = useState('');
  const [statusType, setStatusType] = useState<'info' | 'ok' | 'err'>('info');
  const [preview, setPreview]     = useState<string | null>(null);

  const setMsg = (msg: string, type: 'info' | 'ok' | 'err' = 'info') => {
    setStatus(msg); setStatusType(type);
  };

  // ── Load models + profiles ──────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setMsg('✅ AI models loaded — camera ready', 'ok');
      } catch {
        setMsg('❌ Failed to load AI models — check network', 'err');
      }
    };
    init();
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await faceProfilesService.listAll();
      setProfiles(data);
    } catch (e: any) {
      setMsg(`Failed to load profiles: ${e.message}`, 'err');
    } finally {
      setLoading(false);
    }
  };

  // ── Camera ──────────────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 640, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      setPreview(null);
      setMsg('📷 Camera active — click Capture & Enroll when ready', 'info');
    } catch {
      setMsg('❌ Camera access denied', 'err');
    }
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
    setPreview(null);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Enrol ───────────────────────────────────────────────────────────────────
  const enroll = async () => {
    if (!name.trim())     return setMsg('⚠️ Full name is required', 'err');
    if (!email.trim())    return setMsg('⚠️ Email is required — it is the login identity', 'err');
    if (!password.trim()) return setMsg('⚠️ Password is required for auto sign-in on face match', 'err');
    if (!cameraActive)    return setMsg('⚠️ Start the camera first', 'err');
    if (!modelsLoaded)    return setMsg('⚠️ AI models still loading…', 'info');

    setEnrolling(true);
    setMsg('🔍 Detecting face — hold still…', 'info');

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current!, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) {
        setMsg('❌ No face detected — ensure good lighting, face the camera directly', 'err');
        setEnrolling(false);
        return;
      }

      // Capture mirrored snapshot
      const canvas = document.createElement('canvas');
      canvas.width  = videoRef.current!.videoWidth;
      canvas.height = videoRef.current!.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current!, -canvas.width, 0);
      const snapshot = canvas.toDataURL('image/jpeg', 0.80);
      setPreview(snapshot);

      const descriptor = Array.from(detection.descriptor);

      // Look up profile_id from profiles table (optional link)
      const { data: pRows } = await (supabase as any)
        .from('profiles')
        .select('id')
        .ilike('email', email.trim())
        .limit(1);
      const profile_id = pRows?.[0]?.id ?? undefined;

      // Persist to Supabase — accessible from any device globally
      await faceProfilesService.create({
        display_name:   name.trim(),
        email:          email.trim().toLowerCase(),
        role,
        face_descriptor: descriptor,
        face_auth_key:   password,   // stored for auto sign-in on face match
        snapshot_url:    snapshot,
        profile_id,
        status:          'approved',
      });

      setMsg(`✅ "${name}" enrolled in Supabase — Face ID works on all devices now!`, 'ok');
      setName(''); setEmail(''); setPassword('');
      await loadProfiles();
      stopCamera();
    } catch (err: any) {
      setMsg(`❌ Enrollment failed: ${err.message}`, 'err');
    } finally {
      setEnrolling(false);
    }
  };

  // ── Profile management ──────────────────────────────────────────────────────
  const deleteProfile = async (id: string, dname: string) => {
    if (!confirm(`Remove Face ID for "${dname}"? They must use password login until re-enrolled.`)) return;
    await faceProfilesService.delete(id);
    await loadProfiles();
    setMsg(`🗑️ "${dname}" removed`, 'info');
  };

  const toggleStatus = async (p: FaceProfile) => {
    const next = p.status === 'approved' ? 'pending' : 'approved';
    await faceProfilesService.update(p.id, { status: next });
    await loadProfiles();
  };

  // ── Colours ─────────────────────────────────────────────────────────────────
  const bg   = { info: 'bg-cyan-900/20 border-cyan-500/30',   ok: 'bg-emerald-900/20 border-emerald-500/30',   err: 'bg-red-900/20 border-red-500/30'   }[statusType];
  const text = { info: 'text-cyan-300',                        ok: 'text-emerald-300',                           err: 'text-red-300'                       }[statusType];

  const statusIcon = (s: string) =>
    s === 'approved' ? <CheckCircle className="w-4 h-4 text-emerald-400" />
    : s === 'rejected' ? <XCircle className="w-4 h-4 text-red-400" />
    : <Clock className="w-4 h-4 text-amber-400" />;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Scan className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Face ID Enrollment</h1>
            <p className="text-slate-400 text-sm flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Profiles stored in Supabase — works globally on all devices
            </p>
          </div>
        </div>

        {/* How it works banner */}
        <div className="bg-blue-950/50 border border-blue-500/20 rounded-2xl p-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-200">Global Biometric Login</p>
            <p className="text-xs text-blue-300/70 mt-0.5 leading-relaxed">
              Email is the identity. Face scan + stored password = automatic sign-in on any device, anywhere.
              Same concept as Face ID on a phone — the face unlocks the stored key.
            </p>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div className={`border rounded-2xl px-4 py-3 ${bg}`}>
            <p className={`text-sm font-mono ${text}`}>{status}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Enroll form ── */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" /> Enroll New User
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Full Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tahir Farooq"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors" />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                  Email * <span className="text-cyan-500 normal-case font-normal">(central login identity)</span>
                </label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tahir@company.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors" />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                  Login Password * <span className="text-cyan-500 normal-case font-normal">(face unlock key)</span>
                </label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors" />
                  <button type="button" onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-600 mt-1 ml-1">Same password the user uses for manual login</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="hr">HR</option>
                  <option value="driver">Driver</option>
                  <option value="labor">Labor</option>
                </select>
              </div>
            </div>

            {/* Camera preview */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-square max-h-56">
              {preview ? (
                <div className="relative w-full h-full">
                  <img src={preview} className="w-full h-full object-cover" alt="Captured" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-500/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      ✓ Face Captured
                    </span>
                  </div>
                </div>
              ) : (
                <video ref={videoRef} autoPlay muted playsInline
                  className={`w-full h-full object-cover scale-x-[-1] ${!cameraActive ? 'hidden' : ''}`} />
              )}
              {!cameraActive && !preview && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Camera className="w-10 h-10 opacity-30" />
                  <p className="text-xs font-mono">Start camera to capture face</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!cameraActive ? (
                <button onClick={startCamera}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4" /> Start Camera
                </button>
              ) : (
                <button onClick={stopCamera}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
              )}
              <button onClick={enroll} disabled={enrolling || !modelsLoaded || !cameraActive}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                {enrolling
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning…</>
                  : <><Scan className="w-4 h-4" /> Capture & Enroll</>}
              </button>
            </div>
          </div>

          {/* ── Enrolled profiles ── */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Enrolled Profiles</h2>
                <p className="text-xs text-slate-500">
                  {loading ? 'Loading from Supabase…' : `${profiles.length} user${profiles.length !== 1 ? 's' : ''} — global`}
                </p>
              </div>
              <button onClick={loadProfiles} className="text-slate-500 hover:text-white transition-colors p-1">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {!loading && profiles.length === 0 ? (
              <div className="text-center py-14 text-slate-600 space-y-2">
                <Scan className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-mono">No faces enrolled</p>
                <p className="text-xs text-slate-700">Enrol the first user using the form on the left</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {profiles.map((p) => (
                  <div key={p.id}
                    className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/40 rounded-2xl p-3 hover:border-slate-600 transition-colors group">
                    {/* Snapshot avatar */}
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-700 shrink-0 ring-2 ring-slate-600 group-hover:ring-cyan-500/40 transition-all">
                      {p.snapshot_url ? (
                        <img src={p.snapshot_url} className="w-full h-full object-cover" alt={p.display_name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-600 text-slate-300 text-base font-black">
                          {p.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{p.display_name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{p.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">{p.role}</span>
                        {p.last_recognized_at && (
                          <>
                            <span className="text-slate-700">·</span>
                            <span className="text-[9px] text-slate-600 font-mono">
                              Last: {new Date(p.last_recognized_at).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleStatus(p)} title={p.status === 'approved' ? 'Disable Face ID' : 'Enable Face ID'}
                        className="hover:opacity-70 transition-opacity">
                        {statusIcon(p.status)}
                      </button>
                      <button onClick={() => deleteProfile(p.id, p.display_name)}
                        className="text-slate-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 pt-2 border-t border-slate-800 text-[10px] text-slate-600">
              <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> Active</div>
              <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" /> Disabled</div>
              <div className="ml-auto flex items-center gap-1"><Globe className="w-3 h-3 text-cyan-500" /> Stored in Supabase</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
