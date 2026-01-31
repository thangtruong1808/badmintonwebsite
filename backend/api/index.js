/**
 * Vercel serverless entry: forwards all requests to the Express app.
 * Build must run first (npm run build) so dist/server.js exists.
 * Rewrite sends original path as ?path=... so we restore req.url for Express.
 */
let appPromise = null;

function getApp() {
  if (!appPromise) {
    appPromise = import('../dist/server.js').then((m) => m.default);
  }
  return appPromise;
}

export default async function handler(req, res) {
  const base = 'http://localhost';
  const url = new URL(req.url || '/', base);
  const path = url.searchParams.get('path') || '';
  url.searchParams.delete('path');
  const qs = url.searchParams.toString() ? '?' + url.searchParams.toString() : '';
  req.url = '/' + (path || '') + qs;

  const app = await getApp();
  return app(req, res);
}
