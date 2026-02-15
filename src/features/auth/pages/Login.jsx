import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Background } from '../../../shared/components';
import logo from '../../../assets/images/logo.svg';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to auth
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top section: dark green banner with background image */}
      <Background>
        <div className="absolute left-0 right-0 bottom-60 flex flex-col items-center">
          {/* Logo and branding */}
          <Link
            to="/"
            className="inline-flex items-center justify-center mb-6 hover:opacity-90 transition-opacity"
            aria-label="BarangayLink Home"
          >
            <img src={logo} alt="" className="h-12 md:h-14 w-auto " />
            <div>
              <p className="text-white font-bold text-xl md:text-2xl tracking-tight">
                BARANGAYLINK
              </p>
              <p className="text-white/90 text-sm">Resident and House Registry</p>
            </div>
          </Link>

          {/* Page title */}
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center uppercase tracking-wide mt-4">
            Login to your account
          </h1>

          {/* Breadcrumb */}
          <nav className="flex justify-center mt-6 text-white text-sm">
            <Link
              to="/"
              className="hover:text-white hover:underline transition-colors"
            >
              HOME
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">LOGIN</span>
          </nav>
        </div>
      </Background>

      {/* Bottom section: light green + overlapping white card */}
      <section className="flex-1 bg-gray-50 min-h-[50vh] flex items-start justify-center  md:-mt-90 relative z-20">
        <div className="absolute left-0 right-0 bottom-80 mx-auto w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-[#005F02] font-bold mb-2"
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02] transition-shadow"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-[#005F02] font-bold mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02] transition-shadow"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#005F02] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Forgot Password
                  </Link>
                </div>
              </div>

              {/* Login button */}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#005F02] text-white font-bold uppercase tracking-wide hover:bg-[#004A01] transition-colors"
              >
                Login
              </button>
            </form>

            <p className="text-center text-gray-600 text-sm mt-6">
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
              >
                Click Here
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
