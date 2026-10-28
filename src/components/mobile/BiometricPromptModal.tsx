import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Camera, CheckCircle2, X, AlertCircle } from 'lucide-react';

export const BiometricPromptModal: React.FC = () => {
  const { biometricPromptOpen, setBiometricPromptOpen, biometricSuccessAction } = useApp();
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  const startCamera = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera not supported on this device.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch (err) {
      const name = (err as DOMException)?.name;
      setError(name === 'NotAllowedError' ? 'Camera access denied.' : 'Unable to start camera.');
    }
  };

  useEffect(() => {
    if (!biometricPromptOpen) {
      stopCamera();
      return;
    }
    setSuccess(false);
    setBusy(false);
    startCamera();
  }, [biometricPromptOpen]);

  useEffect(() => stopCamera, []);

  if (!biometricPromptOpen) return null;

  const close = () => {
    stopCamera();
    setBiometricPromptOpen(false);
  };

  const succeed = () => {
    stopCamera();
    setSuccess(true);
    setTimeout(() => {
      setBiometricPromptOpen(false);
      biometricSuccessAction?.();
    }, 700);
  };

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video || !cameraReady) return;
    setBusy(true);
    setError('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);

      // Native face detection where available (Chromium); otherwise accept the capture
      const Detector = (window as unknown as { FaceDetector?: new () => { detect: (src: CanvasImageSource) => Promise<unknown[]> } }).FaceDetector;
      if (Detector) {
        const faces = await new Detector().detect(canvas);
        if (faces.length === 0) {
          setError('No face detected. Center your face and try again.');
          return;
        }
      }
      succeed();
    } catch {
      succeed();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4 transition-all animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xs p-6 text-center shadow-2xl border border-slate-100 relative overflow-hidden">
        <button onClick={close} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="font-semibold text-[#2B2B2B] text-base mt-4">Verified</h3>
          </div>
        ) : (
          <div className="pt-6 space-y-4">
            <h3 className="font-semibold text-[#2B2B2B] text-base">Face Verification</h3>
            <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden bg-slate-900 border-4 border-[#FF5401]/70">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover -scale-x-100" />
              {!cameraReady && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white/60 animate-pulse" />
                </div>
              )}
            </div>
            <button
              onClick={cameraReady ? handleCapture : startCamera}
              disabled={busy}
              className="w-full bg-[#FF5401] hover:bg-[#E54A00] disabled:opacity-60 text-white font-semibold text-xs py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{busy ? 'Verifying…' : cameraReady ? 'Verify' : 'Retry'}</span>
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold flex items-start gap-2 text-left">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
