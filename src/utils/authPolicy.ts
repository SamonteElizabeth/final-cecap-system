/**
 * CECAP Customer App Authentication Policy Enforcement
 *
 * Rules:
 * 1. Password:
 *    - Minimum 9 characters
 *    - Must contain uppercase, lowercase, number, and special character
 *    - Reject blank/null
 *    - Reject username-containing (account number, user name tokens, email handle)
 *    - Reject repetitive characters (3+ consecutive identical chars)
 *    - Reject common patterns (sequential characters like 123456, abcdef, qwerty)
 *    - Reject commonly used passwords (dictionary blacklist)
 * 2. Expiration:
 *    - Expires every 30 days
 *    - Notify customers 7 days before expiration
 *    - Prevent reuse of last 5 passwords
 * 3. Login Security:
 *    - Lock account for 30 minutes after 5 consecutive failed login attempts
 *    - Appropriate lockout message with remaining time
 * 4. Session:
 *    - Inactivity timeout: 15 minutes
 * 5. MFA/OTP:
 *    - Require 6-digit MFA/OTP after successful username/password validation
 * 6. Consistency:
 *    - Applied to registration, login, password change, forgot password, account recovery
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  rules: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
    notUsername: boolean;
    notRepetitive: boolean;
    notCommonPattern: boolean;
    notCommonlyUsed: boolean;
    notReused: boolean;
  };
}

export interface PasswordPolicyUserContext {
  accountNumber?: string;
  name?: string;
  email?: string;
  username?: string;
  previousPasswords?: string[];
}

export const COMMONLY_USED_PASSWORDS_BLACKLIST = new Set([
  'password',
  'password123',
  'password123!',
  'password1234!',
  'p@ssw0rd',
  'p@ssword',
  'p@ssw0rd1',
  'p@ssword1!',
  'p@ssw0rd123!',
  'admin123',
  'admin1234',
  'admin123!',
  'admin1234!',
  'welcome1',
  'welcome1!',
  'welcome123',
  'welcome123!',
  '123456789',
  '1234567890',
  '123456789!a',
  '123456789!aa',
  'qwerty12345',
  'qwerty123!',
  'letmein123',
  'letmein123!',
  'changeme1',
  'changeme123',
  'changeme123!',
  'clarkelectric',
  'clarkelectric1!',
  'cecap1234!',
  'cedc12345!',
  'temporary1!',
  'default123!',
  'iloveyou123!',
  'summer2026!',
  'winter2026!',
  'spring2026!',
]);

const SEQUENTIAL_PATTERNS = [
  '0123', '1234', '2345', '3456', '4567', '5678', '6789', '7890',
  '0987', '9876', '8765', '7654', '6543', '5432', '4321', '3210',
  'abcd', 'bcde', 'cdef', 'defg', 'efgh', 'fghi', 'ghij', 'hijk', 'ijkl', 'jklm',
  'fedc', 'edcb', 'dcba', 'cba9', 'gfed', 'hgfe', 'ihgf', 'jihg',
  'qwerty', 'asdfgh', 'zxcvbn', 'qwert', 'asdfg', 'zxcvb',
];

/**
 * Check if string has sequential arithmetic or alphabetical runs of length 4+
 */
function hasSequentialRun(str: string): boolean {
  const lower = str.toLowerCase();
  for (let i = 0; i < lower.length - 3; i++) {
    const c1 = lower.charCodeAt(i);
    const c2 = lower.charCodeAt(i + 1);
    const c3 = lower.charCodeAt(i + 2);
    const c4 = lower.charCodeAt(i + 3);

    // Ascending run (e.g. 1234, abcd)
    if (c2 === c1 + 1 && c3 === c2 + 1 && c4 === c3 + 1) {
      return true;
    }
    // Descending run (e.g. 4321, dcba)
    if (c2 === c1 - 1 && c3 === c2 - 1 && c4 === c3 - 1) {
      return true;
    }
  }
  return false;
}

/**
 * Normalize leetspeak substitutions to root words
 */
function normalizeLeetspeak(str: string): string {
  return str
    .toLowerCase()
    .replace(/@/g, 'a')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/\$/g, 's')
    .replace(/!/g, 'i');
}

