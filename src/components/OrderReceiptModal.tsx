import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Share2, 
  Crown, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Sparkles,
  Calendar,
  IndianRupee,
  QrCode as QrIcon,
  MessageCircle,
  FileCheck
} from 'lucide-react';
import { OrderInquiry, SiteSettings, LiveRates } from '../types';
import { formatINR } from '../utils/pricing';
import { numberToWordsINR } from '../utils/numberToWords';
import { downloadReceiptPDF, generateShowroomQRDataUrl } from '../utils/pdfGenerator';

interface OrderReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderInquiry | null;
  settings: SiteSettings;
  rates: LiveRates;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  settings,
  rates,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (order && isOpen) {
      const showroomLocationQuery = `${settings.brandName}, ${settings.storeAddress}`;
      generateShowroomQRDataUrl(showroomLocationQuery).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [order, isOpen, settings]);

  if (!isOpen || !order) return null;

  const invoiceNumber = `INV-DJ-2026-${order.bookingNumber.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const fileName = `Dhanlaxmi_Jwellers_Invoice_${order.bookingNumber}.pdf`;
      await downloadReceiptPDF(receiptRef.current, fileName);
    } catch (e) {
      console.error('Failed to generate PDF', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const cleanPhone = order.phone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const itemsSummary = order.items.map((it, idx) => `${idx + 1}. ${it.product.name} (${it.product.purity}) - ${formatINR(it.breakdown?.totalPrice || 0)}`).join('%0A');
    
    const message = `👑 *DHANLAXMI JWELLERS - TAX INVOICE & ORDER RECEIPT*%0A%0A` +
      `*Invoice No:* ${invoiceNumber}%0A` +
      `*Booking Ref:* ${order.bookingNumber}%0A` +
      `*Customer:* ${order.customerName}%0A` +
      `*Date:* ${orderDate}%0A%0A` +
      `*Items Ordered:*%0A${itemsSummary}%0A%0A` +
      `*Grand Total:* ${formatINR(order.grandTotal)} (Paid/Confirmed)%0A` +
      `*Delivery/Pickup:* ${order.deliveryMethod}%0A%0A` +
      `📍 *Showroom Address:* ${settings.storeAddress}%0A` +
      `📞 *Helpline:* ${settings.storePhone}%0A%0A` +
      `_Thank you for choosing Dhanlaxmi Jwellers! Guaranteed 100% BIS Hallmarked Purity._`;

    window.open(`https://wa.me/${phoneWithCode}?text=${message}`, '_blank');
  };

  // Calculations
  const totalPureGoldWeight = order.items.reduce((acc, it) => acc + (it.product.netGoldWeight || it.product.grossWeight) * it.quantity, 0);
  const totalGrossWeight = order.items.reduce((acc, it) => acc + it.product.grossWeight * it.quantity, 0);
  const totalGoldValue = order.items.reduce((acc, it) => acc + (it.breakdown?.goldValue || 0) * it.quantity, 0);
  const totalMakingCharges = order.items.reduce((acc, it) => acc + (it.breakdown?.makingCharges || 0) * it.quantity, 0);
  const totalDiamondGemValue = order.items.reduce((acc, it) => acc + ((it.breakdown?.diamondValue || 0) + (it.breakdown?.gemstoneValue || 0)) * it.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-2xl shadow-2xl border-2 border-[#C59B27]/40 flex flex-col my-auto max-h-[92vh] overflow-hidden">
        
        {/* Modal Top Control Bar (Non-printing) */}
        <div className="print:hidden bg-[#081816] text-[#E8D5B5] px-4 py-3 sm:px-6 flex items-center justify-between border-b border-[#C59B27]/40">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#DFB76C]" />
            <span className="font-serif-luxury font-bold text-sm sm:text-base text-white tracking-wide">
              Official Tax Invoice & Showroom Receipt
            </span>
            <span className="bg-[#C59B27]/30 text-[#DFB76C] text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-[#C59B27]/40">
              {order.status}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-3 py-1.5 rounded-lg bg-[#DFB76C] text-[#081816] hover:bg-[#c59b27] transition font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              title="Download PDF Receipt"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#0E2A26] text-[#E8D5B5] hover:bg-[#153e38] transition font-bold text-xs flex items-center gap-1.5 border border-[#C59B27]/40 cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              title="Share Receipt on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-100 transition font-bold text-xs flex items-center gap-1.5 cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Back To Menu</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Receipt Content */}
        <div className="overflow-y-auto p-3 sm:p-8 bg-[#FAF7F2] text-stone-900 font-sans-modern">
          
          {/* Printable Container targeted for PDF capture */}
          <div 
            ref={receiptRef}
            id="order-tax-receipt"
            className="bg-white p-6 sm:p-10 rounded-xl border border-[#E8D5B5] shadow-xs text-stone-800 relative space-y-6 max-w-[800px] mx-auto"
            style={{ minHeight: '1000px' }}
          >
            {/* Top Ornamental Border */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#DFB76C] via-[#996515] to-[#DFB76C] rounded-full"></div>

            {/* 1. COMPANY HEADER & REGAL BRAND IDENTITY */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-[#E8D5B5]/60 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#081816] flex items-center justify-center border border-[#C59B27]">
                    <Crown className="w-4 h-4 text-[#DFB76C]" />
                  </div>
                  <h1 className="font-serif-luxury text-2xl sm:text-3xl font-black text-[#081816] tracking-wider uppercase">
                    {settings.brandName || 'DHANLAXMI JWELLERS'}
                  </h1>
                </div>
                <p className="text-xs font-serif-luxury italic text-[#996515] font-medium tracking-wide">
                  Purveyors of Regal 22K/24K Gold, Solitaire Diamonds & Heritage Bridal Jewellery
                </p>
                <div className="text-[11px] text-stone-600 space-y-0.5 pt-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                    <span>{settings.storeAddress || 'Nanda Vihar, Nainital Road, Haldwani, Uttarakhand - 263139'}</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#C59B27]" />
                      <span>{settings.storePhone || '+91 7668037278'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#C59B27]" />
                      <span>{settings.storeEmail || 'contact@dhanlaxmijwellers.com'}</span>
                    </span>
                  </p>
                </div>
              </div>

              {/* Tax & Certification Badge */}
              <div className="sm:text-right space-y-1 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8D5B5] sm:min-w-[210px]">
                <div className="inline-block bg-[#081816] text-[#DFB76C] text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded tracking-widest">
                  TAX INVOICE & RECEIPT
                </div>
                <div className="text-[11px] font-mono text-stone-700">
                  <strong>GSTIN:</strong> 05AABFD7890K1Z9
                </div>
                <div className="text-[11px] text-stone-600">
                  <strong>State Code:</strong> 05 (Uttarakhand)
                </div>
                <div className="text-[10px] text-[#996515] font-semibold flex items-center sm:justify-end gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  <span>BIS Reg: HM/L-8400199292</span>
                </div>
              </div>
            </div>

            {/* 2. INVOICE META & CUSTOMER DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50/80 p-4 rounded-xl border border-stone-200">
              {/* Left: Invoice Coordinates */}
              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-stone-200 pb-1">
                  <span className="text-stone-500 font-medium">Invoice Number:</span>
                  <span className="font-mono font-bold text-stone-900">{invoiceNumber}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-1">
                  <span className="text-stone-500 font-medium">Booking Reference:</span>
                  <span className="font-mono font-bold text-[#996515]">{order.bookingNumber}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-1">
                  <span className="text-stone-500 font-medium">Date & Time:</span>
                  <span className="font-mono text-stone-800">{orderDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Payment Preference:</span>
                  <span className="font-semibold text-emerald-800">{order.paymentPreference}</span>
                </div>
              </div>

              {/* Right: Customer Billed To */}
              <div className="space-y-1.5 sm:border-l sm:border-stone-200 sm:pl-4">
                <div className="flex justify-between border-b border-stone-200 pb-1">
                  <span className="text-stone-500 font-medium">Billed To (Customer):</span>
                  <span className="font-bold text-stone-900">{order.customerName}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-1">
                  <span className="text-stone-500 font-medium">Mobile Contact:</span>
                  <span className="font-mono text-stone-800">{order.phone}</span>
                </div>
                {order.email && (
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span className="text-stone-500 font-medium">Email Address:</span>
                    <span className="font-mono text-stone-800">{order.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Delivery Mode:</span>
                  <span className="font-semibold text-[#081816]">{order.deliveryMethod}</span>
                </div>
              </div>
            </div>

            {/* 3. ORDER ITEMS & TECHNICAL SPECIFICATION TABLE */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold font-serif-luxury uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Jewellery Specifications & Valuation (HSN Code: 7113)</span>
              </h3>

              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#081816] text-[#E8D5B5] text-[11px] font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">Purity</th>
                      <th className="py-2.5 px-3 text-right">Gross / Net (g)</th>
                      <th className="py-2.5 px-3 text-right">Gold Rate (₹/g)</th>
                      <th className="py-2.5 px-3 text-right">Making Chg</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-700">
                    {order.items.map((item, idx) => {
                      const netWeight = item.product.netGoldWeight || item.product.grossWeight;
                      const ratePerGram = item.breakdown?.ratePerGramApplied || 
                        (item.product.purity === '24K' ? rates.gold24k / 10 : rates.gold22k / 10);
                      const makingPct = item.product.makingChargePercent || rates.defaultMakingChargePercent || 14;

                      return (
                        <tr key={item.id || idx} className="hover:bg-stone-50/60 transition">
                          <td className="py-3 px-3 font-mono text-stone-500 font-medium">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-stone-900 text-xs">{item.product.name}</div>
                            <div className="text-[10px] text-stone-500 font-mono">
                              SKU: {item.product.sku} {item.selectedSize ? `• Size: ${item.selectedSize}` : ''}
                            </div>
                            {item.product.certification && (
                              <div className="text-[9px] text-emerald-800 font-medium flex items-center gap-1 mt-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>{item.product.certification}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-block bg-[#FAF7F2] text-[#996515] border border-[#E8D5B5] px-1.5 py-0.5 rounded font-bold text-[10px]">
                              {item.product.purity}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            <div>{item.product.grossWeight.toFixed(2)}g</div>
                            <div className="text-[10px] text-stone-500">Net: {netWeight.toFixed(2)}g</div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-stone-800">
                            ₹{Math.round(ratePerGram).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            <div>{makingPct}%</div>
                            <div className="text-[10px] text-stone-500">
                              {formatINR(item.breakdown?.makingCharges || 0)}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                            {formatINR(item.breakdown?.totalPrice || 0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. TOTALS & PRICING BREAKDOWN (2-COLUMN GRID) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
              
              {/* Left Column: Hallmarking Details & Terms */}
              <div className="sm:col-span-7 space-y-3">
                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8D5B5] space-y-2 text-[11px] text-stone-600">
                  <h4 className="font-bold text-[#081816] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>BIS 916 Hallmark & 100% Purity Authenticity</span>
                  </h4>
                  <p className="leading-relaxed">
                    Every Dhanlaxmi jewellery article is tested at an authorized NABL / BIS Assaying centre and marked with the official 6-digit Hallmark Unique Identification (HUID).
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 font-mono text-stone-700">
                    <div>• Total Gross Wt: <strong>{totalGrossWeight.toFixed(2)} g</strong></div>
                    <div>• Total Net Gold: <strong>{totalPureGoldWeight.toFixed(2)} g</strong></div>
                  </div>
                </div>

                {/* Amount in Words */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  <span className="text-stone-500 font-medium block text-[10px] uppercase tracking-wider">Amount in Words:</span>
                  <span className="font-serif-luxury font-bold text-[#081816] text-xs">
                    {numberToWordsINR(order.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Right Column: Price Calculation Ledger */}
              <div className="sm:col-span-5 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs space-y-2">
                <div className="flex justify-between text-stone-600">
                  <span>Base Gold / Metal Value:</span>
                  <span className="font-mono font-medium">{formatINR(totalGoldValue || order.subtotal)}</span>
                </div>

                {totalDiamondGemValue > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Diamonds / Gemstones:</span>
                    <span className="font-mono font-medium">{formatINR(totalDiamondGemValue)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Crafting & Making Charges:</span>
                  <span className="font-mono font-medium">{formatINR(totalMakingCharges || order.makingCharges)}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-rose-700 font-medium">
                    <span>Discount {order.couponApplied ? `(${order.couponApplied})` : ''}:</span>
                    <span className="font-mono">- {formatINR(order.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600 pt-1 border-t border-stone-200">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono font-semibold">{formatINR(order.subtotal)}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>GST (3% - HSN 7113):</span>
                  <span className="font-mono font-medium">{formatINR(order.gst)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t-2 border-[#C59B27] text-stone-900">
                  <span className="font-serif-luxury font-bold text-sm uppercase">Grand Total:</span>
                  <span className="font-serif-luxury font-black text-base text-[#996515]">
                    {formatINR(order.grandTotal)}
                  </span>
                </div>

                <div className="text-[10px] text-center text-emerald-800 bg-emerald-50 py-1 rounded border border-emerald-200 font-medium">
                  ✓ Rate-Protected Reservation Locked
                </div>
              </div>
            </div>

            {/* 5. SHOWROOM GPS QR CODE & VERIFICATION FOOTER */}
            <div className="pt-4 border-t-2 border-[#E8D5B5]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              
              {/* Showroom Directions QR */}
              <div className="flex items-center gap-3 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8D5B5]">
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="Showroom GPS Location QR" 
                    className="w-16 h-16 rounded-lg border border-stone-300 object-contain bg-white"
                  />
                ) : (
                  <div className="w-16 h-16 bg-stone-200 rounded-lg flex items-center justify-center">
                    <QrIcon className="w-6 h-6 text-stone-400" />
                  </div>
                )}
                <div className="space-y-0.5">
                  <div className="font-bold text-stone-900 text-[11px] uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#C59B27]" />
                    <span>Showroom Navigation QR</span>
                  </div>
                  <p className="text-[10px] text-stone-600 max-w-[200px]">
                    Scan to navigate directly to Dhanlaxmi Haldwani Showroom on Google Maps.
                  </p>
                  <p className="text-[9px] text-[#996515] font-semibold">
                    Timings: {settings.showroomTimings || '10:30 AM - 08:30 PM (Mon-Sun)'}
                  </p>
                </div>
              </div>

              {/* Authorized Signatory Stamp & Signature */}
              <div className="text-center sm:text-right space-y-1 min-w-[220px]">
                <div className="font-serif-luxury font-bold text-stone-900 text-xs uppercase tracking-wider">
                  For {settings.brandName || 'DHANLAXMI JWELLERS'}
                </div>
                <div className="h-10 flex items-center justify-center sm:justify-end">
                  <div className="border border-dashed border-[#C59B27]/60 px-3 py-1 rounded bg-stone-50 text-[10px] font-mono text-[#996515] italic">
                    [ Digitally Verified & Signed ]
                  </div>
                </div>
                <div className="text-[10px] text-stone-500 font-medium border-t border-stone-200 pt-1">
                  Authorized Signatory & Seal
                </div>
              </div>

            </div>

            {/* Bottom Disclaimer & Terms */}
            <div className="text-[9px] text-stone-400 text-center border-t border-stone-100 pt-3 space-y-0.5">
              <p>
                * This is a computer-generated tax invoice and booking agreement. 100% Exchange guarantee on prevailing gold rates as per Dhanlaxmi policy.
              </p>
              <p>
                Dhanlaxmi Jwellers • Nanda Vihar, Haldwani, Uttarakhand • BIS 916 Hallmark Certified Jewellery
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
