import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, KeyRound, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, X, Check, ArrowRight } from 'lucide-react';
import { validatePassword } from '../../utils/authPolicy';

export const PasswordChangeModal: React.FC = () => {
  const {
    showPasswordChangeModal,
    setShowPasswordChangeModal,
    user,
    adminUser,
    userRole,
    updateCustomerPassword,
    passwordExpirationStatus,
  } = useApp();

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!showPasswordChangeModal) return null;

  const validation = validatePassword(newPass, {
    accountNumber: userRole === 'admin' ? (adminUser?.id || 'ADM-001') : user?.accountNumber,
    name: userRole === 'admin' ? (adminUser?.name || 'Administrator') : user?.name,
    email: userRole === 'admin' ? (adminUser?.email || 'admin@clarkelectric.ph') : user?.email,
    previousPasswords: user?.previousPasswords || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPass !== confirmPass) {
      setErrorMsg('New password and password confirmation do not match.');
      return;
    }

    if (!validation.isValid) {
      setErrorMsg(validation.errors[0] || 'Password does not meet CECAP policy requirements.');
      return;
    }

    setIsSubmitting(true);
    const res = await updateCustomerPassword(newPass, currentPass);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Password updated successfully adhering to 30-day policy!');
      setTimeout(() => {
        setShowPasswordChangeModal(false);
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        setSuccessMsg('');
      }, 1500);
    } else {
      setErrorMsg(res.message || 'Failed to update password.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-md w-full p-6 space-y-4 my-8 relative">
        <button
          type="button"
          onClick={() => setShowPasswordChangeModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3.5">
          <div className="w-11 h-11 rounded-2xl bg-orange-100 text-[#FF5401] flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2B2B2B]">CECAP Password Management</h3>
            <p className="text-[11px] text-slate-500">
              30-day expiration cycle • {passwordExpirationStatus.daysRemaining} days remaining
            </p>
          </div>
        </div>

        {passwordExpirationStatus.shouldNotify && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
            ⚠️ <strong>Upcoming Expiration:</strong> Your password will expire in {passwordExpirationStatus.daysRemaining} days. Setting a new password resets your 30-day lifecycle.
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Current Password *</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                placeholder="Enter your current password"
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl px-3.5 pr-10 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">New Password *</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Min 9 characters (Upper, Lower, Number, Symbol)"
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl px-3.5 pr-10 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Dynamic Live Policy Checklist */}
          {newPass && (
            <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EBE5DC] text-[11px] space-y-1.5 animate-fade-in">
              <p className="font-semibold text-[#2B2B2B] text-xs">Password Policy Compliance:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                <div className={`flex items-center gap-1.5 ${validation.rules.length ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  {validation.rules.length ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                  <span>Min. 9 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${validation.rules.uppercase && validation.rules.lowercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  {validation.rules.uppercase && validation.rules.lowercase ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                  <span>Upper & lowercase</span>
                </div>
                <div className={`flex items-center gap-1.5 ${validation.rules.number ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  {validation.rules.number ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                  <span>At least 1 number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${validation.rules.specialChar ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  {validation.rules.specialChar ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                  <span>Special symbol (!@#$%)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${validation.rules.notUsername && validation.rules.notRepetitive && validation.rules.notCommonPattern ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  {validation.rules.notUsername && validation.rules.notRepetitive && validation.rules.notCommonPattern ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                  <span>No username/repetition</span>
                </div>
                <div className={`flex items-center gap-1.5 ${validation.rules.notReused && validation.rules.notCommonlyUsed ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  {validation.rules.notReused && validation.rules.notCommonlyUsed ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                  <span>No reuse of last 5 passwords</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Confirm New Password *</label>
            <input
              type="password"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
              required
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setShowPasswordChangeModal(false)}
              className="w-1/3 bg-[#E5E7EB] hover:bg-slate-300 text-[#2B2B2B] font-semibold text-xs py-2.5 rounded-2xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-xs py-2.5 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? 'Updating...' : 'Save New Password'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
