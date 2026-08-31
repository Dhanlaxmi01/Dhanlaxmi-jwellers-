import React, { useState } from 'react';
import { MessageCircle, X, Sparkles, Phone, ShieldCheck, MapPin, Send } from 'lucide-react';
import { LiveRates, SiteSettings } from '../types';
import { formatINR } from '../utils/pricing';

interface WhatsAppWidgetProps {
  settings: SiteSettings;
  rates: LiveRates;
  onOpenCalculator: () => void;
}

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({
  settings,
  rates,
  onOpenCalculator,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const quickPrompts = [
    {
      label: "✨ Today's 22K Gold Rate Enquiry",
      msg: `Namaste Dhanlaxmi Jwellers, please share today's live 22K Gold & Silver rates in Haldwani.`
    },
    {
      label: "👑 Bridal Choker & Jewellery Viewing",
      msg: `Namaste, I want to book a VIP Bridal Jewelry viewing session at your Haldwani Nanda Vihar showroom.`
    },
    {
      label: "💍 Custom Diamond Ring Designing",
      msg: `Namaste, I would like to consult with your master karigar regarding a custom solitaire ring.`
    }
  ];

  const handleSendPrompt = (msg: string) => {
    const text = encodeURIComponent(msg);
    window.open(`https://wa.me/91${settings.whatsappNumber}?text=${text}`, '_blank');
    setIsOpen(false);
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    handleSendPrompt(customMsg);
    setCustomMsg('');
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-[999] pointer-events-auto"
      style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}
    >
      
      {/* Expanded WhatsApp Dialog Box */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-[#C59B27]/50 overflow-hidden animate-slideUp text-xs">
          
          {/* Header */}
          <div className="bg-[#081816] text-[#E8D5B5] p-4 flex items-center justify-between border-b border-[#C59B27]/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif-luxury font-bold text-white text-sm">
                  DHANLAXMI CONCIERGE
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Online • Haldwani Showroom</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-stone-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Rates Snapshot inside Widget */}
          <div className="bg-[#FAF7F2] p-3 border-b border-[#E8D5B5] flex items-center justify-between text-[11px]">
            <span className="text-stone-600">Today's 22K (916): <strong>{formatINR(rates.gold22k)}</strong>/10g</span>
            <button 
              onClick={() => { onOpenCalculator(); setIsOpen(false); }}
              className="text-[#996515] font-semibold underline"
            >
              Calculator
            </button>
          </div>

          {/* Chat Prompts */}
          <div className="p-4 space-y-3 bg-[#FBF9F5]">
            <div className="bg-white p-3 rounded-xl border border-stone-200 text-stone-800 text-xs shadow-2xs">
              Namaste! Welcome to <strong>DHANLAXMI JWELLERS</strong>. How can we assist you with our bridal, gold, or diamond jewelry today?
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-stone-500 block">
                Tap to chat with our showroom concierge:
              </span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPrompt(p.msg)}
                  className="w-full text-left p-2.5 rounded-lg bg-white border border-stone-200 hover:border-[#C59B27] hover:bg-[#FAF7F2] text-stone-800 transition text-[11px] font-medium flex items-center justify-between group cursor-pointer"
                >
                  <span>{p.label}</span>
                  <Send className="w-3 h-3 text-[#996515] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <form onSubmit={handleCustomSend} className="flex gap-2 pt-1">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Type your jewelry query..."
                className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-[10px] text-stone-500 pt-1">
              Direct Phone: <a href={`tel:${settings.storePhone}`} className="font-bold text-stone-800">{settings.storePhone}</a> • Nanda Vihar Haldwani
            </div>

          </div>

        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        id="floating-whatsapp-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl transition-all transform hover:scale-105 border-2 border-white/40 group cursor-pointer"
        title="Chat with Dhanlaxmi Jwellers Haldwani on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current animate-bounce" />
        <span className="hidden sm:inline font-semibold text-xs uppercase tracking-wider">
          Chat on WhatsApp
        </span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
      </button>

    </div>
  );
};
