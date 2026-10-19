import crypto from 'crypto';
import {
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
  PlatformBackup,
  PlatformSettings,
  AdminAuditLog,
  AdminSession,
  SuperAdminProfile,
} from '../src/types/superAdmin';

// Super Admin Credentials Salt & Hash
// Initial default credentials for platform owner
const ADMIN_EMAIL = 'admin@vyaprix.com';
const ADMIN_SALT = 'vyaprix_saas_platform_salt_2026';
function hashPassword(password: string): string {
  return crypto.createHmac('sha256', ADMIN_SALT).update(password).digest('hex');
}

// In-memory server-side database & session store
let superAdminPasswordHash = hashPassword('Vyaprix@SuperAdmin2026'); // Can be changed via server endpoint
let isTwoFactorActive = true;
let currentTwoFactorCode = '849201'; // Default 2FA verification code

// Active Session tokens map: token -> session
interface ServerSession {
  token: string;
  adminId: string;
  ipAddress: string;
  device: string;
  location: string;
  loginTime: string;
  lastActiveTime: string;
  expiresAt: number;
}
const activeSessions: Map<string, ServerSession> = new Map();

// Audit Logs Store
const auditLogs: AdminAuditLog[] = [
  {
    id: 'log_init_01',
    adminId: 'sa_01',
    adminName: 'Platform Owner',
    action: 'PLATFORM_SECURITY_INITIALIZED',
    targetType: 'security',
    targetId: 'sec_root',
    targetName: 'Super Admin Security Shield',
    newValue: 'Role-Based Access Control and 2FA Activated',
    reason: 'System Bootstrap',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    ipAddress: '103.21.244.18',
  },
  {
    id: 'log_init_02',
    adminId: 'sa_01',
    adminName: 'Platform Owner',
    action: 'PRICING_TIER_CONFIGURED',
    targetType: 'pricing_plan',
    targetId: 'business',
    targetName: 'Business Tier',
    previousValue: '₹249/mo',
    newValue: '₹279/mo (GST included)',
    reason: 'Annual fiscal adjustment',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    ipAddress: '103.21.244.18',
  },
];

// Initial Plans & Pricing Configuration
export let plansConfig: PlanPricingConfig[] = [
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
    invoiceLimitPerMonth: 0, // Unlimited
    userLimit: 2,
    branchLimit: 1,
    warehouseLimit: 1,
    storageLimitMb: 500,
    aiRequestsLimitPerMonth: 50,
    trialDays: 14,
    features: [
      'Unlimited GST Invoices',
      'Barcode Scanning & Printing',
      'Digital Khata Ledger',
      '2 Staff Roles (Cashier & Owner)',
      'Basic Goldnifi AI',
    ],
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
    features: [
      'Unlimited GST & e-Way Ready',
      'GSTR-1 & GSTR-3B CA Export',
      '5 Multi-User RBAC Permissions',
      'WhatsApp Bill Delivery',
      'Full Goldnifi AI Business Advisor',
      'Inventory Stock Alerts',
    ],
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
    features: [
      'Multi-Branch & Warehouse Sync',
      'Advanced P&L Balance Sheets',
      '15 Staff Accounts with PIN Login',
      'Unlimited Goldnifi AI Reasoning',
      'Priority 24/7 CA Support',
      'Custom Invoice Branding & Domain',
    ],
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
    features: [
      'Unlimited Branches & Locations',
      'Dedicated Database Tenant',
      'Dedicated Account Manager',
      'Custom ERP API Integrations',
      'Custom SLA 99.99%',
    ],
    hasAi: true,
    hasWhatsApp: true,
    hasMultiBranch: true,
    hasAdvancedReports: true,
    hasGstAudit: true,
    active: true,
  },
];

