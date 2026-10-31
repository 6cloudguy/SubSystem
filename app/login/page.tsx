'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { validatePasswordPolicy } from '@/lib/auth/password';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, showToast, users } = useApp();

  // Mode: 'signin' | 'forgot' | 'reset'
  const [mode, setMode] = useState<'signin' | 'forgot' | 'reset'>('signin');

  // Form states
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

  // Password policy live validation for reset / new password
  const policyCheck = validatePasswordPolicy(mode === 'reset' ? newPassword : password);

  // Quick fill demo personas
  const fillCredentials = (personaEmail: string, personaPass: string) => {
    setEmail(personaEmail);
    setPassword(personaPass);
    setErrorMessage(null);
  };

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Authentication failed. Please verify your credentials.');
        setIsLoading(false);
        return;
      }

      // Update AppContext user
      const loggedUser = users.find((u) => u.email.toLowerCase() === data.user.email.toLowerCase()) || data.user;
      setCurrentUser(loggedUser);

      setSuccessMessage(`Welcome back, ${data.user.name}! Redirecting to dashboard...`);
      showToast(`Logged in successfully as ${data.user.name} (${data.user.role})`, 'success');

      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    } catch (err: any) {
      setErrorMessage('Network error communicating with authentication service.');
      setIsLoading(false);
    }
  };

  // Handle Forgot Password submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setSuccessMessage(data.message);
        // If test account exists, allow directly transitioning to set new password
        if (data.testAccountExists) {
          setTimeout(() => setMode('reset'), 1500);
        }
      } else {
        setErrorMessage(data.error || 'Failed to request password reset.');
      }
    } catch {
      setErrorMessage('Network error during reset request.');
      setIsLoading(false);
    }
  };

  // Handle Reset Password submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please fill in both new password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
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
        setSuccessMessage('Password has been securely hashed and updated in the database! You can now sign in.');
        setPassword(newPassword);
        setTimeout(() => {
          setMode('signin');
        }, 1500);
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
      {/* Top Navigation Bar - Crisp Minimal Orange */}
      <header className="w-full bg-[#FFFFFF] border-b border-[#DEE2E6] px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-[8px] bg-[#FF6B00] flex items-center justify-center text-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-[#121212] tracking-tight text-base block leading-none">
                Brightloop
              </span>
              <span className="text-[11px] font-semibold text-[#6C757D] uppercase tracking-wider block mt-0.5">
                Subscription Operations
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C757D] hover:text-[#FF6B00] transition-colors py-1 px-2.5 rounded-lg hover:bg-[#F8F9FA]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF0E6] text-[#FF6B00] border border-[#FF6B00]/20">
              <span className="h-2 w-2 rounded-full bg-[#FF6B00] animate-pulse" />
              Crisp Minimal Orange
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[480px]">
          {/* Main Login / Auth Card */}
          <div className="bg-[#FFFFFF] rounded-[12px] border border-[#DEE2E6] shadow-[0_4px_6px_rgba(0,0,0,0.07)] p-6 sm:p-8">
            {/* Header / Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-[10px] bg-[#FFF0E6] text-[#FF6B00] mb-3">
                {mode === 'signin' ? (
                  <Lock className="h-6 w-6" />
                ) : mode === 'forgot' ? (
                  <Mail className="h-6 w-6" />
                ) : (
                  <KeyRound className="h-6 w-6" />
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#121212]">
                {mode === 'signin' && 'Sign in to Brightloop'}
                {mode === 'forgot' && 'Reset your password'}
                {mode === 'reset' && 'Create new password'}
              </h1>
              <p className="text-sm text-[#6C757D] mt-1.5">
                {mode === 'signin' && 'Enter your credentials to access your billing and subscription dashboard.'}
                {mode === 'forgot' && 'Enter your registered email address to receive password reset instructions.'}
                {mode === 'reset' && 'Choose a strong password with bcrypt hashing stored in the database.'}
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-[8px] bg-[#FFF5F5] border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-[8px] bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{successMessage}</div>
              </div>
            )}

            {/* Sign In Form */}
            {mode === 'signin' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#121212] tracking-wide">
                    Email Address <span className="text-[#FF6B00]">*</span>
                  </label>
                  <div className="relative rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6C757D]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sarah.admin@brightloop.io"
                      className="block w-full rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] pl-9 pr-3 py-2.5 text-sm text-[#121212] placeholder-[#6C757D]/60 focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#121212] tracking-wide">
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
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6C757D]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="block w-full rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] pl-9 pr-10 py-2.5 text-sm text-[#121212] placeholder-[#6C757D]/60 focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6C757D] hover:text-[#121212] transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded-[4px] border-[#DEE2E6] text-[#FF6B00] focus:ring-[#FF6B00]/20 focus:ring-2"
                    />
                    <span className="text-xs text-[#6C757D] font-medium">Keep me signed in for 7 days</span>
                  </label>
                </div>

                {/* Submit Button - Crisp Minimal Orange Secondary Base */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 h-11 px-4 rounded-[8px] bg-[#FF6B00] hover:bg-[#E56000] active:bg-[#CC5500] text-[#FFFFFF] font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all disabled:opacity-50 disabled:pointer-events-none select-none"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Forgot Password Form */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#121212] tracking-wide">
                    Registered Email Address <span className="text-[#FF6B00]">*</span>
                  </label>
                  <div className="relative rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6C757D]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sarah.admin@brightloop.io"
                      className="block w-full rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] pl-9 pr-3 py-2.5 text-sm text-[#121212] placeholder-[#6C757D]/60 focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
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
                    className="flex-1 h-10 px-4 rounded-[8px] bg-[#FF6B00] hover:bg-[#E56000] active:bg-[#CC5500] text-[#FFFFFF] font-semibold text-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}

            {/* Reset / Set New Password Form */}
            {mode === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#121212] tracking-wide">
                    New Password <span className="text-[#FF6B00]">*</span>
                  </label>
                  <div className="relative rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6C757D]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 9 characters, upper, lower, special"
                      className="block w-full rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] pl-9 pr-10 py-2.5 text-sm text-[#121212] focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6C757D]"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#121212] tracking-wide">
                    Confirm New Password <span className="text-[#FF6B00]">*</span>
                  </label>
                  <div className="relative rounded-[8px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6C757D]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="block w-full rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] pl-9 pr-3 py-2.5 text-sm text-[#121212] focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password Policy Requirements Card per Section 2.1 */}
                <div className="p-3 bg-[#F1F3F5] rounded-[8px] border border-[#DEE2E6] text-xs space-y-1.5">
                  <div className="font-semibold text-[#121212] mb-1">Password Policy Requirements:</div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
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
                    className="flex-1 h-10 px-4 rounded-[8px] bg-[#FF6B00] hover:bg-[#E56000] active:bg-[#CC5500] text-[#FFFFFF] font-semibold text-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Updating Hash...' : 'Update & Hash Password'}
                  </button>
                </div>
              </form>
            )}

            {/* Quick Demo Accounts Helper (Section 3.3 Dev Environment) */}
            <div className="mt-8 pt-6 border-t border-[#DEE2E6]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider">
                  Development Demo Accounts
                </span>
                <span className="text-[10px] bg-[#F1F3F5] text-[#121212] px-2 py-0.5 rounded-full font-mono border border-[#DEE2E6]">
                  bcrypt hashed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Admin Persona */}
                <button
                  type="button"
                  onClick={() => fillCredentials('sarah.admin@brightloop.io', 'Admin@BrightLoop2026!')}
                  className="p-2.5 rounded-[8px] border border-[#DEE2E6] hover:border-[#FF6B00] hover:bg-[#FFF0E6]/30 bg-[#FFFFFF] text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#121212] group-hover:text-[#FF6B00]">
                      Sarah Connor
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700">
                      Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6C757D] truncate mt-1">sarah.admin@brightloop.io</p>
                  <p className="text-[10px] font-mono text-[#6C757D] mt-0.5 truncate">Pass: Admin@BrightLoop2026!</p>
                </button>

                {/* Staff Persona */}
                <button
                  type="button"
                  onClick={() => fillCredentials('alex.rivera@brightloop.io', 'Staff@BrightLoop2026!')}
                  className="p-2.5 rounded-[8px] border border-[#DEE2E6] hover:border-[#FF6B00] hover:bg-[#FFF0E6]/30 bg-[#FFFFFF] text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#121212] group-hover:text-[#FF6B00]">
                      Alex Rivera
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700">
                      Staff
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6C757D] truncate mt-1">alex.rivera@brightloop.io</p>
                  <p className="text-[10px] font-mono text-[#6C757D] mt-0.5 truncate">Pass: Staff@BrightLoop2026!</p>
                </button>
              </div>

              <p className="text-[11px] text-[#6C757D] text-center mt-3">
                Click any persona above to auto-fill credentials meeting the password policy.
              </p>
            </div>
          </div>

          {/* Security & System Info Footer */}
          <div className="mt-6 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#6C757D]">
              <ShieldCheck className="h-4 w-4 text-[#FF6B00]" />
              <span>Password security: bcrypt work factor 10 &bull; HttpOnly session cookies</span>
            </div>
            <p className="text-[11px] text-[#6C757D]">
              Brightloop Subscription Management System &bull; Design v2.0
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#FFFFFF] border-t border-[#DEE2E6] py-3 text-center text-xs text-[#6C757D]">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Brightloop Software Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#121212] cursor-pointer">Security Policy</span>
            <span className="hover:text-[#121212] cursor-pointer">PostgreSQL Access</span>
            <span className="hover:text-[#121212] cursor-pointer">Help &amp; Documentation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
