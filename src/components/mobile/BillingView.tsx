import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchBillingHistory } from '../../services/api';
import { BillingHistoryItem } from '../../types';
import { FileText, Download, CheckCircle2, ChevronRight, ArrowDownToLine, Receipt, ChevronDown } from 'lucide-react';
import { CurrentBillCard } from '../common/CurrentBillCard';

export const BillingView: React.FC = () => {
  const { selectedAccount, setPaymentModalOpen } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'CURRENT' | 'HISTORY'>('CURRENT');

  const [historyList, setHistoryList] = useState<BillingHistoryItem[]>([]);
  const [selectedHistoryReceipt, setSelectedHistoryReceipt] = useState<BillingHistoryItem | null>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  useEffect(() => {
    if (!selectedAccount) return;
    fetchBillingHistory(selectedAccount.accountNumber, selectedAccount.serviceType).then(res => {
      if (res.history) setHistoryList(res.history);
    });
  }, [selectedAccount]);

  if (!selectedAccount) return null;

  const currentBill = selectedAccount.currentBill;
  const isPaid = currentBill.status === 'Paid';
  // A settled bill's breakdown is reference-only, so it starts collapsed
  const showBreakdown = !isPaid || isBreakdownOpen;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 md:pb-12 w-full">
      {/* Subtab navigation pills */}
      <div className="bg-[#F0F2F5] p-1.5 rounded-2xl flex items-center justify-center gap-1 text-xs font-semibold w-full max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('CURRENT')}
          className={`flex-1 py-2 px-3 md:px-4 rounded-xl text-center whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'CURRENT'
              ? 'bg-white text-[#FF5401] shadow-xs font-semibold border-t-2 border-[#FF5401]'
              : 'text-slate-600 hover:text-[#2B2B2B] hover:bg-white/50'
          }`}
        >
          Bill
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('HISTORY')}
          className={`flex-1 py-2 px-3 md:px-4 rounded-xl text-center whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'HISTORY'
              ? 'bg-white text-[#FF5401] shadow-xs font-semibold border-t-2 border-[#FF5401]'
              : 'text-slate-600 hover:text-[#2B2B2B] hover:bg-white/50'
          }`}
        >
          History
        </button>
      </div>

      {/* 1. CURRENT BILL BREAKDOWN */}
      {activeSubTab === 'CURRENT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          <div className="space-y-6">
            <CurrentBillCard
              currentBill={currentBill}
              onPayBill={() => setPaymentModalOpen(true)}
              accountNumber={selectedAccount.accountNumber}
            />

            {/* Consumption quick stat card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-2xs flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Total Metered Consumption</span>
              <span className="font-extrabold text-[#2B2B2B] text-sm">
                {currentBill.kwhConsumed} kWh <span className="text-slate-400 text-xs font-normal">({currentBill.peakKw} kW Peak)</span>
              </span>
            </div>
          </div>

          {/* Unbundled Rate Breakdown Card */}
          <div className="bg-white rounded-2xl p-6 md:p-7 border border-[#E5E7EB] shadow-xs space-y-4">
            {isPaid ? (
              <button
                type="button"
                onClick={() => setIsBreakdownOpen(open => !open)}
                aria-expanded={isBreakdownOpen}
                className="w-full flex items-center justify-between gap-3 cursor-pointer group"
              >
                <span className="text-xs font-semibold text-[#2B2B2B] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#FF5401]" />
                  Unbundled Rate Breakdown
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Paid
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 group-hover:text-[#FF5401] transition-transform ${isBreakdownOpen ? 'rotate-180' : ''}`}
                  />
                </span>
              </button>
            ) : (
              <h3 className="text-xs font-semibold text-[#2B2B2B] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#FF5401]" />
                Unbundled Rate Breakdown
              </h3>
            )}

            {showBreakdown && (
              <>
                <div className="divide-y divide-[#E5E7EB] text-xs">
                  {currentBill.breakdown.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center">
                      <p className="font-medium text-[#2B2B2B]">{item.category}</p>
                      <span className="font-medium text-[#2B2B2B] font-mono">
                        ₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
    
                <div className="pt-3 border-t border-[#E5E7EB] flex justify-between items-center text-sm font-semibold text-[#2B2B2B]">
                  <span>{isPaid ? 'Total Amount Paid' : 'Total Amount Due'}</span>
                  <span className="text-[#FF5401] text-base font-semibold">
                    ₱{currentBill.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. BILLING HISTORY */}
      {activeSubTab === 'HISTORY' && (
        <div className="space-y-3 w-full">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-[#2B2B2B] uppercase tracking-wider">
              Payment & Bill History
            </h3>
            <span className="text-[11px] font-medium bg-orange-50 border border-[#FF5401]/20 text-[#FF5401] px-2.5 py-0.5 rounded-full">
              {historyList.length} Records
            </span>
          </div>

          {/* Single Vertical List of Full-Width Rounded Cards - Clean, Compact & Fits Screen Perfectly */}
          <div className="flex flex-col gap-2.5 w-full">
            {historyList.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedHistoryReceipt(item)}
                className="w-full bg-white hover:bg-[#FFFDF9] p-3 sm:p-3.5 rounded-2xl border border-[#E5E7EB] hover:border-[#FF5401]/40 shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-2.5 sm:gap-3 group overflow-hidden"
              >
                {/* Left Section: Icon, Period, Date & Method */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#FFF3DF] to-[#FFD08A] flex items-center justify-center text-[#FF5401] shrink-0 border border-[#FF5401]/20">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-semibold text-[#2B2B2B] truncate group-hover:text-[#FF5401] transition-colors">
                        {item.billingPeriod}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[9px] sm:text-[10px] font-medium px-2 py-0.2 rounded-full inline-flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
                      <span>Paid {item.paymentDate}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 font-medium truncate">{item.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Right Section: Amount, OR Receipt Pill, Arrow */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 text-right">
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-[#2B2B2B] block">
                      ₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-[#FF5401] font-medium inline-flex items-center justify-end gap-1 mt-0.5 bg-orange-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-[#FF5401]/20 group-hover:bg-[#FF5401] group-hover:text-white transition-all">
                      <Download className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">OR #{item.receiptNumber.replace('OR-2026-', '')}</span>
                    </span>
                  </div>

                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#F8FAFC] group-hover:bg-[#FF5401] border border-[#E5E7EB] group-hover:border-[#FF5401] flex items-center justify-center text-slate-400 group-hover:text-white transition-all shrink-0">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Receipt Modal Sheet */}
      {selectedHistoryReceipt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full max-h-[90dvh] overflow-y-auto overscroll-contain space-y-4 shadow-2xl animate-fade-in border border-[#E5E7EB]">
            <div className="text-center pb-2 border-b border-[#E5E7EB]">
              <div className="w-10 h-10 bg-emerald-100 text-[#22C55E] rounded-2xl mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-[#2B2B2B] text-base">CEDC Official Digital Receipt</h3>
              <p className="text-[11px] text-slate-500 font-mono">Ref: {selectedHistoryReceipt.receiptNumber}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Account Number:</span>
                <span className="font-medium font-mono text-[#2B2B2B]">{selectedHistoryReceipt.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Period:</span>
                <span className="font-medium text-[#2B2B2B]">{selectedHistoryReceipt.billingPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-medium text-[#FF5401]">{selectedHistoryReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-medium text-[#2B2B2B]">{selectedHistoryReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5E7EB] font-semibold text-sm text-[#2B2B2B]">
                <span>Amount Paid:</span>
                <span className="text-[#22C55E]">₱{selectedHistoryReceipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => alert(`Downloaded PDF Receipt: ${selectedHistoryReceipt.receiptNumber}.pdf`)}
                className="flex-1 bg-orange-50 text-[#FF5401] font-semibold text-xs py-2.5 rounded-xl border border-[#FF5401]/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowDownToLine className="w-4 h-4" /> Download
              </button>
              <button
                onClick={() => setSelectedHistoryReceipt(null)}
                className="w-1/3 bg-[#E5E7EB] text-[#2B2B2B] font-medium text-xs py-2.5 rounded-xl cursor-pointer"
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
