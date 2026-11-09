import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, verifyResident, uploadProfileAvatar } from '../api/client';

const validIdTypes = [
  { id: 'PhilSys National ID', label: 'PhilSys National ID (Philippine ID)' },
  { id: 'Barangay Resident ID', label: 'Barangay Resident ID / Certificate' },
  { id: 'Driver\'s License', label: 'LTO Driver\'s License' },
  { id: 'UMID / SSS', label: 'UMID / SSS Card' },
  { id: 'Postal ID', label: 'PhilPost Postal ID' },
  { id: 'Passport', label: 'Philippine Passport' },
  { id: 'Voter\'s ID', label: 'COMELEC Voter\'s ID / Certificate' },
  { id: 'Senior / PWD ID', label: 'Senior Citizen / PWD ID' },
];

const Profile = () => {
  const { user, setUser, refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Profile Form Data
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || '',
    barangay: user?.profile?.barangay || '',
  });

  // Verification Form Data
  const [verifyData, setVerifyData] = useState({
    idType: 'PhilSys National ID',
    idNumber: '',
  });
  const [idFile, setIdFile] = useState(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const verification = user?.verification || { status: 'unverified' };
  const isVerified = verification.status === 'verified';
  const avatarUrl = user?.profile?.avatar_url || null;
  const cooldownDaysLeft = user?.profile?.avatar_cooldown_days_left || 0;

  // Handle Avatar Upload with 3-day cooldown
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (cooldownDaysLeft > 0) {
      setErrorMessage(`Profile photo can only be changed once every 3 days (${cooldownDaysLeft} day${cooldownDaysLeft > 1 ? 's' : ''} remaining).`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 5MB.');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('avatar', file);

    setUploadingAvatar(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await uploadProfileAvatar(formDataUpload);
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        await refreshUser();
      }
      setSuccessMessage('Profile photo updated! (Next change available in 3 days)');
      setTimeout(() => setSuccessMessage(''), 4500);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error || err.response?.data?.detail || 'Failed to upload profile photo.'
      );
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        barangay: user.profile?.barangay || '',
      });
      if (user.verification) {
        setVerifyData(prev => ({
          ...prev,
          idType: user.verification.id_type || 'PhilSys National ID',
          idNumber: user.verification.id_number || '',
        }));
      }
    }
  }, [user]);

  // Handle Profile Save
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await updateProfile({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        barangay: formData.barangay.trim(),
      });
      if (res.data?.user) {
        setUser(res.data.user);
      }
      setSuccessMessage('Profile details saved successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Formatted ID Number input with auto-dashes (e.g. 1234-5678-9012-3456)
  const handleIdNumberChange = (e) => {
    let raw = e.target.value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    
    // If PhilSys National ID (typically 16 numeric digits formatted as XXXX-XXXX-XXXX-XXXX)
    if (verifyData.idType === 'PhilSys National ID') {
      raw = raw.replace(/\D/g, '').slice(0, 16);
      const parts = raw.match(/.{1,4}/g);
      const formatted = parts ? parts.join('-') : raw;
      setVerifyData(prev => ({ ...prev, idNumber: formatted }));
      return;
    }

    // Generic auto-grouping by 4 characters with dashes if numeric/alphanumeric
    if (raw.length > 24) raw = raw.slice(0, 24);
    const parts = raw.match(/.{1,4}/g);
    const formatted = parts ? parts.join('-') : raw;
    setVerifyData(prev => ({ ...prev, idNumber: formatted }));
  };

  // Handle Identity Verification
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!verifyData.idNumber.trim()) {
      setErrorMessage('Please enter your valid ID number.');
      setVerifying(false);
      return;
    }

    try {
      const res = await verifyResident({
        id_type: verifyData.idType,
        id_number: verifyData.idNumber.trim(),
      });

      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        await refreshUser();
      }

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}

      setSuccessMessage('Identity verified! Your resident status is now Active & Verified.');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error || 'Verification failed. Please check your ID details.'
      );
    } finally {
      setVerifying(false);
    }
  };

  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Resident';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Clean Dashboard Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 py-6 px-6 sm:px-10 lg:px-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Resident Profile
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your resident identity, contact information, and verification status.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline self-start sm:self-center"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-5">
        {/* Alerts */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <i className="fa-solid fa-circle-check text-emerald-600 dark:text-emerald-400"></i>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <i className="fa-solid fa-circle-exclamation shrink-0"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* PROFILE OVERVIEW CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Circle Avatar with Upload Overlay */}
            <div className="relative group shrink-0">
              <input
                type="file"
                id="avatarUploadInput"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleAvatarFileChange}
                disabled={uploadingAvatar || cooldownDaysLeft > 0}
                className="hidden"
              />
              <label
                htmlFor={cooldownDaysLeft > 0 ? undefined : "avatarUploadInput"}
                className={`relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold shadow-sm transition-all block ${
                  cooldownDaysLeft > 0
                    ? 'cursor-not-allowed opacity-90'
                    : 'cursor-pointer hover:ring-2 hover:ring-blue-500'
                }`}
                title={
                  cooldownDaysLeft > 0
                    ? `Photo locked: cooldown active (${cooldownDaysLeft} day${cooldownDaysLeft > 1 ? 's' : ''} left)`
                    : 'Click to upload profile photo'
                }
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-blue-600 text-white flex items-center justify-center">
                    {(user?.first_name?.[0] || user?.username?.[0] || 'R').toUpperCase()}
                  </div>
                )}

                {/* Hover overlay with camera icon */}
                <div className={`absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center transition-opacity rounded-full ${
                  cooldownDaysLeft > 0
                    ? 'opacity-0'
                    : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {uploadingAvatar ? (
                    <i className="fa-solid fa-spinner fa-spin text-sm"></i>
                  ) : (
                    <>
                      <i className="fa-solid fa-camera text-xs"></i>
                      <span className="text-[9px] font-semibold mt-0.5">Change</span>
                    </>
                  )}
                </div>
              </label>

              {/* Cooldown lock badge if active */}
              {cooldownDaysLeft > 0 && (
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center text-[10px] shadow-xs"
                  title={`Cooldown active: ${cooldownDaysLeft} day${cooldownDaysLeft > 1 ? 's' : ''} left`}
                >
                  <i className="fa-solid fa-lock text-[8px]"></i>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {displayName}
                </h2>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <i className="fa-solid fa-circle-check text-[9px]"></i>
                    <span>Verified Resident</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <i className="fa-solid fa-triangle-exclamation text-[9px]"></i>
                    <span>Needs Verification</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user?.email}
              </p>
              {cooldownDaysLeft > 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                  <i className="fa-solid fa-clock-rotate-left text-[9px]"></i>
                  <span>Photo change cooldown: {cooldownDaysLeft} day{cooldownDaysLeft > 1 ? 's' : ''} remaining</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <Link
              to="/assistance"
              className="flex-1 sm:flex-none text-center px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Apply for Aid
            </Link>
          </div>
        </div>

        {/* RESIDENT IDENTITY VERIFICATION SECTION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Resident Identity Verification
                </h3>
                {isVerified ? (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <i className="fa-solid fa-shield-check"></i>
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <span>Action Required</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Government ID verification confirms your barangay residency for clearance dispatches and public subsidies.
              </p>
            </div>
          </div>

          {isVerified ? (
            /* Verified State Card */
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm shrink-0 mt-0.5">
                  <i className="fa-solid fa-id-card"></i>
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                    {verification.id_type || 'PhilSys National ID'}
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono block">
                    ID Number: {verification.id_number ? `•••• •••• ${verification.id_number.slice(-4)}` : 'Verified on File'}
                  </span>
                  <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/70 block mt-1">
                    Verified on {verification.verified_at || 'November 2026'} • Full civic rights unlocked
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-slate-700 shrink-0">
                <i className="fa-solid fa-check-double text-emerald-600"></i>
                <span>Eligible for all aid</span>
              </div>
            </div>
          ) : (
            /* Action Required: Verification Form */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <i className="fa-solid fa-circle-exclamation text-amber-600 shrink-0 text-sm mt-0.5"></i>
                <div>
                  <strong className="block font-semibold">You need to verify yourself</strong>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">
                    To prevent fraudulent assistance claims and speed up clearance release, please verify your resident identity with any valid government ID.
                  </span>
                </div>
              </div>

              <form onSubmit={handleVerifySubmit} className="space-y-3.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Select Government ID Type *
                    </label>
                    <select
                      value={verifyData.idType}
                      onChange={(e) => setVerifyData({ ...verifyData, idType: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                      {validIdTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      ID Number / Reference *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={verifyData.idType === 'PhilSys National ID' ? "1234-5678-9012-3456" : "1234-5678-9012"}
                      value={verifyData.idNumber}
                      onChange={handleIdNumberChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 font-mono tracking-wider focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400 dark:placeholder-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Upload ID Photo or Document (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="idPhotoInput"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setIdFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="idPhotoInput"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <i className="fa-solid fa-camera text-slate-400"></i>
                      <span>{idFile ? idFile.name : 'Attach ID Photo'}</span>
                    </label>

                    {idFile && (
                      <button
                        type="button"
                        onClick={() => setIdFile(null)}
                        className="text-xs text-slate-400 hover:text-rose-600"
                      >
                        <i className="fa-solid fa-xmark"></i> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Accepted: Clear front photo of your ID (Max 5MB)
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={verifying}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {verifying ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span>Verifying Identity...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-shield-check text-xs"></i>
                        <span>Verify My Identity</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* PERSONAL & CONTACT INFORMATION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Personal Information
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              These details are automatically filled into your aid requests and clearances.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <i className="fa-solid fa-check"></i>
                    <span>Verified</span>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+63 912 345 6789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="House / Unit No., Street Name"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Barangay
                </label>
                <input
                  type="text"
                  placeholder="e.g. Barangay Poblacion"
                  value={formData.barangay}
                  onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <span>Save Changes</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
