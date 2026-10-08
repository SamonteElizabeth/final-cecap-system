import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Building2,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  X,
  ExternalLink,
  ShieldAlert,
  UserCheck,
  Clock,
  KeyRound,
  Send,
  Check,
  Sparkles,
  ShieldCheck,
  MapPin,
  RefreshCw,
  FileText,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Database,
} from 'lucide-react';
import { Customer, RegistrationRequest } from '../../../types';
import { ADMIN_CUSTOMERS_LIST } from '../../../data/adminMockData';
import { useApp } from '../../../context/AppContext';

interface CustomerViewProps {
  searchQuery?: string;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ searchQuery = '' }) => {
  const { registrationRequests, approveRegistration, rejectRegistration } = useApp();

  const [activeTab, setActiveTab] = useState<'PENDING_REGISTRATIONS' | 'REGISTERED_CUSTOMERS' | 'REGISTRATION_AUDIT'>('PENDING_REGISTRATIONS');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [customers, setCustomers] = useState<Customer[]>(ADMIN_CUSTOMERS_LIST);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [typeFilter, setTypeFilter] = useState<'All' | 'Residential' | 'Commercial' | 'Industrial'>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

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

  // Filter pending registration requests
  const pendingRequests = registrationRequests.filter(r => r.status === 'Pending' && (
    r.fullName.toLowerCase().includes(query) ||
    r.email.toLowerCase().includes(query) ||
    r.serviceAddress.toLowerCase().includes(query) ||
    r.mobileNumber.toLowerCase().includes(query)
  ));

  // Filter audit registration requests (Approved / Rejected)
  const auditRequests = registrationRequests.filter(r => r.status !== 'Pending' && (
    r.fullName.toLowerCase().includes(query) ||
    r.email.toLowerCase().includes(query) ||
    r.serviceAddress.toLowerCase().includes(query) ||
    (r.accountCode && r.accountCode.toLowerCase().includes(query))
  ));

  // Filter registered active customers
  const filteredCustomers = customers.filter(c => {
    const matchesQuery =
      c.name.toLowerCase().includes(query) ||
      c.accountNumber.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.mobileNumber.toLowerCase().includes(query) ||
      c.meterNumber.toLowerCase().includes(query);

    const matchesType = typeFilter === 'All' || c.serviceType === typeFilter;
    return matchesQuery && matchesType;
  });

  const handleOpenReview = (req: RegistrationRequest) => {
    setSelectedRequest(req);
    setCustomAccountCode('');
    setRejectionReason('');
    setVerificationStatus('idle'); // Reset verification status
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
      setToastMsg(`✅ Registration Approved for ${req.fullName}! Temp Password: ${res.tempPassword} dispatched via ${req.notificationChannel}.`);
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
      ['Name,Account Number,Service Type,Mobile,Email,Registration Date']
        .concat(
          filteredCustomers.map(
            c => `"${c.name}","${c.accountNumber}","${c.serviceType}","${c.mobileNumber}","${c.email}","${c.registeredDate}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CEDC_Customers_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMsg(`✅ Exported ${filteredCustomers.length} customer records to CSV!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const pendingCount = registrationRequests.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-[#2B2B2B] text-white px-4 py-3 rounded-2xl shadow-lg font-bold text-xs flex items-center justify-between border-l-4 border-[#FF5401]">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="text-white hover:text-slate-300 ml-4 font-bold">✕</button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] pb-3">
        <button
          onClick={() => setActiveTab('PENDING_REGISTRATIONS')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'PENDING_REGISTRATIONS'
              ? 'bg-[#FF5401] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#2B2B2B] border border-[#E5E7EB]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Customer Registrations</span>
          {pendingCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'PENDING_REGISTRATIONS' ? 'bg-white text-[#FF5401]' : 'bg-[#FF5401] text-white'
            }`}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('REGISTERED_CUSTOMERS')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'REGISTERED_CUSTOMERS'
              ? 'bg-[#FF5401] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#2B2B2B] border border-[#E5E7EB]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Registered Customers</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {customers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('REGISTRATION_AUDIT')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'REGISTRATION_AUDIT'
              ? 'bg-[#FF5401] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#2B2B2B] border border-[#E5E7EB]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Registration List</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {auditRequests.length}
          </span>
        </button>
      </div>

      {/* Top Filter & Search Controls */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Field */}
          <div className={`${activeTab === 'REGISTERED_CUSTOMERS' ? 'md:col-span-5' : 'md:col-span-6'} relative`}>
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search by customer name, address, email, mobile number..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-[#2B2B2B] focus:outline-none"
            />
          </div>

          {/* Service Type Filter (When in Active Customers) */}
          {activeTab === 'REGISTERED_CUSTOMERS' && (
            <div className="md:col-span-3">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl px-3 py-2 text-xs font-medium text-[#2B2B2B] focus:outline-none"
              >
                <option value="All">All Service Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>
          )}

          {/* View Mode Toggle & Export Button */}
          <div className={`${activeTab === 'REGISTERED_CUSTOMERS' ? 'md:col-span-4' : 'md:col-span-6'} flex items-center justify-end gap-2.5`}>
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
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: PENDING REGISTRATION REQUESTS (CRS ADMIN VERIFICATION) */}
      {activeTab === 'PENDING_REGISTRATIONS' && (
        <div className="space-y-4">
          <div className="bg-orange-50/80 p-4 rounded-2xl border border-[#FF5401]/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#FF5401] shrink-0 mt-0.5" />
            <div className="text-xs text-[#2B2B2B] leading-relaxed">
              <span className="font-bold">CRS Administrator Verification Queue:</span> Review submitted customer registration requests below. Compare applicant details side-by-side with records retrieved from the existing CEDC Billing System before approving or rejecting.
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#E5E7EB] text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-[#2B2B2B]">No Pending Customer Registrations</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All submitted customer registration requests have been reviewed and verified by the CRS Administrator.
              </p>
            </div>
          ) : viewMode === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
              {pendingRequests.map(req => (
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
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Pending Review</span>
                      </span>
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

                    {/* Matching Billing System indicator */}
                    {req.matchingBillingRecord ? (
                      <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                        <div className="flex justify-between items-center font-bold">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            Billing System Match
                          </span>
                          <span className="bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded text-[10px]">
                            {req.matchingBillingRecord.matchConfidence}% Match
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-800 truncate">
                          Matched Acc #: <strong>{req.matchingBillingRecord.accountNumber}</strong> ({req.matchingBillingRecord.customerName})
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
                        <p className="text-[10px] text-rose-700">
                          Will return NOT FOUND during database verification.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#E5E7EB] flex gap-2">
                    <button
                      onClick={() => handleOpenReview(req)}
                      className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="p-4">Request ID</th>
                      <th className="p-4">Applicant Name</th>
                      <th className="p-4">Service Address</th>
                      <th className="p-4">Mobile / Email</th>
                      <th className="p-4">Submitted Date</th>
                      <th className="p-4">Billing Record Match</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-xs font-medium text-[#2B2B2B]">
                    {pendingRequests.map(req => (
                      <tr key={req.id} className="hover:bg-[#F8FAFC] transition-all">
                        <td className="p-4 font-mono font-bold text-[#FF5401]">{req.id}</td>
                        <td className="p-4 font-bold text-[#2B2B2B]">{req.fullName}</td>
                        <td className="p-4 text-slate-600 max-w-xs truncate">{req.serviceAddress}</td>
                        <td className="p-4">
                          <div>{req.mobileNumber}</div>
                          <div className="text-[10px] text-slate-400">{req.email}</div>
                        </td>
                        <td className="p-4 text-slate-500 text-[11px]">{req.submittedAt}</td>
                        <td className="p-4">
                          {req.matchingBillingRecord ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              {req.matchingBillingRecord.matchConfidence}% Match ({req.matchingBillingRecord.accountNumber})
                            </span>
                          ) : (
                            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              No Match (Not Found)
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleOpenReview(req)}
                            className="bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REGISTERED ACTIVE CUSTOMERS */}
      {activeTab === 'REGISTERED_CUSTOMERS' && (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
            {filteredCustomers.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-2xl border border-[#E5E7EB] text-center text-slate-500 text-xs">
                No customer records match your search filter.
              </div>
            ) : (
              filteredCustomers.map(cust => (
                <div
                  key={cust.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-4 space-y-3 hover:border-[#FF5401]/50 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF5401] flex items-center justify-center font-extrabold text-sm shrink-0 border border-orange-200">
                          {cust.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#2B2B2B]">{cust.name}</h4>
                          <span className="font-mono text-xs font-bold text-[#FF5401]">{cust.accountNumber}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cust.serviceType === 'Commercial'
                          ? 'bg-blue-100 text-blue-800'
                          : cust.serviceType === 'Industrial'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {cust.serviceType}
                      </span>
                    </div>

                    <div className="text-xs space-y-2 p-3 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB] text-slate-600">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400 font-medium">Meter Serial No:</span>
                        <span className="font-mono font-bold text-[#2B2B2B]">{cust.meterNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{cust.mobileNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.serviceAddress}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-400 px-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Registered: {cust.registeredDate}
                      </span>
                      <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {cust.linkedAccounts.length} Account{cust.linkedAccounts.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5E7EB]">
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="w-full bg-orange-50 hover:bg-[#FF5401] text-[#FF5401] hover:text-white border border-[#FF5401]/30 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Account Details</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Account Number</th>
                    <th className="p-4">Service Type</th>
                    <th className="p-4">Meter Number</th>
                    <th className="p-4">Contact Mobile / Email</th>
                    <th className="p-4">Registration Date</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-xs font-medium text-[#2B2B2B]">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                        No customer records match your search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(cust => (
                      <tr key={cust.id} className="hover:bg-[#F8FAFC] transition-all">
                        <td className="p-4 font-bold text-[#2B2B2B]">{cust.name}</td>
                        <td className="p-4 font-mono font-bold text-[#FF5401]">{cust.accountNumber}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cust.serviceType === 'Commercial'
                              ? 'bg-blue-100 text-blue-800'
                              : cust.serviceType === 'Industrial'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {cust.serviceType}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-600">{cust.meterNumber}</td>
                        <td className="p-4">
                          <div>{cust.mobileNumber}</div>
                          <div className="text-[10px] text-slate-400">{cust.email}</div>
                        </td>
                        <td className="p-4 text-slate-500">{cust.registeredDate}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedCustomer(cust)}
                            className="p-1.5 hover:bg-orange-50 text-[#FF5401] rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 font-bold text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* TAB 3: REGISTRATION AUDIT HISTORY */}
      {activeTab === 'REGISTRATION_AUDIT' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#2B2B2B] uppercase tracking-wider">Processed Registration Requests Audit Log</h3>
            <span className="text-[11px] text-slate-500">{auditRequests.length} total records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="p-4">Request ID</th>
                  <th className="p-4">Applicant Name</th>
                  <th className="p-4">Service Address</th>
                  <th className="p-4">Submitted At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned Account Code / Rejection Reason</th>
                  <th className="p-4">Reviewed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs font-medium text-[#2B2B2B]">
                {auditRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                      No processed registration requests in audit log yet.
                    </td>
                  </tr>
                ) : (
                  auditRequests.map(req => (
                    <tr key={req.id} className="hover:bg-[#F8FAFC] transition-all">
                      <td className="p-4 font-mono font-bold text-slate-600">{req.id}</td>
                      <td className="p-4 font-bold text-[#2B2B2B]">{req.fullName}</td>
                      <td className="p-4 text-slate-600 max-w-xs truncate">{req.serviceAddress}</td>
                      <td className="p-4 text-slate-500 text-[11px]">{req.submittedAt}</td>
                      <td className="p-4">
                        {req.status === 'Approved' ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-300 flex items-center gap-1 w-max">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono">
                        {req.status === 'Approved' ? (
                          <div className="text-[#FF5401] font-bold">{req.accountCode}</div>
                        ) : (
                          <div className="text-red-600 text-[11px] font-sans font-medium">{req.rejectionReason}</div>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        <div>{req.reviewedBy || 'CRS Administrator'}</div>
                        <div className="text-[10px] text-slate-400">{req.reviewedAt}</div>
                      </td>
                    </tr>
                  ))
                )}
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
                    <p className={`text-xs mt-0.5 ${
                      verificationStatus === 'found'
                        ? 'text-emerald-800'
                        : verificationStatus === 'not_found'
                        ? 'text-rose-800'
                        : verificationStatus === 'verifying'
                        ? 'text-amber-800'
                        : 'text-slate-600'
                    }`}>
                      {verificationStatus === 'idle' && 'Admin must click "Verify Customer" to query the billing system database first.'}
                      {verificationStatus === 'verifying' && 'Searching central billing database for matching customer account records...'}
                      {verificationStatus === 'found' && 'Customer record confirmed in billing system! Both Approve and Reject are now available.'}
                      {verificationStatus === 'not_found' && 'No customer record found in billing system. Reject button is now active.'}
                    </p>
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
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      <span>{verificationStatus === 'idle' ? 'Verify Customer' : 'Re-Verify Customer'}</span>
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
                      <p className="text-[11px] text-slate-500">Click "Verify Customer" above to perform database lookup.</p>
                    </div>
                  )}

                  {verificationStatus === 'verifying' && (
                    <div className="p-8 text-center text-amber-800 text-xs space-y-2">
                      <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                      <p className="font-bold">Searching Billing System Database...</p>
                      <p className="text-[11px] text-amber-600">Cross-referencing address, phone, and meter indexes...</p>
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
                      <p className="text-[11px] text-red-700 max-w-xs mx-auto">
                        No active meter or account matches this applicant in the central database.
                      </p>
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
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Upon clicking <strong>Approve</strong>, an auto-generated temporary password will be created and automatically sent to <strong>{selectedRequest.fullName}</strong> via <strong>{selectedRequest.notificationChannel}</strong> ({selectedRequest.email} / {selectedRequest.mobileNumber}).
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex flex-wrap justify-between items-center gap-2">
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
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve</span>
                    </>
                  )}
                </button>
              </div>
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

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                📢 The customer will receive a notification ({selectedRequest.notificationChannel}) explaining why their registration request was rejected.
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
                  {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CUSTOMER DETAIL MODAL (FOR ACTIVE CUSTOMERS) */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF5401] flex items-center justify-center font-bold text-sm">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2B2B2B]">{selectedCustomer.name}</h3>
                  <p className="text-[11px] font-mono text-[#FF5401] font-bold">{selectedCustomer.accountNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 hover:bg-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E5E7EB]">
                <div>
                  <span className="text-slate-500 text-[10px] font-bold block uppercase">Service Connection</span>
                  <span className="font-bold text-[#2B2B2B]">{selectedCustomer.serviceType}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold block uppercase">Meter Number</span>
                  <span className="font-mono font-bold text-slate-700">{selectedCustomer.meterNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold block uppercase">Mobile Number</span>
                  <span className="font-semibold text-slate-700">{selectedCustomer.mobileNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold block uppercase">Email Address</span>
                  <span className="font-semibold text-slate-700 truncate block">{selectedCustomer.email}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] font-bold block uppercase mb-1">Service Address</span>
                <p className="text-slate-700 font-medium bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E5E7EB]">
                  {selectedCustomer.serviceAddress}
                </p>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] font-bold block uppercase mb-1">Linked Service Accounts ({selectedCustomer.linkedAccounts.length})</span>
                <div className="space-y-1.5">
                  {selectedCustomer.linkedAccounts.map(la => (
                    <div key={la.accountNumber} className="flex justify-between items-center bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E5E7EB]">
                      <div>
                        <div className="font-bold text-[#2B2B2B]">{la.nickname}</div>
                        <div className="font-mono text-[10px] text-slate-500">{la.accountNumber} • Meter: {la.meterNumber}</div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5E7EB] flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="bg-[#2B2B2B] hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
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
