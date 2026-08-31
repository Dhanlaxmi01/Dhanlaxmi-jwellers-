import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Sparkles, ShieldCheck, Crown, IndianRupee, QrCode as QrIcon } from 'lucide-react';
import { generateUPIString } from '../utils/qrCode';

interface DynamicQRCodeProps {
  upiId: string;
  payeeName: string;
  amount: number;
  bookingNumber?: string;
  transactionNote?: string;
  customQrUrl?: string;
  useCustomQr?: boolean;
  size?: number;
}

export const DynamicQRCode: React.FC<DynamicQRCodeProps> = ({
  upiId,
  payeeName,
  amount,
  bookingNumber = 'DLX-SAMPLE',
  transactionNote,
  customQrUrl,
  useCustomQr = false,
  size = 220,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const finalTransactionNote = transactionNote || `Booking ${bookingNumber} - Dhanlaxmi Jwellers`;
  const upiString = generateUPIString({
    upiId,
    payeeName,
    amount,
    transactionNote: finalTransactionNote,
  });

  useEffect(() => {
    if (useCustomQr && customQrUrl) {
      setDataUrl(customQrUrl);
      return;
    }

    QRCode.toDataURL(upiString, {
      width: size * 2, // Retinal high density
      margin: 2,
      color: {
        dark: '#081816',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setDataUrl(url);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to generate UPI QR code', err);
        setError('QR Code generation failed');
      });
  }, [upiString, size, useCustomQr, customQrUrl]);

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border-2 border-[#C59B27]/40 shadow-md relative">
      {/* Top Banner Tag */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#996515] font-bold mb-2">
        <Crown className="w-3 h-3 text-[#C59B27]" />
        <span>INSTANT UPI SCAN & PAY</span>
      </div>

      {/* QR Code Container with Central Rupee Badge */}
      <div className="relative p-2 bg-white rounded-xl border border-stone-200 shadow-inner flex items-center justify-center">
        {dataUrl ? (
          <div className="relative">
            <img
              src={dataUrl}
              alt="UPI Payment QR Code"
              style={{ width: size, height: size }}
              className="rounded-lg object-contain"
            />
            {/* Center Brand Badge Overlay */}
            {!useCustomQr && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-9 h-9 rounded-full bg-[#081816] border-2 border-[#C59B27] flex items-center justify-center shadow-lg">
                  <span className="font-serif-luxury font-bold text-[#DFB76C] text-xs">DJ</span>
                </div>
              </div>
            )}
          </div>
        ) : error ? (
          <div 
            style={{ width: size, height: size }}
            className="flex flex-col items-center justify-center text-center p-4 text-xs text-rose-600 bg-rose-50 rounded-lg"
          >
            <QrIcon className="w-8 h-8 text-rose-400 mb-1" />
            <span>{error}</span>
          </div>
        ) : (
          <div 
            style={{ width: size, height: size }}
            className="flex items-center justify-center text-xs text-stone-400 bg-stone-50 rounded-lg animate-pulse"
          >
            Generating UPI QR...
          </div>
        )}
      </div>

      {/* Amount and Verified Badging */}
      <div className="mt-2 text-center">
        <div className="text-xs text-stone-600 font-medium">
          Pay exact: <strong className="text-stone-900 font-bold text-sm">₹{amount.toLocaleString('en-IN')}</strong>
        </div>
        <div className="text-[10px] text-stone-500 font-mono mt-0.5">
          VPA: <span className="font-semibold text-stone-800">{upiId}</span>
        </div>
        <div className="inline-flex items-center gap-1 text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1 font-medium">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>NPCI & RBI Compliant Real-Time QR</span>
        </div>
      </div>
    </div>
  );
};
