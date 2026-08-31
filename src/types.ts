export type JewelryCategory = 'bridal' | 'gold' | 'diamond' | 'silver';

export type JewelrySubCategory = 
  | 'Necklaces & Sets' 
  | 'Chokers & Hasli' 
  | 'Bangles & Kadas' 
  | 'Rings & Bands' 
  | 'Earrings & Jhumkas' 
  | 'Mangalsutra' 
  | 'Pendants & Chains' 
  | 'Coins & Bars' 
  | 'Payal & Anklets' 
  | 'Silver Pooja Artefacts';

export type GoldPurity = '24K' | '22K' | '18K' | '14K' | '925 Silver';

export type StockStatus = 'In Stock' | 'Made to Order' | 'Showroom Exclusive' | 'Limited Edition';

export interface JewelryProduct {
  id: string;
  name: string;
  sku: string;
  category: JewelryCategory;
  subcategory: JewelrySubCategory;
  purity: GoldPurity;
  metalType: 'Gold' | 'Diamond' | 'Silver' | 'Polki Kundan' | 'Temple Gold';
  grossWeight: number; // in grams
  netGoldWeight: number; // net gold in grams
  diamondCarat?: number;
  diamondClarity?: string; // e.g. "VVS-VS / EF"
  gemstoneDetails?: string; // e.g. "Natural Emeralds & South Sea Pearls"
  gemstoneCharge?: number; // extra cost in INR
  makingChargePercent: number; // e.g. 14 (%)
  stockStatus: StockStatus;
  stockCount: number;
  images: string[];
  description: string;
  storyDetails: string;
  certification: string; // "BIS Hallmark 916", "IGI Certified Diamond", "925 Sterling Guarantee"
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  occasion: ('Bridal' | 'Wedding Guest' | 'Daily Wear' | 'Festive' | 'Gifting' | 'Office Wear')[];
  gender: 'Women' | 'Men' | 'Unisex';
  sizesAvailable?: string[];
  huid?: string; // Hallmark Unique ID
  // Soft Delete fields for Audit compliance
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export type InventoryActionType = 
  | 'CHECK_IN' 
  | 'CHECK_OUT' 
  | 'STOCK_ADJUSTMENT' 
  | 'DAMAGE_RETURN' 
  | 'MELTING_RECYCLE';

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  actionType: InventoryActionType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  grossWeightChange?: number;
  pureGoldWeightChange?: number;
  goldRateApplied?: number;
  reason: string;
  batchNumber?: string;
  supplierOrCustomer?: string;
  performedBy: string;
  timestamp: string;
  huidList?: string[];
}

export type AuditActionCategory = 
  | 'AUTH_LOGIN' 
  | 'AUTH_FAILED' 
  | 'AUTH_LOGOUT' 
  | 'PASSWORD_CHANGE'
  | 'RATES_UPDATE' 
  | 'PRODUCT_CREATE' 
  | 'PRODUCT_UPDATE' 
  | 'PRODUCT_SOFT_DELETE' 
  | 'PRODUCT_RESTORE' 
  | 'INVENTORY_CHECKIN' 
  | 'INVENTORY_CHECKOUT' 
  | 'SETTINGS_UPDATE' 
  | 'UPI_QR_ROTATE' 
  | 'COUPON_MUTATION';

