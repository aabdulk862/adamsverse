# Design Document: Modular CSS System

## Overview

This design describes the architecture for decomposing the monolithic `src/styles.css` (~7967 lines) into a scalable, modular CSS system. The approach uses three layers: a single token file, a thin import manifest for global styles, and co-located CSS Modules for components and pages. The system works within the existing Vite 7 + React 19 + Tailwind CSS 4 stack with zero tooling changes.

## Architecture

The modular CSS system follows a three-layer architecture:

```
┌─────────────────────────────────────────────────┐
│  Layer 1: Design Tokens (src/tokens.css)        │
│  Single source of truth for all CSS variables   │
├─────────────────────────────────────────────────┤
│  Layer 2: Global Styles (src/styles.css manifest│
│  → @imports from src/styles/*.css)              │
├─────────────────────────────────────────────────┤
│  Layer 3: CSS Modules (co-located .module.css)  │
│  Component/page-scoped styles                   │
└─────────────────────────────────────────────────┘
```

Import order in `main.jsx`:
1. `tokens.css` — variables available to everything below
2. `styles.css` — global manifest (resets, typography, dark theme, shared layouts)
3. CSS Modules are imported per-component at render time via Vite

## Target File Structure

```
src/
├── tokens.css                          # Layer 1: All :root and [data-theme="dark"] variables
├── styles.css                          # Layer 2: Import-only manifest
├── styles/
│   ├── reset.css                       # CSS reset + base element styles
│   ├── typography.css                  # Heading scales, body text, font stacks
│   ├── dark-theme.css                  # [data-theme="dark"] overrides for globals
│   ├── responsive.css                  # Responsive token overrides + breakpoint utilities
│   ├── layout.css                      # Shared layout: .section, .page-header, .flag
│   ├── forms.css                       # Form elements: inputs, selects, textareas, buttons
│   ├── cards.css                       # Shared .card base styles
│   └── navbar.css                      # Navbar global styles (fixed position, backdrop)
├── components/
│   ├── ProductCard.module.css          # Converted from ProductCard.css
│   ├── ProductCard.jsx
│   ├── ProductGrid.module.css          # Converted from ProductGrid.css
│   ├── ProductGrid.jsx
│   ├── Footer.module.css               # Extracted from styles.css
│   ├── Footer.jsx
│   ├── HeroSection.module.css          # Extracted from styles.css
│   ├── HeroSection.jsx
│   ├── CTASection.module.css           # Extracted from styles.css
│   ├── CTASection.jsx
│   ├── ServicesSection.module.css      # Extracted from styles.css
│   ├── ServicesSection.jsx
│   ├── SocialProofBar.module.css       # Extracted from styles.css
│   ├── SocialProofBar.jsx
│   ├── PackagesShowcase.module.css     # Extracted from styles.css
│   ├── PackagesShowcase.jsx
│   └── ...
│   ├── packages/                       # Sub-directory components keep same pattern
│   └── agents/
├── pages/
│   ├── HomePage.module.css             # Extracted from styles.css (home-* sections)
│   ├── HomePage.jsx
│   ├── AboutPage.module.css            # Extracted from styles.css
│   ├── AboutPage.jsx
│   ├── ServicesPage.module.css         # Extracted from styles.css
│   ├── ServicesPage.jsx
│   ├── ContactPage.module.css          # Extracted from styles.css
│   ├── ContactPage.jsx
│   ├── PackagesPage.module.css         # Already exists
│   ├── PackageDetailPage.module.css    # Already exists
│   ├── ArtifactBrowserPage.module.css  # Already exists
│   ├── DashboardPage.module.css        # Extracted from styles.css
│   ├── LoginPage.module.css            # Extracted from styles.css
│   └── ...
└── main.jsx                            # imports: tokens.css, styles.css (manifest only)
```

## Components and Interfaces

### Component 1: Token File (`src/tokens.css`)