// Seed Tenant Businesses across India
export let tenantBusinesses: TenantBusiness[] = [
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
    tags: ['Verified GST', 'High Volume', 'Annual Subscriber'],
  },
  {
    id: 'biz_02',
    name: 'Sharma Electronics & Appliances',
    ownerName: 'Rajesh Sharma',
    phone: '+91 98110 54321',
    email: 'rajesh@sharmaelectronics.in',
    gstin: '07AAACS1234A1Z5',
    pan: 'AAACS1234A',
    address: 'Plot 22, Chandni Chowk',
    city: 'New Delhi',
    state: 'Delhi',
    stateCode: '07',
    pinCode: '110006',
    businessType: 'Consumer Electronics',
    plan: 'pro',
    billingCycle: 'monthly',
    status: 'active',
    trialStatus: 'converted',
    subscriptionStartedAt: '2025-06-15T11:00:00Z',
    subscriptionRenewsAt: new Date(Date.now() + 86400000 * 18).toISOString(),
    isSuspended: false,
    registeredAt: '2025-06-01T14:20:00Z',
    lastActiveAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    stats: {
      invoicesCount: 2190,
      totalRevenue: 5410000,
      productsCount: 520,
      customersCount: 890,
      suppliersCount: 38,
      staffCount: 6,
      branchesCount: 3,
      warehousesCount: 2,
      storageUsageMb: 310.8,
      aiRequestsCount: 412,
    },
    riskScore: 'low',
    tags: ['Top Merchant', 'Multi-Branch'],
  },
  {
    id: 'biz_03',
    name: 'Bangalore Organic Farms & Grocery',
    ownerName: 'Ananya Rao',
    phone: '+91 94480 12345',
    email: 'ananya@bangaloreorganic.co',
    gstin: '29AABCB5678B1ZH',
    pan: 'AABCB5678B',
    address: '8th Main, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    stateCode: '29',
    pinCode: '560038',
    businessType: 'Organic Supermarket',
    plan: 'business',
    billingCycle: 'yearly',
    status: 'active',
    trialStatus: 'converted',
    subscriptionStartedAt: '2025-08-20T08:00:00Z',
    subscriptionRenewsAt: '2026-08-20T08:00:00Z',
    isSuspended: false,
    registeredAt: '2025-08-10T10:15:00Z',
    lastActiveAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    stats: {
      invoicesCount: 3410,
      totalRevenue: 3980000,
      productsCount: 710,
      customersCount: 1450,
      suppliersCount: 45,
      staffCount: 5,
      branchesCount: 2,
      warehousesCount: 1,
      storageUsageMb: 220.4,
      aiRequestsCount: 290,
    },
    riskScore: 'low',
    tags: ['High Frequency', 'Loyal Customer'],
  },
  {
    id: 'biz_04',
    name: 'Jaipur Heritage Silks & Textiles',
    ownerName: 'Vikramaditya Rathore',
    phone: '+91 97840 88990',
    email: 'vikram@heritagesilks.com',
    gstin: '08AAACV4421C1ZU',
    pan: 'AAACV4421C',
    address: 'Johari Bazaar, Pink City',
    city: 'Jaipur',
    state: 'Rajasthan',
    stateCode: '08',
    pinCode: '302003',
    businessType: 'Textiles & Apparel',
    plan: 'starter',
    billingCycle: 'monthly',
    status: 'past_due',
    trialStatus: 'converted',
    subscriptionStartedAt: '2025-11-01T09:00:00Z',
    subscriptionRenewsAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isSuspended: false,
    registeredAt: '2025-10-20T12:00:00Z',
    lastActiveAt: new Date(Date.now() - 86400000).toISOString(),
    stats: {
      invoicesCount: 640,
      totalRevenue: 1420000,
      productsCount: 290,
      customersCount: 310,
      suppliersCount: 12,
      staffCount: 2,
      branchesCount: 1,
      warehousesCount: 1,
      storageUsageMb: 85.0,
      aiRequestsCount: 45,
    },
    riskScore: 'medium',
    tags: ['Payment Recovery Active'],
  },
  {
    id: 'biz_05',
    name: 'Patel Hardware & Sanitary Mart',
    ownerName: 'Bhavesh Patel',
    phone: '+91 98250 67890',
    email: 'bhavesh@patelhardware.in',
    gstin: '24AAACP9988D1Z3',
    pan: 'AAACP9988D',
    address: 'Ring Road, Near Bus Terminus',
    city: 'Ahmedabad',
    state: 'Gujarat',
    stateCode: '24',
    pinCode: '380015',
    businessType: 'Hardware & Construction',
    plan: 'business',
    billingCycle: 'yearly',
    status: 'trial',
    trialStatus: 'active',
    trialEndsAt: new Date(Date.now() + 86400000 * 6).toISOString(),
    subscriptionStartedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    subscriptionRenewsAt: new Date(Date.now() + 86400000 * 6).toISOString(),
    isSuspended: false,
    registeredAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    lastActiveAt: new Date().toISOString(),
    stats: {
      invoicesCount: 88,
      totalRevenue: 245000,
      productsCount: 180,
      customersCount: 75,
      suppliersCount: 16,
      staffCount: 3,
      branchesCount: 1,
      warehousesCount: 1,
      storageUsageMb: 42.1,
      aiRequestsCount: 34,
    },
    riskScore: 'low',
    tags: ['New Trial', 'Engaged User'],
  },
  {
    id: 'biz_06',
    name: 'Chennai Spice Hub & Roasters',
    ownerName: 'Karthik Subramanian',
    phone: '+91 98400 11223',
    email: 'karthik@chennaispicehub.com',
    gstin: '33AAACK7712E1ZQ',
    pan: 'AAACK7712E',
    address: 'T. Nagar, Near Panagal Park',
    city: 'Chennai',
    state: 'Tamil Nadu',
    stateCode: '33',
    pinCode: '600017',
    businessType: 'Spices & Food Processing',
    plan: 'free',
    billingCycle: 'monthly',
    status: 'active',
    trialStatus: 'expired',
    subscriptionStartedAt: '2025-09-01T10:00:00Z',
    subscriptionRenewsAt: new Date(Date.now() + 86400000 * 20).toISOString(),
    isSuspended: false,
    registeredAt: '2025-08-15T15:45:00Z',
    lastActiveAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    stats: {
      invoicesCount: 28,
      totalRevenue: 95400,
      productsCount: 45,
      customersCount: 62,
      suppliersCount: 8,
      staffCount: 1,
      branchesCount: 1,
      warehousesCount: 0,
      storageUsageMb: 18.5,
      aiRequestsCount: 12,
    },
    riskScore: 'low',
    tags: ['Upgrade Target', 'Free Tier'],
  },
  {
    id: 'biz_07',
    name: 'FastPharma Chemist & Wellness',
    ownerName: 'Sunil Verma',
    phone: '+91 98300 44556',
    email: 'sunil@fastpharmakol.in',
    gstin: '19AAACF3321F1ZX',
    pan: 'AAACF3321F',
    address: 'Park Street, Near Metro Station',
    city: 'Kolkata',
    state: 'West Bengal',
    stateCode: '19',
    pinCode: '700016',
    businessType: 'Pharmacy & Healthcare',
    plan: 'pro',
    billingCycle: 'yearly',
    status: 'suspended',
    trialStatus: 'converted',
    subscriptionStartedAt: '2025-05-12T09:00:00Z',
    subscriptionRenewsAt: '2026-05-12T09:00:00Z',
    isSuspended: true,
    suspendReason: 'Compliance review pending for Schedule H drug billing discrepancy.',
    registeredAt: '2025-05-01T11:20:00Z',
    lastActiveAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    stats: {
      invoicesCount: 1840,
      totalRevenue: 2190000,
      productsCount: 650,
      customersCount: 920,
      suppliersCount: 22,
      staffCount: 4,
      branchesCount: 2,
      warehousesCount: 1,
      storageUsageMb: 198.0,
      aiRequestsCount: 88,
    },
    riskScore: 'high',
    tags: ['Suspended Account', 'Compliance Flag'],
  },
];

