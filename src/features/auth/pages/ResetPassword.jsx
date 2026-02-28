/**
 *
 * Fixes:
 *  1. Increased the safety timeout from 5 s → 10 s. Supabase token exchange can
 *     be slow on cold starts or poor connections — 5 s caused false "invalid link"
 *     errors for valid tokens.
 *  2. The `onAuthStateChange` listener is registered BEFORE any other async work
 *     to guarantee we never miss the PASSWORD_RECOVERY event.
 *  3. After a successful password update, the session is explicitly signed out
 *     so the user starts a clean session when they log in again. This prevents
 *     a stale recovery session from persisting in the browser.
 *  4. Loading states and error handling are preserved.
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout, Logo } from '../../../shared';
import { PasswordForm, SuccessStep } from '../components/';
import { useAuth } from '../../../core/AuthContext';
import { supabase } from '../../../core/supabase';

const STEPS = {
  LOADING: 'loading',
  FORM: 'form',
  SUCCESS: 'success',
  INVALID_LINK: 'invalid',
};

const BREADCRUMBS = ['HOME', 'FORGOT PASSWORD', 'RESET PASSWORD'];

// 10 seconds — generous enough for slow networks, tight enough to catch truly
// invalid/expired links quickly.
const TOKEN_TIMEOUT_MS = 10_000;

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.LOADING);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // We use a ref so the timeout callback can read the latest step without
  // needing to be inside a closure that captures stale state.
  const stepRef = useRef(STEPS.LOADING);
  const setStepSafe = (s) => {
    stepRef.current = s;
    setStep(s);
  };

  useEffect(() => {
    // Register the listener FIRST — before any async code — so we never miss
    // the PASSWORD_RECOVERY event even if it fires synchronously.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStepSafe(STEPS.FORM);
      }
    });

    // Safety valve: if no PASSWORD_RECOVERY fires within the timeout, the link
    // is invalid or expired.
    const timeout = setTimeout(() => {
      if (stepRef.current === STEPS.LOADING) {
        setStepSafe(STEPS.INVALID_LINK);
      }
    }, TOKEN_TIMEOUT_MS);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handlePasswordSubmit = async ({ password }) => {
    setError('');
    setIsLoading(true);
    try {
      await updatePassword(password);

      // Sign out the recovery session so the user starts fresh at /login.
      // Ignore errors here — the password was already updated successfully.
      await supabase.auth.signOut().catch(() => {});

      setStepSafe(STEPS.SUCCESS);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbNav = (
    <nav className="flex justify-center flex-wrap items-center mt-6 text-white text-sm gap-x-1">
      {BREADCRUMBS.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center">
          {item === 'HOME' ? (
            <Link to="/" className="hover:underline">HOME</Link>
          ) : (
            <span className={i === BREADCRUMBS.length - 1 ? 'text-white font-semibold' : 'text-white/70'}>
              {item}
            </span>
          )}
          {i < BREADCRUMBS.length - 1 && <span className="mx-2 text-white/50">/</span>}
        </span>
      ))}
    </nav>
  );

  const header = (
    <>
      <Logo variant="auth" />
      <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center uppercase tracking-wide mt-4">
        Reset Password
      </h1>
      {breadcrumbNav}
    </>
  );

  // ── LOADING ──────────────────────────────────────────────────────────────
  if (step === STEPS.LOADING) {
    return (
      <AuthLayout header={header}>
        <div
          className="flex flex-col items-center gap-4 text-white"
          role="status"
          aria-label="Verifying reset link…"
        >
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Verifying your reset link…</p>
        </div>
      </AuthLayout>
    );
  }

  // ── INVALID LINK ─────────────────────────────────────────────────────────
  if (step === STEPS.INVALID_LINK) {
    return (
      <AuthLayout header={header}>
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-lg border border-gray-100 text-center">
          <p className="text-red-600 font-semibold mb-2">Invalid or Expired Link</p>
          <p className="text-gray-600 text-sm mb-6">
            This password reset link is invalid or has already been used. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block px-6 py-2 rounded-lg bg-[#005F02] text-white font-bold text-sm hover:bg-[#004A01] transition-colors"
          >
            Request New Link
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
          <SuccessStep
            variant="resetPassword"
            onAction={() => navigate('/login', { replace: true })}
          />
        </div>
      </AuthLayout>
    );
  }

  // ── FORM ─────────────────────────────────────────────────────────────────
  return (
    <AuthLayout header={header}>
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-lg border border-gray-100 text-gray-900">
        <h2 className="text-xl font-bold mb-1 text-gray-800">Create New Password</h2>
        <p className="text-sm text-gray-500 mb-6">
          Choose a strong password for your account.
        </p>

        <PasswordForm
          onSubmit={handlePasswordSubmit}
          isLoading={isLoading}
          submitLabel="Update Password"
          loadingLabel="Updating…"
        />

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <p className="text-center text-gray-600 text-sm mt-6">
          Remember your password?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}