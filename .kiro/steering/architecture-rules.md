---
inclusion: manual
---

# Adverse LLC — Architecture Rules

## Inviolable Constraints

These must never be broken by any code change:

1. **Preserve existing routes** — All routes in App.jsx must remain functional. Never remove or rename a route without explicit approval.
2. **Preserve page transitions** — Framer Motion `AnimatePresence mode="wait"` with `opacity 0→1, y 12→0` (enter) and `opacity 0, y -12` (exit), duration 0.25s.
3. **Preserve lazy-loading** — PackageDetailPage, auth pages, and admin pages use `React.lazy` + `Suspense`.
4. **Preserve component hierarchy** — `ThemeProvider > Navbar > ErrorBoundary > Suspense > AnimatePresence > Routes > Footer`.
5. **Preserve netlify.toml** — Security headers, redirects, and build config are production-critical.
6. **All existing tests must pass** — No test file in `src/__tests__/` should need modification when adding new features.
7. **Preserve CSS architecture** — 3-layer system: `tokens.css` → `styles.css` manifest → CSS Modules. Never add rules to `styles.css` directly.

## Data-Driven Design

- **Packages** are JSON configs in `src/data/packages.js` — never write custom component trees for a new package
- **Themes** are JSON objects in `src/data/themes.js` — never write CSS files for a new theme
- **Services** are data arrays in `src/data/services.js` — add new services by appending to the array
- **Projects** are data arrays in `src/data/projects.js` — add new projects by appending to the array

## Adding a New Package (Zero Custom Code)

1. Add package object to `src/data/packages.js` (slug, name, category, sections)
2. Add 3 themes to `src/data/themes.js` under the package slug
3. Run `npm run build && npm run test` — done

## Adding a New Section Type

1. Create component in `src/components/packages/YourSection.jsx` + `.module.css`
2. Accept `{ content, theme, layout, packageName }` props
3. Register in `src/registry/sectionRegistry.js` with content schema + layouts
4. Use in any package config

## State Management

- **Global theme** (light/dark): `ThemeContext` via `useTheme()` hook
- **Auth state**: Clerk (`useAuth`, `useUser` from `@clerk/clerk-react`), `useSupabaseClient()` hook for authenticated DB access
- **Package themes** (WeBuilder): Applied via `applyTheme()` to scoped DOM elements as CSS custom properties
- **No Redux/Zustand** — keep it simple with context + hooks

## Routing Architecture

```
/                    → HomePage (public)
/about               → AboutPage (public)
/portfolio           → PortfolioPage (public, removed from nav but route exists)
/services            → ServicesPage (public)
/packages            → PackagesPage (public)
/packages/:slug      → PackageDetailPage (public, lazy-loaded)
/contact             → ContactPage (public)
/learn               → LearnPage (public)
/login               → LoginPage (public, lazy-loaded)
/dashboard/*         → AuthGuard → DashboardLayout (lazy-loaded)
/admin/*             → AdminGuard (lazy-loaded)
*                    → NotFoundPage
```

## CSS Architecture

```
src/tokens.css          → All design tokens (:root + [data-theme="dark"])
src/styles.css          → Import-only manifest (@import statements only)
src/styles/*.css        → Global partials (reset, typography, cards, forms, layout, navbar, dark-theme, responsive)
*.module.css            → Component/page-scoped styles (CSS Modules)
Tailwind utilities      → Inline in JSX for layout/spacing shortcuts
```

### WeBuilder Package Tokens (scoped to package wrapper)
```
--color-*, --font-*, --shape-*, --spacing-*, --shadow-*, --motion-*
```

### Rules
- New component styles → co-located `.module.css` file
- Global styles → appropriate file in `src/styles/`
- Never add CSS rules to `src/styles.css` (it's import-only)
- All tokens referenced via `var(--canonical-name)` from `tokens.css`

## Security Boundaries

- **Public pages**: No auth required
- **Client portal** (`/dashboard/*`): Clerk auth via `AuthGuard`
- **Admin panel** (`/admin/*`): Clerk auth + admin role via `AdminGuard`
- **Edge functions**: Service role key (never exposed client-side), webhook signature verification
