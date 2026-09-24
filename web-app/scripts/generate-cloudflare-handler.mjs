import fs from 'fs';
import path from 'path';

const handlerCode = `import handler from './index.js';

// Make Cloudflare secrets and environment variables available to the application
export default {
  async fetch(request, env, ctx) {
    // Make all Cloudflare bindings and secrets available globally
    // This allows the app to access secrets set via 'wrangler secret put'
    if (typeof globalThis !== 'undefined') {
      // Store in __CF_ENV__ for explicit access
      globalThis.__CF_ENV__ = env;
      // Also copy to globalThis directly
      Object.assign(globalThis, env);
    }

    // Copy Cloudflare env to process.env for Node.js compatibility
    if (typeof process !== 'undefined' && process.env) {
      Object.assign(process.env, env);
    }

    return handler(request, env, ctx);
  },
};
`;

const distServerPath = './dist/server/cloudflare-handler.js';
fs.writeFileSync(distServerPath, handlerCode);
console.log('✓ Generated cloudflare-handler.js');

// Update wrangler.json to point to cloudflare-handler.js
const wranglerJsonPath = './dist/server/wrangler.json';
const wranglerConfig = JSON.parse(fs.readFileSync(wranglerJsonPath, 'utf-8'));
wranglerConfig.main = 'cloudflare-handler.js';
fs.writeFileSync(wranglerJsonPath, JSON.stringify(wranglerConfig, null, 2));
console.log('✓ Updated wrangler.json main entry point');
