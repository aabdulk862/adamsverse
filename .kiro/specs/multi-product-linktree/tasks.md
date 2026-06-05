# Implementation Plan: Multi-Product Linktree

## Overview

Transform the Adverse Solutions homepage into a multi-product platform hub with a centralized product registry, unified design system tokens, SEO structured data, and a subscription gate foundation. The implementation builds incrementally: design tokens first, then data layer, then components, then wiring and integration.

## Tasks

- [x] 1. Create design system token file and integrate into build
  - [x] 1.1 Create `src/tokens.css` with all design system tokens
    - Define `:root` CSS custom properties for colors (bg-base, bg-surface, bg-muted, text-primary, text-secondary, text-muted, accent, accent-hover, accent-text, border)
    - Define typography tokens (font-display, font-body, weight-light, weight-regular, weight-medium, weight-bold, tracking-display, tracking-body)
    - Define spacing tokens (section-padding, container-max-width, grid-gap, stack-gap)
    - Define shape tokens (radius-small, radius-medium, radius-large, shadow-small, shadow-medium, shadow-large)
    - Define `[data-theme="dark"]` overrides for all color and shadow tokens
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

  - [x] 1.2 Import `tokens.css` before `styles.css` in the application entry point
    - Ensure tokens.css is loaded first so all components can reference tokens
    - _Requirements: 3.6_

  - [ ]* 1.3 Write property test for design token completeness
    - **Property 3: Design token completeness**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 2. Create product registry data layer
  - [x] 2.1 Create `src/data/productRegistry.js` with all 4 products
    - Define the Product type via JSDoc
    - Export `products` array with CS Reference Guide, PDF Editor, Basecamp Atlas, and Website Packages
    - Each product has: id, name, description, category, url, icon, status, requiresSubscription, isExternal
    - _Requirements: 2.1, 2.5_

  - [ ]* 2.2 Write property test for product registry schema validity
    - **Property 1: Product registry schema validity**
    - **Validates: Requirements 2.1**

- [x] 3. Checkpoint - Ensure data layer and tokens are solid
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement ProductCard component
  - [x] 4.1 Create `src/components/ProductCard.jsx`
    - Render product name, description, icon, and destination link
    - Handle status badges: "Coming Soon" (muted, non-clickable), "Beta" (badge, interactive), "live" (no badge, interactive)
    - Handle isExternal: true → anchor with `target="_blank"` and `rel="noopener noreferrer"`, show external-link icon
    - Handle isExternal: false → React Router `<Link>` for client-side navigation
    - Handle requiresSubscription && !isAuthenticated → show lock icon
    - Add hover effect with box-shadow elevation change, 150ms transition
    - Add touch feedback (200ms visual feedback before navigation)
    - Include `aria-label` containing product name and status
    - _Requirements: 2.2, 2.3, 2.4, 5.1, 5.2, 5.3, 5.4, 5.5, 8.5_

  - [ ]* 4.2 Write property test for status rendering behavior
    - **Property 2: Status determines card rendering behavior**
    - **Validates: Requirements 2.2, 2.3, 2.4**

  - [ ]* 4.3 Write property test for navigation behavior
    - **Property 5: Navigation behavior determined by isExternal flag**
    - **Validates: Requirements 5.2, 5.3**

  - [ ]* 4.4 Write property test for lock icon display
    - **Property 6: Subscription-gated products show lock icon when unauthenticated**
    - **Validates: Requirements 5.4**

  - [ ]* 4.5 Write property test for ARIA labels
    - **Property 9: ARIA labels reflect product identity**
    - **Validates: Requirements 8.5**

- [ ] 5. Implement ProductGrid and supporting homepage sections
  - [x] 5.1 Create `src/components/ProductGrid.jsx`
    - Import products from productRegistry.js
    - Render one ProductCard per product in a responsive grid (2x2 on desktop, single-column on mobile at 768px breakpoint)
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 5.2 Write property test for card field rendering
    - **Property 8: All registry products render as cards with required fields**
    - **Validates: Requirements 1.2**

  - [x] 5.3 Create `src/components/HeroSection.jsx`
    - Render Adverse brand logo, tagline (max 80 chars), and value proposition (max 200 chars)
    - _Requirements: 1.1_

  - [x] 5.4 Create `src/components/SocialProofBar.jsx`
    - Display 4 metrics: projects delivered, client satisfaction, experience years, response time
    - Use AnimatedSection for staggered reveal
    - _Requirements: 1.6_

  - [x] 5.5 Update `src/components/PackagesShowcase.jsx` (or create if needed)
    - Display at least 3 package cards from existing packages data with preview images and names
    - Each card links to /packages/:slug
    - Include link to /packages for browsing all packages
    - _Requirements: 1.5_

  - [x] 5.6 Create `src/components/ServicesSection.jsx`
    - Include heading with navigation links to /services and /packages
    - Position within first two viewport-heights on 768px+ viewports
    - _Requirements: 7.1, 7.4_

  - [x] 5.7 Create `src/components/CTASection.jsx`
    - Link to /contact with visible text for custom development inquiries
    - _Requirements: 1.7, 7.2_

