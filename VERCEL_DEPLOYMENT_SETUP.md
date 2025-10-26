# Vercel Deployment Setup Guide

This guide provides step-by-step instructions for setting up Vercel deployment for the en-git CI/CD pipeline.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Ensure your repository is connected to GitHub
3. **Vercel CLI**: Install globally with `npm install -g vercel`

## Step 1: Create Vercel Projects

### For Client Application
```bash
cd client
vercel login
vercel --prod
```

### For Server Application
```bash
cd server
vercel login
vercel --prod
```

## Step 2: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

### Required Secrets
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_SCOPE`: Your Vercel team/organization scope
- `VERCEL_PROJECT_ID`: Client project ID from Vercel dashboard
- `VERCEL_SERVER_PROJECT_ID`: Server project ID from Vercel dashboard
- `VERCEL_ORG_ID`: Your Vercel organization ID

### Optional Secrets
- `SLACK_WEBHOOK`: Slack webhook URL for deployment notifications

## Step 3: Get Vercel Credentials

### Get Vercel Token
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token with appropriate permissions
3. Copy the token value

### Get Project IDs
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → General
4. Copy the Project ID

### Get Organization ID
1. Go to [Vercel Team Settings](https://vercel.com/account/team)
2. Copy the Team ID (this is your organization ID)

## Step 4: Environment Variables

### Client Environment Variables
Set these in your Vercel project dashboard:

```bash
VITE_GITHUB_API_URL=https://api.github.com
VITE_GITHUB_TOKEN=your_github_token
VITE_SNYK_TOKEN=your_snyk_token
NODE_ENV=production
```

### Server Environment Variables
Set these in your Vercel project dashboard:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=your_database_url
API_SECRET=your_api_secret
```

## Step 5: Configure GitHub Environments

### Create Environments
1. Go to your GitHub repository
2. Navigate to Settings → Environments
3. Create two environments:
   - `staging`
   - `production`

### Set Environment Secrets
For each environment, add the Vercel secrets:
- `VERCEL_TOKEN`
- `VERCEL_SCOPE`
- `VERCEL_PROJECT_ID`
- `VERCEL_SERVER_PROJECT_ID`
- `VERCEL_ORG_ID`

## Step 6: Test Deployment

### Manual Test
```bash
# Test client deployment
cd client
vercel --token=$VERCEL_TOKEN --scope=$VERCEL_SCOPE --prod

# Test server deployment
cd server
vercel --token=$VERCEL_TOKEN --scope=$VERCEL_SCOPE --prod
```

### Automated Test
1. Push to `develop` branch to trigger staging deployment
2. Push to `main` branch to trigger production deployment
3. Check GitHub Actions logs for deployment status

## Step 7: Monitor Deployments

### Vercel Dashboard
- Monitor deployment status
- View deployment logs
- Check performance metrics

### GitHub Actions
- Monitor CI/CD pipeline execution
- View deployment logs
- Check for any failures

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
```
Error: Authentication failed
```
**Solution**: Verify your `VERCEL_TOKEN` is correct and has proper permissions.

#### 2. Project Not Found
```
Error: Project not found
```
**Solution**: Verify your `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` are correct.

#### 3. Build Failures
```
Error: Build failed
```
**Solution**: Check your `package.json` scripts and ensure all dependencies are properly configured.

#### 4. Environment Variables Missing
```
Error: Environment variable not found
```
**Solution**: Ensure all required environment variables are set in your Vercel project settings.

### Debug Commands

```bash
# Check Vercel CLI version
vercel --version

# List all projects
vercel projects list

# Check project details
vercel projects inspect <project-id>

# View deployment logs
vercel logs <deployment-url>
```

## Advanced Configuration

### Custom Domains
1. Go to your Vercel project settings
2. Navigate to Domains
3. Add your custom domain
4. Configure DNS settings

### Environment-Specific Configurations
- **Staging**: Use `--env=staging` flag for staging deployments
- **Production**: Use `--prod` flag for production deployments

### Performance Optimization
- Enable Vercel Analytics
- Configure Edge Functions if needed
- Set up proper caching strategies

## Security Best Practices

1. **Never commit secrets**: Use GitHub Secrets for sensitive data
2. **Rotate tokens regularly**: Update Vercel tokens periodically
3. **Limit permissions**: Use minimal required permissions for tokens
4. **Monitor access**: Regularly review who has access to your Vercel projects

## Support

For additional help:
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

---

**Note**: This setup assumes you have both client and server applications. Adjust the configuration based on your specific project structure.
