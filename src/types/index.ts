export type UserRole = 'customer' | 'admin' | 'support_staff';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'support_staff';
  department: string;
  title: string;
  avatarUrl?: string;
}

export interface Customer {
  id: string;
  accountNumber: string; // Master Primary Account
  name: string;
  email: string;
  mobileNumber: string;
  serviceAddress: string;
  serviceType: 'Residential' | 'Commercial' | 'Industrial';
  meterNumber: string;
  linkedAccounts: ServiceAccount[];
  biometricsEnabled: boolean;
  registeredDate: string;
  isFirstLogin?: boolean;
  tempPassword?: string;
  currentPassword?: string;
  passwordLastChanged?: string; // ISO date string of last password change
  previousPasswords?: string[]; // Last 5 passwords for reuse prevention
  failedLoginAttempts?: number;
  lockedUntil?: number | null; // Timestamp until when account is locked
  status?: 'Active' | 'Pending' | 'Suspended';
}

export interface ServiceAccount {
  accountNumber: string;
  nickname: string;
  accountHolderName?: string;
  serviceAddress: string;
  meterNumber: string;
  serviceType: 'Residential' | 'Commercial' | 'Industrial';
  isPrimary: boolean;
  currentBill: Bill;
}

export interface BillBreakdownItem {
  category: string;
  description: string;
  amount: number;
  ratePerKwh?: number;
}

export interface Bill {
  billNumber: string;
  accountNumber: string;
  billingPeriod: string;
  dueDate: string;
  amountDue: number;
  previousBalance: number;
  totalAmountDue: number;
  status: 'Unpaid' | 'Paid' | 'Partially Paid' | 'Overdue';
  amountPaid: number;
  kwhConsumed: number;
  peakKw: number;
  billingDate: string;
  breakdown: BillBreakdownItem[];
}

export interface BillingHistoryItem {
  id: string;
  billNumber: string;
  accountNumber: string;
  billingPeriod: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  remainingBalance: number;
  status: 'Paid' | 'Partially Paid' | 'Unpaid' | 'Overdue';
  paymentDate?: string;
  paymentMethod?: string;
  receiptNumber?: string;
}

export interface ConsumptionData {
  month: string;
  year: number;
  kwh: number;
  peakKw: number;
  amount: number;
  averageTemperatureC?: number;
}

export interface PaymentRequest {
  accountNumber: string;
  billNumber: string;
  amount: number;
  paymentType: 'FULL' | 'PARTIAL';
  channel: 'GCash' | 'Maya' | 'ECPay';
  customerMobile: string;
  customerEmail: string;
}

export interface PaymentReceipt {
  transactionId: string;
  referenceNumber: string;
  accountNumber: string;
  billNumber: string;
  amountPaid: number;
  paymentChannel: 'GCash' | 'Maya' | 'ECPay';
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  remainingBalance: number;
  gatewayRef: string;
}

export interface SupportConcern {
  id: string;
  accountNumber: string;
  category: 'Billing Concern' | 'Service Complaint' | 'Payment Concern' | 'Meter Concern' | 'Power Outage' | 'Others';
  subject: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Solved' | 'Submitted' | 'Resolved' | 'Closed';
  createdAt: string;
  attachmentName?: string;
  ticketNumber: string;
  adminResponse?: string;
  adminRespondedAt?: string;
  adminName?: string;
  assignedStaff?: string;
  completionDate?: string;
  customerName?: string;
  customerAddress?: string;
  serviceType?: 'Residential' | 'Commercial' | 'Industrial' | string;
}

export interface NotificationItem {
  id: string;
  type: 'OUTAGE_EMERGENCY' | 'OUTAGE_SCHEDULED' | 'DUE_DATE_REMINDER' | 'PAYMENT_CONFIRMATION' | 'ANNOUNCEMENT' | 'PROMOTION';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  accountNumber?: string;
  targetAudience?: 'ALL' | 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
  urgency?: 'NORMAL' | 'HIGH' | 'EMERGENCY';
  authorName?: string;
  createdByAdmin?: boolean;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface NotificationPreferences {
  push: boolean;
  sms: boolean;
  email: boolean;
  dueDateReminders: boolean;
  outageAlerts: boolean;
  promotions: boolean;
}

export interface AdminSetupToken {
  token: string;
  email: string;
  adminId: string;
  adminName: string;
  createdAt: string;
  expiresAt: number; // timestamp in ms (e.g. 15 minutes)
  used: boolean;
  usedAt?: string;
}

export interface AdminStaffUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Super Admin' | 'Support Staff' | 'Operations Lead' | 'Customer Care Agent' | 'Billing Specialist' | 'Field Tech Lead';
  department?: string;
  status: 'Active' | 'Pending' | 'Suspended' | 'Inactive';
  lastLogin: string;
  avatarUrl?: string;
  password?: string;
  passwordLastChanged?: string;
  previousPasswords?: string[];
  mfaEnabled?: boolean;
  setupToken?: string;
  setupTokenExpiresAt?: number;
  setupTokenUsed?: boolean;
  permissions: {
    analytics: boolean;
    customers: boolean;
    support: boolean;
    advisories: boolean;
    payments: boolean;
    maintenance: boolean;
    userManagement: boolean;
  };
}

