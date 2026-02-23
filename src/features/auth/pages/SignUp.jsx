import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout, Logo } from '../../../shared';
import {
  RegisterForm,
  EmailCredentialsForm,
  PasswordForm,
  SuccessStep,
} from '../components/';
import { useAuth } from '../../../core/AuthContext';

const STEPS = {
  PERSONAL: 1,
  EMAIL: 2,
  PASSWORD: 3,
  SUCCESS: 4,
};

const BREADCRUMBS = {
  [STEPS.PERSONAL]: ['HOME', 'PERSONAL INFORMATION'],
  [STEPS.EMAIL]: ['HOME', 'PERSONAL INFORMATION', 'EMAIL CREDENTIALS'],
  [STEPS.PASSWORD]: ['HOME', 'PERSONAL INFORMATION', 'EMAIL CREDENTIALS', 'PASSWORD'],
  [STEPS.SUCCESS]: ['HOME', 'PERSONAL INFORMATION', 'EMAIL CREDENTIALS', 'PASSWORD'],
};

export default function SignUp() {
  const { signup } = useAuth();

  const [step, setStep] = useState(STEPS.PERSONAL);
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const breadcrumbItems = BREADCRUMBS[step] ?? BREADCRUMBS[STEPS.PERSONAL];

  // Step 1 — personal info
  const handlePersonalSubmit = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(STEPS.EMAIL);
  };

  // Step 2 — email
  const handleEmailSubmit = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(STEPS.PASSWORD);
  };

  // Step 3 — password + T&C → call Supabase signUp
  // Supabase sends a confirmation email automatically. The user must click the
  // link in that email before they can log in (email confirmation required).
  const handlePasswordSubmit = async ({ password }) => {
    const { firstName, middleName, lastName, email } = formData;
    setError('');
    setIsLoading(true);
    try {
      await signup({ email, password, firstName, middleName, lastName });
      setStep(STEPS.SUCCESS);
    } catch (err) {
      // Supabase returns "User already registered" if the email already exists.
      // Map that to a friendlier message.
      if (err.message?.toLowerCase().includes('already registered')) {
        setError('An account with this email address already exists. Please log in instead.');
      } else {
        setError(err.message || 'Sign up failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormContent = () => {
    switch (step) {
      case STEPS.PERSONAL:
        return <RegisterForm onSubmit={handlePersonalSubmit} />;
      case STEPS.EMAIL:
        return (
          <EmailCredentialsForm
            onSubmit={handleEmailSubmit}
            defaultEmail={formData.email}
          />
        );
      case STEPS.PASSWORD:
        return (
          <PasswordForm
            onSubmit={handlePasswordSubmit}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  const header = (
    <>
      <Logo variant="auth" />
      <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center uppercase tracking-wide mt-4">
        Create an account
      </h1>
      <nav className="flex justify-center flex-wrap items-center mt-6 text-white text-sm gap-x-1">
        {breadcrumbItems.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center">
            {item === 'HOME' ? (
              <Link to="/" className="hover:text-white hover:underline transition-colors">
                {item}
              </Link>
            ) : (
              <span>{item}</span>
            )}
            {i < breadcrumbItems.length - 1 && <span className="mx-2">/</span>}
          </span>
        ))}
      </nav>
    </>
  );

  return (
    <AuthLayout header={header}>
      {step === STEPS.SUCCESS ? (
        <div className="w-full max-w-lg">
          {/* Use the 'confirmEmail' variant so the message tells the user
              to check their inbox before logging in. */}
          <SuccessStep variant="confirmEmail" email={formData.email} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-lg border border-gray-100 text-gray-900">
          {renderFormContent()}

          {/* Error — only shown on password step */}
          {error && step === STEPS.PASSWORD && (
            <p className="mt-4 text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
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
      )}
    </AuthLayout>
  );
}