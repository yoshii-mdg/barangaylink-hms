import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Background, Logo } from '../../../shared';
import { RegisterForm } from '../components/';
import { useAuth } from '../../../core/AuthContext';

export default function SignUp() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async ({ lastName, firstName, middleName, email, password }) => {
    if (isLoading) return;
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await signup({ email, password, firstName, middleName, lastName });
      setSuccess('Account created! Please check your email to confirm your account, then log in.');
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top section: dark green banner with background image */}
      <Background>
        <div className="absolute left-0 right-0 bottom-60 flex flex-col items-center">
          {/* Logo and branding */}
          <Logo variant="auth" />

          {/* Page title */}
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center uppercase tracking-wide mt-4">
            Create an account
          </h1>

          {/* Breadcrumb */}
          <nav className="flex justify-center mt-6 text-white text-sm">
            <Link to="/" className="hover:text-white hover:underline transition-colors">
              HOME
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">SIGN UP</span>
          </nav>
        </div>
      </Background>

      {/* Bottom section: overlapping white card */}
      <section className="flex-1 bg-gray-50 min-h-[50vh] flex items-start justify-center md:-mt-90 relative z-20">
        <div className="absolute left-0 right-0 bottom-70 mx-auto w-full max-w-md pt-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 text-gray-900">
            <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} />

            {/* Error message */}
            {error && (
              <p className="mt-4 text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            {/* Success message */}
            {success && (
              <p className="mt-4 text-sm text-green-700 text-center bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                {success}
              </p>
            )}

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