export interface PaymentTransactionRecord {
  id: string;
  transactionRef: string;
  customerName: string;
  accountNumber: string;
  amountPaid: number;
  paymentChannel: 'GCash' | 'Maya' | 'ECPay' | 'Bank Transfer' | 'Over-the-Counter';
  paymentDate: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  gatewayRef: string;
  billNumber: string;
}

export interface OutageAdvisoryItem {
  id: string;
  referenceNo: string;
  title: string;
  affectedAreas: string[];
  scheduleStart: string;
  scheduleEnd: string;
  reason: string;
  status: 'Draft' | 'Published' | 'Scheduled' | 'Resolved';
  urgency: 'NORMAL' | 'HIGH' | 'EMERGENCY';
  targetAudience: 'ALL' | 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
  updatedAt: string;
  author: string;
}

export interface SelfServiceGuideItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  readTime: string;
  status: 'Published' | 'Draft';
  updatedAt: string;
  viewsCount: number;
  imageUrl?: string;
}

export interface MasterCategoryItem {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  itemCount?: number;
  slaHours?: number;
}

export interface MatchingBillingRecord {
  accountNumber: string;
  customerName: string;
  serviceAddress: string;
  mobileNumber: string;
  email: string;
  meterNumber: string;
  serviceType: 'Residential' | 'Commercial' | 'Industrial';
  accountStatus: 'Active' | 'Inactive';
  matchConfidence: number; // percentage match e.g. 95%
}

export interface RegistrationRequest {
  id: string;
  fullName: string;
  serviceAddress: string;
  mobileNumber: string;
  email: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  accountCode?: string;
  tempPassword?: string;
  rejectionReason?: string;
  notificationChannel: 'Email' | 'SMS';
  matchingBillingRecord?: MatchingBillingRecord;
}

export interface SentEmail {
  id: string;
  to: string;
  recipientName: string;
  subject: string;
  sender: string;
  body: string;
  sentAt: string;
  type:
    | 'REGISTRATION_RECEIVED'
    | 'REGISTRATION_APPROVED'
    | 'REGISTRATION_REJECTED'
    | 'OTP_CODE'
    | 'PASSWORD_RESET'
    | 'ADMIN_SETUP_INVITE'
    | 'ADMIN_MFA_SETUP'
    | 'ADMIN_ACTIVATED'
    | 'GENERAL';
  status: 'DELIVERED' | 'SENT';
  data?: {
    accountCode?: string;
    tempPassword?: string;
    otpCode?: string;
    requestId?: string;
    rejectionReason?: string;
    setupToken?: string;
    setupUrl?: string;
    adminEmail?: string;
    adminName?: string;
    expiresAt?: number;
  };
}

export interface AuthAuditEvent {
  id: string;
  timestamp: string;
  isoDate: string;
  eventType:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'ACCOUNT_LOCKED'
    | 'ACCOUNT_UNLOCKED'
    | 'MFA_REQUESTED'
    | 'MFA_VERIFIED'
    | 'MFA_FAILED'
    | 'PASSWORD_CHANGED'
    | 'PASSWORD_CHANGE_FAILED'
    | 'PASSWORD_EXPIRED'
    | 'PASSWORD_EXPIRATION_WARNING'
    | 'SESSION_TIMEOUT'
    | 'LOGOUT'
    | 'FORGOT_PASSWORD_REQUEST'
    | 'ACCOUNT_RECOVERY'
    | 'ADMIN_INVITE_DISPATCHED'
    | 'ADMIN_SETUP_LINK_VALIDATED'
    | 'ADMIN_SETUP_LINK_REJECTED'
    | 'ADMIN_SETUP_RESENT'
    | 'ADMIN_PASSWORD_SETUP'
    | 'ADMIN_MFA_SETUP_REQUESTED'
    | 'ADMIN_MFA_SETUP_COMPLETED'
    | 'ADMIN_ACCOUNT_ACTIVATED';
  accountIdentifier: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING' | 'SECURITY_ALERT';
  details: string;
  ipAddress?: string;
  userAgent?: string;
}




