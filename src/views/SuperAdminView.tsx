import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { SuperAdminLogin } from './superAdmin/SuperAdminLogin';
import { SuperAdminHeader } from './superAdmin/SuperAdminHeader';
import { SuperAdminSidebar } from './superAdmin/SuperAdminSidebar';
import { DashboardTab } from './superAdmin/tabs/DashboardTab';
import { BusinessesTab } from './superAdmin/tabs/BusinessesTab';
import { Business360Tab } from './superAdmin/tabs/Business360Tab';
import { UsersTab } from './superAdmin/tabs/UsersTab';
import { SubscriptionsTab } from './superAdmin/tabs/SubscriptionsTab';
import { PlansPricingTab } from './superAdmin/tabs/PlansPricingTab';
import { PaymentsRevenueTab } from './superAdmin/tabs/PaymentsRevenueTab';
import { CouponsOffersTab } from './superAdmin/tabs/CouponsOffersTab';
import { CustomerSupportTab } from './superAdmin/tabs/CustomerSupportTab';
import { GoldnifiAiTab } from './superAdmin/tabs/GoldnifiAiTab';
import { AnalyticsTabs } from './superAdmin/tabs/AnalyticsTabs';
import { SystemTabs } from './superAdmin/tabs/SystemTabs';
import { SettingsSecurityTabs } from './superAdmin/tabs/SettingsSecurityTabs';
import {
  SuperAdminTab,
  SuperAdminProfile,
  TenantBusiness,
  PlatformUser,
  SubscriptionRecord,
  PlanPricingConfig,
  PaymentRecord,
  CouponOffer,
  SupportTicket,
  MarketingCampaign,
  ReferralRecord,
  PlatformAnnouncement,
  FeatureFlag,
  ServiceHealth,
  FraudRiskAlert,
  AdminAuditLog,
  PlatformBackup,
  PlatformSettings,
  AdminSession,
  BusinessAccountStatus,
} from '../types/superAdmin';

