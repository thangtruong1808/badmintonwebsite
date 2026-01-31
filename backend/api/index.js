/**
 * Vercel serverless entry: forwards all requests to the Express app.
 * Build must run first (npm run build) so dist/server.js exists.
 * Dynamic import avoids path resolution issues during Vercel's bundling.
 */
let appPromise = null;

function getApp() {
  if (!appPromise) {
    appPromise = import('../dist/server.js').then((m) => m.default);
  }
  return appPromise;
}

export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}
