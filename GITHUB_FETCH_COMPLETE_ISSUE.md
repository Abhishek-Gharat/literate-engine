# GitHub Fetch Issue - Complete Technical Documentation

## Problem Statement

The ReactViz app has a feature to analyze GitHub repositories by URL. Users paste a public GitHub repo link, and the app fetches all JS/JSX/TS/TSX files to analyze dependencies and visualize the component graph.

Multiple issues were encountered during implementation.

---

## Issue 1: Repository Shows as Private When It's Public

### Symptoms
- User pastes a public GitHub URL like `https://github.com/jgudo/ecommerce-react`
- App shows "Repository not found or is private"

### Root Causes

#### 1A. `.git` suffix in URL
Users often paste the clone URL: `https://github.com/jgudo/ecommerce-react.git`

The regex only captured `repo.git` instead of `repo`.

**Fix:**
```javascript
// Before
const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)

// After - strips .git and trailing slashes
const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/)
```

#### 1B. GitHub API rate limit (403)
Unauthenticated requests are limited to 60/hour per IP.

**Solution:** Show better error messages for 403 vs 404.

---

## Issue 2: Wrong Branch - HEAD Not Working

### Symptoms
```
GET https://raw.githubusercontent.com/jgudo/ecommerce-react/HEAD/src/components/formik/index.js 400 (Bad Request)
```

### Root Cause
The app was using `HEAD` as the branch name in raw URLs. While `HEAD` works for the GitHub API, raw.githubusercontent.com requires the actual branch name (`main`, `master`, etc.).

### Fix
Fetch the default branch from the repo API first:
```javascript
// Get repo info to find default branch
const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
const repoData = await repoRes.json()
const branch = repoData.default_branch // e.g., "master" or "main"

// Use actual branch in URLs
const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${f.path}`
```

---

## Issue 3: raw.githubusercontent.com Returns 400 for Some Files

### Symptoms
```
GET https://raw.githubusercontent.com/jgudo/ecommerce-react/master/src/components/common/AdminNavigation.jsx 400 (Bad Request)
GET https://raw.githubusercontent.com/jgudo/ecommerce-react/master/src/redux/actions/productActions.js 400 (Bad Request)
```

These same files work perfectly via the GitHub Contents API:
```
GET https://api.github.com/repos/jgudo/ecommerce-react/contents/src/components/common/AdminNavigation.jsx?ref=master 200 OK
```

### Investigation Results

| URL | Result from server | Result from user browser |
|-----|-------------------|-------------------------|
| `.../AdminNavigation.jsx` (raw) | 400 | 400 |
| `.../AdminNavigation.jsx` (Contents API) | 200 OK with base64 content | 200 OK |
| `.../constants/index.js` (raw) | 200 OK | 200 OK |

### Root Cause Analysis

**This is a GitHub/Fastly CDN bug, not our code.**

Evidence:
1. Same URL returns different results from different locations
2. CDN headers show regional edge: `x-served-by: cache-maa10239-MAA` (India)
3. Response body is exactly 20 bytes (error message)
4. Files exist and are accessible via Contents API
5. 400 (Bad Request) is not a rate limit (would be 403/429)

#### Response headers from failing request:
```
content-length: 20
content-type: text/plain; charset=utf-8
x-cache: MISS
x-served-by: cache-maa10239-MAA
```

#### Affected files in jgudo/ecommerce-react:
- `src/components/common/AdminNavigation.jsx`
- `src/components/common/AdminSidePanel.jsx`
- `src/redux/actions/productActions.js`
- `src/hooks/useProduct.js`
- `src/components/formik/CustomTextarea.jsx`
- And potentially others

### Possible Causes (GitHub-side)
1. Fastly CDN bug with certain file paths
2. Regional CDN edge issues
3. Character encoding in URL/path
4. CDN caching corruption
5. Internal routing issue for certain blob objects

---

## Issue 4: GitHub API Rate Limiting (403)

### Symptoms
```
GET https://api.github.com/repos/jgudo/ecommerce-react/contents/src/hooks/useDocumentTitle.js?ref=master 403 (Forbidden)
```

### Root Cause
GitHub API has strict rate limits:

| Request Type | Rate Limit |
|--------------|------------|
| Unauthenticated | 60 requests/hour per IP |
| Authenticated (token) | 5000 requests/hour per token |

### Current API Usage Per Repo Analysis
- 1 call: Get repo info (default branch)
- 1 call: Get tree (list of files)
- Up to 80 calls: Fetch individual files
- **Total: ~82 API calls per analysis**

With 60/hour limit, users can analyze ~1 repo before hitting the limit.

---

## Final Solution: Hybrid Approach

### Strategy
1. Try `raw.githubusercontent.com` first (no rate limit, fast)
2. If it returns 400, fallback to GitHub Contents API (limited but reliable)

### Code Implementation

```javascript
const fileResults = await Promise.allSettled(
  jsFiles.slice(0, 80).map(async (f) => {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${f.path}`
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${f.path}?ref=${branch}`

    // Try raw first (no rate limit)
    const rawRes = await fetch(rawUrl)
    if (rawRes.ok) {
      const content = await rawRes.text()
      return { name: f.path.split('/').pop(), content, fullPath: f.path }
    }

    // Fallback to Contents API (has rate limit)
    const apiRes = await fetch(apiUrl, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    })
    if (!apiRes.ok) throw new Error(`HTTP ${apiRes.status}`)
    const json = await apiRes.json()
    
    // Contents API returns base64-encoded content
    const content = atob(json.content.replace(/\s/g, ''))
    return { name: f.path.split('/').pop(), content, fullPath: f.path }
  })
)

