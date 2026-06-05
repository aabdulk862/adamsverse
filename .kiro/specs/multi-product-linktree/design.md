# Design Document: Multi-Product Linktree

## Overview

This design transforms adversesolutions.com from a single-service web development agency site into a multi-product platform hub. The homepage becomes a curated product discovery page (Product Hub) linking to four core products, while a unified design system is applied across all existing pages for visual consistency.

The implementation builds on the existing React 19 + Vite + Tailwind CSS 4 + Framer Motion stack, extending the current CSS custom property system into a formalized design token layer. The subscription gate leverages the existing Supabase auth + Stripe billing integration already present in the codebase.

### Key Design Decisions

1. **Data-driven rendering**: A centralized `productRegistry.js` module defines all products. The Product Hub renders dynamically from this registry, making product additions/removals a data-only change.
2. **Token-first design system**: Extend the existing `:root` CSS custom properties into a comprehensive token file (`tokens.css`) that replaces ad-hoc styles. The WeBuilder per-package theme system (`themes.js`) remains separate but uses compatible token naming.
3. **Progressive subscription gate**: The subscription system is additive — it wraps existing routes without modifying them. Products default to `requiresSubscription: false` so the gate is opt-in per product.
4. **SEO as a component**: A dedicated `<SEOHead>` component injects structured data, meta tags, and Open Graph tags based on the product registry, keeping SEO concerns isolated from layout.

## Architecture

```mermaid
graph TD
    subgraph "Entry Point"
        A[App.jsx] --> B[ThemeProvider]
        B --> C[Navbar]
        B --> D[Routes]
        B --> E[Footer]
    end

    subgraph "Product Hub (Homepage)"
        D --> F[HomePage]
        F --> G[SEOHead]
        F --> H[HeroSection]
        F --> I[SocialProofBar]
        F --> J[ProductGrid]
        F --> K[PackagesShowcase]
        F --> L[ServicesSection]
        F --> M[CTASection]
        J --> N[ProductCard]
    end

    subgraph "Data Layer"
        O[productRegistry.js] --> J
        O --> G
        P[packages.js] --> K
        Q[services.js] --> L
    end

    subgraph "Design System"
        R[tokens.css] --> S[:root variables]
        S --> T[All components]
        R --> U[dark theme overrides]
    end

    subgraph "Subscription Gate"
        V[SubscriptionGuard] --> W[useSubscription hook]
        W --> X[Supabase Auth]
        W --> Y[Stripe Status Check]
        V --> Z[/subscribe landing]
    end
```

### Page Flow

```mermaid
flowchart LR
    A["/"] --> B{Product Card Click}
    B -->|isExternal: true| C[New Tab - External Product]
    B -->|isExternal: false| D[Client-side Route]
    B -->|requiresSubscription & !auth| E[/subscribe]
    D --> F{SubscriptionGuard}
    F -->|access granted| G[Product Page]
    F -->|access denied| E
```

## Components and Interfaces

### ProductRegistry Module

```javascript
// src/data/productRegistry.js
/**
 * @typedef {Object} Product
 * @property {string} id - Unique identifier (kebab-case)
 * @property {string} name - Display name (max 50 chars)
 * @property {string} description - Short description (max 160 chars)
 * @property {"tools"|"services"} category - Product category
 * @property {string} url - Relative or absolute URL
 * @property {string} icon - FontAwesome icon class
 * @property {"live"|"coming-soon"|"beta"} status - Product availability
 * @property {boolean} requiresSubscription - Whether gated behind paywall
 * @property {boolean} isExternal - Opens in new tab if true
 */

/** @type {Product[]} */
export const products = [
  {
    id: "cs-reference-guide",
    name: "CS Reference Guide",
    description: "Interactive computer science reference with algorithms, data structures, and system design patterns.",
    category: "tools",
    url: "https://csreferenceguide.com", // placeholder external URL
    icon: "fas fa-book-open",
    status: "live",
    requiresSubscription: false,
    isExternal: true,
  },
  {
    id: "pdf-editor",
    name: "PDF Editor",
    description: "Browser-based PDF editing tool for merging, splitting, annotating, and converting documents.",
    category: "tools",
    url: "https://pdfeditor.adversesolutions.com", // placeholder external URL
    icon: "fas fa-file-pdf",
    status: "beta",
    requiresSubscription: false,
    isExternal: true,
  },
  {
    id: "basecamp-atlas",
    name: "Basecamp Atlas",
    description: "Discover apartments and retreats with intelligent search, map views, and neighborhood insights.",
    category: "tools",
    url: "https://basecampatlas.com", // placeholder external URL
    icon: "fas fa-map-marked-alt",
    status: "live",
    requiresSubscription: false,
    isExternal: true,
  },
  {
    id: "website-packages",
    name: "Website Packages",
    description: "Ready-to-launch website designs for your industry. Preview live, pick a theme, launch in days.",
    category: "services",
    url: "/packages",
    icon: "fas fa-layer-group",
    status: "live",
    requiresSubscription: false,
    isExternal: false,
  },
];
```

