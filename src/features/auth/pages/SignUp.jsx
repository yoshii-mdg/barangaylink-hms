import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Background } from '../../../shared/components';
import logo from '../../../assets/images/logo.svg';

export default function SignUp() {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to auth / next step
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
            Create an account
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
            <span className="text-white">PERSONAL INFORMATION</span>
          </nav>
        </div>
      </Background>

      {/* Bottom section: overlapping white card, no absolute on card so cursor/caret stay dark */}
      <section className="flex-1 bg-gray-50 min-h-[50vh] flex items-start justify-center  md:-mt-90 relative z-20">
        <div className="absolute left-0 right-0 bottom-70 mx-auto w-full max-w-md pt-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 text-gray-900">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Last Name */}
              <div>
                <label
                  htmlFor="signup-lastname"
                  className="block text-[#005F02] font-bold mb-2"
                >
                  Last Name
                </label>
                <input
                  id="signup-lastname"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02] transition-shadow"
                  autoComplete="family-name"
                  required
                />
              </div>

              {/* First Name */}
              <div>
                <label
                  htmlFor="signup-firstname"
                  className="block text-[#005F02] font-bold mb-2"
                >
                  First Name
                </label>
                <input
                  id="signup-firstname"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02] transition-shadow"
                  autoComplete="given-name"
                  required
                />
              </div>

              {/* Middle Name */}
              <div>
                <label
                  htmlFor="signup-middlename"
                  className="block text-[#005F02] font-bold mb-2"
                >
                  Middle Name
                </label>
                <input
                  id="signup-middlename"
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Enter your middle name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02] transition-shadow"
                  autoComplete="additional-name"
                />
              </div>

              {/* Continue button */}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#005F02] text-white font-bold uppercase tracking-wide hover:bg-[#004A01] transition-colors"
              >
                Continue
              </button>
            </form>

            <p className="text-center text-gray-600 text-sm mt-6">
              Already have an account?{' '}
              <Link
                to="/login"
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
