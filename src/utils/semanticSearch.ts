import { JewelryCategory, JewelryProduct, JewelrySubCategory, GoldPurity, LiveRates } from '../types';
import { calculateProductPrice } from './pricing';

export interface SemanticFilterCriteria {
  rawQuery: string;
  normalizedQuery: string;
  detectedCategories: JewelryCategory[];
  detectedMetalTypes: ('Gold' | 'Diamond' | 'Silver' | 'Polki Kundan' | 'Temple Gold')[];
  detectedSubcategories: JewelrySubCategory[];
  detectedPurities: GoldPurity[];
  detectedOccasions: ('Bridal' | 'Wedding Guest' | 'Daily Wear' | 'Festive' | 'Gifting' | 'Office Wear')[];
  weightTag: 'lightweight' | 'medium' | 'heavy' | null;
  minWeight: number | null; // grams
  maxWeight: number | null; // grams
  minPrice: number | null;
  maxPrice: number | null;
  gender: 'Women' | 'Men' | 'Unisex' | null;
  isBestSellerOnly: boolean;
  isNewArrivalOnly: boolean;
  isHallmarkOnly: boolean;
  gemstoneKeywords: string[];
  remainingKeywords: string[];
  humanReadableSummary: string;
  activeBadges: SemanticBadge[];
}

export interface SemanticBadge {
  id: string;
  type: 'category' | 'material' | 'occasion' | 'weight' | 'purity' | 'subcategory' | 'price' | 'special';
  label: string;
  value: string;
}

export interface SemanticSearchResult {
  product: JewelryProduct;
  score: number;
  matchedAttributes: string[];
}

// Synonyms and semantic intent mappings for luxury Indian jewelry domain
const OCCASION_SYNONYMS: Record<string, 'Bridal' | 'Wedding Guest' | 'Daily Wear' | 'Festive' | 'Gifting' | 'Office Wear'> = {
  wedding: 'Bridal',
  bridal: 'Bridal',
  bride: 'Bridal',
  dulhan: 'Bridal',
  shaadi: 'Bridal',
  shadi: 'Bridal',
  vivah: 'Bridal',
  marriage: 'Bridal',
  trousseau: 'Bridal',
  sangeet: 'Wedding Guest',
  reception: 'Wedding Guest',
  mehendi: 'Wedding Guest',
  guest: 'Wedding Guest',
  daily: 'Daily Wear',
  'daily wear': 'Daily Wear',
  casual: 'Daily Wear',
  everyday: 'Daily Wear',
  regular: 'Daily Wear',
  festive: 'Festive',
  festival: 'Festive',
  diwali: 'Festive',
  dhanteras: 'Festive',
  akshaya: 'Festive',
  tritiya: 'Festive',
  navratri: 'Festive',
  pooja: 'Festive',
  puja: 'Festive',
  karwa: 'Festive',
  chauth: 'Festive',
  teej: 'Festive',
  gifting: 'Gifting',
  gift: 'Gifting',
  anniversary: 'Gifting',
  birthday: 'Gifting',
  token: 'Gifting',
  office: 'Office Wear',
  corporate: 'Office Wear',
  formal: 'Office Wear',
  work: 'Office Wear',
  minimal: 'Office Wear',
};

const CATEGORY_SYNONYMS: Record<string, JewelryCategory> = {
  bridal: 'bridal',
  wedding: 'bridal',
  dulhan: 'bridal',
  gold: 'gold',
  sona: 'gold',
  swarna: 'gold',
  kanchan: 'gold',
  diamond: 'diamond',
  heera: 'diamond',
  solitaire: 'diamond',
  silver: 'silver',
  chandi: 'silver',
  rupya: 'silver',
};

const METAL_SYNONYMS: Record<string, 'Gold' | 'Diamond' | 'Silver' | 'Polki Kundan' | 'Temple Gold'> = {
  gold: 'Gold',
  yellowgold: 'Gold',
  'yellow gold': 'Gold',
  kundan: 'Polki Kundan',
  polki: 'Polki Kundan',
  jadau: 'Polki Kundan',
  uncut: 'Polki Kundan',
  temple: 'Temple Gold',
  antique: 'Temple Gold',
  nakshi: 'Temple Gold',
  naqshi: 'Temple Gold',
  matte: 'Temple Gold',
  diamond: 'Diamond',
  solitaires: 'Diamond',
  silver: 'Silver',
  sterling: 'Silver',
};

