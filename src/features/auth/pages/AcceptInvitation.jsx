// File: src/features/auth/pages/AcceptInvitation.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout, Logo } from '../../../shared';
import { SuccessStep } from '../components/';
import { useAuth } from '../../../core/AuthContext';
import { useToast } from '../../../core/ToastContext';
import { supabase, supabaseAdmin } from '../../../core/supabase';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const STEPS = {
    LOADING: 'loading',
    FORM: 'form',
    SUCCESS: 'success',
    INVALID_LINK: 'invalid',
};

const BREADCRUMBS = ['HOME', 'ACCEPT INVITATION'];

export default function AcceptInvitation() {
    const { updatePassword, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [step, setStep] = useState(STEPS.LOADING);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);  // captured at invitation check time

    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const checkInvitation = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error || !user) {
                    setStep(STEPS.INVALID_LINK);
                    return;
                }

                const inviteData = user.user_metadata;
                if (!inviteData?.role) {
                    setStep(STEPS.INVALID_LINK);
                    return;
                }

                // Capture userId NOW before password update can change session state
                setUserId(user.id);

                // Pre-fill names if they were somehow in metadata
                setFirstName(inviteData?.first_name || '');
                setMiddleName(inviteData?.middle_name || '');
                setLastName(inviteData?.last_name || '');

                setStep(STEPS.FORM);
            } catch (err) {
                console.error('Invitation check failed:', err);
                setStep(STEPS.INVALID_LINK);
            }
        };

        checkInvitation();
    }, []);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Client-side validation
            if (!firstName.trim()) throw new Error('First name is required.');
            if (!lastName.trim()) throw new Error('Last name is required.');
            if (password !== confirmPassword) throw new Error('Passwords do not match.');
            if (password.length < 8) throw new Error('Password must be at least 8 characters.');

            if (!userId) throw new Error('Session expired. Please use the invitation link again.');

            // ── STEP 1: Update DB row FIRST (before updatePassword() can alter session/metadata) ──
            // This uses supabaseAdmin to bypass RLS and guarantees the write succeeds.
            const { error: dbError } = await supabaseAdmin
                .from('users_tbl')
                .update({
                    first_name: firstName.trim(),
                    middle_name: middleName.trim() || null,
                    last_name: lastName.trim(),
                    is_active: true,   // activate account at the same time
                })
                .eq('user_id', userId);

            if (dbError) {
                console.error('DB update error:', dbError);
                throw new Error('Failed to save your profile. Please try again.');
            }

            // ── STEP 2: Set the password (Supabase may alter user_metadata here) ──
            await updatePassword(password);

            // ── STEP 3: Success ──
            setStep(STEPS.SUCCESS);
            toast.success('Account Created!', 'Your account is ready. Redirecting to login…');

            setTimeout(async () => {
                await logout();
                navigate('/login');
            }, 3000);

        } catch (err) {
            const msg = err.message || 'Failed to complete registration. Please try again.';
            setError(msg);
            toast.error('Registration Failed', msg);
        } finally {
            setIsLoading(false);
        }
    };

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
                    Verifying your invitation…
                </div>
            </AuthLayout>
        );
    }

    /* ── Invalid invitation ── */
    if (step === STEPS.INVALID_LINK) {
        return (
            <AuthLayout header={header}>
                <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg border border-gray-100 text-center space-y-4">
                    <p className="text-red-600 font-medium">This invitation link is invalid or has expired.</p>
                    <p className="text-gray-500 text-sm">
                        Invitation links are single-use and expire after 7 days.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block w-full py-3 rounded-lg bg-[#005F02] text-white font-bold uppercase tracking-wide hover:bg-[#004A01] transition-colors text-sm"
                    >
                        Go to Login
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    /* ── Success ── */
    if (step === STEPS.SUCCESS) {
        return (
            <AuthLayout header={header}>
                <SuccessStep variant="signup" />
            </AuthLayout>
        );
    }

    /* ── Password setup form ── */
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const passwordMatch = password !== '' && password === confirmPassword;
    const allRequirementsMet = hasMinLength && hasNumber && hasUppercase && passwordMatch;
    const canSubmit = allRequirementsMet && firstName.trim() && lastName.trim() && !isLoading;

    const inputClass =
        'w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02] transition-shadow';

    return (
        <AuthLayout header={header}>
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-lg border border-gray-100 text-gray-900">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome!</h2>
                    <p className="text-gray-600 text-sm">
                        Complete your profile and set a password to activate your account.
                    </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    {/* First Name */}
                    <div>
                        <label htmlFor="first-name" className="block text-[#005F02] font-bold mb-2 text-base">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="first-name"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter your first name"
                            className={inputClass}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Middle Name */}
                    <div>
                        <label htmlFor="middle-name" className="block text-[#005F02] font-bold mb-2 text-base">
                            Middle Name{' '}
                            <span className="text-gray-400 font-normal text-sm">(Optional)</span>
                        </label>
                        <input
                            id="middle-name"
                            type="text"
                            value={middleName}
                            onChange={(e) => setMiddleName(e.target.value)}
                            placeholder="Enter your middle name"
                            className={inputClass}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label htmlFor="last-name" className="block text-[#005F02] font-bold mb-2 text-base">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="last-name"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter your last name"
                            className={inputClass}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-[#005F02] font-bold mb-2 text-base">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className={`${inputClass} pr-12`}
                                autoComplete="new-password"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#005F02] focus:outline-none shrink-0"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                tabIndex={-1}
                            >
                                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirm-password" className="block text-[#005F02] font-bold mb-2 text-base">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="confirm-password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className={`${inputClass} pr-12`}
                                autoComplete="new-password"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#005F02] focus:outline-none shrink-0"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="space-y-2 mt-4">
                        {[
                            { met: hasMinLength, label: '8 characters minimum' },
                            { met: hasNumber, label: 'Contains a number' },
                            { met: hasUppercase, label: 'Contains an uppercase letter' },
                            { met: passwordMatch, label: 'Passwords match' },
                        ].map((req) => (
                            <div key={req.label} className="flex items-center gap-2 text-sm">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${req.met ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                    {req.met && <span className="text-emerald-700 font-bold text-xs">✓</span>}
                                </div>
                                <span className={req.met ? 'text-gray-700' : 'text-gray-400'}>
                                    {req.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <p className="mt-2 text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="w-full py-3 rounded-lg bg-[#005F02] text-white font-bold uppercase tracking-wide hover:bg-[#004A01] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm mt-6"
                    >
                        {isLoading ? 'Creating Account…' : 'Create Account'}
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
}