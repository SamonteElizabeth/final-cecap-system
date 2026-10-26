import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, AlertTriangle, Calendar, CheckCircle2, Megaphone, Tag, CheckCheck } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

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
        <h2 className="text-base md:text-xl font-semibold text-[#2B2B2B]">Notifications Center</h2>

        <button
          onClick={markAllNotificationsRead}
          className="text-xs font-semibold text-[#FF5401] hover:underline flex items-center gap-1.5 cursor-pointer bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200/60"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Read</span>
        </button>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E7EB] text-xs text-slate-400">
          No notifications yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden divide-y divide-[#E5E7EB]">
          {notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`px-4 py-4 md:px-6 flex items-start gap-3 md:gap-4 cursor-pointer transition-colors ${
                !notif.isRead ? 'bg-orange-50/70 hover:bg-orange-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white shadow-xs shrink-0 border border-[#E5E7EB]">
                {getNotifIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-xs md:text-sm font-bold text-[#2B2B2B]">{notif.title}</h4>
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <span className="text-[10px] md:text-[11px] text-slate-400 font-medium whitespace-nowrap">{notif.timestamp}</span>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-[#FF5401]" />}
                  </div>
                </div>
                <p className="text-xs md:text-[13px] text-slate-600 leading-relaxed mt-1">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
