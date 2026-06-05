# Implementation Plan: WeBuilder Preview UI

## Overview

Build a free, auth-aware website builder at `/builder` that lets potential clients select a template, edit content, customize themes, and see a live preview. Unauthenticated users hand off to sign-up; authenticated users save directly to Supabase and go to the dashboard. Reuses existing SectionRenderer, Content_Layer, Theme_Engine, and Upload_Service infrastructure.

## Tasks

- [x] 1. Route setup and page scaffold
  - [x] 1.1 Add /builder route to App.jsx
    - Add `const BuilderPage = lazy(() => import("./pages/BuilderPage"))` alongside other lazy imports
    - Add `<Route path="/builder" element={<BuilderPage />} />` in the public routes section
    - Verify Navbar and Footer render on the builder route (consistent with other public pages)
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 11.1_

  - [x] 1.2 Create BuilderPage scaffold
    - Create `src/pages/BuilderPage.jsx` with basic structure
    - Import `useAuth`, `useUser` from `@clerk/clerk-react`
    - Render a placeholder with step-based conditional: TemplateSelector or editor+preview
    - Create `src/pages/BuilderPage.module.css` for page-level styles
    - Wrap content in an Error Boundary
    - _Requirements: 1.4, 1.7, 11.6, 11.7_

- [x] 2. State management hook
  - [x] 2.1 Implement useBuilderState hook
    - Create `src/hooks/useBuilderState.js`
    - Accept `{ userId }` parameter (null for unauthenticated)
    - Implement state shape: step, config, activeTheme, baseThemeIndex, category, packageSlug, customColors, hasRestoredSession, supabaseProjectId
    - Implement actions: selectTemplate, selectBlankTemplate, updateField, selectTheme, customizeColor, resetTheme, getHandoffParams, clearSession, startFresh, resumeSession
    - Implement debounced localStorage persistence (1s debounce, key: `webuilder_preview_session`)
    - Handle localStorage unavailable/full gracefully
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 2.2 Add Supabase persistence to useBuilderState
    - Import `useSupabaseClient` from `../hooks/useSupabaseClient`
    - When `userId` is provided: implement `saveToSupabase()` (upsert to projects table with status "draft")
    - Implement `loadFromSupabase()` (fetch most recent draft project for user)
    - Debounce Supabase saves (1s, same as localStorage)
    - Fall back to localStorage-only on Supabase errors (toast notification)
    - On load: prefer Supabase version if newer than localStorage version
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [x] 3. Template selection
  - [x] 3.1 Create TemplateSelector component
    - Create `src/components/builder/TemplateSelector.jsx` + `.module.css`
    - Import packages from `src/data/packages.js`
    - Render 4 category filter cards (Food & Hospitality, Beauty & Wellness, Home Services, Professional)
    - On category select: show packages in that category (name, description, hero thumbnail)
    - On template select: call `onSelectTemplate(slug)` prop
    - Include "Start Blank" option with all 6 sections + placeholder content
    - Responsive grid: 2 cols mobile, 3 cols tablet, 4 cols desktop
    - Handle empty category gracefully
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 4. Content editing
  - [x] 4.1 Create ContentEditor component
    - Create `src/components/builder/ContentEditor.jsx` + `.module.css`
    - Accept props: `config`, `onFieldChange`, `readOnly` (optional, for Phase 2)
    - Import `getEditableFields` from Content_Layer
    - Render collapsible section groups for all 6 section types
    - Render field inputs matching EDITABLE_FIELDS definitions
    - Implement array field add/remove controls (services, gallery, testimonials)
    - Implement inline validation (500 char limit, URL format, array max items)
    - Mobile: full-width panel with toggle to show/hide preview
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 14.6_

  - [x] 4.2 Add image upload to ContentEditor
    - Add file upload controls for image fields (heroImage, gallery images, testimonial avatars)
    - Delegate to existing Upload_Service with `builder-preview/` path prefix
    - Show loading indicator during upload, disable duplicate submissions
    - Display error messages on failure (size, MIME, network)
    - Support manual URL entry as alternative to upload
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 5. Theme selection
  - [x] 5.1 Create ThemePicker component
    - Create `src/components/builder/ThemePicker.jsx` + `.module.css`
    - Accept props: packageSlug, activeThemeIndex, customColors, onSelectTheme, onCustomizeColor, onReset
    - Import themes from `src/data/themes.js`
    - Display 3 theme cards with label + color swatches (accent, bgBase, textPrimary)
    - Implement color customization mode (10 color picker inputs)
    - Validate hex colors (regex: `/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/`)
    - Implement reset button
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 6. Live preview
  - [x] 6.1 Create LivePreview component
    - Create `src/components/builder/LivePreview.jsx` + `.module.css`
    - Accept props: config, theme, layout
    - Render SectionRenderer with current config
    - Apply theme via `applyTheme(element, theme)` + `loadFonts(theme)` on a scoped container
    - Apply layout variant from CATEGORY_LAYOUT_MAP
    - Handle empty/placeholder content gracefully (no "undefined" text)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 7. Layout and responsive design
  - [x] 7.1 Create BuilderLayout component
    - Create `src/components/builder/BuilderLayout.jsx` + `.module.css`
    - Desktop (≥768px): side-by-side split-panel with draggable divider
    - Mobile (<768px): full-width with toggle between editor/preview
    - Ensure CTA button remains visible on all viewports
    - Touch targets minimum 44x44px
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 8. Handoff and conversion
  - [x] 8.1 Create HandoffButton component
    - Create `src/components/builder/HandoffButton.jsx` + `.module.css`
    - Import `useAuth` from `@clerk/clerk-react`, `useNavigate` from react-router, `useSupabaseClient`
    - Sticky bottom bar (matching PackageDetailPage persistentCta pattern)
    - If NOT signed in: "Get This Website" → save to `localStorage:webuilder_pending_config` → navigate to `/signup?redirect=/dashboard`
    - If signed in: "Save & Go to Dashboard" → create project in Supabase → navigate to `/dashboard/projects/:id`
    - "Download Config" secondary action (JSON file download)
    - "Prefer to talk first? Contact us" tertiary link → `/contact?package=Name&theme=Label`
    - Handle Supabase save errors (inline error, offer download as fallback)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 8.2 Add pending config pickup to dashboard
    - In DashboardPage (or DashboardLayout), check for `localStorage:webuilder_pending_config` on mount
    - If found: create project via `useSupabaseClient()` with the config, clear the key, show success toast
    - Handle creation errors gracefully
    - _Requirements: 8.8_

