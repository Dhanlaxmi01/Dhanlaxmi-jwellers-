import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  Sparkles, 
  ShieldCheck, 
  MessageCircle, 
  MapPin, 
  RefreshCw, 
  ArrowRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { GoldPurity, LiveRates, SiteSettings } from '../types';
import { formatINR } from '../utils/pricing';

interface GoldCalculatorModalProps {
  rates: LiveRates;
  settings: SiteSettings;
  onClose: () => void;
  onOpenConsultation: () => void;
}

export const GoldCalculatorModal: React.FC<GoldCalculatorModalProps> = ({
  rates,
  settings,
  onClose,
  onOpenConsultation,
}) => {
  const [purity, setPurity] = useState<GoldPurity>('22K');
  const [weightGrams, setWeightGrams] = useState<number>(18.5);
  const [makingPercent, setMakingPercent] = useState<number>(18);

  const [gemstoneCost, setGemstoneCost] = useState<number>(0);

  // Rate per gram based on selected purity
  let ratePerGram = 0;
  if (purity === '24K') ratePerGram = rates.gold24k / 10;
  else if (purity === '22K') ratePerGram = rates.gold22k / 10;
  else if (purity === '18K') ratePerGram = rates.gold18k / 10;
  else if (purity === '14K') ratePerGram = rates.gold14k / 10;
  else if (purity === '925 Silver') ratePerGram = rates.silver999 / 1000;

  const metalValue = Math.round(weightGrams * ratePerGram);
  const makingCharges = Math.round(metalValue * (makingPercent / 100));
  const subtotal = metalValue + makingCharges + (Number(gemstoneCost) || 0);
  const gst = Math.round(subtotal * 0.03);
  const grandTotal = subtotal + gst;

  const handleSendWhatsAppEstimate = () => {
    const text = `*Namaste Dhanlaxmi Jwellers*, I calculated an estimate on your website:%0A%0A` +
      `• *Purity:* ${purity}%0A` +
      `• *Weight:* ${weightGrams} grams%0A` +
      `• *Today's Rate:* ${formatINR(ratePerGram)}/g%0A` +
      `• *Metal Value:* ${formatINR(metalValue)}%0A` +
      `• *Making Charge (${makingPercent}%):* ${formatINR(makingCharges)}%0A` +
      `• *GST (3%):* ${formatINR(gst)}%0A` +
      `• *Estimated Total:* ${formatINR(grandTotal)}%0A%0A` +
      `I would like to visit your *Haldwani Nanda Vihar Showroom* to explore designs. Please assist!`;
    window.open(`https://wa.me/91${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#C59B27]/50 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-500 hover:text-black hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8D5B5]/60 text-[#996515] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#C59B27]" />
            ESTIMATED RATE CALCULATOR
          </div>
          <h2 className="text-xl sm:text-2xl font-serif-luxury font-bold text-[#081816]">
            Dhanlaxmi Jewelry Price Calculator
          </h2>
          <p className="text-xs text-stone-600">
            Calculate the exact showroom cost in real-time based on today's official Haldwani bullion market rates.
          </p>
        </div>

        {/* Current Market Banner */}
        <div className="bg-[#081816] text-[#E8D5B5] p-3.5 rounded-xl border border-[#C59B27]/40 flex items-center justify-between text-xs">
          <div>
            <span className="text-stone-300 block text-[10px]">Applied Rate ({purity}):</span>
            <span className="text-base font-bold text-[#DFB76C] font-serif-luxury">
              {formatINR(ratePerGram)} <span className="text-xs font-sans-modern font-normal text-stone-300">/ gram</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> 1-Hour Old Rate
            </span>
            <span className="text-[10px] text-stone-400">BIS Hallmark 916</span>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          
          {/* Purity selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              1. Select Metal & Purity:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['24K', '22K', '18K', '14K', '925 Silver'] as GoldPurity[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPurity(p)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition border ${
                    purity === p
                      ? 'bg-[#081816] text-[#DFB76C] border-[#C59B27] shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Weight in Grams */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-stone-800 uppercase tracking-wider">
                2. Weight in Grams:
              </label>
              <span className="font-bold text-[#996515]">{weightGrams} grams</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0.5"
                max="1000"
                step="0.1"
                value={weightGrams}
                onChange={(e) => setWeightGrams(Math.max(0.1, parseFloat(e.target.value) || 0))}
                className="w-28 text-sm font-bold bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-[#C59B27]"
              />
              <input
                type="range"
                min="1"
                max="100"
                step="0.5"
                value={weightGrams > 100 ? 100 : weightGrams}
                onChange={(e) => setWeightGrams(parseFloat(e.target.value))}
                className="flex-1 accent-[#C59B27] cursor-pointer"
              />
            </div>
            <div className="flex gap-1.5 pt-1 overflow-x-auto text-[11px]">
              {[5, 10, 15, 20, 35, 50, 80, 100].map((quickGrams) => (
                <button
                  key={quickGrams}
                  onClick={() => setWeightGrams(quickGrams)}
                  className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 hover:bg-[#E8D5B5] transition"
                >
                  {quickGrams}g
                </button>
              ))}
            </div>
          </div>

          {/* Making Charges */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-stone-800 uppercase tracking-wider">
                3. Making Charges (%):
              </label>
              <span className="text-stone-600">18% (Fixed)</span>
            </div>
            <div className="flex gap-2">
              {[18].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setMakingPercent(pct)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                    makingPercent === pct
                      ? 'bg-[#E8D5B5] text-[#081816] font-bold border-[#C59B27]'
                      : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}
                >
                  {pct}% (Standard)
                </button>
              ))}
            </div>
          </div>

          {/* Gemstones / Pearls Cost (Optional) */}
          <div className="space-y-1 text-xs">
            <label className="font-medium text-stone-700">
              4. Additional Gemstones/Stones (₹ Optional):
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={gemstoneCost || ''}
              onChange={(e) => setGemstoneCost(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="e.g. 5000 for emeralds or uncut polki"
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-[#C59B27]"
            />
          </div>

        </div>

        {/* Calculation Result Breakdown Card */}
        <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#E8D5B5] space-y-2 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Metal Value ({weightGrams}g x {formatINR(ratePerGram)}):</span>
            <span className="font-semibold text-stone-900">{formatINR(metalValue)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Making Charges ({makingPercent}%):</span>
            <span className="font-semibold text-stone-900">{formatINR(makingCharges)}</span>
          </div>
          {gemstoneCost > 0 && (
            <div className="flex justify-between text-stone-600">
              <span>Gemstones & Pearls:</span>
              <span className="font-semibold text-stone-900">{formatINR(gemstoneCost)}</span>
            </div>
          )}
          <div className="flex justify-between text-stone-600">
            <span>Govt. GST (3%):</span>
            <span className="font-semibold text-stone-900">{formatINR(gst)}</span>
          </div>
          <div className="border-t border-[#C59B27]/40 pt-2 flex items-baseline justify-between text-base">
            <span className="font-serif-luxury font-bold text-[#081816]">Estimated Total:</span>
            <span className="text-xl font-bold font-serif-luxury text-[#996515]">
              {formatINR(grandTotal)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleSendWhatsAppEstimate}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send Estimate to Haldwani Showroom</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#081816] hover:bg-[#122e2a] text-[#DFB76C] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back To Main Menu</span>
          </button>

          <div className="flex items-center justify-between text-xs text-stone-500 px-2 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Guaranteed Purity
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#996515]" />
              Nanda Vihar Haldwani
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