### ProductCard Component

```jsx
// src/components/ProductCard.jsx
/**
 * Props:
 * @param {Product} product - Product object from registry
 * @param {boolean} isAuthenticated - Whether user is logged in
 *
 * Behavior:
 * - status "coming-soon": muted style, "Coming Soon" badge, non-clickable
 * - status "beta": "Beta" badge, fully interactive
 * - status "live": no badge, fully interactive
 * - isExternal: true → opens new tab, shows external-link icon
 * - requiresSubscription && !isAuthenticated → shows lock icon
 * - Hover: elevation increase via box-shadow, 150ms transition
 * - Touch: 200ms visual feedback before navigation
 */
```

### SEOHead Component

```jsx
// src/components/SEOHead.jsx
/**
 * Renders into <head> via react-helmet-async or useEffect:
 * - <title> (30-60 chars, contains "Adverse Solutions")
 * - <meta name="description"> (120-160 chars, references 2+ products)
 * - JSON-LD ItemList (all "live" products from registry)
 * - JSON-LD Organization (name, logo, url, sameAs)
 * - Open Graph tags (og:title, og:description, og:image, og:url, og:type)
 * - Twitter Card tags (summary_large_image)
 *
 * Props:
 * @param {Product[]} products - Filtered products for structured data
 */
```

### SubscriptionGuard Component

```jsx
// src/components/SubscriptionGuard.jsx
/**
 * Wraps gated routes. Checks subscription status before rendering children.
 *
 * Props:
 * @param {React.ReactNode} children - Protected content
 *
 * Behavior:
 * - Calls useSubscription() hook
 * - If status is "active" or "trialing" → render children
 * - If status is denied or unauthenticated → redirect to /subscribe
 * - If Stripe API timeout (>5s) → show error message
 * - If Supabase session expired → treat as visitor, redirect
 */
```

### useSubscription Hook

```javascript
// src/hooks/useSubscription.js
/**
 * @returns {{
 *   status: "active"|"trialing"|"past_due"|"canceled"|"unpaid"|"incomplete_expired"|"none",
 *   loading: boolean,
 *   error: string|null,
 *   hasAccess: boolean
 * }}
 *
 * Implementation:
 * - Uses existing useAuth() for session
 * - Queries Supabase `subscriptions` table for user's Stripe status
 * - Maps "active"/"trialing" → hasAccess: true
 * - Maps all other statuses → hasAccess: false
 * - 5-second timeout on Stripe status check
 */
```

### Design System Token File

```css
/* src/tokens.css — imported before styles.css */
:root {
  /* === Colors === */
  --color-bg-base: #ffffff;
  --color-bg-surface: #f8fafc;
  --color-bg-muted: #f1f5f9;
  --color-text-primary: #0f172a;
  --color-text-secondary: rgba(15, 23, 42, 0.68);
  --color-text-muted: rgba(15, 23, 42, 0.44);
  --color-accent: #2563eb;
  --color-accent-hover: #1d4ed8;
  --color-accent-text: #ffffff;
  --color-border: #e2e8f0;

  /* === Typography === */
  --font-display: "Inter", sans-serif;
  --font-body: "Inter", sans-serif;
  --weight-light: 300;
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-bold: 700;
  --tracking-display: -0.02em;
  --tracking-body: 0.01em;

  /* === Spacing === */
  --section-padding: 80px;
  --container-max-width: 1140px;
  --grid-gap: 24px;
  --stack-gap: 16px;

  /* === Shape === */
  --radius-small: 4px;
  --radius-medium: 12px;
  --radius-large: 16px;
  --shadow-small: 0 1px 2px rgba(15, 23, 42, 0.05);
  --shadow-medium: 0 4px 16px rgba(15, 23, 42, 0.08);
  --shadow-large: 0 8px 24px rgba(15, 23, 42, 0.12);
}

[data-theme="dark"] {
  --color-bg-base: #0b0f19;
  --color-bg-surface: #111827;
  --color-bg-muted: #1e293b;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: rgba(241, 245, 249, 0.7);
  --color-text-muted: rgba(241, 245, 249, 0.42);
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;
  --color-accent-text: #ffffff;
  --color-border: #1e293b;
  --shadow-small: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.35);
  --shadow-large: 0 8px 24px rgba(0, 0, 0, 0.4);
}
```

### Updated HomePage Structure

