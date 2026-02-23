import { Link } from 'react-router-dom';
import { LuShieldOff } from 'react-icons/lu';

/**
 * Shown when a user's account has been deactivated by a Super Admin.
 * ProtectedRoute redirects here when is_active === false.
 * AuthContext also forces a sign-out before this page is reached,
 * so the user is fully logged out when they land here.
 */
export default function DeactivatedPage() {
    return (
        <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-md w-full">
                {/* Header */}
                <div className="bg-[#7f1d1d] px-6 py-8 flex flex-col items-center">
                    <LuShieldOff className="w-14 h-14 text-white" strokeWidth={1.5} aria-hidden />
                    <h1 className="text-white text-2xl font-bold mt-3 text-center">
                        Account Deactivated
                    </h1>
                </div>

                {/* Body */}
                <div className="px-6 py-8 text-center space-y-4">
                    <p className="text-gray-700 text-base leading-relaxed">
                        Your BarangayLink account has been deactivated.
                    </p>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        If you believe this is a mistake or need your account restored,
                        please visit or contact your barangay office directly.
                    </p>

                    <div className="pt-2">
                        <Link
                            to="/login"
                            className="inline-block w-full py-3 rounded-lg bg-[#005F02] text-white font-bold uppercase tracking-wide hover:bg-[#004A01] transition-colors text-sm"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}