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

                {/* Email Content Body */}
                {currentEmail.type === 'ADMIN_SETUP_INVITE' ? (
                  <div className="py-2 space-y-6">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-[#0B192C] tracking-tight">
                        Admin Account Created
                      </h1>
                      <p className="text-base sm:text-lg text-slate-500 font-normal mt-1">
                        Set Up Your Password & MFA
                      </p>
                    </div>

                    <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                      <p>Hello,</p>
                      <p>
                        An admin account has been created for you in CECAp (Customer Engagement Platform).
                      </p>
                      <p>
                        To get started, please set up your password and configure multi-factor authentication (MFA) to access the Admin Console.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenAdminSetupLink(currentEmail)}
                        className="bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                      >
                        <span>Set Up Your Account</span>
                      </button>
                    </div>

                    <hr className="border-t border-slate-200 pt-2" />

                    <p className="text-xs text-slate-400 text-center leading-relaxed">
                      If you did not expect this email or need assistance,
                      <br />
                      please contact the CECAp support team.
                    </p>

                    {/* Discreet Security Token & Testing Row */}
                    {currentEmail.data?.setupToken && (
                      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                        <span className="font-mono text-slate-500">
                          Token: {currentEmail.data.setupToken}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(currentEmail.data?.setupToken || '', 'adm_token')}
                            className="text-[#0066FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedField === 'adm_token' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'adm_token' ? 'Copied' : 'Copy Token'}</span>
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => currentEmail.data?.setupToken && simulateExpireToken(currentEmail.data.setupToken)}
                            className="text-amber-600 hover:underline"
                            title="Test expired token"
                          >
                            Expire
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => currentEmail.data?.setupToken && simulateUseToken(currentEmail.data.setupToken)}
                            className="text-rose-600 hover:underline"
                            title="Test used token"
                          >
                            Mark Used
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : currentEmail.type === 'REGISTRATION_APPROVED' ? (
                  <div className="py-2 space-y-6">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-[#0B192C] tracking-tight">
                        Registration Approved
                      </h1>
                      <p className="text-base sm:text-lg text-slate-500 font-normal mt-1">
                        Your CECAp Login Credentials
                      </p>
                    </div>

                    <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                      <p>Hello,</p>
                      <p>
                        Your CECAp customer portal registration has been verified and approved.
                      </p>
                      <p>
                        Below are your login credentials to access your billing and services:
                      </p>
                    </div>

                    {currentEmail.data && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase">Account Code</span>
                          <span className="text-sm font-mono font-semibold text-[#FF5401]">
                            {currentEmail.data.accountCode || '0421-9012-34'}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase">Temporary Password</span>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-sm font-mono font-semibold text-[#2B2B2B]">
                              {currentEmail.data.tempPassword || 'CedcTemp#7419'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(currentEmail.data?.tempPassword || 'CedcTemp#7419', 'pass')}
                              className="text-[10px] font-semibold text-[#0066FF] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiedField === 'pass' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedField === 'pass' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleAutoFillLogin(currentEmail)}
                        className="bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Sign In to Your Account</span>
                      </button>
                    </div>

                    <hr className="border-t border-slate-200 pt-2" />

                    <p className="text-xs text-slate-400 text-center leading-relaxed">
                      If you did not expect this email or need assistance,
                      <br />
                      please contact the CECAp support team.
                    </p>
                  </div>
                ) : currentEmail.type === 'OTP_CODE' || currentEmail.type === 'ADMIN_MFA_SETUP' || currentEmail.type === 'PASSWORD_RESET' ? (
                  <div className="py-2 space-y-6">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-[#0B192C] tracking-tight">
                        {currentEmail.type === 'PASSWORD_RESET'
                          ? 'Password Reset Code'
                          : currentEmail.type === 'ADMIN_MFA_SETUP'
                          ? 'Admin Verification Code'
                          : 'Security Verification Code'}
                      </h1>
                      <p className="text-base sm:text-lg text-slate-500 font-normal mt-1">
                        {currentEmail.type === 'PASSWORD_RESET'
                          ? 'Account Recovery'
                          : currentEmail.type === 'ADMIN_MFA_SETUP'
                          ? 'Admin MFA Authentication'
                          : 'One-Time Security Code'}
                      </p>
                    </div>

                    <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                      <p>Hello,</p>
                      <p>
                        Your 6-digit security verification code is:
                      </p>
                    </div>

                    <div className="py-2">
                      <div className="inline-block bg-slate-50 border border-slate-200 rounded-2xl px-8 py-4 text-center">
                        <span className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-[#0066FF]">
                          {currentEmail.data?.otpCode || (currentEmail.body.match(/\b\d{6}\b/) ? currentEmail.body.match(/\b\d{6}\b/)![0] : '123456')}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1">Valid for 5 minutes</p>
                      </div>
                    </div>

                    <hr className="border-t border-slate-200 pt-2" />

                    <p className="text-xs text-slate-400 text-center leading-relaxed">
                      If you did not request this verification code,
                      <br />
                      please contact the CECAp support team immediately.
                    </p>
                  </div>
                ) : (
                  <div className="py-2 space-y-6">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-[#0B192C] tracking-tight">
                        {currentEmail.subject.replace(/\[CECAp\]\s*/i, '')}
                      </h1>
                    </div>

                    <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                      {currentEmail.body}
                    </div>

                    <hr className="border-t border-slate-200 pt-2" />

                    <p className="text-xs text-slate-400 text-center leading-relaxed">
                      If you have questions or need assistance,
                      <br />
                      please contact the CECAp support team.
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

