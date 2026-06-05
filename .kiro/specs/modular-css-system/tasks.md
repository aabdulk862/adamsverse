# Implementation Plan: Modular CSS System

## Overview

Decompose the monolithic `src/styles.css` (~7967 lines) into a three-layer modular CSS architecture: a single token file, a thin import manifest for global styles, and co-located CSS Modules for components and pages. The migration proceeds in 4 phases, each ending with a passing build.

## Tasks

- [x] 1. Phase 1: Token Consolidation
  - [x] 1.1 Merge all `:root` variables from `styles.css` into `src/tokens.css` using canonical naming
    - Audit `styles.css` `:root` block for all custom properties (--bg-*, --text-*, --font-size-*, --space-*, --radius-*, --shadow-*, --transition-*, --card-*, --navbar-*, --accent-*)
    - Map each old variable name to its canonical name per the design token mapping table
    - Add all canonical token definitions to `src/tokens.css` under `:root`
    - Organize tokens by family: colors, spacing, typography, radii, shadows, transitions, layout, cards, accent
    - _Requirements: 1.1, 1.2, 7.1, 7.2_

  - [x] 1.2 Merge all `[data-theme="dark"]` overrides into `src/tokens.css`
    - Extract dark theme token overrides from `styles.css` `[data-theme="dark"]` block
    - Add them to `src/tokens.css` under the `[data-theme="dark"]` selector
    - Use canonical token names for all dark theme overrides
    - _Requirements: 1.2, 7.1_

  - [x] 1.3 Add backward-compatible aliases for old variable names
    - For each renamed token, add an alias in `tokens.css`: `--old-name: var(--canonical-name)`
    - This ensures all existing references in `styles.css`, component files, and page modules continue to resolve
    - Include aliases for: `--bg-primary`, `--text-primary`, `--font-size-*`, `--font-weight-*`, `--line-height-*`, `--radius-small/medium/large`, `--shadow-small/medium/large`, etc.
    - _Requirements: 6.1, 6.3, 7.3_

  - [x] 1.4 Remove duplicate `:root` and `[data-theme="dark"]` blocks from `styles.css`
    - Delete the `:root` variable block from `styles.css` (tokens now live in `tokens.css`)
    - Delete the `[data-theme="dark"]` variable block from `styles.css` (now in `tokens.css`)
    - Keep all other CSS rules in `styles.css` intact
    - _Requirements: 1.3, 7.1_

  - [x] 1.5 Update `src/main.jsx` import order to ensure `tokens.css` is imported first
    - Verify `import "./tokens.css"` appears before `import "./styles.css"` in `main.jsx`
    - If not already in this order, reorder the imports
    - _Requirements: 1.5, 2.4_

  - [ ]* 1.6 Write property test for Token Deduplication (Property 2)
    - **Property 2: Token Deduplication**
    - Verify no `:root` custom property defined in `tokens.css` is also defined as a `:root` property in any file within `src/styles/` or in `styles.css`
    - **Validates: Requirements 1.3, 7.1**

  - [ ]* 1.7 Write property test for Token Mapping Correctness (Property 6)
    - **Property 6: Token Mapping Correctness**
    - For each entry in the token mapping (old → canonical), verify the canonical name exists in `tokens.css` `:root`
    - **Validates: Requirements 7.3**

