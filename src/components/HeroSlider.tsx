import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, ArrowRight, Calendar, Calculator, Flame } from 'lucide-react';
import { JewelryCategory, LiveRates } from '../types';
import { formatINR } from '../utils/pricing';
import { useTheme } from '../context/ThemeContext';
import { HeroRing3D } from './HeroRing3D';

interface HeroSliderProps {
  onSelectCategory: (category: JewelryCategory) => void;
  onOpenCalculator: () => void;
  onOpenConsultation: () => void;
  rates: LiveRates;
}

interface Slide {
  id: number;
  tagline: string;
  title: string;
  subtitle: string;
  category: JewelryCategory;
  ctaText: string;
  image: string;
  video?: string;
  accentColor: string;
  gradient: string;
  badge: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tagline: 'THE IMPERIAL HERITAGE COLLECTION',
    title: 'Padmavati Bridal Royale',
    subtitle: 'Heirloom 22K Kundan, Polki & Colombian Emerald chokers handcrafted for unforgettable wedding vows.',
    category: 'bridal',
    ctaText: 'Explore Bridal Haute Joaillerie',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=2000&q=90',
    video: 'https://cdn.pixabay.com/video/2021/08/25/86271-593574971_large.mp4',
    accentColor: '#DFB76C',
    gradient: 'from-[#061B18]/95 via-[#061B18]/70 to-transparent',
    badge: '140+ Hours Master Artisan Craftsmanship'
  },
  {
    id: 2,
    tagline: 'ETERNAL TEMPLE & MODERN PURITY',
    title: 'Pure 22K & 24K Gold Elegance',
    subtitle: '100% BIS Hallmarked gold with zero impurities. Timeless Nakshi carvings and lightweight daily wear treasures.',
    category: 'gold',
    ctaText: 'Discover Pure Gold Treasures',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=2000&q=90',
    accentColor: '#F5D061',
    gradient: 'from-[#0C1E1B]/95 via-[#0C1E1B]/65 to-transparent',
    badge: 'HUID Laser Marked & NABL Tested'
  },
  {
    id: 3,
    tagline: 'ETERNITY IN EVERY FACET',
    title: 'Celestial Solitaires & Couture',
    subtitle: 'Triple Excellent Cut VVS diamonds certified by IGI. Radiant engagement rings and red-carpet chandeliers.',
    category: 'diamond',
    ctaText: 'View Diamond Solitaires',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=2000&q=90',
    accentColor: '#E2E8F0',
    gradient: 'from-[#0A192F]/95 via-[#0A192F]/70 to-transparent',
    badge: 'IGI Certified • Conflict Free'
  },
  {
    id: 4,
    tagline: 'SACRED AUSPICIOUS TRADITIONS',
    title: 'Heirloom 925 Sterling Silver',
    subtitle: 'Antique handcrafted bridal payals, carved pooja thalis, and royal silverware for auspicious blessings.',
    category: 'silver',
    ctaText: 'Explore 925 Silver Artefacts',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=2000&q=90',
    accentColor: '#CBD5E1',
    gradient: 'from-[#1E293B]/95 via-[#1E293B]/70 to-transparent',
    badge: 'Pure 925 Sterling Silver Certified'
  }
];

