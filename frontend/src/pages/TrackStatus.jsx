import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { trackAssistance, getMyAssistanceRequests } from '../api/client';
import { useAuth } from '../context/AuthContext';

const statusSteps = [
  { key: 'pending', label: 'Received' },
  { key: 'reviewing', label: 'In Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Completed' },
];

const TrackStatus = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const initialRef = searchParams.get('ref') || '';

  const [refInput, setRefInput] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState(null);
  const [error, setError] = useState('');
  const [myRequests, setMyRequests] = useState([]);

  // Fetch recent user requests for one-click lookup
  useEffect(() => {
    if (isAuthenticated) {
      getMyAssistanceRequests()
        .then(res => setMyRequests(res.data || []))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const fetchStatus = async (referenceNumber) => {
    if (!referenceNumber.trim()) return;
    setLoading(true);
    setError('');
    setRequestData(null);

    try {
      const res = await trackAssistance(referenceNumber.trim());
      setRequestData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        `No application found with reference "${referenceNumber}". Please check the code and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      setRefInput(initialRef);
      fetchStatus(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = refInput.trim();
    if (!query) return;
    searchParams.set('ref', query);
    setSearchParams(searchParams);
    fetchStatus(query);
  };

  const handleSelectRecent = (refNum) => {
    setRefInput(refNum);
    searchParams.set('ref', refNum);
    setSearchParams(searchParams);
    fetchStatus(refNum);
  };

  const getStepIndex = (status) => {
    if (status === 'rejected') return -1;
    const idx = statusSteps.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = requestData ? getStepIndex(requestData.status) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
      {/* Clean Dashboard Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 py-6 px-6 sm:px-10 lg:px-12 transition-colors duration-150">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Track Application
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Check real-time progress and intake review status for your requests.
            </p>
          </div>
          <Link
            to="/assistance"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors self-start sm:self-center"
          >
            <span>Apply for aid</span>
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </Link>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 space-y-5">
        {/* Search Box Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-xs transition-colors">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs"></i>
              <input
                type="text"
                placeholder="Enter reference number (e.g. CC-2026-1234)..."
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all font-mono"
              />
              {refInput && (
                <button
                  type="button"
                  onClick={() => { setRefInput(''); setRequestData(null); setError(''); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !refInput.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Track Status'}
            </button>
          </form>

          {/* Quick-select chips from user's submitted applications */}
          {myRequests.length > 0 && !requestData && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Your requests:</span>
              {myRequests.slice(0, 3).map((r) => (
                <button
                  key={r.reference_number}
                  type="button"
                  onClick={() => handleSelectRecent(r.reference_number)}
                  className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {r.reference_number}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 text-center">
            <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-1.5 text-xs">
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">{error}</p>
          </div>
        )}

        {/* Result Card */}
        {requestData ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-xs space-y-6 transition-colors">
            {/* Top Bar: Code + Status Badge */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Reference Code
                </span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono tracking-wider">
                  {requestData.reference_number}
                </span>
              </div>

              <div>
                <span
                  className={
                    requestData.status === 'completed'
                      ? 'px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : requestData.status === 'approved'
                      ? 'px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      : requestData.status === 'rejected'
                      ? 'px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      : 'px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  }
                >
                  {requestData.status_display || requestData.status}
                </span>
              </div>
            </div>

            {/* Stepper (if not rejected) */}
            {requestData.status !== 'rejected' ? (
              <div className="py-2">
                <div className="flex items-center justify-between relative">
                  {/* Connecting line */}
                  <div className="absolute left-6 right-6 top-3.5 h-0.5 bg-slate-100 dark:bg-slate-800 -z-0"></div>
                  <div
                    className="absolute left-6 top-3.5 h-0.5 bg-blue-600 transition-all duration-300 -z-0"
                    style={{
                      width: `${(currentStepIdx / (statusSteps.length - 1)) * 85}%`
                    }}
                  ></div>

                  {statusSteps.map((s, idx) => {
                    const isDone = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={s.key} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isDone
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-400'
                          }`}
                        >
                          {isDone ? (
                            <i className="fa-solid fa-check text-[10px]"></i>
                          ) : (
                            <span className="text-[10px]">{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={`text-[11px] mt-1.5 font-medium ${
                            isCurrent
                              ? 'text-blue-600 dark:text-blue-400 font-bold'
                              : isDone
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-3.5 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                <strong className="block mb-0.5">Application Disapproved or Needs Clarification</strong>
                <p className="text-slate-600 dark:text-slate-400 m-0">
                  {requestData.admin_notes || 'Please contact our helpdesk or visit the municipal desk for more details.'}
                </p>
              </div>
            )}

            {/* Application Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">Program</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                  {requestData.assistance_type_display || requestData.assistance_type}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">Applicant</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                  {requestData.first_name} {requestData.last_name}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">Priority</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  {requestData.urgency_display || requestData.urgency}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">Date Filed</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  {new Date(requestData.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>
            </div>

            {/* Officer Notes if provided */}
            {requestData.admin_notes && (
              <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-3.5 rounded-xl text-xs text-blue-900 dark:text-blue-300">
                <span className="font-semibold text-blue-900 dark:text-blue-200 block mb-0.5">
                  <i className="fa-solid fa-comment-dots text-blue-600 dark:text-blue-400 mr-1.5"></i>
                  Officer Remarks
                </span>
                <p className="text-blue-800 dark:text-blue-300/90 m-0 leading-relaxed">{requestData.admin_notes}</p>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
              <Link to="/contact" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Have questions? Contact Helpdesk
              </Link>
              <Link
                to="/assistance"
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                New Application
              </Link>
            </div>
          </div>
        ) : !error && (
          /* Empty / Default Guidance State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-8 shadow-xs text-center max-w-md mx-auto transition-colors">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3 text-base">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Enter a reference code
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Enter the reference number you received when submitting your application (e.g. <span className="font-mono text-slate-700 dark:text-slate-300">CC-2026-XXXX</span>).
            </p>
            <Link
              to="/assistance"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <span>Need to apply first? Click here</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackStatus;
