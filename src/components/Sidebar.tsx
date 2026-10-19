import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  ShoppingCart,
  Boxes,
  Users,
  Building2,
  BookOpen,
  Receipt,
  RotateCcw,
  BarChart3,
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Sparkles,
  Settings,
  Database,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useShop, AppView } from '../context/ShopContext';
import { playClickSound, triggerHaptic } from '../utils/motion';

interface Props {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({ isOpenMobile, onCloseMobile }) => {
  const {
    activeView,
    setActiveView,
    analytics,
    notifications,
    business,
    resetToDemoData,
    desktopSidebarCollapsed,
    setDesktopSidebarCollapsed,
    logoutUser,
    authUser,
    t,
  } = useShop();

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navItems: {
    id: AppView;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: t('dashboard') || 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: t('billing') || 'Quick Billing / POS', icon: CreditCard, badge: 'Fast', badgeColor: 'bg-emerald-500' },
    { id: 'invoices', label: t('invoices') || 'Invoices & Sales', icon: TrendingUp },
    { id: 'purchases', label: t('purchases') || 'Purchases & Bills', icon: ShoppingCart },
    {
      id: 'inventory',
      label: t('inventory') || 'Inventory & Stock',
      icon: Boxes,
      badge: analytics.lowStockCount > 0 ? `${analytics.lowStockCount} Low` : undefined,
      badgeColor: 'bg-rose-500',
    },
    { id: 'customers', label: t('customers') || 'Customers', icon: Users },
    { id: 'suppliers', label: t('suppliers') || 'Suppliers', icon: Building2 },
    {
      id: 'khata',
      label: t('khata') || 'Khata / Udhaar',
      icon: BookOpen,
      badge: analytics.pendingPayments > 0 ? 'Dues' : undefined,
      badgeColor: 'bg-amber-500',
    },
    { id: 'expenses', label: t('expenses') || 'Expenses', icon: Receipt },
    { id: 'returns', label: t('returns') || 'Returns', icon: RotateCcw },
    { id: 'reports', label: t('reports') || 'Reports & P&L', icon: BarChart3 },
    { id: 'gst', label: t('gst') || 'GST Reports & ITC', icon: FileCheck2 },
    { id: 'ai_assistant', label: t('ai_assistant') || 'Goldnifi AI', icon: Sparkles, badge: 'AI', badgeColor: 'bg-purple-600' },
    { id: 'staff', label: t('staff') || 'Staff & Roles', icon: ShieldCheck },
    {
      id: 'notifications',
      label: t('notifications') || 'Notifications',
      icon: Bell,
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
      badgeColor: 'bg-rose-500',
    },
    { id: 'settings', label: t('settings') || 'Settings & Profile', icon: Settings },
    { id: 'super_admin', label: 'Super Admin (Owner Only)', icon: ShieldAlert, badge: 'Owner', badgeColor: 'bg-amber-600' },
  ];

