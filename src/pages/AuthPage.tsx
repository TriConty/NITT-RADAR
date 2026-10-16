/**
 * src/pages/AuthPage.tsx
 *
 * NIT Trichy Campus Event Discovery Authentication:
 * - Real Student Sign Up with NITT Email Intelligence:
 *   • Auto-detects department, batch, and degree from 9-digit roll number (e.g., 106123085 -> CSE '27)
 *   • Simulated 6-digit Webmail OTP verification flow
 * - Clean student-facing login
 * - HIDDEN DEMO ACCOUNT VAULT (known only to you / evaluator mode)
 *   • Accessible via secret evaluator trigger in top right or footer
 *   • 1-Click access to Student, Organizer (Spider), Ambassador, and Admin (Dean SAC) personas
 */

import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Building2,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Inbox,
  Send,
  Zap,
} from 'lucide-react';
import { UserRole, Club } from '../types';
import { THEME } from '../theme';
import { parseNittEmail } from '../utils/nittEmailUtils';
import { requestSignupOtp, verifySignupOtp, getSecretDemoAccounts } from '../services/api';

interface AuthPageProps {
  clubs: Club[];
  onLogin: (email: string) => Promise<void>;
  onDemoLogin: (role: UserRole) => Promise<void>;
  onSignup: (data: {
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    clubId?: string;
    interests?: string[];
  }) => Promise<void>;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  clubs,
  onLogin,
  onDemoLogin,
  onSignup,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState<'details' | 'otp'>('details');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [clubId, setClubId] = useState(clubs[0]?.id || 'club-spider');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Coding', 'Hackathons']);

  // OTP State
  const [enteredOtp, setEnteredOtp] = useState('');
  const [activeOtp, setActiveOtp] = useState<string | null>(null);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  // Error & Loading States
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // HIDDEN DEMO VAULT (known only to you)
  const [showDemoVault, setShowDemoVault] = useState(false);
  const secretDemos = useMemo(() => getSecretDemoAccounts(), []);

