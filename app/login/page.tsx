'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/AppContext';
import { validatePasswordPolicy } from '@/lib/auth/password';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, showToast, users } = useApp();

  // Mode: 'signin' | 'signup' | 'forgot' | 'reset'
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>('signin');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live password validation
  const targetPassword = mode === 'reset' ? newPassword : password;
  const policyCheck = validatePasswordPolicy(targetPassword);

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid email or password. Please verify your credentials or create an account.');
        setIsLoading(false);
        return;
      }

      // Update AppContext user
      const loggedUser =
        users.find((u) => u.email.toLowerCase() === data.user.email.toLowerCase()) || data.user;
      setCurrentUser(loggedUser);

      setSuccessMessage(`Welcome back, ${data.user.name}! Redirecting to dashboard...`);
      showToast(`Logged in successfully as ${data.user.name}`, 'success');

      // Check URL search params for redirect
      const urlParams = new URLSearchParams(window.location.search);
      const targetUrl = urlParams.get('redirect') || '/dashboard';

      setTimeout(() => {
        router.push(targetUrl);
      }, 600);
    } catch {
      setErrorMessage('Network error communicating with the server. Please check your connection.');
      setIsLoading(false);
    }
  };

  // Handle Signup / Registration submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!policyCheck.isValid) {
      setErrorMessage(policyCheck.errors[0] || 'Password does not meet complexity requirements.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to create account.');
        setIsLoading(false);
        return;
      }

      setCurrentUser(data.user);
      setSuccessMessage(`Account created for ${cleanEmail}! Redirecting to dashboard...`);
      showToast(`Welcome to BrightLoop, ${data.user.name}!`, 'success');

      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    } catch {
      setErrorMessage('Network error during registration. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle Forgot Password submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setSuccessMessage(data.message);
        if (data.testAccountExists) {
          setTimeout(() => {
            setMode('reset');
            setSuccessMessage(null);
          }, 1500);
        }
      } else {
        setErrorMessage(data.error || 'Unable to process your request.');
      }
    } catch {
      setErrorMessage('Network error processing your request.');
      setIsLoading(false);
    }
  };

  // Handle Reset / Set New Password submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match. Please re-enter.');
      return;
    }

    if (!policyCheck.isValid) {
      setErrorMessage(policyCheck.errors[0] || 'Password does not meet complexity requirements.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setSuccessMessage('Your password has been securely updated. You can now sign in.');
        setPassword(newPassword);
        setTimeout(() => {
          setMode('signin');
          setSuccessMessage(null);
        }, 1200);
      } else {
        setErrorMessage(data.error || 'Password update failed.');
      }
    } catch {
      setErrorMessage('Network error updating password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#121212] flex flex-col justify-between selection:bg-[#FFF0E6] selection:text-[#FF6B00]">
      {/* Top Navbar */}
      <header className="w-full bg-[#FFFFFF] border-b border-[#DEE2E6] px-6 py-3.5">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="BrightLoop Logo"
              width={160}
              height={70}
              priority
              className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C757D] hover:text-[#FF6B00] transition-colors py-1.5 px-3 rounded-[8px] hover:bg-[#F8F9FA] border border-transparent hover:border-[#DEE2E6]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to website</span>
          </Link>
        </div>
      </header>

      {/* Main Container - Split View for Enterprise SaaS */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-[1020px] bg-[#FFFFFF] rounded-[16px] border border-[#DEE2E6] shadow-[0_10px_25px_rgba(0,0,0,0.07)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* Left Hero / Brand Column (5 Cols on Desktop) */}
          <div className="lg:col-span-5 bg-[#121212] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Brand Glow */}
            <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#FF6B00] opacity-20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-[#FF6B00] opacity-15 blur-3xl pointer-events-none" />

            {/* Top Brand Tag */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-[#FF6B00] border border-white/10 mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Subscription Management Cloud</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                Unified billing &amp; subscription operations.
              </h2>
              <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                Centralize your recurring revenue, customer contracts, quotations, and invoice lifecycle in real time.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="relative z-10 space-y-4 my-8">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#FF6B00]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#FF6B00]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Automated Recurring Billing</div>
                  <div className="text-[11px] text-gray-400">Idempotent cycle execution with zero invoice duplication.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#FF6B00]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#FF6B00]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Full Lifecycle Governance</div>
                  <div className="text-[11px] text-gray-400">Plan-enforced pause, resume, early close, and renewals.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#FF6B00]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#FF6B00]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Role-Based Access Security</div>
                  <div className="text-[11px] text-gray-400">Admin, staff, and customer portal boundary controls.</div>
                </div>
              </div>
            </div>

            {/* Security Assurance */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="h-4 w-4 text-[#FF6B00]" />
              <span>Enterprise-grade 256-bit encrypted authentication</span>
            </div>
          </div>

          {/* Right Form Column (7 Cols on Desktop) */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            
            {/* Form Title & Subtitle */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121212]">
                {mode === 'signin' && 'Sign in to your account'}
                {mode === 'signup' && 'Create your BrightLoop account'}
                {mode === 'forgot' && 'Reset your password'}
                {mode === 'reset' && 'Set a new password'}
              </h1>
              <p className="text-xs sm:text-sm text-[#6C757D] mt-1.5">
                {mode === 'signin' && 'Enter your email and password to access the platform.'}
                {mode === 'signup' && 'Register your company email to access the customer subscription portal.'}
                {mode === 'forgot' && 'Enter your email address and we will help you reset your password.'}
                {mode === 'reset' && 'Create a secure new password satisfying our complexity rules.'}
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-[8px] bg-[#FFF5F5] border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs animate-shake">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Success Notification */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-[8px] bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{successMessage}</div>
              </div>
            )}

            {/* Sign In Form */}
            {mode === 'signin' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#121212]">
                    Email Address <span className="text-[#FF6B00]">*</span>
                  </label>
                  <div className="relative rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6C757D]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      autoFocus
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="block w-full rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] pl-10 pr-3 py-2.5 text-sm text-[#121212] placeholder-[#6C757D]/50 focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#121212]">
                      Password <span className="text-[#FF6B00]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs font-semibold text-[#FF6B00] hover:text-[#E56000] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6C757D]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="block w-full rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] pl-10 pr-10 py-2.5 text-sm text-[#121212] placeholder-[#6C757D]/50 focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6C757D] hover:text-[#121212] transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center pt-1">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#DEE2E6] text-[#FF6B00] focus:ring-[#FF6B00] focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2.5 block text-xs font-medium text-[#121212] cursor-pointer">
                    Keep me signed in for 7 days
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 h-11 rounded-[8px] bg-[#FF6B00] hover:bg-[#E56000] active:bg-[#CC5500] text-[#FFFFFF] font-semibold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer hover:shadow-md"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in to Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Switch to Signup */}
                <div className="pt-3 text-center text-xs text-[#6C757D]">
                  Don&apos;t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="font-semibold text-[#FF6B00] hover:underline"
                  >
                    Create an account
                  </button>
                </div>
              </form>
            )}

            {/* Sign Up / Register Form */}
            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#121212]">
                    Full Name / Company Name <span className="text-[#FF6B00]">*</span>
                  </label>
                  <div className="relative rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6C757D]">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jane Doe / Acme Corp"
                      className="block w-full rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] pl-10 pr-3 py-2 text-sm text-[#121212] focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#121212]">
                    Email Address <span className="text-[#FF6B00]">*</span>
                  </label>
                  <div className="relative rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6C757D]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="block w-full rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] pl-10 pr-3 py-2 text-sm text-[#121212] focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#121212]">
                    Password <span className="text-[#FF6B00]">*</span>
                  </label>
                  <div className="relative rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6C757D]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 9 chars (upper, lower, special)"
                      className="block w-full rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] pl-10 pr-10 py-2 text-sm text-[#121212] focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6C757D]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Live Password Rules Checklist */}
                <div className="p-2.5 bg-[#F8F9FA] rounded-[8px] border border-[#DEE2E6] text-[11px] grid grid-cols-2 gap-1">
                  <div className={`flex items-center gap-1.5 ${policyCheck.requirements.minLength ? 'text-emerald-700 font-semibold' : 'text-[#6C757D]'}`}>
                    {policyCheck.requirements.minLength ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-[#6C757D]" />}
                    &gt; 8 characters
                  </div>
                  <div className={`flex items-center gap-1.5 ${policyCheck.requirements.hasUppercase ? 'text-emerald-700 font-semibold' : 'text-[#6C757D]'}`}>
                    {policyCheck.requirements.hasUppercase ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-[#6C757D]" />}
                    Uppercase letter
                  </div>
                  <div className={`flex items-center gap-1.5 ${policyCheck.requirements.hasLowercase ? 'text-emerald-700 font-semibold' : 'text-[#6C757D]'}`}>
                    {policyCheck.requirements.hasLowercase ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-[#6C757D]" />}
                    Lowercase letter
                  </div>
                  <div className={`flex items-center gap-1.5 ${policyCheck.requirements.hasSpecialChar ? 'text-emerald-700 font-semibold' : 'text-[#6C757D]'}`}>
                    {policyCheck.requirements.hasSpecialChar ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-[#6C757D]" />}
                    Special character
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={isLoading || !policyCheck.isValid}
                  className="w-full mt-2 h-11 rounded-[8px] bg-[#FF6B00] hover:bg-[#E56000] active:bg-[#CC5500] text-[#FFFFFF] font-semibold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Back to Sign In */}
                <div className="pt-2 text-center text-xs text-[#6C757D]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="font-semibold text-[#FF6B00] hover:underline"
                  >
                    Sign in here
                  </button>
                </div>
              </form>
            )}

            {/* Forgot Password Mode */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#121212]">
                    Registered Email Address <span className="text-[#FF6B00]">*</span>
                  </label>
                  <div className="relative rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6C757D]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="block w-full rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] pl-10 pr-3 py-2.5 text-sm text-[#121212] focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="flex-1 h-10 px-4 rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#121212] font-semibold text-xs transition-colors"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-10 px-4 rounded-[8px] bg-[#FF6B00] hover:bg-[#E56000] text-[#FFFFFF] font-semibold text-xs transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}

            {/* Reset Password Mode */}
            {mode === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#121212]">
                    New Password <span className="text-[#FF6B00]">*</span>
                  </label>
                  <div className="relative rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6C757D]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 9 chars with upper, lower, & special"
                      className="block w-full rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] pl-10 pr-10 py-2.5 text-sm text-[#121212] focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6C757D]"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#121212]">
                    Confirm New Password <span className="text-[#FF6B00]">*</span>
                  </label>
                  <div className="relative rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6C757D]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="block w-full rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] pl-10 pr-3 py-2.5 text-sm text-[#121212] focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password Policy Badge List */}
                <div className="p-3 bg-[#F8F9FA] rounded-[8px] border border-[#DEE2E6] text-xs space-y-1">
                  <div className="font-semibold text-[#121212] mb-1">Password Requirements:</div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${policyCheck.requirements.minLength ? 'text-emerald-700 font-semibold' : 'text-[#6C757D]'}`}>
                      {policyCheck.requirements.minLength ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-[#6C757D]" />}
                      &gt; 8 characters
                    </div>
                    <div className={`flex items-center gap-1.5 ${policyCheck.requirements.hasUppercase ? 'text-emerald-700 font-semibold' : 'text-[#6C757D]'}`}>
                      {policyCheck.requirements.hasUppercase ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-[#6C757D]" />}
                      Uppercase letter
                    </div>
                    <div className={`flex items-center gap-1.5 ${policyCheck.requirements.hasLowercase ? 'text-emerald-700 font-semibold' : 'text-[#6C757D]'}`}>
                      {policyCheck.requirements.hasLowercase ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-[#6C757D]" />}
                      Lowercase letter
                    </div>
                    <div className={`flex items-center gap-1.5 ${policyCheck.requirements.hasSpecialChar ? 'text-emerald-700 font-semibold' : 'text-[#6C757D]'}`}>
                      {policyCheck.requirements.hasSpecialChar ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-[#6C757D]" />}
                      Special character
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage(null);
                    }}
                    className="flex-1 h-10 px-4 rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#121212] font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !policyCheck.isValid}
                    className="flex-1 h-10 px-4 rounded-[8px] bg-[#FF6B00] hover:bg-[#E56000] text-[#FFFFFF] font-semibold text-xs shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : 'Set Password'}
                  </button>
                </div>
              </form>
            )}

            {/* Support / Help */}
            <div className="mt-8 pt-6 border-t border-[#DEE2E6] text-center text-xs text-[#6C757D]">
              Having trouble logging in? Contact your organization administrator or{' '}
              <a href="mailto:support@brightloop.io" className="text-[#FF6B00] hover:underline font-medium">
                support@brightloop.io
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#FFFFFF] border-t border-[#DEE2E6] py-3 text-center text-xs text-[#6C757D]">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Brightloop Software Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#121212] cursor-pointer">Security Policy</span>
            <span className="hover:text-[#121212] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#121212] cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