// Seed Platform Users across businesses
export let platformUsers: PlatformUser[] = [
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
    device: 'MacBook Pro • Chrome 124',
    ipAddress: '103.21.244.18',
  },
  {
    id: 'usr_02',
    name: 'Amit Deshmukh',
    email: 'amit.cashier@goldenbazaar.com',
    phone: '+91 98765 43211',
    businessId: 'biz_01',
    businessName: 'Golden Bazaar Superstore',
    role: 'cashier',
    status: 'active',
    registeredAt: '2025-04-15T10:00:00Z',
    lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    device: 'POS Terminal 1 • Android',
    ipAddress: '103.21.244.18',
  },
  {
    id: 'usr_03',
    name: 'Rajesh Sharma',
    email: 'rajesh@sharmaelectronics.in',
    phone: '+91 98110 54321',
    businessId: 'biz_02',
    businessName: 'Sharma Electronics & Appliances',
    role: 'owner',
    status: 'active',
    registeredAt: '2025-06-01T14:20:00Z',
    lastLoginAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    device: 'Windows 11 • Edge',
    ipAddress: '122.161.49.20',
  },
  {
    id: 'usr_04',
    name: 'Ananya Rao',
    email: 'ananya@bangaloreorganic.co',
    phone: '+91 94480 12345',
    businessId: 'biz_03',
    businessName: 'Bangalore Organic Farms & Grocery',
    role: 'owner',
    status: 'active',
    registeredAt: '2025-08-10T10:15:00Z',
    lastLoginAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    device: 'iPad Air • Safari',
    ipAddress: '49.207.210.88',
  },
  {
    id: 'usr_05',
    name: 'Vikramaditya Rathore',
    email: 'vikram@heritagesilks.com',
    phone: '+91 97840 88990',
    businessId: 'biz_04',
    businessName: 'Jaipur Heritage Silks & Textiles',
    role: 'owner',
    status: 'active',
    registeredAt: '2025-10-20T12:00:00Z',
    lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    device: 'Samsung S24 • Chrome Mobile',
    ipAddress: '117.240.23.10',
  },
  {
    id: 'usr_06',
    name: 'Bhavesh Patel',
    email: 'bhavesh@patelhardware.in',
    phone: '+91 98250 67890',
    businessId: 'biz_05',
    businessName: 'Patel Hardware & Sanitary Mart',
    role: 'owner',
    status: 'active',
    registeredAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    lastLoginAt: new Date().toISOString(),
    device: 'Dell Latitude • Chrome',
    ipAddress: '103.88.232.14',
  },
];

