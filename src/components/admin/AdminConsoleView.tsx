import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSidebar, AdminNavigationTab, AdvisoriesSubTab, MaintenanceSubTab } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AnalyticsView } from './views/AnalyticsView';
import { CustomerView } from './views/CustomerView';
import { SupportView } from './views/SupportView';
import { AdvisoriesView } from './views/AdvisoriesView';
import { PaymentsView } from './views/PaymentsView';
import { MaintenanceView } from './views/MaintenanceView';
import { UserManagementView } from './views/UserManagementView';
import { Users, Megaphone, HelpCircle, ShieldCheck } from 'lucide-react';

export const AdminConsoleView: React.FC = () => {
  const { supportConcerns, userRole, adminUser } = useApp();
  const isSupportStaff = userRole === 'support_staff' || adminUser?.role === 'support_staff';

  // Navigation State - persisted across refreshes
  const [activeTab, setActiveTabState] = useState<AdminNavigationTab>(() => {
    try {
      const saved = localStorage.getItem('cecap_admin_active_tab') as AdminNavigationTab | null;
      return saved || 'customer';
    } catch {
      return 'customer';
    }
  });

  const effectiveTab: AdminNavigationTab = isSupportStaff ? 'support' : activeTab;
  const [advisoriesSubTab, setAdvisoriesSubTabState] = useState<AdvisoriesSubTab>(() => {
    try {
      const saved = localStorage.getItem('cecap_admin_advisories_subtab');
      if (saved === 'faqs' || saved === 'guides') {
        return saved;
      }
      return 'announcements';
    } catch {
      return 'announcements';
    }
  });
  const [maintenanceSubTab, setMaintenanceSubTabState] = useState<MaintenanceSubTab>(() => {
    try {
      const saved = localStorage.getItem('cecap_admin_maintenance_subtab') as MaintenanceSubTab | null;
      return saved || 'ticket-categories';
    } catch {
      return 'ticket-categories';
    }
  });

  const setActiveTab = (tab: AdminNavigationTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('cecap_admin_active_tab', tab);
    } catch {
      // ignore
    }
  };

  const setAdvisoriesSubTab = (sub: AdvisoriesSubTab) => {
    setAdvisoriesSubTabState(sub);
    try {
      localStorage.setItem('cecap_admin_advisories_subtab', sub);
    } catch {
      // ignore
    }
  };

  const setMaintenanceSubTab = (sub: MaintenanceSubTab) => {
    setMaintenanceSubTabState(sub);
    try {
      localStorage.setItem('cecap_admin_maintenance_subtab', sub);
    } catch {
      // ignore
    }
  };

  // Search Query
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const openTicketsCount = supportConcerns.filter(t => t.status === 'Submitted' || t.status === 'In Progress').length;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#F5F5F5] text-[#2B2B2B] overflow-hidden relative">
      {/* Left Sidebar Navigation (Desktop) */}
      <div className="hidden md:flex shrink-0">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          advisoriesSubTab={advisoriesSubTab}
          setAdvisoriesSubTab={setAdvisoriesSubTab}
          maintenanceSubTab={maintenanceSubTab}
          setMaintenanceSubTab={setMaintenanceSubTab}
          openTicketsCount={openTicketsCount}
        />
      </div>

      {/* Main Content Area with Top Header */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden pb-16 md:pb-0">
        {/* Top Header */}
        <AdminHeader
          activeTab={effectiveTab}
          advisoriesSubTab={advisoriesSubTab}
          maintenanceSubTab={maintenanceSubTab}
          onSearchQueryChange={setGlobalSearchQuery}
        />

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 lg:p-8 custom-scrollbar">
          <div className="w-full">
            {effectiveTab === 'support' && <SupportView searchQuery={globalSearchQuery} />}
            {!isSupportStaff && effectiveTab === 'analytics' && <AnalyticsView />}
            {!isSupportStaff && effectiveTab === 'customer' && <CustomerView searchQuery={globalSearchQuery} />}
            {!isSupportStaff && effectiveTab === 'advisories' && (
              <AdvisoriesView
                subTab={advisoriesSubTab}
                setSubTab={setAdvisoriesSubTab}
                searchQuery={globalSearchQuery}
              />
            )}
            {!isSupportStaff && effectiveTab === 'payments' && <PaymentsView searchQuery={globalSearchQuery} />}
            {!isSupportStaff && effectiveTab === 'maintenance' && (
              <MaintenanceView
                subTab={maintenanceSubTab}
                setSubTab={setMaintenanceSubTab}
                searchQuery={globalSearchQuery}
              />
            )}
            {!isSupportStaff && effectiveTab === 'user-management' && <UserManagementView searchQuery={globalSearchQuery} />}
          </div>
        </main>
      </div>

      {/* Admin Mobile Frame Bottom Navigation Bar */}
      <nav className="md:hidden bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] px-2 py-1.5 flex items-center justify-around fixed bottom-0 left-0 right-0 z-40 shadow-lg h-16">
        {isSupportStaff ? (
          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className="flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all cursor-pointer text-[#FF5401] font-extrabold"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Support Desk</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('customer')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'customer' ? 'text-[#FF5401] font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800 font-semibold'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('advisories')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'advisories' ? 'text-[#FF5401] font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800 font-semibold'
              }`}
            >
              <Megaphone className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Advisories</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('support')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
                activeTab === 'support' ? 'text-[#FF5401] font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800 font-semibold'
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Support</span>
              {openTicketsCount > 0 && (
                <span className="absolute -top-1 right-2 w-4 h-4 bg-[#FF5C5C] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                  {openTicketsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('user-management')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'user-management' ? 'text-[#FF5401] font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800 font-semibold'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">User Mgmt</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
};
