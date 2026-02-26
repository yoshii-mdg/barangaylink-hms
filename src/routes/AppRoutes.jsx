import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage, Privacy, Terms, Contact } from '../features/landing'
import { ScrollToTop } from "../shared";
import { Login, SignUp, ForgotPassword } from '../features/auth'
import { Dashboard, Analytics, Residents, Households, Eid, QRVerification } from '../features/dashboard'

function AppRoutes() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/analytics' element={<Analytics />} />
        <Route path='/residents' element={<Residents />} />
        <Route path='/households' element={<Households />} />
        <Route path='/eid' element={<Eid />} />
        <Route path='/qr-verification' element={<QRVerification />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes