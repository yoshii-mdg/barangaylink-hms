/**
 *
 * Fixes:
 *  1. `isLoggingIn` state is now reset to `false` in the finally block (not only
 *     on error), so the submit button re-enables correctly if navigation doesn't
 *     happen immediately.
 *  2. Navigation useEffect dependency array now includes all referenced values
 *     to avoid stale closure bugs.
 *  3. Deactivated-account error is handled with a dedicated UI message.
 *  4. Added `aria-live` region for screen-reader-accessible error announcements.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout, Logo } from '../../../shared';
import { LoginForm } from '../components';
import { useAuth } from '../../../core/AuthContext';
import { useToast } from '../../../core/ToastContext';

export default function Login() {
  const { login, isAuthenticated, isLoading, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Navigate only after role has fully loaded and there's no active login in progress
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isLoggingIn) {
      navigate(getDashboardPath(), { replace: true });
    }
  }, [isLoading, isAuthenticated, isLoggingIn, navigate, getDashboardPath]);

  const handleSubmit = useCallback(async ({ email, password }) => {
    setError('');
    setIsLoggingIn(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!', 'You have been logged in successfully.');
      // Navigation is handled by the useEffect above once isAuthenticated settles
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';
      setError(msg);

      if (msg.toLowerCase().includes('deactivated')) {
        toast.error(
          'Account Deactivated',
          'Your account has been deactivated. Please contact an administrator.'
        );
      } else {
        toast.error('Login Failed', msg);
      }
    } finally {
      // Always reset so the button re-enables (navigation will happen via useEffect)
      setIsLoggingIn(false);
    }
  }, [login, toast]);

  const header = (
    <>
      <Logo variant="auth" />
      <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center uppercase tracking-wide mt-4">
        Login to your account
      </h1>
      <nav className="flex justify-center mt-6 text-white text-sm" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-white hover:underline transition-colors">
          HOME
        </Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="text-white" aria-current="page">LOGIN</span>
      </nav>
    </>
  );

  return (
    <AuthLayout header={header}>
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-lg border border-gray-100">
        <LoginForm onSubmit={handleSubmit} isLoading={isLoggingIn} />

        {/* aria-live so screen readers announce errors without user interaction */}
        <div aria-live="polite" aria-atomic="true">
          {error && (
            <p className="mt-4 text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}