const PURITY_SYNONYMS: Record<string, GoldPurity> = {
  '24k': '24K',
  '24kt': '24K',
  '24karat': '24K',
  '24 karat': '24K',
  '999': '24K',
  'pure gold': '24K',
  '22k': '22K',
  '22kt': '22K',
  '22karat': '22K',
  '22 karat': '22K',
  '916': '22K',
  'bis 916': '22K',
  '18k': '18K',
  '18kt': '18K',
  '18karat': '18K',
  '18 karat': '18K',
  '750': '18K',
  '14k': '14K',
  '14kt': '14K',
  '14karat': '14K',
  '925': '925 Silver',
  '925 silver': '925 Silver',
  'sterling silver': '925 Silver',
};

const SUBCATEGORY_SYNONYMS: Record<string, JewelrySubCategory> = {
  necklace: 'Necklaces & Sets',
  necklaces: 'Necklaces & Sets',
  haar: 'Necklaces & Sets',
  'rani haar': 'Necklaces & Sets',
  set: 'Necklaces & Sets',
  sets: 'Necklaces & Sets',
  guluband: 'Chokers & Hasli',
  choker: 'Chokers & Hasli',
  chokers: 'Chokers & Hasli',
  hasli: 'Chokers & Hasli',
  kanthi: 'Chokers & Hasli',
  bangle: 'Bangles & Kadas',
  bangles: 'Bangles & Kadas',
  kada: 'Bangles & Kadas',
  kadas: 'Bangles & Kadas',
  bracelet: 'Bangles & Kadas',
  kangana: 'Bangles & Kadas',
  chooda: 'Bangles & Kadas',
  ring: 'Rings & Bands',
  rings: 'Rings & Bands',
  band: 'Rings & Bands',
  bands: 'Rings & Bands',
  angoothi: 'Rings & Bands',
  solitaire: 'Rings & Bands',
  earring: 'Earrings & Jhumkas',
  earrings: 'Earrings & Jhumkas',
  jhumka: 'Earrings & Jhumkas',
  jhumkas: 'Earrings & Jhumkas',
  jhumki: 'Earrings & Jhumkas',
  studs: 'Earrings & Jhumkas',
  tops: 'Earrings & Jhumkas',
  bali: 'Earrings & Jhumkas',
  baliyan: 'Earrings & Jhumkas',
  mangalsutra: 'Mangalsutra',
  tanmaniya: 'Mangalsutra',
  sutra: 'Mangalsutra',
  pendant: 'Pendants & Chains',
  pendants: 'Pendants & Chains',
  chain: 'Pendants & Chains',
  chains: 'Pendants & Chains',
  locket: 'Pendants & Chains',
  coin: 'Coins & Bars',
  coins: 'Coins & Bars',
  bar: 'Coins & Bars',
  bars: 'Coins & Bars',
  ginni: 'Coins & Bars',
  guinea: 'Coins & Bars',
  biscuit: 'Coins & Bars',
  payal: 'Payal & Anklets',
  anklet: 'Payal & Anklets',
  anklets: 'Payal & Anklets',
  pajeb: 'Payal & Anklets',
  jhanjhar: 'Payal & Anklets',
  pooja: 'Silver Pooja Artefacts',
  puja: 'Silver Pooja Artefacts',
  thali: 'Silver Pooja Artefacts',
  diya: 'Silver Pooja Artefacts',
  idol: 'Silver Pooja Artefacts',
  artefact: 'Silver Pooja Artefacts',
  artefacts: 'Silver Pooja Artefacts',
  utensil: 'Silver Pooja Artefacts',
};

const GEMSTONE_SYNONYMS = ['emerald', 'ruby', 'pearl', 'pearls', 'moti', 'panna', 'manik', 'sapphire', 'polki', 'cz', 'tourmaline', 'navratna'];

