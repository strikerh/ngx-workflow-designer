# Publishing Guide for ngx-workflow-designer

This guide covers how to build, test, and publish the `ngx-workflow-designer` library to npm.

## Prerequisites

1. **NPM Account**: Create an account at https://www.npmjs.com/signup
2. **NPM Login**: Run `npm login` and enter your credentials
3. **Repository Access**: Ensure you have write access to the GitHub repository
4. **Clean Working Directory**: Commit all changes before publishing

## Version Management

The library follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features (backwards compatible)
- **PATCH** (0.0.1): Bug fixes (backwards compatible)

### Update Version

```bash
cd projects/alert-workflow

# For bug fixes
npm version patch  # 0.0.3 -> 0.0.4

# For new features
npm version minor  # 0.0.3 -> 0.1.0

# For breaking changes
npm version major  # 0.0.3 -> 1.0.0
```

This updates `package.json` and creates a git tag.

## Build Process

### 1. Clean Previous Build

```bash
# From project root
rm -rf dist/alert-workflow
```

### 2. Build the Library

```bash
npm run build:lib
```

This creates production-ready bundles in `dist/alert-workflow/`:
- FESM2022 bundles (ES modules)
- Type definitions (`.d.ts`)
- Package metadata

### 3. Verify Build Output

```bash
ls -la dist/alert-workflow/

# Should see:
# - fesm2022/
# - *.d.ts
# - package.json
# - README.md
```

## Testing Before Publishing

### 1. Create Test Package

```bash
npm run pack:lib
```

This creates `dist/alert-workflow/ngx-workflow-designer-X.X.X.tgz`

### 2. Test in Another Project

```bash
# In a different Angular project
cd /path/to/test-project
npm install /path/to/ngx-workflow-designer-X.X.X.tgz

# Test the library
ng serve
```

### 3. Verify Integration

Test these scenarios in your test project:

- ✅ Import components and services
- ✅ Use `provideAlertWorkflow()`
- ✅ Styles render correctly
- ✅ All features work (drag, connect, validate, save)
- ✅ API integration works
- ✅ No console errors

## Publishing to NPM

### Option 1: Manual Publishing

```bash
# Login to npm (first time only)
npm login

# Publish from the built package
npm run publish:lib
```

Or manually:

```bash
cd dist/alert-workflow
npm publish --access public
```

### Option 2: CI/CD with GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build library
        run: npm run build:lib
      
      - name: Publish to NPM
        run: cd dist/alert-workflow && npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### Setup GitHub Secrets

1. Generate NPM token: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Add to GitHub: Settings → Secrets → Actions → New secret
3. Name: `NPM_TOKEN`, Value: `your-npm-token`

#### Trigger Publishing

```bash
# Tag and push
git tag v0.0.4
git push origin v0.0.4
```

## Post-Publishing Checklist

### 1. Verify on NPM

Visit: https://www.npmjs.com/package/ngx-workflow-designer

Check:
- ✅ Version number updated
- ✅ README displays correctly
- ✅ File size reasonable (< 1MB)
- ✅ Dependencies listed correctly

### 2. Test Installation

```bash
# In a new project
npm install ngx-workflow-designer

# Should install without errors
```

### 3. Update Documentation

- Update CHANGELOG.md with release notes
- Tag release on GitHub with release notes
- Update demo/examples if API changed

### 4. Announce Release

- GitHub Releases: Create release with changelog
- Social media/blog if major version
- Update any external documentation

## Troubleshooting

### "Package already exists"

**Problem**: Version already published.

**Solution**: Update version in `package.json` and rebuild.

### "403 Forbidden"

**Problem**: Authentication failed or no permissions.

**Solution**:
1. Run `npm login` and verify credentials
2. Ensure you have permissions for `ngx-workflow-designer` package
3. Check `publishConfig.access` is set to `public`

### "EPUBLISHCONFLICT"

**Problem**: Trying to publish same version twice.

**Solution**: Bump version number before publishing.

### Files Missing from Package

**Problem**: Some files not included in published package.

**Solution**: Check `ng-package.json` and ensure all assets are listed:

```json
{
  "lib": {
    "entryFile": "src/public-api.ts"
  },
  "assets": [
    "README.md",
    "package.json"
  ]
}
```

## Complete Publishing Workflow

```bash
# 1. Ensure clean state
git status
git pull origin master

# 2. Update version
cd projects/alert-workflow
npm version patch  # or minor/major
cd ../..

# 3. Commit version bump
git add .
git commit -m "chore: bump version to X.X.X"
git push origin master

# 4. Clean and build
rm -rf dist/alert-workflow
npm run build:lib

# 5. Test locally (optional but recommended)
npm run pack:lib
# Test the tarball in another project

# 6. Publish
npm run publish:lib

# 7. Create GitHub release
git tag vX.X.X
git push origin vX.X.X

# 8. Create release notes on GitHub
# Visit: https://github.com/strikerh/ngx-workflow-designer/releases/new
```

## Rollback/Unpublishing

⚠️ **Warning**: npm strongly discourages unpublishing. Only do this if absolutely necessary.

### Deprecate a Version (Recommended)

```bash
npm deprecate ngx-workflow-designer@0.0.3 "This version has critical bugs. Please upgrade to 0.0.4"
```

### Unpublish (Last Resort)

```bash
# Only works within 72 hours of publishing
npm unpublish ngx-workflow-designer@0.0.3
```

## Maintenance

### Regular Tasks

- **Weekly**: Check for security vulnerabilities: `npm audit`
- **Monthly**: Update dependencies: `npm update`
- **Quarterly**: Review Angular/PrimeNG compatibility

### Long-term Support

- Maintain compatibility with latest Angular version
- Provide migration guides for breaking changes
- Keep documentation up-to-date

## Resources

- **npm Documentation**: https://docs.npmjs.com/
- **Semantic Versioning**: https://semver.org/
- **Angular Library Guide**: https://angular.dev/tools/libraries
- **GitHub Actions**: https://docs.github.com/en/actions

---

**Questions or Issues?** Open an issue at: https://github.com/strikerh/ngx-workflow-designer/issues
