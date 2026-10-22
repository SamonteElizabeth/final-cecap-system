import React from 'react';
import { useApp } from '../context/AppContext';
import { DashboardView } from './mobile/DashboardView';
import { BillingView } from './mobile/BillingView';
import { SupportView } from './mobile/SupportView';
import { NotificationsView } from './mobile/NotificationsView';
import { AccountInfoView } from './mobile/AccountInfoView';
import { AdminConsoleView } from './admin/AdminConsoleView';
import { AuthView } from './mobile/AuthView';
import { ConsumptionView } from './mobile/ConsumptionView';
import { BiometricPromptModal } from './mobile/BiometricPromptModal';
import { PaymentModal } from './mobile/PaymentModal';
import { PasswordChangeModal } from './mobile/PasswordChangeModal';
import { LayoutDashboard, CreditCard, HelpCircle, Bell, UserCheck, ShieldAlert, Mail, Zap } from 'lucide-react';
import { UserProfileDropdown } from './common/UserProfileDropdown';
import cecapLogo from '../assets/CECAp_Logo.png';

const MeterIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 12L15.5 8.5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <path d="M7.5 16.5h9" />
    <path d="M7 10.5a5.5 5.5 0 0 1 10 0" />
  </svg>
);

export const MobileFrame: React.FC = () => {
  const {
    isAuthenticated,
    userRole,
    activeTab,
    setActiveTab,
    unreadNotifCount,
    sentEmails,
    setEmailModalOpen,
  } = useApp();


  if (isAuthenticated && activeTab === 'admin-console') {
    return <AdminConsoleView />;
  }

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5] text-[#2B2B2B] flex flex-col md:flex-row relative">
      {/* Desktop Permanent Sidebar Navigation */}
      {isAuthenticated && (
        <aside
          style={{ background: 'linear-gradient(180deg, #FFF3DF 0%, #FFD08A 100%)' }}
          className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-80 bg-gradient-to-b from-[#FFF3DF] to-[#FFD08A] border-r border-[#E5E7EB] z-40 shadow-xs select-none"
        >
          {/* Brand Header */}
          <div className="p-6 border-b border-[#E5E7EB] flex flex-col items-center justify-center bg-transparent">
            <img src={cecapLogo} alt="CECAP Logo" className="h-16 object-contain" />
            {userRole === 'admin' ? (
              <div className="mt-3 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 border border-[#FF5401]/25 text-[#FF5401]">
                <ShieldAlert className="w-3.5 h-3.5 text-[#FF5401]" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Admin Portal</span>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 border border-[#FF5401]/25 text-[#FF5401]">
                <UserCheck className="w-3.5 h-3.5 text-[#FF5401]" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Customer Portal</span>
              </div>
            )}
          </div>

          {/* Navigation Menu Links */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-2 custom-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3.5 block mb-2.5">
              Navigation
            </span>

            {userRole === 'admin' && (
              <button
                type="button"
                onClick={() => setActiveTab('admin-console')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'admin-console'
                    ? 'bg-[#FF5401] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50/80 hover:text-[#2B2B2B]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>Admin Console</span>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#FF5401] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50/80 hover:text-[#2B2B2B]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <LayoutDashboard className="w-5 h-5 shrink-0" />
                <span>Home</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer ${
                activeTab === 'billing'
                  ? 'bg-[#FF5401] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50/80 hover:text-[#2B2B2B]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <CreditCard className="w-5 h-5 shrink-0" />
                <span>Billing</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('consumption')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer ${
                activeTab === 'consumption'
                  ? 'bg-[#FF5401] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50/80 hover:text-[#2B2B2B]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Zap className="w-5 h-5 shrink-0" />
                <span>Consumption</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-[#FF5401] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50/80 hover:text-[#2B2B2B]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <HelpCircle className="w-5 h-5 shrink-0" />
                <span>Support</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer ${
                activeTab === 'profile' || activeTab === 'settings'
                  ? 'bg-[#FF5401] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50/80 hover:text-[#2B2B2B]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <MeterIcon className="w-5 h-5 shrink-0" />
                <span>Service Account</span>
              </div>
            </button>
          </div>
        </aside>
      )}

      {/* Top Header Bar with Notifications Icon and User Profile on the Right */}
      {isAuthenticated && (
        <header className="bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 md:px-8 py-3 flex items-center justify-between fixed top-0 left-0 md:left-80 right-0 z-30 shadow-xs h-16">
          {/* Left Side: Section Title / Breadcrumbs */}
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <img src={cecapLogo} alt="CECAP Logo" className="h-8 object-contain" />
            </div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xs md:text-sm font-semibold text-[#2B2B2B]">
                {activeTab === 'admin-console' && 'Admin Console'}
                {activeTab === 'dashboard' && 'Home'}
                {activeTab === 'billing' && 'Billing'}
                {activeTab === 'consumption' && 'Consumption'}
                {activeTab === 'support' && 'Support'}
                {activeTab === 'notifications' && 'System Alerts'}
                {(activeTab === 'profile' || activeTab === 'settings') && 'Service Account'}
              </h2>
            </div>
          </div>

          {/* Right Side: Dispatched Emails, Notification, and User Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setEmailModalOpen(true)}
              className="h-9 px-3 rounded-full bg-orange-50 hover:bg-orange-100 border border-[#FF5401]/30 text-[#FF5401] flex items-center gap-1.5 font-medium text-xs transition-all cursor-pointer shadow-2xs relative"
              title="View CECAp Emails"
            >
              <Mail className="w-4 h-4 text-[#FF5401]" />
              <span className="bg-[#FF5401] text-white text-[10px] font-semibold px-1.5 py-0.2 rounded-full">
                {sentEmails.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer relative shadow-2xs ${
                activeTab === 'notifications'
                  ? 'bg-[#FF5401] border-[#FF5401] text-white'
                  : 'bg-white border-[#E2E8F0] text-[#FF5401] hover:bg-orange-50/50 hover:border-[#FF5401]/50'
              }`}
              title="Notifications"
            >
              <Bell className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-white' : 'text-[#FF5401]'}`} />
              {unreadNotifCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs border-2 ${
                    activeTab === 'notifications'
                      ? 'bg-white text-[#FF5401] border-[#FF5401]'
                      : 'bg-[#FF5C5C] text-white border-white'
                  }`}
                >
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Vertical Divider */}
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* User Profile Header Dropdown */}
            <UserProfileDropdown />
          </div>

        </header>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full min-h-screen ${
          isAuthenticated ? 'bg-[#F5F5F5] md:pl-80 pt-20 md:pt-20 pb-24 md:pb-16' : 'bg-[#FDFBF7]'
        }`}
      >
        {!isAuthenticated ? (
          <AuthView />
        ) : (
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10">
            <div className="w-full space-y-6 md:space-y-8">
              {activeTab === 'admin-console' && <AdminConsoleView />}
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'billing' && <BillingView />}
              {activeTab === 'consumption' && <ConsumptionView />}
              {activeTab === 'support' && <SupportView />}
              {activeTab === 'notifications' && <NotificationsView />}
              {(activeTab === 'profile' || activeTab === 'settings') && <AccountInfoView />}
            </div>
          </div>
        )}

        {/* Interactive App Modals */}
        <BiometricPromptModal />
        <PaymentModal />
        <PasswordChangeModal />
      </main>

      {/* Bottom Navigation Bar (Mobile Viewports) */}
      {isAuthenticated && (
        <nav className="md:hidden bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] px-2 py-2 flex items-center justify-around fixed bottom-0 left-0 right-0 z-40 shadow-lg h-16">
          {userRole === 'admin' && (
            <button
              onClick={() => setActiveTab('admin-console')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'admin-console' ? 'text-[#FF5401] font-semibold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              <span className="text-[9px] mt-0.5">Admin</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'text-[#FF5401] font-semibold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'billing' ? 'text-[#FF5401] font-semibold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Billing</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'support' ? 'text-[#FF5401] font-semibold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Support</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile' || activeTab === 'settings' ? 'text-[#FF5401] font-semibold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <MeterIcon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Account</span>
          </button>
        </nav>
      )}
    </div>
  );
};




