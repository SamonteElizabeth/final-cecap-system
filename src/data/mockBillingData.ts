import { Customer, Bill, BillingHistoryItem, ConsumptionData, FAQItem, NotificationItem, RegistrationRequest, ServiceAccount, BillBreakdownItem } from '../types';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001928',
    accountNumber: '0421-8812-90',
    username: 'juan.delacruz',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@example.ph',
    mobileNumber: '+63 917 555 1234',
    serviceAddress: 'Block 12 Lot 5, Berthaphil Industrial Park, Clark Freeport Zone, Pampanga',
    serviceType: 'Residential',
    meterNumber: 'MTR-2024-99182',
    biometricsEnabled: true,
    registeredDate: '2023-01-15',
    currentPassword: 'Cedc@2026!',
    passwordLastChanged: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(), // 23 days ago, exactly 7 days remaining before 30-day expiration!
    previousPasswords: [
      'ClarkTemp#101',
      'ClarkP@ss2024',
      'ClarkPower#25',
      'ClarkGrid#99',
      'Clark2025!Sec',
    ],
    failedLoginAttempts: 0,
    lockedUntil: null,
    linkedAccounts: [
      {
        accountNumber: '0421-8812-90',
        nickname: 'Main Residence - Berthaphil',
        serviceAddress: 'Block 12 Lot 5, Berthaphil Industrial Park, Clark Freeport Zone, Pampanga',
        meterNumber: 'MTR-2024-99182',
        serviceType: 'Residential',
        isPrimary: true,
        currentBill: {
          billNumber: 'BILL-2026-07-04218812',
          accountNumber: '0421-8812-90',
          billingPeriod: 'June 16, 2026 - July 15, 2026',
          dueDate: 'August 12, 2026',
          amountDue: 4850.75,
          previousBalance: 0.0,
          totalAmountDue: 4850.75,
          status: 'Unpaid',
          amountPaid: 0,
          kwhConsumed: 385,
          peakKw: 4.2,
          billingDate: 'July 18, 2026',
          breakdown: [
            { category: 'Generation Charge', description: 'Power supplier generation cost', amount: 2695.0, ratePerKwh: 7.0 },
            { category: 'Transmission Charge', description: 'NGCP high-voltage grid transmission', amount: 539.0, ratePerKwh: 1.4 },
            { category: 'Distribution System', description: 'CEDC wires, transformers, & meters operation', amount: 847.0, ratePerKwh: 2.2 },
            { category: 'System Loss Charge', description: 'Technical & non-technical losses allowed by ERC', amount: 231.0, ratePerKwh: 0.6 },
            { category: 'Subsidies & Universal Charge', description: 'Lifeline subsidy, Missionary, & Environmental', amount: 154.0, ratePerKwh: 0.4 },
            { category: 'Government Taxes', description: 'VAT (12%) & Local Franchise Tax', amount: 384.75 },
          ],
        },
      },
      {
        accountNumber: '0421-9943-11',
        nickname: 'Clark Logistics Office',
        serviceAddress: 'Unit 402 Philexcel Business Park, Clark Freeport Zone, Pampanga',
        meterNumber: 'MTR-2025-44012',
        serviceType: 'Commercial',
        isPrimary: false,
        currentBill: {
          billNumber: 'BILL-2026-07-04219943',
          accountNumber: '0421-9943-11',
          billingPeriod: 'June 16, 2026 - July 15, 2026',
          dueDate: 'August 15, 2026',
          amountDue: 18420.50,
          previousBalance: 0.0,
          totalAmountDue: 18420.50,
          status: 'Unpaid',
          amountPaid: 0,
          kwhConsumed: 1450,
          peakKw: 18.5,
          billingDate: 'July 18, 2026',
          breakdown: [
            { category: 'Generation Charge', description: 'Commercial bulk supply generation cost', amount: 10150.0, ratePerKwh: 7.0 },
            { category: 'Transmission Charge', description: 'NGCP transmission charge', amount: 2030.0, ratePerKwh: 1.4 },
            { category: 'Distribution System', description: 'CEDC commercial distribution', amount: 3190.0, ratePerKwh: 2.2 },
            { category: 'System Loss Charge', description: 'Distribution system loss', amount: 870.0, ratePerKwh: 0.6 },
            { category: 'Universal & FIT-All', description: 'Government mandated universal charges', amount: 580.0, ratePerKwh: 0.4 },
            { category: 'Government Taxes', description: 'VAT (12%) & Local Franchise Tax', amount: 1600.50 },
          ],
        },
      },
    ],
  },
];

