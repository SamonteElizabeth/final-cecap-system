import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { linkServiceAccount, sendOtp, verifyOtp } from '../../services/api';
import { User, Mail, Smartphone, MapPin, Building2, Plus, CheckCircle2, ShieldCheck, Edit3, X, Zap } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, setUser, selectedAccount, linkedAccounts, refreshAccountData } = useApp();

  // Edit State
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [mobileInput, setMobileInput] = useState(user?.mobileNumber || '');

  // Linking Account Modal State
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);
  const [newAccNum, setNewAccNum] = useState('');
  const [newMeterNum, setNewMeterNum] = useState('');
  const [newAccNickname, setNewAccNickname] = useState('');
  const [linkMsg, setLinkMsg] = useState('');
  const [isLinkingLoading, setIsLinkingLoading] = useState(false);

  const handleSaveContact = () => {
    if (user) {
      setUser({
        ...user,
        email: emailInput,
        mobileNumber: mobileInput,
      });
      setIsEditingContact(false);
    }
  };

  const handleLinkAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccNum) return;

    setIsLinkingLoading(true);
    setLinkMsg('');

    const res = await linkServiceAccount(newAccNum, newMeterNum, newAccNickname);
    setIsLinkingLoading(false);

    if (res.success) {
      setLinkMsg(res.message || 'Service Account linked successfully!');
      setTimeout(() => {
        setIsLinkingModalOpen(false);
        setLinkMsg('');
        setNewAccNum('');
        setNewMeterNum('');
        setNewAccNickname('');
        refreshAccountData();
      }, 1000);
    } else {
      setLinkMsg(res.message || 'Failed to link account.');
    }
  };

  if (!user || !selectedAccount) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-12 w-full">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs text-center relative flex flex-col md:flex-row md:text-left items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-20 h-20 bg-orange-100 text-[#FF5401] font-semibold text-2xl rounded-3xl flex items-center justify-center border-4 border-white shadow-md shrink-0">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#2B2B2B]">{user.name}</h2>
          </div>
        </div>

        <div className="bg-[#F5F5F5] p-3 rounded-2xl border border-[#E5E7EB] text-xs text-slate-600 max-w-xs text-center md:text-right">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Primary Account</span>
          <span className="font-semibold text-[#2B2B2B] font-mono">{selectedAccount.accountNumber}</span>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">{selectedAccount.serviceAddress}</p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Editable Contact Info */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-2">
            <h3 className="text-xs font-semibold text-[#2B2B2B] uppercase tracking-wider">Contact Information</h3>
            {!isEditingContact ? (
              <button
                onClick={() => setIsEditingContact(true)}
                className="text-xs font-semibold text-[#FF5401] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Info
              </button>
            ) : (
              <button
                onClick={handleSaveContact}
                className="text-xs font-semibold text-[#22C55E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Save Changes
              </button>
            )}
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Email Address</label>
              {isEditingContact ? (
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-[#E5E7EB] rounded-xl p-2.5 text-xs text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                />
              ) : (
                <div className="flex items-center gap-2 font-semibold text-[#2B2B2B]">
                  <Mail className="w-4 h-4 text-[#FF5401]" />
                  <span>{user.email}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Mobile Number (SMS Alert Target)</label>
              {isEditingContact ? (
                <input
                  type="text"
                  value={mobileInput}
                  onChange={e => setMobileInput(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-[#E5E7EB] rounded-xl p-2.5 text-xs text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                />
              ) : (
                <div className="flex items-center gap-2 font-semibold text-[#2B2B2B]">
                  <Smartphone className="w-4 h-4 text-[#FF5401]" />
                  <span>{user.mobileNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Linked Service Accounts Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Linked Service Accounts</h3>
            <button
              onClick={() => setIsLinkingModalOpen(true)}
              className="bg-[#FF5401] hover:bg-[#E54A00] text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Link Service Account
            </button>
          </div>

          <div className="space-y-2.5">
            {linkedAccounts.map(acc => (
              <div
                key={acc.accountNumber}
                className={`p-4 rounded-2xl border transition-all ${
                  acc.accountNumber === selectedAccount.accountNumber
                    ? 'bg-orange-50/70 border-[#FF5401]/40 shadow-xs'
                    : 'bg-white border-[#E5E7EB]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-[#2B2B2B]">{acc.nickname || 'Service Account'}</h4>
                      {acc.isPrimary && (
                        <span className="bg-[#FF5401] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono font-medium text-slate-700 mt-0.5">Acc #{acc.accountNumber}</p>
                  </div>
                  <span className="bg-[#F5F5F5] text-[#2B2B2B] text-[10px] font-medium px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                    {acc.serviceType}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 border-t border-[#E5E7EB] pt-2">
                  <MapPin className="w-3 h-3 text-[#FF5401] shrink-0" />
                  <span className="truncate">{acc.serviceAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Link Account Modal */}
      {isLinkingModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-[#E5E7EB] relative">
            <button
              onClick={() => setIsLinkingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-bold text-[#2B2B2B] text-base">Link Service Account</h3>
              <p className="text-xs text-slate-500">Connect another Clark Electric meter to your login</p>
            </div>

            {linkMsg && (
              <div className="p-3 rounded-xl bg-orange-50 border border-[#FF5401]/30 text-[#2B2B2B] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF5401]" />
                <span>{linkMsg}</span>
              </div>
            )}

            <form onSubmit={handleLinkAccountSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">CEDC Service Account Number</label>
                <input
                  type="text"
                  value={newAccNum}
                  onChange={e => setNewAccNum(e.target.value)}
                  placeholder="e.g. 0421-9943-11"
                  className="w-full bg-[#F5F5F5] border border-[#E5E7EB] rounded-xl p-2.5 text-xs text-[#2B2B2B] font-mono font-bold focus:outline-none focus:border-[#FF5401]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Meter Serial Number (Verification)</label>
                <input
                  type="text"
                  value={newMeterNum}
                  onChange={e => setNewMeterNum(e.target.value)}
                  placeholder="e.g. MTR-2025-44012"
                  className="w-full bg-[#F5F5F5] border border-[#E5E7EB] rounded-xl p-2.5 text-xs text-[#2B2B2B] font-mono focus:outline-none focus:border-[#FF5401]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Account Nickname (Optional)</label>
                <input
                  type="text"
                  value={newAccNickname}
                  onChange={e => setNewAccNickname(e.target.value)}
                  placeholder="e.g. Freeport Warehouse / Substation Office"
                  className="w-full bg-[#F5F5F5] border border-[#E5E7EB] rounded-xl p-2.5 text-xs text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                />
              </div>

              <button
                type="submit"
                disabled={isLinkingLoading}
                className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                {isLinkingLoading ? 'Verifying Meter Records...' : 'Verify & Link Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
