import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdminAuthSession } from '../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: AdminAuthSession) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  // Step state: 'CREDENTIALS' | '2FA_OTP' | 'SUCCESS'
  const [step, setStep] = useState<'CREDENTIALS' | '2FA_OTP' | 'SUCCESS'>('CREDENTIALS');
  
  // Credentials
  const [email, setEmail] = useState('');
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

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (step === '2FA_OTP' && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, remainingTime]);

  if (!isOpen) return null;

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
      setErrorMessage(err.message || 'Connection failed. Please check credentials.');
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

      // Save in session storage
      localStorage.setItem('dhanlaxmi_admin_token', data.token);
      localStorage.setItem('dhanlaxmi_admin_user', JSON.stringify(data.user));

      setStep('SUCCESS');
      setTimeout(() => {
        onSuccess(session);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#081816] text-[#FAF7F2] rounded-3xl border border-[#DFB76C]/40 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-white transition p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-[#DFB76C]/10 border border-[#DFB76C]/30 text-[#DFB76C] shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury tracking-wide text-[#DFB76C]">
            DHANLAXMI JWELLERS
          </h2>
          <p className="text-xs text-stone-400 uppercase tracking-widest font-mono">
            Secure Admin & Bullion Command Portal
          </p>
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-600/50 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {infoMessage && step === '2FA_OTP' && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p>{infoMessage}</p>
              {simulatedOtpHint && (
                <div className="mt-1.5 p-2 bg-black/40 rounded-lg font-mono text-[11px] text-[#DFB76C] border border-[#DFB76C]/30 flex items-center justify-between">
                  <span>2FA Dispatch Code:</span>
                  <strong className="text-sm tracking-widest text-white">{simulatedOtpHint}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: CREDENTIALS FORM */}
        {step === 'CREDENTIALS' && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#DFB76C]" />
                <span>Admin Email ID</span>
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email address"
                className="w-full px-4 py-2.5 bg-stone-900/90 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#DFB76C] transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#DFB76C]" />
                  <span>Admin Password</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-4 pr-11 py-2.5 bg-stone-900/90 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#DFB76C] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#DFB76C] transition p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#081816] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg cursor-pointer disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Proceed to 2FA Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 2FA OTP VERIFICATION */}
        {step === '2FA_OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="inline-flex p-2.5 rounded-full bg-[#DFB76C]/10 text-[#DFB76C] mb-1">
                <SmartphoneNfc className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white">Enter 6-Digit 2FA Code</h3>
              <p className="text-xs text-stone-400">
                A one-time verification token was dispatched for <span className="text-white font-mono">{maskedEmail}</span>.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#DFB76C]" />
                  <span>Security Token (OTP)</span>
                </span>
                <span className="text-[11px] font-mono text-[#DFB76C]">
                  Expires in {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
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
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#081816] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Open Admin CMS</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('CREDENTIALS');
                setOtp('');
                setErrorMessage('');
              }}
              className="w-full text-center text-xs text-stone-400 hover:text-[#DFB76C] cursor-pointer"
            >
              ← Back to Login Credentials
            </button>
          </form>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {step === 'SUCCESS' && (
          <div className="text-center py-6 space-y-3 animate-fadeIn">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white font-serif-luxury">2FA Handshake Verified</h3>
            <p className="text-xs text-stone-300">
              Cryptographic session generated. Entering Showroom Command Center...
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
