import { useState } from 'react';

const inputClass =
  'w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02] transition-shadow';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Step 2 of the signup flow — collects the user's email address.
 * Email verification is handled automatically by Supabase after the final
 * signUp call (Step 3). No OTP is needed here.
 */
export default function EmailCredentialsForm({ onSubmit, defaultEmail = '' }) {
  const [email, setEmail] = useState(defaultEmail);
  const [emailError, setEmailError] = useState('');

  const validate = () => {
    if (!email.trim()) {
      setEmailError('Email is required.');
      return false;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.({ email: email.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="signup-email" className="block text-[#005F02] font-bold mb-2 text-base">
          Email Address
        </label>
        <input
          id="signup-email"
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
        {emailError && (
          <p className="mt-1 text-sm text-red-500">{emailError}</p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          A confirmation link will be sent to this address after you set your password.
        </p>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 rounded-lg bg-[#005F02] text-white text-base font-bold uppercase tracking-wide hover:bg-[#004A01] transition-colors"
      >
        Continue
      </button>
    </form>
  );
}