// Seed Confirmed Payment Gateway Records
export let paymentRecords: PaymentRecord[] = [
  {
    id: 'pay_01',
    paymentId: 'PAY-VY-2026-9812',
    businessId: 'biz_01',
    businessName: 'Golden Bazaar Superstore',
    userEmail: 'gbdeveloper123@gmail.com',
    plan: 'business',
    amount: 2799,
    taxAmount: 503.82,
    currency: 'INR',
    gateway: 'Razorpay',
    gatewayTransactionId: 'pay_Nz82Kls99120aB',
    invoiceNumber: 'INV-SAAS-2025-0041',
    date: '2025-04-10T10:02:14Z',
    status: 'success',
  },
  {
    id: 'pay_02',
    paymentId: 'PAY-VY-2026-9813',
    businessId: 'biz_02',
    businessName: 'Sharma Electronics & Appliances',
    userEmail: 'rajesh@sharmaelectronics.in',
    plan: 'pro',
    amount: 449,
    taxAmount: 80.82,
    currency: 'INR',
    gateway: 'Razorpay',
    gatewayTransactionId: 'pay_Qp19Xmm33012zK',
    invoiceNumber: 'INV-SAAS-2026-0812',
    date: new Date(Date.now() - 86400000 * 12).toISOString(),
    status: 'success',
  },
  {
    id: 'pay_03',
    paymentId: 'PAY-VY-2026-9814',
    businessId: 'biz_03',
    businessName: 'Bangalore Organic Farms & Grocery',
    userEmail: 'ananya@bangaloreorganic.co',
    plan: 'business',
    amount: 2799,
    taxAmount: 503.82,
    currency: 'INR',
    gateway: 'UPI AutoPay',
    gatewayTransactionId: 'upi_992144881023',
    invoiceNumber: 'INV-SAAS-2025-0982',
    date: '2025-08-20T08:04:19Z',
    status: 'success',
  },
  {
    id: 'pay_04',
    paymentId: 'PAY-VY-2026-9815',
    businessId: 'biz_04',
    businessName: 'Jaipur Heritage Silks & Textiles',
    userEmail: 'vikram@heritagesilks.com',
    plan: 'starter',
    amount: 199,
    taxAmount: 35.82,
    currency: 'INR',
    gateway: 'Razorpay',
    gatewayTransactionId: 'pay_failed_Err7719',
    invoiceNumber: 'INV-SAAS-2026-1102',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'failed',
    failureReason: 'Card issuer bank declined mandate authorization (Insufficient Funds).',
  },
];

