import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { GiElephant } from 'react-icons/gi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-[var(--color-paper-dark)]/90 backdrop-blur-sm border-b-2 border-gold sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <GiElephant className="text-3xl text-maroon" />
            <span className="font-heading text-2xl sm:text-3xl font-bold text-maroon">
              गणपती वही
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-ink-light hover:text-maroon transition-colors font-subheading no-underline text-lg"
            >
              Home
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-ink-light hover:text-maroon transition-colors font-subheading no-underline text-lg"
                >
                  My Books
                </Link>
                <Link
                  to="/profile"
                  className="text-ink-light hover:text-maroon transition-colors font-subheading no-underline text-lg"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-ink-light hover:text-maroon transition-colors font-subheading no-underline text-lg">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-sm no-underline">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-ink text-2xl p-1 bg-transparent border-none cursor-pointer"
          >
            {mobileOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>

        {/* Mobile menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0 pb-0'
          }`}
        >
          <div className="flex flex-col gap-3 pt-2">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="text-ink-light hover:text-maroon font-subheading py-2 no-underline text-xl border-b border-paper-aged"
            >
              Home
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="text-ink-light hover:text-maroon font-subheading py-2 no-underline text-xl border-b border-paper-aged"
                >
                  My Books
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="text-ink-light hover:text-maroon font-subheading py-2 no-underline text-xl border-b border-paper-aged"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm w-full mt-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-ink-light hover:text-maroon font-subheading py-2 no-underline text-xl border-b border-paper-aged"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary text-sm w-full mt-2 text-center no-underline border-b border-transparent"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
