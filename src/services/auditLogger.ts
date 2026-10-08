import { AuthAuditEvent } from '../types';

const AUDIT_STORAGE_KEY = 'cecap_auth_audit_logs';

const INITIAL_AUDIT_LOGS: AuthAuditEvent[] = [
  {
    id: 'AUD-2026-9041',
    timestamp: 'Aug 05, 2026, 09:30:15 AM',
    isoDate: new Date(Date.now() - 3600000 * 4).toISOString(),
    eventType: 'LOGIN_SUCCESS',
    accountIdentifier: '0421-8812-90',
    status: 'SUCCESS',
    details: 'Customer authenticated successfully via credentials & SMS MFA verification.',
    ipAddress: '120.28.184.21 (CFZ Fiber Gateway)',
    userAgent: 'CECAp Mobile / Chrome 124.0 (Android 14)',
  },
  {
    id: 'AUD-2026-9040',
    timestamp: 'Aug 05, 2026, 09:29:45 AM',
    isoDate: new Date(Date.now() - 3600000 * 4 - 30000).toISOString(),
    eventType: 'MFA_VERIFIED',
    accountIdentifier: '0421-8812-90',
    status: 'SUCCESS',
    details: 'One-Time Password (OTP) 6-digit token verified for customer login.',
    ipAddress: '120.28.184.21 (CFZ Fiber Gateway)',
    userAgent: 'CECAp Mobile / Chrome 124.0 (Android 14)',
  },
  {
    id: 'AUD-2026-9039',
    timestamp: 'Aug 05, 2026, 09:29:20 AM',
    isoDate: new Date(Date.now() - 3600000 * 4 - 55000).toISOString(),
    eventType: 'MFA_REQUESTED',
    accountIdentifier: '0421-8812-90',
    status: 'SUCCESS',
    details: 'MFA OTP dispatched to registered mobile (+63 917 *** 1234) and email.',
    ipAddress: '120.28.184.21 (CFZ Fiber Gateway)',
    userAgent: 'CECAp Mobile / Chrome 124.0 (Android 14)',
  },
  {
    id: 'AUD-2026-9038',
    timestamp: 'Aug 04, 2026, 04:15:10 PM',
    isoDate: new Date(Date.now() - 86400000).toISOString(),
    eventType: 'PASSWORD_EXPIRATION_WARNING',
    accountIdentifier: '0421-8812-90',
    status: 'WARNING',
    details: 'Automated 7-day password expiration advisory triggered. Expiration in 7 days.',
    ipAddress: 'CEDC Security Engine (Internal)',
    userAgent: 'Cron/AuthPolicyDaemon-1.0',
  },
  {
    id: 'AUD-2026-9037',
    timestamp: 'Aug 03, 2026, 02:22:00 PM',
    isoDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    eventType: 'LOGIN_FAILED',
    accountIdentifier: '0421-9943-11',
    status: 'FAILURE',
    details: 'Invalid password attempt recorded (1/5).',
    ipAddress: '49.145.72.10 (Philexcel Network)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64)',
  },
];

type AuditListener = (logs: AuthAuditEvent[]) => void;
const listeners: Set<AuditListener> = new Set();

export function getAuditLogs(): AuthAuditEvent[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function logAuditEvent(
  eventType: AuthAuditEvent['eventType'],
  accountIdentifier: string,
  status: AuthAuditEvent['status'],
  details: string,
  customIp?: string
): AuthAuditEvent {
  const now = new Date();
  const newEvent: AuthAuditEvent = {
    id: `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: now.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }),
    isoDate: now.toISOString(),
    eventType,
    accountIdentifier,
    status,
    details,
    ipAddress: customIp || '120.28.184.21 (Clark Freeport Zone)',
    userAgent: navigator.userAgent || 'CECAp Customer App / Client Browser',
  };

  try {
    const existing = getAuditLogs();
    const updated = [newEvent, ...existing].slice(0, 100); // Keep last 100 logs
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    listeners.forEach(fn => fn(updated));
  } catch (err) {
    console.warn('Failed to persist audit log:', err);
  }

  return newEvent;
}

export function subscribeToAuditLogs(callback: AuditListener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
