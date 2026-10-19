import React from 'react';
import {
  Receipt,
  Boxes,
  ShieldCheck,
  BookOpen,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Crown,
} from 'lucide-react';

interface VyaprixBrandingGraphicProps {
  mode: 'login' | 'signup' | 'otp_verify' | 'forgot_password' | 'reset_password' | 'signup_success';
}

export const VyaprixBrandingGraphic: React.FC<VyaprixBrandingGraphicProps> = ({ mode }) => {
  return (
    <div className="w-full h-full min-h-[580px] lg:min-h-screen p-8 lg:p-12 xl:p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#0052D4] via-[#0984E3] to-[#00CEC9] text-white selection:bg-white selection:text-[#0984E3]">
      {/* Dynamic Ambient Background Light & Waves */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_50%)] pointer-events-none" />
      <div className="absolute -right-20 -top-20 w-[450px] h-[450px] rounded-full bg-cyan-300/25 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-[400px] h-[400px] rounded-full bg-blue-900/35 blur-3xl pointer-events-none" />

      {/* Decorative Wave Overlay Path */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 800 600"
      >
        <path
          d="M0,100 C150,200 350,0 500,100 C650,200 750,50 800,100 L800,600 L0,600 Z"
          fill="url(#blue-gradient-overlay)"
        />
        <defs>
          <linearGradient id="blue-gradient-overlay" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00CEC9" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* TOP: Brand Wordmark & Identity */}
      <div className="relative z-10 text-left space-y-1">
        <div className="flex items-center gap-3.5">
          {/* VYAPRIX Custom 3D Logo Mark */}
          <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl shadow-blue-950/30 shrink-0">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <path
                d="M6 10L14 24L26 8"
                stroke="white"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 18L26 8"
                stroke="#00CEC9"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <span className="text-3xl lg:text-4xl font-black tracking-tight text-white block leading-none">
              VYAPRIX
            </span>
            <span className="text-xs sm:text-sm font-bold text-white/90 tracking-wide mt-1 block">
              Run Your Business Smarter
            </span>
          </div>
        </div>
      </div>

      {/* CENTER: Main Copy & 3D Illustration Scene */}
      <div className="relative z-10 my-auto py-8 grid grid-cols-1 xl:grid-cols-12 gap-8 items-center text-left">
        {/* Left Side Copy */}
        <div className="xl:col-span-6 space-y-5">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[50px] font-black text-white tracking-tight leading-[1.1]">
            {mode === 'signup' ? (
              <>
                Build your business <br />
                <span className="text-[#00CEC9]">with confidence.</span>
              </>
            ) : mode === 'forgot_password' ? (
              <>
                Let's get you <br />
                <span className="text-[#00CEC9]">back in.</span>
              </>
            ) : (
              <>
                Your business. <br />
                <span className="text-[#00CEC9]">One smarter place.</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-medium max-w-md">
            {mode === 'signup'
              ? 'Create your workspace and bring your daily business operations together.'
              : mode === 'forgot_password'
              ? 'Recover access securely and continue managing your business.'
              : 'Manage billing, inventory, GST, customers and daily business operations from one professional workspace.'}
          </p>

          {/* 6 Translucent Pill Badges (2 rows x 3 columns) */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 max-w-lg">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center gap-2 text-xs font-bold text-white shadow-xs">
              <Receipt className="w-4 h-4 text-[#00CEC9] shrink-0" />
              <span className="truncate">Billing & POS</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center gap-2 text-xs font-bold text-white shadow-xs">
              <Boxes className="w-4 h-4 text-[#00CEC9] shrink-0" />
              <span className="truncate">Inventory</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center gap-2 text-xs font-bold text-white shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#00CEC9] shrink-0" />
              <span className="truncate">GST Reports</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center gap-2 text-xs font-bold text-white shadow-xs">
              <BookOpen className="w-4 h-4 text-[#00CEC9] shrink-0" />
              <span className="truncate">Khata & Udhaar</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center gap-2 text-xs font-bold text-white shadow-xs">
              <TrendingUp className="w-4 h-4 text-[#00CEC9] shrink-0" />
              <span className="truncate">Analytics</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center gap-2 text-xs font-bold text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-[#00CEC9] shrink-0" />
              <span className="truncate">AI Assistant</span>
            </div>
          </div>
        </div>

        {/* Right Side Vector Artwork Scene */}
        <div className="xl:col-span-6 relative hidden sm:block">
          <div className="relative w-full aspect-[4/3] max-w-[380px] mx-auto">
            {/* 1. Floating Laptop Dashboard Box */}
            <div className="absolute inset-x-2 top-4 bottom-2 bg-white/95 rounded-2xl border border-white/50 shadow-2xl p-4 flex flex-col justify-between text-[#1E272E]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-mono text-slate-400 font-bold">VYAPRIX Dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 my-3">
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-[10px] text-slate-500 font-bold">Today Revenue</p>
                  <p className="text-sm font-black text-[#0984E3]">₹ 1,84,500</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-[10px] text-slate-500 font-bold">Total Orders</p>
                  <p className="text-sm font-black text-[#00B894]">38 Invoices</p>
                </div>
              </div>
              <div className="h-16 bg-slate-50 rounded-xl p-2 flex items-end justify-between gap-1.5 border border-slate-100">
                {[35, 65, 50, 85, 75, 100, 90].map((val, i) => (
                  <div
                    key={i}
                    style={{ height: `${val}%` }}
                    className="flex-1 bg-gradient-to-t from-[#0984E3] to-[#00CEC9] rounded-t-sm"
                  />
                ))}
              </div>
            </div>

            {/* 2. Floating New Invoice Card Top Left */}
            <div className="absolute -top-3 -left-6 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xl flex items-center gap-3 text-[#1E272E]">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#00B894] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[11px] text-slate-400 font-bold">New Invoice</p>
                <p className="text-sm font-black text-[#0984E3]">₹ 1,250</p>
              </div>
            </div>

            {/* 3. Floating Total Sales Badge Bottom Left */}
            <div className="absolute -bottom-3 -left-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-xl text-left text-[#1E272E]">
              <p className="text-[10px] font-bold text-slate-400">Total Sales</p>
              <p className="text-sm font-black text-[#00B894] flex items-center gap-1">
                <span>↑ 12%</span>
              </p>
            </div>

            {/* 4. Floating GST Badge Bottom Right */}
            <div className="absolute -bottom-3 -right-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-xl flex items-center gap-2.5 text-[#1E272E]">
              <div className="w-9 h-9 rounded-full border-4 border-[#0984E3] border-t-[#00CEC9] flex items-center justify-center text-[10px] font-black text-[#0984E3]">
                18%
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400">GST Tax</p>
                <p className="text-xs font-bold text-[#0984E3]">Auto Split</p>
              </div>
            </div>

            {/* 5. Floating 3D Box Graphics Top Right */}
            <div className="absolute top-1 -right-6 w-14 h-14 rounded-2xl bg-amber-400 shadow-xl border border-amber-300 flex items-center justify-center text-amber-950 font-black text-sm rotate-6">
              📦
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM: Footer Brand Association */}
      <div className="relative z-10 pt-5 border-t border-white/20 flex items-center justify-between text-sm text-white/95 font-bold">
        <div className="flex items-center gap-2.5">
          <Crown className="w-5 h-5 text-[#00CEC9]" />
          <span>Powered by <strong>GOLDEN BAZAAR</strong></span>
        </div>
        <span className="text-xs uppercase tracking-wider text-white/80">
          VYAPRIX SaaS
        </span>
      </div>
    </div>
  );
};
