import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Network, Database, Layers, GitBranch, Terminal, ShieldCheck, FileCheck, Code, Server, Cpu, CheckCircle2, Zap, ArrowLeft, Smartphone } from 'lucide-react';

export const ArchitectureHub: React.FC = () => {
  const { setViewMode } = useApp();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INTEGRATION' | 'DIAGRAMS' | 'API' | 'SCHEMA' | 'REQUIREMENTS'>('OVERVIEW');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
          <button
            onClick={() => setViewMode('mobile')}
            className="bg-[#005BAC] hover:bg-blue-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <Smartphone className="w-4 h-4" />
            <span>Return to CEDC Customer App</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono text-slate-300">Enterprise Spec Active</span>
          </div>
        </div>

        {/* Header */}
        <div className="border-b border-slate-800 pb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-blue-950 text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider">
                Enterprise Blueprint
              </span>
              <span className="text-xs text-slate-400 font-mono">CEDC-ARCH-2026.08</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">Clark Electric Customer App • Technical Architecture</h1>
            <p className="text-sm text-slate-400">
              System Specification, Integration Topology, UML Diagrams, ERD, and REST API Documentation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-blue-950 border border-blue-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-blue-200">Billing System Integration: Active</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl gap-1 overflow-x-auto text-xs font-bold border border-slate-700/60">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'OVERVIEW' ? 'bg-[#005BAC] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> System Overview
          </button>
          <button
            onClick={() => setActiveTab('INTEGRATION')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'INTEGRATION' ? 'bg-[#005BAC] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-4 h-4" /> Integration Architecture
          </button>
          <button
            onClick={() => setActiveTab('DIAGRAMS')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'DIAGRAMS' ? 'bg-[#005BAC] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4" /> Sequence & UML
          </button>
          <button
            onClick={() => setActiveTab('API')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'API' ? 'bg-[#005BAC] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" /> REST API Specs
          </button>
          <button
            onClick={() => setActiveTab('SCHEMA')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'SCHEMA' ? 'bg-[#005BAC] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" /> ERD Schema
          </button>
          <button
            onClick={() => setActiveTab('REQUIREMENTS')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'REQUIREMENTS' ? 'bg-[#005BAC] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-4 h-4" /> Requirements
          </button>
        </div>

        {/* TAB 1: SYSTEM OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> Architectural Principles & Data Ownership
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="font-bold text-amber-400 text-sm">Master Data Source Constraint</h3>
                  <p>
                    The <strong>Existing CEDC Billing System</strong> is the single source of truth for all customer master records, service accounts, billing periods, unbundled tariff charges, consumption readings, and payment statuses.
                  </p>
                  <p className="text-slate-400">
                    The Customer App <strong>does not</strong> calculate electricity bills nor modify master customer profiles directly.
                  </p>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="font-bold text-blue-400 text-sm">Customer App Storage Scope</h3>
                  <p>
                    The Customer App database maintains only minimal application runtime state:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Encrypted Login Credentials (bcrypt hashed)</li>
                    <li>Push Notification Device Tokens (FCM/APNS)</li>
                    <li>Local Biometric Public Key Hashes</li>
                    <li>Linked Service Account mappings</li>
                    <li>Customer Support Ticket logs</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Information Architecture Grid */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">Information Architecture (IA)</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-blue-400 mb-1">1. Authentication</h4>
                  <p className="text-slate-400">Account # Validation • OTP SMS/Email • Password Encryption • Biometrics (Face ID/Fingerprint)</p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-blue-400 mb-1">2. Dashboard</h4>
                  <p className="text-slate-400">Current Amount Due • Due Date • Multi-Account Switcher • Quick Pay • Outage Banner</p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-blue-400 mb-1">3. Billing & Usage</h4>
                  <p className="text-slate-400">Unbundled Tariff Breakdown • Bill History • PDF OR Receipts • Monthly kWh & kW Peak Charts</p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-blue-400 mb-1">4. Digital Payments</h4>
                  <p className="text-slate-400">Full & Partial Payment • GCash Gateway • Maya Gateway • ECPay Gateway • Instant Sync</p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-blue-400 mb-1">5. Customer Support</h4>
                  <p className="text-slate-400">Ticket Submission • Photo Attachment • Email Forwarder • FAQs • Substation Outage Map</p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-blue-400 mb-1">6. Notifications & Settings</h4>
                  <p className="text-slate-400">Push/SMS/Email Preferences • Due Date Reminders • Multi-Account Linking • Security Settings</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTEGRATION ARCHITECTURE */}
        {activeTab === 'INTEGRATION' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">System Integration Topology</h2>
              
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto">
                <div className="text-center font-bold text-amber-400 mb-4">[ CLARK ELECTRIC ENTERPRISE INTEGRATION ARCHITECTURE ]</div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center items-center">
                  <div className="bg-blue-900/60 border border-blue-500 p-3 rounded-xl text-white">
                    <p className="font-bold">Customer Mobile App</p>
                    <p className="text-[10px] text-blue-200">Android / iOS UI</p>
                  </div>

                  <div className="text-slate-500 font-bold">◄-- REST/HTTPS --►</div>

                  <div className="bg-slate-800 border border-amber-500 p-3 rounded-xl text-white">
                    <p className="font-bold text-amber-400">CEDC API Proxy Gateway</p>
                    <p className="text-[10px] text-slate-300">Auth & Rate Limiting</p>
                  </div>

                  <div className="text-slate-500 font-bold">◄-- TLS 1.3 --►</div>

                  <div className="bg-emerald-900/60 border border-emerald-500 p-3 rounded-xl text-white">
                    <p className="font-bold">Existing Billing System</p>
                    <p className="text-[10px] text-emerald-200">Master Data Source</p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                  <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-center">
                    <p className="font-bold text-blue-400">Payment Gateways</p>
                    <p className="text-[10px] text-slate-400">GCash • Maya • ECPay</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-center">
                    <p className="font-bold text-amber-400">Messaging Gateways</p>
                    <p className="text-[10px] text-slate-400">SMS Gateway • Email Dispatch</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-center">
                    <p className="font-bold text-purple-400">Push Services</p>
                    <p className="text-[10px] text-slate-400">Firebase Cloud Messaging (FCM)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UML & SEQUENCE DIAGRAMS */}
        {activeTab === 'DIAGRAMS' && (
          <div className="space-y-6 animate-fade-in">
            {/* Bill Payment Sequence Diagram */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold text-white">Bill Payment & Real-Time Sync Sequence Diagram</h2>
              
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto space-y-2">
                <p className="text-amber-400 font-bold">Customer App ──► API Gateway ──► Payment Gateway (GCash) ──► Billing System ──► SMS/Email</p>
                <div className="border-l-2 border-blue-500 pl-3 space-y-1 my-2">
                  <p>1. Customer selects Bill & Channel (GCash/Maya/ECPay) in Customer App</p>
                  <p>2. App calls <span className="text-blue-400">POST /api/payment/checkout</span></p>
                  <p>3. API Gateway redirects customer to GCash Authorization Screen</p>
                  <p>4. Customer verifies GCash MPIN</p>
                  <p>5. GCash Gateway sends Payment Webhook to CEDC API Gateway</p>
                  <p>6. API Gateway invokes <span className="text-emerald-400">BillingSystem.POST_PAYMENT()</span></p>
                  <p>7. Billing System updates Bill Status to PAID and generates OR #</p>
                  <p>8. Async Notification Service triggers SMS & Email Official Receipt to customer</p>
                </div>
              </div>
            </div>

            {/* Registration Sequence Diagram */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold text-white">Registration & Billing System Validation Sequence</h2>
              
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto space-y-2">
                <div className="border-l-2 border-amber-500 pl-3 space-y-1">
                  <p>1. Customer enters 10-digit CEDC Service Account Number</p>
                  <p>2. Customer App requests <span className="text-amber-400">POST /api/auth/validate-account</span></p>
                  <p>3. API Gateway validates Account Number against Billing System Database</p>
                  <p>4. Billing System returns Masked Customer Name, Address, & Mobile Number</p>
                  <p>5. API Gateway dispatches 6-digit OTP via SMS Gateway</p>
                  <p>6. Customer verifies OTP code in app</p>
                  <p>7. Customer creates encrypted password & binds local Face ID / Fingerprint</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REST API SPECIFICATIONS */}
        {activeTab === 'API' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">OpenAPI REST API Endpoints</h2>

              <div className="space-y-3 font-mono text-xs">
                {/* Endpoint 1 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">POST</span>
                    <span className="text-white font-bold">/api/auth/validate-account</span>
                  </div>
                  <p className="text-slate-400">Validates customer account against Billing System master DB.</p>
                  <pre className="bg-slate-900 p-2.5 rounded text-blue-300 overflow-x-auto">
{`// Request Body
{ "accountNumber": "0421-8812-90" }

// Response (200 OK)
{ "success": true, "found": true, "customerName": "Juan Dela Cruz", "maskedMobile": "+63 917 *** 1234" }`}
                  </pre>
                </div>

                {/* Endpoint 2 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded">GET</span>
                    <span className="text-white font-bold">/api/billing/account/:accountNumber</span>
                  </div>
                  <p className="text-slate-400">Retrieves current statement of account and unbundled tariff breakdown.</p>
                </div>

                {/* Endpoint 3 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">POST</span>
                    <span className="text-white font-bold">/api/payment/confirm</span>
                  </div>
                  <p className="text-slate-400">Processes payment gateway callback and updates Billing System status.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DATABASE SCHEMA (ERD) */}
        {activeTab === 'SCHEMA' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">Customer App Database Schema (PostgreSQL / Relational)</h2>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto space-y-4">
                <div className="border border-blue-500/50 p-3 rounded-xl bg-slate-900/80">
                  <h4 className="font-bold text-blue-400 border-b border-slate-800 pb-1 mb-2">TABLE: users</h4>
                  <p>id: UUID (PK)</p>
                  <p>master_account_number: VARCHAR(20) (FK to BillingSystem)</p>
                  <p>email: VARCHAR(100) (UNIQUE)</p>
                  <p>mobile_number: VARCHAR(20) (UNIQUE)</p>
                  <p>password_hash: VARCHAR(255) (Bcrypt)</p>
                  <p>biometrics_public_key: TEXT</p>
                  <p>created_at: TIMESTAMP</p>
                </div>

                <div className="border border-emerald-500/50 p-3 rounded-xl bg-slate-900/80">
                  <h4 className="font-bold text-emerald-400 border-b border-slate-800 pb-1 mb-2">TABLE: linked_service_accounts</h4>
                  <p>id: UUID (PK)</p>
                  <p>user_id: UUID (FK -&gt; users.id)</p>
                  <p>service_account_number: VARCHAR(20)</p>
                  <p>nickname: VARCHAR(50)</p>
                  <p>is_primary: BOOLEAN</p>
                </div>

                <div className="border border-amber-500/50 p-3 rounded-xl bg-slate-900/80">
                  <h4 className="font-bold text-amber-400 border-b border-slate-800 pb-1 mb-2">TABLE: support_tickets</h4>
                  <p>id: UUID (PK)</p>
                  <p>ticket_number: VARCHAR(20)</p>
                  <p>account_number: VARCHAR(20)</p>
                  <p>category: VARCHAR(50)</p>
                  <p>subject: VARCHAR(200)</p>
                  <p>description: TEXT</p>
                  <p>attachment_url: TEXT</p>
                  <p>status: VARCHAR(30)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: REQUIREMENTS MATRIX */}
        {activeTab === 'REQUIREMENTS' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">Functional & Non-Functional Matrix</h2>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">F-01: Customer Registration & OTP Validation</p>
                    <p className="text-slate-400">Validate against Billing System master DB before account creation</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Met
                  </span>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">F-02: Digital Payments (GCash, Maya, ECPay)</p>
                    <p className="text-slate-400">Full & Partial payment with instant Billing System status update</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Met
                  </span>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">NF-01: Security & Data Privacy Compliance</p>
                    <p className="text-slate-400">Bcrypt password hashing, TLS 1.3 encryption, RA 10173 compliance</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Met
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
