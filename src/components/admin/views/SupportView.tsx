import React, { useState } from 'react';
import {
  HelpCircle,
  Filter,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  UserCheck,
  X,
  FileText,
  Tag,
  ShieldAlert,
  User,
  MapPin,
  Zap,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { SupportConcern } from '../../../types';
import { ADMIN_CUSTOMERS_LIST } from '../../../data/adminMockData';

interface SupportViewProps {
  searchQuery?: string;
}

export const SupportView: React.FC<SupportViewProps> = ({ searchQuery = '' }) => {
  const { supportConcerns, updateSupportConcernStatus, adminUser, userRole } = useApp();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'In Progress' | 'Solved'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportConcern | null>(null);

  // Form State inside Modal
  const [ticketStatus, setTicketStatus] = useState<SupportConcern['status']>('Pending');
  const [assignedStaff, setAssignedStaff] = useState('Clarissa Fernandez');
  const [adminResponseText, setAdminResponseText] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const query = (localSearch || searchQuery).toLowerCase();

  const normalizeStatus = (status: string): 'Pending' | 'In Progress' | 'Solved' => {
    if (status === 'Solved' || status === 'Resolved') return 'Solved';
    if (status === 'In Progress') return 'In Progress';
    return 'Pending';
  };

  const getTicketCustomerInfo = (ticket: SupportConcern) => {
    const directName = ticket.customerName;
    const directAddress = ticket.customerAddress;
    const directType = ticket.serviceType;

    const matched = ADMIN_CUSTOMERS_LIST.find(
      c => c.accountNumber === ticket.accountNumber || c.linkedAccounts?.some(la => la.accountNumber === ticket.accountNumber)
    );
    const linked = matched?.linkedAccounts?.find(la => la.accountNumber === ticket.accountNumber);

    const name = directName || matched?.name || 'Juan Dela Cruz';
    const address = directAddress || linked?.serviceAddress || matched?.serviceAddress || 'Block 12 Lot 5, Berthaphil Industrial Park, Clark Freeport Zone, Pampanga';
    const serviceType = directType || linked?.serviceType || matched?.serviceType || 'Residential';

    return { name, address, serviceType };
  };

  const filteredTickets = supportConcerns.filter(t => {
    const cust = getTicketCustomerInfo(t);
    const matchesQuery =
      t.ticketNumber.toLowerCase().includes(query) ||
      t.subject.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.accountNumber.toLowerCase().includes(query) ||
      cust.name.toLowerCase().includes(query) ||
      (t.assignedStaff && t.assignedStaff.toLowerCase().includes(query));

    const currentStatus = normalizeStatus(t.status);
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : currentStatus === statusFilter;

    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;

    return matchesQuery && matchesStatus && matchesCategory;
  });

  // Support Staff Role & Assignment Detection
  const isSupportStaff = userRole === 'support_staff' || adminUser?.role === 'support_staff' || (adminUser?.role as any) === 'Support Staff';
  const currentStaffName = adminUser?.name || 'Clarissa Fernandez';

  const isTicketAssignedToMe = (ticket: SupportConcern | null): boolean => {
    if (!isSupportStaff) return true; // System Admins can manage all tickets
    if (!ticket) return false;
    if (!ticket.assignedStaff) return true; // Unassigned tickets can be managed by available staff
    const assigned = ticket.assignedStaff.trim().toLowerCase();
    const me = currentStaffName.trim().toLowerCase();
    return assigned === me || assigned.includes(me) || me.includes(assigned) || assigned.includes('clarissa');
  };

  const openTicketModal = (t: SupportConcern) => {
    setSelectedTicket(t);
    setTicketStatus(normalizeStatus(t.status));
    setAssignedStaff(t.assignedStaff || adminUser?.name || 'Clarissa Fernandez');
    setAdminResponseText(t.adminResponse || '');
  };

  const handleSaveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    // Support staff can only save tickets assigned to them
    if (isSupportStaff && !isTicketAssignedToMe(selectedTicket)) {
      return;
    }

    // Support staff only updates status & optional remarks, preserving assigned agent
    const finalAssignedStaff = isSupportStaff ? (selectedTicket.assignedStaff || currentStaffName) : assignedStaff;

    updateSupportConcernStatus(selectedTicket.id, ticketStatus, adminResponseText, finalAssignedStaff);
    setSelectedTicket(null);
    setToastMsg(`✅ Ticket ${selectedTicket.ticketNumber} updated successfully! Customer notified.`);
    setTimeout(() => setToastMsg(''), 3500);
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

      {/* Ticket Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Support Tickets</span>
          <div className="text-2xl font-black text-[#2B2B2B]">{supportConcerns.length}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending</span>
          <div className="text-2xl font-black text-[#FF5401]">
            {supportConcerns.filter(t => normalizeStatus(t.status) === 'Pending').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
          <div className="text-2xl font-black text-blue-600">
            {supportConcerns.filter(t => normalizeStatus(t.status) === 'In Progress').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Solved</span>
          <div className="text-2xl font-black text-emerald-600">
            {supportConcerns.filter(t => normalizeStatus(t.status) === 'Solved').length}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search by ticket #, subject, account #..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-[#2B2B2B] focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Solved">Solved</option>
            </select>
          </div>

          <div className="md:col-span-4">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Billing Concern">Billing Concern</option>
              <option value="Service Complaint">Service Complaint</option>
              <option value="Payment Concern">Payment Concern</option>
              <option value="Meter Concern">Meter Concern</option>
              <option value="Power Outage">Power Outage</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Data Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#E5E7EB]">
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[11%]">Ticket Ref #</th>
                <th className="py-3.5 px-4 sm:px-5 w-[24%]">Subject &amp; Customer</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[13%]">Category</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[11%]">Date Submitted</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[15%]">Assigned Staff</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[10%]">Status</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[9%]">Completion Date</th>
                <th className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap w-[7%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-[#2B2B2B]">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-bold">
                    No support tickets match your filter criteria
                  </td>
                </tr>
              ) : (
                filteredTickets.map(t => {
                  const cust = getTicketCustomerInfo(t);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 sm:px-5 align-middle font-mono font-bold text-[#FF5401] whitespace-nowrap">
                        {t.ticketNumber}
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 align-middle">
                        <div className="font-extrabold text-[#2B2B2B] line-clamp-1" title={t.subject}>{t.subject}</div>
                        <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                          {cust.name} • <span className="font-mono">#{t.accountNumber}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 align-middle whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 align-middle text-slate-600 font-bold whitespace-nowrap">
                        {t.createdAt}
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 align-middle text-slate-700 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className={`w-3.5 h-3.5 ${isSupportStaff && isTicketAssignedToMe(t) ? 'text-[#FF5401]' : 'text-slate-400'} shrink-0`} />
                          <span>{t.assignedStaff || 'Clarissa Fernandez'}</span>
                          {isSupportStaff && isTicketAssignedToMe(t) && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-orange-100 text-[#FF5401] border border-[#FF5401]/25">
                              Assigned to You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 align-middle whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            normalizeStatus(t.status) === 'Solved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : normalizeStatus(t.status) === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {normalizeStatus(t.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 align-middle whitespace-nowrap">
                        {t.completionDate ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] bg-emerald-50/80 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{t.completionDate}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 align-middle text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openTicketModal(t)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-[#FF5401] text-[#FF5401] hover:text-white text-xs font-bold transition-all cursor-pointer"
                          title={isSupportStaff && !isTicketAssignedToMe(t) ? 'View Ticket' : 'Manage Ticket'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isSupportStaff && !isTicketAssignedToMe(t) ? 'View' : 'Manage'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Center Modal */}
      {selectedTicket && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTicket(null);
          }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto"
        >
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl p-6 md:p-7 overflow-y-auto space-y-6 my-auto relative border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono font-black text-sm text-[#FF5401]">{selectedTicket.ticketNumber}</span>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {selectedTicket.category}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    normalizeStatus(selectedTicket.status) === 'Solved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : normalizeStatus(selectedTicket.status) === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {normalizeStatus(selectedTicket.status)}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-[#2B2B2B]">{selectedTicket.subject}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Account Details Card */}
            {(() => {
              const selectedCust = getTicketCustomerInfo(selectedTicket);
              return (
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <span>Customer & Service Profile</span>
                    <span className="font-mono text-slate-700 font-bold">Acct #{selectedTicket.accountNumber}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 mb-1">
                        <User className="w-3.5 h-3.5 text-[#FF5401]" />
                        <span>Customer Full Name</span>
                      </div>
                      <div className="text-xs font-black text-[#2B2B2B] truncate" title={selectedCust.name}>
                        {selectedCust.name}
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 mb-1">
                        <Zap className="w-3.5 h-3.5 text-blue-600" />
                        <span>Service Type</span>
                      </div>
                      <div className="inline-block">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${
                          selectedCust.serviceType === 'Commercial'
                            ? 'bg-purple-100 text-purple-700'
                            : selectedCust.serviceType === 'Industrial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {selectedCust.serviceType}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 mb-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Date Submitted</span>
                      </div>
                      <div className="text-xs font-bold text-[#2B2B2B]">
                        {selectedTicket.createdAt}
                      </div>
                    </div>
                  </div>

                  {/* Customer Address */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#FF5401] shrink-0 mt-0.5" />
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Service Address</span>
                      <div className="text-xs font-semibold text-[#2B2B2B] leading-snug">
                        {selectedCust.address}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Customer Concern Description */}
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Inquiry / Problem Description
              </span>
              <div className="text-xs font-medium text-[#2B2B2B] leading-relaxed">
                {selectedTicket.description}
              </div>
              {selectedTicket.attachmentName && (
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#FF5401] border-t border-slate-200 mt-2">
                  <FileText className="w-4 h-4" />
                  <span>Attachment: {selectedTicket.attachmentName}</span>
                </div>
              )}
            </div>

            {/* Update & Response Form */}
            <form onSubmit={handleSaveTicket} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-[#2B2B2B] uppercase tracking-wider">
                  Support Resolution &amp; Response
                </h4>
                {isSupportStaff && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                    isTicketAssignedToMe(selectedTicket)
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {isTicketAssignedToMe(selectedTicket) ? 'Assigned to You' : 'Assigned to Other Staff'}
                  </span>
                )}
              </div>

              {/* Informational banner when Support Staff views ticket assigned to another agent */}
              {isSupportStaff && !isTicketAssignedToMe(selectedTicket) && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">Assigned to Another Agent</span>
                    <span className="text-[11px] text-amber-800 leading-snug">
                      This ticket is assigned to <strong>{selectedTicket.assignedStaff || 'another staff member'}</strong>. Only tickets assigned to you can be updated.
                    </span>
                  </div>
                </div>
              )}

              {/* Role-Aware Form Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Ticket Status */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                    Update Ticket Status
                  </label>
                  <select
                    value={normalizeStatus(ticketStatus)}
                    onChange={e => setTicketStatus(e.target.value as any)}
                    disabled={isSupportStaff && !isTicketAssignedToMe(selectedTicket)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Solved">Solved</option>
                  </select>
                </div>

                {/* 2. Assigned Lead Agent */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                    Assign Lead Agent
                  </label>

                  {isSupportStaff ? (
                    <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#FF5401] shrink-0" />
                      <span className="truncate">{assignedStaff || currentStaffName}</span>
                    </div>
                  ) : (
                    <select
                      value={assignedStaff}
                      onChange={e => setAssignedStaff(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
                    >
                      <option value="Clarissa Fernandez">Clarissa Fernandez (Support Staff)</option>
                      <option value="Engr. Roberto Santos">Engr. Roberto Santos (Admin Lead)</option>
                      <option value="Maria Teresa Gonzales">Maria Teresa Gonzales (Customer Care)</option>
                      <option value="Engr. Michael Tan">Engr. Michael Tan (Field Tech Lead)</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Completion Date when Solved */}
              {selectedTicket.completionDate && (ticketStatus === 'Solved' || selectedTicket.status === 'Solved' || selectedTicket.status === 'Resolved') && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-800 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Completion Date: {selectedTicket.completionDate}</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
                    Auto-Recorded
                  </span>
                </div>
              )}

              {/* 3. Solution Remarks & Customer Response */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  Solution Remarks / Customer Response
                </label>
                <textarea
                  rows={4}
                  value={adminResponseText}
                  onChange={e => setAdminResponseText(e.target.value)}
                  disabled={isSupportStaff && !isTicketAssignedToMe(selectedTicket)}
                  placeholder="Input remarks on the solution made or response to send to customer..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-3 text-xs font-medium text-[#2B2B2B] focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {isSupportStaff && !isTicketAssignedToMe(selectedTicket) ? 'Close' : 'Cancel'}
                </button>
                {(!isSupportStaff || isTicketAssignedToMe(selectedTicket)) ? (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed border border-slate-200"
                    title="Only the assigned agent or Administrator can modify this ticket"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Locked</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
