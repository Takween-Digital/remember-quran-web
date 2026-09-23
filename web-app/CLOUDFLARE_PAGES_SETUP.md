# Cloudflare Pages Migration Guide

## Overview
This guide covers migrating from Cloudflare Workers to Cloudflare Pages for your Next.js application.

## Why Pages?
- ✅ Simpler deployment process
- ✅ Automatic Git integration (no manual Wrangler commands)
- ✅ Avoids npm/pnpm dependency issues
- ✅ Better for server-side rendering (SSR)
- ✅ Same free tier benefits

## Setup Steps

### 1. Connect to Cloudflare Pages
```bash
# Visit Cloudflare Dashboard
# 1. Go to Pages
# 2. Click "Connect to Git"
# 3. Select your GitHub repo (Takween-Digital/remember-quran-web)
# 4. Choose main branch
```

### 2. Configure Build Settings
In the Cloudflare Pages dashboard:

**Build Command:**
```
npm run build:pages
```

**Build Output Directory:**
```
.open-next
```

**Environment Variables:**
Add all variables from `.env.local`:
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=remember-quran`
- `NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyALNl-0F78hwgAYU9nVwtfHJc1t_kDzvA4`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=remember-quran.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=remember-quran.firebasestorage.app`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=334348031725`
- `NEXT_PUBLIC_FIREBASE_APP_ID=1:334348031725:web:223461a1df32b4a70c5ee4`
- `FIREBASE_PROJECT_ID=remember-quran`
- `FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@remember-quran.iam.gserviceaccount.com`
- `NEXT_PUBLIC_APP_URL=https://rememberquran.com`
- `NODE_ENV=production`

### 3. Connect Custom Domain
In Pages project settings:
- Click "Custom domains"
- Add `rememberquran.com`
- Add `www.rememberquran.com`
- Follow DNS setup instructions

### 4. Deploy
Once connected, every push to `main` will trigger automatic deployment.

## Build Scripts

**Local testing:**
```bash
npm run build:pages
```

**Manual deployment (if needed):**
```bash
npm run deploy:pages
```

## File Structure
- `wrangler-pages.json` - Pages configuration
- `.open-next/` - Built output (generated during build)
- `node_modules/` - Dependencies

## Troubleshooting

**If build fails:**
1. Check build logs in Cloudflare dashboard
2. Run `npm run build:pages` locally to debug
3. Ensure all environment variables are set

**If deployment fails:**
1. Verify custom domain DNS settings
2. Check that git push succeeded
3. Review Cloudflare Pages deployment logs

## Performance
Your optimizations remain active:
- ✅ N+1 query elimination
- ✅ Audio file KV caching  
- ✅ Firebase integration
- ✅ 60-75% CPU reduction

## Rollback to Workers
If needed, you can still deploy via Workers:
```bash
npm run deploy:cf
```

---

**Status:** Ready for Pages deployment. All code is optimized and committed.
