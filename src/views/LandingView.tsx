import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Receipt,
  Boxes,
  TrendingUp,
  BookOpen,
  Users,
  BarChart3,
  ShieldCheck,
  Zap,
  ChevronDown,
  Menu,
  X,
  CreditCard,
  ShoppingCart,
  Building2,
  FileText,
  Search,
  ChevronRight,
  Store,
  Factory,
  Smartphone,
  Shirt,
  Sparkle,
  Wrench,
  HelpCircle,
  Plus,
  Minus,
  MessageSquare,
  Globe,
  Lock,
  Clock,
  Printer,
  QrCode,
  Download,
  Share2,
} from 'lucide-react';
import { celebrateTaskCompletion, playClickSound } from '../utils/motion';

interface LandingViewProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onLogin, onSignUp }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases' | 'khata'>('sales');
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Re-triggerable Scroll Reveal for sections & cards
  useEffect(() => {
    const animatedEls = document.querySelectorAll(
      '.vy-scroll-reveal, .vy-scroll-fly-left, .vy-scroll-fly-right'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vy-in-view');
          } else {
            entry.target.classList.remove('vy-in-view');
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    animatedEls.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    playClickSound();
    setMobileMenuOpen(false);
    setFeaturesDropdownOpen(false);
    setSolutionsDropdownOpen(false);

    const element = document.getElementById(id);
    if (element) {
      const reveals = element.querySelectorAll(
        '.vy-scroll-reveal, .vy-scroll-fly-left, .vy-scroll-fly-right'
      );
      reveals.forEach((el) => el.classList.remove('vy-in-view'));

      element.scrollIntoView({ behavior: 'smooth' });

      setTimeout(() => {
        reveals.forEach((el) => el.classList.add('vy-in-view'));
      }, 320);
    }
  };

  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const handleDownloadExe = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    setDownloadToast('Downloading VYAPRIX-Setup.exe for Windows...');
    celebrateTaskCompletion('Downloading VYAPRIX Setup Installer!');
    
    // Trigger direct download of Windows .exe installer
    const link = document.createElement('a');
    link.href = '/VYAPRIX-Setup.exe';
    link.download = 'VYAPRIX-Setup.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadToast(null);
    }, 4500);
  };

  // FAQ Items
  const faqs = [
    {
      q: 'What is VYAPRIX?',
      a: 'VYAPRIX is an all-in-one GST billing, inventory management, Khata tracking, and business analytics software crafted specifically for Indian small businesses, retailers, wholesalers, and service providers. It helps you run your business smarter with automation and AI support.',
    },
    {
      q: 'Can I create GST and Non-GST bills in VYAPRIX?',
      a: 'Yes! VYAPRIX supports both GST invoices (CGST, SGST, IGST) with HSN/SAC code management and clean Non-GST estimation bills. You can print them or share them directly with customers.',
    },
    {
      q: 'How does stock and inventory management work?',
      a: 'Every sale automatically deducts product inventory, and purchase bills increase stock levels in real time. VYAPRIX provides low-stock alerts, SKU tracking, category management, and inventory valuation reports.',
    },
    {
      q: 'Can I track customer dues and Khata (Udhaar)?',
      a: 'Absolutely. VYAPRIX features a dedicated Khata & Udhaar module where you can record customer credit balances, record partial payments, view transaction histories, and maintain supplier payables.',
    },
    {
      q: 'Does VYAPRIX support staff accounts and role permissions?',
      a: 'Yes! You can add staff members and assign custom roles (e.g. Owner, Manager, Billing Cashier) with strict access permissions so staff only see what they need to see.',
    },
    {
      q: 'What is Goldnifi AI in VYAPRIX?',
      a: 'Goldnifi AI is your built-in smart business assistant. It analyzes your daily transaction trends, answers questions about stock levels, highlights top-selling products, and summarizes pending collections in simple natural language.',
    },
    {
      q: 'Is my business data secure?',
      a: 'Yes, your data is stored using high-grade encryption and secure database backups. You retain full control over your business records and data privacy.',
    },
    {
      q: 'Can I run VYAPRIX on both desktop computers and mobile devices?',
      a: 'Yes, VYAPRIX features a desktop-first responsive interface that works seamlessly on desktop PCs, laptops, tablets, and smartphones via modern web browsers.',
    },
    {
      q: 'How do I get started with VYAPRIX?',
      a: 'Getting started takes under 2 minutes. Click on "Get Started Free", register your account, enter basic shop details, add your first product, and start generating bills immediately.',
    },
    {
      q: 'How can I contact customer support?',
      a: 'You can reach our dedicated support team via phone, WhatsApp, or email directly from within the VYAPRIX application workspace.',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F5F6FA] text-[#2D3436] font-sans selection:bg-[#0984E3] selection:text-white overflow-x-hidden">
      {/* 1. STICKY NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#DFE6E9] shadow-2xs">
        <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark & Tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0984E3] to-[#00CEC9] flex items-center justify-center text-white shadow-md shadow-[#0984E3]/20 group-hover:scale-105 transition">
                <Store className="w-5.5 h-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-[#1E272E]">
                  VYAPRIX
                </span>
                <span className="text-[10px] font-bold text-[#0984E3] uppercase tracking-wider -mt-1">
                  Run Your Business Smarter
                </span>
              </div>
            </a>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#636E72]">
            {/* Features Mega Dropdown */}
            <div
              className="relative py-4"
              onMouseEnter={() => setFeaturesDropdownOpen(true)}
              onMouseLeave={() => setFeaturesDropdownOpen(false)}
            >
              <button
                onClick={() => setFeaturesDropdownOpen(!featuresDropdownOpen)}
                className="flex items-center gap-1 hover:text-[#0984E3] transition whitespace-nowrap cursor-pointer"
              >
                <span>Features</span>
                <ChevronDown className="w-4 h-4 text-[#636E72]" />
              </button>

              {featuresDropdownOpen && (
                <div className="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-2xl border border-[#DFE6E9] p-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="space-y-1">
                    <button
                      onClick={() => scrollToSection('billing')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F5F6FA] transition text-left cursor-pointer group"
                    >
                      <div className="p-2 rounded-lg bg-[#0984E3]/10 text-[#0984E3] group-hover:bg-[#0984E3] group-hover:text-white transition">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1E272E]">GST Billing & POS</p>
                        <p className="text-[11px] text-[#636E72]">Fast professional invoice creation</p>
                      </div>
                    </button>
                    <button
                      onClick={() => scrollToSection('inventory')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F5F6FA] transition text-left cursor-pointer group"
                    >
                      <div className="p-2 rounded-lg bg-[#00CEC9]/10 text-[#00CEC9] group-hover:bg-[#00CEC9] group-hover:text-white transition">
                        <Boxes className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1E272E]">Inventory & Stock</p>
                        <p className="text-[11px] text-[#636E72]">Real-time stock & low alert tracking</p>
                      </div>
                    </button>
                    <button
                      onClick={() => scrollToSection('workflow')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F5F6FA] transition text-left cursor-pointer group"
                    >
                      <div className="p-2 rounded-lg bg-[#0984E3]/10 text-[#0984E3] group-hover:bg-[#0984E3] group-hover:text-white transition">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1E272E]">Khata & Udhaar</p>
                        <p className="text-[11px] text-[#636E72]">Customer credit & balance management</p>
                      </div>
                    </button>
                    <button
                      onClick={() => scrollToSection('analytics')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F5F6FA] transition text-left cursor-pointer group"
                    >
                      <div className="p-2 rounded-lg bg-[#00CEC9]/10 text-[#00CEC9] group-hover:bg-[#00CEC9] group-hover:text-white transition">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1E272E]">Reports & P&L</p>
                        <p className="text-[11px] text-[#636E72]">Sales trend & financial statements</p>
                      </div>
                    </button>
                    <button
                      onClick={() => scrollToSection('ai-assistant')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F5F6FA] transition text-left cursor-pointer group"
                    >
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1E272E]">Goldnifi AI</p>
                        <p className="text-[11px] text-[#636E72]">Smart conversational business insights</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Solutions Dropdown */}
            <div
              className="relative py-4"
              onMouseEnter={() => setSolutionsDropdownOpen(true)}
              onMouseLeave={() => setSolutionsDropdownOpen(false)}
            >
              <button
                onClick={() => setSolutionsDropdownOpen(!solutionsDropdownOpen)}
                className="flex items-center gap-1 hover:text-[#0984E3] transition whitespace-nowrap cursor-pointer"
              >
                <span>Solutions</span>
                <ChevronDown className="w-4 h-4 text-[#636E72]" />
              </button>

              {solutionsDropdownOpen && (
                <div className="absolute top-full left-0 w-72 bg-white rounded-2xl shadow-2xl border border-[#DFE6E9] p-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="space-y-1">
                    <button
                      onClick={() => scrollToSection('industries')}
                      className="w-full p-2 rounded-lg hover:bg-[#F5F6FA] text-left cursor-pointer"
                    >
                      <p className="text-xs font-bold text-[#1E272E]">Retail & Kirana</p>
                      <p className="text-[11px] text-[#636E72]">Fast barcode billing & daily sales</p>
                    </button>
                    <button
                      onClick={() => scrollToSection('industries')}
                      className="w-full p-2 rounded-lg hover:bg-[#F5F6FA] text-left cursor-pointer"
                    >
                      <p className="text-xs font-bold text-[#1E272E]">Wholesalers & Distributors</p>
                      <p className="text-[11px] text-[#636E72]">Bulk orders, party ledgers & discounts</p>
                    </button>
                    <button
                      onClick={() => scrollToSection('industries')}
                      className="w-full p-2 rounded-lg hover:bg-[#F5F6FA] text-left cursor-pointer"
                    >
                      <p className="text-xs font-bold text-[#1E272E]">Service & Repairs</p>
                      <p className="text-[11px] text-[#636E72]">Job billing & customer records</p>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => scrollToSection('industries')}
              className="hover:text-[#0984E3] transition whitespace-nowrap cursor-pointer"
            >
              Industries
            </button>
            <button
              onClick={() => scrollToSection('journey')}
              className="hover:text-[#0984E3] transition whitespace-nowrap cursor-pointer"
            >
              Workflow
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-[#0984E3] transition whitespace-nowrap cursor-pointer"
            >
              FAQ
            </button>

            {/* Desktop / Laptop Download Option in Bold next to FAQ */}
            <a
              href="/VYAPRIX-Setup.exe"
              download="VYAPRIX-Setup.exe"
              onClick={handleDownloadExe}
              className="font-bold text-[#0984E3] hover:text-white hover:bg-[#0984E3] px-3 py-1.5 rounded-xl border-2 border-[#0984E3] transition duration-150 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-xs group"
              title="Download VYAPRIX Windows Desktop (.exe)"
            >
              <Download className="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform" />
              <span className="font-bold tracking-tight">Download</span>
              <span className="text-[10px] bg-[#0984E3] group-hover:bg-white text-white group-hover:text-[#0984E3] px-1.5 py-0.5 rounded font-black transition-colors">
                .EXE
              </span>
            </a>
          </nav>

          {/* Zone 3: Primary Actions (Login / Get Started) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              onClick={onLogin}
              className="px-5 py-2.5 text-xs font-bold text-[#1E272E] bg-[#F5F6FA] hover:bg-[#DFE6E9]/60 rounded-xl transition cursor-pointer border border-[#DFE6E9]"
            >
              Login
            </button>
            <button
              onClick={onSignUp}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#0984E3] to-[#0770C2] hover:from-[#0770C2] hover:to-[#0984E3] rounded-xl shadow-md shadow-[#0984E3]/25 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#1E272E] hover:bg-[#F5F6FA] rounded-xl transition cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#DFE6E9] px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => scrollToSection('overview')}
              className="w-full text-left py-2 font-semibold text-sm text-[#1E272E]"
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection('billing')}
              className="w-full text-left py-2 font-semibold text-sm text-[#1E272E]"
            >
              GST Billing
            </button>
            <button
              onClick={() => scrollToSection('inventory')}
              className="w-full text-left py-2 font-semibold text-sm text-[#1E272E]"
            >
              Inventory Management
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              className="w-full text-left py-2 font-semibold text-sm text-[#1E272E]"
            >
              Sales, Purchases & Khata
            </button>
            <button
              onClick={() => scrollToSection('industries')}
              className="w-full text-left py-2 font-semibold text-sm text-[#1E272E]"
            >
              Industries
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="w-full text-left py-2 font-semibold text-sm text-[#1E272E]"
            >
              FAQ
            </button>
            <div className="pt-2 border-t border-[#DFE6E9] flex flex-col gap-2">
              <button
                onClick={onLogin}
                className="w-full py-2.5 text-xs font-bold text-[#1E272E] bg-[#F5F6FA] rounded-xl border border-[#DFE6E9]"
              >
                Login
              </button>
              <button
                onClick={onSignUp}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#0984E3] rounded-xl shadow-md"
              >
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION — FULL WIDTH DESKTOP CENTERPIECE */}
      <section className="relative py-6 lg:py-10 overflow-hidden bg-gradient-to-b from-white via-[#F5F6FA] to-[#F5F6FA]">
        {/* Subtle Ambient Background Grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0984e308_1px,transparent_1px),linear-gradient(to_bottom,#0984e308_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="w-full px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left Column: Headline & Action Controls */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5 text-left bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-2xl border border-[#DFE6E9] shadow-sm">
              <div className="space-y-4">
                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0984E3]/10 border border-[#0984E3]/20 text-[#0984E3] text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#00CEC9]" />
                  <span>SMART BUSINESS MANAGEMENT PLATFORM</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[46px] font-black text-[#1E272E] tracking-tight leading-[1.15]">
                  Run Your Business Smarter with{' '}
                  <span className="bg-gradient-to-r from-[#0984E3] to-[#00CEC9] bg-clip-text text-transparent">
                    VYAPRIX
                  </span>
                </h1>

                {/* Supporting Copy */}
                <p className="text-sm sm:text-base text-[#636E72] font-medium leading-relaxed">
                  GST billing, inventory, sales, purchases, khata, business reports and AI-powered assistance — bring your daily business operations together in one organized workspace.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <button
                    onClick={onSignUp}
                    className="flex-1 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-[#0984E3] to-[#0770C2] hover:from-[#0770C2] hover:to-[#0984E3] rounded-xl shadow-lg shadow-[#0984E3]/30 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>
                  <button
                    onClick={() => scrollToSection('overview')}
                    className="flex-1 px-5 py-3.5 text-sm font-bold text-[#1E272E] bg-white hover:bg-[#0984E3]/5 border-2 border-[#0984E3]/30 hover:border-[#0984E3] rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    <Zap className="w-4 h-4 text-[#0984E3] group-hover:scale-125 transition-transform" />
                    <span>Explore Features</span>
                    <ChevronDown className="w-4 h-4 text-[#0984E3]" />
                  </button>
                </div>

                {/* Trust Subtext */}
                <p className="text-xs font-semibold text-[#636E72] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00B894] shrink-0" />
                  <span>Simple setup • Built for Indian businesses • Powered by GOLDEN BAZAAR</span>
                </p>
              </div>

              {/* Compact Highlight Cards */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#DFE6E9]">
                <div className="p-3 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9] hover:border-[#0984E3] transition">
                  <p className="text-xs font-bold text-[#1E272E]">GST Billing</p>
                  <p className="text-[11px] text-[#636E72]">Automatic GST tax</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9] hover:border-[#00CEC9] transition">
                  <p className="text-xs font-bold text-[#1E272E]">Inventory</p>
                  <p className="text-[11px] text-[#636E72]">Live stock tracking</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9] hover:border-[#0984E3] transition">
                  <p className="text-xs font-bold text-[#1E272E]">Reports</p>
                  <p className="text-[11px] text-[#636E72]">P&L & sales trends</p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Centerpiece Software Showcase Frame */}
            <div className="lg:col-span-7 relative vy-scroll-fly-right flex flex-col">
              {/* Device Container Frame */}
              <div className="w-full flex-1 rounded-2xl bg-white border border-[#DFE6E9] shadow-xl overflow-hidden flex flex-col">
                {/* Window Title Bar */}
                <div className="h-9 bg-[#1E272E] px-4 flex items-center justify-between border-b border-[#2D3436] shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="text-[11px] font-mono text-[#74B9FF] flex items-center gap-1.5 bg-[#2D3436] px-3 py-0.5 rounded-md">
                    <Lock className="w-3 h-3 text-[#00CEC9]" />
                    <span>app.vyaprix.in/dashboard</span>
                  </div>
                  <div className="text-[10px] text-[#00CEC9] font-bold">LIVE WORKSPACE</div>
                </div>

                {/* Simulated Software Dashboard Interface */}
                <div className="p-4 sm:p-5 bg-[#F5F6FA] grid grid-cols-12 gap-4 text-left flex-1">
                  {/* Dashboard Sidebar */}
                  <div className="col-span-3 bg-white p-3 rounded-xl border border-[#DFE6E9] hidden sm:flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#DFE6E9]">
                        <div className="w-6 h-6 rounded-lg bg-[#0984E3] text-white flex items-center justify-center font-black text-xs">
                          V
                        </div>
                        <span className="text-xs font-bold text-[#1E272E]">VYAPRIX POS</span>
                      </div>
                      <div className="space-y-1">
                        <div className="p-2 rounded-lg bg-[#0984E3] text-white text-xs font-bold flex items-center gap-2">
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Dashboard</span>
                        </div>
                        <div className="p-2 rounded-lg text-xs font-semibold text-[#636E72] hover:bg-[#F5F6FA] flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Quick Billing</span>
                        </div>
                        <div className="p-2 rounded-lg text-xs font-semibold text-[#636E72] hover:bg-[#F5F6FA] flex items-center gap-2">
                          <Boxes className="w-3.5 h-3.5" />
                          <span>Inventory</span>
                        </div>
                        <div className="p-2 rounded-lg text-xs font-semibold text-[#636E72] hover:bg-[#F5F6FA] flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Khata / Udhaar</span>
                        </div>
                        <div className="p-2 rounded-lg text-xs font-semibold text-[#636E72] hover:bg-[#F5F6FA] flex items-center gap-2">
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>GST Reports</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#00B894]/10 border border-[#00B894]/20">
                      <p className="text-[10px] font-bold text-[#00B894]">Invoice #INV-2026</p>
                      <p className="text-[10px] font-semibold text-[#1E272E]">₹ 4,320 • GST 18%</p>
                    </div>
                  </div>

                  {/* Dashboard Main Content */}
                  <div className="col-span-12 sm:col-span-9 flex flex-col justify-between space-y-3">
                    {/* Top Stat Cards Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-[#DFE6E9] shadow-2xs">
                        <p className="text-[10px] font-bold text-[#636E72] uppercase">Today Sales</p>
                        <p className="text-base sm:text-lg font-black text-[#1E272E] tabular-nums">₹ 1,84,500</p>
                        <span className="text-[10px] font-bold text-[#00B894]">+18.2% vs yesterday</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-[#DFE6E9] shadow-2xs">
                        <p className="text-[10px] font-bold text-[#636E72] uppercase">Total Invoices</p>
                        <p className="text-base sm:text-lg font-black text-[#1E272E] tabular-nums">38 Bills</p>
                        <span className="text-[10px] font-bold text-[#0984E3]">100% GST Ready</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-[#DFE6E9] shadow-2xs">
                        <p className="text-[10px] font-bold text-[#636E72] uppercase">Stock Alerts</p>
                        <p className="text-base sm:text-lg font-black text-[#D63031] tabular-nums">4 Items Low</p>
                        <span className="text-[10px] font-bold text-[#D63031]">Reorder needed</span>
                      </div>
                    </div>

                    {/* Chart & Recent Activity */}
                    <div className="bg-white p-4 rounded-xl border border-[#DFE6E9] shadow-2xs space-y-3 flex-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#1E272E]">Sales Trend (Weekly)</p>
                          <p className="text-[10px] text-[#636E72]">Real-time daily collection curve</p>
                        </div>
                        <span className="text-xs font-bold text-[#0984E3] bg-[#0984E3]/10 px-2.5 py-0.5 rounded-md">
                          Live POS Sync
                        </span>
                      </div>
                      {/* Visual SVG Chart Bar Simulation */}
                      <div className="h-28 flex items-end justify-between gap-2.5 pt-2 px-1 border-b border-[#DFE6E9]">
                        {[45, 65, 58, 82, 74, 96, 88].map((h, i) => (
                          <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1 group/bar">
                            <div
                              style={{ height: `${h}%` }}
                              className="w-full bg-gradient-to-t from-[#0984E3] to-[#00CEC9] rounded-t-md group-hover/bar:brightness-110 transition"
                            />
                            <span className="text-[9px] font-semibold text-[#636E72]">
                              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="font-bold text-[#1E272E] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          Goldnifi AI: "Today's revenue is +18% higher than average"
                        </span>
                        <span className="font-bold text-[#00B894]">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST & CAPABILITY STRIP */}
      <section className="py-5 bg-white border-y border-[#DFE6E9]">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { icon: Receipt, label: 'GST Billing', desc: 'Instant Tax Invoices', color: 'text-[#0984E3]', delay: '0ms' },
              { icon: Boxes, label: 'Inventory Control', desc: 'Live Stock Alerts', color: 'text-[#00CEC9]', delay: '60ms' },
              { icon: BookOpen, label: 'Khata & Udhaar', desc: 'Party Ledger Sync', color: 'text-[#0984E3]', delay: '120ms' },
              { icon: BarChart3, label: 'Business Reports', desc: 'Real-Time P&L', color: 'text-[#00CEC9]', delay: '180ms' },
              { icon: ShieldCheck, label: 'Staff Roles', desc: 'Role Based Access', color: 'text-[#0984E3]', delay: '240ms' },
              { icon: Sparkles, label: 'AI Assistant', desc: 'Smart Insights', color: 'text-purple-600', delay: '300ms' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{ '--scroll-delay': item.delay } as React.CSSProperties}
                className="vy-scroll-reveal flex items-center gap-3 p-3 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9] hover:border-[#0984E3]/40 hover:-translate-y-0.5 transition text-left"
              >
                <div className="p-2.5 rounded-xl bg-white border border-[#DFE6E9] shrink-0">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1E272E]">{item.label}</p>
                  <p className="text-[10px] text-[#636E72] font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BUSINESS MANAGEMENT OVERVIEW (6 CORE MODULES) */}
      <section id="overview" className="py-10 lg:py-12 bg-[#F5F6FA] relative overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-10 space-y-6 relative z-10">
          {/* Section Header — Full Width Bar */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-[#DFE6E9] shadow-2xs vy-scroll-reveal text-left">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#0984E3] uppercase tracking-wider">
                Complete Workspace
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E272E] tracking-tight">
                Everything Your Business Needs. One Smart Platform.
              </h2>
              <p className="text-sm text-[#636E72] font-medium">
                Manage everyday business operations from a single workspace designed to keep your work organized and your decisions informed.
              </p>
            </div>
            <button
              onClick={onSignUp}
              className="px-5 py-3 text-xs font-bold text-white bg-[#0984E3] hover:bg-[#0770C2] rounded-xl shadow-sm transition cursor-pointer flex items-center gap-2 shrink-0 self-start lg:self-auto"
            >
              <span>Start Free Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 6 Core Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            {/* Module 1: GST Billing */}
            <div
              style={{ '--scroll-delay': '0ms' } as React.CSSProperties}
              className="vy-scroll-reveal bg-white p-6 rounded-2xl border border-[#DFE6E9] shadow-2xs hover:shadow-xl hover:border-[#0984E3]/40 hover:-translate-y-1 transition duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="vy-card-icon-box w-12 h-12 rounded-xl bg-[#0984E3]/10 text-[#0984E3] flex items-center justify-center mb-4 group-hover:bg-[#0984E3] group-hover:text-white transition">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1E272E] mb-2">GST Billing & Invoicing</h3>
                <p className="text-xs text-[#636E72] leading-relaxed mb-4">
                  Create fast professional tax invoices, estimate bills, apply discounts, and compute CGST/SGST/IGST automatically.
                </p>
              </div>
              <button
                onClick={() => scrollToSection('billing')}
                className="text-xs font-bold text-[#0984E3] flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
              >
                <span>Explore GST Billing</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Module 2: Inventory Management */}
            <div
              style={{ '--scroll-delay': '80ms' } as React.CSSProperties}
              className="vy-scroll-reveal bg-white p-6 rounded-2xl border border-[#DFE6E9] shadow-2xs hover:shadow-xl hover:border-[#00CEC9]/40 hover:-translate-y-1 transition duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="vy-card-icon-box w-12 h-12 rounded-xl bg-[#00CEC9]/10 text-[#00CEC9] flex items-center justify-center mb-4 group-hover:bg-[#00CEC9] group-hover:text-white transition">
                  <Boxes className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1E272E] mb-2">Inventory Management</h3>
                <p className="text-xs text-[#636E72] leading-relaxed mb-4">
                  Track stock quantities, product categories, SKUs, reorder levels, and receive instant low-stock notifications.
                </p>
              </div>
              <button
                onClick={() => scrollToSection('inventory')}
                className="text-xs font-bold text-[#0984E3] flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
              >
                <span>Explore Inventory</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Module 3: Sales & Purchase */}
            <div
              style={{ '--scroll-delay': '160ms' } as React.CSSProperties}
              className="vy-scroll-reveal bg-white p-6 rounded-2xl border border-[#DFE6E9] shadow-2xs hover:shadow-xl hover:border-[#0984E3]/40 hover:-translate-y-1 transition duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="vy-card-icon-box w-12 h-12 rounded-xl bg-[#0984E3]/10 text-[#0984E3] flex items-center justify-center mb-4 group-hover:bg-[#0984E3] group-hover:text-white transition">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1E272E] mb-2">Sales & Purchase Management</h3>
                <p className="text-xs text-[#636E72] leading-relaxed mb-4">
                  Record supplier purchase bills, track item purchase prices, and maintain complete records of sales and purchase histories.
                </p>
              </div>
              <button
                onClick={() => scrollToSection('workflow')}
                className="text-xs font-bold text-[#0984E3] flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
              >
                <span>Explore Sales & Purchase</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Module 4: Khata & Payments */}
            <div
              style={{ '--scroll-delay': '240ms' } as React.CSSProperties}
              className="vy-scroll-reveal bg-white p-6 rounded-2xl border border-[#DFE6E9] shadow-2xs hover:shadow-xl hover:border-[#00CEC9]/40 hover:-translate-y-1 transition duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="vy-card-icon-box w-12 h-12 rounded-xl bg-[#00CEC9]/10 text-[#00CEC9] flex items-center justify-center mb-4 group-hover:bg-[#00CEC9] group-hover:text-white transition">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1E272E] mb-2">Khata & Udhaar Tracking</h3>
                <p className="text-xs text-[#636E72] leading-relaxed mb-4">
                  Manage customer credit accounts, record partial payments, track supplier dues, and send payment reminders.
                </p>
              </div>
              <button
                onClick={() => scrollToSection('workflow')}
                className="text-xs font-bold text-[#0984E3] flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
              >
                <span>Explore Khata</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Module 5: Reports & Analytics */}
            <div
              style={{ '--scroll-delay': '320ms' } as React.CSSProperties}
              className="vy-scroll-reveal bg-white p-6 rounded-2xl border border-[#DFE6E9] shadow-2xs hover:shadow-xl hover:border-[#0984E3]/40 hover:-translate-y-1 transition duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="vy-card-icon-box w-12 h-12 rounded-xl bg-[#0984E3]/10 text-[#0984E3] flex items-center justify-center mb-4 group-hover:bg-[#0984E3] group-hover:text-white transition">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1E272E] mb-2">Reports & Business Analytics</h3>
                <p className="text-xs text-[#636E72] leading-relaxed mb-4">
                  View sales trends, profit & loss summaries, GST tax breakdown, and identify top-performing business products.
                </p>
              </div>
              <button
                onClick={() => scrollToSection('analytics')}
                className="text-xs font-bold text-[#0984E3] flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
              >
                <span>Explore Reports</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Module 6: Staff & Access Management */}
            <div
              style={{ '--scroll-delay': '400ms' } as React.CSSProperties}
              className="vy-scroll-reveal bg-white p-6 rounded-2xl border border-[#DFE6E9] shadow-2xs hover:shadow-xl hover:border-purple-400/40 hover:-translate-y-1 transition duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="vy-card-icon-box w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1E272E] mb-2">Staff & Role Permissions</h3>
                <p className="text-xs text-[#636E72] leading-relaxed mb-4">
                  Grant custom access permissions for cashiers, managers, and billing staff while keeping sensitive data secure.
                </p>
              </div>
              <button
                onClick={onSignUp}
                className="text-xs font-bold text-[#0984E3] flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
              >
                <span>Explore Multi-User</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GST BILLING — DETAILED FEATURE SHOWCASE */}
      <section id="billing" className="py-10 lg:py-12 bg-white border-t border-[#DFE6E9] overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left Column: Descriptions & Capabilities */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5 text-left bg-[#F5F6FA] p-6 sm:p-8 rounded-2xl border border-[#DFE6E9] vy-scroll-fly-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0984E3]/10 text-[#0984E3] text-xs font-bold">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>PROFESSIONAL BILLING WORKFLOW</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#1E272E] tracking-tight leading-tight">
                  Create Professional Bills with Confidence
                </h2>

                <p className="text-sm text-[#636E72] font-medium leading-relaxed">
                  Organize invoices, product details, customer records, discounts and tax calculations in one streamlined billing workflow.
                </p>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#DFE6E9]">
                    <CheckCircle2 className="w-5 h-5 text-[#00B894] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1E272E]">GST & Non-GST Billing Support</p>
                      <p className="text-[11px] text-[#636E72]">Generate compliant GST bills or quick cash memo receipts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#DFE6E9]">
                    <CheckCircle2 className="w-5 h-5 text-[#00B894] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1E272E]">Automatic GST Calculations</p>
                      <p className="text-[11px] text-[#636E72]">Automatic CGST, SGST, and IGST tax splits per item</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#DFE6E9]">
                    <CheckCircle2 className="w-5 h-5 text-[#00B894] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1E272E]">Print & Share Formats</p>
                      <p className="text-[11px] text-[#636E72]">Print directly to A4, A5, or thermal receipt printers</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onSignUp}
                  className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-white bg-[#0984E3] hover:bg-[#0770C2] rounded-xl shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Get Started with GST Billing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Realistic Invoice Component Preview */}
            <div className="lg:col-span-7 vy-scroll-fly-right flex">
              <div className="w-full bg-[#F5F6FA] p-5 sm:p-6 rounded-2xl border border-[#DFE6E9] shadow-md flex flex-col justify-between">
                {/* Simulated Invoice Frame Header */}
                <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#DFE6E9] shadow-2xs space-y-4 text-left flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between border-b border-[#DFE6E9] pb-4">
                    <div>
                      <h4 className="text-base font-black text-[#1E272E]">SHREE RAM TRADERS</h4>
                      <p className="text-[11px] text-[#636E72]">GSTIN: 07AABCU9603R1ZM • New Delhi, India</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-[#00B894]/10 text-[#00B894] text-[10px] font-bold">
                        PAID • TAX INVOICE
                      </span>
                      <p className="text-xs font-bold text-[#1E272E] mt-1">#INV-2026-089</p>
                      <p className="text-[10px] text-[#636E72]">18 Oct 2026</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-[#F5F6FA] p-3 rounded-xl border border-[#DFE6E9]">
                    <div>
                      <p className="text-[10px] font-bold text-[#636E72] uppercase">Customer</p>
                      <p className="font-bold text-[#1E272E]">Rahul Sharma</p>
                      <p className="text-[11px] text-[#636E72]">+91 98765 43210</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#636E72] uppercase">Payment Mode</p>
                      <p className="font-bold text-[#1E272E]">UPI / QR Code</p>
                      <p className="text-[11px] text-[#00B894]">Ref: TXN88402</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[10px] font-bold text-[#636E72] uppercase">Place of Supply</p>
                      <p className="font-bold text-[#1E272E]">07 - Delhi</p>
                      <p className="text-[11px] text-[#0984E3]">B2C Regular</p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="border border-[#DFE6E9] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F5F6FA] text-[#636E72] font-bold text-[10px] uppercase border-b border-[#DFE6E9]">
                        <tr>
                          <th className="p-2.5">Item</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right">Price</th>
                          <th className="p-2.5 text-right">Taxable</th>
                          <th className="p-2.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFE6E9]">
                        <tr>
                          <td className="p-2.5 font-semibold">Basmati Rice 5kg</td>
                          <td className="p-2.5 text-center">2</td>
                          <td className="p-2.5 text-right">₹ 650.00</td>
                          <td className="p-2.5 text-right">₹ 1,300.00</td>
                          <td className="p-2.5 text-right font-bold">₹ 1,300.00</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-semibold">Fortune Sunflower Oil 1L</td>
                          <td className="p-2.5 text-center">5</td>
                          <td className="p-2.5 text-right">₹ 160.00</td>
                          <td className="p-2.5 text-right">₹ 800.00</td>
                          <td className="p-2.5 text-right font-bold">₹ 800.00</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-semibold">Tata Salt 1kg Pack</td>
                          <td className="p-2.5 text-center">10</td>
                          <td className="p-2.5 text-right">₹ 28.00</td>
                          <td className="p-2.5 text-right">₹ 280.00</td>
                          <td className="p-2.5 text-right font-bold">₹ 280.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Tax Summary Split */}
                  <div className="flex justify-between items-end pt-2 border-t border-[#DFE6E9]">
                    <div className="text-[11px] text-[#636E72] space-y-0.5">
                      <p>CGST (9%): ₹ 180.00 • SGST (9%): ₹ 180.00</p>
                      <p className="text-[#00B894] font-bold">Discount Applied: ₹ 100.00</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[#636E72] uppercase">Grand Total</p>
                      <p className="text-xl font-black text-[#0984E3]">₹ 2,460.00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SMART INVENTORY MANAGEMENT */}
      <section id="inventory" className="py-10 lg:py-12 bg-[#F5F6FA] border-t border-[#DFE6E9] overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left Column: Inventory Dashboard Frame */}
            <div className="lg:col-span-7 order-2 lg:order-1 vy-scroll-fly-left flex">
              <div className="w-full bg-white p-5 sm:p-6 rounded-2xl border border-[#DFE6E9] shadow-md space-y-4 text-left flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#DFE6E9] pb-3">
                    <div className="flex items-center gap-2">
                      <Boxes className="w-5 h-5 text-[#00CEC9]" />
                      <span className="text-sm font-bold text-[#1E272E]">Inventory & Stock Control</span>
                    </div>
                    <span className="text-xs font-bold text-[#00CEC9] bg-[#00CEC9]/10 px-2.5 py-1 rounded-lg">
                      Real-Time Tracking
                    </span>
                  </div>

                  {/* Quick Inventory KPI Strip */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9]">
                      <p className="text-[10px] font-bold text-[#636E72] uppercase">Total SKUs</p>
                      <p className="text-base font-black text-[#1E272E]">1,240 Items</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9]">
                      <p className="text-[10px] font-bold text-[#636E72] uppercase">Stock Value</p>
                      <p className="text-base font-black text-[#0984E3]">₹ 12,45,000</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#D63031]/5 border border-[#D63031]/20">
                      <p className="text-[10px] font-bold text-[#D63031] uppercase">Low Stock</p>
                      <p className="text-base font-black text-[#D63031]">4 Alerts</p>
                    </div>
                  </div>

                  {/* Inventory Table Preview */}
                  <div className="border border-[#DFE6E9] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F5F6FA] text-[#636E72] font-bold text-[10px] uppercase border-b border-[#DFE6E9]">
                        <tr>
                          <th className="p-2.5">Product</th>
                          <th className="p-2.5">SKU</th>
                          <th className="p-2.5 text-right">Price</th>
                          <th className="p-2.5 text-center">Stock</th>
                          <th className="p-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFE6E9]">
                        <tr>
                          <td className="p-2.5 font-bold text-[#1E272E]">Aashirvaad Atta 10kg</td>
                          <td className="p-2.5 text-[#636E72] font-mono">SKU-8801</td>
                          <td className="p-2.5 text-right font-bold">₹ 440.00</td>
                          <td className="p-2.5 text-center font-bold text-[#D63031]">3 Bags</td>
                          <td className="p-2.5 text-right">
                            <span className="px-2 py-0.5 rounded bg-[#D63031]/10 text-[#D63031] text-[10px] font-bold">
                              Low Stock
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-[#1E272E]">Amul Butter 500g</td>
                          <td className="p-2.5 text-[#636E72] font-mono">SKU-2204</td>
                          <td className="p-2.5 text-right font-bold">₹ 275.00</td>
                          <td className="p-2.5 text-center font-bold text-[#00B894]">42 Units</td>
                          <td className="p-2.5 text-right">
                            <span className="px-2 py-0.5 rounded bg-[#00B894]/10 text-[#00B894] text-[10px] font-bold">
                              In Stock
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-[#1E272E]">Surf Excel Easy Wash 1kg</td>
                          <td className="p-2.5 text-[#636E72] font-mono">SKU-5510</td>
                          <td className="p-2.5 text-right font-bold">₹ 140.00</td>
                          <td className="p-2.5 text-center font-bold text-[#00B894]">18 Packs</td>
                          <td className="p-2.5 text-right">
                            <span className="px-2 py-0.5 rounded bg-[#00B894]/10 text-[#00B894] text-[10px] font-bold">
                              In Stock
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-[#1E272E]">Tata Tea Gold 500g</td>
                          <td className="p-2.5 text-[#636E72] font-mono">SKU-3190</td>
                          <td className="p-2.5 text-right font-bold">₹ 260.00</td>
                          <td className="p-2.5 text-center font-bold text-[#00B894]">29 Packs</td>
                          <td className="p-2.5 text-right">
                            <span className="px-2 py-0.5 rounded bg-[#00B894]/10 text-[#00B894] text-[10px] font-bold">
                              In Stock
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Inventory Descriptions */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5 text-left order-1 lg:order-2 bg-white p-6 sm:p-8 rounded-2xl border border-[#DFE6E9] shadow-2xs vy-scroll-fly-right">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00CEC9]/10 text-[#00CEC9] text-xs font-bold">
                  <Boxes className="w-3.5 h-3.5" />
                  <span>INTELLIGENT STOCK CONTROL</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#1E272E] tracking-tight leading-tight">
                  Stay in Control of Every Item
                </h2>

                <p className="text-sm text-[#636E72] font-medium leading-relaxed">
                  Organize products, monitor available stock, manage purchases and identify items that need attention.
                </p>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3 bg-[#F5F6FA] p-3 rounded-xl border border-[#DFE6E9]">
                    <CheckCircle2 className="w-5 h-5 text-[#00CEC9] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1E272E]">Automatic Stock Deduction</p>
                      <p className="text-[11px] text-[#636E72]">Stock levels update instantly when invoices are generated</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-[#F5F6FA] p-3 rounded-xl border border-[#DFE6E9]">
                    <CheckCircle2 className="w-5 h-5 text-[#00CEC9] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1E272E]">Low-Stock Alerts</p>
                      <p className="text-[11px] text-[#636E72]">Never run out of essential products with reorder thresholds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-[#F5F6FA] p-3 rounded-xl border border-[#DFE6E9]">
                    <CheckCircle2 className="w-5 h-5 text-[#00CEC9] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1E272E]">Categories & SKUs</p>
                      <p className="text-[11px] text-[#636E72]">Search, organize, and filter products easily by item code</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onSignUp}
                  className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-white bg-[#0984E3] hover:bg-[#0770C2] rounded-xl shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Get Started with Inventory</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SALES, PURCHASES AND KHATA */}
      <section id="workflow" className="py-10 lg:py-12 bg-white border-t border-[#DFE6E9] overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 vy-scroll-reveal text-left">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#0984E3] uppercase tracking-wider">
                Complete Operations
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E272E] tracking-tight">
                Know What You Sell, Buy and Collect
              </h2>
              <p className="text-sm text-[#636E72] font-medium">
                Keep your entire sales workflow, supplier purchases, and customer credit ledger (Khata) synced in real time.
              </p>
            </div>

            {/* Interactive Workflow Tabs */}
            <div className="flex gap-2 p-1.5 bg-[#F5F6FA] rounded-2xl border border-[#DFE6E9] shrink-0">
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('sales');
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'sales'
                    ? 'bg-[#0984E3] text-white shadow-xs'
                    : 'text-[#636E72] hover:text-[#1E272E]'
                }`}
              >
                Sales Management
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('purchases');
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'purchases'
                    ? 'bg-[#0984E3] text-white shadow-xs'
                    : 'text-[#636E72] hover:text-[#1E272E]'
                }`}
              >
                Purchases & Bills
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('khata');
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'khata'
                    ? 'bg-[#0984E3] text-white shadow-xs'
                    : 'text-[#636E72] hover:text-[#1E272E]'
                }`}
              >
                Khata / Udhaar
              </button>
            </div>
          </div>

          {/* Tab Content Display — Full Width */}
          <div className="w-full bg-[#F5F6FA] p-6 sm:p-8 rounded-2xl border border-[#DFE6E9] text-left vy-scroll-reveal">
            {activeTab === 'sales' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0984E3]/10 text-[#0984E3] flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E272E]">Sales & Invoice Tracking</h3>
                  <p className="text-xs text-[#636E72] leading-relaxed">
                    Track every sales transaction, daily collection summaries, and customer purchase histories. Identify high-value customers and peak sales hours.
                  </p>
                  <ul className="text-xs font-semibold text-[#1E272E] space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00B894]" /> Real-time sales logging & POS billing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00B894]" /> Instant payment mode breakdown (Cash, UPI, Card)
                    </li>
                  </ul>
                </div>
                <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#DFE6E9] shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#DFE6E9] pb-2">
                    <p className="text-xs font-bold text-[#1E272E]">Recent Sales Invoices</p>
                    <span className="text-[11px] font-bold text-[#00B894]">Today: ₹ 1,84,500</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9]">
                      <div>
                        <p className="font-bold text-[#1E272E]">Rahul Verma</p>
                        <p className="text-[10px] text-[#636E72]">Invoice #INV-2026-088 • Cash</p>
                      </div>
                      <span className="font-bold text-[#00B894]">₹ 1,850</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9]">
                      <div>
                        <p className="font-bold text-[#1E272E]">Priya General Stores</p>
                        <p className="text-[10px] text-[#636E72]">Invoice #INV-2026-087 • UPI</p>
                      </div>
                      <span className="font-bold text-[#0984E3]">₹ 4,200</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9]">
                      <div>
                        <p className="font-bold text-[#1E272E]">Ankit Enterprises</p>
                        <p className="text-[10px] text-[#636E72]">Invoice #INV-2026-086 • GST B2B</p>
                      </div>
                      <span className="font-bold text-[#00B894]">₹ 12,400</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9]">
                      <div>
                        <p className="font-bold text-[#1E272E]">Mehta Supermarket</p>
                        <p className="text-[10px] text-[#636E72]">Invoice #INV-2026-085 • Bank</p>
                      </div>
                      <span className="font-bold text-[#0984E3]">₹ 8,950</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'purchases' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00CEC9]/10 text-[#00CEC9] flex items-center justify-center font-bold">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E272E]">Supplier & Purchase Entries</h3>
                  <p className="text-xs text-[#636E72] leading-relaxed">
                    Record purchases from distributors, maintain supplier contact details, track cost prices, and update stock counts automatically.
                  </p>
                  <ul className="text-xs font-semibold text-[#1E272E] space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00B894]" /> Supplier ledger & inward GST input credit
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00B894]" /> Automatic cost price & stock inward sync
                    </li>
                  </ul>
                </div>
                <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#DFE6E9] shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#DFE6E9] pb-2">
                    <p className="text-xs font-bold text-[#1E272E]">Recent Purchase Entries</p>
                    <span className="text-[11px] font-bold text-[#0984E3]">Inward Stock Updated</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9]">
                      <div>
                        <p className="font-bold text-[#1E272E]">National FMCG Distributors</p>
                        <p className="text-[10px] text-[#636E72]">PO #PUR-1002 • 15 Oct</p>
                      </div>
                      <span className="font-bold text-[#1E272E]">₹ 38,500</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9]">
                      <div>
                        <p className="font-bold text-[#1E272E]">Hindustan Agro Foods</p>
                        <p className="text-[10px] text-[#636E72]">PO #PUR-1001 • 14 Oct</p>
                      </div>
                      <span className="font-bold text-[#1E272E]">₹ 24,200</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'khata' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E272E]">Khata & Credit Balance</h3>
                  <p className="text-xs text-[#636E72] leading-relaxed">
                    Keep a clear record of customer credit (Udhaar). See total outstanding balances, record partial payments, and send WhatsApp payment reminders.
                  </p>
                  <ul className="text-xs font-semibold text-[#1E272E] space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00B894]" /> Customer & supplier balance ledger
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00B894]" /> Partial payment & due date reminders
                    </li>
                  </ul>
                </div>
                <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#DFE6E9] shadow-sm space-y-3">
                  <p className="text-xs font-bold text-[#1E272E]">Customer Dues Summary</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <p className="text-[10px] font-bold text-amber-800 uppercase">Total To Collect (Receivable)</p>
                      <p className="text-lg font-black text-amber-900">₹ 14,350.00</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#00B894]/10 border border-[#00B894]/20">
                      <p className="text-[10px] font-bold text-[#00B894] uppercase">Collected This Week</p>
                      <p className="text-lg font-black text-[#1E272E]">₹ 42,800.00</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. BUSINESS REPORTS AND ANALYTICS */}
      <section id="analytics" className="py-10 lg:py-12 bg-[#F5F6FA] border-t border-[#DFE6E9] overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left Column Description */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5 text-left bg-white p-6 sm:p-8 rounded-2xl border border-[#DFE6E9] shadow-2xs vy-scroll-fly-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0984E3]/10 text-[#0984E3] text-xs font-bold">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>DATA-DRIVEN INSIGHTS</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#1E272E] tracking-tight leading-tight">
                  Turn Daily Transactions into Clear Business Insights
                </h2>

                <p className="text-sm text-[#636E72] font-medium leading-relaxed">
                  Understand your business performance with sales trends, profit summaries, expense breakdowns, and tax analytics.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="p-3.5 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E272E]">Profit & Loss Reports</span>
                  <span className="text-xs font-bold text-[#00B894]">Real-time Calculation</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E272E]">GST Sales & Purchase Reports</span>
                  <span className="text-xs font-bold text-[#0984E3]">GSTR Ready</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E272E]">Date Filter (Today / Week / Month / Custom)</span>
                  <span className="text-xs font-bold text-purple-600">Instant Export</span>
                </div>
              </div>
            </div>

            {/* Right Column Analytics Preview Card */}
            <div className="lg:col-span-7 vy-scroll-fly-right flex">
              <div className="w-full bg-white p-6 rounded-2xl border border-[#DFE6E9] shadow-md text-left space-y-5 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-[#DFE6E9] pb-3">
                  <div>
                    <h4 className="text-base font-bold text-[#1E272E]">Monthly Sales & Revenue Report</h4>
                    <p className="text-[11px] text-[#636E72]">Current Month Performance Overview</p>
                  </div>
                  <span className="text-xs font-bold text-[#00B894] bg-[#00B894]/10 px-2.5 py-1 rounded-md">
                    +24.5% Growth
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9]">
                    <p className="text-[10px] font-bold text-[#636E72] uppercase">Gross Revenue</p>
                    <p className="text-base sm:text-lg font-black text-[#1E272E]">₹ 4,82,000</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9]">
                    <p className="text-[10px] font-bold text-[#636E72] uppercase">Net Profit</p>
                    <p className="text-base sm:text-lg font-black text-[#00B894]">₹ 84,200</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9]">
                    <p className="text-[10px] font-bold text-[#636E72] uppercase">GST Tax Collected</p>
                    <p className="text-base sm:text-lg font-black text-[#0984E3]">₹ 43,380</p>
                  </div>
                </div>

                <div className="space-y-2.5 bg-[#F5F6FA] p-4 rounded-xl border border-[#DFE6E9]">
                  <div className="flex justify-between text-xs font-bold text-[#1E272E]">
                    <span>Top Selling Category Breakdown</span>
                    <span className="text-[#0984E3]">100% Tracked</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold mb-1">
                        <span>Groceries & Staples</span>
                        <span className="font-bold">54% (₹ 2,60,280)</span>
                      </div>
                      <div className="w-full h-2 bg-[#DFE6E9] rounded-full overflow-hidden">
                        <div className="h-full w-[54%] bg-[#0984E3] rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold mb-1">
                        <span>Packaged Dairy & Beverages</span>
                        <span className="font-bold">28% (₹ 1,34,960)</span>
                      </div>
                      <div className="w-full h-2 bg-[#DFE6E9] rounded-full overflow-hidden">
                        <div className="h-full w-[28%] bg-[#00CEC9] rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold mb-1">
                        <span>Home & Personal Care</span>
                        <span className="font-bold">18% (₹ 86,760)</span>
                      </div>
                      <div className="w-full h-2 bg-[#DFE6E9] rounded-full overflow-hidden">
                        <div className="h-full w-[18%] bg-[#00B894] rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. AI BUSINESS ASSISTANT (GOLDNIFI AI) */}
      <section id="ai-assistant" className="py-10 lg:py-12 bg-gradient-to-b from-white to-[#F5F6FA] border-t border-[#DFE6E9] overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between space-y-5 text-left bg-white p-6 sm:p-8 rounded-2xl border border-[#DFE6E9] shadow-2xs vy-scroll-fly-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GOLDNIFI AI ASSISTANT</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#1E272E] tracking-tight leading-tight">
                  Meet Your Smarter Business Assistant
                </h2>

                <p className="text-sm text-[#636E72] font-medium leading-relaxed">
                  Make it easier to understand business activity, find information and navigate daily workflows with an assistant designed for your VYAPRIX workspace.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="p-3.5 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9] text-xs font-semibold text-[#1E272E] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>"Show today's sales summary and top 3 selling items"</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9] text-xs font-semibold text-[#1E272E] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>"Which products need urgent reordering today?"</span>
                </div>
              </div>
            </div>

            {/* AI Assistant Chat UI Mockup */}
            <div className="lg:col-span-6 vy-scroll-fly-right flex">
              <div className="w-full bg-white p-6 rounded-2xl border border-purple-200 shadow-md text-left space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-[#DFE6E9]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1E272E]">Goldnifi AI Assistant</h4>
                      <p className="text-[10px] text-purple-600 font-semibold">Online • Powered by GOLDEN BAZAAR</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                    24/7 Active
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-[#F5F6FA] p-3.5 rounded-xl border border-[#DFE6E9] text-[#1E272E] font-medium">
                    Show today's sales, pending Khata collections, and low stock status.
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl text-purple-900 leading-relaxed space-y-1.5">
                    <p className="font-bold">📊 Today's Live Business Update:</p>
                    <p>• Total Sales: ₹ 1,84,500 across 38 GST invoices (+18.2% vs yesterday).</p>
                    <p>• Pending Udhaar Collection: ₹ 14,350 due from 6 regular customers.</p>
                    <p>• Low Stock Alert: 4 items (Atta 10kg, Sugar 5kg) are below reorder threshold.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. THE VYAPRIX DAILY BUSINESS JOURNEY */}
      <section id="journey" className="py-10 lg:py-12 bg-white border-t border-[#DFE6E9] overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-10 space-y-6">
          <div className="text-left space-y-1.5 vy-scroll-reveal">
            <span className="text-xs font-bold text-[#0984E3] uppercase tracking-wider">
              Daily Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E272E] tracking-tight">
              A Smarter Way to Run Your Business Day
            </h2>
            <p className="text-sm text-[#636E72] font-medium">
              See how VYAPRIX streamlines your morning setup, daytime billing, afternoon stock control, and evening closure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            <div style={{ '--scroll-delay': '0ms' } as React.CSSProperties} className="vy-scroll-reveal p-5 rounded-2xl bg-[#F5F6FA] border border-[#DFE6E9] space-y-3 relative hover:-translate-y-1 transition">
              <span className="inline-block text-xs font-bold text-[#0984E3] bg-white px-2.5 py-1 rounded-md border border-[#DFE6E9]">
                01 • Morning
              </span>
              <h3 className="text-base font-bold text-[#1E272E]">Open Your Business</h3>
              <p className="text-xs text-[#636E72] leading-relaxed">
                Review your dashboard, opening cash balance, and low-stock alerts for the day.
              </p>
            </div>

            <div style={{ '--scroll-delay': '80ms' } as React.CSSProperties} className="vy-scroll-reveal p-5 rounded-2xl bg-[#F5F6FA] border border-[#DFE6E9] space-y-3 relative hover:-translate-y-1 transition">
              <span className="inline-block text-xs font-bold text-[#0984E3] bg-white px-2.5 py-1 rounded-md border border-[#DFE6E9]">
                02 • Daytime
              </span>
              <h3 className="text-base font-bold text-[#1E272E]">Bill Your Customers</h3>
              <p className="text-xs text-[#636E72] leading-relaxed">
                Create fast GST invoices, accept UPI/Cash payments, and print receipts in seconds.
              </p>
            </div>

            <div style={{ '--scroll-delay': '160ms' } as React.CSSProperties} className="vy-scroll-reveal p-5 rounded-2xl bg-[#F5F6FA] border border-[#DFE6E9] space-y-3 relative hover:-translate-y-1 transition">
              <span className="inline-block text-xs font-bold text-[#0984E3] bg-white px-2.5 py-1 rounded-md border border-[#DFE6E9]">
                03 • Afternoon
              </span>
              <h3 className="text-base font-bold text-[#1E272E]">Manage Your Stock</h3>
              <p className="text-xs text-[#636E72] leading-relaxed">
                Record supplier deliveries, update purchase bills, and monitor real-time inventory.
              </p>
            </div>

            <div style={{ '--scroll-delay': '240ms' } as React.CSSProperties} className="vy-scroll-reveal p-5 rounded-2xl bg-[#F5F6FA] border border-[#DFE6E9] space-y-3 relative hover:-translate-y-1 transition">
              <span className="inline-block text-xs font-bold text-[#0984E3] bg-white px-2.5 py-1 rounded-md border border-[#DFE6E9]">
                04 • Evening
              </span>
              <h3 className="text-base font-bold text-[#1E272E]">Review Your Day</h3>
              <p className="text-xs text-[#636E72] leading-relaxed">
                Check daily sales reports, net profit summary, and pending Khata collections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. INDUSTRIES AND BUSINESS TYPES */}
      <section id="industries" className="py-10 lg:py-12 bg-[#F5F6FA] border-t border-[#DFE6E9] overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-10 space-y-6">
          <div className="text-left space-y-1.5 vy-scroll-reveal">
            <span className="text-xs font-bold text-[#0984E3] uppercase tracking-wider">
              Tailored Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E272E] tracking-tight">
              One Platform for Different Business Needs
            </h2>
            <p className="text-sm text-[#636E72] font-medium">
              VYAPRIX is optimized for diverse Indian retail, wholesale, and service businesses.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            {[
              { title: 'Grocery & Kirana Stores', desc: 'Fast barcode billing & weight items', icon: Store },
              { title: 'Retail & Supermarkets', desc: 'Multi-category stock & quick checkout', icon: ShoppingCart },
              { title: 'Wholesalers & Distributors', desc: 'Party ledgers & bulk order discounts', icon: Building2 },
              { title: 'Manufacturers', desc: 'Raw material purchase & production billing', icon: Factory },
              { title: 'Electronics & Mobiles', desc: 'IMEI/Serial tracking & warranty receipts', icon: Smartphone },
              { title: 'Clothing & Garments', desc: 'Size, color, and variant item management', icon: Shirt },
              { title: 'Jewellery Businesses', desc: 'Weight, wastage, and precious metal rates', icon: Sparkle },
              { title: 'Services & Repairs', desc: 'Service estimates, job bills & customer records', icon: Wrench },
            ].map((ind, i) => (
              <div
                key={i}
                style={{ '--scroll-delay': `${i * 40}ms` } as React.CSSProperties}
                className="vy-scroll-reveal p-5 rounded-2xl bg-white border border-[#DFE6E9] shadow-2xs hover:shadow-md hover:-translate-y-1 transition"
              >
                <div className="vy-card-icon-box inline-block">
                  <ind.icon className="w-6 h-6 text-[#0984E3] mb-2" />
                </div>
                <h4 className="text-sm font-bold text-[#1E272E] mb-1">{ind.title}</h4>
                <p className="text-xs text-[#636E72]">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. FREQUENTLY ASKED QUESTIONS — FULL WIDTH 2-COLUMN GRID */}
      <section id="faq" className="py-10 lg:py-12 bg-white border-t border-[#DFE6E9] overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-10 space-y-6 text-left">
          <div className="space-y-1.5 vy-scroll-reveal">
            <span className="text-xs font-bold text-[#0984E3] uppercase tracking-wider">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E272E]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 vy-scroll-reveal items-start">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#DFE6E9] bg-[#F5F6FA]/60 overflow-hidden transition"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#1E272E] hover:bg-[#F5F6FA] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <div className="p-1 rounded-lg bg-white border border-[#DFE6E9] shrink-0">
                      {isOpen ? <Minus className="w-4 h-4 text-[#0984E3]" /> : <Plus className="w-4 h-4 text-[#636E72]" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-[#636E72] leading-relaxed border-t border-[#DFE6E9]/60 pt-3 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 13. FINAL CALL TO ACTION — FULL WIDTH BANNER */}
      <section className="py-10 lg:py-12 bg-gradient-to-r from-[#0984E3] via-[#0770C2] to-[#00CEC9] text-white overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-left vy-scroll-reveal">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Your Business Deserves a Smarter Way to Work
            </h2>
            <p className="text-sm sm:text-base text-white/90 font-medium">
              Bring your billing, inventory, payments and business insights together with VYAPRIX today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onSignUp}
              className="px-7 py-4 text-sm font-bold text-[#1E272E] bg-white rounded-xl shadow-2xl hover:bg-white/95 active:scale-95 transition cursor-pointer flex items-center gap-2"
            >
              <span>Get Started with VYAPRIX</span>
              <ArrowRight className="w-4 h-4 text-[#0984E3]" />
            </button>
          </div>
        </div>
      </section>

      {/* 14. FOOTER */}
      <footer className="bg-[#1E272E] text-white py-10 border-t border-[#2D3436]">
        <div className="w-full px-4 sm:px-6 lg:px-10 space-y-8 text-left">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0984E3] text-white flex items-center justify-center font-black text-sm">
                  V
                </div>
                <span className="text-lg font-black tracking-tight text-white">VYAPRIX</span>
              </div>
              <p className="text-xs text-[#B2BEC3] max-w-md leading-relaxed">
                Run Your Business Smarter. The modern Indian SaaS platform for billing, inventory, Khata, and business reports.
              </p>
              <p className="text-xs font-bold text-[#00CEC9]">Powered by GOLDEN BAZAAR</p>
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Product</p>
              <ul className="text-xs text-[#B2BEC3] space-y-2">
                <li><button onClick={() => scrollToSection('billing')} className="hover:text-white transition cursor-pointer">GST Billing</button></li>
                <li><button onClick={() => scrollToSection('inventory')} className="hover:text-white transition cursor-pointer">Inventory</button></li>
                <li><button onClick={() => scrollToSection('workflow')} className="hover:text-white transition cursor-pointer">Sales & Purchases</button></li>
                <li><button onClick={() => scrollToSection('workflow')} className="hover:text-white transition cursor-pointer">Khata & Udhaar</button></li>
                <li><button onClick={() => scrollToSection('analytics')} className="hover:text-white transition cursor-pointer">Business Reports</button></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Solutions</p>
              <ul className="text-xs text-[#B2BEC3] space-y-2">
                <li><button onClick={() => scrollToSection('industries')} className="hover:text-white transition cursor-pointer">Retail & Kirana</button></li>
                <li><button onClick={() => scrollToSection('industries')} className="hover:text-white transition cursor-pointer">Wholesalers</button></li>
                <li><button onClick={() => scrollToSection('industries')} className="hover:text-white transition cursor-pointer">Manufacturers</button></li>
                <li><button onClick={() => scrollToSection('industries')} className="hover:text-white transition cursor-pointer">Services</button></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Account</p>
              <ul className="text-xs text-[#B2BEC3] space-y-2">
                <li><button onClick={onLogin} className="hover:text-white transition cursor-pointer">Login to Workspace</button></li>
                <li><button onClick={onSignUp} className="hover:text-white transition cursor-pointer">Create New Account</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-white transition cursor-pointer">Support & FAQ</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#2D3436] flex flex-col sm:flex-row justify-between items-center text-xs text-[#636E72] gap-4">
            <p>© 2026 VYAPRIX. Powered by GOLDEN BAZAAR. All rights reserved.</p>
            <p>Made for Indian Businesses</p>
          </div>
        </div>
      </footer>

      {/* Floating Download Feedback Toast */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E272E] text-white px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-[#0984E3] flex items-center gap-3.5 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-10 h-10 rounded-xl bg-[#0984E3]/20 border border-[#0984E3]/40 flex items-center justify-center text-[#0984E3] shrink-0">
            <Download className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{downloadToast}</p>
            <p className="text-[11px] text-[#74B9FF] font-medium">Windows Setup Installer (VYAPRIX-Setup.exe)</p>
          </div>
        </div>
      )}
    </div>
  );
};
