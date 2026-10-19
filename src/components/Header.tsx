import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  UserCheck,
  Menu,
  Building2,
  Check,
  ArrowLeft,
  Globe,
  LogOut,
  Cloud,
  CloudOff,
  RefreshCw,
} from 'lucide-react';
import { useShop, AppView } from '../context/ShopContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../utils/translations';
import { GlobalSearchModal } from './GlobalSearchModal';
import { QuickAddModal } from './QuickAddModal';
import { playClickSound } from '../utils/motion';

interface Props {
  onToggleSidebarMobile: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<Props> = ({ onToggleSidebarMobile, onOpenNotifications }) => {
  const {
    business,
    allBusinesses,
    switchBusiness,
    activeView,
    setActiveView,
    goBack,
    canGoBack,
    themeMode,
    darkMode,
    toggleDarkMode,
    desktopSidebarCollapsed,
    setDesktopSidebarCollapsed,
    staff,
    currentStaff,
    setCurrentStaff,
    notifications,
    language,
    setLanguage,
    authUser,
    logoutUser,
    t,
    platform,
    isOnline,
    isSyncing,
    pendingSyncCount,
    triggerManualSync,
  } = useShop();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isBizMenuOpen, setIsBizMenuOpen] = useState(false);
  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-2.5 sm:px-6 bg-white dark:bg-[#182026] border-b border-[#DFE6E9] dark:border-[#2A3642] text-[#2D3436] dark:text-[#F5F6FA] transition-colors print:hidden">
        {/* Left: Mobile hamburger, Stylish Back Button & Business Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) {
                setDesktopSidebarCollapsed(!desktopSidebarCollapsed);
              } else {
                onToggleSidebarMobile();
              }
            }}
            className="p-2 text-[#636E72] hover:text-[#2D3436] dark:text-[#B2BEC3] dark:hover:text-white rounded-xl hover:bg-[#F5F6FA] dark:hover:bg-[#202B33] transition cursor-pointer"
            title={desktopSidebarCollapsed ? 'Expand Navigation Sidebar' : 'Toggle Navigation'}
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Stylish Back Button - Works seamlessly on laptop and phone */}
          {canGoBack && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F5F6FA] hover:bg-[#E9ECEF] dark:bg-[#202B33] dark:hover:bg-[#2A3642] text-[#2D3436] dark:text-[#F5F6FA] text-xs font-bold border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xs active:scale-95 transition shrink-0 cursor-pointer"
              title={t('back')}
              aria-label="Go Back / Wapas"
            >
              <ArrowLeft className="w-4 h-4 text-[#0984E3] dark:text-[#00CEC9]" />
              <span className="hidden md:inline font-semibold">{t('back')}</span>
            </button>
          )}

