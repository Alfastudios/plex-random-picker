# Railway Deployment - START HERE

Welcome! This guide will help you deploy your Plex Random Picker application to Railway.

## Quick Navigation

### I want to deploy RIGHT NOW
Read: **QUICK_START.md** (3-step guide, ~5 minutes)

### I want detailed instructions
Read: **RAILWAY_DEPLOYMENT_GUIDE.md** (comprehensive manual)

### I want to understand everything
Read: **DEPLOYMENT_SUMMARY.md** (technical overview)

### I want a step-by-step checklist
Read: **DEPLOYMENT_CHECKLIST.md** (interactive checklist)

## Fastest Path to Deployment

```bash
# 1. Get Railway token from https://railway.app/account/tokens
# 2. Run these commands:

export RAILWAY_TOKEN='your-token-here'
cd /Users/alfastudios/plex-random-picker
./railway-deploy.sh

# 3. Access your app at the URL provided by the script
```

## What's Included

This deployment package contains:

1. **railway-deploy.sh** - Automated deployment script
2. **nixpacks.toml** - Build configuration
3. **QUICK_START.md** - 3-step deployment guide
4. **RAILWAY_DEPLOYMENT_GUIDE.md** - Complete manual
5. **DEPLOYMENT_SUMMARY.md** - Technical documentation
6. **DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist
7. **README_DEPLOYMENT.md** - Quick reference
8. **DEPLOYMENT_COMPLETE.txt** - Summary of what was created
9. **START_HERE.md** - This file

## Two Deployment Options

### Option 1: Automated (Recommended)
1. Get Railway API token
2. Run `./railway-deploy.sh`
3. Done!

### Option 2: Manual
1. Visit https://railway.app/new
2. Deploy from GitHub repo
3. Configure environment variables
4. Done!

## Important: Railway Token Required

To use the automated deployment, you need a Railway API token.

Why? Railway and GitHub are separate platforms. The GitHub credentials cannot be used with Railway's API. You must get a token from Railway's dashboard.

How to get it:
1. Go to https://railway.app
2. Sign up/login
3. Account Settings > Tokens
4. Create new token
5. Copy it

This is a one-time setup!

## Pre-Configured Settings

The deployment automatically configures:

- **Repository**: https://github.com/Alfastudios/plex-random-picker
- **Environment Variables**:
  - VITE_PLEX_URL
  - VITE_PLEX_TOKEN
  - JWT_SECRET
- **Build**: npm run build
- **Start**: npm start

## Need Help?

Choose the right guide:

| I want to... | Read this |
|--------------|-----------|
| Deploy quickly | QUICK_START.md |
| Understand the process | RAILWAY_DEPLOYMENT_GUIDE.md |
| See technical details | DEPLOYMENT_SUMMARY.md |
| Follow a checklist | DEPLOYMENT_CHECKLIST.md |
| Get quick answers | README_DEPLOYMENT.md |

## Support

- Railway Docs: https://docs.railway.com
- Railway Discord: https://discord.gg/railway
- GitHub Repo: https://github.com/Alfastudios/plex-random-picker

## Ready to Deploy?

1. Choose your deployment method (automated or manual)
2. Follow the appropriate guide
3. Access your live application!

**Recommended**: Start with QUICK_START.md for the fastest deployment.

---

Good luck with your deployment!
