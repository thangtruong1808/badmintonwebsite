/**
 * Vercel Express entry. Re-exports the built app so Vercel detects Express and routes all requests here.
 * Build must run first (Project Settings → Build Command: npm run build) so dist/server.js exists.
 */
export { default } from './dist/server.js';
