import React from 'react';
import { X, CheckCheck, Bell, AlertTriangle, CreditCard, FileText, ShoppingCart } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatDate } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setActiveView } = useShop();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#1E272E]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#1E272E] shadow-2xl border-l border-[#DFE6E9] dark:border-[#485460] flex flex-col animate-drawer-right">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[#DFE6E9] dark:border-[#485460] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#0984E3]/10 text-[#0984E3] dark:text-[#00CEC9]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                  Notifications Center
                </h3>
                <p className="text-xs text-[#636E72] dark:text-[#B2BEC3]">
                  {notifications.filter((n) => !n.read).length} unread updates
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={markAllNotificationsRead}
                className="p-1.5 text-xs text-[#0984E3] hover:bg-[#F5F6FA] rounded-lg dark:text-[#00CEC9] dark:hover:bg-[#26343D] font-medium"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-[#636E72] hover:text-[#2D3436] dark:hover:text-[#F5F6FA] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-[#636E72] dark:text-[#B2BEC3]">
                <Bell className="w-10 h-10 mx-auto text-[#DFE6E9] dark:text-[#485460] mb-3" />
                <p className="text-sm font-semibold">No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.read;
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.link) {
                        setActiveView(n.link as any);
                        onClose();
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer text-xs space-y-1 ${
                      isUnread
                        ? 'bg-[#0984E3]/10 dark:bg-[#0984E3]/20 border-[#0984E3]/30'
                        : 'bg-[#F5F6FA] dark:bg-[#26343D] border-[#DFE6E9] dark:border-[#485460]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2D3436] dark:text-[#F5F6FA] flex items-center gap-1.5">
                        {n.type === 'low_stock' && <AlertTriangle className="w-3.5 h-3.5 text-[#D63031]" />}
                        {n.type === 'payment_due' && <CreditCard className="w-3.5 h-3.5 text-[#FDCB6E]" />}
                        {n.type === 'invoice_created' && <FileText className="w-3.5 h-3.5 text-[#00B894]" />}
                        {n.type === 'purchase_added' && <ShoppingCart className="w-3.5 h-3.5 text-[#0984E3]" />}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-[#636E72] dark:text-[#B2BEC3]">
                        {formatDate(n.createdAt, true)}
                      </span>
                    </div>
                    <p className="text-[#636E72] dark:text-[#B2BEC3] text-[11px] leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
