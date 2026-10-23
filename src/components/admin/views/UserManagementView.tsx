import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Edit2,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  Power,
  X,
  Check,
  Lock,
  Shield,
  Clock,
  Smartphone,
  AlertTriangle,
  History,
  FileText,
  Mail,
} from 'lucide-react';
import { AdminStaffUser, AuthAuditEvent } from '../../../types';
import { ADMIN_STAFF_USERS_LIST } from '../../../data/adminMockData';
import { useApp } from '../../../context/AppContext';

interface UserManagementViewProps {
  searchQuery?: string;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ searchQuery = '' }) => {
  const {
    adminStaffUsers,
    createAdminStaffUser,
    updateAdminStaffUser,
    resendAdminSetupEmail,
    auditLogs,
  } = useApp();
  const [activeTab, setActiveTab] = useState<'STAFF' | 'AUDIT'>('STAFF');
  const [auditFilter, setAuditFilter] = useState<string>('ALL');
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [toastMsg, setToastMsg] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminStaffUser | null>(null);
  const [resetPwdUser, setResetPwdUser] = useState<AdminStaffUser | null>(null);
  const [generatedTempPwd, setGeneratedTempPwd] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminStaffUser['role']>('Admin');
  const [permissions, setPermissions] = useState({
    analytics: true,
    customers: true,
    support: true,
    advisories: true,
    payments: false,
    maintenance: false,
    userManagement: false,
  });

  const query = (localSearch || searchQuery).toLowerCase();

  const filteredUsers = adminStaffUsers.filter(u => {
    const matchesQuery =
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesQuery =
      log.accountIdentifier.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      log.eventType.toLowerCase().includes(query) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(query));

    if (!matchesQuery) return false;

    if (auditFilter === 'ALL') return true;
    if (auditFilter === 'ADMIN') return log.eventType.startsWith('ADMIN');
    if (auditFilter === 'LOGIN') return log.eventType.startsWith('LOGIN');
    if (auditFilter === 'LOCKOUT') return log.eventType.includes('LOCK');
    if (auditFilter === 'MFA') return log.eventType.startsWith('MFA') || log.eventType.includes('MFA');
    if (auditFilter === 'PASSWORD') return log.eventType.includes('PASSWORD');
    if (auditFilter === 'SESSION') return log.eventType === 'SESSION_TIMEOUT';
    if (auditFilter === 'RECOVERY') return log.eventType.includes('RECOVERY') || log.eventType.includes('FORGOT');
    return true;
  });

  const handleToggleStatus = (u: AdminStaffUser) => {
    if (u.status === 'Pending') {
      setToastMsg('⚠️ Account is pending first-time password setup. Use Resend Setup Email if needed.');
      setTimeout(() => setToastMsg(''), 3500);
      return;
    }
    const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
    updateAdminStaffUser(u.id, { status: nextStatus });
    setToastMsg(`✅ User account status updated to ${nextStatus}!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleResendSetup = (userEmail: string) => {
    const result = resendAdminSetupEmail(userEmail);
    if (result.success) {
      setToastMsg(`📧 Fresh single-use setup link dispatched to ${userEmail}!`);
    } else {
      setToastMsg(`⚠️ ${result.message}`);
    }
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleRoleChange = (newRole: AdminStaffUser['role']) => {
    setRole(newRole);
    if (newRole === 'Support Staff') {
      setPermissions({
        analytics: false,
        customers: false,
        support: true,
        advisories: false,
        payments: false,
        maintenance: false,
        userManagement: false,
      });
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUser) {
      updateAdminStaffUser(editingUser.id, {
        name,
        email,
        role,
        permissions,
      });
      setToastMsg(`✅ User profile for ${name} updated successfully!`);
    } else {
      // New staff accounts start with Status: Pending and no password
      createAdminStaffUser({
        name,
        email,
        role,
        department: role === 'Support Staff' ? 'Helpdesk & Support' : 'System Operations',
        permissions,
      });
      setToastMsg(`✅ New ${role} account provisioned with Status: Pending! Single-use setup link sent to ${email}`);
    }

    setIsModalOpen(false);
    setEditingUser(null);
    setName('');
    setEmail('');
    setTimeout(() => setToastMsg(''), 4500);
  };

  const openEditModal = (u: AdminStaffUser) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setPermissions(u.permissions);
    setIsModalOpen(true);
  };

  const handleTriggerResetPwd = (u: AdminStaffUser) => {
    if (u.status === 'Pending') {
      handleResendSetup(u.email);
      return;
    }
    setResetPwdUser(u);
    setGeneratedTempPwd(`Cedc@2026!${Math.floor(100 + Math.random() * 900)}`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg font-bold text-xs flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="text-white hover:text-slate-200">✕</button>
        </div>
      )}

      {/* Top Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('STAFF')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'STAFF'
              ? 'bg-[#FF5401] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-[#E5E7EB] hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Staff Administrators ({adminStaffUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'AUDIT'
              ? 'bg-[#FF5401] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-[#E5E7EB] hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Authentication Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {activeTab === 'STAFF' ? (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Administrators</span>
              <div className="text-2xl font-black text-[#2B2B2B]">{adminStaffUsers.length} Users</div>
              <span className="text-[11px] text-slate-500 font-medium">Enterprise portal access</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Staff Accounts</span>
              <div className="text-2xl font-black text-emerald-600">
                {adminStaffUsers.filter(u => u.status === 'Active').length} Active
              </div>
              <span className="text-[11px] text-emerald-600 font-bold">100% Security Verified</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Setup</span>
              <div className="text-2xl font-black text-amber-600">
                {adminStaffUsers.filter(u => u.status === 'Pending').length} Pending
              </div>
              <span className="text-[11px] text-amber-600 font-bold">Awaiting Link &amp; MFA</span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                  placeholder="Search by admin name, email, role..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-[#2B2B2B] focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Account Statuses</option>
                  <option value="Active">Active Accounts</option>
                  <option value="Pending">Pending First-Time Setup</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setName('');
                    setEmail('');
                    setRole('Admin');
                    setIsModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF5401] hover:bg-[#E54A00] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Admin User</span>
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
              <tr className="bg-[#F8FAFC] text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#E5E7EB]">
                <th className="py-3.5 px-4 sm:px-5 w-[30%]">Administrator</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[18%]">Assigned Role</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[20%]">Last Login</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[20%]">Account Status</th>
                <th className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap w-[12%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-[#2B2B2B]">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 sm:px-5 align-middle">
                    <div className="font-extrabold text-[#2B2B2B]">{u.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 align-middle whitespace-nowrap">
                    <span
                      className={`inline-block font-extrabold px-2.5 py-1 rounded-md text-[10px] uppercase border ${
                        u.role === 'Support Staff'
                          ? 'text-blue-700 bg-blue-50 border-blue-200'
                          : 'text-[#FF5401] bg-orange-50 border-[#FF5401]/20'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 align-middle text-slate-600 font-bold whitespace-nowrap">{u.lastLogin}</td>
                  <td className="py-3.5 px-4 sm:px-5 align-middle whitespace-nowrap">
                    {u.status === 'Pending' ? (
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300"
                          title="Single-use setup link dispatched via email. Awaiting password creation and MFA."
                        >
                          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                          <span>Pending Setup</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleResendSetup(u.email)}
                          className="text-[10px] text-[#FF5401] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                          title="Dispatches a fresh single-use time-limited link (15 mins)"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Resend link</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-all ${
                          u.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{u.status}</span>
                      </button>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 align-middle text-right whitespace-nowrap space-x-1">
                    {u.status === 'Pending' && (
                      <button
                        onClick={() => handleResendSetup(u.email)}
                        className="p-1.5 rounded-lg text-[#FF5401] hover:bg-orange-50 cursor-pointer inline-flex items-center"
                        title="Resend Secure Single-Use Setup Email (15-min expiry)"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer inline-flex items-center"
                      title="Edit User & Permissions"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleTriggerResetPwd(u)}
                      className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 cursor-pointer inline-flex items-center"
                      title={u.status === 'Pending' ? 'Resend Setup Link' : 'Reset Password'}
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* AUDIT TRAIL TAB */
        <>

          {/* Audit Filter Toolbar */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-7 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                  placeholder="Search audit trail by account code, details, IP address..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-[#2B2B2B] focus:outline-none font-mono"
                />
              </div>

              <div className="md:col-span-5">
                <select
                  value={auditFilter}
                  onChange={e => setAuditFilter(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Authentication Events</option>
                  <option value="ADMIN">Admin First-Time Setup &amp; Activation Events</option>
                  <option value="LOGIN">Login Activities (Success &amp; Failure)</option>
                  <option value="LOCKOUT">Account Lockouts (30-Minute Policy)</option>
                  <option value="MFA">MFA / OTP Verifications</option>
                  <option value="PASSWORD">Password Changes &amp; Warnings</option>
                  <option value="SESSION">15-Min Session Timeouts</option>
                  <option value="RECOVERY">Account Recoveries</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#E5E7EB]">
                    <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[16%]">Event ID &amp; Timestamp</th>
                    <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[15%]">Event Type</th>
                    <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[15%]">Target Account</th>
                    <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[10%]">Status</th>
                    <th className="py-3.5 px-4 sm:px-5 w-[30%]">Policy Enforcement Details</th>
                    <th className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap w-[14%]">Client / IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[#2B2B2B]">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                        No audit events matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map(log => {
                      const isSuccess = log.status === 'SUCCESS';
                      const isFailure = log.status === 'FAILURE';
                      const isSecurityAlert = log.status === 'SECURITY_ALERT';

                      return (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 sm:px-5 align-middle whitespace-nowrap">
                            <div className="font-mono font-bold text-[#FF5401] text-[11px]">{log.id}</div>
                            <div className="text-[10px] text-slate-500 font-medium mt-0.5">{log.timestamp}</div>
                          </td>
                          <td className="py-3.5 px-4 sm:px-5 align-middle whitespace-nowrap">
                            <span className="font-bold text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800">
                              {log.eventType.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 sm:px-5 align-middle font-mono font-bold text-[#2B2B2B] whitespace-nowrap">
                            {log.accountIdentifier}
                          </td>
                          <td className="py-3.5 px-4 sm:px-5 align-middle whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isSuccess
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isFailure
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : isSecurityAlert
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200 font-extrabold'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 sm:px-5 align-middle text-slate-700 font-medium">
                            <div className="line-clamp-2 leading-relaxed" title={log.details}>
                              {log.details}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 sm:px-5 align-middle text-right text-[11px] font-mono text-slate-500 whitespace-nowrap">
                            <div>{log.ipAddress}</div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Admin User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-[#2B2B2B]">
                {editingUser ? 'Edit Administrator Profile' : 'Add New Administrator Account'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {!editingUser && (
                <div className="bg-orange-50/80 p-3 rounded-2xl border border-[#FF5401]/20 text-[11px] text-[#2B2B2B] leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#FF5401]">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Secure First-Time Setup Workflow</span>
                  </div>
                  <p className="text-slate-600">
                    New administrators start with <strong>Status: Pending</strong> and <strong>no password</strong>. A single-use, 15-minute link is dispatched to their email. Activation requires registered email validation, strong password creation, and mandatory MFA setup.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Engr. Roberto Santos"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@clarkelectric.ph"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Assign Role</label>
                <select
                  value={role}
                  onChange={e => handleRoleChange(e.target.value as any)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
                >
                  <option value="Admin">Admin</option>
                  <option value="Support Staff">Support Staff</option>
                </select>
              </div>

              {/* Module Permissions Matrix */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block text-[10px] font-extrabold uppercase text-[#2B2B2B]">
                  Module Access Permissions
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                  {Object.keys(permissions).map(key => (
                    <label key={key} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(permissions as any)[key]}
                        onChange={e => setPermissions({ ...permissions, [key]: e.target.checked })}
                        className="rounded text-[#FF5401] focus:ring-0 cursor-pointer"
                      />
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Save Admin User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Dialog */}
      {resetPwdUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#FF5401] flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#2B2B2B]">Reset Password</h3>
                <p className="text-xs text-slate-400">Temporary password generated for {resetPwdUser.name}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Temporary Password</span>
              <div className="font-mono text-base font-black text-[#FF5401] select-all">{generatedTempPwd}</div>
              <p className="text-[10px] text-slate-500 font-medium">User will be prompted to change password on next login.</p>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setResetPwdUser(null)}
                className="w-full py-2.5 rounded-xl bg-[#FF5401] text-white font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
