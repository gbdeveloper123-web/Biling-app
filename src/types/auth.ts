export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'manager' | 'cashier' | 'accountant' | 'super_admin';
  businessId: string;
  businessName: string;
  isVerified: boolean;
  onboardingComplete: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  expiresAt: string;
}

export interface LoginRequest {
  identifier: string; // phone or email
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  fullName: string;
  businessName: string;
  phone: string;
  email?: string;
  password: string;
}

export interface VerifyOtpRequest {
  identifier: string;
  otp: string;
  tempToken?: string;
}

export interface ForgotPasswordRequest {
  identifier: string;
}

export interface ResetPasswordRequest {
  identifier: string;
  otp: string;
  newPassword: string;
}

export interface OnboardingPayload {
  businessName: string;
  businessType: string;
  ownerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pinCode: string;
  isGstRegistered: boolean;
  gstin?: string;
  legalName?: string;
  invoicePrefix: string;
  startingInvoiceNo: number;
  defaultTaxMode: 'inclusive' | 'exclusive';
  defaultPaymentMethods: string[];
}