/**
 * Parses any free-form jewelry search query semantically into structured tags,
 * categories, material classifications, weight boundaries, and occasions.
 */
export function parseSemanticJewelryQuery(rawQuery: string): SemanticFilterCriteria {
  const normalized = rawQuery.trim().toLowerCase();
  
  const detectedCategories = new Set<JewelryCategory>();
  const detectedMetalTypes = new Set<'Gold' | 'Diamond' | 'Silver' | 'Polki Kundan' | 'Temple Gold'>();
  const detectedSubcategories = new Set<JewelrySubCategory>();
  const detectedPurities = new Set<GoldPurity>();
  const detectedOccasions = new Set<'Bridal' | 'Wedding Guest' | 'Daily Wear' | 'Festive' | 'Gifting' | 'Office Wear'>();
  const gemstoneKeywords = new Set<string>();
  
  let weightTag: 'lightweight' | 'medium' | 'heavy' | null = null;
  let minWeight: number | null = null;
  let maxWeight: number | null = null;
  let minPrice: number | null = null;
  let maxPrice: number | null = null;
  let gender: 'Women' | 'Men' | 'Unisex' | null = null;
  let isBestSellerOnly = false;
  let isNewArrivalOnly = false;
  let isHallmarkOnly = false;

  if (!normalized) {
    return {
      rawQuery,
      normalizedQuery: '',
      detectedCategories: [],
      detectedMetalTypes: [],
      detectedSubcategories: [],
      detectedPurities: [],
      detectedOccasions: [],
      weightTag: null,
      minWeight: null,
      maxWeight: null,
      minPrice: null,
      maxPrice: null,
      gender: null,
      isBestSellerOnly: false,
      isNewArrivalOnly: false,
      isHallmarkOnly: false,
      gemstoneKeywords: [],
      remainingKeywords: [],
      humanReadableSummary: '',
      activeBadges: []
    };
  }

  // --- 1. Weight Tag & Numerical Gram Parsing ---
  // Examples: "under 20g", "< 30g", "below 15 grams", "heavy gold (>50g)", "lightweight gold", "10-20g", "above 35g"
  if (normalized.includes('lightweight') || normalized.includes('light weight') || normalized.includes('sleek') || normalized.includes('delicate')) {
    weightTag = 'lightweight';
    maxWeight = 16.0;
  } else if (normalized.includes('heavyweight') || normalized.includes('heavy') || normalized.includes('solid') || normalized.includes('bridal weight')) {
    weightTag = 'heavy';
    minWeight = 35.0;
  } else if (normalized.includes('medium weight') || normalized.includes('mid weight')) {
    weightTag = 'medium';
    minWeight = 15.0;
    maxWeight = 35.0;
  }

  // Regex for explicit gram numbers
  // "under 25g" / "below 30 grams" / "< 20g" / "less than 15g"
  const underGramsMatch = normalized.match(/(?:under|below|less than|<|up to)\s*(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram|grams)/i);
  if (underGramsMatch) {
    maxWeight = parseFloat(underGramsMatch[1]);
  }

  // "above 40g" / "over 50g" / "> 30 grams" / "more than 20g"
  const aboveGramsMatch = normalized.match(/(?:above|over|more than|>|greater than|min)\s*(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram|grams)/i);
  if (aboveGramsMatch) {
    minWeight = parseFloat(aboveGramsMatch[1]);
  }

  // "10 to 20g" / "10-20g" / "15-30 grams"
  const rangeGramsMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram|grams)/i);
  if (rangeGramsMatch) {
    minWeight = parseFloat(rangeGramsMatch[1]);
    maxWeight = parseFloat(rangeGramsMatch[2]);
  }

  // Exact standalone gram like "20g" or "50 gram"
  const exactGramMatch = normalized.match(/\b(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram|grams)\b/i);
  if (exactGramMatch && !underGramsMatch && !aboveGramsMatch && !rangeGramsMatch) {
    const val = parseFloat(exactGramMatch[1]);
    // Give a +/- 20% window around the exact gram target
    minWeight = Math.max(0, val * 0.8);
    maxWeight = val * 1.25;
  }

  // --- 2. Price Parsing ---
  // "under 50k", "under 1 lakh", "below 1.5l", "under 200000"
  const underLakhMatch = normalized.match(/(?:under|below|less than|<)\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)/i);
  if (underLakhMatch) {
    maxPrice = parseFloat(underLakhMatch[1]) * 100000;
  }

  const underKMatch = normalized.match(/(?:under|below|less than|<)\s*(\d+(?:\.\d+)?)\s*(?:k|thousand)/i);
  if (underKMatch) {
    maxPrice = parseFloat(underKMatch[1]) * 1000;
  }

  const underNumericPrice = normalized.match(/(?:under|below|less than|<)\s*(?:rs\.?|inr|₹)?\s*(\d{4,7})/i);
  if (underNumericPrice && !underLakhMatch && !underKMatch) {
    maxPrice = parseFloat(underNumericPrice[1]);
  }

  // --- 3. Token & Multi-Word Semantic Extraction ---
  const tokens = normalized.split(/[\s,+/]+/).filter(Boolean);
  const remainingTokens: string[] = [];

  // Check multi-word phrase combinations first
  for (let i = 0; i < tokens.length; i++) {
    const single = tokens[i];
    const double = i < tokens.length - 1 ? `${tokens[i]} ${tokens[i + 1]}` : null;
    const triple = i < tokens.length - 2 ? `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}` : null;

    let matched = false;

    // Check Occasion matches
    if (triple && OCCASION_SYNONYMS[triple]) {
      detectedOccasions.add(OCCASION_SYNONYMS[triple]);
      matched = true;
    } else if (double && OCCASION_SYNONYMS[double]) {
      detectedOccasions.add(OCCASION_SYNONYMS[double]);
      matched = true;
    } else if (OCCASION_SYNONYMS[single]) {
      detectedOccasions.add(OCCASION_SYNONYMS[single]);
      matched = true;
    }

    // Check Category & Metal matches
    if (double && CATEGORY_SYNONYMS[double]) {
      detectedCategories.add(CATEGORY_SYNONYMS[double]);
      matched = true;
    } else if (CATEGORY_SYNONYMS[single]) {
      detectedCategories.add(CATEGORY_SYNONYMS[single]);
      matched = true;
    }

    if (double && METAL_SYNONYMS[double]) {
      detectedMetalTypes.add(METAL_SYNONYMS[double]);
      matched = true;
    } else if (METAL_SYNONYMS[single]) {
      detectedMetalTypes.add(METAL_SYNONYMS[single]);
      matched = true;
    }

    // Check Purity matches
    if (double && PURITY_SYNONYMS[double]) {
      detectedPurities.add(PURITY_SYNONYMS[double]);
      matched = true;
    } else if (PURITY_SYNONYMS[single]) {
      detectedPurities.add(PURITY_SYNONYMS[single]);
      matched = true;
    }

    // Check Subcategory matches
    if (double && SUBCATEGORY_SYNONYMS[double]) {
      detectedSubcategories.add(SUBCATEGORY_SYNONYMS[double]);
      matched = true;
    } else if (SUBCATEGORY_SYNONYMS[single]) {
      detectedSubcategories.add(SUBCATEGORY_SYNONYMS[single]);
      matched = true;
    }

    // Gemstones
    if (GEMSTONE_SYNONYMS.includes(single)) {
      gemstoneKeywords.add(single);
      matched = true;
    }

    // Special Flags
    if (single === 'bestseller' || single === 'trending' || single === 'popular') {
      isBestSellerOnly = true;
      matched = true;
    }
    if (single === 'new' || single === 'latest' || single === 'arrival' || single === 'arrivals') {
      isNewArrivalOnly = true;
      matched = true;
    }
    if (single === 'hallmark' || single === 'bis' || single === 'huid' || single === 'certified') {
      isHallmarkOnly = true;
      matched = true;
    }
    if (single === 'men' || single === 'mens' || single === 'gents' || single === 'groom') {
      gender = 'Men';
      matched = true;
    } else if (single === 'women' || single === 'womens' || single === 'ladies' || single === 'bride') {
      gender = 'Women';
      matched = true;
    }

    if (!matched) {
      remainingTokens.push(single);
    }
  }

  // --- 4. Semantic Intent Cross-Inference ---
  // If 'wedding' or 'bridal' is detected, infer Bridal category & Gold/Polki metals if not specified
  if (detectedOccasions.has('Bridal')) {
    detectedCategories.add('bridal');
    if (detectedMetalTypes.size === 0 && !detectedCategories.has('silver')) {
      detectedMetalTypes.add('Gold');
      detectedMetalTypes.add('Polki Kundan');
      detectedMetalTypes.add('Temple Gold');
    }
  }

  // If query is specifically "wedding gold", ensure both Bridal & Gold categories are targeted
  if (normalized.includes('wedding') && normalized.includes('gold')) {
    detectedCategories.add('bridal');
    detectedCategories.add('gold');
    detectedMetalTypes.add('Gold');
    detectedMetalTypes.add('Temple Gold');
    detectedOccasions.add('Bridal');
  }

  // If "daily wear" or "office", infer lightweight if not explicitly heavy
  if ((detectedOccasions.has('Daily Wear') || detectedOccasions.has('Office Wear')) && !weightTag && minWeight === null) {
    weightTag = 'lightweight';
    if (maxWeight === null) maxWeight = 25.0;
  }

  // Construct Visual Semantic Badges for UI display
  const activeBadges: SemanticBadge[] = [];

  if (detectedCategories.size > 0) {
    activeBadges.push({
      id: 'cat',
      type: 'category',
      label: 'Category',
      value: Array.from(detectedCategories).map(c => c.toUpperCase()).join(' / ')
    });
  }

  if (detectedMetalTypes.size > 0) {
    activeBadges.push({
      id: 'metal',
      type: 'material',
      label: 'Material',
      value: Array.from(detectedMetalTypes).join(', ')
    });
  }

  if (detectedPurities.size > 0) {
    activeBadges.push({
      id: 'purity',
      type: 'purity',
      label: 'Purity',
      value: Array.from(detectedPurities).join(', ')
    });
  }

  if (detectedOccasions.size > 0) {
    activeBadges.push({
      id: 'occasion',
      type: 'occasion',
      label: 'Occasion',
      value: Array.from(detectedOccasions).join(' & ')
    });
  }

  if (detectedSubcategories.size > 0) {
    activeBadges.push({
      id: 'sub',
      type: 'subcategory',
      label: 'Jewelry Type',
      value: Array.from(detectedSubcategories).join(', ')
    });
  }

  if (weightTag || minWeight !== null || maxWeight !== null) {
    let weightLabel = '';
    if (minWeight !== null && maxWeight !== null) {
      weightLabel = `${minWeight}g – ${maxWeight}g`;
    } else if (minWeight !== null) {
      weightLabel = `> ${minWeight}g (Heavy)`;
    } else if (maxWeight !== null) {
      weightLabel = `< ${maxWeight}g (${weightTag === 'lightweight' ? 'Light' : 'Max'})`;
    } else if (weightTag === 'heavy') {
      weightLabel = 'Heavy (>35g)';
    } else if (weightTag === 'lightweight') {
      weightLabel = 'Lightweight (<15g)';
    } else if (weightTag === 'medium') {
      weightLabel = 'Medium (15g–35g)';
    }

    if (weightLabel) {
      activeBadges.push({
        id: 'weight',
        type: 'weight',
        label: 'Weight Tag',
        value: weightLabel
      });
    }
  }

  if (maxPrice !== null) {
    activeBadges.push({
      id: 'price',
      type: 'price',
      label: 'Budget',
      value: `Under ₹${(maxPrice / 100000).toFixed(1)}L`
    });
  }

  // Construct Human-Readable Summary
  const summaryParts: string[] = [];
  if (detectedOccasions.size > 0) summaryParts.push(`Occasion: ${Array.from(detectedOccasions).join('/')}`);
  if (detectedMetalTypes.size > 0) summaryParts.push(`Material: ${Array.from(detectedMetalTypes).join('/')}`);
  if (detectedCategories.size > 0) summaryParts.push(`Category: ${Array.from(detectedCategories).join('/')}`);
  if (weightTag || minWeight || maxWeight) {
    summaryParts.push(`Weight: ${weightTag || (minWeight ? `>${minWeight}g` : `<${maxWeight}g`)}`);
  }

  return {
    rawQuery,
    normalizedQuery: normalized,
    detectedCategories: Array.from(detectedCategories),
    detectedMetalTypes: Array.from(detectedMetalTypes),
    detectedSubcategories: Array.from(detectedSubcategories),
    detectedPurities: Array.from(detectedPurities),
    detectedOccasions: Array.from(detectedOccasions),
    weightTag,
    minWeight,
    maxWeight,
    minPrice,
    maxPrice,
    gender,
    isBestSellerOnly,
    isNewArrivalOnly,
    isHallmarkOnly,
    gemstoneKeywords: Array.from(gemstoneKeywords),
    remainingKeywords: remainingTokens,
    humanReadableSummary: summaryParts.join(' • ') || 'Semantic matching across all jewelry collections',
    activeBadges
  };
}

