import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Fingerprint, Scan, CheckCircle2, X } from 'lucide-react';

export const BiometricPromptModal: React.FC = () => {
  const { biometricPromptOpen, setBiometricPromptOpen, biometricSuccessAction } = useApp();
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!biometricPromptOpen) return null;

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setSuccess(true);
      setTimeout(() => {
        setBiometricPromptOpen(false);
        setSuccess(false);
        if (biometricSuccessAction) {
          biometricSuccessAction();
        }
      }, 700);
    }, 1200);
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4 transition-all animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xs p-6 text-center shadow-2xl border border-slate-100 relative overflow-hidden">
        <button
          onClick={() => setBiometricPromptOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mt-2 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#005BAC] mx-auto flex items-center justify-center border border-blue-100 shadow-inner relative">
            {success ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
            ) : scanning ? (
              <Scan className="w-10 h-10 text-[#005BAC] animate-pulse" />
            ) : (
              <Fingerprint className="w-10 h-10 text-[#005BAC]" />
            )}
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-base">
          {success ? 'Identity Verified' : scanning ? 'Scanning Biometrics...' : 'Clark Electric Biometrics'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {success
            ? 'Authentication successful'
            : 'Touch sensor or align Face ID to confirm authorization'}
        </p>

        {!success && (
          <button
            onClick={handleScan}
            disabled={scanning}
            className="w-full bg-[#005BAC] hover:bg-blue-700 active:scale-98 text-white font-semibold text-sm py-3 rounded-2xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            {scanning ? 'Authenticating...' : 'Verify with Fingerprint / Face ID'}
          </button>
        )}
      </div>
    </div>
  );
};