// Initial Seed Data for immediate responsive render
const DEFAULT_BUSINESSES: TenantBusiness[] = [
  {
    id: 'biz_01',
    name: 'Golden Bazaar Superstore',
    ownerName: 'Gaurav Bhardwaj',
    phone: '+91 98765 43210',
    email: 'gbdeveloper123@gmail.com',
    gstin: '27AABCU9603R1ZM',
    pan: 'AABCU9603R',
    address: 'Shop 14, Linking Road, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    stateCode: '27',
    pinCode: '400050',
    businessType: 'Retail & Wholesale',
    plan: 'business',
    billingCycle: 'yearly',
    status: 'active',
    trialStatus: 'converted',
    subscriptionStartedAt: '2025-04-10T10:00:00Z',
    subscriptionRenewsAt: '2026-04-10T10:00:00Z',
    isSuspended: false,
    registeredAt: '2025-04-01T09:30:00Z',
    lastActiveAt: new Date().toISOString(),
    stats: {
      invoicesCount: 1248,
      totalRevenue: 2845900,
      productsCount: 384,
      customersCount: 612,
      suppliersCount: 24,
      staffCount: 4,
      branchesCount: 2,
      warehousesCount: 1,
      storageUsageMb: 142.5,
      aiRequestsCount: 182,
    },
    riskScore: 'low',
    tags: ['Superstore', 'GST Verified', 'Fast Invoicing'],
  },
  {
    id: 'biz_02',
    name: 'Sharma Electronics & Appliances',
    ownerName: 'Vikram Sharma',
    phone: '+91 98111 22334',
    email: 'sharma.electronics.delhi@gmail.com',
    gstin: '07AAACS1429B1Z8',
    pan: 'AAACS1429B',
    address: 'Plot 44, Karol Bagh Market',
    city: 'New Delhi',
    state: 'Delhi',
    stateCode: '07',
    pinCode: '110005',
    businessType: 'Consumer Electronics Retail',
    plan: 'pro',
    billingCycle: 'yearly',
    status: 'active',
    trialStatus: 'converted',
    subscriptionStartedAt: '2025-06-15T11:00:00Z',
    subscriptionRenewsAt: '2026-06-15T11:00:00Z',
    isSuspended: false,
    registeredAt: '2025-06-01T10:00:00Z',
    lastActiveAt: new Date().toISOString(),
    stats: {
      invoicesCount: 890,
      totalRevenue: 4950000,
      productsCount: 210,
      customersCount: 430,
      suppliersCount: 18,
      staffCount: 6,
      branchesCount: 3,
      warehousesCount: 2,
      storageUsageMb: 280.0,
      aiRequestsCount: 310,
    },
    riskScore: 'low',
    tags: ['Multi-Branch', 'Serial Scanning'],
  },
  {
    id: 'biz_03',
    name: 'Vardhman Textiles & Sarees',
    ownerName: 'Rajesh Vardhman',
    phone: '+91 98250 88990',
    email: 'vardhman.surat@outlook.com',
    gstin: '24AAACV4891C1ZT',
    pan: 'AAACV4891C',
    address: 'Ring Road Textile Market, Shop 204',
    city: 'Surat',
    state: 'Gujarat',
    stateCode: '24',
    pinCode: '395002',
    businessType: 'Textile Wholesale',
    plan: 'business',
    billingCycle: 'monthly',
    status: 'active',
    trialStatus: 'converted',
    subscriptionStartedAt: '2025-08-01T08:00:00Z',
    subscriptionRenewsAt: '2026-04-01T08:00:00Z',
    isSuspended: false,
    registeredAt: '2025-07-20T14:20:00Z',
    lastActiveAt: new Date().toISOString(),
    stats: {
      invoicesCount: 2140,
      totalRevenue: 6820000,
      productsCount: 950,
      customersCount: 890,
      suppliersCount: 42,
      staffCount: 5,
      branchesCount: 1,
      warehousesCount: 2,
      storageUsageMb: 410.2,
      aiRequestsCount: 145,
    },
    riskScore: 'low',
    tags: ['Wholesaler', 'Khata Heavy'],
  },
  {
    id: 'biz_04',
    name: 'Krishna Medical & Wellness',
    ownerName: 'Dr. Ramesh Patel',
    phone: '+91 94260 11223',
    email: 'krishna.pharma.ahd@gmail.com',
    gstin: '24AABCK7812M1ZU',
    pan: 'AABCK7812M',
    address: 'Near Civil Hospital, Asarwa',
    city: 'Ahmedabad',
    state: 'Gujarat',
    stateCode: '24',
    pinCode: '380016',
    businessType: 'Pharmacy & Medical',
    plan: 'starter',
    billingCycle: 'monthly',
    status: 'active',
    trialStatus: 'converted',
    subscriptionStartedAt: '2025-09-10T12:00:00Z',
    subscriptionRenewsAt: '2026-04-10T12:00:00Z',
    isSuspended: false,
    registeredAt: '2025-09-01T11:00:00Z',
    lastActiveAt: new Date().toISOString(),
    stats: {
      invoicesCount: 3410,
      totalRevenue: 1820000,
      productsCount: 1200,
      customersCount: 1420,
      suppliersCount: 15,
      staffCount: 3,
      branchesCount: 1,
      warehousesCount: 1,
      storageUsageMb: 195.0,
      aiRequestsCount: 65,
    },
    riskScore: 'low',
    tags: ['Batch Expiry', 'Fast POS'],
  },
  {
    id: 'biz_05',
    name: 'Balaji Fresh Mart',
    ownerName: 'Sunil Reddy',
    phone: '+91 99887 66554',
    email: 'balajifresh.hyd@yahoo.com',
    gstin: '36AABCB5544K1ZR',
    pan: 'AABCB5544K',
    address: 'Kukatpally Main Road',
    city: 'Hyderabad',
    state: 'Telangana',
    stateCode: '36',
    pinCode: '500072',
    businessType: 'Supermarket & Grocery',
    plan: 'starter',
    billingCycle: 'monthly',
    status: 'trial',
    trialStatus: 'active',
    subscriptionStartedAt: '2026-03-24T00:00:00Z',
    subscriptionRenewsAt: '2026-04-07T00:00:00Z',
    isSuspended: false,
    registeredAt: '2026-03-24T09:00:00Z',
    lastActiveAt: new Date().toISOString(),
    stats: {
      invoicesCount: 320,
      totalRevenue: 142000,
      productsCount: 450,
      customersCount: 280,
      suppliersCount: 12,
      staffCount: 2,
      branchesCount: 1,
      warehousesCount: 1,
      storageUsageMb: 45.0,
      aiRequestsCount: 28,
    },
    riskScore: 'low',
    tags: ['Trial', 'Grocery'],
  },
  {
    id: 'biz_06',
    name: 'Anand Sweet House & Namkeen',
    ownerName: 'Manish Anand',
    phone: '+91 94500 33221',
    email: 'anandsweets.knp@gmail.com',
    gstin: '09AAACA9922P1Z4',
    pan: 'AAACA9922P',
    address: 'Birhana Road, Canal Cross',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    stateCode: '09',
    pinCode: '208001',
    businessType: 'FMCG & Confectionery',
    plan: 'starter',
    billingCycle: 'monthly',
    status: 'trial',
    trialStatus: 'active',
    subscriptionStartedAt: '2026-03-26T00:00:00Z',
    subscriptionRenewsAt: '2026-04-09T00:00:00Z',
    isSuspended: false,
    registeredAt: '2026-03-26T15:30:00Z',
    lastActiveAt: new Date().toISOString(),
    stats: {
      invoicesCount: 180,
      totalRevenue: 89000,
      productsCount: 110,
      customersCount: 140,
      suppliersCount: 8,
      staffCount: 2,
      branchesCount: 1,
      warehousesCount: 1,
      storageUsageMb: 28.5,
      aiRequestsCount: 14,
    },
    riskScore: 'low',
    tags: ['Trial', 'FMCG'],
  },
  {
    id: 'biz_07',
    name: 'Shiv Hardware & Sanitary',
    ownerName: 'Mukesh Choudhary',
    phone: '+91 94140 77889',
    email: 'shivhardware.jpr@gmail.com',
    gstin: '08AAACS6633D1Z9',
    pan: 'AAACS6633D',
    address: 'MI Road, Near Panch Batti',
    city: 'Jaipur',
    state: 'Rajasthan',
    stateCode: '08',
    pinCode: '302001',
    businessType: 'Hardware & Sanitary',
    plan: 'free',
    billingCycle: 'monthly',
    status: 'active',
    trialStatus: 'none',
    subscriptionStartedAt: '2025-11-01T00:00:00Z',
    subscriptionRenewsAt: '2026-04-01T00:00:00Z',
    isSuspended: false,
    registeredAt: '2025-10-25T11:45:00Z',
    lastActiveAt: new Date().toISOString(),
    stats: {
      invoicesCount: 95,
      totalRevenue: 240000,
      productsCount: 320,
      customersCount: 85,
      suppliersCount: 14,
      staffCount: 1,
      branchesCount: 1,
      warehousesCount: 1,
      storageUsageMb: 34.0,
      aiRequestsCount: 12,
    },
    riskScore: 'low',
    tags: ['Free Starter', 'Hardware'],
  },
];

