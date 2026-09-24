import type { ExportedHandler } from '@cloudflare/workers-types';

// Import the Vinext server - it's a module, not a function
import * as vinextModule from '../dist/server/index.js';

const handler = vinextModule.default || vinextModule as any;

interface Env {
  DB: D1Database;
  VINEXT_KV_CACHE: KVNamespace;
  AUDIO_CACHE_KV?: KVNamespace;
  [key: string]: any;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Vinext builds an isomorphic module - the handler has a fetch method
      if (typeof handler.fetch === 'function') {
        return await handler.fetch(request, env, ctx);
      }

      // Or it might be a direct export
      if (typeof handler === 'function') {
        return await handler(request, env, ctx);
      }

      console.error('Handler is neither a fetch function nor callable');
      return new Response('Handler configuration error', { status: 500 });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(`Internal Server Error: ${error instanceof Error ? error.message : String(error)}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  },
} satisfies ExportedHandler<Env>;
