# BUSINESS REQUIREMENTS DOCUMENT (BRD)
## Clark Electric Customer Application & Management Platform (CECAp)
**Document Reference:** BRD-CEDC-CECAP-2026-V2.0  
**Target Organization:** Clark Electric Distribution Corporation (CEDC) — Clark Freeport Zone, Pampanga  
**System Designation:** CECAp (Customer Engagement & Operations Platform)  
**Document Type:** Formal Business Requirements Document (BRD) with Full Form Field Specifications  
**Effective Date:** October 2026  
**Status:** Approved & Implemented  

---

## 1. Executive Summary & Project Objectives

### 1.1 Business Context
Clark Electric Distribution Corporation (CEDC) distributes electric power within the Clark Freeport Zone (CFZ) and Clark Special Economic Zone. The CECAp ecosystem bridges end-to-end customer self-service with utility administration across customer service, billing inquiries, grid maintenance advisories, and ticket resolution.

### 1.2 Core Business Objectives
1. **Frictionless Customer Self-Service:** Provide residential, commercial, and industrial locators with transparent billing, multi-account management, digital payments, outage tracking, and responsive support.
2. **Strict Security & RBAC Governance:** Enforce enterprise authentication rules (30-day password expiration, 9+ character complexity with 5-history reuse prevention, 5-attempt lockouts, 15-minute inactivity timeouts, mandatory 2FA/MFA) and granular Role-Based Access Control (Super Admin vs. Support Staff).
3. **Streamlined Support Ticket Operations:** Ensure customer concerns are resolved through standardized lifecycle states: **Pending**, **In Progress**, and **Solved** with automatic timestamp recording of resolution completion.
4. **Standardized Broadcast & Outage Communications:** Deliver real-time emergency and scheduled outage notices and broadcast announcements to locators with centralized editor forms and table management.

---

## 2. User Roles & Access Control Matrix

| Role | Interface Type | Accessible Modules | Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | Mobile & Responsive Web Portal | Dashboard, Billing & Consumption, Digital Payments, Outages & Advisories, Support Desk, Profile & Security | View bills, pay via e-wallets/cards, report brownouts, submit support tickets, update credentials with MFA, switch linked accounts. |
| **System Admin** | Admin Management Console | Analytics, Customer Verification & Directory, Advisories & Broadcast Center, Payments, Grid Maintenance, Support Desk, Admin Staff Management | Full management across all utility modules, user provisioning, registration approvals/rejections, advisory publishing, ticket dispatching. |
| **Support Staff** | Admin-Style Console (Restricted) | **Support Desk Only** (All other modules strictly hidden and blocked) | Identical UI layout to Admin. Granular permission rules: Once assigned to a ticket, Support Staff can ONLY edit the Ticket Status (**Pending**, **In Progress**, **Solved**) and optional Customer Response remarks (`adminResponseText`). Lead agent re-assignment is restricted to System Administrators. Tickets assigned to other agents are view-only. |

---

## 3. Comprehensive Functional Scope by Module

### 3.1 Customer Portal Scope
* **Multi-Account Switching:** Manage primary and secondary electricity meters (Residential, Commercial, Industrial) under one customer profile.
* **Billing & Real-Time Breakdown:** View electricity charges (Generation, Transmission, System Loss, Distribution, Subsidies, Taxes), due dates, disconnection warnings, and PDF receipts.
* **Consumption Analytics:** Historical kWh consumption and peak demand kW trends.
* **Digital Bill Payments:** Pay bills via GCash, Maya, Credit/Debit cards, or ECPay with instant receipt generation.
* **Live Outage & Advisories Hub:** Real-time visibility into scheduled and emergency power interruptions across Clark sectors.
* **Support Ticket Desk:** Submit inquiries with attachments, track investigation status, and review official customer care responses.

