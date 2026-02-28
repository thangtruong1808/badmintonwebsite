/**
 * Frontend base URL for reset-password links and CORS.
 * Set FRONTEND_URL in .env (e.g. https://yourdomain.com for Hostinger production).
 * For multiple origins (e.g. Vercel preview + production), use comma-separated:
 *   FRONTEND_URL=https://badmintonwebsitefrontend.vercel.app
 */
export function getFrontendBaseUrl(): string {
  const url = process.env.FRONTEND_URL || 'http://localhost:5173';
  return url.split(',')[0].trim().replace(/\/$/, '');
}

/** Known frontend URLs for this project – allowed for CORS. */
const KNOWN_FRONTEND_ORIGINS = [
  'https://badmintonwebsitefrontend.vercel.app',
  'https://chibibadminton.vercel.app',
  'https://chibibadminton.com.au',
  'https://www.chibibadminton.com.au',
];

/**
 * Regex patterns for Vercel preview URLs.
 * Matches patterns like:
 * - https://chibibadminton-git-*.vercel.app
 * - https://chibibadminton-*.vercel.app
 * - https://*-thangtruong1808gmailcoms-projects.vercel.app
 */
const VERCEL_PREVIEW_PATTERNS = [
  /^https:\/\/chibibadminton(-git)?-[a-z0-9-]+-[a-z0-9]+\.vercel\.app$/i,
  /^https:\/\/[a-z0-9-]+-thangtruong1808gmailcoms-projects\.vercel\.app$/i,
];

/**
 * Allowed origins for CORS. Supports comma-separated FRONTEND_URL and includes known Vercel URLs.
 */
export function getAllowedOrigins(): string[] {
  const url = process.env.FRONTEND_URL || 'http://localhost:5173';
  const fromEnv = url.split(',').map((u) => u.trim().replace(/\/$/, '')).filter(Boolean);
  const defaultOrigins = fromEnv.length > 0 ? fromEnv : ['http://localhost:5173'];
  const combined = [...new Set([...defaultOrigins, ...KNOWN_FRONTEND_ORIGINS])];
  return combined;
}

// Track if we've logged the origins
let _corsOriginsLogged = false;

/**
 * Check if an origin is allowed (either in static list or matches Vercel preview pattern).
 */
export function isOriginAllowed(origin: string): boolean {
  const staticOrigins = getAllowedOrigins();
  
  // Log for debugging (only on first check)
  if (!_corsOriginsLogged) {
    console.log('📋 Allowed CORS origins:', staticOrigins);
    _corsOriginsLogged = true;
  }
  
  if (staticOrigins.includes(origin)) return true;
  
  for (const pattern of VERCEL_PREVIEW_PATTERNS) {
    if (pattern.test(origin)) return true;
  }
  
  return false;
}
