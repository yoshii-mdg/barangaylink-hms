import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout, Logo } from '../../../shared';
import { SuccessStep } from '../components/';
import { useAuth } from '../../../core/AuthContext';
import { LuMail } from 'react-icons/lu';

const STEPS = {
  EMAIL: 1,
  SENT: 2,
};

const BREADCRUMBS = {
  [STEPS.EMAIL]: ['HOME', 'FORGOT PASSWORD'],
  [STEPS.SENT]: ['HOME', 'FORGOT PASSWORD', 'CHECK YOUR EMAIL'],
};

const inputClass =
  'w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02] transition-shadow';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const breadcrumbItems = BREADCRUMBS[step];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError('Email is required.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setEmailError('');
    setError('');
    setIsLoading(true);

    try {
      await resetPassword(email.trim());
      setStep(STEPS.SENT);
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const header = (
    <>
      <Logo variant="auth" />
      <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center uppercase tracking-wide mt-4">
        Forgot Password
      </h1>
      <nav className="flex justify-center flex-wrap items-center mt-6 text-white text-sm gap-x-1">
        {breadcrumbItems.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center">
            {item === 'HOME' ? (
              <Link to="/" className="hover:text-white hover:underline transition-colors">
                {item}
              </Link>
            ) : (
              <span>{item}</span>
            )}
            {i < breadcrumbItems.length - 1 && <span className="mx-2">/</span>}
          </span>
        ))}
      </nav>
    </>
  );

  /* ── Step 2: Check your inbox ── */
  if (step === STEPS.SENT) {
    return (
      <AuthLayout header={header}>
        <div className="w-full max-w-lg overflow-hidden rounded-2xl shadow-lg">
          {/* Green header */}
          <div className="bg-[#005F02] px-6 py-8 flex flex-col items-center">
            <LuMail className="w-16 h-16 text-white" strokeWidth={1.5} aria-hidden />
            <h2 className="text-white text-2xl font-bold mt-3">Check Your Email</h2>
          </div>

          {/* Body */}
          <div className="bg-white px-6 py-8 text-center space-y-4">
            <p className="text-gray-600">
              We sent a password reset link to{' '}
              <strong className="text-gray-900">{email}</strong>.
            </p>
            <p className="text-gray-500 text-sm">
              Click the link in the email to set a new password. The link expires in 1 hour.
            </p>
            <p className="text-gray-400 text-sm">
              Didn&apos;t receive it? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => setStep(STEPS.EMAIL)}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                try a different email
              </button>
              .
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 w-full py-3 rounded-lg bg-[#005F02] text-white font-bold uppercase tracking-wide hover:bg-[#004A01] transition-colors text-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  /* ── Step 1: Enter email ── */
  return (
    <AuthLayout header={header}>
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-lg border border-gray-100 text-gray-900">
        <p className="text-gray-600 text-sm mb-6 text-center">
          Enter the email address linked to your account and we&apos;ll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="reset-email" className="block text-[#005F02] font-bold mb-2 text-base">
              Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              placeholder="Enter your email address"
              className={`${inputClass} ${emailError ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : ''}`}
              autoComplete="email"
              required
            />
            {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-lg bg-[#005F02] text-white text-base font-bold uppercase tracking-wide hover:bg-[#004A01] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

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