  const handleSelect = (view: AppView) => {
    playClickSound();
    triggerHaptic('light');
    setActiveView(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#12181F]/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 h-screen bg-white dark:bg-[#182026] text-[#2D3436] dark:text-[#F5F6FA] flex flex-col border-r border-[#DFE6E9] dark:border-[#2A3642] transition-all duration-300 ease-in-out print:hidden ${
          desktopSidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64'
        } ${
          isOpenMobile ? 'w-72 max-w-[85vw] translate-x-0 shadow-2xl animate-drawer-left' : 'max-lg:-translate-x-full'
        } lg:static lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-3.5 sm:px-4 border-b border-[#DFE6E9] dark:border-[#2A3642] shrink-0 bg-white dark:bg-[#182026]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <button
              onClick={() => setActiveView('dashboard')}
              className="w-8 h-8 rounded-xl bg-[#0984E3] text-white flex items-center justify-center font-black text-base shadow-sm relative shrink-0 cursor-pointer"
              title="VYAPRIX Business"
            >
              V
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00CEC9] ring-2 ring-white dark:ring-[#182026]" />
            </button>
            
            {/* Brand text (hidden on desktop if collapsed) */}
            <div className={`overflow-hidden transition-opacity duration-200 ${desktopSidebarCollapsed ? 'lg:hidden' : 'block'}`}>
              <h1 className="font-bold text-sm tracking-wider text-[#2D3436] dark:text-white uppercase flex items-center gap-1.5 leading-tight">
                VYAPRIX
                <span className="text-[9px] font-black px-1.5 py-0.5 bg-[#00CEC9]/15 text-[#00CEC9] rounded">
                  BIZ
                </span>
              </h1>
              <p className="text-[10px] text-[#636E72] dark:text-[#B2BEC3] font-medium leading-none truncate">
                Run Your Business Smarter
              </p>
            </div>
          </div>

          {/* Desktop Collapse / Expand Toggle & Mobile Close */}
          <div className="flex items-center gap-1">
            {/* Desktop Toggle Button */}
            <button
              onClick={() => setDesktopSidebarCollapsed(!desktopSidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-[#F5F6FA] dark:bg-[#202B33] hover:bg-[#E9ECEF] dark:hover:bg-[#2A3642] text-[#636E72] hover:text-[#2D3436] dark:text-[#B2BEC3] dark:hover:text-white transition cursor-pointer"
              title={desktopSidebarCollapsed ? 'Expand Sidebar (240px)' : 'Collapse Sidebar (72px)'}
              aria-label={desktopSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {desktopSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="flex lg:hidden items-center justify-center w-8 h-8 rounded-xl bg-[#F5F6FA] dark:bg-[#202B33] hover:bg-[#FDEAEA] dark:hover:bg-[#D63031]/20 border border-[#DFE6E9] dark:border-[#2A3642] text-[#636E72] hover:text-[#D63031] dark:text-[#B2BEC3] dark:hover:text-[#FF7675] active:scale-90 transition shadow-2xs"
              title="Close Menu"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3 space-y-1">
          {!desktopSidebarCollapsed && (
            <p className="text-[10px] font-bold text-[#636E72] dark:text-[#B2BEC3] uppercase tracking-wider px-2.5 mb-1.5 hidden lg:block">
              Main Menu
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isAi = item.id === 'ai_assistant';
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                title={desktopSidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl text-xs font-semibold transition active:scale-[0.98] relative ${
                  desktopSidebarCollapsed
                    ? 'lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2 justify-between'
                    : 'justify-between px-3 py-2'
                } ${
                  isActive
                    ? 'bg-[#0984E3] text-white shadow-xs'
                    : 'text-[#636E72] dark:text-[#B2BEC3] hover:bg-[#F5F6FA] dark:hover:bg-[#202B33] hover:text-[#2D3436] dark:hover:text-white'
                }`}
              >
                <div className={`flex items-center gap-2.5 min-w-0 ${desktopSidebarCollapsed ? 'lg:gap-0' : ''}`}>
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-white'
                        : isAi
                        ? 'text-[#00CEC9]'
                        : 'text-[#636E72] dark:text-[#B2BEC3]'
                    }`}
                  />
                  <span
                    className={`truncate text-[13px] ${
                      desktopSidebarCollapsed ? 'lg:hidden' : 'block'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Badge for Expanded Sidebar */}
                {item.badge && !desktopSidebarCollapsed && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      isAi
                        ? 'bg-[#00CEC9] text-[#1E272E]'
                        : item.id === 'inventory' || item.id === 'notifications'
                        ? 'bg-[#D63031] text-white'
                        : item.id === 'khata'
                        ? 'bg-[#FDCB6E] text-[#1E272E]'
                        : item.id === 'billing'
                        ? 'bg-[#00B894] text-white'
                        : 'bg-[#0984E3] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Dot Badge for Collapsed Desktop Sidebar */}
                {item.badge && desktopSidebarCollapsed && (
                  <span className="hidden lg:block absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00CEC9] ring-2 ring-white dark:ring-[#182026]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="p-2.5 sm:p-3 border-t border-[#DFE6E9] dark:border-[#2A3642] shrink-0 space-y-2 bg-white dark:bg-[#182026]">
          {/* Quick Business Card */}
          {!desktopSidebarCollapsed ? (
            <div className="p-2.5 rounded-xl bg-[#F5F6FA] dark:bg-[#202B33] border border-[#DFE6E9] dark:border-[#2A3642] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#2D3436] dark:text-white truncate">{business.name}</p>
                <p className="text-[10px] text-[#636E72] dark:text-[#B2BEC3]">
                  Plan:{' '}
                  <span className="font-semibold text-[#0984E3] dark:text-[#00CEC9] uppercase">
                    {business.plan}
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleSelect('settings')}
                title="Settings"
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#182026] text-[#636E72] hover:text-[#0984E3] transition"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleSelect('settings')}
              className="hidden lg:flex items-center justify-center p-2 rounded-xl bg-[#F5F6FA] dark:bg-[#202B33] border border-[#DFE6E9] dark:border-[#2A3642] w-full hover:border-[#0984E3] transition"
              title={`${business.name} Settings`}
            >
              <Settings className="w-4 h-4 text-[#0984E3] dark:text-[#00CEC9]" />
            </button>
          )}

          <button
            onClick={() => {
              logoutUser();
            }}
            title={desktopSidebarCollapsed ? 'Log Out' : undefined}
            className={`w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-[#D63031] hover:bg-[#D63031]/10 rounded-xl transition cursor-pointer ${
              desktopSidebarCollapsed ? 'lg:px-0' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={desktopSidebarCollapsed ? 'lg:hidden' : 'block'}>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

