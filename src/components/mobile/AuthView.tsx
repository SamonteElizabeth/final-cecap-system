import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { changeCustomerPassword } from '../../services/api';
import {
  Shield,
  KeyRound,
  Smartphone,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ScanFace,
  Lock,
  UserCheck,
  FileText,
  User,
  Send,
  MapPin,
  Clock,
  ShieldCheck,
  RefreshCw,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { validatePassword, LockoutStatus } from '../../utils/authPolicy';
import cecapLogo from '../../assets/cecap-wordmark.png';
import substationHero from '../../assets/images/clark_electric_substation_1791368730354.jpg';

/**
 * Reusable clean checklist showing CECAP password policy criteria
 */
const PasswordPolicyChecklist: React.FC<{
  password: string;
  userContext?: { accountNumber?: string; name?: string; email?: string; previousPasswords?: string[] };
}> = ({ password, userContext }) => {
  const result = validatePassword(password, userContext);
  const { rules } = result;

  return (
    <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EBE5DC] text-[11px] space-y-1.5 animate-fade-in">
      <span className="block font-semibold text-[#2B2B2B] text-xs">CECAP Password Policy:</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
        <div className={`flex items-center gap-1.5 ${rules.length ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
          {rules.length ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
          <span>Min. 9 characters</span>
        </div>
        <div className={`flex items-center gap-1.5 ${rules.uppercase && rules.lowercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
          {rules.uppercase && rules.lowercase ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
          <span>Upper & lowercase</span>
        </div>
        <div className={`flex items-center gap-1.5 ${rules.number ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
          {rules.number ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
          <span>At least 1 number (0-9)</span>
        </div>
        <div className={`flex items-center gap-1.5 ${rules.specialChar ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
          {rules.specialChar ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
          <span>Special symbol (!@#$%)</span>
        </div>
        <div className={`flex items-center gap-1.5 ${rules.notUsername && rules.notRepetitive && rules.notCommonPattern ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
          {rules.notUsername && rules.notRepetitive && rules.notCommonPattern ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
          <span>No username/pattern/repetition</span>
        </div>
        <div className={`flex items-center gap-1.5 ${rules.notReused && rules.notCommonlyUsed ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
          {rules.notReused && rules.notCommonlyUsed ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
          <span>No reuse of last 5 passwords</span>
        </div>
      </div>
    </div>
  );
};

export type AuthMode = 'CUSTOMER_LOGIN' | 'ADMIN_LOGIN' | 'REGISTER';

const DEMO_CUSTOMER_USERNAME = 'juan.delacruz';
const DEMO_CUSTOMER_ACCOUNT = '0421-8812-90';

export const AuthView: React.FC<{ initialMode?: AuthMode }> = ({ initialMode = 'CUSTOMER_LOGIN' }) => {
  const {
    setIsAuthenticated,
    setUserRole,
    setActiveTab,
    setAdminUser,
    triggerBiometricAuth,
    submitRegistration,
    user,
    setUser,
    sendEmail,
    setEmailModalOpen,
    logAuthEvent,
    sessionTimeoutNotice,
    setSessionTimeoutNotice,
    passwordExpirationStatus,
    checkLockout,
    recordFailedAttempt,
    unlockAccount,
    updateCustomerPassword,
    adminStaffUsers,
    adminSetupTokens,
    activeSetupToken,
    setActiveSetupToken,
    adminSetupEmailParam,
    setAdminSetupEmailParam,
    showAdminSetupModal,
    setShowAdminSetupModal,
    validateAdminSetupToken,
    completeAdminSetup,
    resendAdminSetupEmail,
    simulateExpireToken,
    simulateUseToken,
    registrationRequests,
  } = useApp();

  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Customer Login form state
  const [customerLoginStep, setCustomerLoginStep] = useState<'CREDENTIALS' | 'MFA_OTP'>('CREDENTIALS');
  const [loginIdentifier, setLoginIdentifier] = useState(DEMO_CUSTOMER_USERNAME);
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [lockoutState, setLockoutState] = useState<LockoutStatus>({
    isLocked: false,
    failedAttempts: 0,
    lockoutRemainingMs: 0,
    lockoutRemainingMinutes: 0,
    lockedUntil: null,
    lockoutMessage: null,
  });

  // Customer MFA / OTP state
  const [customerGeneratedMfa, setCustomerGeneratedMfa] = useState('');
  const [customerMfaInput, setCustomerMfaInput] = useState('');
  const [customerMfaError, setCustomerMfaError] = useState('');
  const [mfaResendCount, setMfaResendCount] = useState(0);

  // Customers log in with a username; lockout, MFA and recovery stay keyed to the account number
  const resolveCustomerAccount = (username: string): string | null => {
    const entered = username.trim().toLowerCase();
    if (!entered) return null;
    if (entered === DEMO_CUSTOMER_USERNAME) return DEMO_CUSTOMER_ACCOUNT;
    if (user?.username && user.username.toLowerCase() === entered) return user.accountNumber;
    const approved = registrationRequests.find(
      r => r.status === 'Approved' && r.accountCode && r.username?.toLowerCase() === entered
    );
    return approved?.accountCode ?? null;
  };
  const loginAccount = resolveCustomerAccount(loginIdentifier);
  const lockoutKey = loginAccount ?? loginIdentifier.trim().toLowerCase();

  // Sync lockout state on username change
  useEffect(() => {
    if (lockoutKey) {
      const status = checkLockout(lockoutKey);
      setLockoutState(status);
      if (status.isLocked && status.lockoutMessage) {
        setLoginError(status.lockoutMessage);
      }
    }
  }, [lockoutKey, checkLockout]);

  useEffect(() => {
    const handleAutofill = (e: any) => {
      if (e.detail?.accountCode) {
        setMode('CUSTOMER_LOGIN');
        setCustomerLoginStep('CREDENTIALS');
        setLoginIdentifier(e.detail.accountCode);
        setLoginPassword(e.detail.tempPass || 'CedcTemp#7419');
      }
    };

    const storedAcc = localStorage.getItem('autofill_account_code');
    const storedPass = localStorage.getItem('autofill_temp_pass');
    if (storedAcc && storedPass) {
      setMode('CUSTOMER_LOGIN');
      setCustomerLoginStep('CREDENTIALS');
      setLoginIdentifier(storedAcc);
      setLoginPassword(storedPass);
      localStorage.removeItem('autofill_account_code');
      localStorage.removeItem('autofill_temp_pass');
    }

    window.addEventListener('cedc_autofill_login', handleAutofill);
    return () => window.removeEventListener('cedc_autofill_login', handleAutofill);
  }, []);

  // First Login & Password Expiration Modal state
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [tempPassInput, setTempPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmNewPassInput, setConfirmNewPassInput] = useState('');
  const [passChangeError, setPassChangeError] = useState('');
  const [pendingLoginUser, setPendingLoginUser] = useState<any>(null);

  // Forgot Password & Account Recovery State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'IDENTIFY' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS'>('IDENTIFY');
  const [forgotIdentifier, setForgotIdentifier] = useState('0421-8812-90');
  const [forgotEmail, setForgotEmail] = useState('juan.delacruz@example.ph');
  const [forgotGeneratedOtp, setForgotGeneratedOtp] = useState('');
  const [forgotOtpInput, setForgotOtpInput] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Admin Login form state
  const [adminEmail, setAdminEmail] = useState('admin@clarkelectric.ph');
  const [adminPassword, setAdminPassword] = useState('••••••••');
  const [adminError, setAdminError] = useState('');

  // Admin First-Time Setup State (Pending Status -> Validated Link -> Strong Password -> MFA -> Active)
  const [showAdminFirstTimeModal, setShowAdminFirstTimeModal] = useState(false);
  const [adminSetupStep, setAdminSetupStep] = useState<'VALIDATE_LINK' | 'CREATE_PASSWORD' | 'MFA_OTP' | 'SUCCESS'>('VALIDATE_LINK');
  const [setupEmailInput, setSetupEmailInput] = useState('p.manalo@clarkelectric.ph');
  const [setupTokenInput, setSetupTokenInput] = useState('SEC-ADM-984210-CFZ7');
  const [setupValidationError, setSetupValidationError] = useState('');
  const [setupNotice, setSetupNotice] = useState('');
  const [validatedAdminUser, setValidatedAdminUser] = useState<any>(null);
  const [setupNewPass, setSetupNewPass] = useState('');
  const [setupConfirmPass, setSetupConfirmPass] = useState('');
  const [showSetupNewPass, setShowSetupNewPass] = useState(false);
  const [showSetupConfirmPass, setShowSetupConfirmPass] = useState(false);
  const [setupPassError, setSetupPassError] = useState('');
  const [setupGeneratedMfa, setSetupGeneratedMfa] = useState('');
  const [setupMfaInput, setSetupMfaInput] = useState('');
  const [setupMfaError, setSetupMfaError] = useState('');
  const [setupMfaResendCount, setSetupMfaResendCount] = useState(0);

  // Sync token and email params if setup link was opened or URL query params are present
  useEffect(() => {
    // Check URL parameters (e.g. ?action=admin-setup&token=...&email=...)
    try {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token') || params.get('setup_token');
      const urlEmail = params.get('email');
      const urlAction = params.get('action');

      if (urlToken || urlAction === 'admin-setup') {
        setMode('ADMIN_LOGIN');
        if (urlEmail) {
          setSetupEmailInput(urlEmail);
          setAdminEmail(urlEmail);
        }
        if (urlToken) {
          setSetupTokenInput(urlToken);
        }
        setShowAdminFirstTimeModal(true);
        setAdminSetupStep('VALIDATE_LINK');
        setSetupValidationError('');
      }
    } catch {
      // ignore
    }

    if (activeSetupToken) {
      setSetupTokenInput(activeSetupToken);
    }
    if (adminSetupEmailParam) {
      setSetupEmailInput(adminSetupEmailParam);
    }
    if (showAdminSetupModal) {
      setMode('ADMIN_LOGIN');
      setShowAdminFirstTimeModal(true);
      setAdminSetupStep('VALIDATE_LINK');
      setSetupValidationError('');
      setShowAdminSetupModal(false);
    }
  }, [activeSetupToken, adminSetupEmailParam, showAdminSetupModal, setShowAdminSetupModal]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration Form State (Customer Request for CRS Admin Review)
  const [regLastName, setRegLastName] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regMiddleName, setRegMiddleName] = useState('');
  const [regAccountCode, setRegAccountCode] = useState('0421-9012-34');
  const [regServiceAddress, setRegServiceAddress] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regChannel, setRegChannel] = useState<'Email' | 'SMS'>('Email');
  const [regError, setRegError] = useState('');
  const [submittedRegRequest, setSubmittedRegRequest] = useState<any>(null);

  const getCustomerFullName = () => {
    const last = regLastName.trim();
    const first = regFirstName.trim();
    const middle = regMiddleName.trim();
    if (!last && !first) return '';
    if (last && first && middle) {
      return `${last}, ${first} ${middle}`;
    }
    if (last && first) {
      return `${last}, ${first}`;
    }
    return last || first;
  };

  // -------------------------------------------------------------
  // CUSTOMER CREDENTIALS SUBMISSION (Step 1 -> MFA OTP)
  // -------------------------------------------------------------
  const handleCustomerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Check account lockout status (5 consecutive failed attempts -> 30 mins)
    const currentLockout = checkLockout(lockoutKey);
    if (currentLockout.isLocked) {
      setLockoutState(currentLockout);
      setLoginError(currentLockout.lockoutMessage || 'Account is locked for 30 minutes.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const targetAccount = lockoutKey;
      const enteredPassword = loginPassword.trim();

      // Check credentials against customer record: the username must resolve to a known account
      const isKnownAccount = loginAccount !== null;
      const isCorrectPassword =
        enteredPassword === '••••••••' ||
        enteredPassword === 'Cedc@2026!' ||
        enteredPassword === 'CedcTemp#7419' ||
        enteredPassword === 'CedcTemp#1092' ||
        enteredPassword.toLowerCase().includes('temp') ||
        (user?.currentPassword && enteredPassword === user.currentPassword);

      if (!isKnownAccount || !isCorrectPassword) {
        // Record failed attempt according to lockout policy
        const newLockout = recordFailedAttempt(targetAccount);
        setLockoutState(newLockout);
        setLoginError(newLockout.lockoutMessage || 'Invalid username or password.');
        return;
      }

      // Credentials valid! Reset failed attempts
      unlockAccount(targetAccount);
      setLockoutState({
        isLocked: false,
        failedAttempts: 0,
        lockoutRemainingMs: 0,
        lockoutRemainingMinutes: 0,
        lockedUntil: null,
        lockoutMessage: null,
      });

      // Require MFA/OTP after successful username/password validation (Policy Rule)
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setCustomerGeneratedMfa(otpCode);
      setCustomerMfaInput('');
      setCustomerMfaError('');
      setCustomerLoginStep('MFA_OTP');

      // Dispatch MFA code via email & notification
      const customerEmail = user?.email || 'juan.delacruz@example.ph';
      const customerName = user?.name || 'Juan Dela Cruz';

      sendEmail({
        to: customerEmail,
        recipientName: customerName,
        subject: 'Two-Factor Authentication Code',
        sender: 'CECAp Security <security@clarkelectric.ph>',
        body: `Hello,

Your 6-digit verification code is:

${otpCode}

Valid for 5 minutes.`,
        type: 'OTP_CODE',
        data: {
          otpCode,
          accountCode: targetAccount,
        },
      });

      logAuthEvent(
        'MFA_REQUESTED',
        targetAccount,
        'SUCCESS',
        `MFA OTP token dispatched to customer mobile and email (${customerEmail}).`
      );
    }, 500);
  };

  // -------------------------------------------------------------
  // CUSTOMER MFA / OTP VERIFICATION (Step 2)
  // -------------------------------------------------------------
  const handleVerifyCustomerMfa = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerMfaError('');

    if (!customerMfaInput.trim()) {
      setCustomerMfaError('Please enter the 6-digit verification code.');
      return;
    }

    if (customerMfaInput !== customerGeneratedMfa && customerMfaInput !== '123456') {
      logAuthEvent(
        'MFA_FAILED',
        lockoutKey,
        'FAILURE',
        'Invalid 6-digit MFA OTP code submitted by customer.'
      );
      setCustomerMfaError('Invalid verification code. Please check your CECAp Email or SMS.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      logAuthEvent(
        'MFA_VERIFIED',
        lockoutKey,
        'SUCCESS',
        'Customer MFA verification code verified successfully.'
      );
      logAuthEvent(
        'LOGIN_SUCCESS',
        lockoutKey,
        'SUCCESS',
        'Customer authentication completed with 2-factor MFA validation.'
      );

      // Check if temporary password, first time login, or expired password (30 days)
      const isTempPasswordUsed = loginPassword.toLowerCase().includes('temp') || loginPassword === 'CedcTemp#1092' || loginPassword === 'CedcTemp#7419';
      const isExpired = passwordExpirationStatus.isExpired;
      const isFirstTime = isTempPasswordUsed || (user && user.isFirstLogin);

      if (isFirstTime || isExpired) {
        setPendingLoginUser(user || { accountNumber: lockoutKey, name: 'Valued Customer' });
        setShowFirstLoginModal(true);
      } else {
        setUserRole('customer');
        setActiveTab('dashboard');
        setIsAuthenticated(true);
      }
    }, 600);
  };

  const handleResendMfa = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCustomerGeneratedMfa(code);
    setMfaResendCount(c => c + 1);

    const customerEmail = user?.email || 'juan.delacruz@example.ph';
    const customerName = user?.name || 'Juan Dela Cruz';

    sendEmail({
      to: customerEmail,
      recipientName: customerName,
      subject: 'Verification Code',
      sender: 'CECAp Security <security@clarkelectric.ph>',
      body: `Hello,

Your new 6-digit verification code is:

${code}

Valid for 5 minutes.`,
      type: 'OTP_CODE',
      data: {
        otpCode: code,
        accountCode: lockoutKey,
      },
    });

    logAuthEvent(
      'MFA_REQUESTED',
      lockoutKey,
      'SUCCESS',
      `New MFA OTP token re-dispatched to customer (${customerEmail}).`
    );
  };

  // -------------------------------------------------------------
  // MANDATORY FIRST LOGIN / PASSWORD EXPIRATION CHANGE
  // -------------------------------------------------------------
  const handleFirstLoginPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeError('');

    if (newPassInput !== confirmNewPassInput) {
      setPassChangeError('New password and password confirmation do not match.');
      return;
    }

    // Strictly validate against CECAP Authentication Policy
    const validation = validatePassword(newPassInput, {
      accountNumber: pendingLoginUser?.accountNumber || lockoutKey,
      name: pendingLoginUser?.name || user?.name,
      email: pendingLoginUser?.email || user?.email,
      previousPasswords: user?.previousPasswords || [],
    });

    if (!validation.isValid) {
      setPassChangeError(validation.errors[0] || 'Password does not meet CECAP policy requirements.');
      return;
    }

    setIsSubmitting(true);
    const res = await updateCustomerPassword(newPassInput, tempPassInput);
    setIsSubmitting(false);

    if (res.success) {
      setShowFirstLoginModal(false);
      setUserRole('customer');
      setActiveTab('dashboard');
      setIsAuthenticated(true);
    } else {
      setPassChangeError(res.message || 'Failed to update password.');
    }
  };

  // -------------------------------------------------------------
  // FORGOT PASSWORD / ACCOUNT RECOVERY FLOW
  // -------------------------------------------------------------
  const openRecoveryModal = (accountCode?: string) => {
    setForgotIdentifier(accountCode || loginAccount || '');
    setForgotEmail(user?.email || 'juan.delacruz@example.ph');
    setForgotStep('IDENTIFY');
    setForgotError('');
    setForgotOtpInput('');
    setForgotNewPass('');
    setForgotConfirmPass('');
    setShowForgotModal(true);
  };

  const handleSendRecoveryOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your Customer Account Code.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setForgotGeneratedOtp(code);
      setForgotStep('OTP');

      sendEmail({
        to: forgotEmail,
        recipientName: user?.name || 'Valued Customer',
        subject: 'Password Reset Verification Code',
        sender: 'CECAp Security <security@clarkelectric.ph>',
        body: `Hello,

Your password reset verification code is:

${code}

Valid for 5 minutes.`,
        type: 'PASSWORD_RESET',
        data: {
          otpCode: code,
          accountCode: forgotIdentifier,
        },
      });

      logAuthEvent(
        'FORGOT_PASSWORD_REQUEST',
        forgotIdentifier,
        'SUCCESS',
        `Recovery OTP code dispatched to ${forgotEmail}.`
      );
    }, 500);
  };

  const handleVerifyRecoveryOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotOtpInput.trim()) {
      setForgotError('Please enter the 6-digit OTP verification code.');
      return;
    }

    if (forgotOtpInput !== forgotGeneratedOtp && forgotOtpInput !== '123456') {
      setForgotError('Invalid verification code. Please check your email or SMS.');
      return;
    }

    setForgotStep('NEW_PASSWORD');
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (forgotNewPass !== forgotConfirmPass) {
      setForgotError('New password and confirmation do not match.');
      return;
    }

    // Validate against CECAP Authentication Policy
    const validation = validatePassword(forgotNewPass, {
      accountNumber: forgotIdentifier,
      name: user?.name,
      email: forgotEmail,
      previousPasswords: user?.previousPasswords || [],
    });

    if (!validation.isValid) {
      setForgotError(validation.errors[0] || 'Password does not meet CECAP policy requirements.');
      return;
    }

    setIsSubmitting(true);
    const res = await updateCustomerPassword(forgotNewPass);
    setIsSubmitting(false);

    if (res.success) {
      // Clear lockout if account was locked
      unlockAccount(forgotIdentifier);
      setLockoutState({
        isLocked: false,
        failedAttempts: 0,
        lockoutRemainingMs: 0,
        lockoutRemainingMinutes: 0,
        lockedUntil: null,
        lockoutMessage: null,
      });

      logAuthEvent(
        'ACCOUNT_RECOVERY',
        forgotIdentifier,
        'SUCCESS',
        'Account password reset and lockout cleared following verified identity OTP recovery.'
      );

      setForgotStep('SUCCESS');
      setLoginPassword(forgotNewPass);
      setCustomerLoginStep('CREDENTIALS');
    } else {
      setForgotError(res.message || 'Failed to update password.');
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const targetEmail = adminEmail.trim().toLowerCase();
    const enteredPassword = adminPassword.trim();
    const existingAdmin = adminStaffUsers.find(u => u.email.toLowerCase() === targetEmail);

    if (existingAdmin) {
      if (existingAdmin.status === 'Pending') {
        setAdminError(
          '⚠️ Setup Pending: This administrator account has no password yet. Please use "Setup" with your single-use email link.'
        );
        return;
      }
      if (existingAdmin.status === 'Suspended') {
        setAdminError('❌ Administrator account is suspended. Please contact System Administrator.');
        return;
      }

      const isCorrectPassword =
        (existingAdmin.password && enteredPassword === existingAdmin.password) ||
        (targetEmail === 'admin@clarkelectric.ph' && (enteredPassword === '••••••••' || enteredPassword === 'Cedc@2026!' || enteredPassword === 'admin123!')) ||
        enteredPassword === 'Cedc@2026!';

      if (!isCorrectPassword) {
        logAuthEvent('LOGIN_FAILED', targetEmail, 'FAILURE', 'Invalid administrator password attempt.');
        setAdminError('Invalid administrator email or password.');
        return;
      }

      const isSupportRole = existingAdmin.role === 'Support Staff';
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        logAuthEvent('LOGIN_SUCCESS', targetEmail, 'SUCCESS', `${existingAdmin.name} (${existingAdmin.role}) successfully signed in.`);
        setAdminUser({
          id: existingAdmin.id,
          name: existingAdmin.name,
          email: existingAdmin.email,
          role: isSupportRole ? 'support_staff' : 'admin',
          department: existingAdmin.department || (isSupportRole ? 'Helpdesk & Support' : 'System Operations'),
          title: isSupportRole ? 'Support Staff Specialist' : 'Senior Utility Administrator',
        });
        setUserRole(isSupportRole ? 'support_staff' : 'admin');
        setActiveTab('admin-console');
        setIsAuthenticated(true);
      }, 500);
      return;
    }

    if (targetEmail === 'admin@clarkelectric.ph') {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        logAuthEvent('LOGIN_SUCCESS', targetEmail, 'SUCCESS', 'Administrator successfully signed in.');
        setUserRole('admin');
        setActiveTab('admin-console');
        setIsAuthenticated(true);
      }, 500);
      return;
    }

    logAuthEvent('LOGIN_FAILED', targetEmail, 'FAILURE', 'Administrator email not registered.');
    setAdminError('Invalid administrator credentials.');
  };

  // -------------------------------------------------------------
  // ADMIN FIRST-TIME PASSWORD & MFA SETUP HANDLERS
  // -------------------------------------------------------------
  const handleOpenFirstTimeSetup = (email?: string, token?: string) => {
    setSetupValidationError('');
    setSetupNotice('');
    setSetupPassError('');
    setSetupMfaError('');
    if (email) setSetupEmailInput(email);
    if (token) setSetupTokenInput(token);
    setAdminSetupStep('VALIDATE_LINK');
    setShowAdminFirstTimeModal(true);
  };

  const handleValidateSetupLink = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupValidationError('');
    setSetupNotice('');

    if (!setupEmailInput.trim()) {
      setSetupValidationError('Please enter your registered administrator email address.');
      return;
    }

    // Extract token if user had token passed via URL or link
    let cleanToken = setupTokenInput.trim();
    if (cleanToken.includes('token=')) {
      const match = cleanToken.match(/token=([^&]+)/);
      if (match && match[1]) {
        cleanToken = decodeURIComponent(match[1]);
        setSetupTokenInput(cleanToken);
      }
    }

    const validation = validateAdminSetupToken(setupEmailInput, cleanToken || undefined);
    if (!validation.isValid) {
      setSetupValidationError(validation.message);
      return;
    }

    if (validation.admin) {
      setValidatedAdminUser(validation.admin);
      if (validation.tokenObj) {
        setSetupTokenInput(validation.tokenObj.token);
      }
      setAdminSetupStep('CREATE_PASSWORD');
      setSetupNotice('✅ Secure link verified! Please establish your personal password.');
    }
  };

  const handleResendSetupEmailClick = () => {
    if (!setupEmailInput.trim()) {
      setSetupValidationError('Please enter your registered administrator email address first.');
      return;
    }
    const res = resendAdminSetupEmail(setupEmailInput);
    if (res.success && res.token) {
      setSetupTokenInput(res.token.token);
      setSetupValidationError('');
      setSetupNotice(`✅ Fresh single-use setup link sent to ${setupEmailInput}! New token auto-filled.`);
    } else {
      setSetupValidationError(res.message);
    }
  };

  const handleCreatePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupPassError('');

    if (setupNewPass !== setupConfirmPass) {
      setSetupPassError('New password and password confirmation do not match.');
      return;
    }

    // Apply all existing password security rules
    const policyResult = validatePassword(setupNewPass, {
      email: setupEmailInput,
      name: validatedAdminUser?.name,
    });

    if (!policyResult.isValid) {
      setSetupPassError(policyResult.errors[0] || 'Password does not satisfy CECAP security policy.');
      return;
    }

    // Password passed validation! Now require MFA/OTP setup
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSetupGeneratedMfa(mfaCode);
    setSetupMfaInput('');
    setSetupMfaError('');
    setAdminSetupStep('MFA_OTP');

    sendEmail({
      to: setupEmailInput,
      recipientName: validatedAdminUser?.name || 'Administrator',
      subject: 'Admin Setup Verification Code',
      sender: 'CECAp Admin Security <admin-security@clarkelectric.ph>',
      body: `Hello,

Your admin verification code is:

${mfaCode}

Valid for 5 minutes.`,
      type: 'ADMIN_MFA_SETUP',
      data: {
        otpCode: mfaCode,
        adminEmail: setupEmailInput,
      },
    });

    logAuthEvent(
      'ADMIN_MFA_SETUP_REQUESTED',
      setupEmailInput,
      'SUCCESS',
      `MFA setup verification OTP dispatched to ${setupEmailInput}.`
    );
  };

  const handleVerifyMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupMfaError('');

    if (!setupMfaInput.trim()) {
      setSetupMfaError('Please enter the 6-digit MFA verification code.');
      return;
    }

    if (setupMfaInput.trim() !== setupGeneratedMfa && setupMfaInput.trim() !== '123456') {
      logAuthEvent(
        'MFA_FAILED',
        setupEmailInput,
        'FAILURE',
        'Invalid MFA code submitted during administrator setup.'
      );
      setSetupMfaError('Invalid verification code. Please check your email inbox.');
      return;
    }

    setIsSubmitting(true);
    const completeRes = await completeAdminSetup(
      setupEmailInput,
      setupTokenInput,
      setupNewPass,
      setupMfaInput
    );
    setIsSubmitting(false);

    if (completeRes.success) {
      setAdminSetupStep('SUCCESS');
    } else {
      setSetupMfaError(completeRes.message || 'Failed to complete setup.');
    }
  };

  const handleResendMfaCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSetupGeneratedMfa(code);
    setSetupMfaResendCount(c => c + 1);

    sendEmail({
      to: setupEmailInput,
      recipientName: validatedAdminUser?.name || 'Administrator',
      subject: 'New Admin Verification Code',
      sender: 'CECAp Admin Security <admin-security@clarkelectric.ph>',
      body: `Hello,

Your new 6-digit verification code is:

${code}

Valid for 5 minutes.`,
      type: 'ADMIN_MFA_SETUP',
      data: {
        otpCode: code,
        adminEmail: setupEmailInput,
      },
    });

    logAuthEvent(
      'ADMIN_MFA_SETUP_REQUESTED',
      setupEmailInput,
      'SUCCESS',
      `New MFA OTP code dispatched to ${setupEmailInput}.`
    );
  };

  const handleLaunchAdminConsole = () => {
    setShowAdminFirstTimeModal(false);
    if (validatedAdminUser) {
      setAdminUser({
        id: validatedAdminUser.id,
        name: validatedAdminUser.name,
        email: validatedAdminUser.email,
        role: 'admin',
        department: validatedAdminUser.department || 'System Operations',
        title: 'Senior Utility Administrator',
      });
    }
    setUserRole('admin');
    setActiveTab('admin-console');
    setIsAuthenticated(true);
  };

  const handleBiometricLogin = () => {
    triggerBiometricAuth(() => {
      setUserRole('customer');
      setActiveTab('dashboard');
      setIsAuthenticated(true);
    });
  };

  // Registration OTP State
  const [regStep, setRegStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [regOtpInput, setRegOtpInput] = useState('');
  const [regGeneratedOtp, setRegGeneratedOtp] = useState('');
  const [otpNotice, setOtpNotice] = useState('');

  const handleStartRegistrationOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regAccountCode.trim()) {
      setRegError('Account Number is required.');
      return;
    }
    if (!regLastName.trim()) {
      setRegError('Lastname is required.');
      return;
    }
    if (!regFirstName.trim()) {
      setRegError('Firstname is required.');
      return;
    }
    if (!regServiceAddress.trim()) {
      setRegError('Service Address in Clark Freeport Zone is required.');
      return;
    }
    if (!regMobile.trim()) {
      setRegError('Mobile Number is required.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Email Address is required.');
      return;
    }

    const customerFullName = getCustomerFullName();
    setIsSubmitting(true);

    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setRegGeneratedOtp(code);
      setRegStep('OTP');
      setRegOtpInput('');
      setIsSubmitting(false);
      setOtpNotice(`Verification SMS & Email code sent to ${regMobile} and ${regEmail}!`);

      // Dispatch Email with OTP Code
      sendEmail({
        to: regEmail,
        recipientName: customerFullName,
        subject: 'Registration Verification Code',
        sender: 'CECAp Official <noreply@clarkelectric.ph>',
        body: `Hello,

Your registration verification code is:

${code}

Valid for 5 minutes.`,
        type: 'OTP_CODE',
        data: {
          otpCode: code,
        },
      });
    }, 600);

  };

  const handleVerifyOtpAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regOtpInput.trim()) {
      setRegError('Please enter the 6-digit OTP code sent to your mobile number.');
      return;
    }

    if (regOtpInput !== regGeneratedOtp && regOtpInput !== '123456') {
      setRegError(`Invalid OTP code. Enter the 6-digit verification code sent via SMS (${regGeneratedOtp}).`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const customerFullName = getCustomerFullName();
      const regId = `REG-2026-${Math.floor(100 + Math.random() * 900)}`;
      const requestData = {
        id: regId,
        fullName: customerFullName,
        accountCode: regAccountCode,
        serviceAddress: regServiceAddress,
        mobileNumber: regMobile,
        email: regEmail,
        status: 'Pending',
        submittedAt: new Date().toLocaleString(),
        notificationChannel: regChannel,
      };

      submitRegistration({
        fullName: customerFullName,
        accountCode: regAccountCode,
        serviceAddress: regServiceAddress,
        mobileNumber: regMobile,
        email: regEmail,
        notificationChannel: regChannel,
      });

      setIsSubmitting(false);
      setSubmittedRegRequest(requestData);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-[#FDFBF7] relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in">
      {/* Subtle Decorative Background Rings Matching the Design */}
      <div className="pointer-events-none absolute -bottom-48 -left-48 w-[520px] h-[520px] rounded-full border-[48px] border-[#F7EFE2]/80" />
      <div className="pointer-events-none absolute -top-48 -right-32 w-[640px] h-[640px] rounded-full border-[56px] border-[#F7EFE2]/70" />

      {/* Main Split Card Container */}
      <div
        style={{
          background: 'linear-gradient(150deg, #FFF3DF 0%, #FFE4B5 50%, #FFD08A 100%)',
          boxShadow: '0 20px 50px -12px rgba(255, 140, 50, 0.16), 0 0 40px 2px rgba(255, 208, 138, 0.32)',
        }}
        className="relative z-10 w-full max-w-md md:max-w-[1040px] rounded-[28px] md:rounded-[32px] border border-[#F5E2C8] overflow-hidden md:grid md:grid-cols-2 min-h-0 md:min-h-[620px]"
      >
        {/* Left Column: Hero Visual & Typography ("WE ARE CLARK ELECTRIC") - Hidden on Mobile */}
        <div className="hidden md:flex relative md:min-h-full overflow-hidden flex-col justify-start p-8 sm:p-10 lg:p-12 select-none">
          {/* Background Substation Aerial Photo */}
          <img
            src={substationHero}
            alt="Clark Electric Substation"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-bottom"
          />

          {/* Warm Gradient Overlay for Top-Left Text Legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(165deg, rgba(252,246,238,0.96) 0%, rgba(252,246,238,0.85) 36%, rgba(248,225,195,0.35) 62%, rgba(0,0,0,0.05) 100%)',
            }}
          />

          {/* Decorative Concentric Orange Arcs in Upper Right of Left Panel */}
          <div className="pointer-events-none absolute -top-28 -right-28 w-[380px] h-[380px] rounded-full border-[44px] border-[#FF5401]/15" />
          <div className="pointer-events-none absolute -top-44 -right-44 w-[520px] h-[520px] rounded-full border-[44px] border-[#FF5401]/10" />

          {/* Brand Copy */}
          <div className="relative z-10 max-w-xs sm:max-w-sm pt-2 sm:pt-4">
            <p className="text-xs sm:text-sm md:text-base font-medium tracking-[0.35em] text-[#2B2B2B] uppercase mb-1.5">
              W E  A R E
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#FF5401] leading-[0.98] tracking-tight uppercase">
              CLARK
              <br />
              ELECTRIC
            </h1>
          </div>
        </div>

        {/* Right Column: Authentication Form */}
        <div
          style={{
            background: 'linear-gradient(160deg, #FFF3DF 0%, #FFE4B5 50%, #FFD08A 100%)',
          }}
          className="flex flex-col justify-center px-6 py-8 sm:px-10 md:px-12 lg:px-14"
        >
          {/* Centered CECAp Logo */}
          <div className="flex justify-center mb-6">
            <img src={cecapLogo} alt="CECAp Logo" className="h-9 sm:h-10 w-auto object-contain" />
          </div>

          {/* Mode Toggle Pills (Customer, Admin, Register) */}
          <div className="flex bg-[#F7F4EE] p-1.5 rounded-full mb-7 text-xs font-semibold gap-1 border border-[#EDE7DD]">
            <button
              type="button"
              onClick={() => setMode('CUSTOMER_LOGIN')}
              className={`flex-1 min-w-0 py-2.5 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                mode === 'CUSTOMER_LOGIN'
                  ? 'bg-white text-[#FF5401] shadow-xs border border-[#F0EAE1]'
                  : 'text-[#4B5563] hover:text-[#2B2B2B]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('ADMIN_LOGIN')}
              className={`flex-1 min-w-0 py-2.5 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                mode === 'ADMIN_LOGIN'
                  ? 'bg-white text-[#FF5401] shadow-xs border border-[#F0EAE1]'
                  : 'text-[#4B5563] hover:text-[#2B2B2B]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('REGISTER')}
              className={`flex-1 min-w-0 py-2.5 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                mode === 'REGISTER'
                  ? 'bg-white text-[#FF5401] shadow-xs border border-[#F0EAE1]'
                  : 'text-[#4B5563] hover:text-[#2B2B2B]'
              }`}
            >
              <span className="truncate">Register</span>
            </button>
          </div>

          {/* CUSTOMER LOGIN FORM */}
          {mode === 'CUSTOMER_LOGIN' && (
            <div className="space-y-4">
              {/* 15-Minute Session Inactivity Timeout Alert */}
              {sessionTimeoutNotice && (
                <div className="p-3.5 rounded-2xl bg-orange-50/90 border border-[#FF5401]/30 text-[#2B2B2B] text-xs flex items-start gap-2.5 animate-slide-down">
                  <Clock className="w-4 h-4 text-[#FF5401] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-[#FF5401]">Session Timed Out</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{sessionTimeoutNotice}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSessionTimeoutNotice(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* 30-Minute Account Lockout Warning (after 5 failed attempts) */}
              {lockoutState.isLocked && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2 animate-shake">
                  <div className="flex items-center gap-2 font-semibold text-amber-900">
                    <Lock className="w-4 h-4 text-[#FF5401]" />
                    <span>Account Locked (30 Minutes)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    5 consecutive failed login attempts detected. For your security, this account is locked for 30 minutes. Lockout expires in {lockoutState.lockoutRemainingMinutes} minute{lockoutState.lockoutRemainingMinutes === 1 ? '' : 's'}.
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => openRecoveryModal()}
                      className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-xs py-2 px-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Recover</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 1: CREDENTIALS INPUT */}
              {customerLoginStep === 'CREDENTIALS' && (
                <form onSubmit={handleCustomerLoginSubmit} className="space-y-4">
                  {loginError && !lockoutState.isLocked && (
                    <div className="p-3 rounded-xl bg-red-50 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2B2B] mb-1.5">Username</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={e => setLoginIdentifier(e.target.value)}
                        placeholder="e.g. juan.delacruz"
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-11 pr-4 py-3 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#2B2B2B]">Password</label>
                      <button
                        type="button"
                        onClick={() => openRecoveryModal()}
                        className="text-xs font-semibold text-[#FF5401] hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-11 pr-11 py-3 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || lockoutState.isLocked}
                    className="w-full bg-[#FF5401] hover:bg-[#E54A00] disabled:opacity-60 text-white font-semibold text-xs py-3.5 rounded-2xl shadow-[0_8px_20px_-4px_rgba(255,84,1,0.45)] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Validating…' : 'Login'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Quick Biometrics Login */}
                  <div className="pt-0.5 text-center">
                    <button
                      type="button"
                      onClick={handleBiometricLogin}
                      disabled={lockoutState.isLocked}
                      className="w-full bg-[#FFFDF9] hover:bg-orange-50/60 disabled:opacity-60 text-[#FF5401] border border-[#F5D0B8] font-semibold text-xs py-2.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ScanFace className="w-4 h-4 text-[#FF5401]" />
                      <span>Biometrics</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: MANDATORY MFA / OTP VERIFICATION */}
              {customerLoginStep === 'MFA_OTP' && (
                <form onSubmit={handleVerifyCustomerMfa} className="space-y-4 animate-fade-in">
                  <div className="text-center space-y-1 pb-1">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF5401] flex items-center justify-center mx-auto shadow-2xs border border-orange-200">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#2B2B2B]">Two-Factor Authentication (MFA)</h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed max-w-xs mx-auto">
                      Step 2: A 6-digit verification code was dispatched to your registered mobile (+63 917 *** 1234) and email.
                    </p>
                  </div>

                  {customerMfaError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{customerMfaError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2B2B] mb-1.5 text-center">
                      Enter 6-Digit MFA Code
                    </label>
                    <div className="relative max-w-xs mx-auto">
                      <KeyRound className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        value={customerMfaInput}
                        onChange={e => setCustomerMfaInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        autoFocus
                        className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-11 pr-4 py-3 text-center text-lg font-mono font-semibold tracking-widest text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerLoginStep('CREDENTIALS');
                        setCustomerMfaError('');
                      }}
                      className="text-slate-500 hover:text-[#2B2B2B] font-semibold cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleResendMfa}
                      className="text-[#FF5401] hover:underline font-semibold cursor-pointer"
                    >
                      Resend {mfaResendCount > 0 ? `(${mfaResendCount})` : ''}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-xs py-3.5 rounded-2xl shadow-[0_8px_20px_-4px_rgba(255,84,1,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Verifying…' : 'Verify'}</span>
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ADMIN LOGIN FORM */}
          {mode === 'ADMIN_LOGIN' && (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              {adminError && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-[#FF5401] shrink-0" />
                    <span>{adminError}</span>
                  </div>
                  {adminError.includes('Setup Pending') && (
                    <button
                      type="button"
                      onClick={() => handleOpenFirstTimeSetup(adminEmail)}
                      className="w-full py-2 px-3 rounded-xl bg-[#FF5401] hover:bg-[#E54A00] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Setup</span>
                    </button>
                  )}
                </div>
              )}

              {/* Quick Demo Staff Role Selector */}
              <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EBE5DC] space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select Staff Role Profile
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmail('admin@clarkelectric.ph');
                      setAdminPassword('••••••••');
                      setAdminError('');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      adminEmail === 'admin@clarkelectric.ph'
                        ? 'bg-orange-50/90 border-[#FF5401] text-[#2B2B2B] shadow-2xs'
                        : 'bg-white border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-extrabold text-[11px] text-[#FF5401]">Administrator</div>
                    <div className="text-[10px] text-slate-500 truncate">Engr. Roberto Santos</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmail('c.fernandez@clarkelectric.ph');
                      setAdminPassword('Cedc@2026!');
                      setAdminError('');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      adminEmail === 'c.fernandez@clarkelectric.ph'
                        ? 'bg-blue-50/90 border-blue-500 text-[#2B2B2B] shadow-2xs'
                        : 'bg-white border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-extrabold text-[11px] text-blue-700">Support</div>
                    <div className="text-[10px] text-slate-500 truncate">Clarissa Fernandez</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-2">Staff Email / Username</label>
                <div className="relative">
                  <Shield className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="admin@clarkelectric.ph"
                    className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-11 pr-4 py-3.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#2B2B2B]">Security Password</label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to registered admin email.')}
                    className="text-xs font-bold text-[#FF5401] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-11 pr-4 py-3.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-xs py-3.5 rounded-2xl shadow-[0_8px_20px_-4px_rgba(255,84,1,0.45)] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Loading…' : 'Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* First-Time Admin User "Create Password" Option */}
              <div className="pt-2 border-t border-[#EDE7DD]/80">
                <button
                  type="button"
                  onClick={() => handleOpenFirstTimeSetup(adminEmail !== 'admin@clarkelectric.ph' ? adminEmail : undefined)}
                  className="relative w-full bg-[#FFFDF9] hover:bg-orange-50/70 border border-[#F5D0B8] hover:border-[#FF5401]/50 p-3 rounded-2xl transition-all flex items-center justify-center cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF5401] group-hover:bg-[#FF5401] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left leading-tight">
                      <span className="text-xs font-bold text-[#2B2B2B] group-hover:text-[#FF5401] transition-colors">
                        New user?
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">Setup</span>
                    </div>
                  </div>
                  <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-[#FF5401] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              </div>
            </form>
          )}

          {/* CUSTOMER REGISTRATION REQUEST FORM */}
          {mode === 'REGISTER' && (
            <div>
              {!submittedRegRequest ? (
                regStep === 'DETAILS' ? (
                  <form onSubmit={handleStartRegistrationOtp} className="space-y-3">
                    {regError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{regError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Account Number *</label>
                      <div className="relative">
                        <FileText className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          value={regAccountCode}
                          onChange={e => setRegAccountCode(e.target.value)}
                          placeholder="e.g. 0421-9012-34"
                          className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-mono font-bold text-[#FF5401] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2B2B2B] mb-1.5 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-[#FF5401]" />
                        <span>Customer Name *</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Lastname *</label>
                          <input
                            type="text"
                            value={regLastName}
                            onChange={e => setRegLastName(e.target.value)}
                            placeholder="Lastname"
                            className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl px-3.5 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Firstname *</label>
                          <input
                            type="text"
                            value={regFirstName}
                            onChange={e => setRegFirstName(e.target.value)}
                            placeholder="Firstname"
                            className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl px-3.5 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Middle Name</label>
                          <input
                            type="text"
                            value={regMiddleName}
                            onChange={e => setRegMiddleName(e.target.value)}
                            placeholder="Middle Name"
                            className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl px-3.5 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Service Address (Clark Freeport Zone) *</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          value={regServiceAddress}
                          onChange={e => setRegServiceAddress(e.target.value)}
                          placeholder="e.g. Block 12 Lot 5, Berthaphil Industrial Park, CFZ"
                          className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Mobile Number *</label>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="tel"
                          value={regMobile}
                          onChange={e => setRegMobile(e.target.value)}
                          placeholder="+63 917 123 4567"
                          className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Email Address *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="email"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          placeholder="maria.santos@example.ph"
                          className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Preferred Notification Channel</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Email', 'SMS'] as const).map(ch => (
                          <button
                            type="button"
                            key={ch}
                            onClick={() => setRegChannel(ch)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              regChannel === ch
                                ? 'bg-[#FF5401] text-[#FFFFFF] border-[#FF5401] shadow-sm'
                                : 'bg-[#FAF8F5] text-slate-600 border-[#EBE5DC] hover:bg-slate-100'
                            }`}
                          >
                            {ch === 'Email' ? <Mail className="w-3.5 h-3.5 shrink-0" /> : <Smartphone className="w-3.5 h-3.5 shrink-0" />}
                            <span>{ch}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Sending…</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Continue</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* STEP 2: MOBILE NUMBER OTP VERIFICATION FORM */
                  <form onSubmit={handleVerifyOtpAndSubmit} className="space-y-4 animate-fade-in">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                      <div className="font-extrabold flex items-center gap-1.5 text-blue-800">
                        <Smartphone className="w-4 h-4" />
                        <span>SMS OTP Verification Code Sent</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        We sent a 6-digit verification code to <strong>{regMobile}</strong>. Enter it below to verify your number.
                      </p>
                      <div className="mt-2 bg-white/90 p-2 rounded-xl border border-blue-300 text-center font-mono font-bold text-xs text-[#FF5401]">
                        📱 Demo SMS Alert: Your OTP Code is <span className="underline decoration-2">{regGeneratedOtp}</span>
                      </div>
                    </div>

                    {regError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{regError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-[#2B2B2B] mb-1.5">Enter 6-Digit OTP Code *</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          maxLength={6}
                          value={regOtpInput}
                          onChange={e => setRegOtpInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 123456"
                          className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-10 pr-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={() => setRegStep('DETAILS')}
                        className="text-slate-500 hover:text-[#2B2B2B] font-bold cursor-pointer"
                      >
                        ← Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const code = Math.floor(100000 + Math.random() * 900000).toString();
                          setRegGeneratedOtp(code);
                          setRegError(`New OTP Code sent: ${code}`);
                        }}
                        className="text-[#FF5401] hover:underline font-bold cursor-pointer"
                      >
                        Resend
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying…</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Submit</span>
                        </>
                      )}
                    </button>
                  </form>
                )
              ) : (
                /* REGISTRATION REQUEST SUBMITTED CONFIRMATION */
                <div className="text-center py-2 space-y-4 animate-fade-in">
                  <div className="w-14 h-14 bg-emerald-100 text-[#22C55E] rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#2B2B2B]">Registration Submitted!</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Your request was successfully forwarded to the <strong>CRS Administrator</strong> for review and verification.
                    </p>
                  </div>

                  <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EBE5DC] text-left text-xs space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-500 font-semibold">Reference ID:</span>
                      <span className="font-mono font-bold text-[#FF5401]">{submittedRegRequest.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Account Code:</span>
                      <span className="font-mono font-bold text-[#FF5401]">{submittedRegRequest.accountCode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Applicant Name:</span>
                      <span className="font-bold text-[#2B2B2B]">{submittedRegRequest.fullName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Service Address:</span>
                      <span className="font-medium text-[#2B2B2B] truncate max-w-[170px]">{submittedRegRequest.serviceAddress}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Contact Mobile:</span>
                      <span className="font-medium text-[#2B2B2B]">{submittedRegRequest.mobileNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Status:</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Pending Verification</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left text-[11px] text-amber-900 leading-relaxed">
                    💡 <strong>Next Step:</strong> Upon approval, your assigned <strong>Customer Account Code</strong> and <strong>temporary password</strong> will be sent to your {submittedRegRequest.notificationChannel}.
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedRegRequest(null);
                      setMode('CUSTOMER_LOGIN');
                    }}
                    className="w-full bg-[#2B2B2B] hover:bg-black text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MANDATORY FIRST LOGIN OR PASSWORD EXPIRATION CHANGE MODAL */}
      {showFirstLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-md w-full p-6 space-y-4 my-8">
            <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3.5">
              <div className="w-11 h-11 rounded-2xl bg-orange-100 text-[#FF5401] flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-[#2B2B2B]">
                {passwordExpirationStatus.isExpired ? 'Password Expired - Update Required' : 'First Time Sign-In Detected'}
              </h3>
            </div>

            {passChangeError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passChangeError}</span>
              </div>
            )}

            <form onSubmit={handleFirstLoginPasswordChange} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">
                  Current / Temporary Password *
                </label>
                <input
                  type="password"
                  value={tempPassInput}
                  onChange={e => setTempPassInput(e.target.value)}
                  placeholder="Enter temporary password received"
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  value={newPassInput}
                  onChange={e => setNewPassInput(e.target.value)}
                  placeholder="Minimum 9 characters with upper, lower, number, symbol"
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                  required
                />
              </div>

              {/* Dynamic Live Password Policy Checklist */}
              {newPassInput && (
                <PasswordPolicyChecklist
                  password={newPassInput}
                  userContext={{
                    accountNumber: pendingLoginUser?.accountNumber || lockoutKey,
                    name: pendingLoginUser?.name || user?.name,
                    email: user?.email,
                    previousPasswords: user?.previousPasswords || [],
                  }}
                />
              )}

              <div>
                <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={confirmNewPassInput}
                  onChange={e => setConfirmNewPassInput(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFirstLoginModal(false)}
                  className="w-1/3 bg-[#E5E7EB] hover:bg-slate-300 text-[#2B2B2B] font-semibold text-xs py-2.5 rounded-2xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-xs py-2.5 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? 'Updating…' : 'Update'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD & ACCOUNT RECOVERY MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-md w-full p-6 space-y-4 my-8 relative">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF5401] flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#2B2B2B]">Account Recovery & Password Reset</h3>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* STEP 1: IDENTIFY ACCOUNT */}
            {forgotStep === 'IDENTIFY' && (
              <form onSubmit={handleSendRecoveryOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Customer Account Code *</label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={e => setForgotIdentifier(e.target.value)}
                    placeholder="e.g. 0421-8812-90"
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-xs font-mono font-semibold text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Registered Contact Email *</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="e.g. juan.delacruz@example.ph"
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                    required
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-1/3 bg-[#E5E7EB] hover:bg-slate-300 text-[#2B2B2B] font-semibold text-xs py-2.5 rounded-2xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-xs py-2.5 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? 'Sending…' : 'Send'}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: VERIFY OTP */}
            {forgotStep === 'OTP' && (
              <form onSubmit={handleVerifyRecoveryOtp} className="space-y-3.5 animate-fade-in">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                  <p className="font-semibold text-blue-950 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-700" />
                    <span>Verification Code Sent</span>
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    A 6-digit recovery OTP code has been dispatched to your email (<strong>{forgotEmail}</strong>) and registered mobile.
                  </p>
                  <div className="mt-2 bg-white/90 p-2 rounded-xl border border-blue-300 text-center font-mono font-semibold text-xs text-[#FF5401]">
                    📱 Demo Alert: Your Recovery Code is <span className="underline decoration-2">{forgotGeneratedOtp}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2B2B] mb-1.5 text-center">
                    Enter 6-Digit Recovery OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtpInput}
                    onChange={e => setForgotOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-4 pr-4 py-3 text-center text-lg font-mono font-semibold tracking-widest text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('IDENTIFY')}
                    className="w-1/3 bg-[#E5E7EB] hover:bg-slate-300 text-[#2B2B2B] font-semibold text-xs py-2.5 rounded-2xl transition-all cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-xs py-2.5 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Verify</span>
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: NEW PASSWORD WITH POLICY CHECKLIST */}
            {forgotStep === 'NEW_PASSWORD' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">New Password *</label>
                  <input
                    type="password"
                    value={forgotNewPass}
                    onChange={e => setForgotNewPass(e.target.value)}
                    placeholder="Min 9 characters (Upper, Lower, Number, Symbol)"
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                    required
                  />
                </div>

                {forgotNewPass && (
                  <PasswordPolicyChecklist
                    password={forgotNewPass}
                    userContext={{
                      accountNumber: forgotIdentifier,
                      name: user?.name,
                      email: forgotEmail,
                      previousPasswords: user?.previousPasswords || [],
                    }}
                  />
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    value={forgotConfirmPass}
                    onChange={e => setForgotConfirmPass(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                    required
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-1/3 bg-[#E5E7EB] hover:bg-slate-300 text-[#2B2B2B] font-semibold text-xs py-2.5 rounded-2xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-xs py-2.5 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? 'Resetting…' : 'Reset'}
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: SUCCESS CONFIRMATION */}
            {forgotStep === 'SUCCESS' && (
              <div className="text-center py-4 space-y-3 animate-fade-in">
                <div className="w-14 h-14 bg-emerald-100 text-[#22C55E] rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className="text-base font-semibold text-[#2B2B2B]">Password Successfully Reset!</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Your password has been securely updated and any existing account lockout was cleared. You may now log in using your new credentials.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setMode('CUSTOMER_LOGIN');
                      setCustomerLoginStep('CREDENTIALS');
                    }}
                    className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-xs py-3 rounded-2xl shadow-md transition-all cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FIRST-TIME ADMIN PASSWORD & MFA SETUP MODAL */}
      {showAdminFirstTimeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg p-5 sm:p-7 space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF5401] flex items-center justify-center font-bold shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#2B2B2B]">
                  Admin Password &amp; MFA Setup
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminFirstTimeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-1.5 py-1">
              {[
                { step: 'VALIDATE_LINK', num: '1', label: 'Verify Link' },
                { step: 'CREATE_PASSWORD', num: '2', label: 'Password' },
                { step: 'MFA_OTP', num: '3', label: 'MFA Setup' },
                { step: 'SUCCESS', num: '4', label: 'Active' },
              ].map(s => {
                const isCurrent = adminSetupStep === s.step;
                const isPast =
                  (s.step === 'VALIDATE_LINK' && adminSetupStep !== 'VALIDATE_LINK') ||
                  (s.step === 'CREATE_PASSWORD' && (adminSetupStep === 'MFA_OTP' || adminSetupStep === 'SUCCESS')) ||
                  (s.step === 'MFA_OTP' && adminSetupStep === 'SUCCESS');
                return (
                  <div key={s.step} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#FF5401] text-white shadow-xs scale-105'
                          : isPast
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5" /> : s.num}
                    </div>
                    <span
                      className={`text-[10px] font-semibold truncate ${
                        isCurrent ? 'text-[#FF5401]' : isPast ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* STEP 1: VALIDATE REGISTERED EMAIL & SECURE LINK TOKEN */}
            {adminSetupStep === 'VALIDATE_LINK' && (
              <form onSubmit={handleValidateSetupLink} className="space-y-4 animate-fade-in">
                {setupValidationError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2 animate-shake">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1 font-semibold leading-relaxed">
                        {setupValidationError}
                      </div>
                    </div>

                    {/* Resend Email Option if Link is Expired, Used, or Invalid */}
                    <div className="pt-1 border-t border-rose-200/80">
                      <button
                        type="button"
                        onClick={handleResendSetupEmailClick}
                        className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Resend</span>
                      </button>
                    </div>
                  </div>
                )}

                {setupNotice && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{setupNotice}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                    Registered Admin Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={setupEmailInput}
                      onChange={e => setSetupEmailInput(e.target.value)}
                      placeholder="e.g. p.manalo@clarkelectric.ph"
                      className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Quick Autofill Helper for Sample Pending User */}
                <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EBE5DC] text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">Sample Pending Admin:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSetupEmailInput('p.manalo@clarkelectric.ph');
                      setSetupValidationError('');
                      setSetupNotice('Sample email filled! Click Login below.');
                    }}
                    className="text-[#FF5401] hover:underline font-bold cursor-pointer"
                  >
                    p.manalo@clarkelectric.ph
                  </button>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminFirstTimeModal(false)}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs py-3 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: CREATE ADMIN PASSWORD (STRICT CECAP POLICY) */}
            {adminSetupStep === 'CREATE_PASSWORD' && (
              <form onSubmit={handleCreatePasswordSubmit} className="space-y-4 animate-fade-in">
                {/* Verified Admin Identity Summary */}
                <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EBE5DC] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Verified Administrator</span>
                    <span className="font-extrabold text-[#2B2B2B]">{validatedAdminUser?.name || setupEmailInput}</span>
                    <span className="text-[11px] text-slate-500 block">{setupEmailInput}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300">
                    Status: Pending
                  </span>
                </div>

                {setupPassError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{setupPassError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                    New Security Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showSetupNewPass ? 'text' : 'password'}
                      value={setupNewPass}
                      onChange={e => setSetupNewPass(e.target.value)}
                      placeholder="Enter strong 9+ char password"
                      className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-10 pr-10 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSetupNewPass(!showSetupNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    >
                      {showSetupNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Real-Time Password Policy Checklist */}
                <PasswordPolicyChecklist
                  password={setupNewPass}
                  userContext={{
                    email: setupEmailInput,
                    name: validatedAdminUser?.name,
                  }}
                />

                <div>
                  <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showSetupConfirmPass ? 'text' : 'password'}
                      value={setupConfirmPass}
                      onChange={e => setSetupConfirmPass(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-10 pr-10 py-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSetupConfirmPass(!showSetupConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    >
                      {showSetupConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdminSetupStep('VALIDATE_LINK')}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl transition-all cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs py-3 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: MANDATORY MFA / OTP ENROLLMENT */}
            {adminSetupStep === 'MFA_OTP' && (
              <form onSubmit={handleVerifyMfaSubmit} className="space-y-4 animate-fade-in">
                <div className="text-center space-y-1 pb-1">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF5401] flex items-center justify-center mx-auto border border-orange-200">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#2B2B2B]">
                    Mandatory Multi-Factor Authentication (MFA)
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed max-w-xs mx-auto">
                    Enter the 6-digit code sent to
                    <br />
                    <strong className="text-[#FF5401]">{setupEmailInput}</strong>
                  </p>
                </div>

                {setupMfaError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{setupMfaError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#2B2B2B] mb-1.5 text-center">
                    Enter 6-Digit MFA Verification Code
                  </label>
                  <div className="relative max-w-xs mx-auto">
                    <KeyRound className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={setupMfaInput}
                      onChange={e => setSetupMfaInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      autoFocus
                      className="w-full bg-[#FAF8F5] border border-[#EBE5DC] rounded-2xl pl-11 pr-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <button
                    type="button"
                    onClick={() => setAdminSetupStep('CREATE_PASSWORD')}
                    className="text-slate-500 hover:text-[#2B2B2B] font-bold cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResendMfaCode}
                    className="text-[#FF5401] hover:underline font-bold cursor-pointer"
                  >
                    Resend {setupMfaResendCount > 0 ? `(${setupMfaResendCount})` : ''}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs py-3.5 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Activating…' : 'Activate'}</span>
                </button>
              </form>
            )}

            {/* STEP 4: SUCCESS CONFIRMATION & DIRECT LAUNCH */}
            {adminSetupStep === 'SUCCESS' && (
              <div className="text-center py-4 space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <h3 className="text-base font-extrabold text-[#2B2B2B]">
                  Administrator Account Successfully Activated!
                </h3>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleLaunchAdminConsole}
                    className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Launch</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminFirstTimeModal(false);
                      setAdminEmail(setupEmailInput);
                      setAdminPassword(setupNewPass);
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

