import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MOCK_CUSTOMERS, MOCK_BILLING_HISTORY, MOCK_CONSUMPTION_HISTORY, MOCK_NOTIFICATIONS, MOCK_FAQS } from './src/data/mockBillingData';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Memory stores for state updates
  let customers = [...MOCK_CUSTOMERS];
  let billingHistory = { ...MOCK_BILLING_HISTORY };
  let notifications = [...MOCK_NOTIFICATIONS];
  let concerns: any[] = [];
  let otpStore: Record<string, { code: string; expiresAt: number }> = {};
  let registrationRequests: any[] = [
    {
      id: 'REG-2026-001',
      fullName: 'Eleanor Vance',
      serviceAddress: 'Unit 301, Philexcel Business Park, Clark Freeport Zone, Pampanga',
      mobileNumber: '+63 917 888 1234',
      email: 'eleanor.vance@philexcel.ph',
      status: 'Pending',
      submittedAt: '2026-08-05 09:30 AM',
      notificationChannel: 'Email',
      matchingBillingRecord: {
        accountNumber: '0421-9012-34',
        customerName: 'Eleanor Vance - Philexcel',
        serviceAddress: 'Unit 301, Philexcel Business Park, Clark Freeport Zone, Pampanga',
        mobileNumber: '+63 917 888 1234',
        email: 'eleanor.vance@philexcel.ph',
        meterNumber: 'MTR-2025-88123',
        serviceType: 'Commercial',
        accountStatus: 'Active',
        matchConfidence: 98,
      },
    },
    {
      id: 'REG-2026-002',
      fullName: 'Mark Anthony Reyes',
      serviceAddress: 'Block 5 Lot 18, Fontana Residential Enclave, Clark Freeport Zone',
      mobileNumber: '+63 918 333 4455',
      email: 'm.reyes@fontanaclark.ph',
      status: 'Pending',
      submittedAt: '2026-08-05 10:15 AM',
      notificationChannel: 'SMS',
      matchingBillingRecord: {
        accountNumber: '0421-5512-88',
        customerName: 'Marco A. Reyes',
        serviceAddress: 'Block 5 Lot 18, Fontana Enclave, Clark Freeport Zone',
        mobileNumber: '+63 918 333 4455',
        email: 'm.reyes@fontanaclark.ph',
        meterNumber: 'MTR-2024-55102',
        serviceType: 'Residential',
        accountStatus: 'Active',
        matchConfidence: 92,
      },
    },
    {
      id: 'REG-2026-003',
      fullName: 'Sophia Isabel Castro',
      serviceAddress: 'Villa 22 Mimosa Leisure Estate, Clark Freeport Zone',
      mobileNumber: '+63 920 777 9900',
      email: 'sophia.castro@gmail.com',
      status: 'Pending',
      submittedAt: '2026-08-05 11:00 AM',
      notificationChannel: 'Both',
      matchingBillingRecord: {
        accountNumber: '0421-3388-11',
        customerName: 'Sophia Castro',
        serviceAddress: 'Villa 22 Mimosa Leisure Estate, Clark Freeport Zone',
        mobileNumber: '+63 920 777 9900',
        email: 'sophia.castro@gmail.com',
        meterNumber: 'MTR-2025-11029',
        serviceType: 'Residential',
        accountStatus: 'Active',
        matchConfidence: 100,
      },
    },
  ];

  // -------------------------------------------------------------------
  // REST API ENDPOINTS
  // -------------------------------------------------------------------

  // Customer Registration Request
  app.post('/api/auth/register-request', (req, res) => {
    const { fullName, serviceAddress, mobileNumber, email, notificationChannel = 'Email' } = req.body;
    if (!fullName || !serviceAddress || !mobileNumber || !email) {
      return res.status(400).json({ success: false, message: 'Full name, service address, mobile number, and email are required.' });
    }

    const regId = `REG-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newReq = {
      id: regId,
      fullName,
      serviceAddress,
      mobileNumber,
      email,
      status: 'Pending',
      submittedAt: new Date().toLocaleString(),
      notificationChannel,
      matchingBillingRecord: {
        accountNumber: `0421-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
        customerName: fullName,
        serviceAddress,
        mobileNumber,
        email,
        meterNumber: `MTR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        serviceType: 'Residential',
        accountStatus: 'Active',
        matchConfidence: 95,
      },
    };

    registrationRequests.unshift(newReq);
    res.json({
      success: true,
      message: 'Registration request submitted successfully and forwarded to CRS Administrator for verification.',
      request: newReq,
    });
  });

  // Admin List Registration Requests
  app.get('/api/admin/registration-requests', (req, res) => {
    res.json({ success: true, requests: registrationRequests });
  });

  // Admin Approve Registration Request
  app.post('/api/admin/approve-registration', (req, res) => {
    const { requestId, customAccountCode } = req.body;
    const reqIndex = registrationRequests.findIndex(r => r.id === requestId);
    if (reqIndex < 0) {
      return res.status(404).json({ success: false, message: 'Registration request not found.' });
    }

    const targetReq = registrationRequests[reqIndex];
    const accountCode = customAccountCode || `0421-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;
    const tempPassword = `CedcTemp#${Math.floor(1000 + Math.random() * 9000)}`;

    targetReq.status = 'Approved';
    targetReq.reviewedAt = new Date().toLocaleString();
    targetReq.reviewedBy = 'CRS Administrator';
    targetReq.accountCode = accountCode;
    targetReq.tempPassword = tempPassword;

    // Create active customer profile
    const newCustomer = {
      id: `CUST-${Math.floor(10000 + Math.random() * 90000)}`,
      accountNumber: accountCode,
      name: targetReq.fullName,
      email: targetReq.email,
      mobileNumber: targetReq.mobileNumber,
      serviceAddress: targetReq.serviceAddress,
      serviceType: 'Residential' as const,
      meterNumber: `MTR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      biometricsEnabled: true,
      registeredDate: new Date().toISOString().split('T')[0],
      isFirstLogin: true,
      tempPassword,
      status: 'Active' as const,
      linkedAccounts: [
        {
          accountNumber: accountCode,
          nickname: 'Primary Service Connection',
          serviceAddress: targetReq.serviceAddress,
          meterNumber: `MTR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          serviceType: 'Residential' as const,
          isPrimary: true,
          currentBill: {
            billNumber: `BILL-2026-08-${accountCode.replace(/-/g, '')}`,
            accountNumber: accountCode,
            billingPeriod: 'July 16 - August 15, 2026',
            dueDate: 'September 12, 2026',
            amountDue: 2450.00,
            previousBalance: 0,
            totalAmountDue: 2450.00,
            status: 'Unpaid' as const,
            amountPaid: 0,
            kwhConsumed: 195,
            peakKw: 2.5,
            billingDate: 'August 18, 2026',
            breakdown: [],
          },
        },
      ],
    };
    customers.unshift(newCustomer);

    console.log(`[CRS Admin Dispatch] Notification dispatched to ${targetReq.email} / ${targetReq.mobileNumber}: Account Code ${accountCode}, Temp Password ${tempPassword}`);

    res.json({
      success: true,
      message: 'Registration request approved. Customer Account Code and temporary password dispatched via configured channel.',
      accountCode,
      tempPassword,
      customer: newCustomer,
    });
  });

  // Admin Reject Registration Request
  app.post('/api/admin/reject-registration', (req, res) => {
    const { requestId, rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'A rejection reason is required.' });
    }

    const targetReq = registrationRequests.find(r => r.id === requestId);
    if (!targetReq) {
      return res.status(404).json({ success: false, message: 'Registration request not found.' });
    }

    targetReq.status = 'Rejected';
    targetReq.reviewedAt = new Date().toLocaleString();
    targetReq.reviewedBy = 'CRS Administrator';
    targetReq.rejectionReason = rejectionReason;

    console.log(`[CRS Admin Dispatch] Rejection notification sent to ${targetReq.email} / ${targetReq.mobileNumber}. Reason: ${rejectionReason}`);

    res.json({
      success: true,
      message: 'Registration request rejected and customer notified with provided reason.',
    });
  });

  // Customer Password Change
  app.post('/api/auth/change-password', (req, res) => {
    const { accountNumber, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const foundCust = customers.find(c => c.accountNumber === accountNumber);
    if (foundCust) {
      foundCust.isFirstLogin = false;
      foundCust.tempPassword = undefined;
    }

    res.json({
      success: true,
      message: 'Password updated successfully! Full account access granted.',
    });
  });

  // 1. Validate Account with Billing System
  app.post('/api/auth/validate-account', (req, res) => {
    const { accountNumber } = req.body;
    if (!accountNumber) {
      return res.status(400).json({ success: false, message: 'Account number is required' });
    }

    const cleanAcc = accountNumber.trim();
    // Search in mock customers or linked accounts
    let foundCustomer = customers.find(c => c.accountNumber === cleanAcc || c.linkedAccounts.some(la => la.accountNumber === cleanAcc));

    if (!foundCustomer) {
      // Demo fallback: create simulated account if valid CEDC format (starts with digits)
      if (/^\d{4}-\d{4}-\d{2}$/.test(cleanAcc) || cleanAcc.length >= 8) {
        return res.json({
          success: true,
          found: true,
          accountNumber: cleanAcc,
          customerName: 'Clark Business Client',
          serviceAddress: 'Clark Freeport Zone, Pampanga',
          maskedMobile: '+63 917 *** 9988',
          maskedEmail: 'clark.client@***.ph',
        });
      }
      return res.status(404).json({ success: false, message: 'Account Number not found in CEDC Billing System' });
    }

    const maskedMob = foundCustomer.mobileNumber.replace(/(\+63 \d{3}) \d{3} (\d{4})/, '$1 *** $2');
    const maskedEm = foundCustomer.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

    res.json({
      success: true,
      found: true,
      accountNumber: foundCustomer.accountNumber,
      customerName: foundCustomer.name,
      serviceAddress: foundCustomer.serviceAddress,
      maskedMobile: maskedMob,
      maskedEmail: maskedEm,
      mobileNumber: foundCustomer.mobileNumber,
      email: foundCustomer.email,
    });
  });

  // 2. Send OTP (SMS/Email Gateway)
  app.post('/api/auth/send-otp', (req, res) => {
    const { target, channel = 'SMS' } = req.body;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[target] = {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
    };

    console.log(`[SMS/Email Gateway] Sent OTP ${otpCode} via ${channel} to ${target}`);

    res.json({
      success: true,
      message: `OTP successfully sent via ${channel} to ${target}`,
      otpCodeDemo: otpCode, // Included for seamless testing in demo mode
      expiresInSeconds: 300,
    });
  });

  // 3. Verify OTP
  app.post('/api/auth/verify-otp', (req, res) => {
    const { target, code } = req.body;
    const record = otpStore[target];

    if (!record) {
      // For demo convenience, code "123456" is always valid
      if (code === '123456') {
        return res.json({ success: true, verified: true, message: 'OTP Verified successfully (Demo Master Key)' });
      }
      return res.status(400).json({ success: false, verified: false, message: 'No OTP requested for this number/email' });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[target];
      return res.status(400).json({ success: false, verified: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (record.code !== code && code !== '123456') {
      return res.status(400).json({ success: false, verified: false, message: 'Invalid OTP code. Please try again.' });
    }

    delete otpStore[target];
    res.json({ success: true, verified: true, message: 'OTP Verified successfully' });
  });

  // 4. Get Account & Current Bill Details
  app.get('/api/billing/account/:accountNumber', (req, res) => {
    const { accountNumber } = req.params;
    let customer = customers[0];

    let targetAccount = customer.linkedAccounts.find(la => la.accountNumber === accountNumber) || customer.linkedAccounts[0];

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        mobileNumber: customer.mobileNumber,
        biometricsEnabled: customer.biometricsEnabled,
      },
      account: targetAccount,
      linkedAccounts: customer.linkedAccounts,
    });
  });

  // 5. Get Billing History
  app.get('/api/billing/history/:accountNumber', (req, res) => {
    const { accountNumber } = req.params;
    const history = billingHistory[accountNumber] || billingHistory['0421-8812-90'] || [];
    res.json({ success: true, history });
  });

  // 6. Get Consumption History
  app.get('/api/billing/consumption/:accountNumber', (req, res) => {
    const { accountNumber } = req.params;
    const consumption = MOCK_CONSUMPTION_HISTORY[accountNumber] || MOCK_CONSUMPTION_HISTORY['0421-8812-90'] || [];
    res.json({ success: true, consumption });
  });

  // 7. Initiate Digital Payment Checkout (GCash / Maya / ECPay)
  app.post('/api/payment/checkout', (req, res) => {
    const { accountNumber, billNumber, amount, paymentType, channel } = req.body;

    const transactionId = `CEDC-TXN-${Date.now()}`;
    const gatewayRef = `${channel.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`;

    res.json({
      success: true,
      transactionId,
      gatewayRef,
      channel,
      amount,
      paymentType,
      redirectUrl: `/payment-gateway-sim?txn=${transactionId}&channel=${channel}`,
    });
  });

  // 8. Confirm Payment & Update Billing System
  app.post('/api/payment/confirm', (req, res) => {
    const { transactionId, accountNumber, billNumber, amountPaid, channel, gatewayRef } = req.body;

    // Update Billing System Status for customer
    customers.forEach(cust => {
      cust.linkedAccounts.forEach(la => {
        if (la.accountNumber === accountNumber || la.currentBill.billNumber === billNumber) {
          const rem = Math.max(0, la.currentBill.amountDue - amountPaid);
          la.currentBill.amountPaid += amountPaid;
          la.currentBill.amountDue = rem;
          la.currentBill.status = rem === 0 ? 'Paid' : 'Partially Paid';
        }
      });
    });

    const receiptNum = `OR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newHistoryItem = {
      id: `HIST-${Date.now()}`,
      billNumber: billNumber || 'BILL-2026-07-04218812',
      accountNumber,
      billingPeriod: 'June 16 - July 15, 2026',
      dueDate: 'August 12, 2026',
      amount: amountPaid,
      amountPaid: amountPaid,
      remainingBalance: 0,
      status: 'Paid' as const,
      paymentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      paymentMethod: channel,
      receiptNumber: receiptNum,
    };

    if (!billingHistory[accountNumber]) {
      billingHistory[accountNumber] = [];
    }
    billingHistory[accountNumber].unshift(newHistoryItem);

    // Push real-time payment confirmation notification
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      type: 'PAYMENT_CONFIRMATION' as const,
      title: 'Payment Confirmed!',
      message: `Your payment of ₱${amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })} via ${channel} was posted to CEDC Billing System. Receipt #${receiptNum}.`,
      timestamp: new Date().toLocaleString(),
      isRead: false,
      accountNumber,
    };
    notifications.unshift(newNotif);

    console.log(`[CEDC Billing API] Payment of ₱${amountPaid} posted for Acc #${accountNumber}. SMS & Email dispatch queued.`);

    res.json({
      success: true,
      receipt: {
        transactionId,
        referenceNumber: receiptNum,
        accountNumber,
        billNumber,
        amountPaid,
        paymentChannel: channel,
        timestamp: new Date().toISOString(),
        status: 'SUCCESS',
        remainingBalance: 0,
        gatewayRef: gatewayRef || `GW-${Date.now()}`,
      },
      smsDispatched: true,
      emailDispatched: true,
    });
  });

  // 9. Submit Support Concern
  app.post('/api/support/submit-concern', (req, res) => {
    const { accountNumber, category, subject, description, attachmentName } = req.body;

    const ticketNumber = `TK-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTicket = {
      id: `CONCERN-${Date.now()}`,
      ticketNumber,
      accountNumber,
      category,
      subject,
      description,
      attachmentName,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      forwardedToEmail: 'customercare@clarkelectric.ph',
    };

    concerns.unshift(newTicket);

    res.json({
      success: true,
      message: 'Concern submitted and automatically forwarded to customercare@clarkelectric.ph',
      ticket: newTicket,
    });
  });

  // 10. Get Notifications
  app.get('/api/notifications', (req, res) => {
    res.json({ success: true, notifications });
  });

  // 11. Trigger Test Notification (Simulates Outage or Bill Alert)
  app.post('/api/notifications/test-trigger', (req, res) => {
    const { type, title, message } = req.body;
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      type: type || 'OUTAGE_EMERGENCY',
      title: title || 'Emergency Outage Alert - Main Feeder 2',
      message: message || 'Unscheduled power trip detected in Berthaphil Industrial Zone. CEDC Linemen dispatched. Expected restoration: 45 minutes.',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' Today',
      isRead: false,
    };
    notifications.unshift(newNotif);
    res.json({ success: true, notification: newNotif });
  });

  // 12. Link Service Account
  app.post('/api/account/link', (req, res) => {
    const { newAccountNumber, meterNumber, nickname } = req.body;

    const mainCustomer = customers[0];

    const existingIndex = mainCustomer.linkedAccounts.findIndex(la => la.accountNumber === newAccountNumber);
    if (existingIndex >= 0) {
      return res.status(400).json({ success: false, message: 'This account is already linked to your profile.' });
    }

    const newLinkedAccount = {
      accountNumber: newAccountNumber,
      nickname: nickname || `CEDC Service - ${newAccountNumber}`,
      serviceAddress: 'Substation 4 Area, Clark Freeport Zone, Pampanga',
      meterNumber: meterNumber || `MTR-${Math.floor(10000 + Math.random() * 90000)}`,
      serviceType: 'Commercial' as const,
      isPrimary: false,
      currentBill: {
        billNumber: `BILL-2026-07-${newAccountNumber.replace(/-/g, '')}`,
        accountNumber: newAccountNumber,
        billingPeriod: 'June 16, 2026 - July 15, 2026',
        dueDate: 'August 20, 2026',
        amountDue: 8250.00,
        previousBalance: 0.0,
        totalAmountDue: 8250.00,
        status: 'Unpaid' as const,
        amountPaid: 0,
        kwhConsumed: 620,
        peakKw: 7.8,
        billingDate: 'July 18, 2026',
        breakdown: [
          { category: 'Generation Charge', description: 'Power supply generation', amount: 4340.0, ratePerKwh: 7.0 },
          { category: 'Transmission Charge', description: 'Grid transmission', amount: 868.0, ratePerKwh: 1.4 },
          { category: 'Distribution Charge', description: 'CEDC distribution operation', amount: 1364.0, ratePerKwh: 2.2 },
          { category: 'Taxes & Universal Charges', description: 'VAT and government fees', amount: 1678.0 },
        ],
      },
    };

    mainCustomer.linkedAccounts.push(newLinkedAccount);

    res.json({
      success: true,
      message: 'Service Account linked successfully after meter validation!',
      account: newLinkedAccount,
      totalLinked: mainCustomer.linkedAccounts.length,
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CEDC Express Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