- [x] 2. Checkpoint — Verify build passes after Phase 1
  - Run `vite build` and ensure it completes without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Phase 2: Global Style Extraction
  - [x] 3.1 Create `src/styles/reset.css` — extract reset and base styles
    - Extract CSS reset rules, box-sizing, body defaults, skip-to-content from `styles.css`
    - Place in `src/styles/reset.css`
    - Remove extracted rules from `styles.css`
    - _Requirements: 3.1, 3.2_

  - [x] 3.2 Create `src/styles/typography.css` — extract heading and text styles
    - Extract heading scales (h1–h6), body text rules, link styles from `styles.css`
    - Place in `src/styles/typography.css`
    - Remove extracted rules from `styles.css`
    - _Requirements: 3.1, 3.2_

  - [x] 3.3 Create `src/styles/cards.css` — extract shared card base styles
    - Extract `.card`, `.card:hover`, card shadow rules from `styles.css`
    - Place in `src/styles/cards.css`
    - Remove extracted rules from `styles.css`
    - _Requirements: 3.2, 3.3_

  - [x] 3.4 Create `src/styles/forms.css` — extract form element styles
    - Extract `.email-form`, input, select, textarea, button, focus state, and status message rules from `styles.css`
    - Place in `src/styles/forms.css`
    - Remove extracted rules from `styles.css`
    - _Requirements: 3.2, 3.3_

  - [x] 3.5 Create `src/styles/layout.css` — extract shared layout patterns
    - Extract `.section`, `.page-header`, `.flag`, `.container` patterns from `styles.css`
    - Place in `src/styles/layout.css`
    - Remove extracted rules from `styles.css`
    - _Requirements: 3.3, 3.2_

  - [x] 3.6 Create `src/styles/navbar.css` — extract navbar styles
    - Extract `.navbar`, `.navbar-*` rules (fixed position, overlay, mobile breakpoint, auth elements) from `styles.css`
    - Place in `src/styles/navbar.css`
    - Remove extracted rules from `styles.css`
    - _Requirements: 3.2, 3.3_

  - [x] 3.7 Create `src/styles/dark-theme.css` — extract dark theme global overrides
    - Extract all `[data-theme="dark"]` rule overrides for global elements (not token definitions) from `styles.css`
    - Place in `src/styles/dark-theme.css`
    - Remove extracted rules from `styles.css`
    - _Requirements: 3.1, 3.2_

  - [x] 3.8 Create `src/styles/responsive.css` — extract responsive overrides
    - Extract responsive token overrides, mobile touch targets, and accessibility audit rules from `styles.css`
    - Place in `src/styles/responsive.css`
    - Remove extracted rules from `styles.css`
    - _Requirements: 3.1, 3.2_

  - [x] 3.9 Convert `src/styles.css` into the import-only manifest
    - Replace all remaining extracted content with `@import` statements in correct cascade order
    - Final content: imports for reset, typography, cards, forms, layout, navbar, dark-theme, responsive
    - Ensure no CSS rules, selectors, or property definitions remain (only `@import` and comments)
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 3.10 Write property test for Manifest Purity (Property 1)
    - **Property 1: Manifest Purity**
    - Parse `styles.css` and verify every non-comment, non-whitespace line is a valid `@import` statement referencing `./styles/` directory
    - **Validates: Requirements 2.1, 2.2**

