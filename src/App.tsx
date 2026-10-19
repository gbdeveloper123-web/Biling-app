import React, { useState, useEffect } from 'react';
import { ShopProvider, useShop, AppView } from './context/ShopContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { QuickPanel } from './components/QuickPanel';
import { NotificationDrawer } from './components/NotificationDrawer';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { OnboardingModal } from './components/OnboardingModal';
import { QuickAddModal } from './components/QuickAddModal';

// Views
import { DashboardView } from './views/DashboardView';
import { BillingView } from './views/BillingView';
import { InvoicesView } from './views/InvoicesView';
import { InventoryView } from './views/InventoryView';
import { CustomersView } from './views/CustomersView';
import { SuppliersView } from './views/SuppliersView';
import { KhataView } from './views/KhataView';
import { PurchasesView } from './views/PurchasesView';
import { ExpensesView } from './views/ExpensesView';
import { ReturnsView } from './views/ReturnsView';
import { ReportsView } from './views/ReportsView';
import { GstView } from './views/GstView';
import { AiAssistantView } from './views/AiAssistantView';
import { StaffView } from './views/StaffView';
import { SettingsView } from './views/SettingsView';
import { SuperAdminView } from './views/SuperAdminView';
import { AuthView } from './views/auth/AuthView';
import { BusinessOnboardingView } from './views/auth/BusinessOnboardingView';
import { LandingView } from './views/LandingView';

