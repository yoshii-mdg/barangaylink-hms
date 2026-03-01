import { useState } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { ScanQRCode, UploadQRCode } from '../components/qrverification';

export default function QRVerification() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleVerify = (_code) => {
    // Future: look up resident by QR code from Supabase
  };

  const handleUpload = (_data, _filename) => {
    // Future: decode QR from uploaded image
  };

  return (
    <div className="flex h-screen bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title="Verification"
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <main className="flex-1 overflow-auto">
          <div className="p-5 mx-auto w-full max-w-7xl">
            <div className="mt-2 flex flex-col md:flex-row gap-6">
              <ScanQRCode onVerify={handleVerify} />
              <UploadQRCode onUpload={handleUpload} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}