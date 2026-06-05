# Requirements Document

## Introduction

Phase 2 transforms the WeBuilder from a lead-gen preview tool into a client self-service editing platform. Authenticated clients can edit their website content, customize themes, and preview changes — all within the existing `/dashboard/projects/:id` route. The same `ContentEditor` and `LivePreview` components used by the builder are reused in the dashboard, with data sourced from Supabase instead of localStorage.

This phase also adds a responsive preview toggle (desktop/tablet/phone), section reordering via drag-and-drop, and a "Publish" action that marks the site as live. Subscription billing (Stripe) gates the publish capability.

**Audit findings incorporated:** (1) `ProjectDetailPage` currently shows project info, timeline, messages, files, and feedback — the editor needs to be a new tab, not a replacement of existing functionality; (2) `useProjects` hook fetches `intake_data` already — no new queries needed for loading; (3) Content Layer's `editField()` rejects edits on `packageType: "static"` packages — the editor must check this and show readOnly mode; (4) `sections` is currently an object (key-ordered) — reordering requires migration to an ordered array in `intake_data` only (not changing `src/data/packages.js` schema for static packages).

## Glossary

- **Client_Editor**: The editing interface within the dashboard that lets authenticated clients modify their website content and theme
- **Project_Config**: The `intake_data` JSONB field on the `projects` table containing the full Package_Config for a client's site
- **Publish_Action**: A user action that changes a project's status from "draft" to "published", making the site accessible on a public URL
- **Viewport_Toggle**: A toolbar control allowing the user to preview their site at desktop (1280px), tablet (768px), or phone (375px) widths
- **Section_Order**: An ordered array defining the sequence of rendered sections, stored in `intake_data.sectionOrder`
- **Subscription_Gate**: Logic that requires an active Stripe subscription before allowing publish
- **Auto_Save**: Debounced persistence of edits to Supabase (same pattern as builder's useBuilderState)

## Requirements

### Requirement 1: Editor Tab in Project Detail Page

**User Story:** As an authenticated client, I want to edit my website content from my project dashboard, so I can make changes without contacting support.

#### Acceptance Criteria

1. THE ProjectDetailPage SHALL add an "Edit Site" tab to the existing tab bar (after "Overview", before "Messages")
2. WHEN the "Edit Site" tab is active, THE page SHALL render ContentEditor + LivePreview in a layout matching the builder's sidebar + preview pattern
3. THE editor tab SHALL only appear for projects where `intake_data` is non-null (projects created via the builder)
4. THE editor tab SHALL load `project.intake_data` as the editable config
5. IF `project.intake_data.packageType` is "static", THE ContentEditor SHALL render in `readOnly` mode with the amber badge
6. THE editor tab SHALL NOT replace or interfere with existing tabs (Overview, Messages, Files, Feedback)

### Requirement 2: Auto-Save to Supabase

**User Story:** As a client editing my site, I want my changes saved automatically, so I don't lose progress.

#### Acceptance Criteria

1. WHEN a client makes an edit (field change, theme change, section reorder), THE system SHALL debounce-save the updated `intake_data` to Supabase after 1 second of inactivity
2. THE save SHALL use the authenticated `useSupabaseClient` with the Clerk JWT (RLS ensures clients can only update their own projects)
3. WHILE a save is in progress, THE UI SHALL show a subtle "Saving…" indicator
4. WHEN the save completes successfully, THE UI SHALL briefly show "Saved" then fade
5. IF the save fails, THE UI SHALL show an error toast: "Changes couldn't be saved. Retrying…" and retry once after 3 seconds
6. THE auto-save SHALL only update the `intake_data` column — never modify `status`, `name`, or other project fields

### Requirement 3: Theme Customization in Dashboard

**User Story:** As a client, I want to change my website's theme from my dashboard, so I can update my brand colors without rebuilding.

#### Acceptance Criteria

1. THE editor panel SHALL include a "Design" tab (reusing ThemePicker) below/alongside the "Content" tab
2. THE ThemePicker SHALL receive the project's `packageSlug` (derived from `intake_data.slug`) to show the correct 3 themes
3. WHEN the client selects a theme or customizes colors, THE changes SHALL be reflected in LivePreview immediately and auto-saved to `intake_data`
4. THE theme state (baseThemeIndex, customColors) SHALL be stored in `intake_data` as `_themeState: { baseThemeIndex, customColors }` (underscore prefix = internal metadata, not rendered content)

### Requirement 4: Viewport Preview Toggle

**User Story:** As a client, I want to see how my website looks on different devices, so I can ensure it works on mobile.

#### Acceptance Criteria

1. THE preview panel SHALL display a toolbar above the preview with three viewport options: Desktop (1280px), Tablet (768px), Phone (375px)
2. WHEN a viewport is selected, THE LivePreview container SHALL be constrained to that max-width with centered alignment
3. THE Desktop option SHALL be selected by default
4. THE viewport constraint SHALL only affect width — the preview remains scrollable vertically
5. THE viewport toggle SHALL be visible only on screens ≥ 1024px (on smaller screens, the preview already adapts via BuilderLayout's mobile toggle)

### Requirement 5: Section Reordering

**User Story:** As a client, I want to rearrange the sections of my website, so I can prioritize what visitors see first.

#### Acceptance Criteria

1. THE editor panel SHALL show a "Sections" tab (or section list within Content tab) displaying all sections as draggable items
2. EACH section item SHALL display the section label and a drag handle
3. THE client SHALL be able to drag sections to reorder them
4. WHEN sections are reordered, THE LivePreview SHALL re-render in the new order immediately
5. THE section order SHALL be stored in `intake_data.sectionOrder` as an array of section keys (e.g., `["hero", "cta", "services", "gallery"]`)
6. IF `sectionOrder` is absent, THE renderer SHALL fall back to the default key order from `sections` object
7. THE hero section SHALL always remain draggable (no pinning constraint) — clients have full control
8. THE reordering SHALL work via pointer events (mouse and touch) without requiring a third-party drag library (use native HTML drag API or a lightweight implementation)

### Requirement 6: Publish Flow

**User Story:** As a client with an active subscription, I want to publish my website so visitors can see it live.

#### Acceptance Criteria

1. THE editor view SHALL include a "Publish" button in the CTA area (similar to builder's HandoffButton position)
2. WHEN clicked, THE system SHALL check if the client has an active Stripe subscription
3. IF no active subscription exists, THE system SHALL show a modal directing the client to the billing page to subscribe
4. IF an active subscription exists, THE system SHALL update the project status to "published" and set `published_at` timestamp
5. AFTER publishing, THE system SHALL display a confirmation with the site's public URL
6. THE public URL format SHALL be `https://sites.adversesolutions.com/{slug}` (served by a separate static hosting pipeline — out of scope for this spec, but the URL is shown to the client)
7. IF the project is already published, THE button SHALL say "Update Site" and re-publish with latest changes

### Requirement 7: Subscription Billing Gate

**User Story:** As the platform owner, I want to require a monthly subscription before clients can publish, so the business has recurring revenue.

#### Acceptance Criteria

1. THE system SHALL check for an active subscription via a `subscription_status` field on the `profiles` table (set by the `stripe-webhook` edge function)
2. THE subscription tiers SHALL be: "starter" ($29/mo — 1 site), "pro" ($49/mo — 3 sites, priority support)
3. THE BillingPage SHALL display subscription management UI (current plan, upgrade/downgrade, cancel)
4. WHEN a subscription is created/cancelled/updated via Stripe webhook, THE `stripe-webhook` edge function SHALL update `profiles.subscription_status` and `profiles.subscription_tier`
5. THE dashboard SHALL show the client's current plan in the sidebar or settings

### Requirement 8: Editor Loading and Error States

**User Story:** As a client, I want clear feedback when my site is loading or something goes wrong.

#### Acceptance Criteria

1. WHILE `intake_data` is loading (project fetch in progress), THE editor tab SHALL show a skeleton/loading state
2. IF the project fetch fails, THE editor tab SHALL show an error message with a "Retry" button
3. IF `intake_data` is null (project created without builder), THE editor tab SHALL NOT appear in the tab bar
4. IF `intake_data` is corrupted (fails Package_Config validation), THE editor SHALL show a friendly error: "Your site configuration has an issue. Please contact support." with a "Download Config" fallback button

### Requirement 9: Backward Compatibility

**User Story:** As a developer, I want Phase 2 to not break any existing functionality.

#### Acceptance Criteria

1. THE existing ProjectDetailPage tabs (Overview, Messages, Files, Feedback) SHALL remain fully functional
2. THE existing builder at `/builder` SHALL continue to work independently — it is not affected by dashboard editor changes
3. ALL existing tests SHALL pass without modification
4. THE `projects` table schema change (adding `published_at`, updating `sectionOrder` in intake_data) SHALL be backward-compatible — projects without these fields continue to work
5. THE `packages.js` and `themes.js` static data files SHALL NOT be modified
6. THE ContentEditor and LivePreview component interfaces SHALL NOT change — dashboard passes the same props as BuilderPage
