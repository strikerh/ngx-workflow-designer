# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.9] - 2025-11-08

### Fixed
- **Critical Fix**: `WorkflowApiService` no longer throws error when `api.baseUrl` is missing or empty
- Library now gracefully handles standalone mode (no backend) without requiring dummy URL
- Added proper configuration check with clear error messages for API-dependent features

### Changed
- `WorkflowApiService` constructor now accepts empty/missing `baseUrl` and logs a warning instead of throwing
- Added `isApiConfigured()` method to check if API is available
- All API methods now throw clear errors only when actually called (not on initialization)
- Error message improved: `"WorkflowApiService: API not configured. Set api.baseUrl in provideAlertWorkflow() or disable API-dependent features (templates, save, workflowList)."`

### Documentation
- Updated "Using Without a Backend" section with new behavior
- Clarified that empty `baseUrl` is now allowed
- Added warning message documentation

### Migration from 0.0.8
**No breaking changes** - This is a patch release that improves error handling.

If you were using an empty or dummy `baseUrl` to avoid errors, you can now simply use:
```typescript
api: { baseUrl: '' }  // ✅ Now works without errors
```

## [0.0.8] - 2025-11-07

### Documentation
- **Enhanced README** with comprehensive troubleshooting section
- Added **"Complete Minimal Example"** with all required files
- Added **"Using Without a Backend"** section for standalone usage
- Added **Setup Checklist** to verify correct configuration
- Added **Common Issues** section with solutions

## [0.0.7] - 2025-11-07

### Fixed
- **Critical Fix**: Removed all `@apply` directives from component styles
- Component `:host` styles now use plain CSS for better compatibility

### Changed
- Converted component styles in 4 files from `@apply` to plain CSS

## [0.0.6] - Previous Release

Initial releases with `@apply` directives (may cause styling issues in some consuming applications).

---

## Migration Guide

### From 0.0.8 to 0.0.9
**No breaking changes** - Improved error handling for missing API configuration.

**Benefits**:
- No more initialization errors when `baseUrl` is empty
- Clearer error messages when API features are accessed without configuration
- Better support for standalone mode (no backend)

### From 0.0.7 to 0.0.8
**No breaking changes** - Documentation-only update.

### From 0.0.6 to 0.0.7
**No breaking changes** - Style fix for better compatibility.


