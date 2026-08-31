import React, { useState } from 'react';
import { ShieldCheck, Search, X, Loader2, Info, CheckCircle2 } from 'lucide-react';

interface HuidVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HuidVerificationModal: React.FC<HuidVerificationModalProps> = ({ isOpen, onClose }) => {
  const [huid, setHuid] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (huid.length < 6) return;
    
    setIsSearching(true);
    setResult(null);

    // Simulate BIS lookup
    setTimeout(() => {
      setIsSearching(false);
      setResult({
        huid: huid.toUpperCase(),
        jeweller: "DHANLAXMI JWELLERS",
        registration: "BIS-UK-982341",
        purity: "22K916 (91.6% Pure Gold)",
        category: "Fine Gold Jewelry",
        dateOfHallmark: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        ahcCenter: "Haldwani Assaying & Hallmarking Center"
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E8D5B5] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h3 className="font-serif-luxury text-2xl font-bold text-stone-900 mb-2">BIS Hallmark Verification</h3>
            <p className="text-xs text-stone-500">
              Enter the 6-digit HUID code laser-engraved on your Dhanlaxmi jewelry to verify its purity and origin instantly.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <div className="relative">
                <input 
                  type="text" 
                  value={huid}
                  onChange={e => setHuid(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="Enter 6-digit HUID (e.g. A1B2C3)"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl font-mono text-center text-lg tracking-[0.25em] focus:outline-none focus:border-[#C59B27] uppercase"
                  maxLength={6}
                  required
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSearching || huid.length < 6}
              className="w-full bg-[#081816] hover:bg-[#122e2a] text-[#DFB76C] py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Authenticity'}
            </button>
          </form>

          {result && (
            <div className="mt-6 p-4 border border-emerald-200 bg-emerald-50 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-800 font-bold border-b border-emerald-200/50 pb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Verified Authentic BIS HUID
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div className="text-stone-500">HUID Number</div>
                <div className="font-mono font-bold text-stone-900 text-right">{result.huid}</div>
                
                <div className="text-stone-500">Purity Grade</div>
                <div className="font-bold text-stone-900 text-right">{result.purity}</div>
                
                <div className="text-stone-500">Jeweller</div>
                <div className="font-bold text-stone-900 text-right">{result.jeweller}</div>

                <div className="text-stone-500">Hallmarking Center</div>
                <div className="font-semibold text-stone-900 text-right">{result.ahcCenter}</div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-stone-200">
            <button
              onClick={onClose}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-sm"
            >
              Back To Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
