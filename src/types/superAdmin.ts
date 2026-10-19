export type SuperAdminTab =
  | 'dashboard'
  | 'businesses'
  | 'users'
  | 'business_360'
  | 'subscriptions'
  | 'plans_pricing'
  | 'payments_revenue'
  | 'coupons_offers'
  | 'customer_support'
  | 'goldnifi_ai'
  | 'usage_analytics'
  | 'growth_analytics'
  | 'marketing_campaigns'
  | 'referrals'
  | 'notifications_announcements'
  | 'beta_features'
  | 'system_health'
  | 'fraud_risk'
  | 'audit_logs'
  | 'data_backup'
  | 'platform_settings'
  | 'admin_security'
  | 'admin_profile';

export type BusinessAccountStatus =
  | 'active'
  | 'trial'
  | 'past_due'
  | 'suspended'
  | 'cancelled'
  | 'archived';

export type SubscriptionPlanId = 'free' | 'starter' | 'business' | 'pro' | 'enterprise';

export interface SuperAdminProfile {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'platform_owner' | 'security_lead';
  twoFactorEnabled: boolean;
  avatarUrl?: string;
  lastLogin: string;
  phone?: string;
  activeSessionsCount: number;
}

export interface AdminSession {
  id: string;
  ipAddress: string;
  device: string;
  location: string;
  loginTime: string;
  lastActiveTime: string;
  isCurrent: boolean;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType:
    | 'business'
    | 'subscription'
    | 'pricing_plan'
    | 'coupon'
    | 'feature_flag'
    | 'security'
    | 'backup'
    | 'support'
    | 'announcement'
    | 'settings';
  targetId: string;
  targetName: string;
  previousValue?: string;
  newValue: string;
  reason?: string;
  timestamp: string;
  ipAddress: string;
}

export interface TenantBusiness {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  gstin?: string;
  pan?: string;
  address: string;
  city?: string;
  state: string;
  stateCode: string;
  pinCode: string;
  businessType: string;
  plan: SubscriptionPlanId;
  billingCycle: 'monthly' | 'yearly';
  status: BusinessAccountStatus;
  trialStatus: 'active' | 'expired' | 'converted' | 'none';
  trialEndsAt?: string;
  subscriptionStartedAt: string;
  subscriptionRenewsAt: string;
  isSuspended: boolean;
  suspendReason?: string;
  registeredAt: string;
  lastActiveAt: string;
  stats: {
    invoicesCount: number;
    totalRevenue: number;
    productsCount: number;
    customersCount: number;
    suppliersCount: number;
    staffCount: number;
    branchesCount: number;
    warehousesCount: number;
    storageUsageMb: number;
    aiRequestsCount: number;
  };
  riskScore: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessId: string;
  businessName: string;
  role: 'owner' | 'manager' | 'cashier' | 'accountant' | 'inventory_manager';
  status: 'active' | 'inactive' | 'suspended';
  registeredAt: string;
  lastLoginAt: string;
  device?: string;
  ipAddress?: string;
}

export interface SubscriptionRecord {
  id: string;
  businessId: string;
  businessName: string;
  planId: SubscriptionPlanId;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  status: 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired' | 'suspended' | 'payment_failed';
  startedAt: string;
  renewsAt: string;
  trialEndsAt?: string;
  gracePeriodEndsAt?: string;
  nextRetryDate?: string;
  failureReason?: string;
  paymentMethod: string;
  retryCount: number;
}

export interface PlanPricingConfig {
  id: SubscriptionPlanId;
  name: string;
  badge?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  invoiceLimitPerMonth: number; // 0 = unlimited
  userLimit: number;
  branchLimit: number;
  warehouseLimit: number;
  storageLimitMb: number;
  aiRequestsLimitPerMonth: number;
  trialDays: number;
  features: string[];
  hasAi: boolean;
  hasWhatsApp: boolean;
  hasMultiBranch: boolean;
  hasAdvancedReports: boolean;
  hasGstAudit: boolean;
  isPopular?: boolean;
  active: boolean;
}

