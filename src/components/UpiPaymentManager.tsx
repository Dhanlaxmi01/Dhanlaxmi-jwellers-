import React, { useState } from 'react';
import { 
  QrCode, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RotateCw, 
  Radio, 
  FileCheck, 
  Smartphone, 
  Building2, 
  ExternalLink,
  History,
  Send
} from 'lucide-react';
import { SiteSettings, UpiWebhookTransaction } from '../types';
import { validatePngFile, sanitizeString } from '../utils/sanitizer';
import { DynamicQRCode } from './DynamicQRCode';

interface UpiPaymentManagerProps {
  settings: SiteSettings;
  onUpdateSettings: (newSettings: Partial<SiteSettings>) => void;
  triggerToast: (msg: string) => void;
}

export const UpiPaymentManager: React.FC<UpiPaymentManagerProps> = ({
  settings,
  onUpdateSettings,
  triggerToast
}) => {
  const [upiId, setUpiId] = useState(settings.upiId || 'dhanlaxmijwellers@upi');
  const [payeeName, setPayeeName] = useState(settings.payeeName || 'Dhanlaxmi Jwellers Haldwani');
  const [merchantCode, setMerchantCode] = useState(settings.upiMerchantCode || '5944');
  const [useCustomQr, setUseCustomQr] = useState(settings.useCustomQr || false);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(settings.customQrUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Webhook Simulator State
  const [webhookLogs, setWebhookLogs] = useState<UpiWebhookTransaction[]>([]);
  const [simBookingNo, setSimBookingNo] = useState('DLX-2026-9182');
  const [simAmount, setSimAmount] = useState('690532');
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);

  // Security Masking State
  const [isDataMasked, setIsDataMasked] = useState(true);

  // Handle File Selection with STRICT PNG validation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError(null);
    if (!file) return;

    // 1. Run frontend binary & magic-bytes PNG validator
    const validation = await validatePngFile(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid PNG file');
      return;
    }

    // 2. Read file to Base64 Data URI
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setUploadedPreview(base64Data);
    };
    reader.readAsDataURL(file);
  };

  // Upload to Backend with Server-Side PNG Magic-Bytes Verification
  const handleSaveQrConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setIsUploading(true);

    try {
      if (useCustomQr && uploadedPreview) {
        const res = await fetch('/api/admin/upload-upi-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data: uploadedPreview,
            filename: 'custom_upi_qr.png',
            upiId: sanitizeString(upiId),
            payeeName: sanitizeString(payeeName)
          })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Server rejected the PNG file');
        }

        onUpdateSettings({
          upiId: sanitizeString(upiId),
          payeeName: sanitizeString(payeeName),
          upiMerchantCode: sanitizeString(merchantCode),
          customQrUrl: uploadedPreview,
          useCustomQr: true
        });

        triggerToast('Dynamic UPI QR Code and Gateway settings updated with validated PNG.');
      } else {
        // Use Dynamic Vector Generator
        onUpdateSettings({
          upiId: sanitizeString(upiId),
          payeeName: sanitizeString(payeeName),
          upiMerchantCode: sanitizeString(merchantCode),
          useCustomQr: false
        });
        triggerToast('Gateway switched to Dynamic NPCI Vector QR generation.');
      }
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save UPI Gateway configuration');
    } finally {
      setIsUploading(false);
    }
  };

  // Test Banking Webhook Handshake Simulation
  const handleSimulateWebhook = async () => {
    setIsSimulatingWebhook(true);
    try {
      const res = await fetch('/api/webhooks/upi-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-upi-signature': 'TEST_SIMULATED_SIGNATURE_2026'
        },
        body: JSON.stringify({
          gatewayTxnId: 'NPCI-UPI-' + Math.floor(1000000000 + Math.random() * 9000000000),
          orderBookingNumber: simBookingNo,
          customerVpa: 'vipclient@okhdfcbank',
          amount: Number(simAmount),
          status: 'SUCCESS',
          bankReferenceNumber: 'RRN' + Math.floor(100000000000 + Math.random() * 900000000000)
        })
      });
      const data = await res.json();
      if (data.transaction) {
        setWebhookLogs(prev => [data.transaction, ...prev]);
        triggerToast(`Banking Webhook Handshake Verified: Order ${simBookingNo} status reconciled to Confirmed.`);
      }
    } catch (err) {
      console.error('Webhook error:', err);
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8D5B5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#C59B27]" />
            <h3 className="font-serif-luxury text-base font-bold text-stone-900">
              UPI Payment Gateway & Dynamic QR Manager
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure merchant VPA, upload tamper-proof PNG QR codes, and monitor real-time banking webhooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>NPCI UPI Core: ACTIVE</span>
          </span>
        </div>
      </div>

      {/* Main Grid: QR Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Strict PNG Upload (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <form onSubmit={handleSaveQrConfig} className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 border-b border-stone-100 pb-2">
              Merchant Gateway Parameters
            </h4>

            {/* VPA ID & Payee Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 relative">
                <label className="text-xs font-semibold text-stone-700">UPI Virtual Payment Address (VPA)</label>
                <input
                  type={isDataMasked ? "password" : "text"}
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="dhanlaxmijwellers@upi"
                  disabled={isDataMasked}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-800 focus:outline-none focus:border-[#C59B27] disabled:bg-stone-200 disabled:text-stone-500"
                />
              </div>

              <div className="space-y-1 relative">
                <label className="text-xs font-semibold text-stone-700">Registered Payee Name</label>
                <input
                  type={isDataMasked ? "password" : "text"}
                  required
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="Dhanlaxmi Jwellers Haldwani"
                  disabled={isDataMasked}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#C59B27] disabled:bg-stone-200 disabled:text-stone-500"
                />
              </div>
            </div>
            
            {/* Opacity Control */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsDataMasked(!isDataMasked)}
                className="text-[11px] font-bold text-[#C59B27] hover:text-[#996515] flex items-center gap-1.5 transition"
              >
                {isDataMasked ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Unlock & Edit Sensitive Data</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mask Configuration</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Merchant Category Code (MCC)</label>
              <input
                type="text"
                value={merchantCode}
                onChange={(e) => setMerchantCode(e.target.value)}
                placeholder="5944 - Fine Jewelry, Watches & Silverware"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-700 focus:outline-none focus:border-[#C59B27]"
              />
            </div>

            {/* Mode Selection */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <span className="text-xs font-bold text-stone-800 block">QR Code Generation Mode</span>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 font-medium">
                  <input
                    type="radio"
                    name="qrMode"
                    checked={!useCustomQr}
                    onChange={() => setUseCustomQr(false)}
                    className="text-[#C59B27] focus:ring-[#C59B27]"
                  />
                  <span>Dynamic Vector SVG (Auto-encodes live order amounts)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 font-medium">
                  <input
                    type="radio"
                    name="qrMode"
                    checked={useCustomQr}
                    onChange={() => setUseCustomQr(true)}
                    className="text-[#C59B27] focus:ring-[#C59B27]"
                  />
                  <span>Upload Static Standee PNG (Custom Showroom Standee)</span>
                </label>
              </div>
            </div>

            {/* Strict PNG Upload Zone (Visible if custom selected) */}
            {useCustomQr && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span>Upload Showroom Standee (.PNG ONLY)</span>
                  </label>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Strict Binary Magic-Bytes Enforced
                  </span>
                </div>

                <div className="border-2 border-dashed border-stone-300 hover:border-[#C59B27] rounded-xl p-4 text-center bg-stone-50/50 transition cursor-pointer">
                  <input
                    type="file"
                    accept=".png,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="upi-png-file-input"
                  />
                  <label htmlFor="upi-png-file-input" className="cursor-pointer block space-y-1.5">
                    <FileCheck className="w-8 h-8 text-[#C59B27] mx-auto" />
                    <span className="text-xs font-bold text-stone-800 block">Click to select Showroom Standee PNG</span>
                    <span className="text-[11px] text-stone-500 block">
                      Strict validation: Only .PNG format with 8-byte PNG signature accepted (Max 2MB).
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Error Message */}
            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>{validationError}</p>
              </div>
            )}

            {/* Save / Rotate Button */}
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#081816] text-[#DFB76C] hover:bg-[#122e2a] hover:text-white transition font-bold text-xs flex items-center justify-center gap-2 border border-[#C59B27]/40 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#DFB76C]" />
                  <span>Save & Rotate Gateway Configuration</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Customer Checkout Preview (5 cols) */}
        <div className="lg:col-span-5 bg-stone-900 text-[#FAF7F2] p-6 rounded-2xl border border-stone-800 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#DFB76C] bg-[#DFB76C]/10 px-2 py-0.5 rounded">
              Customer Checkout View
            </span>
            <h4 className="text-sm font-bold text-white font-serif-luxury">
              {payeeName}
            </h4>
            <p className="text-[11px] font-mono text-stone-400">VPA: {upiId}</p>
          </div>

          {/* QR Display Card */}
          <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-[#DFB76C] inline-block">
            {useCustomQr && uploadedPreview ? (
              <img 
                src={uploadedPreview} 
                alt="Showroom Standee QR" 
                className="w-44 h-44 object-contain rounded-lg"
              />
            ) : (
              <DynamicQRCode
                upiId={upiId}
                payeeName={payeeName}
                amount={50000}
                transactionNote="VIP Booking Advance"
                size={176}
              />
            )}
          </div>

          <div className="text-[11px] text-stone-400 max-w-xs space-y-1">
            <p className="text-white font-medium">Supported UPI Apps:</p>
            <p className="text-[10px] text-stone-500">
              BHIM • Google Pay • PhonePe • Paytm • HDFC PayZapp • CRED
            </p>
          </div>
        </div>

      </div>

      {/* BANKING WEBHOOK VERIFICATION & AUDIT SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C59B27]" />
              <span>Banking Webhook Verification & Order Reconciliation</span>
            </h4>
            <p className="text-xs text-stone-500">
              Simulate and monitor cryptographic HMAC banking callbacks from NPCI / PSP gateways.
            </p>
          </div>
          <span className="text-[11px] font-mono bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200">
            HMAC-SHA256 Secret: Active
          </span>
        </div>

        {/* Simulator Controls */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-stone-700">Order Booking Reference</label>
            <input
              type="text"
              value={simBookingNo}
              onChange={(e) => setSimBookingNo(e.target.value)}
              placeholder="DLX-2026-9182"
              className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold"
            />
          </div>

          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-stone-700">Settled Amount (₹ INR)</label>
            <input
              type="number"
              value={simAmount}
              onChange={(e) => setSimAmount(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold"
            />
          </div>

          <button
            onClick={handleSimulateWebhook}
            disabled={isSimulatingWebhook}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Bank Webhook</span>
          </button>
        </div>

        {/* Webhook Stream Logs */}
        {webhookLogs.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-stone-500" />
              <span>Recent Webhook Transactions ({webhookLogs.length})</span>
            </h5>
            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
              {webhookLogs.map((tx) => (
                <div key={tx.id} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {tx.status}
                    </span>
                    <span className="font-bold text-stone-800">{tx.orderBookingNumber}</span>
                    <span className="text-stone-400">RRN: {tx.bankReferenceNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">₹{tx.amount.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(tx.receivedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
