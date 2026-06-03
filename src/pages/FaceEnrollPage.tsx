import { useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import * as faceapi from 'face-api.js';
import { UserPlus, Trash2, CheckCircle, XCircle, Clock, Camera, Scan, RefreshCw } from 'lucide-react';

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

interface FaceProfile {
  id: string;
  display_name: string;
  role: string;
  email?: string;
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
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('admin');
  const [newEmail, setNewEmail] = useState('');
  const [status, setStatus] = useState<string>('');
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
      } catch (err) {
        setStatus('❌ Failed to load AI models');
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
      setStatus('📷 Camera active — position face in frame');
    } catch {
      setStatus('❌ Camera access denied');
    }
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
    setCapturePreview(null);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const enrollFace = async () => {
    if (!newName.trim()) { setStatus('⚠️ Please enter a name first'); return; }
    if (!videoRef.current || !cameraActive) { setStatus('⚠️ Start the camera first'); return; }
    if (!modelsLoaded) { setStatus('⚠️ AI models still loading…'); return; }

    setEnrolling(true);
    setStatus('🔍 Detecting face…');

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) {
        setStatus('❌ No face detected — please position your face clearly in frame');
        setEnrolling(false);
        return;
      }

      // Capture snapshot
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
        email: newEmail.trim() || undefined,
        face_descriptor: descriptor,
        snapshot_url: snapshot,
        status: 'approved', // Auto-approve on enroll (admin is doing it)
      });

      setStatus(`✅ "${newName}" enrolled successfully!`);
      setNewName('');
      setNewEmail('');
      await loadProfiles();
      stopCamera();
    } catch (err: any) {
      setStatus(`❌ Enrollment failed: ${err.message}`);
    } finally {
      setEnrolling(false);
    }
  };

  const deleteProfile = async (id: string, name: string) => {
    if (!confirm(`Delete face profile for "${name}"?`)) return;
    await base44.entities.FaceProfile.delete(id);
    await loadProfiles();
  };

  const toggleStatus = async (profile: FaceProfile) => {
    const next = profile.status === 'approved' ? 'pending' : 'approved';
    await base44.entities.FaceProfile.update(profile.id, { status: next });
    await loadProfiles();
  };

  const statusIcon = (s: string) => {
    if (s === 'approved') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (s === 'rejected') return <XCircle className="w-4 h-4 text-red-400" />;
    return <Clock className="w-4 h-4 text-amber-400" />;
  };

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
            <p className="text-slate-400 text-sm">Register authorised users for biometric login</p>
          </div>
        </div>

        {/* Status bar */}
        {status && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl px-4 py-3">
            <p className="text-sm font-mono text-cyan-300">{status}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Enroll panel */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" /> Enroll New Face
            </h2>

            <div className="space-y-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full Name *"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="hr">HR</option>
                <option value="driver">Driver</option>
                <option value="labor">Labor</option>
              </select>
            </div>

            {/* Camera feed */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-square max-h-60">
              {capturePreview ? (
                <img src={capturePreview} className="w-full h-full object-cover" alt="Captured" />
              ) : (
                <video ref={videoRef} autoPlay muted playsInline
                  className={`w-full h-full object-cover scale-x-[-1] ${!cameraActive ? 'hidden' : ''}`} />
              )}
              {!cameraActive && !capturePreview && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Camera className="w-10 h-10 opacity-40" />
                  <p className="text-xs font-mono">Camera off</p>
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
                  Stop Camera
                </button>
              )}
              <button
                onClick={enrollFace}
                disabled={enrolling || !modelsLoaded}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {enrolling ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning…</>
                ) : (
                  <><Scan className="w-4 h-4" /> Capture & Enroll</>
                )}
              </button>
            </div>
          </div>

          {/* Enrolled profiles */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Enrolled Profiles</h2>
              <button onClick={loadProfiles} className="text-slate-500 hover:text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {profiles.length === 0 ? (
              <div className="text-center py-12 text-slate-600 space-y-2">
                <Scan className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-mono">No profiles enrolled yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {profiles.map((p) => (
                  <div key={p.id}
                    className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3 hover:border-slate-600 transition-colors"
                  >
                    {/* Snapshot thumbnail */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-700 shrink-0">
                      {p.snapshot_url ? (
                        <img src={p.snapshot_url} className="w-full h-full object-cover" alt={p.display_name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-lg font-black">
                          {p.display_name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{p.display_name}</p>
                      <p className="text-xs text-slate-400 capitalize">{p.role}</p>
                      {p.last_recognized_at && (
                        <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                          Last seen: {new Date(p.last_recognized_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleStatus(p)}
                        title={p.status === 'approved' ? 'Click to disable' : 'Click to approve'}
                        className="opacity-80 hover:opacity-100 transition-opacity"
                      >
                        {statusIcon(p.status)}
                      </button>
                      <button
                        onClick={() => deleteProfile(p.id, p.display_name)}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