export interface AuditLog {
  id: string;
  timestamp: string;
  actionCategory: AuditActionCategory;
  adminUser: string;
  ipAddress?: string;
  userAgent?: string;
  details: string;
  metadata?: Record<string, any>;
  riskSeverity?: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface SecuritySentinelReport {
  id: string;
  analyzedAt: string;
  batchSize: number;
  overallThreatLevel: 'LOW' | 'MEDIUM' | 'ELEVATED' | 'CRITICAL';
  threatScore: number; // 0 to 100
  summary: string;
  anomaliesDetected: {
    ruleId: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    suggestedAction: string;
    targetEventIds: string[];
  }[];
  recommendations: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'SHOWROOM_MANAGER' | 'CHIEF_KARIGAR';
  twoFactorEnabled: boolean;
  twoFactorMethod: 'EMAIL_OTP' | 'AUTHENTICATOR_APP';
  lastLoginAt?: string;
}

export interface AdminAuthSession {
  token: string;
  user: AdminUser;
  expiresAt: number;
}

export interface UpiWebhookTransaction {
  id: string;
  gatewayTxnId: string;
  orderBookingNumber: string;
  customerVpa: string;
  merchantVpa: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'TAMPERED';
  bankReferenceNumber: string;
  hmacSignatureValid: boolean;
  receivedAt: string;
  rawPayload?: Record<string, any>;
}

export interface CurrencyConversionResult {
  baseAmountINR: number;
  targetCurrency: 'USD' | 'AED' | 'GBP' | 'EUR' | 'CAD' | 'SGD';
  convertedAmount: number;
  exchangeRate: number;
  ratePerGramLocal: number;
  goldCarat: string;
  lastUpdated: string;
  marketNote: string;
}

export interface LiveRates {
  gold24k: number; // per 10g
  gold22k: number; // per 10g
  gold18k: number; // per 10g
  gold14k: number; // per 10g
  silver999: number; // per 1000g (1 kg)
  defaultMakingChargePercent: number;
  gstRate: number; // default 3%
  lastUpdated: string;
  trend: 'up' | 'down' | 'neutral';
  change24h: number; // e.g. +350
  goldRateCommentary?: string;
}

export interface PriceBreakdown {
  goldValue: number;
  diamondValue: number;
  gemstoneValue: number;
  makingCharges: number;
  discountOnMaking: number;
  subtotal: number;
  gst: number;
  totalPrice: number;
  ratePerGramApplied: number;
}

export interface CartItem {
  id: string; // unique item instance id
  product: JewelryProduct;
  quantity: number;
  selectedSize?: string;
  giftWrap: boolean;
  giftMessage?: string;
  breakdown: PriceBreakdown;
}

export interface OrderInquiry {
  id: string;
  bookingNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  pincode: string;
  deliveryMethod: 'Insured Home Delivery' | 'Showroom VIP Collection (Haldwani)';
  paymentPreference: 'Advance Booking Token (UPI/Card)' | 'Pay at Showroom on Pickup' | 'Full Online Settlement';
  items: CartItem[];
  subtotal: number;
  makingCharges: number;
  discount: number;
  gst: number;
  grandTotal: number;
  couponApplied?: string;
  status: 'Pending' | 'Confirmed' | 'VIP Appointment Scheduled' | 'Under Crafting' | 'Ready for Pickup' | 'Delivered';
  createdAt: string;
  customerNotes?: string;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  storeAddress: string;
  storePhone: string;
  whatsappNumber: string;
  storeEmail: string;
  showroomTimings: string;
  tickerAnnouncement: string;
  instagramHandle: string;
  googleMapEmbedUrl: string;
  // Dynamic Payment Gateway Settings
  upiId: string;
  payeeName: string;
  upiMerchantCode?: string;
  customQrUrl?: string;
  useCustomQr: boolean;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
}

export interface Coupon {
  id: string;
  code: string; // e.g. 'DIWALI20', 'ROYAL5000'
  description: string;
  discountType: 'percentage' | 'fixed'; // percentage off or fixed INR off
  discountValue: number; // e.g. 20 (%) or 5000 (INR)
  minOrderValue: number; // e.g. 50000
  maxDiscountAmount?: number; // e.g. 25000 cap for percentage discounts
  applicableOn: 'making_charges' | 'total_order';
  expiryDate: string; // YYYY-MM-DD
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdminSecurityConfig {
  masterPin: string;
  lastUpdated: string;
  failedAttemptsLimit: number; // default 3
  lockoutDurationMinutes: number; // default 120 (2 hours)
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  productSuggestions?: JewelryProduct[];
}

export type OccasionThemeId = 
  | 'default' 
  | 'diwali' 
  | 'holi' 
  | 'akshaya-tritiya' 
  | 'wedding-season' 
  | 'midnight-sapphire';

export interface OccasionTheme {
  id: OccasionThemeId;
  name: string;
  subtitle: string;
  badge: string;
  iconName: string; // 'crown' | 'flame' | 'sparkles' | 'coins' | 'heart' | 'gem'
  primaryColor: string; // e.g. '#081816'
  primaryDark: string; // e.g. '#040d0c'
  accentGold: string; // e.g. '#DFB76C'
  accentGoldDark: string; // e.g. '#C59B27'
  bgWarm: string; // e.g. '#FAF7F2'
  bgSurface: string; // e.g. '#F3EEE6'
  heroTagline: string;
  heroHeadline: string;
  announcementText: string;
  festiveDiscountNote: string;
  accentBorder: string;
  particleType: 'none' | 'diya' | 'gulal' | 'coins' | 'petals' | 'diamonds';
}

export interface LiveConfig {
  rates: LiveRates;
  activeThemeId: OccasionThemeId;
  particlesEnabled: boolean;
  customAnnouncement: string;
  lastUpdated: string;
  updatedBy?: string;
}

export type RealtimeEventType = 
  | 'INITIAL_SYNC'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'PRODUCT_RESTORED'
  | 'RATES_UPDATED'
  | 'THEME_UPDATED'
  | 'LIVE_CONFIG_UPDATED'
  | 'SETTINGS_UPDATED'
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'COUPON_CREATED'
  | 'COUPON_DELETED'
  | 'HEARTBEAT';

export interface RealtimeMessage<T = any> {
  type: RealtimeEventType;
  data: T;
  timestamp: string;
  eventSequence?: number;
}
