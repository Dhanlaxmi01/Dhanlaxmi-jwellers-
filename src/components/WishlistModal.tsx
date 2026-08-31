import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { JewelryProduct, LiveRates } from '../types';
import { calculateProductPrice, formatINR } from '../utils/pricing';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: JewelryProduct[];
  rates: LiveRates;
  onRemoveFromWishlist: (product: JewelryProduct) => void;
  onMoveToCart: (product: JewelryProduct) => void;
  onQuickView: (product: JewelryProduct) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  rates,
  onRemoveFromWishlist,
  onMoveToCart,
  onQuickView,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[#C59B27]/40 p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8D5B5] pb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            <h2 className="font-serif-luxury text-xl font-bold text-[#081816]">
              Your Saved Jewelry Pieces ({wishlistProducts.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-500 hover:text-black hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Heart className="w-12 h-12 text-stone-300 mx-auto stroke-[1.5]" />
            <h3 className="font-serif-luxury text-base font-bold text-stone-800">
              No Saved Jewelry Yet
            </h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Tap the heart icon on any jewelry piece across our bridal, gold, or diamond collections to save it here.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#081816] text-[#DFB76C] text-xs font-semibold uppercase tracking-wider hover:bg-[#122e2a] transition"
            >
              Explore Collections
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistProducts.map((product) => {
              const price = calculateProductPrice(product, rates);
              return (
                <div
                  key={product.id}
                  className="bg-[#FAF7F2] rounded-xl p-4 border border-[#E8D5B5] flex flex-col sm:flex-row items-center gap-4 justify-between"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      onClick={() => onQuickView(product)}
                      className="w-16 h-16 rounded-lg object-cover border border-stone-200 cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-[#996515] uppercase tracking-wider block">
                        {product.purity} • {product.grossWeight}g
                      </span>
                      <h4 
                        onClick={() => onQuickView(product)}
                        className="font-serif-luxury text-xs font-bold text-stone-900 truncate hover:text-[#996515] cursor-pointer"
                      >
                        {product.name}
                      </h4>
                      <span className="font-bold text-sm text-[#081816]">
                        {formatINR(price.totalPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => onMoveToCart(product)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-[#081816] hover:bg-[#122e2a] text-[#DFB76C] rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                    <button
                      onClick={() => onRemoveFromWishlist(product)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-white rounded-lg border border-stone-200 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-6 border-t border-[#C59B27]/40 pt-4">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back To Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
