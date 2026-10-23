import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { submitSupportConcern } from '../../services/api';
import { MOCK_FAQS } from '../../data/mockBillingData';
import { SELF_SERVICE_GUIDES_LIST } from '../../data/adminMockData';
import { SupportConcern } from '../../types';
import { 
  Paperclip, CheckCircle2, Search, Send, Plus, Eye, X, 
  ChevronRight, ChevronDown, Lock, AlertTriangle, BookOpen, 
  Clock, Calendar, FileText, Tag, MessageSquare, ShieldCheck
} from 'lucide-react';

export const SupportView: React.FC = () => {
  const { selectedAccount, user, supportConcerns, addSupportConcern } = useApp();

  const [activeTab, setActiveTab] = useState<'TICKET' | 'FAQS' | 'GUIDES' | 'OUTAGES'>('TICKET');

  // Support Modal State
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SupportConcern | null>(null);

  // Support Form State
  const [category, setCategory] = useState<'Billing Concern' | 'Service Complaint' | 'Payment Concern' | 'Meter Concern' | 'Power Outage' | 'Others'>('Billing Concern');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // FAQ Search
  const [faqQuery, setFaqQuery] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    setIsSubmitting(true);
    const res = await submitSupportConcern({
      accountNumber: selectedAccount.accountNumber,
      category,
      subject,
      description,
      attachmentName: attachmentName || undefined,
    });
    setIsSubmitting(false);

    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newTicket: SupportConcern = {
      id: res.ticket?.id || `CONCERN-${Date.now()}`,
      ticketNumber: res.ticket?.ticketNumber || `TK-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      accountNumber: selectedAccount.accountNumber,
      customerName: user?.name || 'Juan Dela Cruz',
      customerAddress: selectedAccount.serviceAddress,
      serviceType: selectedAccount.serviceType,
      category,
      subject,
      description,
      status: 'Submitted',
      createdAt: nowStr,
      attachmentName: attachmentName || undefined,
      assignedStaff: 'Clarissa Fernandez',
    };

    addSupportConcern(newTicket);

    // Reset Form & Close Modal
    setSubject('');
    setDescription('');
    setAttachmentName(null);
    setCategory('Billing Concern');
    setIsSupportModalOpen(false);

    setToastMsg(`Support Request #${newTicket.ticketNumber} submitted successfully!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const filteredFaqs = MOCK_FAQS.filter(
    f => f.question.toLowerCase().includes(faqQuery.toLowerCase()) || f.answer.toLowerCase().includes(faqQuery.toLowerCase())
  );

  // Customer's Submitted Support Requests
  const customerRequests = supportConcerns.filter(
    c => !selectedAccount || c.accountNumber === selectedAccount.accountNumber || user?.linkedAccounts?.some(a => a.accountNumber === c.accountNumber)
  );

  const getStatusBadge = (status: SupportConcern['status']) => {
    switch (status) {
      case 'Pending':
      case 'Submitted':
        return (
          <span className="bg-amber-50 text-amber-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
      case 'In Progress':
        return (
          <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            In Progress
          </span>
        );
      case 'Solved':
      case 'Resolved':
        return (
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Solved
          </span>
        );
      case 'Closed':
        return (
          <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Closed
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-12 w-full">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg font-semibold text-xs flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-white hover:text-slate-200 p-1 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Tab Bar Navigation */}
      <div className="bg-[#F0F2F5] p-1.5 rounded-2xl flex items-center justify-center gap-1 text-xs font-semibold w-full max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('TICKET')}
          className={`flex-1 py-2 px-3 md:px-4 rounded-xl text-center whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'TICKET'
              ? 'bg-white text-[#FF5401] shadow-xs font-semibold border-t-2 border-[#FF5401]'
              : 'text-slate-600 hover:text-[#2B2B2B] hover:bg-white/50'
          }`}
        >
          Support
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('FAQS')}
          className={`flex-1 py-2 px-3 md:px-4 rounded-xl text-center whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'FAQS'
              ? 'bg-white text-[#FF5401] shadow-xs font-semibold border-t-2 border-[#FF5401]'
              : 'text-slate-600 hover:text-[#2B2B2B] hover:bg-white/50'
          }`}
        >
          FAQs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('GUIDES')}
          className={`flex-1 py-2 px-3 md:px-4 rounded-xl text-center whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'GUIDES'
              ? 'bg-white text-[#FF5401] shadow-xs font-semibold border-t-2 border-[#FF5401]'
              : 'text-slate-600 hover:text-[#2B2B2B] hover:bg-white/50'
          }`}
        >
          Self-Help
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('OUTAGES')}
          className={`flex-1 py-2 px-3 md:px-4 rounded-xl text-center whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'OUTAGES'
              ? 'bg-white text-[#FF5401] shadow-xs font-semibold border-t-2 border-[#FF5401]'
              : 'text-slate-600 hover:text-[#2B2B2B] hover:bg-white/50'
          }`}
        >
          Outages
        </button>
      </div>

      {/* 1. SUPPORT TAB CONTENT */}
      {activeTab === 'TICKET' && (
        <div className="space-y-5 animate-fade-in">
          {/* Header Bar with “+ Support” Button */}
          <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-[#2B2B2B]">Support Requests</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage and track submitted support tickets for Account <span className="font-mono font-semibold text-[#FF5401]">#{selectedAccount?.accountNumber}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              className="bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-xs px-4 py-2.5 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Support</span>
            </button>
          </div>

          {/* Customer's Submitted Support Requests Table / Cards */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            {customerRequests.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5401] flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-[#2B2B2B]">No Support Requests Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven't submitted any support tickets for this account yet. Click the "+ Support" button above to send a request.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(true)}
                  className="bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Support</span>
                </button>
              </div>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#E5E7EB]">
                        <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[14%]">Reference No.</th>
                        <th className="py-3.5 px-4 sm:px-5 w-[30%]">Subject</th>
                        <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[14%]">Category</th>
                        <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[13%]">Date Submitted</th>
                        <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[11%]">Status</th>
                        <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[11%]">Last Update</th>
                        <th className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap w-[7%]">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-[#2B2B2B]">
                      {customerRequests.map(ticket => {
                        const lastUpdate = ticket.adminRespondedAt || ticket.createdAt;

                        return (
                          <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 sm:px-5 align-middle font-mono font-bold text-[#FF5401] whitespace-nowrap">
                              {ticket.ticketNumber}
                            </td>
                            <td className="py-3.5 px-4 sm:px-5 align-middle">
                              <div className="font-extrabold text-[#2B2B2B] line-clamp-1" title={ticket.subject}>
                                {ticket.subject}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 sm:px-5 align-middle whitespace-nowrap">
                              <span className="bg-[#F5F5F5] text-slate-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-md border border-[#E5E7EB]">
                                {ticket.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 sm:px-5 align-middle text-slate-600 font-bold whitespace-nowrap">
                              {ticket.createdAt}
                            </td>
                            <td className="py-3.5 px-4 sm:px-5 align-middle whitespace-nowrap">
                              {getStatusBadge(ticket.status)}
                            </td>
                            <td className="py-3.5 px-4 sm:px-5 align-middle text-slate-500 whitespace-nowrap">
                              {lastUpdate}
                            </td>
                            <td className="py-3.5 px-4 sm:px-5 align-middle text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setSelectedRequest(ticket)}
                                className="bg-orange-50 hover:bg-[#FF5401] text-[#FF5401] hover:text-white px-3 py-1.5 rounded-xl font-bold text-xs border border-[#FF5401]/20 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden divide-y divide-[#E5E7EB]">
                  {customerRequests.map(ticket => {
                    const lastUpdate = ticket.adminRespondedAt || ticket.createdAt;

                    return (
                      <div key={ticket.id} className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-semibold text-xs text-[#FF5401]">
                            {ticket.ticketNumber}
                          </span>
                          {getStatusBadge(ticket.status)}
                        </div>

                        <div>
                          <h4 className="font-semibold text-xs text-[#2B2B2B] leading-snug">
                            {ticket.subject}
                          </h4>
                          <span className="inline-block bg-[#F5F5F5] text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-[#E5E7EB] mt-1">
                            {ticket.category}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Date Submitted</span>
                            <span>{ticket.createdAt}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Last Update</span>
                            <span>{lastUpdate}</span>
                          </div>
                        </div>

                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedRequest(ticket)}
                            className="w-full bg-orange-50 hover:bg-orange-100 text-[#FF5401] py-2 px-3 rounded-xl font-semibold text-xs border border-[#FF5401]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. FAQS TAB */}
      {activeTab === 'FAQS' && (
        <div className="space-y-4">
          <div className="relative max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={faqQuery}
              onChange={e => setFaqQuery(e.target.value)}
              placeholder="Search FAQs (billing, payment, meter)..."
              className="w-full bg-white border border-[#E5E7EB] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFaqs.map(faq => (
              <details key={faq.id} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4 group">
                <summary className="font-semibold text-xs text-[#2B2B2B] cursor-pointer list-none flex justify-between items-center gap-2">
                  <span>{faq.question}</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform shrink-0">▼</span>
                </summary>
                <p className="text-xs text-slate-600 mt-2.5 pt-2 border-t border-[#E5E7EB] leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* 3. SELF-HELP GUIDES */}
      {activeTab === 'GUIDES' && (
        <div className="space-y-3">
          {SELF_SERVICE_GUIDES_LIST.map(guide => (
            <details key={guide.id} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs p-4 group">
              <summary className="font-semibold text-xs text-[#2B2B2B] cursor-pointer list-none flex justify-between items-center gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-orange-50 text-[#FF5401] rounded-md uppercase shrink-0">
                    {guide.category}
                  </span>
                  <span className="truncate">{guide.title}</span>
                </div>
                <span className="text-slate-400 group-open:rotate-180 transition-transform shrink-0">▼</span>
              </summary>
              <div className="text-xs text-slate-600 mt-3 pt-2.5 border-t border-[#E5E7EB] leading-relaxed space-y-2">
                <p className="font-medium text-slate-700">{guide.summary}</p>
                {guide.content && (
                  <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200/80 text-slate-800 whitespace-pre-line mt-2">
                    {guide.content}
                  </div>
                )}
                <div className="text-[10px] text-slate-400 pt-1 flex justify-between items-center">
                  <span>Estimated read: {guide.readTime}</span>
                  <span>{guide.viewsCount} readers</span>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}

      {/* 4. LIVE OUTAGE STATUS */}
      {activeTab === 'OUTAGES' && (
        <div className="space-y-3">
          <div className="bg-emerald-50 border border-[#22C55E]/30 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#22C55E] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-emerald-950">Clark Freeport Zone Substation Status</h4>
              <p className="text-[11px] text-emerald-800">All 5 Main Feeders Operating Normally (100% Grid Power)</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs space-y-2">
            <h4 className="font-bold text-xs text-[#2B2B2B] uppercase tracking-wider">Scheduled Substation Preventive Maintenance</h4>
            <div className="p-3 bg-[#F5F5F5] rounded-xl border border-[#E5E7EB] text-xs text-slate-700 space-y-1">
              <div className="flex justify-between font-bold">
                <span>Feeder 3 - Berthaphil Industrial Zone</span>
                <span className="text-[#F59E0B]">Aug 08, 2026</span>
              </div>
              <p className="text-[11px] text-slate-500">Duration: 08:00 AM - 12:00 PM (4 hours)</p>
              <p className="text-[11px] text-slate-600">Scope: High-voltage insulator replacement & line clearing.</p>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT REQUEST MODAL (TRIGGERED BY "+ SUPPORT" BUTTON) */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-lg w-full p-6 space-y-5 my-8 relative">
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-[#2B2B2B]">Support Request</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit an inquiry or technical ticket for Account <span className="font-mono font-semibold text-[#FF5401]">#{selectedAccount?.accountNumber}</span>
              </p>
            </div>

            <form onSubmit={handleSupportSubmit} className="space-y-4">
              {/* Support Category */}
              <div>
                <label className="block text-xs font-semibold text-[#2B2B2B] mb-1.5">Support Category *</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401] focus:bg-white appearance-none pr-10 cursor-pointer"
                  >
                    <option value="Billing Concern">Billing Concern (Unclear charges, high reading)</option>
                    <option value="Service Complaint">Service Complaint (Voltage fluctuation, tree trimming)</option>
                    <option value="Payment Concern">Payment Concern (Unposted payment, OR missing)</option>
                    <option value="Meter Concern">Meter Concern (Digital meter fault, seal broken)</option>
                    <option value="Power Outage">Power Outage (Unscheduled blackouts, line trip)</option>
                    <option value="Others">Others</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-[#2B2B2B] mb-1.5">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Brief summary of your inquiry"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#2B2B2B] placeholder:text-slate-400 focus:outline-none focus:border-[#FF5401] focus:bg-white"
                  required
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-semibold text-[#2B2B2B] mb-1.5">Detailed Description *</label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    maxLength={1000}
                    rows={4}
                    placeholder="Provide details, dates, or specific meter readings..."
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#2B2B2B] placeholder:text-slate-400 focus:outline-none focus:border-[#FF5401] focus:bg-white resize-none"
                    required
                  ></textarea>
                  <div className="text-[10px] text-slate-400 text-right mt-1 font-medium">
                    {description.length}/1000
                  </div>
                </div>
              </div>

              {/* Optional Attachment */}
              <div>
                <label className="block text-xs font-semibold text-[#2B2B2B] mb-1.5">Photo / Document Attachment (Optional)</label>
                <label className="flex flex-col items-center justify-center p-3.5 border border-slate-200 hover:border-[#FF5401]/60 rounded-xl cursor-pointer bg-[#F8FAFC] hover:bg-orange-50/40 text-xs transition-colors">
                  <div className="flex items-center gap-2 text-[#FF5401] font-semibold text-xs mb-0.5">
                    <Paperclip className="w-4 h-4" />
                    <span>{attachmentName ? attachmentName : 'Attach Photo or Billing Document'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">JPG, PNG, PDF up to 10MB</span>
                  <input type="file" onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl border border-[#E5E7EB] text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FF5401] hover:bg-[#E54A00] disabled:opacity-60 text-white font-semibold text-xs px-5 py-2.5 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Support Request'}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] pt-1 border-t border-slate-100">
                <Lock className="w-3 h-3" />
                <span>Your information is protected by Clark Electric customer privacy policy.</span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SUPPORT REQUEST DETAILS MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-lg w-full p-6 space-y-4 my-8 relative">
            <button
              type="button"
              onClick={() => setSelectedRequest(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="border-b border-[#E5E7EB] pb-3.5 pr-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-semibold text-sm text-[#FF5401]">
                  #{selectedRequest.ticketNumber}
                </span>
                {getStatusBadge(selectedRequest.status)}
              </div>
              <h3 className="text-base font-semibold text-[#2B2B2B]">
                {selectedRequest.subject}
              </h3>
            </div>

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E5E7EB]">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Customer Full Name</span>
                <span className="font-semibold text-[#2B2B2B]">{selectedRequest.customerName || user?.name || 'Juan Dela Cruz'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Service Type</span>
                <span className="font-semibold text-[#2B2B2B]">{selectedRequest.serviceType || selectedAccount?.serviceType || 'Residential'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Service Address</span>
                <span className="font-medium text-slate-700 leading-snug">{selectedRequest.customerAddress || selectedAccount?.serviceAddress || 'Block 12 Lot 5, Berthaphil Industrial Park, Clark Freeport Zone, Pampanga'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Category</span>
                <span className="font-semibold text-[#2B2B2B]">{selectedRequest.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Account Number</span>
                <span className="font-mono font-semibold text-[#2B2B2B]">#{selectedRequest.accountNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Date Submitted</span>
                <span className="text-slate-600">{selectedRequest.createdAt}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Last Update</span>
                <span className="text-slate-600">{selectedRequest.adminRespondedAt || selectedRequest.createdAt}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Customer Inquiry Description
              </span>
              <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] text-slate-700 leading-relaxed whitespace-pre-line text-xs">
                {selectedRequest.description}
              </div>
            </div>

            {/* Attachment if present */}
            {selectedRequest.attachmentName && (
              <div className="flex items-center gap-2 p-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-600">
                <Paperclip className="w-3.5 h-3.5 text-[#FF5401]" />
                <span className="font-medium truncate">{selectedRequest.attachmentName}</span>
              </div>
            )}

            {/* Admin Response / Status Update */}
            <div className="space-y-1.5 pt-1 border-t border-[#E5E7EB]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                CEDC Customer Care Resolution Notes
              </span>
              {selectedRequest.adminResponse ? (
                <div className="p-3.5 bg-orange-50/70 border border-[#FF5401]/25 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-orange-200/50">
                    <span className="font-semibold text-[#FF5401] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {selectedRequest.adminName || 'CEDC Customer Care'}
                    </span>
                    <span>{selectedRequest.adminRespondedAt}</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed pt-1 text-xs">
                    {selectedRequest.adminResponse}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 leading-relaxed">
                  Your support request is currently under review by our operations dispatch team. Typical response turnaround is within 24 hours.
                </div>
              )}
            </div>

            {/* Modal Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#2B2B2B] hover:bg-black text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

