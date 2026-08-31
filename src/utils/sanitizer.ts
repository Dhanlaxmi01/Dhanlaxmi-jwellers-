/**
 * Input sanitization, SQL/XSS prevention, and binary PNG file validation
 */

// HTML & XSS Sanitizer
export function sanitizeString(input: string | undefined | null): string {
  if (!input) return '';
  return String(input)
    .trim()
    .replace(/[<>]/g, '') // Strip angle brackets
    .replace(/javascript:/gi, '') // Remove javascript pseudo-protocol
    .replace(/on\w+=/gi, '') // Remove inline event handlers like onerror=, onclick=
    .replace(/['"\\]/g, (char) => {
      // Escape dangerous quotes and slashes
      switch (char) {
        case "'": return '&#39;';
        case '"': return '&quot;';
        case '\\': return '&#92;';
        default: return char;
      }
    });
}

// Deep object sanitization
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }
  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeString(key)] = sanitizeObject(value);
    }
    return sanitized as T;
  }
  return obj;
}

// Validate PNG magic bytes on frontend
export async function validatePngFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // 1. Validate file extension
  if (!file.name.toLowerCase().endsWith('.png')) {
    return { valid: false, error: 'Only .PNG image files are permitted. File extension must be .png.' };
  }

  // 2. Validate MIME type
  if (file.type !== 'image/png') {
    return { valid: false, error: `Invalid MIME type (${file.type}). Only image/png is accepted.` };
  }

  // 3. Validate file size (Max 2MB)
  const maxBytes = 2 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: 'File size exceeds maximum limit of 2MB.' };
  }

  // 4. Validate binary magic bytes signature: 89 50 4E 47 0D 0A 1A 0A
  try {
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    
    for (let i = 0; i < 8; i++) {
      if (bytes[i] !== pngSignature[i]) {
        return { 
          valid: false, 
          error: 'Corrupted or spoofed PNG file. File header signature does not match standard PNG binary format.' 
        };
      }
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: 'Failed to parse image binary stream.' };
  }
}
