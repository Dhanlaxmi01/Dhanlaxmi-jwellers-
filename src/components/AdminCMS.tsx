import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings2, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  RefreshCw, 
  ShoppingBag, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles, 
  DollarSign, 
  Layers, 
  Users, 
  Store, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  Sliders,
  Image as ImageIcon,
  Palette,
  Copy,
  Download,
  Upload,
  Lock,
  Unlock,
  CheckCircle2,
  FileCode,
  FileText,
  Flame,
  Crown,
  Heart,
  Gem,
  Coins,
  Search,
  Filter,
  Tag,
  Percent,
  QrCode,
  KeyRound,
  ShieldAlert,
  Calendar,
  AlertTriangle,
  RotateCcw,
  IndianRupee,
  Printer,
  FileCheck,
  Boxes,
  Cpu,
  Globe2,
  Zap,
  Radio
} from 'lucide-react';
import { 
  JewelryCategory, 
  JewelryProduct, 
  JewelrySubCategory, 
  GoldPurity, 
  LiveRates, 
  OrderInquiry, 
  SiteSettings, 
  StockStatus,
  OccasionThemeId,
  Coupon,
  AuditLog,
  InventoryLog,
  SecuritySentinelReport,
  AdminUser,
  AdminAuthSession
} from '../types';
import { calculateProductPrice, formatINR } from '../utils/pricing';
import { PINAuthGateway } from './PINAuthGateway';
import { JSONPayloadModal } from './JSONPayloadModal';
import { OrderReceiptModal } from './OrderReceiptModal';
import { useTheme } from '../context/ThemeContext';
import { DynamicQRCode } from './DynamicQRCode';
import { INITIAL_COUPONS } from '../data/initialData';
import { InventoryVault } from './InventoryVault';
import { UpiPaymentManager } from './UpiPaymentManager';
import { SecuritySentinelDashboard } from './SecuritySentinelDashboard';
import { CurrencyConverterWidget } from './CurrencyConverterWidget';
import { JPGImageUploader } from './JPGImageUploader';

interface AdminCMSProps {
  isOpen: boolean;
  onClose: () => void;
  rates: LiveRates;
  onUpdateRates: (newRates: LiveRates) => void;
  products: JewelryProduct[];
  onAddProduct: (product: JewelryProduct) => void;
  onUpdateProduct: (product: JewelryProduct) => void;
  onDeleteProduct: (id: string) => void;
  orders: OrderInquiry[];
  onUpdateOrderStatus: (id: string, status: any) => void;
  settings: SiteSettings;
  onUpdateSettings: (newSettings: SiteSettings) => void;
  onResetFactoryData: () => void;
  realtimeStatus?: string;
  lastSyncTime?: string;
  activeEventsCount?: number;
}

