# Implementation Plan: Consistent Styling & Navigation

## Overview

Incrementally build out the design token system, responsive navbar, section IDs, cleanup, and style consolidation for the AdamsVerse single-page site. Each task builds on the previous one, ending with full wiring and a checkpoint.

## Tasks

- [x] 1. Extend design tokens in `styles.css`
  - [x] 1.1 Add the complete `:root` token set to `styles.css`
    - Add spacing scale (`--space-1` through `--space-12`), typography tokens (font family, sizes, weights, line heights), extended color tokens (`--accent-primary`, `--accent-primary-dark`, `--success-color`, `--error-color`, `--text-muted`), border radii (`--radius-sm` through `--radius-full`), shadows (`--shadow-sm`, `--shadow-md`, `--shadow-lg`), transitions (`--transition-fast`, `--transition-normal`, `--transition-slow`), and layout tokens (`--container-max-width`, `--container-max-width-lg`, `--container-padding`, `--container-padding-lg`, `--navbar-height`)
    - Preserve all existing icon color variables unchanged
    - _Requirements: 1.1, 1.4_

  - [x] 1.2 Replace hardcoded values in `styles.css` with token references
    - Go through every CSS rule outside `:root` and replace hardcoded px spacing, hex/rgba colors, font-size, border-radius, box-shadow, and transition values with the corresponding `var(--token)` references
    - Add `scroll-behavior: smooth` to `html`
    - Add `padding-top: var(--navbar-height)` to `body` for fixed navbar offset
    - _Requirements: 1.2, 1.3, 3.1, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.4_

- [x] 2. Checkpoint — Verify token migration
  - Ensure the site renders correctly with all token references. Ask the user if questions arise.

- [x] 3. Update `Section.jsx` to accept `id` prop
  - [x] 3.1 Modify `Section.jsx` to wrap content in a `<section>` element with `id` and `className="section"` props
    - Accept `id` prop alongside existing `title` and `children`
    - Render `<section className="section" id={id}>` wrapping the title and grid container
    - _Requirements: 2.7, 3.4_

- [x] 4. Create the `Navbar.jsx` component
  - [x] 4.1 Create `src/components/Navbar.jsx` with section links, Projects dropdown, and Learn dropdown
    - Define `PROJECTS`, `SECTIONS`, and `LEARN_LINKS` data arrays inside the component
    - Implement `mobileOpen`, `projectsOpen`, and `learnOpen` state via `useState`
    - Render horizontal nav bar for desktop (>600px) with dropdowns on hover/click
    - Render hamburger icon toggling a vertical overlay for mobile (≤600px) with accordion-style dropdown groups
    - Section links use `href="#section-id"` for smooth scroll; close mobile overlay on click
    - Project links use `target="_blank"` and `rel="noopener noreferrer"`
    - Learn links navigate to `/dsa.html` and `/leetcode.html`
    - Add `useEffect` to close mobile overlay on resize above 600px
    - Add click-outside handler to close open dropdowns
    - Show "No projects yet" placeholder if `PROJECTS` array is empty
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12_

  - [x] 4.2 Add navbar CSS styles to `styles.css`
    - Add `.navbar`, `.navbar-inner`, `.navbar-brand`, `.navbar-links`, `.navbar-dropdown`, `.navbar-dropdown-menu`, `.navbar-hamburger`, `.navbar-overlay`, `.navbar-overlay-group` classes
    - Use design tokens for all spacing, colors, radii, shadows, and transitions
    - Navbar: `position: fixed; top: 0; width: 100%; z-index: 1000;` with glass background
    - Desktop layout: horizontal flex, dropdowns positioned absolute below trigger
    - Mobile layout: hamburger visible ≤600px, overlay covers viewport
    - _Requirements: 2.9, 2.10, 2.11, 3.1, 5.1_

- [x] 5. Update `App.jsx` — wire navbar, section IDs, and cleanup markup
  - [x] 5.1 Import and render `<Navbar />` at the top of the container in `App.jsx`
    - Add `import Navbar from "./components/Navbar"` and place `<Navbar />` as the first child inside the container div
    - _Requirements: 2.1_

  - [x] 5.2 Pass `id` props to each `<Section>` in `App.jsx`
    - Add `id="pricing"`, `id="discord"`, `id="content-socials"`, `id="support"`, `id="contact"` to the corresponding Section components
    - Remove the standalone "Development" Section (replaced by Projects dropdown in nav)
    - _Requirements: 2.2, 2.7_

  - [x] 5.3 Fix `class` → `className` and remove inline styles in `App.jsx`
    - Replace `class="verse-discord-link"` and `class="fa-brands fa-discord"` with `className`
    - Remove all inline `style` attributes from the contact form heading, paragraph, and status message — move those styles to CSS classes (`.contact-heading`, `.contact-intro`, `.form-status-success`, `.form-status-error`) in `styles.css`
    - Remove the inline `style` on the `<footer>` — add a `.footer` CSS class
    - Remove unused `React` import if not needed
    - _Requirements: 3.2, 6.2_

- [x] 6. Delete unused component files
  - [x] 6.1 Delete `src/components/EmailForm.jsx` and `src/components/ContactSection.jsx`
    - These files are not imported by any module; remove them from the repository
    - _Requirements: 6.1, 6.3_

- [x] 7. Add responsive spacing overrides
  - [x] 7.1 Add mobile-responsive token overrides in `styles.css`
    - Inside a `@media (max-width: 600px)` block, reduce spacing and font-size tokens proportionally or use `clamp()` functions where appropriate
    - Ensure consistent gap reduction between grid items, section titles, and card internals on small viewports
    - _Requirements: 5.3, 5.2_

- [x] 8. Final checkpoint — Full integration verification
  - Ensure the site builds without errors (`npm run build`), all sections are reachable via navbar links, dropdowns work on desktop and mobile, no inline styles remain, no `class=` attributes in JSX, and deleted files are gone. Ask the user if questions arise.

## Notes

- No test tasks included per project requirements — fast delivery focus
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- All styles remain in the single `styles.css` file — no new CSS files
