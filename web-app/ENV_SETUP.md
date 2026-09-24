# Secure Environment Variable Setup

## Overview
This project uses environment variables for sensitive credentials. **Never commit `.env` files to git** — they are automatically ignored by `.gitignore`.

## File Structure

- **`.env.example`** ← Tracked in git (template, no secrets)
- **`.env.local`** ← Local development secrets (git-ignored)
- **`.env.production`** ← Production secrets (git-ignored)

## Local Development Setup

### 1. Create `.env.local`

Copy the template and fill with your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your local values:

```env
# Authentication (Next.js Better-Auth)
AUTH_SECRET=your-random-secret-key-here
AUTH_URL=http://localhost:8787

# Email Service (Resend)
EMAIL_FROM=noreply@rememberquran.com
RESEND_API_KEY=re_your_resend_api_key

# Firebase (Admin SDK)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_WEB_API_KEY=AIzaSy...

# Cloudflare (Optional - for local Wrangler dev)
CLOUDFLARE_API_TOKEN=cfk_your_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

### 2. Never Share API Keys

🚨 **Critical**: API keys are secrets. If you accidentally expose one:

1. **Immediately rotate/delete the key** in the provider's dashboard
2. **Generate a new one** with minimal required permissions
3. **Update `.env.local`**

### 3. Git Safety Check

Verify `.env.local` is ignored:

```bash
git check-ignore .env.local
# Should output: .env.local
```

If not ignored, add to `.gitignore`:

```bash
echo ".env.local" >> .gitignore
```

## Cloudflare API Token Setup

### Create a Limited Token (Recommended)

Instead of using the global account key, create a scoped API token:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Use template: **"Edit Cloudflare Workers"** 
4. Permissions:
   - ✅ Workers KV Storage (Edit)
   - ✅ Workers Scripts (Edit)
   - ✅ Account Settings (Read)
5. Zone: **Specific zone** → select `rememberquran.com`
6. TTL: Set expiration (90-180 days recommended)
7. Copy the token → paste into `.env.local`

### Token Rotation Schedule

- Review tokens monthly
- Rotate every 90 days
- Delete unused tokens immediately

## Environment Variables by Service

### Firebase (Local Development)

Get from Firebase Console → Project Settings → Service Accounts:

```bash
# Download service account JSON, then extract:
FIREBASE_PROJECT_ID=project-id
FIREBASE_CLIENT_EMAIL=admin@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=<paste full private key with \n preserved>
```

### Resend (Email)

Get from [Resend Dashboard](https://resend.com/api-keys):

```bash
RESEND_API_KEY=re_xxxxxxxxxx
```

### Better-Auth

Generate a random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Production Deployment

### Cloudflare Workers Secrets

For production, use Wrangler to set secrets:

```bash
# Set individual secrets
wrangler secret put FIREBASE_PRIVATE_KEY
wrangler secret put FIREBASE_CLIENT_EMAIL
wrangler secret put AUTH_SECRET

# View configured secrets (keys only, not values)
wrangler secret list
```

These are stored securely in Cloudflare and never committed to git.

### GitHub Secrets (Optional)

If using GitHub Actions, add secrets via Settings → Secrets:

```bash
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
RESEND_API_KEY
AUTH_SECRET
```

## Troubleshooting

### "Can't find .env.local"

This is normal. The app falls back to defaults or fails gracefully. Create the file:

```bash
touch .env.local
```

### API Key Doesn't Work

1. ✅ Verify key is in correct file (`.env.local`, not `.env.example`)
2. ✅ Check key hasn't expired
3. ✅ Verify permissions are correct
4. ✅ Regenerate key if compromised

### Secrets Not Loading in Wrangler

Run with debugging:

```bash
wrangler deploy --debug
```

## Security Checklist

- [ ] `.env.local` exists and is git-ignored
- [ ] All API keys are in `.env.local`, not in code
- [ ] No `.env.local` content ever committed to git
- [ ] API keys rotated within last 90 days
- [ ] No keys shared in chat/email/Slack
- [ ] Cloudflare token uses scoped permissions (not global account key)
- [ ] Production uses Wrangler secrets, not env files

## Resources

- [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
- [Firebase Service Accounts](https://firebase.google.com/docs/admin/setup)
- [Resend API Keys](https://resend.com/api-keys)
- [Wrangler Secrets](https://developers.cloudflare.com/workers/platform/environment-variables/)
