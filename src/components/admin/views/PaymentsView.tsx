import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Printer,
  X,
  Building2,
  Wallet,
} from 'lucide-react';
import { PaymentTransactionRecord } from '../../../types';
import { PAYMENT_TRANSACTIONS_LIST } from '../../../data/adminMockData';

interface PaymentsViewProps {
  searchQuery?: string;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ searchQuery = '' }) => {
  const [transactions, setTransactions] = useState<PaymentTransactionRecord[]>(PAYMENT_TRANSACTIONS_LIST);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransactionRecord | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const query = (localSearch || searchQuery).toLowerCase();

  const filteredTxns = transactions.filter(t => {
    const matchesQuery =
      t.transactionRef.toLowerCase().includes(query) ||
      t.customerName.toLowerCase().includes(query) ||
      t.accountNumber.toLowerCase().includes(query) ||
      t.gatewayRef.toLowerCase().includes(query);

    const matchesChannel = channelFilter === 'ALL' || t.paymentChannel === channelFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusStatusNormalize(t.status, statusFilter);

    return matchesQuery && matchesChannel && matchesStatus;
  });

  function statusStatusNormalize(actual: string, filter: string) {
    if (filter === 'ALL') return actual;
    return filter;
  }

  const handlePrintReceipt = () => {
    window.print();
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Today's Collections</span>
          <div className="text-2xl font-black text-[#2B2B2B]">₱1,240,500.00</div>
          <span className="text-[11px] text-emerald-600 font-bold">+8.4% vs Yesterday</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GCash Share</span>
          <div className="text-2xl font-black text-emerald-600">62.4%</div>
          <span className="text-[11px] text-slate-500 font-medium">Digital Gateway Leader</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Maya Share</span>
          <div className="text-2xl font-black text-[#FF5401]">24.1%</div>
          <span className="text-[11px] text-slate-500 font-medium">Wallet Interoperable</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transaction Success Rate</span>
          <div className="text-2xl font-black text-blue-600">99.1%</div>
          <span className="text-[11px] text-emerald-600 font-bold">Zero gateway outages</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search by receipt #, customer name, account #, gateway ref..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-[#2B2B2B] focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Payment Channels</option>
              <option value="GCash">GCash</option>
              <option value="Maya">Maya</option>
              <option value="ECPay">ECPay</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Over-the-Counter">Over-the-Counter</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#E5E7EB]">
                <th className="py-3.5 px-4">Receipt Ref #</th>
                <th className="py-3.5 px-4">Customer & Account</th>
                <th className="py-3.5 px-4">Amount Paid</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                    No payment transactions found
                  </td>
                </tr>
              ) : (
                filteredTxns.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#FF5401]">{t.transactionRef}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-[#2B2B2B]">{t.customerName}</div>
                      <div className="text-[10px] text-slate-500">Acc #{t.accountNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-800 text-sm">
                      ₱{t.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                        {t.paymentChannel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-bold">{t.paymentDate}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          t.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : t.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTxn(t)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-[#FF5401] text-[#FF5401] hover:text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Receipt Audit Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#FF5401]" />
                <h3 className="font-extrabold text-sm text-[#2B2B2B]">Official Electronic Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-3 font-mono text-xs">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-black text-[#2B2B2B]">CLARK ELECTRIC DISTRIBUTION CORP</p>
                <p className="text-[10px] text-slate-500">Tax Identification: 004-912-384-000</p>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt Ref:</span>
                  <strong className="text-[#2B2B2B]">{selectedTxn.transactionRef}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway Ref:</span>
                  <strong className="text-slate-700">{selectedTxn.gatewayRef}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account No:</span>
                  <strong className="text-[#2B2B2B]">{selectedTxn.accountNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <strong className="text-[#2B2B2B]">{selectedTxn.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Channel:</span>
                  <strong className="text-[#2B2B2B]">{selectedTxn.paymentChannel}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date/Time:</span>
                  <span className="text-slate-700">{selectedTxn.paymentDate}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-slate-300 flex justify-between items-center text-sm">
                <span className="font-black text-[#2B2B2B]">TOTAL PAID:</span>
                <span className="font-black text-[#FF5401] text-base">
                  ₱{selectedTxn.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