- [x] 9. Checkpoint — Core builder functional
  - Run `npm run build` and `npm run test` to verify no regressions
  - Manually verify: template selection → content editing → live preview → theme switching → handoff

- [x] 10. Accessibility
  - [x] 10.1 Add ARIA landmarks and keyboard navigation
    - Add semantic HTML structure (navigation, main, complementary landmarks)
    - Add aria-labels to all interactive elements
    - Implement keyboard navigation (Tab, Enter/Space, Escape, arrow keys)
    - Associate validation errors with inputs via aria-describedby
    - Add aria-live="polite" for error announcements
    - Add aria-label="Website preview" and role="region" to LivePreview
    - Add text labels alongside color swatches in ThemePicker
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 11. Checkpoint — Build, lint, and test verification
  - Run `npm run lint` — zero new errors
  - Run `npm run test` — all existing tests pass
  - Run `npm run build` — successful production build

- [ ] 12. Write property-based tests
  - [ ]* 12.1 Property test: Category filtering
    - Create `src/__tests__/property-preview-ui-category-filter.test.js`
    - **Property 1:** Filtered results contain only matching packages
    - _Requirements: 2.1, 2.2_

  - [ ]* 12.2 Property test: Deep copy independence
    - Create `src/__tests__/property-preview-ui-deep-copy.test.js`
    - **Property 2:** Template selection produces independent copy
    - _Requirements: 2.3_

  - [ ]* 12.3 Property test: Content validation
    - Create `src/__tests__/property-preview-ui-validation.test.js`
    - **Property 3:** Validator correctly accepts/rejects inputs
    - _Requirements: 3.3_

  - [ ]* 12.4 Property test: Array add/remove
    - Create `src/__tests__/property-preview-ui-array-ops.test.js`
    - **Property 4:** Array operations preserve length invariant
    - _Requirements: 3.5_

  - [ ]* 12.5 Property test: Section rendering order
    - Create `src/__tests__/property-preview-ui-section-order.test.jsx`
    - **Property 5:** Sections render in config order
    - _Requirements: 4.4_

  - [ ]* 12.6 Property test: Empty content handling
    - Create `src/__tests__/property-preview-ui-empty-content.test.jsx`
    - **Property 6:** No "undefined" or "null" in output
    - _Requirements: 4.5_

  - [ ]* 12.7 Property test: Theme override merge
    - Create `src/__tests__/property-preview-ui-theme-merge.test.js`
    - **Property 7:** Non-overridden tokens preserved
    - _Requirements: 5.4_

  - [ ]* 12.8 Property test: Hex color validation
    - Create `src/__tests__/property-preview-ui-hex-validation.test.js`
    - **Property 8:** Only valid hex formats accepted
    - _Requirements: 5.5_

  - [ ]* 12.9 Property test: Theme reset round-trip
    - Create `src/__tests__/property-preview-ui-theme-reset.test.js`
    - **Property 9:** Reset restores original theme
    - _Requirements: 5.7_

  - [ ]* 12.10 Property test: Upload failure state preservation
    - Create `src/__tests__/property-preview-ui-upload-failure.test.js`
    - **Property 10:** State unchanged on upload failure
    - _Requirements: 6.4_

  - [ ]* 12.11 Property test: localStorage round-trip
    - Create `src/__tests__/property-preview-ui-localstorage.test.js`
    - **Property 11:** Serialize/deserialize produces equal state
    - _Requirements: 7.2, 7.4_

  - [ ]* 12.12 Property test: Handoff URL params
    - Create `src/__tests__/property-preview-ui-handoff.test.js`
    - **Property 12:** Contact URL params match state
    - _Requirements: 8.7_

  - [ ]* 12.13 Property test: Config export round-trip
    - Create `src/__tests__/property-preview-ui-export.test.js`
    - **Property 13:** JSON export/parse produces equal config
    - _Requirements: 8.4_

  - [ ]* 12.14 Property test: Semi-dynamic packageType
    - Create `src/__tests__/property-preview-ui-package-type.test.js`
    - **Property 14:** All templates get packageType "semi-dynamic"
    - _Requirements: 2.3, 3.2_

  - [ ]* 12.15 Property test: Auth handoff Supabase row
    - Create `src/__tests__/property-preview-ui-auth-handoff.test.js`
    - **Property 15:** Authenticated handoff produces correct project row
    - _Requirements: 8.3, 13.2_

  - [ ]* 12.16 Property test: Draft upsert idempotency
    - Create `src/__tests__/property-preview-ui-draft-upsert.test.js`
    - **Property 16:** Multiple saves produce one draft row
    - _Requirements: 13.3_

