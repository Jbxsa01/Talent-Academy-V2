# 🚀 Vercel Deployment Guide for HESTIM Talent Academy

## Quick Start: Deploy to Vercel

### Option 1: Automatic Deployment (Recommended)

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Select your GitHub repository: **Hestim-TalentAcademy**
4. Click **Import**
5. Update environment variables (see below)
6. Click **Deploy**

Vercel will automatically deploy every time you push to `main` branch.

### Option 2: Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy from project directory
vercel

# Or deploy to production
vercel --prod
```

## Environment Variables Setup

### In Vercel Dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add these variables:

| Key | Value | Example |
|-----|-------|---------|
| `STRIPE_SECRET_KEY` | Your Stripe test/live key | `sk_test_xxxxx` |

3. Click **Save**
4. Redeploy if already deployed

### Finding Your Stripe Secret Key:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **API Keys**
3. Copy the **Secret key** (starts with `sk_test_` or `sk_live_`)

## What's Configured

### vercel.json
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ Framework: Vite
- ✅ API functions: `/api/**/*.ts`
- ✅ Node.js runtime: 20.x
- ✅ SPA rewrites: All routes → `/index.html`

### API Functions
- `/api/create-payment-intent.ts` - Stripe payment endpoint
- Uses Vercel serverless functions (auto-scaled)
- URL: `https://your-domain.vercel.app/api/create-payment-intent`

### Frontend
- StripePayment.tsx updated to use `/api/create-payment-intent`
- Works on both Vercel and local development

## Testing Payment Flow

After deployment:

1. Log in to your app
2. Click "Buy Course"
3. Payment button should appear
4. Complete test payment with Stripe test card: `4242 4242 4242 4242`
5. Transaction should be recorded in Firestore

## Vercel Free Tier Includes

✅ **Unlimited deployments** from Git  
✅ **Auto-deploys** on every push  
✅ **Free HTTPS/TLS**  
✅ **Global CDN** for fast delivery  
✅ **Serverless functions** (no need to manage servers)  
✅ **100 GB bandwidth/month**  
✅ **Web Analytics** (free basic plan)  
✅ **Automatic scaling**

## Comparing Netlify vs Vercel

| Feature | Netlify | Vercel |
|---------|---------|--------|
| **Deployment** | GitHub integration | GitHub integration |
| **Free tier** | Yes | Yes |
| **Functions** | `/.netlify/functions/` | `/api/` |
| **Bandwidth** | 100 GB/month | 100 GB/month |
| **Scaling** | Automatic | Automatic |
| **Best for** | General static sites | Next.js & serverless |

Both are excellent. Vercel is slightly better for API-heavy apps.

## Troubleshooting

### 502 Error on Payment

**Problem:** "Failed to load resource: the server responded with a status of 502"

**Solution:**
1. Check env variable is set: **Project Settings** → **Environment Variables**
2. Verify `STRIPE_SECRET_KEY` starts with `sk_`
3. Redeploy: **Deployments** → **Redeploy**
4. Check function logs: **Deployments** → Click deployment → **Logs**

### Images Not Loading

Check that images are in `public/img/` directory:
```
project-root/
├── public/
│   └── img/
│       ├── logo.png
│       ├── 4099329.jpg
│       └── ...
```

Vercel serves `public/` folder as static assets at `/` root.

### Database Errors

Firebase and Firestore are separate from Vercel:
- ✅ No environment variables needed for Firebase (config in code)
- ✅ Configure Firebase credentials in `firebase-applet-config.json`
- ✅ Deploy Firestore rules separately via Firebase CLI

## Custom Domain

To use a custom domain (example: `hestim.ma`):

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Enter your domain: `hestim.ma`
3. Follow DNS configuration steps
4. It will be HTTPS automatically

## Performance Monitoring

Vercel provides free Analytics:
- Dashboard → **Analytics** tab
- View page load times
- See which functions are slow
- Monitor bandwidth usage

## Local Development

Payment functions work in production only. For local testing:

```bash
npm run dev
```

Frontend will load, but payment function will show dev message.

To test locally with actual functions:
```bash
vercel dev
```

This runs Vercel environment locally (requires Vercel CLI installed).

## Reference

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Serverless Functions in Vercel](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Connecting to GitHub](https://vercel.com/docs/concepts/git)

