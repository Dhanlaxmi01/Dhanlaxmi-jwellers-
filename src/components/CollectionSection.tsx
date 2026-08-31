import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCcw,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { JewelryCategory, JewelryProduct, LiveRates } from '../types';
import { ProductCard } from './ProductCard';
import { calculateProductPrice } from '../utils/pricing';
import { 
  filterAndRankProductsSemantically, 
  parseSemanticJewelryQuery, 
  POPULAR_SEMANTIC_PRESETS 
} from '../utils/semanticSearch';

interface CollectionSectionProps {
  products: JewelryProduct[];
  rates: LiveRates;
  activeCategory: JewelryCategory | 'all';
  onSelectCategory: (cat: JewelryCategory | 'all') => void;
  wishlistIds: string[];
  onToggleWishlist: (product: JewelryProduct) => void;
  onAddToCart: (product: JewelryProduct) => void;
  onQuickView: (product: JewelryProduct) => void;
  onWhatsAppInquiry: (product: JewelryProduct) => void;
  searchQuery: string;
  onClearSearch: () => void;
  onSearchChange?: (q: string) => void;
}

const ITEMS_PER_PAGE = 12;

export const CollectionSection: React.FC<CollectionSectionProps> = React.memo(({
  products,
  rates,
  activeCategory,
  onSelectCategory,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  onWhatsAppInquiry,
  searchQuery,
  onClearSearch,
  onSearchChange,
}) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedPurity, setSelectedPurity] = useState<string>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [selectedWeightFilter, setSelectedWeightFilter] = useState<'all' | 'light' | 'medium' | 'heavy'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'weight-desc' | 'newest'>('featured');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(1000000);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset pagination when category, search query, or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, selectedSubcategory, selectedPurity, selectedOccasion, selectedWeightFilter, sortBy, maxPriceFilter, searchQuery]);

  // Subcategories list based on active category
  const subcategories = useMemo(() => {
    const relevantProducts = activeCategory === 'all' 
      ? products 
      : products.filter(p => p.category === activeCategory);
    const set = new Set<string>();
    relevantProducts.forEach(p => set.add(p.subcategory));
    return Array.from(set);
  }, [products, activeCategory]);

  // Semantic query criteria
  const semanticCriteria = useMemo(() => {
    return parseSemanticJewelryQuery(searchQuery);
  }, [searchQuery]);

  // Filtered and sorted products via Semantic Engine
  const filteredProducts = useMemo(() => {
    // 1. Initial base set (either all or filtered semantically)
    let baseList = products;

    if (searchQuery.trim()) {
      const semanticRes = filterAndRankProductsSemantically(products, searchQuery, rates);
      baseList = semanticRes.filteredProducts;
    }

    // 2. Apply additional manual filters if set
    return baseList
      .filter((product) => {
        if (activeCategory !== 'all' && product.category !== activeCategory) {
          return false;
        }
        if (selectedSubcategory !== 'all' && product.subcategory !== selectedSubcategory) {
          return false;
        }
        if (selectedPurity !== 'all' && product.purity !== selectedPurity) {
          return false;
        }
        if (selectedOccasion !== 'all' && !product.occasion.includes(selectedOccasion as any)) {
          return false;
        }
        if (selectedWeightFilter === 'light' && product.grossWeight >= 15) return false;
        if (selectedWeightFilter === 'medium' && (product.grossWeight < 15 || product.grossWeight > 35)) return false;
        if (selectedWeightFilter === 'heavy' && product.grossWeight <= 35) return false;

        const price = calculateProductPrice(product, rates).totalPrice;
        if (price > maxPriceFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = calculateProductPrice(a, rates).totalPrice;
        const priceB = calculateProductPrice(b, rates).totalPrice;

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'weight-desc') return b.grossWeight - a.grossWeight;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        if (searchQuery.trim() && sortBy === 'featured') {
          return 0; // maintain semantic engine ranking
        }
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
  }, [products, activeCategory, selectedSubcategory, selectedPurity, selectedOccasion, selectedWeightFilter, searchQuery, maxPriceFilter, sortBy, rates]);

  // Paginated slice to maintain high 60fps scrolling and fast rendering
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const resetAllFilters = useCallback(() => {
    setSelectedSubcategory('all');
    setSelectedPurity('all');
    setSelectedOccasion('all');
    setSelectedWeightFilter('all');
    setMaxPriceFilter(1000000);
    setSortBy('featured');
    onClearSearch();
    setCurrentPage(1);
  }, [onClearSearch]);

  const handleApplyPreset = useCallback((query: string) => {
    if (onSearchChange) {
      onSearchChange(query);
    }
  }, [onSearchChange]);

  const getCategoryTitle = () => {
    if (searchQuery.trim()) {
      return `Semantic Search: "${searchQuery}"`;
    }
    switch (activeCategory) {
      case 'bridal': return 'Bridal Haute Joaillerie & Heirlooms';
      case 'gold': return 'Pure 22K & 24K Gold Creations';
      case 'diamond': return 'Solitaire Diamonds & Fine Jewelry';
      case 'silver': return '925 Sterling Silver & Pooja Artefacts';
      default: return 'The Dhanlaxmi Masterpiece Collections';
    }
  };

  const getCategorySubtitle = () => {
    if (searchQuery.trim()) {
      return semanticCriteria.humanReadableSummary || 'Smart semantic jewelry filter matching category, metal types, hallmarking purities, and weight classifications.';
    }
    switch (activeCategory) {
      case 'bridal': return 'Imperial Kundan, Polki chokers, temple Rani Haars and wedding ensembles crafted for unforgettable celebrations.';
      case 'gold': return 'Certified BIS 916 gold jewelry with laser hallmarking, intricate filigree, and lightweight modern forms.';
      case 'diamond': return 'IGI certified solitaires with pristine cut, clarity and radiance designed to last through generations.';
      case 'silver': return 'Traditional bridal payals, carved pooja sets, and contemporary sterling silver adornments.';
      default: return 'Explore exquisite heirlooms handcrafted by master karigars with live dynamic daily gold rates and transparent pricing.';
    }
  };

  return (
    <section id="collections-section" className="py-12 sm:py-16 bg-[#FAF7F2] w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8D5B5]/50 border border-[#C59B27]/40 text-[#996515] text-xs font-semibold uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3 text-[#C59B27]" />
            {searchQuery ? 'SEMANTIC JEWELRY FILTERING' : 'EXQUISITE CRAFTSMANSHIP'}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif-luxury font-bold text-[#081816] tracking-wide">
            {getCategoryTitle()}
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm font-sans-modern leading-relaxed">
            {getCategorySubtitle()}
          </p>
        </div>

        {/* Semantic Search Quick Presets Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#E8D5B5]/60 text-[11px] font-mono text-stone-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 font-bold text-[#081816]">
              <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
              Explore Semantic Intent Presets:
            </span>
            {searchQuery && (
              <button 
                type="button"
                onClick={resetAllFilters}
                className="text-[#996515] hover:text-[#081816] font-semibold text-xs transition underline cursor-pointer"
              >
                Clear Search & Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {POPULAR_SEMANTIC_PRESETS.map((preset, idx) => {
              const isSelected = searchQuery.toLowerCase().trim() === preset.query.toLowerCase().trim();
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset.query)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
                    isSelected
                      ? 'bg-[#081816] text-[#DFB76C] border-[#C59B27] ring-2 ring-[#C59B27]/20 scale-105'
                      : 'bg-white text-stone-700 border-[#E8D5B5] hover:border-[#C59B27] hover:bg-[#F3EEE6]'
                  }`}
                  title={preset.desc}
                >
                  <span className="font-semibold">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Semantic Intelligence Breakdown (If search query active) */}
        {searchQuery.trim() && (
          <div className="mb-8 p-4 rounded-2xl bg-[#081816] text-[#FAF7F2] border-2 border-[#C59B27]/50 shadow-lg animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#DFB76C]/10 border border-[#DFB76C]/30 text-[#DFB76C]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-stone-400 font-mono">Semantic Filter:</span>
                    <strong className="text-sm font-bold text-white tracking-wide">"{searchQuery}"</strong>
                    <span className="px-2 py-0.5 rounded-full bg-[#DFB76C]/20 border border-[#DFB76C]/40 text-[#DFB76C] text-[10px] font-mono font-bold">
                      {filteredProducts.length} Items Found
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Automatically mapped category, alloy materials, purity hallmarks, and weight thresholds
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClearSearch}
                className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs text-stone-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear Filter</span>
              </button>
            </div>

            {/* Badges of Detected Semantic Criteria */}
            {semanticCriteria.activeBadges.length > 0 && (
              <div className="pt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] text-stone-400 font-mono uppercase tracking-wider mr-1">
                  Extracted Facets:
                </span>
                {semanticCriteria.activeBadges.map((badge) => (
                  <span
                    key={badge.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900/90 border border-stone-700 text-stone-200 text-xs"
                  >
                    <span className="text-stone-400 text-[10px] uppercase font-mono">{badge.label}:</span>
                    <strong className="text-[#DFB76C] font-semibold">{badge.value}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Tabs Pill Bar */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
          {[
            { id: 'all', label: 'All Collections' },
            { id: 'bridal', label: 'Bridal Royale' },
            { id: 'gold', label: 'Gold 22K/24K' },
            { id: 'diamond', label: 'Diamonds' },
            { id: 'silver', label: '925 Silver' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              id={`collection-tab-${cat.id}`}
              onClick={() => {
                onSelectCategory(cat.id as any);
                setSelectedSubcategory('all');
              }}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#081816] text-[#DFB76C] shadow-md scale-105'
                  : 'bg-white border border-[#E8D5B5] text-stone-700 hover:border-[#C59B27] hover:bg-[#F3EEE6]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter & Sort Bar */}
        <div className="bg-white rounded-xl border border-[#E8D5B5] p-4 mb-8 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          
          {/* Subcategory Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
            <button
              type="button"
              onClick={() => setSelectedSubcategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition cursor-pointer ${
                selectedSubcategory === 'all'
                  ? 'bg-[#E8D5B5] text-[#081816] font-bold'
                  : 'bg-[#FBF9F5] text-stone-600 hover:bg-[#F3EEE6]'
              }`}
            >
              All Types
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition cursor-pointer ${
                  selectedSubcategory === sub
                    ? 'bg-[#081816] text-[#DFB76C] font-bold'
                    : 'bg-[#FBF9F5] text-stone-600 hover:bg-[#F3EEE6]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Right Controls: Purity, Weight Tag, Sort & Reset */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
            
            {/* Weight Category Selector */}
            <select
              value={selectedWeightFilter}
              onChange={(e) => setSelectedWeightFilter(e.target.value as any)}
              className="text-xs bg-[#FBF9F5] border border-[#E8D5B5] rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:border-[#C59B27] cursor-pointer"
              title="Filter by jewelry gross weight tag"
            >
              <option value="all">All Weights</option>
              <option value="light">Lightweight (&lt; 15g)</option>
              <option value="medium">Medium (15g – 35g)</option>
              <option value="heavy">Heavy &amp; Solid (&gt; 35g)</option>
            </select>

            {/* Purity selector */}
            <select
              value={selectedPurity}
              onChange={(e) => setSelectedPurity(e.target.value)}
              className="text-xs bg-[#FBF9F5] border border-[#E8D5B5] rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:border-[#C59B27] cursor-pointer"
            >
              <option value="all">All Purities</option>
              <option value="24K">24K Pure (999)</option>
              <option value="22K">22K Hallmark (916)</option>
              <option value="18K">18K Luxury (750)</option>
              <option value="925 Silver">925 Sterling Silver</option>
            </select>

            {/* Sort options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-[#FBF9F5] border border-[#E8D5B5] rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:border-[#C59B27] cursor-pointer"
            >
              <option value="featured">Semantic Relevance / Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="weight-desc">Heaviest Weight (g)</option>
              <option value="newest">Newest Arrivals</option>
            </select>

            {/* Total Results Count */}
            <span className="text-xs text-stone-500 hidden sm:inline font-mono">
              <strong>{filteredProducts.length}</strong> items
            </span>

            {/* Reset Filters button if any active */}
            {(selectedSubcategory !== 'all' || selectedPurity !== 'all' || selectedOccasion !== 'all' || selectedWeightFilter !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="p-1.5 text-stone-500 hover:text-[#996515] transition cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  rates={rates}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={onAddToCart}
                  onQuickView={onQuickView}
                  onWhatsAppInquiry={onWhatsAppInquiry}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    document.getElementById('collections-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-1 text-xs font-semibold transition ${
                    currentPage === 1
                      ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                      : 'bg-white text-stone-800 border-[#E8D5B5] hover:border-[#C59B27] hover:bg-[#F3EEE6] cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        document.getElementById('collections-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#081816] text-[#DFB76C] shadow-md border border-[#C59B27]'
                          : 'bg-white text-stone-700 border border-[#E8D5B5] hover:border-[#C59B27] hover:bg-[#F3EEE6]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    document.getElementById('collections-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-1 text-xs font-semibold transition ${
                    currentPage === totalPages
                      ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                      : 'bg-white text-stone-800 border-[#E8D5B5] hover:border-[#C59B27] hover:bg-[#F3EEE6] cursor-pointer'
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8D5B5] p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C59B27]/40 flex items-center justify-center mx-auto text-[#996515]">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
              No matching jewelry found
            </h3>
            <p className="text-xs text-stone-600">
              {searchQuery ? `No products matched semantic criteria for "${searchQuery}".` : 'Try adjusting your filter options to explore the Dhanlaxmi collection.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-5 py-2.5 rounded-full bg-[#081816] text-[#DFB76C] text-xs font-semibold uppercase tracking-wider hover:bg-[#122e2a] transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
});

CollectionSection.displayName = 'CollectionSection';
