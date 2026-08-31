/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  RatesTicker 
} from './components/RatesTicker';
import { 
  Header 
} from './components/Header';
import { 
  HeroSlider 
} from './components/HeroSlider';
import { 
  CollectionSection 
} from './components/CollectionSection';
import { 
  ProductDetailModal 
} from './components/ProductDetailModal';
import { 
  GoldCalculatorModal 
} from './components/GoldCalculatorModal';
import { 
  CartDrawer 
} from './components/CartDrawer';
import { 
  CheckoutModal 
} from './components/CheckoutModal';
import { 
  WishlistModal 
} from './components/WishlistModal';
import { 
  AdminCMS 
} from './components/AdminCMS';
import { 
  AppointmentModal 
} from './components/AppointmentModal';
import { 
  Footer 
} from './components/Footer';
import { 
  WhatsAppWidget 
} from './components/WhatsAppWidget';
import { 
  AIChatbotModal 
} from './components/AIChatbotModal';
import {
  HuidVerificationModal
} from './components/HuidVerificationModal';
import {
  SwarnYojnaModal
} from './components/SwarnYojnaModal';
import {
  ArTryOnModal
} from './components/ArTryOnModal';
import { 
  FestiveAtmosphere 
} from './components/FestiveAtmosphere';
import {
  ErrorBoundary
} from './components/ErrorBoundary';
import { 
  ThemeProvider, 
  useTheme 
} from './context/ThemeContext';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_RATES, 
  INITIAL_SETTINGS 
} from './data/initialData';
import { 
  CartItem, 
  JewelryCategory, 
  JewelryProduct, 
  LiveRates, 
  OrderInquiry, 
  SiteSettings 
} from './types';
import { calculateProductPrice } from './utils/pricing';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { logger } from './utils/logger';
import { 
  ShieldCheck, 
  Sparkles, 
  Crown, 
  Scale, 
  Award, 
  MapPin, 
  Phone
} from 'lucide-react';

