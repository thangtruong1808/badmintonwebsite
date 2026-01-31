/**
 * Vercel zero-config Express entry.
 * Export the built Express app so Vercel routes all requests (/, /api/*, etc.) to it.
 * Build must run first (npm run build) so dist/server.js exists.
 */
export { default } from './dist/server.js';
