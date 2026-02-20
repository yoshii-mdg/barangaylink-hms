import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function RegisterForm({ onSubmit, isLoading = false }) {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ lastName, firstName, middleName, email, password });
  };

  const inputClass =
    'w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02] transition-shadow disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Last Name */}
      <div>
        <label htmlFor="signup-lastname" className="block text-[#005F02] font-bold mb-2">
          Last Name
        </label>
        <input
          id="signup-lastname"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Enter your last name"
          className={inputClass}
          autoComplete="family-name"
          required
          disabled={isLoading}
        />
      </div>

      {/* First Name */}
      <div>
        <label htmlFor="signup-firstname" className="block text-[#005F02] font-bold mb-2">
          First Name
        </label>
        <input
          id="signup-firstname"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter your first name"
          className={inputClass}
          autoComplete="given-name"
          required
          disabled={isLoading}
        />
      </div>

      {/* Middle Name */}
      <div>
        <label htmlFor="signup-middlename" className="block text-[#005F02] font-bold mb-2">
          Middle Name <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="signup-middlename"
          type="text"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          placeholder="Enter your middle name"
          className={inputClass}
          autoComplete="additional-name"
          disabled={isLoading}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="signup-email" className="block text-[#005F02] font-bold mb-2">
          Email Address
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={inputClass}
          autoComplete="email"
          required
          disabled={isLoading}
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="signup-password" className="block text-[#005F02] font-bold mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            className={`${inputClass} pr-12`}
            autoComplete="new-password"
            required
            minLength={6}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#005F02] transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={isLoading}
          >
            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3 rounded-lg bg-[#005F02] text-white font-bold uppercase tracking-wide hover:bg-[#004A01] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
}