**Purpose:** Single source of truth for all design tokens — colors, spacing, typography, radii, shadows, transitions, layout, navbar, and accent values.

**Consolidation Strategy:**

The current state has two overlapping token sources:
- `src/tokens.css` — uses `--color-*`, `--font-*`, `--weight-*`, `--radius-*`, `--shadow-*` naming
- `src/styles.css` `:root` block — uses `--bg-*`, `--text-*`, `--font-size-*`, `--space-*`, `--radius-sm/md/lg`, `--shadow-sm/md/lg`, `--transition-*`, `--card-*`, `--navbar-*`, `--accent-*` naming

**Canonical naming convention** (merged into tokens.css):

| Family | Prefix | Example |
|--------|--------|---------|
| Colors - backgrounds | `--color-bg-*` | `--color-bg-base`, `--color-bg-surface` |
| Colors - text | `--color-text-*` | `--color-text-primary`, `--color-text-secondary` |
| Colors - accent | `--color-accent-*` | `--color-accent`, `--color-accent-hover` |
| Colors - borders | `--color-border-*` | `--color-border`, `--color-border-hover` |
| Colors - semantic | `--color-success`, `--color-error` | |
| Spacing | `--space-*` | `--space-1` through `--space-24` |
| Typography - families | `--font-*` | `--font-display`, `--font-body` |
| Typography - sizes | `--text-*` | `--text-xs` through `--text-display` |
| Typography - weights | `--weight-*` | `--weight-regular`, `--weight-bold` |
| Typography - line heights | `--leading-*` | `--leading-tight`, `--leading-normal` |
| Typography - tracking | `--tracking-*` | `--tracking-display`, `--tracking-body` |
| Radii | `--radius-*` | `--radius-sm`, `--radius-md`, `--radius-lg` |
| Shadows | `--shadow-*` | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| Transitions | `--transition-*` | `--transition-fast`, `--transition-normal` |
| Layout | `--container-*`, `--navbar-*` | `--container-max-width`, `--navbar-height` |
| Cards | `--card-*` | `--card-bg`, `--card-border`, `--card-shadow` |
| Accent UI | `--accent-bg-*`, `--accent-border-*` | `--accent-bg-subtle`, `--accent-border` |

**Token mapping (old → canonical):**

```css
/* styles.css old names → tokens.css canonical names */
--bg-primary        → --color-bg-base
--bg-secondary      → --color-bg-surface
--bg-tertiary       → --color-bg-muted
--text-primary      → --color-text-primary
--text-secondary    → --color-text-secondary
--text-color        → --color-text-primary  (duplicate, removed)
--text-muted        → --color-text-muted
--border-light      → --color-border
--border-hover      → --color-border-hover
--accent-primary    → --color-accent
--accent-primary-dark → --color-accent-hover
--accent-primary-light → --color-accent-light
--success-color     → --color-success
--error-color       → --color-error
--font-family       → --font-body
--font-size-xs      → --text-xs
--font-size-sm      → --text-sm
--font-size-base    → --text-base
--font-size-lg      → --text-lg
--font-size-xl      → --text-xl
--font-size-2xl     → --text-2xl
--font-size-3xl     → --text-3xl
--font-size-display → --text-display
--font-weight-normal → --weight-regular
--font-weight-medium → --weight-medium
--font-weight-semibold → --weight-semibold
--font-weight-bold  → --weight-bold
--line-height-tight → --leading-tight
--line-height-normal → --leading-normal
--line-height-relaxed → --leading-relaxed
--radius-sm         → --radius-sm  (keep)
--radius-md         → --radius-md  (keep)
--radius-lg         → --radius-lg  (keep)
--radius-xl         → --radius-xl  (keep)
--radius-full       → --radius-full (keep)
--shadow-sm         → --shadow-sm  (keep)
--shadow-md         → --shadow-md  (keep)
--shadow-lg         → --shadow-lg  (keep)
--card-bg           → --card-bg    (keep)
--card-border       → --card-border (keep)
--card-shadow       → --card-shadow (keep)
--card-shadow-hover → --card-shadow-hover (keep)
--navbar-bg         → --navbar-bg  (keep)
--navbar-border     → --navbar-border (keep)
--navbar-height     → --navbar-height (keep)
```

The existing `tokens.css` names (`--color-bg-base`, `--radius-small`, `--radius-medium`, etc.) will be normalized:
- `--radius-small` → `--radius-sm`
- `--radius-medium` → `--radius-md`
- `--radius-large` → `--radius-lg`
- `--shadow-small` → `--shadow-sm`
- `--shadow-medium` → `--shadow-md`
- `--shadow-large` → `--shadow-lg`

### Component 2: Style Manifest (`src/styles.css`)

**Purpose:** Thin entry point that composes global styles via `@import` statements only.

**Target content:**

```css
/* src/styles.css — Global Style Manifest
 * Import-only file. No rules, selectors, or property definitions.
 * Order matters for cascade precedence.
 */
@import "./styles/reset.css";
@import "./styles/typography.css";
@import "./styles/cards.css";
@import "./styles/forms.css";
@import "./styles/layout.css";
@import "./styles/navbar.css";
@import "./styles/dark-theme.css";
@import "./styles/responsive.css";
```

**Rules:**
- No `:root` blocks, no selectors, no property declarations
- Comments are allowed for documentation
- Import order defines cascade: reset first, responsive overrides last
- Dark theme comes after component-level globals so it can override them

### Component 3: Global Styles Directory (`src/styles/`)

**File breakdown:**

| File | Content (from styles.css sections) | Lines (approx) |
|------|-----------------------------------|----------------|
| `reset.css` | Reset & base styles, skip-to-content, box-sizing, body defaults | ~50 |
| `typography.css` | Heading scales (h1–h6), body text, link styles | ~70 |
| `cards.css` | Shared `.card` base, `.card:hover`, card shadows | ~50 |
| `forms.css` | `.email-form`, inputs, selects, textareas, buttons, focus states, status messages | ~200 |
| `layout.css` | `.section`, `.page-header`, `.flag`, `.container` patterns | ~80 |
| `navbar.css` | `.navbar`, `.navbar-*` (fixed, overlay, mobile breakpoint, auth elements) | ~350 |
| `dark-theme.css` | All `[data-theme="dark"]` overrides for global elements | ~200 |
| `responsive.css` | Responsive token overrides, mobile touch targets, accessibility audit rules | ~150 |

### Component 4: CSS Module Conversion Pattern

**For new module files extracted from styles.css:**

```jsx
// Component example: src/components/Footer.jsx
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>...</div>
    </footer>
  );
}
```

```css
/* src/components/Footer.module.css */
.footer {
  text-align: center;
  padding: var(--space-12) var(--space-6);
  border-top: 1px solid var(--color-border);
}

.inner {
  max-width: var(--container-max-width);
  margin: 0 auto;
}
```

**Class name conversion rules:**
- BEM-style global names (`.footer__inner`) become camelCase module names (`.inner`)
- Component-prefixed names (`.product-card__header`) become short names (`.header`)
- State modifiers (`.card--active`) become separate classes (`.active`)
- The component import namespace provides the scoping that BEM prefixes previously provided

**For converting existing non-module CSS files (ProductCard.css, ProductGrid.css):**

1. Rename: `ProductCard.css` → `ProductCard.module.css`
2. Convert class names from BEM (`.product-card__header`) to camelCase (`.header`)
3. Update the JSX import from `import './ProductCard.css'` to `import styles from './ProductCard.module.css'`
4. Replace `className="product-card__header"` with `className={styles.header}`
5. Verify all `var()` references use canonical token names

### Component 5: Handling `src/styles/product-hub.css`

**Decision:** Convert to a CSS Module.

