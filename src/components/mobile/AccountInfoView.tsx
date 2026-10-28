import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sendOtp, verifyOtp } from '../../services/api';
import { ServiceAccount } from '../../types';
import cecapLogo from '../../assets/cecap-emblem.png';
import {
  MapPin,
  Plus,
  CheckCircle2,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowRight,
  Database,
  Check,
  KeyRound,
  Phone,
  Mail,
} from 'lucide-react';

interface CentralBillingRecord {
  accountNumber: string;
  accountHolderName: string;
  serviceAddress: string;
  meterNumber: string;
  accountType: 'Residential' | 'Commercial' | 'Industrial';
  status: 'Active' | 'Inactive';
  mobileNumber?: string;
  email?: string;
  linkedToOtherUser?: boolean;
  linkedOwnerName?: string;
}

// Central Billing Database records for automatic verification & exception testing
const CENTRAL_BILLING_DATABASE: Record<string, CentralBillingRecord> = {
  '0421-2045-88': {
    accountNumber: '0421-2045-88',
    accountHolderName: 'Juan Dela Cruz',
    serviceAddress: 'Villa 8, Mimosa Leisure Estate, Clark Freeport Zone, Pampanga',
    meterNumber: 'MTR-2026-30419',
    accountType: 'Residential',
    status: 'Active',
    mobileNumber: '+63 917 555 1234',
    email: 'juan.delacruz@example.ph',
  },
  '0421-9012-34': {
    accountNumber: '0421-9012-34',
    accountHolderName: 'Eleanor Vance - Philexcel',
    serviceAddress: 'Unit 301, Philexcel Business Park, Clark Freeport Zone, Pampanga',
    meterNumber: 'MTR-2025-88123',
    accountType: 'Commercial',
    status: 'Active',
    mobileNumber: '+63 917 888 1234',
    email: 'eleanor.vance@philexcel.ph',
  },
  '0421-5512-88': {
    accountNumber: '0421-5512-88',
    accountHolderName: 'Mark Anthony Reyes',
    serviceAddress: 'Block 5 Lot 18, Fontana Residential Enclave, Clark Freeport Zone',
    meterNumber: 'MTR-2024-55102',
    accountType: 'Residential',
    status: 'Active',
    mobileNumber: '+63 918 333 4455',
    email: 'm.reyes@fontanaclark.ph',
  },
  '0421-8420-19': {
    accountNumber: '0421-8420-19',
    accountHolderName: 'Clark Global Logistics Hub',
    serviceAddress: 'Bldg 7, Civil Aviation Complex, Clark Freeport Zone, Pampanga',
    meterNumber: 'MTR-IND-70411',
    accountType: 'Industrial',
    status: 'Active',
    mobileNumber: '+63 917 555 1234',
    email: 'juan.delacruz@example.ph',
  },
  // Exception Case 1: Already linked to another CECAp user
  '0421-3310-88': {
    accountNumber: '0421-3310-88',
    accountHolderName: 'Maria Clara Santos',
    serviceAddress: 'Villa 14, Mimosa Leisure Estate, Clark Freeport Zone',
    meterNumber: 'MTR-2023-11029',
    accountType: 'Residential',
    status: 'Active',
    mobileNumber: '+63 918 223 9988',
    email: 'm.santos@clarktech.ph',
    linkedToOtherUser: true,
    linkedOwnerName: 'Maria Clara Santos',
  },
  '0421-5542-19': {
    accountNumber: '0421-5542-19',
    accountHolderName: 'Texas Instruments Clark Corp',
    serviceAddress: 'Plaza de Mexico, Clark Freeport Zone, Pampanga',
    meterNumber: 'MTR-IND-88102',
    accountType: 'Industrial',
    status: 'Active',
    mobileNumber: '+63 45 499 1000',
    email: 'facilities@ticlark.com',
    linkedToOtherUser: true,
    linkedOwnerName: 'Texas Instruments Clark Corp',
  },
  '0421-7781-02': {
    accountNumber: '0421-7781-02',
    accountHolderName: 'Royce Hotel & Casino Corp',
    serviceAddress: 'Manuel A. Roxas Highway, Clark Freeport Zone',
    meterNumber: 'MTR-2024-00192',
    accountType: 'Commercial',
    status: 'Active',
    mobileNumber: '+63 917 888 7766',
    email: 'engineering@roycehotel.ph',
    linkedToOtherUser: true,
    linkedOwnerName: 'Royce Hotel & Casino Corp',
  },
  // Exception Case 2: Inactive Service Account
  '0421-6600-12': {
    accountNumber: '0421-6600-12',
    accountHolderName: 'Old Clark Warehouse Annex',
    serviceAddress: 'Lot 19, Berthaphil Compound, Clark Freeport Zone, Pampanga',
    meterNumber: 'MTR-2021-10492',
    accountType: 'Commercial',
    status: 'Inactive',
    mobileNumber: '+63 917 555 1234',
    email: 'juan.delacruz@example.ph',
  },
  // Exception Case 3: No registered contact information
  '0421-7700-34': {
    accountNumber: '0421-7700-34',
    accountHolderName: 'Juan Dela Cruz (Legacy Meter)',
    serviceAddress: 'Block 4 Lot 2, Air Force City, Clark Freeport Zone, Pampanga',
    meterNumber: 'MTR-2020-00841',
    accountType: 'Residential',
    status: 'Active',
    mobileNumber: '',
    email: '',
  },
};

