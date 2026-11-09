import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-4 mt-auto transition-colors">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        <p className="text-center sm:text-left m-0">
          © {new Date().getFullYear()} eCare • Developed by{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">Neil Masion</span>
        </p>

        <div className="flex items-center gap-3.5 text-xs font-medium">
          <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Privacy
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Terms
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Helpdesk
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