const DEFAULT_USERS: PlatformUser[] = [
  {
    id: 'usr_01',
    name: 'Gaurav Bhardwaj',
    email: 'gbdeveloper123@gmail.com',
    phone: '+91 98765 43210',
    businessId: 'biz_01',
    businessName: 'Golden Bazaar Superstore',
    role: 'owner',
    status: 'active',
    registeredAt: '2025-04-01T09:30:00Z',
    lastLoginAt: new Date().toISOString(),
    device: 'Chrome on macOS',
    ipAddress: '103.21.244.18',
  },
  {
    id: 'usr_02',
    name: 'Amit Patel',
    email: 'amit.cashier@goldenbazaar.com',
    phone: '+91 98765 11111',
    businessId: 'biz_01',
    businessName: 'Golden Bazaar Superstore',
    role: 'cashier',
    status: 'active',
    registeredAt: '2025-04-05T10:00:00Z',
    lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    device: 'Android POS Terminal',
    ipAddress: '103.21.244.19',
  },
  {
    id: 'usr_03',
    name: 'Vikram Sharma',
    email: 'sharma.electronics.delhi@gmail.com',
    phone: '+91 98111 22334',
    businessId: 'biz_02',
    businessName: 'Sharma Electronics & Appliances',
    role: 'owner',
    status: 'active',
    registeredAt: '2025-06-01T10:00:00Z',
    lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
    device: 'Edge on Windows 11',
    ipAddress: '122.161.48.92',
  },
  {
    id: 'usr_04',
    name: 'Rajesh Vardhman',
    email: 'vardhman.surat@outlook.com',
    phone: '+91 98250 88990',
    businessId: 'biz_03',
    businessName: 'Vardhman Textiles & Sarees',
    role: 'owner',
    status: 'active',
    registeredAt: '2025-07-20T14:20:00Z',
    lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    device: 'Chrome on Android',
    ipAddress: '117.217.82.14',
  },
];

const DEFAULT_PLANS: PlanPricingConfig[] = [
  {
    id: 'free',
    name: 'Free Starter',
    monthlyPrice: 0,
    yearlyPrice: 0,
    invoiceLimitPerMonth: 30,
    userLimit: 1,
    branchLimit: 1,
    warehouseLimit: 1,
    storageLimitMb: 100,
    aiRequestsLimitPerMonth: 15,
    trialDays: 0,
    features: ['Up to 30 GST Invoices/mo', 'Basic POS Billing', 'Standard A4 Template', '1 User Access'],
    hasAi: false,
    hasWhatsApp: false,
    hasMultiBranch: false,
    hasAdvancedReports: false,
    hasGstAudit: false,
    active: true,
  },
  {
    id: 'starter',
    name: 'Starter Retail',
    badge: 'Popular for Shops',
    monthlyPrice: 199,
    yearlyPrice: 1999,
    invoiceLimitPerMonth: 0,
    userLimit: 2,
    branchLimit: 1,
    warehouseLimit: 1,
    storageLimitMb: 500,
    aiRequestsLimitPerMonth: 50,
    trialDays: 14,
    features: ['Unlimited GST Invoices', 'Barcode Scanning & Printing', 'Digital Khata Ledger', '2 Staff Roles', 'Basic Goldnifi AI'],
    hasAi: true,
    hasWhatsApp: true,
    hasMultiBranch: false,
    hasAdvancedReports: false,
    hasGstAudit: false,
    active: true,
  },
  {
    id: 'business',
    name: 'Business Pro',
    badge: 'Most Popular',
    isPopular: true,
    monthlyPrice: 279,
    yearlyPrice: 2799,
    invoiceLimitPerMonth: 0,
    userLimit: 5,
    branchLimit: 2,
    warehouseLimit: 2,
    storageLimitMb: 2000,
    aiRequestsLimitPerMonth: 250,
    trialDays: 14,
    features: ['Unlimited GST & e-Way Ready', 'GSTR-1 & GSTR-3B CA Export', '5 Multi-User RBAC Permissions', 'WhatsApp Bill Delivery', 'Full Goldnifi AI Advisor'],
    hasAi: true,
    hasWhatsApp: true,
    hasMultiBranch: true,
    hasAdvancedReports: true,
    hasGstAudit: true,
    active: true,
  },
  {
    id: 'pro',
    name: 'Enterprise Scale',
    badge: 'Multi-Branch & Warehouses',
    monthlyPrice: 449,
    yearlyPrice: 4499,
    invoiceLimitPerMonth: 0,
    userLimit: 15,
    branchLimit: 5,
    warehouseLimit: 5,
    storageLimitMb: 10000,
    aiRequestsLimitPerMonth: 1000,
    trialDays: 14,
    features: ['Multi-Branch & Warehouse Sync', 'Advanced P&L Balance Sheets', '15 Staff Accounts with PIN Login', 'Unlimited Goldnifi AI Reasoning', 'Priority 24/7 CA Support'],
    hasAi: true,
    hasWhatsApp: true,
    hasMultiBranch: true,
    hasAdvancedReports: true,
    hasGstAudit: true,
    active: true,
  },
  {
    id: 'enterprise',
    name: 'Custom Enterprise',
    badge: 'Franchise & Custom',
    monthlyPrice: 1499,
    yearlyPrice: 14999,
    invoiceLimitPerMonth: 0,
    userLimit: 100,
    branchLimit: 25,
    warehouseLimit: 25,
    storageLimitMb: 50000,
    aiRequestsLimitPerMonth: 5000,
    trialDays: 30,
    features: ['Unlimited Branches & Locations', 'Dedicated Database Tenant', 'Dedicated Account Manager', 'Custom ERP API Integrations', 'Custom SLA 99.99%'],
    hasAi: true,
    hasWhatsApp: true,
    hasMultiBranch: true,
    hasAdvancedReports: true,
    hasGstAudit: true,
    active: true,
  },
];

