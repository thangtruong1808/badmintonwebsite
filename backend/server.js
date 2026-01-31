/**
 * Vercel entry: re-exports the built Express app.
 * Build must run first (npm run build) so dist/server.js exists.
 * Same pattern as ecommerce: builds + routes point to this file.
 */
import app from './dist/server.js';
export default app;
