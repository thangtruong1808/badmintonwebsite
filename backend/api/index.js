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
  const rawUrl = req.url || '/';
  const base = 'http://localhost';

  // Path can come from rewrite query (?path=...) or Vercel's req.query
  let path = (req.query && req.query.path) ?? null;
  if (path == null) {
    try {
      const url = new URL(rawUrl, base);
      path = url.searchParams.get('path') ?? '';
    } catch {
      path = '';
    }
  }
  path = String(path).replace(/^\/+/, '').trim();

  // Rebuild req.url so Express sees the original path (e.g. "/" or "/api/health")
  const pathPart = path ? `/${path}` : '/';
  let qs = '';
  try {
    const url = new URL(rawUrl, base);
    url.searchParams.delete('path');
    qs = url.searchParams.toString() ? `?${url.searchParams.toString()}` : '';
  } catch {
    // keep qs empty
  }
  req.url = pathPart + qs;

  const app = await getApp();
  return app(req, res);
}