// Preset Luxury Image Catalog for Fast Selection
const LUXURY_IMAGE_PRESETS = [
  { name: 'Kundan Choker', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Temple Rani Haar', url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Bridal Kada Pair', url: 'https://images.unsplash.com/photo-1611591475155-42e9fba5ce55?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Cascading Jhumkas', url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Gold Filigree Choker', url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Solitaire Ring 18K', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Diamond Emerald Pendant', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85' },
  { name: '925 Silver Payal', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Silver Pooja Thali', url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Traditional Mangalsutra', url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1200&q=85' },
];

export const AdminCMS: React.FC<AdminCMSProps> = ({
  isOpen,
  onClose,
  rates,
  onUpdateRates,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  orders,
  onUpdateOrderStatus,
  settings,
  onUpdateSettings,
  onResetFactoryData,
  realtimeStatus = 'CONNECTED',
  lastSyncTime,
  activeEventsCount = 0
}) => {
  // --- SECURITY PIN & 2FA AUTH STATE (ALWAYS REQUIRES VERIFICATION ON OPEN) ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionUser, setSessionUser] = useState<AdminUser | null>(null);

  // Reset authentication when modal closes so verification is mandatory every time
  useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setSessionUser(null);
    }
  }, [isOpen]);

  // --- CMS TABS ---
  const [activeTab, setActiveTab] = useState<
    'products' | 'inventory_vault' | 'coupons' | 'themes' | 'rates' | 'payment' | 'security_sentinel' | 'ai_currency' | 'orders' | 'settings'
  >('products');

  // --- VAULT & AUDIT STATE ---
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sentinelReports, setSentinelReports] = useState<SecuritySentinelReport[]>([]);
  const [pendingBatchCount, setPendingBatchCount] = useState(0);

  // Fetch Security and Inventory Data
  const fetchSecurityAndVaultData = async () => {
    try {
      const [invRes, auditRes, sentRes] = await Promise.all([
        fetch('/api/admin/inventory/logs'),
        fetch('/api/admin/security/audit-logs'),
        fetch('/api/admin/security/sentinel-report')
      ]);
      if (invRes.ok) {
        const invData = await invRes.json();
        if (invData.logs) setInventoryLogs(invData.logs);
      }
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        if (auditData.logs) setAuditLogs(auditData.logs);
        if (typeof auditData.pendingBatchCount === 'number') setPendingBatchCount(auditData.pendingBatchCount);
      }
      if (sentRes.ok) {
        const sentData = await sentRes.json();
        if (sentData.reports) setSentinelReports(sentData.reports);
      }
    } catch (e) {
      console.warn('Vault fetch error:', e);
    }
  };

  // --- STRICT INACTIVITY SESSION EXPIRATION (15 MINUTES) ---
  useEffect(() => {
    if (!isAuthenticated) return;
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      // 15 minutes (900,000 ms) strict logout
      inactivityTimer = setTimeout(() => {
        handleAdminLogout();
        triggerToast('Security Sentinel: Session terminated due to 15 minutes of inactivity.');
      }, 900000);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer(); // Initialize on mount

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(inactivityTimer);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSecurityAndVaultData();
      const timer = setInterval(fetchSecurityAndVaultData, 20000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);
  
  // --- THEME CONTEXT INTEGRATION ---
  const { 
    activeTheme, 
    activeThemeId, 
    setTheme, 
    particlesEnabled, 
    setParticlesEnabled, 
    customAnnouncement, 
    setCustomAnnouncement, 
    availableThemes 
  } = useTheme();

  const [themeActivatedAlert, setThemeActivatedAlert] = useState<string | null>(null);

  // --- RATE FORM STATE ---
  const [ratesForm, setRatesForm] = useState<LiveRates>({ ...rates });
  const [ratesSavedAlert, setRatesSavedAlert] = useState(false);

  // --- PRODUCT MANAGEMENT STATE ---
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<JewelryProduct>>({
    name: '',
    sku: '',
    category: 'gold',
    subcategory: 'Necklaces & Sets',
    purity: '22K',
    metalType: 'Gold',
    grossWeight: 25.0,
    netGoldWeight: 25.0,
    diamondCarat: 0,
    diamondClarity: '',
    gemstoneDetails: '',
    gemstoneCharge: 0,
    makingChargePercent: 14,
    stockStatus: 'In Stock',
    stockCount: 5,
    images: [LUXURY_IMAGE_PRESETS[0].url],
    description: 'Handcrafted luxury jewelry piece created with traditional artisanal excellence.',
    storyDetails: 'Certified pure gold crafted for lifelong prestige and festive grandeur at Haldwani atelier.',
    certification: 'BIS Hallmark 916 with HUID Laser Engraving',
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    occasion: ['Festive', 'Bridal'],
    gender: 'Women',
    sizesAvailable: ['Standard']
  });

  // Custom Image URL Input
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Search & Filter in products
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [purityFilter, setPurityFilter] = useState<string>('all');

  // --- JSON PAYLOAD INSPECTOR MODAL STATE ---
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [jsonModalTitle, setJsonModalTitle] = useState('');
  const [jsonModalSubtitle, setJsonModalSubtitle] = useState('');
  const [jsonModalPayload, setJsonModalPayload] = useState<any>(null);
  const [jsonModalFilename, setJsonModalFilename] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({ ...settings });
  const [settingsSavedAlert, setSettingsSavedAlert] = useState(false);

  // --- ADMIN SECURITY & CHANGE PASSWORD MODAL STATE ---
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  // Secure email masking helper
  const maskAdminEmail = (emailStr?: string) => {
    const target = emailStr || sessionUser?.email || 'Dhanlaxmi@gmail.com';
    if (!target.includes('@')) return 'D****i@gmail.com';
    const [user, domain] = target.split('@');
    if (user.length <= 2) return `${user[0]}***@${domain}`;
    const first = user[0];
    const last = user[user.length - 1];
    return `${first}${'*'.repeat(Math.max(4, user.length - 2))}${last}@${domain}`;
  };

  // Change master password handler
  const handleChangeMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (newPassword.length < 8) {
      setPasswordChangeError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New password and confirmation do not match.');
      return;
    }

    const token = localStorage.getItem('dhanlaxmi_admin_token');
    if (!token) {
      setPasswordChangeError('Session token missing or expired. Please re-authenticate.');
      return;
    }

    setPasswordChangeLoading(true);

    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update master password');
      }

      setPasswordChangeSuccess(data.message || 'Master password updated securely.');
      triggerToast('Master password updated and encrypted successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setPasswordChangeSuccess('');
      }, 1800);
    } catch (err: any) {
      setPasswordChangeError(err.message || 'Verification failed. Please check current password.');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  // --- COUPON MAKER / DISCOUNT ENGINE STATE ---
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 25000,
    maxDiscountAmount: 15000,
    applicableOn: 'making_charges',
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    usageLimit: 100,
    isActive: true
  });

  // --- DYNAMIC PAYMENT GATEWAY STATE ---
  const [paymentForm, setPaymentForm] = useState({
    upiId: settings.upiId || '7668037278@okbizaxis',
    payeeName: settings.payeeName || 'DHANLAXMI JWELLERS',
    upiMerchantCode: settings.upiMerchantCode || '5944',
    customQrUrl: settings.customQrUrl || '',
    useCustomQr: !!settings.useCustomQr,
    testScanAmount: 5000
  });

  // --- SECURITY CREDENTIAL MANAGER STATE ---
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeMessage, setPinChangeMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [lockoutStatus, setLockoutStatus] = useState<{
    failedAttempts: number;
    isLocked: boolean;
    remainingMinutes: number;
  }>({ failedAttempts: 0, isLocked: false, remainingMinutes: 0 });

  // --- ORDER RECEIPT & PDF STATE ---
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderInquiry | null>(null);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  const handleOpenReceipt = (ord: OrderInquiry) => {
    setSelectedReceiptOrder(ord);
    setReceiptModalOpen(true);
  };

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Coupons from API on mount
  useEffect(() => {
    fetch('/api/coupons')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) setCoupons(data);
      })
      .catch((err) => console.log('Using local coupon state', err));
  }, []);

  // Update Lockout status monitor
  const refreshLockoutStatus = () => {
    const failedStr = localStorage.getItem('dlx_admin_pin_failed_attempts') || '0';
    const lockoutUntilStr = localStorage.getItem('dlx_admin_lockout_until');
    const failed = parseInt(failedStr, 10) || 0;
    
    let isLocked = false;
    let remainingMinutes = 0;

    if (lockoutUntilStr) {
      const until = parseInt(lockoutUntilStr, 10);
      const now = Date.now();
      if (now < until) {
        isLocked = true;
        remainingMinutes = Math.ceil((until - now) / 60000);
      }
    }

    setLockoutStatus({
      failedAttempts: failed,
      isLocked,
      remainingMinutes
    });
  };

  useEffect(() => {
    refreshLockoutStatus();
  }, [isAuthenticated, activeTab]);

  if (!isOpen) return null;

  // If not authenticated, present the Secure Verification Gateway first
  if (!isAuthenticated) {
    return (
      <PINAuthGateway
        onAuthenticated={(session) => {
          setIsAuthenticated(true);
          if (session?.user) {
            setSessionUser(session.user);
          }
          triggerToast('Identity Handshake Verified. Welcome to Dhanlaxmi Executive CMS.');
        }}
        onCancel={onClose}
      />
    );
  }

  // --- INVENTORY VAULT HANDLERS ---
  const handleInventoryCheckIn = async (payload: any) => {
    const token = localStorage.getItem('dhanlaxmi_admin_token') || '';
    const res = await fetch('/api/admin/inventory/check-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Check-in failed');
    }
    if (data.product) {
      onUpdateProduct(data.product);
    }
    fetchSecurityAndVaultData();
  };

  const handleInventoryCheckOut = async (payload: any) => {
    const token = localStorage.getItem('dhanlaxmi_admin_token') || '';
    const res = await fetch('/api/admin/inventory/check-out', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Check-out failed');
    }
    if (data.product) {
      onUpdateProduct(data.product);
    }
    fetchSecurityAndVaultData();
  };

  const handleSoftDeleteProduct = async (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    if (!confirm(`Move "${prod.name}" to the soft-deleted trash archive? Historical audit trails and gold weight valuations will be preserved.`)) return;

    const token = localStorage.getItem('dhanlaxmi_admin_token') || '';
    try {
      const res = await fetch(`/api/admin/products/${productId}/soft-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Product archived from active catalog' })
      });
      const data = await res.json();
      if (data.product) {
        onUpdateProduct(data.product);
      } else {
        onUpdateProduct({ ...prod, isDeleted: true, deletedAt: new Date().toISOString(), deletedBy: sessionUser?.name || 'Owner' });
      }
      triggerToast(`Product "${prod.name}" soft-deleted to trash archive.`);
      fetchSecurityAndVaultData();
    } catch (err) {
      onUpdateProduct({ ...prod, isDeleted: true, deletedAt: new Date().toISOString(), deletedBy: sessionUser?.name || 'Owner' });
      triggerToast(`Product archived in local state.`);
    }
  };

  const handleRestoreProduct = async (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const token = localStorage.getItem('dhanlaxmi_admin_token') || '';
    try {
      const res = await fetch(`/api/admin/products/${productId}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.product) {
        onUpdateProduct(data.product);
      } else {
        onUpdateProduct({ ...prod, isDeleted: false, deletedAt: undefined, deletedBy: undefined });
      }
      triggerToast(`Product "${prod.name}" restored to active showroom catalog.`);
      fetchSecurityAndVaultData();
    } catch (err) {
      onUpdateProduct({ ...prod, isDeleted: false, deletedAt: undefined, deletedBy: undefined });
      triggerToast(`Product restored in local state.`);
    }
  };

  const handleTriggerSentinelAuditNow = async () => {
    const res = await fetch('/api/admin/security/trigger-sentinel-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Audit failed');
    }
    if (data.report) {
      setSentinelReports((prev) => [data.report, ...prev]);
    }
    fetchSecurityAndVaultData();
  };

  // Logout Handler
  const handleAdminLogout = () => {
    localStorage.removeItem('dhanlaxmi_admin_token');
    localStorage.removeItem('dhanlaxmi_admin_user');
    setIsAuthenticated(false);
    setSessionUser(null);
    triggerToast('Executive session terminated safely.');
  };

  // --- RATE HANDLERS ---
  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...ratesForm,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST Updated'
    };
    onUpdateRates(updated);
    setRatesSavedAlert(true);
    triggerToast('Rates broadcasted across all product price algorithms in real-time!');
    setTimeout(() => setRatesSavedAlert(false), 3000);
  };

  const handleQuickRateShift = (amount: number) => {
    setRatesForm((prev) => ({
      ...prev,
      gold22k: prev.gold22k + amount,
      gold24k: prev.gold24k + Math.round(amount * (24 / 22)),
      change24h: prev.change24h + amount,
      trend: amount >= 0 ? 'up' : 'down'
    }));
  };

  // --- PRODUCT HANDLERS ---
  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      sku: 'DJ-' + Math.floor(1000 + Math.random() * 9000),
      category: 'gold',
      subcategory: 'Necklaces & Sets',
      purity: '22K',
      metalType: 'Gold',
      grossWeight: 22.5,
      netGoldWeight: 22.5,
      diamondCarat: 0,
      diamondClarity: '',
      gemstoneDetails: '',
      gemstoneCharge: 0,
      makingChargePercent: 14,
      stockStatus: 'In Stock',
      stockCount: 4,
      images: [LUXURY_IMAGE_PRESETS[4].url],
      description: 'Exquisite 22K hallmarked jewelry piece crafted with precision and heritage prestige.',
      storyDetails: 'Handcrafted by master karigars at Dhanlaxmi Haldwani Nanda Vihar atelier.',
      certification: 'BIS Hallmark 916 with HUID Laser Mark',
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      occasion: ['Festive', 'Bridal'],
      gender: 'Women',
      sizesAvailable: ['Standard']
    });
    setCustomImageUrl('');
    setIsEditingProduct(true);
  };

  const handleOpenEditProduct = (prod: JewelryProduct) => {
    setEditingProductId(prod.id);
    setProductForm({ ...prod });
    setCustomImageUrl('');
    setIsEditingProduct(true);
  };

  const handleDuplicateProduct = (prod: JewelryProduct) => {
    const duplicated: JewelryProduct = {
      ...prod,
      id: 'prod-' + Date.now(),
      name: `${prod.name} (Copy)`,
      sku: 'DJ-' + Math.floor(1000 + Math.random() * 9000),
    };
    onAddProduct(duplicated);
    triggerToast(`Duplicated "${prod.name}" as a new product in the active catalog.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const resultUrl = uploadEvent.target?.result as string;
        if (resultUrl) {
          setProductForm((prev) => ({
            ...prev,
            images: [resultUrl, ...(prev.images || [])]
          }));
          triggerToast('Uploaded image successfully attached to product payload.');
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleAddCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setProductForm((prev) => ({
      ...prev,
      images: [customImageUrl.trim(), ...(prev.images || [])]
    }));
    setCustomImageUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Publish to App & Structure JSON Payload
  const handlePublishProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.grossWeight) {
      alert('Please provide Product Title and Gross Weight');
      return;
    }

    const currentImages = (productForm.images && productForm.images.length > 0)
      ? productForm.images
      : [LUXURY_IMAGE_PRESETS[0].url];

    const finalizedProduct: JewelryProduct = {
      id: editingProductId || ('prod-' + Date.now()),
      name: productForm.name || 'Untitled Jewelry Piece',
      sku: productForm.sku || ('DJ-' + Math.floor(1000 + Math.random() * 9000)),
      category: (productForm.category as JewelryCategory) || 'gold',
      subcategory: (productForm.subcategory as JewelrySubCategory) || 'Necklaces & Sets',
      purity: (productForm.purity as GoldPurity) || '22K',
      metalType: productForm.metalType || 'Gold',
      grossWeight: Number(productForm.grossWeight) || 10,
      netGoldWeight: Number(productForm.netGoldWeight) || Number(productForm.grossWeight) || 10,
      diamondCarat: productForm.diamondCarat ? Number(productForm.diamondCarat) : undefined,
      diamondClarity: productForm.diamondClarity || undefined,
      gemstoneDetails: productForm.gemstoneDetails || undefined,
      gemstoneCharge: productForm.gemstoneCharge ? Number(productForm.gemstoneCharge) : undefined,
      makingChargePercent: Number(productForm.makingChargePercent) || 14,
      stockStatus: (productForm.stockStatus as StockStatus) || 'In Stock',
      stockCount: Number(productForm.stockCount) || 1,
      images: currentImages,
      description: productForm.description || 'Exquisite hallmarked jewelry piece.',
      storyDetails: productForm.storyDetails || 'Handcrafted by master artisans at Dhanlaxmi Haldwani.',
      certification: productForm.certification || 'BIS Hallmark 916',
      isFeatured: !!productForm.isFeatured,
      isBestSeller: !!productForm.isBestSeller,
      isNewArrival: !!productForm.isNewArrival,
      occasion: productForm.occasion || ['Festive'],
      gender: productForm.gender || 'Women',
      sizesAvailable: productForm.sizesAvailable || ['Standard'],
      huid: productForm.huid || ('DLX916' + Math.floor(1000 + Math.random() * 9000))
    };

    if (editingProductId) {
      onUpdateProduct(finalizedProduct);
      triggerToast(`Product "${finalizedProduct.name}" updated successfully.`);
    } else {
      onAddProduct(finalizedProduct);
      triggerToast(`New product "${finalizedProduct.name}" published to live boutique!`);
    }

    setIsEditingProduct(false);

    // Open Structured JSON Payload Inspector Modal
    setJsonModalTitle('Live Product JSON Payload Published');
    setJsonModalSubtitle(`Verified structured payload published for SKU: ${finalizedProduct.sku}`);
    setJsonModalPayload(finalizedProduct);
    setJsonModalFilename(`product-${finalizedProduct.sku.toLowerCase()}.json`);
    setJsonModalOpen(true);
  };

  // --- COUPON ENGINE HANDLERS ---
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discountValue) {
      alert('Please enter Coupon Code and Discount Value');
      return;
    }

    const newCoupon: Coupon = {
      id: 'cp-' + Date.now(),
      code: (couponForm.code || '').trim().toUpperCase(),
      description: couponForm.description || `Special ${couponForm.discountValue}% Privilege Savings`,
      discountType: couponForm.discountType || 'percentage',
      discountValue: Number(couponForm.discountValue),
      minOrderValue: Number(couponForm.minOrderValue) || 0,
      maxDiscountAmount: couponForm.maxDiscountAmount ? Number(couponForm.maxDiscountAmount) : undefined,
      applicableOn: couponForm.applicableOn || 'making_charges',
      expiryDate: couponForm.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      usageLimit: Number(couponForm.usageLimit) || 100,
      usageCount: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon)
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons((prev) => [data.coupon, ...prev.filter(c => c.id !== data.coupon.id)]);
      } else {
        setCoupons((prev) => [newCoupon, ...prev]);
      }
    } catch (err) {
      setCoupons((prev) => [newCoupon, ...prev]);
    }

    setIsCreatingCoupon(false);
    triggerToast(`Privilege coupon "${newCoupon.code}" activated in Discount Engine!`);

    // Show JSON inspector for coupon payload
    setJsonModalTitle('Coupon Rule JSON Payload Published');
    setJsonModalSubtitle(`Privilege rule activated for code: ${newCoupon.code}`);
    setJsonModalPayload(newCoupon);
    setJsonModalFilename(`coupon-${newCoupon.code.toLowerCase()}.json`);
    setJsonModalOpen(true);
  };

  const handleToggleCoupon = async (id: string, currentStatus: boolean) => {
    const updatedStatus = !currentStatus;
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: updatedStatus } : c))
    );

    try {
      await fetch(`/api/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus })
      });
      triggerToast(`Coupon status set to ${updatedStatus ? 'ACTIVE' : 'PAUSED'}.`);
    } catch (err) {
      console.warn('API error', err);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Delete coupon code "${code}"?`)) return;
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      triggerToast(`Coupon "${code}" removed from system.`);
    } catch (err) {
      console.warn('API error', err);
    }
  };

  // --- DYNAMIC PAYMENT SETTINGS HANDLERS ---
  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: SiteSettings = {
      ...settingsForm,
      upiId: paymentForm.upiId.trim(),
      payeeName: paymentForm.payeeName.trim(),
      upiMerchantCode: paymentForm.upiMerchantCode?.trim(),
      customQrUrl: paymentForm.customQrUrl?.trim(),
      useCustomQr: paymentForm.useCustomQr
    };

    setSettingsForm(updatedSettings);
    onUpdateSettings(updatedSettings);

    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSettings)
    }).catch((err) => console.log('Settings fallback', err));

    triggerToast('Dynamic UPI & QR Payment Gateway details updated!');
  };

  // --- MASTER PIN SECURITY HANDLERS ---
  const handleUpdateMasterPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMessage(null);

    if (newPinInput.length < 6) {
      setPinChangeMessage({ text: 'New PIN must be at least 6 digits for security.', isError: true });
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinChangeMessage({ text: 'New PIN and Confirm PIN do not match.', isError: true });
      return;
    }

    try {
      const res = await fetch('/api/security/update-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPin: currentPinInput,
          newPin: newPinInput
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('dlx_admin_master_pin', newPinInput);
        setPinChangeMessage({ text: 'Master PIN successfully updated and synchronized!', isError: false });
        setCurrentPinInput('');
        setNewPinInput('');
        setConfirmPinInput('');
        triggerToast('Master Security PIN updated successfully.');
      } else {
        setPinChangeMessage({ text: data.error || 'Failed to update PIN.', isError: true });
      }
    } catch (err) {
      // Fallback
      localStorage.setItem('dlx_admin_master_pin', newPinInput);
      setPinChangeMessage({ text: 'Master PIN updated in local security vault.', isError: false });
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      triggerToast('Master Security PIN updated locally.');
    }
  };

  const handleResetLockout = () => {
    localStorage.removeItem('dlx_admin_pin_failed_attempts');
    localStorage.removeItem('dlx_admin_lockout_until');
    refreshLockoutStatus();
    triggerToast('Device brute-force lockout counter cleared!');
  };

  // --- OCCASION THEME ACTIVATION HANDLER ---
  const handleActivateTheme = (themeId: OccasionThemeId) => {
    setTheme(themeId);
    const selected = availableThemes.find((t) => t.id === themeId);
    setThemeActivatedAlert(selected ? selected.name : themeId);
    triggerToast(`Activated "${selected?.name}" theme with festive particles and banners!`);
    setTimeout(() => setThemeActivatedAlert(null), 3500);
  };

  // --- SHOWROOM SETTINGS HANDLER ---
  const handleSaveShowroomSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    setSettingsSavedAlert(true);
    triggerToast('Showroom timings and contact coordinates updated.');
    setTimeout(() => setSettingsSavedAlert(false), 3000);
  };

  // --- EXPORT CATALOG HANDLER ---
  const handleExportFullCatalog = () => {
    const exportPayload = {
      brand: 'DHANLAXMI JWELLERS',
      exportedAt: new Date().toISOString(),
      liveRates: rates,
      coupons,
      productsCount: products.length,
      products: products
    };
    setJsonModalTitle('Full Jewelry Boutique Database Export');
    setJsonModalSubtitle(`Complete export containing ${products.length} master products, ${coupons.length} coupons, and live rates`);
    setJsonModalPayload(exportPayload);
    setJsonModalFilename(`dhanlaxmi-complete-catalog-${Date.now()}.json`);
    setJsonModalOpen(true);
  };

  // Calculated Live Preview for Product Form
  const previewLivePrice = calculateProductPrice(
    {
      ...productForm,
      grossWeight: Number(productForm.grossWeight) || 10,
      netGoldWeight: Number(productForm.netGoldWeight) || 10,
      makingChargePercent: Number(productForm.makingChargePercent) || 14,
      purity: (productForm.purity as GoldPurity) || '22K',
      gemstoneCharge: Number(productForm.gemstoneCharge) || 0
    } as any,
    rates,
    0
  );

  // Filtered product listing
  const filteredProducts = products.filter((p) => {
    const matchesSearch = productSearch === '' || 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(productSearch.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesPurity = purityFilter === 'all' || p.purity === purityFilter;

    return matchesSearch && matchesCategory && matchesPurity;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div 
        className="relative bg-stone-100 rounded-3xl max-w-6xl w-full max-h-[95vh] flex flex-col shadow-2xl border-2 border-[#C59B27] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-70 bg-[#081816] text-[#DFB76C] px-5 py-2.5 rounded-full border border-[#C59B27] shadow-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-[#C59B27]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Executive Header */}
        <div className="bg-[#081816] text-[#E8D5B5] p-4 sm:p-5 flex items-center justify-between border-b border-[#C59B27]/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#C59B27]/20 border border-[#C59B27]/40 text-[#DFB76C]">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-serif-luxury font-bold text-white tracking-wide">
                  DHANLAXMI JWELLERS Executive CMS
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 font-mono font-bold uppercase">
                  {sessionUser?.name || 'Master Admin'} ({sessionUser?.role || 'SUPER_ADMIN'})
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900/90 text-[#DFB76C] border border-[#C59B27]/40 font-mono" title="Administrative ID">
                  {maskAdminEmail(sessionUser?.email)}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Showroom Operations • Vault & HUID Tracking • UPI Gateway • Gemini AI Sentinel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Realtime Live Sync Badge */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium ${
              realtimeStatus === 'CONNECTED'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : realtimeStatus === 'RECONNECTING'
                ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
            }`} title={`Real-time Stream: ${realtimeStatus} • Broadcast events synced: ${activeEventsCount}`}>
              <div className="relative flex h-2 w-2">
                {realtimeStatus === 'CONNECTED' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  realtimeStatus === 'CONNECTED' ? 'bg-emerald-500' : realtimeStatus === 'RECONNECTING' ? 'bg-amber-500' : 'bg-rose-500'
                }`}></span>
              </div>
              <span className="font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#DFB76C]" />
                {realtimeStatus === 'CONNECTED' ? '0ms Live Sync' : realtimeStatus}
              </span>
              {lastSyncTime && (
                <span className="text-[10px] text-stone-400 border-l border-stone-700 pl-2">
                  {lastSyncTime}
                </span>
              )}
            </div>

            <button
              onClick={handleAdminLogout}
              className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 hover:text-rose-300 hover:border-rose-700/60 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Secure 2FA Session Termination"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Secure Logout</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
              title="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-white border-b border-[#E8D5B5] px-4 py-2 flex items-center justify-between overflow-x-auto gap-2 shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {[
              { id: 'products', label: 'Catalog', icon: Layers, count: products.filter(p => !p.isDeleted).length },
              { id: 'inventory_vault', label: 'Stock Vault', icon: Boxes, count: inventoryLogs.length },
              { id: 'payment', label: 'UPI & QR Gateway', icon: QrCode },
              { id: 'security_sentinel', label: 'AI Security Sentinel', icon: Cpu, badge: '60s Batch' },
              { id: 'ai_currency', label: 'AI Currency FX', icon: Globe2 },
              { id: 'coupons', label: 'Coupons', icon: Tag, count: coupons.length },
              { id: 'themes', label: 'Occasion Theming', icon: Palette, badge: activeTheme.badge },
              { id: 'rates', label: 'Bullion Rates', icon: TrendingUp },
              { id: 'orders', label: 'Reservations', icon: ShoppingBag, count: orders.length },
              { id: 'settings', label: 'Showroom', icon: Store },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`admin-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#081816] text-[#DFB76C] shadow-sm'
                      : 'text-stone-700 hover:bg-[#F3EEE6] hover:text-[#081816]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#C59B27]" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-[#C59B27] text-[#081816]' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportFullCatalog}
              className="text-[11px] text-[#996515] hover:text-[#081816] font-bold flex items-center gap-1 cursor-pointer bg-[#FAF7F2] px-2.5 py-1.5 rounded-lg border border-[#E8D5B5]"
              title="Export complete database as JSON payload"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Scrollable Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50">
          
          {/* ================= TAB 1: DYNAMIC INVENTORY MANAGEMENT (PRODUCT CMS) ================= */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Top Controls & Search */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8D5B5] shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search title, SKU, subcategory..."
                      className="bg-stone-50 border border-stone-300 rounded-xl pl-8 pr-3 py-2 text-xs w-full focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#C59B27]"
                  >
                    <option value="all">All Categories</option>
                    <option value="bridal">Bridal Royale</option>
                    <option value="gold">Gold 22K/24K</option>
                    <option value="diamond">Diamond Solitaires</option>
                    <option value="silver">925 Silver Artefacts</option>
                  </select>

                  <select
                    value={purityFilter}
                    onChange={(e) => setPurityFilter(e.target.value)}
                    className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#C59B27]"
                  >
                    <option value="all">All Purities</option>
                    <option value="22K">22K Gold</option>
                    <option value="24K">24K Pure</option>
                    <option value="18K">18K Diamond</option>
                    <option value="925">925 Silver</option>
                  </select>
                </div>

                <button
                  onClick={handleOpenNewProduct}
                  id="admin-add-product-btn"
                  className="w-full lg:w-auto px-5 py-2.5 rounded-xl bg-[#081816] hover:bg-[#122e2a] text-[#DFB76C] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#C59B27]" />
                  <span>Add New Masterpiece</span>
                </button>
              </div>

              {/* Product Grid Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((prod) => {
                  const price = calculateProductPrice(prod, rates, 0);
                  return (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={prod.images[0] || LUXURY_IMAGE_PRESETS[0].url}
                            alt={prod.name}
                            className="w-18 h-18 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-mono text-stone-400 block">{prod.sku}</span>
                            <h4 className="text-xs font-bold text-stone-900 font-serif-luxury truncate">{prod.name}</h4>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold">
                                {prod.purity}
                              </span>
                              <span className="text-[10px] text-stone-500 font-medium">
                                {prod.grossWeight}g
                              </span>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                                {prod.stockStatus} ({prod.stockCount})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8D5B5] flex justify-between items-center text-xs">
                          <span className="text-stone-500 font-medium">Live Calculated:</span>
                          <strong className="text-[#996515] font-bold font-serif-luxury text-sm">
                            {formatINR(price.totalPrice)}
                          </strong>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => {
                            setJsonModalTitle(`Product Payload: ${prod.sku}`);
                            setJsonModalSubtitle(prod.name);
                            setJsonModalPayload(prod);
                            setJsonModalFilename(`product-${prod.sku.toLowerCase()}.json`);
                            setJsonModalOpen(true);
                          }}
                          className="text-stone-500 hover:text-stone-900 flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <FileCode className="w-3.5 h-3.5 text-stone-400" />
                          <span>Payload</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDuplicateProduct(prod)}
                            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleSoftDeleteProduct(prod.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Soft Delete to Trash Archive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ================= TAB 2: CUSTOM COUPON MAKER & DISCOUNT ENGINE ================= */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header card */}
              <div className="bg-white p-5 rounded-2xl border border-[#E8D5B5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#C59B27]" />
                    <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                      Privilege Discount Engine & Alphanumeric Coupon Maker
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Create unique coupon codes (e.g., 'DIWALI20', 'ROYAL5000'). Secure checkout queries and applies discounts in real time.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingCoupon(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#081816] hover:bg-[#122e2a] text-[#DFB76C] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#C59B27]" />
                  <span>Generate New Coupon</span>
                </button>
              </div>

              {/* Active Coupons List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((cp) => (
                  <div
                    key={cp.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition space-y-4 ${
                      cp.isActive ? 'border-[#C59B27]/40 ring-1 ring-[#C59B27]/20' : 'border-stone-200 opacity-65'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#996515] bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#E8D5B5] tracking-wider">
                            {cp.code}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cp.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                          }`}>
                            {cp.isActive ? 'ACTIVE' : 'PAUSED'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 font-medium">{cp.description}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(cp.code);
                            triggerToast(`Coupon code ${cp.code} copied!`);
                          }}
                          className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
                          title="Copy Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(cp.id, cp.code)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 space-y-1.5 text-xs">
                      <div className="flex justify-between text-stone-700">
                        <span>Benefit:</span>
                        <strong className="text-stone-900 font-bold">
                          {cp.discountType === 'percentage'
                            ? `${cp.discountValue}% OFF on ${cp.applicableOn === 'making_charges' ? 'Making Charges' : 'Total Order'}`
                            : `${formatINR(cp.discountValue)} Flat OFF`}
                        </strong>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Min Order:</span>
                        <span>{formatINR(cp.minOrderValue)}</span>
                      </div>
                      {cp.maxDiscountAmount && (
                        <div className="flex justify-between text-stone-600">
                          <span>Max Discount Cap:</span>
                          <span>{formatINR(cp.maxDiscountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-stone-600">
                        <span>Usage Count:</span>
                        <span>{cp.usageCount} / {cp.usageLimit}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Valid Until:</span>
                        <span>{cp.expiryDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleCoupon(cp.id, cp.isActive)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                          cp.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {cp.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setJsonModalTitle(`Coupon Rule Payload: ${cp.code}`);
                          setJsonModalSubtitle('Alphanumeric discount verification rule');
                          setJsonModalPayload(cp);
                          setJsonModalFilename(`coupon-${cp.code.toLowerCase()}.json`);
                          setJsonModalOpen(true);
                        }}
                        className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Payload</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ================= TAB 3: OCCASION THEME ENGINE ================= */}
          {activeTab === 'themes' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white p-5 rounded-2xl border border-[#E8D5B5] shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Palette className="w-5 h-5 text-[#C59B27]" />
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                    Occasion-Based Dynamic Theming Engine
                  </h3>
                </div>
                <p className="text-xs text-stone-500">
                  Switch the entire boutique aesthetic with 1-click presets for Diwali, Dhanteras, Weddings, and Akshaya Tritiya.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableThemes.map((th) => {
                  const isCurrent = activeThemeId === th.id;
                  return (
                    <div
                      key={th.id}
                      className={`p-5 rounded-2xl border-2 transition space-y-4 bg-white relative overflow-hidden ${
                        isCurrent
                          ? 'border-[#C59B27] ring-2 ring-[#C59B27]/40 shadow-lg'
                          : 'border-stone-200 hover:border-stone-300 shadow-xs'
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute top-3 right-3 text-[10px] font-bold bg-[#C59B27] text-black px-2 py-0.5 rounded-full">
                          ACTIVE THEME
                        </span>
                      )}

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#996515] font-bold">
                          {th.badge}
                        </span>
                        <h4 className="text-base font-bold font-serif-luxury text-stone-900">{th.name}</h4>
                        <p className="text-xs text-stone-600">{th.subtitle}</p>
                      </div>

                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1 text-stone-700">
                        <div className="font-medium text-stone-900">{th.heroHeadline}</div>
                        <div className="text-[11px] text-amber-800 font-semibold">{th.festiveDiscountNote}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleActivateTheme(th.id)}
                        disabled={isCurrent}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-[#081816] hover:bg-[#122e2a] text-[#DFB76C]'
                        }`}
                      >
                        {isCurrent ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Currently Active</span>
                          </>
                        ) : (
                          <span>Activate {th.name}</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ================= TAB 4: BULLION LIVE RATES CMS ================= */}
          {activeTab === 'rates' && (
            <div className="space-y-6 animate-fadeIn max-w-3xl">
              
              <form onSubmit={handleSaveRates} className="bg-white p-6 rounded-2xl border border-[#E8D5B5] shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#E8D5B5] pb-3">
                  <div>
                    <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                      Live Bullion Rates Broadcast Engine
                    </h3>
                    <p className="text-xs text-stone-500">
                      Changes here propagate dynamically to every jewelry product's formula.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#996515] bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E8D5B5]">
                    {ratesForm.lastUpdated}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">Gold 22K (per 10g) *</label>
                    <input
                      type="number"
                      required
                      value={ratesForm.gold22k}
                      onChange={(e) => setRatesForm({ ...ratesForm, gold22k: Number(e.target.value) })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">Gold 24K (per 10g) *</label>
                    <input
                      type="number"
                      required
                      value={ratesForm.gold24k}
                      onChange={(e) => setRatesForm({ ...ratesForm, gold24k: Number(e.target.value) })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">Silver 999 (per 1kg) *</label>
                    <input
                      type="number"
                      required
                      value={ratesForm.silver999}
                      onChange={(e) => setRatesForm({ ...ratesForm, silver999: Number(e.target.value) })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>
                </div>

                {/* Quick adjustments */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-stone-600 block mb-1.5">Quick Bullion Adjustments:</span>
                  <div className="flex flex-wrap gap-2">
                    {[-200, -100, +100, +200, +500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickRateShift(amt)}
                        className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-mono font-bold text-stone-800 transition cursor-pointer"
                      >
                        {amt > 0 ? `+₹${amt}` : `-₹${Math.abs(amt)}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#081816] text-[#DFB76C] font-bold text-xs uppercase tracking-wider hover:bg-[#122e2a] transition flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Broadcast Live Rates to App</span>
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* ================= TAB: BULLION INVENTORY VAULT & STOCK LEDGER ================= */}
          {activeTab === 'inventory_vault' && (
            <div className="animate-fadeIn">
              <InventoryVault
                products={products}
                rates={rates}
                inventoryLogs={inventoryLogs}
                onCheckIn={handleInventoryCheckIn}
                onCheckOut={handleInventoryCheckOut}
                onSoftDelete={handleSoftDeleteProduct}
                onRestore={handleRestoreProduct}
                triggerToast={triggerToast}
              />
            </div>
          )}

          {/* ================= TAB: DYNAMIC UPI & QR CODE PAYMENT GATEWAY ================= */}
          {activeTab === 'payment' && (
            <div className="animate-fadeIn">
              <UpiPaymentManager
                settings={settings}
                onUpdateSettings={onUpdateSettings}
                triggerToast={triggerToast}
              />
            </div>
          )}

          {/* ================= TAB: GEMINI AI SECURITY SENTINEL & 60s BATCH AUDITOR ================= */}
          {activeTab === 'security_sentinel' && (
            <div className="animate-fadeIn">
              <SecuritySentinelDashboard
                auditLogs={auditLogs}
                sentinelReports={sentinelReports}
                pendingBatchCount={pendingBatchCount}
                onTriggerAuditNow={handleTriggerSentinelAuditNow}
                triggerToast={triggerToast}
              />
            </div>
          )}

          {/* ================= TAB: GEMINI AI MULTI-CURRENCY CONVERTER ================= */}
          {activeTab === 'ai_currency' && (
            <div className="animate-fadeIn">
              <CurrencyConverterWidget />
            </div>
          )}

          {/* ================= TAB 7: ORDERS & RESERVATIONS ================= */}
          {activeTab === 'orders' && (() => {
            const filteredOrders = orders.filter((ord) => {
              const matchesSearch = 
                ord.bookingNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                ord.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                ord.phone.includes(orderSearchQuery) ||
                ord.city.toLowerCase().includes(orderSearchQuery.toLowerCase());
              
              if (!matchesSearch) return false;
              if (orderFilterStatus === 'all') return true;
              if (orderFilterStatus === 'completed') return ord.status === 'Confirmed' || ord.status === 'Delivered';
              return ord.status.toLowerCase().includes(orderFilterStatus.toLowerCase());
            });

            return (
              <div className="space-y-4 animate-fadeIn">
                {/* Header & Controls Bar */}
                <div className="bg-white p-4 rounded-2xl border border-[#E8D5B5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif-luxury text-base font-bold text-stone-900 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#C59B27]" />
                      <span>VIP Showroom Reservations & Order Inquiries ({orders.length})</span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      Manage bookings, track customer rate-locks, and generate official BIS hallmarked tax invoice PDF receipts.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search booking #, phone, name..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    onClick={() => setOrderFilterStatus('all')}
                    className={`px-3 py-1 rounded-full font-bold transition whitespace-nowrap cursor-pointer ${
                      orderFilterStatus === 'all'
                        ? 'bg-[#081816] text-[#DFB76C]'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    All ({orders.length})
                  </button>
                  <button
                    onClick={() => setOrderFilterStatus('completed')}
                    className={`px-3 py-1 rounded-full font-bold transition whitespace-nowrap cursor-pointer ${
                      orderFilterStatus === 'completed'
                        ? 'bg-[#081816] text-[#DFB76C]'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    Completed / Confirmed ({orders.filter(o => o.status === 'Confirmed' || o.status === 'Delivered').length})
                  </button>
                  <button
                    onClick={() => setOrderFilterStatus('VIP Appointment Scheduled')}
                    className={`px-3 py-1 rounded-full font-bold transition whitespace-nowrap cursor-pointer ${
                      orderFilterStatus === 'VIP Appointment Scheduled'
                        ? 'bg-[#081816] text-[#DFB76C]'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    VIP Scheduled ({orders.filter(o => o.status === 'VIP Appointment Scheduled').length})
                  </button>
                  <button
                    onClick={() => setOrderFilterStatus('Pending')}
                    className={`px-3 py-1 rounded-full font-bold transition whitespace-nowrap cursor-pointer ${
                      orderFilterStatus === 'Pending'
                        ? 'bg-[#081816] text-[#DFB76C]'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    Pending ({orders.filter(o => o.status === 'Pending').length})
                  </button>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-2">
                    <ShoppingBag className="w-8 h-8 text-stone-400 mx-auto" />
                    <h4 className="font-bold text-stone-700">No Reservations Matching Filter</h4>
                    <p className="text-xs text-stone-500">Try changing your search terms or filter selection.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((ord) => {
                      const isCompleted = ord.status === 'Confirmed' || ord.status === 'Delivered';

                      return (
                        <div
                          key={ord.id}
                          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs hover:border-[#C59B27]/50 transition duration-200"
                        >
                          {/* Top Row: Booking #, Status Pill, and Value */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-stone-900 text-sm bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                                  {ord.bookingNumber}
                                </span>
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                                  isCompleted 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : ord.status === 'Pending'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : 'bg-blue-50 text-blue-800 border-blue-300'
                                }`}>
                                  ● {ord.status}
                                </span>
                                <span className="text-[10px] text-stone-400 font-mono">
                                  {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="text-stone-600 text-[11px] flex items-center gap-2">
                                <strong className="text-stone-800">{ord.customerName}</strong>
                                <span>•</span>
                                <span>{ord.phone}</span>
                                <span>•</span>
                                <span>{ord.city}</span>
                              </div>
                            </div>

                            {/* Price & Fulfillment Badge */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                              <span className="text-lg font-bold font-serif-luxury text-[#996515]">
                                {formatINR(ord.grandTotal)}
                              </span>
                              <span className="text-[10px] bg-[#FAF7F2] text-stone-600 px-2 py-0.5 rounded border border-[#E8D5B5]">
                                {ord.deliveryMethod}
                              </span>
                            </div>
                          </div>

                          {/* Ordered Items Table / List */}
                          <div className="bg-stone-50/60 p-3 rounded-xl border border-stone-200 space-y-2">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex justify-between">
                              <span>Ordered Jewellery Items ({ord.items.length})</span>
                              <span>Purity & Value</span>
                            </div>
                            <div className="space-y-1.5">
                              {ord.items.map((it) => (
                                <div key={it.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-stone-200/80">
                                  <div className="flex items-center gap-2">
                                    {it.product.images?.[0] && (
                                      <img 
                                        src={it.product.images[0]} 
                                        alt={it.product.name} 
                                        className="w-9 h-9 rounded object-cover border border-stone-200 shrink-0" 
                                      />
                                    )}
                                    <div>
                                      <div className="font-bold text-stone-800 text-xs">{it.product.name} (x{it.quantity})</div>
                                      <div className="text-[10px] text-stone-500 font-mono">
                                        {it.product.purity} • Gross Wt: {it.product.grossWeight}g • Net Gold: {it.product.netGoldWeight || it.product.grossWeight}g
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-mono font-bold text-stone-900 text-xs">
                                      {formatINR(it.breakdown?.totalPrice || 0)}
                                    </div>
                                    <div className="text-[9px] text-stone-500">
                                      Rate: ₹{Math.round(it.breakdown?.ratePerGramApplied || 0)}/g
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bottom Row: Status Selector & Action Toolbar */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-stone-100">
                            {/* Status Change Selector */}
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-stone-500 font-medium">Update Status:</span>
                              <select
                                value={ord.status}
                                onChange={(e) => {
                                  onUpdateOrderStatus(ord.id, e.target.value);
                                  triggerToast(`Order ${ord.bookingNumber} updated to ${e.target.value}`);
                                }}
                                className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#C59B27] cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="VIP Appointment Scheduled">VIP Appointment Scheduled</option>
                                <option value="Under Crafting">Under Crafting</option>
                                <option value="Ready for Pickup">Ready for Pickup</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </div>

                            {/* Action Buttons: PDF Receipt & WhatsApp */}
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              {/* Primary PDF Receipt Generator Button */}
                              <button
                                onClick={() => handleOpenReceipt(ord)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#081816] text-[#DFB76C] hover:bg-[#122e2a] hover:text-white transition font-bold text-xs flex items-center gap-1.5 shadow-xs border border-[#C59B27]/40 cursor-pointer"
                                title="Generate Official Tax Invoice & PDF Receipt"
                              >
                                <FileCheck className="w-3.5 h-3.5 text-[#DFB76C]" />
                                <span>Generate PDF Receipt</span>
                              </button>

                              {/* WhatsApp Contact */}
                              <a
                                href={`https://wa.me/91${ord.phone.replace(/[^0-9]/g, '')}?text=Namaste%20${encodeURIComponent(ord.customerName)},%20regarding%20your%20Dhanlaxmi%20Jwellers%20order%20${encodeURIComponent(ord.bookingNumber)}%20(Total:%20${encodeURIComponent(formatINR(ord.grandTotal))}).`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition font-bold text-xs flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>

                          {ord.customerNotes && (
                            <p className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-lg italic">
                              Special Instructions: {ord.customerNotes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ================= TAB 8: SHOWROOM SETTINGS & TIMINGS ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn max-w-3xl">
              {/* Executive Security & Credentials Panel */}
              <div className="bg-[#081816] text-[#FAF7F2] p-6 rounded-2xl border-2 border-[#C59B27]/60 shadow-lg space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#C59B27]/20 text-[#DFB76C]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide">
                        Executive Security & Credentials Profile
                      </h3>
                      <p className="text-[11px] text-stone-400">
                        Zero-trust authentication, cryptographic session hashing, and masked credential vaults
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                    Secured
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                    <span className="text-stone-400 font-medium text-[11px] block">Administrative Identity</span>
                    <p className="text-white font-bold text-sm">
                      {sessionUser?.name || 'Shri R. K. Verma'}
                    </p>
                    <span className="text-[10px] text-stone-400 font-mono">
                      Role: <strong className="text-[#DFB76C]">{sessionUser?.role || 'SUPER_ADMIN'}</strong>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400 font-medium text-[11px] block">Protected Email (Masked)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">Obscured</span>
                    </div>
                    <p className="text-[#DFB76C] font-mono font-bold text-sm tracking-wider">
                      {maskAdminEmail(sessionUser?.email)}
                    </p>
                    <span className="text-[10px] text-stone-400">
                      Hidden from client DOM & local browser storage
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/50 border border-stone-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#DFB76C]" />
                      <span className="font-bold text-stone-200">Zero-Bypass Two-Factor Authentication</span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      15-minute inactivity security lock is currently active on this terminal.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordChangeError('');
                      setPasswordChangeSuccess('');
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setIsChangePasswordOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#081816] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Change Master Password</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveShowroomSettings} className="bg-white p-6 rounded-2xl border border-[#E8D5B5] shadow-xs space-y-4 text-xs">
                <h3 className="font-serif-luxury text-base font-bold text-stone-900 border-b border-[#E8D5B5] pb-2">
                  Haldwani Showroom Coordinates & Operating Hours
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Brand Name *</label>
                    <input
                      type="text"
                      value={settingsForm.brandName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Showroom Phone *</label>
                    <input
                      type="text"
                      value={settingsForm.storePhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storePhone: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-stone-800 block mb-1">WhatsApp Inquiry Line *</label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Operating Hours *</label>
                    <input
                      type="text"
                      value={settingsForm.showroomTimings}
                      onChange={(e) => setSettingsForm({ ...settingsForm, showroomTimings: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Physical Address *</label>
                  <input
                    type="text"
                    value={settingsForm.storeAddress}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeAddress: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#081816] text-[#DFB76C] font-bold text-xs uppercase tracking-wider hover:bg-[#122e2a] transition flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Showroom Details</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* MODAL: ADD / EDIT PRODUCT CMS FORM */}
        {isEditingProduct && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
            <div 
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-[#C59B27] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-5 bg-[#081816] text-[#E8D5B5] flex items-center justify-between border-b border-[#C59B27]/40 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#C59B27]/20 border border-[#C59B27]/40 text-[#DFB76C]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-white tracking-wide">
                      {editingProductId ? 'Edit Jewelry Piece in CMS' : 'Add New Jewelry Masterpiece'}
                    </h3>
                    <p className="text-xs text-stone-400">
                      Fill all specifications to structure and publish the verified JSON payload.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingProduct(false)}
                  className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePublishProduct} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-stone-800 block mb-1">Product Title / Name *</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. Padmavati 22K Gold Kundan Bridal Set"
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">SKU / Code *</label>
                    <input
                      type="text"
                      required
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="e.g. DJ-GL-5521"
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                    >
                      <option value="bridal">Bridal Royale Collection</option>
                      <option value="gold">Gold 22K/24K Fine Jewelry</option>
                      <option value="diamond">Diamond Solitaires & Precious Gems</option>
                      <option value="silver">925 Sterling Silver Artefacts</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Subcategory *</label>
                    <select
                      value={productForm.subcategory}
                      onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value as any })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                    >
                      <option value="Necklaces & Sets">Necklaces & Sets</option>
                      <option value="Chokers & Hasli">Chokers & Hasli</option>
                      <option value="Bangles & Kadas">Bangles & Kadas</option>
                      <option value="Rings & Bands">Rings & Bands</option>
                      <option value="Earrings & Jhumkas">Earrings & Jhumkas</option>
                      <option value="Mangalsutra">Mangalsutra</option>
                      <option value="Pendants & Chains">Pendants & Chains</option>
                      <option value="Coins & Bars">Coins & Bars</option>
                      <option value="Payal & Anklets">Payal & Anklets</option>
                      <option value="Silver Pooja Artefacts">Silver Pooja Artefacts</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#E8D5B5]">
                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Gold Purity *</label>
                    <select
                      value={productForm.purity}
                      onChange={(e) => setProductForm({ ...productForm, purity: e.target.value as any })}
                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#C59B27]"
                    >
                      <option value="22K">22K Gold (91.6%)</option>
                      <option value="24K">24K Pure Gold (99.9%)</option>
                      <option value="18K">18K Diamond Gold (75%)</option>
                      <option value="925">925 Sterling Silver</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Gross Wt (g) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.grossWeight}
                      onChange={(e) => setProductForm({ ...productForm, grossWeight: Number(e.target.value) })}
                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Net Gold Wt (g)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.netGoldWeight}
                      onChange={(e) => setProductForm({ ...productForm, netGoldWeight: Number(e.target.value) })}
                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Making Charge %</label>
                    <input
                      type="number"
                      step="0.5"
                      value={productForm.makingChargePercent}
                      onChange={(e) => setProductForm({ ...productForm, makingChargePercent: Number(e.target.value) })}
                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#996515] focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>
                </div>

                {/* SECURE JPG IMAGE UPLOADER MODULE */}
                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8D5B5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#C59B27]" />
                      High-Performance JPEG/JPG Product Imagery Vault
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      Strict .jpg/.jpeg • Client-side Canvas Compression • Zero-delay S3/Vault Sync
                    </span>
                  </div>
                  <JPGImageUploader
                    images={productForm.images || []}
                    onImagesChange={(imgs) => setProductForm((prev) => ({ ...prev, images: imgs }))}
                    onToast={triggerToast}
                    maxImages={6}
                  />
                </div>

                {/* Additional Product Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Product Description</label>
                    <textarea
                      rows={2}
                      value={productForm.description || ''}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Hallmarked fine jewelry masterpiece handcrafted with pure 916 gold."
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Artisan Heritage / Story</label>
                    <textarea
                      rows={2}
                      value={productForm.storyDetails || ''}
                      onChange={(e) => setProductForm({ ...productForm, storyDetails: e.target.value })}
                      placeholder="Crafted by master goldsmiths of Haldwani Uttarakhand."
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1 text-[11px]">Stock Status</label>
                    <select
                      value={productForm.stockStatus || 'In Stock'}
                      onChange={(e) => setProductForm({ ...productForm, stockStatus: e.target.value as any })}
                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Only 2 Left">Only 2 Left</option>
                      <option value="Made to Order">Made to Order</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1 text-[11px]">Stock Units</label>
                    <input
                      type="number"
                      value={productForm.stockCount || 1}
                      onChange={(e) => setProductForm({ ...productForm, stockCount: Number(e.target.value) })}
                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1 text-[11px]">HUID Code</label>
                    <input
                      type="text"
                      value={productForm.huid || ''}
                      onChange={(e) => setProductForm({ ...productForm, huid: e.target.value })}
                      placeholder="DLX9167789"
                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1 text-[11px]">Hallmark Cert</label>
                    <input
                      type="text"
                      value={productForm.certification || 'BIS Hallmark 916'}
                      onChange={(e) => setProductForm({ ...productForm, certification: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Calculated Price Preview */}
                <div className="bg-[#081816] text-[#E8D5B5] p-4 rounded-xl border-2 border-[#C59B27] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-[#DFB76C] font-bold uppercase tracking-wider block">
                      Live Retail Price Breakdown (Synchronized with Today's Bullion Rate)
                    </span>
                    <div className="text-xl sm:text-2xl font-serif-luxury font-bold text-white">
                      {formatINR(previewLivePrice.totalPrice)}
                    </div>
                  </div>

                  <span className="text-[10px] bg-emerald-900 text-emerald-300 font-mono px-2 py-1 rounded border border-emerald-700">
                    Ready for Live App
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProduct(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    id="admin-publish-product-btn"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#061715] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish to App & Inspect JSON Payload</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREATE NEW COUPON FORM */}
        {isCreatingCoupon && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div 
              className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-[#C59B27]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#E8D5B5] pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#C59B27]" />
                  <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                    Create Privilege Coupon Code
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreatingCoupon(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Coupon Code (Alphanumeric) *</label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. DIWALI20, AKSHAYA5000"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono uppercase font-bold text-xs focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Discount Type *</label>
                    <select
                      value={couponForm.discountType}
                      onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Flat Amount (INR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Discount Value *</label>
                    <input
                      type="number"
                      required
                      value={couponForm.discountValue}
                      onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                      placeholder="e.g. 20 for 20%, 5000 for ₹5000"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Applicable On</label>
                    <select
                      value={couponForm.applicableOn}
                      onChange={(e) => setCouponForm({ ...couponForm, applicableOn: e.target.value as any })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                    >
                      <option value="making_charges">Making Charges Only</option>
                      <option value="total_order">Total Order Value</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Min Order Value (₹)</label>
                    <input
                      type="number"
                      value={couponForm.minOrderValue}
                      onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                      placeholder="e.g. 25000"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Short Description / Terms</label>
                  <input
                    type="text"
                    value={couponForm.description}
                    onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                    placeholder="e.g. 20% off on making charges for wedding shoppers"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCoupon(false)}
                    className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#081816] hover:bg-[#122e2a] text-[#DFB76C] font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                  >
                    Activate Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* JSON PAYLOAD INSPECTOR MODAL */}
        <JSONPayloadModal
          isOpen={jsonModalOpen}
          onClose={() => setJsonModalOpen(false)}
          title={jsonModalTitle}
          subtitle={jsonModalSubtitle}
          payload={jsonModalPayload}
          filename={jsonModalFilename}
        />

        {/* OFFICIAL ORDER TAX INVOICE & PDF RECEIPT MODAL */}
        <OrderReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => {
            setReceiptModalOpen(false);
            setSelectedReceiptOrder(null);
          }}
          order={selectedReceiptOrder}
          settings={settings}
          rates={rates}
        />

        {/* MODAL: CHANGE MASTER PASSWORD */}
        {isChangePasswordOpen && (
          <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div 
              className="bg-[#081816] text-[#FAF7F2] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-[#C59B27] space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#DFB76C]/10 border border-[#DFB76C]/30 text-[#DFB76C]">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-luxury text-lg font-bold text-white tracking-wide">
                      Update Master Password
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Re-encrypt credentials with SHA-256 validation
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Alerts */}
              {passwordChangeError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-200 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{passwordChangeError}</span>
                </div>
              )}

              {passwordChangeSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{passwordChangeSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangeMasterPassword} className="space-y-4 text-xs">
                {/* Current Password */}
                <div className="space-y-1">
                  <label className="font-semibold text-stone-300 flex items-center justify-between">
                    <span>Current Master Password *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-stone-900/90 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#DFB76C] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#DFB76C] transition p-1 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="font-semibold text-stone-300 flex items-center justify-between">
                    <span>New Master Password *</span>
                    <span className="text-[10px] text-stone-400 font-mono">Min 8 chars</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new master password"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-stone-900/90 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#DFB76C] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#DFB76C] transition p-1 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label className="font-semibold text-stone-300">Confirm New Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new master password"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-stone-900/90 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#DFB76C] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#DFB76C] transition p-1 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsChangePasswordOpen(false)}
                    className="px-4 py-2.5 border border-stone-700 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 text-xs font-semibold cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordChangeLoading || !currentPassword || !newPassword || !confirmPassword}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#081816] font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-95 transition shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {passwordChangeLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Update & Save Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
