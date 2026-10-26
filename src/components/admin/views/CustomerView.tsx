import React, { useState } from 'react';
import {
  Search,
  Download,
  Eye,
  Building2,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Clock,
  KeyRound,
  Sparkles,
  ShieldCheck,
  MapPin,
  RefreshCw,
  FileText,
  LayoutGrid,
  List,
  Database,
} from 'lucide-react';
import { RegistrationRequest } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface CustomerViewProps {
  searchQuery?: string;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ searchQuery = '' }) => {
  const { registrationRequests, approveRegistration, rejectRegistration } = useApp();

  type RegistrationFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
  const [activeFilter, setActiveFilter] = useState<RegistrationFilter>('ALL');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Verification & Review state for CRS Admin
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'found' | 'not_found'>('idle');
  const [customAccountCode, setCustomAccountCode] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [toastMsg, setToastMsg] = useState('');

  const query = (localSearch || searchQuery).toLowerCase();

  // Counts for the 4 filter cards
  const allCount = registrationRequests.length;
  const pendingCount = registrationRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = registrationRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = registrationRequests.filter(r => r.status === 'Rejected').length;

  // Filter registration requests based on active card filter and search query
  const filteredRequests = registrationRequests.filter(r => {
    if (activeFilter === 'PENDING' && r.status !== 'Pending') return false;
    if (activeFilter === 'APPROVED' && r.status !== 'Approved') return false;
    if (activeFilter === 'REJECTED' && r.status !== 'Rejected') return false;

    if (!query) return true;
    return (
      r.fullName.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query) ||
      r.serviceAddress.toLowerCase().includes(query) ||
      r.mobileNumber.toLowerCase().includes(query) ||
      (r.accountCode && r.accountCode.toLowerCase().includes(query)) ||
      r.id.toLowerCase().includes(query)
    );
  });

  const handleOpenReview = (req: RegistrationRequest) => {
    setSelectedRequest(req);
    setCustomAccountCode('');
    setRejectionReason('');
    if (req.status === 'Approved' || req.status === 'Rejected') {
      setVerificationStatus(req.matchingBillingRecord ? 'found' : 'not_found');
    } else {
      setVerificationStatus('idle'); // Reset verification status for pending
    }
    setShowReviewModal(true);
  };

  const handleVerifyCustomer = () => {
    setVerificationStatus('verifying');
    setTimeout(() => {
      if (selectedRequest?.matchingBillingRecord) {
        setVerificationStatus('found');
      } else {
        setVerificationStatus('not_found');
        setCustomAccountCode('');
      }
    }, 1200);
  };

  const handleApproveRequest = (req: RegistrationRequest) => {
    const approvedAccountCode = req.accountCode || req.matchingBillingRecord?.accountNumber || '0421-9012-34';
    setIsProcessing(true);
    setTimeout(() => {
      const res = approveRegistration(req.id, approvedAccountCode);
      setIsProcessing(false);
      setShowReviewModal(false);
      setSelectedRequest(null);
      setToastMsg(`✅ Registration Approved for ${req.fullName}! Username: ${res.username} • Temp Password: ${res.tempPassword} dispatched via ${req.notificationChannel}.`);
      setTimeout(() => setToastMsg(''), 6000);
    }, 600);
  };

  const handleRejectRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejecting the registration request.');
      return;
    }

    if (!selectedRequest) return;

    setIsProcessing(true);
    setTimeout(() => {
      rejectRegistration(selectedRequest.id, rejectionReason);
      setIsProcessing(false);
      setShowRejectionModal(false);
      setShowReviewModal(false);
      setSelectedRequest(null);
      setToastMsg(`⚠️ Registration request for ${selectedRequest.fullName} was rejected. Customer notified.`);
      setTimeout(() => setToastMsg(''), 5000);
    }, 600);
  };

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Request ID,Applicant Name,Status,Mobile Number,Email,Service Address,Submitted Date,Assigned Account / Rejection Reason']
        .concat(
          filteredRequests.map(
            r => `"${r.id}","${r.fullName}","${r.status}","${r.mobileNumber}","${r.email}","${r.serviceAddress}","${r.submittedAt}","${r.accountCode || r.rejectionReason || '-'}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CEDC_Registrations_${activeFilter}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMsg(`✅ Exported ${filteredRequests.length} registration records to CSV!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-[#2B2B2B] text-white px-4 py-3 rounded-2xl shadow-lg font-bold text-xs flex items-center justify-between border-l-4 border-[#FF5401]">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="text-white hover:text-slate-300 ml-4 font-bold">✕</button>
        </div>
      )}

      {/* Sub-Navigation Card Filter View: 4 Registration Filter Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: All Registrations */}
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
            activeFilter === 'ALL'
              ? 'bg-orange-50/80 border-[#FF5401] ring-2 ring-[#FF5401] shadow-sm'
              : 'bg-white border-[#E5E7EB] hover:border-[#FF5401]/50 hover:shadow-2xs'
          }`}
        >
          <div className="space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              activeFilter === 'ALL' ? 'text-[#FF5401]' : 'text-slate-500'
            }`}>
              All
            </span>
            <div className="text-2xl font-black text-[#2B2B2B] flex items-baseline gap-2">
              <span>{allCount}</span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                Total
              </span>
            </div>
          </div>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
            activeFilter === 'ALL'
              ? 'bg-[#FF5401] text-white shadow-xs'
              : 'bg-orange-50 text-[#FF5401] group-hover:bg-orange-100'
          }`}>
            <FileText className="w-5 h-5" />
          </div>
        </button>

        {/* Card 2: Pending Registration */}
        <button
          type="button"
          onClick={() => setActiveFilter('PENDING')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
            activeFilter === 'PENDING'
              ? 'bg-orange-50/80 border-[#FF5401] ring-2 ring-[#FF5401] shadow-sm'
              : 'bg-white border-[#E5E7EB] hover:border-[#FF5401]/50 hover:shadow-2xs'
          }`}
        >
          <div className="space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              activeFilter === 'PENDING' ? 'text-[#FF5401]' : 'text-slate-500'
            }`}>
              Pending
            </span>
            <div className="text-2xl font-black text-[#2B2B2B] flex items-baseline gap-2">
              <span>{pendingCount}</span>
              {pendingCount > 0 ? (
                <span className="text-[10px] font-bold text-[#FF5401] bg-orange-100 px-2 py-0.5 rounded-full">
                  Needs Review
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Up to date
                </span>
              )}
            </div>
          </div>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
            activeFilter === 'PENDING'
              ? 'bg-[#FF5401] text-white shadow-xs'
              : 'bg-orange-50 text-[#FF5401] group-hover:bg-orange-100'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
        </button>

        {/* Card 3: Approve Registration */}
        <button
          type="button"
          onClick={() => setActiveFilter('APPROVED')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
            activeFilter === 'APPROVED'
              ? 'bg-orange-50/80 border-[#FF5401] ring-2 ring-[#FF5401] shadow-sm'
              : 'bg-white border-[#E5E7EB] hover:border-[#FF5401]/50 hover:shadow-2xs'
          }`}
        >
          <div className="space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              activeFilter === 'APPROVED' ? 'text-[#FF5401]' : 'text-slate-500'
            }`}>
              Approved
            </span>
            <div className="text-2xl font-black text-[#2B2B2B] flex items-baseline gap-2">
              <span>{approvedCount}</span>
            </div>
          </div>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
            activeFilter === 'APPROVED'
              ? 'bg-[#FF5401] text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
          }`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </button>

        {/* Card 4: Rejected Registration */}
        <button
          type="button"
          onClick={() => setActiveFilter('REJECTED')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
            activeFilter === 'REJECTED'
              ? 'bg-orange-50/80 border-[#FF5401] ring-2 ring-[#FF5401] shadow-sm'
              : 'bg-white border-[#E5E7EB] hover:border-[#FF5401]/50 hover:shadow-2xs'
          }`}
        >
          <div className="space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              activeFilter === 'REJECTED' ? 'text-[#FF5401]' : 'text-slate-500'
            }`}>
              Rejected
            </span>
            <div className="text-2xl font-black text-[#2B2B2B] flex items-baseline gap-2">
              <span>{rejectedCount}</span>
            </div>
          </div>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
            activeFilter === 'REJECTED'
              ? 'bg-[#FF5401] text-white shadow-xs'
              : 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'
          }`}>
            <XCircle className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Top Filter & Search Controls */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Field */}
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search registrations by applicant name, account code, address, email, phone..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-[#2B2B2B] focus:outline-none"
            />
          </div>

          {/* View Mode Toggle & Export Button */}
          <div className="md:col-span-4 flex items-center justify-end gap-2.5">
            {/* Card & List Layout Toggle */}
            <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#FF5401] shadow-2xs border border-[#E2E8F0]'
                    : 'text-slate-500 hover:text-[#2B2B2B]'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'card'
                    ? 'bg-white text-[#FF5401] shadow-2xs border border-[#E2E8F0]'
                    : 'text-slate-500 hover:text-[#2B2B2B]'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            <button
              onClick={handleExport}
              className="bg-[#2B2B2B] hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* REGISTRATION LIST OR CARDS VIEW */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E5E7EB] text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-[#2B2B2B]">No Registrations Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No customer registration requests match your current filter or search criteria.
          </p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRequests.map(req => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-4 space-y-3 hover:border-[#FF5401]/50 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#FF5401] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                      {req.id}
                    </span>
                    <h4 className="text-sm font-bold text-[#2B2B2B] mt-1">{req.fullName}</h4>
                  </div>
                  {req.status === 'Pending' && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Pending</span>
                    </span>
                  )}
                  {req.status === 'Approved' && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approved</span>
                    </span>
                  )}
                  {req.status === 'Rejected' && (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      <span>Rejected</span>
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-1.5 pt-1 text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{req.serviceAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{req.mobileNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{req.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Submitted: {req.submittedAt}</span>
                  </div>
                </div>

                {/* Status Specific Details */}
                {req.status === 'Pending' && (
                  req.matchingBillingRecord ? (
                    <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Billing Match
                        </span>
                        <span className="bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded text-[10px]">
                          {req.matchingBillingRecord.matchConfidence}% Match
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-800 truncate">
                        Matched Acc: <strong>{req.matchingBillingRecord.accountNumber}</strong>
                      </p>
                    </div>
                  ) : (
                    <div className="bg-rose-50/80 p-2.5 rounded-xl border border-rose-200 text-[11px] text-rose-900 space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          No Billing Match
                        </span>
                        <span className="bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded text-[10px]">
                          Unindexed
                        </span>
                      </div>
                    </div>
                  )
                )}

                {req.status === 'Approved' && (
                  <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 text-[11px] text-emerald-900">
                    <span className="text-[10px] text-emerald-700 font-bold block uppercase">Assigned Account Code</span>
                    <span className="font-mono font-bold text-[#FF5401] text-xs">{req.accountCode}</span>
                  </div>
                )}

                {req.status === 'Rejected' && (
                  <div className="bg-rose-50/80 p-2.5 rounded-xl border border-rose-200 text-[11px] text-rose-900">
                    <span className="text-[10px] text-rose-700 font-bold block uppercase">Rejection Reason</span>
                    <p className="text-[11px] text-rose-800 line-clamp-2">{req.rejectionReason}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#E5E7EB]">
                {req.status === 'Pending' ? (
                  <button
                    onClick={() => handleOpenReview(req)}
                    className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenReview(req)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-[#2B2B2B] font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>View</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[11%]">Request ID</th>
                  <th className="py-3.5 px-4 sm:px-5 w-[18%]">Applicant Name</th>
                  <th className="py-3.5 px-4 sm:px-5 w-[25%]">Service Address</th>
                  <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[16%]">Mobile / Email</th>
                  <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[12%]">Submitted Date</th>
                  <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[10%]">Status &amp; Details</th>
                  <th className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap w-[8%]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[#2B2B2B]">
                {filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-[#F8FAFC] transition-all">
                    <td className="py-3.5 px-4 sm:px-5 align-middle font-mono font-bold text-[#FF5401] whitespace-nowrap">
                      {req.id}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 align-middle font-extrabold text-[#2B2B2B]">
                      {req.fullName}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 align-middle text-slate-600">
                      <div className="line-clamp-2 leading-relaxed" title={req.serviceAddress}>
                        {req.serviceAddress}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 align-middle whitespace-nowrap">
                      <div className="font-semibold text-slate-700">{req.mobileNumber}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]" title={req.email}>{req.email}</div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 align-middle text-slate-500 text-[11px] whitespace-nowrap">
                      {req.submittedAt}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 align-middle whitespace-nowrap">
                      {req.status === 'Pending' && (
                        <div className="space-y-1">
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                          {req.matchingBillingRecord ? (
                            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Match: {req.matchingBillingRecord.accountNumber}
                            </div>
                          ) : (
                            <div className="text-[10px] text-rose-600 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              No billing match
                            </div>
                          )}
                        </div>
                      )}
                      {req.status === 'Approved' && (
                        <div className="space-y-1">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                          {req.accountCode && (
                            <div className="font-mono text-[11px] font-bold text-[#FF5401]">
                              Acc: {req.accountCode}
                            </div>
                          )}
                        </div>
                      )}
                      {req.status === 'Rejected' && (
                        <div className="space-y-1">
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                          {req.rejectionReason && (
                            <div className="text-[10px] text-rose-700 max-w-[140px] truncate" title={req.rejectionReason}>
                              {req.rejectionReason}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 align-middle text-right whitespace-nowrap">
                      {req.status === 'Pending' ? (
                        <button
                          onClick={() => handleOpenReview(req)}
                          className="bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenReview(req)}
                          className="bg-slate-100 hover:bg-slate-200 text-[#2B2B2B] font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE VERIFICATION & COMPARISON MODAL */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF5401] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2B2B2B]">Verification</h3>
                  <p className="text-[11px] text-slate-500">
                    Registration Request <span className="font-mono font-bold text-[#FF5401]">{selectedRequest.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedRequest(null);
                }}
                className="p-1.5 hover:bg-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Side-by-Side Comparison Grid */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* DATABASE VERIFICATION STEP BAR */}
              <div className={`rounded-2xl p-4 shadow-sm border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                verificationStatus === 'found'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : verificationStatus === 'not_found'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                  : verificationStatus === 'verifying'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                  : 'bg-gradient-to-r from-orange-50/90 via-slate-50 to-orange-50/40 border-orange-200/90 text-[#2B2B2B]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold transition-all shadow-xs ${
                    verificationStatus === 'found'
                      ? 'bg-emerald-600 text-white'
                      : verificationStatus === 'not_found'
                      ? 'bg-rose-600 text-white'
                      : verificationStatus === 'verifying'
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-[#FF5401] text-white'
                  }`}>
                    {verificationStatus === 'verifying' ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : verificationStatus === 'found' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : verificationStatus === 'not_found' ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Database className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#2B2B2B]">
                        Billing System Database Verification
                      </h4>
                      {verificationStatus === 'idle' && (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                          Action Required: Verify Customer
                        </span>
                      )}
                      {verificationStatus === 'verifying' && (
                        <span className="bg-amber-200 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Querying Database...
                        </span>
                      )}
                      {verificationStatus === 'found' && (
                        <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3" /> Status: FOUND
                        </span>
                      )}
                      {verificationStatus === 'not_found' && (
                        <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <XCircle className="w-3 h-3" /> Status: NOT FOUND
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={verificationStatus === 'verifying'}
                  onClick={handleVerifyCustomer}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-sm ${
                    verificationStatus === 'found'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : verificationStatus === 'not_found'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-[#FF5401] hover:bg-[#E54A00] text-white'
                  }`}
                >
                  {verificationStatus === 'verifying' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying…</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      <span>{verificationStatus === 'idle' ? 'Verify' : 'Re-verify'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Submitted Registration Information */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-bold text-[#2B2B2B] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#FF5401]" />
                      Submitted Personal Information
                    </h4>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Customer Input
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-semibold uppercase">Submitted Customer Account Code</span>
                      <span className="font-mono font-bold text-[#FF5401] text-xs">
                        {selectedRequest.accountCode || selectedRequest.matchingBillingRecord?.accountNumber || '0421-9012-34'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] font-semibold uppercase">Full Name</span>
                      <span className="font-bold text-[#2B2B2B] text-sm">{selectedRequest.fullName}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] font-semibold uppercase">Service Address</span>
                      <span className="font-medium text-[#2B2B2B]">{selectedRequest.serviceAddress}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] font-semibold uppercase">Mobile Number</span>
                      <span className="font-mono font-semibold text-[#2B2B2B]">{selectedRequest.mobileNumber}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] font-semibold uppercase">Email Address</span>
                      <span className="font-medium text-[#2B2B2B]">{selectedRequest.email}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] font-semibold uppercase">Notification Channel Preference</span>
                      <span className="bg-white border border-slate-300 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-bold inline-block mt-0.5">
                        {selectedRequest.notificationChannel}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] font-semibold uppercase">Submitted Timestamp</span>
                      <span className="text-slate-600 text-[11px]">{selectedRequest.submittedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Retrieved Billing System Matching Records */}
                <div className={`rounded-2xl p-4 border space-y-3 transition-all ${
                  verificationStatus === 'found'
                    ? 'bg-emerald-50/80 border-emerald-300'
                    : verificationStatus === 'not_found'
                    ? 'bg-red-50/80 border-red-200'
                    : verificationStatus === 'verifying'
                    ? 'bg-amber-50/80 border-amber-200 animate-pulse'
                    : 'bg-slate-50 border-slate-200 opacity-70'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <h4 className="text-xs font-bold flex items-center gap-1.5 text-[#2B2B2B]">
                      <Building2 className="w-4 h-4 text-[#FF5401]" />
                      Retrieved Billing System Record
                    </h4>
                    {verificationStatus === 'found' && selectedRequest.matchingBillingRecord && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {selectedRequest.matchingBillingRecord.matchConfidence}% Match (FOUND)
                      </span>
                    )}
                    {verificationStatus === 'not_found' && (
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        NOT FOUND
                      </span>
                    )}
                  </div>

                  {verificationStatus === 'idle' && (
                    <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                      <Database className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700">Verification Required</p>
                    </div>
                  )}

                  {verificationStatus === 'verifying' && (
                    <div className="p-8 text-center text-amber-800 text-xs space-y-2">
                      <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                      <p className="font-bold">Searching Billing System Database...</p>
                    </div>
                  )}

                  {verificationStatus === 'found' && selectedRequest.matchingBillingRecord && (
                    <div className="space-y-2.5 text-xs text-emerald-950">
                      <div>
                        <span className="text-emerald-700 block text-[10px] font-semibold uppercase">Billing Account Number</span>
                        <span className="font-mono font-bold text-[#FF5401] text-sm">{selectedRequest.matchingBillingRecord.accountNumber}</span>
                      </div>

                      <div>
                        <span className="text-emerald-700 block text-[10px] font-semibold uppercase">Registered Customer Name</span>
                        <span className="font-bold text-emerald-950">{selectedRequest.matchingBillingRecord.customerName}</span>
                      </div>

                      <div>
                        <span className="text-emerald-700 block text-[10px] font-semibold uppercase">Registered Service Address</span>
                        <span className="font-medium text-emerald-900">{selectedRequest.matchingBillingRecord.serviceAddress}</span>
                      </div>

                      <div>
                        <span className="text-emerald-700 block text-[10px] font-semibold uppercase">Meter Serial Number & Status</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{selectedRequest.matchingBillingRecord.meterNumber}</span>
                          <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {selectedRequest.matchingBillingRecord.accountStatus}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-emerald-700 block text-[10px] font-semibold uppercase">Service Connection Type</span>
                        <span className="font-bold">{selectedRequest.matchingBillingRecord.serviceType} Connection</span>
                      </div>
                    </div>
                  )}

                  {verificationStatus === 'not_found' && (
                    <div className="p-6 text-center text-red-800 text-xs space-y-2">
                      <XCircle className="w-8 h-8 text-red-500 mx-auto" />
                      <p className="font-extrabold text-sm text-red-900">NOT FOUND IN BILLING SYSTEM</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Auto-Generated Temporary Password Dispatch Information */}
              {verificationStatus === 'found' && (
                <div className="bg-emerald-50/90 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <span>Auto-Generated Temporary Password Dispatch</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex flex-wrap justify-between items-center gap-2">
              {selectedRequest.status === 'Pending' ? (
                <>
                  <button
                    type="button"
                    disabled={verificationStatus === 'idle' || verificationStatus === 'verifying'}
                    onClick={() => setShowRejectionModal(true)}
                    className={`font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      verificationStatus === 'idle' || verificationStatus === 'verifying'
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                        : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer'
                    }`}
                    title={verificationStatus === 'idle' ? "Please verify customer record first" : "Reject this request"}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewModal(false);
                        setSelectedRequest(null);
                      }}
                      className="bg-[#E5E7EB] hover:bg-slate-300 text-[#2B2B2B] font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={verificationStatus !== 'found' || isProcessing}
                      onClick={() => handleApproveRequest(selectedRequest)}
                      className={`font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 ${
                        verificationStatus !== 'found' || isProcessing
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 shadow-none'
                          : 'bg-[#FF5401] hover:bg-[#E54A00] text-white cursor-pointer'
                      }`}
                      title={verificationStatus !== 'found' ? "Customer must be verified and FOUND in billing system to approve" : "Approve registration"}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Approving…</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="font-bold">Record Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedRequest.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {selectedRequest.status}
                    </span>
                    {selectedRequest.accountCode && (
                      <span className="font-mono text-xs font-bold text-[#FF5401]">
                        ({selectedRequest.accountCode})
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewModal(false);
                      setSelectedRequest(null);
                    }}
                    className="bg-[#2B2B2B] hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {showRejectionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2B2B2B]">Reject Registration Request</h3>
                <p className="text-[11px] text-slate-500">Provide reason for rejecting {selectedRequest.fullName}</p>
              </div>
            </div>

            <form onSubmit={handleRejectRequestSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Reason for Rejection *</label>
                <textarea
                  rows={4}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="e.g. Service address provided does not match any active meter record in CEDC jurisdiction."
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-3 text-xs text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectionModal(false)}
                  className="w-1/3 bg-[#E5E7EB] hover:bg-slate-300 text-[#2B2B2B] font-bold text-xs py-2.5 rounded-2xl transition-all cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-2/3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? 'Rejecting…' : 'Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

