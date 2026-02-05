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

/** Known Vercel frontend URLs for this project – allowed for CORS. */
const VERCEL_FRONTEND_ORIGINS = [
  'https://badmintonwebsitefrontend.vercel.app',
];

/**
 * Allowed origins for CORS. Supports comma-separated FRONTEND_URL and includes known Vercel URLs.
 */
export function getAllowedOrigins(): string[] {
  const url = process.env.FRONTEND_URL || 'http://localhost:5173';
  const fromEnv = url.split(',').map((u) => u.trim().replace(/\/$/, '')).filter(Boolean);
  const defaultOrigins = fromEnv.length > 0 ? fromEnv : ['http://localhost:5173'];
  const combined = [...new Set([...defaultOrigins, ...VERCEL_FRONTEND_ORIGINS])];
  return combined;
}
