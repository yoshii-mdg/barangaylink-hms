import { useState, useEffect } from 'react';
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

  // Navigate only after role has fully loaded and no login in progress
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isLoggingIn && !error) {
      navigate(getDashboardPath(), { replace: true });
    }
  }, [isLoading, isAuthenticated, isLoggingIn, error]);

  const handleSubmit = async ({ email, password }) => {
    setError('');
    setIsLoggingIn(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!', 'You have been logged in successfully.');
      // Do NOT navigate here — the useEffect above handles it
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';

      // Show a more specific toast for deactivated accounts
      if (msg.toLowerCase().includes('deactivated')) {
        toast.error('Account Deactivated', 'Your account has been deactivated. Please contact an administrator.');
      } else {
        toast.error('Login Failed', msg);
      }

      setError(msg);
      setIsLoggingIn(false);
    }
  };

  const header = (
    <>
      <Logo variant="auth" />
      <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center uppercase tracking-wide mt-4">
        Login to your account
      </h1>
      <nav className="flex justify-center mt-6 text-white text-sm">
        <Link to="/" className="hover:text-white hover:underline transition-colors">
          HOME
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white">LOGIN</span>
      </nav>
    </>
  );

  return (
    <AuthLayout header={header}>
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-lg border border-gray-100">
        <LoginForm onSubmit={handleSubmit} isLoading={isLoggingIn} />

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

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