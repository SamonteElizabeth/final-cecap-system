import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileFrame } from './components/MobileFrame';
import { ArchitectureHub } from './components/architecture/ArchitectureHub';
import { EmailOutboxModal } from './components/common/EmailOutboxModal';
import { Mail, ArrowRight } from 'lucide-react';

const MainContent: React.FC = () => {
  const { viewMode, toastMsg, setEmailModalOpen, sentEmails } = useApp();

  return (
    <>
      {/* Global Toast Notification Banner for Dispatched Email */}
      {toastMsg && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-white text-[#2B2B2B] px-4 py-2.5 rounded-2xl shadow-lg border border-[#E5E7EB] flex items-center gap-3 animate-slide-down text-xs font-semibold max-w-md w-11/12">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-[#FF5401]/20 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-[#FF5401]" />
          </div>
          <span className="flex-1 truncate">{toastMsg}</span>
          <button
            type="button"
            onClick={() => setEmailModalOpen(true)}
            className="bg-[#FF5401] hover:bg-[#E54A00] text-white px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>View Email</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {viewMode === 'architecture' ? <ArchitectureHub /> : <MobileFrame />}

      {/* Global Email Dispatch Outbox Modal */}
      <EmailOutboxModal />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}


