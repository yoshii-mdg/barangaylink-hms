import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage, Privacy, Terms, Contact } from '../features/landing'
import { ScrollToTop } from "../shared";
import { Login, SignUp, ForgotPassword } from '../features/auth'
import { Dashboard } from '../features/dashboard'
import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