/**
 * Filters and ranks jewelry products using semantic scoring logic.
 */
export function filterAndRankProductsSemantically(
  products: JewelryProduct[],
  query: string,
  rates: LiveRates
): {
  filteredProducts: JewelryProduct[];
  criteria: SemanticFilterCriteria;
  totalMatches: number;
} {
  const criteria = parseSemanticJewelryQuery(query);

  if (!criteria.normalizedQuery) {
    return {
      filteredProducts: products,
      criteria,
      totalMatches: products.length
    };
  }

  const scoredResults: SemanticSearchResult[] = [];

  for (const product of products) {
    let score = 0;
    const matchedAttributes: string[] = [];

    const pName = product.name.toLowerCase();
    const pDesc = product.description.toLowerCase();
    const pSub = product.subcategory.toLowerCase();
    const pStory = product.storyDetails.toLowerCase();
    const pGem = (product.gemstoneDetails || '').toLowerCase();
    const pCert = product.certification.toLowerCase();
    const pPurity = product.purity.toLowerCase();
    const pMetal = product.metalType.toLowerCase();

    // 1. Direct Text Substring Match
    if (pName.includes(criteria.normalizedQuery)) {
      score += 80;
      matchedAttributes.push('Exact Name Match');
    } else if (pDesc.includes(criteria.normalizedQuery) || pStory.includes(criteria.normalizedQuery)) {
      score += 40;
      matchedAttributes.push('Story & Details');
    }

    // 2. Category Semantic Match
    if (criteria.detectedCategories.length > 0) {
      if (criteria.detectedCategories.includes(product.category)) {
        score += 35;
        matchedAttributes.push(`Category: ${product.category}`);
      }
    }

    // 3. Metal Type & Material Match
    if (criteria.detectedMetalTypes.length > 0) {
      if (criteria.detectedMetalTypes.includes(product.metalType)) {
        score += 35;
        matchedAttributes.push(`Metal: ${product.metalType}`);
      } else if (criteria.detectedMetalTypes.includes('Gold') && (product.metalType === 'Temple Gold' || product.metalType === 'Polki Kundan')) {
        score += 25;
        matchedAttributes.push(`Gold Alloy: ${product.metalType}`);
      }
    }

    // 4. Subcategory Match
    if (criteria.detectedSubcategories.length > 0) {
      if (criteria.detectedSubcategories.includes(product.subcategory)) {
        score += 45;
        matchedAttributes.push(`Type: ${product.subcategory}`);
      }
    }

    // 5. Purity Match
    if (criteria.detectedPurities.length > 0) {
      if (criteria.detectedPurities.includes(product.purity)) {
        score += 30;
        matchedAttributes.push(`Purity: ${product.purity}`);
      }
    }

    // 6. Occasion Match (e.g. Bridal / Wedding / Daily / Festive)
    if (criteria.detectedOccasions.length > 0) {
      const hasOccasion = criteria.detectedOccasions.some(occ => product.occasion.includes(occ));
      if (hasOccasion) {
        score += 40;
        matchedAttributes.push(`Occasion: ${product.occasion.join('/')}`);
      }
    }

    // 7. Weight Criteria Match
    if (criteria.minWeight !== null || criteria.maxWeight !== null || criteria.weightTag !== null) {
      let weightMatches = true;

      if (criteria.minWeight !== null && product.grossWeight < criteria.minWeight) {
        weightMatches = false;
      }
      if (criteria.maxWeight !== null && product.grossWeight > criteria.maxWeight) {
        weightMatches = false;
      }

      if (criteria.weightTag === 'lightweight' && product.grossWeight > 22.0) {
        weightMatches = false;
      } else if (criteria.weightTag === 'heavy' && product.grossWeight < 30.0) {
        weightMatches = false;
      }

      if (weightMatches) {
        score += 35;
        matchedAttributes.push(`Weight: ${product.grossWeight}g`);
      } else {
        // Severe penalty if weight criteria explicitly specified but product does not match
        score -= 50;
      }
    }

    // 8. Price Budget Filtering
    if (criteria.maxPrice !== null) {
      const price = calculateProductPrice(product, rates).totalPrice;
      if (price <= criteria.maxPrice) {
        score += 25;
        matchedAttributes.push('Within Budget');
      } else {
        score -= 40;
      }
    }

    // 9. Gemstones match
    for (const gem of criteria.gemstoneKeywords) {
      if (pGem.includes(gem) || pName.includes(gem)) {
        score += 20;
        matchedAttributes.push(`Gemstone: ${gem}`);
      }
    }

    // 10. Remaining Individual Tokens (Fuzzy check)
    for (const token of criteria.remainingKeywords) {
      if (token.length < 2) continue;
      if (pName.includes(token)) score += 15;
      else if (pSub.includes(token)) score += 12;
      else if (pDesc.includes(token)) score += 8;
      else if (pCert.includes(token)) score += 6;
      else if (pMetal.includes(token)) score += 6;
    }

    // 11. Flags
    if (criteria.isBestSellerOnly && product.isBestSeller) score += 20;
    if (criteria.isNewArrivalOnly && product.isNewArrival) score += 20;

    // Minimum score threshold for inclusion
    if (score > 15) {
      scoredResults.push({
        product,
        score,
        matchedAttributes
      });
    }
  }

  // Sort by semantic score descending
  scoredResults.sort((a, b) => b.score - a.score);

  const filteredProducts = scoredResults.map(r => r.product);

  return {
    filteredProducts,
    criteria,
    totalMatches: filteredProducts.length
  };
}

