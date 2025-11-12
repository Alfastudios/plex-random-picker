# Railway Deployment Summary

## Overview

I have created a comprehensive automated deployment solution for deploying the `plex-random-picker` repository to Railway. This document summarizes what has been prepared and how to execute the deployment.

## What Has Been Created

### 1. Automated Deployment Script
**File**: `/Users/alfastudios/plex-random-picker/railway-deploy.sh`

A fully automated bash script that:
- Authenticates with Railway API
- Creates a new Railway project
- Connects your GitHub repository (`Alfastudios/plex-random-picker`)
- Configures environment variables
- Deploys the application
- Returns the deployment URL

### 2. Railway Configuration
**File**: `/Users/alfastudios/plex-random-picker/nixpacks.toml`

Configures the build process:
- Install dependencies for both root and client
- Build command: `npm run build`
- Start command: `npm start`

### 3. Documentation

Three comprehensive guides have been created:

- **QUICK_START.md**: Streamlined 3-step deployment guide
- **RAILWAY_DEPLOYMENT_GUIDE.md**: Detailed manual and automated deployment instructions
- **DEPLOYMENT_SUMMARY.md**: This file - overview and summary

## Configuration Details

### GitHub Repository
- **URL**: https://github.com/Alfastudios/plex-random-picker
- **Branch**: main
- **Owner**: Alfastudios

### Environment Variables (Pre-configured)
```
VITE_PLEX_URL=http://192.168.1.88:32400
VITE_PLEX_TOKEN=o-CQNS6jTNt-3uihuSey
JWT_SECRET=tu-super-secreto-cambiar-en-produccion
```

### Build Configuration
```
Install: npm install && cd client && npm install
Build: npm run build
Start: npm start
```

## Important Limitation: Railway API Token Required

Railway's API requires authentication with a Railway API token. The GitHub credentials provided cannot be used directly with Railway's API, as Railway has its own authentication system.

### Why GitHub Credentials Cannot Be Used

1. **Separate Systems**: Railway and GitHub are separate platforms with their own authentication
2. **OAuth Integration**: Railway connects to GitHub via OAuth, not username/password
3. **API Security**: Railway's GraphQL API requires a Railway-issued token
4. **GitHub Token Scope**: GitHub tokens don't have authority over Railway services

### Railway Uses GitHub OAuth

When you connect Railway to GitHub:
1. Railway redirects you to GitHub for authorization
2. You approve Railway's access to your repositories
3. Railway stores the OAuth connection
4. This cannot be automated with username/password

## How to Deploy

### AUTOMATED DEPLOYMENT (Recommended)

**Step 1: Get Railway API Token**
1. Visit https://railway.app
2. Sign up/login with your GitHub account
3. Go to Account Settings → Tokens
4. Create a new token
5. Copy the token

**Step 2: Set Token and Deploy**
```bash
export RAILWAY_TOKEN='your-railway-token-here'
cd /Users/alfastudios/plex-random-picker
./railway-deploy.sh
```

**Step 3: Monitor**
The script will output the dashboard URL and deployment URL.

### MANUAL DEPLOYMENT (Alternative)

If you prefer not to use the API:

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Authorize Railway to access your GitHub
4. Select the `Alfastudios/plex-random-picker` repository
5. Click "Deploy Now"
6. Add environment variables in the Variables tab:
   - VITE_PLEX_URL
   - VITE_PLEX_TOKEN
   - JWT_SECRET
7. The build will start automatically

The `nixpacks.toml` file will ensure proper build configuration.

## What Happens During Deployment

1. **Project Creation**: A new Railway project is created
2. **Repository Connection**: Links to `Alfastudios/plex-random-picker` on GitHub
3. **Environment Setup**: Sets the 3 required environment variables
4. **Build Process**:
   - Installs root dependencies
   - Installs client dependencies
   - Runs `npm run build` to build the client
5. **Deployment**: Starts the server with `npm start`
6. **Domain Assignment**: Railway assigns a `.up.railway.app` domain

## Expected Timeline

- Script execution: ~30-60 seconds
- Initial deployment: ~3-5 minutes
- Total time to live URL: ~5-6 minutes

