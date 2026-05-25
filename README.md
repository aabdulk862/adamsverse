# Adverse Solutions

A multi-product platform combining a personal portfolio/creator hub with a config-driven SMB website builder (WeBuilder). Built with React 19 + Vite 7, deployed on Netlify.

**Live:** [https://adamsverse.com](https://adamsverse.com)

---

## What This Is

Adverse Solutions is a web development agency platform with two faces:

1. **Public Portfolio** — Showcases services, pricing, projects, and learning resources
2. **WeBuilder Platform** — A config-driven website builder that renders SMB sites from JSON (Package_Config + Theme), not custom code

---

## Platform Architecture

```
React 19 + Vite 7 SPA
├── Public Pages (/, /about, /services, /packages, /contact, /learn)
├── Package Showcase (/packages, /packages/:slug)
├── WeBuilder Preview (/builder) — Free lead-gen tool (planned)
├── Client Portal (/dashboard/*) — Auth-gated via Supabase
├── Admin Panel (/admin/*) — Role-gated
├── Agent Console (/agents/*) — BasicAuth-gated, own layout
└── Static Guides (/dsa, /leetcode, /github, /ai-website)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19, Vite 7 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 4 + CSS Modules + Design Tokens |
| Animation | Framer Motion 12 |
| UI Components | MUI Material 7, FontAwesome 7 |
| Backend | Supabase (auth, storage, edge functions) |
| Payments | Stripe |
| Email | EmailJS (contact form), Resend (transactional) |
| Validation | ajv (JSON Schema draft 2020-12) |
| Testing | Vitest 4 + fast-check + Testing Library |
| Deployment | Netlify (CDN, security headers, SPA redirects) |

---

## CSS Architecture

The project uses a three-layer modular CSS system:

```
Layer 1: src/tokens.css          → Single source of truth for all design tokens
Layer 2: src/styles.css          → Import-only manifest (@imports from src/styles/*.css)
Layer 3: *.module.css            → Co-located CSS Modules for components/pages
```

Global style partials in `src/styles/`:
- `reset.css` — Box-sizing, body defaults, skip-to-content
- `typography.css` — Heading scales, body text
- `cards.css` — Shared card base styles
- `forms.css` — Form elements, inputs, buttons
- `layout.css` — Sections, page headers, containers
- `navbar.css` — Navbar (fixed, overlay, mobile)
- `dark-theme.css` — Dark theme global overrides
- `responsive.css` — Responsive overrides, touch targets

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── packages/        # WeBuilder section components
│   └── agents/          # Agent console components
├── pages/               # Route-level page components
├── data/                # Static data (packages, themes, services, projects)
├── schemas/             # JSON Schema definitions + ajv validators
├── registry/            # Section type registry
├── lib/                 # Core services (contentLayer, uploadService, supabase)
├── hooks/               # Custom React hooks
├── context/             # React context providers (ThemeContext)
├── utils/               # Pure utility functions
├── styles/              # Global style partials
├── tokens.css           # Design token definitions
├── styles.css           # Import-only manifest
├── assets/images/       # Static image assets
└── __tests__/           # All test files (61 files)
```

---

## Quick Start

1. Clone the repo:

```bash
git clone https://github.com/yourusername/adamsverse.git
cd adamsverse
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` from the example:

```bash
cp .env.example .env.local
```

Required environment variables:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
- `VITE_EMAILJS_SERVICE_ID` — EmailJS service ID
- `VITE_EMAILJS_TEMPLATE_ID` — EmailJS template ID
- `VITE_EMAILJS_PUBLIC_KEY` — EmailJS public key

4. Start the dev server:

```bash
npm run dev
```

---

## Commands

```bash
npm run dev      # Vite dev server (localhost:5173)
npm run build    # Production build → dist/
npm run lint     # ESLint
npm run preview  # Preview production build locally
npm run test     # Vitest (all tests, single run)
```

---

## WeBuilder System

The WeBuilder renders websites from JSON configuration — no custom component code per package.

**Adding a new package (zero custom code):**
1. Add package object to `src/data/packages.js`
2. Add 3 themes to `src/data/themes.js` under the package slug
3. Run `npm run build && npm run test` — done

**Available section types:** hero, services, gallery, testimonials, cta, contact

**Layout variants:** professional, beauty, homeServices, foodHospitality

---

## Deployment

- **Host:** Netlify (auto-deploys on push to `main`)
- **Build command:** `npm run build`
- **Publish directory:** `dist/`
- **Node version:** 20

Pre-deploy checklist:
```bash
npm run lint    # Zero errors
npm run test    # All tests pass
npm run build   # Clean build
```

---

## Static Learning Guides

Plain HTML pages served directly by Netlify (not React):

| Route | Purpose |
|-------|---------|
| /dsa | Big O, data structures, LeetCode patterns |
| /leetcode | Coding interview questions (Java) |
| /github | GitHub workflow guide |
| /ai-website | AI website building guide |

---

## License

MIT
