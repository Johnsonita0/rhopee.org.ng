# Vercel Deployment Guide for T-Shirts Village

## Project Information
- **Vercel Project ID**: prj_37yowEj2RLXg12DgegWu6OTMgCyj
- **Repository**: git@github.com:Johnsonita0/tshirtvilage.git
- **Branch**: main

---

## Pre-Deployment Checklist

- [x] Git repository initialized
- [x] Remote configured: `git@github.com:Johnsonita0/tshirtvilage.git`
- [x] Environment variables configured (`.env.local`)
- [x] Build verified: `npm run build` ✓
- [x] Branding updated (T-Shirts Village)
- [x] Internship form implemented
- [ ] Supabase tables created (see SUPABASE_SETUP.md)
- [ ] Deployed to Vercel

---

## Deployment Steps

### Step 1: Commit Your Changes

```bash
cd c:\Users\imeob\Documents\JFOLDER\TshirtVilage\TshirtVilage

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "chore: T-Shirts Village branding and internship program setup

- Updated package name to tshirtvilage-internship
- Changed color scheme from green to navy blue and orange
- Adapted EventRegistrationPage for internship applications
- Updated branding across all pages and components
- Configured Supabase and Vercel credentials
- Added internship program details and training tracks"

# Push to GitHub
git push -u origin main
```

### Step 2: Set Up Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: **T-Shirts Village** (prj_37yowEj2RLXg12DgegWu6OTMgCyj)
3. Navigate to **Settings** → **Environment Variables**
4. Add the following variables:

```
VITE_SUPABASE_URL=https://tuufdlrkwrduuyzmadfa.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_wgzOXlGg9o10Pcl7Vu9yRA_bIvXCGMB
SENDGRID_API_KEY=your_sendgrid_key
NEWSLETTER_API_KEY=your_newsletter_key
NEWSLETTER_LIST_ID=your_list_id
```

### Step 3: Configure Build Settings (if needed)

The `vercel.json` already has correct configuration:
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

### Step 4: Deploy

Option A: **Automatic Deployment** (Recommended)
- Once you push to `main` branch, Vercel will automatically detect changes and deploy

Option B: **Manual Deployment**
- Go to Vercel Dashboard
- Click "Deploy" or redeploy any existing deployment

---

## Build Configuration

The `vercel.json` is pre-configured for optimal SPA routing:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

This ensures:
- React Router works correctly (SPA routing)
- Static assets are cached
- 404s redirect to index.html for client-side routing

---

## Environment Variables Reference

| Variable | Value | Required | Purpose |
|----------|-------|----------|---------|
| VITE_SUPABASE_URL | https://tuufdlrkwrduuyzmadfa.supabase.co | ✓ | Supabase API endpoint |
| VITE_SUPABASE_ANON_KEY | sb_publishable_... | ✓ | Public Supabase authentication key |
| SENDGRID_API_KEY | (your key) | | Email notifications |
| NEWSLETTER_API_KEY | (your key) | | Newsletter service |
| NEWSLETTER_LIST_ID | (your list id) | | Newsletter list |

---

## Deployment Output

After pushing, you'll see:
1. Vercel detects your push
2. Runs build: `npm run build`
3. Generates optimized assets in `dist/`
4. Deploys to Vercel's CDN
5. Creates a public URL

Example:
```
✓ Production deployment ready
  URL: https://tshirtvilage.vercel.app
```

---

## Verification

Once deployed:

1. **Home Page**: Should show T-Shirts Village branding with navy/orange colors
2. **Internship Registration**: Navigate to `/more` to see the registration form
3. **Color Scheme**: Should be navy blue (#003d99) with orange accents (#ff8c00)
4. **Database**: Registrations should appear in Supabase `training_registrations` table

---

## Rollback / Revert

If something goes wrong:

1. Go to Vercel Dashboard → Deployments
2. Find the deployment before your change
3. Click "Promote to Production" to rollback

Or revert in Git:
```bash
git revert HEAD
git push origin main
```

---

## Monitoring

After deployment:

1. Check Vercel Analytics: **Dashboard** → **Analytics**
2. Monitor Supabase logs: **Supabase Dashboard** → **Logs**
3. Watch for registration errors in browser console (F12)

---

## Support & Troubleshooting

**Build fails with "Cannot find VITE_SUPABASE_URL"**
- Ensure environment variables are set in Vercel Settings, not just locally

**Page shows blank or 404**
- Clear browser cache (Ctrl+Shift+Del)
- Check Vercel Logs for build errors

**Registrations not saving**
- Verify Supabase tables exist (see SUPABASE_SETUP.md)
- Check Supabase credentials in Vercel settings
- Test connection: `npm run dev` and try form submission locally

---

## Next Steps

1. ✅ Git repository configured
2. ✅ Vercel project created (ID: prj_37yowEj2RLXg12DgegWu6OTMgCyj)
3. ⏳ Create Supabase tables (see SUPABASE_SETUP.md)
4. ⏳ Push to GitHub and trigger Vercel deployment
5. ⏳ Verify deployment at vercel.app URL