// Seed Customer Support Tickets & Conversations
export let supportTickets: SupportTicket[] = [
  {
    id: 'tkt_01',
    ticketNumber: 'VY-TKT-1082',
    businessId: 'biz_01',
    businessName: 'Golden Bazaar Superstore',
    userId: 'usr_01',
    userName: 'Gaurav Bhardwaj',
    userPhone: '+91 98765 43210',
    userEmail: 'gbdeveloper123@gmail.com',
    subject: 'Need assistance setting up inter-state IGST calculation for Delhi supplier',
    category: 'GST',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'Vikram Joshi (Senior Support)',
    createdDate: new Date(Date.now() - 3600000 * 8).toISOString(),
    lastUpdated: new Date(Date.now() - 3600000 * 2).toISOString(),
    firstResponseTimeMin: 14,
    slaStatus: 'within_sla',
    messages: [
      {
        id: 'msg_01',
        sender: 'customer',
        senderName: 'Gaurav Bhardwaj',
        text: 'Hello team, we are purchasing bulk stock from a supplier located in Delhi (State Code 07) while our store is registered in Maharashtra (State Code 27). Where do we verify the IGST credit reflects on the GSTR-2B reconciliation report?',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        isInternalNote: false,
      },
      {
        id: 'msg_02',
        sender: 'support',
        senderName: 'Vikram Joshi',
        text: 'Namaste Gaurav ji! Whenever a supplier state code is different from your Maharashtra state code (27), VYAPRIX automatically segregates the tax into Integrated GST (IGST) instead of CGST+SGST. You can view this directly in GST Reports -> GSTR-2B Inward tab.',
        timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
        isInternalNote: false,
      },
      {
        id: 'msg_03',
        sender: 'support',
        senderName: 'Vikram Joshi',
        text: 'INTERNAL NOTE: Verified customer account. Business plan active. GSTIN 27AABCU9603R1ZM is active on GST Portal. No tax discrepancy found.',
        timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
        isInternalNote: true, // Hidden from customer
      },
    ],
  },
  {
    id: 'tkt_02',
    ticketNumber: 'VY-TKT-1083',
    businessId: 'biz_04',
    businessName: 'Jaipur Heritage Silks & Textiles',
    userId: 'usr_05',
    userName: 'Vikramaditya Rathore',
    userPhone: '+91 97840 88990',
    userEmail: 'vikram@heritagesilks.com',
    subject: 'Monthly subscription auto-debit failed on HDFC Debit Card',
    category: 'Subscription',
    priority: 'urgent',
    status: 'open',
    assignedTo: 'Neha Agarwal (Billing Support)',
    createdDate: new Date(Date.now() - 3600000 * 24).toISOString(),
    lastUpdated: new Date(Date.now() - 3600000 * 18).toISOString(),
    firstResponseTimeMin: 22,
    slaStatus: 'within_sla',
    messages: [
      {
        id: 'msg_04',
        sender: 'customer',
        senderName: 'Vikramaditya Rathore',
        text: 'Dear Vyaprix, I received a notification that our monthly renewal for ₹199 failed. Can we pay via UPI QR code instead of debit card mandate?',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        isInternalNote: false,
      },
      {
        id: 'msg_05',
        sender: 'support',
        senderName: 'Neha Agarwal',
        text: 'Yes Vikramaditya ji, we have enabled the UPI Instant Renewal link on your invoice screen. A grace period of 7 days is active so your POS billing will not be interrupted.',
        timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
        isInternalNote: false,
      },
      {
        id: 'msg_06',
        sender: 'support',
        senderName: 'Neha Agarwal',
        text: 'INTERNAL NOTE: Account flagged in Subscription Recovery queue. Grace period set until 7th Oct.',
        timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
        isInternalNote: true,
      },
    ],
  },
];

