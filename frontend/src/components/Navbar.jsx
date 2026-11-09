import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMobileMenu();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/services', label: 'Services' },
    { to: '/assistance', label: 'Assistance' },
    { to: '/track', label: 'Track Status' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header
      className={`sticky top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md transition-all duration-150 ${
        isScrolled
          ? 'border-b border-slate-200 shadow-xs'
          : 'border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between h-14">
          {/* Minimal Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 no-underline group shrink-0"
            onClick={closeMobileMenu}
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs shadow-xs group-hover:bg-blue-700 transition-colors">
              <i className="fa-solid fa-hand-holding-heart"></i>
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              e<span className="text-blue-600">Care</span>
            </span>
          </Link>

          {/* Minimal Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/dashboard"
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 flex items-center gap-2 transition-colors border border-slate-200"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.first_name || user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors text-xs"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
              </div>
            ) : (
              <Link
                to="/account"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark text-lg' : 'fa-bars text-lg'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-5 py-3 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`
              }
              onClick={closeMobileMenu}
            >
              {label}
            </NavLink>
          ))}

          <div className="pt-2 border-t border-slate-100 mt-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between py-1">
                <Link
                  to="/dashboard"
                  className="text-xs font-semibold text-blue-600 hover:underline"
                  onClick={closeMobileMenu}
                >
                  Dashboard ({user?.first_name || user?.username})
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-600 hover:underline font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/account"
                className="block text-center w-full py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                onClick={closeMobileMenu}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
