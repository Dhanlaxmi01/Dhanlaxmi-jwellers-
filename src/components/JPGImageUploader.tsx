import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles, 
  HardDrive, 
  Eye, 
  RefreshCw,
  Star,
  FileCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { 
  compressJpgImage, 
  formatBytes, 
  validateIsJpg,
  CompressionResult 
} from '../utils/imageCompressor';

interface JPGImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  onToast?: (message: string) => void;
}

export const JPGImageUploader: React.FC<JPGImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 6,
  onToast
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCompression, setLastCompression] = useState<CompressionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewZoomUrl, setPreviewZoomUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) {
        await processAndUploadFile(file);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await processAndUploadFile(files[0]);
    }
    // reset input so the same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processAndUploadFile = async (file: File) => {
    setErrorMessage(null);
    setLastCompression(null);

    // 1. Strict format check
    const formatValidation = validateIsJpg(file);
    if (!formatValidation.isValid) {
      setErrorMessage(formatValidation.error || 'Only .jpg and .jpeg files are accepted.');
      if (onToast) onToast('Upload rejected: Strictly .jpg/.jpeg formats permitted.');
      return;
    }

    if (images.length >= maxImages) {
      setErrorMessage(`Maximum capacity of ${maxImages} images reached for this jewelry item.`);
      return;
    }

    setIsProcessing(true);

    try {
      // 2. Client-Side High-Performance JPEG Compression
      const result = await compressJpgImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.85,
        maxFileSizeKB: 350
      });

      if (!result.success || !result.base64) {
        throw new Error(result.error || 'Failed to compress JPEG image');
      }

      setLastCompression(result);

      // 3. Upload to server cloud storage endpoint
      const response不易 = await fetch('/api/admin/upload-product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: result.base64,
          filename: result.filename,
          originalSize: result.originalSizeBytes,
          compressedSize: result.compressedSizeBytes
        })
      });

      let finalImageUrl = result.base64; // fallback to high-quality base64

      if (response不易.ok) {
        const uploadData = await response不易.json();
        if (uploadData.url) {
          finalImageUrl = uploadData.url;
        }
      }

      // 4. Attach to product payload
      const updatedImages = [...images, finalImageUrl];
      onImagesChange(updatedImages);

      if (onToast) {
        onToast(`Compressed (${result.reductionPercentage}% saved) & attached: ${result.filename}`);
      }
    } catch (err: any) {
      console.error('Error during image compression/upload:', err);
      setErrorMessage(err.message || 'Error processing image file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    onImagesChange([selected, ...rest]);
    if (onToast) onToast('Primary catalog cover image updated.');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, i) => i !== indexToRemove);
    onImagesChange(updated);
    if (onToast) onToast('Image removed from product payload.');
  };

  return (
    <div className="space-y-4" id="jpg-image-uploader-module">
      {/* Upload Header & Constraints */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#DFB76C]/10 border border-[#DFB76C]/30 flex items-center justify-center text-[#DFB76C]">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
              <span>Secure JPG Image Upload Module</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
                .JPG / .JPEG ONLY
              </span>
            </h4>
            <p className="text-[11px] text-stone-400">
              Automatic client-side canvas compression & cloud CDN payload optimization.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-stone-400">
          {images.length}/{maxImages} Attached
        </span>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden ${
          isDragging
            ? 'border-[#DFB76C] bg-[#DFB76C]/10 scale-[1.01]'
            : 'border-stone-700/80 hover:border-[#DFB76C]/60 bg-stone-900/40 hover:bg-stone-900/70'
        } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,image/jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isProcessing ? (
          <div className="py-4 flex flex-col items-center space-y-3">
            <div className="relative">
              <RefreshCw className="w-8 h-8 text-[#DFB76C] animate-spin" />
              <Zap className="w-3.5 h-3.5 text-[#DFB76C] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#DFB76C] tracking-wide">
                Compressing & Securing JPEG Stream...
              </p>
              <p className="text-[11px] text-stone-400 font-mono">
                Preserving 22K/Diamond brilliance • Optimizing payload size
              </p>
            </div>
          </div>
        ) : (
          <div className="py-2 flex flex-col items-center space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-[#081816] border border-[#DFB76C]/40 flex items-center justify-center text-[#DFB76C] shadow-lg shadow-black/40">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-stone-200">
                <span className="text-[#DFB76C] font-semibold">Click to browse</span> or drag high-res jewelry photos here
              </p>
              <p className="text-[10px] text-stone-500 font-mono">
                Strictly .jpg, .jpeg • Max 1600px auto-rescaling • Target &lt;350KB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Format Validation Rejected</p>
            <p className="text-[11px] text-red-400">{errorMessage}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setErrorMessage(null)} 
            className="text-red-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Live Compression Metric Badge */}
      {lastCompression && lastCompression.success && (
        <div className="p-3 rounded-xl bg-[#081816]/90 border border-[#DFB76C]/30 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#DFB76C] font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Client-Side Compression Matrix</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" />
              <span>{lastCompression.reductionPercentage}% Smaller</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-800/80 text-[11px] font-mono">
            <div className="p-1.5 rounded bg-black/40">
              <span className="text-stone-500 block text-[9px] uppercase">Raw Input</span>
              <span className="text-stone-300 font-bold">{formatBytes(lastCompression.originalSizeBytes)}</span>
            </div>
            <div className="p-1.5 rounded bg-black/40">
              <span className="text-stone-500 block text-[9px] uppercase">Optimized JPG</span>
              <span className="text-emerald-400 font-bold">{formatBytes(lastCompression.compressedSizeBytes)}</span>
            </div>
            <div className="p-1.5 rounded bg-black/40">
              <span className="text-stone-500 block text-[9px] uppercase">Dimensions</span>
              <span className="text-stone-300 font-bold">{lastCompression.compressedWidth}×{lastCompression.compressedHeight}</span>
            </div>
          </div>
        </div>
      )}

      {/* Attached Images Gallery & Cover Selector */}
      {images.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
            <span>Attached Product Images ({images.length})</span>
            <span className="text-[10px] text-stone-500">First image is used as primary catalog cover</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {images.map((imgUrl, index) => (
              <div
                key={index}
                className={`relative group rounded-xl overflow-hidden aspect-square border ${
                  index === 0 ? 'border-[#DFB76C] ring-2 ring-[#DFB76C]/30' : 'border-stone-800'
                } bg-black/60 shadow-md`}
              >
                <img
                  src={imgUrl}
                  alt={`Product view ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Primary Cover Badge */}
                {index === 0 && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#DFB76C] text-black text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 shadow">
                    <Star className="w-2.5 h-2.5 fill-black" />
                    <span>Cover</span>
                  </div>
                )}

                {/* Hover Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewZoomUrl(imgUrl);
                    }}
                    className="p-1 rounded bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-700 transition"
                    title="Zoom View"
                  >
                    <Eye className="w-3 h-3" />
                  </button>

                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(index);
                      }}
                      className="px-1.5 py-0.5 rounded bg-[#DFB76C] text-black text-[9px] font-semibold hover:bg-[#C59B27] transition"
                      title="Set as primary cover"
                    >
                      Make Cover
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    className="p-1 rounded bg-red-900/80 text-red-200 hover:bg-red-800 transition"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Zoom Preview */}
      {previewZoomUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewZoomUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden border border-[#DFB76C]/40 bg-stone-900 p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewZoomUrl}
              alt="High resolution jewelry preview"
              className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
            />
            <div className="mt-2 flex items-center justify-between px-2 text-xs">
              <span className="text-stone-400 font-mono">High-Fidelity Master JPG View</span>
              <button
                type="button"
                onClick={() => setPreviewZoomUrl(null)}
                className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
