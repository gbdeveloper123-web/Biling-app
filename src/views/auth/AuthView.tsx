import React, { useState, useEffect, useRef } from 'react';
import {
  Store,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  Phone,
  User,
  Building,
  KeyRound,
  FileText,
  TrendingUp,
  Receipt,
  Boxes,
  X,
  RefreshCw,
  Zap,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { AuthUser } from '../../types/auth';
import { VyaprixBrandingGraphic } from '../../components/VyaprixBrandingGraphic';

type AuthMode = 'login' | 'signup' | 'otp_verify' | 'forgot_password' | 'reset_password' | 'signup_success';

interface AuthViewProps {
  onSuccess: (user: AuthUser, token: string) => void;
  onSuperAdminRoute?: () => void;
  initialMode?: AuthMode;
  onBackToLanding?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onSuccess,
  onSuperAdminRoute,
  initialMode = 'login',
  onBackToLanding,
}) => {
  // Current active mode in the unified animated card
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [animating, setAnimating] = useState(false);

  // Form Fields - Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form Fields - Signup
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form Fields - OTP Verification
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [activeIdentifier, setActiveIdentifier] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(30);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // Form Fields - Forgot & Reset Password
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // UI / Async State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [lastRegisteredUser, setLastRegisteredUser] = useState<AuthUser | null>(null);

  // Refs for OTP inputs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((mode === 'otp_verify' || mode === 'reset_password') && otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, otpCooldown]);

  // Mode Transition Handler with 500ms easing
  const switchMode = (newMode: AuthMode) => {
    if (newMode === mode) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setAnimating(true);
    setTimeout(() => {
      setMode(newMode);
      setAnimating(false);
    }, 280);
  };

  // Password validation rules
  const hasMinLength = signupPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(signupPassword);
  const hasLowerCase = /[a-z]/.test(signupPassword);
  const hasNumber = /[0-9]/.test(signupPassword);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

  // Handle Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const idVal = loginIdentifier.trim();
    const passVal = loginPassword.trim();

    if (!idVal) {
      setErrorMsg('Please enter your mobile number or email address.');
      return;
    }
    if (!passVal) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: idVal, password: passVal, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials. Please verify and try again.');
      }

      setSuccessMsg('Login successful! Redirecting to workspace...');

      // Save token in sessionStorage or localStorage
      if (rememberMe) {
        localStorage.setItem('vyaprix_auth_token', data.token);
        localStorage.setItem('vyaprix_auth_user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('vyaprix_auth_token', data.token);
        sessionStorage.setItem('vyaprix_auth_user', JSON.stringify(data.user));
      }

      setTimeout(() => {
        if (data.user.role === 'super_admin' && onSuperAdminRoute) {
          onSuperAdminRoute();
        } else {
          onSuccess(data.user, data.token);
        }
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to login server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up Submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!businessName.trim()) {
      setErrorMsg('Please enter your business or shop name.');
      return;
    }
    const cleanPhone = signupPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMsg('Please fulfill all password security requirements.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErrorMsg('Password confirmation does not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please agree to the Terms of Service & Privacy Policy to proceed.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          businessName: businessName.trim(),
          phone: signupPhone.trim(),
          email: signupEmail.trim() || undefined,
          password: signupPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create your account.');
      }

      setLastRegisteredUser(data.user);
      setActiveIdentifier(signupPhone.trim());
      setOtpCooldown(30);
      setCanResendOtp(false);

      // Pre-fill standard OTP (123456) for quick frictionless verification if provided
      if (data.otp) {
        const digits = data.otp.slice(0, 6).split('');
        setOtpValues(digits.concat(Array(6 - digits.length).fill('')));
      }

      switchMode('otp_verify');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Input Changes
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpValues];
    newOtp[index] = digit;
    setOtpValues(newOtp);

    // Auto-advance to next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otpValues];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtpValues(newOtp);
    const nextIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIdx]?.focus();
  };

  // Submit OTP Verification
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const fullCode = otpValues.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: activeIdentifier, otp: fullCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid code. Please try again.');
      }

      // Save token in storage
      localStorage.setItem('vyaprix_auth_token', data.token);
      localStorage.setItem('vyaprix_auth_user', JSON.stringify(data.user));

      setSuccessMsg('Mobile verified successfully! Preparing business setup...');
      setTimeout(() => {
        onSuccess(data.user, data.token);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Try entering 123456.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResendOtp || loading) return;
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: activeIdentifier }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to resend code');
      }

      setOtpCooldown(30);
      setCanResendOtp(false);
      setSuccessMsg(data.message || 'New verification code sent!');
      if (data.otp) {
        const digits = data.otp.slice(0, 6).split('');
        setOtpValues(digits.concat(Array(6 - digits.length).fill('')));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Request
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!forgotIdentifier.trim()) {
      setErrorMsg('Please enter your registered mobile number or email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotIdentifier.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Account not found with this identifier.');
      }

      setActiveIdentifier(forgotIdentifier.trim());
      setSuccessMsg('Reset code sent! Please check your SMS / email.');
      if (data.otp) {
        setResetOtp(data.otp);
      }
      switchMode('reset_password');
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!resetOtp.trim()) {
      setErrorMsg('Please enter the 6-digit reset code.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: activeIdentifier,
          otp: resetOtp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setSuccessMsg('Password reset successfully! Please login with your new password.');
      setTimeout(() => {
        setLoginIdentifier(activeIdentifier);
        setLoginPassword(newPassword);
        switchMode('login');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Autofills
  const fillDemoMerchant = () => {
    setLoginIdentifier('admin@vyaprix.com');
    setLoginPassword('Vyaprix@2026');
    setErrorMsg(null);
  };

  const fillDemoSuperAdmin = () => {
    setLoginIdentifier('gbdeveloper123@gmail.com');
    setLoginPassword('GoldenBazaar@2026');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-[#1E272E] text-[#2D3436] dark:text-[#F5F6FA] font-sans selection:bg-[#0984E3] selection:text-white relative overflow-x-hidden p-0 m-0 border-0">
      {/* Top Left Navigation back to Public Landing Page */}
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="absolute top-5 left-5 z-50 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-white/90 dark:bg-[#1E272E]/90 backdrop-blur-md border border-slate-200 dark:border-[#2A3642] text-[#2D3436] dark:text-white text-xs sm:text-sm font-bold shadow-md hover:bg-white dark:hover:bg-[#1E272E] active:scale-95 transition flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#0984E3]" />
          <span>Back to VYAPRIX Home</span>
        </button>
      )}

      {/* LEFT PANEL: Branding Panel Right Next To Login */}
      <div className="w-full lg:w-1/2 xl:w-7/12 hidden lg:block relative shrink-0">
        <VyaprixBrandingGraphic mode={mode} />
      </div>

      {/* RIGHT PANEL: Centered Authentication Form Container */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-white dark:bg-[#1E272E] my-auto relative z-10 min-h-screen overflow-y-auto">
        <div className="w-full max-w-md mx-auto my-auto">
          {/* Top Header: Brand Logo & Title */}
          <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0984E3] to-[#00CEC9] flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <path
                d="M6 10L14 24L26 8"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 18L26 8"
                stroke="#00CEC9"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2D3436] dark:text-white tracking-tight leading-tight">
            VYAPRIX
          </h2>
          <p className="text-xs sm:text-sm font-bold text-[#0984E3] dark:text-[#00CEC9] tracking-wide mt-1">
            Run Your Business Smarter
          </p>
        </div>

        {/* Inner Form Content Container */}
        <div
          className={`w-full transition-all duration-300 transform ${
            animating ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
          }`}
        >
          {/* Mode Switcher Tabs (Login / Sign Up Pills) */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#F1F5F9] dark:bg-[#182026] p-1.5 rounded-2xl flex items-center gap-1.5 w-full max-w-[280px] border border-[#DFE6E9] dark:border-[#2A3642] shadow-sm">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                    mode === 'login'
                      ? 'bg-[#0984E3] text-white shadow-md'
                      : 'text-[#636E72] dark:text-[#B2BEC3] hover:text-[#1E272E]'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                    mode === 'signup'
                      ? 'bg-[#0984E3] text-white shadow-md'
                      : 'text-[#636E72] dark:text-[#B2BEC3] hover:text-[#1E272E]'
                  }`}
                >
                  <span>Sign Up</span>
                </button>
              </div>
            </div>

            {/* Global Inline Error Banner */}
            {errorMsg && (
              <div className="mb-5 p-4 rounded-2xl bg-[#D63031]/10 border border-[#D63031]/30 text-[#D63031] text-xs sm:text-sm font-semibold flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMsg}</div>
                <button onClick={() => setErrorMsg(null)} className="cursor-pointer text-[#D63031]/70 hover:text-[#D63031]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Global Inline Success Banner */}
            {successMsg && (
              <div className="mb-5 p-4 rounded-2xl bg-[#00B894]/10 border border-[#00B894]/30 text-[#00B894] text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div className="flex-1">{successMsg}</div>
              </div>
            )}

            {/* =================================================================== */}
            {/* STATE 1: LOGIN FORM                                                 */}
            {/* =================================================================== */}
            {mode === 'login' && (
              <div className="space-y-6">
                <div className="text-left">
                  <h1 className="text-3xl sm:text-4xl font-black text-[#2D3436] dark:text-white tracking-tight flex items-center gap-2.5">
                    <span>Welcome Back</span>
                    <span className="text-3xl">👋</span>
                  </h1>
                  <p className="text-sm sm:text-base text-[#636E72] dark:text-[#B2BEC3] mt-2 font-medium">
                    Login to your VYAPRIX account to continue managing your business.
                  </p>
                </div>

                {/* Quick Demo Pre-fill Helper */}
                <div className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-[#182026] border border-[#DFE6E9] dark:border-[#2A3642] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                  <span className="font-bold text-[#636E72] dark:text-[#B2BEC3]">
                    Demo Login Autofill:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={fillDemoMerchant}
                      className="px-3 py-1 rounded-lg bg-[#0984E3]/10 hover:bg-[#0984E3]/20 text-[#0984E3] dark:text-[#00CEC9] font-bold transition cursor-pointer text-xs"
                    >
                      Store Merchant
                    </button>
                    <button
                      type="button"
                      onClick={fillDemoSuperAdmin}
                      className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold transition cursor-pointer text-xs"
                    >
                      Super Admin
                    </button>
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
                  {/* Field 1: Mobile Number or Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                      Mobile Number or Email
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="Enter mobile number or email"
                        autoComplete="username"
                        className="w-full h-12 pl-11 pr-4 text-base rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white placeholder-[#636E72]/50 focus:border-[#0984E3] focus:ring-2 focus:ring-[#0984E3]/20 transition outline-none"
                      />
                      <Mail className="w-5 h-5 text-[#636E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Field 2: Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="w-full h-12 pl-11 pr-11 text-base rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white placeholder-[#636E72]/50 focus:border-[#0984E3] focus:ring-2 focus:ring-[#0984E3]/20 transition outline-none"
                      />
                      <Lock className="w-5 h-5 text-[#636E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#636E72] hover:text-[#2D3436] dark:hover:text-white p-1 cursor-pointer"
                        aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox & Forgot Password Link */}
                  <div className="flex items-center justify-between pt-1 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-[#636E72] dark:text-[#B2BEC3] font-semibold">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[#DFE6E9] text-[#0984E3] focus:ring-[#0984E3]"
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot_password')}
                      className="font-bold text-[#0984E3] dark:text-[#00CEC9] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Primary Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#0984E3] hover:bg-[#0770C2] disabled:opacity-60 text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <>
                        <span>Login to VYAPRIX</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* OR Divider */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-[#DFE6E9] dark:border-[#2A3642] w-full" />
                  <span className="bg-white dark:bg-[#1E272E] px-4 text-xs font-bold text-[#636E72] dark:text-[#B2BEC3] uppercase absolute">
                    OR
                  </span>
                </div>

                {/* Continue with Google Social Sign-In Button */}
                <button
                  type="button"
                  onClick={() => {
                    fillDemoMerchant();
                    setSuccessMsg('Connecting via Google Single Sign-On...');
                  }}
                  className="w-full h-12 bg-[#F8FAFC] dark:bg-[#182026] hover:bg-[#F1F5F9] border border-[#DFE6E9] dark:border-[#2A3642] text-[#2D3436] dark:text-white font-bold text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-3 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Bottom Switch to Sign Up */}
                <div className="pt-2 text-center text-sm text-[#636E72] dark:text-[#B2BEC3]">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="font-bold text-[#0984E3] dark:text-[#00CEC9] hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* STATE 2: SIGN UP FORM                                               */}
            {/* =================================================================== */}
            {mode === 'signup' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-[#2D3436] dark:text-white tracking-tight">
                    Create Your VYAPRIX Account
                  </h1>
                  <p className="text-sm sm:text-base text-[#636E72] dark:text-[#B2BEC3] mt-2 font-medium">
                    Start managing your business smarter in minutes.
                  </p>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  {/* Two column grid for Name & Business */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                        Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full h-11 pl-10 pr-3 text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white placeholder-[#636E72]/50 focus:border-[#0984E3] focus:ring-2 focus:ring-[#0984E3]/20 transition outline-none"
                        />
                        <User className="w-4 h-4 text-[#636E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                        Business Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Enter your business name"
                          className="w-full h-11 pl-10 pr-3 text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white placeholder-[#636E72]/50 focus:border-[#0984E3] focus:ring-2 focus:ring-[#0984E3]/20 transition outline-none"
                        />
                        <Building className="w-4 h-4 text-[#636E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Two column grid for Mobile & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          placeholder="Enter mobile number"
                          className="w-full h-11 pl-10 pr-3 text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white placeholder-[#636E72]/50 focus:border-[#0984E3] focus:ring-2 focus:ring-[#0984E3]/20 transition outline-none font-mono"
                        />
                        <Phone className="w-4 h-4 text-[#636E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                        Email Address <span className="text-xs text-[#636E72] font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="Enter email address"
                          className="w-full h-11 pl-10 pr-3 text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white placeholder-[#636E72]/50 focus:border-[#0984E3] focus:ring-2 focus:ring-[#0984E3]/20 transition outline-none"
                        />
                        <Mail className="w-4 h-4 text-[#636E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Create strong password"
                          className="w-full h-11 pl-10 pr-10 text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white placeholder-[#636E72]/50 focus:border-[#0984E3] focus:ring-2 focus:ring-[#0984E3]/20 transition outline-none"
                        />
                        <Lock className="w-4 h-4 text-[#636E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#636E72] hover:text-[#2D3436] p-1 cursor-pointer"
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className="w-full h-11 pl-10 pr-10 text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white placeholder-[#636E72]/50 focus:border-[#0984E3] focus:ring-2 focus:ring-[#0984E3]/20 transition outline-none"
                        />
                        <KeyRound className="w-4 h-4 text-[#636E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#636E72] hover:text-[#2D3436] p-1 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Password Strength Checklist */}
                  {signupPassword && (
                    <div className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-[#182026] border border-[#DFE6E9] dark:border-[#2A3642] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <span className={`flex items-center gap-1 font-medium ${hasMinLength ? 'text-[#00B894]' : 'text-[#636E72]'}`}>
                        {hasMinLength ? '✓' : '○'} 8+ characters
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${hasUpperCase ? 'text-[#00B894]' : 'text-[#636E72]'}`}>
                        {hasUpperCase ? '✓' : '○'} Uppercase letter
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${hasLowerCase ? 'text-[#00B894]' : 'text-[#636E72]'}`}>
                        {hasLowerCase ? '✓' : '○'} Lowercase letter
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${hasNumber ? 'text-[#00B894]' : 'text-[#636E72]'}`}>
                        {hasNumber ? '✓' : '○'} One number
                      </span>
                    </div>
                  )}

                  {/* Terms & Privacy Agreement */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs sm:text-sm text-[#636E72] dark:text-[#B2BEC3] leading-snug">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-[#DFE6E9] text-[#0984E3] focus:ring-[#0984E3]"
                      />
                      <span>
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowTermsModal(true);
                          }}
                          className="font-bold text-[#0984E3] dark:text-[#00CEC9] underline"
                        >
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowTermsModal(true);
                          }}
                          className="font-bold text-[#0984E3] dark:text-[#00CEC9] underline"
                        >
                          Privacy Policy
                        </button>
                        .
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#0984E3] hover:bg-[#0770C2] disabled:opacity-60 text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Bottom Switch back to Login */}
                <div className="pt-3 border-t border-[#DFE6E9] dark:border-[#2A3642] text-center text-sm text-[#636E72] dark:text-[#B2BEC3]">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-bold text-[#0984E3] dark:text-[#00CEC9] hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* STATE 3: OTP VERIFICATION (6 Digits)                                */}
            {/* =================================================================== */}
            {mode === 'otp_verify' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-[#2D3436] dark:text-white tracking-tight">
                    Verify Your Account
                  </h1>
                  <p className="text-sm sm:text-base text-[#636E72] dark:text-[#B2BEC3] mt-2 font-medium">
                    We sent a 6-digit verification code to{' '}
                    <span className="font-bold text-[#2D3436] dark:text-white font-mono">
                      {activeIdentifier}
                    </span>
                    .
                  </p>
                </div>

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
                  {/* 6 Digit Input Boxes */}
                  <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
                    {otpValues.map((val, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={val}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        className="w-13 h-16 sm:w-15 sm:h-18 text-center text-2xl sm:text-3xl font-black font-mono rounded-2xl border-2 border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white focus:border-[#0984E3] focus:ring-2 focus:ring-[#0984E3]/20 transition outline-none"
                      />
                    ))}
                  </div>

                  {/* Resend Code with 30s Cooldown */}
                  <div className="text-center text-sm text-[#636E72] dark:text-[#B2BEC3]">
                    {canResendOtp ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="font-bold text-[#0984E3] dark:text-[#00CEC9] hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    ) : (
                      <span>Resend code in {otpCooldown}s</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#00B894] hover:bg-[#009879] disabled:opacity-60 text-white font-bold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="text-[#636E72] hover:text-[#2D3436] dark:hover:text-white font-semibold cursor-pointer"
                  >
                    ← Change mobile number
                  </button>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* STATE 4: FORGOT PASSWORD REQUEST                                    */}
            {/* =================================================================== */}
            {mode === 'forgot_password' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-[#2D3436] dark:text-white tracking-tight">
                    Reset Your Password
                  </h1>
                  <p className="text-sm sm:text-base text-[#636E72] dark:text-[#B2BEC3] mt-2 font-medium">
                    Enter your registered mobile number or email to receive a recovery code.
                  </p>
                </div>

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                      Mobile Number or Email
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="Enter mobile number or email"
                        className="w-full h-12 pl-11 pr-4 text-base rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white placeholder-[#636E72]/50 focus:border-[#0984E3] focus:ring-2 focus:ring-[#0984E3]/20 transition outline-none"
                      />
                      <Phone className="w-5 h-5 text-[#636E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#0984E3] hover:bg-[#0770C2] disabled:opacity-60 text-white font-bold text-base rounded-2xl shadow-lg transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Sending code...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-4 border-t border-[#DFE6E9] dark:border-[#2A3642] text-center text-sm">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-semibold text-[#636E72] dark:text-[#B2BEC3] hover:text-[#0984E3] cursor-pointer"
                  >
                    ← Back to Login
                  </button>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* STATE 5: ENTER NEW PASSWORD (RESET)                                 */}
            {/* =================================================================== */}
            {mode === 'reset_password' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-[#2D3436] dark:text-white tracking-tight">
                    Create New Password
                  </h1>
                  <p className="text-sm sm:text-base text-[#636E72] dark:text-[#B2BEC3] mt-2 font-medium">
                    Enter the code sent to {activeIdentifier} and set your new password.
                  </p>
                </div>

                <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                      6-Digit Recovery Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full h-12 px-4 text-base font-mono tracking-widest rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create strong new password"
                        className="w-full h-12 pl-11 pr-11 text-base rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
                      />
                      <Lock className="w-5 h-5 text-[#636E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#636E72] hover:text-[#2D3436] p-1 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full h-12 pl-11 pr-4 text-base rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
                      />
                      <KeyRound className="w-5 h-5 text-[#636E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#0984E3] hover:bg-[#0770C2] disabled:opacity-60 text-white font-bold text-base rounded-2xl shadow-lg transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-semibold text-[#636E72] hover:text-[#0984E3] cursor-pointer"
                  >
                    ← Return to Login
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Powered by GOLDEN BAZAAR Footer */}
          <div className="mt-8 pt-4 border-t border-[#DFE6E9] dark:border-[#2A3642] text-center text-xs text-[#636E72] dark:text-[#B2BEC3] font-bold">
            <span>Powered by </span>
            <span className="text-[#2D3436] dark:text-white">GOLDEN BAZAAR</span>
          </div>
        </div>
      </div>

      {/* Terms of Service & Privacy Policy Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#1E272E] rounded-2xl shadow-2xl border border-[#DFE6E9] dark:border-[#2A3642] p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DFE6E9] dark:border-[#2A3642] pb-3">
              <h3 className="text-base font-bold text-[#2D3436] dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0984E3]" />
                Terms of Service & Privacy Policy
              </h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1 text-[#636E72] hover:text-[#2D3436] dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-[#636E72] dark:text-[#B2BEC3] space-y-3 leading-relaxed">
              <p>
                <strong>1. Data Ownership:</strong> All business data, customer ledgers, invoices, inventory records, and financial summaries entered into VYAPRIX remain 100% your property.
              </p>
              <p>
                <strong>2. Security & Privacy:</strong> We employ end-to-end multi-tenant isolation, ensuring your invoices and customers are strictly confidential and inaccessible to other merchants.
              </p>
              <p>
                <strong>3. GST Compliance:</strong> Tax calculations comply with Indian GST Council regulations. Merchants are responsible for verifying filing reports with their chartered accountants.
              </p>
              <p>
                <strong>4. Account Responsibility:</strong> Keep your login credentials and two-factor authentication codes secure.
              </p>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => {
                  setAgreeTerms(true);
                  setShowTermsModal(false);
                }}
                className="px-4 py-2 bg-[#0984E3] hover:bg-[#0770C2] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                I Understand & Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
