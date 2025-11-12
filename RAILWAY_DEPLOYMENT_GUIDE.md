# Railway Deployment Guide for Plex Random Picker

This guide provides instructions for deploying the plex-random-picker application to Railway.

## Prerequisites

1. A Railway account (sign up at https://railway.app)
2. GitHub account connected to Railway
3. Railway API token (for automated deployment)

## Method 1: Automated Deployment (Recommended)

### Step 1: Get a Railway API Token

1. Go to https://railway.app and log in
2. Click on your profile in the top right
3. Select "Account Settings"
4. Navigate to "Tokens" section
5. Click "Create Token"
6. Give it a name (e.g., "CLI Deployment")
7. Copy the token

### Step 2: Run the Deployment Script

```bash
# Set your Railway API token
export RAILWAY_TOKEN='your-token-here'

# Run the deployment script
./railway-deploy.sh
```

The script will:
- Create a new Railway project
- Connect your GitHub repository
- Configure environment variables
- Set up build and start commands
- Trigger the initial deployment
- Provide you with the deployment URL

### Step 3: Monitor Deployment

After running the script, visit the Railway dashboard URL provided to monitor the deployment progress.

## Method 2: Manual Deployment via Railway Dashboard

### Step 1: Create a New Project

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select the repository: `Alfastudios/plex-random-picker`
4. Click "Deploy Now"

### Step 2: Configure Environment Variables

In the Railway dashboard:

1. Click on your deployed service
2. Go to the "Variables" tab
3. Add the following environment variables:

```
VITE_PLEX_URL=http://192.168.1.88:32400
VITE_PLEX_TOKEN=o-CQNS6jTNt-3uihuSey
JWT_SECRET=tu-super-secreto-cambiar-en-produccion
```

### Step 3: Configure Build Settings

The application includes a `nixpacks.toml` file that automatically configures:
- Build command: `npm run build`
- Start command: `npm start`

If you need to override these:

1. Click on your service
2. Go to "Settings" tab
3. Find "Build & Deploy" section
4. Set custom commands if needed

### Step 4: Deploy

1. Railway will automatically deploy on push to the main branch
2. You can also manually trigger a deployment from the dashboard
3. Monitor the deployment logs for any issues

### Step 5: Access Your Application

1. Once deployed, Railway will provide a domain
2. Click on the "Settings" tab
3. Under "Domains", you'll see your Railway-provided domain
4. Access your application at: `https://your-app.up.railway.app`

## Method 3: Manual Deployment via Railway API

If you want to use the Railway API directly without the script:

### 1. Authenticate

```bash
export RAILWAY_TOKEN='your-token-here'
```

### 2. Create Project

```bash
curl --request POST \
  --url https://backboard.railway.com/graphql/v2 \
  --header "Authorization: Bearer $RAILWAY_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "mutation { projectCreate(input: { name: \"plex-random-picker\" }) { id name } }"
  }'
```

### 3. Connect GitHub Repository

Use the `githubRepoDeploy` mutation with your project ID:

```bash
curl --request POST \
  --url https://backboard.railway.com/graphql/v2 \
  --header "Authorization: Bearer $RAILWAY_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "mutation { githubRepoDeploy(input: { projectId: \"YOUR_PROJECT_ID\", repo: \"Alfastudios/plex-random-picker\", branch: \"main\" }) { projectId serviceId } }"
  }'
```

### 4. Set Environment Variables

```bash
curl --request POST \
  --url https://backboard.railway.com/graphql/v2 \
  --header "Authorization: Bearer $RAILWAY_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "mutation { variableCollectionUpsert(input: { projectId: \"YOUR_PROJECT_ID\", environmentId: \"YOUR_ENV_ID\", serviceId: \"YOUR_SERVICE_ID\", variables: { VITE_PLEX_URL: \"http://192.168.1.88:32400\", VITE_PLEX_TOKEN: \"o-CQNS6jTNt-3uihuSey\", JWT_SECRET: \"tu-super-secreto-cambiar-en-produccion\" } }) }"
  }'
```

## Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_PLEX_URL` | `http://192.168.1.88:32400` | Your Plex server URL |
| `VITE_PLEX_TOKEN` | `o-CQNS6jTNt-3uihuSey` | Plex authentication token |
| `JWT_SECRET` | `tu-super-secreto-cambiar-en-produccion` | Secret for JWT token generation |

## Build Configuration

The project uses the following configuration (defined in `nixpacks.toml`):

- **Setup**: Node.js and npm
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

## Troubleshooting

### Deployment Fails

1. Check the deployment logs in the Railway dashboard
2. Verify all environment variables are set correctly
3. Ensure the GitHub repository is accessible
4. Check that the build and start commands are correct

### Build Errors

1. Verify `package.json` has the correct scripts:
   - `"build"`: Build command
   - `"start"`: Start command
2. Check that all dependencies are listed in `package.json`
3. Review build logs for specific error messages

### Runtime Errors

1. Check the application logs in Railway dashboard
2. Verify environment variables are correct
3. Ensure the Plex server URL is accessible from Railway
4. Check that the JWT_SECRET is set

### Cannot Access Deployment

1. Verify the domain is active in Railway settings
2. Check if the service is running (not crashed)
3. Review logs for startup errors
4. Ensure the correct port is being used (Railway sets PORT env var)

## Additional Resources

- Railway Documentation: https://docs.railway.com
- Railway Public API: https://docs.railway.com/guides/public-api
- Railway Templates: https://railway.app/templates
- Railway Discord: https://discord.gg/railway

## Security Notes

1. **Change JWT_SECRET in production**: The current value is a placeholder
2. **Protect your API tokens**: Never commit them to version control
3. **Use environment variables**: Don't hardcode sensitive data
4. **Review access permissions**: Ensure only authorized users can access the deployment

## Support

If you encounter issues:
1. Check the Railway documentation
2. Review the deployment logs
3. Consult the Railway Discord community
4. Check GitHub issues for the project

## Next Steps After Deployment

1. Test the application thoroughly
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Set up CI/CD for automatic deployments
5. Review and optimize resource usage
6. Implement proper security measures
