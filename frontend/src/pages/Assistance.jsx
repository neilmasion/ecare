import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { submitAssistance } from '../api/client';
import { useAuth } from '../context/AuthContext';

const Assistance = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const serviceParam = searchParams.get('service') || '';

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || '',
    assistanceType: '',
    urgency: 'normal',
    description: '',
    termsAccepted: false,
  });

  // Pre-select program from URL param (e.g. from Services page)
  useEffect(() => {
    if (!serviceParam) return;
    const lower = serviceParam.toLowerCase();
    if (lower.includes('health') || lower.includes('medical')) {
      setFormData(prev => ({ ...prev, assistanceType: 'medical' }));
    } else if (lower.includes('financial') || lower.includes('aid')) {
      setFormData(prev => ({ ...prev, assistanceType: 'financial' }));
    } else if (lower.includes('clearance') || lower.includes('legal')) {
      setFormData(prev => ({ ...prev, assistanceType: 'legal' }));
    } else if (lower.includes('incident') || lower.includes('emergency') || lower.includes('disaster')) {
      setFormData(prev => ({ ...prev, assistanceType: 'disaster', urgency: 'emergency' }));
    } else if (lower.includes('food')) {
      setFormData(prev => ({ ...prev, assistanceType: 'food' }));
    } else if (lower.includes('education') || lower.includes('student')) {
      setFormData(prev => ({ ...prev, assistanceType: 'educational' }));
    }
  }, [serviceParam]);

  // Pre-fill user profile info if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || user.first_name || '',
        lastName: prev.lastName || user.last_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.profile?.phone || '',
        address: prev.address || user.profile?.address || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size must be under 5MB.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');
    }
  };

  const handleCopyRef = () => {
    if (submittedData?.reference_number) {
      navigator.clipboard.writeText(submittedData.reference_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.assistanceType) {
      setErrorMessage('Please select the assistance type you need.');
      return;
    }

    if (!formData.description.trim()) {
      setErrorMessage('Please provide a brief description of your request.');
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMessage('Please ensure your name, contact phone, and address are filled in.');
      return;
    }

    if (!formData.termsAccepted) {
      setErrorMessage('Please confirm that the information provided is accurate.');
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('first_name', formData.firstName.trim());
      payload.append('last_name', formData.lastName.trim());
      payload.append('email', formData.email.trim());
      payload.append('phone', formData.phone.trim());
      payload.append('address', formData.address.trim());
      payload.append('assistance_type', formData.assistanceType);
      payload.append('urgency', formData.urgency || 'normal');
      payload.append('description', formData.description.trim());
      payload.append('previous_assistance', false);
      payload.append('family_members', 1);

      if (selectedFile) {
        payload.append('documents', selectedFile);
      }

      const res = await submitAssistance(payload);
      setSubmittedData(res.data);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}
      window.scrollTo({ top: 80, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail ||
        err.response?.data?.description?.[0] ||
        'Failed to submit request. Please verify your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
      {/* Clean Dashboard Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 py-6 px-6 sm:px-10 lg:px-12 transition-colors duration-150">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Apply for Assistance
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Submit an official request for financial aid, medical assistance, or community support.
            </p>
          </div>
          <Link
            to="/track"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors self-start sm:self-center"
          >
            <span>Track existing request</span>
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </Link>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
        {submittedData ? (
          /* Clean Success Card */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-8 sm:p-10 shadow-xs text-center transition-colors">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl mx-auto mb-4">
              <i className="fa-solid fa-check"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              Application Submitted!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              Thank you, <strong className="text-slate-800 dark:text-slate-200">{formData.firstName}</strong>. Your request has been recorded and will be reviewed by our team.
            </p>

            {/* Reference Number Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/70 dark:border-slate-800 mb-6 max-w-md mx-auto text-left">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Tracking Reference Number
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono tracking-wider">
                  {submittedData.reference_number}
                </span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <i className={`fa-solid ${copied ? 'fa-check text-emerald-600' : 'fa-copy text-slate-400'}`}></i>
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                <span>Status: <strong className="text-amber-600 dark:text-amber-400">Pending Review</strong></span>
                <span>Turnaround: <strong className="text-slate-700 dark:text-slate-300">24–48 hours</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Link
                to={`/track?ref=${encodeURIComponent(submittedData.reference_number)}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <i className="fa-solid fa-magnifying-glass text-[10px]"></i>
                <span>Track Application</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmittedData(null);
                  setSelectedFile(null);
                  setFormData(prev => ({ ...prev, description: '', termsAccepted: false }));
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span>Submit Another</span>
              </button>
            </div>
          </div>
        ) : (
          /* Streamlined Form Card */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs p-6 sm:p-8 transition-colors">
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation shrink-0"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: REQUEST DETAILS */}
              <div className="space-y-3.5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">1. Request Details</h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Select what assistance you are requesting</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Assistance Program *
                    </label>
                    <select
                      name="assistanceType"
                      value={formData.assistanceType}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                    >
                      <option value="">Select assistance type</option>
                      <option value="medical">Medical Assistance &amp; Medicines</option>
                      <option value="financial">Financial Subsidy</option>
                      <option value="educational">Educational / Student Aid</option>
                      <option value="disaster">Calamity &amp; Disaster Relief</option>
                      <option value="food">Food &amp; Nutrition Support</option>
                      <option value="legal">Legal Consultation &amp; Mediation</option>
                      <option value="housing">Housing &amp; Shelter Support</option>
                      <option value="other">Other Assistance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Urgency Level *
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                    >
                      <option value="normal">Normal (Standard review)</option>
                      <option value="high">High Priority (Within 3 days)</option>
                      <option value="urgent">Urgent (Within 24–48 hours)</option>
                      <option value="emergency">Emergency (Immediate attention)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Describe Your Situation *
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Briefly explain what support you need (e.g. hospital bill payment, prescription medicine, storm repairs)..."
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                  />
                </div>

                {/* Optional Document Upload */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Supporting Document (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="docInput"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <label
                      htmlFor="docInput"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-paperclip text-slate-400 dark:text-slate-500"></i>
                      <span>{selectedFile ? 'Change File' : 'Attach Document (ID, Bill, Prescription)'}</span>
                    </label>

                    {selectedFile && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <i className="fa-regular fa-file text-blue-600 dark:text-blue-400 text-xs"></i>
                        <span className="truncate max-w-[200px] font-medium">{selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs ml-1"
                          title="Remove file"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Accepted formats: PDF, JPG, PNG (Max 5MB)
                  </p>
                </div>
              </div>

              {/* SECTION 2: RESIDENT CONTACT INFO */}
              <div className="space-y-3.5 pt-2">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">2. Contact Information</h2>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Pre-filled from your registered account</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Juan"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Dela Cruz"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="0912 345 6789 or +63 912 345 6789"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Complete Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="House / Unit No., Street, Barangay, City"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                  />
                </div>
              </div>

              {/* SECTION 3: CONFIRMATION & SUBMIT */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    required
                    className="mt-0.5 accent-blue-600 rounded"
                  />
                  <span>
                    I confirm that the details provided are accurate and will be verified by community intake officers. *
                  </span>
                </label>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <i className="fa-solid fa-arrow-right text-[10px]"></i>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assistance;
