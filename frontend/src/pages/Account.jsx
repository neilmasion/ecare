import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { sendVerificationCode, forgotPassword, resetPassword } from '../api/client';

const Account = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [registerStep, setRegisterStep] = useState('form'); // 'form' | 'verify'
  const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'reset'
  const [phoneCountry, setPhoneCountry] = useState('PH');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [sendingForgotCode, setSendingForgotCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [forgotCountdown, setForgotCountdown] = useState(0);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [signInData, setSignInData] = useState({
    email_or_username: '',
    password: '',
    remember: false,
  });

  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const [verificationCode, setVerificationCode] = useState('');

  // Forgot password form states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // 60-second cooldown timer for resending OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 60-second cooldown timer for forgot password OTP
  useEffect(() => {
    let timer;
    if (forgotCountdown > 0) {
      timer = setTimeout(() => setForgotCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [forgotCountdown]);

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (phoneCountry === 'PH') {
      // Allow only numbers and spaces
      val = val.replace(/[^\d\s]/g, '');
      const raw = val.replace(/\D/g, '');
      if (raw.startsWith('0')) {
        if (raw.length > 11) return;
      } else {
        if (raw.length > 10) return;
      }
    }
    setSignUpData(prev => ({ ...prev, phone: val }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await login({
        email_or_username: signInData.email_or_username,
        password: signInData.password,
      });
      navigate('/');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Invalid credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Submit Details -> Trigger Gmail Verification Code
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const email = signUpData.email.trim();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid Gmail address.');
      return;
    }

    // Phone validation: PH accepts starts with 9 (10 digits) or 09 (11 digits)
    const rawPhone = signUpData.phone.replace(/\D/g, '');
    if (!rawPhone) {
      setErrorMessage('Please enter your contact phone number.');
      return;
    }

    if (phoneCountry === 'PH') {
      const isValidPh = (rawPhone.startsWith('09') && rawPhone.length === 11) ||
                        (rawPhone.startsWith('9') && rawPhone.length === 10);
      if (!isValidPh) {
        setErrorMessage('For PH phone, enter 10 digits starting with 9 or 11 digits starting with 09.');
        return;
      }
    } else if (rawPhone.length < 7) {
      setErrorMessage('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!signUpData.terms) {
      setErrorMessage('Please accept the Terms to continue.');
      return;
    }

    setSendingCode(true);

    try {
      await sendVerificationCode(email);
      setRegisterStep('verify');
      setCountdown(60);
      setSuccessMessage(`Verification code sent to ${email}. Check your inbox!`);
    } catch (err) {
      let msg = 'Could not send verification code. Please try again.';
      const data = err.response?.data;
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        msg = 'Connection timed out. Please try sending the code again.';
      } else if (data?.email) {
        msg = Array.isArray(data.email) ? data.email[0] : data.email;
      } else if (data?.detail) {
        msg = data.detail;
      } else if (data?.error) {
        msg = data.error;
      } else if (data?.message) {
        msg = data.message;
      } else if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        if (Array.isArray(val) && val[0]) msg = val[0];
        else if (typeof val === 'string') msg = val;
      } else if (err.message === 'Network Error' || !err.response) {
        msg = 'Backend server is offline on port 8000. Start it with npm run dev.';
      }
      setErrorMessage(msg);
    } finally {
      setSendingCode(false);
    }
  };

  // Resend code from verification step
  const handleResendCode = async () => {
    if (countdown > 0 || sendingCode) return;
    setSendingCode(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await sendVerificationCode(signUpData.email.trim());
      setCountdown(60);
      setSuccessMessage('A new verification code has been sent to your Gmail.');
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Could not resend code. Please try again later.';
      if (data?.email) {
        msg = Array.isArray(data.email) ? data.email[0] : data.email;
      } else if (data?.detail) {
        msg = data.detail;
      } else if (data?.error) {
        msg = data.error;
      }
      setErrorMessage(msg);
    } finally {
      setSendingCode(false);
    }
  };

  // Step 2: Verify Code and Create Account
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const code = verificationCode.trim();
    if (!code || code.length < 6) {
      setErrorMessage('Please enter the 6-digit code sent to your Gmail.');
      return;
    }

    setLoading(true);

    try {
      // Normalize phone number
      const rawDigits = signUpData.phone.replace(/\D/g, '');
      let formattedPhone = signUpData.phone.trim();
      if (phoneCountry === 'PH') {
        const phDigits = rawDigits.startsWith('0') ? rawDigits.slice(1) : rawDigits;
        formattedPhone = `+63 ${phDigits}`;
      } else {
        const dialCodes = {
          US: '+1', CA: '+1', SG: '+65', AE: '+971', SA: '+966',
          GB: '+44', AU: '+61', JP: '+81'
        };
        const dial = dialCodes[phoneCountry];
        if (dial) formattedPhone = `${dial} ${rawDigits}`;
      }

      await register({
        username: signUpData.email.split('@')[0],
        email: signUpData.email.trim(),
        code: code,
        password: signUpData.password,
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        phone: formattedPhone,
      });
      setSuccessMessage('Gmail verified & account created! Entering dashboard...');
      setTimeout(() => {
        navigate('/');
      }, 700);
    } catch (err) {
      const errors = err.response?.data;
      let msg = 'Verification failed. Please check the code.';
      if (errors?.code?.[0]) {
        msg = errors.code[0];
      } else if (typeof errors === 'object') {
        const firstKey = Object.keys(errors)[0];
        if (firstKey) msg = `${firstKey}: ${errors[firstKey]}`;
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 1 of Forgot Password: Send OTP to email
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const email = forgotEmail.trim();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    setSendingForgotCode(true);

    try {
      await forgotPassword(email);
      setForgotStep('reset');
      setForgotCountdown(60);
      setSuccessMessage(`Reset code sent to ${email}. Please check your inbox!`);
    } catch (err) {
      let msg = 'Could not send reset code. Please try again.';
      if (err.response?.data?.email?.[0]) {
        msg = err.response.data.email[0];
      } else if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setErrorMessage(msg);
    } finally {
      setSendingForgotCode(false);
    }
  };

  // Resend reset code
  const handleResendResetCode = async () => {
    if (forgotCountdown > 0 || sendingForgotCode) return;
    setSendingForgotCode(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await forgotPassword(forgotEmail.trim());
      setForgotCountdown(60);
      setSuccessMessage('A new reset code has been sent to your email.');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        'Could not resend code. Please try again later.'
      );
    } finally {
      setSendingForgotCode(false);
    }
  };

  // Step 2 of Forgot Password: Verify OTP and set new password
  const handlePerformReset = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const code = forgotCode.trim();
    if (!code || code.length < 6) {
      setErrorMessage('Please enter the 6-digit reset code.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        email: forgotEmail.trim(),
        code: code,
        password: newPassword,
      });
      setSuccessMessage('Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        setSignInData(prev => ({ ...prev, email_or_username: forgotEmail.trim(), password: '' }));
        switchTab('signin');
        setSuccessMessage('Password updated! Please log in with your new password.');
      }, 1400);
    } catch (err) {
      const errors = err.response?.data;
      let msg = 'Failed to reset password. Please check your code.';
      if (errors?.code?.[0]) {
        msg = errors.code[0];
      } else if (errors?.password?.[0]) {
        msg = errors.password[0];
      } else if (errors?.error) {
        msg = errors.error;
      } else if (errors?.detail) {
        msg = errors.detail;
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setRegisterStep('form');
    setForgotStep('request');
    setErrorMessage('');
    setSuccessMessage('');
    if (tab === 'forgot' && !forgotEmail && signInData.email_or_username.includes('@')) {
      setForgotEmail(signInData.email_or_username.trim());
    }
  };

  return (
    <div className="relative h-screen w-full bg-white dark:bg-slate-950 flex flex-col justify-center items-center px-4 overflow-hidden select-none transition-colors duration-150">
      {/* Top right quick theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          <i className={`fa-solid ${isDark ? 'fa-sun text-amber-400' : 'fa-moon text-blue-600'} text-xs`}></i>
          <span className="text-[11px]">{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* Reduced-width compact container */}
      <div className="w-full max-w-[330px]">
        {/* Minimal Brand Header */}
        <div className="text-center mb-4">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
            <i className="fa-solid fa-hand-holding-heart text-xs"></i>
          </div>
          <h1 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            e<span className="text-blue-600 dark:text-blue-400">Care</span>
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {activeTab === 'signin'
              ? 'Sign in to your resident dashboard'
              : activeTab === 'signup'
              ? registerStep === 'verify'
                ? 'Verify your Gmail to complete registration'
                : 'Create your resident account'
              : forgotStep === 'reset'
              ? 'Enter the 6-digit code and your new password'
              : 'Enter your email to reset your password'}
          </p>
        </div>

        {/* Tab Toggle / Back to Sign In */}
        {activeTab === 'forgot' ? (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => switchTab('signin')}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors"
            >
              <i className="fa-solid fa-arrow-left text-[10px]"></i>
              <span>Back to Sign In</span>
            </button>
          </div>
        ) : (
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-3.5 border border-transparent dark:border-slate-800">
            <button
              type="button"
              onClick={() => switchTab('signin')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'signin'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchTab('signup')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'signup'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-[11px] font-medium flex items-start gap-1.5 animate-in fade-in duration-150">
            <i className="fa-solid fa-circle-exclamation text-rose-500 dark:text-rose-400 shrink-0 text-xs mt-0.5"></i>
            <div className="leading-tight break-words flex-1">
              <span>{errorMessage}</span>
              {errorMessage.toLowerCase().includes('already registered') && (
                <button
                  type="button"
                  onClick={() => {
                    setSignInData(prev => ({ ...prev, email_or_username: signUpData.email.trim() }));
                    switchTab('signin');
                  }}
                  className="ml-1.5 underline font-semibold text-rose-800 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 cursor-pointer"
                >
                  Sign In now &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium flex items-start gap-1.5 animate-in fade-in duration-150">
            <i className="fa-solid fa-circle-check text-emerald-500 dark:text-emerald-400 shrink-0 text-xs mt-0.5"></i>
            <span className="leading-tight break-words">{successMessage}</span>
          </div>
        )}

        {/* FORGOT PASSWORD TAB */}
        {activeTab === 'forgot' ? (
          forgotStep === 'request' ? (
            <form onSubmit={handleSendResetCode} className="space-y-3 animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={sendingForgotCode || !forgotEmail}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                {sendingForgotCode ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePerformReset} className="space-y-2.5 animate-in fade-in duration-150">
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-center mb-0.5">
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Code sent to <span className="font-semibold text-slate-900 dark:text-slate-200">{forgotEmail}</span>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    6-Digit Code
                  </label>
                  <button
                    type="button"
                    onClick={handleResendResetCode}
                    disabled={forgotCountdown > 0 || sendingForgotCode}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline disabled:text-slate-400 dark:disabled:text-slate-600 font-medium"
                  >
                    {sendingForgotCode ? 'Sending...' : forgotCountdown > 0 ? `Resend in ${forgotCountdown}s` : 'Resend code'}
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="123456"
                  value={forgotCode}
                  onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center font-mono text-base tracking-[0.3em] font-bold text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-2.5 pr-7 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(p => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs"
                  >
                    <i className={`fa-solid ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full pl-2.5 pr-7 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(p => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs"
                  >
                    <i className={`fa-solid ${showConfirmNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => { setForgotStep('request'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <i className="fa-solid fa-arrow-left text-[9px]"></i>
                  <span>Change email</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || forgotCode.length < 6 || !newPassword || !confirmNewPassword}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 mt-1 shadow-xs"
              >
                {loading ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <span>Save New Password</span>
                    <i className="fa-solid fa-check text-[10px]"></i>
                  </>
                )}
              </button>
            </form>
          )
        ) : activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email or Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Email or username"
                value={signInData.email_or_username}
                onChange={(e) => setSignInData({ ...signInData, email_or_username: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Password"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs p-1"
                  aria-label="Toggle password visibility"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={signInData.remember}
                  onChange={(e) => setSignInData({ ...signInData, remember: e.target.checked })}
                  className="accent-blue-600 rounded"
                />
                <span>Remember</span>
              </label>
              <button
                type="button"
                onClick={() => switchTab('forgot')}
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 mt-2 shadow-xs"
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <>
                  <span>Sign In</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </>
              )}
            </button>
          </form>
        ) : registerStep === 'form' ? (
          /* REGISTER STEP 1: RESIDENT DETAILS */
          <form onSubmit={handleDetailsSubmit} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Juan"
                  value={signUpData.firstName}
                  onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Dela Cruz"
                  value={signUpData.lastName}
                  onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Gmail Address *</label>
              <input
                type="email"
                required
                placeholder="juandelacruz@gmail.com"
                value={signUpData.email}
                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Contact Phone *</label>
              <div className="flex gap-1.5">
                <select
                  value={phoneCountry}
                  onChange={(e) => {
                    setPhoneCountry(e.target.value);
                    setSignUpData(prev => ({ ...prev, phone: '' }));
                  }}
                  className="w-[86px] px-1.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all cursor-pointer shrink-0"
                  aria-label="Country Code"
                >
                  <option value="PH">PH (+63)</option>
                  <option value="US">US (+1)</option>
                  <option value="SG">SG (+65)</option>
                  <option value="AE">AE (+971)</option>
                  <option value="SA">SA (+966)</option>
                  <option value="CA">CA (+1)</option>
                  <option value="GB">GB (+44)</option>
                  <option value="AU">AU (+61)</option>
                  <option value="JP">JP (+81)</option>
                  <option value="OTHER">Other</option>
                </select>
                <input
                  type="tel"
                  required
                  placeholder={phoneCountry === 'PH' ? "0912 345 6789 or 912 345 6789" : "555 123 4567"}
                  value={signUpData.phone}
                  onChange={handlePhoneChange}
                  className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 8 chars"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    className="w-full pl-2 pr-6 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs"
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Confirm *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    className="w-full pl-2 pr-6 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs"
                  >
                    <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-0.5">
              <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={signUpData.terms}
                  onChange={(e) => setSignUpData({ ...signUpData, terms: e.target.checked })}
                  required
                  className="accent-blue-600 rounded"
                />
                <span>I agree to Terms &amp; Charter</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={sendingCode}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 mt-1 shadow-xs"
            >
              {sendingCode ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <>
                  <span>Create Account</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </>
              )}
            </button>
          </form>
        ) : (
          /* REGISTER STEP 2: VERIFY GMAIL CODE */
          <form onSubmit={handleVerifyAndRegister} className="space-y-3 animate-in fade-in duration-200">
            <div className="text-center py-1">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2 text-base shadow-xs">
                <i className="fa-solid fa-envelope-circle-check"></i>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Check Your Gmail</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                We sent a 6-digit code to <br />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{signUpData.email}</span>
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                placeholder="• • • • • •"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center font-mono text-lg tracking-[0.35em] font-extrabold text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => { setRegisterStep('form'); setErrorMessage(''); setSuccessMessage(''); }}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <i className="fa-solid fa-arrow-left text-[9px]"></i>
                <span>Edit Info</span>
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0 || sendingCode}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors"
              >
                {sendingCode ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length < 6}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 mt-1 shadow-xs"
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <>
                  <span>Verify &amp; Enter Dashboard</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </>
              )}
            </button>
          </form>
        )}

        {/* Minimal Footer */}
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-4">
          eCare Community Connect
        </p>
      </div>
    </div>
  );
};

export default Account;
