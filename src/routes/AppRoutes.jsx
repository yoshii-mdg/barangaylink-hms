import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage, Privacy, Terms, Contact } from '../features/landing';
import { ScrollToTop } from '../shared';
import { Login, SignUp, ForgotPassword, ResetPassword } from '../features/auth';
import { Dashboard, Analytics, Residents, Households, UserManagement } from '../features/dashboard';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import { ROLES } from '../core/AuthContext';

// ── Placeholder for pages not yet built ──────────────────────────────────────
function ComingSoon({ page }) {
  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-2xl font-semibold mb-2">{page}</p>
          <p className="text-sm">This page is coming soon.</p>
        </div>
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        {/* ── Truly public ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        {/* ── Guest-only ── */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignUp /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ════════════════════════════════════════════════════════
            RESIDENT ROUTES
        ════════════════════════════════════════════════════════ */}
        <Route path="/resident/dashboard" element={
          <ProtectedRoute allowedRoles={[ROLES.RESIDENT]}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/resident/profile" element={
          <ProtectedRoute allowedRoles={[ROLES.RESIDENT]}>
            <ComingSoon page="My Profile" />
          </ProtectedRoute>
        } />
        <Route path="/resident/eid" element={
          <ProtectedRoute allowedRoles={[ROLES.RESIDENT]}>
            <ComingSoon page="My eID" />
          </ProtectedRoute>
        } />

        {/* ════════════════════════════════════════════════════════
            STAFF ROUTES
        ════════════════════════════════════════════════════════ */}
        <Route path="/staff/dashboard" element={
          <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/staff/analytics" element={
          <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="/staff/residents" element={
          <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
            <Residents />
          </ProtectedRoute>
        } />
        <Route path="/staff/households" element={
          <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
            <Households />
          </ProtectedRoute>
        } />
        <Route path="/staff/eid" element={
          <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
            <ComingSoon page="eID" />
          </ProtectedRoute>
        } />
        <Route path="/staff/verification" element={
          <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
            <ComingSoon page="Verification" />
          </ProtectedRoute>
        } />
        <Route path="/staff/profile" element={
          <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
            <ComingSoon page="Profile" />
          </ProtectedRoute>
        } />

        {/* ════════════════════════════════════════════════════════
            SUPER ADMIN ROUTES
        ════════════════════════════════════════════════════════ */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPERADMIN]}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPERADMIN]}>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="/admin/residents" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPERADMIN]}>
            <Residents />
          </ProtectedRoute>
        } />
        <Route path="/admin/households" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPERADMIN]}>
            <Households />
          </ProtectedRoute>
        } />
        <Route path="/admin/eid" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPERADMIN]}>
            <ComingSoon page="eID" />
          </ProtectedRoute>
        } />
        <Route path="/admin/verification" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPERADMIN]}>
            <ComingSoon page="Verification" />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPERADMIN]}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPERADMIN]}>
            <ComingSoon page="Profile" />
          </ProtectedRoute>
        } />

        {/* ── 404 catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;