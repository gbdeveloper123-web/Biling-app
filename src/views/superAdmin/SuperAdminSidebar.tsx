import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building,
  Users,
  Eye,
  CreditCard,
  Layers,
  CircleDollarSign,
  TicketPercent,
  LifeBuoy,
  Sparkles,
  BarChart3,
  TrendingUp,
  Megaphone,
  Share2,
  BellRing,
  ToggleLeft,
  Server,
  ShieldAlert,
  History,
  Database,
  Sliders,
  ShieldCheck,
  UserCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { SuperAdminTab } from '../../types/superAdmin';

interface SuperAdminSidebarProps {
  activeTab: SuperAdminTab;
  onSelectTab: (tab: SuperAdminTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  badgeCounts?: {
    openTickets?: number;
    riskAlerts?: number;
    activeCoupons?: number;
    newAnnouncements?: number;
  };
}

interface NavItem {
  id: SuperAdminTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
  badgeCounts = {},
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const categories: NavCategory[] = [
    {
      title: 'CORE OVERVIEW',
      items: [
        { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
        { id: 'businesses', label: '2. Businesses', icon: Building },
        { id: 'users', label: '3. Users', icon: Users },
        { id: 'business_360', label: '4. Business 360°', icon: Eye },
      ],
    },
    {
      title: 'MONETIZATION & BILLING',
      items: [
        { id: 'subscriptions', label: '5. Subscriptions', icon: CreditCard },
        { id: 'plans_pricing', label: '6. Plans & Pricing', icon: Layers },
        { id: 'payments_revenue', label: '7. Payments & Revenue', icon: CircleDollarSign },
        {
          id: 'coupons_offers',
          label: '8. Coupons & Offers',
          icon: TicketPercent,
          badge: badgeCounts.activeCoupons,
          badgeColor: 'bg-emerald-500',
        },
      ],
    },
    {
      title: 'OPERATIONS & INTELLIGENCE',
      items: [
        {
          id: 'customer_support',
          label: '9. Customer Support',
          icon: LifeBuoy,
          badge: badgeCounts.openTickets ? `${badgeCounts.openTickets} Open` : undefined,
          badgeColor: 'bg-rose-500',
        },
        {
          id: 'goldnifi_ai',
          label: '10. Goldnifi AI',
          icon: Sparkles,
          badge: 'Gemini',
          badgeColor: 'bg-purple-600',
        },
      ],
    },
    {
      title: 'GROWTH & TELEMETRY',
      items: [
        { id: 'usage_analytics', label: '11. Usage & Analytics', icon: BarChart3 },
        { id: 'growth_analytics', label: '12. Growth Analytics', icon: TrendingUp },
        { id: 'marketing_campaigns', label: '13. Marketing Campaigns', icon: Megaphone },
        { id: 'referrals', label: '14. Referrals', icon: Share2 },
        {
          id: 'notifications_announcements',
          label: '15. Announcements',
          icon: BellRing,
          badge: badgeCounts.newAnnouncements,
          badgeColor: 'bg-sky-500',
        },
      ],
    },
    {
      title: 'GOVERNANCE & SECURITY',
      items: [
        { id: 'beta_features', label: '16. Beta Features & Flags', icon: ToggleLeft },
        { id: 'system_health', label: '17. System Health', icon: Server },
        {
          id: 'fraud_risk',
          label: '18. Fraud & Risk',
          icon: ShieldAlert,
          badge: badgeCounts.riskAlerts ? `${badgeCounts.riskAlerts} Alert` : undefined,
          badgeColor: 'bg-amber-500',
        },
        { id: 'audit_logs', label: '19. Audit Logs', icon: History },
        { id: 'data_backup', label: '20. Data & Backup', icon: Database },
        { id: 'platform_settings', label: '21. Platform Settings', icon: Sliders },
        { id: 'admin_security', label: '22. Admin Security', icon: ShieldCheck },
        { id: 'admin_profile', label: '23. Super Admin Profile', icon: UserCheck },
      ],
    },
  ];

  const handleSelect = (tab: SuperAdminTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.label.toLowerCase().includes(filterQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 h-screen bg-[#111822] text-slate-200 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out font-sans ${
          collapsed ? 'lg:w-[72px]' : 'lg:w-64'
        } ${isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Header with Brand & Collapse Button */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-wider text-white">VYAPRIX SA</span>
              <span className="text-[10px] font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                OWNER
              </span>
            </div>
          ) : (
            <div className="mx-auto w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-xs">
              SA
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Search Filter (Hidden when collapsed) */}
        {!collapsed && (
          <div className="p-3 border-b border-slate-800/60 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter 23 modules..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar">
          {filteredCategories.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <p className="px-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {cat.title}
                </p>
              )}

              {cat.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition group relative ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    />

                    {!collapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${
                          item.badgeColor || 'bg-blue-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip for collapsed desktop */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Platform Branding Tag */}
        <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-500 text-center shrink-0">
          {!collapsed ? (
            <p>
              VYAPRIX Control Center <br />
              <span className="text-slate-400 font-semibold">23 Owner Modules</span>
            </p>
          ) : (
            <span>v2.6</span>
          )}
        </div>
      </aside>
    </>
  );
};
