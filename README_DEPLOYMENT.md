# Plex Random Picker - Railway Deployment

## Quick Deploy to Railway

Deploy this application to Railway in 3 simple steps:

### Step 1: Get Your Railway Token
Visit https://railway.app/account/tokens and create a new token.

### Step 2: Deploy
```bash
export RAILWAY_TOKEN='your-token-here'
./railway-deploy.sh
```

### Step 3: Access Your App
The script will output your deployment URL. Visit it to use your Plex Random Picker!

## What's Included

This repository includes everything needed for automated Railway deployment:

- `railway-deploy.sh` - Fully automated deployment script
- `nixpacks.toml` - Build configuration
- `QUICK_START.md` - 3-step deployment guide
- `RAILWAY_DEPLOYMENT_GUIDE.md` - Comprehensive manual
- `DEPLOYMENT_SUMMARY.md` - Detailed overview

## Pre-Configured Settings

The deployment automatically configures:

**Environment Variables:**
- `VITE_PLEX_URL`: Your Plex server URL
- `VITE_PLEX_TOKEN`: Plex authentication token
- `JWT_SECRET`: JWT token secret

**Build Configuration:**
- Install: Dependencies for server and client
- Build: `npm run build`
- Start: `npm start`

## Need Help?

Choose the right guide for you:

- **New to Railway?** → Start with `QUICK_START.md`
- **Want full details?** → Read `RAILWAY_DEPLOYMENT_GUIDE.md`
- **Need an overview?** → Check `DEPLOYMENT_SUMMARY.md`

## Manual Deployment

Prefer to deploy manually?

1. Visit https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose this repository
4. Add environment variables
5. Deploy!

See `RAILWAY_DEPLOYMENT_GUIDE.md` for detailed manual steps.

## Repository Information

- **GitHub**: https://github.com/Alfastudios/plex-random-picker
- **Owner**: Alfastudios
- **Branch**: main

## Support

- Railway Docs: https://docs.railway.com
- Railway Discord: https://discord.gg/railway
- Railway Templates: https://railway.app/templates

---

Ready to deploy? Run `./railway-deploy.sh` and get your app live in minutes!
