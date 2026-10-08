import React from 'react';
import { useApp } from '../../context/AppContext';
import { Zap, CreditCard, History, BarChart3, HelpCircle, AlertTriangle, ChevronDown, Bell, CheckCircle2, MapPin, Gauge, Calendar, Megaphone, ChevronRight, ShieldAlert, KeyRound } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    user,
    selectedAccount,
    setSelectedAccount,
    linkedAccounts,
    setActiveTab,
    setPaymentModalOpen,
    notifications,
    unreadNotifCount,
    markNotificationRead,
    passwordExpirationStatus,
    setShowPasswordChangeModal,
  } = useApp();

  if (!selectedAccount) return null;

  const currentBill = selectedAccount.currentBill;
  const isPaid = currentBill.status === 'Paid';
  const unreadAlert = notifications.find(n => !n.isRead);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 md:pb-12 w-full">
      {/* Customer Header */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-[#E5E7EB] flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500">Welcome back,</p>
          <h2 className="text-base md:text-xl font-bold text-[#2B2B2B] leading-tight mt-0.5">{user?.name || 'Juan Dela Cruz'}</h2>
        </div>
      </div>

      {/* Emergency Broadcast Banner from Admin */}
      {notifications.some(n => n.urgency === 'EMERGENCY') && (
        <div
          onClick={() => setActiveTab('notifications')}
          className="bg-[#EF4444] text-white p-5 md:p-6 rounded-2xl shadow-lg border border-red-600 flex items-start gap-4 cursor-pointer transition-all animate-pulse"
        >
          <div className="p-2.5 rounded-xl bg-white text-[#EF4444] shrink-0 mt-0.5 font-bold">
            🚨
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-100">Official CEDC Emergency Alert</span>
              <span className="text-[10px] text-red-200 font-medium">Tap for details →</span>
            </div>
            <h4 className="text-xs md:text-sm font-semibold text-white">
              {notifications.find(n => n.urgency === 'EMERGENCY')?.title}
            </h4>
            <p className="text-[11px] md:text-xs text-red-100 line-clamp-2 leading-relaxed">
              {notifications.find(n => n.urgency === 'EMERGENCY')?.message}
            </p>
          </div>
        </div>
      )}

      {/* Unread Alert Banner (Outage or Bill Reminder) */}
      {unreadAlert && !notifications.some(n => n.urgency === 'EMERGENCY') && (
        <div
          onClick={() => setActiveTab('notifications')}
          className="bg-amber-50 hover:bg-amber-100/80 border border-[#F59E0B]/30 rounded-2xl p-5 md:p-6 flex items-start gap-4 cursor-pointer transition-all shadow-xs"
        >
          <div className="p-2.5 rounded-xl bg-[#F59E0B] text-white shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs md:text-sm font-bold text-amber-950 truncate">{unreadAlert.title}</h4>
              <span className="text-[10px] text-amber-700 font-medium shrink-0 ml-2">{unreadAlert.timestamp.split(' ')[0]}</span>
            </div>
            <p className="text-[11px] md:text-xs text-amber-800 line-clamp-1">{unreadAlert.message}</p>
          </div>
        </div>
      )}

      {/* 7-Day Password Expiration Security Advisory Banner (30-day policy) */}
      {passwordExpirationStatus.shouldNotify && (
        <div className="bg-orange-50/90 border border-[#FF5401]/30 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-100 text-[#FF5401] shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-semibold text-[#2B2B2B]">
                Password Expiration Advisory ({passwordExpirationStatus.daysRemaining} Days Remaining)
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Under the CECAP 30-day security policy, your account password expires in {passwordExpirationStatus.daysRemaining} days. Update your password to avoid service interruption.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordChangeModal(true)}
            className="bg-[#FF5401] hover:bg-[#E54A00] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-center flex items-center gap-1.5 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Update Password Now</span>
          </button>
        </div>
      )}

      {/* Main Dashboard Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* HERO CURRENT BILL CARD */}
        <div className="md:col-span-6 lg:col-span-5 xl:col-span-5 bg-[#FF5401] text-white rounded-[24px] p-6 md:p-7 shadow-lg shadow-orange-500/20 relative overflow-hidden flex flex-col justify-between space-y-6">
          {/* Sleek radial background glow */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-300/30 rounded-full blur-2xl pointer-events-none"></div>

          <div className="space-y-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] md:text-[11px] font-semibold text-orange-100 uppercase tracking-widest opacity-90">Current Outstanding Balance</span>
                <div className="text-3xl md:text-4xl font-semibold tracking-tight mt-1.5">
                  ₱{currentBill.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <span
                className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md flex items-center gap-1 shadow-xs ${
                  isPaid
                    ? 'bg-[#22C55E] text-white border border-emerald-300/40'
                    : currentBill.status === 'Partially Paid'
                    ? 'bg-[#F59E0B] text-[#2B2B2B] font-semibold'
                    : 'bg-white/20 text-white border border-white/30 font-medium'
                }`}
              >
                {isPaid ? <CheckCircle2 className="w-3 h-3" /> : null}
                {currentBill.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 pb-2 border-t border-white/20 text-xs">
              <div>
                <span className="text-orange-100/80 text-[10px] uppercase font-medium tracking-wider block mb-1">Due Date</span>
                <span className="font-semibold text-white text-xs md:text-sm">{currentBill.dueDate}</span>
              </div>
              <div>
                <span className="text-orange-100/80 text-[10px] uppercase font-medium tracking-wider block mb-1">Account Number</span>
                <span className="font-semibold font-mono text-white text-xs md:text-sm">{selectedAccount.accountNumber}</span>
              </div>
            </div>
          </div>

          {/* Primary Pay Action */}
          {!isPaid ? (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="w-full bg-white hover:bg-orange-50 text-[#FF5401] font-semibold text-xs tracking-wider uppercase py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2"
            >
              <CreditCard className="w-4 h-4 text-[#FF5401]" />
              <span>PAY BILL NOW</span>
            </button>
          ) : (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 text-center text-xs font-semibold text-emerald-100 flex items-center justify-center gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Account paid in full • Zero pending balance</span>
            </div>
          )}
        </div>

        {/* 6-MONTH CONSUMPTION SNAPSHOT (SLEEK BAR GRAPH) */}
        <div
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth >= 768) {
              setActiveTab('consumption');
            }
          }}
          className="md:col-span-6 lg:col-span-7 xl:col-span-7 bg-white rounded-2xl p-6 md:p-7 border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-5 md:hover:border-[#FF5401]/40 md:cursor-pointer transition-all group"
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                <span>Consumption Snapshot</span>
                <span className="hidden md:inline text-[#FF5401] font-semibold text-[10px] group-hover:translate-x-0.5 transition-transform">→ View Dashboard</span>
              </h4>
              <p className="text-xs md:text-sm font-semibold text-[#2B2B2B]">Monthly kWh Usage Trend</p>
            </div>
            <span className="bg-orange-50 text-[#FF5401] text-[10px] md:text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#FF5401]/20">
              {currentBill.kwhConsumed} kWh Active
            </span>
          </div>

          {/* Sleek Bar Chart */}
          <div className="flex items-end justify-between h-40 md:h-44 pt-6 pb-2 px-3 border-b border-[#E5E7EB]">
            <div className="w-8 md:w-10 bg-[#F5F5F5] rounded-t-lg relative group h-full flex flex-col justify-end">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-medium text-slate-400">120</div>
              <div className="w-full bg-[#FF5401]/40 rounded-t-lg transition-all h-[40%]"></div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium">MAR</div>
            </div>

            <div className="w-8 md:w-10 bg-[#F5F5F5] rounded-t-lg relative group h-full flex flex-col justify-end">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-medium text-slate-400">145</div>
              <div className="w-full bg-[#FF5401]/50 rounded-t-lg transition-all h-[55%]"></div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium">APR</div>
            </div>

            <div className="w-8 md:w-10 bg-[#F5F5F5] rounded-t-lg relative group h-full flex flex-col justify-end">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-medium text-slate-400">180</div>
              <div className="w-full bg-[#FF5401]/70 rounded-t-lg transition-all h-[75%]"></div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium">MAY</div>
            </div>

            <div className="w-8 md:w-10 bg-[#F5F5F5] rounded-t-lg relative group h-full flex flex-col justify-end">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-medium text-slate-400">110</div>
              <div className="w-full bg-[#FF5401]/35 rounded-t-lg transition-all h-[35%]"></div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium">JUN</div>
            </div>

            <div className="w-8 md:w-10 bg-[#F5F5F5] rounded-t-lg relative group h-full flex flex-col justify-end">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-medium text-slate-400">160</div>
              <div className="w-full bg-[#FF5401]/60 rounded-t-lg transition-all h-[65%]"></div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium">JUL</div>
            </div>

            <div className="w-8 md:w-10 bg-[#F5F5F5] rounded-t-lg relative group h-full flex flex-col justify-end">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-medium text-[#FF5401]">{currentBill.kwhConsumed}</div>
              <div className="w-full bg-[#FF5401] rounded-t-lg transition-all h-[90%] shadow-sm"></div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-[#FF5401] font-semibold">AUG</div>
            </div>
          </div>

          <div className="text-[11px] md:text-xs text-slate-500 flex items-center justify-between pt-2">
            <span>Meter: <strong className="text-[#2B2B2B] font-mono">{selectedAccount.meterNumber}</strong></span>
            <span>Peak Demand: <strong className="text-[#2B2B2B] font-bold">{currentBill.peakKw} kW</strong></span>
          </div>
        </div>

        {/* QUICK ACTIONS GRID */}
        <div className="md:col-span-12 space-y-3">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1">Quick Actions</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 md:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#FF5401]/50 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF5401] group-hover:bg-[#FF5401] group-hover:text-white transition-all shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#2B2B2B] uppercase tracking-tighter">Pay Bills</span>
            </button>

            <button
              onClick={() => setActiveTab('consumption')}
              className="hidden md:flex flex-col md:flex-row items-center justify-center gap-3 p-4 md:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#FF5401]/50 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF5401] group-hover:bg-[#FF5401] group-hover:text-white transition-all shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#2B2B2B] uppercase tracking-tighter">Usage</span>
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 md:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#FF5401]/50 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF5401] group-hover:bg-[#FF5401] group-hover:text-white transition-all shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#2B2B2B] uppercase tracking-tighter">Support</span>
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 md:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#FF5401]/50 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF5401] group-hover:bg-[#FF5401] group-hover:text-white transition-all shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#2B2B2B] uppercase tracking-tighter">History</span>
            </button>
          </div>
        </div>

        {/* RECENT ALERTS & NOTIFICATIONS MODULE */}
        <div className="md:col-span-12 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 md:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5F5F5]">
            <h3 className="text-[11px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recent Alerts & Notifications
            </h3>
            <button
              onClick={() => setActiveTab('notifications')}
              className="text-xs font-semibold text-[#FF5401] hover:text-[#d96b0c] hover:underline cursor-pointer flex items-center gap-1 transition-all"
            >
              <span>View all</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.slice(0, 4).map(item => {
              // Format timestamp display (e.g., '2026-08-04 09:30 AM' -> 'Aug 04, 09:30 AM')
              let formattedDate = item.timestamp;
              if (item.timestamp.includes('-')) {
                const parts = item.timestamp.split(' ');
                const dateParts = parts[0].split('-');
                if (dateParts.length === 3) {
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const monthIdx = parseInt(dateParts[1], 10) - 1;
                  const monthStr = months[monthIdx] || dateParts[1];
                  formattedDate = `${monthStr} ${dateParts[2]}, ${parts.slice(1).join(' ')}`;
                }
              }

              let iconBg = 'bg-orange-50 text-[#FF5401]';
              let dotBg = 'bg-orange-500';
              let itemIcon = <Bell className="w-5 h-5" />;

              if (item.type === 'OUTAGE_SCHEDULED' || item.type === 'OUTAGE_UNSCHEDULED') {
                iconBg = 'bg-orange-50 text-[#FF5401]';
                dotBg = 'bg-orange-500';
                itemIcon = <Calendar className="w-5 h-5" />;
              } else if (item.type === 'PAYMENT_CONFIRMATION') {
                iconBg = 'bg-emerald-50 text-[#10B981]';
                dotBg = 'bg-emerald-500';
                itemIcon = <CheckCircle2 className="w-5 h-5" />;
              } else if (item.type === 'ANNOUNCEMENT') {
                iconBg = 'bg-indigo-50 text-indigo-600';
                dotBg = 'bg-blue-500';
                itemIcon = <Megaphone className="w-5 h-5" />;
              }

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    markNotificationRead(item.id);
                    setActiveTab('notifications');
                  }}
                  className="py-4 first:pt-1 last:pb-1 flex items-center justify-between gap-4 md:gap-6 hover:bg-slate-50/80 rounded-xl px-3 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`w-10 h-10 md:w-11 md:h-11 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
                      {itemIcon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs md:text-sm font-semibold text-[#2B2B2B] group-hover:text-[#FF5401] transition-colors truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] md:text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] md:text-xs text-slate-400 font-semibold">
                      {formattedDate}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${dotBg} shrink-0`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
