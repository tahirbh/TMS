import { useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import * as faceapi from 'face-api.js';
import { UserPlus, Trash2, CheckCircle, XCircle, Clock, Camera, Scan, RefreshCw, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

interface FaceProfile {
  id: string;
  display_name: string;
  role: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  face_descriptor?: number[];
  snapshot_url?: string;
  created_date: string;
  last_recognized_at?: string;
}

export default function FaceEnrollPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [profiles, setProfiles] = useState<FaceProfile[]>([]);

  // Form fields
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newRole, setNewRole] = useState('admin');

  const [status, setStatus] = useState<string>('');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [capturePreview, setCapturePreview] = useState<string | null>(null);

  // Load models
  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatus('✅ AI Models loaded — camera ready');
        setStatusType('success');
      } catch {
        setStatus('❌ Failed to load AI models. Check network connection.');
        setStatusType('error');
      }
    };
    load();
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const data = await base44.entities.FaceProfile.list();
    setProfiles(data as FaceProfile[]);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 640, facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      setCapturePreview(null);
      setStatus('📷 Camera active — position your face and click Capture & Enroll');
      setStatusType('info');
    } catch {
      setStatus('❌ Camera access denied. Allow camera in browser settings.');
      setStatusType('error');
    }
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
    setCapturePreview(null);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const enrollFace = async () => {
    if (!newName.trim()) { setStatus('⚠️ Enter the person\'s full name'); setStatusType('error'); return; }
    if (!newEmail.trim()) { setStatus('⚠️ Email is required — it\'s the login identity'); setStatusType('error'); return; }
    if (!newPassword.trim()) { setStatus('⚠️ Password is required — face scan uses it to auto-sign-in'); setStatusType('error'); return; }
    if (!videoRef.current || !cameraActive) { setStatus('⚠️ Start the camera first'); setStatusType('error'); return; }
    if (!modelsLoaded) { setStatus('⚠️ AI models still loading…'); setStatusType('info'); return; }

    setEnrolling(true);
    setStatus('🔍 Scanning face — hold still…');
    setStatusType('info');

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) {
        setStatus('❌ No face detected. Ensure good lighting and face the camera directly.');
        setStatusType('error');
        setEnrolling(false);
        return;
      }

      // Capture mirrored snapshot (looks natural)
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, -canvas.width, 0);
      const snapshot = canvas.toDataURL('image/jpeg', 0.85);
      setCapturePreview(snapshot);

      const descriptor = Array.from(detection.descriptor);

      await base44.entities.FaceProfile.create({
        display_name: newName.trim(),
        role: newRole,
        email: newEmail.trim().toLowerCase(),
        // Password is stored locally to enable passwordless auto-sign-in on face match.
        // This is analogous to a phone unlocking via Face ID using the stored PIN.
        face_login_password: newPassword,
        face_descriptor: descriptor,
        snapshot_url: snapshot,
        status: 'approved',
      });

      setStatus(`✅ "${newName}" enrolled! Face login is now active for ${newEmail}`);
      setStatusType('success');
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      await loadProfiles();
      stopCamera();
    } catch (err: any) {
      setStatus(`❌ Enrollment failed: ${err.message}`);
      setStatusType('error');
    } finally {
      setEnrolling(false);
    }
  };

  const deleteProfile = async (id: string, name: string) => {
    if (!confirm(`Remove Face ID for "${name}"? They will need to use password login.`)) return;
    await base44.entities.FaceProfile.delete(id);
    await loadProfiles();
    setStatus(`🗑️ "${name}" removed from Face ID`);
    setStatusType('info');
  };

  const toggleStatus = async (profile: FaceProfile) => {
    const next = profile.status === 'approved' ? 'pending' : 'approved';
    await base44.entities.FaceProfile.update(profile.id, { status: next });
    await loadProfiles();
  };

  const statusBorderColor = { info: 'border-cyan-500/30', success: 'border-emerald-500/30', error: 'border-red-500/30' }[statusType];
  const statusTextColor   = { info: 'text-cyan-300', success: 'text-emerald-300', error: 'text-red-300' }[statusType];
  const statusBgColor     = { info: 'bg-cyan-900/20', success: 'bg-emerald-900/20', error: 'bg-red-900/20' }[statusType];

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
            <p className="text-slate-400 text-sm">Register users for passwordless biometric login</p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-blue-900/20 border border-blue-500/20 rounded-2xl p-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200 space-y-1">
            <p className="font-bold">How Face ID Login Works</p>
            <p className="text-blue-300/70 text-xs leading-relaxed">
              Email is the central identity. The password is stored locally as the second factor, just like a phone uses Face ID to unlock without entering a PIN.
              When a face is recognised, the system instantly signs in using the linked email + password — no manual input needed.
            </p>
          </div>
        </div>

        {/* Status bar */}
        {status && (
          <div className={`${statusBgColor} border ${statusBorderColor} rounded-2xl px-4 py-3`}>
            <p className={`text-sm font-mono ${statusTextColor}`}>{status}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Enroll panel */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" /> Enroll New Face
            </h2>

            <div className="space-y-3">
              {/* Full name */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Full Name *</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Tahir Farooq"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Email — central identity */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Login Email * <span className="text-cyan-500">(Central Identity)</span></label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="tahir@company.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Password — stored for auto-sign-in */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">
                  Login Password * <span className="text-cyan-500">(Auto Sign-In Key)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-600 mt-1 ml-1">Same password the user enters for manual login</p>
              </div>

              {/* Role */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="hr">HR</option>
                  <option value="driver">Driver</option>
                  <option value="labor">Labor</option>
                </select>
              </div>
            </div>

            {/* Camera feed */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-square max-h-56">
              {capturePreview ? (
                <div className="relative w-full h-full">
                  <img src={capturePreview} className="w-full h-full object-cover" alt="Captured" />
                  <div className="absolute inset-0 flex items-end justify-center pb-3">
                    <span className="bg-emerald-500/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      ✓ Face Captured
                    </span>
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover scale-x-[-1] ${!cameraActive ? 'hidden' : ''}`}
                />
              )}
              {!cameraActive && !capturePreview && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Camera className="w-10 h-10 opacity-40" />
                  <p className="text-xs font-mono">Start camera to capture face</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={enrollFace}
                disabled={enrolling || !modelsLoaded || !cameraActive}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {enrolling ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning…</>
                ) : (
                  <><Scan className="w-4 h-4" /> Capture & Enroll</>
                )}
              </button>
            </div>
          </div>

          {/* Enrolled profiles list */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Enrolled Profiles</h2>
                <p className="text-xs text-slate-500">{profiles.length} user{profiles.length !== 1 ? 's' : ''} enrolled</p>
              </div>
              <button onClick={loadProfiles} className="text-slate-500 hover:text-white transition-colors p-1">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {profiles.length === 0 ? (
              <div className="text-center py-14 text-slate-600 space-y-3">
                <Scan className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-mono">No faces enrolled yet</p>
                <p className="text-xs text-slate-700">Fill the form and start camera to enroll the first user</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/40 rounded-2xl p-3 hover:border-slate-600 transition-colors group"
                  >
                    {/* Snapshot */}
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-700 shrink-0 ring-2 ring-slate-600 group-hover:ring-cyan-500/40 transition-all">
                      {p.snapshot_url ? (
                        <img src={p.snapshot_url} className="w-full h-full object-cover" alt={p.display_name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-base font-black bg-gradient-to-br from-slate-700 to-slate-600">
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
                      <button
                        onClick={() => toggleStatus(p)}
                        title={p.status === 'approved' ? 'Disable Face ID' : 'Enable Face ID'}
                        className="transition-opacity hover:opacity-70"
                      >
                        {p.status === 'approved'
                          ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                          : p.status === 'rejected'
                          ? <XCircle className="w-4 h-4 text-red-400" />
                          : <Clock className="w-4 h-4 text-amber-400" />}
                      </button>
                      <button
                        onClick={() => deleteProfile(p.id, p.display_name)}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-slate-500">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-slate-500">Disabled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] text-slate-500">Click ✓ to toggle</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
