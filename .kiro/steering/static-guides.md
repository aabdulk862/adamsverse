---
inclusion: fileMatch
fileMatchPattern: "**/public/*.html,**/public/guide-*,**/dsa*,**/leetcode*,**/github*,**/ai-website*"
---

# Adverse LLC — Static Learning Guides

## Overview

The site hosts standalone HTML learning guides in the `public/` directory. These are NOT React components — they're plain HTML pages served directly by Netlify with their own JavaScript files.

## Guide Pages

| Route | File | JS | Purpose |
|-------|------|-----|---------|
| /dsa | public/dsa.html | public/guide-dsa.js | Big O, data structures, LeetCode patterns |
| /leetcode | public/leetcode.html | public/guide-leetcode.js | Coding interview questions (Java) |
| /github | public/github.html | public/guide-github.js | GitHub workflow guide |
| /ai-website | public/ai-website.html | public/guide-ai-website.js | AI website building guide |

## Shared Assets

- `public/guide-system.css` — Shared styles for all guides
- `public/guide-playground.js` — Interactive code playground (used by DSA guide)

## CSP Note

The DSA guide has a relaxed Content-Security-Policy in `netlify.toml` because it uses:
- `esm.sh` CDN for dynamic module loading
- `'unsafe-eval'` for code playground execution in Web Workers
- `worker-src 'self' blob:` for Web Worker support

Other guides use the standard strict CSP.

## Routing

These are served via Netlify redirects (200 status, not 301):
```toml
[[redirects]]
  from = "/dsa"
  to = "/dsa.html"
  status = 200
```

This means they bypass React Router entirely — they're independent HTML documents.

## Conventions

- Self-contained: each guide has its own HTML + JS, no React dependency
- Responsive: works on mobile
- Accessible: proper heading hierarchy, alt text, keyboard navigation
- No build step: served as-is from `public/`