```jsx
// src/pages/HomePage.jsx (redesigned)
export default function HomePage() {
  return (
    <main className="product-hub">
      <SEOHead products={products.filter(p => p.status === "live")} />
      <HeroSection />          {/* Brand logo, tagline, value prop */}
      <SocialProofBar />       {/* Metrics: projects, satisfaction, years, response */}
      <ProductGrid />          {/* 2x2 grid of ProductCards */}
      <PackagesShowcase />     {/* 3+ package cards from existing data */}
      <ServicesSection />      {/* Links to /services and /packages */}
      <CTASection />           {/* Contact CTA for custom dev inquiries */}
    </main>
  );
}
```

### Navbar & Footer Updates

Both components will be restyled to use the new design system tokens:
- Replace hardcoded color values with `var(--color-*)` tokens
- Apply `var(--font-display)` for brand name, `var(--font-body)` for links
- Use `var(--radius-medium)` for buttons, `var(--shadow-small)` for scroll state
- Maintain all existing functionality (mobile drawer, theme toggle, auth dropdown)

## Data Models

### Product Registry Schema

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | unique, kebab-case | Product identifier |
| name | string | max 50 chars | Display name |
| description | string | max 160 chars | Short product description |
| category | enum | "tools" \| "services" | Product classification |
| url | string | valid URL or path | Navigation destination |
| icon | string | FontAwesome class | Visual icon identifier |
| status | enum | "live" \| "coming-soon" \| "beta" | Availability state |
| requiresSubscription | boolean | — | Whether gated behind paywall |
| isExternal | boolean | — | Whether link opens in new tab |

### Subscription Record (Supabase)

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to auth.users |
| stripe_customer_id | string | Stripe customer reference |
| stripe_subscription_id | string | Stripe subscription reference |
| stripe_price_id | string | "Adverse Pro" price ID |
| status | enum | "active", "trialing", "past_due", "canceled", "unpaid", "incomplete_expired" |
| current_period_end | timestamp | Subscription period end |
| created_at | timestamp | Record creation time |

### Design Token Structure

The token system uses a layered approach:

1. **`tokens.css`** — Site-wide design tokens (colors, typography, spacing, shape) applied at `:root`
2. **`styles.css`** — Component styles referencing tokens via `var(--token-name)`
3. **`themes.js`** — Per-package WeBuilder themes (separate system, compatible naming)

Token naming convention: `--{category}-{property}` (e.g., `--color-bg-base`, `--font-display`, `--radius-large`)



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Product registry schema validity

*For any* product object in the Product_Registry, it SHALL have: an `id` that is a unique non-empty string, a `name` of at most 50 characters, a `description` of at most 160 characters, a `category` that is either "tools" or "services", a `url` that is a non-empty string, an `icon` that is a non-empty string, a `status` that is one of "live", "coming-soon", or "beta", and `requiresSubscription` and `isExternal` that are booleans.

**Validates: Requirements 2.1**

### Property 2: Status determines card rendering behavior

*For any* product, the ProductCard component SHALL render a "Coming Soon" badge and be non-interactive when status is "coming-soon", render a "Beta" badge and be fully interactive when status is "beta", and render no status badge and be fully interactive when status is "live".

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 3: Design token completeness

*For any* required token name in the set {color-bg-base, color-bg-surface, color-bg-muted, color-text-primary, color-text-secondary, color-text-muted, color-accent, color-accent-hover, color-accent-text, color-border, font-display, font-body, weight-light, weight-regular, weight-medium, weight-bold, section-padding, container-max-width, grid-gap, stack-gap, radius-small, radius-medium, radius-large, shadow-small, shadow-medium, shadow-large}, the token SHALL be defined as a CSS custom property at the `:root` level in tokens.css.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 4: SEO ItemList includes all live products

*For any* product registry containing products with mixed statuses, the generated JSON-LD ItemList SHALL contain exactly the products whose status is "live", each with a name, description, URL, and a numeric position starting at 1.

**Validates: Requirements 4.1**

### Property 5: Navigation behavior determined by isExternal flag

*For any* product with `isExternal: true`, the ProductCard SHALL render an anchor with `target="_blank"` and `rel="noopener noreferrer"` and display an external-link icon. *For any* product with `isExternal: false`, the ProductCard SHALL use a React Router `<Link>` for client-side navigation without a full page reload.

**Validates: Requirements 5.2, 5.3**

### Property 6: Subscription-gated products show lock icon when unauthenticated

*For any* product where `requiresSubscription` is true, when rendered in an unauthenticated context, the ProductCard SHALL display a lock icon adjacent to the product name.

**Validates: Requirements 5.4**

### Property 7: Subscription status access mapping

