import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import ScanQRCode from '../components/qrVerification/ScanQRCode';
import UploadQRCode from '../components/qrVerification/UploadQRCode';

export default function QRVerification() {
  const handleVerify = (code) => {
    console.log('QR Code verified:', code);
  };

  return (
    <div className="flex h-screen bg-[#F3F7F3]">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="QR Verification" />
        <div className="flex-1 overflow-auto">
          <div className="p-3 mx-auto w-full max-w-7xl">

            {/* Main Content */}
            <div className="mt-2 flex flex-col md:flex-row gap-6">
              {/* Left: QR Scan Component */}
              <ScanQRCode onVerify={handleVerify} />

              {/* Right: Upload QR Code Component */}
              <UploadQRCode onUpload={(data, filename) => {
                console.log('QR Code uploaded:', filename);
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