          {/* Business Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsBizMenuOpen(!isBizMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#F5F6FA] dark:hover:bg-[#26343D] transition text-left"
            >
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-[#DFE6E9] dark:border-[#485460]"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0984E3] text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                  {business.name.substring(0, 1)}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA] leading-tight truncate max-w-[130px] lg:max-w-[160px]">
                  {business.name}
                </p>
                <p className="text-[10px] text-[#636E72] dark:text-[#B2BEC3] font-mono">
                  GSTIN: {business.gstin ? business.gstin.substring(0, 10) + '...' : 'Unregistered'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#636E72]" />
            </button>

            {/* Dropdown Menu */}
            {isBizMenuOpen && (
              <div
                className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#2F3E46] rounded-xl shadow-xl border border-[#DFE6E9] dark:border-[#485460] p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsBizMenuOpen(false)}
              >
                <p className="text-[10px] font-bold text-[#636E72] dark:text-[#B2BEC3] uppercase tracking-wider px-2.5 py-1">
                  Your Businesses
                </p>
                {allBusinesses.map((biz) => (
                  <button
                    key={biz.id}
                    onClick={() => switchBusiness(biz.id)}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-[#F5F6FA] dark:hover:bg-[#26343D] transition"
                  >
                    <div>
                      <p className="font-semibold text-[#2D3436] dark:text-[#F5F6FA]">{biz.name}</p>
                      <p className="text-[10px] text-[#636E72] dark:text-[#B2BEC3]">{biz.city || 'Store'}</p>
                    </div>
                    {biz.id === business.id && <Check className="w-4 h-4 text-[#0984E3]" />}
                  </button>
                ))}
                <div className="border-t border-[#DFE6E9] dark:border-[#485460] mt-1 pt-1">
                  <button
                    onClick={() => setActiveView('settings')}
                    className="w-full text-left p-2 text-xs font-semibold text-[#0984E3] dark:text-[#00CEC9] hover:bg-[#F5F6FA] dark:hover:bg-[#26343D] rounded-lg flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Manage / Add Business
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-[#636E72] dark:text-[#B2BEC3] bg-[#F5F6FA] dark:bg-[#26343D] hover:bg-[#DFE6E9]/40 dark:hover:bg-[#26343D]/80 rounded-xl border border-[#DFE6E9] dark:border-[#485460] transition"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#636E72] dark:text-[#B2BEC3]" />
              <span>Search products, invoices, customers, suppliers...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-[#1E272E] text-[#636E72] dark:text-[#B2BEC3] rounded border border-[#DFE6E9] dark:border-[#485460] shadow-2xs">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-1.5 sm:p-2 text-[#636E72] hover:text-[#2D3436] dark:text-[#B2BEC3] dark:hover:text-white md:hidden rounded-lg hover:bg-[#F5F6FA] dark:hover:bg-[#26343D]"
            aria-label="Search"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* AI Assistant Quick Pill (Desktop/Tablet) */}
          <button
            onClick={() => setActiveView('ai_assistant')}
            title="Goldnifi AI • Powered by GOLDEN BAZAAR"
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 border ${
              activeView === 'ai_assistant'
                ? 'bg-[#0984E3] text-white border-transparent shadow-sm'
                : 'bg-white dark:bg-[#26343D] text-[#0984E3] dark:text-[#00CEC9] border-[#DFE6E9] dark:border-[#485460] hover:border-[#00CEC9]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00CEC9] fill-[#00CEC9]" />
            <span>Goldnifi AI</span>
          </button>

          {/* Real-time Multi-Platform & Offline Sync Indicator */}
          <button
            onClick={() => triggerManualSync()}
            disabled={isSyncing}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              !isOnline
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                : pendingSyncCount > 0
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            }`}
            title={
              !isOnline
                ? `Offline POS Active (${pendingSyncCount} pending upload). Click to retry.`
                : isSyncing
                ? 'Syncing with Firebase Cloud...'
                : pendingSyncCount > 0
                ? `${pendingSyncCount} operations waiting to sync. Click to sync now.`
                : 'Firebase Cloud 100% Synced'
            }
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
            ) : !isOnline ? (
              <CloudOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className="capitalize">{platform}</span>
            <span className="text-[10px] opacity-80">
              {isSyncing ? 'Syncing...' : !isOnline ? `Offline (${pendingSyncCount})` : pendingSyncCount > 0 ? `Pending (${pendingSyncCount})` : 'Synced'}
            </span>
          </button>

          {/* Quick Add Button (Desktop/Tablet) */}
          <button
            onClick={() => {
              playClickSound();
              setIsQuickAddOpen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0984E3] hover:bg-[#0770C2] active:scale-95 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Add</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => {
              playClickSound();
              onOpenNotifications();
            }}
            className="relative p-1.5 sm:p-2 text-[#636E72] hover:text-[#2D3436] dark:text-[#B2BEC3] dark:hover:text-white rounded-xl hover:bg-[#F5F6FA] dark:hover:bg-[#26343D] transition active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[9px] sm:text-[10px] font-bold text-white bg-[#D63031] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="p-1.5 sm:p-2 text-[#636E72] hover:text-[#2D3436] dark:text-[#B2BEC3] dark:hover:text-white rounded-xl hover:bg-[#F5F6FA] dark:hover:bg-[#202B33] transition flex items-center gap-1"
              title="Change Language (भाषा बदलें)"
              aria-label="Language Selector"
            >
              <Globe className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0984E3] dark:text-[#00CEC9]" />
              <span className="hidden xl:inline text-xs font-bold uppercase">{language}</span>
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] rounded-2xl shadow-xl z-50 p-2 animate-in fade-in duration-100 max-h-80 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Select Language (भाषा चुनें)
                </p>
                <div className="space-y-1">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-[#0984E3]/10 text-[#0984E3] dark:text-[#00CEC9] font-bold'
                            : 'hover:bg-[#F5F6FA] dark:hover:bg-[#202B33] text-slate-700 dark:text-[#F5F6FA]'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{lang.nativeName}</p>
                          <p className="text-[10px] text-slate-400">{lang.name} • {lang.region}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#0984E3] dark:text-[#00CEC9]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle (Light / Dark / Auto) */}
          <button
            onClick={() => {
              playClickSound();
              toggleDarkMode();
            }}
            className="p-2 text-[#636E72] hover:text-[#2D3436] dark:text-[#B2BEC3] dark:hover:text-white rounded-xl hover:bg-[#F5F6FA] dark:hover:bg-[#202B33] transition active:scale-90"
            title={`Theme Mode: ${themeMode.toUpperCase()} (Click to toggle Light / Dark / Auto)`}
            aria-label="Toggle Theme Mode"
          >
            {themeMode === 'auto' ? (
              <Monitor className="w-5 h-5 text-[#00CEC9]" />
            ) : darkMode ? (
              <Sun className="w-5 h-5 text-[#FDCB6E]" />
            ) : (
              <Moon className="w-5 h-5 text-[#636E72]" />
            )}
          </button>

          {/* Staff Switcher Profile (Tablet / Desktop) */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsStaffMenuOpen(!isStaffMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-[#F5F6FA] dark:hover:bg-[#26343D] transition border border-[#DFE6E9] dark:border-[#485460]"
            >
              <div className="w-6 h-6 rounded-full bg-[#DFE6E9] dark:bg-[#485460] text-[#1E272E] dark:text-[#F5F6FA] font-bold text-xs flex items-center justify-center">
                {currentStaff.name.substring(0, 1)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[11px] font-bold text-[#2D3436] dark:text-[#F5F6FA] leading-tight">
                  {currentStaff.name}
                </p>
                <p className="text-[9px] text-[#636E72] dark:text-[#B2BEC3] uppercase font-semibold">
                  {currentStaff.role}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-[#636E72]" />
            </button>

            {isStaffMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#2F3E46] rounded-xl shadow-xl border border-[#DFE6E9] dark:border-[#485460] p-2 z-50"
                onClick={() => setIsStaffMenuOpen(false)}
              >
                {authUser && (
                  <div className="p-2 mb-1 bg-[#F5F6FA] dark:bg-[#1E272E] rounded-lg border border-[#DFE6E9] dark:border-[#2A3642]">
                    <p className="text-xs font-bold text-[#2D3436] dark:text-white truncate">{authUser.name}</p>
                    <p className="text-[10px] text-[#636E72] dark:text-[#B2BEC3] truncate">{authUser.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#0984E3]/10 text-[#0984E3] dark:text-[#00CEC9]">
                      {authUser.role}
                    </span>
                  </div>
                )}
                <p className="text-[10px] font-bold text-[#636E72] dark:text-[#B2BEC3] uppercase tracking-wider px-2 py-1">
                  Active Staff (Role Demo)
                </p>
                {staff.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentStaff(s)}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-[#F5F6FA] dark:hover:bg-[#26343D] transition"
                  >
                    <div>
                      <p className="font-semibold text-[#2D3436] dark:text-[#F5F6FA]">{s.name}</p>
                      <p className="text-[10px] text-[#636E72] dark:text-[#B2BEC3] capitalize">{s.role}</p>
                    </div>
                    {s.id === currentStaff.id && <Check className="w-3.5 h-3.5 text-[#0984E3]" />}
                  </button>
                ))}
                <div className="border-t border-[#DFE6E9] dark:border-[#485460] mt-1 pt-1 space-y-0.5">
                  <button
                    onClick={() => setActiveView('staff')}
                    className="w-full text-left p-2 text-xs font-semibold text-[#0984E3] dark:text-[#00CEC9] hover:bg-[#F5F6FA] dark:hover:bg-[#26343D] rounded-lg cursor-pointer"
                  >
                    Manage Staff Permissions
                  </button>
                  <button
                    onClick={() => {
                      setIsStaffMenuOpen(false);
                      logoutUser();
                    }}
                    className="w-full flex items-center gap-1.5 p-2 text-xs font-semibold text-[#D63031] hover:bg-[#D63031]/10 rounded-lg cursor-pointer transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Quick Add Modal */}
      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </>
  );
};
