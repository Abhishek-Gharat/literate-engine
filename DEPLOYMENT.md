# ReactViz Deployment Guide

## Overview

ReactViz is a **full-stack application** with:
- **Frontend**: React + Vite (static SPA)
- **Backend**: Express.js + SQLite API server

## ⚠️ Important Limitation

**Vercel Static Hosting** can only run the **frontend** (React app). The backend API with SQLite database **will NOT work** on Vercel's free static hosting because:
- Vercel runs serverless functions, not persistent Node.js servers
- SQLite requires a persistent filesystem (which Vercel doesn't provide)
- Projects, runs, and file analysis require the backend API

## Deployment Options

### Option 1: Client-Side Only (Recommended for Quick Deployment)

Deploy just the frontend to Vercel. Analysis runs entirely in the browser (no backend needed).

**Features that work:**
✅ File upload and analysis (client-side)
✅ Dependency graph visualization
✅ AI explanations (if API key configured)

**Features that DON'T work:**
❌ Creating/saving projects (no database)
❌ Run history persistence (lost on refresh)
❌ Multi-user support

#### Steps:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. **Ensure environment variable is set** (for local development):
   ```
   VITE_ENABLE_LOCAL_ANALYSIS_FALLBACK=true
   ```

4. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI if not already installed
   npm i -g vercel

   # Deploy
   vercel
   ```

5. **Or use Git Integration:**
   - Push code to GitHub
   - Connect repo to Vercel dashboard
   - Vercel will auto-detect Vite and deploy

### Option 2: Full Stack with External Backend

Deploy frontend to Vercel + backend to a platform that supports persistent servers.

#### Backend Hosting Options:

**Railway.app** (Easiest)
- Supports persistent SQLite
- Free tier available
- Automatic deployments from GitHub

**Render.com**
- Free tier with persistent disk
- Good for small projects

**Fly.io**
- Free allowances
- Persistent volumes available

**Self-hosted VPS**
- DigitalOcean, Linode, AWS EC2, etc.

#### Configuration:

1. **Deploy backend first** to your chosen platform
2. **Get the backend URL** (e.g., `https://reactviz-api.railway.app`)
3. **Set environment variable in Vercel:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `VITE_REACTVIZ_API_URL` = `https://your-backend-url.com`
   - **Remove** or set `VITE_ENABLE_LOCAL_ANALYSIS_FALLBACK` to `false`

### Option 3: Full Stack on Single Platform

Use platforms that support both frontend and backend together:

**Railway**
- Can deploy entire repo
- Supports persistent databases
- Monorepo friendly

**Render**
- Static site + Web service
- Free tier available

## Environment Variables

| Variable | Description | Default | Vercel Required |
|----------|-------------|---------|---------------|
| `VITE_REACTVIZ_API_URL` | Backend API URL | `''` (empty) | Only for Option 2 |
| `VITE_ENABLE_LOCAL_ANALYSIS_FALLBACK` | Enable browser-based analysis | `true` | Recommended for Option 1 |

## Local Development

### Running full stack locally:

**Terminal 1 - Backend:**
```bash
npm run dev:api
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The frontend will proxy API requests to `http://localhost:4000`

### Running frontend only (client-side analysis):

```bash
# Set environment variable
$env:VITE_ENABLE_LOCAL_ANALYSIS_FALLBACK="true"

# Run dev server
npm run dev
```

## Troubleshooting

### "Cannot create new project" on Vercel
This is expected with static hosting. The backend API isn't running. Use **Option 1** (client-side only) or deploy a backend.

### "File upload not working"
- Check browser console for errors
- Ensure `VITE_ENABLE_LOCAL_ANALYSIS_FALLBACK=true` is set
- Some browsers block file access in iframes (deploy to custom domain)

### "API not available" error
- Frontend is trying to reach backend that doesn't exist
- Set `VITE_ENABLE_LOCAL_ANALYSIS_FALLBACK=true` for client-side only mode

## Recommended Setup for Different Use Cases

### Quick Demo / Personal Use
→ **Option 1**: Deploy to Vercel with client-side only

### Team Collaboration / Persistent Data
→ **Option 2**: Vercel (frontend) + Railway (backend)

### Production Application
→ **Option 3**: Railway or Render (full stack)

## Files Changed for Deployment

- `vercel.json` - Vercel configuration with SPA routing
- `.env.example` - Environment variables template
- `.gitignore` - Added environment files

## Next Steps

1. Decide which deployment option fits your needs
2. Follow the corresponding steps above
3. Test thoroughly before sharing the URL
