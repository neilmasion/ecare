import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ecare_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (choice) => {
    localStorage.setItem('ecare_cookie_consent', choice);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-xl border border-slate-700/80 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 text-sm">
            <i className="fa-solid fa-cookie-bite"></i>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Cookie &amp; Privacy Notice
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              We use essential security and session cookies to authenticate your resident account and protect application data. We do not sell your personal data.{' '}
              <Link to="/privacy" className="text-blue-400 underline hover:text-blue-300">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
          <button
            onClick={() => handleConsent('essential')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={() => handleConsent('accepted')}
            className="btn-primary py-1.5 px-4 text-xs font-semibold"
          >
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
