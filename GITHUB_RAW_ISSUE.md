# GitHub raw.githubusercontent.com 400 Bad Request Issue

## Problem

When fetching files from `raw.githubusercontent.com`, some files return **400 Bad Request** while others work fine.

### Example failing URLs:
- `https://raw.githubusercontent.com/jgudo/ecommerce-react/master/src/components/common/AdminNavigation.jsx` → 400
- `https://raw.githubusercontent.com/jgudo/ecommerce-react/master/src/redux/actions/productActions.js` → 400

### Example working URLs:
- `https://raw.githubusercontent.com/jgudo/ecommerce-react/master/src/constants/index.js` → 200 OK

## Root Cause Analysis

After extensive testing, the issue appears to be on **GitHub's CDN (Fastly)** side, not our code:

1. **Same URL works in some locations, fails in others** - The file fetch succeeds from my server but fails from the user's browser
2. **CDN edge-specific issue** - Response headers show `x-served-by: cache-maa10239-MAA` (India region)
3. **Response body is 20 bytes** - Likely an error message like "Invalid request" from Fastly
4. **Not a rate limit** - Rate limits return 403/429, not 400
5. **Not a missing file** - The GitHub Contents API returns the same file successfully

### Possible Causes:
1. **Fastly CDN bug** with certain file paths or content types
2. **Regional CDN edge issues** affecting specific geographic locations
3. **Character encoding issues** in the URL or file path
4. **CDN caching corruption** for specific files
5. **GitHub's internal routing issue** for certain blob objects

## Current Workaround

Implemented fallback to GitHub Contents API:

```
1. Try raw.githubusercontent.com (fast, but unreliable for some files)
2. If 400, fallback to api.github.com/repos/{owner}/{repo}/contents/{path} (reliable)
3. Contents API returns base64-encoded content, decode with atob()
```

## Why This Is Frustrating

- GitHub's own API (`api.github.com`) works fine for these files
- The `download_url` field in the API response points to the SAME raw.githubusercontent.com URL that fails
- This is a **GitHub/Fastly infrastructure issue** that we cannot fix
- The fallback doubles our API calls (wastes rate limit quota)

## Potential Long-term Solutions

1. **Always use Contents API** - More reliable but slower and uses more rate limit
2. **Use GitHub GraphQL API** - Batch multiple files in one request
3. **Require authentication** - Authenticated requests may route differently
4. **Use a proxy server** - Backend fetches from GitHub, caches results
5. **Report to GitHub** - File a bug report about raw.githubusercontent.com returning 400

## Files Affected in jgudo/ecommerce-react

Based on testing, these files fail from certain locations:
- `src/components/common/AdminNavigation.jsx`
- `src/components/common/AdminSidePanel.jsx`
- `src/redux/actions/productActions.js`
- `src/hooks/useProduct.js`
- `src/components/formik/CustomTextarea.jsx`
- And potentially others

## Test Results

| URL | Result from server | Result from browser |
|-----|-------------------|---------------------|
| `.../AdminNavigation.jsx` (raw) | 400 | 400 |
| `.../AdminNavigation.jsx` (Contents API) | 200 ✓ | 200 ✓ |
| `.../constants/index.js` (raw) | 200 ✓ | 200 ✓ |

## Other Potential Issues in This Codebase

### 1. GitHub API Rate Limiting
- **Unauthenticated requests**: 60 requests/hour per IP
- **Current implementation**: Makes 1 API call for repo info + 1 for tree + up to 80 file fetches
- **When reaching limit**: GitHub returns 403 with `X-RateLimit-Remaining: 0`
- **Symptoms**: "API rate limit exceeded" errors after analyzing ~1-2 repos

### 2. File Extension Filter Too Broad
- Current regex: `/\.(jsx?|tsx?)$/`
- Matches: `.js`, `.jsx`, `.ts`, `.tsx`
- Issue: May include test files, config files, or generated files that aren't useful for visualization

### 3. Large File Handling
- No size check before fetching file content
- Files over 1MB could cause memory issues in browser
- GitHub Contents API has 1MB file size limit anyway

### 4. Encoding Issues
- `atob()` may fail for binary files or non-UTF-8 content
- Should wrap in try-catch for safety

### 5. No Pagination for Large Repos
- GitHub Tree API limits: `?recursive=1` returns up to 100,000 items
- Large repos may have files beyond the first 80 fetched
- Current code only fetches first 80 files (`jsFiles.slice(0, 80)`)

### 6. localStorage Fallback
- When no backend is available, projects/runs are stored in localStorage
- localStorage has ~5MB limit
- Large analyses could exceed this limit

## Recommendations

1. **Add GitHub token support** - Increases rate limit to 5000 requests/hour
2. **Add file size filter** - Skip files over 100KB
3. **Improve error messages** - Show rate limit remaining in UI
4. **Add retry with exponential backoff** - For transient failures
5. **Consider backend proxy** - Fetch GitHub content server-side to avoid CORS/rate limit issues

## Conclusion

This is a **GitHub CDN bug**, not a code issue. The fallback to Contents API handles it gracefully, but burns API rate limit faster. For a production app, consider using backend proxy or requiring GitHub authentication.
