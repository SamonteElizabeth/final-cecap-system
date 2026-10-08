import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, AlertTriangle, Calendar, CheckCircle2, Megaphone, Tag, CheckCheck, Smartphone, Mail, MessageSquare } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
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
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'OUTAGE_SCHEDULED':
        return <Calendar className="w-5 h-5 text-amber-500" />;
      case 'PAYMENT_CONFIRMATION':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'DUE_DATE_REMINDER':
        return <Bell className="w-5 h-5 text-[#FF5401]" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-5 h-5 text-indigo-500" />;
      case 'PROMOTION':
        return <Tag className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-[#FF5401]" />;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 md:pb-12 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base md:text-xl font-semibold text-[#2B2B2B]">Notifications Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time alerts, bills, & outage notices</p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="text-xs font-semibold text-[#FF5401] hover:underline flex items-center gap-1.5 cursor-pointer bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200/60"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-[#E5E7EB] p-2 gap-2 rounded-full text-xs font-semibold max-w-md">
        <button
          onClick={() => setFilter('ALL')}
          className={`flex-1 py-2 px-4 rounded-full transition-all cursor-pointer ${
            filter === 'ALL' ? 'bg-white text-[#FF5401] shadow-xs font-semibold' : 'text-slate-600 hover:text-[#2B2B2B]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('OUTAGE')}
          className={`flex-1 py-2 px-4 rounded-full transition-all cursor-pointer ${
            filter === 'OUTAGE' ? 'bg-white text-[#FF5401] shadow-xs font-semibold' : 'text-slate-600 hover:text-[#2B2B2B]'
          }`}
        >
          Outages
        </button>
        <button
          onClick={() => setFilter('BILL')}
          className={`flex-1 py-2 px-4 rounded-full transition-all cursor-pointer ${
            filter === 'BILL' ? 'bg-white text-[#FF5401] shadow-xs font-semibold' : 'text-slate-600 hover:text-[#2B2B2B]'
          }`}
        >
          Bills
        </button>
        <button
          onClick={() => setFilter('ANNOUNCEMENT')}
          className={`flex-1 py-2 px-4 rounded-full transition-all cursor-pointer ${
            filter === 'ANNOUNCEMENT' ? 'bg-white text-[#FF5401] shadow-xs font-semibold' : 'text-slate-600 hover:text-[#2B2B2B]'
          }`}
        >
          Company
        </button>
      </div>

      {/* Notifications List */}
      <div>
        {filteredNotifs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E7EB] text-xs text-slate-400">
            No notifications found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {filteredNotifs.map(notif => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-5 md:p-6 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 relative ${
                  !notif.isRead
                    ? 'bg-orange-50/70 border-[#FF5401]/30 shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:border-slate-300'
                }`}
              >
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-[#FF5401] absolute top-4 right-4"></span>
                )}

                <div className="p-2.5 rounded-xl bg-white shadow-xs shrink-0 border border-[#E5E7EB]">
                  {getNotifIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-xs md:text-sm font-bold text-[#2B2B2B] truncate">{notif.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{notif.message}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E5E7EB] text-[10px] text-slate-400 font-medium">
                    <span>{notif.timestamp}</span>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="flex items-center gap-0.5"><Smartphone className="w-2.5 h-2.5" /> Push</span>
                      <span className="flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5" /> SMS</span>
                      <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" /> Email</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
