# AFTERLIGHT — Production Deployment Guide

**Document**: Production Deployment Architecture & Hosting Blueprint  
**Project**: AFTERLIGHT (NASA SPHEREx Exploration & Scientific Investigation Platform)  
**Author**: Production Readiness Specialist & DevOps Architect (Team ASTRION)  
**Date**: November 14, 2026  
**Status**: DEPLOYMENT READY  

---

## 1. Hosting Architecture Overview

AFTERLIGHT is architected as a decoupled system:
- **Frontend Presentation Layer**: Static SPA hosted on a global Edge Content Delivery Network (Vercel, Cloudflare Pages, or Netlify).
- **Backend Scientific Layer**: Containerized FastAPI service hosted on Render with managed PostgreSQL and S3-compatible object storage.

```
  [User Browser]
         │
         ├─── (HTTPS / Static Assets & SPA Routes) ───> [Vercel / Edge CDN]
         │                                                    │
         │                                              (dist/ bundle)
         │
         └─── (HTTPS REST JSON / API Queries) ────────> [Render FastAPI Backend]
                                                              │
                                            ┌─────────────────┴─────────────────┐
                                            ▼                                   ▼
                                  [PostgreSQL DB]                     [Object Storage / S3]
```

---

## 2. Frontend Deployment on Vercel (Recommended)

### A. Build Settings
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (runs `tsc -b && vite build`)
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### B. Single Page Application (SPA) Routing Configuration
Because AFTERLIGHT utilizes client-side React Router with 13 nested routes (`/explore/:targetId`, `/temporal-analysis/:targetId`, etc.), all deep-link requests must rewrite to `index.html`.

Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### C. Environment Variables (Vercel Project Settings)
- `VITE_API_BASE_URL`: `https://afterlight-backend.onrender.com` (Points to production FastAPI instance)
- `VITE_APP_TITLE`: `AFTERLIGHT — NASA SPHEREx Exploration Platform`

---

## 3. Alternative Deployment on Netlify

Create `frontend/public/_redirects`:
```text
/*    /index.html   200
```

---

## 4. Backend CORS Configuration Requirements

The FastAPI backend must configure `CORSMiddleware` in `app/main.py` to allow the production frontend origin:
```python
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "https://afterlight.vercel.app",
    "https://*.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

---

## 5. Pre-Deployment Verification Checklist

1. [x] Run `npm run build` and ensure exit code `0`.
2. [x] Run `npm run lint` and verify 0 errors / 0 warnings.
3. [x] Run `npm run test` and verify automated suite passes.
4. [x] Ensure `.env` is never committed; verify `.gitignore` excludes `.env.local` and `dist/`.
5. [x] Verify offline fallback assets resolve cleanly if backend is momentarily unreachable.
