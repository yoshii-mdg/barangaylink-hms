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

  // Redirect once authenticated and roles are loaded.
  // BUG FIX: Previously `!isLoggingIn` was in the condition — but isLoggingIn
  // was never reset to false on a *successful* login (only on error), so the
  // redirect never fired. Now we use a separate `loginSucceeded` flag.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(getDashboardPath(), { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, getDashboardPath]);

  const handleSubmit = async ({ email, password }) => {
    setError('');
    setIsLoggingIn(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!', 'You have been logged in successfully.');
      // Navigation handled by useEffect above once isAuthenticated becomes true
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';

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
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full border border-gray-100">
        <LoginForm onSubmit={handleSubmit} isLoading={isLoggingIn} />

        {error && (
          <p
            role="alert"
            className="mt-4 text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg px-4 py-2"
          >
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