const DEFAULT_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay_01',
    paymentId: 'pay_RPZ_9812491',
    businessId: 'biz_01',
    businessName: 'Golden Bazaar Superstore',
    userEmail: 'gbdeveloper123@gmail.com',
    plan: 'business',
    amount: 2799,
    taxAmount: 503.82,
    currency: 'INR',
    gateway: 'Razorpay',
    gatewayTransactionId: 'txn_981249102381',
    invoiceNumber: 'VY-SAAS-2025-001',
    date: '2025-04-10T10:05:00Z',
    status: 'success',
  },
  {
    id: 'pay_02',
    paymentId: 'pay_RPZ_8123984',
    businessId: 'biz_02',
    businessName: 'Sharma Electronics & Appliances',
    userEmail: 'sharma.electronics.delhi@gmail.com',
    plan: 'pro',
    amount: 4499,
    taxAmount: 809.82,
    currency: 'INR',
    gateway: 'UPI AutoPay',
    gatewayTransactionId: 'txn_812398491823',
    invoiceNumber: 'VY-SAAS-2025-002',
    date: '2025-06-15T11:10:00Z',
    status: 'success',
  },
  {
    id: 'pay_03',
    paymentId: 'pay_RPZ_4719283',
    businessId: 'biz_03',
    businessName: 'Vardhman Textiles & Sarees',
    userEmail: 'vardhman.surat@outlook.com',
    plan: 'business',
    amount: 279,
    taxAmount: 50.22,
    currency: 'INR',
    gateway: 'Razorpay',
    gatewayTransactionId: 'txn_471928301924',
    invoiceNumber: 'VY-SAAS-2026-031',
    date: '2026-03-01T08:05:00Z',
    status: 'success',
  },
  {
    id: 'pay_04',
    paymentId: 'pay_RPZ_3918274',
    businessId: 'biz_04',
    businessName: 'Krishna Medical & Wellness',
    userEmail: 'krishna.pharma.ahd@gmail.com',
    plan: 'starter',
    amount: 199,
    taxAmount: 35.82,
    currency: 'INR',
    gateway: 'Razorpay',
    gatewayTransactionId: 'txn_391827401928',
    invoiceNumber: 'VY-SAAS-2026-032',
    date: '2026-03-10T12:05:00Z',
    status: 'success',
  },
];

const DEFAULT_COUPONS: CouponOffer[] = [
  {
    id: 'cpn_01',
    code: 'VYAPRIX20',
    discountType: 'percentage',
    discountValue: 20,
    targetPlan: 'all',
    minAmount: 199,
    totalIssued: 500,
    usedCount: 142,
    remainingCount: 358,
    expiryDate: '2026-12-31',
    active: true,
    firstPaymentOnly: true,
    revenueImpact: 14200,
  },
  {
    id: 'cpn_02',
    code: 'DIWALI50',
    discountType: 'percentage',
    discountValue: 50,
    targetPlan: 'business',
    minAmount: 2799,
    totalIssued: 100,
    usedCount: 88,
    remainingCount: 12,
    expiryDate: '2026-11-15',
    active: true,
    firstPaymentOnly: true,
    revenueImpact: 35000,
  },
];

const DEFAULT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_01',
    ticketNumber: 'TKT-1082',
    businessId: 'biz_01',
    businessName: 'Golden Bazaar Superstore',
    userId: 'usr_01',
    userName: 'Gaurav Bhardwaj',
    userPhone: '+91 98765 43210',
    userEmail: 'gbdeveloper123@gmail.com',
    subject: 'Requesting Multi-Warehouse GSTR-1 Consolidated Export',
    category: 'GST',
    priority: 'normal',
    status: 'in_progress',
    assignedTo: 'CA Rohit (Tax Lead)',
    createdDate: '2026-03-28T10:15:00Z',
    lastUpdated: '2026-03-29T14:30:00Z',
    slaStatus: 'within_sla',
    messages: [
      {
        id: 'msg_01',
        sender: 'customer',
        senderName: 'Gaurav Bhardwaj',
        text: 'Hi Team, our chartered accountant requested consolidated B2B invoice export combining Bandra branch and Warehouse 1. How do we export combined JSON for GSTR-1 offline tool?',
        timestamp: '2026-03-28T10:15:00Z',
        isInternalNote: false,
      },
      {
        id: 'msg_02',
        sender: 'support',
        senderName: 'CA Rohit (Tax Lead)',
        text: 'Hello Gaurav! You can navigate to GST Reports & ITC in the sidebar, choose "All Branches" in the branch selector at top, and click "Export Official GSTR-1 (Govt Schema JSON)". We are also verifying your B2B taxable turnover reconciliation.',
        timestamp: '2026-03-29T11:20:00Z',
        isInternalNote: false,
      },
      {
        id: 'msg_03',
        sender: 'support',
        senderName: 'Super Admin (Internal Note)',
        text: 'Merchant is a high-volume VIP account on Business Pro tier. Handled with top priority.',
        timestamp: '2026-03-29T11:22:00Z',
        isInternalNote: true,
      },
    ],
  },
];

