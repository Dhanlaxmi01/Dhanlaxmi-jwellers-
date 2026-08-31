import React from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Crown, 
  Sparkles, 
  MessageCircle, 
  Award, 
  HeartHandshake, 
  Compass, 
  Mail, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { JewelryCategory, SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  onSelectCategory: (category: JewelryCategory | 'all') => void;
  onOpenCalculator: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onSelectCategory,
  onOpenCalculator,
  onOpenAdmin,
}) => {
  return (
    <footer id="showroom-footer" className="bg-[#081816] text-[#E8D5B5] border-t-2 border-[#C59B27]/40 w-full max-w-full overflow-hidden">
      
      {/* Top Value Propositions / Royal Guarantees Bar */}
      <div className="border-b border-[#C59B27]/20 bg-[#051110] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left w-full">
          
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-xl bg-[#C59B27]/15 border border-[#C59B27]/30 flex items-center justify-center text-[#DFB76C] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-luxury text-sm font-bold text-white tracking-wide">100% BIS Hallmarked</h4>
              <p className="text-xs text-stone-400">916 Certified pure gold with official laser HUID</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-xl bg-[#C59B27]/15 border border-[#C59B27]/30 flex items-center justify-center text-[#DFB76C] shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-luxury text-sm font-bold text-white tracking-wide">IGI Diamond Certified</h4>
              <p className="text-xs text-stone-400">Triple excellent cut solitaires with lab certificates</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-xl bg-[#C59B27]/15 border border-[#C59B27]/30 flex items-center justify-center text-[#DFB76C] shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-luxury text-sm font-bold text-white tracking-wide">Complete Transparency</h4>
              <p className="text-xs text-stone-400">Clear breakdown of metal rates, making & GST</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-12 h-12 rounded-xl bg-[#C59B27]/15 border border-[#C59B27]/30 flex items-center justify-center text-[#DFB76C] shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-luxury text-sm font-bold text-white tracking-wide">Haldwani Flagship</h4>
              <p className="text-xs text-stone-400">VIP showroom viewing at Nanda Vihar</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Body with Prominent Physical Address & Interactive Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Legacy (4 Cols) */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-[#DFB76C]" />
              <span className="font-serif-luxury text-xl sm:text-2xl font-bold tracking-[0.16em] text-white">
                DHANLAXMI
              </span>
            </div>
            <p className="text-[11px] font-sans-modern font-semibold uppercase tracking-[0.25em] text-[#DFB76C]">
              JWELLERS • HALDWANI
            </p>
            <p className="text-xs text-stone-300 font-sans-modern leading-relaxed">
              Crafting timeless heirloom jewelry, regal bridal chokers, certified diamond solitaires, and investment bullion. Trusted across Uttarakhand for absolute purity, bespoke artistry, and transparent market pricing.
            </p>

            {/* Direct Clickable Phone Button & WhatsApp */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <a
                id="footer-call-btn"
                href={`tel:${settings.storePhone}`}
                className="px-4 py-2.5 rounded-xl bg-[#C59B27] hover:bg-[#dfb76c] text-[#081816] font-bold text-xs flex items-center gap-2 transition shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>Call: {settings.storePhone}</span>
              </a>

              <a
                id="footer-whatsapp-chat-btn"
                href={`https://wa.me/91${settings.whatsappNumber}?text=Namaste%20Dhanlaxmi%20Jwellers,%20I%20would%20like%20to%20inquire%20about%20your%20jewelry%20collections.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 transition shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links & Collections (2 Cols) */}
          <div className="lg:col-span-2 space-y-3 text-left">
            <h4 className="font-serif-luxury text-sm font-bold text-white tracking-wider uppercase border-b border-[#C59B27]/30 pb-2">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button 
                  onClick={() => onSelectCategory('bridal')}
                  className="hover:text-[#DFB76C] transition flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 text-[#C59B27]" />
                  <span>Bridal Royale</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('gold')}
                  className="hover:text-[#DFB76C] transition flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 text-[#C59B27]" />
                  <span>Pure 22K/24K Gold</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('diamond')}
                  className="hover:text-[#DFB76C] transition flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 text-[#C59B27]" />
                  <span>Diamond Solitaires</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('silver')}
                  className="hover:text-[#DFB76C] transition flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 text-[#C59B27]" />
                  <span>925 Silver Artefacts</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenCalculator}
                  className="text-[#DFB76C] hover:underline transition flex items-center gap-1 font-semibold pt-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Gold Calculator</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Prominent Physical Showroom Address & Timings (3 Cols) */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <h4 className="font-serif-luxury text-sm font-bold text-white tracking-wider uppercase border-b border-[#C59B27]/30 pb-2">
              Flagship Boutique
            </h4>
            
            {/* Address Banner */}
            <div className="p-3.5 rounded-xl bg-[#051110] border border-[#C59B27]/30 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#DFB76C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[#DFB76C] uppercase font-bold tracking-wider block">
                    Physical Showroom Address:
                  </span>
                  <strong className="text-white text-xs block font-serif-luxury tracking-wide mt-0.5">
                    HALDWANI NANDA VIHAR . PHASE -I
                  </strong>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    Nainital District, Uttarakhand - 263139
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800 flex items-center gap-2 text-[11px] text-stone-300">
                <Clock className="w-3.5 h-3.5 text-[#DFB76C] shrink-0" />
                <span>{settings.showroomTimings}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Phone className="w-3.5 h-3.5 text-[#DFB76C]" />
              <span>Direct Phone: <a href={`tel:${settings.storePhone}`} className="text-white font-bold hover:underline">7668037278</a></span>
            </div>
          </div>

          {/* Column 4: Embedded Interactive Google Map (3 Cols) */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-[#C59B27]/30 pb-2">
              <h4 className="font-serif-luxury text-sm font-bold text-white tracking-wider uppercase">
                Location Map
              </h4>
              <a
                href="https://maps.google.com/?q=Haldwani+Nanda+Vihar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#DFB76C] hover:underline flex items-center gap-1"
              >
                <span>Full Map</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Embedded Google Map Frame */}
            <div className="w-full h-36 rounded-xl overflow-hidden border border-[#C59B27]/40 shadow-md relative bg-stone-900">
              <iframe
                title="Dhanlaxmi Jwellers Haldwani Location"
                src={settings.googleMapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-90 hover:opacity-100 transition"
              ></iframe>
            </div>
            <span className="text-[10px] text-stone-400 block text-center">
              📍 Landmark: Nanda Vihar Phase-I, Haldwani
            </span>
          </div>

        </div>

        {/* Bottom Rights & Admin Access Bar */}
        <div className="mt-12 pt-6 border-t border-[#C59B27]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} <strong>DHANLAXMI JWELLERS</strong>. All Rights Reserved. Haldwani Nanda Vihar Phase-I.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-stone-500">BIS Hallmark Reg. 916</span>
            <button
              onClick={onOpenAdmin}
              className="text-[#DFB76C] hover:text-white underline text-xs font-semibold cursor-pointer"
            >
              Owner CMS & Rate Manager &rarr;
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