// Mobile Bottom Nav Icons
import {
  LayoutDashboard,
  CreditCard,
  Boxes,
  BookOpen,
  BarChart3,
  Plus,
  Menu,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedInvoiceForPrint,
    setSelectedInvoiceForPrint,
    authUser,
    isAuthenticated,
    authChecked,
    loginUser,
    logoutUser,
    completeOnboardingUser,
  } = useShop();

  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [publicAuthMode, setPublicAuthMode] = useState<'landing' | 'login' | 'signup'>('landing');

  useEffect(() => {
    if (!isAuthenticated) {
      setPublicAuthMode('landing');
    }
  }, [isAuthenticated]);

  // Global Keyboard Shortcuts (Ctrl+N, Ctrl+K, Ctrl+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N -> New Invoice
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setActiveView('billing');
      }
      // Ctrl/Cmd + P -> Print
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        if (!selectedInvoiceForPrint) {
          // If invoice isn't open, default behavior or print window
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView, selectedInvoiceForPrint]);

  // View routing
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'billing':
        return <BillingView />;
      case 'invoices':
        return <InvoicesView />;
      case 'inventory':
        return <InventoryView />;
      case 'customers':
        return <CustomersView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'khata':
        return <KhataView />;
      case 'purchases':
        return <PurchasesView />;
      case 'expenses':
        return <ExpensesView />;
      case 'returns':
        return <ReturnsView />;
      case 'reports':
        return <ReportsView />;
      case 'gst':
        return <GstView />;
      case 'ai_assistant':
        return <AiAssistantView />;
      case 'staff':
        return <StaffView />;
      case 'settings':
        return <SettingsView />;
      case 'super_admin':
        return <SuperAdminView />;
      case 'notifications':
        return <DashboardView />;
      default:
        return <DashboardView />;
    }
  };

  // 1. If user is not authenticated:
  // Show Public Landing Page by default. If user clicks Login or Get Started, render AuthView.
  if (!isAuthenticated) {
    if (publicAuthMode === 'landing') {
      return (
        <LandingView
          onLogin={() => setPublicAuthMode('login')}
          onSignUp={() => setPublicAuthMode('signup')}
        />
      );
    }

    return (
      <AuthView
        initialMode={publicAuthMode}
        onBackToLanding={() => setPublicAuthMode('landing')}
        onSuccess={(user, token) => {
          loginUser(user, token);
          if (user.role === 'super_admin') {
            setActiveView('super_admin');
          } else {
            setActiveView('dashboard');
          }
        }}
        onSuperAdminRoute={() => {
          setActiveView('super_admin');
        }}
      />
    );
  }

  // 2. If authenticated and business onboarding is incomplete, render the 4-step onboarding
  if (authUser && !authUser.onboardingComplete) {
    return (
      <BusinessOnboardingView
        user={authUser}
        onComplete={async (payload) => {
          await completeOnboardingUser(payload);
          setActiveView('dashboard');
        }}
      />
    );
  }

  // 3. If Super Admin Portal is active, render the dedicated, secure full-screen control center
  if (activeView === 'super_admin') {
    return <SuperAdminView onExit={() => setActiveView('dashboard')} />;
  }

  // Determine if Contextual Right Panel should be displayed
  const showRightPanel = ['dashboard', 'inventory', 'khata'].includes(activeView);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#12181F] text-[#2D3436] dark:text-[#F5F6FA] font-sans">
      {/* 1. Left Sidebar */}
      <Sidebar
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
      />

      {/* 2. Main Body (Header + Content + Contextual Panel) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#12181F]">
        {/* Top Header */}
        <Header
          onToggleSidebarMobile={() => setIsSidebarMobileOpen(true)}
          onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        />

        {/* Viewport Area */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative bg-white dark:bg-[#12181F]">
          {/* Main Scrollable View with Smooth Transition Animation */}
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-20 lg:pb-6 bg-white dark:bg-[#12181F]">
            <div key={activeView} className="animate-view-fade-in w-full min-h-full">
              {renderView()}
            </div>
          </main>

          {/* Contextual Right-Side Quick Panel */}
          {showRightPanel && (
            <QuickPanel
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              onOpenAddProduct={() => setActiveView('inventory')}
            />
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#182026]/95 backdrop-blur-md border-t border-[#DFE6E9] dark:border-[#2A3642] lg:hidden flex items-center justify-around py-2 px-1 text-[10px] font-semibold text-[#636E72] dark:text-[#B2BEC3] print:hidden shadow-lg">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center gap-0.5 transition ${
              activeView === 'dashboard' ? 'text-[#0984E3] dark:text-[#00CEC9]' : 'text-[#636E72] dark:text-[#B2BEC3]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveView('billing')}
            className={`flex flex-col items-center gap-0.5 transition ${
              activeView === 'billing' ? 'text-[#0984E3] dark:text-[#00CEC9]' : 'text-[#636E72] dark:text-[#B2BEC3]'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Billing</span>
          </button>

          {/* Floating Quick Add "+" in Mobile Bottom Nav */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="w-11 h-11 -mt-5 rounded-full bg-[#0984E3] hover:bg-[#0770C2] text-white flex items-center justify-center shadow-lg active:scale-90 transition border-2 border-white dark:border-[#1E272E]"
            aria-label="Quick Add"
          >
            <Plus className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveView('inventory')}
            className={`flex flex-col items-center gap-0.5 transition ${
              activeView === 'inventory' ? 'text-[#0984E3] dark:text-[#00CEC9]' : 'text-[#636E72] dark:text-[#B2BEC3]'
            }`}
          >
            <Boxes className="w-5 h-5" />
            <span>Stock</span>
          </button>

          {/* Menu button to open sidebar on mobile */}
          <button
            onClick={() => setIsSidebarMobileOpen(true)}
            className={`flex flex-col items-center gap-0.5 transition ${
              isSidebarMobileOpen ? 'text-[#0984E3] dark:text-[#00CEC9]' : 'text-[#636E72] dark:text-[#B2BEC3]'
            }`}
            aria-label="Open Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
            <span>Menu</span>
          </button>
        </nav>
      </div>

      {/* Global Modals & Drawers */}
      {selectedInvoiceForPrint && (
        <InvoicePrintModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}

      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onOpenAddProduct={() => setActiveView('inventory')}
      />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}
