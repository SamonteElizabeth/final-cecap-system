import React from 'react';
import { CreditCard, Calendar, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Bill } from '../../types';

interface CurrentBillCardProps {
  currentBill: Bill;
  onPayBill?: () => void;
  className?: string;
  accountNumber?: string;
}

export const CurrentBillCard: React.FC<CurrentBillCardProps> = ({
  currentBill,
  onPayBill,
  className = '',
  accountNumber,
}) => {
  const isPaid = currentBill.status === 'Paid';
  const isPartiallyPaid = currentBill.status === 'Partially Paid';

  return (
    <div
      className={`relative bg-gradient-to-br from-[#FFFDF9] via-[#FFF9F2] to-[#FFF1E0] rounded-[28px] border border-[#FED7AA]/70 p-5 sm:p-6 md:p-7 shadow-xs overflow-hidden flex flex-col justify-between select-none ${className}`}
    >
      {/* Background Graphic: Power Transmission Utility Poles, Lines & Rolling Landscape Waves */}
      <svg
        className="absolute right-0 bottom-0 w-64 sm:w-80 md:w-96 h-full pointer-events-none select-none opacity-85 overflow-hidden"
        viewBox="0 0 360 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMaxYMax meet"
      >
        {/* Soft Warm Rolling Hills / Terrain */}
        <path
          d="M40 220C100 170 180 145 260 155C305 160 335 180 360 195V220H40Z"
          fill="#FF8A00"
          fillOpacity="0.12"
        />
        <path
          d="M120 220C180 180 250 168 310 180C332 184 348 194 360 200V220H120Z"
          fill="#FF6A00"
          fillOpacity="0.18"
        />
        <path
          d="M0 220C70 190 160 198 230 220H0Z"
          fill="#FFB066"
          fillOpacity="0.16"
        />

        {/* Soft Ambient Light Gradient on Top Right */}
        <path
          d="M180 0C240 55 295 95 360 115V0H180Z"
          fill="#FF8A00"
          fillOpacity="0.06"
        />

        {/* Distant Utility Pole 3 */}
        <line x1="180" y1="135" x2="180" y2="175" stroke="#FF5401" strokeWidth="1.2" strokeOpacity="0.28" />
        <line x1="174" y1="140" x2="186" y2="140" stroke="#FF5401" strokeWidth="1.1" strokeOpacity="0.28" strokeLinecap="round" />

        {/* Mid-distance Utility Pole 2 */}
        <line x1="240" y1="105" x2="240" y2="180" stroke="#FF5401" strokeWidth="1.6" strokeOpacity="0.35" strokeLinecap="round" />
        <line x1="231" y1="112" x2="249" y2="112" stroke="#FF5401" strokeWidth="1.5" strokeOpacity="0.35" strokeLinecap="round" />
        <line x1="234" y1="117" x2="246" y2="117" stroke="#FF5401" strokeWidth="1.1" strokeOpacity="0.35" strokeLinecap="round" />

        {/* Foreground Primary Utility Pole 1 */}
        <line x1="318" y1="72" x2="318" y2="190" stroke="#FF5401" strokeWidth="2.4" strokeOpacity="0.45" strokeLinecap="round" />
        {/* Main Crossarm */}
        <line x1="302" y1="82" x2="334" y2="82" stroke="#FF5401" strokeWidth="2.2" strokeOpacity="0.45" strokeLinecap="round" />
        {/* Support Brace Struts */}
        <path d="M308 92L318 83L328 92" stroke="#FF5401" strokeWidth="1.3" strokeOpacity="0.4" fill="none" />
        {/* Ceramic Insulator Dots */}
        <circle cx="304" cy="81" r="1.6" fill="#FF5401" fillOpacity="0.5" />
        <circle cx="318" cy="72" r="1.6" fill="#FF5401" fillOpacity="0.5" />
        <circle cx="332" cy="81" r="1.6" fill="#FF5401" fillOpacity="0.5" />

        {/* Power Transmission Wires with Gentle Catenary Curve */}
        {/* Top Wire */}
        <path
          d="M150 138Q205 146 240 112Q280 124 318 82Q340 92 360 97"
          stroke="#FF5401"
          strokeWidth="0.9"
          strokeOpacity="0.32"
          fill="none"
        />
        {/* Middle Wire */}
        <path
          d="M150 144Q206 152 240 117Q282 130 318 88Q340 98 360 103"
          stroke="#FF5401"
          strokeWidth="0.9"
          strokeOpacity="0.3"
          fill="none"
        />
        {/* Lower Wire */}
        <path
          d="M160 150Q210 157 245 122Q285 135 328 93Q344 102 360 108"
          stroke="#FF5401"
          strokeWidth="0.8"
          strokeOpacity="0.25"
          fill="none"
        />
      </svg>

      {/* Main Content Area */}
      <div className="relative z-10 space-y-3 sm:space-y-4">
        {/* Top Row: Icon + Title & Status Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Orange Bill Document Icon */}
            <div className="w-8 h-8 rounded-xl bg-[#FF5401] flex items-center justify-center text-white shrink-0 shadow-xs">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 3.5L18.5 8H14V3.5zM8 12h8v1.8H8V12zm0 3.2h8V17H8v-1.8zm0-6.4h4v1.8H8V8.8z" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#2B2B2B] tracking-tight">
              Current Bill
            </h3>
          </div>

          {/* Status Pill Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-2xs ${
              isPaid
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : isPartiallyPaid
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-[#FEE8D6] text-[#E04B00] border border-[#FDBA74]/40'
            }`}
          >
            {currentBill.status}
          </span>
        </div>

        {/* Currency Amount Display */}
        <div>
          <div className="text-3xl sm:text-4xl md:text-[42px] font-black text-[#FF5401] tracking-tight leading-none">
            ₱{currentBill.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-[#F5D0B8]/60 my-3 sm:my-4" />

        {/* Two Column Metadata (Billing Period & Due Date) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Billing Period */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-orange-100/90 border border-orange-200/80 flex items-center justify-center text-[#FF5401] shrink-0 shadow-2xs">
              <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#FF5401]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Billing Period
              </span>
              <span
                className="block text-xs sm:text-sm font-extrabold text-[#2B2B2B] truncate mt-0.5"
                title={currentBill.billingPeriod}
              >
                {currentBill.billingPeriod}
              </span>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pl-3 sm:pl-4 border-l border-[#F5D0B8]/70">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-orange-100/90 border border-orange-200/80 flex items-center justify-center text-[#FF5401] shrink-0 shadow-2xs">
              <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#FF5401]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Due Date
              </span>
              <span
                className="block text-xs sm:text-sm font-extrabold text-[#2B2B2B] truncate mt-0.5"
                title={currentBill.dueDate}
              >
                {currentBill.dueDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Action Button */}
      <div className="mt-5 sm:mt-6 relative z-10">
        {!isPaid ? (
          <button
            type="button"
            onClick={onPayBill}
            className="w-full bg-[#FF5401] hover:bg-[#E54A00] active:scale-[0.99] text-white py-3.5 sm:py-4 px-5 rounded-2xl flex items-center justify-between shadow-md shadow-orange-500/25 transition-all cursor-pointer font-bold text-sm sm:text-base group"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <CreditCard className="w-5 h-5 text-white shrink-0" />
              <span className="tracking-wide">Pay Bill Now</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white shrink-0 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Bill Settled • Thank you for your payment!</span>
          </div>
        )}
      </div>
    </div>
  );
};