export const MOCK_BILLING_HISTORY: Record<string, BillingHistoryItem[]> = {
  '0421-8812-90': [
    {
      id: 'HIST-001',
      billNumber: 'BILL-2026-06-04218812',
      accountNumber: '0421-8812-90',
      billingPeriod: 'May 16 - Jun 15, 2026',
      dueDate: 'July 12, 2026',
      amount: 4520.0,
      amountPaid: 4520.0,
      remainingBalance: 0,
      status: 'Paid',
      paymentDate: 'July 05, 2026',
      paymentMethod: 'GCash',
      receiptNumber: 'OR-2026-881023',
    },
    {
      id: 'HIST-002',
      billNumber: 'BILL-2026-05-04218812',
      accountNumber: '0421-8812-90',
      billingPeriod: 'Apr 16 - May 15, 2026',
      dueDate: 'June 12, 2026',
      amount: 5100.25,
      amountPaid: 5100.25,
      remainingBalance: 0,
      status: 'Paid',
      paymentDate: 'June 10, 2026',
      paymentMethod: 'Maya',
      receiptNumber: 'OR-2026-765109',
    },
    {
      id: 'HIST-003',
      billNumber: 'BILL-2026-04-04218812',
      accountNumber: '0421-8812-90',
      billingPeriod: 'Mar 16 - Apr 15, 2026',
      dueDate: 'May 12, 2026',
      amount: 4210.80,
      amountPaid: 4210.80,
      remainingBalance: 0,
      status: 'Paid',
      paymentDate: 'May 08, 2026',
      paymentMethod: 'ECPay',
      receiptNumber: 'OR-2026-610294',
    },
    {
      id: 'HIST-004',
      billNumber: 'BILL-2026-03-04218812',
      accountNumber: '0421-8812-90',
      billingPeriod: 'Feb 16 - Mar 15, 2026',
      dueDate: 'April 12, 2026',
      amount: 3950.0,
      amountPaid: 3950.0,
      remainingBalance: 0,
      status: 'Paid',
      paymentDate: 'April 09, 2026',
      paymentMethod: 'GCash',
      receiptNumber: 'OR-2026-512048',
    },
  ],
};

// Seasonal mock usage: hot dry months (Apr–May) peak, cooler months dip, small year-on-year growth
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SEASONAL_FACTOR = [0.92, 0.88, 0.97, 1.15, 1.12, 1.06, 1.04, 1.0, 0.96, 0.93, 0.9, 1.05];
const MONTHLY_TEMP_C = [26, 27, 29, 33, 32, 31, 30, 29, 28, 28, 27, 26];

const buildConsumption = (
  baseKwh: number,
  basePeakKw: number,
  ratePerKwh: number,
  years: number[],
  withTemperature = false
): ConsumptionData[] =>
  years.flatMap((year, yi) =>
    MONTHS.map((month, mi) => {
      const variation = (((mi * 7 + yi * 3) % 5) - 2) * 0.012;
      const kwh = Math.round(baseKwh * SEASONAL_FACTOR[mi] * Math.pow(1.03, yi) * (1 + variation));
      return {
        month,
        year,
        kwh,
        peakKw: Math.round(basePeakKw * (kwh / baseKwh) * 10) / 10,
        amount: Math.round(kwh * ratePerKwh * 100) / 100,
        ...(withTemperature ? { averageTemperatureC: MONTHLY_TEMP_C[mi] } : {}),
      };
    })
  );