### 3.2 Admin Console Scope
* **Customer Registration Verification Queue:** Filter incoming applications by Status (All, Approved, Pending, Rejected) with card summaries; review locator documents, verify central database matching, generate temporary credentials (`CedcTemp#XXXX`), or issue formal rejection letters.
* **Customer Directory:** Master locator registry with meter tracking, connection type, and service addresses.
* **Advisories & Broadcast Center:** Unified announcement and outage publishing with table view, priority badges, edit modal dialogs, and deletion controls.
* **Support Desk Operations:** Single-status ticket pipeline (**Pending** → **In Progress** → **Solved**), customer detail inspector modal (Customer Name, Service Address, Service Type, Account #), assigned agent management, and auto-completion date capture.
* **Payments & Financial Transactions:** Real-time transaction reconciliation across digital payment channels.
* **Grid Maintenance:** Substation load monitors, transformer inspections, and scheduled maintenance logs.
* **User & Staff Management:** Provision administrators and Support Staff with single-use 15-minute setup tokens, MFA enforcement, and role-based module permission checkboxes.

---

## 4. Comprehensive Form Field Specifications Catalog

Every form across the CECAp platform is cataloged below with field names, technical controls, data types, validation constraints, and business logic.

---

### Form 1: New Customer Registration Form
* **Module:** Customer Portal — Authentication (`/src/components/mobile/AuthView.tsx`)
* **Purpose:** Locators register their electrical meter account for online self-service access.

| Field Label | Field Key | Input Control | Data Type | Requirement | Validation & Business Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Customer Account Code** | `accountCode` | Text Input | String | Required | Format: `####-####-##` (10 digits with hyphens). Must match CEDC billing database. |
| **Full Name** | `fullName` | Text Input | String | Required | Minimum 3 characters. Must match utility registered account holder. |
| **Service Address** | `serviceAddress` | Text Input | String | Required | Street, building, or industrial block inside Clark Freeport Zone. |
| **Mobile Number** | `mobileNumber` | Tel Input | String | Required | Philippine mobile format (`+63 9XX XXX XXXX` or `09XXXXXXXXX`). Used for SMS OTP and outage alerts. |
| **Email Address** | `email` | Email Input | String | Required | Valid RFC 5322 email format. Used for digital invoices, approval notices, and password resets. |
| **Notification Channel** | `notificationChannel` | Radio / Pill Selector | Enum | Required | Options: `Email`, `SMS`, `Both`. Sets primary alert dispatch channel. |
| **OTP Verification Code** | `otpCode` | Numeric Input | String (6 digits) | Required | 6-digit numeric one-time pin sent to applicant's phone and email for verification. |

---

### Form 2: Customer Account Login Form
* **Module:** Customer Portal — Authentication (`/src/components/mobile/AuthView.tsx`)
* **Purpose:** Authenticate registered locators into the customer self-service dashboard.

| Field Label | Field Key | Input Control | Data Type | Requirement | Validation & Business Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Account Code** | `loginAccountCode` | Text Input | String | Required | Valid registered 10-digit account code. Checked against lockout list. |
| **Password** | `loginPassword` | Password Input | String | Required | Masked text. Checked against 30-day expiration and failed attempt limits. |
| **Remember Account** | `rememberMe` | Checkbox | Boolean | Optional | Persists account code in local storage across browser sessions. |
| **Biometric Sign-In** | `biometricTrigger` | Action Button | Trigger | Optional | Initiates simulated Fingerprint / Face ID biometric authentication if enabled. |

---

### Form 3: Admin & Support Staff Login Form
* **Module:** Admin Console — Authentication (`/src/components/mobile/AuthView.tsx`)
* **Purpose:** Authenticate internal utility staff (System Administrators and Support Staff).

| Field Label | Field Key | Input Control | Data Type | Requirement | Validation & Business Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Corporate Email** | `adminEmail` | Email Input | String | Required | Must end with `@clarkelectric.ph`. Checked for Active status. |
| **Password** | `adminPassword` | Password Input | String | Required | Masked text. Validates against lockout policy (5 attempts max). |
| **Staff Profile Preset** | `presetSwitcher` | Button Chips | Action | Optional | Pre-fills test credentials for System Admin (`admin@clarkelectric.ph`) or Support Staff (`c.fernandez@clarkelectric.ph`). |

---

### Form 4: Mandatory Password Setup & Expiration Update Form
* **Module:** Shared Security (`/src/components/mobile/PasswordChangeModal.tsx` & `/src/components/admin/AdminConsoleView.tsx`)
* **Purpose:** Enforced on first login with temporary password, or every 30 days under corporate security policy.

| Field Label | Field Key | Input Control | Data Type | Requirement | Validation & Business Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Current / Temp Password** | `currentPassword` | Password Input | String | Required | Must match existing active password or temporary system password. |
| **New Password** | `newPassword` | Password Input | String | Required | **Strict Policy Rules:**<br>1. Minimum 9 characters in length.<br>2. At least 1 uppercase letter (`A-Z`).<br>3. At least 1 lowercase letter (`a-z`).<br>4. At least 1 numeric digit (`0-9`).<br>5. At least 1 special character (`!@#$%^&*`).<br>6. Cannot contain user's name or email address.<br>7. Cannot match any of the user's last 5 passwords. |
| **Confirm New Password** | `confirmPassword` | Password Input | String | Required | Must match `newPassword` exactly. |
| **6-Digit MFA Verification Code** | `mfaCode` | Numeric Input | String (6 digits) | Required | Required when enabling or verifying mandatory 2FA. |

---

### Form 5: Customer Support Inquiry / Ticket Submission Form
* **Module:** Customer Portal — Support Desk (`/src/components/mobile/SupportView.tsx`)
* **Purpose:** Locators submit complaints, meter inquiries, power quality reports, or billing disputes.

| Field Label | Field Key | Input Control | Data Type | Requirement | Validation & Business Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Target Service Account** | `accountNumber` | Dropdown Select | String | Required | Selects from customer's linked primary or secondary accounts. |
| **Inquiry Category** | `category` | Dropdown Select | Enum | Required | Options:<br>• `Billing Concern`<br>• `Service Complaint`<br>• `Payment Concern`<br>• `Meter Concern`<br>• `Power Outage`<br>• `Others` |
| **Subject** | `subject` | Text Input | String | Required | Brief summary (5–100 characters). |
| **Detailed Description** | `description` | Textarea (4 rows) | String | Required | Complete description of the power issue or billing discrepancy. |
| **Attachment File** | `attachment` | File Input | File / Name | Optional | Allowed: JPG, PNG, PDF (up to 5MB). Displays file name upon selection. |

---

### Form 6: Support Ticket Resolution & Management Form
* **Module:** Admin & Support Staff Console — Support Module (`/src/components/admin/views/SupportView.tsx`)
* **Purpose:** Support Staff and Admins investigate tickets, assign lead agents, and update status.

| Field Label | Field Key | Input Control | Data Type | Requirement | Validation & Business Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Customer Full Name** | `customerName` | Read-Only Display | String | System | Auto-populated from linked customer record. |
| **Customer Service Address** | `customerAddress` | Read-Only Display | String | System | Auto-populated from meter facility record. |
| **Service Type** | `serviceType` | Read-Only Badge | Enum | System | Residential, Commercial, or Industrial badge. |
| **Customer Account Number** | `accountNumber` | Read-Only Display | String | System | Official 10-digit account reference. |
| **Ticket Status** | `ticketStatus` | Dropdown Select | Enum | Required | **Standard 3-Status Lifecycle:**<br>1. `Pending`<br>2. `In Progress`<br>3. `Solved`<br>• Editable by System Admin.<br>• For Support Staff: Editable once assigned to the ticket (disabled if assigned to another agent). |
| **Assign Lead Agent** | `assignedStaff` | Dropdown Select (Admin) / Assigned Agent Display (Support Staff) | String | Required | **Role-Based Control:**<br>• System Admin: Full dropdown to reassign agents (`Clarissa Fernandez`, `Engr. Roberto Santos`, `Maria Teresa Gonzales`, `Engr. Michael Tan`).<br>• Support Staff: Displays the assigned lead agent (`Clarissa Fernandez`, etc.). Re-assignment is handled by System Administrators. |
| **Completion Date** | `completionDate` | Auto-Generated Badge | Timestamp | Automatic | **System Auto-Capture:** When status is updated to `Solved`, the system automatically captures the timestamp (`YYYY-MM-DD HH:MM AM/PM`). Displayed in a green banner. |
| **Solution Remarks / Customer Response** | `adminResponseText` | Textarea (4 rows) | String | Optional | Remarks on the solution made and official resolution note dispatched to customer. Inputted by Support Staff or System Admin once assigned to the ticket. |

---

### Form 7: Broadcast Announcement & Power Outage Advisory Creator Form
* **Module:** Admin Console — Advisories Module (`/src/components/admin/views/AdvisoriesView.tsx`)
* **Purpose:** Create and dispatch scheduled maintenance notices or broadcast announcements.

| Field Label | Field Key | Input Control | Data Type | Requirement | Validation & Business Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Advisory Type** | `advisoryType` | Toggle Cards | Enum | Required | `ANNOUNCEMENT` (Push Notice) or `OUTAGE` (Power Interruption Advisory). |
| **Title / Headline** | `title` | Text Input | String | Required | Clear headline (e.g., *Emergency 69kV Substation Preventive Maintenance*). |
| **Content Body** | `contentBody` | Textarea + Toolbar | String | Required | Detailed breakdown. Rich formatting simulator (Bold, Italic, List, Heading, Code). |
| **Urgency Level** | `urgency` | Dropdown Select | Enum | Required | Options: `NORMAL`, `HIGH`, `EMERGENCY`. Emergency triggers high-priority visual styling. |
| **Target Audience** | `targetAudience` | Dropdown Select | Enum | Required | Options: `ALL`, `RESIDENTIAL`, `COMMERCIAL`, `INDUSTRIAL`. |
| **Schedule Start Date/Time** | `scheduledDateTime` | DateTime Picker | ISO String | Conditional | Required if `isScheduled: true`. Defines outage commencement. |
| **Schedule End Date/Time** | `scheduleEndTime` | DateTime Picker | ISO String | Conditional | Defines estimated time of power restoration. |
| **Affected Areas** | `affectedAreasInput` | Text Input | Comma-Separated | Conditional | Specific Clark Freeport Zone areas/streets affected. |

---

### Form 8: Edit Advisory & Announcement Form
* **Module:** Admin Console — Advisories Module (`/src/components/admin/views/AdvisoriesView.tsx`)
* **Purpose:** Modify active announcements or outage notices directly from the Advisories table.

| Field Label | Field Key | Input Control | Data Type | Requirement | Validation & Business Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Title / Headline** | `editTitle` | Text Input | String | Required | Pre-populated with active title; updates headline. |
| **Details / Message Content** | `editMessage` | Textarea (4 rows) | String | Required | Pre-populated with active description; updates live customer text. |
| **Urgency Level** | `editUrgency` | Dropdown Select | Enum | Required | Options: `NORMAL`, `HIGH`, `EMERGENCY`. |

---

### Form 9: Knowledge Base FAQ Creation Form
* **Module:** Admin Console — Advisories Sub-module (`/src/components/admin/views/AdvisoriesView.tsx`)
* **Purpose:** Publish customer-facing self-service FAQs.

| Field Label | Field Key | Input Control | Data Type | Requirement | Validation & Business Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FAQ Category** | `faqCategory` | Dropdown Select | String | Required | Options: `Billing`, `Technical`, `Safety`, `Application`, `General`. |
| **Question** | `title` | Text Input | String | Required | Customer inquiry phrasing. |
| **Official Answer** | `contentBody` | Textarea (4 rows) | String | Required | Official utility explanation and procedural guide. |

---

### Form 10: Self-Service Guide Creation Form
* **Module:** Admin Console — Advisories Sub-module (`/src/components/admin/views/AdvisoriesView.tsx`)
* **Purpose:** Publish step-by-step customer guides in the knowledge base.

| Field Label | Field Key | Input Control | Data Type | Requirement | Validation & Business Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Guide Title** | `title` | Text Input | String | Required | Actionable title (e.g., *How to Report Meter Faults Online*). |
| **Category** | `category` | Text Input | String | Required | Category classifier (e.g., `Meter Services`, `Billing`). |
| **Summary** | `summary` | Textarea (2 rows) | String | Required | Short preview snippet displayed in collapsed list view. |
| **Step-by-Step Instructions** | `contentBody` | Textarea (6 rows) | String | Required | Numbered steps and procedural requirements. |

---

### Form 11: Admin & Staff User Provisioning Form
* **Module:** Admin Console — User Management (`/src/components/admin/views/UserManagementView.tsx`)
* **Purpose:** Invite and configure utility employees as administrators or support personnel.

| Field Label | Field Key | Input Control | Data Type | Requirement | Validation & Business Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Full Name** | `name` | Text Input | String | Required | Official employee name with title/honorific. |
| **Email Address** | `email` | Email Input | String | Required | Must end with `@clarkelectric.ph`. Validated against existing accounts. |
| **Assign Role** | `role` | Dropdown Select | Enum | Required | Options: `Admin` (Full Console) or `Support Staff` (Support Desk Only). |
| **Module Permissions Matrix** | `permissions` | Checkbox Group | Object | Required | Individual switches:<br>• `Analytics`<br>• `Customer Records`<br>• `Advisories`<br>• `Billing & Payments`<br>• `Support Desk`<br>• `Grid Maintenance`<br>• `Admin User Management`<br>*(Selecting Support Staff automatically locks permissions to Support Desk only)*. |

---

### Form 12: Customer Registration Verification (Approval & Rejection) Form
* **Module:** Admin Console — Customer Records (`/src/components/admin/views/CustomerView.tsx`)
* **Purpose:** Validate submitted locator registration requests against central billing data.

| Field Label | Field Key | Input Control | Data Type | Requirement | Validation & Business Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Assigned Account Code** | `customAccountCode` | Text Input | String | System / Editable | Pre-filled with applicant's account code; formatted as `####-####-##`. |
| **Generated Temporary Password** | `tempPassword` | Read-Only Text | String | System | Auto-generated secure format: `CedcTemp#XXXX`. |
| **Rejection Reason Category** | `rejectReasonCategory` | Dropdown Select | Enum | Required on Reject | Options: `Account Code Mismatch`, `Address Incomplete`, `Duplicate Application`, `Other`. |
| **Custom Rejection Remarks** | `rejectReason` | Textarea | String | Required on Reject | Specific instructions for applicant correction sent via formal rejection email. |

---

### Form 13: Digital Bill Payment Gateway Form
* **Module:** Customer Portal — Billing (`/src/components/mobile/PaymentModal.tsx`)
* **Purpose:** Process digital invoice settlements through partner financial gateways.

| Field Label | Field Key | Input Control | Data Type | Requirement | Validation & Business Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Customer Account Number** | `accountNumber` | Read-Only Text | String | System | Selected customer billing account code. |
| **Bill Invoice Reference** | `billNumber` | Read-Only Text | String | System | Utility billing reference ID (e.g., `BILL-2026-07-04218812`). |
| **Payment Type** | `paymentType` | Radio Selector | Enum | Required | Options: `FULL` (Settles total outstanding balance) or `PARTIAL`. |
| **Payment Amount** | `amount` | Number Input | Currency (PHP) | Required | If `PARTIAL`, must be > PHP 100.00 and <= `totalAmountDue`. |
| **Payment Channel** | `channel` | Card Selector | Enum | Required | Options: `GCash`, `Maya`, `Credit/Debit Card`, `ECPay`. |
| **Payer Mobile Number** | `customerMobile` | Tel Input | String | Required | Mobile wallet number or contact phone. |
| **Payer Email Address** | `customerEmail` | Email Input | String | Required | Receives official digital payment receipt and gateway reference number. |

---

### Form 14: System Maintenance Category Entry Form
* **Module:** Admin Console — Maintenance (`/src/components/admin/views/MaintenanceView.tsx`)
* **Purpose:** Create or edit master ticket inquiry categories.
* **Architecture Note:** Category Code and SLA Target (Hours) are omitted from user entry as per streamlined utility ticket classification rules; codes are automatically system-derived and SLA hours are standardized.

| Field Label | Field Key | Input Control | Data Type | Requirement | Validation & Business Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Category Name** | `name` | Text Input | String | Required | Descriptive inquiry category (e.g., *Voltage Fluctuation*, *Meter Variance*). Minimum 3 characters. |
| **Description** | `description` | Textarea (3 rows) | String | Optional | Detailed operational scope and problem coverage for the ticket classification. |

---

## 5. Non-Functional & Security Requirements

1. **Enterprise Password Enforcement:** Minimum 9 characters, upper/lower/numeric/special combinations, 30-day lifecycle expiration with in-app banner warning, 5-history reuse restriction.
2. **Account Lockout Protection:** 5 consecutive failed sign-in attempts triggers a 30-minute system freeze with security event logged in the immutable audit trail.
3. **Session Inactivity Management:** Automatically triggers user inactivity warning and logout after 15 minutes of idle time.
4. **Data Isolation & Confidentiality:** Support Staff role has access strictly restricted to the Support Desk; unauthorized API endpoints or views return hard access blocks.
5. **Multi-Factor Authentication (MFA):** Enforces 6-digit OTP verification on administrative setup and account activation.
6. **Audit Trail Logging:** All authentication events (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `ACCOUNT_LOCKED`, `PASSWORD_CHANGED`, `ADMIN_ACCOUNT_ACTIVATED`) recorded with timestamps, user emails, and IP addresses.

---

## 6. Document Sign-Off & Verification

| Role / Authority | Representative | Department | Status |
| :--- | :--- | :--- | :--- |
| **System Operations Lead** | Engr. Roberto Santos | Operations & Public Affairs | Approved |
| **Support Staff Lead** | Clarissa Fernandez | Customer Support Operations | Approved |
| **Information Systems Security** | CECAP Security Administration | Cybersecurity & Infrastructure | Approved |
| **Utility Billing Services** | Maria Teresa Gonzales | Commercial Billing & Accounting | Approved |
