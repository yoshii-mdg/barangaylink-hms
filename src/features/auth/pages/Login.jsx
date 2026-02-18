import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout, Logo } from '../../../shared';
import { LoginForm } from '../components';

export default function Login() {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate('/dashboard');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const header = (
    <>
      <Logo variant="auth" />
      <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center uppercase tracking-wide mt-4">
        Login to your account
      </h1>
      <nav className="flex justify-center mt-6 text-white text-sm">
        <Link to="/" className="hover:text-white hover:underline transition-colors">
          HOME
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white">LOGIN</span>
      </nav>
    </>
  );

  return (
    <AuthLayout header={header}>
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-lg border border-gray-100">
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
    </AuthLayout>
  );
}
