# Quick Start: Deploy to Railway

This is a streamlined guide to get your Plex Random Picker deployed to Railway in minutes.

## Prerequisites

You need a Railway API token. Here's how to get one:

1. Go to https://railway.app
2. Sign up or log in
3. Connect your GitHub account if not already connected
4. Click your profile → Account Settings → Tokens
5. Create a new token and copy it

## Deploy in 3 Steps

### Step 1: Set Your Railway Token

```bash
export RAILWAY_TOKEN='paste-your-token-here'
```

### Step 2: Run the Deployment Script

```bash
cd /Users/alfastudios/plex-random-picker
./railway-deploy.sh
```

### Step 3: Monitor and Access

The script will output:
- Project ID
- Service ID
- Dashboard URL
- Deployment URL (once available)

Visit the dashboard URL to monitor the deployment progress.

## What Gets Configured Automatically

The deployment script will:

1. Create a new Railway project named "plex-random-picker"
2. Connect it to the GitHub repository: `Alfastudios/plex-random-picker`
3. Set these environment variables:
   - `VITE_PLEX_URL=http://192.168.1.88:32400`
   - `VITE_PLEX_TOKEN=o-CQNS6jTNt-3uihuSey`
   - `JWT_SECRET=tu-super-secreto-cambiar-en-produccion`
4. Configure build command: `npm run build`
5. Configure start command: `npm start`
6. Trigger the initial deployment

## Expected Output

```
[INFO] Testing Railway authentication...
[SUCCESS] Authenticated as: Your Name (your@email.com)
[INFO] Creating Railway project...
[SUCCESS] Project created with ID: abc123...
[INFO] Fetching environment information...
[SUCCESS] Environment ID: env456...
[INFO] Creating service and connecting GitHub repository...
[SUCCESS] Service created with ID: svc789...
[INFO] Configuring environment variables...
[SUCCESS] Environment variables configured
[INFO] Triggering deployment...
[SUCCESS] Deployment triggered!

==========================================
DEPLOYMENT SUMMARY
==========================================

[SUCCESS] Project ID: abc123...
[SUCCESS] Service ID: svc789...
[SUCCESS] Environment ID: env456...

[INFO] Railway Dashboard: https://railway.app/project/abc123...
[SUCCESS] Deployment URL: https://your-app.up.railway.app

[INFO] Environment Variables Configured:
  - VITE_PLEX_URL
  - VITE_PLEX_TOKEN
  - JWT_SECRET
```

## Troubleshooting

### Script Says "RAILWAY_TOKEN not set"
Make sure you exported it correctly:
```bash
export RAILWAY_TOKEN='your-actual-token'
echo $RAILWAY_TOKEN  # Should display your token
```

### Authentication Failed
- Check that your token is valid
- Make sure you copied the entire token
- Try creating a new token

### Deployment URL Not Available
- This is normal - it takes a few minutes
- Visit the dashboard URL to monitor progress
- The URL will appear once the deployment completes

### Build Fails
1. Check the logs in the Railway dashboard
2. Verify `package.json` has the correct scripts
3. Ensure all dependencies are listed

## Alternative: Manual Deployment

If the automated script doesn't work, you can deploy manually:

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `Alfastudios/plex-random-picker`
4. Add the environment variables manually
5. Deploy

See `RAILWAY_DEPLOYMENT_GUIDE.md` for detailed manual instructions.

## Next Steps

After successful deployment:

1. Visit your deployment URL
2. Test the application
3. Set up a custom domain (optional)
4. Change the `JWT_SECRET` to a secure value
5. Configure automatic deployments on push

## Need Help?

- Full guide: See `RAILWAY_DEPLOYMENT_GUIDE.md`
- Railway docs: https://docs.railway.com
- Railway Discord: https://discord.gg/railway
