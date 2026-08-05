import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Mail, User, Phone, Sparkles, CheckCircle2, Shield, AlertTriangle, RotateCcw, Check, Globe, Flame, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  auth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  isFirebaseConfigured,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  googleProvider,
  signInWithPopup,
  handleGoogleSignIn
} from '../firebase/config';

export const AuthModal = ({ isOpen, onClose, onAdminRedirect, onProfileRedirect }) => {
  const { login, register, googleAuth, socialAuth, sendMobileOtp, verifyMobileOtp } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'register', 'otp'
  
  // Dual Input Login State (Email or Phone + Password)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Mobile OTP State
  const [countryCode, setCountryCode] = useState('+91');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const otpInputRefs = useRef([]);

  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Countdown timer effect for Resend OTP
  useEffect(() => {
    let interval = null;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  const handleAuthSuccess = (res) => {
    onClose();
    if (res?.user?.role === 'ADMIN' && onAdminRedirect) {
      onAdminRedirect();
    } else if (onProfileRedirect) {
      onProfileRedirect();
    }
  };

  // Mobile OTP Handler (REAL FIREBASE SMS DISPATCH VIA CLIENT SDK)
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    
    const cleanDigits = otpPhone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      return setErrorMsg('Please enter a valid 10-digit mobile phone number');
    }

    setLoading(true);
    const fullPhoneNumber = `${countryCode}${cleanDigits}`;

    try {
      setStatusMsg('Sending SMS OTP via Firebase...');
      
      // Initialize reCAPTCHA Verifier
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response) => {
            console.log('📱 reCAPTCHA verified successfully');
          },
          'expired-callback': () => {
            console.warn('⚠️ reCAPTCHA verification expired');
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.render().then(widgetId => {
                if (window.grecaptcha) window.grecaptcha.reset(widgetId);
              });
            }
          }
        });
      }

      const appVerifier = window.recaptchaVerifier;
      console.log(`📱 Executing real Firebase signInWithPhoneNumber for ${fullPhoneNumber}...`);

      const result = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      console.log('✅ Real SMS dispatched successfully via Firebase!');
      
      window.confirmationResult = result;
      setConfirmationResult(result);
      setOtpSent(true);
      setResendTimer(30);
      setLoading(false);
      setStatusMsg('');
      
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (firebaseErr) {
      console.error('❌ Real Firebase SMS Dispatch Error:', firebaseErr);
      setLoading(false);
      setStatusMsg('');

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => {
          if (window.grecaptcha) window.grecaptcha.reset(widgetId);
        });
      }

      if (firebaseErr.code === 'auth/invalid-phone-number') {
        return setErrorMsg('Invalid phone number format for SMS delivery.');
      } else if (firebaseErr.code === 'auth/too-many-requests') {
        return setErrorMsg('Too many SMS requests for this phone number. Please try again later.');
      } else if (firebaseErr.code === 'auth/api-key-not-valid') {
        return setErrorMsg('Firebase API Key is missing or invalid in Vercel environment variables.');
      } else if (firebaseErr.code === 'auth/captcha-check-failed') {
        return setErrorMsg('reCAPTCHA verification failed. Please try again.');
      } else {
        return setErrorMsg(firebaseErr.message || 'Failed to send SMS OTP via Firebase.');
      }
    }
  };

  const handleOtpDigitChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Trigger auto-verification when all 6 boxes filled
    if (cleanVal && newDigits.every(d => d !== '')) {
      triggerOtpVerification(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedData[i] || '';
      }
      setOtpDigits(newDigits);
      const focusIdx = Math.min(pastedData.length, 5);
      otpInputRefs.current[focusIdx]?.focus();

      if (pastedData.length === 6) {
        triggerOtpVerification(pastedData);
      }
    }
  };

  const triggerOtpVerification = async (codeToVerify) => {
    setErrorMsg('');
    setLoading(true);

    const activeConfirmation = confirmationResult || window.confirmationResult;

    // 1. Client-Side Firebase OTP Verification
    if (activeConfirmation) {
      try {
        console.log(`📱 Verifying Firebase OTP code: ${codeToVerify}...`);
        const userCredential = await activeConfirmation.confirm(codeToVerify);
        const firebaseUser = userCredential.user;
        console.log('✅ Firebase OTP verified successfully for user:', firebaseUser.phoneNumber || firebaseUser.uid);
        
        // 2. Post-Verification Only: Call Render backend for user session & DB record
        const res = await verifyMobileOtp(otpPhone, codeToVerify, countryCode);
        setLoading(false);

        if (res.success) {
          handleAuthSuccess(res);
        } else {
          const fallbackSession = {
            success: true,
            user: {
              id: `usr_fb_${firebaseUser.uid.slice(-6)}`,
              name: `Firebase User (${otpPhone.slice(-4)})`,
              email: firebaseUser.email || `phone_${otpPhone}@primeshow.com`,
              phone: `${countryCode}${otpPhone}`,
              role: 'CUSTOMER',
              rewardsPoints: 500,
              provider: 'FIREBASE_PHONE'
            }
          };
          handleAuthSuccess(fallbackSession);
        }
        return;
      } catch (confirmErr) {
        setLoading(false);
        console.error('❌ Firebase OTP Confirmation Error:', confirmErr);
        if (confirmErr.code === 'auth/invalid-verification-code') {
          return setErrorMsg('Invalid 6-digit OTP code. Please check and try again.');
        } else if (confirmErr.code === 'auth/code-expired') {
          return setErrorMsg('OTP code has expired. Please click Resend OTP.');
        } else {
          return setErrorMsg(confirmErr.message || 'Firebase OTP verification failed.');
        }
      }
    }

    // Default Gateway Flow
    const res = await verifyMobileOtp(otpPhone, codeToVerify, countryCode);
    setLoading(false);
    if (res.success) {
      handleAuthSuccess(res);
    } else {
      setErrorMsg(res.error || 'Invalid 6-digit OTP code. Please check and try again.');
    }
  };

  const handleManualVerifySubmit = (e) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length < 6) {
      return setErrorMsg('Please enter complete 6-digit OTP code');
    }
    triggerOtpVerification(fullCode);
  };

  // Direct Firebase Native Google Sign-In Handler
  const handleGoogleClick = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      console.log('📱 Triggering Native Firebase Google Auth Popup (handleGoogleSignIn)...');
      const fbUser = await handleGoogleSignIn();
      console.log('✅ Firebase Google Auth Popup successful:', fbUser.displayName || fbUser.email);
      
      const googleUser = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
        email: fbUser.email || 'user.google@primeshow.com',
        avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        role: fbUser.email === 'admin@primeshow.com' ? 'ADMIN' : 'CUSTOMER',
        rewardsPoints: 750,
        provider: 'GOOGLE_FIREBASE'
      };

      setLoading(false);
      handleAuthSuccess({ success: true, user: googleUser });
    } catch (fbErr) {
      console.error('❌ Firebase Google Auth Error:', fbErr);
      setLoading(false);
      if (fbErr.code === 'auth/popup-closed-by-user') {
        return;
      } else if (fbErr.code === 'auth/api-key-not-valid') {
        return setErrorMsg('Firebase API Key is missing or invalid in Vercel environment variables.');
      } else {
        return setErrorMsg(fbErr.message || 'Failed to sign in with Google via Firebase.');
      }
    }
  };

  if (!isOpen) return null;

  const handleFirebaseError = (err) => {
    console.error('Firebase Auth Exception:', err);
    const code = err.code || err.message || '';
    if (code.includes('auth/invalid-email')) {
      return 'Invalid email address format. Please check your email address.';
    } else if (code.includes('auth/user-not-found')) {
      return 'No account found with this email. Please register a new account.';
    } else if (code.includes('auth/wrong-password') || code.includes('auth/invalid-credential')) {
      return 'Incorrect email or password. Please check your credentials.';
    } else if (code.includes('auth/email-already-in-use')) {
      return 'This email address is already registered. Please sign in instead.';
    } else if (code.includes('auth/weak-password')) {
      return 'Password is too weak. Please use at least 6 characters.';
    } else if (code.includes('auth/too-many-requests')) {
      return 'Too many failed login attempts. Please wait a few minutes and try again.';
    } else {
      return err.message || 'Authentication failed. Please check your inputs.';
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginIdentifier.trim()) {
      return setErrorMsg('Please enter your Email Address or Mobile Phone Number');
    }
    if (!loginPassword) {
      return setErrorMsg('Please enter your Password');
    }

    setLoading(true);

    // 1. Try Firebase Email Login SDK first if identifier is an email
    if (auth && loginIdentifier.includes('@')) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, loginIdentifier.trim(), loginPassword);
        const fbUser = userCredential.user;
        const loggedUser = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
          role: fbUser.email === 'admin@primeshow.com' ? 'ADMIN' : 'CUSTOMER',
          rewardsPoints: 500,
          provider: 'FIREBASE_EMAIL'
        };
        setLoading(false);
        setLoginIdentifier('');
        setLoginPassword('');
        handleAuthSuccess({ success: true, user: loggedUser });
        return;
      } catch (fbErr) {
        console.warn('Firebase Email Sign-In Error:', fbErr.code);
        if (
          fbErr.code === 'auth/wrong-password' || 
          fbErr.code === 'auth/user-not-found' || 
          fbErr.code === 'auth/invalid-credential' ||
          fbErr.code === 'auth/invalid-email'
        ) {
          setLoading(false);
          return setErrorMsg(handleFirebaseError(fbErr));
        }
      }
    }

    // 2. Fallback to API / local login
    const res = await login(loginIdentifier.trim(), loginPassword);
    setLoading(false);
    if (res.success) {
      setLoginIdentifier('');
      setLoginPassword('');
      handleAuthSuccess(res);
    } else {
      setErrorMsg(res.error || 'Authentication failed');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) return setErrorMsg('Full Name is required');
    if (!email.trim() || !email.includes('@')) return setErrorMsg('Please enter a valid Email Address');
    if (password.length < 6) return setErrorMsg('Password must be at least 6 characters');
    if (password !== confirmPassword) return setErrorMsg('Passwords do not match');

    setLoading(true);

    // 1. Firebase Email Registration via SDK
    if (auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const fbUser = userCredential.user;
        if (name.trim()) {
          try { await updateProfile(fbUser, { displayName: name.trim() }); } catch (pErr) {}
        }
        const registeredUser = {
          id: fbUser.uid,
          name: name.trim() || fbUser.email.split('@')[0],
          email: fbUser.email,
          phone: phone.trim() || '+91 9876543210',
          role: email.trim() === 'admin@primeshow.com' ? 'ADMIN' : 'CUSTOMER',
          rewardsPoints: 500,
          provider: 'FIREBASE_EMAIL'
        };
        setLoading(false);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');
        handleAuthSuccess({ success: true, user: registeredUser });
        return;
      } catch (fbErr) {
        console.warn('Firebase Email Registration Error:', fbErr.code);
        if (
          fbErr.code === 'auth/email-already-in-use' || 
          fbErr.code === 'auth/invalid-email' || 
          fbErr.code === 'auth/weak-password'
        ) {
          setLoading(false);
          return setErrorMsg(handleFirebaseError(fbErr));
        }
      }
    }

    // 2. Fallback API Registration
    const res = await register(name.trim(), email.trim(), phone.trim(), password);
    setLoading(false);
    if (res.success) {
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      handleAuthSuccess(res);
    } else {
      setErrorMsg(res.error || 'Registration failed');
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setLoading(true);
    const res = await socialAuth('google', { name: 'Google Account User', email: 'user.google@primeshow.com' });
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Google Sign-In Failed');
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 dark:bg-[#06080C]/95 backdrop-blur-2xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl shadow-amber-500/10 text-white font-sans">
        
        {/* Top Header Controls: Clean Back to Home Button & Close Icon */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-amber-500 hover:text-black text-amber-300 text-xs font-bold transition-all duration-200 border border-amber-400/20 shadow-md cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Close Auth View"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invisible Firebase Recaptcha Verifier Container */}
        <div id="recaptcha-container"></div>

        {/* Brand Header with Modern Typography */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-black font-extrabold font-serif text-2xl mb-3 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/30">
            P
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-white font-sans">Welcome to PrimeShow</h3>
          <p className="text-xs text-amber-300/90 font-medium tracking-wide mt-1">Ultra-Luxury Cinema Booking & Entertainment Suite</p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 mb-6 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${activeTab === 'login' ? 'bg-amber-500 text-black font-bold shadow-md' : 'text-white/70 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('otp'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${activeTab === 'otp' ? 'bg-amber-500 text-black font-bold shadow-md' : 'text-white/70 hover:text-white'}`}
          >
            Mobile OTP
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${activeTab === 'register' ? 'bg-amber-500 text-black font-bold shadow-md' : 'text-white/70 hover:text-white'}`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium mb-4 text-center">
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Dual Input Sign In (Email OR Phone Number + Password) */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-white/40" />
              <input
                type="text"
                required
                placeholder="Email Address or Mobile Phone Number"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs text-white placeholder-white/40"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-white/40" />
              <input
                type="password"
                required
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs text-white placeholder-white/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'}
            </button>
          </form>
        )}

        {/* Tab 2: Real-Time Mobile OTP Verification System */}
        {activeTab === 'otp' && (
          <div className="space-y-4 animate-fade-in">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="text-xs text-white/60 text-center mb-1">
                  Enter your 10-digit mobile number to receive a secure SMS verification code.
                </div>

                <div className="flex gap-2">
                  {/* Country Code Selection Dropdown */}
                  <div className="relative w-28 shrink-0">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full h-full py-3 px-2 rounded-xl glass-input text-xs text-white bg-slate-900/80 border border-white/15 focus:border-amber-400 appearance-none cursor-pointer text-center font-bold"
                    >
                      <option value="+91" className="bg-slate-900 text-white">🇮🇳 +91</option>
                      <option value="+1" className="bg-slate-900 text-white">🇺🇸 +1</option>
                      <option value="+44" className="bg-slate-900 text-white">🇬🇧 +44</option>
                      <option value="+971" className="bg-slate-900 text-white">🇦🇪 +971</option>
                    </select>
                  </div>

                  {/* Phone Input with 10-digit validation */}
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-white/40" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="98765 43210"
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs text-white placeholder-white/40 font-mono tracking-wider"
                    />
                  </div>
                </div>

                {statusMsg && loading && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-center text-xs text-amber-300 animate-pulse font-medium">
                    ⚡ {statusMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>{statusMsg || 'Dispatching SMS OTP...'}</span>
                    </>
                  ) : (
                    'Send Verification OTP'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleManualVerifySubmit} className="space-y-4 animate-fade-in">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-center text-xs space-y-1">
                  <div className="text-white/70">OTP dispatched to <span className="font-bold text-amber-300 font-mono">{countryCode} {otpPhone}</span></div>
                </div>

                {/* 6-Digit Sleek OTP Input Grid with Auto-Focus & Paste */}
                <div className="space-y-2">
                  <label className="block text-[11px] text-center text-white/50 uppercase tracking-widest font-semibold">
                    Enter 6-Digit Code
                  </label>
                  <div className="flex justify-between gap-1.5 sm:gap-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => otpInputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border transition-all glass-input ${
                          digit ? 'border-amber-400 bg-amber-400/10 text-amber-300 shadow-lg shadow-amber-500/20' : 'border-white/15 text-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length < 6}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Verifying OTP...' : 'Verify OTP & Sign In'}
                </button>

                {/* Resend OTP Timer & Change Phone controls */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpDigits(['', '', '', '', '', '']);
                      setErrorMsg('');
                    }}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer text-[11px]"
                  >
                    ← Change Mobile Number
                  </button>

                  <button
                    type="button"
                    disabled={resendTimer > 0 || loading}
                    onClick={handleSendOtp}
                    className={`font-semibold transition-colors text-[11px] flex items-center gap-1 cursor-pointer ${
                      resendTimer > 0 ? 'text-white/40 cursor-not-allowed' : 'text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 3: Registration Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
              <input
                type="text"
                required
                placeholder="Full Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-white/40"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
              <input
                type="email"
                required
                placeholder="Email Address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-white/40"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
              <input
                type="tel"
                required
                placeholder="Phone Number (+91) *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-white/40"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
              <input
                type="password"
                required
                placeholder="Password (min 6 chars) *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-white/40"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
              <input
                type="password"
                required
                placeholder="Confirm Password *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-white/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Create PrimeShow Account'}
            </button>
          </form>
        )}

        {/* Primary Social Auth: Firebase Google Sign-In */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="text-[10px] text-center text-white/40 uppercase tracking-wider mb-3">Or continue with Google identity</div>
          <button 
            type="button"
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/></svg>
            <span>{loading ? 'Connecting with Google...' : 'Sign in with Google'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
