import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Sparkles, 
  RefreshCw, 
  Globe2, 
  Scale, 
  ShieldCheck, 
  Plane, 
  FileText,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { CurrencyConversionResult, GoldPurity } from '../types';
import { formatINR } from '../utils/pricing';

interface CurrencyConverterWidgetProps {
  initialAmountINR?: number;
  initialPurity?: GoldPurity;
  initialWeight?: number;
}

export const CurrencyConverterWidget: React.FC<CurrencyConverterWidgetProps> = ({
  initialAmountINR = 150000,
  initialPurity = '22K',
  initialWeight = 20
}) => {
  const [amountINR, setAmountINR] = useState(initialAmountINR);
  const [targetCurrency, setTargetCurrency] = useState<'USD' | 'AED' | 'GBP' | 'EUR' | 'CAD' | 'SGD'>('USD');
  const [purity, setPurity] = useState<GoldPurity>(initialPurity);
  const [weightGrams, setWeightGrams] = useState(initialWeight);
  
  const [conversion, setConversion] = useState<CurrencyConversionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConversion = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pricing/ai-converter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseAmountINR: amountINR,
          targetCurrency,
          goldWeightGrams: weightGrams,
          purity
        })
      });
      const data = await res.json();
      setConversion(data);
    } catch (err) {
      console.error('Failed to convert currency:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversion();
  }, [targetCurrency]);

  const currencySymbols: Record<string, string> = {
    USD: '$',
    AED: 'AED ',
    GBP: '£',
    EUR: '€',
    CAD: 'CA$',
    SGD: 'S$'
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#E8D5B5] shadow-sm space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[#C59B27]" />
            <h3 className="font-serif-luxury text-base font-bold text-stone-900">
              Gemini AI Real-Time Global Currency & Bullion Converter
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Instant conversion for NRI shoppers and international tourists with live forex rates and duty-free insights.
          </p>
        </div>

        <button
          onClick={fetchConversion}
          disabled={isLoading}
          className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-[#E8D5B5]/50 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-stone-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#996515] ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh AI Forex</span>
        </button>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        
        {/* Base INR Amount */}
        <div className="space-y-1 sm:col-span-2">
          <label className="font-semibold text-stone-700">Valuation Amount (₹ INR)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-400">₹</span>
            <input
              type="number"
              value={amountINR}
              onChange={(e) => setAmountINR(Number(e.target.value))}
              className="w-full pl-7 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-stone-900 focus:outline-none focus:border-[#C59B27]"
            />
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="space-y-1">
          <label className="font-semibold text-stone-700">Target Currency</label>
          <select
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value as any)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-800 focus:outline-none focus:border-[#C59B27] cursor-pointer"
          >
            <option value="USD">USD ($) - United States</option>
            <option value="AED">AED (Dirhams) - UAE / Dubai</option>
            <option value="GBP">GBP (£) - United Kingdom</option>
            <option value="EUR">EUR (€) - European Union</option>
            <option value="CAD">CAD (CA$) - Canada</option>
            <option value="SGD">SGD (S$) - Singapore</option>
          </select>
        </div>

        {/* Purity & Weight */}
        <div className="space-y-1">
          <label className="font-semibold text-stone-700">Gold Purity & Weight</label>
          <div className="flex gap-2">
            <select
              value={purity}
              onChange={(e) => setPurity(e.target.value as any)}
              className="w-1/2 px-2 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium cursor-pointer"
            >
              <option value="24K">24K (99.9%)</option>
              <option value="22K">22K (91.6%)</option>
              <option value="18K">18K (75.0%)</option>
            </select>
            <input
              type="number"
              value={weightGrams}
              onChange={(e) => setWeightGrams(Number(e.target.value))}
              placeholder="g"
              className="w-1/2 px-2 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-center"
            />
          </div>
        </div>

      </div>

      {/* Conversion Result Display */}
      {conversion && (
        <div className="bg-[#081816] text-[#FAF7F2] p-5 rounded-2xl border border-[#DFB76C]/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#DFB76C]">
                Equivalent Converted Value
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-serif-luxury text-[#DFB76C] mt-0.5">
                {currencySymbols[conversion.targetCurrency] || ''}
                {conversion.convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                Base Value: {formatINR(conversion.baseAmountINR)} @ 1 INR = {conversion.exchangeRate} {conversion.targetCurrency}
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-stone-800 sm:pl-6">
              <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400">
                Rate Per Gram ({conversion.targetCurrency})
              </span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {currencySymbols[conversion.targetCurrency] || ''}
                {conversion.ratePerGramLocal.toFixed(2)}/g
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                {conversion.lastUpdated}
              </span>
            </div>
          </div>

          {/* AI Intelligence Note */}
          <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-xs text-stone-300 flex items-start gap-2.5">
            <Plane className="w-4 h-4 text-[#DFB76C] shrink-0 mt-0.5" />
            <p className="leading-relaxed font-sans text-[11px]">
              {conversion.marketNote}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
