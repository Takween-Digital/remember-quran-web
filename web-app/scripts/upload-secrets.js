const { execSync } = require('child_process');
const fs = require('fs');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const env = {};
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/\\n/g, '\n');
      }
      env[key] = val;
    }
  }
  return env;
}

const env1 = parseEnvFile('.env');
const env2 = parseEnvFile('.env.local');
const env = { ...env1, ...env2 };

const secrets = [
  'FIREBASE_PRIVATE_KEY',
  'AUTH_SECRET',
  'BETTER_AUTH_SECRET',
  'RESEND_API_KEY',
  'HOSTINGER_API_KEY',
  'HOSTINGER_EMAIL_PASSWORD'
];

for (const secret of secrets) {
  if (env[secret]) {
    console.log(`Uploading secret: ${secret}...`);
    try {
      execSync(`npx wrangler secret put ${secret}`, {
        input: env[secret],
        stdio: ['pipe', 'inherit', 'inherit']
      });
    } catch (e) {
      console.error(`Failed to upload ${secret}`);
    }
  }
}
console.log("Done.");
