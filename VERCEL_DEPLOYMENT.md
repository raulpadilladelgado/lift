# Vercel Deployment Guide

## Overview

This project is a PWA built with Vite + React + `vite-plugin-pwa`. After the offline-first migration, all dependencies are bundled locally — no CDN scripts remain. The deployment process is standard Vite.

---

## Build & Output

| Setting         | Value          |
|-----------------|----------------|
| Build command   | `npm run build` |
| Output directory | `dist`         |
| Install command | `npm install`  |
| Node version    | 18+            |

No environment variables are required.

---

## Required: `vercel.json`

Create a `vercel.json` at the project root with the following content:

```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/workbox-:hash.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Why these headers matter

- **`/sw.js` — no-cache**: The service worker file must never be cached by the browser's HTTP cache. If it is cached, users will not receive updates to the PWA. Workbox's `autoUpdate` strategy relies on the browser re-fetching `sw.js` on every page load to detect a new version.
- **`/workbox-*.js` — immutable**: Workbox runtime chunks are hashed by filename. They can be cached indefinitely since a new deploy will produce a new hash.
- **SPA rewrite**: Required so that direct navigation to any URL (e.g. `/settings`) returns `index.html` instead of a 404.

---

## PWA Manifest

`vite-plugin-pwa` generates `dist/manifest.webmanifest` at build time. Vercel serves this automatically — no manual configuration needed.

The `manifest.json` at the project root is used only during local development (referenced by `index.html`). It is not served in production.

---

## Service Worker

The old manual `sw.js` was deleted. `vite-plugin-pwa` now generates:

- `dist/sw.js` — main service worker (Workbox-powered)
- `dist/workbox-<hash>.js` — Workbox runtime

These are generated on every `npm run build` and should not be committed to the repository (they are in `.gitignore` via the `dist/` directory).

---

## Local Build Verification

```bash
npm run build
npx serve dist
```

Then open `http://localhost:3000` and verify:

1. The app loads without CDN requests (check Network tab — no `esm.sh` or `cdn.tailwindcss.com` calls)
2. DevTools → Application → Service Workers shows the SW registered
3. DevTools → Application → Manifest shows the app manifest with the `lift.png` icon
