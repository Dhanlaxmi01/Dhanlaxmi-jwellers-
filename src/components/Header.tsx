import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Crown, 
  ShieldCheck, 
  Settings2, 
  Sparkles,
  MapPin,
  Bot,
  MessageSquare,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { JewelryCategory, JewelryProduct, LiveRates, SiteSettings } from '../types';
import { AdvancedSearchBar } from './AdvancedSearchBar';

interface HeaderProps {
  activeCategory: JewelryCategory | 'all';
  onSelectCategory: (category: JewelryCategory | 'all') => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAdmin: () => void;
  onOpenCalculator: () => void;
  onOpenShowroom: () => void;
  onOpenAIChatbot: () => void;
  onOpenHuidPortal?: () => void;
  onOpenSwarnYojna?: () => void;
  rates: LiveRates;
  settings: SiteSettings;
  products: JewelryProduct[];
  onSelectProduct: (product: JewelryProduct) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAdmin,
  onOpenCalculator,
  onOpenShowroom,
  onOpenAIChatbot,
  onOpenHuidPortal,
  onOpenSwarnYojna,
  rates,
  settings,
  products,
  onSelectProduct,
  searchQuery,
  onSearchChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  // Close drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems: { label: string; value: JewelryCategory | 'all'; badge?: string; subItems?: string[] }[] = [
    { label: 'All Collections', value: 'all', subItems: ['New Arrivals', 'Best Sellers', 'Trending Now'] },
    { label: 'Bridal Royale', value: 'bridal', badge: 'Heritage', subItems: ['Kundan Sets', 'Polki Jewellery', 'Bridal Necklaces'] },
    { label: 'Gold 22K/24K', value: 'gold', badge: 'BIS 916', subItems: ['Daily Wear Gold', 'Gold Chains', 'Gold Bangles'] },
    { label: 'Diamond Solitaires', value: 'diamond', badge: 'IGI', subItems: ['Diamond Rings', 'Diamond Earrings', 'Solitaire Pendants'] },
    { label: '925 Silver Artefacts', value: 'silver', subItems: ['Silver Coins', 'Silver Utensils', 'Silver Jewellery'] },
  ];

  const handleCategoryClick = (value: JewelryCategory | 'all') => {
    onSelectCategory(value);
    setMobileMenuOpen(false);
  };

  const toggleAccordion = (value: string) => {
    setExpandedAccordion(expandedAccordion === value ? null : value);
  };

  return (
    <header className="bg-[#FAF7F2] border-b border-[#E8D5B5]/60 sticky top-9 z-40 shadow-xs transition-all w-full max-w-full overflow-hidden">
      {/* Main Brand & Navigation Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Top Tier: Brand Identity & Actions */}
        <div className="flex items-center justify-between py-3.5 sm:py-4 border-b border-[#E8D5B5]/40 gap-3">
          
          {/* Mobile Menu Trigger */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-[#081816] hover:text-[#C59B27] transition rounded-full hover:bg-[#F3EEE6]"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Left: Quick Hallmarking & Store Badge (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-stone-600 font-sans-modern">
            <button 
              onClick={onOpenHuidPortal}
              className="flex items-center gap-1.5 bg-[#F3EEE6] px-3 py-1.5 rounded-full border border-[#E8D5B5] hover:bg-[#E8D5B5] transition cursor-pointer group"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C59B27] group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-stone-800">Verify HUID</span>
            </button>
            <button
              onClick={onOpenShowroom}
              className="flex items-center gap-1 hover:text-[#C59B27] transition text-stone-600 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C59B27]" />
              <span className="truncate max-w-[140px]">Haldwani Showroom</span>
            </button>
          </div>

          {/* Center: Regal Brand Logo (Tanishq Aesthetic) */}
          <div className="flex-1 text-center cursor-pointer" onClick={() => handleCategoryClick('all')}>
            <div className="inline-flex flex-col items-center group">
              <div className="flex items-center gap-2">
                <Crown className="w-4 sm:w-5 h-4 sm:h-5 text-[#C59B27] transition-transform group-hover:scale-110 duration-300" />
                <span className="text-xl sm:text-2xl md:text-3xl font-serif-luxury font-bold tracking-[0.18em] text-[#0A1A18] uppercase transition-colors group-hover:text-[#C59B27] duration-300">
                  DHANLAXMI
                </span>
                <Crown className="w-4 sm:w-5 h-4 sm:h-5 text-[#C59B27] transition-transform group-hover:scale-110 duration-300" />
              </div>
              <div className="flex items-center gap-3 w-full justify-center mt-0.5">
                <div className="h-[1px] w-6 bg-[#C59B27]/40"></div>
                <span className="text-[9px] sm:text-xs font-sans-modern font-semibold uppercase tracking-[0.35em] text-[#996515]">
                  JWELLERS • HALDWANI
                </span>
                <div className="h-[1px] w-6 bg-[#C59B27]/40"></div>
              </div>
            </div>
          </div>

          {/* Right: Search, AI Concierge, Wishlist, Cart & CMS switch */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Advanced Search Bar Trigger */}
            <button
              id="header-search-btn"
              onClick={() => setSearchModalOpen(true)}
              className="p-2 text-stone-700 hover:text-[#C59B27] hover:bg-[#F3EEE6] rounded-full transition cursor-pointer flex items-center gap-1.5"
              title="Search jewelry catalog"
            >
              <Search className="w-5 h-5" />
              <span className="hidden xl:inline text-xs text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                Search
              </span>
            </button>

            {/* AI Concierge Chat Trigger */}
            <button
              id="header-ai-concierge-btn"
              onClick={onOpenAIChatbot}
              className="p-2 sm:px-3 sm:py-1.5 text-[#996515] bg-[#E8D5B5]/40 hover:bg-[#E8D5B5]/80 rounded-full transition flex items-center gap-1.5 border border-[#C59B27]/30 shadow-2xs cursor-pointer group"
              title="Chat with AI Jewelry Concierge"
            >
              <Sparkles className="w-4 h-4 text-[#996515] group-hover:text-[#C59B27]" />
              <span className="hidden lg:inline text-xs font-bold text-[#081816]">AI Stylist</span>
            </button>

            {/* Wishlist Button */}
            <button
              id="header-wishlist-btn"
              onClick={onOpenWishlist}
              className="relative p-2 text-stone-700 hover:text-[#C59B27] hover:bg-[#F3EEE6] rounded-full transition cursor-pointer"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#C59B27] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 py-2 bg-[#081816] text-[#E8D5B5] hover:bg-[#0c2421] rounded-full shadow-xs transition group cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#DFB76C] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">Bag</span>
              {cartCount > 0 ? (
                <span className="bg-[#C59B27] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              ) : (
                <span className="text-[11px] text-stone-400">0</span>
              )}
            </button>

            {/* Owner CMS Portal Quick Launch */}
            <button
              id="header-admin-cms-btn"
              onClick={onOpenAdmin}
              className="px-2.5 py-1.5 text-[#996515] bg-[#E8D5B5]/50 hover:bg-[#E8D5B5] border border-[#C59B27]/40 rounded-full transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Showroom Owner CMS & Live Rates Manager"
            >
              <Settings2 className="w-4 h-4 text-[#996515]" />
              <span className="text-xs font-bold text-[#081816]">Admin CMS</span>
            </button>
          </div>
        </div>

        {/* Bottom Tier: Category Navigation Tabs */}
        <nav className="hidden lg:flex items-center justify-center space-x-1 py-2.5 relative">
          {navItems.map((item) => {
            const isActive = activeCategory === item.value;
            return (
              <button
                key={item.value}
                id={`nav-cat-${item.value}`}
                onClick={() => onSelectCategory(item.value)}
                className={`group relative px-4 py-1.5 text-xs uppercase tracking-[0.14em] font-medium transition-all rounded-full flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'text-[#081816] font-bold bg-[#E8D5B5]/60 shadow-2xs'
                    : 'text-stone-700 hover:text-[#081816] hover:bg-[#F3EEE6]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isActive ? 'bg-[#081816] text-[#DFB76C]' : 'bg-[#C59B27]/15 text-[#996515]'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {/* Golden Underline Animation */}
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#C59B27] rounded-full transition-all duration-300 ${
                  isActive ? 'w-8' : 'w-0 group-hover:w-8'
                }`}></span>
              </button>
            );
          })}
          
          <div className="h-4 w-[1px] bg-stone-300 mx-2"></div>
          
          <button
            onClick={onOpenSwarnYojna}
            className="px-3 py-1.5 text-xs text-[#996515] hover:text-[#081816] font-semibold flex items-center gap-1 hover:bg-[#F3EEE6] rounded-full transition cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Swarn Yojna</span>
          </button>
          <button
            onClick={onOpenCalculator}
            className="px-3 py-1.5 text-xs text-[#996515] hover:text-[#081816] font-semibold flex items-center gap-1 hover:bg-[#F3EEE6] rounded-full transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Estimated Price Calculator</span>
          </button>
          <button
            onClick={onOpenShowroom}
            className="px-3 py-1.5 text-xs text-stone-700 hover:text-[#081816] font-medium flex items-center gap-1 hover:bg-[#F3EEE6] rounded-full transition cursor-pointer"
          >
            <span>Visit Haldwani Store</span>
          </button>
        </nav>
      </div>

      {/* Tanishq-Style Slide-Out Mega Drawer */}
      {/* Overlay Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] lg:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#FAF7F2] z-[100] lg:hidden transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl overflow-hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E8D5B5]/60 bg-white">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#C59B27]" />
            <span className="text-xl font-serif-luxury font-bold tracking-widest text-[#0A1A18] uppercase">
              DHANLAXMI
            </span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-stone-500 hover:text-[#C59B27] bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          
          {/* Featured Visual Banner inside Drawer */}
          <div className="p-4 border-b border-stone-200 bg-gradient-to-br from-[#0A1A18] to-[#122A26] relative overflow-hidden group cursor-pointer">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
             <div className="relative z-10 flex flex-col gap-1 items-start">
                <span className="text-xs text-[#E8D5B5] font-semibold tracking-widest uppercase">Trending Collection</span>
                <h3 className="text-xl text-white font-serif-luxury font-bold">Festive Gold 2026</h3>
                <p className="text-[11px] text-stone-300 mt-1 mb-3 max-w-[80%]">Discover our heritage bridal suites & temple motifs crafted in 22K Gold.</p>
                <button className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold text-[#0A1A18] bg-[#DFB76C] rounded-full hover:bg-white transition-colors group-hover:shadow-[0_0_15px_rgba(223,183,108,0.5)]">
                  Explore Now
                </button>
             </div>
             {/* Decorative glow */}
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#C59B27]/40 blur-2xl rounded-full"></div>
          </div>

          {/* Accordion Categories */}
          <div className="py-2">
            {navItems.map((item) => (
              <div key={item.value} className="border-b border-stone-100 last:border-0">
                <button
                  onClick={() => item.subItems ? toggleAccordion(item.value) : handleCategoryClick(item.value)}
                  className={`w-full px-5 py-4 text-left flex items-center justify-between transition-colors ${
                    activeCategory === item.value 
                      ? 'bg-[#E8D5B5]/20 text-[#081816]' 
                      : 'text-stone-800 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm tracking-wider font-medium uppercase ${activeCategory === item.value ? 'font-bold' : ''}`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="text-[9px] bg-[#C59B27]/10 text-[#996515] border border-[#C59B27]/20 px-1.5 py-0.5 rounded-sm font-bold tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.subItems && (
                    <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${
                      expandedAccordion === item.value ? 'rotate-180 text-[#C59B27]' : ''
                    }`} />
                  )}
                </button>
                
                {/* Accordion Content */}
                {item.subItems && (
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-stone-50 ${
                    expandedAccordion === item.value ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="py-2 px-6 flex flex-col gap-1">
                      {item.subItems.map((sub, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleCategoryClick(item.value)}
                          className="text-left py-2 text-xs text-stone-600 hover:text-[#C59B27] hover:translate-x-1 transition-transform flex items-center gap-2"
                        >
                          <span className="w-1 h-1 rounded-full bg-[#E8D5B5]"></span>
                          {sub}
                        </button>
                      ))}
                      <button 
                        onClick={() => handleCategoryClick(item.value)}
                        className="text-left py-2 text-xs font-semibold text-[#C59B27] hover:text-[#996515] mt-1"
                      >
                        View All {item.label} &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-white border-t border-stone-200 space-y-2.5">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setSearchModalOpen(true);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F3EEE6] text-xs font-semibold flex items-center justify-between text-stone-800 active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#C59B27]" />
              <span>Search Jewelry Collection</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAIChatbot();
              }}
              className="py-2.5 px-2 rounded-xl bg-gradient-to-br from-[#081816] to-[#0c2421] text-xs font-bold flex flex-col items-center justify-center gap-1.5 text-[#DFB76C] border border-[#C59B27]/20 active:scale-95 transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Stylist</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenSwarnYojna) onOpenSwarnYojna();
              }}
              className="py-2.5 px-2 rounded-xl bg-[#E8D5B5]/30 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 text-[#996515] active:scale-95 transition-transform"
            >
              <Crown className="w-4 h-4" />
              <span>Swarn Yojna</span>
            </button>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAdmin();
            }}
            className="w-full py-3 px-3 rounded-xl bg-stone-100 text-stone-600 text-[11px] font-bold flex items-center justify-center gap-2 border border-stone-200 active:scale-95 transition-transform uppercase tracking-widest mt-2"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Admin CMS Login</span>
          </button>
        </div>
      </div>

      {/* Full Luxury Advanced Search Modal Overlay */}
      {searchModalOpen && (
        <AdvancedSearchBar
          products={products}
          rates={rates}
          isExpandedModal={true}
          onCloseModal={() => setSearchModalOpen(false)}
          onSelectProduct={(p) => {
            setSearchModalOpen(false);
            onSelectProduct(p);
          }}
          onSearchQueryChange={onSearchChange}
        />
      )}
    </header>
  );
};