- [x] 13. Write unit tests
  - [x] 13.1 Unit tests for builder components
    - Create test files: `builder-template-selector.test.jsx`, `builder-content-editor.test.jsx`, `builder-theme-picker.test.jsx`, `builder-live-preview.test.jsx`, `builder-handoff-unauth.test.jsx`, `builder-handoff-auth.test.jsx`, `builder-layout.test.jsx`, `builder-accessibility.test.jsx`, `builder-upload.test.jsx`, `builder-session-resume.test.jsx`, `builder-error-boundary.test.jsx`, `builder-auth-navbar.test.jsx`, `builder-supabase-persistence.test.jsx`
    - Mock `@clerk/clerk-react` for auth-aware tests
    - Mock `useSupabaseClient` for Supabase persistence tests
    - _Requirements: 16.1–16.5 (test coverage)_

- [x] 14. Final checkpoint — Full verification
  - Run `npm run lint` — zero errors
  - Run `npm run test` — all tests pass
  - Run `npm run build` — successful production build
  - Verify no regressions to existing tests

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The ContentEditor is designed as a reusable module for Phase 2 dashboard integration
- Phase 2 tasks (dashboard editing, preview modal) are NOT included — they'll be a separate spec
- The builder does NOT require auth but IS auth-aware (different behavior for signed-in users)
- All builder components go in `src/components/builder/` directory

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1", "5.1", "6.1"] },
    { "id": 3, "tasks": ["4.1", "7.1"] },
    { "id": 4, "tasks": ["4.2", "8.1"] },
    { "id": 5, "tasks": ["8.2", "10.1"] },
    { "id": 6, "tasks": ["13.1"] },
    { "id": 7, "tasks": ["12.1", "12.2", "12.3", "12.4", "12.5", "12.6", "12.7", "12.8", "12.9", "12.10", "12.11", "12.12", "12.13", "12.14", "12.15", "12.16"] }
  ]
}
```
