import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout, Logo } from '../../../shared';
import { PasswordForm, SuccessStep } from '../components/';
import { useAuth } from '../../../core/AuthContext';
import { supabase } from '../../../core/supabase';

const STEPS = {
    LOADING: 'loading',   // waiting for Supabase to exchange the token
    FORM: 'form',      // show new password form
    SUCCESS: 'success',   // password updated
    INVALID_LINK: 'invalid',  // token missing or expired
};

const BREADCRUMBS = ['HOME', 'FORGOT PASSWORD', 'RESET PASSWORD'];

export default function ResetPassword() {
    const { updatePassword } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(STEPS.LOADING);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        /**
         * Supabase appends the recovery token as a hash fragment to the redirect URL:
         * /reset-password#access_token=...&type=recovery
         *
         * onAuthStateChange fires with event 'PASSWORD_RECOVERY' once Supabase
         * exchanges that token for a session. We wait for that event before
         * showing the form — if it never fires the link is invalid/expired.
         */
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setStep(STEPS.FORM);
            }
        });

        // Safety timeout — if no PASSWORD_RECOVERY event within 5 seconds,
        // the token is missing or already expired.
        const timeout = setTimeout(() => {
            setStep((current) => {
                if (current === STEPS.LOADING) return STEPS.INVALID_LINK;
                return current;
            });
        }, 5000);

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
            setStep(STEPS.SUCCESS);
        } catch (err) {
            setError(err.message || 'Failed to update password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const header = (
        <>
            <Logo variant="auth" />
            <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center uppercase tracking-wide mt-4">
                Reset Password
            </h1>
            <nav className="flex justify-center flex-wrap items-center mt-6 text-white text-sm gap-x-1">
                {BREADCRUMBS.map((item, i) => (
                    <span key={`${item}-${i}`} className="flex items-center">
                        {item === 'HOME' ? (
                            <Link to="/" className="hover:text-white hover:underline transition-colors">
                                {item}
                            </Link>
                        ) : (
                            <span>{item}</span>
                        )}
                        {i < BREADCRUMBS.length - 1 && <span className="mx-2">/</span>}
                    </span>
                ))}
            </nav>
        </>
    );

    /* ── Loading ── */
    if (step === STEPS.LOADING) {
        return (
            <AuthLayout header={header}>
                <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg border border-gray-100 text-center text-gray-500">
                    Verifying your reset link…
                </div>
            </AuthLayout>
        );
    }

    /* ── Invalid / expired link ── */
    if (step === STEPS.INVALID_LINK) {
        return (
            <AuthLayout header={header}>
                <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg border border-gray-100 text-center space-y-4">
                    <p className="text-red-600 font-medium">This reset link is invalid or has expired.</p>
                    <p className="text-gray-500 text-sm">
                        Reset links are single-use and expire after 1 hour.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="inline-block w-full py-3 rounded-lg bg-[#005F02] text-white font-bold uppercase tracking-wide hover:bg-[#004A01] transition-colors text-sm"
                    >
                        Request a New Link
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    /* ── Success ── */
    if (step === STEPS.SUCCESS) {
        return (
            <AuthLayout header={header}>
                <div className="w-full max-w-lg">
                    <SuccessStep variant="forgotPassword" />
                </div>
            </AuthLayout>
        );
    }

    /* ── Password form ── */
    return (
        <AuthLayout header={header}>
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-lg border border-gray-100 text-gray-900">
                <p className="text-gray-600 text-sm mb-6 text-center">
                    Enter and confirm your new password below.
                </p>

                <PasswordForm
                    onSubmit={handlePasswordSubmit}
                    isLoading={isLoading}
                    variant="forgotPassword"
                />

                {error && (
                    <p className="mt-4 text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                        {error}
                    </p>
                )}
            </div>
        </AuthLayout>
    );
}