import React from 'react';
import { Sparkles, ArrowUpRight, ArrowDownRight, Calculator, Calendar } from 'lucide-react';
import { LiveRates } from '../types';
import { formatINR } from '../utils/pricing';

interface RatesTickerProps {
  rates: LiveRates;
  onOpenCalculator: () => void;
}

export const RatesTicker: React.FC<RatesTickerProps> = React.memo(({
  rates,
  onOpenCalculator,
}) => {
  return (
    <div className="bg-[#04100E] border-b border-[#C59B27]/30 text-[#E8D5B5] py-2 px-4 text-xs font-sans-modern relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        
        {/* Left: Live Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-white tracking-wider uppercase text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#DFB76C]" />
            <span className="hidden sm:inline">Haldwani Bullion</span> Market Rates
          </span>
        </div>

        {/* Middle: Scrolling or Flex Rates Items */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto py-0.5 scrollbar-none font-mono text-[11px] sm:text-xs">
          {/* Gold 24K */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-stone-400">Gold 24K (999):</span>
            <strong className="text-[#DFB76C] font-semibold">{formatINR(rates.gold24k)}</strong>
            <span className="text-[10px] text-stone-500">/10g</span>
            <span className="text-emerald-400 flex items-center text-[10px]">
              <ArrowUpRight className="w-3 h-3" />
              +0.4%
            </span>
          </div>

          {/* Gold 22K (Hallmark) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-stone-400">Gold 22K (916):</span>
            <strong className="text-[#DFB76C] font-semibold">{formatINR(rates.gold22k)}</strong>
            <span className="text-[10px] text-stone-500">/10g</span>
            <span className="text-emerald-400 flex items-center text-[10px]">
              <ArrowUpRight className="w-3 h-3" />
              +0.35%
            </span>
          </div>

          {/* Gold 18K */}
          <div className="flex items-center gap-1.5 shrink-0 hidden md:flex">
            <span className="text-stone-400">Gold 18K (750):</span>
            <strong className="text-[#DFB76C] font-semibold">{formatINR(rates.gold18k)}</strong>
            <span className="text-[10px] text-stone-500">/10g</span>
          </div>

          {/* Silver */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-stone-400">Silver 999:</span>
            <strong className="text-stone-200 font-semibold">{formatINR(rates.silver999)}</strong>
            <span className="text-[10px] text-stone-500">/1kg</span>
            <span className="text-rose-400 flex items-center text-[10px]">
              <ArrowDownRight className="w-3 h-3" />
              -0.12%
            </span>
          </div>
        </div>

        {/* Right: Price Calculator Trigger & Timestamp */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-stone-400 hidden lg:inline font-mono">
            Updated: {rates.lastUpdated}
          </span>

          <button
            type="button"
            id="ticker-calc-btn"
            onClick={onOpenCalculator}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#DFB76C]/15 border border-[#DFB76C]/40 text-[#DFB76C] hover:bg-[#DFB76C]/25 transition text-[11px] font-medium cursor-pointer"
            title="Open Live Transparent Gold Price Calculator"
          >
            <Calculator className="w-3 h-3" />
            <span>Price Calculator</span>
          </button>
        </div>

      </div>
    </div>
  );
});

RatesTicker.displayName = 'RatesTicker';