export const MOCK_CONSUMPTION_HISTORY: Record<string, ConsumptionData[]> = {
  '0421-8812-90': [
    ...buildConsumption(320, 3.6, 12.6, [2024], true),
    { month: 'Jan', year: 2025, kwh: 310, peakKw: 3.5, amount: 3950.0, averageTemperatureC: 26 },
    { month: 'Feb', year: 2025, kwh: 300, peakKw: 3.4, amount: 3820.0, averageTemperatureC: 27 },
    { month: 'Mar', year: 2025, kwh: 320, peakKw: 3.6, amount: 4070.0, averageTemperatureC: 29 },
    { month: 'Apr', year: 2025, kwh: 380, peakKw: 4.2, amount: 4830.0, averageTemperatureC: 33 },
    { month: 'May', year: 2025, kwh: 370, peakKw: 4.1, amount: 4700.0, averageTemperatureC: 32 },
    { month: 'Jun', year: 2025, kwh: 355, peakKw: 3.9, amount: 4510.0, averageTemperatureC: 31 },
    { month: 'Jul', year: 2025, kwh: 360, peakKw: 4.0, amount: 4580.0, averageTemperatureC: 30 },
    { month: 'Aug', year: 2025, kwh: 340, peakKw: 3.8, amount: 4320.0, averageTemperatureC: 29 },
    { month: 'Sep', year: 2025, kwh: 325, peakKw: 3.6, amount: 4120.0, averageTemperatureC: 28 },
    { month: 'Oct', year: 2025, kwh: 310, peakKw: 3.4, amount: 3950.0, averageTemperatureC: 28 },
    { month: 'Nov', year: 2025, kwh: 295, peakKw: 3.2, amount: 3750.0, averageTemperatureC: 27 },
    { month: 'Dec', year: 2025, kwh: 350, peakKw: 3.9, amount: 4450.0, averageTemperatureC: 26 },
    { month: 'Jan', year: 2026, kwh: 320, peakKw: 3.6, amount: 4080.0, averageTemperatureC: 26 },
    { month: 'Feb', year: 2026, kwh: 310, peakKw: 3.5, amount: 3950.0, averageTemperatureC: 28 },
    { month: 'Mar', year: 2026, kwh: 335, peakKw: 3.8, amount: 4210.8, averageTemperatureC: 30 },
    { month: 'Apr', year: 2026, kwh: 410, peakKw: 4.5, amount: 5100.25, averageTemperatureC: 34 },
    { month: 'May', year: 2026, kwh: 365, peakKw: 4.0, amount: 4520.0, averageTemperatureC: 32 },
    { month: 'Jun', year: 2026, kwh: 385, peakKw: 4.2, amount: 4850.75, averageTemperatureC: 31 },
    { month: 'Jul', year: 2026, kwh: 390, peakKw: 4.3, amount: 4920.0, averageTemperatureC: 31 },
    { month: 'Aug', year: 2026, kwh: 405, peakKw: 4.4, amount: 5090.0, averageTemperatureC: 30 },
    { month: 'Sep', year: 2026, kwh: 395, peakKw: 4.3, amount: 4980.0, averageTemperatureC: 29 },
    { month: 'Oct', year: 2026, kwh: 375, peakKw: 4.1, amount: 4720.0, averageTemperatureC: 28 },
    { month: 'Nov', year: 2026, kwh: 360, peakKw: 3.9, amount: 4540.0, averageTemperatureC: 27 },
    { month: 'Dec', year: 2026, kwh: 420, peakKw: 4.6, amount: 5290.0, averageTemperatureC: 26 },
  ],
  '0421-9943-11': [
    ...buildConsumption(1260, 15.8, 12.7, [2024]),
    { month: 'Jan', year: 2025, kwh: 1220, peakKw: 15.4, amount: 15450.0 },
    { month: 'Feb', year: 2025, kwh: 1190, peakKw: 15.0, amount: 15100.0 },
    { month: 'Mar', year: 2025, kwh: 1260, peakKw: 15.8, amount: 15950.0 },
    { month: 'Apr', year: 2025, kwh: 1450, peakKw: 18.2, amount: 18400.0 },
    { month: 'May', year: 2025, kwh: 1410, peakKw: 17.8, amount: 17900.0 },
    { month: 'Jun', year: 2025, kwh: 1390, peakKw: 17.6, amount: 17650.0 },
    { month: 'Jul', year: 2025, kwh: 1400, peakKw: 17.7, amount: 17750.0 },
    { month: 'Aug', year: 2025, kwh: 1380, peakKw: 17.5, amount: 17500.0 },
    { month: 'Sep', year: 2025, kwh: 1320, peakKw: 16.8, amount: 16800.0 },
    { month: 'Oct', year: 2025, kwh: 1290, peakKw: 16.2, amount: 16400.0 },
    { month: 'Nov', year: 2025, kwh: 1250, peakKw: 15.9, amount: 15900.0 },
    { month: 'Dec', year: 2025, kwh: 1410, peakKw: 17.9, amount: 17900.0 },
    { month: 'Jan', year: 2026, kwh: 1280, peakKw: 16.1, amount: 16250.0 },
    { month: 'Feb', year: 2026, kwh: 1200, peakKw: 15.2, amount: 15200.0 },
    { month: 'Mar', year: 2026, kwh: 1350, peakKw: 16.8, amount: 17100.0 },
    { month: 'Apr', year: 2026, kwh: 1580, peakKw: 19.4, amount: 20100.0 },
    { month: 'May', year: 2026, kwh: 1420, peakKw: 17.9, amount: 18050.0 },
    { month: 'Jun', year: 2026, kwh: 1450, peakKw: 18.5, amount: 18420.5 },
    { month: 'Jul', year: 2026, kwh: 1510, peakKw: 18.9, amount: 19180.0 },
    { month: 'Aug', year: 2026, kwh: 1530, peakKw: 19.1, amount: 19450.0 },
    { month: 'Sep', year: 2026, kwh: 1490, peakKw: 18.7, amount: 18920.0 },
    { month: 'Oct', year: 2026, kwh: 1460, peakKw: 18.4, amount: 18550.0 },
    { month: 'Nov', year: 2026, kwh: 1430, peakKw: 18.0, amount: 18150.0 },
    { month: 'Dec', year: 2026, kwh: 1600, peakKw: 19.8, amount: 20300.0 },
  ],
  // Service accounts available for linking (Account module)
  '0421-2045-88': buildConsumption(265, 3.0, 12.6, [2024, 2025, 2026], true),
  '0421-9012-34': buildConsumption(940, 11.0, 12.7, [2024, 2025, 2026]),
  '0421-5512-88': buildConsumption(300, 3.4, 12.6, [2024, 2025, 2026], true),
  '0421-8420-19': buildConsumption(3450, 40.5, 12.5, [2024, 2025, 2026]),
  '0421-7700-34': buildConsumption(210, 2.5, 12.6, [2024, 2025, 2026], true),
};