  // Parse NITT email for real-time roll number and department recognition
  const emailDetails = useMemo(() => parseNittEmail(email), [email]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const normalized = email.trim().toLowerCase();
    if (!normalized.endsWith('@nitt.edu')) {
      setErrorMsg('Access restricted: Please enter an official @nitt.edu campus email.');
      return;
    }

    try {
      setLoading(true);
      await onLogin(normalized);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP to @nitt.edu Webmail
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const normalized = email.trim().toLowerCase();
    if (!normalized.endsWith('@nitt.edu')) {
      setErrorMsg('Registration requires an active @nitt.edu campus address.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    try {
      setLoading(true);
      const res = await requestSignupOtp(normalized, name);
      setActiveOtp(res.otp);
      setOtpNotice(`6-digit verification code sent to ${normalized}`);
      setSignupStep('otp');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and finalize signup
  const handleVerifyOtpAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      await verifySignupOtp(email.trim(), enteredOtp);

      // Successfully verified! Create user account
      await onSignup({
        name,
        email: email.trim().toLowerCase(),
        role,
        department: emailDetails.department || 'NIT Trichy',
        clubId: role === 'organizer' ? clubId : undefined,
        interests: role === 'student' ? selectedInterests : undefined,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillOtp = () => {
    if (activeOtp) {
      setEnteredOtp(activeOtp);
    }
  };

  const handleDemoClick = async (demoRole: UserRole) => {
    try {
      setLoading(true);
      setErrorMsg('');
      await onDemoLogin(demoRole);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-3 sm:p-4 max-w-2xl mx-auto w-full">
      {/* Top Header with Discreet Hidden Demo Trigger */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#0F2B5C] flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
            NIT
          </div>
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            National Institute of Technology, Tiruchirappalli
          </span>
        </div>

        {/* SECRET EVALUATOR ACCESS BUTTON (known only to you) */}
        <button
          onClick={() => setShowDemoVault(!showDemoVault)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
            showDemoVault
              ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title="Secret Evaluator Portal"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Evaluator Mode</span>
        </button>
      </div>

      {/* HIDDEN DEMO ACCOUNT VAULT PANEL (Revealed when clicked) */}
      {showDemoVault && (
        <div className="w-full mb-6 p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300">
                <Zap className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-white">
                  Hidden Demo Account Vault (Evaluator Access)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Hidden from public students. Click any persona to test its dashboard in 1 click:
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDemoVault(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md"
            >
              Hide
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {secretDemos.map((demo) => (
              <button
                key={demo.role}
                onClick={() => handleDemoClick(demo.role)}
                disabled={loading}
                className="text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-xs text-white truncate">{demo.name}</span>
                    <span className="text-[10px] text-amber-300 font-semibold">{demo.badge}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate mt-0.5">{demo.email}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{demo.tagline}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN AUTHENTICATION CARD */}
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Card Header & Brand */}
        <div className="p-6 bg-gradient-to-r from-[#0F2B5C] to-[#1E3A8A] text-white space-y-1 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">{THEME.appName}</h1>
          <p className="text-xs text-blue-200">
            Push over pull • Relevance over volume • Deadline first
          </p>
        </div>

        {/* Tab Toggle: Student Login vs Sign Up */}
        <div className="px-6 pt-6">
          <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
            >
              Sign In with Webmail
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setSignupStep('details');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
            >
              Student Sign Up
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ==================== LOGIN FORM ==================== */}
          {mode === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NIT Trichy Webmail Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. 106123085@nitt.edu or priya.sharma@nitt.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>
                {emailDetails.isValidNittEmail && emailDetails.isRollNumber && (
                  <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {emailDetails.department} • {emailDetails.academicYear}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Signing in...' : 'Sign In with @nitt.edu'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ==================== SIGN UP FORM ==================== */}
          {mode === 'signup' && signupStep === 'details' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NITT Webmail / Roll Number Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. 106123085@nitt.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Real-time Department & Academic Year Detection */}
                {emailDetails.isValidNittEmail && emailDetails.isRollNumber && (
                  <div className="mt-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-0.5">
                    <p className="font-bold flex items-center space-x-1">
                      <span>✨ Department Auto-Detected:</span>
                    </p>
                    <p className="text-[11px] text-blue-800">
                      <strong>{emailDetails.department}</strong> ({emailDetails.degree}) •{' '}
                      {emailDetails.academicYear} • {emailDetails.batchYear}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Select Top Interests */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Initial Interests (Unlocks Top Picks)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50">
                  {THEME.interests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        selectedInterests.includes(interest)
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      #{interest}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>
                  {loading ? 'Sending Code...' : 'Send 6-Digit Code to @nitt.edu'}
                </span>
              </button>
            </form>
          )}

          {/* ==================== OTP VERIFICATION STEP ==================== */}
          {mode === 'signup' && signupStep === 'otp' && (
            <form onSubmit={handleVerifyOtpAndSignup} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                  <Inbox className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-slate-900">Check Your NITT Webmail</h2>
                <p className="text-xs text-slate-500">
                  We dispatched a 6-digit verification code to{' '}
                  <strong className="text-slate-800">{email}</strong>
                </p>
              </div>

              {/* SIMULATED WEBMAIL CODE NOTIFICATION CALLOUT */}
              {activeOtp && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-amber-800 uppercase tracking-wider flex items-center space-x-1">
                      <span>📨 Simulated Webmail Inbox</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleAutofillOtp}
                      className="px-2.5 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-2xs transition-colors"
                    >
                      Autofill OTP ({activeOtp})
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Subject: <code>[NITT Webmail Auth] 🔒 Verification Code: {activeOtp}</code>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.5em] font-mono text-xl sm:text-2xl py-3 rounded-xl border border-slate-300 font-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSignupStep('details')}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                >
                  Edit Email
                </button>
                <button
                  type="submit"
                  disabled={loading || enteredOtp.length !== 6}
                  className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Enter Feed'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Office of Dean (Students Welfare), SAC Building</span>
          <span className="font-semibold text-slate-400">NIT Trichy Portal</span>
        </div>
      </div>
    </div>
  );
};
