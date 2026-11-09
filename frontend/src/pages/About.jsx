import React from 'react';
import { Link } from 'react-router-dom';

const principles = [
  {
    icon: 'fa-universal-access',
    color: 'bg-blue-50 text-blue-600',
    title: 'Accessible to Everyone',
    desc: 'Built to run smoothly on any smartphone or computer with fast loading and simple navigation.',
  },
  {
    icon: 'fa-magnifying-glass',
    color: 'bg-emerald-50 text-emerald-600',
    title: 'Transparent Tracking',
    desc: 'Every application gets a unique reference code so you can follow case updates without calling or visiting in person.',
  },
  {
    icon: 'fa-shield-halved',
    color: 'bg-indigo-50 text-indigo-600',
    title: 'Strict Data Privacy',
    desc: 'Personal resident records, medical receipts, and official documents are securely stored and verified.',
  },
];

const howItWorks = [
  {
    step: '1',
    title: 'Browse Services',
    desc: 'Find clearances, medical aid, or community assistance programs.',
  },
  {
    step: '2',
    title: 'Apply in Minutes',
    desc: 'Fill out a simple form with your pre-filled contact details.',
  },
  {
    step: '3',
    title: 'Track Live',
    desc: 'Use your tracking code to follow review status until completion.',
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
      {/* Clean Dashboard Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 py-6 px-6 sm:px-10 lg:px-12 transition-colors duration-150">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              About eCare
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              A transparent digital portal for community assistance and public e-services.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors self-start sm:self-center"
          >
            <span>Explore services</span>
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </Link>
        </div>
      </section>

      {/* Main Content Workspace */}
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-5">
        {/* Purpose Overview Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4 transition-colors">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              Mission &amp; Purpose
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Modern Public Services for Every Resident
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            eCare connects barangay offices, social welfare desks, and residents under one simple platform. Instead of taking time off work to stand in municipal queues, residents can submit requests for financial assistance, medical support, and official clearances from any device.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800">
              <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 block">24/7</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Digital Intake</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800">
              <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 block">Real-Time</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Status Tracker</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800">
              <span className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 block">100%</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Free Access</span>
            </div>
          </div>
        </div>

        {/* Guiding Principles */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-0.5">
            Core Principles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {principles.map((p, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className={`w-9 h-9 rounded-xl ${p.color} dark:bg-opacity-20 flex items-center justify-center text-xs mb-3`}>
                    <i className={`fa-solid ${p.icon}`}></i>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {p.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-xs transition-colors">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {howItWorks.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {step.step}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Leadership & Development */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-xs">
              <i className="fa-solid fa-code"></i>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Developed by Neil Masion
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Full-Stack Architecture &amp; Community Public Service Automation
              </p>
            </div>
          </div>

          <Link
            to="/contact"
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            Contact Developer
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
