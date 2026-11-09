import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    if (setMobileOpen) setMobileOpen(false);
    navigate('/');
  };

  const closeSidebar = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  const navGroups = [
    {
      title: 'Menu',
      items: [
        { to: '/', label: 'Dashboard', icon: 'fa-gauge-high', end: true },
        { to: '/profile', label: 'My Profile', icon: 'fa-id-card' },
        { to: '/services', label: 'Services', icon: 'fa-shapes' },
        { to: '/assistance', label: 'Apply for Aid', icon: 'fa-hand-holding-heart' },
        { to: '/track', label: 'Track Status', icon: 'fa-magnifying-glass' },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        { to: '/contact', label: 'Helpdesk', icon: 'fa-headset' },
        { to: '/about', label: 'About eCare', icon: 'fa-circle-info' },
        { to: '/privacy', label: 'Privacy Policy', icon: 'fa-shield-halved' },
        { to: '/terms', label: 'Terms of Use', icon: 'fa-file-lines' },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors duration-150">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Link
          to="/"
          onClick={closeSidebar}
          className="flex items-center gap-2.5 no-underline group"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
            <i className="fa-solid fa-hand-holding-heart text-sm"></i>
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">
              e<span className="text-blue-600 dark:text-blue-400">Care</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none block">
              Citizen Portal
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={closeSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
          aria-label="Close sidebar"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* Scrollable Nav Items */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3.5 py-4 space-y-5">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-0.5">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              {group.title}
            </h3>
            {group.items.map((item) => {
              const isItemActive =
                item.to === '/'
                  ? location.pathname === '/' || location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeSidebar}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isItemActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <i
                      className={`fa-solid ${item.icon} text-xs w-4 text-center ${
                        isItemActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                    ></i>
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        ))}

        {/* Emergency Hotline Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/20 border border-rose-100 dark:border-rose-900/30 text-slate-800 dark:text-slate-200 space-y-1.5">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>Emergency 24/7</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
            For critical medical, fire, or police assistance:
          </p>
          <a
            href="tel:911"
            className="inline-flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400 hover:underline"
          >
            <i className="fa-solid fa-phone"></i>
            <span>Dial 911 (Toll-Free)</span>
          </a>
        </div>
      </div>

      {/* Bottom User Profile Section with Sign Out */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/profile"
            onClick={closeSidebar}
            className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity group"
            title="View Profile & Verification"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                  user?.verification?.status === 'verified' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
                title={user?.verification?.status === 'verified' ? 'Verified Resident' : 'Needs Verification'}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {user?.first_name || user?.username || 'Resident'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1">
                {user?.verification?.status === 'verified' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Verified</span>
                ) : (
                  <span className="text-amber-500 font-medium">Needs Verification</span>
                )}
              </p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-200/80 dark:border-slate-800 shrink-0 z-40 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={closeSidebar}
          ></div>

          {/* Drawer Canvas */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 shadow-xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
