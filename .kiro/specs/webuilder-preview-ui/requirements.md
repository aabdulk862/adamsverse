# Requirements Document

## Introduction

The WeBuilder Preview UI is a free, no-authentication-required lead generation tool for the Adverse Solutions platform. It provides a `/builder` route where potential clients can select a business category template, fill in their content (headline, services, gallery images, testimonials, CTA text, contact info), choose or customize a theme, and see a live preview of their website rendered in real-time.

The builder follows a two-phase architecture:
- **Phase 1:** Free preview builder — no auth required, localStorage persistence, handoff to contact form or sign-up flow
- **Phase 2:** Client editing dashboard — Supabase persistence, Clerk auth-gated, content-only edits via `/dashboard`

Authentication is provided by Clerk (`@clerk/clerk-react`) with the domain `adversesolutions.com` and Clerk Frontend API at `clerk.adversesolutions.com`. The builder itself does NOT require authentication, but it is auth-AWARE: authenticated users get enhanced persistence (Supabase) and a streamlined handoff to the dashboard. Supabase is used for database/storage (not auth); authenticated Supabase queries use Clerk session tokens via the `useSupabaseClient()` hook for RLS.

The builder integrates into the existing "Adverse Pro" subscription model foundation: the builder itself is free (lead-gen), but future premium features (config export, saved sessions across devices) will be gated behind the subscription tier. Phase 1 does not implement any subscription gating.

## Glossary

- **Builder_UI**: The public-facing, no-auth web interface at the `/builder` route that guides users through template selection, content editing, theme customization, and live preview
- **Template_Selector**: The initial step of the Builder_UI where users pick a business category and starting template configuration
- **Content_Editor**: The panel within the Builder_UI where users fill in structured content fields (headline, services, gallery images, testimonials, CTA text, contact info) for each section
- **Theme_Picker**: The component within the Builder_UI that allows users to select from available pre-built themes or customize individual color tokens
- **Live_Preview**: The real-time rendered preview of the user's website that updates immediately as content or theme changes are made in the Builder_UI
- **Builder_State**: The in-memory React state (with localStorage backup, and Supabase backup for authenticated users) that holds the user's current Package_Config and theme selections throughout the builder session
- **Package_Config**: A JSON object that fully describes a package's sections, content, theme reference, and metadata — the output artifact of the Builder_UI, validated by the existing Package_Schema (ajv, JSON Schema draft 2020-12)
- **Section_Renderer**: The existing dynamic component (`src/components/packages/SectionRenderer.jsx`) that reads a Package_Config and renders the appropriate Section components in sequence with correct props and theme context
- **Section_Registry**: The existing centralized mapping (`src/registry/sectionRegistry.js`) of section type identifiers (hero, services, gallery, testimonials, cta, contact) to their React component implementations
- **Theme_Engine**: The existing centralized system (`src/utils/applyTheme.js` + `src/utils/fontLoader.js`) that manages design tokens and applies them as CSS custom properties to scoped DOM elements
- **Content_Layer**: The existing abstraction (`src/lib/contentLayer.js`) that separates business content from layout, providing `resolveContent()`, `editField()`, and `getEditableFields()` APIs
- **Upload_Service**: The existing module (`src/lib/uploadService.js`) responsible for uploading files to Supabase Storage (`client-assets` bucket), enforcing 5 MB size and image MIME type constraints, and returning public URLs
- **Contact_Page**: The existing public contact form at `/contact` that accepts URL query parameters (`?package=Name&theme=Label`) to pre-fill the message field with the user's package selection
- **Handoff_Payload**: The package name and theme label passed from the Builder_UI to the Contact_Page via URL query parameters when the user clicks "Get This Website"
- **Clerk_Session**: The authenticated session managed by Clerk (`@clerk/clerk-react`), providing `useAuth()` for auth state (`isSignedIn`, `getToken`) and `useUser()` for profile data (`fullName`, `imageUrl`, `primaryEmailAddress`)
- **Authenticated_Builder_State**: The enhanced Builder_State for signed-in users where persistence targets both localStorage (offline fallback) and Supabase `projects` table (via `useSupabaseClient()`) for cross-device access and dashboard integration

