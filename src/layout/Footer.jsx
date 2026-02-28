import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#000000] via-[#003A01] to-[#005F02] flex flex-col sm:flex-row justify-between items-center w-full py-6 sm:py-8 text-white gap-3 sm:gap-0 px-6 sm:px-12">
      <div>
        <p className="text-sm text-center sm:text-left">
          © {new Date().getFullYear()} BarangayLink. All rights reserved.
        </p>
      </div>
      <div className="flex justify-center gap-6">
        <Link to="/privacy" className="text-sm hover:underline transition-all">Privacy</Link>
        <Link to="/terms" className="text-sm hover:underline transition-all">Terms</Link>
        <Link to="/contact" className="text-sm hover:underline transition-all">Contact Us</Link>
      </div>
    </footer>
  );
}