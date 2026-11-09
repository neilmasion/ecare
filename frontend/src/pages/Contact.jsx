import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { submitContact } from '../api/client';
import { useAuth } from '../context/AuthContext';

const Contact = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.username || ''),
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const MAX_CHAR = 500;

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || (user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username),
        email: prev.email || user.email || '',
        phone: prev.phone || user.profile?.phone || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > MAX_CHAR) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await submitContact(formData);
      setSubmitted(true);
      try {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      } catch (err) {}
      setFormData(prev => ({
        ...prev,
        subject: '',
        message: '',
      }));
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail ||
        err.response?.data?.message?.[0] ||
        'Failed to send message. Please review your information.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
      {/* Clean Dashboard Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 py-6 px-6 sm:px-10 lg:px-12 transition-colors duration-150">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Citizen Helpdesk
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Send an inquiry to municipal officers or contact direct service hotlines.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Workspace */}
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Form Column (2 Cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 sm:p-7 shadow-xs transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Send an Inquiry</h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Our intake support desk typically replies within 24–48 hours</p>
            </div>

            {submitted && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-emerald-600 dark:text-emerald-400 text-sm"></i>
                  <span>Message sent! An officer will reach out via email or phone.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 text-[11px] font-semibold underline"
                >
                  Send another
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation shrink-0"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Juan Dela Cruz"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0912 345 6789"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Topic / Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                  >
                    <option value="">Select a topic</option>
                    <option value="General Inquiry">General Question</option>
                    <option value="Assistance Follow-up">Assistance Follow-up</option>
                    <option value="Clearance Inquiry">Clearance &amp; Certificate Support</option>
                    <option value="Community Incident">Report Community Concern</option>
                    <option value="Feedback">Feedback / Suggestions</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Message *
                  </label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {formData.message.length}/{MAX_CHAR}
                  </span>
                </div>
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your question, reference number follow-up, or concern here..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <i className="fa-solid fa-paper-plane text-[10px]"></i>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Info & Hotline Column (1 Col) */}
          <div className="space-y-4">
            {/* Direct Hotlines Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-xs space-y-3.5 transition-colors">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Direct Hotlines
              </h3>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs shrink-0">
                  <i className="fa-solid fa-phone"></i>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">Emergency 24/7</span>
                  <a href="tel:911" className="text-rose-600 dark:text-rose-400 font-bold text-xs hover:underline">
                    911 (Toll-Free)
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs shrink-0">
                  <i className="fa-solid fa-headset"></i>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">Municipal Helpdesk</span>
                  <a href="tel:0288882273" className="text-slate-900 dark:text-slate-100 font-bold text-xs hover:underline">
                    (02) 8888-2273
                  </a>
                </div>
              </div>
            </div>

            {/* Office Hours & Location Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-xs space-y-3 transition-colors">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Municipal Desk
              </h3>

              <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <i className="fa-solid fa-location-dot text-slate-400 dark:text-slate-500 text-xs mt-0.5"></i>
                <div className="leading-snug">
                  <strong className="text-slate-800 dark:text-slate-200 block text-[11px]">eCare Public Services Wing</strong>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Ground Floor, City Hall Complex</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <i className="fa-solid fa-clock text-slate-400 dark:text-slate-500 text-xs mt-0.5"></i>
                <div className="leading-snug">
                  <strong className="text-slate-800 dark:text-slate-200 block text-[11px]">Walk-In Hours</strong>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Mon – Fri: 8:00 AM – 5:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
