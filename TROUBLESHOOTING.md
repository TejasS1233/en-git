# GitHub Actions Troubleshooting Guide

This guide helps resolve common issues with the en-git CI/CD pipeline.

## 🔐 Vercel Authorization Issues

### Problem: "Authorization required to deploy"

**Root Cause**: Missing or incorrect GitHub secrets for Vercel deployment.

### Solution:

1. **Check GitHub Secrets Configuration**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Ensure these secrets are configured:
     - `VERCEL_TOKEN`
     - `VERCEL_SCOPE`
     - `VERCEL_PROJECT_ID`
     - `VERCEL_ORG_ID`
     - `VERCEL_SERVER_PROJECT_ID` (for server deployment)

2. **Get Vercel Credentials**
   ```bash
   # Get Vercel Token
   # Go to: https://vercel.com/account/tokens
   # Create new token with appropriate permissions
   
   # Get Project IDs
   # Go to: https://vercel.com/dashboard
   # Select project → Settings → General → Project ID
   
   # Get Organization ID
   # Go to: https://vercel.com/account/team
   # Copy Team ID (this is your organization ID)
   ```

3. **Verify Secrets in GitHub**
   - Repository → Settings → Secrets and variables → Actions
   - Add/update each secret with correct values

## 🔒 Security Scan Failures

### Problem: Security scans failing

**Common Issues:**
- Missing `SNYK_TOKEN`
- License compliance issues
- Dependency vulnerabilities
- Missing Dockerfile for container scans

### Solutions:

#### 1. Snyk Token Missing
```bash
# Get Snyk Token
# Go to: https://app.snyk.io/account
# Copy your API token
# Add as GitHub secret: SNYK_TOKEN
```

#### 2. License Compliance Issues
The workflow now includes `continue-on-error: true` for license checks, but you can:
- Review dependencies with incompatible licenses
- Update `--onlyAllow` list in security.yml
- Add exceptions for specific packages

#### 3. Dependency Vulnerabilities
```bash
# Check vulnerabilities locally
cd client && npm audit
cd server && npm audit

# Fix high/critical issues
npm audit fix
```

#### 4. Container Scan Issues
- Container scan is now disabled (no Dockerfile present)
- Add `continue-on-error: true` to prevent failures

## 🚀 Build Failures

### Problem: Build steps failing

**Common Issues:**
- Missing dependencies
- Node.js version mismatch
- Build script errors

### Solutions:

#### 1. Check Package.json Scripts
```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite",
    "test": "vitest"
  }
}
```

#### 2. Verify Node.js Version
```yaml
# In workflow files, ensure:
node-version: '18'
```

#### 3. Check Dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 🔧 Workflow Configuration Issues

### Problem: Workflow syntax errors

**Common Issues:**
- YAML indentation problems
- Missing required fields
- Incorrect secret references

### Solutions:

#### 1. Validate YAML Syntax
```bash
# Use online YAML validator
# Or check GitHub Actions tab for syntax errors
```

#### 2. Check Secret References
```yaml
# Correct format:
env:
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}

# Incorrect format:
env:
  VERCEL_TOKEN: secrets.VERCEL_TOKEN
```

## 📊 Performance Test Failures

### Problem: Lighthouse CI failing

**Common Issues:**
- Missing `.lighthouserc.json`
- Build artifacts not found
- Performance thresholds too strict

### Solutions:

#### 1. Create Lighthouse Config
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.8}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

#### 2. Check Build Artifacts
```yaml
# Ensure build step runs before performance test
needs: [build-client]
```

## 🐛 Common Error Messages

### "No such file or directory"
- **Cause**: Missing files or incorrect paths
- **Fix**: Check file paths in workflow steps

### "Permission denied"
- **Cause**: Insufficient GitHub permissions
- **Fix**: Check repository settings and workflow permissions

### "Resource not accessible"
- **Cause**: Missing secrets or incorrect API tokens
- **Fix**: Verify all required secrets are configured

### "Build failed"
- **Cause**: Code compilation errors
- **Fix**: Check build logs and fix code issues

## 🔍 Debugging Steps

### 1. Check Workflow Logs
- Go to Actions tab in GitHub
- Click on failed workflow
- Review step-by-step logs

### 2. Test Locally
```bash
# Test build locally
cd client && npm run build
cd server && npm run build

# Test Vercel CLI
vercel --version
vercel login
```

### 3. Validate Secrets
```bash
# Test Vercel authentication
vercel whoami
```

### 4. Check Environment Variables
```bash
# Verify environment setup
echo $VERCEL_TOKEN
echo $VERCEL_PROJECT_ID
```

## 📞 Getting Help

### 1. Check Documentation
- [Vercel Deployment Setup](./VERCEL_DEPLOYMENT_SETUP.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### 2. Review Logs
- Always check the Actions tab for detailed error messages
- Look for specific error codes and messages

### 3. Common Solutions
- Restart failed workflows
- Update secrets if expired
- Check for typos in configuration

## 🚨 Emergency Fixes

### Quick Fix for Vercel Issues
```yaml
# Add to workflow step:
continue-on-error: true
```

### Quick Fix for Security Scans
```yaml
# Add to security workflow:
continue-on-error: true
```

### Disable Problematic Steps
```yaml
# Comment out problematic steps temporarily
# - name: Problematic Step
#   run: echo "Disabled"
```

---

**Note**: Always test changes in a separate branch before merging to main.
