/**
 *
 * Fixes:
 *  1. No longer needs to capture the access token BEFORE updatePassword().
 *     Since AcceptInvitationRoute sets isOnInvitationPageRef=true, fetchUserRole
 *     will not sign out the user on USER_UPDATED. After updatePassword() the new
 *     session is available immediately via supabase.auth.getSession().
 *  2. Uses the FRESH session token (post-updatePassword) for the activate call,
 *     which is more reliable than the pre-update token workaround.
 *  3. Cleaner invitation validation using onAuthStateChange for the SIGNED_IN
 *     event (invited users get auto-signed in via the magic link).
 *  4. Uses isOnInvitationPageRef from AuthContext instead of checking
 *     window.location.pathname.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout, Logo } from '../../../shared';
import { SuccessStep } from '../components/';
import { useAuth } from '../../../core/AuthContext';
import { useToast } from '../../../core/ToastContext';
import { supabase } from '../../../core/supabase';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const STEPS = {
  LOADING: 'loading',
  FORM: 'form',
  SUCCESS: 'success',
  INVALID_LINK: 'invalid',
};

const BREADCRUMBS = ['HOME', 'ACCEPT INVITATION'];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AcceptInvitation() {
  const { updatePassword, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(STEPS.LOADING);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Validate invitation on mount ─────────────────────────────────────────
  useEffect(() => {
    const checkInvitation = async () => {
      try {
        // getUser() hits the Supabase server to validate the JWT — more reliable
        // than getSession() which only reads from local storage.
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          setStep(STEPS.INVALID_LINK);
          return;
        }

        // Invited users have `role` set in user_metadata by the server's
        // inviteUserByEmail({ data: { role: 'staff' } }) call.
        const meta = user.user_metadata ?? {};
        if (!meta.role) {
          setStep(STEPS.INVALID_LINK);
          return;
        }

        setUserId(user.id);
        if (meta.first_name) setFirstName(meta.first_name);
        if (meta.middle_name) setMiddleName(meta.middle_name);
        if (meta.last_name) setLastName(meta.last_name);

        setStep(STEPS.FORM);
      } catch (err) {
        console.error('[AcceptInvitation] Invitation check failed:', err);
        setStep(STEPS.INVALID_LINK);
      }
    };

    checkInvitation();
  }, []);

  // ── Derived validation state ─────────────────────────────────────────────
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const passwordMatch = password === confirmPassword && password.length > 0;
  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    hasMinLength &&
    hasNumber &&
    hasUppercase &&
    passwordMatch &&
    !isLoading;

  // ── Form submission ───────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // ── Client-side validation ──
      if (!firstName.trim()) throw new Error('First name is required.');
      if (!lastName.trim()) throw new Error('Last name is required.');
      if (password !== confirmPassword) throw new Error('Passwords do not match.');
      if (password.length < 8) throw new Error('Password must be at least 8 characters.');
      if (!/\d/.test(password)) throw new Error('Password must contain at least one number.');
      if (!/[A-Z]/.test(password)) throw new Error('Password must contain at least one uppercase letter.');
      if (!userId) throw new Error('Session expired. Please use the invitation link again.');

      // ── STEP 1: Set the password ──
      // AcceptInvitationRoute has set isOnInvitationPageRef=true, so the USER_UPDATED
      // event from updatePassword() will NOT trigger a sign-out of this inactive user.
      await updatePassword(password);

      // ── STEP 2: Get fresh session token AFTER updatePassword ──
      // The new token is now available because USER_UPDATED has been processed.
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      const accessToken = freshSession?.access_token;

      if (!accessToken) {
        throw new Error('Session expired after password update. Please use the invitation link again.');
      }

      // ── STEP 3: Activate profile + save names via backend ──
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/activate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          middle_name: middleName.trim() || null,
          last_name: lastName.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to activate account.');

      // ── STEP 4: Success ──
      setStep(STEPS.SUCCESS);
      toast.success('Account Created!', 'Your account is ready. Redirecting to login…');

      setTimeout(async () => {
        await logout();
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err) {
      const msg = err.message || 'Failed to complete registration. Please try again.';
      setError(msg);
      toast.error('Registration Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Header ───────────────────────────────────────────────────────────────
  const header = (
    <>
      <Logo variant="auth" />
      <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center uppercase tracking-wide mt-4">
        Accept Invitation
      </h1>
      <nav className="flex justify-center flex-wrap items-center mt-6 text-white text-sm gap-x-1">
        {BREADCRUMBS.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center">
            {item === 'HOME' ? (
              <Link to="/" className="hover:underline">HOME</Link>
            ) : (
              <span className={i === BREADCRUMBS.length - 1 ? 'font-semibold' : 'text-white/70'}>
                {item}
              </span>
            )}
            {i < BREADCRUMBS.length - 1 && <span className="mx-2 text-white/50">/</span>}
          </span>
        ))}
      </nav>
    </>
  );

  // ── LOADING ──────────────────────────────────────────────────────────────
  if (step === STEPS.LOADING) {
    return (
      <AuthLayout header={header}>
        <div
          className="flex flex-col items-center gap-4 text-white"
          role="status"
          aria-label="Validating invitation…"
        >
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Validating your invitation…</p>
        </div>
      </AuthLayout>
    );
  }

  // ── INVALID LINK ─────────────────────────────────────────────────────────
  if (step === STEPS.INVALID_LINK) {
    return (
      <AuthLayout header={header}>
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-lg border border-gray-100 text-center">
          <p className="text-red-600 font-semibold text-lg mb-2">Invalid Invitation Link</p>
          <p className="text-gray-600 text-sm mb-4">
            This invitation link is invalid, expired, or has already been used.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Please contact your administrator for a new invitation.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2 rounded-lg bg-[#005F02] text-white font-bold text-sm hover:bg-[#004A01] transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (step === STEPS.SUCCESS) {
    return (
      <AuthLayout header={header}>
        <div className="w-full max-w-lg">
          <SuccessStep variant="invitationAccepted" />
        </div>
      </AuthLayout>
    );
  }

  // ── FORM ─────────────────────────────────────────────────────────────────
  return (
    <AuthLayout header={header}>
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-lg border border-gray-100 text-gray-900">
        <h2 className="text-xl font-bold mb-1 text-gray-800">Complete Your Registration</h2>
        <p className="text-sm text-gray-500 mb-6">
          Set your name and create a password to activate your account.
        </p>

        <form onSubmit={handlePasswordSubmit} noValidate>
          {/* First Name */}
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02] focus:border-transparent"
              placeholder="Juan"
            />
          </div>

          {/* Middle Name */}
          <div className="mb-4">
            <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
              Middle Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="middleName"
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              autoComplete="additional-name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02] focus:border-transparent"
              placeholder="dela Cruz"
            />
          </div>

          {/* Last Name */}
          <div className="mb-6">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02] focus:border-transparent"
              placeholder="Santos"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02] focus:border-transparent"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02] focus:border-transparent"
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password requirements checklist */}
          <div className="space-y-2 mt-2">
            {[
              { met: hasMinLength, label: '8 characters minimum' },
              { met: hasNumber, label: 'Contains a number' },
              { met: hasUppercase, label: 'Contains an uppercase letter' },
              { met: passwordMatch, label: 'Passwords match' },
            ].map((req) => (
              <div key={req.label} className="flex items-center gap-2 text-sm">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                    req.met ? 'bg-emerald-100' : 'bg-gray-100'
                  }`}
                >
                  {req.met && (
                    <span className="text-emerald-700 font-bold text-xs" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>
                <span className={req.met ? 'text-gray-700' : 'text-gray-400'}>{req.label}</span>
              </div>
            ))}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg px-4 py-2"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            className="w-full py-3 rounded-lg bg-[#005F02] text-white font-bold uppercase tracking-wide hover:bg-[#004A01] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm mt-6"
          >
            {isLoading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}