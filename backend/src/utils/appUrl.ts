/**
 * Frontend base URL for reset-password links and CORS.
 * Set FRONTEND_URL in .env (e.g. https://yourdomain.com for Hostinger production).
 */
export function getFrontendBaseUrl(): string {
  const url = process.env.FRONTEND_URL || 'http://localhost:5173';
  return url.replace(/\/$/, '');
}