/**
 * Validate password against CECAP Authentication Policy
 */
export function validatePassword(
  password: string,
  userContext?: PasswordPolicyUserContext
): PasswordValidationResult {
  const errors: string[] = [];

  // 1. Blank / Null / Whitespace
  if (!password || !password.trim()) {
    return {
      isValid: false,
      errors: ['Password cannot be blank or contain only whitespace.'],
      rules: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
        notUsername: true,
        notRepetitive: true,
        notCommonPattern: true,
        notCommonlyUsed: true,
        notReused: true,
      },
    };
  }

  const trimmed = password.trim();

  // Rule 1: Minimum 9 characters
  const lengthMet = trimmed.length >= 9;
  if (!lengthMet) {
    errors.push('Password must be at least 9 characters long.');
  }

  // Rule 2: Uppercase letter
  const uppercaseMet = /[A-Z]/.test(trimmed);
  if (!uppercaseMet) {
    errors.push('Password must include at least one uppercase letter (A-Z).');
  }

  // Rule 3: Lowercase letter
  const lowercaseMet = /[a-z]/.test(trimmed);
  if (!lowercaseMet) {
    errors.push('Password must include at least one lowercase letter (a-z).');
  }

  // Rule 4: Number
  const numberMet = /[0-9]/.test(trimmed);
  if (!numberMet) {
    errors.push('Password must include at least one number (0-9).');
  }

  // Rule 5: Special character
  const specialCharMet = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(trimmed);
  if (!specialCharMet) {
    errors.push('Password must include at least one special character (e.g. !@#$%^&*).');
  }

  // Rule 6: Reject username / account-code containing
  let notUsernameMet = true;
  if (userContext) {
    const lowerPass = trimmed.toLowerCase();
    const disallowedTokens: string[] = [];

    if (userContext.accountNumber) {
      const cleanAcc = userContext.accountNumber.replace(/\D/g, '');
      if (cleanAcc.length >= 4) disallowedTokens.push(cleanAcc);
      disallowedTokens.push(userContext.accountNumber.toLowerCase());
    }

    if (userContext.username) {
      if (userContext.username.length >= 3) disallowedTokens.push(userContext.username.toLowerCase());
    }

    if (userContext.email) {
      const emailHandle = userContext.email.split('@')[0].toLowerCase();
      if (emailHandle.length >= 3) {
        disallowedTokens.push(emailHandle);
        emailHandle.split(/[._-]/).forEach(part => {
          if (part.length >= 3) disallowedTokens.push(part);
        });
      }
    }

    if (userContext.name) {
      const nameParts = userContext.name.toLowerCase().split(/\s+/).filter(p => p.length >= 3);
      disallowedTokens.push(...nameParts);
    }

    for (const token of disallowedTokens) {
      if (token && lowerPass.includes(token)) {
        notUsernameMet = false;
        errors.push('Password must not contain your username, name, email handle, or account number.');
        break;
      }
    }
  }

  // Rule 7: Reject repetitive characters (3+ consecutive identical characters or repeated sequences)
  const hasRepetitiveConsecutive = /(.)\1{2,}/.test(trimmed);
  const hasRepeatedSequence = /(.{2,4})\1{2,}/.test(trimmed);
  const notRepetitiveMet = !hasRepetitiveConsecutive && !hasRepeatedSequence;
  if (!notRepetitiveMet) {
    errors.push('Password must not contain repetitive characters or repeated sequences (e.g. "aaa", "111", "ababab").');
  }

  // Rule 8: Reject common patterns (sequential letters, sequential numbers, or keyboard rows)
  const lowerTrimmed = trimmed.toLowerCase();
  let hasCommonPattern = hasSequentialRun(lowerTrimmed);
  if (!hasCommonPattern) {
    for (const seq of SEQUENTIAL_PATTERNS) {
      if (lowerTrimmed.includes(seq)) {
        hasCommonPattern = true;
        break;
      }
    }
  }
  const notCommonPatternMet = !hasCommonPattern;
  if (!notCommonPatternMet) {
    errors.push('Password must not contain sequential patterns or keyboard rows (e.g., "1234", "abcd", "qwerty").');
  }

  // Rule 9: Reject commonly used passwords (dictionary blacklist & leetspeak variations)
  const isDirectlyCommon = COMMONLY_USED_PASSWORDS_BLACKLIST.has(lowerTrimmed);
  const normalized = normalizeLeetspeak(lowerTrimmed);
  const containsCommonRoot =
    normalized.includes('password') ||
    normalized.includes('welcome') ||
    normalized.includes('letmein') ||
    normalized.includes('changeme') ||
    normalized.includes('clarkelectric') ||
    normalized.includes('cecap') ||
    normalized.includes('cedc') ||
    normalized.includes('default123') ||
    normalized.includes('temporary1');

  const notCommonlyUsedMet = !isDirectlyCommon && !containsCommonRoot;
  if (!notCommonlyUsedMet) {
    errors.push('Password is too common or easily guessable. Please choose a more distinctive password.');
  }

  // Rule 10: Prevent reuse of the last 5 passwords
  let notReusedMet = true;
  if (userContext?.previousPasswords && Array.isArray(userContext.previousPasswords)) {
    const last5 = userContext.previousPasswords.slice(-5);
    if (last5.some(prev => prev && prev.toLowerCase() === lowerTrimmed)) {
      notReusedMet = false;
      errors.push('You cannot reuse any of your last 5 passwords according to CECAP security policy.');
    }
  }

  const isValid =
    lengthMet &&
    uppercaseMet &&
    lowercaseMet &&
    numberMet &&
    specialCharMet &&
    notUsernameMet &&
    notRepetitiveMet &&
    notCommonPatternMet &&
    notCommonlyUsedMet &&
    notReusedMet;

  return {
    isValid,
    errors,
    rules: {
      length: lengthMet,
      uppercase: uppercaseMet,
      lowercase: lowercaseMet,
      number: numberMet,
      specialChar: specialCharMet,
      notUsername: notUsernameMet,
      notRepetitive: notRepetitiveMet,
      notCommonPattern: notCommonPatternMet,
      notCommonlyUsed: notCommonlyUsedMet,
      notReused: notReusedMet,
    },
  };
}