*For any* Stripe subscription status, the useSubscription hook SHALL map "active" and "trialing" to `hasAccess: true`, and SHALL map "past_due", "canceled", "unpaid", "incomplete_expired", and "none" (unauthenticated) to `hasAccess: false`.

**Validates: Requirements 6.1**

### Property 8: All registry products render as cards with required fields

*For any* product registry, the ProductGrid component SHALL render one ProductCard per product, and each card SHALL display the product's name, description, icon, and destination link.

**Validates: Requirements 1.2**

### Property 9: ARIA labels reflect product identity

*For any* product, the ProductCard SHALL include an `aria-label` attribute that contains both the product name and its status.

**Validates: Requirements 8.5**

## Error Handling

### Subscription Gate Errors

| Scenario | Behavior |
|----------|----------|
| Stripe API timeout (>5s) | Deny access, show message: "Unable to verify subscription. Please try again later." |
| Supabase session expired | Treat as visitor, redirect to /subscribe |
| Network failure during subscription check | Deny access, show retry message |
| Invalid subscription status value | Default to denied access |

### Product Registry Errors

| Scenario | Behavior |
|----------|----------|
| Empty product registry | Render empty state with message |
| Product with missing required fields | Skip product, log warning in development |
| Invalid URL in product | Render card as non-interactive, log error |

### SEO Component Errors

| Scenario | Behavior |
|----------|----------|
| No live products in registry | Omit ItemList JSON-LD block |
| Missing OG image | Use fallback default image |
| Product description exceeds 160 chars | Truncate at 157 chars + "..." |

### General Error Boundaries

- The existing `<ErrorBoundary>` component wraps all routes and catches render errors
- Individual components use try/catch for data operations
- Failed image loads show placeholder content (existing pattern from packages)

## Testing Strategy

### Property-Based Tests (fast-check)

The project already uses `fast-check` (v4.6.0) with `vitest` (v4.1.2). Each correctness property maps to a single property-based test with minimum 100 iterations.

**Library**: fast-check (already installed)
**Runner**: vitest --run
**Location**: `src/__tests__/property-*.test.js` (existing pattern)

| Property | Test File | What It Generates |
|----------|-----------|-------------------|
| 1: Schema validity | `property-product-registry-schema.test.js` | Random product objects with varying field values |
| 2: Status rendering | `property-product-card-status.test.jsx` | Products with random statuses |
| 3: Token completeness | `property-design-tokens.test.js` | Token name set against parsed CSS |
| 4: SEO ItemList | `property-seo-itemlist.test.js` | Random product registries with mixed statuses |
| 5: Navigation behavior | `property-product-card-navigation.test.jsx` | Products with random isExternal values |
| 6: Lock icon | `property-product-card-lock.test.jsx` | Products with random requiresSubscription values |
| 7: Subscription mapping | `property-subscription-status.test.js` | Random Stripe status strings |
| 8: Card field rendering | `property-product-grid-fields.test.jsx` | Random product registries |
| 9: ARIA labels | `property-product-card-aria.test.jsx` | Products with random names and statuses |

**Tag format**: `Feature: multi-product-linktree, Property {N}: {title}`

**Configuration**: Each test runs with `{ numRuns: 100 }` minimum.

### Unit Tests (Example-Based)

| Area | Test Focus |
|------|-----------|
| SEOHead | Organization JSON-LD has correct fixed fields |
| SEOHead | Title is 30-60 chars, contains "Adverse Solutions" |
| SEOHead | Meta description is 120-160 chars, references ≥2 products |
| SEOHead | OG tags and Twitter Card tags present |
| ProductRegistry | Exactly 4 entries with correct attributes |
| PackagesShowcase | Renders ≥3 package cards with correct links |
| SocialProofBar | All 4 metrics rendered |
| ServicesSection | Links to /services and /packages |
| CTASection | Link to /contact with visible text |
| SubscriptionGuard | Renders children for "active" status |
| SubscriptionGuard | Redirects to /subscribe for denied status |
| SubscriptionGuard | Shows error on timeout |
| HomePage | Semantic HTML elements (main, section, nav) |

### Integration Tests

| Area | Test Focus |
|------|-----------|
| Lighthouse CI | Performance ≥90, Accessibility ≥95 (pipeline) |
| Sitemap | Live product URLs included |
| Page preservation | /services, /packages, /about, /contact render correctly |
| Visual regression | Cross-page design consistency |

### Edge Case Tests

| Scenario | Expected Behavior |
|----------|-------------------|
| Stripe timeout (5s) | Error message, access denied |
| Expired Supabase session | Redirect to /subscribe |
| Touch device tap | 200ms feedback before navigation |
| Product with "coming-soon" click | No navigation occurs |
| Empty product registry | Graceful empty state |
