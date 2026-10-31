'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  FileCheck2,
  RefreshCw,
  Receipt,
  CreditCard,
  Users2,
  Package,
  Layers,
  ShieldCheck,
  BarChart3,
  Zap,
  Lock,
  Menu,
  X,
  Play,
  Star,
  TrendingUp,
} from 'lucide-react';

/* ─────────────────────── Theme Constants ─────────────────────── */
const theme = {
  orange: '#FF6B00',
  orangeHover: '#E56000',
  orangeLight: '#FFF0E6',
  black: '#121212',
  muted: '#6C757D',
  border: '#DEE2E6',
  white: '#FFFFFF',
  bgSubtle: '#F8F9FA',
  bgLight: '#F1F3F5',
};

/* ─────────────────────── Navbar ─────────────────────── */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.png"
            alt="BrightLoop Logo"
            width={180}
            height={86}
            priority
            className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-[#FF6B00]"
              style={{ color: theme.muted }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:bg-gray-50"
            style={{ color: theme.black }}
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium px-5 py-2.5 rounded-lg text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
            style={{ backgroundColor: theme.orange }}
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          <div className="pb-2 border-b border-gray-100">
            <Image
              src="/logo.png"
              alt="BrightLoop Logo"
              width={140}
              height={42}
              className="h-8 w-auto object-contain mix-blend-multiply"
            />
          </div>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm font-medium py-2 transition-colors"
              style={{ color: theme.muted }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <Link href="/login" className="block text-sm font-medium py-2" style={{ color: theme.black }}>
              Sign In
            </Link>
            <Link
              href="/login"
              className="block text-center text-sm font-medium px-5 py-2.5 rounded-lg text-white"
              style={{ backgroundColor: theme.orange }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─────────────────────── Hero Section ─────────────────────── */
function HeroSection() {
  return (
    <section className="pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ backgroundColor: theme.orange }}
        />
        <div
          className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{ backgroundColor: theme.orange }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div className="max-w-3xl mx-auto">
          {/* Big Noticeable Brand Logo - Above the Badge */}
          <div className="flex items-center justify-center sm:justify-start mb-6">
            <Image
              src="/logo.png"
              alt="BrightLoop Logo"
              width={450}
              height={215}
              priority
              className="h-20 sm:h-28 md:h-32 w-auto object-contain drop-shadow-sm transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>

          {/* Badge: Subscription Management, Reimagined */}
          <div className="flex items-center justify-center sm:justify-start mb-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border shadow-2xs"
              style={{ backgroundColor: theme.orangeLight, color: theme.orange, borderColor: '#FFD6B3' }}
            >
              <Zap className="h-3.5 w-3.5" />
              Subscription Management, Reimagined
            </div>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-center sm:text-left"
            style={{ color: theme.black }}
          >
            One platform for{' '}
            <span style={{ color: theme.orange }}>subscriptions</span>,
            invoicing &amp; payments
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl text-center sm:text-left" style={{ color: theme.muted }}>
            BrightLoop centralizes your entire subscription lifecycle — from quotations and billing to payment
            reconciliation and reporting — so your team never misses a renewal.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: theme.orange }}
            >
              Start Free Trial
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base border transition-all hover:bg-gray-50"
              style={{ color: theme.black, borderColor: theme.border }}
            >
              <Play className="h-4 w-4" style={{ color: theme.orange }} />
              See How It Works
            </a>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-6 text-sm" style={{ color: theme.muted }}>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 font-medium">4.9/5 Rating</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <span>Trusted by <strong style={{ color: theme.black }}>500+</strong> businesses</span>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <span><strong style={{ color: theme.black }}>\$12M+</strong> processed monthly</span>
          </div>
        </div>

        {/* Hero Visual — Dashboard Preview */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div
            className="rounded-2xl border shadow-2xl overflow-hidden"
            style={{ borderColor: theme.border, backgroundColor: theme.white }}
          >
            {/* Mock browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: theme.bgLight, backgroundColor: theme.bgSubtle }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="max-w-md mx-auto h-7 rounded-md flex items-center justify-center gap-2 px-3 text-xs font-medium"
                  style={{ backgroundColor: theme.white, color: theme.muted, border: `1px solid ${theme.border}` }}>
                  <Image
                    src="/logo.png"
                    alt="BrightLoop"
                    width={60}
                    height={18}
                    className="h-3.5 w-auto object-contain mix-blend-multiply"
                  />
                  <span>app.brightloop.io/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard Mock */}
            <div className="p-6 sm:p-8" style={{ backgroundColor: theme.bgSubtle }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Active Subscriptions', value: '1,247', trend: '+12%', icon: RefreshCw },
                  { label: 'Monthly Revenue', value: '\$84,320', trend: '+8.3%', icon: TrendingUp },
                  { label: 'Pending Invoices', value: '23', trend: '-5%', icon: Receipt },
                  { label: 'Customers', value: '892', trend: '+15%', icon: Users2 },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: theme.border }}>
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="h-4 w-4" style={{ color: theme.orange }} />
                      <span className="text-xs font-semibold text-emerald-600">{stat.trend}</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold" style={{ color: theme.black }}>{stat.value}</div>
                    <div className="text-xs mt-1" style={{ color: theme.muted }}>{stat.label}</div>
                  </div>
                ))}
              </div>
              {/* Revenue chart placeholder */}
              <div className="bg-white rounded-xl border p-5" style={{ borderColor: theme.border }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold" style={{ color: theme.black }}>Revenue Overview</span>
                  <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: theme.orangeLight, color: theme.orange }}>
                    Last 12 months
                  </span>
                </div>
                <div className="flex items-end gap-1.5 h-32">
                  {[40, 55, 45, 60, 52, 70, 65, 78, 72, 85, 80, 92].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md transition-all" style={{
                      height: `${h}%`,
                      backgroundColor: i === 11 ? theme.orange : theme.orangeLight,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Features Section ─────────────────────── */
function FeaturesSection() {
  const features = [
    {
      icon: Package,
      title: 'Product & Variant Catalog',
      description:
        'Manage products, add-ons, and variants with flexible pricing. Support base price adjustments per variant with full server-side validation.',
    },
    {
      icon: Layers,
      title: 'Flexible Plan Rules',
      description:
        'Configure billing intervals (daily, weekly, monthly, yearly), minimum quantities, lifecycle permissions, and auto-renewal rules per plan.',
    },
    {
      icon: FileCheck2,
      title: 'Quotations & Templates',
      description:
        'Create quotations from templates with validity periods. Convert accepted quotes to confirmed subscriptions in a single click.',
    },
    {
      icon: RefreshCw,
      title: 'Subscription Lifecycle',
      description:
        'Full lifecycle management — activate, pause, resume, renew, or close subscriptions with plan-enforced business rules.',
    },
    {
      icon: Receipt,
      title: 'Automated Invoicing',
      description:
        'Generate recurring invoices automatically based on billing schedules. Idempotent billing ensures zero duplicate invoices.',
    },
    {
      icon: CreditCard,
      title: 'Payment Tracking',
      description:
        'Record payments, allocate across invoices, and track outstanding balances. Full reconciliation workflow for complete financial clarity.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Dashboard',
      description:
        'Monitor active subscriptions, MRR, payments received, overdue invoices, and outstanding balances with live KPIs and charts.',
    },
    {
      icon: ShieldCheck,
      title: 'Role-based Access',
      description:
        'Three-tier roles: Administrator, Internal Staff, and Customer. Granular permissions enforced server-side on every API request.',
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description:
        'Password hashing with Argon2id/bcrypt, secure sessions, CSRF protection, rate limiting, and comprehensive audit logging.',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/logo.png"
              alt="BrightLoop Features"
              width={140}
              height={67}
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold border"
              style={{ backgroundColor: theme.orangeLight, color: theme.orange, borderColor: '#FFD6B3' }}
            >
              FEATURES
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ color: theme.black }}>
            Everything you need to manage subscriptions
          </h2>
          <p className="text-base sm:text-lg" style={{ color: theme.muted }}>
            From catalog setup to payment reconciliation, BrightLoop handles every step of your subscription business.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl border bg-white transition-all hover:shadow-lg hover:border-orange-200 hover:-translate-y-1"
              style={{ borderColor: theme.border }}
            >
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:scale-105"
                style={{ backgroundColor: theme.orangeLight }}
              >
                <feature.icon className="h-5 w-5" style={{ color: theme.orange }} />
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: theme.black }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── How It Works Section ─────────────────────── */
function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Set Up Your Catalog',
      description:
        'Define products, variants, and subscription plans with billing intervals and lifecycle rules. Configure taxes and discounts.',
      icon: Package,
    },
    {
      step: '02',
      title: 'Create Quotations',
      description:
        'Build quotations from templates, apply pricing rules, and send to customers. Accepted quotes convert into active subscriptions.',
      icon: FileCheck2,
    },
    {
      step: '03',
      title: 'Automate Billing',
      description:
        'BrightLoop generates recurring invoices on schedule. Track statuses from Draft → Confirmed → Paid with full audit trails.',
      icon: Receipt,
    },
    {
      step: '04',
      title: 'Track & Report',
      description:
        'Record payments, reconcile balances, and monitor your business with real-time dashboards, KPIs, and revenue metrics.',
      icon: BarChart3,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-6" style={{ backgroundColor: theme.bgSubtle }}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/logo.png"
              alt="BrightLoop Workflow"
              width={140}
              height={67}
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold border"
              style={{ backgroundColor: theme.orangeLight, color: theme.orange, borderColor: '#FFD6B3' }}
            >
              HOW IT WORKS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ color: theme.black }}>
            From setup to insights in four steps
          </h2>
          <p className="text-base sm:text-lg" style={{ color: theme.muted }}>
            BrightLoop streamlines your entire subscription workflow with a clear, structured process.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, i) => (
            <div key={item.step} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-40px)] h-px" style={{ backgroundColor: theme.border }} />
              )}
              <div className="text-center">
                <div className="relative inline-flex">
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto shadow-md"
                    style={{ backgroundColor: theme.white, border: `2px solid ${theme.orange}` }}
                  >
                    <item.icon className="h-7 w-7" style={{ color: theme.orange }} />
                  </div>
                  <span
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full text-[11px] font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: theme.orange }}
                  >
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold mt-5 mb-2" style={{ color: theme.black }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── CTA Section ─────────────────────── */
function CtaSection() {
  return (
    <section className="py-20 sm:py-28 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="rounded-3xl p-10 sm:p-16 relative overflow-hidden" style={{ backgroundColor: theme.black }}>
          {/* Decoration */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
            style={{ backgroundColor: theme.orange }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10"
            style={{ backgroundColor: theme.orange }}
          />

          <div className="relative">
            <div className="flex items-center justify-center sm:justify-start mb-6">
              <div className="inline-flex items-center bg-white px-5 py-2.5 rounded-2xl shadow-xl">
                <Image
                  src="/logo.png"
                  alt="BrightLoop Logo"
                  width={180}
                  height={86}
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4 text-center sm:text-left">
              Ready to streamline your subscriptions?
            </h2>
            <p className="text-base sm:text-lg mb-8 max-w-xl text-center sm:text-left" style={{ color: '#9CA3AF' }}>
              Join hundreds of businesses using BrightLoop to manage their entire subscription lifecycle. Start your free 14-day trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-base shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]"
                style={{ backgroundColor: theme.orange }}
              >
                Start Free Trial
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base text-white border border-white/20 transition-all hover:bg-white/10"
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Footer ─────────────────────── */
function Footer() {
  const footerLinks = {
    Product: ['Features', 'Dashboard', 'Integrations', 'Changelog'],
    Resources: ['Documentation', 'API Reference', 'Help Center', 'Status Page', 'Blog'],
    Company: ['About', 'Careers', 'Contact', 'Partners', 'Legal'],
  };

  return (
    <footer className="border-t px-6 py-16" style={{ borderColor: theme.border, backgroundColor: theme.white }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo.png"
                alt="BrightLoop Logo"
                width={180}
                height={86}
                className="h-11 sm:h-12 w-auto object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: theme.muted }}>
              Subscription management, simplified. Centralize billing, invoicing, and payments for your entire team.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: theme.black }}>
                {title}
              </div>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition-colors hover:text-[#FF6B00]"
                      style={{ color: theme.muted }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: theme.border }}>
          <p className="text-xs" style={{ color: theme.muted }}>
            © {new Date().getFullYear()} BrightLoop Software. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs transition-colors hover:text-[#FF6B00]" style={{ color: theme.muted }}>Privacy Policy</a>
            <a href="#" className="text-xs transition-colors hover:text-[#FF6B00]" style={{ color: theme.muted }}>Terms of Service</a>
            <a href="#" className="text-xs transition-colors hover:text-[#FF6B00]" style={{ color: theme.muted }}>Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────── Main Landing Page ─────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
      <Footer />
    </div>
  );
}

