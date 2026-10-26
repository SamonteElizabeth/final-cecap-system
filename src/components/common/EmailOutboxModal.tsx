import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SentEmail } from '../../types';
import {
  Mail,
  Inbox,
  Copy,
  X,
  Search,
  Check,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';
import cecapWordmark from '../../assets/cecap-wordmark.png';

type EmailFilter = 'ALL' | 'SECURITY' | 'ACCOUNT';

const EMAIL_FILTERS: { key: EmailFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'SECURITY', label: 'Security' },
  { key: 'ACCOUNT', label: 'Account' },
];

const SECURITY_TYPES: SentEmail['type'][] = ['OTP_CODE', 'ADMIN_MFA_SETUP', 'PASSWORD_RESET'];

// Icon + colour per email type, matching the Notifications Center palette
const emailIcon = (type: SentEmail['type']) => {
  switch (type) {
    case 'OTP_CODE':
    case 'ADMIN_MFA_SETUP':
      return { icon: ShieldCheck, color: 'text-[#FF5401]' };
    case 'PASSWORD_RESET':
      return { icon: KeyRound, color: 'text-amber-500' };
    case 'REGISTRATION_APPROVED':
    case 'ADMIN_ACTIVATED':
      return { icon: CheckCircle2, color: 'text-emerald-500' };
    case 'REGISTRATION_RECEIVED':
      return { icon: Clock, color: 'text-amber-500' };
    case 'REGISTRATION_REJECTED':
      return { icon: AlertTriangle, color: 'text-rose-500' };
    case 'ADMIN_SETUP_INVITE':
      return { icon: UserPlus, color: 'text-indigo-500' };
    default:
      return { icon: Mail, color: 'text-[#FF5401]' };
  }
};

