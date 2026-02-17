import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Background, Logo } from '../../../shared';
import { LoginForm } from '../components';

export default function Login() {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async () => {
    // TODO: connect to real auth API
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    try {
      // Simulate request latency until auth is connected
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate('/dashboard');
    } finally {
      setIsLoggingIn(false);
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
            <LoginForm onSubmit={handleSubmit} isLoading={isLoggingIn} />

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
