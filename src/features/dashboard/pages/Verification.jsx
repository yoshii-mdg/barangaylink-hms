import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../core/supabase';
import { useToast } from '../../../core/ToastContext';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { LuScanLine, LuUpload, LuUser } from 'react-icons/lu';
import { BsQrCodeScan } from 'react-icons/bs';

// ── Mock verification history (replace with real DB queries) ───────────────
const MOCK_HISTORY = [
    { id: 1, name: 'Eloise Bridgerton', status: 'Active', time: '10:48 AM' },
    { id: 2, name: 'Daphne Bridgerton', status: 'Active', time: '10:21 AM' },
    { id: 3, name: 'Hyacinth Bridgerton', status: 'Inactive', time: '09:45 AM' },
    { id: 4, name: 'Colin Bridgerton', status: 'Active', time: '08:02 AM' },
];

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const isActive = status === 'Active';
    return (
        <span className={`text-sm font-medium ${isActive ? 'text-[#2E7D32]' : 'text-red-500'}`}>
            {status}
        </span>
    );
}

// ── QR Scanner viewfinder animation ───────────────────────────────────────
function QRViewfinder({ isScanning }) {
    return (
        <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
            {/* Camera feed placeholder / background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />

            {/* Corner brackets */}
            <div className="relative w-40 h-40">
                {/* Top-left */}
                <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gray-700 rounded-tl-sm" />
                {/* Top-right */}
                <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gray-700 rounded-tr-sm" />
                {/* Bottom-left */}
                <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gray-700 rounded-bl-sm" />
                {/* Bottom-right */}
                <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gray-700 rounded-br-sm" />

                {/* Scanner line */}
                {isScanning && (
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-[#005F02] shadow-[0_0_8px_2px_rgba(0,95,2,0.5)] animate-scan-line" />
                )}

                {/* QR icon in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <BsQrCodeScan className="w-16 h-16 text-gray-400 opacity-60" />
                </div>
            </div>

            {/* CSS animation for scan line */}
            <style>{`
                @keyframes scanLine {
                    0% { top: 0; }
                    50% { top: calc(100% - 2px); }
                    100% { top: 0; }
                }
                .animate-scan-line {
                    animation: scanLine 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

// ── Detail field ───────────────────────────────────────────────────────────
function DetailField({ label, value, half }) {
    return (
        <div className={half ? 'flex-1 min-w-0' : 'w-full'}>
            <p className="text-xs font-semibold text-[#005F02] mb-1">{label}</p>
            <p className="text-sm text-gray-800 pb-2 border-b border-gray-200">{value || '—'}</p>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Verification() {
    const toast = useToast();
    const [isScanning, setIsScanning] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [resident, setResident] = useState(null);
    const [lastVerified, setLastVerified] = useState(null);
    const [history, setHistory] = useState(MOCK_HISTORY);
    const [isLookingUp, setIsLookingUp] = useState(false);
    const fileInputRef = useRef(null);

    // Simulate QR scan toggle
    const handleScanToggle = () => {
        setIsScanning(prev => !prev);
        if (!isScanning) {
            toast.info('Scanner Active', 'Point the camera at a QR code to scan.');
        } else {
            toast.info('Scanner Stopped', 'QR code scanning has been stopped.');
        }
    };

    // Handle QR code image upload (for file-based scanning)
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // In a real implementation, you'd decode the QR from the image
        // For now simulate a lookup
        toast.info('QR Uploaded', 'Processing the uploaded QR code...');
        // Simulate finding a resident
        setTimeout(() => {
            simulateScan('RESIDENT-001');
        }, 1000);
    };

    // Handle manual code submission
    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualCode.trim()) return;
        simulateScan(manualCode.trim());
        setManualCode('');
        setShowManualInput(false);
    };

    // Simulate a QR scan result — replace with real supabase query
    const simulateScan = useCallback(async (code) => {
        setIsLookingUp(true);
        try {
            // Real query would be:
            // const { data } = await supabase
            //   .from('residents_tbl')
            //   .select('*')
            //   .eq('qr_code', code)
            //   .maybeSingle();

            // Mock result for demonstration
            const mockResident = {
                id: code,
                full_name: 'Eloise Bridgerton',
                address: 'Purok 3, Barangay San Bartolome, Quezon City',
                contact_number: '09171234567',
                birthdate: 'May 15, 1998',
                sex: 'Female',
                status: 'Active',
                photo_url: null,
            };

            setResident(mockResident);
            const now = new Date();
            setLastVerified(now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }));

            // Add to history
            setHistory(prev => [
                {
                    id: Date.now(),
                    name: mockResident.full_name,
                    status: mockResident.status,
                    time: now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
                },
                ...prev.slice(0, 9),
            ]);

            toast.success('Resident Verified', `${mockResident.full_name} — ${mockResident.status}`);
        } catch (err) {
            toast.error('Not Found', 'No resident found for this QR code.');
            setResident(null);
        } finally {
            setIsLookingUp(false);
        }
    }, [toast]);

    return (
        <div className="min-h-screen flex bg-[#F3F7F3]">
            <DashboardSidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <DashboardHeader title="QR Verification" />

                <main className="flex-1 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 h-full">

                        {/* ── Left panel: Scanner ── */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
                            <h2 className="text-base font-bold text-gray-900">Scan QR Code</h2>

                            {/* Viewfinder */}
                            <QRViewfinder isScanning={isScanning} />

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleScanToggle}
                                    className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-colors ${
                                        isScanning
                                            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                            : 'bg-[#005F02] text-white hover:bg-[#004A01]'
                                    }`}
                                >
                                    <LuScanLine className="w-4 h-4" />
                                    {isScanning ? 'Stop Scanning' : 'Scan QR Code'}
                                </button>

                                <button
                                    onClick={() => setShowManualInput(!showManualInput)}
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
                                        onChange={e => setManualCode(e.target.value)}
                                        placeholder="Enter resident QR code"
                                        className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]/20 focus:border-[#005F02]"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="h-9 px-4 rounded-lg bg-[#005F02] text-white text-sm font-medium hover:bg-[#004A01] transition-colors"
                                    >
                                        Verify
                                    </button>
                                </form>
                            )}

                            {/* Verification History */}
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Verification History</h3>
                                <div className="space-y-0 divide-y divide-gray-50">
                                    {history.length === 0 ? (
                                        <p className="text-xs text-gray-400 py-3">No verifications yet today.</p>
                                    ) : history.map((entry) => (
                                        <div key={entry.id} className="flex items-center justify-between py-2.5">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="text-sm text-gray-800 truncate font-medium">{entry.name}</span>
                                                <span className="text-gray-300">—</span>
                                                <StatusBadge status={entry.status} />
                                            </div>
                                            <span className="text-xs text-gray-400 ml-3 shrink-0">{entry.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Right panel: Resident Details ── */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                            {/* Photo area */}
                            <div className="bg-[#F3F7F3] flex flex-col items-center justify-center py-10 border-b border-gray-100">
                                <div className="w-28 h-28 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shadow-sm">
                                    {resident?.photo_url ? (
                                        <img src={resident.photo_url} alt="Resident" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                            <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
                                                <circle cx="40" cy="40" r="40" fill="#9ca3af" />
                                                <ellipse cx="40" cy="32" rx="14" ry="14" fill="#6b7280" />
                                                <ellipse cx="40" cy="70" rx="22" ry="18" fill="#6b7280" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-3 text-sm font-semibold text-gray-700">
                                    {resident?.full_name || '—'}
                                </p>
                            </div>

                            {/* Details */}
                            <div className="flex-1 p-6 space-y-5">
                                {/* Last verified */}
                                <p className="text-sm text-gray-500 pb-4 border-b border-gray-100">
                                    <span className="font-semibold text-gray-700">Last Verified:</span>{' '}
                                    {lastVerified ?? '—'}
                                </p>

                                <h3 className="text-base font-bold text-gray-900">Resident Details</h3>

                                <div className="space-y-4">
                                    <DetailField label="Full Name" value={resident?.full_name} />
                                    <DetailField label="Address" value={resident?.address} />
                                    <DetailField label="Contact Number" value={resident?.contact_number} />
                                    <div className="flex gap-6">
                                        <DetailField label="Birthdate" value={resident?.birthdate} half />
                                        <DetailField label="Sex" value={resident?.sex} half />
                                    </div>
                                </div>

                                {/* Upload QR code button */}
                                <div className="pt-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isLookingUp}
                                        className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-[#F3F7F3] border border-gray-200 text-sm font-medium text-gray-600 hover:bg-[#E8F5E9] hover:border-[#005F02]/30 hover:text-[#005F02] transition-colors disabled:opacity-50"
                                    >
                                        <LuUpload className="w-4 h-4" />
                                        {isLookingUp ? 'Processing...' : 'Upload QR Code'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}