// Body text without the greeting, for the card preview
const emailPreview = (email: SentEmail) =>
  email.body
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !/^(hello|hi|dear)\b/i.test(line))
    .join(' ');

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
  const [filter, setFilter] = useState<EmailFilter>('ALL');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!emailModalOpen) return null;

  const currentEmail = selectedEmail || (sentEmails.length > 0 ? sentEmails[0] : null);

  // "CECAp Security <security@clarkelectric.ph>" -> name + address
  const senderMatch = currentEmail?.sender.match(/^(.*?)\s*<([^>]+)>$/);
  const sender = {
    name: (senderMatch ? senderMatch[1] : currentEmail?.sender || '').trim() || 'CECAp',
    address: senderMatch ? senderMatch[2] : '',
  };

  const otpCode = currentEmail?.data?.otpCode || currentEmail?.body.match(/\b\d{6}\b/)?.[0] || '123456';

  const credentials = currentEmail?.data
    ? [
        { key: 'user', label: 'Username', value: currentEmail.data.username || currentEmail.data.accountCode || '0421-9012-34' },
        { key: 'acct', label: 'Account number', value: currentEmail.data.username ? currentEmail.data.accountCode || '' : '' },
        { key: 'pass', label: 'Temporary password', value: currentEmail.data.tempPassword || 'CedcTemp#7419' },
      ].filter(row => row.value)
    : [];

  const filteredEmails = sentEmails.filter(email => {
    if (filter === 'SECURITY' && !SECURITY_TYPES.includes(email.type)) return false;
    if (filter === 'ACCOUNT' && SECURITY_TYPES.includes(email.type)) return false;
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
    const accountCode = emailObj.data?.username || emailObj.data?.accountCode || '0421-9012-34';
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
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xl w-full max-w-5xl h-[88vh] sm:h-[82vh] flex flex-col overflow-hidden">
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
          <div className="w-full md:w-96 border-r border-[#E5E7EB] bg-[#FAFAFA] flex flex-col h-2/5 md:h-full shrink-0">
            {/* Search & filter tabs */}
            <div className="p-3 space-y-3 border-b border-[#E5E7EB] bg-white">
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
              <div className="flex bg-[#E5E7EB] p-1 gap-1 rounded-full text-[11px] font-semibold">
                {EMAIL_FILTERS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`flex-1 py-1.5 px-2 rounded-full transition-all cursor-pointer ${
                      filter === key ? 'bg-white text-[#FF5401] shadow-xs' : 'text-slate-600 hover:text-[#2B2B2B]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email cards (same style as Notifications Center) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {filteredEmails.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-[#E5E7EB] text-slate-400 space-y-2">
                  <Inbox className="w-7 h-7 mx-auto text-slate-300" />
                  <p className="text-xs">No emails found in this category.</p>
                </div>
              ) : (
                filteredEmails.map(email => {
                  const isSelected = currentEmail?.id === email.id;
                  const { icon: Icon, color } = emailIcon(email.type);
                  return (
                    <button
                      key={email.id}
                      type="button"
                      onClick={() => setSelectedEmail(email)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                        isSelected
                          ? 'bg-orange-50/70 border-[#FF5401]/30 shadow-xs'
                          : 'bg-white border-[#E5E7EB] hover:border-slate-300'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#FF5401] absolute top-4 right-4" />}

                      <div className="p-2.5 rounded-xl bg-white shadow-xs shrink-0 border border-[#E5E7EB]">
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>

                      <div className="flex-1 min-w-0 pr-3">
                        <h4 className="text-xs md:text-sm font-bold text-[#2B2B2B] truncate">{email.subject}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2">{emailPreview(email)}</p>
                        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[#E5E7EB] text-[10px] text-slate-400 font-medium">
                          <span className="truncate">To: {email.recipientName}</span>
                          <span className="shrink-0">{email.sentAt}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Email Content */}
          <div className="flex-1 bg-white overflow-y-auto h-3/5 md:h-full">
            {currentEmail ? (
              <div className="px-4 py-5 sm:px-8 sm:py-6 space-y-5">
                {/* Message header, as an inbox shows it */}
                <div className="space-y-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-[#111111] leading-snug">{currentEmail.subject}</h2>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F1F1F1] text-[#333333] flex items-center justify-center text-sm font-semibold shrink-0">
                      {sender.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1 text-[13px] leading-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="truncate">
                          <span className="font-semibold text-[#111111]">{sender.name}</span>{' '}
                          {sender.address && <span className="text-[#6B6B6B]">&lt;{sender.address}&gt;</span>}
                        </p>
                        <span className="text-xs text-[#6B6B6B] shrink-0">{currentEmail.sentAt}</span>
                      </div>
                      <p className="text-[#6B6B6B] truncate">
                        to {currentEmail.recipientName} &lt;{currentEmail.to}&gt;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email message (600px template) */}
                <div className="bg-[#F6F6F6] rounded-xl px-3 py-6 sm:px-6 sm:py-8">
                  <div className="max-w-[600px] mx-auto bg-white border border-[#E6E6E6] rounded-lg overflow-hidden text-[#111111]">
                    <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-[#EDEDED]">
                      <img src={cecapWordmark} alt="CECAp" className="h-7 w-auto object-contain" />
                    </div>

                    <div className="px-6 sm:px-10 py-8 space-y-5 text-[15px] leading-7">
                      {currentEmail.type === 'ADMIN_SETUP_INVITE' ? (
                        <>
                          <h1 className="text-[22px] leading-8 font-semibold">Set up your admin account</h1>
                          <p>Hello {currentEmail.recipientName},</p>
                          <p>
                            An administrator account has been created for you on CECAp, the Clark Electric customer
                            engagement platform. To get started, set your password and turn on multi-factor
                            authentication (MFA).
                          </p>
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => handleOpenAdminSetupLink(currentEmail)}
                              className="bg-[#111111] hover:bg-[#333333] text-white text-sm font-semibold px-6 py-3 rounded-md transition-colors cursor-pointer"
                            >
                              Setup
                            </button>
                          </div>
                          <p className="text-[13px] leading-6 text-[#555555]">
                            This link can be used once. If it has expired, ask your system administrator to send a new
                            invitation.
                          </p>
                        </>
                      ) : currentEmail.type === 'REGISTRATION_APPROVED' ? (
                        <>
                          <h1 className="text-[22px] leading-8 font-semibold">Your registration is approved</h1>
                          <p>Hello {currentEmail.recipientName},</p>
                          <p>
                            Your CECAp customer account has been verified and approved. Use the details below to log
                            in. You will be asked to set a new password the first time you log in.
                          </p>
                          {credentials.length > 0 && (
                            <div className="border border-[#E6E6E6] rounded-md divide-y divide-[#E6E6E6] text-sm">
                              {credentials.map(({ key, label, value }) => (
                                <div key={key} className="flex items-center gap-3 px-4 py-3">
                                  <span className="text-[#555555] w-[42%] shrink-0">{label}</span>
                                  <span className="font-mono font-semibold break-all flex-1">{value}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(value, key)}
                                    className="text-[#555555] hover:text-[#111111] shrink-0 cursor-pointer"
                                    title={`Copy ${label.toLowerCase()}`}
                                  >
                                    {copiedField === key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => handleAutoFillLogin(currentEmail)}
                              className="bg-[#111111] hover:bg-[#333333] text-white text-sm font-semibold px-6 py-3 rounded-md transition-colors cursor-pointer"
                            >
                              Login
                            </button>
                          </div>
                          <p className="text-[13px] leading-6 text-[#555555]">
                            For your security, never share your password with anyone. Clark Electric staff will never
                            ask for it.
                          </p>
                        </>
                      ) : currentEmail.type === 'OTP_CODE' || currentEmail.type === 'ADMIN_MFA_SETUP' || currentEmail.type === 'PASSWORD_RESET' ? (
                        <>
                          <h1 className="text-[22px] leading-8 font-semibold">
                            {currentEmail.type === 'PASSWORD_RESET'
                              ? 'Reset your password'
                              : currentEmail.type === 'ADMIN_MFA_SETUP'
                              ? 'Your admin verification code'
                              : 'Your verification code'}
                          </h1>
                          <p>Hello {currentEmail.recipientName},</p>
                          <p>
                            {currentEmail.type === 'PASSWORD_RESET'
                              ? 'We received a request to reset the password for your CECAp account. Enter this code to continue:'
                              : 'Enter this code to finish logging in to CECAp:'}
                          </p>
                          <div className="bg-[#F6F6F6] border border-[#E6E6E6] rounded-md py-5 text-center">
                            <span className="text-[32px] leading-none font-mono font-semibold tracking-[0.3em] pl-[0.3em]">
                              {otpCode}
                            </span>
                          </div>
                          <p className="text-[13px] leading-6 text-[#555555]">
                            This code expires in 5 minutes. If you didn't request it, you can ignore this email, but
                            consider changing your password.
                          </p>
                        </>
                      ) : (
                        <>
                          <h1 className="text-[22px] leading-8 font-semibold">
                            {currentEmail.subject.replace(/\[CECAp\]\s*/i, '')}
                          </h1>
                          <div className="whitespace-pre-line">{currentEmail.body}</div>
                        </>
                      )}

                      <p className="pt-2">
                        Thank you,
                        <br />
                        The CECAp Team
                      </p>
                    </div>

                    <div className="px-6 sm:px-10 py-6 bg-[#FAFAFA] border-t border-[#EDEDED] text-xs leading-5 text-[#6B6B6B] space-y-1">
                      <p className="font-semibold text-[#333333]">Clark Electric Distribution Corporation</p>
                      <p>Clark Freeport Zone, Pampanga, Philippines</p>
                      <p className="pt-2">
                        This is an automated message. Please do not reply to this email. For help, log in to CECAp and
                        open a ticket under Support.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Demo-only token tools (not part of the email) */}
                {currentEmail.type === 'ADMIN_SETUP_INVITE' && currentEmail.data?.setupToken && (
                  <div className="max-w-[600px] mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B6B6B] border border-dashed border-[#D9D9D9] rounded-lg px-3 py-2">
                    <span>
                      <span className="font-semibold uppercase tracking-wider mr-1.5">Demo</span>
                      <span className="font-mono">{currentEmail.data.setupToken}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleCopy(currentEmail.data?.setupToken || '', 'adm_token')}
                        className="hover:text-[#111111] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'adm_token' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'adm_token' ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => currentEmail.data?.setupToken && simulateExpireToken(currentEmail.data.setupToken)}
                        className="hover:text-[#111111] hover:underline cursor-pointer"
                        title="Test expired token"
                      >
                        Expire
                      </button>
                      <button
                        type="button"
                        onClick={() => currentEmail.data?.setupToken && simulateUseToken(currentEmail.data.setupToken)}
                        className="hover:text-[#111111] hover:underline cursor-pointer"
                        title="Test used token"
                      >
                        Used
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#6B6B6B] space-y-2">
                <Mail className="w-10 h-10 text-[#CCCCCC]" />
                <p className="text-xs font-semibold">Select an email to view</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

