import React from 'react';
import { Link } from 'react-router-dom';

const privacySections = [
  {
    icon: 'fa-shield-halved',
    color: 'bg-blue-50 text-blue-600',
    title: '1. Our Privacy Commitment',
    content: 'eCare is committed to safeguarding your personal data. We collect only what is strictly necessary to deliver civic services, verify aid eligibility, and coordinate community programs. We never sell, rent, or monetize your personal information.',
  },
  {
    icon: 'fa-folder-open',
    color: 'bg-emerald-50 text-emerald-600',
    title: '2. Information We Collect',
    items: [
      'Contact Details: Full name, verified Gmail address, phone number, and residential address.',
      'Assistance Specifics: Program selected (medical, financial, calamity) and description of your situation.',
      'Supporting Documents: Uploaded files such as government IDs, medical prescriptions, or utility bills.',
      'Security Logs: Anonymized session cookies and login timestamps used strictly for account security.',
    ],
  },
  {
    icon: 'fa-bullseye',
    color: 'bg-indigo-50 text-indigo-600',
    title: '3. Why We Need This Information',
    content: 'Your data is used solely to verify residency, evaluate program qualifications, process clearances, and send status updates regarding your applications. Access is restricted to authorized municipal caseworkers.',
  },
  {
    icon: 'fa-lock',
    color: 'bg-amber-50 text-amber-600',
    title: '4. Security & Encryption',
    content: 'All submitted records are encrypted in transit via SSL/TLS and stored in protected databases. Uploaded documents are stored in isolated, access-restricted storage and are permanently archived according to government retention guidelines.',
  },
  {
    icon: 'fa-user-check',
    color: 'bg-violet-50 text-violet-600',
    title: '5. Your Citizen Rights',
    content: 'You have the right to inspect your submitted records, correct inaccurate details, or request account deactivation. For inquiries regarding your personal data, contact our helpdesk or email privacy@ecare.community.gov.',
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
      {/* Clean Dashboard Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 py-6 px-6 sm:px-10 lg:px-12 transition-colors duration-150">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              How we protect and handle your personal data • Last updated November 2026
            </p>
          </div>
          <Link
            to="/terms"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors self-start sm:self-center"
          >
            <span>View Terms of Use</span>
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </Link>
        </div>
      </section>

      {/* Main Content Workspace */}
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-4">
        {privacySections.map((sec, idx) => (
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
              {sec.content && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {sec.content}
                </p>
              )}
              {sec.items && (
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {sec.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
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

export default PrivacyPolicy;
