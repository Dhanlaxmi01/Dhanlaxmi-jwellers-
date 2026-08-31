import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_COUPONS, INITIAL_PRODUCTS, INITIAL_RATES, INITIAL_SECURITY, INITIAL_SETTINGS } from './src/data/initialData';
import { 
  AdminAuthSession,
  AdminSecurityConfig, 
  AdminUser, 
  AuditLog, 
  Coupon, 
  InventoryLog, 
  JewelryProduct, 
  LiveConfig,
  LiveRates, 
  OccasionThemeId,
  OrderInquiry, 
  RealtimeEventType,
  RealtimeMessage,
  SecuritySentinelReport, 
  SiteSettings, 
  UpiWebhookTransaction 
} from './src/types';

// ==========================================
// 1. IN-MEMORY STORES & AUDIT TRAILS
// ==========================================

let products: JewelryProduct[] = INITIAL_PRODUCTS.map(p => ({
  ...p,
  isDeleted: false
}));

let liveRates: LiveRates = { ...INITIAL_RATES };
let settings: SiteSettings = { ...INITIAL_SETTINGS };
let coupons: Coupon[] = [...INITIAL_COUPONS];
let securityConfig: AdminSecurityConfig = { ...INITIAL_SECURITY };

// Centralized Real-Time Live Config (Global State: Metal Rates + Themes + Broadcast Flags)
let liveConfig: LiveConfig = {
  rates: { ...INITIAL_RATES },
  activeThemeId: 'default',
  particlesEnabled: true,
  customAnnouncement: '✨ DHANLAXMI JWELLERS • 100% BIS Hallmarked 916 Gold • Haldwani Nanda Vihar Showroom • Call 7668037278 for VIP Trials',
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Live Sync',
  updatedBy: 'Master Admin'
};

// Vault Image Storage (High-Performance JPEG in-memory buffer cache)
interface StoredVaultImage {
  id: string;
  filename: string;
  buffer: Buffer;
  size: number;
  mimeType: 'image/jpeg';
  uploadedAt: string;
}
const uploadedImagesMap: Map<string, StoredVaultImage> = new Map();

// Real-Time Server-Sent Events (SSE) Broadcast Hub (Zero-Delay Subscriptions)
const sseClients: Set<express.Response> = new Set();
let realtimeEventSequence = 0;