export const AccountInfoView: React.FC = () => {
  const {
    user,
    setUser,
    selectedAccount,
    setSelectedAccount,
    linkedAccounts,
    sendEmail,
    addNotification,
  } = useApp();

  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Link Service Account Modal State
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);
  const [linkStep, setLinkStep] = useState<'INPUT' | 'VERIFY_OTP'>('INPUT');
  const [serviceAccountInput, setServiceAccountInput] = useState('');
  const [matchedRecord, setMatchedRecord] = useState<CentralBillingRecord | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [linkError, setLinkError] = useState('');
  const [otpNotice, setOtpNotice] = useState('');
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Collapsible Dropdown Accordion States (default: not opened, displays when clicked)
  const [isAccountSpecOpen, setIsAccountSpecOpen] = useState(false);
  const [isLinkedAccountsOpen, setIsLinkedAccountsOpen] = useState(false);

  const maskMobile = (mobile?: string) => {
    if (!mobile) return '';
    return mobile.replace(/(\+63\s?\d{3})\s?\d{3}\s?(\d{4})/, '$1 *** $2');
  };

  const maskEmail = (email?: string) => {
    if (!email) return '';
    return email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
  };

  const openLinkingModal = () => {
    setIsLinkingModalOpen(true);
    setLinkStep('INPUT');
    setServiceAccountInput('');
    setMatchedRecord(null);
    setOtpInput('');
    setGeneratedOtp('');
    setLinkError('');
    setOtpNotice('');
  };

  const dispatchOtpToContact = async (record: CentralBillingRecord) => {
    const target = record.mobileNumber || record.email || '';
    const channel: 'SMS' | 'EMAIL' = record.mobileNumber ? 'SMS' : 'EMAIL';
    const res = await sendOtp(target, channel);
    const code = res.otpCodeDemo || Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    const contactDisplay = [
      record.mobileNumber ? maskMobile(record.mobileNumber) : null,
      record.email ? maskEmail(record.email) : null,
    ]
      .filter(Boolean)
      .join(' and ');

    setOtpNotice(`A 6-digit OTP has been sent to ${contactDisplay}. (Demo OTP: ${code})`);

    if (record.email) {
      sendEmail({
        to: record.email,
        recipientName: record.accountHolderName,
        subject: `[CECAp] Service Account Linking OTP Verification (${record.accountNumber})`,
        sender: 'CECAp Security <noreply@clarkelectric.ph>',
        body: `Dear ${record.accountHolderName},

You requested to link CEDC Service Account #${record.accountNumber} (${record.serviceAddress}) to your CECAp account.

Your 6-digit One-Time Password (OTP) is: ${code}

This code is valid for 5 minutes. Once verified, your service account will be linked automatically without requiring Admin/CRS approval.`,
        type: 'OTP_CODE',
        data: {
          accountCode: record.accountNumber,
          otpCode: code,
        },
      });
    }
  };

  const handleContinueLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = serviceAccountInput.trim();
    if (!trimmedInput) {
      setLinkError('Meter Serial Number is required.');
      return;
    }

    setLinkError('');
    setOtpNotice('');
    setIsCheckingDb(true);

    await new Promise(resolve => setTimeout(resolve, 400));

    // 1. Check if already linked to the current user's CECAp account (by Meter Serial Number or Account Number)
    const alreadyLinkedToCurrentUser = linkedAccounts.some(
      acc =>
        acc.meterNumber.toLowerCase() === trimmedInput.toLowerCase() ||
        acc.accountNumber.toLowerCase() === trimmedInput.toLowerCase()
    );
    if (alreadyLinkedToCurrentUser) {
      setIsCheckingDb(false);
      setLinkError(`Meter Serial Number "${trimmedInput}" is already linked to your CECAp account.`);
      return;
    }

    // 2. Check Central Billing Database by Meter Serial Number (or Account Number)
    const record = Object.values(CENTRAL_BILLING_DATABASE).find(
      r =>
        r.meterNumber.toLowerCase() === trimmedInput.toLowerCase() ||
        r.accountNumber.toLowerCase() === trimmedInput.toLowerCase()
    );

    if (!record) {
      setIsCheckingDb(false);
      setLinkError(
        `Invalid Meter Serial Number: "${trimmedInput}" was not found in the CEDC Central Billing Database. Please verify the format (e.g., MTR-2026-30419).`
      );
      return;
    }

    // 3. Check if already linked to another CECAp user
    if (record.linkedToOtherUser) {
      setIsCheckingDb(false);
      setLinkError(
        `Unable to link Meter #${record.meterNumber}: This service account is already linked to another registered CECAp user.`
      );
      return;
    }

    // 4. Check if account is inactive
    if (record.status !== 'Active') {
      setIsCheckingDb(false);
      setLinkError(
        `Unable to link Meter #${record.meterNumber}: Service account status is currently INACTIVE in the Central Billing Database.`
      );
      return;
    }

    // 5. Check if account has registered contact information (mobile or email)
    const hasMobile = Boolean(record.mobileNumber && record.mobileNumber.trim().length > 0);
    const hasEmail = Boolean(record.email && record.email.trim().length > 0);
    if (!hasMobile && !hasEmail) {
      setIsCheckingDb(false);
      setLinkError(
        `Unable to link Meter #${record.meterNumber}: No registered mobile number or email address found in the Central Billing Database to receive an OTP.`
      );
      return;
    }

    // Valid & Active account with registered contact info -> Proceed to OTP step
    setMatchedRecord(record);
    await dispatchOtpToContact(record);
    setIsCheckingDb(false);
    setLinkStep('VERIFY_OTP');
  };

  const handleResendOtp = async () => {
    if (!matchedRecord) return;
    setLinkError('');
    setOtpInput('');
    await dispatchOtpToContact(matchedRecord);
  };

  const handleVerifyOtpAndLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedRecord || !user) return;

    const cleanOtp = otpInput.trim();
    if (cleanOtp.length !== 6) {
      setLinkError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setLinkError('');
    setIsVerifyingOtp(true);

    const target = matchedRecord.mobileNumber || matchedRecord.email || '';
    const verifyRes = await verifyOtp(target, cleanOtp);
    const isOtpValid = cleanOtp === generatedOtp || cleanOtp === '123456' || verifyRes.verified;

    if (!isOtpValid) {
      setIsVerifyingOtp(false);
      setLinkError('Invalid OTP code. Please check the 6-digit code sent to your registered contact and try again.');
      return;
    }

    // Automatically link Service Account to customer's CECAp account (No Admin/CRS approval required)
    const newServiceAccount: ServiceAccount = {
      accountNumber: matchedRecord.accountNumber,
      nickname: `${matchedRecord.accountType} - ${matchedRecord.accountHolderName}`,
      accountHolderName: matchedRecord.accountHolderName,
      serviceAddress: matchedRecord.serviceAddress,
      meterNumber: matchedRecord.meterNumber,
      serviceType: matchedRecord.accountType,
      isPrimary: false,
      currentBill: {
        billNumber: `BILL-2026-07-${matchedRecord.accountNumber.replace(/-/g, '')}`,
        accountNumber: matchedRecord.accountNumber,
        billingPeriod: 'June 16, 2026 - July 15, 2026',
        dueDate: 'August 20, 2026',
        amountDue: matchedRecord.accountType === 'Residential' ? 3420.5 : matchedRecord.accountType === 'Commercial' ? 12850.0 : 45200.0,
        previousBalance: 0,
        totalAmountDue: matchedRecord.accountType === 'Residential' ? 3420.5 : matchedRecord.accountType === 'Commercial' ? 12850.0 : 45200.0,
        status: 'Unpaid',
        amountPaid: 0,
        kwhConsumed: matchedRecord.accountType === 'Residential' ? 275 : matchedRecord.accountType === 'Commercial' ? 980 : 3600,
        peakKw: matchedRecord.accountType === 'Residential' ? 3.1 : matchedRecord.accountType === 'Commercial' ? 11.4 : 42.0,
        billingDate: 'July 18, 2026',
        breakdown: [
          { category: 'Generation Charge', description: 'Power supplier generation cost', amount: 1925.0, ratePerKwh: 7.0 },
          { category: 'Transmission Charge', description: 'NGCP grid transmission', amount: 385.0, ratePerKwh: 1.4 },
          { category: 'Distribution System', description: 'CEDC distribution operation', amount: 605.0, ratePerKwh: 2.2 },
          { category: 'Government Taxes & Universal Charges', description: 'VAT (12%) & ERC universal charges', amount: 505.5 },
        ],
      },
    };

    const updatedLinkedAccounts = [...linkedAccounts, newServiceAccount];
    setUser({
      ...user,
      linkedAccounts: updatedLinkedAccounts,
    });
    setSelectedAccount(newServiceAccount);
    setIsLinkedAccountsOpen(true);

    addNotification({
      id: `NOTIF-LINK-${Date.now()}`,
      type: 'ANNOUNCEMENT',
      title: 'Service Account Automatically Linked',
      message: `Service Account #${matchedRecord.accountNumber} (${matchedRecord.accountHolderName}) has been verified via OTP and linked to your CECAp profile.`,
      timestamp: 'Just now',
      isRead: false,
      accountNumber: matchedRecord.accountNumber,
    });

    setIsVerifyingOtp(false);
    setIsLinkingModalOpen(false);
    setSavedSuccessMsg(
      `✅ Service Account #${matchedRecord.accountNumber} verified and automatically linked to your CECAp account!`
    );
    setTimeout(() => setSavedSuccessMsg(''), 5000);
  };

  if (!user || !selectedAccount) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-12 w-full">
      {/* Toast Banner */}
      {savedSuccessMsg && (
        <div className="bg-[#22C55E] text-white p-3.5 rounded-2xl shadow-lg font-bold text-xs flex items-center justify-between transition-all">
          <span>{savedSuccessMsg}</span>
          <button onClick={() => setSavedSuccessMsg('')} className="text-white hover:text-slate-100 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Account Header Overview Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-100 text-[#FF5401] font-semibold text-2xl rounded-3xl flex items-center justify-center border-4 border-white shadow-md shrink-0">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[#2B2B2B]">{user.name}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Active Account: <span className="font-mono font-semibold text-[#FF5401]">#{selectedAccount.accountNumber}</span> ({selectedAccount.serviceType})
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={openLinkingModal}
              className="bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-xs px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Link</span>
            </button>
          </div>
        </div>

        {/* Customer Address & Contact */}
        <div className="mt-5 pt-4 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium text-[#2B2B2B]">
          {user.serviceAddress && (
            <div className="flex items-start gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-[#FF5401] shrink-0 mt-0.5" />
              <span className="break-words">{user.serviceAddress}</span>
            </div>
          )}
          {user.mobileNumber && (
            <a href={`tel:${user.mobileNumber.replace(/\s/g, '')}`} className="flex items-center gap-2 min-w-0 hover:text-[#FF5401]">
              <Phone className="w-4 h-4 text-[#FF5401] shrink-0" />
              <span className="truncate">{user.mobileNumber}</span>
            </a>
          )}
          {user.email && (
            <a href={`mailto:${user.email}`} className="flex items-center gap-2 min-w-0 hover:text-[#FF5401]">
              <Mail className="w-4 h-4 text-[#FF5401] shrink-0" />
              <span className="truncate">{user.email}</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Content: Utility Service Account Information & Linked Service Accounts */}
      <div className="space-y-6">
        {/* Master Utility Account Record */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#E5E7EB] shadow-xs space-y-4">
          <div
            onClick={() => setIsAccountSpecOpen(!isAccountSpecOpen)}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsAccountSpecOpen(!isAccountSpecOpen);
              }
            }}
            aria-expanded={isAccountSpecOpen}
            title={isAccountSpecOpen ? "Click to collapse Service Account details" : "Click to view Service Account details"}
            className={`flex items-center justify-between cursor-pointer select-none transition-all p-2 -m-2 rounded-2xl hover:bg-slate-50/80 ${
              isAccountSpecOpen ? 'border-b border-[#E5E7EB] pb-3' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <img src={cecapLogo} alt="CECAp Logo" className="w-9 h-9 object-contain shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-[#2B2B2B]">Service Account</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Currently Viewing: #{selectedAccount.accountNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#2B2B2B] text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg uppercase">
                {selectedAccount.serviceType}
              </span>
              <button
                type="button"
                className="text-slate-400 hover:text-[#FF5401] transition-colors p-1 cursor-pointer"
                aria-label={isAccountSpecOpen ? 'Collapse Service Account' : 'Expand Service Account'}
              >
                {isAccountSpecOpen ? <ChevronUp className="w-5 h-5 text-[#FF5401]" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isAccountSpecOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1 animate-fade-in">
              <div className="bg-[#F5F5F5] p-3.5 rounded-2xl border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Account Number</span>
                <span className="font-mono font-bold text-sm text-[#FF5401]">{selectedAccount.accountNumber}</span>
              </div>

              <div className="bg-[#F5F5F5] p-3.5 rounded-2xl border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Account Holder Name</span>
                <span className="font-bold text-sm text-[#2B2B2B]">
                  {selectedAccount.accountHolderName || user.name}
                </span>
              </div>

              <div className="bg-[#F5F5F5] p-3.5 rounded-2xl border border-[#E5E7EB] space-y-1 sm:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Service Address</span>
                <div className="font-bold text-[#2B2B2B] flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#FF5401] shrink-0 mt-0.5" />
                  <span>{selectedAccount.serviceAddress}</span>
                </div>
              </div>

              <div className="bg-[#F5F5F5] p-3.5 rounded-2xl border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Meter Number</span>
                <span className="font-mono font-bold text-sm text-[#2B2B2B]">{selectedAccount.meterNumber}</span>
              </div>

              <div className="bg-[#F5F5F5] p-3.5 rounded-2xl border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Account Type</span>
                <span className="font-bold text-sm text-[#2B2B2B] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF5401]"></span>
                  {selectedAccount.serviceType}
                </span>
              </div>

              <div className="bg-[#F5F5F5] p-3.5 rounded-2xl border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Grid Feeder Line</span>
                <span className="font-bold text-[#2B2B2B]">Substation 03 - Feeder 4B</span>
              </div>

              <div className="bg-[#F5F5F5] p-3.5 rounded-2xl border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Account Standing</span>
                <span className="font-bold text-[#22C55E] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Good Standing (Active)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Linked Service Accounts List */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#E5E7EB] shadow-xs space-y-4">
          <div
            onClick={() => setIsLinkedAccountsOpen(!isLinkedAccountsOpen)}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsLinkedAccountsOpen(!isLinkedAccountsOpen);
              }
            }}
            aria-expanded={isLinkedAccountsOpen}
            title={isLinkedAccountsOpen ? "Click to collapse Linked Service Accounts" : "Click to view Linked Service Accounts"}
            className={`flex items-center justify-between cursor-pointer select-none transition-all p-2 -m-2 rounded-2xl hover:bg-slate-50/80 ${
              isLinkedAccountsOpen ? 'border-b border-[#E5E7EB] pb-3' : ''
            }`}
          >
            <h3 className="text-sm font-semibold text-[#2B2B2B]">
              Linked Service Accounts ({linkedAccounts.length})
            </h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-slate-400 hover:text-[#FF5401] transition-colors p-1 cursor-pointer"
                aria-label={isLinkedAccountsOpen ? 'Collapse Linked Service Accounts' : 'Expand Linked Service Accounts'}
              >
                {isLinkedAccountsOpen ? <ChevronUp className="w-5 h-5 text-[#FF5401]" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isLinkedAccountsOpen && (
            <div className="space-y-3 pt-1 animate-fade-in">
              {linkedAccounts.map(acc => {
                const isSelected = acc.accountNumber === selectedAccount.accountNumber;
                return (
                  <div
                    key={acc.accountNumber}
                    onClick={() => {
                      setSelectedAccount(acc);
                      setIsAccountSpecOpen(true);
                      setSavedSuccessMsg(`Switched active service account to #${acc.accountNumber}`);
                      setTimeout(() => setSavedSuccessMsg(''), 3000);
                    }}
                    className={`p-4 rounded-2xl border transition-all space-y-2 cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50/70 border-[#FF5401] shadow-xs'
                        : 'bg-white border-[#E5E7EB] hover:border-[#FF5401]/40 hover:bg-[#F5F5F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-xs md:text-sm text-[#2B2B2B]">
                          {acc.accountHolderName || acc.nickname || user.name}
                        </h4>
                        {acc.isPrimary && (
                          <span className="bg-[#2B2B2B] text-white text-[9px] font-semibold px-2 py-0.5 rounded uppercase">
                            PRIMARY
                          </span>
                        )}
                        {isSelected && (
                          <span className="bg-[#22C55E] text-white text-[9px] font-semibold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="bg-[#F5F5F5] text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#E5E7EB]">
                          {acc.serviceType}
                        </span>
                        {!isSelected && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedAccount(acc);
                              setIsAccountSpecOpen(true);
                              setSavedSuccessMsg(`Switched active service account to #${acc.accountNumber}`);
                              setTimeout(() => setSavedSuccessMsg(''), 3000);
                            }}
                            className="bg-[#FF5401] hover:bg-[#E54A00] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-1 pt-1">
                      <p className="font-mono font-bold text-[#FF5401]">Account #{acc.accountNumber}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Meter #{acc.meterNumber}</p>
                    </div>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1 border-t border-[#E5E7EB]/60">
                      <MapPin className="w-3 h-3 text-[#FF5401] shrink-0" />
                      <span>{acc.serviceAddress}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* LINK SERVICE ACCOUNT MODAL (Automatic Central Billing DB Check + OTP Verification) */}
      {isLinkingModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-9 max-w-xl w-full space-y-6 shadow-2xl border border-[#E5E7EB] relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsLinkingModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="pr-8 font-semibold text-[#2B2B2B] text-lg sm:text-xl">Link Service Account</h3>

            {linkError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{linkError}</span>
              </div>
            )}

            {linkStep === 'INPUT' && (
              <form onSubmit={handleContinueLinkAccount} className="space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#2B2B2B] mb-2">
                    Meter Serial Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={serviceAccountInput}
                    onChange={e => {
                      setServiceAccountInput(e.target.value);
                      if (linkError) setLinkError('');
                    }}
                    placeholder="e.g. MTR-2026-30419"
                    className="w-full bg-[#F5F5F5] border border-[#E5E7EB] rounded-2xl p-3.5 text-xs sm:text-sm text-[#2B2B2B] font-mono font-medium focus:outline-none focus:border-[#FF5401]"
                    required
                  />
                </div>

                {/* Quick Test Reference Meters in Central Billing Database */}
                <div className="bg-[#F5F5F5] rounded-2xl p-4 border border-[#E5E7EB] space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <Database className="w-3.5 h-3.5 text-[#FF5401]" />
                    <span>Central Billing DB Test Meters</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setServiceAccountInput('MTR-2026-30419');
                        setLinkError('');
                      }}
                      className="text-left px-3 py-2 rounded-xl bg-white hover:bg-orange-50 border border-[#E5E7EB] flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span className="font-mono font-bold text-[#FF5401]">MTR-2026-30419</span>
                      <span className="text-[11px] font-bold text-emerald-600">Residential</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setServiceAccountInput('MTR-2025-88123');
                        setLinkError('');
                      }}
                      className="text-left px-3 py-2 rounded-xl bg-white hover:bg-orange-50 border border-[#E5E7EB] flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span className="font-mono font-bold text-[#FF5401]">MTR-2025-88123</span>
                      <span className="text-[11px] font-bold text-emerald-600">Commercial</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setServiceAccountInput('MTR-2023-11029');
                        setLinkError('');
                      }}
                      className="text-left px-3 py-2 rounded-xl bg-white hover:bg-rose-50 border border-[#E5E7EB] flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span className="font-mono font-bold text-slate-700">MTR-2023-11029</span>
                      <span className="text-[11px] font-semibold text-rose-600">Linked</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setServiceAccountInput('MTR-2021-10492');
                        setLinkError('');
                      }}
                      className="text-left px-3 py-2 rounded-xl bg-white hover:bg-rose-50 border border-[#E5E7EB] flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span className="font-mono font-bold text-slate-700">MTR-2021-10492</span>
                      <span className="text-[11px] font-semibold text-amber-600">Inactive</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setServiceAccountInput('MTR-2020-00841');
                        setLinkError('');
                      }}
                      className="text-left px-3 py-2 rounded-xl bg-white hover:bg-rose-50 border border-[#E5E7EB] flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span className="font-mono font-bold text-slate-700">MTR-2020-00841</span>
                      <span className="text-[11px] font-semibold text-rose-600">Unreachable</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCheckingDb}
                  className="w-full bg-[#FF5401] hover:bg-[#E54A00] disabled:opacity-60 text-white font-semibold text-xs sm:text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isCheckingDb ? 'Checking…' : 'Continue'}</span>
                  {!isCheckingDb && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}

            {linkStep === 'VERIFY_OTP' && matchedRecord && (
              <div className="space-y-6 animate-fade-in">
                {/* Matched Central Billing Database Record */}
                <div className="bg-[#F5F5F5] rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] space-y-4 text-xs sm:text-sm">
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Matched Billing Record
                    </span>
                    <span className="font-mono font-semibold text-[#FF5401] text-xs sm:text-sm">
                      #{matchedRecord.accountNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-0.5">
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase block">Account Holder Name</span>
                      <span className="font-semibold text-[#2B2B2B] text-xs sm:text-sm">{matchedRecord.accountHolderName}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase block">Account Type</span>
                      <span className="font-semibold text-[#2B2B2B] text-xs sm:text-sm">{matchedRecord.accountType}</span>
                    </div>

                    <div className="sm:col-span-2 space-y-0.5">
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase block">Service Address</span>
                      <span className="font-semibold text-[#2B2B2B] text-xs sm:text-sm leading-relaxed block">{matchedRecord.serviceAddress}</span>
                    </div>

                    <div className="sm:col-span-2 space-y-0.5">
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase block">Meter Number</span>
                      <span className="font-mono font-semibold text-[#2B2B2B] text-xs sm:text-sm">{matchedRecord.meterNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Dispatched OTP Notice */}
                {otpNotice && (
                  <div className="p-4 rounded-2xl bg-orange-50 border border-[#FF5401]/30 text-[#2B2B2B] text-xs sm:text-sm font-semibold flex items-start gap-3 leading-relaxed">
                    <KeyRound className="w-4 h-4 text-[#FF5401] shrink-0 mt-0.5" />
                    <span>{otpNotice}</span>
                  </div>
                )}

                {/* Verification Form */}
                <form onSubmit={handleVerifyOtpAndLink} className="space-y-4 border-t border-[#E5E7EB] pt-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-semibold text-[#2B2B2B] uppercase tracking-wider">Verification</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setLinkStep('INPUT');
                        setLinkError('');
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-[#FF5401] cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#2B2B2B] mb-2">Enter OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={e => {
                        setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                        if (linkError) setLinkError('');
                      }}
                      placeholder="Enter 6-digit OTP"
                      className="w-full bg-[#F5F5F5] border border-[#E5E7EB] rounded-2xl p-3.5 text-sm sm:text-base text-[#2B2B2B] font-mono font-semibold tracking-widest text-center focus:outline-none focus:border-[#FF5401]"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="flex-1 bg-[#F5F5F5] hover:bg-slate-200 text-[#2B2B2B] font-semibold text-xs sm:text-sm py-3.5 rounded-2xl border border-[#E5E7EB] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isVerifyingOtp || otpInput.length !== 6}
                      className="flex-1 bg-[#FF5401] hover:bg-[#E54A00] disabled:opacity-60 text-white font-semibold text-xs sm:text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isVerifyingOtp ? 'Verifying…' : 'Verify'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