export interface PaymentRecord {
  id: string;
  paymentId: string;
  businessId: string;
  businessName: string;
  userEmail: string;
  plan: SubscriptionPlanId;
  amount: number;
  taxAmount: number;
  currency: string;
  gateway: 'Razorpay' | 'Stripe' | 'UPI AutoPay' | 'Bank Transfer';
  gatewayTransactionId: string;
  invoiceNumber: string;
  date: string;
  status: 'success' | 'pending' | 'failed' | 'refunded' | 'partially_refunded';
  failureReason?: string;
}

export interface CouponOffer {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  targetPlan: 'all' | SubscriptionPlanId;
  minAmount: number;
  maxDiscount?: number;
  totalIssued: number;
  usedCount: number;
  remainingCount: number;
  expiryDate: string;
  active: boolean;
  firstPaymentOnly: boolean;
  revenueImpact: number;
}

export interface SupportMessage {
  id: string;
  sender: 'customer' | 'support' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  isInternalNote: boolean; // MUST NEVER be displayed to customer
  attachments?: string[];
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  businessId: string;
  businessName: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  subject: string;
  category:
    | 'Billing'
    | 'Subscription'
    | 'Payment'
    | 'GST'
    | 'Invoice'
    | 'Inventory'
    | 'Khata'
    | 'Account'
    | 'Login'
    | 'Goldnifi AI'
    | 'Bug'
    | 'Feature Request'
    | 'Other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'new' | 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  assignedTo: string;
  createdDate: string;
  lastUpdated: string;
  firstResponseTimeMin?: number;
  resolutionTimeMin?: number;
  slaStatus: 'within_sla' | 'warning' | 'breached';
  messages: SupportMessage[];
}

export interface MarketingCampaign {
  id: string;
  title: string;
  targetAudience: 'all' | 'free_users' | 'trial_users' | 'starter' | 'business' | 'pro' | 'inactive';
  channel: 'in_app' | 'email' | 'whatsapp';
  type: 'upgrade_offer' | 'renewal_reminder' | 'trial_reminder' | 'feature_announcement' | 'coupon_promo';
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  scheduledDate: string;
  sentCount: number;
  openedCount: number;
  convertedCount: number;
  conversionRevenue: number;
}

export interface ReferralRecord {
  id: string;
  referrerBusinessId: string;
  referrerBusinessName: string;
  referredBusinessId: string;
  referredBusinessName: string;
  referredOwnerPhone: string;
  registeredDate: string;
  plan: SubscriptionPlanId;
  conversionStatus: 'signed_up' | 'active_trial' | 'converted_paid' | 'churned';
  rewardStatus: 'pending' | 'credited' | 'ineligible';
  rewardAmount: number;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  message: string;
  target: 'all' | 'free' | 'starter' | 'business' | 'pro' | 'enterprise' | 'selected';
  channel: 'in_app' | 'email' | 'whatsapp';
  date: string;
  published: boolean;
  priority: 'info' | 'warning' | 'critical';
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  targetScope: 'all' | 'specific_plan' | 'specific_business';
  targetValue?: string;
  rolloutPercentage: number;
}

export interface ServiceHealth {
  id: string;
  name: string;
  type: 'database' | 'auth' | 'storage' | 'gemini_ai' | 'payments' | 'notifications' | 'api';
  status: 'operational' | 'degraded' | 'down';
  responseTimeMs: number;
  uptimePercentage: number;
  lastIncident?: string;
}

export interface FraudRiskAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type:
    | 'repeated_payment_failures'
    | 'suspicious_login_locations'
    | 'excessive_coupon_abuse'
    | 'rapid_account_creation'
    | 'api_rate_limit_spike';
  businessId: string;
  businessName: string;
  description: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
}

export interface PlatformBackup {
  id: string;
  filename: string;
  sizeMb: number;
  createdAt: string;
  type: 'automated_daily' | 'manual_snapshot';
  status: 'completed' | 'in_progress' | 'failed';
  totalBusinessesCount: number;
  totalRecordsCount: number;
}

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  officialCompany: string;
  defaultCurrency: string;
  taxGstRatePct: number;
  defaultTrialDays: number;
  defaultPlanId: SubscriptionPlanId;
  maintenanceMode: boolean;
  maintenanceNotice: string;
  allowedRegistration: boolean;
}