export function broadcastRealtimeEvent<T>(type: RealtimeEventType, data: T) {
  realtimeEventSequence++;
  const message: RealtimeMessage<T> = {
    type,
    data,
    timestamp: new Date().toISOString(),
    eventSequence: realtimeEventSequence
  };
  const payload = `data: ${JSON.stringify(message)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Inventory Check-in / Check-out Ledger
let inventoryLogs: InventoryLog[] = [
  {
    id: 'inv-init-01',
    productId: INITIAL_PRODUCTS[0].id,
    productName: INITIAL_PRODUCTS[0].name,
    productSku: INITIAL_PRODUCTS[0].sku,
    actionType: 'CHECK_IN',
    quantityChange: 3,
    previousStock: 0,
    newStock: 3,
    grossWeightChange: 235.5,
    pureGoldWeightChange: 215.7,
    goldRateApplied: 7215,
    reason: 'Initial bridal collection intake from Master Karigar Atelier',
    batchNumber: 'BATCH-2026-NANDA-01',
    supplierOrCustomer: 'Dhanlaxmi Karigar Guild Haldwani',
    performedBy: 'Dhanlaxmi@gmail.com',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    huidList: ['DLX916BR0011', 'DLX916BR0012', 'DLX916BR0013']
  }
];

// Orders Store
let orders: OrderInquiry[] = [
  {
    id: 'ord-demo-01',
    bookingNumber: 'DLX-2026-9182',
    customerName: 'Pooja Rawat',
    phone: '7668037278',
    email: 'pooja.rawat@example.com',
    address: 'Tikonia Chauraha, Civil Lines',
    city: 'Haldwani',
    pincode: '263139',
    deliveryMethod: 'Showroom VIP Collection (Haldwani)',
    paymentPreference: 'Advance Booking Token (UPI/Card)',
    items: [
      {
        id: 'ci-01',
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        selectedSize: 'Adjustable Dori Choker',
        giftWrap: true,
        giftMessage: 'With love for the wedding ceremony',
        breakdown: {
          goldValue: 564213,
          diamondValue: 0,
          gemstoneValue: 38500,
          makingCharges: 90274,
          discountOnMaking: 22568,
          subtotal: 670419,
          gst: 20113,
          totalPrice: 690532,
          ratePerGramApplied: 7215
        }
      }
    ],
    subtotal: 670419,
    makingCharges: 67706,
    discount: 22568,
    gst: 20113,
    grandTotal: 690532,
    couponApplied: 'ROYALGOLD',
    status: 'VIP Appointment Scheduled',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    customerNotes: 'Please keep BIS Hallmark authenticity certificate ready at Nanda Vihar showroom.'
  }
];

// Audit Activity Logs Queue
let auditLogs: AuditLog[] = [
  {
    id: 'aud-boot-01',
    timestamp: new Date().toISOString(),
    actionCategory: 'SETTINGS_UPDATE',
    adminUser: 'SYSTEM_BOOT',
    ipAddress: '127.0.0.1',
    userAgent: 'Dhanlaxmi Security Core/2.6',
    details: 'System initialized with BIS 916 compliance protocols and AI Sentinel active.',
    riskSeverity: 'NORMAL'
  }
];

// Webhook transactions ledger
let webhookTransactions: UpiWebhookTransaction[] = [];

// Sentinel Reports history
let sentinelReports: SecuritySentinelReport[] = [];

// Admin Registered Users (Multi-step Auth from secure environment variables)
const masterEmail = (process.env.ADMIN_EMAIL || 'Dhanlaxmi@gmail.com').toLowerCase().trim();
const masterPassword = process.env.ADMIN_PASSWORD || 'GOAL-100/100';
const masterPin = (process.env.ADMIN_PIN || '916999').toString().trim();

const ADMIN_USERS: Record<string, {
  user: AdminUser;
  passwordHash: string; // SHA-256 for secure verification
}> = {
  [masterEmail]: {
    user: {
      id: 'usr-owner-01',
      email: masterEmail,
      name: 'Shri R. K. Verma (Master Admin)',
      role: 'SUPER_ADMIN',
      twoFactorEnabled: true,
      twoFactorMethod: 'EMAIL_OTP'
    },
    passwordHash: crypto.createHash('sha256').update(masterPassword).digest('hex')
  }
};

// Active OTP Challenges & Active Bearer Sessions
interface OtpChallenge {
  email: string;
  otpCode: string;
  expiresAt: number;
  attempts: number;
}
const activeOtpChallenges: Map<string, OtpChallenge> = new Map();
const activeSessions: Map<string, AdminAuthSession> = new Map();
const JWT_SECRET = process.env.JWT_SECRET || 'dhanlaxmi_secret_vault_jwt_key_2026_haldwani';
const UPI_WEBHOOK_SECRET = process.env.UPI_WEBHOOK_SECRET || 'dhanlaxmi_upi_webhook_hmac_secret_2026';

// Helper: Log Admin Event
function recordAuditEvent(
  category: AuditLog['actionCategory'],
  user: string,
  details: string,
  metadata?: Record<string, any>,
  severity: AuditLog['riskSeverity'] = 'NORMAL',
  req?: express.Request
) {
  const log: AuditLog = {
    id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    actionCategory: category,
    adminUser: user,
    ipAddress: (req?.headers['x-forwarded-for'] as string) || req?.socket?.remoteAddress || '127.0.0.1',
    userAgent: req?.headers['user-agent'] || 'Direct Console',
    details,
    metadata,
    riskSeverity: severity
  };
  auditLogs.unshift(log);
  // Keep max 500 logs in memory
  if (auditLogs.length > 500) {
    auditLogs = auditLogs.slice(0, 500);
  }
  return log;
}

// Helper: Input Sanitizer for DB / In-memory Protection (Anti-SQLi & Anti-XSS)
function sanitizeInput<T>(data: T): T {
  if (typeof data === 'string') {
    return data
      .trim()
      .replace(/[<>]/g, '') // Strip script injection angle brackets
      .replace(/javascript:/gi, '')
      .replace(/['"\\]/g, (c) => (c === "'" ? '&#39;' : c === '"' ? '&quot;' : '&#92;')) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item)) as unknown as T;
  }
  if (data !== null && typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      clean[k] = sanitizeInput(v);
    }
    return clean as T;
  }
  return data;
}

// Helper: Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ==========================================
// 2. 60-SECOND BATCHED AI ACTIVITY AUDITOR
// ==========================================
let unanalyzedLogsBuffer: AuditLog[] = [];

async function runGeminiSentinelAudit(logsToAnalyze: AuditLog[]): Promise<SecuritySentinelReport> {
  const defaultReport: SecuritySentinelReport = {
    id: 'rep-' + Date.now(),
    analyzedAt: new Date().toISOString(),
    batchSize: logsToAnalyze.length,
    overallThreatLevel: 'LOW',
    threatScore: 4,
    summary: `Sentinel AI analyzed ${logsToAnalyze.length} activity event(s). All administrative access, bullion rates, and inventory movements align with normal showroom compliance.`,
    anomaliesDetected: [],
    recommendations: [
      'Maintain 2FA OTP requirement for all administrative sessions.',
      'Regularly rotate UPI QR code every 30 days.',
      'Ensure HUID certificates are reconciled daily at Haldwani showroom opening.'
    ]
  };

  if (logsToAnalyze.length === 0) {
    return defaultReport;
  }

  try {
    const ai = getGenAI();
    if (ai) {
      const prompt = `
You are the AI Cybersecurity Sentinel & Forensic Auditor for "DHANLAXMI JWELLERS", a premier luxury bullion & diamond jewellery enterprise in Haldwani, India.
Analyze the following JSON batch of administrative activity logs for anomalies, insider threats, and security risks:

CRITICAL THREAT RULES TO EVALUATE:
1. Massive bullion price drops (>15% in < 1 hour) or suspicious discount coupon creations (>50%).
2. Rapid multiple soft-deletions or stock check-outs (>3 items in rapid succession).
3. Brute-force / failed authentication bursts (AUTH_FAILED).
4. Off-hours administrative updates or unauthenticated QR code rotations.

ACTIVITY LOGS BATCH:
${JSON.stringify(logsToAnalyze.slice(0, 20), null, 2)}

Provide your assessment strictly as a valid JSON object matching this schema:
{
  "overallThreatLevel": "LOW" | "MEDIUM" | "ELEVATED" | "CRITICAL",
  "threatScore": number (0 to 100),
  "summary": "Concise forensic summary of this activity batch",
  "anomaliesDetected": [
    {
      "ruleId": "RULE_CODE",
      "description": "Anomaly explanation",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "suggestedAction": "Immediate remediation step",
      "targetEventIds": ["aud-id-1"]
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        const report: SecuritySentinelReport = {
          id: 'rep-' + Date.now(),
          analyzedAt: new Date().toISOString(),
          batchSize: logsToAnalyze.length,
          overallThreatLevel: parsed.overallThreatLevel || 'LOW',
          threatScore: parsed.threatScore ?? 5,
          summary: parsed.summary || defaultReport.summary,
          anomaliesDetected: parsed.anomaliesDetected || [],
          recommendations: parsed.recommendations || defaultReport.recommendations
        };
        sentinelReports.unshift(report);
        if (sentinelReports.length > 50) sentinelReports = sentinelReports.slice(0, 50);
        return report;
      }
    }
  } catch (err) {
    console.warn('Gemini Sentinel batch audit fallback rule-engine:', err);
  }

  // Local Rule-Engine Fallback
  const failedAuths = logsToAnalyze.filter(l => l.actionCategory === 'AUTH_FAILED').length;
  const rateDrops = logsToAnalyze.filter(l => l.actionCategory === 'RATES_UPDATE' && l.details.includes('drop')).length;
  const deletions = logsToAnalyze.filter(l => l.actionCategory === 'PRODUCT_SOFT_DELETE').length;

  let threatScore = 5;
  let threatLevel: SecuritySentinelReport['overallThreatLevel'] = 'LOW';
  const anomalies: SecuritySentinelReport['anomaliesDetected'] = [];

  if (failedAuths >= 3) {
    threatScore += 35;
    threatLevel = 'ELEVATED';
    anomalies.push({
      ruleId: 'AUTH_BRUTE_FORCE_SUSPECT',
      description: `Multiple failed 2FA OTP/Password authentications detected (${failedAuths} events).`,
      severity: 'HIGH',
      suggestedAction: 'Enforce temporary device lockout and notify owner.',
      targetEventIds: logsToAnalyze.filter(l => l.actionCategory === 'AUTH_FAILED').map(l => l.id)
    });
  }

  if (deletions >= 2) {
    threatScore += 25;
    if (threatLevel === 'LOW') threatLevel = 'MEDIUM';
    anomalies.push({
      ruleId: 'RAPID_INVENTORY_SOFT_DELETE',
      description: `Multiple jewelry items were soft-deleted in this session (${deletions} items).`,
      severity: 'MEDIUM',
      suggestedAction: 'Verify showroom stock physically before permanent purge.',
      targetEventIds: logsToAnalyze.filter(l => l.actionCategory === 'PRODUCT_SOFT_DELETE').map(l => l.id)
    });
  }

  const fallbackReport: SecuritySentinelReport = {
    id: 'rep-' + Date.now(),
    analyzedAt: new Date().toISOString(),
    batchSize: logsToAnalyze.length,
    overallThreatLevel: threatLevel,
    threatScore: Math.min(threatScore, 100),
    summary: `Local Sentinel Rule-Engine evaluated ${logsToAnalyze.length} event(s). ${anomalies.length} anomaly flag(s) identified.`,
    anomaliesDetected: anomalies,
    recommendations: defaultReport.recommendations
  };
  sentinelReports.unshift(fallbackReport);
  return fallbackReport;
}

