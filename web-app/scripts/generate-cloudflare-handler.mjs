import fs from 'fs';
import path from 'path';

const handlerCode = `import handler from './index.js';

export default {
  async fetch(request, env, ctx) {
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
