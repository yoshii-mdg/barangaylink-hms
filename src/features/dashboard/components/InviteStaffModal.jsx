import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LuUserPlus, LuX } from 'react-icons/lu';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Modal for Super Admins to invite a new staff member by email.
 * Calls onInvite(email) — caller is responsible for the actual invite logic.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {(email: string) => Promise<void>} onInvite — should throw on error
 */
export default function InviteStaffModal({ isOpen, onClose, onInvite }) {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [sent, setSent] = useState(false);

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setEmail('');
            setEmailError('');
            setServerError('');
            setIsLoading(false);
            setSent(false);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const validate = () => {
        if (!email.trim()) {
            setEmailError('Email address is required.');
            return false;
        }
        if (!EMAIL_REGEX.test(email.trim())) {
            setEmailError('Please enter a valid email address.');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setServerError('');
        setIsLoading(true);
        try {
            await onInvite(email.trim());
            setSent(true);
        } catch (err) {
            setServerError(err.message || 'Failed to send invite. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const content = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60"
                onClick={!isLoading ? onClose : undefined}
                aria-hidden
            />

            {/* Modal */}
            <div
                className="relative z-10 bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                role="dialog"
                aria-labelledby="invite-modal-title"
                aria-modal="true"
            >
                {/* Header */}
                <div className="bg-[#005F02] px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LuUserPlus className="w-6 h-6 text-white" />
                        <h2 id="invite-modal-title" className="text-white text-lg font-bold">
                            Invite Staff Member
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-white/70 hover:text-white transition-colors disabled:opacity-50"
                        aria-label="Close"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    {sent ? (
                        /* Success state */
                        <div className="text-center space-y-4">
                            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                <LuUserPlus className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Invite Sent!</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    An invitation email has been sent to{' '}
                                    <strong className="text-gray-700">{email}</strong>.
                                    They will receive a link to set their password and log in as Staff.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-2.5 rounded-lg bg-[#005F02] text-white font-semibold text-sm hover:bg-[#004A01] transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        /* Form state */
                        <>
                            <p className="text-sm text-gray-600 mb-5">
                                Enter the email address of the person you want to invite as a Staff member.
                                They will receive an email with a link to set their password.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="invite-email" className="block text-[#005F02] font-bold mb-2 text-sm">
                                        Email Address
                                    </label>
                                    <input
                                        id="invite-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (emailError) setEmailError('');
                                            if (serverError) setServerError('');
                                        }}
                                        placeholder="staff@example.com"
                                        className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow ${emailError
                                                ? 'border-red-400 focus:ring-red-400/30'
                                                : 'border-gray-300 focus:ring-[#005F02]/30 focus:border-[#005F02]'
                                            }`}
                                        autoComplete="email"
                                        disabled={isLoading}
                                        required
                                    />
                                    {emailError && (
                                        <p className="mt-1 text-xs text-red-500">{emailError}</p>
                                    )}
                                </div>

                                {serverError && (
                                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
                                        {serverError}
                                    </p>
                                )}

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 py-2.5 rounded-lg bg-[#005F02] text-white text-sm font-semibold hover:bg-[#004A01] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? 'Sending…' : 'Send Invite'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
}