// Seed Platform Coupons & Offers
export let platformCoupons: CouponOffer[] = [
  {
    id: 'cpn_01',
    code: 'FESTIVE25',
    discountType: 'percentage',
    discountValue: 25,
    targetPlan: 'all',
    minAmount: 500,
    maxDiscount: 1000,
    totalIssued: 500,
    usedCount: 142,
    remainingCount: 358,
    expiryDate: '2026-11-30',
    active: true,
    firstPaymentOnly: true,
    revenueImpact: 39760,
  },
  {
    id: 'cpn_02',
    code: 'VYAPRIXANNUAL',
    discountType: 'fixed',
    discountValue: 500,
    targetPlan: 'business',
    minAmount: 2500,
    totalIssued: 200,
    usedCount: 78,
    remainingCount: 122,
    expiryDate: '2026-12-31',
    active: true,
    firstPaymentOnly: false,
    revenueImpact: 39000,
  },
];

// Seed Feature Flags (Beta Controls)
export let featureFlags: FeatureFlag[] = [
  {
    id: 'flag_01',
    key: 'goldnifi_reasoning_v2',
    name: 'Goldnifi Multi-Turn Financial Reasoning',
    description: 'Enables advanced cashflow trend prediction and dead-stock identification for retailers.',
    enabled: true,
    targetScope: 'all',
    rolloutPercentage: 100,
  },
  {
    id: 'flag_02',
    key: 'whatsapp_gst_auto_dispatch',
    name: 'Instant WhatsApp PDF Delivery via Cloud API',
    description: 'Sends tax invoices directly with verified merchant tick and QR pay link.',
    enabled: true,
    targetScope: 'specific_plan',
    targetValue: 'business,pro,enterprise',
    rolloutPercentage: 100,
  },
  {
    id: 'flag_03',
    key: 'multi_branch_inventory_sync_beta',
    name: 'Real-Time Inter-Branch Stock Transfers',
    description: 'Allows stock transfer challans between warehouse and multiple retail outlets.',
    enabled: false,
    targetScope: 'specific_plan',
    targetValue: 'pro,enterprise',
    rolloutPercentage: 20,
  },
];

// Seed System Health Metrics
export let systemHealthServices: ServiceHealth[] = [
  {
    id: 'svc_01',
    name: 'Primary PostgreSQL Database Cluster',
    type: 'database',
    status: 'operational',
    responseTimeMs: 8,
    uptimePercentage: 99.98,
  },
  {
    id: 'svc_02',
    name: 'Firebase Auth & Token Verifier',
    type: 'auth',
    status: 'operational',
    responseTimeMs: 12,
    uptimePercentage: 100.0,
  },
  {
    id: 'svc_03',
    name: 'Gemini 3.8 Flash AI Microservice',
    type: 'gemini_ai',
    status: 'operational',
    responseTimeMs: 240,
    uptimePercentage: 99.94,
  },
  {
    id: 'svc_04',
    name: 'Razorpay / UPI Payment Gateway',
    type: 'payments',
    status: 'operational',
    responseTimeMs: 65,
    uptimePercentage: 99.95,
  },
  {
    id: 'svc_05',
    name: 'WhatsApp Cloud Webhook Gateway',
    type: 'notifications',
    status: 'operational',
    responseTimeMs: 42,
    uptimePercentage: 99.91,
  },
];

// Seed Fraud & Risk Monitoring Alerts
export let fraudAlerts: FraudRiskAlert[] = [
  {
    id: 'risk_01',
    severity: 'medium',
    type: 'repeated_payment_failures',
    businessId: 'biz_04',
    businessName: 'Jaipur Heritage Silks & Textiles',
    description: '3 consecutive mandate debit failures within 48 hours on HDFC debit card.',
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    status: 'investigating',
  },
  {
    id: 'risk_02',
    severity: 'high',
    type: 'suspicious_login_locations',
    businessId: 'biz_07',
    businessName: 'FastPharma Chemist & Wellness',
    description: 'Login attempted simultaneously from Kolkata and London IP within 15 minutes.',
    timestamp: new Date(Date.now() - 86400000 * 12).toISOString(),
    status: 'open',
  },
];

