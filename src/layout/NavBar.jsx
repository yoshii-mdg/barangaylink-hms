import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Logo } from '../shared';
import { useAuth } from '../core/AuthContext';

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isLoading, getDashboardPath } = useAuth();

  const isLandingPage = location.pathname === '/' || location.pathname === '/home';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/70 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="mx-12 px-5 flex justify-between items-center h-28">
        <Logo variant="navbar" />

        <div className="hidden md:flex gap-16">
          {isLandingPage ? (
            <a
              href="#home"
              onClick={(e) => handleSmoothScroll(e, 'home')}
              className="font-poppins font-semibold text-xl text-white hover:opacity-80 transition-all cursor-pointer"
            >
              HOME
            </a>
          ) : (
            <Link to="/" className="font-poppins font-semibold text-xl text-white hover:opacity-80 transition-all cursor-pointer">
              HOME
            </Link>
          )}
          <Link
            to="/#about"
            onClick={(e) => { if (isLandingPage) handleSmoothScroll(e, 'about'); }}
            className="font-poppins font-semibold text-xl text-white hover:opacity-80 transition-all cursor-pointer"
          >
            ABOUT US
          </Link>
          <Link
            to="/#features"
            onClick={(e) => { if (isLandingPage) handleSmoothScroll(e, 'features'); }}
            className="font-poppins font-semibold text-xl text-white hover:opacity-80 transition-all cursor-pointer"
          >
            FEATURES
          </Link>
        </div>

        <div className="flex gap-3 items-center">
          {!isLoading && (
            isAuthenticated ? (
              <Link
                to={getDashboardPath()}
                className="font-poppins text-white bg-[#005F02] px-5 py-3 rounded-md font-semibold text-lg hover:bg-[#004A01] transition-colors"
              >
                GO TO DASHBOARD
              </Link>
            ) : (
              <>
                <Link to="/login" className="font-poppins px-5 py-3 rounded font-semibold text-lg text-white transition-all">
                  LOGIN
                </Link>
                <Link to="/signup" className="font-poppins text-white bg-[#005F02] px-5 py-3 rounded-md font-semibold text-lg hover:bg-[#004A01] transition-colors">
                  SIGN UP
                </Link>
              </>
            )
          )}
        </div>

        <div className={`absolute bottom-0 left-8 right-8 border-t transition-all ${isScrolled ? 'border-gray-200 opacity-0' : 'border-white opacity-50'}`} />
      </div>
    </nav>
  );
}