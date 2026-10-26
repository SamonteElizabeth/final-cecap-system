import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { initiatePaymentCheckout, confirmPayment } from '../../services/api';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Smartphone, Building2, Wallet, Download, Share2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentModal: React.FC = () => {
  const { paymentModalOpen, setPaymentModalOpen, selectedAccount, refreshAccountData } = useApp();

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

    const res = await confirmPayment({
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
      refreshAccountData();
    }
  };

  const handleClose = () => {
    setPaymentModalOpen(false);
    setStep(1);
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

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

        {/* STEP 2: SIMULATED PAYMENT GATEWAY (GCash / Maya PIN screen) */}
        {step === 2 && (
          <form onSubmit={handleConfirmGatewayPin} className="space-y-4">
            <div className="text-center pb-2 border-b border-[#E5E7EB]">
              <div
                className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white font-semibold text-lg mb-2 ${
                  selectedChannel === 'GCash'
                    ? 'bg-blue-600'
                    : selectedChannel === 'Maya'
                    ? 'bg-[#22C55E]'
                    : 'bg-indigo-600'
                }`}
              >
                {selectedChannel.substring(0, 2)}
              </div>
              <h3 className="font-semibold text-[#2B2B2B] text-base">{selectedChannel} Secure Gateway</h3>
            </div>

            <div className="bg-[#F5F5F5] p-3 rounded-2xl border border-[#E5E7EB] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Account #:</span>
                <span className="font-mono font-bold text-[#2B2B2B]">{selectedAccount.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway Ref:</span>
                <span className="font-mono text-slate-700">{gatewayRef}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E5E7EB] font-bold text-sm">
                <span className="text-[#2B2B2B]">Total Charge:</span>
                <span className="text-[#FF5401]">₱{payAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B2B2B] mb-1 text-center">
                Enter {selectedChannel} 4-Digit MPIN / Authorization Code
              </label>
              <input
                type="password"
                maxLength={4}
                value={gatewayPin}
                onChange={e => setGatewayPin(e.target.value)}
                className="w-full bg-white border border-[#E5E7EB] rounded-2xl py-3 text-center text-2xl font-bold tracking-widest text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#22C55E] hover:bg-emerald-600 text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? 'Authorizing…' : 'Authorize'}
            </button>
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