## Requirements

### Requirement 1: Builder Route and Navigation

**User Story:** As a potential client, I want to access the website builder from a dedicated URL, so that I can start building my preview website without signing up or logging in.

#### Acceptance Criteria

1. THE Builder_UI SHALL be accessible at the `/builder` route without requiring authentication, session tokens, or any form of user login
2. WHEN a user navigates to `/builder`, THE Builder_UI SHALL render within the existing App.jsx routing structure using React Router DOM, preserving the existing AnimatePresence page transition behavior (opacity 0→1, y 8→0 on enter; opacity 0, y -8 on exit; duration 0.15s)
3. THE `/builder` route SHALL display the site Navbar and Footer consistent with other public routes (/, /packages, /about, /services, /tools, /contact, /learn)
4. WHEN the `/builder` route is loaded, THE Builder_UI SHALL render the Template_Selector as the initial step without requiring any prior user interaction
5. THE Builder_UI SHALL be lazy-loaded using React.lazy and Suspense with the existing LoadingFallback component, consistent with the lazy-loading strategy used for PackageDetailPage and other non-critical routes
6. THE Builder_UI route SHALL be included in the existing Netlify SPA redirect rule (`/* → /index.html 200`) without requiring additional redirect configuration
7. IF a user is authenticated (Clerk `isSignedIn === true`) when visiting `/builder`, THE Builder_UI SHALL display their user avatar (from `useUser().user.imageUrl`) in the navbar consistent with other authenticated pages, without requiring or prompting for login

### Requirement 2: Template Selection

**User Story:** As a potential client, I want to pick a business category and starting template, so that I begin with relevant content structure and layout for my industry.

#### Acceptance Criteria

1. THE Template_Selector SHALL present the available business categories derived from the existing 12 packages in `src/data/packages.js`: Food & Hospitality (restaurant, cafe-coffee-shop, hotel-bnb), Beauty & Wellness (lash-studio, hair-salon, gym-trainer), Home Services (auto-repair, cleaning-service, landscaping), and Professional (real-estate-agent, photographer, attorney)
2. WHEN a user selects a business category, THE Template_Selector SHALL display the existing packages within that category as selectable starting templates, showing each package's name, description, and hero image as a thumbnail preview
3. WHEN a user selects a starting template, THE Builder_UI SHALL initialize the Builder_State with a deep copy of the selected package's configuration (sections and content) with `packageType` set to "semi-dynamic" (enabling content editing via the Content_Layer) and assign the first available theme for that package slug from `src/data/themes.js` as the active theme
4. WHEN a user selects a starting template, THE Builder_UI SHALL transition from the Template_Selector step to the Content_Editor and Live_Preview step
5. THE Template_Selector SHALL allow the user to start with a blank template that includes all 6 section types (hero, services, gallery, testimonials, cta, contact) with placeholder content, `packageType: "semi-dynamic"`, and the slug "custom-builder"
6. IF no packages exist for a selected category, THEN THE Template_Selector SHALL display a message indicating no templates are available for that category and offer the blank template option

### Requirement 3: Content Editing Interface

**User Story:** As a potential client, I want to fill in my business content through a guided form, so that I can see my actual information rendered on the preview website.

#### Acceptance Criteria

