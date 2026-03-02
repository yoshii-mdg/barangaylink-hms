/**
 * Verification.jsx
 *
 * Issues fixed vs. original:
 * 1. Removed all MOCK_HISTORY — real verification history from verification_logs_tbl.
 * 2. simulateScan replaced with real verifyQrCode() from verificationService.
 * 3. Resident display fields now use correct DB column names:
 *    - `full_name` (composed in service) ✓
 *    - `address`   (composed in service) ✓
 *    - `contact_number` ✓  (NOT `contact_no`)
 *    - `sex` maps to `gender` column → service maps it ✓
 *    - `birthdate` formatted in service ✓
 * 4. Removed stray console.log() calls.
 * 5. Added real Supabase integration via verificationService.
 * 6. Log insertion for each scan (success + failure) is handled in service.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../../../core/ToastContext';
import { useAuth } from '../../../core/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { verifyQrCode, fetchVerificationHistory } from '../../../services/qrverificationService';
import { LuScanLine, LuUpload, LuUser } from 'react-icons/lu';
import { BsQrCodeScan } from 'react-icons/bs';

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const isActive = status === 'Active';
  return (
    <span
      className={`text-sm font-medium ${
        isActive ? 'text-emerald-600' : 'text-red-500'
      }`}
    >
      {status}
    </span>
  );
}

// ── Small detail field ─────────────────────────────────────────────────────
function DetailField({ label, value, half }) {
  return (
    <div className={half ? 'flex-1 min-w-0' : ''}>
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900 truncate">{value || '—'}</p>
    </div>
  );
}

export default function Verification() {
  const toast = useToast();
  const { userProfile } = useAuth();

  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [resident, setResident] = useState(null);
  const [lastVerified, setLastVerified] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fileInputRef = useRef(null);
  const verifiedByUserId = userProfile?.id ?? null;

  // ── Load verification history ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setHistoryLoading(true);
      try {
        const data = await fetchVerificationHistory(10);
        if (!cancelled) setHistory(data);
      } catch {
        // Non-critical — don't show error
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Core lookup ──────────────────────────────────────────────────────────
  const lookupCode = useCallback(
    async (code, method = 'manual') => {
      if (!code?.trim()) return;
      setIsLookingUp(true);
      try {
        const result = await verifyQrCode(code.trim(), verifiedByUserId, method);

        if (!result) {
          toast.error('Not Found', 'No active resident found for this QR code.');
          return;
        }

        setResident(result);
        const now = new Date();
        setLastVerified(
          now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
        );

        // Prepend to history
        setHistory((prev) => [
          {
            id: Date.now(),
            name: result.full_name,
            status: result.status,
            time: now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
            isValid: result.status === 'Active',
          },
          ...prev.slice(0, 9),
        ]);

        toast.success('Resident Verified', `${result.full_name} — ${result.status}`);
      } catch (err) {
        toast.error('Lookup Failed', err.message);
      } finally {
        setIsLookingUp(false);
      }
    },
    [toast, verifiedByUserId]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleToggleScan = () => {
    setIsScanning((prev) => {
      const next = !prev;
      if (next) {
        toast.info('Scanner Active', 'Point the camera at a resident QR code.');
      } else {
        toast.info('Scanner Stopped', 'QR code scanning has been stopped.');
      }
      return next;
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.info('QR Uploaded', 'Processing the uploaded QR code…');
    // In a full implementation, use a QR decoding library (e.g. jsQR) here.
    // For now we treat the filename minus extension as the code (dev placeholder).
    const code = file.name.replace(/\.[^/.]+$/, '');
    await lookupCode(code, 'upload');
    // Reset input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const code = manualCode.trim();
    setManualCode('');
    setShowManualInput(false);
    await lookupCode(code, 'manual');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Verification" />

        <main className="flex-1 overflow-auto p-5">
          <div className="h-full flex flex-col lg:flex-row gap-5 max-w-6xl mx-auto">

            {/* Left: Scanner panel */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <BsQrCodeScan className="w-5 h-5 text-[#005F02]" />
                <h2 className="text-base font-semibold text-gray-800">QR Code Scanner</h2>
              </div>

              {/* Camera viewport */}
              <div
                className={`relative rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center
                  ${isScanning ? 'ring-2 ring-[#005F02]' : ''}`}
              >
                {isScanning ? (
                  <div className="text-center text-white">
                    {/* Placeholder — integrate a real QR scanner library here */}
                    <BsQrCodeScan className="w-16 h-16 mx-auto mb-3 opacity-50 animate-pulse" />
                    <p className="text-sm opacity-75">Camera active — point at QR code</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <BsQrCodeScan className="w-16 h-16 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Press "Scan QR Code" to start camera</p>
                  </div>
                )}

                {isLookingUp && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <p className="text-white text-sm font-medium">Looking up resident…</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleToggleScan}
                  className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-colors
                    ${
                      isScanning
                        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                        : 'bg-[#005F02] text-white hover:bg-[#004A01]'
                    }`}
                >
                  <LuScanLine className="w-4 h-4" />
                  {isScanning ? 'Stop Scanning' : 'Scan QR Code'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowManualInput((v) => !v)}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Enter Code Manually
                </button>
              </div>

              {/* Manual input */}
              {showManualInput && (
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Enter resident QR code"
                    aria-label="Resident QR code"
                    className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]/20 focus:border-[#005F02]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!manualCode.trim() || isLookingUp}
                    className="h-9 px-4 rounded-lg bg-[#005F02] text-white text-sm font-medium hover:bg-[#004A01] transition-colors disabled:opacity-50"
                  >
                    Verify
                  </button>
                </form>
              )}

              {/* Verification History */}
              <div className="flex-1 overflow-auto">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Verification History
                </h3>
                {historyLoading ? (
                  <p className="text-xs text-gray-400 text-center py-4">Loading…</p>
                ) : history.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No verifications yet today.
                  </p>
                ) : (
                  <div className="space-y-0 divide-y divide-gray-50">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2.5 px-1"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <LuUser className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <span className="text-sm font-medium text-gray-800 truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                          <StatusBadge status={item.status} />
                          <span className="text-xs text-gray-400">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Resident info panel */}
            <div className="lg:w-80 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <LuUser className="w-5 h-5 text-[#005F02]" />
                <h2 className="text-base font-semibold text-gray-800">Resident Info</h2>
              </div>

              {resident ? (
                <>
                  {/* Photo */}
                  <div className="flex justify-center">
                    {resident.photo_url ? (
                      <img
                        src={resident.photo_url}
                        alt={`Photo of ${resident.full_name}`}
                        className="w-24 h-24 rounded-full object-cover border-2 border-[#005F02]"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                        <LuUser className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <StatusBadge status={resident.status} />
                    {lastVerified && (
                      <p className="text-xs text-gray-400 mt-1">Verified at {lastVerified}</p>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-gray-900">Resident Details</h3>

                  <div className="space-y-4">
                    <DetailField label="Full Name" value={resident.full_name} />
                    <DetailField label="Address" value={resident.address} />
                    <DetailField label="Contact Number" value={resident.contact_number} />
                    <div className="flex gap-6">
                      <DetailField label="Birthdate" value={resident.birthdate} half />
                      <DetailField label="Sex" value={resident.sex} half />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-10">
                  <BsQrCodeScan className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">Scan or enter a QR code to verify a resident.</p>
                </div>
              )}

              {/* Upload QR code button */}
              <div className="pt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  aria-label="Upload QR code image"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLookingUp}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-[#F3F7F3] border border-gray-200 text-sm font-medium text-gray-600 hover:bg-[#E8F5E9] hover:border-[#005F02]/30 hover:text-[#005F02] transition-colors disabled:opacity-50"
                >
                  <LuUpload className="w-4 h-4" />
                  {isLookingUp ? 'Processing…' : 'Upload QR Code Image'}
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}