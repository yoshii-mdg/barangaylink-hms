import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout, Logo } from '../../../shared';
import {
  RegisterForm,
  EmailCredentialsForm,
  PasswordForm,
  SuccessStep,
} from '../components/';

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
  const [step, setStep] = useState(STEPS.PERSONAL);
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    email: '',
    otp: '',
    password: '',
  });

  const breadcrumbItems = BREADCRUMBS[step] ?? BREADCRUMBS[STEPS.PERSONAL];

  const handlePersonalSubmit = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(STEPS.EMAIL);
  };

  const handleEmailSubmit = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(STEPS.PASSWORD);
  };

  const handlePasswordSubmit = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(STEPS.SUCCESS);
  };

  const renderFormContent = () => {
    if (step === STEPS.SUCCESS) {
      return <SuccessStep />;
    }
    if (step === STEPS.PERSONAL) {
      return <RegisterForm onSubmit={handlePersonalSubmit} />;
    }
    if (step === STEPS.EMAIL) {
      return (
        <EmailCredentialsForm
          onSubmit={handleEmailSubmit}
          defaultEmail={formData.email}
        />
      );
    }
    if (step === STEPS.PASSWORD) {
      return <PasswordForm onSubmit={handlePasswordSubmit} />;
    }
    return null;
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
              <Link
                to="/"
                className="hover:text-white hover:underline transition-colors"
              >
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
          <SuccessStep />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-lg border border-gray-100 text-gray-900">
          {renderFormContent()}
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