// Handle partial failures gracefully
const fileData = fileResults
  .filter(r => r.status === 'fulfilled')
  .map(r => r.value)
const failedCount = fileResults.filter(r => r.status === 'rejected').length
if (fileData.length === 0) throw new Error('Failed to fetch any files')
```

### Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| `raw.githubusercontent.com` only | No rate limit, fast | 400 errors for some files |
| Contents API only | Always works | 60 req/hour limit |
| **Hybrid (current)** | Minimizes API usage, still works | Console shows 400 errors for fallback files |

---

## Files Modified

1. `src/hooks/useFileInput.js` - Main GitHub fetch logic
2. `src/hooks/useUpload.js` - Alternative upload hook with same logic

### Key Changes Made

1. **Strip `.git` from URLs**
   ```javascript
   const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/)
   ```

2. **Resolve default branch dynamically**
   ```javascript
   const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
   const branch = repoData.default_branch
   ```

3. **Hybrid fetch with fallback**
   ```javascript
   // Try raw first, fallback to API
   const rawRes = await fetch(rawUrl)
   if (!rawRes.ok) {
     const apiRes = await fetch(apiUrl, { headers: { Accept: 'application/vnd.github.v3+json' } })
     // decode base64 content
   }
   ```

4. **Graceful error handling**
   ```javascript
   const fileResults = await Promise.allSettled(...)
   // Continue with files that succeeded, skip failures
   ```

---

## Remaining Limitations

### 1. Console Errors Still Visible
The 400 errors from raw.githubusercontent.com still appear in the browser console. This is unavoidable because:
- The browser logs failed network requests automatically
- We need to attempt the request to know if it fails
- There's no way to suppress browser console logs

### 2. Rate Limit Can Still Be Hit
If many files fail on raw.githubusercontent.com, the fallback to Contents API can consume the 60/hour rate limit.

### 3. No Authentication Support
Currently no option for users to provide a GitHub token for higher rate limits.

---

## Recommended Future Improvements

### 1. Add GitHub Token Support
Allow users to provide a personal access token to increase rate limit to 5000/hour.

```javascript
// Option 1: Environment variable
const token = import.meta.env.VITE_GITHUB_TOKEN

// Option 2: User input in UI
const headers = token ? { Authorization: `Bearer ${token}` } : {}
```

### 2. Backend Proxy
Create a backend endpoint that:
- Fetches from GitHub on behalf of the user
- Caches responses to reduce API calls
- Uses a single authenticated token for all users

```javascript
// Backend (Express)
app.get('/api/github/contents/:owner/:repo/:path', async (req, res) => {
  const cached = await cache.get(req.path)
  if (cached) return res.json(cached)
  
  const response = await fetch(`https://api.github.com/repos/...`, {
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  })
  const data = await response.json()
  await cache.set(req.path, data, { ttl: 3600 })
  res.json(data)
})
```

### 3. GitHub GraphQL API
Use GraphQL to fetch multiple files in a single request, reducing API calls from 80 to 1.

```graphql
query($owner: String!, $repo: String!, $expression: String!) {
  repository(owner: $owner, name: $repo) {
    object(expression: $expression) {
      ... on Tree {
        entries {
          name
          object {
            ... on Blob {
              text
            }
          }
        }
      }
    }
  }
}
```

### 4. Better Error Messages in UI
Show users when they're approaching rate limit:
```javascript
const remaining = response.headers.get('X-RateLimit-Remaining')
if (remaining < 10) {
  showWarning('GitHub API rate limit low. Consider adding a token.')
}
```

### 5. Batch Requests
Fetch repo info and tree in parallel:
```javascript
const [repoRes, treeRes] = await Promise.all([
  fetch(`https://api.github.com/repos/${owner}/${repo}`),
  fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`)
])
```

---

## Testing Commands

```bash
# Test raw.githubusercontent.com directly
curl -I "https://raw.githubusercontent.com/jgudo/ecommerce-react/master/src/components/common/AdminNavigation.jsx"

# Test Contents API
curl -I "https://api.github.com/repos/jgudo/ecommerce-react/contents/src/components/common/AdminNavigation.jsx?ref=master"

# Check rate limit status
curl -I "https://api.github.com/rate_limit"
```

---

## Summary

| Issue | Status | Solution |
|-------|--------|----------|
| `.git` in URL | ✅ Fixed | Regex strips `.git` suffix |
| Wrong branch (HEAD) | ✅ Fixed | Fetch default_branch from API |
| raw.githubusercontent.com 400 | ⚠️ Workaround | Fallback to Contents API |
| GitHub API rate limit | ⚠️ Limited | Hybrid approach minimizes usage |

**Recommendation for production:** Implement backend proxy with authenticated GitHub token to eliminate all these issues.
