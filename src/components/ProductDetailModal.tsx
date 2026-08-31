import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles, 
  Scale, 
  Check, 
  MapPin, 
  Calendar,
  Share2,
  Lock,
  ChevronRight,
  Camera,
  Gem
} from 'lucide-react';
import { JewelryProduct, LiveRates } from '../types';
import { calculateProductPrice, formatINR } from '../utils/pricing';
import { Skeleton } from './Skeleton';

interface ProductDetailModalProps {
  product: JewelryProduct | null;
  rates: LiveRates;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (product: JewelryProduct) => void;
  onAddToCart: (product: JewelryProduct, size?: string) => void;
  onBookAppointment: (product: JewelryProduct) => void;
  onWhatsAppInquiry: (product: JewelryProduct) => void;
  onOpenArTryOn?: (product: JewelryProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  rates,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onBookAppointment,
  onWhatsAppInquiry,
  onOpenArTryOn,
}) => {
  if (!product) return null;

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizesAvailable && product.sizesAvailable.length > 0 ? product.sizesAvailable[0] : ''
  );
  const [addedAnim, setAddedAnim] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mainImgLoaded, setMainImgLoaded] = useState(false);

  // Reset imgLoaded when selectedImgIndex changes
  React.useEffect(() => {
    setMainImgLoaded(false);
  }, [selectedImgIndex]);

  const priceBreakdown = calculateProductPrice(product, rates);

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#C59B27]/40 flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-product-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 text-stone-700 hover:text-black hover:bg-white shadow-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Image Gallery */}
        <div className="md:w-1/2 bg-[#FAF7F2] p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E8D5B5]">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-[#E8D5B5] shadow-xs group">
            {!mainImgLoaded && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}
            <img
              src={product.images[selectedImgIndex] || product.images[0]}
              alt={product.name}
              className={`w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-110 ${mainImgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setMainImgLoaded(true)}
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              <span className="bg-[#081816] text-[#DFB76C] text-xs font-bold px-3 py-1 rounded-full border border-[#C59B27]/40 shadow-xs uppercase tracking-wider">
                {product.purity} Pure
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                    selectedImgIndex === idx ? 'border-[#C59B27] shadow-md scale-105' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Hallmarking & Trust Guarantees */}
          <div className="mt-4 pt-4 border-t border-[#E8D5B5]/60 grid grid-cols-2 gap-2 text-[11px] text-stone-600 font-sans-modern">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% BIS Hallmarked 916</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#996515] shrink-0" />
              <span>Insured Transit & Showroom Pickup</span>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Transparent Price Breakdown */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            {/* Category and SKU */}
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-bold text-[#996515] uppercase tracking-wider">{product.category} • {product.subcategory}</span>
              <span>SKU: {product.sku}</span>
            </div>

            {/* Product Title */}
            <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#081816] leading-snug">
              {product.name}
            </h2>

            {/* Price Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#FAF7F2] to-[#F3EEE6] border border-[#C59B27]/40 space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#081816]">
                    {formatINR(priceBreakdown.totalPrice)}
                  </span>
                  <span className="text-xs text-stone-500 ml-2 font-sans-modern">(Includes 3% GST)</span>
                </div>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  1-Hour Old Rate Applied
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Rate applied: {product.purity} @ {formatINR(priceBreakdown.ratePerGramApplied)}/gram (1-Hour Old Est. Market Rate)
              </p>
            </div>

            {/* Transparent Cost Breakup Table */}
            <div className="space-y-1.5 bg-white p-3 rounded-lg border border-stone-200 text-xs">
              <div className="font-semibold text-stone-800 pb-1 border-b border-stone-100 flex items-center justify-between">
                <span>Transparent Price Breakup</span>
                <span className="text-[10px] text-[#996515]">Govt. Compliant</span>
              </div>
              <div className="flex justify-between text-stone-600 pt-1">
                <span>Metal Value ({product.grossWeight}g {product.purity}):</span>
                <span className="font-semibold text-stone-900">{formatINR(priceBreakdown.goldValue)}</span>
              </div>
              {priceBreakdown.diamondValue > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Diamond Gemstones ({product.diamondCarat} Ct, {product.diamondClarity}):</span>
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
              <div className="flex justify-between text-stone-600 border-t border-stone-100 pt-1">
                <span>Applicable GST (3%):</span>
                <span className="font-semibold text-stone-900">{formatINR(priceBreakdown.gst)}</span>
              </div>
            </div>

            {/* Specifications Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 bg-[#FAF7F2] p-3 rounded-lg border border-[#E8D5B5]/60">
              <div>
                <span className="text-stone-500 block text-[10px]">Gross Weight:</span>
                <span className="font-semibold">{product.grossWeight} grams</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px]">Net Gold Weight:</span>
                <span className="font-semibold">{product.netGoldWeight} grams</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px]">Certification:</span>
                <span className="font-semibold text-emerald-700">{product.certification}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px]">HUID Number:</span>
                <span className="font-mono font-medium">{product.huid || 'BIS-VERIFIED'}</span>
              </div>
            </div>

            {/* Sizes / Options if available */}
            {product.sizesAvailable && product.sizesAvailable.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-800 block">
                  Select Size / Style Variant:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizesAvailable.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        selectedSize === size
                          ? 'border-[#C59B27] bg-[#081816] text-[#DFB76C] font-bold'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1 text-xs text-stone-600 leading-relaxed">
              <p>{product.description}</p>
              <p className="italic text-stone-500 text-[11px] pt-1">{product.storyDetails}</p>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-stone-200">
            <div className="grid grid-cols-2 gap-3">
              <button
                id="modal-add-to-cart-btn"
                onClick={handleAddToCart}
                className={`py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md ${
                  addedAnim
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#081816] hover:bg-[#122e2a] text-[#E8D5B5]'
                }`}
              >
                {addedAnim ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#DFB76C]" />
                    <span>Add to Shopping Bag</span>
                  </>
                )}
              </button>

              <button
                id="modal-ar-tryon-btn"
                onClick={() => onOpenArTryOn && onOpenArTryOn(product)}
                className="py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-[#DFB76C] to-[#C59B27] hover:opacity-90 text-[#081816] flex items-center justify-center gap-2 transition shadow-md"
              >
                <Camera className="w-4 h-4" />
                <span>Virtual 3D Try-On</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                id="modal-whatsapp-inquiry-btn"
                onClick={() => onWhatsAppInquiry(product)}
                className="py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 transition shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Inquiry</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => onBookAppointment(product)}
                  className="flex-1 py-2 rounded-xl bg-[#F3EEE6] hover:bg-[#E8D5B5] text-[#081816] font-semibold flex items-center justify-center gap-1.5 transition border border-[#C59B27]/30 text-xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#996515]" />
                  <span>Book Trial</span>
                </button>
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-2 rounded-xl border transition flex items-center justify-center shrink-0 ${
                    isWishlisted ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-stone-200 text-stone-600 hover:text-rose-600 bg-white'
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {copied && (
              <p className="text-[10px] text-emerald-700 text-center font-medium">
                Link copied to clipboard!
              </p>
            )}

            {/* Haldwani Showroom Guarantee */}
            <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500 pt-1 mb-2">
              <MapPin className="w-3 h-3 text-[#996515]" />
              <span>Available for viewing at Haldwani Nanda Vihar Showroom</span>
            </div>
            
            <div className="pt-2 border-t border-stone-200">
              <button
                onClick={onClose}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-sm"
              >
                Back To Main Menu
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
