import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SentEmail } from '../../types';
import {
  Mail,
  Inbox,
  Copy,
  UserCheck,
  KeyRound,
  X,
  Search,
  Check,
  ArrowRight,
  Shield,
  ShieldCheck,
  Clock,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import cecapLogo from '../../assets/CECAp_Logo.png';

export const EmailOutboxModal: React.FC = () => {
  const {
    sentEmails,
    emailModalOpen,
    setEmailModalOpen,
    selectedEmail,
    setSelectedEmail,
    setIsAuthenticated,
    setUserRole,
    setActiveTab,
    openAdminSetupFlow,
    simulateExpireToken,
    simulateUseToken,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!emailModalOpen) return null;

  const currentEmail = selectedEmail || (sentEmails.length > 0 ? sentEmails[0] : null);

  const filteredEmails = sentEmails.filter(email => {
    return (
      email.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenAdminSetupLink = (emailObj: SentEmail) => {
    const token = emailObj.data?.setupToken || '';
    const email = emailObj.to;
    setEmailModalOpen(false);
    openAdminSetupFlow(email, token);
  };

  const handleAutoFillLogin = (emailObj: SentEmail) => {
    const accountCode = emailObj.data?.accountCode || '0421-9012-34';
    const tempPass = emailObj.data?.tempPassword || 'CedcTemp#1092';

    localStorage.setItem('autofill_account_code', accountCode);
    localStorage.setItem('autofill_temp_pass', tempPass);

    setEmailModalOpen(false);
    setIsAuthenticated(false);
    setUserRole('customer');
    setActiveTab('dashboard');

    window.dispatchEvent(
      new CustomEvent('cedc_autofill_login', {
        detail: { accountCode, tempPass },
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xl w-full max-w-4xl h-[88vh] sm:h-[82vh] flex flex-col overflow-hidden">
        {/* Clean Light Header Bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-5 py-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-[#FF5401]/20 flex items-center justify-center text-[#FF5401] shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#2B2B2B]">CECAp Email</h3>
              <p className="text-[11px] text-slate-500">System notifications & verification messages</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEmailModalOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area: Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#FAFAFA]">
          {/* Left Column: Email List */}
          <div className="w-full md:w-80 border-r border-[#E5E7EB] bg-white flex flex-col h-2/5 md:h-full shrink-0">
            {/* Search Bar */}
            <div className="p-3 border-b border-[#E5E7EB]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search emails..."
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Email Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Inbox className="w-7 h-7 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No emails found</p>
                </div>
              ) : (
                filteredEmails.map(email => {
                  const isSelected = currentEmail?.id === email.id;
                  return (
                    <button
                      key={email.id}
                      type="button"
                      onClick={() => setSelectedEmail(email)}
                      className={`w-full text-left p-4 transition-all flex flex-col gap-1 cursor-pointer border-l-3 ${
                        isSelected
                          ? 'bg-orange-50/60 border-l-[#FF5401]'
                          : 'hover:bg-slate-50 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#2B2B2B] truncate max-w-[160px]">
                          {email.recipientName}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {email.sentAt}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-[#FF5401] truncate">
                        {email.subject}
                      </p>

                      <p className="text-[11px] text-slate-500 truncate">
                        To: {email.to}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Email Content */}
          <div className="flex-1 bg-[#FAFAFA] p-4 sm:p-6 overflow-y-auto h-3/5 md:h-full">
            {currentEmail ? (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-7 space-y-5 max-w-2xl mx-auto w-full">
                {/* Subject & Sender Info */}
                <div className="border-b border-[#E5E7EB] pb-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <img src={cecapLogo} alt="CECAP Logo" className="h-6 object-contain" />
                      <span className="font-semibold text-slate-500">Official Notice</span>
                    </div>
                    <span>{currentEmail.sentAt}</span>
                  </div>

                  <h2 className="text-base sm:text-lg font-semibold text-[#2B2B2B] leading-snug">
                    {currentEmail.subject}
                  </h2>

                  <div className="text-xs text-slate-500 space-y-1 pt-1">
                    <div>
                      <span className="font-medium text-slate-400">From: </span>
                      <span className="font-semibold text-[#2B2B2B]">{currentEmail.sender}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-400">To: </span>
                      <span className="font-semibold text-[#FF5401]">
                        {currentEmail.recipientName} &lt;{currentEmail.to}&gt;
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Text */}
                <div className="text-xs sm:text-sm text-[#2B2B2B] leading-relaxed whitespace-pre-line font-normal">
                  {currentEmail.body}
                </div>

                {/* Credentials Highlighting Card (If Approved) */}
                {currentEmail.type === 'REGISTRATION_APPROVED' && currentEmail.data && (
                  <div className="bg-orange-50/70 border border-[#FF5401]/25 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-[#FF5401] font-semibold text-xs">
                      <KeyRound className="w-4 h-4" />
                      <span>Portal Credentials</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-orange-200/80">
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">Account Code</span>
                        <span className="text-sm font-mono font-semibold text-[#FF5401]">
                          {currentEmail.data.accountCode || '0421-9012-34'}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-orange-200/80">
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">Temporary Password</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-sm font-mono font-semibold text-[#2B2B2B]">
                            {currentEmail.data.tempPassword || 'CedcTemp#7419'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(currentEmail.data?.tempPassword || 'CedcTemp#7419', 'pass')}
                            className="text-[10px] font-semibold text-[#FF5401] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {copiedField === 'pass' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'pass' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAutoFillLogin(currentEmail)}
                      className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Use Credentials to Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Admin First-Time Setup Link Card */}
                {(currentEmail.type === 'ADMIN_SETUP_INVITE' || currentEmail.data?.setupToken) && (
                  <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-[#FF5401]/30 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-[#FF5401] font-extrabold text-xs">
                        <Shield className="w-4 h-4" />
                        <span>Admin First-Time Setup Link</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-[10px] font-bold">
                        <Clock className="w-3 h-3 text-[#FF5401]" />
                        <span>Valid 15 Mins • Single-Use</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-orange-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                        <span>Single-Use Security Token</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(currentEmail.data?.setupToken || '', 'adm_token')}
                          className="text-[#FF5401] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedField === 'adm_token' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'adm_token' ? 'Copied' : 'Copy Token'}</span>
                        </button>
                      </div>
                      <div className="font-mono text-xs font-bold text-[#FF5401] bg-[#FAF8F5] p-2 rounded-lg border border-[#EBE5DC] break-all select-all">
                        {currentEmail.data?.setupToken}
                      </div>
                    </div>

                    {/* Primary Action Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenAdminSetupLink(currentEmail)}
                      className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Open Secure Setup Link in CECAP Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Simulation / Verification Helper for Testing Expired & Used Link Requirements */}
                    <div className="pt-2 border-t border-orange-200/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-semibold">
                      <span>Requirement Testing Tools:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => currentEmail.data?.setupToken && simulateExpireToken(currentEmail.data.setupToken)}
                          className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold transition-all cursor-pointer"
                          title="Simulate token expiration (>15 mins) to test expired link rejection"
                        >
                          Simulate Expired Token
                        </button>
                        <button
                          type="button"
                          onClick={() => currentEmail.data?.setupToken && simulateUseToken(currentEmail.data.setupToken)}
                          className="px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-bold transition-all cursor-pointer"
                          title="Mark token as used to test single-use rejection"
                        >
                          Simulate Used Token
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* OTP Code Box (If OTP) */}
                {currentEmail.type === 'OTP_CODE' && currentEmail.data?.otpCode && (
                  <div className="bg-orange-50/70 border border-[#FF5401]/25 rounded-2xl p-4 text-center space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Verification Code</span>
                    <p className="text-2xl font-mono font-semibold tracking-widest text-[#FF5401]">
                      {currentEmail.data.otpCode}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <Mail className="w-10 h-10 text-slate-300" />
                <p className="text-xs font-semibold text-slate-500">Select an email to view</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

