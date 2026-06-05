---
inclusion: auto
---

# Adverse LLC — Coding Standards

## Language & Framework

- JavaScript/JSX (not TypeScript, but JSDoc types for IDE support)
- React 19 with functional components and hooks only
- ES modules (`import`/`export`) — no CommonJS

## File Organization

```
src/
├── components/          # Reusable UI components
│   └── packages/        # WeBuilder section components
├── pages/               # Route-level page components
├── data/                # Static data arrays (packages, themes, services, projects, clients)
├── schemas/             # JSON Schema definitions + ajv validators
├── registry/            # Section type registry
├── lib/                 # Core services (contentLayer, uploadService, supabase, etc.)
├── hooks/               # Custom React hooks
├── context/             # React context providers
├── utils/               # Pure utility functions
├── styles/              # Global style partials (reset, typography, cards, forms, layout, navbar, dark-theme, responsive)
├── tokens.css           # Design token definitions (single source of truth)
├── styles.css           # Import-only manifest (no rules)
├── assets/images/       # Static image assets
└── __tests__/           # All test files
```

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `SectionRenderer.jsx` |
| Pages | PascalCase + "Page" suffix | `PackageDetailPage.jsx` |
| Hooks | camelCase + "use" prefix | `useScrollAnimation.js` |
| Utils/Lib | camelCase | `contentLayer.js` |
| CSS Modules | ComponentName.module.css | `Hero.module.css` |
| Global styles | kebab-case in src/styles/ | `dark-theme.css` |
| Tests | `*.test.js` or `*.test.jsx` | `property-webuilder-theme-engine.test.js` |
| Property tests | `property-*.test.js` prefix | `property-packages-data-shape.test.js` |
| Data files | camelCase | `packages.js`, `themes.js` |

## Component Patterns

### Standard Component Structure

```jsx
import styles from "./ComponentName.module.css";

export default function ComponentName({ prop1, prop2 }) {
  // hooks first
  // derived state
  // handlers
  // render
  return (
    <div className={styles.wrapper}>
      {/* content */}
    </div>
  );
}
```

### WeBuilder Section Components

All section components follow this exact interface:

```jsx
export default function SectionName({ content, theme, layout, packageName }) {
  const { field1, field2 } = content || {};
  // Graceful empty handling — never render "undefined"
  // Layout fallback to default for unknown variants
  // All styling via CSS custom properties (--color-*, --font-*, --shape-*)
}
```

## Styling Rules

1. **Design tokens** in `src/tokens.css` — single source of truth for all variables
2. **CSS Modules** for component/page-scoped styles (`.module.css`)
3. **Global styles** in `src/styles/*.css` — imported via the manifest
4. **Tailwind CSS** for utility classes in JSX
5. **Never add rules to `src/styles.css`** — it's import-only
6. **Never use inline styles** — use CSS classes referencing design tokens
7. Light/dark theme via `data-theme` attribute on `<html>`
8. All `var()` references use canonical token names from `tokens.css`

## ESLint Rules

- `no-unused-vars` with `varsIgnorePattern: "^[A-Z_]"` (allows unused uppercase/underscore vars)
- React Hooks rules enforced
- React Refresh rules for Vite HMR

## Import Order (preferred)

1. React/framework imports
2. Third-party libraries
3. Local components
4. Local hooks/utils/lib
5. Data/schemas
6. Styles/assets

## Error Handling

- Components: ErrorBoundary wraps the app, individual try/catch for async operations
- Services: Return `{ success: boolean, error?: string }` objects — never throw in lib functions
- Validation: Use ajv with `allErrors: true`, return structured error arrays

## Performance Patterns

- `React.lazy` + `Suspense` for route-level code splitting
- Dynamic imports in Section Registry for unused section types
- `loading="lazy"` on below-fold images, `loading="eager"` on hero images
- Framer Motion `AnimatePresence mode="wait"` for page transitions
- Theme token updates batched in single animation frame

## Inviolable Constraints

1. Preserve all existing routes in App.jsx
2. Preserve page transitions (Framer Motion opacity/y, 0.25s)
3. Preserve lazy-loading for PackageDetailPage, auth, agent, admin pages
4. Preserve component hierarchy: ThemeProvider > Navbar > ErrorBoundary > Suspense > AnimatePresence > Routes > Footer
5. Preserve netlify.toml (security headers, redirects, build config)
6. All existing tests must pass — never modify test files when adding features
7. Preserve CSS 3-layer architecture: tokens.css → styles.css manifest → CSS Modules

## Data-Driven Design

- Packages → JSON in `src/data/packages.js` (never custom component trees)
- Themes → JSON in `src/data/themes.js` (never custom CSS files)
- Services/Projects → data arrays in `src/data/` (append to add)

## State Management

- Global theme: `ThemeContext` / `useTheme()`
- Auth: Clerk (`useAuth`, `useUser`), `useSupabaseClient()` for DB
- No Redux/Zustand — context + hooks only