// -------------------------------------------------------------
// Sample data for newly registered customers (built on demand, stable per account number)
// -------------------------------------------------------------
type ServiceType = ServiceAccount['serviceType'];

const SAMPLE_BASE: Record<ServiceType, { kwh: number; peakKw: number }> = {
  Residential: { kwh: 290, peakKw: 3.3 },
  Commercial: { kwh: 950, peakKw: 11.5 },
  Industrial: { kwh: 3500, peakKw: 41 },
};

const SAMPLE_CHARGES: [string, string, number][] = [
  ['Generation Charge', 'Power supplier generation cost', 7.0],
  ['Transmission Charge', 'NGCP high-voltage grid transmission', 1.4],
  ['Distribution System', 'CEDC wires, transformers, & meters operation', 2.2],
  ['System Loss Charge', 'Technical & non-technical losses allowed by ERC', 0.6],
  ['Subsidies & Universal Charge', 'Lifeline subsidy, Missionary, & Environmental', 0.4],
];
const SAMPLE_TAX_RATE = 0.086;

const round2 = (n: number) => Math.round(n * 100) / 100;

const accountSeed = (accountNumber: string) =>
  accountNumber
    .replace(/\D/g, '')
    .split('')
    .reduce((sum, d, i) => sum + Number(d) * (i + 1), 0);

const billAmountForKwh = (kwh: number) => {
  const subtotal = SAMPLE_CHARGES.reduce((sum, [, , rate]) => sum + kwh * rate, 0);
  return round2(subtotal * (1 + SAMPLE_TAX_RATE));
};

export const getSampleConsumption = (accountNumber: string, serviceType: ServiceType = 'Residential'): ConsumptionData[] => {
  if (MOCK_CONSUMPTION_HISTORY[accountNumber]) return MOCK_CONSUMPTION_HISTORY[accountNumber];
  const scale = 0.85 + (accountSeed(accountNumber) % 30) / 100;
  const base = SAMPLE_BASE[serviceType] || SAMPLE_BASE.Residential;
  return buildConsumption(
    Math.round(base.kwh * scale),
    Math.round(base.peakKw * scale * 10) / 10,
    billAmountForKwh(1),
    [2024, 2025, 2026],
    serviceType === 'Residential'
  );
};