- [x] 4. Checkpoint — Verify build passes after Phase 2
  - Run `vite build` and ensure it completes without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Phase 3: Component Module Extraction
  - [x] 5.1 Convert `ProductCard.css` → `ProductCard.module.css` + update JSX
    - Rename `src/components/ProductCard.css` to `src/components/ProductCard.module.css`
    - Convert BEM class names (`.product-card__header`) to short camelCase names (`.header`)
    - Update `ProductCard.jsx`: change `import './ProductCard.css'` to `import styles from './ProductCard.module.css'`
    - Replace all `className="..."` with `className={styles.name}` references
    - Verify all `var()` references use canonical token names
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 9.1_

  - [x] 5.2 Convert `ProductGrid.css` → `ProductGrid.module.css` + update JSX
    - Rename `src/components/ProductGrid.css` to `src/components/ProductGrid.module.css`
    - Convert BEM class names to short camelCase names
    - Update `ProductGrid.jsx`: change `import './ProductGrid.css'` to `import styles from './ProductGrid.module.css'`
    - Replace all `className="..."` with `className={styles.name}` references
    - Verify all `var()` references use canonical token names
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 9.1_

  - [x] 5.3 Split `product-hub.css` into component modules
    - Extract `.hero-section` styles → `src/components/HeroSection.module.css`, update `HeroSection.jsx`
    - Extract `.social-proof-bar` styles → `src/components/SocialProofBar.module.css`, update `SocialProofBar.jsx`
    - Extract `.cta-section` styles → `src/components/CTASection.module.css`, update `CTASection.jsx`
    - Extract `.services-section` styles → `src/components/ServicesSection.module.css`, update `ServicesSection.jsx`
    - Move `.product-hub` wrapper styles to `HomePage.module.css` (created in Phase 4)
    - Remove duplicate `.product-grid` and `.product-card` definitions already in component CSS files
    - Remove `import "./styles/product-hub.css"` from `main.jsx`
    - _Requirements: 4.1, 4.2, 6.2, 9.3_

  - [x] 5.4 Extract `Footer.module.css` from `styles.css` globals + update JSX
    - Extract footer-related rules from global stylesheets into `src/components/Footer.module.css`
    - Update `Footer.jsx` to import and use the CSS module
    - Remove extracted footer rules from global files
    - _Requirements: 4.1, 4.2, 4.5, 6.2_

  - [x] 5.5 Extract `PackagesShowcase.module.css` from `styles.css` globals + update JSX
    - Extract packages showcase rules from global stylesheets into `src/components/PackagesShowcase.module.css`
    - Update `PackagesShowcase.jsx` to import and use the CSS module
    - Remove extracted rules from global files
    - _Requirements: 4.1, 4.2, 4.5, 6.2_

  - [x] 5.6 Extract remaining component modules (InvoiceCard, MessageThread, FileUpload, NotificationBadge, ProfileHeader, ProjectTimeline)
    - For each component with styles in global files: create `{Component}.module.css`, update JSX, remove from globals
    - Convert class names to camelCase module pattern
    - Verify all `var()` references use canonical token names
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 6.2_

  - [ ]* 5.7 Write property test for Module Scope Purity (Property 4)
    - **Property 4: Module Scope Purity**
    - Parse all `.module.css` files and verify no bare element selectors (h1, p, div without class qualifier) and no `:global()` declarations exist
    - **Validates: Requirements 4.3**

  - [ ]* 5.8 Write property test for No Cross-Layer Duplication (Property 5)
    - **Property 5: No Cross-Layer Duplication**
    - For any class name in a `.module.css` file, verify it does not also appear as a selector in any `src/styles/*.css` file
    - **Validates: Requirements 5.3, 6.2**

