import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import CheckList from '../../../assets/icons/check-list.svg';
import AgreementModal from './AgreementModal';

const inputClass =
  'w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02] transition-shadow';

export default function PasswordForm({ onSubmit, isLoading = false, variant = 'signup' }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const isForgotPassword = variant === 'forgotPassword';
  const isAcceptInvitation = variant === 'acceptInvitation';

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const passwordMatch = password !== '' && password === confirmPassword;

  const allRequirementsMet = hasMinLength && hasNumber && hasUppercase && passwordMatch;
  const canSubmit = isForgotPassword || isAcceptInvitation
    ? allRequirementsMet
    : allRequirementsMet && agreedToTerms;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit || isLoading) return;
    onSubmit?.({ password });
  };

  const requirements = [
    { met: hasMinLength, label: '8 characters minimum' },
    { met: hasNumber, label: 'Contains a number' },
    { met: hasUppercase, label: 'Contains an uppercase letter' },
    { met: passwordMatch, label: 'Passwords match' },
  ];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-[#005F02] font-bold mb-2 text-base">
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
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
          <label htmlFor="signup-confirm-password" className="block text-[#005F02] font-bold mb-2 text-base">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="signup-confirm-password"
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

        {/* Password Requirements Checklist */}
        <ul className="space-y-2 list-none p-0 m-0">
          {requirements.map(({ met, label }) => (
            <li key={label} className="flex items-center gap-3">
              <img
                src={CheckList}
                alt=""
                className={`w-5 h-5 shrink-0 transition-opacity ${met ? 'opacity-100' : 'opacity-30'}`}
                aria-hidden
              />
              <span className={`text-sm transition-colors ${met ? 'text-[#005F02] font-medium' : 'text-gray-500'}`}>
                {label}
              </span>
            </li>
          ))}
        </ul>

        {/* Terms and Conditions — above the submit button */}
        {!isForgotPassword && !isAcceptInvitation && (
          <div className="flex items-start gap-2">
            <input
              id="signup-agree-terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#0096FF] focus:ring-[#005F02]"
            />
            <label htmlFor="signup-agree-terms" className="text-sm text-black leading-snug">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Terms and Conditions.
              </button>
            </label>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit || isLoading}
          className="w-full py-3.5 rounded-lg bg-[#005F02] text-white text-base font-bold uppercase tracking-wide hover:bg-[#004A01] transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#005F02]"
        >
          {isLoading
            ? 'Setting password…'
            : isForgotPassword
              ? 'Update Password'
              : isAcceptInvitation
                ? 'Set Password'
                : 'Register'}
        </button>
      </form>

      {!isForgotPassword && !isAcceptInvitation && (
        <AgreementModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          onAgree={() => {
            setAgreedToTerms(true);
            setShowTermsModal(false);
          }}
          initialAgreed={agreedToTerms}
        />
      )}
    </>
  );
}