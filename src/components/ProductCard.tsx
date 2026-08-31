import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Eye, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Info,
  Scale
} from 'lucide-react';
import { JewelryProduct, LiveRates } from '../types';
import { calculateProductPrice, formatINR } from '../utils/pricing';
import { Skeleton } from './Skeleton';

interface ProductCardProps {
  product: JewelryProduct;
  rates: LiveRates;
  isWishlisted: boolean;
  onToggleWishlist: (product: JewelryProduct) => void;
  onAddToCart: (product: JewelryProduct) => void;
  onQuickView: (product: JewelryProduct) => void;
  onWhatsAppInquiry: (product: JewelryProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  rates,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  onWhatsAppInquiry,
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [addedAnim, setAddedAnim] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const animTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) {
        clearTimeout(animTimerRef.current);
      }
    };
  }, []);

  // Memoize price calculation to prevent repeated arithmetic operations
  const priceBreakdown = useMemo(() => {
    return calculateProductPrice(product, rates);
  }, [product, rates]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedAnim(true);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => setAddedAnim(false), 1800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWhatsAppInquiry(product);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative w-full bg-white rounded-xl border border-[#E8D5B5]/60 hover:border-[#C59B27] hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden will-change-transform"
      onMouseEnter={() => {
        if (product.images.length > 1) setCurrentImgIndex(1);
      }}
      onMouseLeave={() => {
        setCurrentImgIndex(0);
        setShowPriceBreakdown(false);
      }}
    >
      {/* Product Image Container with Zoom */}
      <div 
        className="relative w-full aspect-square bg-[#FBF9F5] overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        {!imgLoaded && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <img
          src={product.images[currentImgIndex] || product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
          decoding="async"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-[#081816]/90 text-[#DFB76C] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#C59B27]/40 shadow-xs uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="w-2.5 h-2.5 text-[#DFB76C]" />
            {product.purity}
          </span>
          
          {product.isBestSeller && (
            <span className="bg-[#996515] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
              Bestseller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#042A24] text-[#E8D5B5] text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
              New Arrival
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          id={`wishlist-btn-${product.id}`}
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-md'
              : 'bg-white/80 text-stone-600 hover:text-rose-600 hover:bg-white shadow-xs'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Weight and Metal Specs Pill */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm text-stone-200 text-[10px] px-2 py-0.5 rounded-md border border-white/10 font-sans-modern">
            <Scale className="w-3 h-3 text-[#DFB76C]" />
            {product.grossWeight}g {product.metalType}
          </span>
        </div>

        {/* Quick View Floating Action */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="pointer-events-auto px-4 py-2 rounded-full bg-white/90 hover:bg-white text-stone-900 text-xs font-semibold uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition transform translate-y-2 group-hover:translate-y-0 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#996515]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Category & Certification line */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span className="uppercase tracking-wider font-semibold text-[#996515]">
              {product.subcategory}
            </span>
            <span className="flex items-center gap-1 text-stone-600">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span className="text-[10px] truncate max-w-[120px]">{product.certification}</span>
            </span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onQuickView(product)}
            className="font-serif-luxury text-sm font-semibold text-stone-900 line-clamp-2 hover:text-[#996515] transition cursor-pointer min-h-[40px]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Gemstone or Diamond highlight note if applicable */}
          {product.diamondCarat ? (
            <p className="text-[11px] text-stone-600 mt-1">
              ✨ {product.diamondCarat} Ct Solitaire ({product.diamondClarity})
            </p>
          ) : product.gemstoneDetails ? (
            <p className="text-[11px] text-stone-500 truncate mt-1">
              💎 {product.gemstoneDetails}
            </p>
          ) : (
            <p className="text-[11px] text-stone-400 mt-1">
              HUID: {product.huid || 'BIS-916-AUTHENTIC'}
            </p>
          )}
        </div>

        {/* Dynamic Pricing Section */}
        <div className="pt-2 border-t border-stone-100">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-lg sm:text-xl font-bold font-serif-luxury text-[#081816]">
                {formatINR(priceBreakdown.totalPrice)}
              </span>
              <span className="text-[10px] text-stone-500 ml-1.5 block sm:inline">(Incl. 3% GST)</span>
            </div>

            {/* Price Breakdown Trigger */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPriceBreakdown(!showPriceBreakdown);
              }}
              className="text-[11px] text-[#996515] hover:text-[#081816] flex items-center gap-0.5 underline font-medium cursor-pointer"
              title="View transparent gold & making charge breakdown"
            >
              <Info className="w-3 h-3" />
              <span>Breakdown</span>
            </button>
          </div>

          {/* Expanded Price Breakdown Tooltip Box */}
          {showPriceBreakdown && (
            <div className="mt-2 p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E8D5B5] text-[11px] space-y-1 animate-fadeIn">
              <div className="flex justify-between text-stone-600">
                <span>Gold/Metal ({product.grossWeight}g @ {formatINR(priceBreakdown.ratePerGramApplied)}/g):</span>
                <span className="font-semibold text-stone-900">{formatINR(priceBreakdown.goldValue)}</span>
              </div>
              {priceBreakdown.diamondValue > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Diamonds ({product.diamondCarat} ct):</span>
                  <span className="font-semibold text-stone-900">{formatINR(priceBreakdown.diamondValue)}</span>
                </div>
              )}
              {priceBreakdown.gemstoneValue > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Gemstones & Pearls:</span>
                  <span className="font-semibold text-stone-900">{formatINR(priceBreakdown.gemstoneValue)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Making Charges ({product.makingChargePercent}%):</span>
                <span className="font-semibold text-stone-900">{formatINR(priceBreakdown.makingCharges)}</span>
              </div>
              <div className="flex justify-between text-stone-600 border-t border-stone-200 pt-1">
                <span>GST (3%):</span>
                <span className="font-semibold text-stone-900">{formatINR(priceBreakdown.gst)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Add to Bag & WhatsApp Chat */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          <button
            type="button"
            id={`add-to-bag-btn-${product.id}`}
            onClick={handleAddToCart}
            className={`col-span-4 py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              addedAnim
                ? 'bg-emerald-700 text-white'
                : 'bg-[#081816] hover:bg-[#122e2a] text-[#E8D5B5]'
            }`}
          >
            {addedAnim ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#DFB76C]" />
                <span>Add to Bag</span>
              </>
            )}
          </button>

          {/* WhatsApp Direct Product Inquiry Button */}
          <button
            type="button"
            id={`whatsapp-inquire-btn-${product.id}`}
            onClick={handleWhatsApp}
            className="col-span-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
            title="Chat with Haldwani showroom on WhatsApp about this jewelry piece"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
