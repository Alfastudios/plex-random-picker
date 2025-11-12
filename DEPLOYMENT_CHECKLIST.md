# Railway Deployment Checklist

Use this checklist to ensure a successful deployment of your Plex Random Picker application to Railway.

## Pre-Deployment Checklist

- [ ] Have a Railway account (sign up at https://railway.app)
- [ ] GitHub account connected to Railway
- [ ] Repository accessible: https://github.com/Alfastudios/plex-random-picker
- [ ] Reviewed environment variable values
- [ ] Read QUICK_START.md or RAILWAY_DEPLOYMENT_GUIDE.md

## Deployment Method

Choose one:

### Option A: Automated Deployment (Recommended)

- [ ] Obtained Railway API token from https://railway.app/account/tokens
- [ ] Exported token: `export RAILWAY_TOKEN='your-token'`
- [ ] Verified token is set: `echo $RAILWAY_TOKEN`
- [ ] Navigated to project directory: `cd /Users/alfastudios/plex-random-picker`
- [ ] Script is executable: `ls -l railway-deploy.sh` (should show -rwxr-xr-x)
- [ ] Ran deployment script: `./railway-deploy.sh`
- [ ] Noted Project ID from output
- [ ] Noted Service ID from output
- [ ] Noted Environment ID from output
- [ ] Noted Dashboard URL from output
- [ ] Noted Deployment URL from output

### Option B: Manual Deployment

- [ ] Visited https://railway.app/new
- [ ] Clicked "Deploy from GitHub repo"
- [ ] Selected Alfastudios/plex-random-picker repository
- [ ] Clicked "Deploy Now"
- [ ] Navigated to Variables tab
- [ ] Added VITE_PLEX_URL = http://192.168.1.88:32400
- [ ] Added VITE_PLEX_TOKEN = o-CQNS6jTNt-3uihuSey
- [ ] Added JWT_SECRET = tu-super-secreto-cambiar-en-produccion
- [ ] Verified nixpacks.toml is being used
- [ ] Deployment started automatically
- [ ] Noted deployment URL

## Post-Deployment Verification

- [ ] Visited the Railway dashboard
- [ ] Checked deployment status (should be "Active" or "Deployed")
- [ ] Reviewed build logs (no errors)
- [ ] Reviewed runtime logs (application started)
- [ ] Accessed the deployment URL
- [ ] Application loads successfully
- [ ] Tested Plex connection
- [ ] Verified random picker functionality works

## Security & Configuration

- [ ] Changed JWT_SECRET to a secure value
  - [ ] Generated secure secret: `openssl rand -base64 32`
  - [ ] Updated in Railway Variables tab
  - [ ] Saved changes
  - [ ] Redeployed if necessary

- [ ] Verified environment variables are correct
  - [ ] VITE_PLEX_URL points to correct Plex server
  - [ ] VITE_PLEX_TOKEN is valid
  - [ ] JWT_SECRET is strong and unique

- [ ] Reviewed security settings
  - [ ] Railway token not committed to git
  - [ ] Environment variables not hardcoded
  - [ ] Access permissions reviewed

## Optional Enhancements

- [ ] Set up custom domain
  - [ ] Added domain in Railway settings
  - [ ] Configured DNS records
  - [ ] Verified SSL certificate

- [ ] Configured CI/CD
  - [ ] Enabled automatic deployments on push
  - [ ] Set up deployment notifications
  - [ ] Tested automatic deployment

- [ ] Monitoring & Alerts
  - [ ] Set up uptime monitoring
  - [ ] Configured error alerts
  - [ ] Set up usage alerts

- [ ] Performance Optimization
  - [ ] Reviewed resource usage
  - [ ] Optimized build time
  - [ ] Checked response times

## Troubleshooting (If Issues Occur)

If deployment fails, check:

- [ ] Railway dashboard for error messages
- [ ] Build logs for compilation errors
- [ ] Runtime logs for startup errors
- [ ] Environment variables are set correctly
- [ ] GitHub repository is accessible
- [ ] nixpacks.toml configuration is correct
- [ ] package.json has correct scripts
- [ ] All dependencies are listed

## Documentation Reference

Consult these files if you need help:

- [ ] QUICK_START.md - Quick 3-step guide
- [ ] RAILWAY_DEPLOYMENT_GUIDE.md - Comprehensive manual
- [ ] DEPLOYMENT_SUMMARY.md - Technical overview
- [ ] README_DEPLOYMENT.md - Quick reference

## Final Verification

- [ ] Application is live and accessible
- [ ] URL is bookmarked: ___________________________
- [ ] Dashboard URL is bookmarked: ___________________________
- [ ] Deployment date recorded: ___________________________
- [ ] Project ID saved: ___________________________
- [ ] Service ID saved: ___________________________
- [ ] All credentials stored securely
- [ ] Team members notified (if applicable)

## Success Criteria

Your deployment is successful when:

1. Application is accessible via the Railway URL
2. Plex integration works correctly
3. Random picker functionality operates as expected
4. No errors in logs
5. Environment variables are configured
6. Security best practices are followed

## Support Contacts

If you need help:

- Railway Documentation: https://docs.railway.com
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/Alfastudios/plex-random-picker/issues

## Notes

Use this space for deployment-specific notes:

___________________________________________________________________________

___________________________________________________________________________

___________________________________________________________________________

___________________________________________________________________________

___________________________________________________________________________

## Deployment Completed

- [ ] All checklist items completed
- [ ] Application is live and working
- [ ] Documentation reviewed
- [ ] Security measures implemented
- [ ] Deployment is production-ready

Deployment Date: _____________________

Deployed By: _____________________

Final URL: _____________________

Status: [ ] Success  [ ] Needs Attention  [ ] Failed
