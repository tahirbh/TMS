import { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { faceProfilesService, type FaceProfile } from '@/lib/faceProfilesService';

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
const MATCH_THRESHOLD = 0.52;
const HOLD_MS = 2500; // ms face must be held steady before capture

type ScanState = 'idle' | 'scanning' | 'recognized' | 'unrecognized' | 'pending';

interface FaceScannerProps {
  onRecognized: (profile: FaceProfile) => void;
  onUnrecognized: () => void;
  onPending: () => void;
  scanState: ScanState;
  setScanState: (s: ScanState) => void;
}

export default function FaceScanner({
  onRecognized,
  onUnrecognized,
  onPending,
  scanState,
  setScanState,
}: FaceScannerProps) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const capturing  = useRef(false);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraError, setCameraError]   = useState<string | null>(null);
  const [loadingModels, setLoadingModels] = useState(true);

  // ── Load AI models ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Model load error:', err);
        setCameraError('Failed to load AI models. Check network and refresh.');
      } finally {
        setLoadingModels(false);
      }
    })();
  }, []);

  // ── Start camera ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 480, facingMode: 'user' },
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setCameraError('Camera access denied. Allow camera permissions and refresh.');
      }
    })();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Capture & match against Supabase ───────────────────────────────────────
  const captureAndMatch = useCallback(async () => {
    if (capturing.current || !videoRef.current) return;
    capturing.current = true;
    setScanState('scanning');

    try {
      // 1. Extract descriptor from current video frame
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) {
        capturing.current = false;
        setScanState('idle');
        return;
      }

      const currentDescriptor = new Float32Array(detection.descriptor);

      // 2. Fetch all approved profiles from Supabase (works globally on any device)
      const profiles = await faceProfilesService.listApproved();

      let bestMatch: FaceProfile | null = null;
      let bestDist = Infinity;

      for (const p of profiles) {
        if (!p.face_descriptor?.length) continue;
        const stored = new Float32Array(p.face_descriptor);
        const dist   = faceapi.euclideanDistance(stored, currentDescriptor);
        if (dist < bestDist) { bestDist = dist; bestMatch = p; }
      }

      // 3. Evaluate match
      if (bestMatch && bestDist < MATCH_THRESHOLD) {
        // Log and update last_recognized_at in Supabase
        await faceProfilesService.log({
          face_profile_id: bestMatch.id,
          result: 'recognized',
          matched_name: bestMatch.display_name,
          matched_role: bestMatch.role,
          confidence: Math.round((1 - bestDist) * 10000) / 10000,
        });
        await faceProfilesService.update(bestMatch.id, {
          last_recognized_at: new Date().toISOString(),
        });
        onRecognized(bestMatch);
      } else {
        await faceProfilesService.log({ result: 'unrecognized' });
        onUnrecognized();
      }
    } catch (err) {
      console.error('captureAndMatch error:', err);
      capturing.current = false;
      setScanState('idle');
    }
  }, [onRecognized, onUnrecognized, setScanState]);

  // ── Continuous detection loop ───────────────────────────────────────────────
  useEffect(() => {
    if (!modelsLoaded) return;
    let animFrame: number;
    let holdStart: number | null = null;

    const detect = async () => {
      if (videoRef.current?.readyState === 4 && !capturing.current) {
        const det = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        );
        const detected = !!det;
        setFaceDetected(detected);

        if (detected && !capturing.current && (scanState === 'idle' || !scanState)) {
          if (!holdStart) { holdStart = Date.now(); }
          else if (Date.now() - holdStart > HOLD_MS) {
            captureAndMatch();
            return;
          }
        } else if (!detected) {
          holdStart = null;
        }

        // Keep canvas dimensions in sync
        if (canvasRef.current && videoRef.current) {
          canvasRef.current.width  = videoRef.current.videoWidth  || 480;
          canvasRef.current.height = videoRef.current.videoHeight || 480;
        }
      }
      animFrame = requestAnimationFrame(detect);
    };

    detect();
    return () => cancelAnimationFrame(animFrame);
  }, [modelsLoaded, scanState, captureAndMatch]);

  // ── Ring colour based on scan state ────────────────────────────────────────
  const fc = (() => {
    if (scanState === 'recognized')   return '#00FF88';
    if (scanState === 'unrecognized' || scanState === 'pending') return '#FFAA00';
    if (faceDetected)                  return '#00E5FF';
    return 'rgba(0,229,255,0.4)';
  })();

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-72 h-72 md:w-80 md:h-80">

        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: `0 0 40px ${fc}50, 0 0 80px ${fc}20`, transition: 'box-shadow 0.5s ease' }} />

        {/* Rotating dashed ring */}
        <div className="absolute inset-2 rounded-full border border-dashed pointer-events-none"
          style={{ borderColor: `${fc}40`, animation: 'face-ring-spin 8s linear infinite' }} />

        {/* Circular video */}
        <div className="absolute inset-4 rounded-full overflow-hidden border-2"
          style={{ borderColor: fc, transition: 'border-color 0.5s ease' }}>
          {loadingModels ? (
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-[10px] text-cyan-400/70">Loading AI Models…</p>
            </div>
          ) : cameraError ? (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center p-6">
              <p className="font-mono text-xs text-red-400 text-center leading-relaxed">{cameraError}</p>
            </div>
          ) : (
            <video ref={videoRef} autoPlay muted playsInline
              className="w-full h-full object-cover scale-x-[-1]" />
          )}

          {/* Scan line animation */}
          {(scanState === 'scanning' || scanState === 'idle') && !cameraError && (
            <div className="absolute left-0 right-0 h-0.5 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent, ${fc}, transparent)`,
                animation: 'face-scanline 2s linear infinite',
                opacity: 0.75,
              }} />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Corner brackets */}
        {(['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'] as const).map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-8 h-8 pointer-events-none`}>
            <div style={{
              position: 'absolute', width: 14, height: 14,
              borderTop:    i < 2  ? `2px solid ${fc}` : 'none',
              borderBottom: i >= 2 ? `2px solid ${fc}` : 'none',
              borderLeft:   i % 2 === 0 ? `2px solid ${fc}` : 'none',
              borderRight:  i % 2 === 1 ? `2px solid ${fc}` : 'none',
              top:    i < 2  ? 6 : 'auto',
              bottom: i >= 2 ? 6 : 'auto',
              left:   i % 2 === 0 ? 6 : 'auto',
              right:  i % 2 === 1 ? 6 : 'auto',
              transition: 'border-color 0.5s ease',
            }} />
          </div>
        ))}

        {/* Face detected pill */}
        {faceDetected && scanState === 'idle' && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-full border border-cyan-400/30 whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-[10px] text-cyan-400 tracking-widest">FACE DETECTED</span>
          </div>
        )}
      </div>

      {/* Scanning progress bar */}
      {scanState === 'scanning' && (
        <div className="mt-8 w-72 md:w-80 space-y-2">
          <div className="h-0.5 bg-slate-800 rounded overflow-hidden">
            <div className="h-full bg-cyan-400 rounded animate-pulse" style={{ width: '75%' }} />
          </div>
          <p className="font-mono text-[10px] text-cyan-400/60 text-center tracking-[0.25em]">
            MATCHING AGAINST GLOBAL DATABASE…
          </p>
        </div>
      )}

      <style>{`
        @keyframes face-ring-spin  { to { transform: rotate(360deg); } }
        @keyframes face-scanline   { 0% { top: 10%; } 50% { top: 90%; } 100% { top: 10%; } }
      `}</style>
    </div>
  );
}
