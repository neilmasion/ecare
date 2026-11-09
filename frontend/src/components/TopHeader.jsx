import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const getPageMeta = (pathname) => {
  switch (pathname) {
    case '/':
    case '/dashboard':
      return { title: 'Resident Dashboard', subtitle: 'Overview of your applications & community services' };
    case '/services':
      return { title: 'Services Catalog', subtitle: 'Barangay & Municipal Public Services' };
    case '/assistance':
      return { title: 'Request Assistance', subtitle: 'Financial, Medical & Emergency Intake' };
    case '/track':
      return { title: 'Application Tracker', subtitle: 'Real-Time Status Lookup' };
    case '/about':
      return { title: 'About eCare', subtitle: 'Mission, Leadership & Public Governance' };
    case '/contact':
      return { title: 'Citizen Helpdesk', subtitle: 'Get in Touch with Municipal Support' };
    case '/account':
      return { title: 'Resident Account', subtitle: 'Sign In or Register' };
    case '/privacy':
      return { title: 'Privacy Policy', subtitle: 'Citizen Data Protection Standards' };
    case '/terms':
      return { title: 'Terms of Service', subtitle: 'Public Service Usage Charter' };
    case '/profile':
      return { title: 'Resident Profile', subtitle: 'Account Verification & Personal Details' };
    default:
      return { title: 'Dashboard', subtitle: 'eCare Citizen Portal' };
  }
};

const TopHeader = ({ onOpenSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unread, setUnread] = useState(true);

  const meta = getPageMeta(location.pathname);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // If query starts with CC- or looks like a reference code, jump straight to track
    if (query.toUpperCase().startsWith('CC-') || /^[A-Z0-9-]{6,}$/i.test(query)) {
      navigate(`/track?ref=${encodeURIComponent(query)}`);
    } else {
      navigate(`/services?search=${encodeURIComponent(query)}`);
    }
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-colors duration-150">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar menu"
        >
          <i className="fa-solid fa-bars text-lg"></i>
        </button>

        <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {meta.title}
        </h1>
      </div>

      {/* Middle / Right: Quick Search + Fast Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Search */}
        <form onSubmit={handleSearch} className="relative hidden md:block w-56 lg:w-64">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or enter tracking code..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </form>

        {/* Theme Switcher Pill (Matching Reference Design with Smooth Slower Transition) */}
        <div
          onClick={toggleTheme}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleTheme(); }}
          className="relative flex items-center bg-slate-100 dark:bg-[#10121a] border border-slate-200 dark:border-white/[0.08] p-0.5 rounded-full cursor-pointer transition-colors duration-500 ease-in-out select-none shadow-xs group"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle dark mode"
        >
          {/* Active sliding indicator thumb */}
          <div
            className={`absolute h-6 w-6 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-sm ${
              isDark
                ? 'translate-x-6 bg-[#202533] text-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.35)]'
                : 'translate-x-0 bg-white text-amber-500 shadow-xs'
            }`}
          />
          <span
            className={`relative z-10 w-6 h-6 flex items-center justify-center text-xs transition-all duration-500 ease-in-out ${
              !isDark
                ? 'text-amber-500 scale-110 rotate-0'
                : 'text-slate-500 hover:text-slate-400 scale-90 rotate-45'
            }`}
          >
            <i className="fa-regular fa-sun text-[11px]"></i>
          </span>
          <span
            className={`relative z-10 w-6 h-6 flex items-center justify-center text-xs transition-all duration-500 ease-in-out ${
              isDark
                ? 'text-blue-400 scale-110 rotate-0 drop-shadow-[0_0_6px_rgba(96,165,250,0.6)]'
                : 'text-slate-400 hover:text-slate-600 scale-90 -rotate-12'
            }`}
          >
            <i className="fa-solid fa-moon text-[11px]"></i>
          </span>
        </div>

        {/* Notification Bell & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(prev => !prev);
              if (unread) setUnread(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
            aria-label="View notifications"
          >
            <i className="fa-regular fa-bell text-sm"></i>
            {unread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900"></span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showNotifications && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              ></div>

              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                      Live
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUnread(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 text-xs mt-0.5">
                      <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">Account Active &amp; Verified</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Your resident account is ready to submit aid and clearance requests.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-xs mt-0.5">
                      <i className="fa-solid fa-clock"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">Intake Desk Operating</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Standard review turnaround is 24–48 hours from submission.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">1 hr ago</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    to="/track"
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline block py-1"
                  >
                    Track All Filed Applications →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Status / Avatar */}
        {isAuthenticated ? (
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Resident Profile & Verification"
          >
            <div className="relative">
              {user?.profile?.avatar_url ? (
                <img
                  src={user.profile.avatar_url}
                  alt={user?.first_name || 'Resident'}
                  className="w-7 h-7 rounded-full object-cover shadow-xs ring-1 ring-slate-200 dark:ring-slate-700"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                </div>
              )}
              {user?.verification?.status !== 'verified' && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse ring-2 ring-white dark:ring-slate-900" />
              )}
            </div>
          </Link>
        ) : (
          <Link
            to="/account"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 shadow-xs transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default TopHeader;
