/**
 * Vercel serverless entry: forwards all requests to the Express app.
 * Build must run first (npm run build) so dist/server.js exists.
 */
import app from '../dist/server.js';

export default (req, res) => app(req, res);
