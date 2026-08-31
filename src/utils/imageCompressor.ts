/**
 * Luxury Jewelry JPG Image Compression & Validation Utility
 * Strictly enforces high-performance .jpg / .jpeg processing with client-side canvas downscaling.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSizeKB?: number;
}

export interface CompressionResult {
  success: boolean;
  file?: File;
  blob?: Blob;
  base64: string;
  filename: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  reductionPercentage: number;
  originalWidth: number;
  originalHeight: number;
  compressedWidth: number;
  compressedHeight: number;
  mimeType: 'image/jpeg';
  error?: string;
}

/**
 * Validates whether the given file is strictly a .jpg or .jpeg file.
 */
export function validateIsJpg(file: File): { isValid: boolean; error?: string } {
  const fileName = file.name.toLowerCase();
  const hasJpgExtension = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');
  const isJpgMime = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/pjpeg';

  if (!hasJpgExtension && !isJpgMime) {
    return {
      isValid: false,
      error: `Invalid file format "${file.name}". Dhanlaxmi Jewellers requires high-resolution .JPG or .JPEG format for catalog images.`
    };
  }

  return { isValid: true };
}

/**
 * Checks the magic bytes of a file buffer to verify true JPEG binary header (0xFF, 0xD8, 0xFF)
 */
export async function verifyJpegMagicBytes(file: File): Promise<boolean> {
  try {
    const slice = file.slice(0, 3);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    return bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
  } catch {
    return true; // Fallback to MIME check if arrayBuffer is constrained
  }
}

/**
 * Compresses and formats a .jpg/.jpeg image on the client side before uploading to cloud storage.
 */
export async function compressJpgImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.85,
    maxFileSizeKB = 350
  } = options;

  // 1. Strict format check
  const formatCheck = validateIsJpg(file);
  if (!formatCheck.isValid) {
    return {
      success: false,
      base64: '',
      filename: file.name,
      originalSizeBytes: file.size,
      compressedSizeBytes: file.size,
      reductionPercentage: 0,
      originalWidth: 0,
      originalHeight: 0,
      compressedWidth: 0,
      compressedHeight: 0,
      mimeType: 'image/jpeg',
      error: formatCheck.error
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onerror = () => {
      resolve({
        success: false,
        base64: '',
        filename: file.name,
        originalSizeBytes: file.size,
        compressedSizeBytes: file.size,
        reductionPercentage: 0,
        originalWidth: 0,
        originalHeight: 0,
        compressedWidth: 0,
        compressedHeight: 0,
        mimeType: 'image/jpeg',
        error: 'Failed to read image file'
      });
    };

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        resolve({
          success: false,
          base64: '',
          filename: file.name,
          originalSizeBytes: file.size,
          compressedSizeBytes: file.size,
          reductionPercentage: 0,
          originalWidth: 0,
          originalHeight: 0,
          compressedWidth: 0,
          compressedHeight: 0,
          mimeType: 'image/jpeg',
          error: 'Image data corrupted or invalid'
        });
      };

      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Calculate aspect-ratio preserved dimensions
        let targetWidth = originalWidth;
        let targetHeight = originalHeight;

        if (targetWidth > maxWidth || targetHeight > maxHeight) {
          const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);
        }

        // Render to canvas with smooth filtering
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            success: false,
            base64: '',
            filename: file.name,
            originalSizeBytes: file.size,
            compressedSizeBytes: file.size,
            reductionPercentage: 0,
            originalWidth,
            originalHeight,
            compressedWidth: targetWidth,
            compressedHeight: targetHeight,
            mimeType: 'image/jpeg',
            error: 'Canvas 2D context unavailable'
          });
          return;
        }

        // Set white background (prevents black background if source had transparency or color artifacts)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Iterative compression to satisfy target maxFileSizeKB
        let currentQuality = quality;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        
        // Approximate bytes from base64 length
        let estimatedBytes = Math.round((compressedDataUrl.length - 23) * 0.75);

        if (estimatedBytes > maxFileSizeKB * 1024 && currentQuality > 0.6) {
          currentQuality = 0.72;
          compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
          estimatedBytes = Math.round((compressedDataUrl.length - 23) * 0.75);
        }

        if (estimatedBytes > maxFileSizeKB * 1024 && currentQuality > 0.5) {
          currentQuality = 0.58;
          compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
          estimatedBytes = Math.round((compressedDataUrl.length - 23) * 0.75);
        }

        // Create compressed blob & file object
        canvas.toBlob((blob) => {
          const finalBlob = blob || new Blob([], { type: 'image/jpeg' });
          const compressedSizeBytes = finalBlob.size || estimatedBytes;
          const reductionPercentage = Math.max(
            0,
            Math.round(((file.size - compressedSizeBytes) / file.size) * 100)
          );

          const safeFileName = file.name.replace(/\.[^/.]+$/, "") + '.jpg';
          const compressedFile = new File([finalBlob], safeFileName, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          resolve({
            success: true,
            file: compressedFile,
            blob: finalBlob,
            base64: compressedDataUrl,
            filename: safeFileName,
            originalSizeBytes: file.size,
            compressedSizeBytes,
            reductionPercentage,
            originalWidth,
            originalHeight,
            compressedWidth: targetWidth,
            compressedHeight: targetHeight,
            mimeType: 'image/jpeg'
          });
        }, 'image/jpeg', currentQuality);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to readable size
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
