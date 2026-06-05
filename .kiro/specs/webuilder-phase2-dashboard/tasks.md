# Implementation Plan: WeBuilder Phase 2 — Client Dashboard Editor

## Overview

Add a client-facing site editor inside `/dashboard/projects/:id` by reusing existing builder components (`ContentEditor`, `LivePreview`, `ThemePicker`, `BuilderLayout`) with a new `useDashboardEditor` hook for Supabase persistence. Includes viewport preview toggle, section reordering, publish flow gated by Stripe subscription, and database schema additions.

## Tasks

- [ ] 1. SectionRenderer sectionOrder support
  - [ ] 1.1 Add sectionOrder reading to SectionRenderer
    - In `src/components/packages/SectionRenderer.jsx`, replace `const sectionKeys = Object.keys(config.sections)` with:
    - `const sectionKeys = config.sectionOrder && Array.isArray(config.sectionOrder) ? config.sectionOrder.filter(key => config.sections[key]) : Object.keys(config.sections);`
    - When `sectionOrder` is absent (all existing packages), behavior is unchanged
    - When present, sections render in the specified order; invalid keys are filtered out
    - _Requirements: 5.4, 5.5, 5.6, 9.4_

  - [ ] 1.2 Add unit tests for sectionOrder
    - Create `src/__tests__/unit-section-order.test.js`
    - Test: renders sections in `sectionOrder` order when provided
    - Test: falls back to `Object.keys(config.sections)` when `sectionOrder` is absent
    - Test: filters out keys in `sectionOrder` that don't exist in `config.sections`
    - Test: existing configs without `sectionOrder` render identically to before
    - _Requirements: 5.6, 9.3, 9.4_

  - [ ] 1.3 Verify all existing tests pass
    - Run `npm run test` — zero failures
    - _Requirements: 9.3_

- [ ] 2. useDashboardEditor hook
  - [ ] 2.1 Create hook with state initialization
    - Create `src/hooks/useDashboardEditor.js`
    - Accept `{ projectId, intakeData }` params
    - Initialize `config` directly from `intakeData`
    - Initialize `sectionOrder` from `intakeData.sectionOrder || Object.keys(intakeData.sections)`
    - Initialize theme state from `intakeData._themeState` (baseThemeIndex, customColors) or defaults (0, null)
    - Resolve `activeTheme` from `themes[intakeData.slug][baseThemeIndex]` merged with customColors
    - Set `isReadOnly = (intakeData.packageType === 'static')`
    - Set `isPublished = false` (determined by caller via project.status)
    - Set `saveStatus = 'idle'`
    - _Requirements: 1.4, 1.5, 3.4_

  - [ ] 2.2 Implement edit actions
    - `updateField(sectionKey, fieldPath, value)` — deep-clone config, set value at path, update state
    - `selectTheme(index)` — resolve theme from `themes[config.slug][index]`, clear customColors, update activeTheme
    - `customizeColor(tokenKey, value)` — merge into customColors, re-resolve activeTheme
    - `resetTheme()` — clear customColors, re-resolve activeTheme from base
    - `reorderSections(newOrder)` — set sectionOrder to newOrder, update config.sectionOrder
    - _Requirements: 2.1, 3.3, 5.4_

  - [ ] 2.3 Implement auto-save to Supabase
    - Use `useSupabaseClient()` for authenticated writes
    - On any state change (config, sectionOrder, theme state): debounce 1000ms
    - Build persisted `intake_data` by merging config + `{ sectionOrder, _themeState: { baseThemeIndex, customColors } }`
    - Execute `supabase.from('projects').update({ intake_data }).eq('id', projectId)`
    - Set `saveStatus` to `'saving'` during write, `'saved'` on success (revert to `'idle'` after 2s)
    - On failure: set `saveStatus` to `'error'`, retry once after 3000ms
    - Never update `status`, `name`, or other project columns
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 2.4 Implement publish action
    - `publish()` — query `profiles.subscription_status` for current user
    - If not `'active'`, return `{ success: false, reason: 'no_subscription' }`
    - If active, update project: `status = 'published'`, `published_at = new Date().toISOString()`
    - Return `{ success: true, url: 'https://sites.adversesolutions.com/' + config.slug }`
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 7.1_

  - [ ] 2.5 Add unit tests for useDashboardEditor
    - Create `src/__tests__/unit-dashboard-editor-hook.test.js`
    - Test: initializes config, sectionOrder, and theme from intakeData
    - Test: updateField produces new config object (immutability)
    - Test: selectTheme resolves correct theme from themes data
    - Test: reorderSections updates sectionOrder array
    - Test: auto-save debounces and calls Supabase after 1s (fake timers)
    - Test: retry on save failure after 3s
    - Test: isReadOnly is true when packageType is 'static'
    - Test: publish returns no_subscription when profile status is inactive
    - _Requirements: 2.1, 2.5, 9.3_

  - [ ] 2.6 Verify all tests pass
    - Run `npm run test` — zero failures
    - _Requirements: 9.3_