function StorefrontApp() {
  const { applyRemoteThemeUpdate } = useTheme();

  // --- STATE MANAGEMENT ---
  const [rates, setRates] = useState<LiveRates>(INITIAL_RATES);
  const [isRatesLoading, setIsRatesLoading] = useState<boolean>(true);

  // 1-Hour Old Estimated Rate System for Storefront
  const oneHourOldRates: LiveRates = useMemo(() => ({
    ...rates,
    gold24k: rates.gold24k - 450,
    gold22k: rates.gold22k - 410,
    gold18k: rates.gold18k - 340,
    gold14k: rates.gold14k - 270,
    silver999: rates.silver999 - 850,
    lastUpdated: "1 Hour Ago (Estimated)",
    change24h: rates.change24h - 450,
    goldRateCommentary: "Prices are locked to 1-hour old estimated market rates to shield customers from real-time volatility.",
  }), [rates]);

  const [products, setProducts] = useState<JewelryProduct[]>(INITIAL_PRODUCTS);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [orders, setOrders] = useState<OrderInquiry[]>([]);
  
  // Navigation & Filters
  const [activeCategory, setActiveCategory] = useState<JewelryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState<number>(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>('');

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<JewelryProduct | null>(null);
  const [appointmentProduct, setAppointmentProduct] = useState<JewelryProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isAIChatbotOpen, setIsAIChatbotOpen] = useState(false);
  const [isHuidPortalOpen, setIsHuidPortalOpen] = useState(false);
  const [isSwarnYojnaOpen, setIsSwarnYojnaOpen] = useState(false);
  const [arTryOnProduct, setArTryOnProduct] = useState<JewelryProduct | null>(null);

  // --- ZERO-DELAY REAL-TIME DATABASE SSE STREAM LISTENER ---
  const { 
    status: realtimeStatus, 
    lastSyncTime, 
    activeEventsCount 
  } = useRealtimeSync({
    onInitialSync: (data) => {
      logger.info('RealtimeSync', 'Received initial state payload', { productCount: data.products?.length });
      if (data.liveRates) {
        setRates(data.liveRates);
        setIsRatesLoading(false);
      }
      if (data.products && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      }
      if (data.settings) {
        setSettings(data.settings);
      }
      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
      if (data.liveConfig) {
        applyRemoteThemeUpdate({
          activeThemeId: data.liveConfig.activeThemeId,
          particlesEnabled: data.liveConfig.particlesEnabled,
          customAnnouncement: data.liveConfig.customAnnouncement
        });
      }
    },
    onProductCreated: (newProd) => {
      logger.info('RealtimeSync', `Product created: ${newProd.name} (${newProd.sku})`);
      setProducts((prev) => {
        const exists = prev.some((p) => p.id === newProd.id);
        if (exists) {
          return prev.map((p) => (p.id === newProd.id ? newProd : p));
        }
        return [newProd, ...prev];
      });
    },
    onProductUpdated: (updatedProd) => {
      logger.info('RealtimeSync', `Product updated: ${updatedProd.name} (${updatedProd.sku})`);
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
      );
      setQuickViewProduct((cur) => (cur && cur.id === updatedProd.id ? updatedProd : cur));
    },
    onProductDeleted: ({ id }) => {
      logger.info('RealtimeSync', `Product deleted from live catalog: ${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setQuickViewProduct((cur) => (cur && cur.id === id ? null : cur));
    },
    onProductRestored: (restoredProd) => {
      logger.info('RealtimeSync', `Product restored to catalog: ${restoredProd.name}`);
      setProducts((prev) => {
        const exists = prev.some((p) => p.id === restoredProd.id);
        if (exists) return prev.map((p) => (p.id === restoredProd.id ? restoredProd : p));
        return [restoredProd, ...prev];
      });
    },
    onRatesUpdated: (newRates) => {
      logger.info('RealtimeSync', 'Bullion rates synchronized', newRates);
      setRates(newRates);
      setIsRatesLoading(false);
    },
    onThemeUpdated: (themeData) => {
      applyRemoteThemeUpdate(themeData);
    },
    onLiveConfigUpdated: (config) => {
      if (config.rates) {
        setRates(config.rates);
        setIsRatesLoading(false);
      }
      applyRemoteThemeUpdate({
        activeThemeId: config.activeThemeId,
        particlesEnabled: config.particlesEnabled,
        customAnnouncement: config.customAnnouncement
      });
    },
    onSettingsUpdated: (newSettings) => {
      setSettings(newSettings);
    },
    onOrderCreated: (newOrder) => {
      setOrders((prev) => {
        if (prev.some((o) => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });
    },
    onOrderUpdated: (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    }
  });

  // --- INITIAL DATA FETCH & LOCAL SYNC FALLBACK ---
  useEffect(() => {
    fetch('/api/rates')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setRates(data);
        setIsRatesLoading(false);
      })
      .catch((err) => {
        logger.warn('InitialFetch', 'Rates fallback error', err);
        setIsRatesLoading(false);
      });

    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) setProducts(data);
      })
      .catch((err) => logger.warn('InitialFetch', 'Products fallback error', err));

    fetch('/api/orders')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) setOrders(data);
      })
      .catch((err) => logger.warn('InitialFetch', 'Orders fallback error', err));

    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch((err) => logger.warn('InitialFetch', 'Settings fallback error', err));
  }, []);

  // --- CART HANDLERS ---
  const handleAddToCart = useCallback((product: JewelryProduct, size?: string) => {
    const breakdown = calculateProductPrice(product, oneHourOldRates, appliedDiscountPercent);
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedSize === size
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        const newItem: CartItem = {
          id: 'ci-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          product,
          quantity: 1,
          selectedSize: size || (product.sizesAvailable && product.sizesAvailable[0]),
          giftWrap: false,
          breakdown
        };
        return [...prev, newItem];
      }
    });
  }, [oneHourOldRates, appliedDiscountPercent]);

  const handleUpdateCartQuantity = useCallback((id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const handleRemoveCartItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleToggleGiftWrap = useCallback((id: string) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, giftWrap: !i.giftWrap } : i))
    );
  }, []);

  // --- WISHLIST HANDLERS ---
  const handleToggleWishlist = useCallback((product: JewelryProduct) => {
    setWishlistIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );
  }, []);

  const handleMoveWishlistToCart = useCallback((product: JewelryProduct) => {
    handleAddToCart(product);
    setWishlistIds((prev) => prev.filter((id) => id !== product.id));
  }, [handleAddToCart]);

  const wishlistProducts = useMemo(() => {
    return products.filter((p) => wishlistIds.includes(p.id));
  }, [products, wishlistIds]);

  // --- ADMIN CMS ACTIONS ---
  const handleUpdateRates = useCallback(async (newRates: LiveRates) => {
    setRates(newRates);
    try {
      await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRates),
      });
    } catch (err) {
      logger.warn('AdminAction', 'Rates update API failure', err);
    }
  }, []);

  const handleAddProduct = useCallback(async (newProd: JewelryProduct) => {
    setProducts((prev) => [newProd, ...prev]);
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd),
      });
    } catch (err) {
      logger.warn('AdminAction', 'Add product API failure', err);
    }
  }, []);

  const handleUpdateProduct = useCallback(async (updatedProd: JewelryProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
    );
    try {
      await fetch(`/api/products/${updatedProd.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProd),
      });
    } catch (err) {
      logger.warn('AdminAction', 'Update product API failure', err);
    }
  }, []);

  const handleDeleteProduct = useCallback(async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      logger.warn('AdminAction', 'Delete product API failure', err);
    }
  }, []);

  const handleUpdateOrderStatus = useCallback(async (id: string, status: any) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    try {
      await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      logger.warn('AdminAction', 'Update order status API failure', err);
    }
  }, []);

  const handleUpdateSettings = useCallback(async (newSettings: SiteSettings) => {
    setSettings(newSettings);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (err) {
      logger.warn('AdminAction', 'Update settings API failure', err);
    }
  }, []);

  const handleResetFactoryData = useCallback(async () => {
    setProducts([...INITIAL_PRODUCTS]);
    setRates({ ...INITIAL_RATES });
    setSettings({ ...INITIAL_SETTINGS });
    try {
      await fetch('/api/reset-data', { method: 'POST' });
    } catch (err) {
      logger.warn('AdminAction', 'Reset factory data API failure', err);
    }
  }, []);

  // Direct WhatsApp Inquiry for any product
  const handleWhatsAppProductInquiry = useCallback((product: JewelryProduct) => {
    const pb = calculateProductPrice(product, oneHourOldRates);
    const message = `*Namaste Dhanlaxmi Jwellers (Haldwani)*,%0A%0A` +
      `I am inquiring about the following jewelry piece from your collection:%0A` +
      `• *Name:* ${product.name}%0A` +
      `• *SKU:* ${product.sku}%0A` +
      `• *Purity:* ${product.purity} (${product.certification})%0A` +
      `• *Gross Weight:* ${product.grossWeight}g%0A` +
      `• *1-Hour Old Estimated Price:* ₹${pb.totalPrice.toLocaleString('en-IN')}%0A%0A` +
      `Is this piece currently available for viewing at your *Haldwani Nanda Vihar Phase-I* showroom?`;
    window.open(`https://wa.me/91${settings.whatsappNumber}?text=${message}`, '_blank');
  }, [oneHourOldRates, settings.whatsappNumber]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FAF7F2] text-[#1A1A1A] flex flex-col font-sans-modern selection:bg-[#E8D5B5] selection:text-[#0C1E1B]">
      
      {/* 1. Live Gold & Silver Rates Top Ticker */}
      <ErrorBoundary moduleName="RatesTicker">
        <RatesTicker
          rates={oneHourOldRates}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
        />
      </ErrorBoundary>

      {/* 2. Main Luxury Header */}
      <ErrorBoundary moduleName="Header">
        <Header
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            const el = document.getElementById('collections-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)}
          wishlistCount={wishlistIds.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenShowroom={() => {
            document.getElementById('showroom-footer')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenAIChatbot={() => setIsAIChatbotOpen(true)}
          onOpenHuidPortal={() => setIsHuidPortalOpen(true)}
          onOpenSwarnYojna={() => setIsSwarnYojnaOpen(true)}
          rates={oneHourOldRates}
          settings={settings}
          products={products}
          onSelectProduct={(p) => setQuickViewProduct(p)}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            const el = document.getElementById('collections-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </ErrorBoundary>

      {/* 3. Cinematic Hero Showcase */}
      <ErrorBoundary moduleName="HeroSlider">
        <HeroSlider
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            const el = document.getElementById('collections-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenConsultation={() => {
            setAppointmentProduct(null);
            setIsAppointmentOpen(true);
          }}
          rates={oneHourOldRates}
        />
      </ErrorBoundary>

      {/* 4. Hallmark Guarantee & Craftsmanship Trust Banner */}
      <section className="bg-[#FAF7F2] py-8 border-b border-[#E8D5B5]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="bg-white p-4 rounded-xl border border-[#E8D5B5]/60 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C59B27]/40 flex items-center justify-center text-[#996515] shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#C59B27]" />
              </div>
              <div>
                <strong className="text-xs font-bold text-stone-900 block font-serif-luxury">BIS 916 Hallmark</strong>
                <span className="text-[11px] text-stone-500 block">Govt. Certified Purity with HUID</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E8D5B5]/60 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C59B27]/40 flex items-center justify-center text-[#996515] shrink-0">
                <Sparkles className="w-5 h-5 text-[#C59B27]" />
              </div>
              <div>
                <strong className="text-xs font-bold text-stone-900 block font-serif-luxury">Dynamic Live Rates</strong>
                <span className="text-[11px] text-stone-500 block">Transparent daily price calculations</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E8D5B5]/60 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C59B27]/40 flex items-center justify-center text-[#996515] shrink-0">
                <Award className="w-5 h-5 text-[#C59B27]" />
              </div>
              <div>
                <strong className="text-xs font-bold text-stone-900 block font-serif-luxury">Master Karigar Heirlooms</strong>
                <span className="text-[11px] text-stone-500 block">Handcrafted Jadau, Nakshi & Polki</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E8D5B5]/60 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C59B27]/40 flex items-center justify-center text-[#996515] shrink-0">
                <MapPin className="w-5 h-5 text-[#C59B27]" />
              </div>
              <div>
                <strong className="text-xs font-bold text-stone-900 block font-serif-luxury">Haldwani Showroom</strong>
                <span className="text-[11px] text-stone-500 block">Nanda Vihar Phase-I VIP Trials</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Main Jewelry Collections Section */}
      <ErrorBoundary moduleName="CollectionSection">
        <CollectionSection
          products={products}
          rates={oneHourOldRates}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onQuickView={(prod) => setQuickViewProduct(prod)}
          onWhatsAppInquiry={handleWhatsAppProductInquiry}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
          onSearchChange={(q) => setSearchQuery(q)}
        />
      </ErrorBoundary>

      {/* 6. Bridal Haute Joaillerie Spotlight Showcase */}
      <section className="py-16 bg-[#071F1B] text-[#E8D5B5] relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-5 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C59B27]/20 border border-[#C59B27]/40 text-[#DFB76C] text-xs font-bold uppercase tracking-[0.2em]">
                <Crown className="w-3.5 h-3.5 text-[#DFB76C]" />
                SIGNATURE BRIDAL ATELIER
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif-luxury font-bold text-white tracking-wide leading-tight">
                Imperial Adornments for Your Sacred Day
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 font-sans-modern leading-relaxed">
                At <strong>DHANLAXMI JWELLERS</strong>, we craft bridal jewels not merely as ornaments, but as ancestral heirlooms. Every Padmavati choker, temple rani haar, and polki kada is forged with 22 Karat certified gold, handpicked Zambian emeralds, and unblemished uncut diamonds.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3.5 rounded-xl bg-black/40 border border-[#C59B27]/30 space-y-1">
                  <strong className="text-white block font-serif-luxury text-sm">Bespoke Bridal Design</strong>
                  <span className="text-stone-400 block text-[11px]">Custom crafted to match your wedding lehenga.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-[#C59B27]/30 space-y-1">
                  <strong className="text-white block font-serif-luxury text-sm">Private VIP Lounge</strong>
                  <span className="text-stone-400 block text-[11px]">Complimentary trial session at Haldwani boutique.</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAppointmentProduct(null);
                    setIsAppointmentOpen(true);
                  }}
                  className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#061715] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Book Private Bridal Viewing</span>
                </button>

                <a
                  href={`tel:${settings.storePhone}`}
                  className="px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs tracking-wider transition flex items-center gap-2 border border-white/20"
                >
                  <Phone className="w-4 h-4 text-[#DFB76C]" />
                  <span>Speak with Bridal Stylist: {settings.storePhone}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-3 sm:space-y-4">
                  <img
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=85"
                    alt="Bridal Kundan Set"
                    className="rounded-2xl shadow-xl object-cover h-64 w-full border border-[#C59B27]/30 transform hover:scale-[1.02] transition"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=85"
                    alt="Temple Jhumkas"
                    className="rounded-2xl shadow-xl object-cover h-44 w-full border border-[#C59B27]/30 transform hover:scale-[1.02] transition"
                  />
                </div>
                <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-8">
                  <img
                    src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=85"
                    alt="Heritage Gold Rani Haar"
                    className="rounded-2xl shadow-xl object-cover h-44 w-full border border-[#C59B27]/30 transform hover:scale-[1.02] transition"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1611591475155-42e9fba5ce55?auto=format&fit=crop&w=800&q=85"
                    alt="Royal Bridal Kada"
                    className="rounded-2xl shadow-xl object-cover h-64 w-full border border-[#C59B27]/30 transform hover:scale-[1.02] transition"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Gold Purity & Hallmarking Transparency Section */}
      <section className="py-14 bg-[#FAF7F2] border-b border-[#E8D5B5]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#996515]">
              TRUST & INTEGRITY
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#081816]">
              The Dhanlaxmi Purity Standard
            </h2>
            <p className="text-xs text-stone-600">
              We uphold the strictest testing guidelines so every piece you acquire remains a pure, high-value asset for generations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            <div className="bg-white p-6 rounded-2xl border border-[#E8D5B5] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#C59B27]/40 flex items-center justify-center text-[#996515]">
                <ShieldCheck className="w-6 h-6 text-[#C59B27]" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                BIS Hallmark 916 & HUID
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Every gold jewel features the official Bureau of Indian Standards triangular stamp, 916 fineness mark, and 6-digit laser engraved Hallmark Unique Identification (HUID).
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E8D5B5] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#C59B27]/40 flex items-center justify-center text-[#996515]">
                <Scale className="w-6 h-6 text-[#C59B27]" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                100% Transparent Price Breakup
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Zero hidden costs. Every customer invoice transparently segregates net metal weight, today's bullion market rate, making charges, gemstones, and official 3% GST.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E8D5B5] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#C59B27]/40 flex items-center justify-center text-[#996515]">
                <Award className="w-6 h-6 text-[#C59B27]" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                Lifetime Buyback & Exchange
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Enjoy 100% metal value exchange guarantees on all Dhanlaxmi gold and diamond creations at our Haldwani Nanda Vihar boutique.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 8. Main Footer with Address, Phone 7668037278 & Map */}
      <ErrorBoundary moduleName="Footer">
        <Footer
          settings={settings}
          onSelectCategory={setActiveCategory}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      </ErrorBoundary>

      {/* 9. Floating WhatsApp Widget */}
      <ErrorBoundary moduleName="WhatsAppWidget">
        <WhatsAppWidget
          settings={settings}
          rates={oneHourOldRates}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
        />
      </ErrorBoundary>

      {/* 10. Modals with isolated Error Boundaries */}
      
      {/* Product Detail Modal */}
      <ErrorBoundary moduleName="ProductDetailModal">
        <ProductDetailModal
          product={quickViewProduct}
          rates={oneHourOldRates}
          isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
          onClose={() => setQuickViewProduct(null)}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={(prod, size) => {
            handleAddToCart(prod, size);
            setIsCartOpen(true);
          }}
          onBookAppointment={(prod) => {
            setAppointmentProduct(prod);
            setQuickViewProduct(null);
            setIsAppointmentOpen(true);
          }}
          onWhatsAppInquiry={handleWhatsAppProductInquiry}
          onOpenArTryOn={(product) => {
            setQuickViewProduct(null);
            setArTryOnProduct(product);
          }}
        />
      </ErrorBoundary>

      {/* Interactive Gold Price Calculator Modal */}
      {isCalculatorOpen && (
        <ErrorBoundary moduleName="GoldCalculatorModal">
          <GoldCalculatorModal
            rates={oneHourOldRates}
            settings={settings}
            onClose={() => setIsCalculatorOpen(false)}
            onOpenConsultation={() => {
              setIsCalculatorOpen(false);
              setIsAppointmentOpen(true);
            }}
          />
        </ErrorBoundary>
      )}

      {/* Cart Drawer */}
      <ErrorBoundary moduleName="CartDrawer">
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          rates={oneHourOldRates}
          settings={settings}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onToggleGiftWrap={handleToggleGiftWrap}
          onOpenCheckout={(discountPct, code) => {
            setAppliedDiscountPercent(discountPct);
            setAppliedCouponCode(code);
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          onOpenShowroom={() => {
            setIsCartOpen(false);
            document.getElementById('showroom-footer')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </ErrorBoundary>

      {/* Checkout & Reservation Modal */}
      <ErrorBoundary moduleName="CheckoutModal">
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cart}
          rates={oneHourOldRates}
          settings={settings}
          discountPercent={appliedDiscountPercent}
          couponCode={appliedCouponCode}
          onOrderSuccess={(newOrder) => {
            setOrders((prev) => [newOrder, ...prev]);
            setCart([]);
          }}
        />
      </ErrorBoundary>

      {/* Wishlist Modal */}
      <ErrorBoundary moduleName="WishlistModal">
        <WishlistModal
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          wishlistProducts={wishlistProducts}
          rates={oneHourOldRates}
          onRemoveFromWishlist={handleToggleWishlist}
          onMoveToCart={(prod) => {
            handleMoveWishlistToCart(prod);
            setIsWishlistOpen(false);
            setIsCartOpen(true);
          }}
          onQuickView={(prod) => {
            setIsWishlistOpen(false);
            setQuickViewProduct(prod);
          }}
        />
      </ErrorBoundary>

      {/* Owner CMS & Dynamic Pricing Backend */}
      <ErrorBoundary moduleName="AdminCMS">
        <AdminCMS
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          rates={rates}
          onUpdateRates={handleUpdateRates}
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetFactoryData={handleResetFactoryData}
          realtimeStatus={realtimeStatus}
          lastSyncTime={lastSyncTime}
          activeEventsCount={activeEventsCount}
        />
      </ErrorBoundary>

      {/* VIP Showroom Trial Appointment Modal */}
      <ErrorBoundary moduleName="AppointmentModal">
        <AppointmentModal
          isOpen={isAppointmentOpen}
          onClose={() => setIsAppointmentOpen(false)}
          selectedProduct={appointmentProduct}
          settings={settings}
        />
      </ErrorBoundary>

      {/* AI Jewelry Stylist Concierge Modal */}
      <ErrorBoundary moduleName="AIChatbotModal">
        <AIChatbotModal
          isOpen={isAIChatbotOpen}
          onClose={() => setIsAIChatbotOpen(false)}
          rates={oneHourOldRates}
          settings={settings}
          products={products}
          onSelectProduct={(p) => setQuickViewProduct(p)}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
        />
      </ErrorBoundary>

      <ErrorBoundary moduleName="HuidVerificationModal">
        <HuidVerificationModal 
          isOpen={isHuidPortalOpen}
          onClose={() => setIsHuidPortalOpen(false)}
        />
      </ErrorBoundary>

      <ErrorBoundary moduleName="SwarnYojnaModal">
        <SwarnYojnaModal
          isOpen={isSwarnYojnaOpen}
          onClose={() => setIsSwarnYojnaOpen(false)}
        />
      </ErrorBoundary>

      <ErrorBoundary moduleName="ArTryOnModal">
        <ArTryOnModal
          isOpen={!!arTryOnProduct}
          product={arTryOnProduct}
          onClose={() => setArTryOnProduct(null)}
        />
      </ErrorBoundary>

      {/* Seasonal & Occasion Festive Particles */}
      <FestiveAtmosphere />

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary moduleName="RootApp">
      <ThemeProvider>
        <StorefrontApp />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
