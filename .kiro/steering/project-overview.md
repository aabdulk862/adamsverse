---
inclusion: auto
---

# Adverse LLC — Project Overview

## Business Identity

- **Company:** Adverse LLC (dba Adverse Solutions)
- **Owner:** Adam Abdulkadir
- **Domain:** adamsverse.com / adverse.dev
- **Email:** adamvmedia@outlook.com
- **Product:** Software studio — websites, platforms, tools, and operational systems

## What We Build

Adverse Solutions is a software studio that builds modern systems for businesses and founders. The platform has multiple faces:

1. **Public Site** (adamsverse.com) — Homepage, services, tools ecosystem, learning resources
2. **WeBuilder Platform** — Config-driven website builder that renders SMB sites from JSON (Package_Config + Theme)
3. **Utility Tools** — Standalone browser-native tools (PDF Editor, Image Toolkit, etc.) deployed as separate apps
4. **Custom Engineering** — Full-stack platforms, APIs, and operational systems for clients
5. **Strategic Partnerships** — Technical co-building with founders/operators who have traction

## Revenue Model

- Website packages sold to SMBs (primary current revenue)
- Custom engineering projects (higher-ticket)
- Strategic partnerships (rev share / equity)
- Future: Adverse Pro subscription bundling utility tools
- Client portal with project management, billing (Stripe), and messaging

## Platform Architecture (High Level)

```
React 19 + Vite 7 SPA
├── Public Pages (/, /about, /services, /packages, /contact, /learn)
├── Package Showcase (/packages, /packages/:slug)
├── WeBuilder Preview (/builder) — Free lead-gen tool (planned)
├── Client Portal (/dashboard/*) — Auth-gated via Clerk
├── Admin Panel (/admin/*) — Role-gated
└── Static Guides (/dsa, /leetcode, /github, /ai-website)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19, Vite 7 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 4 + CSS Modules + Design Tokens (3-layer system) |
| Animation | Framer Motion 12 |
| UI Components | MUI Material 7, FontAwesome 7 |
| Auth | Clerk (@clerk/clerk-react) |
| Backend | Supabase (storage, edge functions, database) |
| Payments | Stripe |
| Email | EmailJS (contact), Resend (transactional) |
| Validation | ajv (JSON Schema draft 2020-12) |
| Testing | Vitest 4 + fast-check + Testing Library |
| Deployment | Netlify (CDN, security headers, SPA redirects) |
| Node | v20 |

## CSS Architecture (3-Layer System)

```
Layer 1: src/tokens.css          → All design tokens (:root + [data-theme="dark"])
Layer 2: src/styles.css          → Import-only manifest (@imports from src/styles/*.css)
Layer 3: *.module.css            → Co-located CSS Modules for components/pages
```

Import order in `main.jsx`:
1. `tokens.css` — variables available to everything below
2. `styles.css` — global manifest (resets, typography, dark theme, shared layouts)
3. CSS Modules imported per-component at render time

## Key Commands

```bash
npm run dev      # Vite dev server (localhost:5173)
npm run build    # Production build → dist/
npm run lint     # ESLint
npm run preview  # Preview production build locally
npm run test     # Vitest (all tests, single run)
```

## Environment

- Client vars prefixed with `VITE_` (Supabase URL, anon key, Stripe publishable key, Google Sheet URL)
- Server vars in Supabase Edge Functions (service role key, Stripe secret, webhook secret, Resend API key)
- Never commit `.env.local` — use `.env.example` as reference
