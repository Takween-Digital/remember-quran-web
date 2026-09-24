import type { Request, ExportedHandler } from '@cloudflare/workers-types';

// Import the Vinext server handler
import handler from '../dist/server/index.js';

interface Env {
  DB: D1Database;
  VINEXT_KV_CACHE: KVNamespace;
  AUDIO_CACHE_KV?: KVNamespace;
  [key: string]: any;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Make env available to the app
      if (typeof globalThis !== 'undefined') {
        (globalThis as any).__CF_ENV__ = env;
      }

      // Call the Vinext handler
      return await handler(request, env, ctx);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  },
} as ExportedHandler<Env>;
