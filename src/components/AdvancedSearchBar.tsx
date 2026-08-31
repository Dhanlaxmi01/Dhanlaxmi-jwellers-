import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Crown, 
  Tag, 
  Flame,
  ChevronRight,
  Layers,
  Scale,
  Feather,
  Gem,
  Check
} from 'lucide-react';
import { JewelryProduct, LiveRates } from '../types';
import { calculateProductPrice, formatINR } from '../utils/pricing';
import { 
  filterAndRankProductsSemantically, 
  parseSemanticJewelryQuery, 
  POPULAR_SEMANTIC_PRESETS 
} from '../utils/semanticSearch';

interface AdvancedSearchBarProps {
  products: JewelryProduct[];
  rates: LiveRates;
  onSelectProduct: (product: JewelryProduct) => void;
  onSearchQueryChange?: (query: string) => void;
  placeholder?: string;
  className?: string;
  isExpandedModal?: boolean;
  onCloseModal?: () => void;
}

const LOCAL_STORAGE_RECENT_KEY = 'dlx_recent_jewelry_searches';

export const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  products,
  rates,
  onSelectProduct,
  onSearchQueryChange,
  placeholder = 'Search "wedding gold", "heavy rani haar", "22k bangles", "solitaire"...',
  className = '',
  isExpandedModal = false,
  onCloseModal,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(isExpandedModal);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input automatically on modal mount
  useEffect(() => {
    if (isExpandedModal && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isExpandedModal]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load recent searches', e);
    }
  }, []);

  // Debouncing query by 150ms for responsive typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Parse semantic criteria live from query
  const semanticCriteria = useMemo(() => {
    return parseSemanticJewelryQuery(debouncedQuery);
  }, [debouncedQuery]);

  // Semantic Search Results
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const res = filterAndRankProductsSemantically(products, debouncedQuery, rates);
    return res.filteredProducts.slice(0, 10);
  }, [debouncedQuery, products, rates]);

  // Suggestion tags based on active catalog
  const suggestionTags = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];
    
    const tags = new Set<string>();
    products.forEach((p) => {
      if (p.subcategory.toLowerCase().includes(q)) tags.add(p.subcategory);
      if (p.purity.toLowerCase().includes(q)) tags.add(`${p.purity} Gold`);
      if (p.metalType.toLowerCase().includes(q)) tags.add(p.metalType);
      if (p.gemstoneDetails && p.gemstoneDetails.toLowerCase().includes(q)) tags.add(p.gemstoneDetails);
    });
    return Array.from(tags).slice(0, 4);
  }, [debouncedQuery, products]);

  const saveRecentSearch = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_RECENT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(LOCAL_STORAGE_RECENT_KEY);
  };

  const handleSelectProductItem = (product: JewelryProduct) => {
    saveRecentSearch(product.name);
    onSelectProduct(product);
    setIsOpen(false);
    if (onCloseModal) onCloseModal();
  };

  const handlePresetClick = (presetQuery: string) => {
    setQuery(presetQuery);
    setDebouncedQuery(presetQuery);
    saveRecentSearch(presetQuery);
    if (onSearchQueryChange) {
      onSearchQueryChange(presetQuery);
    }
    if (inputRef.current) inputRef.current.focus();
  };

  const handleApplyToCollection = () => {
    if (query.trim()) {
      saveRecentSearch(query);
      if (onSearchQueryChange) {
        onSearchQueryChange(query);
      }
      setIsOpen(false);
      if (onCloseModal) onCloseModal();

      // Smooth scroll to collections
      setTimeout(() => {
        const el = document.getElementById('collections-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        handleSelectProductItem(searchResults[selectedIndex]);
      } else {
        handleApplyToCollection();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      if (onCloseModal) onCloseModal();
    }
  };

  const contentJSX = (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <div 
        className="relative flex items-center bg-white rounded-2xl border-2 border-[#C59B27] shadow-xl ring-4 ring-[#C59B27]/15 p-1"
      >
        <div className="pl-3.5 pr-2 text-[#C59B27] flex items-center justify-center">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full py-2.5 sm:py-3 pr-10 text-xs sm:text-sm text-stone-900 placeholder-stone-400 bg-transparent focus:outline-none font-sans-modern font-medium"
          aria-label="Semantic jewelry search"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
              setSelectedIndex(-1);
              if (inputRef.current) inputRef.current.focus();
            }}
            className="p-1.5 mr-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}

        {isExpandedModal && (
          <button
            type="button"
            onClick={onCloseModal}
            className="p-2 mr-1 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer hidden sm:flex items-center gap-1 text-xs font-semibold"
          >
            <span className="font-mono text-[10px] bg-stone-200 px-1.5 py-0.5 rounded">ESC</span>
          </button>
        )}
      </div>

      {/* Live Semantic Intelligence Feedback Bar */}
      {debouncedQuery.trim() && (
        <div className="p-3 rounded-xl bg-[#081816] text-[#FAF7F2] border border-[#C59B27]/40 shadow-sm space-y-2 animate-fadeIn text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[#DFB76C] font-semibold text-[11px] font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#DFB76C]" />
              <span>Semantic Intent Detected:</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
              {searchResults.length} Pieces Found
            </span>
          </div>

          {/* Active Semantic Facets */}
          {semanticCriteria.activeBadges.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {semanticCriteria.activeBadges.map((badge) => (
                <span
                  key={badge.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-200 text-[11px]"
                >
                  <span className="text-stone-400 text-[9px] uppercase font-mono">{badge.label}:</span>
                  <strong className="text-[#DFB76C]">{badge.value}</strong>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-stone-400">
              Matching jewelry across design stories, BIS purity, karigari craftsmanship, and weights.
            </p>
          )}
        </div>
      )}

      {/* Semantic Intent Presets Row */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-500 uppercase tracking-wider font-bold">
          <Sparkles className="w-3 h-3 text-[#C59B27]" />
          Popular Semantic Intent Searches:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SEMANTIC_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(preset.query)}
              className={`px-2.5 py-1 rounded-lg text-xs transition border cursor-pointer ${
                query.toLowerCase().includes(preset.query.toLowerCase())
                  ? 'bg-[#081816] text-[#DFB76C] border-[#C59B27]'
                  : 'bg-white text-stone-700 border-[#E8D5B5] hover:border-[#C59B27] hover:bg-[#F3EEE6]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results / Empty State */}
      {debouncedQuery.trim() ? (
        searchResults.length > 0 ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 px-1 border-b border-[#E8D5B5]/60 pb-1">
              <span>Found {searchResults.length} Matching Heirlooms</span>
              <span className="text-[#996515]">Press Enter to Filter Collections</span>
            </div>

            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
              {searchResults.map((product, idx) => {
                const priceBreakdown = calculateProductPrice(product, rates);
                const isSelected = idx === selectedIndex;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProductItem(product)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-2.5 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-[#081816] text-white shadow-md ring-1 ring-[#C59B27]' 
                        : 'bg-white hover:bg-[#F3EEE6] text-stone-800 border border-[#E8D5B5]/60'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-[#C59B27]/40 bg-black/10">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className={`absolute bottom-0 inset-x-0 text-[8px] font-bold text-center py-0.5 ${
                        isSelected ? 'bg-amber-400 text-stone-950' : 'bg-[#081816]/80 text-[#DFB76C]'
                      }`}>
                        {product.purity}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs sm:text-sm font-serif-luxury font-bold truncate ${
                        isSelected ? 'text-[#DFB76C]' : 'text-[#081816]'
                      }`}>
                        {product.name}
                      </h4>

                      <p className={`text-[11px] truncate mt-0.5 ${
                        isSelected ? 'text-stone-300' : 'text-stone-600'
                      }`}>
                        {product.subcategory} • <strong>{product.grossWeight}g</strong> {product.netGoldWeight ? `(Net: ${product.netGoldWeight}g)` : ''} • {product.occasion.join(', ')}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                        <span className={`px-1.5 py-0.2 rounded font-medium ${
                          isSelected 
                            ? 'bg-white/15 text-emerald-300' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {product.certification}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded font-medium ${
                          isSelected ? 'bg-white/10 text-stone-200' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {product.metalType}
                        </span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="text-right shrink-0">
                      <div className={`text-xs sm:text-sm font-bold font-sans-modern ${
                        isSelected ? 'text-[#FFEBB5]' : 'text-[#996515]'
                      }`}>
                        {formatINR(priceBreakdown.totalPrice)}
                      </div>
                      <div className={`text-[10px] ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>
                        Incl. 3% GST
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 ml-auto mt-1 transition-transform ${
                        isSelected ? 'text-[#DFB76C] translate-x-1' : 'text-stone-400'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View In Collection CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleApplyToCollection}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#081816] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>View {searchResults.length} Matching Pieces in Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center space-y-2 bg-white rounded-2xl border border-[#E8D5B5]">
            <Search className="w-8 h-8 text-stone-400 mx-auto" />
            <h4 className="text-sm font-serif-luxury font-bold text-stone-800">
              No jewelry matching "{debouncedQuery}"
            </h4>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Try searching with semantic terms like "wedding gold", "22k bangles", "rani haar", or "solitaire diamond".
            </p>
          </div>
        )
      ) : (
        /* Recent Searches section when empty query */
        recentSearches.length > 0 && (
          <div className="pt-1">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#E8D5B5]/60">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C59B27]" />
                Recent Searches
              </span>
              <button
                onClick={clearRecentSearches}
                className="text-[10px] text-stone-400 hover:text-rose-600 transition underline cursor-pointer"
              >
                Clear History
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(item)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-[#F3EEE6] border border-[#E8D5B5] text-xs text-stone-800 transition flex items-center gap-1.5 group cursor-pointer shadow-2xs"
                >
                  <Clock className="w-3 h-3 text-stone-400 group-hover:text-[#C59B27]" />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );

  // If rendered as Full Modal Dialog
  if (isExpandedModal) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-8 sm:pt-14 p-3 sm:p-4 overflow-y-auto animate-fadeIn"
        onClick={onCloseModal}
      >
        <div 
          ref={containerRef}
          className="bg-[#FAF7F2] border-2 border-[#C59B27]/80 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto sm:my-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E8D5B5] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#081816] text-[#DFB76C]">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-luxury font-bold text-stone-900 text-base">
                  Semantic Jewelry Search
                </h3>
                <p className="text-[11px] text-stone-500 font-sans-modern">
                  Search by occasion, gold hallmark, weight in grams, or gemstones
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseModal}
              className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {contentJSX}
        </div>
      </div>
    );
  }

  // Inline container
  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {contentJSX}
    </div>
  );
};