export const HeroSlider: React.FC<HeroSliderProps> = React.memo(({
  onSelectCategory,
  onOpenCalculator,
  onOpenConsultation,
  rates
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { activeTheme } = useTheme();

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = SLIDES[currentSlide];

  return (
    <section 
      className="relative min-h-[580px] sm:h-[640px] lg:h-[700px] bg-[#061715] overflow-hidden select-none w-full max-w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images / Videos with smooth fade */}
      {SLIDES.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {s.video ? (
            <video
              src={s.video}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-out"
            />
          ) : (
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-out"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          )}
          {/* Multi-layered luxury gradients */}
          <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient}`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#061715] via-transparent to-black/40"></div>
          {/* Subtle gold radial ambient illumination */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#DFB76C]/10 blur-3xl pointer-events-none"></div>
        </div>
      ))}

      {/* Foreground Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          
          {/* Left Column: Headline, Subtitle, & CTAs */}
          <div className="lg:col-span-7 text-left space-y-4 sm:space-y-6">
            
            {/* Top Tagline & Hallmark Badge */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#081816]/80 backdrop-blur-md border border-[#DFB76C]/40 text-[#DFB76C] text-xs font-semibold uppercase tracking-[0.2em]">
                <Sparkles className="w-3 h-3 text-[#DFB76C]" />
                {activeTheme.id !== 'default' && currentSlide === 0 ? activeTheme.heroTagline : slide.tagline}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-stone-300 bg-black/40 px-2.5 py-1 rounded-full border border-stone-700">
                <ShieldCheck className="w-3.5 h-3.5 text-[#DFB76C]" />
                {slide.badge}
              </span>
              {activeTheme.id !== 'default' && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-950 font-bold bg-amber-400 px-2.5 py-1 rounded-full shadow-md">
                  <Flame className="w-3.5 h-3.5 text-amber-950" />
                  {activeTheme.badge}
                </span>
              )}
            </div>

            {/* Main Royal Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif-luxury font-bold text-white tracking-wide leading-[1.12]">
              {activeTheme.id !== 'default' && currentSlide === 0 ? activeTheme.heroHeadline : slide.title}
            </h1>

            {/* Subtitle / Festive discount note */}
            <p className="text-sm sm:text-base md:text-lg text-stone-200 font-sans-modern font-light leading-relaxed max-w-xl text-stone-200/90">
              {activeTheme.id !== 'default' && currentSlide === 0 ? (
                <span className="text-amber-200 font-medium block">
                  {activeTheme.festiveDiscountNote} • {slide.subtitle}
                </span>
              ) : (
                slide.subtitle
              )}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <button
                type="button"
                id={`hero-explore-btn-${slide.category}`}
                onClick={() => onSelectCategory(slide.category)}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#061715] font-semibold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 shadow-lg hover:shadow-[#C59B27]/30 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                id="hero-book-viewing-btn"
                onClick={onOpenConsultation}
                className="px-5 py-3.5 rounded-full bg-black/40 backdrop-blur-md border border-[#DFB76C]/50 text-white font-medium text-xs sm:text-sm tracking-wider hover:bg-[#081816]/80 hover:border-[#DFB76C] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#DFB76C]" />
                <span>Book Showroom Trial</span>
              </button>
            </div>

          </div>

          {/* Right Column (Desktop): 3D Rotating Gold Ring Showcase */}
          <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center relative">
            <HeroRing3D interactive={true} />

            {/* Floating Live Rate Pill attached beneath 3D Ring */}
            <div className="w-full max-w-sm mt-3">
              <div className="bg-[#081816]/90 backdrop-blur-md border border-[#C59B27]/40 p-3.5 rounded-2xl shadow-2xl text-xs text-[#E8D5B5] animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#C59B27]/20 pb-1.5 mb-1.5">
                  <span className="font-semibold text-white tracking-wider flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3 h-3 text-[#DFB76C]" />
                    TODAY'S 22K GOLD RATE
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">BIS 916</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-[#DFB76C] font-serif-luxury">
                    {formatINR(rates.gold22k)}
                  </span>
                  <span className="text-stone-300 text-[11px]">per 10 grams</span>
                </div>
                <div className="mt-1.5 pt-1.5 border-t border-[#C59B27]/10 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">1 Gram: {formatINR(Math.round(rates.gold22k / 10))}</span>
                  <button 
                    type="button"
                    onClick={onOpenCalculator}
                    className="text-[#DFB76C] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Price Calculator</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        id="hero-prev-slide-btn"
        onClick={() => setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1))}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/70 border border-white/20 transition-all cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        id="hero-next-slide-btn"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/70 border border-white/20 transition-all cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              i === currentSlide ? 'w-8 bg-[#DFB76C]' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
});

HeroSlider.displayName = 'HeroSlider';
