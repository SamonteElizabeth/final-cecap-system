import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Customer,
  ServiceAccount,
  NotificationItem,
  NotificationPreferences,
  UserRole,
  AdminUser,
  SupportConcern,
  RegistrationRequest,
  SentEmail,
  AuthAuditEvent,
  AdminStaffUser,
  AdminSetupToken,
} from '../types';
import { MOCK_CUSTOMERS, MOCK_NOTIFICATIONS } from '../data/mockBillingData';
import { INITIAL_REGISTRATION_REQUESTS, ADMIN_STAFF_USERS_LIST } from '../data/adminMockData';
import {
  validatePassword,
  checkPasswordExpiration,
  PasswordExpirationStatus,
  INACTIVITY_TIMEOUT_MS,
  getAccountLockoutStatus,
  recordFailedLoginAttempt,
  resetAccountFailedAttempts,
  LockoutStatus,
} from '../utils/authPolicy';
import { getAuditLogs, logAuditEvent, subscribeToAuditLogs } from '../services/auditLogger';

const MOCK_ADMIN: AdminUser = {
  id: 'ADMIN-CEDC-01',
  name: 'Engr. Roberto Santos',
  email: 'admin@clarkelectric.ph',
  role: 'admin',
  department: 'System Operations & Public Affairs',
  title: 'Senior Utility Grid Communications Lead',
};

export const ADMIN_SETUP_DURATION_MS = 15 * 60 * 1000; // 15-minute validity window
export const ADMIN_STAFF_USERS_KEY = 'cecap_admin_staff_users';
export const ADMIN_SETUP_TOKENS_KEY = 'cecap_admin_setup_tokens';

export const INITIAL_SETUP_TOKENS: AdminSetupToken[] = [
  {
    token: 'SEC-ADM-984210-CFZ7',
    email: 'p.manalo@clarkelectric.ph',
    adminId: 'ADM-006',
    adminName: 'Engr. Patrick Manalo',
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    expiresAt: Date.now() + 15 * 60 * 1000,
    used: false,
  },
];

const INITIAL_SUPPORT_CONCERNS: SupportConcern[] = [
  {
    id: 'CONCERN-101',
    accountNumber: '0421-8812-90',
    customerName: 'Juan Dela Cruz',
    customerAddress: 'Block 12 Lot 5, Berthaphil Industrial Park, Clark Freeport Zone, Pampanga',
    serviceType: 'Residential',
    ticketNumber: 'TK-2026-8801',
    category: 'Billing Concern',
    subject: 'High consumption charge inquiry for July',
    description: 'Noticeable jump in kWh compared to previous month. Kindly verify meter accuracy.',
    status: 'In Progress',
    createdAt: '2026-08-02 11:20 AM',
    adminName: 'Clarissa Fernandez',
    assignedStaff: 'Clarissa Fernandez',
    adminResponse: 'Meter dispatch unit scheduled for field verification on Aug 05.',
    adminRespondedAt: '2026-08-03 09:15 AM',
  },
  {
    id: 'CONCERN-102',
    accountNumber: '0421-9943-11',
    customerName: 'Juan Dela Cruz',
    customerAddress: 'Unit 402 Philexcel Business Park, Clark Freeport Zone, Pampanga',
    serviceType: 'Commercial',
    ticketNumber: 'TK-2026-9923',
    category: 'Power Outage',
    subject: 'Voltage dip reported at Philexcel Business Park',
    description: 'Brief 3-second voltage sag affected server room UPS equipment.',
    status: 'Pending',
    createdAt: '2026-08-04 08:10 AM',
    assignedStaff: 'Clarissa Fernandez',
  },
  {
    id: 'CONCERN-103',
    accountNumber: '0421-3310-88',
    customerName: 'Maria Clara Santos',
    customerAddress: 'Villa 14, Mimosa Leisure Estate, Clark Freeport Zone',
    serviceType: 'Residential',
    ticketNumber: 'TK-2026-7712',
    category: 'Meter Concern',
    subject: 'Digital smart meter display flickering',
    description: 'LCD panel blinking irregularly during afternoon peak load. Power remains on.',
    status: 'Solved',
    createdAt: '2026-08-01 02:30 PM',
    adminName: 'Clarissa Fernandez',
    assignedStaff: 'Clarissa Fernandez',
    completionDate: '2026-08-03 04:15 PM',
    adminResponse: 'Digital meter firmware updated and secondary surge protective device inspected.',
    adminRespondedAt: '2026-08-03 04:15 PM',
  },
];

const INITIAL_SENT_EMAILS: SentEmail[] = [
  {
    id: 'MSG-2026-9082',
    to: 'p.manalo@clarkelectric.ph',
    recipientName: 'Engr. Patrick Manalo',
    subject: 'Admin Account Created - Set Up Your Password & MFA',
    sender: 'CECAp Admin Security <admin-security@clarkelectric.ph>',
    body: `Hello,

An admin account has been created for you in CECAp (Customer Engagement Platform).

To get started, please set up your password and configure multi-factor authentication (MFA) to access the Admin Console.`,
    sentAt: 'Aug 05, 2026, 04:00 PM',
    type: 'ADMIN_SETUP_INVITE',
    status: 'DELIVERED',
    data: {
      setupToken: 'SEC-ADM-984210-CFZ7',
      setupUrl: 'https://cecap.clarkelectric.ph/login?action=admin-setup&token=SEC-ADM-984210-CFZ7&email=p.manalo%40clarkelectric.ph',
      adminEmail: 'p.manalo@clarkelectric.ph',
      adminName: 'Engr. Patrick Manalo',
      expiresAt: Date.now() + 15 * 60 * 1000,
    },
  },
  {
    id: 'MSG-2026-9081',
    to: 'eleanor.vance@philexcel.ph',
    recipientName: 'Eleanor Vance',
    subject: 'Registration Approved - Portal Credentials',
    sender: 'CECAp Official <noreply@clarkelectric.ph>',
    body: `Hello,

Your CECAp customer portal registration has been verified and approved.

Customer Account Code: 0421-9012-34
Temporary Password: CedcTemp#7419

Please log in and set your new password.`,
    sentAt: 'Aug 05, 2026, 03:45 PM',
    type: 'REGISTRATION_APPROVED',
    status: 'DELIVERED',
    data: {
      accountCode: '0421-9012-34',
      tempPassword: 'CedcTemp#7419',
      requestId: 'REG-2026-001',
    },
  },
  {
    id: 'MSG-2026-9080',
    to: 'm.reyes@fontanaclark.ph',
    recipientName: 'Mark Anthony Reyes',
    subject: 'Registration Request Received',
    sender: 'CECAp Official <noreply@clarkelectric.ph>',
    body: `Hello,

We have received your CECAp customer portal registration request.

Our team is currently verifying your details. You will receive an update once approved.`,
    sentAt: 'Aug 05, 2026, 01:20 PM',
    type: 'REGISTRATION_RECEIVED',
    status: 'DELIVERED',
    data: {
      accountCode: '0421-5512-88',
      requestId: 'REG-2026-002',
    },
  },
];

interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  adminUser: AdminUser | null;
  setAdminUser: (admin: AdminUser | null) => void;
  user: Customer | null;
  setUser: React.Dispatch<React.SetStateAction<Customer | null>>;
  selectedAccount: ServiceAccount | null;
  setSelectedAccount: (acc: ServiceAccount) => void;
  linkedAccounts: ServiceAccount[];
  activeTab: 'dashboard' | 'billing' | 'consumption' | 'support' | 'notifications' | 'profile' | 'settings' | 'admin-console';
  setActiveTab: (tab: 'dashboard' | 'billing' | 'consumption' | 'support' | 'notifications' | 'profile' | 'settings' | 'admin-console') => void;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  unreadNotifCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: NotificationItem) => void;
  createAnnouncement: (notifData: {
    title: string;
    message: string;
    type: NotificationItem['type'];
    targetAudience?: 'ALL' | 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
    urgency?: 'NORMAL' | 'HIGH' | 'EMERGENCY';
  }) => void;
  deleteAnnouncement: (id: string) => void;
  editAnnouncement: (id: string, updated: Partial<NotificationItem>) => void;
  supportConcerns: SupportConcern[];
  addSupportConcern: (concern: SupportConcern) => void;
  updateSupportConcernStatus: (
    id: string,
    status: SupportConcern['status'],
    adminNotes?: string,
    assignedStaff?: string
  ) => void;
  biometricsEnabled: boolean;
  setBiometricsEnabled: (val: boolean) => void;
  notificationPreferences: NotificationPreferences;
  setNotificationPreferences: React.Dispatch<React.SetStateAction<NotificationPreferences>>;
  viewMode: 'mobile' | 'architecture';
  setViewMode: (mode: 'mobile' | 'architecture') => void;
  deviceFrame: 'android' | 'ios' | 'frameless';
  setDeviceFrame: (frame: 'android' | 'ios' | 'frameless') => void;
  paymentModalOpen: boolean;
  setPaymentModalOpen: (val: boolean) => void;
  refreshAccountData: () => Promise<void>;
  logout: () => void;
  biometricPromptOpen: boolean;
  setBiometricPromptOpen: (val: boolean) => void;
  biometricSuccessAction: (() => void) | null;
  triggerBiometricAuth: (onSuccess: () => void) => void;
  registrationRequests: RegistrationRequest[];
  submitRegistration: (req: { fullName: string; accountCode?: string; serviceAddress: string; mobileNumber: string; email: string; notificationChannel?: 'Email' | 'SMS' }) => void;
  approveRegistration: (id: string, customAccountCode?: string) => { accountCode: string; username: string; tempPassword: string };
  rejectRegistration: (id: string, reason: string) => void;

  // Sent Emails / Dispatch Hub State
  sentEmails: SentEmail[];
  sendEmail: (emailData: Omit<SentEmail, 'id' | 'sentAt' | 'status'>) => SentEmail;
  emailModalOpen: boolean;
  setEmailModalOpen: (val: boolean) => void;
  selectedEmail: SentEmail | null;
  setSelectedEmail: (email: SentEmail | null) => void;
  toastMsg: string | null;
  setToastMsg: (msg: string | null) => void;

  // CECAP Customer Authentication & Security Policy State
  auditLogs: AuthAuditEvent[];
  logAuthEvent: (
    eventType: AuthAuditEvent['eventType'],
    accountIdentifier: string,
    status: AuthAuditEvent['status'],
    details: string,
    customIp?: string
  ) => AuthAuditEvent;
  sessionTimeoutNotice: string | null;
  setSessionTimeoutNotice: (msg: string | null) => void;
  passwordExpirationStatus: PasswordExpirationStatus;
  showPasswordChangeModal: boolean;
  setShowPasswordChangeModal: (val: boolean) => void;
  updateCustomerPassword: (newPassword: string, oldPassword?: string) => Promise<{ success: boolean; message: string; errors?: string[] }>;
  checkLockout: (identifier: string) => LockoutStatus;
  recordFailedAttempt: (identifier: string) => LockoutStatus;
  unlockAccount: (identifier: string) => void;

  // Admin Staff & First-Time Password Setup State & Flows
  adminStaffUsers: AdminStaffUser[];
  setAdminStaffUsers: React.Dispatch<React.SetStateAction<AdminStaffUser[]>>;
  adminSetupTokens: AdminSetupToken[];
  activeSetupToken: string | null;
  setActiveSetupToken: (token: string | null) => void;
  adminSetupEmailParam: string | null;
  setAdminSetupEmailParam: (email: string | null) => void;
  showAdminSetupModal: boolean;
  setShowAdminSetupModal: (val: boolean) => void;
  createAdminStaffUser: (userData: {
    name: string;
    email: string;
    role?: AdminStaffUser['role'];
    department?: string;
    permissions: AdminStaffUser['permissions'];
  }) => { user: AdminStaffUser; token: AdminSetupToken };
  updateAdminStaffUser: (id: string, updates: Partial<AdminStaffUser>) => void;
  resendAdminSetupEmail: (email: string) => { success: boolean; message: string; token?: AdminSetupToken };
  validateAdminSetupToken: (
    email: string,
    token?: string
  ) => {
    isValid: boolean;
    reason?: 'NOT_FOUND' | 'USED' | 'EXPIRED' | 'ALREADY_ACTIVE' | 'EMAIL_MISMATCH';
    message: string;
    admin?: AdminStaffUser;
    tokenObj?: AdminSetupToken;
  };
  completeAdminSetup: (
    email: string,
    token: string,
    newPassword: string,
    otpCode: string
  ) => Promise<{ success: boolean; message: string; errors?: string[] }>;
  simulateExpireToken: (tokenString: string) => void;
  simulateUseToken: (tokenString: string) => void;
  openAdminSetupFlow: (email?: string, token?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SESSION_AUTH_KEY = 'cecap_session_authenticated';
const SESSION_ROLE_KEY = 'cecap_session_role';
const SESSION_TAB_KEY = 'cecap_session_active_tab';
const SESSION_USER_KEY = 'cecap_session_user';
const SESSION_ACCOUNT_KEY = 'cecap_session_selected_account';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SESSION_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    try {
      const savedRole = localStorage.getItem(SESSION_ROLE_KEY) as UserRole | null;
      return savedRole === 'admin' || savedRole === 'customer' ? savedRole : 'customer';
    } catch {
      return 'customer';
    }
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(MOCK_ADMIN);

  const [user, setUser] = useState<Customer | null>(() => {
    try {
      const savedUser = localStorage.getItem(SESSION_USER_KEY);
      return savedUser ? JSON.parse(savedUser) : MOCK_CUSTOMERS[0];
    } catch {
      return MOCK_CUSTOMERS[0];
    }
  });

  const [selectedAccount, setSelectedAccountState] = useState<ServiceAccount | null>(() => {
    try {
      const savedAcc = localStorage.getItem(SESSION_ACCOUNT_KEY);
      if (savedAcc) return JSON.parse(savedAcc);
    } catch {
      // ignore
    }
    return MOCK_CUSTOMERS[0].linkedAccounts[0];
  });

  const [linkedAccounts, setLinkedAccounts] = useState<ServiceAccount[]>(
    user?.linkedAccounts || MOCK_CUSTOMERS[0].linkedAccounts
  );

  const [activeTab, setActiveTabState] = useState<
    'dashboard' | 'billing' | 'consumption' | 'support' | 'notifications' | 'profile' | 'settings' | 'admin-console'
  >(() => {
    try {
      const savedTab = localStorage.getItem(SESSION_TAB_KEY) as
        | 'dashboard'
        | 'billing'
        | 'consumption'
        | 'support'
        | 'notifications'
        | 'profile'
        | 'settings'
        | 'admin-console'
        | null;
      if (
        savedTab &&
        ['dashboard', 'billing', 'consumption', 'support', 'notifications', 'profile', 'settings', 'admin-console'].includes(savedTab)
      ) {
        return savedTab;
      }
    } catch {
      // ignore
    }
    return 'dashboard';
  });

  const setIsAuthenticated = (val: boolean) => {
    setIsAuthenticatedState(val);
    try {
      if (val) {
        localStorage.setItem(SESSION_AUTH_KEY, 'true');
      } else {
        localStorage.removeItem(SESSION_AUTH_KEY);
      }
    } catch {
      // ignore
    }
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    try {
      localStorage.setItem(SESSION_ROLE_KEY, role);
    } catch {
      // ignore
    }
  };

  const setActiveTab = (
    tab: 'dashboard' | 'billing' | 'support' | 'notifications' | 'profile' | 'settings' | 'admin-console'
  ) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem(SESSION_TAB_KEY, tab);
    } catch {
      // ignore
    }
  };
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [supportConcerns, setSupportConcerns] = useState<SupportConcern[]>(INITIAL_SUPPORT_CONCERNS);
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>(INITIAL_REGISTRATION_REQUESTS);

  // Email Hub State
  const [sentEmails, setSentEmails] = useState<SentEmail[]>(INITIAL_SENT_EMAILS);
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(INITIAL_SENT_EMAILS[0]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Admin Staff Users & First-Time Password Setup State
  const [adminStaffUsers, setAdminStaffUsersState] = useState<AdminStaffUser[]>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STAFF_USERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ADMIN_STAFF_USERS_LIST;
  });

  const setAdminStaffUsers = (
    updater: AdminStaffUser[] | ((prev: AdminStaffUser[]) => AdminStaffUser[])
  ) => {
    setAdminStaffUsersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(ADMIN_STAFF_USERS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [adminSetupTokens, setAdminSetupTokensState] = useState<AdminSetupToken[]>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SETUP_TOKENS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SETUP_TOKENS;
  });

  const setAdminSetupTokens = (
    updater: AdminSetupToken[] | ((prev: AdminSetupToken[]) => AdminSetupToken[])
  ) => {
    setAdminSetupTokensState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(ADMIN_SETUP_TOKENS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [activeSetupToken, setActiveSetupToken] = useState<string | null>(null);
  const [adminSetupEmailParam, setAdminSetupEmailParam] = useState<string | null>(null);
  const [showAdminSetupModal, setShowAdminSetupModal] = useState<boolean>(false);

  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(true);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    push: true,
    sms: true,
    email: true,
    dueDateReminders: true,
    outageAlerts: true,
    promotions: false,
  });
  const [viewMode, setViewMode] = useState<'mobile' | 'architecture'>('mobile');
  const [deviceFrame, setDeviceFrame] = useState<'android' | 'ios' | 'frameless'>('ios');
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [biometricPromptOpen, setBiometricPromptOpen] = useState<boolean>(false);
  const [biometricSuccessAction, setBiometricSuccessAction] = useState<(() => void) | null>(null);

  // CECAP Customer App Authentication Policy State
  const [auditLogs, setAuditLogs] = useState<AuthAuditEvent[]>(() => getAuditLogs());
  const [sessionTimeoutNotice, setSessionTimeoutNotice] = useState<string | null>(null);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState<boolean>(false);

  // Listen to live audit logs
  useEffect(() => {
    return subscribeToAuditLogs(updated => {
      setAuditLogs(updated);
    });
  }, []);

  const logAuthEvent = (
    eventType: AuthAuditEvent['eventType'],
    accountIdentifier: string,
    status: AuthAuditEvent['status'],
    details: string,
    customIp?: string
  ) => {
    return logAuditEvent(eventType, accountIdentifier, status, details, customIp);
  };

  // Inactivity timeout tracking (15 minutes)
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    const intervalTimer = setInterval(() => {
      if (isAuthenticated) {
        const inactiveDuration = Date.now() - lastActivityRef.current;
        if (inactiveDuration >= INACTIVITY_TIMEOUT_MS) {
          // Trigger automatic logout due to 15-minute inactivity policy
          const accId = user?.accountNumber || 'CUSTOMER_SESSION';
          logAuditEvent(
            'SESSION_TIMEOUT',
            accId,
            'SECURITY_ALERT',
            'Automatic session logout executed after 15 minutes of user inactivity.'
          );
          setIsAuthenticated(false);
          setActiveTab('dashboard');
          setSessionTimeoutNotice(
            'Your session was automatically logged out after 15 minutes of inactivity according to CECAP security policy. Please re-authenticate.'
          );
          setToastMsg('🔒 Session logged out due to 15 minutes of inactivity.');
          setTimeout(() => setToastMsg(null), 6000);
          try {
            localStorage.removeItem(SESSION_AUTH_KEY);
            localStorage.removeItem(SESSION_ROLE_KEY);
          } catch {
            // ignore
          }
        }
      }
    }, 5000);

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      clearInterval(intervalTimer);
    };
  }, [isAuthenticated, user]);

  // Password expiration status (30-day lifetime, notify 7 days before)
  const passwordExpirationStatus = checkPasswordExpiration(user?.passwordLastChanged);

  // Password expiration 7-day notification check
  useEffect(() => {
    if (isAuthenticated && user && passwordExpirationStatus.shouldNotify) {
      const notifiedKey = `cecap_notified_pwd_exp_${user.accountNumber}_${passwordExpirationStatus.daysRemaining}`;
      try {
        if (!sessionStorage.getItem(notifiedKey)) {
          sessionStorage.setItem(notifiedKey, 'true');
          addNotification({
            id: `NOTIF-PWD-EXP-${Date.now()}`,
            type: 'OUTAGE_SCHEDULED',
            title: 'Password Expiration Advisory',
            message: `Security Notice: Your CECAP customer password will expire in ${passwordExpirationStatus.daysRemaining} days (30-day security policy). Please update your password to maintain seamless access.`,
            timestamp: 'Just now',
            isRead: false,
          });
          logAuditEvent(
            'PASSWORD_EXPIRATION_WARNING',
            user.accountNumber,
            'WARNING',
            `Advisory dispatched: Customer password expires in ${passwordExpirationStatus.daysRemaining} days.`
          );
        }
      } catch {
        // ignore
      }
    }
  }, [isAuthenticated, user?.accountNumber, passwordExpirationStatus.shouldNotify, passwordExpirationStatus.daysRemaining]);

  // Customer Password Update function with full policy enforcement & 5-password history
  const updateCustomerPassword = async (
    newPassword: string,
    oldPassword?: string
  ): Promise<{ success: boolean; message: string; errors?: string[] }> => {
    if (!user) {
      return { success: false, message: 'No active user found to update password.' };
    }

    // 1. Validate against CECAP authentication policy
    const validation = validatePassword(newPassword, {
      accountNumber: user.accountNumber,
      name: user.name,
      email: user.email,
      previousPasswords: user.previousPasswords || [],
    });

    if (!validation.isValid) {
      logAuditEvent(
        'PASSWORD_CHANGE_FAILED',
        user.accountNumber,
        'FAILURE',
        `Password update failed policy check: ${validation.errors.join('; ')}`
      );
      return {
        success: false,
        message: validation.errors[0] || 'Password does not satisfy CECAP security policy.',
        errors: validation.errors,
      };
    }

    // 2. Prevent reuse of the last 5 passwords & update history
    const history = user.previousPasswords ? [...user.previousPasswords] : [];
    if (user.currentPassword && !history.includes(user.currentPassword)) {
      history.push(user.currentPassword);
    }
    const updatedHistory = history.slice(-5);

    const updatedUser: Customer = {
      ...user,
      currentPassword: newPassword,
      passwordLastChanged: new Date().toISOString(),
      previousPasswords: updatedHistory,
      isFirstLogin: false,
      tempPassword: undefined,
    };

    setUser(updatedUser);

    // 3. Log audit event
    logAuditEvent(
      'PASSWORD_CHANGED',
      user.accountNumber,
      'SUCCESS',
      'Password successfully updated adhering to 9+ characters, complexity, pattern, and history rules.'
    );

    // 4. Dispatch security confirmation email
    sendEmail({
      to: user.email,
      recipientName: user.name,
      subject: '[CECAp] Password Successfully Updated - Security Notice',
      sender: 'CECAp Security <security@clarkelectric.ph>',
      body: `Dear ${user.name},

Your CECAp Customer Portal password was successfully updated on ${new Date().toLocaleString()}.

Security Policy Summary:
- Password updated under CECAP 30-day expiration cycle.
- Last 5 passwords prevented from reuse.
- Minimum 9 characters, uppercase, lowercase, numeric, and special characters validated.

If you did not authorize this change, please immediately call the Clark Electric 24/7 hotline at (045) 599-7000.

Thank you,
CECAp Cybersecurity Operations`,
      type: 'PASSWORD_RESET',
    });

    setToastMsg('🔐 Password successfully updated!');
    setTimeout(() => setToastMsg(null), 5000);

    return { success: true, message: 'Password successfully updated!' };
  };

  const checkLockout = (identifier: string): LockoutStatus => {
    return getAccountLockoutStatus(identifier);
  };

  const recordFailedAttempt = (identifier: string): LockoutStatus => {
    const res = recordFailedLoginAttempt(identifier);
    if (res.isLocked) {
      logAuditEvent(
        'ACCOUNT_LOCKED',
        identifier,
        'SECURITY_ALERT',
        `Account locked for 30 minutes after 5 consecutive failed login attempts.`
      );
    } else {
      logAuditEvent(
        'LOGIN_FAILED',
        identifier,
        'FAILURE',
        `Failed login attempt (${res.failedAttempts}/5).`
      );
    }
    return res;
  };

  const unlockAccount = (identifier: string) => {
    resetAccountFailedAttempts(identifier);
    logAuditEvent(
      'ACCOUNT_UNLOCKED',
      identifier,
      'SUCCESS',
      'Account lockout cleared following verified identity recovery or OTP validation.'
    );
  };

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  const sendEmail = (emailData: Omit<SentEmail, 'id' | 'sentAt' | 'status'>): SentEmail => {
    const newEmail: SentEmail = {
      ...emailData,
      id: `MSG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      sentAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      status: 'DELIVERED',
    };
    setSentEmails(prev => [newEmail, ...prev]);
    setSelectedEmail(newEmail);
    setToastMsg(`📧 Email dispatched to ${emailData.to}!`);
    setTimeout(() => setToastMsg(null), 5000);
    return newEmail;
  };

  const setSelectedAccount = (acc: ServiceAccount) => {
    setSelectedAccountState(acc);
    try {
      localStorage.setItem(SESSION_ACCOUNT_KEY, JSON.stringify(acc));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user?.linkedAccounts) {
      setLinkedAccounts(user.linkedAccounts);
    }
    if (user) {
      try {
        localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
      } catch {
        // ignore
      }
    }
  }, [user]);

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const addNotification = (notif: NotificationItem) => {
    setNotifications(prev => [notif, ...prev]);
  };

  // Admin announcement functions
  const createAnnouncement = (notifData: {
    title: string;
    message: string;
    type: NotificationItem['type'];
    targetAudience?: 'ALL' | 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
    urgency?: 'NORMAL' | 'HIGH' | 'EMERGENCY';
  }) => {
    const newNotif: NotificationItem = {
      id: `ANNC-ADMIN-${Date.now()}`,
      title: notifData.title,
      message: notifData.message,
      type: notifData.type,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      isRead: false,
      targetAudience: notifData.targetAudience || 'ALL',
      urgency: notifData.urgency || 'NORMAL',
      authorName: adminUser?.name || 'CEDC Admin Operations',
      createdByAdmin: true,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const editAnnouncement = (id: string, updated: Partial<NotificationItem>) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, ...updated } : n))
    );
  };

  const addSupportConcern = (concern: SupportConcern) => {
    setSupportConcerns(prev => [concern, ...prev]);
  };

  const updateSupportConcernStatus = (
    id: string,
    status: SupportConcern['status'],
    adminNotes?: string,
    assignedStaffName?: string
  ) => {
    const isCompleted = status === 'Solved' || status === 'Resolved';
    const nowTimestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    setSupportConcerns(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              status,
              adminResponse: adminNotes !== undefined ? adminNotes : c.adminResponse,
              adminRespondedAt: nowTimestamp,
              adminName: adminUser?.name || 'CEDC Operations Admin',
              assignedStaff: assignedStaffName || c.assignedStaff || adminUser?.name || 'Clarissa Fernandez',
              // Automatically record completion date when marked as Solved
              completionDate: isCompleted ? (c.completionDate || nowTimestamp) : (status === 'In Progress' ? undefined : c.completionDate),
            }
          : c
      )
    );
  };

  const refreshAccountData = async () => {
    if (!selectedAccount) return;
    try {
      const res = await fetch(`/api/billing/account/${encodeURIComponent(selectedAccount.accountNumber)}`);
      const data = await res.json();
      if (data.success && data.account) {
        setSelectedAccountState(data.account);
        setLinkedAccounts(data.linkedAccounts || []);
      }
    } catch (err) {
      console.warn('Refresh account error:', err);
    }
  };

  const triggerBiometricAuth = (onSuccess: () => void) => {
    setBiometricSuccessAction(() => onSuccess);
    setBiometricPromptOpen(true);
  };

  const submitRegistration = (req: { fullName: string; accountCode?: string; serviceAddress: string; mobileNumber: string; email: string; notificationChannel?: 'Email' | 'SMS' }) => {
    const assignedAccountCode = req.accountCode || `0421-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;
    const newReq: RegistrationRequest = {
      id: `REG-2026-${Math.floor(100 + Math.random() * 900)}`,
      fullName: req.fullName,
      accountCode: assignedAccountCode,
      serviceAddress: req.serviceAddress,
      mobileNumber: req.mobileNumber,
      email: req.email,
      status: 'Pending',
      submittedAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      notificationChannel: req.notificationChannel || 'Email',
      matchingBillingRecord: {
        accountNumber: assignedAccountCode,
        customerName: req.fullName,
        serviceAddress: req.serviceAddress,
        mobileNumber: req.mobileNumber,
        email: req.email,
        meterNumber: `MTR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        serviceType: 'Residential',
        accountStatus: 'Active',
        matchConfidence: 95,
      },
    };
    setRegistrationRequests(prev => [newReq, ...prev]);

    // Send confirmation email
    sendEmail({
      to: req.email,
      recipientName: req.fullName,
      subject: 'Registration Request Received',
      sender: 'CECAp Official <noreply@clarkelectric.ph>',
      body: `Hello,

We have received your CECAp customer portal registration request.

Our team is currently verifying your details. You will receive an update once approved.`,
      type: 'REGISTRATION_RECEIVED',
      data: {
        accountCode: assignedAccountCode,
        requestId: newReq.id,
      },
    });
  };

  const approveRegistration = (id: string, customAccountCode?: string) => {
    const existingReq = registrationRequests.find(r => r.id === id);
    const accountCode = customAccountCode || existingReq?.accountCode || existingReq?.matchingBillingRecord?.accountNumber || `0421-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;
    const tempPassword = `CedcTemp#${Math.floor(1000 + Math.random() * 9000)}`;
    // Login username issued on approval, taken from the email handle (e.g. eleanor.vance)
    const username =
      existingReq?.username ||
      (existingReq?.email.split('@')[0] || `cust${accountCode.replace(/\D/g, '').slice(-6)}`).toLowerCase();
    const nowStr = new Date().toLocaleString();

    setRegistrationRequests(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            status: 'Approved',
            reviewedAt: nowStr,
            reviewedBy: adminUser?.name || 'CRS Administrator',
            accountCode,
            username,
            tempPassword,
          };
        }
        return r;
      })
    );

    // Push in-app notification for customer
    const approvedReq = registrationRequests.find(r => r.id === id);
    if (approvedReq) {
      addNotification({
        id: `NOTIF-REG-APP-${Date.now()}`,
        type: 'PAYMENT_CONFIRMATION',
        title: 'Registration Request Approved!',
        message: `Your CEDC portal registration request was verified & approved by CRS Admin. Username: ${username}. Temp Password: ${tempPassword}. Please log in and change your password.`,
        timestamp: 'Just now',
        isRead: false,
      });

      // Dispatch Email with credentials
      sendEmail({
        to: approvedReq.email,
        recipientName: approvedReq.fullName,
        subject: 'Registration Approved - Portal Credentials',
        sender: 'CECAp Official <noreply@clarkelectric.ph>',
        body: `Hello,

Your CECAp customer portal registration has been verified and approved.

Username: ${username}
Customer Account Code: ${accountCode}
Temporary Password: ${tempPassword}

Please log in and set your new password.`,
        type: 'REGISTRATION_APPROVED',
        data: {
          accountCode,
          username,
          tempPassword,
          requestId: id,
        },
      });
    }

    return { accountCode, username, tempPassword };
  };

  const rejectRegistration = (id: string, reason: string) => {
    const nowStr = new Date().toLocaleString();
    const rejectedReq = registrationRequests.find(r => r.id === id);

    setRegistrationRequests(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            status: 'Rejected',
            reviewedAt: nowStr,
            reviewedBy: adminUser?.name || 'CRS Administrator',
            rejectionReason: reason,
          };
        }
        return r;
      })
    );

    addNotification({
      id: `NOTIF-REG-REJ-${Date.now()}`,
      type: 'OUTAGE_EMERGENCY',
      title: 'Registration Request Rejected',
      message: `Your CEDC portal registration request was reviewed and rejected. Reason: ${reason}. Please contact customer care or submit updated information.`,
      timestamp: 'Just now',
      isRead: false,
    });

    if (rejectedReq) {
      sendEmail({
        to: rejectedReq.email,
        recipientName: rejectedReq.fullName,
        subject: 'Registration Status Update',
        sender: 'CECAp Official <noreply@clarkelectric.ph>',
        body: `Hello,

Your customer registration request could not be approved at this time.

Reason: ${reason}

Please verify your details or contact CECAp support.`,
        type: 'REGISTRATION_REJECTED',
        data: {
          requestId: id,
          rejectionReason: reason,
        },
      });
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    try {
      localStorage.removeItem(SESSION_AUTH_KEY);
      localStorage.removeItem(SESSION_ROLE_KEY);
      localStorage.removeItem(SESSION_TAB_KEY);
      localStorage.removeItem('cecap_admin_active_tab');
      localStorage.removeItem('cecap_admin_advisories_subtab');
      localStorage.removeItem('cecap_admin_maintenance_subtab');
    } catch {
      // ignore
    }
  };

  // -------------------------------------------------------------
  // ADMIN STAFF & FIRST-TIME PASSWORD / MFA SETUP FLOW
  // -------------------------------------------------------------
  const createAdminStaffUser = (userData: {
    name: string;
    email: string;
    role?: AdminStaffUser['role'];
    department?: string;
    permissions: AdminStaffUser['permissions'];
  }): { user: AdminStaffUser; token: AdminSetupToken } => {
    const adminId = `ADM-${Date.now().toString().slice(-4)}`;
    const cleanEmail = userData.email.trim().toLowerCase();
    const tokenString = `SEC-ADM-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const now = Date.now();
    const expiresAt = now + ADMIN_SETUP_DURATION_MS;

    const newToken: AdminSetupToken = {
      token: tokenString,
      email: cleanEmail,
      adminId,
      adminName: userData.name,
      createdAt: new Date(now).toISOString(),
      expiresAt,
      used: false,
    };

    const newAdminUser: AdminStaffUser = {
      id: adminId,
      name: userData.name,
      email: cleanEmail,
      role: userData.role || 'Admin',
      department: userData.department || 'System Operations',
      status: 'Pending',
      lastLogin: 'Never logged in',
      permissions: userData.permissions,
      setupToken: tokenString,
      setupTokenExpiresAt: expiresAt,
      setupTokenUsed: false,
    };

    setAdminSetupTokens(prev => [newToken, ...prev]);
    setAdminStaffUsers(prev => [newAdminUser, ...prev]);

    const setupUrl = `https://cecap.clarkelectric.ph/login?action=admin-setup&token=${tokenString}&email=${encodeURIComponent(cleanEmail)}`;
    sendEmail({
      to: cleanEmail,
      recipientName: userData.name,
      subject: 'Admin Account Created - Set Up Your Password & MFA',
      sender: 'CECAp Admin Security <admin-security@clarkelectric.ph>',
      body: `Hello,

An admin account has been created for you in CECAp (Customer Engagement Platform).

To get started, please set up your password and configure multi-factor authentication (MFA) to access the Admin Console.`,
      type: 'ADMIN_SETUP_INVITE',
      data: {
        setupToken: tokenString,
        setupUrl,
        adminEmail: cleanEmail,
        adminName: userData.name,
        expiresAt,
      },
    });

    logAuthEvent(
      'ADMIN_INVITE_DISPATCHED',
      cleanEmail,
      'SUCCESS',
      `New admin account provisioned (Status: Pending, No password). Single-use setup link generated (${tokenString}) with 15-minute expiration.`
    );

    return { user: newAdminUser, token: newToken };
  };

  const updateAdminStaffUser = (id: string, updates: Partial<AdminStaffUser>) => {
    setAdminStaffUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
  };

  const resendAdminSetupEmail = (email: string) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const existingUser = adminStaffUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!existingUser) {
      return { success: false, message: `No administrator found with email: ${email}` };
    }

    if (existingUser.status === 'Active') {
      return {
        success: false,
        message: 'Administrator account is already Active. Please log in or use password reset.',
      };
    }

    const tokenString = `SEC-ADM-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const now = Date.now();
    const expiresAt = now + ADMIN_SETUP_DURATION_MS;

    const newToken: AdminSetupToken = {
      token: tokenString,
      email: cleanEmail,
      adminId: existingUser.id,
      adminName: existingUser.name,
      createdAt: new Date(now).toISOString(),
      expiresAt,
      used: false,
    };

    setAdminSetupTokens(prev => [
      newToken,
      ...prev.map(t => (t.email.toLowerCase() === cleanEmail && !t.used ? { ...t, used: true, usedAt: 'Superseded' } : t)),
    ]);

    setAdminStaffUsers(prev =>
      prev.map(u =>
        u.id === existingUser.id
          ? { ...u, setupToken: tokenString, setupTokenExpiresAt: expiresAt, setupTokenUsed: false }
          : u
      )
    );

    const setupUrl = `https://cecap.clarkelectric.ph/login?action=admin-setup&token=${tokenString}&email=${encodeURIComponent(cleanEmail)}`;
    sendEmail({
      to: cleanEmail,
      recipientName: existingUser.name,
      subject: 'Admin Account Created - Set Up Your Password & MFA',
      sender: 'CECAp Admin Security <admin-security@clarkelectric.ph>',
      body: `Hello,

An admin account has been created for you in CECAp (Customer Engagement Platform).

To get started, please set up your password and configure multi-factor authentication (MFA) to access the Admin Console.`,
      type: 'ADMIN_SETUP_INVITE',
      data: {
        setupToken: tokenString,
        setupUrl,
        adminEmail: cleanEmail,
        adminName: existingUser.name,
        expiresAt,
      },
    });

    logAuthEvent(
      'ADMIN_SETUP_RESENT',
      cleanEmail,
      'SUCCESS',
      `Fresh single-use setup link re-dispatched to ${cleanEmail}. Previous tokens invalidated.`
    );

    return { success: true, message: `New setup link sent to ${cleanEmail}`, token: newToken };
  };

  const validateAdminSetupToken = (email: string, token?: string) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    let cleanToken = (token || '').trim();

    if (!cleanEmail) {
      return {
        isValid: false,
        reason: 'NOT_FOUND' as const,
        message: 'Please provide your registered administrator email address.',
      };
    }

    const admin = adminStaffUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (!admin) {
      logAuthEvent(
        'ADMIN_SETUP_LINK_REJECTED',
        cleanEmail,
        'FAILURE',
        `Setup validation rejected: Email ${cleanEmail} is not registered in CECAP Administrator directory.`
      );
      return {
        isValid: false,
        reason: 'NOT_FOUND' as const,
        message: 'Unrecognized administrator email address. Please ensure you enter your registered CEDC email.',
      };
    }

    if (!cleanToken) {
      const foundToken = adminSetupTokens.find(t => t.email.toLowerCase() === cleanEmail);
      if (foundToken) {
        cleanToken = foundToken.token;
      }
    }

    if (!cleanToken) {
      return {
        isValid: false,
        reason: 'NOT_FOUND' as const,
        message: 'No setup link was found for this administrator account. Please use Resend Setup Email.',
        admin,
      };
    }

    if (admin.status === 'Active') {
      return {
        isValid: false,
        reason: 'ALREADY_ACTIVE' as const,
        message: 'This administrator account is already Active. Please proceed to regular Admin Log In.',
        admin,
      };
    }

    const tokenObj = adminSetupTokens.find(
      t => t.token.toLowerCase() === cleanToken.toLowerCase() && t.email.toLowerCase() === cleanEmail
    );

    if (!tokenObj) {
      logAuthEvent(
        'ADMIN_SETUP_LINK_REJECTED',
        cleanEmail,
        'FAILURE',
        `Setup validation rejected: Token mismatch or token not found for ${cleanEmail}.`
      );
      return {
        isValid: false,
        reason: 'NOT_FOUND' as const,
        message: 'Invalid or unrecognized setup link token for this email. Please check your invitation email.',
        admin,
      };
    }

    if (tokenObj.used) {
      logAuthEvent(
        'ADMIN_SETUP_LINK_REJECTED',
        cleanEmail,
        'SECURITY_ALERT',
        `Setup validation rejected: Token ${cleanToken} has already been used (single-use policy).`
      );
      return {
        isValid: false,
        reason: 'USED' as const,
        message: 'This setup link has already been used. For your security, setup links are strictly single-use.',
        admin,
        tokenObj,
      };
    }

    if (Date.now() > tokenObj.expiresAt) {
      logAuthEvent(
        'ADMIN_SETUP_LINK_REJECTED',
        cleanEmail,
        'FAILURE',
        `Setup validation rejected: Token ${cleanToken} has expired (15-minute limit exceeded).`
      );
      return {
        isValid: false,
        reason: 'EXPIRED' as const,
        message: 'This setup link has expired. The 15-minute security window has elapsed.',
        admin,
        tokenObj,
      };
    }

    logAuthEvent(
      'ADMIN_SETUP_LINK_VALIDATED',
      cleanEmail,
      'SUCCESS',
      `Secure single-use setup link verified successfully for ${cleanEmail}. Ready for password creation.`
    );

    return {
      isValid: true,
      message: 'Secure link and registered email verified successfully.',
      admin,
      tokenObj,
    };
  };

  const completeAdminSetup = async (
    email: string,
    token: string,
    newPassword: string,
    otpCode: string
  ): Promise<{ success: boolean; message: string; errors?: string[] }> => {
    const validation = validateAdminSetupToken(email, token);
    if (!validation.isValid || !validation.admin || !validation.tokenObj) {
      return { success: false, message: validation.message };
    }

    const admin = validation.admin;

    const pwdValidation = validatePassword(newPassword, {
      email: admin.email,
      name: admin.name,
      previousPasswords: admin.previousPasswords || [],
    });

    if (!pwdValidation.isValid) {
      logAuthEvent(
        'PASSWORD_CHANGE_FAILED',
        admin.email,
        'FAILURE',
        `Admin password creation rejected: ${pwdValidation.errors.join('; ')}`
      );
      return {
        success: false,
        message: pwdValidation.errors[0] || 'Password does not comply with CECAP security policy.',
        errors: pwdValidation.errors,
      };
    }

    if (!otpCode || otpCode.trim().length !== 6) {
      logAuthEvent(
        'MFA_FAILED',
        admin.email,
        'FAILURE',
        'Invalid 6-digit MFA verification code submitted during admin setup.'
      );
      return { success: false, message: 'Please enter a valid 6-digit MFA verification code.' };
    }

    // Mark token used
    setAdminSetupTokens(prev =>
      prev.map(t =>
        t.token === validation.tokenObj!.token
          ? { ...t, used: true, usedAt: new Date().toISOString() }
          : t
      )
    );

    // Transition status to Active
    const updatedAdmin: AdminStaffUser = {
      ...admin,
      status: 'Active',
      password: newPassword,
      passwordLastChanged: new Date().toISOString(),
      previousPasswords: [newPassword],
      mfaEnabled: true,
      setupTokenUsed: true,
      lastLogin: new Date().toLocaleString(),
    };

    setAdminStaffUsers(prev => prev.map(u => (u.id === admin.id ? updatedAdmin : u)));

    logAuthEvent(
      'ADMIN_PASSWORD_SETUP',
      admin.email,
      'SUCCESS',
      'Administrator initial password successfully established complying with CECAP 9+ char strict security policy.'
    );
    logAuthEvent(
      'ADMIN_MFA_SETUP_COMPLETED',
      admin.email,
      'SUCCESS',
      'Mandatory Multi-Factor Authentication (MFA) successfully verified and enabled for admin account.'
    );
    logAuthEvent(
      'ADMIN_ACCOUNT_ACTIVATED',
      admin.email,
      'SUCCESS',
      'Administrator account status changed from Pending to Active following verified password and MFA completion.'
    );

    sendEmail({
      to: admin.email,
      recipientName: admin.name,
      subject: '[CECAp Admin] Account Activated & Protected by MFA',
      sender: 'CECAp Admin Security <admin-security@clarkelectric.ph>',
      body: `Dear ${admin.name},

Congratulations! Your administrator account for Clark Electric Distribution Corporation (CEDC) has been successfully activated.

Activation Summary:
- Status: Active
- Authentication: 9+ Character Strong Password Policy Enforced
- Multi-Factor Authentication: Enabled (MFA Protected)
- Activation Date: ${new Date().toLocaleString()}

You can now log in to the CECAp Admin Console using your registered email and new password.

Thank you,
CECAP Systems Security Team`,
      type: 'ADMIN_ACTIVATED',
    });

    setToastMsg('🎉 Administrator account successfully activated and secured!');
    setTimeout(() => setToastMsg(null), 5000);

    return { success: true, message: 'Administrator account successfully activated!' };
  };

  const simulateExpireToken = (tokenString: string) => {
    setAdminSetupTokens(prev =>
      prev.map(t => (t.token === tokenString ? { ...t, expiresAt: Date.now() - 60000 } : t))
    );
    setToastMsg('⏱️ Simulated: Token set to expired.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const simulateUseToken = (tokenString: string) => {
    setAdminSetupTokens(prev =>
      prev.map(t => (t.token === tokenString ? { ...t, used: true, usedAt: new Date().toISOString() } : t))
    );
    setToastMsg('🔒 Simulated: Token marked as used.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const openAdminSetupFlow = (email?: string, token?: string) => {
    if (token) setActiveSetupToken(token);
    if (email) setAdminSetupEmailParam(email);
    setShowAdminSetupModal(true);
    setIsAuthenticated(false);
    setUserRole('admin');
    setActiveTab('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        userRole,
        setUserRole,
        adminUser,
        setAdminUser,
        user,
        setUser,
        selectedAccount,
        setSelectedAccount,
        linkedAccounts,
        activeTab,
        setActiveTab,
        notifications,
        setNotifications,
        unreadNotifCount,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        createAnnouncement,
        deleteAnnouncement,
        editAnnouncement,
        supportConcerns,
        addSupportConcern,
        updateSupportConcernStatus,
        biometricsEnabled,
        setBiometricsEnabled,
        notificationPreferences,
        setNotificationPreferences,
        viewMode,
        setViewMode,
        deviceFrame,
        setDeviceFrame,
        paymentModalOpen,
        setPaymentModalOpen,
        refreshAccountData,
        logout,
        biometricPromptOpen,
        setBiometricPromptOpen,
        biometricSuccessAction,
        triggerBiometricAuth,
        registrationRequests,
        submitRegistration,
        approveRegistration,
        rejectRegistration,

        // Email Hub
        sentEmails,
        sendEmail,
        emailModalOpen,
        setEmailModalOpen,
        selectedEmail,
        setSelectedEmail,
        toastMsg,
        setToastMsg,

        // Authentication Policy State & Helpers
        auditLogs,
        logAuthEvent,
        sessionTimeoutNotice,
        setSessionTimeoutNotice,
        passwordExpirationStatus,
        showPasswordChangeModal,
        setShowPasswordChangeModal,
        updateCustomerPassword,
        checkLockout,
        recordFailedAttempt,
        unlockAccount,

        // Admin Staff & First-Time Setup
        adminStaffUsers,
        setAdminStaffUsers,
        adminSetupTokens,
        activeSetupToken,
        setActiveSetupToken,
        adminSetupEmailParam,
        setAdminSetupEmailParam,
        showAdminSetupModal,
        setShowAdminSetupModal,
        createAdminStaffUser,
        updateAdminStaffUser,
        resendAdminSetupEmail,
        validateAdminSetupToken,
        completeAdminSetup,
        simulateExpireToken,
        simulateUseToken,
        openAdminSetupFlow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

