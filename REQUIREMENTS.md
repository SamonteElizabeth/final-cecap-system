# CECAp - Clark Electric Customer Application
## Full System Requirements & Application Scope Document

This document provides a clear, simple, and complete list of all functional requirements and features included in the **CECAp (Clark Electric Customer Application)** portal.

---

## 📱 1. Customer Mobile Portal

### A. Authentication & Registration
* **Account Code Login**: Customers log in using their official 10-digit Customer Account Code (e.g., `0421-9012-34`) and password.
* **First-Time Password Change**: When logging in with an auto-generated temporary password, the system forces a mandatory password update for account security.
* **Biometric Authentication**: Supports quick unlock using fingerprint or Face ID simulation.
* **New Account Registration**:
  * Form collects **Customer Account Code**, **Full Name**, **Service Address**, **Mobile Number**, **Email Address**, and **Notification Channel preference** (Email, SMS, or Both).
  * Requires **6-Digit OTP Verification** sent via Email and SMS.
  * Auto-submits registration requests to the Admin CRS queue for verification against central billing records.

### B. Billing & Account Dashboard
* **Multi-Account Switching**: Easily switch between registered accounts (e.g., Residential, Commercial, or Industrial meters).
* **Bill Overview**: Displays total balance due, due date, disconnection warning alerts, current meter reading, and billing period.
* **kWh Consumption Summary**: Shows power usage breakdown for the current billing cycle.

### C. Digital Payments
* **Payment Gateways**: Supports e-wallets (GCash, Maya), Credit/Debit Cards, and Over-the-counter Reference Codes.
* **Digital Receipts**: Instant confirmation and official receipt generation with transaction tracking IDs.
* **Payment History**: View previous monthly bills, payment dates, and payment methods used.

### D. Outage Reports & Area Advisories
* **Report Power Interruption**: Quick Brownout/Fault reporting form with location selector and issue description.
* **Scheduled Advisories**: Live list and map view of ongoing and upcoming scheduled power maintenance notices across Clark Freeport Zone.

### E. Notifications & Support
* **In-App Notifications**: Real-time alerts for new bills, payment receipts, and emergency outage updates.
* **Help Desk Support**: Submit billing inquiries, meter check requests, or general service tickets.

---

## 🖥️ 2. Admin Console (CRS & Management Hub)

### A. Customer Registration Verification Queue
* **Pending Approvals List**: Displays all incoming customer registration requests.
* **Central Database Matching**: Checks submitted Account Codes, customer names, and service addresses against the central utility database.
* **Approval & Credential Dispatch**:
  * Approving a request automatically generates a secure temporary password (`CedcTemp#XXXX`).
  * Automatically dispatches an official approval email and SMS with the login credentials to the applicant.
* **Rejection Handling**: Allows admins to reject incomplete or invalid requests with a specific reason, sending an automated status update email to the user.

### B. Customer Directory Management
* View customer profiles, meter serial numbers, payment statuses, and account activity logs.

### C. Advisory & Outage Management
* Create and publish scheduled power maintenance advisories for specific zones in Clark.

### D. Support Ticket Resolution
* Review, respond to, and close customer support inquiries and fault reports.

---

## 📧 3. CECAp Official Email Dispatch Center (Outbox Hub)

* **Live Email Relay Viewer**: Accessible from both customer and admin views to inspect all outbound system emails in real-time.
* **Dispatched Email Types**:
  1. **Registration Received Notice**: Confirms receipt of application and pending verification status.
  2. **OTP Verification Code**: Dispatches 6-digit security code for new account registration.
  3. **Registration Approval Email**: Delivers official Customer Account Code and Temporary Password.
  4. **Registration Rejection Notice**: Delivers rejection reasons and guidance for re-application.
* **Quick Credential Auto-Fill**: "Use These Credentials To Log In Now" button inside approval emails to automatically fill the login form for fast testing.

---

## 📐 4. System Architecture & Information Hub

* **Architecture Overview Tab**: Visual guide explaining data flow, security layers, authentication flow, and central billing integration points.
