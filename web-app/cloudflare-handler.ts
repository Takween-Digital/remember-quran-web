import handler from './dist/server/index.js';

export default {
  async fetch(request: Request, env: any, ctx: any) {
    // Make Cloudflare environment available globally
    if (typeof globalThis !== 'undefined') {
      globalThis.__CF_ENV__ = env;
      Object.assign(globalThis, env);
    }

    if (typeof process !== 'undefined' && process.env) {
      Object.assign(process.env, env);
    }

    try {
      // Get response from vinext handler
      const response = await handler(request);

      // Optimize response with caching headers
      const url = new URL(request.url);
      const headers = new Headers(response.headers);

      // Static assets: cache for 1 year
      if (url.pathname.startsWith('/_next/static/')) {
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      }
      // Fonts: cache for 30 days
      else if (url.pathname.startsWith('/fonts/')) {
        headers.set('Cache-Control', 'public, max-age=2592000, immutable');
      }
      // API routes: no cache, must revalidate
      else if (url.pathname.startsWith('/api/')) {
        headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      }
      // HTML pages: cache for 1 hour, revalidate
      else if (response.headers.get('content-type')?.includes('text/html')) {
        headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
      }

      // Security and performance headers
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'SAMEORIGIN');
      headers.set('X-XSS-Protection', '1; mode=block');
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

      // Enable compression
      if (!headers.has('Content-Encoding')) {
        headers.set('Vary', 'Accept-Encoding');
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (err) {
      console.error('Handler error:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
