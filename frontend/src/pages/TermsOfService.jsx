import React from 'react';
import { Link } from 'react-router-dom';

const termsSections = [
  {
    icon: 'fa-handshake',
    color: 'bg-blue-50 text-blue-600',
    title: '1. Acceptance of Terms',
    content: 'By accessing eCare, submitting assistance applications, or requesting official barangay documents, you agree to these Terms of Service. These guidelines ensure public services are distributed fairly, transparently, and securely.',
  },
  {
    icon: 'fa-circle-check',
    color: 'bg-emerald-50 text-emerald-600',
    title: '2. Accurate Information & Truthful Filing',
    content: 'All residents must provide accurate and verifiable information. Submitting falsified IDs, altered medical prescriptions, or fraudulent income declarations violates community welfare policies and will result in immediate application rejection.',
  },
  {
    icon: 'fa-certificate',
    color: 'bg-indigo-50 text-indigo-600',
    title: '3. Digital Clearances & Permits',
    content: 'Official barangay clearances and certifications generated through eCare carry digital verification tags. They are official government instruments and any unauthorized alteration or forgery is subject to legal action.',
  },
  {
    icon: 'fa-shield',
    color: 'bg-amber-50 text-amber-600',
    title: '4. Responsible System Use',
    content: 'Users agree not to exploit the portal, send automated spam, attempt unauthorized access into other residents’ files, or disrupt municipal servers. Security monitoring and rate limits are enforced on all accounts.',
  },
  {
    icon: 'fa-scale-balanced',
    color: 'bg-violet-50 text-violet-600',
    title: '5. Caseworker Review & Triage',
    content: 'Submitting an application initiates formal review by intake officers. Approval and disbursement depend on verified statutory eligibility, document completeness, and allocated municipal assistance budgets.',
  },
];

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
      {/* Clean Dashboard Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 py-6 px-6 sm:px-10 lg:px-12 transition-colors duration-150">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Terms of Use
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Citizen service charter and platform rules • Last updated November 2026
            </p>
          </div>
          <Link
            to="/privacy"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors self-start sm:self-center"
          >
            <span>View Privacy Policy</span>
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </Link>
        </div>
      </section>

      {/* Main Content Workspace */}
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-4">
        {termsSections.map((sec, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex items-start gap-4 transition-colors"
          >
            <div className={`w-9 h-9 rounded-xl ${sec.color} dark:bg-opacity-20 flex items-center justify-center text-xs shrink-0 mt-0.5`}>
              <i className={`fa-solid ${sec.icon}`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                {sec.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {sec.content}
              </p>
            </div>
          </div>
        ))}

        <div className="pt-2 pb-6 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i>
            <span>Back to Dashboard</span>
          </Link>
          <span>eCare Community Connect</span>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