**Rationale:** The `product-hub.css` file contains styles scoped to the `.product-hub` wrapper component and its children (`.hero-section`, `.social-proof-bar`, `.product-grid`, `.product-card`, `.services-section`, `.cta-section`). These are component-scoped, not global. The file also duplicates styles already in `ProductCard.css` and `ProductGrid.css`.

**Migration plan:**
1. Split into component modules: `HeroSection.module.css`, `SocialProofBar.module.css`, `CTASection.module.css`, `ServicesSection.module.css`
2. The `.product-hub` wrapper styles go into `HomePage.module.css`
3. Remove the `import "./styles/product-hub.css"` from `main.jsx`
4. Remove duplicate `.product-grid` and `.product-card` definitions (already in component CSS files)

## Migration Order

The migration follows a strict order to maintain a working build at every step:

### Phase 1: Token Consolidation
1. Merge all `:root` variables from `styles.css` into `tokens.css` using canonical naming
2. Merge all `[data-theme="dark"]` overrides into `tokens.css`
3. Add backward-compatible aliases for old names (temporary, removed in Phase 4)
4. Verify build passes

### Phase 2: Global Style Extraction
1. Extract `reset.css` (lines 391–457 of styles.css: reset & base)
2. Extract `typography.css` (lines 459–485: headings)
3. Extract `cards.css` (lines 833–882: shared card base)
4. Extract `forms.css` (lines 883–1099: email form, inputs, buttons)
5. Extract `layout.css` (lines 775–832: sections, page-header, flags)
6. Extract `navbar.css` (lines 1174–1785: navbar + overlay + mobile + auth)
7. Extract `dark-theme.css` (lines 111–300: dark theme overrides for globals)
8. Extract `responsive.css` (lines 1786–1806: responsive token overrides + touch targets)
9. Replace extracted sections in `styles.css` with `@import` statements
10. Verify build passes

### Phase 3: Component Module Extraction
1. Convert `ProductCard.css` → `ProductCard.module.css` + update JSX
2. Convert `ProductGrid.css` → `ProductGrid.module.css` + update JSX
3. Split `product-hub.css` into component modules (HeroSection, SocialProofBar, CTASection, ServicesSection)
4. Extract `Footer.module.css` from styles.css
5. Extract remaining component sections (InvoiceCard, MessageThread, FileUpload, NotificationBadge, etc.)
6. Remove extracted rules from global files
7. Verify build passes

### Phase 4: Page Module Extraction
1. Extract `HomePage.module.css` (home-services, home-portfolio, home-packages, ai-cta, values-banner, final-cta)
2. Extract `AboutPage.module.css`
3. Extract `ServicesPage.module.css`
4. Extract `ContactPage.module.css`
5. Extract `LearnPage.module.css`
6. Extract `LoginPage.module.css`
7. Extract `DashboardPage.module.css` + `DashboardLayout.module.css`
8. Extract remaining page modules (ProjectList, ProjectDetail, Billing, Settings, Admin, Messages, IntakeForm)
9. Verify existing modules (PackagesPage, PackageDetailPage, ArtifactBrowserPage) use canonical tokens
10. Remove backward-compatible token aliases from tokens.css
11. Verify build passes — `styles.css` should now be import-only

## Interfaces

### Entry Point Interface (`src/main.jsx`)

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./tokens.css";    // Layer 1: Design tokens (must be first)
import "./styles.css";    // Layer 2: Global manifest (@imports only)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

Note: `import "./styles/product-hub.css"` is removed — those styles move to component modules.

### CSS Module Import Interface

```jsx
// Standard pattern for all components/pages
import styles from './ComponentName.module.css';

// Usage in JSX
<div className={styles.container}>
  <h2 className={styles.heading}>...</h2>
</div>

// Combining with Tailwind utilities
<div className={`${styles.container} flex gap-4`}>...</div>
```

### Token Reference Interface

All stylesheets (global and module) reference tokens via CSS custom properties:

```css
/* Correct — references canonical token */
.heading {
  color: var(--color-text-primary);
  font-size: var(--text-2xl);
  margin-bottom: var(--space-4);
}

/* Incorrect — hardcoded value */
.heading {
  color: #0f172a;
  font-size: 1.9rem;
  margin-bottom: 16px;
}
```

## Data Models

### Token Mapping Data Structure

The migration uses a token mapping to rename old variable references:

```javascript
// Token mapping used during migration (build-time reference, not runtime)
const TOKEN_MAP = {
  // Old name → Canonical name
  '--bg-primary': '--color-bg-base',
  '--bg-secondary': '--color-bg-surface',
  '--bg-tertiary': '--color-bg-muted',
  '--text-primary': '--color-text-primary',
  '--text-secondary': '--color-text-secondary',
  '--text-color': '--color-text-primary',
  '--text-muted': '--color-text-muted',
  '--border-light': '--color-border',
  '--border-hover': '--color-border-hover',
  '--accent-primary': '--color-accent',
  '--accent-primary-dark': '--color-accent-hover',
  '--accent-primary-light': '--color-accent-light',
  '--success-color': '--color-success',
  '--error-color': '--color-error',
  '--font-family': '--font-body',
  '--font-size-xs': '--text-xs',
  '--font-size-sm': '--text-sm',
  '--font-size-base': '--text-base',
  '--font-size-lg': '--text-lg',
  '--font-size-xl': '--text-xl',
  '--font-size-2xl': '--text-2xl',
  '--font-size-3xl': '--text-3xl',
  '--font-size-display': '--text-display',
  '--font-weight-normal': '--weight-regular',
  '--font-weight-medium': '--weight-medium',
  '--font-weight-semibold': '--weight-semibold',
  '--font-weight-bold': '--weight-bold',
  '--font-weight-display': '--weight-semibold',
  '--font-weight-heading': '--weight-semibold',
  '--line-height-tight': '--leading-tight',
  '--line-height-normal': '--leading-normal',
  '--line-height-relaxed': '--leading-relaxed',
  '--line-height-display': '--leading-display',
  '--line-height-heading': '--leading-heading',
  '--line-height-body': '--leading-normal',
  // tokens.css old names
  '--radius-small': '--radius-sm',
  '--radius-medium': '--radius-md',
  '--radius-large': '--radius-lg',
  '--shadow-small': '--shadow-sm',
  '--shadow-medium': '--shadow-md',
  '--shadow-large': '--shadow-lg',
};
```

### Global Style File Registry

```javascript
// Files that compose the global manifest (import order = cascade order)
const GLOBAL_STYLE_FILES = [
  'styles/reset.css',       // Box-sizing, body defaults, skip-to-content
  'styles/typography.css',  // Heading scales, body text
  'styles/cards.css',       // Shared .card base
  'styles/forms.css',       // Form elements
  'styles/layout.css',      // .section, .page-header, .flag
  'styles/navbar.css',      // Navbar (fixed, overlay, mobile)
  'styles/dark-theme.css',  // [data-theme="dark"] global overrides
  'styles/responsive.css',  // Responsive overrides, touch targets
];
```

## Error Handling

### Build Errors

| Scenario | Cause | Resolution |
|----------|-------|------------|
| Undefined CSS variable warning | Token renamed but reference not updated | Run token mapping script to find stale `var()` references |
| Missing @import file | Extracted file not created yet | Create the file or remove the import temporarily |
| Class name not found in module | JSX references old global class name | Update JSX to use `styles.className` pattern |
| Specificity conflict with Tailwind | Module class has same specificity as utility | Use CSS layers or increase module selector specificity with `:where()` |

### Migration Safety

