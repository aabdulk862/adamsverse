---
inclusion: manual
---

# Adverse LLC — Deployment & Operations

## Deployment Pipeline

- **Host:** Netlify (auto-deploys on push to `main`)
- **Build:** `npm run build` → outputs to `dist/`
- **Node:** v20 (set in netlify.toml)
- **Config:** `netlify.toml` at project root

## Pre-Deploy Checklist

```bash
npm run lint    # Zero errors
npm run test    # All tests pass
npm run build   # Clean build, no chunk warnings > 250KB
```

## Security Headers (netlify.toml)

All pages get:
- `Content-Security-Policy` (strict, with Supabase/Stripe/Google Fonts allowed)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

Static assets (`/_assets/*`) get immutable cache headers.

## Redirects

| From | To | Status |
|------|----|--------|
| `/dsa` | `/dsa.html` | 200 |
| `/leetcode` | `/leetcode.html` | 200 |
| `/github` | `/github.html` | 200 |
| `/ai-website` | `/ai-website.html` | 200 |
| `/*` | `/index.html` | 200 (SPA catch-all, must be last) |

## Rollback

Netlify supports instant rollback — go to Deploys → find last good deploy → Publish deploy.

## Supabase Edge Functions

Deployed via Supabase CLI:
```bash
supabase functions deploy stripe-webhook
supabase functions deploy admin-mutations
supabase functions deploy create-payment-intent
supabase functions deploy send-notification
```

## Monitoring

- Netlify deploy logs (after each push)
- Supabase function logs (weekly review)
- Stripe webhook delivery (weekly review)
- Lighthouse audits (monthly, target > 90 all categories)

## Critical: Never Modify These Without Full Regression

- `netlify.toml` — affects all security headers and routing
- `App.jsx` routing structure — affects all navigation
- `src/context/ThemeContext.jsx` — affects global theme toggle
- `src/tokens.css` — affects entire design system (single source of truth)
- `src/styles.css` — import-only manifest, order matters for cascade
