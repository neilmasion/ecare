import React from 'react';

export const ServiceCardSkeleton = () => (
  <div className="card p-5 animate-pulse space-y-4 dark:bg-slate-900 dark:border-slate-800">
    <div className="flex justify-between items-center">
      <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
    </div>
    <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
    <div className="space-y-2">
      <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
      <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
    </div>
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
      <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
    </div>
  </div>
);

export const DashboardRowSkeleton = () => (
  <div className="py-4 flex justify-between items-center animate-pulse">
    <div className="space-y-2">
      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
      <div className="h-3 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
    </div>
    <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
  </div>
);

export const PageLoadingSkeleton = () => (
  <div className="pt-24 min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4">
    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/50 animate-spin flex items-center justify-center text-blue-600 dark:text-blue-400 text-lg">
      <i className="fa-solid fa-spinner"></i>
    </div>
    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
      Loading Secure Portal...
    </p>
  </div>
);