## Post-Deployment

After successful deployment, you will receive:

1. **Project ID**: Unique identifier for your Railway project
2. **Service ID**: Unique identifier for the deployed service
3. **Environment ID**: Unique identifier for the production environment
4. **Dashboard URL**: Direct link to manage your deployment
5. **Deployment URL**: Live URL where your app is accessible (format: `https://[random].up.railway.app`)

## Verification Steps

Once deployed, verify the deployment:

1. Visit the deployment URL
2. Check that the Plex connection works
3. Test the random picker functionality
4. Monitor logs for any errors in Railway dashboard

## Security Recommendations

### Critical: Change JWT_SECRET in Production

The current JWT_SECRET (`tu-super-secreto-cambiar-en-produccion`) is a placeholder. To change it:

1. Go to Railway dashboard → Your project
2. Click on Variables tab
3. Update `JWT_SECRET` to a strong, random value
4. Generate one with: `openssl rand -base64 32`

### Protect Your Tokens

- Never commit the Railway API token to git
- Don't share the token publicly
- Rotate tokens periodically
- Use project-scoped tokens when possible

## Troubleshooting

### "RAILWAY_TOKEN not set"
```bash
# Make sure you exported the token
export RAILWAY_TOKEN='your-token'
# Verify it's set
echo $RAILWAY_TOKEN
```

### "Authentication failed"
- Token may be invalid or expired
- Create a new token in Railway settings
- Ensure no extra spaces when copying

### "Failed to create project"
- Check your Railway account has project creation permissions
- Verify you're not at the project limit for your plan
- Try again or use manual deployment

### "Failed to create service"
- Railway needs GitHub OAuth access
- Go to https://railway.app and manually connect GitHub
- Then retry the script

### Build Fails
- Check deployment logs in Railway dashboard
- Verify `package.json` scripts are correct
- Ensure all dependencies are listed
- Check Node.js version compatibility

### Cannot Access Deployment URL
- Wait a few minutes for deployment to complete
- Check service status in Railway dashboard
- Review logs for startup errors
- Verify PORT environment variable is being used

## Files Created

All files are in `/Users/alfastudios/plex-random-picker/`:

1. `railway-deploy.sh` - Automated deployment script (executable)
2. `nixpacks.toml` - Railway build configuration
3. `QUICK_START.md` - Quick deployment guide
4. `RAILWAY_DEPLOYMENT_GUIDE.md` - Comprehensive manual
5. `DEPLOYMENT_SUMMARY.md` - This summary document

## Alternative Deployment Options

If Railway doesn't work for you, consider:

1. **Vercel**: For frontend deployments
2. **Heroku**: Traditional PaaS with similar workflow
3. **Render**: Railway alternative with free tier
4. **DigitalOcean App Platform**: Managed container platform
5. **Fly.io**: Edge deployment platform

## Next Steps

1. **Get Railway Token**: Visit https://railway.app/account/tokens
2. **Run Deployment**: Execute `./railway-deploy.sh`
3. **Monitor Progress**: Check the provided dashboard URL
4. **Test Application**: Visit the deployment URL
5. **Update Security**: Change JWT_SECRET to a secure value
6. **Set Up CI/CD**: Configure automatic deployments on push
7. **Custom Domain**: (Optional) Add your own domain in Railway settings

## Support Resources

- Railway Documentation: https://docs.railway.com
- Railway Public API Docs: https://docs.railway.com/guides/public-api
- Railway Discord Community: https://discord.gg/railway
- Railway Templates: https://railway.app/templates
- GitHub Repository: https://github.com/Alfastudios/plex-random-picker

## Summary

The deployment solution is ready to use. The main requirement is obtaining a Railway API token, which must be done through their web interface. Once you have the token, deployment is fully automated and takes approximately 5-6 minutes from start to finish.

The provided script handles all the complexity of the Railway API, including:
- GraphQL mutations for project creation
- Service configuration
- Environment variable management
- Deployment triggering
- Status monitoring

Simply get your Railway token and run the script to deploy your Plex Random Picker application.
