import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Share2 
} from 'lucide-react';

interface JSONPayloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  payload: any;
  filename?: string;
}

export const JSONPayloadModal: React.FC<JSONPayloadModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  payload,
  filename = 'dhanlaxmi-product-payload.json',
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const formattedJson = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const payloadSize = new Blob([formattedJson]).size;

  return (
    <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        className="bg-[#081816] text-[#E8D5B5] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-[#C59B27] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#C59B27]/40 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C59B27]/20 border border-[#C59B27]/50 flex items-center justify-center text-[#DFB76C]">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-white tracking-wide">
                  {title}
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>STRUCTURED & VALIDATED</span>
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {subtitle || 'Structured JSON payload ready for live app sync and REST/GraphQL API delivery.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payload Meta Stats Bar */}
        <div className="bg-black/60 px-4 py-2 border-b border-stone-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4 text-stone-400">
            <span>Format: <strong className="text-emerald-400">RFC 8259 JSON</strong></span>
            <span>Size: <strong className="text-[#DFB76C]">{payloadSize} bytes</strong></span>
            <span>Schema: <strong className="text-stone-300">Dhanlaxmi.JewelryProduct</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-[#C59B27]/20 hover:bg-[#C59B27]/30 text-[#DFB76C] border border-[#C59B27]/40'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON Payload</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 border border-stone-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .json</span>
            </button>
          </div>
        </div>

        {/* JSON Code Viewer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#030B0A] font-mono text-xs text-stone-200">
          <pre className="whitespace-pre-wrap break-words leading-relaxed text-emerald-300">
            {formattedJson}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-black/40 border-t border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Sparkles className="w-4 h-4 text-[#DFB76C]" />
            <span>This product is now live across the storefront, rates calculator, and search indexing.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#061715] font-bold text-xs uppercase tracking-wider hover:brightness-110 transition cursor-pointer"
          >
            Done & Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