// -------------------------------------------------------------
// Expiration Policy (30 Days, Notify 7 Days Before)
// -------------------------------------------------------------
export const PASSWORD_EXPIRATION_DAYS = 30;
export const PASSWORD_EXPIRATION_WARNING_DAYS = 7;

export interface PasswordExpirationStatus {
  isExpired: boolean;
  daysRemaining: number;
  shouldNotify: boolean;
  expirationDate: Date;
  daysSinceChanged: number;
}

export function checkPasswordExpiration(passwordLastChanged?: string): PasswordExpirationStatus {
  // If not set, assume set 10 days ago for realistic demo testing
  const lastChangedDate = passwordLastChanged
    ? new Date(passwordLastChanged)
    : new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

  const now = new Date();
  const msPassed = now.getTime() - lastChangedDate.getTime();
  const daysSinceChanged = Math.floor(msPassed / (1000 * 60 * 60 * 24));
  const daysRemaining = PASSWORD_EXPIRATION_DAYS - daysSinceChanged;

  const isExpired = daysRemaining <= 0;
  const shouldNotify = daysRemaining <= PASSWORD_EXPIRATION_WARNING_DAYS && daysRemaining > 0;

  const expirationDate = new Date(lastChangedDate.getTime() + PASSWORD_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

  return {
    isExpired,
    daysRemaining: Math.max(0, daysRemaining),
    shouldNotify,
    expirationDate,
    daysSinceChanged,
  };
}

// -------------------------------------------------------------
// Account Lockout Policy (5 failed attempts -> 30 mins lock)
// -------------------------------------------------------------
export const MAX_CONSECUTIVE_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export interface LockoutStatus {
  isLocked: boolean;
  failedAttempts: number;
  lockoutRemainingMs: number;
  lockoutRemainingMinutes: number;
  lockedUntil: number | null;
  lockoutMessage: string | null;
}

const LOCKOUT_STORAGE_PREFIX = 'cecap_auth_lockout_';

export function getAccountLockoutStatus(identifier: string): LockoutStatus {
  if (!identifier) {
    return {
      isLocked: false,
      failedAttempts: 0,
      lockoutRemainingMs: 0,
      lockoutRemainingMinutes: 0,
      lockedUntil: null,
      lockoutMessage: null,
    };
  }

  const key = `${LOCKOUT_STORAGE_PREFIX}${identifier.trim().toLowerCase()}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return {
        isLocked: false,
        failedAttempts: 0,
        lockoutRemainingMs: 0,
        lockoutRemainingMinutes: 0,
        lockedUntil: null,
        lockoutMessage: null,
      };
    }

    const data = JSON.parse(raw);
    const now = Date.now();

    if (data.lockedUntil && data.lockedUntil > now) {
      const remainingMs = data.lockedUntil - now;
      const remainingMins = Math.ceil(remainingMs / (60 * 1000));
      const unlockTimeStr = new Date(data.lockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        isLocked: true,
        failedAttempts: data.failedAttempts || MAX_CONSECUTIVE_FAILED_ATTEMPTS,
        lockoutRemainingMs: remainingMs,
        lockoutRemainingMinutes: remainingMins,
        lockedUntil: data.lockedUntil,
        lockoutMessage: `Account locked due to 5 consecutive failed login attempts. For security, please try again in ${remainingMins} minute${remainingMins === 1 ? '' : 's'} (at ${unlockTimeStr}) or use Account Recovery.`,
      };
    } else if (data.lockedUntil && data.lockedUntil <= now) {
      // Lockout expired, reset state
      localStorage.removeItem(key);
      return {
        isLocked: false,
        failedAttempts: 0,
        lockoutRemainingMs: 0,
        lockoutRemainingMinutes: 0,
        lockedUntil: null,
        lockoutMessage: null,
      };
    }

    return {
      isLocked: false,
      failedAttempts: data.failedAttempts || 0,
      lockoutRemainingMs: 0,
      lockoutRemainingMinutes: 0,
      lockedUntil: null,
      lockoutMessage: null,
    };
  } catch {
    return {
      isLocked: false,
      failedAttempts: 0,
      lockoutRemainingMs: 0,
      lockoutRemainingMinutes: 0,
      lockedUntil: null,
      lockoutMessage: null,
    };
  }
}

export function recordFailedLoginAttempt(identifier: string): LockoutStatus {
  const key = `${LOCKOUT_STORAGE_PREFIX}${identifier.trim().toLowerCase()}`;
  let currentAttempts = 0;

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      currentAttempts = parsed.failedAttempts || 0;
    }
  } catch {
    currentAttempts = 0;
  }

  currentAttempts += 1;
  const now = Date.now();

  if (currentAttempts >= MAX_CONSECUTIVE_FAILED_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_DURATION_MS;
    const lockoutData = {
      failedAttempts: currentAttempts,
      lockedUntil,
      lockedAt: now,
    };
    try {
      localStorage.setItem(key, JSON.stringify(lockoutData));
    } catch {
      // ignore
    }

    const unlockTimeStr = new Date(lockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      isLocked: true,
      failedAttempts: currentAttempts,
      lockoutRemainingMs: LOCKOUT_DURATION_MS,
      lockoutRemainingMinutes: 30,
      lockedUntil,
      lockoutMessage: `Account locked due to 5 consecutive failed login attempts. For security, please try again in 30 minutes (at ${unlockTimeStr}) or use Account Recovery.`,
    };
  } else {
    try {
      localStorage.setItem(key, JSON.stringify({ failedAttempts: currentAttempts, lockedUntil: null }));
    } catch {
      // ignore
    }

    const attemptsLeft = MAX_CONSECUTIVE_FAILED_ATTEMPTS - currentAttempts;
    return {
      isLocked: false,
      failedAttempts: currentAttempts,
      lockoutRemainingMs: 0,
      lockoutRemainingMinutes: 0,
      lockedUntil: null,
      lockoutMessage: `Invalid credentials. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining before 30-minute account lockout.`,
    };
  }
}

export function resetAccountFailedAttempts(identifier: string): void {
  const key = `${LOCKOUT_STORAGE_PREFIX}${identifier.trim().toLowerCase()}`;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// -------------------------------------------------------------
// Inactivity Session Timeout Policy (15 Minutes)
// -------------------------------------------------------------
export const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
