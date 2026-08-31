import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ShieldCheck, 
  Gift, 
  ArrowRight, 
  Sparkles, 
  Check, 
  MapPin, 
  Tag
} from 'lucide-react';
import { CartItem, LiveRates, SiteSettings } from '../types';
import { calculateProductPrice, formatINR } from '../utils/pricing';
import { PROMO_CODES } from '../data/initialData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  rates: LiveRates;
  settings: SiteSettings;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onToggleGiftWrap: (id: string) => void;
  onOpenCheckout: (discountPct: number, appliedCode: string) => void;
  onOpenShowroom: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  rates,
  settings,
  onUpdateQuantity,
  onRemoveItem,
  onToggleGiftWrap,
  onOpenCheckout,
  onOpenShowroom,
}) => {
  if (!isOpen) return null;

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedCoupon({ code, discountPercent: PROMO_CODES[code].discountPercent });
      setCouponError('');
    } else {
      setCouponError('Invalid promo code. Try ROYALGOLD or BRIDAL2026');
    }
  };

  // Re-calculate cart totals dynamically based on current live rates
  let subtotalMetalStones = 0;
  let totalRawMakingCharges = 0;
  let totalMakingDiscount = 0;

  items.forEach((item) => {
    const freshBreakdown = calculateProductPrice(
      item.product,
      rates,
      appliedCoupon ? appliedCoupon.discountPercent : 0
    );
    subtotalMetalStones += (freshBreakdown.goldValue + freshBreakdown.diamondValue + freshBreakdown.gemstoneValue) * item.quantity;
    totalRawMakingCharges += (freshBreakdown.makingCharges + freshBreakdown.discountOnMaking) * item.quantity;
    totalMakingDiscount += freshBreakdown.discountOnMaking * item.quantity;
  });

  const effectiveMaking = totalRawMakingCharges - totalMakingDiscount;
  const taxableSubtotal = subtotalMetalStones + effectiveMaking;
  const gstTotal = Math.round(taxableSubtotal * (rates.gstRate || 0.03));
  const grandTotal = taxableSubtotal + gstTotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#C59B27]/40 animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8D5B5] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#996515]" />
            <h2 className="font-serif-luxury text-lg font-bold text-[#081816] tracking-wide">
              Your Jewelry Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-500 hover:text-black hover:bg-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E8D5B5] flex items-center justify-center mx-auto text-[#996515]">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-800">
                Your Bag is Empty
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Explore our Royal Bridal, Pure 22K Gold, and Solitaire Diamond collections.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-[#081816] text-[#DFB76C] text-xs font-semibold uppercase tracking-wider hover:bg-[#122e2a] transition shadow-xs"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            items.map((item) => {
              const freshPrice = calculateProductPrice(
                item.product, 
                rates, 
                appliedCoupon ? appliedCoupon.discountPercent : 0
              );
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-3.5 border border-[#E8D5B5] shadow-2xs space-y-3"
                >
                  <div className="flex gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-[#996515] uppercase tracking-wider">
                          {item.product.purity} • {item.product.grossWeight}g
                        </span>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-stone-400 hover:text-rose-600 transition"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="font-serif-luxury text-xs font-bold text-stone-900 truncate mt-0.5" title={item.product.name}>
                        {item.product.name}
                      </h4>

                      {item.selectedSize && (
                        <p className="text-[10px] text-stone-500 mt-0.5">
                          Variant: {item.selectedSize}
                        </p>
                      )}

                      <div className="flex items-baseline justify-between mt-2">
                        <span className="font-bold text-sm text-[#081816]">
                          {formatINR(freshPrice.totalPrice * item.quantity)}
                        </span>

                        {/* Quantity adjuster */}
                        <div className="flex items-center border border-stone-300 rounded-md overflow-hidden text-xs">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gift Wrap Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-600">
                    <button
                      onClick={() => onToggleGiftWrap(item.id)}
                      className="flex items-center gap-1.5 hover:text-[#996515] transition"
                    >
                      <Gift className={`w-3.5 h-3.5 ${item.giftWrap ? 'text-[#996515]' : 'text-stone-400'}`} />
                      <span>{item.giftWrap ? 'Luxury Royal Gift Box Added' : 'Add Luxury Royal Gift Box (Free)'}</span>
                    </button>
                    {item.giftWrap && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                        Complimentary
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Promo code form */}
          {items.length > 0 && (
            <div className="pt-2">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter Coupon (e.g. ROYALGOLD)"
                    className="w-full bg-[#FAF7F2] border border-[#E8D5B5] rounded-lg pl-8 pr-3 py-2 text-xs uppercase tracking-wider font-semibold focus:outline-none focus:border-[#C59B27]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#081816] text-[#DFB76C] rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-[#122e2a] transition"
                >
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800 font-medium">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Coupon <strong>{appliedCoupon.code}</strong> Applied ({appliedCoupon.discountPercent}% OFF Making)
                  </span>
                  <button 
                    onClick={() => setAppliedCoupon(null)}
                    className="text-stone-500 hover:text-stone-800 underline text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>
              )}

              {/* Quick coupons preview */}
              <div className="flex gap-1.5 mt-2 text-[10px] text-stone-500">
                <span>Try:</span>
                <button
                  onClick={() => { setCouponInput('ROYALGOLD'); }}
                  className="underline hover:text-[#996515]"
                >
                  ROYALGOLD
                </button>
                <span>•</span>
                <button
                  onClick={() => { setCouponInput('BRIDAL2026'); }}
                  className="underline hover:text-[#996515]"
                >
                  BRIDAL2026
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Checkout Action Container */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#E8D5B5] bg-[#FAF7F2] space-y-3">
            
            {/* Price Breakup */}
            <div className="space-y-1 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Metal & Gemstone Value:</span>
                <span className="font-semibold text-stone-900">{formatINR(subtotalMetalStones)}</span>
              </div>
              <div className="flex justify-between">
                <span>Making Charges:</span>
                <span className="font-semibold text-stone-900">{formatINR(effectiveMaking)}</span>
              </div>
              {totalMakingDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Making Discount ({appliedCoupon?.code}):</span>
                  <span>-{formatINR(totalMakingDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated GST (3%):</span>
                <span className="font-semibold text-stone-900">{formatINR(gstTotal)}</span>
              </div>
              <div className="border-t border-[#C59B27]/40 pt-1.5 flex items-baseline justify-between text-base">
                <span className="font-serif-luxury font-bold text-[#081816]">Grand Total:</span>
                <span className="text-xl font-bold font-serif-luxury text-[#996515]">
                  {formatINR(grandTotal)}
                </span>
              </div>
            </div>

            {/* Guarantees */}
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                100% BIS 916 Guaranteed
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#996515]" />
                Showroom Pickup Available
              </span>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              id="proceed-to-checkout-btn"
              onClick={() => onOpenCheckout(appliedCoupon ? appliedCoupon.discountPercent : 0, appliedCoupon?.code || '')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#061715] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Luxury Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#081816] hover:bg-[#122e2a] text-[#DFB76C] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition mt-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back To Main Menu</span>
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
