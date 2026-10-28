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
  ChevronLeft,
  ChevronRight,
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

const ADMIN_SIDEBAR_COLLAPSED_KEY = 'cecap_admin_sidebar_collapsed';

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
  openTicketsCount,
}) => {
  const { userRole, adminUser } = useApp();
  const isSupportStaff = userRole === 'support_staff' || adminUser?.role === 'support_staff';
  const [advisoriesOpen, setAdvisoriesOpen] = useState(false);

  // Desktop sidebar collapse (admin & support staff), remembered per browser
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      try {
        localStorage.setItem(ADMIN_SIDEBAR_COLLAPSED_KEY, prev ? '0' : '1');
      } catch {
        // ignore
      }
      return !prev;
    });
  };

  const handleToggleAdvisories = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab('advisories');
    // Sub-modules need labels, so a collapsed sidebar expands to show them
    if (collapsed) {
      toggleCollapsed();
      setAdvisoriesOpen(true);
      return;
    }
    setAdvisoriesOpen(prev => !prev);
  };

  const navButtonClass = (isActive: boolean) =>
    `w-full flex items-center rounded-2xl text-[13px] font-semibold transition-all cursor-pointer ${
      collapsed ? 'justify-center p-3 relative' : 'justify-between px-4 py-3'
    } ${isActive ? 'bg-[#FF5401] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50/80 hover:text-[#2B2B2B]'}`;

  const renderNavButton = (tab: AdminNavigationTab, label: string, Icon: React.ElementType, badge?: number) => {
    const isActive = activeTab === tab;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(tab)}
        title={collapsed ? label : undefined}
        aria-label={label}
        className={navButtonClass(isActive)}
      >
        <div className="flex items-center gap-3.5">
          <Icon className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">{label}</span>}
        </div>
        {!!badge &&
          (collapsed ? (
            <span
              className={`absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center ${
                isActive ? 'bg-white text-[#FF5401]' : 'bg-[#FF5401] text-white'
              }`}
            >
              {badge}
            </span>
          ) : (
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isActive ? 'bg-white text-[#FF5401]' : 'bg-[#FF5401] text-white'
              }`}
            >
              {badge}
            </span>
          ))}
      </button>
    );
  };

  const renderSectionLabel = (label: string) =>
    collapsed ? (
      <div className="mx-2 my-3 border-t border-[#FF5401]/15" />
    ) : (
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3.5 block mb-2.5">{label}</span>
    );

  const advisoriesSubItems: { sub: AdvisoriesSubTab; label: string; icon: React.ElementType }[] = [
    { sub: 'announcements', label: 'Announcement', icon: Radio },
    { sub: 'faqs', label: 'FAQs', icon: FileQuestion },
    { sub: 'guides', label: 'Guides', icon: BookOpen },
  ];

  return (
    <aside
      style={{ background: 'linear-gradient(180deg, #FFF3DF 0%, #FFD08A 100%)' }}
      className={`${collapsed ? 'w-20' : 'w-80'} transition-[width] duration-200 relative bg-gradient-to-b from-[#FFF3DF] to-[#FFD08A] border-r border-[#E5E7EB] flex flex-col h-full shrink-0 shadow-xs select-none`}
    >
      {/* Collapse / expand toggle on the sidebar edge */}
      <button
        type="button"
        onClick={toggleCollapsed}
        className="absolute -right-3.5 top-24 w-7 h-7 rounded-full bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-center text-slate-500 hover:text-[#FF5401] hover:border-[#FF5401]/40 transition-colors cursor-pointer z-10"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Brand Header */}
      <div
        className={`border-b border-[#E5E7EB] flex flex-col items-center justify-center gap-4 bg-transparent ${
          collapsed ? 'px-3 py-6' : 'px-6 py-8'
        }`}
      >
        <img
          src={cecapLogo}
          alt="CECAp Logo"
          className={`object-contain transition-all ${collapsed ? 'w-10 h-10' : 'w-14 h-14'}`}
        />
        {!collapsed && (
          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 border border-[#FF5401]/25 text-[#FF5401]">
            {isSupportStaff ? (
              <>
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">Support Staff</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">Admin Portal</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Navigation Menu Links */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden space-y-2 custom-scrollbar ${collapsed ? 'p-3' : 'p-4 md:p-5'}`}>
        {renderSectionLabel(isSupportStaff ? 'Support Desk' : 'Operations Hub')}

        {!isSupportStaff && renderNavButton('analytics', 'Analytics', BarChart3)}
        {!isSupportStaff && renderNavButton('customer', 'Customer', Users)}
        {renderNavButton('support', 'Support', HelpCircle, openTicketsCount)}

        {/* Advisories Module with Dropdown Sub-modules */}
        {!isSupportStaff && (
          <div className="space-y-1">
            <button
              type="button"
              onClick={handleToggleAdvisories}
              title={collapsed ? 'Advisories' : undefined}
              aria-label="Advisories"
              className={navButtonClass(activeTab === 'advisories')}
            >
              <div className="flex items-center gap-3.5">
                <Megaphone className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">Advisories</span>}
              </div>
              {!collapsed && (
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    advisoriesOpen ? 'rotate-180' : ''
                  } ${activeTab === 'advisories' ? 'text-white' : 'text-slate-400'}`}
                />
              )}
            </button>

            {/* Advisories Sub-Modules Dropdown Menu */}
            {advisoriesOpen && !collapsed && (
              <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-[#FF5401]/30 ml-4.5 mt-1 transition-all animate-fade-in">
                {advisoriesSubItems.map(({ sub, label, icon: Icon }) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => {
                      setActiveTab('advisories');
                      setAdvisoriesSubTab(sub);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'advisories' && advisoriesSubTab === sub
                        ? 'bg-[#FF5401] text-white shadow-xs font-bold'
                        : 'text-slate-700 hover:bg-white/60 hover:text-[#2B2B2B]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="whitespace-nowrap">{label}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!isSupportStaff && renderNavButton('payments', 'Payments', CreditCard)}

        {/* System Setup Section */}
        {!isSupportStaff && <div className={collapsed ? '' : 'pt-3 pb-1'}>{renderSectionLabel('System Config')}</div>}

        {!isSupportStaff && renderNavButton('maintenance', 'Maintenance', Settings)}
        {!isSupportStaff && renderNavButton('user-management', 'Users', UserCheck)}
      </div>
    </aside>
  );
};