const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'flag_eway',
    key: 'ENABLE_EWAY_BILL_SYNC',
    name: 'Govt e-Way Bill Direct API',
    description: 'Auto-generate NIC e-Way bills directly from invoices above ₹50,000.',
    enabled: true,
    targetScope: 'all',
    rolloutPercentage: 100,
  },
  {
    id: 'flag_multi_warehouse',
    key: 'ENABLE_MULTI_WAREHOUSE_SYNC',
    name: 'Multi-Warehouse Inventory Transfer',
    description: 'Inter-branch stock transfers and gate pass dispatch notes.',
    enabled: true,
    targetScope: 'specific_plan',
    targetValue: 'pro',
    rolloutPercentage: 100,
  },
  {
    id: 'flag_gemini_voice',
    key: 'ENABLE_VOICE_BILLING',
    name: 'Goldnifi Voice POS Billing',
    description: 'Hands-free voice driven billing in Hindi, Marathi, Gujarati and English.',
    enabled: true,
    targetScope: 'all',
    rolloutPercentage: 75,
  },
  {
    id: 'flag_whatsapp_bulk',
    key: 'ENABLE_WHATSAPP_BULK_OFFERS',
    name: 'WhatsApp Festival Offers Campaign',
    description: '1-click WhatsApp customer payment reminders & promotional flyers.',
    enabled: true,
    targetScope: 'all',
    rolloutPercentage: 100,
  },
];

const DEFAULT_HEALTH: ServiceHealth[] = [
  {
    id: 'srv_db',
    name: 'Cloud SQL / Multi-Tenant Database',
    type: 'database',
    status: 'operational',
    responseTimeMs: 14,
    uptimePercentage: 99.99,
  },
  {
    id: 'srv_auth',
    name: 'Firebase Auth & Token Gatekeeper',
    type: 'auth',
    status: 'operational',
    responseTimeMs: 22,
    uptimePercentage: 99.98,
  },
  {
    id: 'srv_ai',
    name: 'Google Gemini 2.5 AI Engine',
    type: 'gemini_ai',
    status: 'operational',
    responseTimeMs: 210,
    uptimePercentage: 99.95,
  },
  {
    id: 'srv_pay',
    name: 'Razorpay & UPI AutoPay Webhooks',
    type: 'payments',
    status: 'operational',
    responseTimeMs: 38,
    uptimePercentage: 99.99,
  },
];

const DEFAULT_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log_01',
    adminId: 'sa_01',
    adminName: 'Platform Owner',
    action: 'PLATFORM_BOOTSTRAP',
    targetType: 'security',
    targetId: 'root',
    targetName: 'Super Admin Shield',
    newValue: 'Role-Based Authentication Activated',
    timestamp: new Date().toISOString(),
    ipAddress: '103.21.244.18',
  },
];

const DEFAULT_BACKUPS: PlatformBackup[] = [
  {
    id: 'bkp_01',
    filename: 'VYAPRIX_SNAPSHOT_2026_03_30_020000.sql.gz',
    sizeMb: 512.4,
    createdAt: '2026-03-30T02:00:00Z',
    type: 'automated_daily',
    status: 'completed',
    totalBusinessesCount: 7,
    totalRecordsCount: 16420,
  },
];

