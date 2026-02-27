import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#000000] via-[#003A01] to-[#005F02] flex justify-between w-full py-8 text-white text-center">
      <div className="ml-12">
        <p className="text-sm mt-1">© {new Date().getFullYear()} BarangayLink. All rights reserved.</p>
      </div>
      <div className="flex justify-center gap-6 mt-1 mr-12">
        <Link to="/privacy" className="text-sm hover:underline transition-all">Privacy</Link>
        <Link to="/terms" className="text-sm hover:underline transition-all">Terms</Link>
        <Link to="/contact" className="text-sm hover:underline transition-all">Contact Us</Link>
      </div>
    </footer>
  );
}