/**
 * Curated list of popular semantic jewelry search presets
 */
export const POPULAR_SEMANTIC_PRESETS = [
  { label: 'Wedding Gold', query: 'wedding gold', icon: 'Crown', desc: 'Bridal chokers, temple haar & 22K heirlooms' },
  { label: 'Bridal Polki & Kundan', query: 'bridal kundan polki', icon: 'Sparkles', desc: 'Imperial uncut polki & emerald choker sets' },
  { label: '22K Gold Bangles', query: '22k gold bangles', icon: 'CircleDot', desc: 'Hallmarked daily wear & bridal kada pairs' },
  { label: 'Heavy Temple Haar (>40g)', query: 'heavy temple gold haar', icon: 'Scale', desc: 'Solid hand-carved Nakshi antique gold' },
  { label: 'Lightweight Daily Wear (<15g)', query: 'lightweight daily wear gold', icon: 'Feather', desc: 'Sleek pendants, delicate chains & studs' },
  { label: 'Solitaire Diamond Rings', query: 'solitaire diamond ring', icon: 'Gem', desc: '18K IGI certified brilliance' },
  { label: '925 Silver Pooja Sets', query: '925 silver pooja', icon: 'Flame', desc: 'Sacred thalis, diyas & pure silver coins' },
  { label: 'Under 1 Lakh Gold', query: 'gold under 1 lakh', icon: 'Tag', desc: 'Curated precious pieces within ₹1,00,000' }
];