const HISTORY_PERIODS = [
  { month: 'May', bill: '06', period: 'May 16 - Jun 15, 2026', due: 'July 12, 2026', paidOn: 'July 05, 2026', method: 'GCash' },
  { month: 'Apr', bill: '05', period: 'Apr 16 - May 15, 2026', due: 'June 12, 2026', paidOn: 'June 10, 2026', method: 'Maya' },
  { month: 'Mar', bill: '04', period: 'Mar 16 - Apr 15, 2026', due: 'May 12, 2026', paidOn: 'May 08, 2026', method: 'ECPay' },
  { month: 'Feb', bill: '03', period: 'Feb 16 - Mar 15, 2026', due: 'April 12, 2026', paidOn: 'April 09, 2026', method: 'GCash' },
];

export const getSampleBillingHistory = (accountNumber: string, serviceType: ServiceType = 'Residential'): BillingHistoryItem[] => {
  if (MOCK_BILLING_HISTORY[accountNumber]) return MOCK_BILLING_HISTORY[accountNumber];
  const digits = accountNumber.replace(/\D/g, '');
  const consumption = getSampleConsumption(accountNumber, serviceType);
  const seed = accountSeed(accountNumber);
  return HISTORY_PERIODS.map((p, i) => {
    const kwh = consumption.find(c => c.year === 2026 && c.month === p.month)?.kwh || 0;
    const amount = billAmountForKwh(kwh);
    return {
      id: `HIST-${digits}-${p.bill}`,
      billNumber: `BILL-2026-${p.bill}-${digits}`,
      accountNumber,
      billingPeriod: p.period,
      dueDate: p.due,
      amount,
      amountPaid: amount,
      remainingBalance: 0,
      status: 'Paid',
      paymentDate: p.paidOn,
      paymentMethod: p.method,
      receiptNumber: `OR-2026-${100000 + ((seed * 7919 + i * 104729) % 900000)}`,
    };
  });
};

export const createSampleServiceAccount = (details: {
  accountNumber: string;
  accountHolderName: string;
  serviceAddress: string;
  meterNumber: string;
  serviceType: ServiceType;
}): ServiceAccount => {
  const { accountNumber, serviceType } = details;
  const kwh = getSampleConsumption(accountNumber, serviceType).find(c => c.year === 2026 && c.month === 'Jun')?.kwh || SAMPLE_BASE[serviceType].kwh;
  const breakdown: BillBreakdownItem[] = SAMPLE_CHARGES.map(([category, description, ratePerKwh]) => ({
    category,
    description,
    amount: round2(kwh * ratePerKwh),
    ratePerKwh,
  }));
  const subtotal = breakdown.reduce((sum, b) => sum + b.amount, 0);
  const taxes = round2(subtotal * SAMPLE_TAX_RATE);
  breakdown.push({ category: 'Government Taxes', description: 'VAT (12%) & Local Franchise Tax', amount: taxes });
  const amountDue = round2(subtotal + taxes);

  return {
    ...details,
    nickname: `${serviceType} - ${details.accountHolderName}`,
    isPrimary: true,
    currentBill: {
      billNumber: `BILL-2026-07-${accountNumber.replace(/\D/g, '')}`,
      accountNumber,
      billingPeriod: 'June 16, 2026 - July 15, 2026',
      dueDate: 'August 12, 2026',
      amountDue,
      previousBalance: 0,
      totalAmountDue: amountDue,
      status: 'Unpaid',
      amountPaid: 0,
      kwhConsumed: kwh,
      peakKw: Math.round(SAMPLE_BASE[serviceType].peakKw * (kwh / SAMPLE_BASE[serviceType].kwh) * 10) / 10,
      billingDate: 'July 18, 2026',
      breakdown,
    },
  };
};