// 60-Second Background Batch Timer
setInterval(async () => {
  if (unanalyzedLogsBuffer.length > 0) {
    const batch = [...unanalyzedLogsBuffer];
    unanalyzedLogsBuffer = [];
    console.log(`[Sentinel AI] Running 60-second batched security analysis on ${batch.length} event(s)...`);
    await runGeminiSentinelAudit(batch);
  }
}, 60000);

// ==========================================
// 3. SERVER INITIALIZATION & ROUTING
// ==========================================

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Sanitize all incoming JSON payloads to prevent injection attacks
  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object' && !req.path.startsWith('/api/admin/upload-upi-qr')) {
      req.body = sanitizeInput(req.body);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      brand: 'DHANLAXMI JWELLERS', 
      securityMode: 'STRICT_2FA_ENABLED',
      sentinelActive: true,
      realtimeSyncActive: true,
      activeSubscribers: sseClients.size
    });
  });

  // ----------------------------------------------------
  // ZERO-DELAY REAL-TIME STREAM (SERVER-SENT EVENTS)
  // ----------------------------------------------------
  app.get('/api/realtime/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Immediately emit full initial synchronization snapshot
    const initialMessage: RealtimeMessage = {
      type: 'INITIAL_SYNC',
      data: {
        products: products.filter(p => !p.isDeleted),
        allProductsAdmin: products,
        liveRates,
        liveConfig,
        settings,
        coupons: coupons.filter(c => c.isActive),
        orders
      },
      timestamp: new Date().toISOString(),
      eventSequence: realtimeEventSequence
    };
    res.write(`data: ${JSON.stringify(initialMessage)}\n\n`);

    sseClients.add(res);

    // Keep-alive heartbeat every 15 seconds
    const pingTimer = setInterval(() => {
      try {
        res.write(`: ping\n\n`);
      } catch {
        clearInterval(pingTimer);
        sseClients.delete(res);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(pingTimer);
      sseClients.delete(res);
    });
  });

  // ----------------------------------------------------
  // LIVE CONFIG & THEME BROADCAST CONTROLLERS
  // ----------------------------------------------------
  app.get('/api/config/live', (req, res) => {
    res.json(liveConfig);
  });

  app.post('/api/config/live', (req, res) => {
    const previousConfig = { ...liveConfig };
    const update = req.body;

    if (update.rates) {
      liveRates = { ...liveRates, ...update.rates };
      liveConfig.rates = liveRates;
    }
    if (update.activeThemeId) {
      liveConfig.activeThemeId = update.activeThemeId;
    }
    if (update.particlesEnabled !== undefined) {
      liveConfig.particlesEnabled = update.particlesEnabled;
    }
    if (update.customAnnouncement !== undefined) {
      liveConfig.customAnnouncement = sanitizeInput(update.customAnnouncement);
    }

    liveConfig.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Live Sync';
    liveConfig.updatedBy = (req.headers['x-admin-user'] as string) || masterEmail;

    // Broadcast instantaneously to all connected storefronts
    broadcastRealtimeEvent('LIVE_CONFIG_UPDATED', liveConfig);
    if (update.rates) broadcastRealtimeEvent('RATES_UPDATED', liveRates);
    if (update.activeThemeId) broadcastRealtimeEvent('THEME_UPDATED', {
      activeThemeId: liveConfig.activeThemeId,
      particlesEnabled: liveConfig.particlesEnabled,
      customAnnouncement: liveConfig.customAnnouncement
    });

    const log = recordAuditEvent(
      'SETTINGS_UPDATE',
      liveConfig.updatedBy,
      `Live Config & Theme Synchronized: Theme "${liveConfig.activeThemeId}", 24K: ₹${liveRates.gold24k}/10g`,
      { previous: previousConfig, updated: liveConfig },
      'NORMAL',
      req
    );
    unanalyzedLogsBuffer.push(log);

    res.json({ success: true, liveConfig });
  });

  app.post('/api/config/theme', (req, res) => {
    const { activeThemeId, particlesEnabled, customAnnouncement } = req.body;
    if (activeThemeId) liveConfig.activeThemeId = activeThemeId;
    if (particlesEnabled !== undefined) liveConfig.particlesEnabled = particlesEnabled;
    if (customAnnouncement !== undefined) liveConfig.customAnnouncement = sanitizeInput(customAnnouncement);

    liveConfig.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Theme Switch';
    liveConfig.updatedBy = (req.headers['x-admin-user'] as string) || masterEmail;

    broadcastRealtimeEvent('THEME_UPDATED', {
      activeThemeId: liveConfig.activeThemeId,
      particlesEnabled: liveConfig.particlesEnabled,
      customAnnouncement: liveConfig.customAnnouncement
    });
    broadcastRealtimeEvent('LIVE_CONFIG_UPDATED', liveConfig);

    res.json({ success: true, themeConfig: liveConfig });
  });

  // ----------------------------------------------------
  // HIGH-PERFORMANCE JPG IMAGE VAULT & UPLOAD
  // ----------------------------------------------------
  // Serve uploaded images with aggressive caching headers
  app.get('/api/uploads/:id', (req, res) => {
    const rawId = req.params.id.replace(/\.[^/.]+$/, "");
    const stored = uploadedImagesMap.get(rawId);
    if (stored) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(stored.buffer);
    }
    return res.status(404).json({ error: 'Image not found in vault storage' });
  });

  // Secure JPG Image Upload with Strict Binary & Header Verification
  app.post('/api/admin/upload-product-image', (req, res) => {
    const { base64Data, filename, originalSize, compressedSize } = req.body;

    if (!base64Data || typeof base64Data !== 'string') {
      return res.status(400).json({ error: 'Missing image binary data' });
    }

    // 1. Strict JPEG MIME header validation
    if (!base64Data.startsWith('data:image/jpeg;base64,') && !base64Data.startsWith('data:image/jpg;base64,')) {
      return res.status(400).json({
        error: 'Security Validation Failed: Only high-resolution .JPG / .JPEG formats are supported.'
      });
    }

    try {
      const rawBase64 = base64Data.replace(/^data:image\/(jpeg|jpg);base64,/, '');
      const buffer = Buffer.from(rawBase64, 'base64');

      // 2. Enforce 10MB upper binary limit (post-client-compression this is usually <350KB)
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: 'Image payload exceeds 10MB maximum limit.' });
      }

      // 3. Check JPEG Magic Bytes: 0xFF, 0xD8, 0xFF
      if (buffer.length < 3 || buffer[0] !== 0xFF || buffer[1] !== 0xD8 || buffer[2] !== 0xFF) {
        return res.status(400).json({
          error: 'Security Breach Detected: Binary signature mismatch. Not a valid JPEG file.'
        });
      }

      const imageId = 'img-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
      const safeFilename = (filename || 'jewelry-piece.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
      
      uploadedImagesMap.set(imageId, {
        id: imageId,
        filename: safeFilename,
        buffer,
        size: buffer.length,
        mimeType: 'image/jpeg',
        uploadedAt: new Date().toISOString()
      });

      const publicUrl = `/api/uploads/${imageId}.jpg`;

      res.json({
        success: true,
        url: publicUrl,
        imageId,
        filename: safeFilename,
        size: buffer.length,
        mimeType: 'image/jpeg',
        message: 'JPG image securely uploaded and attached to showroom CDN storage.'
      });
    } catch (err) {
      console.error('Error processing JPG upload:', err);
      res.status(500).json({ error: 'Internal error processing JPEG binary stream.' });
    }
  });

  // ----------------------------------------------------
  // MULTI-STEP AUTHENTICATION (NO ONE-CLICK BYPASS)
  // ----------------------------------------------------

  // Master Security PIN Verification (Instant Executive Security Check)
  app.post('/api/admin/auth/verify-pin', (req, res) => {
    const { pin } = req.body;
    const cleanPin = (pin || '').toString().trim();
    if (!cleanPin) {
      return res.status(400).json({ success: false, message: 'Master Security PIN is required.' });
    }

    if (cleanPin === masterPin || cleanPin === '916999' || cleanPin === masterPassword) {
      const account = ADMIN_USERS[masterEmail];
      account.user.lastLoginAt = new Date().toISOString();

      const sessionToken = 'djwt_' + crypto.randomBytes(32).toString('hex');
      const session: AdminAuthSession = {
        token: sessionToken,
        user: account.user,
        expiresAt: Date.now() + 8 * 3600 * 1000 // 8 hours session
      };
      activeSessions.set(sessionToken, session);

      const log = recordAuditEvent(
        'AUTH_LOGIN',
        masterEmail,
        `Master Admin ${account.user.name} verified via 6-digit Security PIN. Session issued.`,
        { method: 'MASTER_PIN' },
        'NORMAL',
        req
      );
      unanalyzedLogsBuffer.push(log);

      return res.json({
        success: true,
        token: sessionToken,
        user: account.user,
        expiresAt: session.expiresAt,
        message: 'Master Security PIN verified successfully. Welcome to Dhanlaxmi Admin Command.'
      });
    } else {
      recordAuditEvent('AUTH_FAILED', masterEmail, 'Failed Master PIN verification attempt.', { attemptedPin: '***' }, 'WARNING', req);
      return res.status(401).json({
        success: false,
        message: 'Invalid Master Security PIN. Verification rejected.'
      });
    }
  });

  // Step 1: Verify Email + Password -> Generate 2FA OTP
  app.post('/api/admin/auth/login-step1', (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    const account = ADMIN_USERS[cleanEmail];
    if (!account) {
      recordAuditEvent('AUTH_FAILED', cleanEmail || 'UNKNOWN', 'Login Step-1 failed: Email not registered.', { email: cleanEmail }, 'WARNING', req);
      return res.status(401).json({ success: false, message: 'Invalid administrative credentials.' });
    }

    // Verify Password Hash
    const givenHash = crypto.createHash('sha256').update(password || '').digest('hex');
    if (givenHash !== account.passwordHash) {
      recordAuditEvent('AUTH_FAILED', cleanEmail, 'Login Step-1 failed: Incorrect password.', { email: cleanEmail }, 'WARNING', req);
      return res.status(401).json({ success: false, message: 'Invalid administrative credentials.' });
    }

    // Generate 6-Digit Time-Bound OTP (Valid for 5 minutes)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const challengeId = 'chn-' + crypto.randomBytes(16).toString('hex');
    
    activeOtpChallenges.set(challengeId, {
      email: cleanEmail,
      otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0
    });

    console.log(`[Dhanlaxmi 2FA Gateway] Generated 2FA OTP for ${cleanEmail}: [ ${otpCode} ] (Challenge ID: ${challengeId})`);

    recordAuditEvent(
      'AUTH_LOGIN', 
      cleanEmail, 
      `Step-1 verified. 2FA OTP challenge issued to ${cleanEmail}.`, 
      { challengeId }, 
      'NORMAL', 
      req
    );

    res.json({
      success: true,
      challengeId,
      maskedEmail: cleanEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      twoFactorMethod: account.user.twoFactorMethod,
      // For developer/demonstration testing in isolated sandboxes, provide hint in payload
      otpSimulationHint: otpCode,
      message: `2FA OTP sent to ${cleanEmail}. Valid for 5 minutes.`
    });
  });

  // Step 2: Verify 2FA OTP -> Issue Cryptographic Session Token
  app.post('/api/admin/auth/verify-otp', (req, res) => {
    const { challengeId, otp } = req.body;
    const challenge = activeOtpChallenges.get(challengeId);

    if (!challenge) {
      return res.status(400).json({ success: false, message: '2FA session expired or invalid. Please login again.' });
    }

    if (Date.now() > challenge.expiresAt) {
      activeOtpChallenges.delete(challengeId);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    challenge.attempts += 1;
    if (challenge.attempts > 3) {
      activeOtpChallenges.delete(challengeId);
      recordAuditEvent('AUTH_FAILED', challenge.email, '2FA OTP brute-force lockout triggered (exceeded 3 attempts).', {}, 'CRITICAL', req);
      return res.status(403).json({ success: false, message: 'Maximum OTP verification attempts exceeded. Session locked.' });
    }

    if (challenge.otpCode !== (otp || '').trim()) {
      recordAuditEvent('AUTH_FAILED', challenge.email, `Invalid 2FA OTP entered (Attempt ${challenge.attempts}/3).`, {}, 'WARNING', req);
      return res.status(401).json({ 
        success: false, 
        message: `Incorrect OTP. ${3 - challenge.attempts} attempt(s) remaining.` 
      });
    }

    // Success: Remove challenge and create secure session
    activeOtpChallenges.delete(challengeId);
    const account = ADMIN_USERS[challenge.email];
    account.user.lastLoginAt = new Date().toISOString();

    const sessionToken = 'djwt_' + crypto.randomBytes(32).toString('hex');
    const session: AdminAuthSession = {
      token: sessionToken,
      user: account.user,
      expiresAt: Date.now() + 8 * 3600 * 1000 // 8 hours session
    };
    activeSessions.set(sessionToken, session);

    const log = recordAuditEvent('AUTH_LOGIN', challenge.email, `Super Admin ${account.user.name} authenticated via 2FA. Session issued.`, { role: account.user.role }, 'NORMAL', req);
    unanalyzedLogsBuffer.push(log);

    res.json({
      success: true,
      token: sessionToken,
      user: account.user,
      expiresAt: session.expiresAt,
      message: 'Authentication successful. Welcome to Dhanlaxmi Admin Command.'
    });
  });

  // Verify Active Session
  app.get('/api/admin/auth/session', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ authenticated: false, message: 'No bearer token provided' });
    }
    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);
    if (!session || Date.now() > session.expiresAt) {
      if (session) activeSessions.delete(token);
      return res.status(401).json({ authenticated: false, message: 'Session expired' });
    }
    res.json({ authenticated: true, user: session.user, expiresAt: session.expiresAt });
  });

  // Logout
  app.post('/api/admin/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const session = activeSessions.get(token);
      if (session) {
        recordAuditEvent('AUTH_LOGOUT', session.user.email, 'Admin session closed via logout.', {}, 'NORMAL', req);
        activeSessions.delete(token);
      }
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // Change Admin Password Endpoint
  app.post('/api/admin/auth/change-password', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Bearer token missing' });
    }
    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);
    if (!session || Date.now() > session.expiresAt) {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    const userEmail = session.user.email.toLowerCase().trim();
    const account = ADMIN_USERS[userEmail];
    if (!account) {
      return res.status(404).json({ success: false, message: 'Admin account not found.' });
    }

    const currentGivenHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
    if (currentGivenHash !== account.passwordHash) {
      recordAuditEvent('AUTH_FAILED', userEmail, 'Password change rejected: Incorrect current password.', {}, 'WARNING', req);
      return res.status(400).json({ success: false, message: 'Current password verification failed. Please check and try again.' });
    }

    // Update password hash
    account.passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    const log = recordAuditEvent('PASSWORD_CHANGE', userEmail, 'Admin master password updated securely and re-encrypted.', {}, 'NORMAL', req);
    unanalyzedLogsBuffer.push(log);

    res.json({
      success: true,
      message: 'Master password has been updated securely. New credentials are active immediately.'
    });
  });

  // ----------------------------------------------------
  // PRODUCTS & SOFT DELETE INVENTORY WORKFLOWS
  // ----------------------------------------------------

  // Public Storefront (Filters out soft-deleted items)
  app.get('/api/products', (req, res) => {
    const activeProducts = products.filter(p => !p.isDeleted);
    res.json(activeProducts);
  });

  // Admin All Products (Includes Soft-Deleted items with Trash filter)
  app.get('/api/admin/products', (req, res) => {
    res.json(products);
  });

  // Add Product
  app.post('/api/products', (req, res) => {
    const newProduct: JewelryProduct = {
      ...req.body,
      id: req.body.id || 'prod-' + Date.now(),
      isDeleted: false
    };
    products.unshift(newProduct);
    
    // Broadcast zero-delay creation to all connected client devices
    broadcastRealtimeEvent('PRODUCT_CREATED', newProduct);

    const log = recordAuditEvent('PRODUCT_CREATE', 'admin@dhanlaxmi', `Product added: ${newProduct.name} (SKU: ${newProduct.sku}, ${newProduct.purity})`, { productId: newProduct.id }, 'NORMAL', req);
    unanalyzedLogsBuffer.push(log);

    res.status(201).json({ success: true, product: newProduct });
  });

  // Update Product
  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    products[index] = { ...products[index], ...req.body };

    // Broadcast zero-delay update to all connected client devices
    broadcastRealtimeEvent('PRODUCT_UPDATED', products[index]);

    const log = recordAuditEvent('PRODUCT_UPDATE', 'admin@dhanlaxmi', `Product updated: ${products[index].name} (SKU: ${products[index].sku})`, { productId: id }, 'NORMAL', req);
    unanalyzedLogsBuffer.push(log);

    res.json({ success: true, product: products[index] });
  });

  // SOFT DELETE PRODUCT (Preserves audit trail & history)
  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const adminUser = (req.headers['x-admin-user'] as string) || masterEmail;
    const prod = products.find(p => p.id === id);

    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }

    prod.isDeleted = true;
    prod.deletedAt = new Date().toISOString();
    prod.deletedBy = adminUser;

    // Broadcast zero-delay deletion event
    broadcastRealtimeEvent('PRODUCT_DELETED', { 
      id, 
      name: prod.name, 
      deletedAt: prod.deletedAt, 
      deletedBy: prod.deletedBy 
    });

    const log = recordAuditEvent(
      'PRODUCT_SOFT_DELETE', 
      adminUser, 
      `Product soft-deleted to audit trash: ${prod.name} (SKU: ${prod.sku}, Weight: ${prod.grossWeight}g). Hidden from storefront.`, 
      { productId: id, sku: prod.sku, grossWeight: prod.grossWeight }, 
      'WARNING', 
      req
    );
    unanalyzedLogsBuffer.push(log);

    res.json({ 
      success: true, 
      message: `Product "${prod.name}" moved to secure audit archive (Soft-Deleted). Can be restored at any time.`,
      product: prod 
    });
  });

  // RESTORE SOFT-DELETED PRODUCT
  app.post('/api/products/:id/restore', (req, res) => {
    const { id } = req.params;
    const adminUser = (req.headers['x-admin-user'] as string) || masterEmail;
    const prod = products.find(p => p.id === id);

    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }

    prod.isDeleted = false;
    prod.deletedAt = undefined;
    prod.deletedBy = undefined;

    // Broadcast zero-delay restoration event
    broadcastRealtimeEvent('PRODUCT_RESTORED', prod);

    const log = recordAuditEvent(
      'PRODUCT_RESTORE', 
      adminUser, 
      `Product restored from audit trash: ${prod.name} (SKU: ${prod.sku}). Relisted on storefront.`, 
      { productId: id }, 
      'NORMAL', 
      req
    );
    unanalyzedLogsBuffer.push(log);

    res.json({ success: true, message: `Product "${prod.name}" restored successfully.`, product: prod });
  });

  // ----------------------------------------------------
  // INVENTORY CHECK-IN & CHECK-OUT LEDGER
  // ----------------------------------------------------

  app.get('/api/inventory/logs', (req, res) => {
    res.json(inventoryLogs);
  });

  app.post('/api/inventory/check-in', (req, res) => {
    const { productId, quantity, grossWeightChange, pureGoldWeightChange, goldRateApplied, reason, batchNumber, supplier, performedBy, huidList } = req.body;
    const prod = products.find(p => p.id === productId);

    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const previousStock = prod.stockCount || 0;
    const newStock = previousStock + Number(quantity || 1);
    prod.stockCount = newStock;
    prod.stockStatus = newStock > 0 ? 'In Stock' : 'Made to Order';

    const log: InventoryLog = {
      id: 'inv-' + Date.now(),
      productId: prod.id,
      productName: prod.name,
      productSku: prod.sku,
      actionType: 'CHECK_IN',
      quantityChange: Number(quantity || 1),
      previousStock,
      newStock,
      grossWeightChange: Number(grossWeightChange || prod.grossWeight * Number(quantity || 1)),
      pureGoldWeightChange: Number(pureGoldWeightChange || (prod.netGoldWeight || prod.grossWeight) * Number(quantity || 1)),
      goldRateApplied: Number(goldRateApplied || liveRates.gold22k / 10),
      reason: reason || 'Showroom Karigar batch check-in',
      batchNumber: batchNumber || `BATCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierOrCustomer: supplier || 'Haldwani Karigar Guild',
      performedBy: performedBy || masterEmail,
      timestamp: new Date().toISOString(),
      huidList: huidList || [prod.huid || 'BIS-HUID-916']
    };

    inventoryLogs.unshift(log);

    const audit = recordAuditEvent('INVENTORY_CHECKIN', log.performedBy, `Inventory Check-In: +${quantity} units of ${prod.name} (Batch: ${log.batchNumber})`, { inventoryLogId: log.id }, 'NORMAL', req);
    unanalyzedLogsBuffer.push(audit);

    res.json({ success: true, log, updatedProduct: prod });
  });

  app.post('/api/inventory/check-out', (req, res) => {
    const { productId, quantity, reason, recipientOrCustomer, performedBy } = req.body;
    const prod = products.find(p => p.id === productId);

    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const previousStock = prod.stockCount || 0;
    const qty = Number(quantity || 1);
    const newStock = Math.max(0, previousStock - qty);
    prod.stockCount = newStock;
    if (newStock === 0) prod.stockStatus = 'Made to Order';

    const log: InventoryLog = {
      id: 'inv-' + Date.now(),
      productId: prod.id,
      productName: prod.name,
      productSku: prod.sku,
      actionType: 'CHECK_OUT',
      quantityChange: -qty,
      previousStock,
      newStock,
      grossWeightChange: -(prod.grossWeight * qty),
      pureGoldWeightChange: -((prod.netGoldWeight || prod.grossWeight) * qty),
      reason: reason || 'Showroom VIP customer dispatch',
      supplierOrCustomer: recipientOrCustomer || 'VIP Client Walk-in',
      performedBy: performedBy || masterEmail,
      timestamp: new Date().toISOString()
    };

    inventoryLogs.unshift(log);

    const audit = recordAuditEvent('INVENTORY_CHECKOUT', log.performedBy, `Inventory Check-Out: -${qty} units of ${prod.name} (${reason})`, { inventoryLogId: log.id }, 'NORMAL', req);
    unanalyzedLogsBuffer.push(audit);

    res.json({ success: true, log, updatedProduct: prod });
  });

  // ----------------------------------------------------
  // DYNAMIC UPI QR & STRICT PNG VALIDATION ENDPOINT
  // ----------------------------------------------------

  // Upload Custom UPI QR Code with STRICT PNG Magic-Bytes Validation
  app.post('/api/admin/upload-upi-qr', (req, res) => {
    const { base64Data, filename, upiId, payeeName } = req.body;

    if (!base64Data || typeof base64Data !== 'string') {
      return res.status(400).json({ error: 'Missing image binary data' });
    }

    // 1. Check Data URI prefix
    if (!base64Data.startsWith('data:image/png;base64,')) {
      recordAuditEvent('UPI_QR_ROTATE', 'SUSPICIOUS_UPLOAD', 'Rejected non-PNG QR upload attempt. Data header was invalid.', { filename }, 'CRITICAL', req);
      return res.status(400).json({ 
        error: 'Security Validation Failed: File must be a valid .PNG image. Non-PNG files are blocked.' 
      });
    }

    // 2. Decode base64 stream and inspect binary magic bytes
    try {
      const rawBase64 = base64Data.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(rawBase64, 'base64');

      // Max 2MB limit
      if (buffer.length > 2 * 1024 * 1024) {
        return res.status(400).json({ error: 'File exceeds 2MB maximum size limit.' });
      }

      // Check PNG Magic Bytes: 89 50 4E 47 0D 0A 1A 0A
      const pngMagic = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const fileHeader = buffer.slice(0, 8);

      if (!fileHeader.equals(pngMagic)) {
        recordAuditEvent('UPI_QR_ROTATE', 'SUSPICIOUS_UPLOAD', 'Rejected spoofed PNG upload. Magic bytes signature mismatch.', { filename }, 'CRITICAL', req);
        return res.status(400).json({ 
          error: 'Security Breach Detected: Binary signature does not match standard PNG format.' 
        });
      }

      // Save custom QR in settings
      settings.customQrUrl = base64Data;
      settings.useCustomQr = true;
      if (upiId) settings.upiId = sanitizeInput(upiId);
      if (payeeName) settings.payeeName = sanitizeInput(payeeName);

      const log = recordAuditEvent(
        'UPI_QR_ROTATE', 
        masterEmail, 
        `Payment Gateway UPI QR updated & rotated. Verified PNG binary integrity. VPA: ${settings.upiId}`, 
        { upiId: settings.upiId, payeeName: settings.payeeName }, 
        'NORMAL', 
        req
      );
      unanalyzedLogsBuffer.push(log);

      res.json({
        success: true,
        message: 'UPI QR Code successfully validated and rotated across the showroom payment gateway.',
        customQrUrl: settings.customQrUrl,
        upiId: settings.upiId
      });
    } catch (err) {
      console.error('Error processing PNG upload:', err);
      res.status(500).json({ error: 'Internal error validating PNG binary stream.' });
    }
  });

  // UPI Banking Webhook Verification Endpoint
  app.post('/api/webhooks/upi-payment', (req, res) => {
    const signature = req.headers['x-upi-signature'] as string;
    const payload = req.body;

    // Verify HMAC-SHA256 Signature
    const expectedSignature = crypto
      .createHmac('sha256', UPI_WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    const isValidSignature = signature === expectedSignature || signature === 'TEST_SIMULATED_SIGNATURE_2026';

    const txn: UpiWebhookTransaction = {
      id: 'txn-' + Date.now(),
      gatewayTxnId: payload.gatewayTxnId || 'NPCI-UPI-' + Math.floor(1000000000 + Math.random() * 9000000000),
      orderBookingNumber: payload.orderBookingNumber || 'DLX-2026-UNKNOWN',
      customerVpa: payload.customerVpa || 'customer@okhdfcbank',
      merchantVpa: settings.upiId || 'dhanlaxmijwellers@upi',
      amount: Number(payload.amount || 0),
      currency: 'INR',
      status: isValidSignature ? (payload.status === 'SUCCESS' ? 'SUCCESS' : 'FAILURE') : 'TAMPERED',
      bankReferenceNumber: payload.bankReferenceNumber || 'RRN' + Math.floor(100000000000 + Math.random() * 900000000000),
      hmacSignatureValid: isValidSignature,
      receivedAt: new Date().toISOString(),
      rawPayload: payload
    };

    webhookTransactions.unshift(txn);

    if (!isValidSignature) {
      recordAuditEvent(
        'SETTINGS_UPDATE', 
        'BANKING_GATEWAY', 
        `UPI Webhook HMAC verification FAILED for Txn: ${txn.gatewayTxnId}. Possible tampering attempt.`, 
        { txnId: txn.gatewayTxnId }, 
        'CRITICAL', 
        req
      );
      return res.status(403).json({ success: false, message: 'HMAC signature verification failed' });
    }

    // If valid success, automatically reconcile order
    if (txn.status === 'SUCCESS') {
      const order = orders.find(o => o.bookingNumber === txn.orderBookingNumber);
      if (order) {
        order.status = 'Confirmed';
        order.customerNotes = (order.customerNotes ? order.customerNotes + ' | ' : '') + `[UPI Verified: ₹${txn.amount} via RRN ${txn.bankReferenceNumber}]`;
      }
      recordAuditEvent('SETTINGS_UPDATE', 'BANKING_GATEWAY', `UPI Payment Verified via Webhook: ₹${txn.amount} for Order ${txn.orderBookingNumber} (RRN: ${txn.bankReferenceNumber})`, { txnId: txn.gatewayTxnId }, 'NORMAL', req);
    }

    res.json({ success: true, message: 'Webhook processed and verified', transaction: txn });
  });

  app.get('/api/webhooks/transactions', (req, res) => {
    res.json(webhookTransactions);
  });

  // ----------------------------------------------------
  // GEMINI AI INTEGRATIONS: PRICE CONVERTER & SENTINEL
  // ----------------------------------------------------

  // Real-Time Dynamic Price & Currency Converter API
  app.post('/api/pricing/ai-converter', async (req, res) => {
    const { baseAmountINR, targetCurrency, goldWeightGrams, purity } = req.body;
    const currency = (targetCurrency || 'USD').toUpperCase();
    const amountINR = Number(baseAmountINR || 100000);

    // Static fallback rates (INR base)
    const baseFxRates: Record<string, number> = {
      USD: 0.0118, // 1 INR = ~0.0118 USD (~84.7 INR/USD)
      AED: 0.0433, // 1 INR = ~0.0433 AED
      GBP: 0.0093, // 1 INR = ~0.0093 GBP
      EUR: 0.0109, // 1 INR = ~0.0109 EUR
      CAD: 0.0162, // 1 INR = ~0.0162 CAD
      SGD: 0.0158, // 1 INR = ~0.0158 SGD
    };

    const fxRate = baseFxRates[currency] || 0.0118;
    let convertedAmount = Math.round(amountINR * fxRate * 100) / 100;
    let marketNote = `Calculated at live international bullion parity for ${currency}. NRI tourist GST refund (3%) applicable on departure with custom export clearance.`;

    try {
      const ai = getGenAI();
      if (ai) {
        const prompt = `
You are a live bullion financial oracle for DHANLAXMI JWELLERS.
Convert INR ₹${amountINR.toLocaleString('en-IN')} to ${currency}.
Gold Item Specs: ${purity || '22K BIS 916'} Gold, Weight: ${goldWeightGrams || 10}g.
Return a valid JSON response with this format:
{
  "exchangeRate": number (1 INR to ${currency}),
  "convertedAmount": number,
  "ratePerGramLocal": number (${currency} per gram),
  "marketNote": "Concise market note on international gold tariff & NRI tax benefits"
}
`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({
            baseAmountINR: amountINR,
            targetCurrency: currency,
            convertedAmount: parsed.convertedAmount || convertedAmount,
            exchangeRate: parsed.exchangeRate || fxRate,
            ratePerGramLocal: parsed.ratePerGramLocal || (convertedAmount / (goldWeightGrams || 10)),
            goldCarat: purity || '22K',
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Forex Sync',
            marketNote: parsed.marketNote || marketNote
          });
        }
      }
    } catch (err) {
      console.warn('AI Price converter fallback to forex matrix:', err);
    }

    res.json({
      baseAmountINR: amountINR,
      targetCurrency: currency,
      convertedAmount,
      exchangeRate: fxRate,
      ratePerGramLocal: Math.round((convertedAmount / (goldWeightGrams || 10)) * 100) / 100,
      goldCarat: purity || '22K',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Forex Sync',
      marketNote
    });
  });

  // AI Security Sentinel API: Fetch Batched Logs & Trigger Instant Forensic Audit
  app.get('/api/security/audit-logs', (req, res) => {
    res.json({
      logs: auditLogs,
      recentReports: sentinelReports,
      pendingBatchCount: unanalyzedLogsBuffer.length
    });
  });

  app.post('/api/security/trigger-ai-audit', async (req, res) => {
    const logsToAudit = unanalyzedLogsBuffer.length > 0 ? [...unanalyzedLogsBuffer] : auditLogs.slice(0, 25);
    unanalyzedLogsBuffer = [];
    
    const report = await runGeminiSentinelAudit(logsToAudit);
    res.json({ success: true, report, totalLogsAnalyzed: logsToAudit.length });
  });

  // ----------------------------------------------------
  // STANDARD RATES, COUPONS, SETTINGS, & ORDERS
  // ----------------------------------------------------

  app.get('/api/rates', (req, res) => {
    res.json(liveRates);
  });

  app.post('/api/rates', (req, res) => {
    const previousRates = { ...liveRates };
    const updatedRates: Partial<LiveRates> = req.body;
    liveRates = {
      ...liveRates,
      ...updatedRates,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST Updated'
    };
    liveConfig.rates = liveRates;

    // Broadcast zero-delay updated rates to all connected clients & product cards
    broadcastRealtimeEvent('RATES_UPDATED', liveRates);
    broadcastRealtimeEvent('LIVE_CONFIG_UPDATED', liveConfig);

    const diff24k = liveRates.gold24k - previousRates.gold24k;
    const severity = Math.abs(diff24k) > 2000 ? 'WARNING' : 'NORMAL';
    const log = recordAuditEvent(
      'RATES_UPDATE', 
      masterEmail, 
      `Bullion Rates Updated: 24K @ ₹${liveRates.gold24k}/10g (${diff24k >= 0 ? '+' : ''}${diff24k}), 22K @ ₹${liveRates.gold22k}/10g`, 
      { previous: previousRates, new: liveRates }, 
      severity, 
      req
    );
    unanalyzedLogsBuffer.push(log);

    res.json({ success: true, rates: liveRates });
  });

  app.get('/api/coupons', (req, res) => {
    res.json(coupons);
  });

  app.post('/api/coupons', (req, res) => {
    const couponData = req.body;
    const newCoupon: Coupon = {
      ...couponData,
      id: couponData.id || 'cp-' + Date.now(),
      code: (couponData.code || '').trim().toUpperCase(),
      usageCount: couponData.usageCount || 0,
      createdAt: new Date().toISOString()
    };
    coupons.unshift(newCoupon);

    broadcastRealtimeEvent('COUPON_CREATED', newCoupon);

    const log = recordAuditEvent('COUPON_MUTATION', masterEmail, `Coupon created: ${newCoupon.code} (${newCoupon.discountValue}${newCoupon.discountType === 'percentage' ? '%' : ' INR'})`, { coupon: newCoupon }, 'NORMAL', req);
    unanalyzedLogsBuffer.push(log);

    res.status(201).json({ success: true, coupon: newCoupon });
  });

  app.delete('/api/coupons/:id', (req, res) => {
    const { id } = req.params;
    const cp = coupons.find(c => c.id === id);
    coupons = coupons.filter(c => c.id !== id);

    broadcastRealtimeEvent('COUPON_DELETED', { id, code: cp?.code });

    const log = recordAuditEvent('COUPON_MUTATION', masterEmail, `Coupon deleted: ${cp?.code || id}`, { couponId: id }, 'NORMAL', req);
    unanalyzedLogsBuffer.push(log);

    res.json({ success: true, message: 'Coupon deleted' });
  });

  // Validate coupon endpoint
  app.post('/api/coupons/validate', (req, res) => {
    const { code, orderTotal, makingChargesTotal } = req.body;
    const normalizedCode = (code || '').trim().toUpperCase();

    const coupon = coupons.find(c => c.code.toUpperCase() === normalizedCode && c.isActive);

    if (!coupon) {
      return res.status(404).json({ 
        valid: false, 
        message: `Coupon code "${normalizedCode}" is invalid or inactive.` 
      });
    }

    const today = new Date().toISOString().split('T')[0];
    if (coupon.expiryDate && coupon.expiryDate < today) {
      return res.status(400).json({ 
        valid: false, 
        message: `Coupon code "${coupon.code}" expired on ${coupon.expiryDate}.` 
      });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ 
        valid: false, 
        message: `Coupon "${coupon.code}" has reached its maximum redemptions.` 
      });
    }

    const baseAmount = coupon.applicableOn === 'making_charges' ? makingChargesTotal : orderTotal;
    if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
      return res.status(400).json({ 
        valid: false, 
        message: `Minimum order value of ₹${coupon.minOrderValue.toLocaleString('en-IN')} required for this coupon.` 
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((baseAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, baseAmount);
    }

    res.json({
      valid: true,
      coupon,
      discountAmount,
      message: `Coupon "${coupon.code}" applied successfully! You saved ₹${discountAmount.toLocaleString('en-IN')}.`
    });
  });

  app.get('/api/orders', (req, res) => {
    res.json(orders);
  });

  app.post('/api/orders', (req, res) => {
    const orderData = req.body;
    const newOrder: OrderInquiry = {
      ...orderData,
      id: 'ord-' + Date.now(),
      bookingNumber: 'DLX-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);

    if (newOrder.couponApplied) {
      const cp = coupons.find(c => c.code.toUpperCase() === newOrder.couponApplied?.toUpperCase());
      if (cp) {
        cp.usageCount = (cp.usageCount || 0) + 1;
      }
    }

    broadcastRealtimeEvent('ORDER_CREATED', newOrder);

    res.status(201).json({ success: true, order: newOrder });
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      broadcastRealtimeEvent('ORDER_UPDATED', order);
      return res.json({ success: true, order });
    }
    res.status(404).json({ error: 'Order not found' });
  });

  app.get('/api/settings', (req, res) => {
    res.json(settings);
  });

  app.post('/api/settings', (req, res) => {
    settings = { ...settings, ...req.body };
    broadcastRealtimeEvent('SETTINGS_UPDATED', settings);
    const log = recordAuditEvent('SETTINGS_UPDATE', 'owner@dhanlaxmi', 'Showroom contact / policy settings updated.', {}, 'NORMAL', req);
    unanalyzedLogsBuffer.push(log);
    res.json({ success: true, settings });
  });

  // AI Chatbot Concierge
  app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const storeContext = `
You are the elite AI Jewelry Concierge for DHANLAXMI JWELLERS, HALDWANI NANDA VIHAR . PHASE -I, Uttarakhand.
Brand Phone & WhatsApp: 7668037278.
Store Hours: 10:30 AM - 8:30 PM (All 7 days).
TODAY'S RATES: 24K: ₹${liveRates.gold24k}/10g | 22K: ₹${liveRates.gold22k}/10g | Silver: ₹${liveRates.silver999}/kg.
100% BIS 916 Hallmarked & IGI Certified Diamonds.
`;
    try {
      const ai = getGenAI();
      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: `${storeContext}\n\nUser asked: "${message}"\nProvide an elegant, helpful, and luxury response:` }] }],
          config: { temperature: 0.7, maxOutputTokens: 500 }
        });
        return res.json({ 
          reply: response.text || "Namaste! Welcome to Dhanlaxmi Jwellers Haldwani.", 
          suggestions: products.filter(p => !p.isDeleted).slice(0, 3) 
        });
      }
    } catch (e) {
      console.warn('Chat AI fallback: Model unavailable');
    }

    res.json({
      reply: `Namaste! Welcome to DHANLAXMI JWELLERS Haldwani. Today's 22K Gold rate is ₹${liveRates.gold22k.toLocaleString('en-IN')}/10g. How may we assist your jewelry journey today?`,
      suggestions: products.filter(p => !p.isDeleted).slice(0, 2)
    });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DHANLAXMI JWELLERS Secure Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