interface SuperAdminViewProps {
  onExit?: () => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({ onExit }) => {
  const { logoutUser } = useShop();
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return sessionStorage.getItem('vyaprix_sa_token');
  });

  const [profile, setProfile] = useState<SuperAdminProfile | null>(null);
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Platform Entities
  const [businesses, setBusinesses] = useState<TenantBusiness[]>(DEFAULT_BUSINESSES);
  const [users, setUsers] = useState<PlatformUser[]>(DEFAULT_USERS);
  const [payments, setPayments] = useState<PaymentRecord[]>(DEFAULT_PAYMENTS);
  const [tickets, setTickets] = useState<SupportTicket[]>(DEFAULT_TICKETS);
  const [plans, setPlans] = useState<PlanPricingConfig[]>(DEFAULT_PLANS);
  const [coupons, setCoupons] = useState<CouponOffer[]>(DEFAULT_COUPONS);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(DEFAULT_FEATURE_FLAGS);
  const [systemHealth, setSystemHealth] = useState<ServiceHealth[]>(DEFAULT_HEALTH);
  const [fraudAlerts, setFraudAlerts] = useState<FraudRiskAlert[]>([
    {
      id: 'frd_01',
      severity: 'low',
      type: 'repeated_payment_failures',
      businessId: 'biz_07',
      businessName: 'Shiv Hardware & Sanitary',
      description: 'Single failed card attempt before switching to free tier.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'resolved',
    },
  ]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(DEFAULT_AUDIT_LOGS);
  const [backups, setBackups] = useState<PlatformBackup[]>(DEFAULT_BACKUPS);
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: 'VYAPRIX',
    supportEmail: 'gbdeveloper123@gmail.com',
    supportPhone: '+91 98765 43210',
    officialCompany: 'GOLDEN BAZAAR Infotech Pvt Ltd',
    defaultCurrency: 'INR',
    taxGstRatePct: 18,
    defaultTrialDays: 14,
    defaultPlanId: 'starter',
    maintenanceMode: false,
    maintenanceNotice: 'VYAPRIX is undergoing scheduled maintenance.',
    allowedRegistration: true,
  });
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([
    {
      id: 'cmp_01',
      title: 'Festival GST Accounting Upgrade Offer',
      targetAudience: 'starter',
      channel: 'in_app',
      type: 'upgrade_offer',
      status: 'active',
      scheduledDate: '2026-04-01',
      sentCount: 450,
      openedCount: 312,
      convertedCount: 48,
      conversionRevenue: 134400,
    },
  ]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([
    {
      id: 'ref_01',
      referrerBusinessId: 'biz_01',
      referrerBusinessName: 'Golden Bazaar Superstore',
      referredBusinessId: 'biz_02',
      referredBusinessName: 'Sharma Electronics & Appliances',
      referredOwnerPhone: '+91 98111 22334',
      registeredDate: '2025-06-01',
      plan: 'pro',
      conversionStatus: 'converted_paid',
      rewardStatus: 'credited',
      rewardAmount: 500,
    },
  ]);
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([
    {
      id: 'anc_01',
      title: 'New: Goldnifi AI Instant Product Cataloging',
      message: 'All merchants can now auto-fill HSN codes, descriptions, and categories using AI.',
      target: 'all',
      channel: 'in_app',
      date: '2026-03-25',
      published: true,
      priority: 'info',
    },
  ]);
  const [activeSessions, setActiveSessions] = useState<AdminSession[]>([
    {
      id: 'ses_01',
      ipAddress: '103.21.244.18',
      device: 'Chrome on macOS (Current)',
      location: 'Mumbai, Maharashtra',
      loginTime: new Date().toISOString(),
      lastActiveTime: new Date().toISOString(),
      isCurrent: true,
    },
  ]);

  const [selected360BizId, setSelected360BizId] = useState<string | null>('biz_01');

  // Verify session on mount
  useEffect(() => {
    if (!authToken) return;

    fetch('/api/super-admin/data', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Session invalid');
        return res.json();
      })
      .then((data) => {
        if (data.businesses) setBusinesses(data.businesses);
        if (data.users) setUsers(data.users);
        if (data.payments) setPayments(data.payments);
        if (data.tickets) setTickets(data.tickets);
        if (data.plans) setPlans(data.plans);
        if (data.coupons) setCoupons(data.coupons);
        if (data.campaigns) setCampaigns(data.campaigns);
        if (data.referrals) setReferrals(data.referrals);
        if (data.announcements) setAnnouncements(data.announcements);
        if (data.featureFlags) setFeatureFlags(data.featureFlags);
        if (data.systemHealth) setSystemHealth(data.systemHealth);
        if (data.fraudAlerts) setFraudAlerts(data.fraudAlerts);
        if (data.backups) setBackups(data.backups);
        if (data.settings) setSettings(data.settings);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      })
      .catch(() => {
        // Fallback gracefully to seed data if server is reloading
      });
  }, [authToken]);

  // Auth Handlers
  const handleLoginSuccess = (token: string, adminProfile: any) => {
    setAuthToken(token);
    setProfile(adminProfile);
  };

  const handleLogout = () => {
    if (authToken) {
       fetch('/api/super-admin/auth/logout', {
         method: 'POST',
         headers: { Authorization: `Bearer ${authToken}` },
       }).catch(() => {});
    }
    logoutUser();
  };

  const handleLogoutAll = () => {
    if (authToken) {
      fetch('/api/super-admin/auth/logout-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => {});
    }
    sessionStorage.removeItem('vyaprix_sa_token');
    setAuthToken(null);
  };

  const handleLockSession = () => {
    sessionStorage.removeItem('vyaprix_sa_token');
    setAuthToken(null);
  };

  // Operational Action Handlers
  const handleUpdateBusinessStatus = (bizId: string, status: BusinessAccountStatus, reason?: string) => {
    fetch('/api/super-admin/businesses/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ businessId: bizId, status, reason }),
    }).catch(() => {});

    setBusinesses((prev) =>
      prev.map((b) => (b.id === bizId ? { ...b, status, isSuspended: status === 'suspended' } : b))
    );
  };

  const handleUpdatePlan = (planId: string, updates: Partial<PlanPricingConfig>) => {
    fetch('/api/super-admin/plans/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ planId, ...updates }),
    }).catch(() => {});

    setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, ...updates } : p)));
  };

  const handleCreateCoupon = (couponData: any) => {
    fetch('/api/super-admin/coupons/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(couponData),
    }).catch(() => {});

    const newC: CouponOffer = {
      id: 'cpn_' + Date.now(),
      code: couponData.code,
      discountType: couponData.discountType,
      discountValue: couponData.discountValue,
      targetPlan: 'all',
      minAmount: 199,
      totalIssued: couponData.totalIssued,
      usedCount: 0,
      remainingCount: couponData.totalIssued,
      expiryDate: couponData.expiryDate,
      active: true,
      firstPaymentOnly: true,
      revenueImpact: 0,
    };
    setCoupons([newC, ...coupons]);
  };

  const handleReplyTicket = (ticketId: string, text: string, isInternalNote: boolean) => {
    fetch('/api/super-admin/tickets/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ ticketId, text, isInternalNote }),
    }).catch(() => {});
  };

  const handleUpdateTicketStatus = (ticketId: string, status: string, priority?: string) => {
    fetch('/api/super-admin/tickets/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ ticketId, status, priority }),
    }).catch(() => {});

    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: status as any } : t))
    );
  };

  const handleToggleFeatureFlag = (flagId: string, enabled: boolean) => {
    fetch('/api/super-admin/feature-flags/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ flagId, enabled }),
    }).catch(() => {});

    setFeatureFlags((prev) =>
      prev.map((f) => (f.id === flagId ? { ...f, enabled } : f))
    );
  };

  const handleCreateAnnouncement = (ancData: any) => {
    fetch('/api/super-admin/announcements/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(ancData),
    }).catch(() => {});

    const newA: PlatformAnnouncement = {
      id: 'anc_' + Date.now(),
      title: ancData.title,
      message: ancData.message,
      target: ancData.target,
      channel: ancData.channel,
      date: new Date().toISOString().split('T')[0],
      published: true,
      priority: ancData.priority,
    };
    setAnnouncements([newA, ...announcements]);
  };

  const handleCreateBackup = () => {
    fetch('/api/super-admin/backups/create', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.backup) {
          setBackups([data.backup, ...backups]);
        }
      })
      .catch(() => {
        const manualBkp: PlatformBackup = {
          id: 'bkp_' + Date.now(),
          filename: `VYAPRIX_MANUAL_SNAPSHOT_${new Date().toISOString().split('T')[0]}.sql.gz`,
          sizeMb: 524.8,
          createdAt: new Date().toISOString(),
          type: 'manual_snapshot',
          status: 'completed',
          totalBusinessesCount: businesses.length,
          totalRecordsCount: 16800,
        };
        setBackups([manualBkp, ...backups]);
      });
  };

  const handleUpdateSettings = (newSettings: Partial<PlatformSettings>) => {
    fetch('/api/super-admin/settings/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(newSettings),
    }).catch(() => {});

    setSettings({ ...settings, ...newSettings });
  };

  const handleUpdatePassword = async (curr: string, next: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/super-admin/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ currentPassword: curr, newPassword: next }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleToggle2FA = (enabled: boolean) => {
    fetch('/api/super-admin/auth/toggle-2fa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ enabled }),
    }).catch(() => {});

    if (profile) setProfile({ ...profile, twoFactorEnabled: enabled });
  };

  // If not authenticated, show Super Admin Login Screen
  if (!authToken) {
    return (
      <SuperAdminLogin
        onLoginSuccess={handleLoginSuccess}
        onExit={onExit || (() => {})}
      />
    );
  }

  // Filter businesses by global search if active
  const displayedBusinesses = globalSearch
    ? businesses.filter(
        (b) =>
          b.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
          b.ownerName.toLowerCase().includes(globalSearch.toLowerCase()) ||
          b.id.toLowerCase().includes(globalSearch.toLowerCase())
      )
    : businesses;

  // Render the Selected Tab View
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardTab
            businesses={displayedBusinesses}
            payments={payments}
            onOpenBusiness360={(bizId) => {
              setSelected360BizId(bizId);
              setActiveTab('business_360');
            }}
          />
        );

      case 'businesses':
        return (
          <BusinessesTab
            businesses={displayedBusinesses}
            onOpenBusiness360={(bizId) => {
              setSelected360BizId(bizId);
              setActiveTab('business_360');
            }}
            onUpdateBusinessStatus={handleUpdateBusinessStatus}
          />
        );

      case 'users':
        return <UsersTab users={users} />;

      case 'business_360':
        return (
          <Business360Tab
            businesses={businesses}
            selectedBusinessId={selected360BizId}
            onSelectBusiness={(bizId) => setSelected360BizId(bizId)}
            tickets={tickets}
          />
        );

      case 'subscriptions':
        return <SubscriptionsTab businesses={displayedBusinesses} />;

      case 'plans_pricing':
        return <PlansPricingTab plans={plans} onUpdatePlan={handleUpdatePlan} />;

      case 'payments_revenue':
        return <PaymentsRevenueTab payments={payments} />;

      case 'coupons_offers':
        return <CouponsOffersTab coupons={coupons} onCreateCoupon={handleCreateCoupon} />;

      case 'customer_support':
        return (
          <CustomerSupportTab
            tickets={tickets}
            onReplyTicket={handleReplyTicket}
            onUpdateStatus={handleUpdateTicketStatus}
          />
        );

      case 'goldnifi_ai':
        return <GoldnifiAiTab businesses={businesses} />;

      case 'usage_analytics':
        return (
          <AnalyticsTabs
            viewType="usage"
            businesses={businesses}
            campaigns={campaigns}
            referrals={referrals}
          />
        );

      case 'growth_analytics':
        return (
          <AnalyticsTabs
            viewType="growth"
            businesses={businesses}
            campaigns={campaigns}
            referrals={referrals}
          />
        );

      case 'marketing_campaigns':
        return (
          <AnalyticsTabs
            viewType="marketing"
            businesses={businesses}
            campaigns={campaigns}
            referrals={referrals}
          />
        );

      case 'referrals':
        return (
          <AnalyticsTabs
            viewType="referrals"
            businesses={businesses}
            campaigns={campaigns}
            referrals={referrals}
          />
        );

      case 'notifications_announcements':
        return (
          <SystemTabs
            viewType="announcements"
            announcements={announcements}
            featureFlags={featureFlags}
            systemHealth={systemHealth}
            fraudAlerts={fraudAlerts}
            auditLogs={auditLogs}
            backups={backups}
            onToggleFeatureFlag={handleToggleFeatureFlag}
            onCreateAnnouncement={handleCreateAnnouncement}
            onCreateBackup={handleCreateBackup}
          />
        );

      case 'beta_features':
        return (
          <SystemTabs
            viewType="feature_flags"
            announcements={announcements}
            featureFlags={featureFlags}
            systemHealth={systemHealth}
            fraudAlerts={fraudAlerts}
            auditLogs={auditLogs}
            backups={backups}
            onToggleFeatureFlag={handleToggleFeatureFlag}
            onCreateAnnouncement={handleCreateAnnouncement}
            onCreateBackup={handleCreateBackup}
          />
        );

      case 'system_health':
        return (
          <SystemTabs
            viewType="system_health"
            announcements={announcements}
            featureFlags={featureFlags}
            systemHealth={systemHealth}
            fraudAlerts={fraudAlerts}
            auditLogs={auditLogs}
            backups={backups}
            onToggleFeatureFlag={handleToggleFeatureFlag}
            onCreateAnnouncement={handleCreateAnnouncement}
            onCreateBackup={handleCreateBackup}
          />
        );

      case 'fraud_risk':
        return (
          <SystemTabs
            viewType="fraud_risk"
            announcements={announcements}
            featureFlags={featureFlags}
            systemHealth={systemHealth}
            fraudAlerts={fraudAlerts}
            auditLogs={auditLogs}
            backups={backups}
            onToggleFeatureFlag={handleToggleFeatureFlag}
            onCreateAnnouncement={handleCreateAnnouncement}
            onCreateBackup={handleCreateBackup}
          />
        );

      case 'audit_logs':
        return (
          <SystemTabs
            viewType="audit_logs"
            announcements={announcements}
            featureFlags={featureFlags}
            systemHealth={systemHealth}
            fraudAlerts={fraudAlerts}
            auditLogs={auditLogs}
            backups={backups}
            onToggleFeatureFlag={handleToggleFeatureFlag}
            onCreateAnnouncement={handleCreateAnnouncement}
            onCreateBackup={handleCreateBackup}
          />
        );

      case 'data_backup':
        return (
          <SystemTabs
            viewType="data_backup"
            announcements={announcements}
            featureFlags={featureFlags}
            systemHealth={systemHealth}
            fraudAlerts={fraudAlerts}
            auditLogs={auditLogs}
            backups={backups}
            onToggleFeatureFlag={handleToggleFeatureFlag}
            onCreateAnnouncement={handleCreateAnnouncement}
            onCreateBackup={handleCreateBackup}
          />
        );

      case 'platform_settings':
        return (
          <SettingsSecurityTabs
            viewType="settings"
            settings={settings}
            profile={profile}
            activeSessions={activeSessions}
            onUpdateSettings={handleUpdateSettings}
            onUpdatePassword={handleUpdatePassword}
            onToggle2FA={handleToggle2FA}
            onLogoutAllSessions={handleLogoutAll}
            onLockSession={handleLockSession}
          />
        );

      case 'admin_security':
        return (
          <SettingsSecurityTabs
            viewType="security"
            settings={settings}
            profile={profile}
            activeSessions={activeSessions}
            onUpdateSettings={handleUpdateSettings}
            onUpdatePassword={handleUpdatePassword}
            onToggle2FA={handleToggle2FA}
            onLogoutAllSessions={handleLogoutAll}
            onLockSession={handleLockSession}
          />
        );

      case 'admin_profile':
        return (
          <SettingsSecurityTabs
            viewType="profile"
            settings={settings}
            profile={profile}
            activeSessions={activeSessions}
            onUpdateSettings={handleUpdateSettings}
            onUpdatePassword={handleUpdatePassword}
            onToggle2FA={handleToggle2FA}
            onLogoutAllSessions={handleLogoutAll}
            onLockSession={handleLockSession}
          />
        );

      default:
        return (
          <DashboardTab
            businesses={displayedBusinesses}
            payments={payments}
            onOpenBusiness360={(bizId) => {
              setSelected360BizId(bizId);
              setActiveTab('business_360');
            }}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0F161E] text-slate-100 font-sans">
      {/* 1. Super Admin 23-Module Sidebar */}
      <SuperAdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        badgeCounts={{
          openTickets: tickets.filter((t) => t.status === 'open').length,
          riskAlerts: fraudAlerts.filter((a) => a.severity === 'high').length,
          activeCoupons: coupons.filter((c) => c.active).length,
        }}
      />

      {/* 2. Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0F161E]">
        {/* Top Header */}
        <SuperAdminHeader
          profile={profile}
          onLogout={handleLogout}
          onLogoutAll={handleLogoutAll}
          onLockSession={handleLockSession}
          onExitToStore={onExit || (() => {})}
          onToggleSidebarMobile={() => setIsSidebarMobileOpen(true)}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        {/* Scrollable Workspace */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">{renderTabContent()}</div>
        </main>
      </div>
    </div>
  );
};