- [x] 6. Checkpoint - Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement SEO component
  - [x] 7.1 Create `src/components/SEOHead.jsx`
    - Set page title (30-60 chars, contains "Adverse Solutions")
    - Set meta description (120-160 chars, references ≥2 products)
    - Generate JSON-LD ItemList with all "live" products (name, description, URL, position)
    - Generate JSON-LD Organization (name, logo, url, sameAs)
    - Include Open Graph tags (og:title, og:description, og:image, og:url, og:type="website")
    - Include Twitter Card tags (summary_large_image)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 7.2 Write property test for SEO ItemList
    - **Property 4: SEO ItemList includes all live products**
    - **Validates: Requirements 4.1**

- [x] 8. Implement subscription gate _(SKIPPED — deferred to later)_
  - [x] 8.1 Create `src/hooks/useSubscription.js` _(SKIPPED)_
    - Use existing useAuth() for session
    - Query Supabase `subscriptions` table for user's Stripe status
    - Map "active"/"trialing" → hasAccess: true
    - Map "past_due", "canceled", "unpaid", "incomplete_expired", "none" → hasAccess: false
    - Implement 5-second timeout on Stripe status check
    - Return { status, loading, error, hasAccess }
    - _Requirements: 6.1, 6.5, 6.6_

  - [ ]* 8.2 Write property test for subscription status mapping
    - **Property 7: Subscription status access mapping**
    - **Validates: Requirements 6.1**

  - [x] 8.3 Create `src/components/SubscriptionGuard.jsx` _(SKIPPED)_
    - Wrap gated routes, check subscription status before rendering children
    - If hasAccess → render children
    - If denied or unauthenticated → redirect to /subscribe
    - If timeout → show error message "Unable to verify subscription. Please try again later."
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6_

  - [x] 8.4 Create `/subscribe` landing page at `src/pages/SubscribePage.jsx` _(SKIPPED)_
    - Display "Adverse Pro" tier benefits, pricing, and CTA to subscribe
    - _Requirements: 6.3, 6.4_

- [x] 9. Wire homepage and routes together
  - [x] 9.1 Rewrite `src/pages/HomePage.jsx` to compose all new sections
    - Import and render: SEOHead, HeroSection, SocialProofBar, ProductGrid, PackagesShowcase, ServicesSection, CTASection
    - Use semantic HTML elements (main, section, nav, article, header)
    - Wrap in `<main className="product-hub">`
    - _Requirements: 1.1, 1.2, 1.6, 4.8_

  - [x] 9.2 Add /subscribe route to `src/App.jsx` _(SKIPPED — deferred with subscription)_
    - Add route for SubscribePage
    - Wrap any gated product routes with SubscriptionGuard
    - _Requirements: 6.3_

  - [x] 9.3 Update Navbar and Footer to use design system tokens
    - Replace hardcoded color values with `var(--color-*)` tokens
    - Apply `var(--font-display)` for brand name, `var(--font-body)` for links
    - Use `var(--radius-medium)` for buttons, `var(--shadow-small)` for scroll state
    - Maintain all existing functionality (mobile drawer, theme toggle, auth dropdown)
    - _Requirements: 3.5, 3.7_

  - [x] 9.4 Add homepage styles using design tokens
    - Create/update CSS for ProductGrid responsive layout (2x2 grid → single column at 768px)
    - Style ProductCard with hover elevation, transitions, and token-based colors
    - Style HeroSection, SocialProofBar, ServicesSection, CTASection using tokens
    - Ensure keyboard focus indicators with 3:1 contrast ratio
    - _Requirements: 1.3, 1.4, 5.1, 8.4_

- [x] 10. Performance and accessibility polish
  - [x] 10.1 Add lazy-loading for below-fold images
    - Apply `loading="lazy"` to product card images and package preview images below the fold
    - _Requirements: 8.3_

  - [x] 10.2 Update `public/sitemap.xml` with live product URLs
    - Add URLs for all products with status "live" from the registry
    - _Requirements: 4.7_

  - [x] 10.3 Ensure existing page preservation
    - Verify /services, /packages, /about, /contact routes render correctly with new design tokens
    - Update any hardcoded styles in these pages to reference tokens
    - _Requirements: 7.3, 3.5_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (9 properties total)
- Unit tests validate specific examples and edge cases
- The existing fast-check (v4.6.0) and vitest (v4.1.2) setup is used for all property-based tests
- Property test files follow the existing pattern: `src/__tests__/property-*.test.js` (or `.jsx` for component tests)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.2"] },
    { "id": 2, "tasks": ["4.1", "5.3", "5.4", "5.6", "5.7", "8.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4", "4.5", "5.1", "5.5", "7.1", "8.2", "8.3", "8.4"] },
    { "id": 4, "tasks": ["5.2", "7.2"] },
    { "id": 5, "tasks": ["9.1", "9.2", "9.3", "9.4"] },
    { "id": 6, "tasks": ["10.1", "10.2", "10.3"] }
  ]
}
```