- [ ] 3. ViewportToggle component
  - [ ] 3.1 Create ViewportToggle component and styles
    - Create `src/components/dashboard/ViewportToggle.jsx`
    - Accept `{ activeViewport, onChange }` props
    - Render 3 buttons: Desktop (`fa-desktop`, value `'desktop'`), Tablet (`fa-tablet-screen-button`, value `'tablet'`), Phone (`fa-mobile-screen-button`, value `'phone'`)
    - Active button gets `aria-pressed="true"` and active CSS class
    - Create `src/components/dashboard/ViewportToggle.module.css`
    - Horizontal toolbar with `gap: var(--space-2)`, icon buttons with `var(--radius-md)` border-radius
    - Active state: `background: var(--color-accent)`, `color: var(--color-text-inverse)`
    - Hide entire toolbar below 1024px: `@media (max-width: 1023px) { .toolbar { display: none; } }`
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ] 3.2 Verify build succeeds
    - Run `npm run build` — no errors
    - _Requirements: 9.3_

- [ ] 4. SectionOrderList component
  - [ ] 4.1 Create SectionOrderList component and styles
    - Create `src/components/dashboard/SectionOrderList.jsx`
    - Accept `{ sectionOrder, sections, onReorder }` props
    - Render ordered list: each item shows section label (from SECTION_META map: hero→"Hero", services→"Services", etc.) and a grip drag handle icon (`fa-grip-vertical`)
    - Implement native HTML Drag and Drop: `draggable="true"`, `onDragStart` stores dragged index, `onDragOver` with `preventDefault`, `onDrop` computes new order and calls `onReorder`
    - Add up/down arrow buttons (`fa-chevron-up`, `fa-chevron-down`) as keyboard/touch fallback
    - Disable up button on first item, down button on last item
    - Create `src/components/dashboard/SectionOrderList.module.css`
    - List items with `padding: var(--space-3)`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-md)`
    - Drag handle: `cursor: grab`, `color: var(--color-text-muted)`
    - Dragging state: `opacity: 0.5`, `border-color: var(--color-accent)`
    - Drop target highlight: `border-color: var(--color-accent)`, `background: var(--accent-bg-subtle)`
    - _Requirements: 5.1, 5.2, 5.3, 5.7, 5.8_

  - [ ] 4.2 Verify build succeeds
    - Run `npm run build` — no errors
    - _Requirements: 9.3_

- [ ] 5. PublishButton component
  - [ ] 5.1 Create PublishButton component and styles
    - Create `src/components/dashboard/PublishButton.jsx`
    - Accept `{ projectId, isPublished, slug, onPublish }` props
    - Render button: "Publish" if not published, "Update Site" if published
    - On click: call `onPublish()`, handle result:
      - `{ success: true, url }` → show confirmation overlay with URL and "Copy URL" button
      - `{ success: false, reason: 'no_subscription' }` → show modal with "Subscribe to publish" message and Link to `/dashboard/billing`
      - Error → show inline error message
    - Add loading state while publish is in progress
    - Create `src/components/dashboard/PublishButton.module.css`
    - Button styled like HandoffButton: `background: var(--color-accent)`, `color: var(--color-text-inverse)`, `border-radius: var(--btn-radius)`, `height: var(--btn-height-lg)`
    - Modal: backdrop with `background: rgba(0,0,0,0.5)`, centered card with `var(--radius-xl)`, `var(--shadow-xl)`
    - Confirmation: success green accent, URL in mono font
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ] 5.2 Add unit tests for PublishButton
    - Create `src/__tests__/unit-publish-gate.test.js`
    - Test: renders "Publish" when `isPublished` is false
    - Test: renders "Update Site" when `isPublished` is true
    - Test: shows subscription modal when onPublish returns `{ success: false, reason: 'no_subscription' }`
    - Test: shows confirmation with correct URL on success
    - _Requirements: 6.2, 6.3, 6.5, 6.6_

  - [ ] 5.3 Verify all tests pass
    - Run `npm run test` — zero failures
    - _Requirements: 9.3_

- [ ] 6. DashboardEditor component
  - [ ] 6.1 Create DashboardEditor component
    - Create `src/components/dashboard/DashboardEditor.jsx`
    - Accept `{ projectId, project }` props
    - Call `useDashboardEditor({ projectId, intakeData: project.intake_data })`
    - Validate `project.intake_data` against `validatePackageConfig` on mount
    - If invalid: render error UI with "Your site configuration has an issue. Please contact support." and a "Download Config" button (JSON blob download)
    - Render `BuilderLayout` with:
      - `editor` prop: sidebar with 3-tab bar (Content / Design / Sections) switching between `ContentEditor` (readOnly from state), `ThemePicker`, and `SectionOrderList`
      - `preview` prop: `ViewportToggle` + viewport-constrained `<div>` wrapping `LivePreview`
      - `children`: `PublishButton`
    - Render save status indicator above the layout: "Saving…" / "Saved ✓" / error toast
    - Manage `activeTab` (content/design/sections) and `activeViewport` (desktop/tablet/phone) as local state
    - Viewport wrapper applies `max-width: 1280px | 768px | 375px` and `margin: 0 auto`
    - _Requirements: 1.2, 1.5, 2.3, 2.4, 3.1, 3.2, 4.1, 4.2, 4.4, 8.4_

  - [ ] 6.2 Create DashboardEditor styles
    - Create `src/components/dashboard/DashboardEditor.module.css`
    - 3-tab bar: same pattern as BuilderPage's `.tabBar` / `.tab` / `.tabActive`
    - Save indicator: subtle text in header area, `color: var(--color-text-muted)`, fade animation
    - Viewport wrapper: `transition: max-width var(--duration-normal) var(--ease-default)`
    - Error state: centered card with `var(--color-error)` border, download button
    - Loading skeleton: pulsing placeholder blocks
    - _Requirements: 8.1, 8.4_

  - [ ] 6.3 Handle loading and error states
    - If `project` is null/loading: render skeleton (pulsing blocks matching sidebar + preview shape)
    - If project fetch error: render error message with "Retry" button
    - If `intake_data` fails validation: render corruption error UI
    - _Requirements: 8.1, 8.2, 8.4_

  - [ ] 6.4 Verify build succeeds
    - Run `npm run build` — no errors
    - _Requirements: 9.3_

- [ ] 7. ProjectDetailPage integration
  - [ ] 7.1 Add dynamic tabs and editor tab rendering
    - In `src/pages/ProjectDetailPage.jsx`:
    - Replace static `TABS` constant with `useMemo` computing tabs array
    - Include "Edit Site" tab (key: `"editor"`, label: `"Edit Site"`, icon: `"fa-solid fa-pen-to-square"`) only when `project?.intake_data?.sections` exists
    - Insert after "Overview", before "Messages"
    - Add lazy import: `const DashboardEditor = lazy(() => import('../components/dashboard/DashboardEditor'))`
    - When `activeTab === "editor"`: render `<Suspense fallback={<loading skeleton>}><DashboardEditor projectId={id} project={project} /></Suspense>`
    - Add `import { lazy, Suspense, useMemo }` to existing imports
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 8.3_

  - [ ] 7.2 Verify existing tabs are unaffected
    - Overview, Messages, Files, Feedback tabs render and behave identically
    - No changes to their content rendering blocks
    - _Requirements: 9.1, 9.6_

  - [ ] 7.3 Verify all tests pass and build succeeds
    - Run `npm run test && npm run build` — zero failures, clean build
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 8. Stripe subscription webhook updates
  - [ ] 8.1 Add subscription event handlers to stripe-webhook
    - In `supabase/functions/stripe-webhook/index.ts`:
    - Add case for `customer.subscription.created` and `customer.subscription.updated`:
      - Read `subscription.metadata.clerk_user_id` and `subscription.metadata.tier`
      - Map `subscription.status === 'active'` to `'active'`, else `'past_due'`
      - Update `profiles` row: set `subscription_status` and `subscription_tier`
    - Add case for `customer.subscription.deleted`:
      - Set `subscription_status = 'cancelled'`, `subscription_tier = null`
    - Add comment documenting required Stripe metadata keys: `clerk_user_id`, `tier`
    - _Requirements: 7.1, 7.4_

- [ ] 9. Database schema migration
  - [ ] 9.1 Create migration file
    - Create `supabase/migrations/add_phase2_columns.sql`
    - `ALTER TABLE projects ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NULL;`
    - `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';`
    - `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT NULL;`
    - All columns nullable/defaulted — existing rows unaffected
    - _Requirements: 6.4, 7.1, 9.4_

  - [ ] 9.2 Add RLS policy for subscription fields
    - Clients can `SELECT` their own profile row (existing policy)
    - Add policy: clients cannot `UPDATE` `subscription_status` or `subscription_tier` columns (only service role can write these via edge functions)
    - _Requirements: 7.1_

- [ ] 10. End-to-end verification
  - [ ] 10.1 Run full verification suite
    - Run `npm run lint` — zero errors
    - Run `npm run test` — all tests pass (existing + new)
    - Run `npm run build` — clean production build
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ] 10.2 Verify backward compatibility
    - Confirm `src/data/packages.js` and `src/data/themes.js` are unmodified (no git diff)
    - Confirm `/builder` route BuilderPage.jsx imports and state are unchanged
    - Confirm ContentEditor and LivePreview component interfaces have not changed
    - _Requirements: 9.2, 9.5, 9.6_

## Notes

- No new npm dependencies — uses native HTML Drag and Drop API, existing FontAwesome icons, existing Supabase/Stripe/Clerk integrations
- `useDashboardEditor` is intentionally simpler than `useBuilderState` — no localStorage, no step machine, no session resume
- Tasks 1–5 can be parallelized; Task 6 depends on 2–5; Task 7 depends on 6; Tasks 8–9 are independent infrastructure
- The `_themeState` underscore prefix convention separates editor metadata from rendered content in `intake_data`
