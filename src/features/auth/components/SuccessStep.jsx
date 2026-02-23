import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBadgeCheck, LuMail } from 'react-icons/lu';
import { RotatingLines } from 'react-loader-spinner';

const REDIRECT_DELAY_MS = 5000; // slightly longer for confirmEmail so user can read

/**
 * @param {'signup' | 'forgotPassword' | 'confirmEmail'} variant
 * @param {string} [email] - shown in the confirmEmail variant
 *
 * Variants:
 *   signup       — old "account created, redirecting to login" (kept for backward compat)
 *   confirmEmail — "account created, check your email FIRST before logging in"
 *   forgotPassword — "password updated, redirecting to login"
 */
export default function SuccessStep({ variant = 'signup', email = '' }) {
  const navigate = useNavigate();

  // confirmEmail variant does NOT auto-redirect — user needs to go to their inbox first.
  const shouldAutoRedirect = variant !== 'confirmEmail';

  useEffect(() => {
    if (!shouldAutoRedirect) return;
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [navigate, shouldAutoRedirect]);

  /* ── confirmEmail variant ── */
  if (variant === 'confirmEmail') {
    return (
      <div className="overflow-hidden h-full rounded-2xl shadow-lg">
        {/* Green header */}
        <div className="bg-[#005F02] px-6 py-8 flex flex-col items-center">
          <LuMail className="w-16 h-16 text-white" strokeWidth={1.5} aria-hidden />
          <h2 className="text-white text-2xl font-bold mt-3 text-center">
            Confirm Your Email
          </h2>
        </div>

        {/* Body */}
        <div className="bg-white px-6 py-8 text-center space-y-4">
          <p className="text-gray-700 text-base leading-relaxed">
            Your account has been created successfully!
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            We sent a confirmation link to{' '}
            {email && <strong className="text-gray-900">{email}</strong>}.
            {!email && <span>your email address</span>}.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Please check your inbox and click the link in the email to verify
            your account before logging in. If you don&apos;t see it, check
            your spam or junk folder.
          </p>

          <div className="pt-2">
            <a
              href="/login"
              className="inline-block w-full py-3 rounded-lg bg-[#005F02] text-white font-bold uppercase tracking-wide hover:bg-[#004A01] transition-colors text-sm"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ── forgotPassword variant ── */
  const message = variant === 'forgotPassword'
    ? (
      <>
        Your password has been successfully updated.
        <br />
        You can now log in with your new password.
      </>
    )
    : (
      <>
        Your account has been created successfully!
        <br />
        You may now log in using your registered
        <br />
        credentials.
      </>
    );

  /* ── signup / forgotPassword variant (with auto-redirect) ── */
  return (
    <div className="overflow-hidden h-full rounded-2xl shadow-lg">
      {/* Dark green header with success icon */}
      <div className="bg-[#005F02] px-6 py-8 flex flex-col items-center">
        <LuBadgeCheck
          className="w-16 h-16 text-white"
          strokeWidth={2}
          aria-hidden
        />
        <h2 className="text-white text-2xl font-bold mt-3">Success!</h2>
      </div>

      {/* White content area */}
      <div className="bg-white px-6 py-8">
        <p className="text-gray-600 text-center mb-6">
          {message}
        </p>

        {/* Redirect indicator */}
        <div className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#005F02] text-white font-medium">
          <span>Redirecting you to the Login Page</span>
          <RotatingLines
            visible={true}
            height={20}
            width={20}
            animationDuration="0.75"
            color="#ffffff"
            ariaLabel="rotating-lines-loading"
          />
        </div>
      </div>
    </div>
  );
}