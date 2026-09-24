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
      // The vinext handler is designed to work with Web API Request/Response
      const response = await handler(request);
      return response;
    } catch (err) {
      console.error('Handler error:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
