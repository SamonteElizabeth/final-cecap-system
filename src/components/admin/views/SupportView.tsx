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
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { SupportConcern } from '../../../types';

interface SupportViewProps {
  searchQuery?: string;
}

export const SupportView: React.FC<SupportViewProps> = ({ searchQuery = '' }) => {
  const { supportConcerns, updateSupportConcernStatus } = useApp();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Submitted' | 'In Progress' | 'Resolved' | 'Closed'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'Low' | 'Medium' | 'High' | 'Emergency'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportConcern | null>(null);

  // Form State inside Modal
  const [ticketStatus, setTicketStatus] = useState<SupportConcern['status']>('In Progress');
  const [assignedStaff, setAssignedStaff] = useState('Clarissa Fernandez');
  const [adminResponseText, setAdminResponseText] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const query = (localSearch || searchQuery).toLowerCase();

  const filteredTickets = supportConcerns.filter(t => {
    const matchesQuery =
      t.ticketNumber.toLowerCase().includes(query) ||
      t.subject.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.accountNumber.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;

    return matchesQuery && matchesStatus && matchesCategory;
  });

  const openTicketModal = (t: SupportConcern) => {
    setSelectedTicket(t);
    setTicketStatus(t.status);
    setAdminResponseText(t.adminResponse || '');
  };

  const handleSaveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    updateSupportConcernStatus(selectedTicket.id, ticketStatus, adminResponseText);
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
          <span className="text-[11px] text-slate-500 font-medium">Logged in portal</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending / Submitted</span>
          <div className="text-2xl font-black text-[#FF5401]">
            {supportConcerns.filter(t => t.status === 'Submitted').length}
          </div>
          <span className="text-[11px] text-amber-600 font-bold">Needs agent dispatch</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
          <div className="text-2xl font-black text-blue-600">
            {supportConcerns.filter(t => t.status === 'In Progress').length}
          </div>
          <span className="text-[11px] text-blue-600 font-bold">Active investigation</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resolved Tickets</span>
          <div className="text-2xl font-black text-emerald-600">
            {supportConcerns.filter(t => t.status === 'Resolved' || t.status === 'Closed').length}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">100% SLA target</span>
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
              <option value="Submitted">Submitted (Pending)</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
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
                <th className="py-3.5 px-4">Ticket Ref #</th>
                <th className="py-3.5 px-4">Subject & Customer</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date Submitted</th>
                <th className="py-3.5 px-4">Assigned Staff</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                    No support tickets match your filter criteria
                  </td>
                </tr>
              ) : (
                filteredTickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#FF5401]">{t.ticketNumber}</td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-extrabold text-[#2B2B2B] truncate">{t.subject}</div>
                      <div className="text-[10px] text-slate-500">Acc #{t.accountNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-bold">{t.createdAt}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-bold">Clarissa Fernandez</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          t.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : t.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openTicketModal(t)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-[#FF5401] text-[#FF5401] hover:text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage Ticket</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Drawer/Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-end animate-fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-[#FF5401]">{selectedTicket.ticketNumber}</span>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-[#2B2B2B] mt-1">{selectedTicket.subject}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Customer Concern Card */}
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Customer Account: <strong>#{selectedTicket.accountNumber}</strong></span>
                  <span>Submitted: <strong>{selectedTicket.createdAt}</strong></span>
                </div>
                <div className="pt-2 border-t border-slate-200 text-xs font-medium text-[#2B2B2B] leading-relaxed">
                  {selectedTicket.description}
                </div>
                {selectedTicket.attachmentName && (
                  <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#FF5401]">
                    <FileText className="w-4 h-4" />
                    <span>Attachment: {selectedTicket.attachmentName}</span>
                  </div>
                )}
              </div>

              {/* Update & Response Form */}
              <form onSubmit={handleSaveTicket} className="space-y-4">
                <h4 className="font-extrabold text-xs text-[#2B2B2B] uppercase tracking-wider">
                  Admin Resolution & Response
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                      Update Ticket Status
                    </label>
                    <select
                      value={ticketStatus}
                      onChange={e => setTicketStatus(e.target.value as any)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
                    >
                      <option value="Submitted">Submitted (Pending)</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                      Assign Lead Agent
                    </label>
                    <select
                      value={assignedStaff}
                      onChange={e => setAssignedStaff(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
                    >
                      <option value="Clarissa Fernandez">Clarissa Fernandez (Support)</option>
                      <option value="Teresa Gonzales">Teresa Gonzales (Ops Lead)</option>
                      <option value="Engr. Michael Tan">Engr. Michael Tan (Field Tech)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                    Customer Response Message
                  </label>
                  <textarea
                    rows={4}
                    value={adminResponseText}
                    onChange={e => setAdminResponseText(e.target.value)}
                    placeholder="Type official response or resolution notes to send to customer..."
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-3 text-xs font-medium text-[#2B2B2B] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Save & Dispatch Response</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
