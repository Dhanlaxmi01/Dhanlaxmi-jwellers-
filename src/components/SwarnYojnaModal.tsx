import React, { useState } from 'react';
import { X, Calculator, ShieldCheck, CheckCircle2, ChevronRight, Coins, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/pricing';

interface SwarnYojnaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwarnYojnaModal: React.FC<SwarnYojnaModalProps> = ({ isOpen, onClose }) => {
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const totalInvestment = monthlyAmount * 11;
  const dhanlaxmiBonus = monthlyAmount; // 100% of one month installment as bonus
  const maturityValue = totalInvestment + dhanlaxmiBonus;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#C59B27]/40 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#081816] px-6 py-6 border-b border-[#C59B27]/40 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-1 rounded-full text-stone-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#DFB76C] to-[#996515] rounded-full flex items-center justify-center p-0.5 shadow-lg">
              <div className="bg-[#081816] w-full h-full rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-[#DFB76C]" />
              </div>
            </div>
            <div>
              <h2 className="font-serif-luxury text-2xl font-bold text-[#E8D5B5]">Swarn Yojna</h2>
              <p className="text-stone-400 text-xs mt-0.5 tracking-wider uppercase">11-Month Gold Harvest Scheme</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center space-y-3">
                <h3 className="font-serif-luxury text-xl font-bold text-stone-900">Plan Your Future Purchases</h3>
                <p className="text-stone-600 text-sm max-w-lg mx-auto">
                  Invest a fixed amount every month for 11 months. As a reward for your commitment, Dhanlaxmi Jewellers pays your 12th month's installment!
                </p>
              </div>

              <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E8D5B5] space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="font-bold text-stone-800 text-sm">Monthly Installment Amount</label>
                    <span className="font-serif-luxury text-2xl font-bold text-[#996515]">{formatINR(monthlyAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="50000"
                    step="1000"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                    className="w-full accent-[#996515] h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-stone-500 mt-2 font-mono">
                    <span>{formatINR(2000)}</span>
                    <span>{formatINR(50000)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                    <div className="text-[10px] text-stone-500 uppercase tracking-wider font-bold mb-1">You Pay (11 Months)</div>
                    <div className="font-mono font-bold text-stone-900">{formatINR(totalInvestment)}</div>
                  </div>
                  <div className="bg-[#081816] p-4 rounded-xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1">
                      <Sparkles className="w-3 h-3 text-[#DFB76C]" />
                    </div>
                    <div className="text-[10px] text-[#DFB76C] uppercase tracking-wider font-bold mb-1">Dhanlaxmi Bonus</div>
                    <div className="font-mono font-bold text-[#E8D5B5]">{formatINR(dhanlaxmiBonus)}</div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                    <div className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold mb-1">Maturity Value</div>
                    <div className="font-mono font-bold text-emerald-900">{formatINR(maturityValue)}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-start gap-3 p-4 border border-stone-100 rounded-xl bg-white shadow-xs">
                    <ShieldCheck className="w-5 h-5 text-[#C59B27] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">Secure & Transparent</h4>
                      <p className="text-xs text-stone-500 mt-1">Track your installments digitally with 100% transparent ledger access.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3 p-4 border border-stone-100 rounded-xl bg-white shadow-xs">
                    <Calculator className="w-5 h-5 text-[#C59B27] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">Zero Making Charges</h4>
                      <p className="text-xs text-stone-500 mt-1">Enjoy exclusive discounts on making charges upon plan maturity.</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-[#081816] hover:bg-[#122e2a] text-[#DFB76C] py-4 rounded-xl font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg"
                >
                  Enroll Now
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-sm"
                >
                  Back To Main Menu
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-8 text-center space-y-6 animate-fadeIn flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">Application Received</h3>
                <p className="text-stone-600 text-sm max-w-sm mx-auto">
                  Our wealth manager at the Haldwani showroom will contact you shortly to complete the KYC and activate your <strong className="text-stone-900">Swarn Yojna</strong> account.
                </p>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 inline-block text-left w-full max-w-sm">
                <div className="text-xs text-stone-500 mb-1">Selected Plan</div>
                <div className="font-mono font-bold text-stone-900">{formatINR(monthlyAmount)} / month</div>
                <div className="text-xs text-stone-500 mt-3 mb-1">Expected Maturity Value</div>
                <div className="font-mono font-bold text-emerald-700">{formatINR(maturityValue)}</div>
              </div>
              <button
                onClick={onClose}
                className="text-stone-500 hover:text-stone-900 text-sm font-bold uppercase tracking-wider pt-4"
              >
                Return to Shop
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
