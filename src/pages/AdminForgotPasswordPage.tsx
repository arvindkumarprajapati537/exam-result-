import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminForgotPasswordPageProps {
  onNavigate: (path: string) => void;
}

export const AdminForgotPasswordPage: React.FC<AdminForgotPasswordPageProps> = ({
  onNavigate,
}) => {
  const { requestPasswordReset, resetPasswordWithToken } = useAuth();

  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Password Policy Rules
  const hasMinLength = newPassword.length >= 10;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
  const isPolicySatisfied =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Step 1: Request Password Reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your administrator email address.');
      return;
    }

    setLoading(true);
    const res = await requestPasswordReset(cleanEmail);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(
        res.message ||
          'If an authorized administrator account exists for this email, password reset instructions have been generated.'
      );
      if (res.demoResetCode) {
        setResetCode(res.demoResetCode);
      }
      setStep('reset');
    } else {
      setError(res.error || 'Unable to process password reset request.');
    }
  };

  // Step 2: Submit New Password with Verification Code
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!resetCode.trim()) {
      setError('Please enter the 6-character reset verification code.');
      return;
    }

    if (!isPolicySatisfied) {
      setError('New password must satisfy all security policy requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New Password and Confirm New Password do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPasswordWithToken(
      email.trim(),
      resetCode.trim(),
      newPassword,
      confirmPassword
    );
    setLoading(false);

    if (res.success) {
      setSuccessMsg(
        res.message ||
          'Password has been reset successfully. Please log in with your new credentials.'
      );
      setTimeout(() => {
        onNavigate('/admin/login');
      }, 2000);
    } else {
      setError(res.error || 'Failed to reset password. The reset code may be invalid or expired.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-900/95">
      <div className="max-w-md w-full bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <button
            onClick={() => onNavigate('/admin/login')}
            className="text-xs text-slate-400 hover:text-amber-400 font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Login</span>
          </button>
          <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Account Recovery
          </span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-md font-black">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white font-serif tracking-tight">
            Admin Password Recovery
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {step === 'request'
              ? 'Enter the email address associated with your authorized Administrator account.'
              : 'Enter the verification code and configure your secure new password.'}
          </p>
        </div>

        {/* Success Message Banner */}
        {successMsg && (
          <div className="bg-emerald-950/90 text-emerald-200 text-xs p-4 rounded-xl border border-emerald-700 font-medium flex items-start gap-3 shadow-inner animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm text-emerald-100">Verification Notice</div>
              <p className="leading-relaxed">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/90 text-rose-200 text-xs p-3.5 rounded-xl border border-rose-700 font-medium flex items-start gap-2.5 shadow-inner animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* STEP 1: Request Reset */}
        {step === 'request' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-sm transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : (
                <>
                  Send Reset Instructions
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Reset Password Form */}
        {step === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Admin Account Email
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Reset Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={resetCode}
                  onChange={e => setResetCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A1B2C3"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm font-mono uppercase tracking-widest font-bold"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Valid for 15 minutes.
              </p>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter strong new password"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5 transition"
                  title={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Policy Requirements */}
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Password Security Requirements
              </span>
              <div className="grid grid-cols-1 gap-1 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${
                    hasMinLength ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {hasMinLength ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-slate-600" />
                  )}
                  <span>Min. 10 chars</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasUppercase && hasLowercase
                      ? 'text-emerald-400 font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  {hasUppercase && hasLowercase ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-slate-600" />
                  )}
                  <span>Uppercase (A-Z) & lowercase (a-z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasNumber && hasSpecialChar
                      ? 'text-emerald-400 font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  {hasNumber && hasSpecialChar ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-slate-600" />
                  )}
                  <span>Number (0-9) & special character (!@#$)</span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5 transition"
                  title={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && (
                <p
                  className={`text-[11px] mt-1.5 flex items-center gap-1 font-semibold ${
                    passwordsMatch ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Passwords match
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" /> Passwords do not match
                    </>
                  )}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !resetCode || !newPassword || !confirmPassword}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-sm transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  Resetting Password...
                </span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Reset Password & Continue
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-900">
          <button
            onClick={() => onNavigate('/admin/login')}
            className="hover:text-amber-400 transition cursor-pointer font-medium"
          >
            ← Return to Admin Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