- [x] 6. Checkpoint — Verify build passes after Phase 3
  - Run `vite build` and ensure it completes without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Phase 4: Page Module Extraction
  - [x] 7.1 Extract `HomePage.module.css` from `styles.css` globals + update JSX
    - Extract home-services, home-portfolio, home-packages, ai-cta, values-banner, final-cta sections
    - Include `.product-hub` wrapper styles from the split in Phase 3
    - Create `src/pages/HomePage.module.css`, update `HomePage.jsx` to use module imports
    - Remove extracted rules from global files
    - _Requirements: 5.1, 5.2, 5.4, 6.2_

  - [x] 7.2 Extract `AboutPage.module.css` + update JSX
    - Extract about page specific styles from global files
    - Create `src/pages/AboutPage.module.css`, update `AboutPage.jsx`
    - Remove extracted rules from global files
    - _Requirements: 5.1, 5.2, 5.4, 6.2_

  - [x] 7.3 Extract `ServicesPage.module.css` + update JSX
    - Extract services page specific styles from global files
    - Create `src/pages/ServicesPage.module.css`, update `ServicesPage.jsx`
    - Remove extracted rules from global files
    - _Requirements: 5.1, 5.2, 5.4, 6.2_

  - [x] 7.4 Extract `ContactPage.module.css` + update JSX
    - Extract contact page specific styles from global files
    - Create `src/pages/ContactPage.module.css`, update `ContactPage.jsx`
    - Remove extracted rules from global files
    - _Requirements: 5.1, 5.2, 5.4, 6.2_

  - [x] 7.5 Extract `LearnPage.module.css` + update JSX
    - Extract learn page specific styles from global files
    - Create `src/pages/LearnPage.module.css`, update `LearnPage.jsx`
    - Remove extracted rules from global files
    - _Requirements: 5.1, 5.2, 5.4, 6.2_

  - [x] 7.6 Extract `LoginPage.module.css` + update JSX
    - Extract login page specific styles from global files
    - Create `src/pages/LoginPage.module.css`, update `LoginPage.jsx`
    - Remove extracted rules from global files
    - _Requirements: 5.1, 5.2, 5.4, 6.2_

  - [x] 7.7 Extract `DashboardPage.module.css` and `DashboardLayout.module.css` + update JSX
    - Extract dashboard page and layout styles from global files
    - Create `src/pages/DashboardPage.module.css`, update `DashboardPage.jsx`
    - Create `src/components/DashboardLayout.module.css`, update `DashboardLayout.jsx`
    - Remove extracted rules from global files
    - _Requirements: 5.1, 5.2, 5.4, 6.2_

  - [x] 7.8 Extract remaining page modules (ProjectListPage, ProjectDetailPage, BillingPage, SettingsPage, AdminDashboardPage, AdminClientsPage, AdminInvoicesPage, AdminProjectsPage, MessagesPage, IntakeFormPage)
    - For each page with styles in global files: create `{Page}.module.css`, update JSX, remove from globals
    - Convert class names to camelCase module pattern
    - Verify all `var()` references use canonical token names
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.2_

  - [x] 7.9 Verify existing modules use canonical token names
    - Audit `PackagesPage.module.css`, `PackageDetailPage.module.css`, `ArtifactBrowserPage.module.css`
    - Replace any old token names (e.g., `--bg-primary`, `--radius-small`) with canonical names (e.g., `--color-bg-base`, `--radius-sm`)
    - _Requirements: 9.2, 7.4_

  - [x] 7.10 Remove backward-compatible token aliases from `tokens.css`
    - Delete all alias lines (e.g., `--bg-primary: var(--color-bg-base)`) from `tokens.css`
    - All references should now use canonical names directly
    - _Requirements: 7.1, 7.3_

  - [x] 7.11 Final cleanup — verify `styles.css` is import-only
    - Confirm `styles.css` contains only `@import` statements and comments
    - Confirm no CSS rules remain in `styles.css` outside of the imported files
    - Remove any empty or orphaned selectors from global style files
    - _Requirements: 2.1, 2.2_

  - [ ]* 7.12 Write property test for Token Reference Resolution (Property 3)
    - **Property 3: Token Reference Resolution**
    - For any `var(--*)` reference in any stylesheet, verify the referenced property is defined in `tokens.css` under `:root` or `[data-theme="dark"]`, defined locally, or has a fallback value
    - **Validates: Requirements 3.4, 4.5, 7.4, 9.2**

- [x] 8. Final Checkpoint — Verify complete build passes
  - Run `vite build` and ensure it completes without errors
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each migration phase
- Property tests validate universal correctness properties from the design document
- The build must pass after each phase — no phase should leave the project in a broken state
- Backward-compatible aliases (Phase 1) allow incremental migration; they are removed in Phase 4 after all references are updated
- Existing CSS modules (PackagesPage, PackageDetailPage, ArtifactBrowserPage) only need token name verification, not structural changes

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4"] },
    { "id": 3, "tasks": ["1.5", "1.6", "1.7"] },
    { "id": 4, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8"] },
    { "id": 5, "tasks": ["3.9", "3.10"] },
    { "id": 6, "tasks": ["5.1", "5.2", "5.4", "5.5"] },
    { "id": 7, "tasks": ["5.3"] },
    { "id": 8, "tasks": ["5.6", "5.7", "5.8"] },
    { "id": 9, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6"] },
    { "id": 10, "tasks": ["7.7", "7.8"] },
    { "id": 11, "tasks": ["7.9", "7.10", "7.11", "7.12"] }
  ]
}
```
