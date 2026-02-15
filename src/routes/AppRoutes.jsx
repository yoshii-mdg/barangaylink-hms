import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage, Privacy, Terms, Contact } from '../features/landing'
import { ScrollToTop } from "../shared/components";
import { Login, SignUp, ForgotPassword } from '../features/auth'

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
        <Route path='/forgot-password' element={<ForgotPassword/ >} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes