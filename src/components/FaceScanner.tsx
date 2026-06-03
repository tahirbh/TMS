import { useRef, useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
const MATCH_THRESHOLD = 0.52;
const CAPTURE_DELAY = 2500;

type ScanState = 'idle' | 'scanning' | 'recognized' | 'unrecognized' | 'pending';

interface FaceScannerProps {
  onRecognized: (profile: any) => void;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCapturingRef = useRef(false);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loadingModels, setLoadingModels] = useState(true);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setLoadingModels(false);
      } catch (err) {
        console.error('Model load error:', err);
        setLoadingModels(false);
        setCameraError('Failed to load AI models. Please refresh.');
      }
    };
    loadModels();
  }, []);

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 480, facingMode: 'user' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setCameraError('Camera access denied. Please allow camera permissions.');
      }
    };
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (captureTimerRef.current) clearTimeout(captureTimerRef.current);
    };
  }, []);

  const captureAndMatch = useCallback(async () => {
    if (isCapturingRef.current || !videoRef.current) return;
    isCapturingRef.current = true;
    setScanState('scanning');

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) {
        isCapturingRef.current = false;
        setScanState('idle');
        return;
      }

      const descriptor = Array.from(detection.descriptor);

      // Fetch all profiles and compare
      const profiles: any[] = await base44.entities.FaceProfile.list();
      const approvedProfiles = profiles.filter((p) => p.status === 'approved');

      let bestMatch: any = null;
      let bestDistance = Infinity;

      for (const profile of approvedProfiles) {
        if (!profile.face_descriptor || !Array.isArray(profile.face_descriptor)) continue;
        const stored = new Float32Array(profile.face_descriptor);
        const current = new Float32Array(descriptor);
        const dist = faceapi.euclideanDistance(stored, current);
        if (dist < bestDistance) {
          bestDistance = dist;
          bestMatch = profile;
        }
      }

      const logData: Record<string, any> = { result: 'unrecognized' };

      if (bestMatch && bestDistance < MATCH_THRESHOLD) {
        logData.result = 'recognized';
        logData.face_profile_id = bestMatch.id;
        logData.matched_name = bestMatch.display_name;
        logData.matched_role = bestMatch.role;
        logData.confidence = Math.round((1 - bestDistance) * 100) / 100;

        await base44.entities.RecognitionLog.create(logData);
        await base44.entities.FaceProfile.update(bestMatch.id, {
          last_recognized_at: new Date().toISOString(),
        });
        onRecognized(bestMatch);
      } else {
        const pendingProfiles = profiles.filter((p) => p.status === 'pending');
        let isPending = false;
        for (const profile of pendingProfiles) {
          if (!profile.face_descriptor || !Array.isArray(profile.face_descriptor)) continue;
          const stored = new Float32Array(profile.face_descriptor);
          const current = new Float32Array(descriptor);
          const dist = faceapi.euclideanDistance(stored, current);
          if (dist < MATCH_THRESHOLD) {
            isPending = true;
            logData.result = 'pending';
            logData.face_profile_id = profile.id;
            break;
          }
        }
        await base44.entities.RecognitionLog.create(logData);
        if (isPending) onPending();
        else onUnrecognized();
      }
    } catch (err) {
      console.error('Capture/match error:', err);
      isCapturingRef.current = false;
      setScanState('idle');
    }
  }, [onRecognized, onUnrecognized, onPending, setScanState]);

  // Continuous face-detection loop
  useEffect(() => {
    if (!modelsLoaded) return;
    let animFrame: number;
    let faceHoldStart: number | null = null;

    const detect = async () => {
      if (videoRef.current && videoRef.current.readyState === 4 && !isCapturingRef.current) {
        const detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        );
        const detected = !!detection;
        setFaceDetected(detected);

        if (detected && !isCapturingRef.current && (scanState === 'idle' || !scanState)) {
          if (!faceHoldStart) {
            faceHoldStart = Date.now();
          } else if (Date.now() - faceHoldStart > CAPTURE_DELAY) {
            captureAndMatch();
            return;
          }
        } else if (!detected) {
          faceHoldStart = null;
        }

        if (canvasRef.current && videoRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth || 480;
          canvasRef.current.height = videoRef.current.videoHeight || 480;
        }
      }
      animFrame = requestAnimationFrame(detect);
    };

    detect();
    return () => cancelAnimationFrame(animFrame);
  }, [modelsLoaded, scanState, captureAndMatch]);

  const frameColor = () => {
    if (scanState === 'recognized')   return '#00FF88';
    if (scanState === 'unrecognized' || scanState === 'pending') return '#FFAA00';
    if (faceDetected)                 return '#00E5FF';
    return 'rgba(0,229,255,0.4)';
  };
  const fc = frameColor();

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-72 h-72 md:w-80 md:h-80">
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: `0 0 40px ${fc}50, 0 0 80px ${fc}20`, transition: 'box-shadow 0.5s ease' }}
        />

        {/* Rotating dashed ring */}
        <div
          className="absolute inset-2 rounded-full border border-dashed pointer-events-none"
          style={{
            borderColor: `${fc}40`,
            animation: 'face-spin 8s linear infinite',
          }}
        />

        {/* Video circular clip */}
        <div
          className="absolute inset-4 rounded-full overflow-hidden border-2"
          style={{ borderColor: fc, transition: 'border-color 0.5s ease' }}
        >
          {loadingModels ? (
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-xs text-cyan-400/70">Loading AI Models…</p>
            </div>
          ) : cameraError ? (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center p-6">
              <p className="font-mono text-xs text-red-400 text-center leading-relaxed">{cameraError}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
          )}

          {/* Scan line */}
          {(scanState === 'scanning' || scanState === 'idle') && !cameraError && (
            <div
              className="absolute left-0 right-0 h-0.5 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent, ${fc}, transparent)`,
                animation: 'scanline-move 2s linear infinite',
                opacity: 0.75,
              }}
            />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Corner brackets */}
        {(['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'] as const).map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-8 h-8 pointer-events-none`}>
            <div style={{
              position: 'absolute',
              width: 14, height: 14,
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

        {/* Face detected badge */}
        {faceDetected && scanState === 'idle' && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-full border border-cyan-400/30 whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-[10px] text-cyan-400 tracking-widest">FACE DETECTED</span>
          </div>
        )}
      </div>

      {/* Scanning progress */}
      {scanState === 'scanning' && (
        <div className="mt-8 w-72 md:w-80 space-y-2">
          <div className="h-0.5 bg-slate-800 rounded overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded animate-pulse"
              style={{ width: '75%', transition: 'width 2s' }}
            />
          </div>
          <p className="font-mono text-[10px] text-cyan-400/60 text-center tracking-[0.25em]">PROCESSING BIOMETRIC DATA…</p>
        </div>
      )}

      <style>{`
        @keyframes face-spin { to { transform: rotate(360deg); } }
        @keyframes scanline-move {
          0%   { top: 10%; }
          50%  { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
}