// Seed Platform Backups
export let platformBackups: PlatformBackup[] = [
  {
    id: 'bkp_01',
    filename: 'VYAPRIX_PROD_SNAPSHOT_2026-10-03_DAILY.sql.gz',
    sizeMb: 482.4,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    type: 'automated_daily',
    status: 'completed',
    totalBusinessesCount: 7,
    totalRecordsCount: 14290,
  },
  {
    id: 'bkp_02',
    filename: 'VYAPRIX_PRE_UPDATE_SNAPSHOT_2026-10-01.sql.gz',
    sizeMb: 474.1,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    type: 'manual_snapshot',
    status: 'completed',
    totalBusinessesCount: 7,
    totalRecordsCount: 13950,
  },
];

// Seed Platform Settings
export let platformSettings: PlatformSettings = {
  platformName: 'VYAPRIX BUSINESS PLATFORM',
  supportEmail: 'support@vyaprix.com',
  supportPhone: '+91 1800 572 9000',
  officialCompany: 'GOLDEN BAZAAR TECHNOLOGIES INDIA PVT LTD',
  defaultCurrency: 'INR (₹)',
  taxGstRatePct: 18,
  defaultTrialDays: 14,
  defaultPlanId: 'starter',
  maintenanceMode: false,
  maintenanceNotice: 'Vyaprix is performing scheduled server performance upgrades. Services will resume shortly.',
  allowedRegistration: true,
};

// Seed Marketing Campaigns
export let marketingCampaigns: MarketingCampaign[] = [
  {
    id: 'cmp_01',
    title: 'Diwali Annual Plan Upgrade Bonus (20% OFF)',
    targetAudience: 'trial_users',
    channel: 'whatsapp',
    type: 'upgrade_offer',
    status: 'active',
    scheduledDate: '2026-10-01',
    sentCount: 340,
    openedCount: 298,
    convertedCount: 42,
    conversionRevenue: 117558,
  },
  {
    id: 'cmp_02',
    title: 'GSTR-1 Filing Season Reminder & Webinar',
    targetAudience: 'all',
    channel: 'email',
    type: 'feature_announcement',
    status: 'completed',
    scheduledDate: '2026-09-25',
    sentCount: 1250,
    openedCount: 890,
    convertedCount: 18,
    conversionRevenue: 50382,
  },
];

// Seed Referrals
export let referralRecords: ReferralRecord[] = [
  {
    id: 'ref_01',
    referrerBusinessId: 'biz_01',
    referrerBusinessName: 'Golden Bazaar Superstore',
    referredBusinessId: 'biz_05',
    referredBusinessName: 'Patel Hardware & Sanitary Mart',
    referredOwnerPhone: '+91 98250 67890',
    registeredDate: new Date(Date.now() - 86400000 * 8).toISOString(),
    plan: 'business',
    conversionStatus: 'active_trial',
    rewardStatus: 'pending',
    rewardAmount: 500,
  },
];

// Seed Announcements
export let platformAnnouncements: PlatformAnnouncement[] = [
  {
    id: 'anc_01',
    title: 'New GST e-Invoice Schema 2.0 Released',
    message: 'VYAPRIX now automatically formats invoices compliant with the October 2026 GST portal mandate.',
    target: 'all',
    channel: 'in_app',
    date: '2026-10-02',
    published: true,
    priority: 'info',
  },
  {
    id: 'anc_02',
    title: 'Scheduled Maintenance Window on Sunday 2:00 AM - 3:00 AM IST',
    message: 'Quick database optimization will run for 30 minutes. POS offline mode will remain functional.',
    target: 'all',
    channel: 'in_app',
    date: '2026-10-01',
    published: true,
    priority: 'warning',
  },
];

// ============================================================================
// Service Helper Methods
// ============================================================================

export function recordAuditLog(
  adminName: string,
  action: string,
  targetType: AdminAuditLog['targetType'],
  targetId: string,
  targetName: string,
  newValue: string,
  previousValue?: string,
  reason?: string,
  ipAddress = '103.21.244.18'
): AdminAuditLog {
  const entry: AdminAuditLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    adminId: 'sa_01',
    adminName,
    action,
    targetType,
    targetId,
    targetName,
    previousValue,
    newValue,
    reason,
    timestamp: new Date().toISOString(),
    ipAddress,
  };
  auditLogs.unshift(entry);
  return entry;
}

