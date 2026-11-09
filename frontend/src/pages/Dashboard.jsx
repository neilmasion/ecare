import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAssistanceRequests } from '../api/client';
import { DashboardRowSkeleton } from '../components/Skeleton';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    getMyAssistanceRequests()
      .then(res => setRequests(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const firstName = user?.first_name || (user?.username ? user.username.split('@')[0] : 'Resident');
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 'reviewing').length;
  const completedCount = requests.filter(r => r.status === 'approved' || r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
      {/* Clean Welcome Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 py-6 px-6 sm:px-10 lg:px-12 transition-colors duration-150">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome back, {displayName}!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Here is an overview of your community requests and services.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/assistance"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              <span>New Request</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Workspace */}
      <div className="max-w-5xl mx-auto py-6 px-6 sm:px-10 lg:px-12 space-y-6">
        {/* Verification Alert Banner */}
        {user?.verification?.status !== 'verified' && (
          <div className="bg-amber-500/10 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs shrink-0">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  You need to verify yourself
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Please verify your resident identity with a valid ID to unlock full civic assistance &amp; clearance dispatch.
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <span>Verify Myself</span>
              <i className="fa-solid fa-arrow-right text-[9px]"></i>
            </Link>
          </div>
        )}

        {/* Simple Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4.5 border border-slate-200/60 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Requests</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{requests.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
              <i className="fa-solid fa-folder-open"></i>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4.5 border border-slate-200/60 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">In Review</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
              <i className="fa-solid fa-clock"></i>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4.5 border border-slate-200/60 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{completedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
        </div>

        {/* Quick Services */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-0.5">
            Quick Services
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/assistance"
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600/50 hover:shadow-xs transition-all group flex flex-col items-center text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm mb-2 group-hover:scale-105 transition-transform">
                <i className="fa-solid fa-hand-holding-heart"></i>
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Financial &amp; Medical Aid</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Apply for support</span>
            </Link>

            <Link
              to="/services?category=clearance"
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-xs transition-all group flex flex-col items-center text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm mb-2 group-hover:scale-105 transition-transform">
                <i className="fa-solid fa-stamp"></i>
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Barangay Clearance</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Request certificate</span>
            </Link>

            <Link
              to="/track"
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600/50 hover:shadow-xs transition-all group flex flex-col items-center text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm mb-2 group-hover:scale-105 transition-transform">
                <i className="fa-solid fa-magnifying-glass"></i>
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Track Status</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Lookup by code</span>
            </Link>

            <Link
              to="/contact"
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-600/50 hover:shadow-xs transition-all group flex flex-col items-center text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm mb-2 group-hover:scale-105 transition-transform">
                <i className="fa-solid fa-headset"></i>
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Helpdesk</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Inquiries &amp; assistance</span>
            </Link>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs p-5 sm:p-6 transition-colors">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 gap-2 mb-3.5">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">My Applications</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your recent submissions and their current status</p>
            </div>
            <Link
              to="/track"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Lookup Code</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[1, 2, 3].map((i) => (
                <DashboardRowSkeleton key={i} />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-2.5 text-base">
                <i className="fa-regular fa-folder-open"></i>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">No applications yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4 leading-relaxed">
                When you apply for financial aid, medical assistance, or clearances, you will be able to track their progress here.
              </p>
              <Link
                to="/assistance"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                <span>Submit Your First Request</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {requests.map((req) => (
                <div
                  key={req.id || req.reference_number}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                        {req.reference_number}
                      </span>
                      <span
                        className={
                          req.status === 'completed'
                            ? 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : req.status === 'approved'
                            ? 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : req.status === 'rejected'
                            ? 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }
                      >
                        {req.status_display || req.status}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {req.assistance_type_display || req.assistance_type}
                    </div>

                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
                      Submitted on {new Date(req.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </div>
                  </div>

                  <Link
                    to={`/track?ref=${encodeURIComponent(req.reference_number)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 self-start sm:self-center transition-colors"
                  >
                    <span>View Details</span>
                    <i className="fa-solid fa-chevron-right text-[9px] text-slate-400"></i>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
