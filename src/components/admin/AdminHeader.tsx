import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Megaphone,
  Tag,
  Mail,
  Smartphone,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminNavigationTab, AdvisoriesSubTab, MaintenanceSubTab } from './AdminSidebar';
import { UserProfileDropdown } from '../common/UserProfileDropdown';
import cecapLogo from '../../assets/CECAp_Logo.png';

interface AdminHeaderProps {
  activeTab: AdminNavigationTab;
  advisoriesSubTab: AdvisoriesSubTab;
  maintenanceSubTab: MaintenanceSubTab;
  onSearchQueryChange?: (q: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  advisoriesSubTab,
  maintenanceSubTab,
}) => {
  const { notifications, unreadNotifCount, markNotificationRead, markAllNotificationsRead, sentEmails, setEmailModalOpen, userRole, adminUser } = useApp();
  const isSupportStaff = userRole === 'support_staff' || adminUser?.role === 'support_staff';

  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'OUTAGE' | 'BILL' | 'ANNOUNCEMENT'>('ALL');

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'OUTAGE') return n.type.includes('OUTAGE');
    if (filter === 'BILL') return n.type.includes('DUE') || n.type.includes('PAYMENT');
    if (filter === 'ANNOUNCEMENT') return n.type.includes('ANNOUNCEMENT') || n.type.includes('PROMOTION');
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'OUTAGE_EMERGENCY':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'OUTAGE_SCHEDULED':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'PAYMENT_CONFIRMATION':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'DUE_DATE_REMINDER':
        return <Bell className="w-4 h-4 text-[#FF5401]" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-4 h-4 text-indigo-500" />;
      case 'PROMOTION':
        return <Tag className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-[#FF5401]" />;
    }
  };

  const getBreadcrumbTitle = () => {
    if (isSupportStaff) {
      return 'Support Desk • Ticket Operations';
    }
    switch (activeTab) {
      case 'analytics':
        return ' Analytics';
      case 'customer':
        return 'Customer';
      case 'support':
        return 'Support';
      case 'advisories':
        if (advisoriesSubTab === 'announcements') return 'Advisories • Announcement';
        if (advisoriesSubTab === 'faqs') return 'Advisories • FAQs';
        if (advisoriesSubTab === 'guides') return 'Advisories • Self Service Guides';
        return 'Advisories';
      case 'payments':
        return 'Payment Transactions & Monitoring';
      case 'maintenance':
        return 'Maintenance';
      case 'user-management':
        return 'User Management';
      default:
        return 'Admin';
    }
  };

  return (
    <header className="bg-white border-b border-[#E5E7EB] px-3 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs h-16 w-full">
      {/* Left: Breadcrumbs & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex md:hidden items-center shrink-0">
          <img src={cecapLogo} alt="CECAp Logo" className="h-7 object-contain" />
        </div>
        <div>
          <h1 className="text-xs sm:text-sm md:text-base font-extrabold text-[#2B2B2B] leading-tight truncate max-w-[150px] sm:max-w-none">
            {getBreadcrumbTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Email Outbox Button */}
        <button
          type="button"
          onClick={() => setEmailModalOpen(true)}
          className="h-9 px-3 rounded-full bg-orange-50 hover:bg-orange-100 border border-[#FF5401]/30 text-[#FF5401] flex items-center gap-2 font-extrabold text-xs transition-all cursor-pointer shadow-2xs relative"
          title="View All CECAp System Emails"
        >
          <Mail className="w-4 h-4 text-[#FF5401]" />
          <span className="bg-[#FF5401] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
            {sentEmails.length}
          </span>
        </button>

        {/* Notifications Dropdown Toggle */}
        <div className="relative">

          <button
            type="button"
            onClick={() => setNotifDrawerOpen(!notifDrawerOpen)}
            className="w-10 h-10 rounded-full bg-white hover:bg-orange-50/50 border border-[#E2E8F0] hover:border-[#FF5401]/50 flex items-center justify-center text-[#FF5401] transition-all relative cursor-pointer shadow-2xs"
            title="System Alert Notifications"
          >
            <Bell className="w-5 h-5 text-[#FF5401]" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF5C5C] text-white text-[10px] font-black flex items-center justify-center shadow-xs border-2 border-white">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Notifications Drawer */}
          {notifDrawerOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl p-4 z-50 animate-fade-in space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#FF5401]" />
                  <h3 className="font-extrabold text-xs text-[#2B2B2B]">Notifications Center</h3>
                </div>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[10px] font-semibold text-[#FF5401] hover:underline flex items-center gap-1 cursor-pointer bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200/60"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex bg-[#F1F5F9] p-1.5 gap-1 rounded-full text-[11px] font-semibold">
                <button
                  onClick={() => setFilter('ALL')}
                  className={`flex-1 py-1.5 px-3 rounded-full transition-all cursor-pointer text-center ${
                    filter === 'ALL' ? 'bg-white text-[#FF5401] shadow-2xs font-bold' : 'text-slate-600 hover:text-[#2B2B2B]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('OUTAGE')}
                  className={`flex-1 py-1.5 px-3 rounded-full transition-all cursor-pointer text-center ${
                    filter === 'OUTAGE' ? 'bg-white text-[#FF5401] shadow-2xs font-bold' : 'text-slate-600 hover:text-[#2B2B2B]'
                  }`}
                >
                  Outages
                </button>
                <button
                  onClick={() => setFilter('BILL')}
                  className={`flex-1 py-1.5 px-3 rounded-full transition-all cursor-pointer text-center ${
                    filter === 'BILL' ? 'bg-white text-[#FF5401] shadow-2xs font-bold' : 'text-slate-600 hover:text-[#2B2B2B]'
                  }`}
                >
                  Bills
                </button>
                <button
                  onClick={() => setFilter('ANNOUNCEMENT')}
                  className={`flex-1 py-1.5 px-3 rounded-full transition-all cursor-pointer text-center ${
                    filter === 'ANNOUNCEMENT' ? 'bg-white text-[#FF5401] shadow-2xs font-bold' : 'text-slate-600 hover:text-[#2B2B2B]'
                  }`}
                >
                  Company
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                {filteredNotifs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No notifications in this category</p>
                ) : (
                  filteredNotifs.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3.5 rounded-3xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                        !n.isRead
                          ? 'bg-[#FFF8F0] border-[#FDE6D2] shadow-2xs'
                          : 'bg-white border-[#E5E7EB] hover:border-slate-300'
                      }`}
                    >
                      {!n.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5401] absolute top-3.5 right-3.5 ring-2 ring-white"></span>
                      )}

                      <div className="p-2.5 rounded-2xl bg-white shadow-2xs shrink-0 border border-[#E5E7EB]">
                        {getNotifIcon(n.type)}
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="text-xs font-bold text-[#2B2B2B] truncate">{n.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{n.message}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E5E7EB]/70 text-[10px] text-slate-400 font-medium">
                          <span>{n.timestamp}</span>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="flex items-center gap-0.5"><Smartphone className="w-2.5 h-2.5 text-[#FF5401]" /> Push</span>
                            <span className="flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5 text-emerald-500" /> SMS</span>
                            <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5 text-blue-500" /> Email</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Profile Header Dropdown */}
        <UserProfileDropdown />
      </div>
    </header>
  );
};