// Builds the customer profile for an admin-approved registration request
export const createCustomerFromRegistration = (req: RegistrationRequest): Customer => {
  const accountNumber = req.accountCode || req.matchingBillingRecord?.accountNumber || '';
  const serviceType = (req.matchingBillingRecord?.serviceType as ServiceType) || 'Residential';
  const meterNumber = req.matchingBillingRecord?.meterNumber || `MTR-2026-${String(accountSeed(accountNumber)).padStart(5, '0')}`;
  const now = new Date().toISOString();

  return {
    id: `CUST-${accountNumber.replace(/\D/g, '').slice(-6)}`,
    accountNumber,
    username: req.username,
    name: req.fullName,
    email: req.email,
    mobileNumber: req.mobileNumber,
    serviceAddress: req.serviceAddress,
    serviceType,
    meterNumber,
    biometricsEnabled: true,
    registeredDate: now.slice(0, 10),
    isFirstLogin: true,
    tempPassword: req.tempPassword,
    currentPassword: req.tempPassword,
    passwordLastChanged: now,
    previousPasswords: [],
    failedLoginAttempts: 0,
    lockedUntil: null,
    status: 'Active',
    linkedAccounts: [
      createSampleServiceAccount({
        accountNumber,
        accountHolderName: req.fullName,
        serviceAddress: req.serviceAddress,
        meterNumber,
        serviceType,
      }),
    ],
  };
};

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-001',
    type: 'DUE_DATE_REMINDER',
    title: 'Bill Reminder: Due Date Approaching',
    message: 'Your June-July bill for Account #0421-8812-90 amounting to ₱4,850.75 is due on August 12, 2026. Pay early to avoid service disconnection.',
    timestamp: '2026-08-04 09:30 AM',
    isRead: false,
    accountNumber: '0421-8812-90',
  },
  {
    id: 'NOTIF-002',
    type: 'OUTAGE_SCHEDULED',
    title: 'Scheduled Maintenance Power Interruption',
    message: 'CEDC will conduct preventive maintenance at Clark Freeport Zone Substation 3 on Aug 08, 2026 (08:00 AM - 12:00 PM). Affected areas: Berthaphil Park 1 & 2.',
    timestamp: '2026-08-03 02:15 PM',
    isRead: false,
  },
  {
    id: 'NOTIF-003',
    type: 'PAYMENT_CONFIRMATION',
    title: 'Payment Received for May-June Bill',
    message: 'Thank you! We received your payment of ₱4,520.00 via GCash. Official Receipt Ref: OR-2026-881023.',
    timestamp: '2026-07-05 10:42 AM',
    isRead: true,
    accountNumber: '0421-8812-90',
  },
  {
    id: 'NOTIF-004',
    type: 'ANNOUNCEMENT',
    title: 'Paperless Billing & Auto-Debit Discount',
    message: 'Switch to Clark Electric Paperless Billing and get a ₱50 bill rebate on your next billing cycle! Visit Settings to activate e-Bills.',
    timestamp: '2026-07-01 08:00 AM',
    isRead: true,
  },
];

export const MOCK_FAQS: FAQItem[] = [
  {
    id: 'FAQ-1',
    category: 'Billing',
    question: 'How is my monthly electricity bill computed?',
    answer: 'Your electric bill is computed based on actual kWh meter reading multiplied by current ERC-approved unbundled rates (Generation, Transmission, Distribution, System Loss, Universal Charge, and VAT). CEDC retrieves reading directly from your digital smart meter.',
  },
  {
    id: 'FAQ-2',
    category: 'Payments',
    question: 'How long does payment reflection take via GCash / Maya / ECPay?',
    answer: 'Payments made through our official mobile app integration with GCash, Maya, and ECPay reflect instantly in real-time in the CEDC Billing System.',
  },
  {
    id: 'FAQ-3',
    category: 'Accounts',
    question: 'Can I link multiple CEDC service accounts under one login?',
    answer: 'Yes! Go to Customer Profile > Link Service Account. Enter your Account Number and Meter Number for verification. Once validated, you can switch between accounts easily.',
  },
  {
    id: 'FAQ-4',
    category: 'Outages',
    question: 'How can I report a power outage or voltage fluctuation?',
    answer: 'You can submit an instant concern under Customer Support > Power Outage, or check the Emergency Outages tab in Notifications for real-time updates from CEDC System Operations.',
  },
  {
    id: 'FAQ-5',
    category: 'Biometrics',
    question: 'Is Fingerprint or Face ID login secure?',
    answer: 'Yes. Biometric keys are stored locally in your smartphone’s secure enclave (KeyChain/Keystore). The Clark Electric app never transmits or stores raw biometric data on external servers.',
  },
];
