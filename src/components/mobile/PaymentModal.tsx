import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { initiatePaymentCheckout, createDemoReceipt } from '../../services/api';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Smartphone, Building2, Wallet, Download, Share2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

// Utility bills are paid without a convenience fee; kept explicit so the checkout shows the full breakdown
const CONVENIENCE_FEE = 0;

const CHANNEL_THEMES = {
  GCash: { header: 'bg-[#007DFE]', text: 'text-[#007DFE]', border: 'border-[#007DFE]', button: 'bg-[#007DFE] hover:bg-[#0068D6]' },
  Maya: { header: 'bg-[#0B1E2D]', text: 'text-[#16A34A]', border: 'border-[#16A34A]', button: 'bg-[#16A34A] hover:bg-[#15803D]' },
  ECPay: { header: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-600', button: 'bg-indigo-600 hover:bg-indigo-700' },
} as const;

const formatPeso = (amount: number) =>
  `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DetailRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex justify-between gap-3">
    <span className="text-slate-500 shrink-0">{label}</span>
    <span className={`font-semibold text-[#2B2B2B] text-right truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);

export const PaymentModal: React.FC = () => {
  const { paymentModalOpen, setPaymentModalOpen, selectedAccount, recordDemoPayment, user } = useApp();

  const [paymentType, setPaymentType] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [partialAmount, setPartialAmount] = useState<string>('2000');
  const [selectedChannel, setSelectedChannel] = useState<'GCash' | 'Maya' | 'ECPay'>('GCash');

  // Flow steps: 1=Review & Select Channel, 2=Gateway Redirect / Pin, 3=Success Receipt
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Gateway Simulation state
  const [gatewayPin, setGatewayPin] = useState('1234');
  const [gatewayTxnId, setGatewayTxnId] = useState('');
  const [gatewayRef, setGatewayRef] = useState('');
  const [receipt, setReceipt] = useState<any>(null);

  if (!paymentModalOpen || !selectedAccount) return null;

  const currentBill = selectedAccount.currentBill;
  const payAmount = paymentType === 'FULL' ? currentBill.amountDue : parseFloat(partialAmount) || 0;
  const totalCharge = payAmount + CONVENIENCE_FEE;
  const channelTheme = CHANNEL_THEMES[selectedChannel];
  const accountName = selectedAccount.accountHolderName || user?.name || 'Valued Customer';
  const mobileDigits = (user?.mobileNumber || '').replace(/\D/g, '');
  const maskedMobile = mobileDigits.length >= 4 ? `•••• ••• ${mobileDigits.slice(-4)}` : 'Linked account';

  const handleInitiatePayment = async () => {
    if (payAmount <= 0) return;
    setIsLoading(true);

    const res = await initiatePaymentCheckout({
      accountNumber: selectedAccount.accountNumber,
      billNumber: currentBill.billNumber,
      amount: payAmount,
      paymentType,
      channel: selectedChannel,
    });

    setIsLoading(false);
    if (res.success) {
      setGatewayTxnId(res.transactionId);
      setGatewayRef(res.gatewayRef);
      setStep(2);
    }
  };

  const handleConfirmGatewayPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Presentation payment: settled in memory only, resets when the site is reloaded or closed
    await new Promise(resolve => setTimeout(resolve, 600));
    const res = createDemoReceipt({
      transactionId: gatewayTxnId,
      accountNumber: selectedAccount.accountNumber,
      billNumber: currentBill.billNumber,
      amountPaid: payAmount,
      channel: selectedChannel,
      gatewayRef,
    });

    setIsLoading(false);
    if (res.success && res.receipt) {
      setReceipt(res.receipt);
      setStep(3);
      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {}
      recordDemoPayment(selectedAccount.accountNumber, payAmount);
    }
  };

  const handleClose = () => {
    setPaymentModalOpen(false);
    setStep(1);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 relative max-h-[90dvh] overflow-y-auto overscroll-contain">
        {step !== 2 && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* STEP 1: Review Payment & Select Gateway Channel */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <span className="bg-orange-100 text-[#FF5401] border border-[#FF5401]/20 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                Step 1 of 3
              </span>
              <h3 className="text-base font-bold text-[#2B2B2B] mt-1">Review & Select Gateway</h3>
              <p className="text-xs text-slate-500">Account #{selectedAccount.accountNumber}</p>
            </div>

            {/* Full vs Partial Toggle */}
            <div className="bg-[#F5F5F5] p-1 rounded-2xl flex text-xs font-bold border border-[#E5E7EB]">
              <button
                onClick={() => setPaymentType('FULL')}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                  paymentType === 'FULL' ? 'bg-[#FF5401] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Full
              </button>
              <button
                onClick={() => setPaymentType('PARTIAL')}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                  paymentType === 'PARTIAL' ? 'bg-[#FF5401] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Partial
              </button>
            </div>

            {paymentType === 'PARTIAL' && (
              <div>
                <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Enter Custom Amount (₱)</label>
                <input
                  type="number"
                  value={partialAmount}
                  onChange={e => setPartialAmount(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-[#E5E7EB] rounded-2xl px-4 py-2.5 text-base font-bold text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                  placeholder="2000"
                />
              </div>
            )}

            {/* Payment Channel Options */}
            <div>
              <label className="block text-xs font-semibold text-[#2B2B2B] mb-2">Select Payment Channel</label>
              <div className="space-y-2">
                {/* GCash Option */}
                <div
                  onClick={() => setSelectedChannel('GCash')}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedChannel === 'GCash'
                      ? 'border-[#FF5401] bg-orange-50/60 shadow-xs'
                      : 'border-[#E5E7EB] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center text-xs">
                      G
                    </div>
                    <p className="text-xs font-semibold text-[#2B2B2B]">GCash Wallet</p>
                  </div>
                  <input
                    type="radio"
                    name="channel"
                    checked={selectedChannel === 'GCash'}
                    onChange={() => setSelectedChannel('GCash')}
                    className="w-4 h-4 accent-[#FF5401]"
                  />
                </div>

                {/* Maya Option */}
                <div
                  onClick={() => setSelectedChannel('Maya')}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedChannel === 'Maya'
                      ? 'border-[#22C55E] bg-emerald-50/60 shadow-xs'
                      : 'border-[#E5E7EB] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#22C55E] text-white font-semibold flex items-center justify-center text-xs">
                      M
                    </div>
                    <p className="text-xs font-semibold text-[#2B2B2B]">Maya E-Wallet / Card</p>
                  </div>
                  <input
                    type="radio"
                    name="channel"
                    checked={selectedChannel === 'Maya'}
                    onChange={() => setSelectedChannel('Maya')}
                    className="w-4 h-4 accent-[#FF5401]"
                  />
                </div>

                {/* ECPay Option */}
                <div
                  onClick={() => setSelectedChannel('ECPay')}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedChannel === 'ECPay'
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                      : 'border-[#E5E7EB] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-semibold flex items-center justify-center text-xs">
                      EC
                    </div>
                    <p className="text-xs font-semibold text-[#2B2B2B]">ECPay Digital Center</p>
                  </div>
                  <input
                    type="radio"
                    name="channel"
                    checked={selectedChannel === 'ECPay'}
                    onChange={() => setSelectedChannel('ECPay')}
                    className="w-4 h-4 accent-[#FF5401]"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleInitiatePayment}
              disabled={isLoading || payAmount <= 0}
              className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? 'Connecting…' : 'Pay'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: SIMULATED PAYMENT GATEWAY (wallet checkout & MPIN screen) */}
        {step === 2 && (
          <form onSubmit={handleConfirmGatewayPin} className="-m-5">
            {/* Wallet-branded header */}
            <div className={`${channelTheme.header} text-white px-5 pt-4 pb-14 rounded-t-3xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">
                    {selectedChannel.substring(0, 2)}
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-bold">{selectedChannel}</p>
                    <p className="text-[10px] text-white/80">Merchant Checkout</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-white/80 hover:text-white p-1 rounded-full bg-white/15"
                  aria-label="Cancel payment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center mt-4">
                <p className="text-[11px] text-white/80">You are paying</p>
                <p className="text-3xl font-bold tracking-tight mt-0.5">{formatPeso(totalCharge)}</p>
              </div>
            </div>

            <div className="px-5 pb-5 -mt-10 space-y-3">
              {/* Merchant & bill details */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm text-xs">
                <div className="flex items-center gap-3 p-3 border-b border-dashed border-[#E5E7EB]">
                  <div className="w-9 h-9 rounded-full bg-orange-100 text-[#FF5401] flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Pay to</p>
                    <p className="font-semibold text-[#2B2B2B] truncate">Clark Electric Distribution Corp.</p>
                  </div>
                </div>
                <div className="p-3 space-y-1.5">
                  <DetailRow label="Account Name" value={accountName} />
                  <DetailRow label="Account No." value={selectedAccount.accountNumber} mono />
                  <DetailRow label="Bill No." value={currentBill.billNumber} mono />
                  <DetailRow label="Billing Period" value={currentBill.billingPeriod} />
                  <DetailRow label="Due Date" value={currentBill.dueDate} />
                  <DetailRow label="Payment Type" value={paymentType === 'FULL' ? 'Full Payment' : 'Partial Payment'} />
                </div>
                <div className="p-3 border-t border-dashed border-[#E5E7EB] space-y-1.5">
                  <DetailRow label="Amount" value={formatPeso(payAmount)} />
                  <DetailRow label="Convenience Fee" value={formatPeso(CONVENIENCE_FEE)} />
                  <div className="flex justify-between pt-1.5 border-t border-[#F1F1F1] text-sm font-bold">
                    <span className="text-[#2B2B2B]">Total</span>
                    <span className={channelTheme.text}>{formatPeso(totalCharge)}</span>
                  </div>
                </div>
              </div>

              {/* Paying from */}
              <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Wallet className={`w-4 h-4 ${channelTheme.text}`} />
                  <div className="leading-tight">
                    <p className="text-[10px] text-slate-500">Pay with</p>
                    <p className="font-semibold text-[#2B2B2B]">
                      {selectedChannel} Wallet · {maskedMobile}
                    </p>
                  </div>
                </div>
                <CheckCircle2 className={`w-4 h-4 ${channelTheme.text}`} />
              </div>

              {/* MPIN entry */}
              <div>
                <label htmlFor="gateway-mpin" className="block text-xs font-semibold text-[#2B2B2B] mb-2 text-center">
                  Enter your 4-digit MPIN
                </label>
                <div className="relative flex justify-center gap-3">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center transition-colors ${
                        gatewayPin.length === i ? channelTheme.border : 'border-[#E5E7EB]'
                      }`}
                    >
                      {gatewayPin[i] && <span className="w-2.5 h-2.5 rounded-full bg-[#2B2B2B]" />}
                    </div>
                  ))}
                  <input
                    id="gateway-mpin"
                    type="password"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={4}
                    value={gatewayPin}
                    onChange={e => setGatewayPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  Ref. No. <span className="font-mono">{gatewayRef}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || gatewayPin.length !== 4}
                className={`w-full ${channelTheme.button} disabled:opacity-60 text-white font-bold text-sm py-3.5 rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer`}
              >
                {isLoading ? 'Processing…' : `Pay ${formatPeso(totalCharge)}`}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secured with 256-bit SSL encryption
              </p>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESSFUL DIGITAL RECEIPT */}
        {step === 3 && receipt && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-[#22C55E] rounded-full mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <h3 className="text-lg font-semibold text-[#2B2B2B]">Payment Successful!</h3>

            {/* Receipt Summary Card */}
            <div className="bg-[#F5F5F5] rounded-2xl p-4 border border-[#E5E7EB] text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Official Receipt #:</span>
                <span className="font-semibold font-mono text-[#2B2B2B]">{receipt.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Number:</span>
                <span className="font-semibold font-mono text-[#2B2B2B]">{receipt.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-semibold text-[#FF5401]">{receipt.paymentChannel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="text-slate-700">{new Date(receipt.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5E7EB] text-sm font-semibold">
                <span className="text-[#2B2B2B]">Amount Paid:</span>
                <span className="text-[#22C55E]">₱{receipt.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Dispatch Status Badges */}
            <div className="flex justify-center gap-2 text-[10px] font-semibold text-emerald-800">
              <span className="bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#22C55E]" /> SMS Confirmation Sent
              </span>
              <span className="bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#22C55E]" /> E-Receipt Emailed
              </span>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
