import { Link } from 'react-router-dom';
import { Background, Logo } from '../../../shared';
import { RegisterForm } from '../components';

export default function SignUp() {
  const handleSubmit = (_data) => {
    // placeholder lang yung data ahh
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
            <RegisterForm onSubmit={handleSubmit} />

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
