import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Logo } from '../shared'

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHomeClick = (e) => {
    if (isLandingPage) {
      handleSmoothScroll(e, 'home');
    } else {
      // Will navigate via Link, so don't prevent default
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/70 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="mx-12 px-5 flex justify-between items-center h-28">
        {/* Logo Section */}
        <Logo variant="navbar" />

        {/* Navigation Links */}
        <div className="hidden md:flex gap-30">
          {isLandingPage ? (
            <a href="#home" onClick={handleHomeClick} className={`font-poppins font-semibold text-xl hover:opacity-80 transition-all cursor-pointer ${
              isScrolled ? 'text-white' : 'text-white'
            }`}>HOME</a>
          ) : (
            <Link to="/" className={`font-poppins font-semibold text-xl hover:opacity-80 transition-all cursor-pointer ${
              isScrolled ? 'text-white' : 'text-white'
            }`}>HOME</Link>
          )}
          <Link
            to="/#about"
            onClick={(e) => {
              if (isLandingPage) {
                e.preventDefault();
                handleSmoothScroll(e, 'about');
              }
            }}
            className={`font-poppins font-semibold text-xl hover:opacity-80 transition-all cursor-pointer ${
              isScrolled ? 'text-white' : 'text-white'
            }`}
          >
            ABOUT US
          </Link>
          <Link
            to="/#features"
            onClick={(e) => {
              if (isLandingPage) {
                e.preventDefault();
                handleSmoothScroll(e, 'features');
              }
            }}
            className={`font-poppins font-semibold text-xl hover:opacity-80 transition-all cursor-pointer ${
              isScrolled ? 'text-white' : 'text-white'
            }`}
          >
            FEATURES
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex gap-3 items-center">
          <Link to="/login" className={`font-poppins px-5 py-3 rounded font-semibold text-lg transition-all ${
            isScrolled ? 'text-white' : 'text-white'
          }`}>LOGIN</Link>
          <Link to="/signup" className="font-poppins text-white bg-[#005F02] px-5 py-3 rounded-md font-semibold text-lg hover:bg-[#004A01] transition-colors">SIGN UP</Link>
        </div>

        {/* Border line */}
        <div className={`absolute bottom-0 left-30 right-30 border-t transition-all ${
          isScrolled ? 'border-gray-200 opacity-0' : 'border-white opacity-50'
        }`}></div>
      </div>
    </nav>
  );
}
