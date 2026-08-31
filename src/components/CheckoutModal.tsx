import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Printer, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Sparkles,
  Building2,
  Lock,
  Tag,
  QrCode,
  Copy,
  Check,
  CreditCard,
  Crown
} from 'lucide-react';
import { CartItem, Coupon, LiveRates, OrderInquiry, SiteSettings } from '../types';
import { calculateProductPrice, formatINR } from '../utils/pricing';
import { DynamicQRCode } from './DynamicQRCode';
import { getUPIIntentLinks } from '../utils/qrCode';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  rates: LiveRates;
  settings: SiteSettings;
  discountPercent: number;
  couponCode: string;
  onOrderSuccess: (order: OrderInquiry) => void;
  onApplyCouponCode?: (code: string, discountValue: number) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  rates,
  settings,
  discountPercent: initialDiscountPercent,
  couponCode: initialCouponCode,
  onOrderSuccess,
  onApplyCouponCode,
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Nanda Vihar, Phase-1');
  const [city, setCity] = useState('Haldwani');
  const [pincode, setPincode] = useState('263139');
  const [deliveryMethod, setDeliveryMethod] = useState<'Showroom VIP Collection (Haldwani)' | 'Insured Home Delivery'>(
    'Showroom VIP Collection (Haldwani)'
  );
  const [paymentPreference, setPaymentPreference] = useState<'Advance Booking Token (UPI/Card)' | 'Pay at Showroom on Pickup' | 'Full Online Settlement'>(
    'Advance Booking Token (UPI/Card)'
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderInquiry | null>(null);

  // Dynamic Coupon State in Checkout
  const [activeCoupon, setActiveCoupon] = useState<string>(initialCouponCode || '');
  const [couponInput, setCouponInput] = useState<string>('');
  const [customDiscountAmount, setCustomDiscountAmount] = useState<number>(0);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  
  // UPI copy state
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');

  // Calculate Base Totals
  let subtotal = 0;
  let makingTotal = 0;

  items.forEach((item) => {
    const pb = calculateProductPrice(item.product, rates, 0);
    subtotal += (pb.goldValue + pb.diamondValue + pb.gemstoneValue) * item.quantity;
    makingTotal += pb.makingCharges * item.quantity;
  });

  // Calculate total discount from coupon
  let totalDiscount = 0;
  if (customDiscountAmount > 0) {
    totalDiscount = customDiscountAmount;
  } else if (initialDiscountPercent > 0) {
    totalDiscount = Math.round((makingTotal * initialDiscountPercent) / 100);
  }

  const taxableTotal = Math.max(0, subtotal + makingTotal - totalDiscount);
  const gstTotal = Math.round(taxableTotal * (rates.gstRate || 0.03));
  const grandTotal = taxableTotal + gstTotal;

  // Advance token amount (e.g. 10% or minimum ₹5,000 for gold rate lock)
  const tokenAmount = Math.min(grandTotal, Math.max(5000, Math.round(grandTotal * 0.1)));

  // Validate coupon code against backend API
  const handleValidateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    setCouponMessage(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          orderTotal: subtotal + makingTotal,
          makingChargesTotal: makingTotal
        })
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setActiveCoupon(data.coupon.code);
        setCustomDiscountAmount(data.discountAmount);
        setCouponMessage({ text: data.message, isError: false });
        if (onApplyCouponCode) {
          onApplyCouponCode(data.coupon.code, data.coupon.discountValue);
        }
      } else {
        setCouponMessage({ text: data.message || 'Invalid coupon code', isError: true });
      }
    } catch (err) {
      console.error('Coupon validation error', err);
      // Fallback local check
      if (code === 'DIWALI20') {
        const disc = Math.round((makingTotal * 20) / 100);
        setActiveCoupon('DIWALI20');
        setCustomDiscountAmount(disc);
        setCouponMessage({ text: 'DIWALI20 applied! 20% off on making charges.', isError: false });
      } else if (code === 'ROYAL5000') {
        setActiveCoupon('ROYAL5000');
        setCustomDiscountAmount(5000);
        setCouponMessage({ text: 'ROYAL5000 applied! Flat ₹5,000 off order.', isError: false });
      } else {
        setCouponMessage({ text: `Coupon code "${code}" is invalid or inactive.`, isError: true });
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon('');
    setCouponInput('');
    setCustomDiscountAmount(0);
    setCouponMessage(null);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2500);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone) {
      alert('Please provide your Name and Phone Number');
      return;
    }

    setIsSubmitting(true);

    const bookingId = 'DLX-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder: OrderInquiry = {
      id: 'ord-' + Date.now(),
      bookingNumber: bookingId,
      customerName,
      phone,
      email,
      address,
      city,
      pincode,
      deliveryMethod,
      paymentPreference,
      items,
      subtotal,
      makingCharges: makingTotal,
      discount: totalDiscount,
      gst: gstTotal,
      grandTotal,
      couponApplied: activeCoupon || undefined,
      status: 'VIP Appointment Scheduled',
      createdAt: new Date().toISOString(),
      customerNotes: `${notes ? notes + ' | ' : ''}${transactionRef ? 'UPI Ref / UTR: ' + transactionRef : ''}`
    };

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch (err) {
      console.warn('Backend store fallback to local state', err);
    }

    setConfirmedOrder(newOrder);
    onOrderSuccess(newOrder);
    setIsSubmitting(false);
  };

  const handleSendWhatsAppOrder = (order: OrderInquiry) => {
    const itemList = order.items.map((i, idx) => 
      `${idx + 1}. *${i.product.name}* (${i.product.purity}, ${i.product.grossWeight}g) x ${i.quantity}`
    ).join('%0A');

    const message = `*✨ NEW JEWELRY RESERVATION - DHANLAXMI JWELLERS ✨*%0A%0A` +
      `*Booking ID:* ${order.bookingNumber}%0A` +
      `*Customer Name:* ${order.customerName}%0A` +
      `*Contact Phone:* ${order.phone}%0A` +
      `*Delivery / Collection:* ${order.deliveryMethod}%0A` +
      `*Payment Method:* ${order.paymentPreference}%0A` +
      `${order.couponApplied ? `*Privilege Coupon:* ${order.couponApplied}%0A` : ''}` +
      `${transactionRef ? `*UPI Reference / UTR:* ${transactionRef}%0A` : ''}%0A` +
      `*Selected Ornaments:*%0A${itemList}%0A%0A` +
      `*Subtotal:* ${formatINR(order.subtotal)}%0A` +
      `*Making Charges:* ${formatINR(order.makingCharges)}%0A` +
      `${order.discount > 0 ? `*Privilege Savings:* -${formatINR(order.discount)}%0A` : ''}` +
      `*3% GST:* ${formatINR(order.gst)}%0A` +
      `*Grand Total:* ${formatINR(order.grandTotal)}%0A%0A` +
      `*Showroom Address:* HALDWANI NANDA VIHAR . PHASE -I%0A` +
      `Please lock my 1-hour old estimated rate and keep certificate ready!`;

    window.open(`https://wa.me/91${settings.whatsappNumber}?text=${message}`, '_blank');
  };

  const upiIntentLinks = getUPIIntentLinks({
    upiId: settings.upiId,
    payeeName: settings.payeeName,
    amount: paymentPreference === 'Advance Booking Token (UPI/Card)' ? tokenAmount : grandTotal,
    transactionNote: `Token Booking DLX-${new Date().getFullYear()}`
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border-2 border-[#C59B27]/50 p-5 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-500 hover:text-black hover:bg-stone-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================= ORDER CONFIRMED VIEW ================= */}
        {confirmedOrder ? (
          <div className="space-y-6 text-center animate-fadeIn py-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-600 shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#996515]">
                RESERVATION & RATE LOCK CONFIRMED
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#081816]">
                Thank You, {confirmedOrder.customerName}
              </h2>
              <p className="text-xs text-stone-600">
                Your order reservation has been registered at our Haldwani Nanda Vihar showroom.
              </p>
            </div>

            {/* Dynamic UPI Payment Card for Instant Token Deposit */}
            <div className="bg-[#FAF7F2] rounded-2xl p-5 border-2 border-[#C59B27]/40 text-left space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-[#E8D5B5]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#996515] font-bold block">
                    BOOKING TOKEN PAYMENT
                  </span>
                  <h4 className="text-base font-serif-luxury font-bold text-stone-900">
                    Scan with GPay, PhonePe, Paytm, or BHIM
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Pay token amount to lock the 1-hour old estimated rate ({rates.gold22k}/10g): <strong className="text-stone-900 font-bold">{formatINR(tokenAmount)}</strong>
                  </p>
                </div>

                <DynamicQRCode
                  upiId={settings.upiId}
                  payeeName={settings.payeeName}
                  amount={tokenAmount}
                  bookingNumber={confirmedOrder.bookingNumber}
                  customQrUrl={settings.customQrUrl}
                  useCustomQr={settings.useCustomQr}
                  size={140}
                />
              </div>

              {/* UPI ID Copy Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-600">Merchant VPA: <strong className="font-mono text-stone-900">{settings.upiId}</strong></span>
                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className="px-3 py-1 bg-stone-100 hover:bg-[#E8D5B5] text-stone-800 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedUPI ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-600" />}
                  <span>{copiedUPI ? 'VPA Copied' : 'Copy VPA'}</span>
                </button>
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-left space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-stone-200 pb-2 font-mono">
                <span className="text-stone-600">Booking Reference:</span>
                <strong className="text-stone-900 font-bold">{confirmedOrder.bookingNumber}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-600">Showroom Address:</span>
                <strong className="text-stone-900">HALDWANI NANDA VIHAR . PHASE -I</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-600">Collection Type:</span>
                <strong className="text-stone-900">{confirmedOrder.deliveryMethod}</strong>
              </div>

              {confirmedOrder.couponApplied && (
                <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                  <span>Coupon Savings ({confirmedOrder.couponApplied}):</span>
                  <strong>-{formatINR(confirmedOrder.discount)}</strong>
                </div>
              )}

              <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-bold text-[#081816]">
                <span>Total Amount:</span>
                <span className="text-[#996515]">{formatINR(confirmedOrder.grandTotal)}</span>
              </div>
            </div>

            {/* Action Buttons for Confirmed Order */}
            <div className="space-y-3">
              <button
                onClick={() => handleSendWhatsAppOrder(confirmedOrder)}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Booking Slip to Haldwani Showroom on WhatsApp</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.print()}
                  className="py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-600" />
                  <span>Print Digital Bill</span>
                </button>

                <button
                  onClick={onClose}
                  className="py-2.5 rounded-lg bg-[#081816] text-[#DFB76C] text-xs font-semibold uppercase tracking-wider hover:bg-[#122e2a] transition cursor-pointer"
                >
                  Return to Boutique
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* ================= CHECKOUT FORM VIEW ================= */
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            
            {/* Header */}
            <div className="space-y-1 border-b border-[#E8D5B5] pb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E8D5B5]/60 text-[#996515] text-[11px] font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-[#C59B27]" />
                ROYAL CHECKOUT & RATE LOCK
              </div>
              <h2 className="text-xl sm:text-2xl font-serif-luxury font-bold text-[#081816]">
                DHANLAXMI JWELLERS Order Verification
              </h2>
              <p className="text-xs text-stone-600">
                Reserve BIS 916 Hallmarked heirlooms with transparent making charges & 1-hour old rate locking.
              </p>
            </div>

            {/* Custom Discount Coupon Engine Input Box */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#C59B27]/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#C59B27]" />
                  Privilege Coupon / Voucher Code
                </span>
                {activeCoupon && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active: {activeCoupon}
                  </span>
                )}
              </div>

              {activeCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900">Coupon "{activeCoupon}" Applied</span>
                      <span className="text-emerald-700 block text-[11px]">Saved {formatINR(totalDiscount)} on your order!</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon (e.g. DIWALI20, ROYAL5000)"
                    className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-[#C59B27]"
                  />
                  <button
                    type="button"
                    disabled={couponLoading || !couponInput.trim()}
                    onClick={handleValidateCoupon}
                    className="px-4 py-2 bg-[#081816] hover:bg-[#122e2a] text-[#DFB76C] font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50 cursor-pointer"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              )}

              {couponMessage && (
                <p className={`text-xs font-medium ${couponMessage.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Delivery / Collection Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                1. Collection / Delivery Preference:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('Showroom VIP Collection (Haldwani)')}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                    deliveryMethod === 'Showroom VIP Collection (Haldwani)'
                      ? 'border-[#C59B27] bg-[#FAF7F2] ring-1 ring-[#C59B27]'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#996515] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Showroom VIP Pickup</span>
                    <span className="text-[11px] text-stone-500 block">HALDWANI NANDA VIHAR . PHASE -I</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('Insured Home Delivery')}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                    deliveryMethod === 'Insured Home Delivery'
                      ? 'border-[#C59B27] bg-[#FAF7F2] ring-1 ring-[#C59B27]'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Insured Home Delivery</span>
                    <span className="text-[11px] text-stone-500 block">Pan-India Tamper-Proof Armored Courier</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                2. Contact & Address Details:
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-stone-600 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Pooja Rawat"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-stone-600 block mb-1">WhatsApp / Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 7668037278"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-stone-600 block mb-1">City / Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-stone-600 block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-stone-600 block mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pooja.rawat@example.com"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-stone-600 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nanda Vihar, Phase-1, Haldwani"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                />
              </div>
            </div>

            {/* Payment Preference & Dynamic UPI Gateway Integration */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                3. Payment Preference & Dynamic UPI Gateway:
              </label>

              <div className="space-y-2">
                {[
                  { 
                    value: 'Advance Booking Token (UPI/Card)', 
                    label: `Advance Token Deposit (${formatINR(tokenAmount)}) - Locks 1-Hour Old Estimated Rate`, 
                    badge: 'Instant QR Available' 
                  },
                  { 
                    value: 'Pay at Showroom on Pickup', 
                    label: 'Pay at Haldwani Showroom on Pickup (Cash / Card / RTGS)', 
                    badge: 'Showroom Visit' 
                  },
                  { 
                    value: 'Full Online Settlement', 
                    label: `Full Digital Settlement (${formatINR(grandTotal)}) via Direct UPI`, 
                    badge: 'Pan-India Delivery' 
                  }
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                      paymentPreference === opt.value
                        ? 'border-[#C59B27] bg-[#FAF7F2] font-semibold text-stone-900'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentPreference === opt.value}
                        onChange={() => setPaymentPreference(opt.value as any)}
                        className="accent-[#C59B27]"
                      />
                      <span>{opt.label}</span>
                    </div>
                    {opt.badge && (
                      <span className="text-[10px] bg-[#E8D5B5] text-[#081816] px-2.5 py-0.5 rounded-full font-bold">
                        {opt.badge}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {/* Dynamic QR Code Box if UPI selected */}
              {(paymentPreference === 'Advance Booking Token (UPI/Card)' || paymentPreference === 'Full Online Settlement') && (
                <div className="p-4 rounded-2xl bg-[#081816] text-[#E8D5B5] border-2 border-[#C59B27]/60 space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#DFB76C] font-mono font-bold uppercase tracking-wider">
                        <QrCode className="w-4 h-4" />
                        <span>Dynamic Real-Time UPI Gateway</span>
                      </div>
                      <h4 className="text-sm font-bold text-white font-serif-luxury">
                        Scan with GPay, PhonePe, Paytm, or BHIM
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        Payee: <strong className="text-stone-200">{settings.payeeName}</strong>
                      </p>
                      <div className="inline-flex items-center gap-2 bg-black/60 px-3 py-1 rounded-lg border border-stone-800 text-xs font-mono text-[#DFB76C] mt-1">
                        <span>{settings.upiId}</span>
                        <button
                          type="button"
                          onClick={handleCopyUPI}
                          className="hover:text-white transition cursor-pointer"
                          title="Copy UPI ID"
                        >
                          {copiedUPI ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <DynamicQRCode
                      upiId={settings.upiId}
                      payeeName={settings.payeeName}
                      amount={paymentPreference === 'Advance Booking Token (UPI/Card)' ? tokenAmount : grandTotal}
                      bookingNumber="DLX-TOKEN"
                      customQrUrl={settings.customQrUrl}
                      useCustomQr={settings.useCustomQr}
                      size={135}
                    />
                  </div>

                  {/* Transaction Ref / UTR Input */}
                  <div className="pt-2 border-t border-[#C59B27]/30">
                    <label className="text-[11px] text-stone-300 block mb-1">
                      UTR / Transaction Reference (Optional - for faster verification):
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="e.g. 423985729183"
                      className="w-full bg-black/50 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#DFB76C]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Price Breakdown Summary & Submit CTA */}
            <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8D5B5] space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Metal & Gemstone Value:</span>
                  <span className="font-semibold text-stone-800">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Making Charges:</span>
                  <span className="font-semibold text-stone-800">{formatINR(makingTotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Privilege Discount ({activeCoupon || 'Offer'}):</span>
                    <span>-{formatINR(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>3% GST (Govt. of India):</span>
                  <span className="font-semibold text-stone-800">{formatINR(gstTotal)}</span>
                </div>
              </div>

              <div className="border-t border-[#C59B27]/40 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-bold">
                    Total Payable:
                  </span>
                  <span className="text-2xl font-bold font-serif-luxury text-[#996515]">
                    {formatINR(grandTotal)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3.5 rounded-xl bg-[#081816] hover:bg-[#122e2a] text-[#DFB76C] font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Reserving Order...</span>
                  ) : (
                    <>
                      <span>Lock Rate & Confirm</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-3 py-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm"
              >
                Back To Main Menu
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