- **Backward-compatible aliases:** During migration, `tokens.css` temporarily defines both old and new variable names. Old names are aliases: `--bg-primary: var(--color-bg-base)`. This allows incremental migration without breaking unrenamed references.
- **Build-first validation:** Every extraction step must pass `vite build` before proceeding.
- **No runtime errors:** CSS variable resolution is forgiving — undefined variables fall back to `initial` or any provided fallback. The build won't crash, but visual regressions may occur.

## Tailwind CSS 4 Coexistence

Tailwind CSS 4 uses `@theme` directives and generates utility classes. The modular CSS system coexists by:

1. **Layer separation:** Tailwind utilities have higher specificity than component styles by default in Tailwind 4's layer system
2. **No conflicts:** CSS Modules generate hashed class names that cannot collide with Tailwind utility names
3. **Composition:** Components can combine module classes with Tailwind utilities: `className={`${styles.card} p-4 flex`}`
4. **Token sharing:** Tailwind 4 can reference the same CSS custom properties from `tokens.css` via its `@theme` configuration

## Build System Compatibility

Vite 7 handles all three layers natively:

- **CSS Modules:** Vite processes any `.module.css` file with local scope by default (no config needed)
- **@import resolution:** Vite resolves `@import` statements in CSS files during bundling
- **HMR:** CSS Module changes trigger hot replacement without full page reload
- **Production:** `vite build` produces a single optimized CSS bundle combining all layers
- **PostCSS:** Tailwind 4's Vite plugin (`@tailwindcss/vite`) runs in the PostCSS pipeline alongside CSS Modules

## Testing Strategy

**Property-based tests** (using `fast-check` + `vitest`):
- Parse CSS files and verify structural invariants across all files in the system
- Token mapping correctness: generate random old variable names and verify mapping produces valid canonical names
- Manifest purity: parse the manifest and verify no CSS rules exist
- Module scope purity: parse all `.module.css` files and verify no bare element selectors

**Example-based tests:**
- Verify `tokens.css` contains all expected token families
- Verify `main.jsx` import order (tokens first, then manifest)
- Verify specific files exist in `src/styles/` directory
- Verify existing modules (PackagesPage, PackageDetailPage, ArtifactBrowserPage) use canonical tokens

**Integration tests:**
- `vite build` succeeds after each migration phase
- Production CSS bundle contains all expected styles
- No visual regressions (manual verification per phase)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Manifest Purity

For any line in the Style Manifest (`styles.css`) that is not a comment or whitespace, it must be a valid `@import` statement referencing a file in the `./styles/` directory. No CSS selectors, property declarations, or `:root` blocks shall exist in the manifest.

**Validates: Requirements 2.1, 2.2**

### Property 2: Token Deduplication

For any CSS custom property defined under `:root` in the Token File (`tokens.css`), that same custom property name shall not appear as a `:root` definition in any file within the Global Styles Directory or in the Style Manifest.

**Validates: Requirements 1.3, 7.1**

### Property 3: Token Reference Resolution

For any `var(--*)` reference in any stylesheet (global or module), the referenced custom property name shall either be defined in the Token File under `:root` or `[data-theme="dark"]`, defined locally within the same file, or be a standard CSS property with a provided fallback value.

**Validates: Requirements 3.4, 4.5, 7.4, 9.2**

### Property 4: Module Scope Purity

For any `.module.css` file, it shall contain no bare element selectors (e.g., `h1`, `p`, `div` without a class qualifier) and no `:global()` declarations, except when explicitly documented as a third-party library override.

**Validates: Requirements 4.3**

### Property 5: No Cross-Layer Duplication

For any class name defined in a CSS Module file (`.module.css`), that same class name (in its original un-hashed form) shall not also appear as a selector in any file within the Global Styles Directory.

**Validates: Requirements 5.3, 6.2**

### Property 6: Token Mapping Correctness

For any entry in the token mapping (old variable name → canonical name), the canonical name shall exist as a defined custom property in the Token File, and no two old names shall map to different canonical names that resolve to different values for the same design decision.

**Validates: Requirements 7.3**

