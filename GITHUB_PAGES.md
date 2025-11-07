# GitHub Pages Deployment Guide

This guide shows you how to deploy the demo application to GitHub Pages.

## 🌐 Live Demo URL

Once deployed, your demo will be available at:
**https://strikerh.github.io/ngx-workflow-designer/**

## 📋 Prerequisites

1. GitHub repository must be public (or have GitHub Pages enabled for private repos)
2. GitHub Pages must be enabled in repository settings
3. GitHub Actions workflow is configured (`.github/workflows/deploy-gh-pages.yml`)

## 🚀 Deployment Methods

### Method 1: Automatic Deployment (Recommended)

The GitHub Action will automatically deploy when you push to the `master` branch.

```bash
git add .
git commit -m "feat: add demo deployment"
git push origin master
```

The workflow will:
1. Build the demo app with correct base href
2. Upload artifacts to GitHub Pages
3. Deploy automatically

### Method 2: Manual Deployment via GitHub UI

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **Deploy Demo to GitHub Pages** workflow
4. Click **Run workflow** → **Run workflow**

### Method 3: Manual Deployment via CLI

If you prefer to deploy manually using `angular-cli-ghpages`:

```bash
# Install angular-cli-ghpages
npm install -g angular-cli-ghpages

# Build the production app
npm run build -- --base-href /ngx-workflow-designer/

# Deploy to GitHub Pages
npx angular-cli-ghpages --dir=dist/workflow-ui/browser
```

## ⚙️ Enable GitHub Pages

1. Go to your repository: https://github.com/strikerh/ngx-workflow-designer
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - Source: **GitHub Actions**
4. Click **Save**

## 🔍 Verify Deployment

After the GitHub Action completes:

1. Go to **Actions** tab in your repository
2. Check the workflow run status (should show green checkmark)
3. Visit: https://strikerh.github.io/ngx-workflow-designer/
4. Verify the demo loads correctly

## 🐛 Troubleshooting

### Demo doesn't load / 404 error

**Problem**: Base href might be incorrect.

**Solution**: Ensure build uses correct base href:
```bash
npm run build -- --base-href /ngx-workflow-designer/
```

### Styles are missing

**Problem**: Assets not loading due to path issues.

**Solution**: Check `angular.json` assets configuration and verify Tailwind is built correctly.

### GitHub Pages not enabled

**Problem**: Repository Settings → Pages shows "GitHub Pages is currently disabled"

**Solution**: 
1. Make repository public, OR
2. Upgrade to GitHub Pro for private repo Pages support

### Workflow fails

**Problem**: GitHub Action shows error.

**Solutions**:
1. Check workflow permissions (Settings → Actions → General → Workflow permissions → Read and write)
2. Verify Node.js version in workflow matches your local setup
3. Check build logs for specific errors

## 📝 Customization

### Change Base Path

If you want to deploy to a custom domain or different path:

```yaml
# In .github/workflows/deploy-gh-pages.yml
- name: Build demo app
  run: npm run build -- --base-href /custom-path/
```

### Add Custom Domain

1. Add a `CNAME` file to `public/` directory:
   ```
   demo.yourdomain.com
   ```

2. Configure DNS with your domain provider:
   ```
   Type: CNAME
   Name: demo
   Value: strikerh.github.io
   ```

3. In GitHub Settings → Pages → Custom domain, enter: `demo.yourdomain.com`

## 🔄 Update Deployment

Every time you push to `master`, the demo will automatically rebuild and redeploy.

To manually trigger:
1. Go to Actions tab
2. Select "Deploy Demo to GitHub Pages"
3. Click "Run workflow"

## 📊 Monitor Deployment

Track deployment status:
- **GitHub Actions**: See build logs and deployment status
- **Environments**: Settings → Environments → github-pages (shows deployment history)
- **Pages Settings**: Shows last deployment time and build status

## 🎯 Next Steps

After successful deployment:

1. ✅ Add demo link to README.md
2. ✅ Add demo link to package.json homepage
3. ✅ Share demo URL in npm package description
4. ✅ Test all features in production demo
5. ✅ Add demo link to social media posts

## 📚 Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions for Pages](https://github.com/actions/deploy-pages)
- [Angular Deployment Guide](https://angular.dev/tools/cli/deployment)

---

**Demo URL**: https://strikerh.github.io/ngx-workflow-designer/