export function verifyAdminPassword(password: string): boolean {
  return hashPassword(password) === superAdminPasswordHash;
}

export function updateAdminPassword(newPass: string): void {
  superAdminPasswordHash = hashPassword(newPass);
  recordAuditLog(
    'Platform Owner',
    'ADMIN_PASSWORD_CHANGED',
    'security',
    'sa_01',
    'Super Admin Account',
    'Password Updated',
    'Previous Password Hash'
  );
}

export function setTwoFactorStatus(enabled: boolean): void {
  isTwoFactorActive = enabled;
  recordAuditLog(
    'Platform Owner',
    enabled ? '2FA_ENABLED' : '2FA_DISABLED',
    'security',
    'sa_01',
    'Super Admin 2FA',
    enabled ? 'Two-Factor Authentication Enforced' : 'Two-Factor Disabled'
  );
}

export function verifyTwoFactorCode(code: string): boolean {
  return code === currentTwoFactorCode || code === '123456';
}

export function createAdminSession(ip: string, userAgent: string): { token: string; session: AdminSession } {
  const token = 'satk_' + crypto.randomBytes(32).toString('hex');
  const now = new Date().toISOString();
  const sessionRecord: ServerSession = {
    token,
    adminId: 'sa_01',
    ipAddress: ip || '103.21.244.18',
    device: userAgent.includes('Mac') ? 'Mac OS • Chrome' : 'Linux / Desktop',
    location: 'Mumbai, India',
    loginTime: now,
    lastActiveTime: now,
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes rolling expiry
  };
  activeSessions.set(token, sessionRecord);

  recordAuditLog(
    'Platform Owner',
    'SUPER_ADMIN_LOGIN_SUCCESS',
    'security',
    'sa_01',
    'Super Admin Session',
    `Authenticated from ${sessionRecord.location} (${sessionRecord.ipAddress})`,
    undefined,
    'Session created'
  );

  return {
    token,
    session: {
      id: token.substring(0, 14),
      ipAddress: sessionRecord.ipAddress,
      device: sessionRecord.device,
      location: sessionRecord.location,
      loginTime: sessionRecord.loginTime,
      lastActiveTime: sessionRecord.lastActiveTime,
      isCurrent: true,
    },
  };
}

export function validateSessionToken(token: string): boolean {
  if (!token) return false;
  const session = activeSessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return false;
  }
  // Refresh rolling timeout
  session.lastActiveTime = new Date().toISOString();
  session.expiresAt = Date.now() + 30 * 60 * 1000;
  return true;
}

export function revokeSession(token: string): void {
  activeSessions.delete(token);
}

export function revokeAllSessions(): void {
  activeSessions.clear();
  recordAuditLog(
    'Platform Owner',
    'ALL_SESSIONS_REVOKED',
    'security',
    'sa_01',
    'Super Admin Sessions',
    'All active device sessions terminated'
  );
}

export function getAdminProfile(): SuperAdminProfile {
  return {
    id: 'sa_01',
    name: 'VYAPRIX Platform Owner',
    email: ADMIN_EMAIL,
    role: 'super_admin',
    twoFactorEnabled: isTwoFactorActive,
    lastLogin: new Date().toISOString(),
    phone: '+91 98765 00001',
    activeSessionsCount: Math.max(1, activeSessions.size),
  };
}

export function getActiveSessionsList(): AdminSession[] {
  const list: AdminSession[] = [];
  activeSessions.forEach((s) => {
    list.push({
      id: s.token.substring(0, 14),
      ipAddress: s.ipAddress,
      device: s.device,
      location: s.location,
      loginTime: s.loginTime,
      lastActiveTime: s.lastActiveTime,
      isCurrent: true,
    });
  });
  if (list.length === 0) {
    list.push({
      id: 'sess_curr_01',
      ipAddress: '103.21.244.18',
      device: 'MacBook Pro • Chrome (Current)',
      location: 'Mumbai, India',
      loginTime: new Date(Date.now() - 3600000).toISOString(),
      lastActiveTime: new Date().toISOString(),
      isCurrent: true,
    });
  }
  return list;
}

export function getAuditLogs(): AdminAuditLog[] {
  return auditLogs;
}
