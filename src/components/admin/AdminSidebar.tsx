import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  HelpCircle,
  Megaphone,
  CreditCard,
  Settings,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  Radio,
  FileQuestion,
  BookOpen,
} from 'lucide-react';
import cecapLogo from '../../assets/cecap-emblem.png';

import { useApp } from '../../context/AppContext';

export type AdminNavigationTab =
  | 'analytics'
  | 'customer'
  | 'support'
  | 'advisories'
  | 'payments'
  | 'maintenance'
  | 'user-management';

export type AdvisoriesSubTab = 'announcements' | 'faqs' | 'guides';
export type MaintenanceSubTab = 'ticket-categories' | 'service-types';

interface AdminSidebarProps {
  activeTab: AdminNavigationTab;
  setActiveTab: (tab: AdminNavigationTab) => void;
  advisoriesSubTab: AdvisoriesSubTab;
  setAdvisoriesSubTab: (sub: AdvisoriesSubTab) => void;
  maintenanceSubTab: MaintenanceSubTab;
  setMaintenanceSubTab: (sub: MaintenanceSubTab) => void;
  openTicketsCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  advisoriesSubTab,
  setAdvisoriesSubTab,
  maintenanceSubTab,
  setMaintenanceSubTab,
  openTicketsCount,
}) => {
  const { userRole, adminUser } = useApp();
  const isSupportStaff = userRole === 'support_staff' || adminUser?.role === 'support_staff';
  const [advisoriesOpen, setAdvisoriesOpen] = useState(false);

  const handleParentClick = (tab: AdminNavigationTab) => {
    setActiveTab(tab);
    if (tab === 'advisories') {
      setAdvisoriesOpen(prev => !prev);
    }
  };

  const handleToggleAdvisories = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab('advisories');
    setAdvisoriesOpen(prev => !prev);
  };

  return (
    <aside
      style={{ background: 'linear-gradient(180deg, #FFF3DF 0%, #FFD08A 100%)' }}
      className="w-80 bg-gradient-to-b from-[#FFF3DF] to-[#FFD08A] border-r border-[#E5E7EB] flex flex-col h-full shrink-0 shadow-xs select-none"
    >
      {/* Brand Header */}
      <div className="px-6 py-8 border-b border-[#E5E7EB] flex flex-col items-center justify-center gap-4 bg-transparent">
        <img src={cecapLogo} alt="CECAp Logo" className="w-14 h-14 object-contain" />
        <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 border border-[#FF5401]/25 text-[#FF5401]">
          {isSupportStaff ? (
            <>
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Support Staff</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Admin Portal</span>
            </>
          )}
        </div>
      </div>

      {/* Navigation Menu Links */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-2 custom-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3.5 block mb-2.5">
          {isSupportStaff ? 'Support Desk' : 'Operations Hub'}
        </span>

        {/* Analytics (Dashboard) */}
        {!isSupportStaff && (
          <button
            type="button"
            onClick={() => handleParentClick('analytics')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#FF5401] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50/80 hover:text-[#2B2B2B]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <BarChart3 className="w-5 h-5 shrink-0" />
              <span>Analytics</span>
            </div>
          </button>
        )}

        {/* Customer Management */}
        {!isSupportStaff && (
          <button
            type="button"
            onClick={() => handleParentClick('customer')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer ${
              activeTab === 'customer'
                ? 'bg-[#FF5401] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50/80 hover:text-[#2B2B2B]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Users className="w-5 h-5 shrink-0" />
              <span>Customer</span>
            </div>
          </button>
        )}

        {/* Support Tickets */}
        <button
          type="button"
          onClick={() => handleParentClick('support')}
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
          {openTicketsCount > 0 && (
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                activeTab === 'support' ? 'bg-white text-[#FF5401]' : 'bg-[#FF5401] text-white'
              }`}
            >
              {openTicketsCount}
            </span>
          )}
        </button>

        {/* Advisories Module with Dropdown Sub-modules */}
        {!isSupportStaff && (
          <div className="space-y-1">
            <button
              type="button"
              onClick={handleToggleAdvisories}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer ${
                activeTab === 'advisories'
                  ? 'bg-[#FF5401] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50/80 hover:text-[#2B2B2B]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Megaphone className="w-5 h-5 shrink-0" />
                <span>Advisories</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  advisoriesOpen ? 'rotate-180' : ''
                } ${activeTab === 'advisories' ? 'text-white' : 'text-slate-400'}`}
              />
            </button>

            {/* Advisories Sub-Modules Dropdown Menu */}
            {advisoriesOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-[#FF5401]/30 ml-4.5 mt-1 transition-all animate-fade-in">
                {/* Sub-Module 1: Announcement (Combined Announcement & Outage Advisories) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('advisories');
                    setAdvisoriesSubTab('announcements');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'advisories' && advisoriesSubTab === 'announcements'
                      ? 'bg-[#FF5401] text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-white/60 hover:text-[#2B2B2B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-3.5 h-3.5 shrink-0" />
                    <span>Announcement</span>
                  </div>
                </button>

                {/* Sub-Module 2: FAQs */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('advisories');
                    setAdvisoriesSubTab('faqs');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'advisories' && advisoriesSubTab === 'faqs'
                      ? 'bg-[#FF5401] text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-white/60 hover:text-[#2B2B2B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileQuestion className="w-3.5 h-3.5 shrink-0" />
                    <span>FAQs</span>
                  </div>
                </button>

                {/* Sub-Module 3: Self Service Guides */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('advisories');
                    setAdvisoriesSubTab('guides');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'advisories' && advisoriesSubTab === 'guides'
                      ? 'bg-[#FF5401] text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-white/60 hover:text-[#2B2B2B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>Guides</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Payments Monitoring */}
        {!isSupportStaff && (
          <button
            type="button"
            onClick={() => handleParentClick('payments')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-[#FF5401] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50/80 hover:text-[#2B2B2B]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <CreditCard className="w-5 h-5 shrink-0" />
              <span>Payments</span>
            </div>
          </button>
        )}

        {/* System Setup Section Divider */}
        {!isSupportStaff && (
          <div className="pt-3 pb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3.5 block mb-2.5">
              System Config
            </span>
          </div>
        )}

        {/* Maintenance */}
        {!isSupportStaff && (
          <button
            type="button"
            onClick={() => handleParentClick('maintenance')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer ${
              activeTab === 'maintenance'
                ? 'bg-[#FF5401] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50/80 hover:text-[#2B2B2B]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Settings className="w-5 h-5 shrink-0" />
              <span>Maintenance</span>
            </div>
          </button>
        )}

        {/* User Management */}
        {!isSupportStaff && (
          <button
            type="button"
            onClick={() => handleParentClick('user-management')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer ${
              activeTab === 'user-management'
                ? 'bg-[#FF5401] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50/80 hover:text-[#2B2B2B]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <UserCheck className="w-5 h-5 shrink-0" />
              <span>Users</span>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
};
