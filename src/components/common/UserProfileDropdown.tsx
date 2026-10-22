import React, { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown, ShieldCheck, KeyRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UserProfileDropdown: React.FC = () => {
  const { userRole, user, adminUser, logout, setShowPasswordChangeModal } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isStaff = userRole === 'admin' || userRole === 'support_staff';

  const displayName = isStaff
    ? (adminUser?.name || (userRole === 'support_staff' ? 'Support Staff' : 'Administrator'))
    : (user?.name || 'Customer User');

  const displayEmail = isStaff
    ? (adminUser?.email || (userRole === 'support_staff' ? 'support@clarkelectric.ph' : 'admin@clarkelectric.ph'))
    : (user?.email || 'customer@clarkelectric.ph');

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || (userRole === 'support_staff' ? 'SS' : userRole === 'admin' ? 'AD' : 'CU');

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`User Profile: ${displayName}`}
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-slate-100/90 active:bg-slate-200/70 border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer shadow-2xs group focus:outline-none focus:ring-2 focus:ring-[#FF5401]/30"
      >
        {/* Avatar Badge */}
        <div className="w-8 h-8 rounded-full bg-[#FF5401] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs ring-2 ring-white">
          {initials}
        </div>

        {/* User Name (Hidden on compact mobile screens) */}
        <div className="hidden sm:flex flex-col text-left leading-tight pr-0.5">
          <span className="text-xs font-bold text-[#2B2B2B] truncate max-w-[120px] md:max-w-[150px] lg:max-w-[180px]">
            {displayName}
          </span>
        </div>

        {/* Dropdown Chevron */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl p-2.5 z-50 animate-fade-in"
          role="menu"
        >
          {/* User Details Summary: Just User Name and Email */}
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-100 flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#FF5401] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#2B2B2B] truncate" title={displayName}>
                {displayName}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5" title={displayEmail}>
                {displayEmail}
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-1.5" />

          {/* Setting For Security: Change Password */}
          <div className="py-1">
            <div className="px-1 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Security Settings
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowPasswordChangeModal(true);
              }}
              role="menuitem"
              className="w-full text-slate-700 hover:text-[#FF5401] hover:bg-orange-50/80 p-2 rounded-xl border border-transparent hover:border-orange-200/60 text-xs font-semibold transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-50 group-hover:bg-[#FF5401] text-[#FF5401] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-[#2B2B2B] group-hover:text-[#FF5401]">
                    Change Password
                  </span>
                  <span className="block text-[10px] text-slate-400 group-hover:text-orange-600/80">
                    Update security credentials
                  </span>
                </div>
              </div>
              <KeyRound className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF5401] transition-colors" />
            </button>
          </div>

          <div className="h-px bg-slate-100 my-1.5" />

          {/* Action: Log Out */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            role="menuitem"
            className="w-full bg-rose-50 hover:bg-rose-100/90 text-[#EF4444] hover:text-rose-700 px-3 py-2.5 rounded-xl border border-rose-200/60 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <LogOut className="w-4 h-4 text-[#EF4444]" />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