1. THE Content_Editor SHALL present editable fields for all 6 section types organized by section, matching the EDITABLE_FIELDS definitions in the existing Content_Layer: hero (headline, subheadline, ctaText, heroImage), services (heading, items array), gallery (heading, images array), testimonials (heading, items array), cta (heading, body, buttonText), and contact (heading, phone, email, address, hours)
2. WHEN a user modifies any content field in the Content_Editor, THE Builder_State SHALL update the corresponding field in the in-memory Package_Config within 16ms (single animation frame) to enable real-time preview updates
3. THE Content_Editor SHALL validate content field values against the constraints defined in the Content_Layer: string fields limited to 500 characters, URL fields conforming to valid URL format (beginning with http://, https://, or /), service items limited to 20 entries, gallery images limited to 30 entries, and testimonial items limited to 20 entries
4. IF a content field value fails validation, THEN THE Content_Editor SHALL display an inline error message below the field indicating the specific constraint violated, without preventing the user from continuing to edit other fields
5. THE Content_Editor SHALL support adding and removing items from array fields (services items, gallery images, testimonial items) through add/remove controls adjacent to each array entry
6. THE Content_Editor SHALL present fields grouped by section with clear section headings, and allow the user to expand or collapse each section group to manage screen space
7. WHEN the Content_Editor is displayed on mobile viewports (width less than 768px), THE Content_Editor SHALL render as a full-width panel that can be toggled to show or hide the Live_Preview, rather than displaying both side-by-side

### Requirement 4: Live Preview Rendering

**User Story:** As a potential client, I want to see my website update in real-time as I edit content, so that I can immediately visualize how my business will look online.

#### Acceptance Criteria

1. THE Live_Preview SHALL render the current Builder_State Package_Config using the existing SectionRenderer component (`src/components/packages/SectionRenderer.jsx`), producing the same visual output as the PackageDetailPage for an equivalent configuration
2. WHEN any field in the Builder_State Package_Config changes, THE Live_Preview SHALL re-render the affected section within a single animation frame (16ms) without full-page reload or remounting unaffected sections
3. THE Live_Preview SHALL apply the currently selected theme from the Builder_State using the existing Theme_Engine (`applyTheme` + `loadFonts`), setting CSS custom properties on the preview container element
4. THE Live_Preview SHALL render all 6 section types (hero, services, gallery, testimonials, cta, contact) in the order they appear in the Package_Config sections object, with SectionDividers between consecutive sections (matching existing SectionRenderer behavior)
5. WHEN a section's content is empty or contains only placeholder values, THE Live_Preview SHALL render the section with graceful empty-state handling consistent with existing Section component behavior (omitting UI elements for missing fields rather than displaying "undefined")
6. THE Live_Preview SHALL apply the layout variant derived from the selected template's category via the existing CATEGORY_LAYOUT_MAP (Professional → professional, Beauty & Wellness → beauty, Home Services → homeServices, Food & Hospitality → foodHospitality)
7. WHEN displayed on desktop viewports (width 768px or greater), THE Live_Preview SHALL render alongside the Content_Editor in a split-panel layout where the preview occupies at least 50% of the viewport width

### Requirement 5: Theme Selection and Customization

**User Story:** As a potential client, I want to choose a visual theme or customize colors, so that the preview website matches my brand identity.

#### Acceptance Criteria

1. THE Theme_Picker SHALL display all 3 available themes for the selected template's package slug from the existing `src/data/themes.js` data, showing each theme's label and a color swatch preview of its accent, bgBase, and textPrimary tokens
2. WHEN a user selects a theme from the Theme_Picker, THE Builder_State SHALL update the active theme and THE Live_Preview SHALL re-render with the new theme's design tokens applied via `applyTheme()` and fonts loaded via `loadFonts()` within a single animation frame
3. THE Theme_Picker SHALL provide a color customization mode where users can override individual color tokens (bgBase, bgSurface, bgMuted, textPrimary, textSecondary, textMuted, accent, accentHover, accentText, border) using a color picker input for each token
4. WHEN a user customizes a color token, THE Builder_State SHALL store the customized theme as a modified copy of the base theme with the overridden token values, and THE Live_Preview SHALL reflect the change in real-time
5. THE Theme_Picker SHALL validate that customized color values are valid CSS color strings (hex format #RGB, #RRGGBB, or #RRGGBBAA) before applying them to the Builder_State
6. IF a customized color value is not a valid CSS color string, THEN THE Theme_Picker SHALL display an inline error and preserve the previous valid color value in the Builder_State
7. THE Theme_Picker SHALL provide a reset button that restores the active theme to its original unmodified state from the themes data

### Requirement 6: Image Upload Integration

**User Story:** As a potential client, I want to upload my own images for the gallery and hero sections, so that the preview shows my actual business photos.

#### Acceptance Criteria

1. WHEN a user interacts with an image field (heroImage in hero section, images array in gallery section, avatar in testimonials section), THE Content_Editor SHALL provide a file upload control that accepts image files
2. THE Content_Editor SHALL delegate file uploads to the existing Upload_Service (`src/lib/uploadService.js`), which validates file size (maximum 5 MB) and MIME type (image/jpeg, image/png, image/webp, image/svg+xml) before uploading to Supabase Storage
3. WHEN a file upload succeeds, THE Content_Editor SHALL store the returned public URL in the corresponding content field of the Builder_State Package_Config and THE Live_Preview SHALL display the uploaded image
4. IF a file upload fails due to size limit, invalid MIME type, network error, or storage error, THEN THE Content_Editor SHALL display an error message describing the failure reason without modifying the current field value in the Builder_State
5. THE Content_Editor SHALL display a loading indicator on the image field while an upload is in progress, preventing duplicate upload submissions for the same field
6. THE Content_Editor SHALL use a builder-specific storage path prefix (`builder-preview/`) when calling the Upload_Service, organizing uploaded files separately from production client assets
7. THE Content_Editor SHALL allow users to enter an image URL directly as an alternative to file upload, supporting both upload and manual URL entry for all image fields

### Requirement 7: Builder State Management

**User Story:** As a potential client, I want my progress saved locally while I build, so that I do not lose my work if I accidentally close the browser tab.

#### Acceptance Criteria

1. THE Builder_State SHALL maintain the complete Package_Config (sections, content, theme reference, category, and any customized theme overrides) in React component state as the single source of truth during the builder session
2. WHEN the Builder_State changes, THE Builder_UI SHALL persist the current state to localStorage under the key `webuilder_preview_session` within 1 second of the change, using debounced writes to avoid excessive storage operations
3. WHEN the `/builder` route is loaded and a previous Builder_State exists in localStorage, THE Builder_UI SHALL offer the user a choice to resume their previous session or start fresh
4. WHEN the user chooses to resume, THE Builder_UI SHALL restore the Builder_State from localStorage and render the Content_Editor and Live_Preview with the restored configuration
5. WHEN the user chooses to start fresh, THE Builder_UI SHALL clear the previous localStorage entry and display the Template_Selector
6. THE Builder_State SHALL NOT require any database persistence, server-side storage, or authenticated API calls for unauthenticated users — all state lives exclusively in React state and localStorage
7. IF localStorage is unavailable or full, THEN THE Builder_UI SHALL continue functioning with in-memory state only and display a non-blocking notification informing the user that auto-save is unavailable

### Requirement 8: Handoff — Auth-Aware Conversion Flow

**User Story:** As a potential client, I want to submit my preview website configuration to get a real website built, so that I can convert my preview into a purchased product.

#### Acceptance Criteria

1. THE Builder_UI SHALL display a prominent call-to-action button that is visible at all times during the content editing and preview phase
2. IF the user is NOT authenticated (Clerk `isSignedIn === false`), THE CTA button SHALL display "Get This Website" and WHEN clicked SHALL: (a) save the current Package_Config to localStorage under the key `webuilder_pending_config`, (b) navigate to `/signup` with a `redirect=/dashboard` query parameter so that after sign-up the user is redirected to the dashboard where their config is loaded and a project is created
3. IF the user IS authenticated (Clerk `isSignedIn === true`), THE CTA button SHALL display "Save & Go to Dashboard" and WHEN clicked SHALL: (a) save the Package_Config to the Supabase `projects` table as a new project via `useSupabaseClient()` with `client_id` set to the Clerk user ID, `service_tier` matching the package category, and `intake_data` containing the full Package_Config JSON, (b) redirect to `/dashboard/projects/:id` where `:id` is the newly created project ID
4. THE Builder_UI SHALL also provide a "Download Config" option that allows the user to download the current Package_Config as a JSON file for reference or later use, available regardless of auth state
5. WHEN the user completes the handoff (navigates away), THE Builder_UI SHALL NOT clear the localStorage `webuilder_preview_session` entry, allowing the user to return to `/builder` and resume editing if they navigate back
6. THE CTA button SHALL be styled consistently with the existing persistent CTA pattern used in PackageDetailPage (sticky bottom bar with accent color)
7. THE Builder_UI SHALL provide a secondary link "Prefer to talk first? Contact us" that navigates to `/contact?package=Name&theme=Label` matching the existing ContactPage pre-fill pattern, available regardless of auth state
8. WHEN an unauthenticated user completes sign-up and is redirected to `/dashboard`, THE dashboard SHALL check for `webuilder_pending_config` in localStorage, create a project from it (same schema as criterion 3), and clear the localStorage key

### Requirement 9: Responsive Layout

**User Story:** As a potential client, I want to use the builder on my phone or tablet, so that I can build my preview website from any device.

#### Acceptance Criteria

1. WHEN the viewport width is 768px or greater (desktop), THE Builder_UI SHALL display the Content_Editor and Live_Preview in a side-by-side split-panel layout with a draggable divider allowing the user to adjust the panel width ratio
2. WHEN the viewport width is less than 768px (mobile), THE Builder_UI SHALL display the Content_Editor and Live_Preview as separate full-width views with a toggle control to switch between them
3. THE Template_Selector SHALL render its category cards and template options in a responsive grid: 2 columns on mobile (less than 768px), 3 columns on tablet (768px to 1024px), and 4 columns on desktop (greater than 1024px)
4. THE Content_Editor form fields SHALL be fully usable on touch devices with minimum touch target sizes of 44x44 pixels for interactive elements
5. THE Theme_Picker color swatches and selection controls SHALL be accessible on mobile with touch-friendly sizing and spacing
6. THE "Get This Website" / "Save & Go to Dashboard" button SHALL remain visible and accessible on all viewport sizes without being obscured by the editor or preview panels

### Requirement 10: Accessibility Compliance

**User Story:** As a potential client with accessibility needs, I want the builder interface to be usable with assistive technologies, so that I can build my preview website regardless of ability.

#### Acceptance Criteria

1. THE Builder_UI SHALL provide semantic HTML structure with appropriate ARIA landmarks: navigation for the step indicator, main for the primary content area, and complementary for the Live_Preview panel
2. ALL interactive elements in the Builder_UI (buttons, inputs, selects, toggles, color pickers) SHALL have accessible labels via `aria-label`, `aria-labelledby`, or associated `<label>` elements
3. THE Builder_UI SHALL support full keyboard navigation: Tab to move between interactive elements, Enter/Space to activate buttons and toggles, Escape to close expanded panels or modals, and arrow keys to navigate within the Template_Selector grid and Theme_Picker options
4. WHEN content validation errors occur, THE Content_Editor SHALL associate error messages with their corresponding input fields using `aria-describedby` and announce errors to screen readers using `aria-live="polite"` regions
5. THE Live_Preview panel SHALL include an `aria-label` of "Website preview" and a role of "region" so that screen reader users can identify and skip the preview content
6. THE Theme_Picker color customization inputs SHALL provide text labels showing the current hex value alongside the visual color swatch, ensuring color information is not conveyed by color alone

### Requirement 11: Existing Architecture Preservation

**User Story:** As a developer, I want the builder feature to integrate cleanly into the existing codebase, so that it does not break any current functionality or deployment pipeline.

#### Acceptance Criteria

1. THE Builder_UI SHALL integrate into the existing App.jsx routing structure by adding a new `/builder` route entry alongside existing public routes, without modifying any existing route definitions or their component assignments
2. THE Builder_UI SHALL reuse the existing SectionRenderer, Section_Registry, Theme_Engine (applyTheme, loadFonts), Content_Layer (resolveContent, getEditableFields), and Upload_Service without forking or duplicating these modules
3. THE Builder_UI SHALL reuse the existing package data from `src/data/packages.js` (12 packages) and theme data from `src/data/themes.js` (36 themes, 3 per package) as the source for templates and themes, without duplicating or restructuring this data
4. WHEN the Builder_UI is added to the codebase, THE existing Vitest test suite SHALL continue to pass without modification to any existing test files in `src/__tests__/`
5. THE Builder_UI SHALL be compatible with the existing Vite 7 build configuration, Tailwind CSS 4 integration, and Netlify deployment pipeline (netlify.toml) without requiring changes to build tooling or deployment configuration
6. THE Builder_UI SHALL use Framer Motion for any animations, consistent with the animation library used throughout the existing application
7. THE Builder_UI SHALL use CSS Modules for component-level styling, consistent with the 3-layer CSS architecture (tokens.css → styles.css → *.module.css)

### Requirement 12: Performance and Bundle Impact

**User Story:** As a developer, I want the builder feature to have minimal impact on the existing application's load time, so that users who do not visit the builder route are not penalized.

#### Acceptance Criteria

1. THE Builder_UI page component and its builder-specific dependencies SHALL be code-split from the main application bundle using React.lazy dynamic imports, ensuring zero additional JavaScript is loaded for users who do not navigate to `/builder`
2. THE Builder_UI SHALL reuse existing shared dependencies (React, React Router, Framer Motion, Tailwind CSS, SectionRenderer, Theme_Engine) without bundling duplicate copies
3. WHEN the Builder_UI loads, THE initial render SHALL display the Template_Selector within 100ms of the JavaScript chunk being parsed, without blocking on loading all section components or theme data
4. THE Live_Preview SHALL lazy-load section components below the viewport fold using the same React.lazy strategy as the existing SectionRenderer (first section synchronous, subsequent sections lazy)
5. WHEN images are displayed in the Live_Preview, THE Section components SHALL apply `loading="lazy"` to below-fold images consistent with existing section component behavior

### Requirement 13: Authenticated Builder Persistence

**User Story:** As an authenticated user, I want my builder progress saved to the cloud, so that I can access my work from any device and have it ready in my dashboard.

#### Acceptance Criteria

1. IF the user is authenticated (Clerk `isSignedIn === true`), THE Builder_UI SHALL persist the current Package_Config to Supabase via `useSupabaseClient()` in addition to localStorage, using the `projects` table with `intake_data` containing the full Package_Config JSON and `status` set to "draft"
2. THE authenticated Supabase save SHALL use the `projects` table schema: `client_id` (text, Clerk user ID from `useAuth().userId`), `service_tier` (text, matching the package category), `intake_data` (jsonb, full Package_Config), `status` ("draft"), and `name` (the package name or "Custom Website" for blank templates)
3. THE Builder_UI SHALL auto-save to Supabase on a debounced interval of 1 second (same debounce as localStorage), using an upsert on the draft project row to avoid creating duplicate projects per session
4. WHEN an authenticated user navigates to `/builder`, THE Builder_UI SHALL check Supabase for their most recent project with `status: "draft"` and offer to resume it (same UX as the localStorage resume prompt), preferring the Supabase version if it is newer than the localStorage version
5. IF the Supabase save fails (network error, RLS denial, or server error), THE Builder_UI SHALL fall back to localStorage-only persistence and display a non-blocking toast: "Cloud save unavailable. Your progress is saved locally."
6. THE authenticated persistence SHALL NOT block or delay the UI — saves happen asynchronously in the background, and the user can continue editing without waiting for confirmation

### Requirement 14: Phase 2 Dashboard Integration

**User Story:** As a client with a project created via the builder, I want to manage and edit my website from the dashboard, so that I can make content changes after purchase.

#### Acceptance Criteria

1. WHEN a client's project is created via the builder handoff (Requirement 8), THE dashboard (`/dashboard/projects/:id`) SHALL display the project with a "Preview Site" button that renders the `intake_data` Package_Config using the existing SectionRenderer component in a full-page preview modal
2. THE dashboard SHALL provide a content editor (reusing the same ContentEditor component from the builder) for projects with `packageType: "semi-dynamic"`, allowing clients to edit content fields and see changes reflected in the preview
3. THE dashboard SHALL display project metadata: project name, service tier, status (draft, active, completed), creation date, and last modified date
4. THE dashboard SHALL provide a "Request Changes" action that creates a message thread (existing MessagesPage) pre-filled with the project context, for changes that require developer intervention (layout changes, new sections, etc.)
5. THIS requirement is Phase 2 scope — implementation is deferred, but the builder architecture (Package_Config in `projects.intake_data`, ContentEditor as a reusable component, SectionRenderer for preview) MUST support this integration without requiring architectural changes
6. THE ContentEditor component SHALL be designed as a standalone, reusable module (not coupled to the BuilderPage route) so that it can be imported by both the builder and the dashboard without duplication
