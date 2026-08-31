import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  SmartphoneNfc,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  Delete,
  Fingerprint
} from 'lucide-react';
import { AdminAuthSession } from '../types';

interface PINAuthGatewayProps {
  onAuthenticated: (session?: AdminAuthSession) => void;
  onCancel: () => void;
}

export const PINAuthGateway: React.FC<PINAuthGatewayProps> = ({
  onAuthenticated,
  onCancel,
}) => {
  // Auth Method Mode: 'PIN' | 'CREDENTIALS'
  const [authMode, setAuthMode] = useState<'PIN' | 'CREDENTIALS'>('PIN');

  // Step for 2FA Credentials mode: 'CREDENTIALS' | '2FA_OTP' | 'SUCCESS'
  const [step, setStep] = useState<'LOGIN' | '2FA_OTP' | 'SUCCESS'>('LOGIN');

  // PIN Mode state
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const pinInputRef = useRef<HTMLInputElement | null>(null);

  // Credentials Mode state
  const [email, setEmail] = useState('Dhanlaxmi@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 2FA state
  const [challengeId, setChallengeId] = useState('');
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [simulatedOtpHint, setSimulatedOtpHint] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(300); // 5 minutes

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);

  // Focus PIN input on mount
  useEffect(() => {
    if (authMode === 'PIN' && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [authMode]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (step === '2FA_OTP' && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, remainingTime]);

  // Handle PIN input change (numeric only, max 6 digits)
  const handlePinDigit = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMessage('');
      if (newPin.length === 6) {
        verifyPinDirectly(newPin);
      }
    }
  };

  const handlePinBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handlePinClear = () => {
    setPin('');
    setErrorMessage('');
  };

  // Submit & Verify PIN
  const verifyPinDirectly = async (pinToVerify: string) => {
    if (!pinToVerify || pinToVerify.length < 4) {
      setErrorMessage('Please enter your 6-digit Master Security PIN');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToVerify })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAttemptCount((prev) => prev + 1);
        throw new Error(data.message || 'Invalid Master Security PIN. Verification rejected.');
      }

      const session: AdminAuthSession = {
        token: data.token,
        user: data.user,
        expiresAt: data.expiresAt
      };

      // Store bearer token for authorized requests
      localStorage.setItem('dhanlaxmi_admin_token', data.token);
      localStorage.setItem('dhanlaxmi_admin_user', JSON.stringify(data.user));

      setStep('SUCCESS');
      setTimeout(() => {
        onAuthenticated(session);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Master PIN verification failed.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 1: Submit Credentials
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAttemptCount((prev) => prev + 1);
        throw new Error(data.message || 'Invalid administrative credentials');
      }

      setChallengeId(data.challengeId);
      setMaskedEmail(data.maskedEmail || email.replace(/(.{2})(.*)(@.*)/, '$1***$3'));
      if (data.otpSimulationHint) {
        setSimulatedOtpHint(data.otpSimulationHint);
      }
      setRemainingTime(300);
      setStep('2FA_OTP');
      setInfoMessage(data.message || '2FA Verification Code has been generated.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify 2FA OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, otp: otp.trim() })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'OTP verification failed');
      }

      const session: AdminAuthSession = {
        token: data.token,
        user: data.user,
        expiresAt: data.expiresAt
      };

      // Save token in storage
      localStorage.setItem('dhanlaxmi_admin_token', data.token);
      localStorage.setItem('dhanlaxmi_admin_user', JSON.stringify(data.user));

      setStep('SUCCESS');
      setTimeout(() => {
        onAuthenticated(session);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        className="relative bg-[#081816] text-[#FAF7F2] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-[#C59B27] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800/60 transition cursor-pointer"
          title="Cancel and close admin"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Shield & Branding Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex p-3 rounded-2xl bg-[#DFB76C]/10 border border-[#DFB76C]/30 text-[#DFB76C] shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.25em] text-[#DFB76C] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>DHANLAXMI JEWELLERS • EXECUTIVE PORTAL</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif-luxury font-bold text-white tracking-wide mt-1">
              Admin Identity Verification
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Strict authentication required before accessing showroom command CMS
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        {step !== 'SUCCESS' && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-stone-900 border border-stone-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode('PIN');
                setStep('LOGIN');
                setErrorMessage('');
              }}
              className={`py-2 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'PIN'
                  ? 'bg-gradient-to-r from-[#DFB76C] to-[#C59B27] text-[#081816] shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Master PIN</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('CREDENTIALS');
                setStep('LOGIN');
                setErrorMessage('');
              }}
              className={`py-2 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'CREDENTIALS'
                  ? 'bg-gradient-to-r from-[#DFB76C] to-[#C59B27] text-[#081816] shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password &amp; 2FA</span>
            </button>
          </div>
        )}

        {/* Status / Error Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-600/60 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{errorMessage}</p>
              {attemptCount > 0 && (
                <span className="text-[10px] text-rose-300 font-mono mt-0.5 block">
                  Security Log: {attemptCount} unverified attempt(s) recorded.
                </span>
              )}
            </div>
          </div>
        )}

        {infoMessage && step === '2FA_OTP' && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{infoMessage}</p>
            </div>
          </div>
        )}

        {/* ----------------- MODE 1: MASTER SECURITY PIN ----------------- */}
        {authMode === 'PIN' && step === 'LOGIN' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center space-y-1">
              <p className="text-xs text-stone-300">
                Enter your 6-digit Master Executive Security PIN
              </p>

              {/* Hidden Input for Native Keyboard Typing */}
              <input
                ref={pinInputRef}
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  setPin(cleaned);
                  setErrorMessage('');
                  if (cleaned.length === 6) {
                    verifyPinDirectly(cleaned);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && pin.length >= 4) {
                    verifyPinDirectly(pin);
                  }
                }}
                className="opacity-0 absolute -z-10 w-0 h-0"
                aria-label="Master Security PIN Input"
              />

              {/* Visual PIN Dots Display */}
              <div 
                onClick={() => pinInputRef.current?.focus()}
                className="py-3 px-4 rounded-2xl bg-stone-900/90 border border-stone-700 flex items-center justify-center gap-3 cursor-pointer hover:border-[#DFB76C] transition"
              >
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const hasValue = index < pin.length;
                  return (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full transition-all duration-200 flex items-center justify-center ${
                        hasValue
                          ? 'bg-[#DFB76C] ring-4 ring-[#DFB76C]/30 scale-110'
                          : 'bg-stone-800 border border-stone-700'
                      }`}
                    >
                      {hasValue && showPin && (
                        <span className="text-[9px] font-mono font-bold text-stone-950">
                          {pin[index]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-400 px-1 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="hover:text-[#DFB76C] transition flex items-center gap-1 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPin ? 'Mask PIN' : 'Reveal PIN'}</span>
                </button>

                <span className="text-[10px] text-stone-500 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#DFB76C]" />
                  <span>Encrypted Input</span>
                </span>
              </div>
            </div>

            {/* On-screen Luxury Keypad for Touch & Click */}
            <div className="grid grid-cols-3 gap-2 pt-1 max-w-[280px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handlePinDigit(digit)}
                  disabled={isLoading}
                  className="py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 active:bg-[#DFB76C] active:text-stone-950 border border-stone-700/80 text-base font-mono font-bold text-stone-100 transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {digit}
                </button>
              ))}

              <button
                type="button"
                onClick={handlePinClear}
                disabled={isLoading || pin.length === 0}
                className="py-3 rounded-2xl bg-stone-900/60 hover:bg-stone-800 text-xs font-semibold text-stone-400 hover:text-stone-200 border border-stone-800 transition cursor-pointer disabled:opacity-30"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => handlePinDigit('0')}
                disabled={isLoading}
                className="py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 active:bg-[#DFB76C] active:text-stone-950 border border-stone-700/80 text-base font-mono font-bold text-stone-100 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                0
              </button>

              <button
                type="button"
                onClick={handlePinBackspace}
                disabled={isLoading || pin.length === 0}
                className="py-3 rounded-2xl bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-rose-400 border border-stone-800 transition flex items-center justify-center cursor-pointer disabled:opacity-30"
                title="Backspace"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Verify Button */}
            <button
              type="button"
              onClick={() => verifyPinDirectly(pin)}
              disabled={isLoading || pin.length < 4}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#081816] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Master PIN &amp; Unlock CMS</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ----------------- MODE 2: CREDENTIALS + 2FA OTP ----------------- */}
        {authMode === 'CREDENTIALS' && step === 'LOGIN' && (
          <form onSubmit={handleStep1Submit} className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#DFB76C]" />
                <span>Executive Email Address</span>
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Dhanlaxmi@gmail.com"
                className="w-full px-4 py-2.5 bg-stone-900/90 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#DFB76C] transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#DFB76C]" />
                <span>Master Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter master password"
                  className="w-full pl-4 pr-11 py-2.5 bg-stone-900/90 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#DFB76C] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#DFB76C] transition p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#081816] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg cursor-pointer disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Verify Credentials &amp; Request 2FA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2FA OTP STEP */}
        {step === '2FA_OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="inline-flex p-2.5 rounded-full bg-[#DFB76C]/10 text-[#DFB76C] mb-1">
                <SmartphoneNfc className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white">Enter 6-Digit 2FA Token</h3>
              <p className="text-xs text-stone-400">
                Dispatched for <span className="text-[#DFB76C] font-mono font-medium">{maskedEmail}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#DFB76C]" />
                  <span>Security Token (OTP)</span>
                </span>
                <span className="text-[11px] font-mono text-[#DFB76C] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}</span>
                </span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 bg-stone-900/90 border border-stone-700 rounded-xl text-[#DFB76C] focus:outline-none focus:border-[#DFB76C] transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#081816] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify 2FA &amp; Enter CMS</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('LOGIN');
                setOtp('');
                setErrorMessage('');
              }}
              className="w-full text-center text-xs text-stone-400 hover:text-[#DFB76C] cursor-pointer"
            >
              ← Back to Login Credentials
            </button>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'SUCCESS' && (
          <div className="text-center py-6 space-y-3 animate-fadeIn">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white font-serif-luxury">Executive Session Verified</h3>
            <p className="text-xs text-stone-300">
              Identity verified. Opening Dhanlaxmi Jewellers Admin Command Center...
            </p>
          </div>
        )}

        {/* Footer Return */}
        <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
          <span className="text-stone-500 font-mono text-[10px]">
            AES-256 SESSION ENCRYPTION
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="text-stone-400 hover:text-white transition underline cursor-pointer"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
