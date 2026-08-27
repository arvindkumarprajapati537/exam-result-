import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminChangePasswordPageProps {
  onNavigate: (path: string) => void;
}

export const AdminChangePasswordPage: React.FC<AdminChangePasswordPageProps> = ({
  onNavigate,
}) => {
  const { user, changeAdminPassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Guard: Only authenticated Admin can access this page
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto text-rose-600 shadow-sm border border-rose-200">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 font-serif tracking-tight">
            Access Denied
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            You are not authorized to access this page.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/admin/login')}
          className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-sm transition shadow-md cursor-pointer inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    );
  }

  // Password Policy Rules
  const hasMinLength = newPassword.length >= 10;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
  const isPolicySatisfied =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword.trim()) {
      setError('Please enter your current password.');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
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

    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    const res = await changeAdminPassword(currentPassword, newPassword, confirmPassword);
    setLoading(false);

    if (res.success) {
      setSuccess(
        res.message ||
          'Password changed successfully! You must now log in with your new password.'
      );
      // Wait briefly then redirect to login
      setTimeout(() => {
        onNavigate('/admin/login');
      }, 2000);
    } else {
      setError(res.error || 'Failed to change password. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-900/95">
      <div className="max-w-lg w-full bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <button
            onClick={() => onNavigate('/admin/dashboard')}
            className="text-xs text-slate-400 hover:text-amber-400 font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Admin Security
          </span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-md font-black">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white font-serif tracking-tight">
            Change Admin Password
          </h1>
          <p className="text-xs text-slate-400">
            Update your administrator credentials for account{' '}
            <span className="text-amber-400 font-semibold">{user.email}</span>
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-emerald-950/90 text-emerald-200 text-xs p-4 rounded-xl border border-emerald-700 font-medium flex items-start gap-3 shadow-inner animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm text-emerald-100">Password Changed Successfully</div>
              <p className="leading-relaxed">{success}</p>
              <p className="text-[11px] text-emerald-300 font-semibold pt-1">
                Redirecting to Admin Login...
              </p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter existing admin password"
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5 transition"
                title={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
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
                placeholder="Enter strong new password (min. 10 chars)"
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

          {/* Password Policy Checklist Box */}
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800/90 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Security Policy Requirements
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              <div
                className={`flex items-center gap-1.5 ${
                  hasMinLength ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                }`}
              >
                {hasMinLength ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                )}
                <span>Minimum 10 characters</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  hasUppercase ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                }`}
              >
                {hasUppercase ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                )}
                <span>One uppercase letter (A-Z)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  hasLowercase ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                }`}
              >
                {hasLowercase ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                )}
                <span>One lowercase letter (a-z)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                }`}
              >
                {hasNumber ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                )}
                <span>One number (0-9)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 sm:col-span-2 ${
                  hasSpecialChar ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                }`}
              >
                {hasSpecialChar ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                )}
                <span>One special character (!@#$%^&*...)</span>
              </div>
            </div>
          </div>

          {/* Confirm New Password */}
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

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-sm transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                Updating Password...
              </span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Change Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
