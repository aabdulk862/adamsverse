# Requirements Document

## Introduction

BuilderPage.jsx currently renders placeholder content instead of wiring up the fully-implemented builder components. This feature integrates the existing `useBuilderState` hook with all builder components (ContentEditor, LivePreview, ThemePicker, HandoffButton, BuilderLayout, TemplateSelector) so that the `/builder` route delivers a functional end-to-end website building experience. No new components or hooks need to be created — this is purely a wiring and orchestration task.

**Audit findings incorporated:** The original spec missed several functional gaps discovered by reviewing the actual component interfaces, hook state shape, and data flow requirements. These include: (1) two existing test files (`builder-auth-navbar.test.jsx`, `builder-error-boundary.test.jsx`) directly render BuilderPage and will break when new imports are added — they must be updated with mocks; (2) SignUpPage hardcodes `forceRedirectUrl="/dashboard"` and ignores the `?redirect=` query param that HandoffButton sets — this must be fixed for the unauthenticated handoff flow to work; (3) the uploadService uses a static (anon key) Supabase client and requires the `client-assets` bucket to exist with appropriate policies; (4) a "Back to Templates" navigation action is needed in the edit step; (5) the editor panel needs independent scrolling.

## Glossary

- **Builder_Page**: The route-level page component at `src/pages/BuilderPage.jsx` that orchestrates the builder flow
- **Builder_State_Hook**: The `useBuilderState` hook at `src/hooks/useBuilderState.js` that manages all builder state and persistence
- **Content_Editor**: The component at `src/components/builder/ContentEditor.jsx` that renders editable fields for each section
- **Live_Preview**: The component at `src/components/builder/LivePreview.jsx` that renders a real-time website preview
- **Theme_Picker**: The component at `src/components/builder/ThemePicker.jsx` that handles theme selection and color customization
- **Handoff_Button**: The component at `src/components/builder/HandoffButton.jsx` that provides the primary CTA for saving/handoff
- **Builder_Layout**: The component at `src/components/builder/BuilderLayout.jsx` that provides the split-panel layout with draggable divider
- **Template_Selector**: The component at `src/components/builder/TemplateSelector.jsx` that displays template selection cards
- **Session_Resume_Prompt**: A UI element shown when a saved session exists, offering the user a choice to resume or start fresh
- **Toast**: A non-blocking notification message displayed temporarily to inform the user of a status change
- **Saving_Indicator**: A visual indicator shown while data is being persisted to Supabase
- **CATEGORY_LAYOUT_MAP**: The mapping from business category strings to layout variant strings (Professional → "professional", Beauty & Wellness → "beauty", Home Services → "homeServices", Food & Hospitality → "foodHospitality")

## Requirements

### Requirement 1: Hook Integration

**User Story:** As a developer, I want BuilderPage to use the useBuilderState hook as its single source of truth, so that all builder state is centrally managed with persistence.

#### Acceptance Criteria

1. WHEN Builder_Page mounts, THE Builder_Page SHALL call `useBuilderState({ userId })` where userId comes from Clerk's `useAuth().userId` (null when unauthenticated), and use the returned `[state, actions]` tuple for all rendering decisions
2. THE Builder_Page SHALL remove the local `useState("select")` step management and rely solely on `state.step` from Builder_State_Hook
3. THE Builder_Page SHALL pass `actions.selectTemplate` to Template_Selector as the `onSelectTemplate` prop
4. THE Builder_Page SHALL pass `actions.selectBlankTemplate` to Template_Selector as the `onSelectBlank` prop
5. THE Builder_Page SHALL remove the unused `useUser()` call unless it is needed for displaying user info in the editor (the hook state provides `isAuthenticated` already)

### Requirement 2: Session Resume Flow

**User Story:** As a returning user, I want to be prompted to resume my previous builder session, so that I do not lose my progress.

#### Acceptance Criteria

1. WHEN `state.hasSavedSession` is true AND `state.step` is "select", THE Builder_Page SHALL display Session_Resume_Prompt instead of Template_Selector
2. THE Session_Resume_Prompt SHALL provide a "Resume" button that calls `actions.resumeSession`
3. THE Session_Resume_Prompt SHALL provide a "Start Fresh" button that calls `actions.startFresh`
4. WHEN the user selects "Resume", THE Builder_State_Hook SHALL restore state from localStorage or Supabase and set `step` to the saved step value (typically "edit"), causing Builder_Page to render the edit view
5. WHEN the user selects "Start Fresh", THE Builder_State_Hook SHALL clear saved data and reset to `step: "select"` with `hasSavedSession: false`, causing Builder_Page to show Template_Selector
6. THE Session_Resume_Prompt SHALL use Framer Motion transitions consistent with existing builder animations (opacity 0→1, y 12→0, duration 0.2s)
7. THE Session_Resume_Prompt SHALL display contextual information about the saved session (e.g., the package name from localStorage config if available) so the user knows what they'd be resuming

### Requirement 3: Edit Step Layout Integration

**User Story:** As a user editing my website, I want to see the editor and preview side by side in a responsive layout, so that I can make changes and see results simultaneously.

#### Acceptance Criteria

1. WHEN `state.step` equals "edit", THE Builder_Page SHALL render Builder_Layout as the primary layout container
2. THE Builder_Page SHALL pass a combined editor panel (Content_Editor + Theme_Picker) as the `editor` prop to Builder_Layout
3. THE Builder_Page SHALL pass Live_Preview as the `preview` prop to Builder_Layout
4. THE Builder_Page SHALL pass Handoff_Button as `children` to Builder_Layout so it renders in the CTA area below panels
5. THE editor panel content (Content_Editor + Theme_Picker) SHALL be wrapped in a scrollable container so that long content forms do not break the layout or overlap with the preview panel

### Requirement 4: Content Editor Prop Wiring

**User Story:** As a user, I want to edit my website content through the editor, so that my changes are persisted and reflected in the preview.

#### Acceptance Criteria

1. THE Builder_Page SHALL pass `state.config` to Content_Editor as the `config` prop
2. THE Builder_Page SHALL pass `actions.updateField` to Content_Editor as the `onFieldChange` prop
3. THE Builder_Page SHALL pass `false` to Content_Editor as the `readOnly` prop during normal editing
4. GIVEN that Content_Editor's internal `handleFieldChange` calls `onFieldChange(sectionKey, fieldPath, value)` with 3 arguments (after stripping fieldType and maxLength), AND `actions.updateField` accepts exactly `(sectionKey, fieldPath, value)`, THE prop wiring SHALL be a direct pass-through without an adapter function

### Requirement 5: Theme Picker Prop Wiring

**User Story:** As a user, I want to select and customize themes, so that my website matches my brand identity.

#### Acceptance Criteria

1. THE Builder_Page SHALL render Theme_Picker within the editor panel, positioned below or above Content_Editor (below is preferred so content editing is prioritized)
2. THE Builder_Page SHALL pass `state.packageSlug` to Theme_Picker as the `packageSlug` prop
3. THE Builder_Page SHALL pass `state.baseThemeIndex` to Theme_Picker as the `activeThemeIndex` prop
4. THE Builder_Page SHALL pass `state.customColors` to Theme_Picker as the `customColors` prop
5. THE Builder_Page SHALL pass `actions.selectTheme` to Theme_Picker as the `onSelectTheme` prop
6. THE Builder_Page SHALL pass `actions.customizeColor` to Theme_Picker as the `onCustomizeColor` prop
7. THE Builder_Page SHALL pass `actions.resetTheme` to Theme_Picker as the `onReset` prop

### Requirement 6: Live Preview Prop Wiring

**User Story:** As a user, I want to see a real-time preview of my website that updates as I make edits and change themes.

#### Acceptance Criteria

1. THE Builder_Page SHALL pass `state.config` to Live_Preview as the `config` prop
2. THE Builder_Page SHALL pass `state.activeTheme` to Live_Preview as the `theme` prop
3. THE Builder_Page SHALL derive the `layout` prop from `state.category` using CATEGORY_LAYOUT_MAP (defined in LivePreview.jsx already — Builder_Page can pass `undefined` or the mapped value, since LivePreview falls back internally)
4. IF `state.category` is null (before template selection), Live_Preview SHALL receive `null` for config and render its empty-state placeholder gracefully

### Requirement 7: Handoff Button Prop Wiring

**User Story:** As a user who has finished building, I want a clear call-to-action to save my website or proceed to the next step.

#### Acceptance Criteria

1. THE Builder_Page SHALL pass `state.config` to Handoff_Button as the `config` prop
2. THE Builder_Page SHALL pass `state.config?.name || "Custom Website"` to Handoff_Button as the `packageName` prop
3. THE Builder_Page SHALL pass `state.activeTheme?.label || ""` to Handoff_Button as the `themeLabel` prop
4. THE Builder_Page SHALL pass `state.category || ""` to Handoff_Button as the `category` prop

### Requirement 8: Back to Templates Navigation

**User Story:** As a user in the edit step, I want to go back to template selection to pick a different starting point.

#### Acceptance Criteria

1. THE Builder_Page SHALL provide a "Back to Templates" or "Change Template" button visible during the edit step
2. WHEN the user clicks this button, THE Builder_Page SHALL call `actions.startFresh` to reset state and return to the "select" step
3. IF the user has unsaved edits (state.config is non-null), THE Builder_Page SHOULD display a confirmation prompt before discarding work (optional enhancement — not blocking for initial implementation)
4. THE "Back to Templates" button SHALL be positioned in the editor panel header area, not inside Content_Editor or ThemePicker components

### Requirement 9: Persistence Status Feedback

**User Story:** As a user, I want to know when my changes cannot be saved or are being saved to the cloud, so that I am aware of my data safety.

#### Acceptance Criteria

1. WHEN `state.storageAvailable` is false, THE Builder_Page SHALL display a Toast with the message "Auto-save unavailable. Your progress won't be saved if you close this tab."
2. WHEN `state.supabaseSaveError` is set (non-null string), THE Builder_Page SHALL display a Toast showing the error message (e.g., "Cloud save unavailable. Your progress is saved locally.")
3. WHILE `state.isSavingToSupabase` is true, THE Builder_Page SHALL display a subtle Saving_Indicator (e.g., a small "Saving..." text or animated dot) that does not obstruct the UI
4. THE Toast SHALL be non-blocking, positioned at the top or bottom of the viewport, and dismiss automatically after 5 seconds or on user interaction
5. THE Toast SHALL not disrupt the editing workflow or obscure the editor/preview panels
6. THE Toast and Saving_Indicator SHALL be implemented as simple inline elements using existing CSS Modules patterns (no new toast library dependency)

### Requirement 10: Animations and Transitions

**User Story:** As a user, I want smooth visual transitions between builder steps, so that the experience feels polished and responsive.

#### Acceptance Criteria

1. WHEN transitioning between the "select" step and "edit" step, THE Builder_Page SHALL animate the transition using Framer Motion (opacity from 0 to 1, y from 12 to 0, duration 0.2s)
2. WHEN the Session_Resume_Prompt appears, THE Builder_Page SHALL animate it with the same Framer Motion transition pattern
3. THE Builder_Page SHALL use `AnimatePresence` with `mode="wait"` to prevent overlapping content during step transitions
4. THE Builder_Page SHALL assign unique `key` props to each step's motion element so AnimatePresence correctly detects enter/exit

### Requirement 11: Backward Compatibility and Test Updates

**User Story:** As a developer, I want the integration to preserve all existing functionality, so that no regressions are introduced.

#### Acceptance Criteria

1. THE Builder_Page SHALL preserve the existing BuilderErrorBoundary wrapper around all content
2. THE Builder_Page SHALL preserve the `aria-label="Website Builder"` on the main element
3. THE Builder_Page SHALL not modify any existing component interfaces (props, behavior, or styling) in ContentEditor, LivePreview, ThemePicker, HandoffButton, BuilderLayout, or TemplateSelector
4. THE Builder_Page SHALL not introduce any new npm dependencies
5. THE Builder_Page SHALL continue to be lazy-loaded via the existing route configuration in App.jsx
6. THE Builder_Page CSS Module (`BuilderPage.module.css`) MAY be updated to remove placeholder styles and add styles for Session_Resume_Prompt, Toast, and Saving_Indicator
7. THE following test files MUST be updated to add mocks for the new imports (useBuilderState, useSupabaseClient, BuilderLayout, ContentEditor, LivePreview, ThemePicker, HandoffButton) since they directly render BuilderPage: `builder-auth-navbar.test.jsx` and `builder-error-boundary.test.jsx`
8. THE updated tests SHALL preserve the same behavioral assertions (auth-awareness, error boundary catch/fallback, reload button) while accommodating the new component structure
9. ALL other test files in `src/__tests__/` that do NOT directly import BuilderPage SHALL remain unmodified

### Requirement 12: Error Handling Edge Cases

**User Story:** As a user, I want the builder to handle edge cases gracefully so I never see a broken UI.

#### Acceptance Criteria

1. IF `state.config` is null when step is "edit" (race condition or corrupted restore), THE Builder_Page SHALL fall back to showing Template_Selector rather than rendering broken editor/preview panels
2. IF `state.packageSlug` is null or does not exist in themes.js, THE ThemePicker SHALL receive the slug and handle the empty themes array gracefully (it already renders empty — no crash)
3. IF `state.activeTheme` is null, THE Live_Preview SHALL render its placeholder state ("Select a template to see your website preview")
4. THE BuilderErrorBoundary SHALL catch any render errors from the wired components and display the existing friendly error UI with the "Reload Builder" button

### Requirement 13: Signup Redirect Flow Fix

**User Story:** As an unauthenticated user who clicks "Get This Website", I want to be redirected to my dashboard after signing up, so that my builder config is picked up automatically.

#### Acceptance Criteria

1. THE SignUpPage component SHALL read the `redirect` query parameter from the URL and use it as the post-signup redirect destination instead of hardcoding `/dashboard`
2. IF no `redirect` query parameter is present, THE SignUpPage SHALL default to redirecting to `/dashboard` (preserving current behavior for direct signup visits)
3. WHEN the user lands on `/dashboard` after signup, THE DashboardPage's existing `webuilder_pending_config` check SHALL find the config saved by HandoffButton and create the project (this flow already works — no changes needed in DashboardPage)
4. THE fix SHALL modify only `src/pages/SignUpPage.jsx` to replace `forceRedirectUrl="/dashboard"` with a dynamic value derived from `useSearchParams()` or equivalent

### Requirement 14: Upload Service Auth Handling

**User Story:** As a user (authenticated or not), I want image uploads to work correctly in the builder.

#### Acceptance Criteria

1. THE ImageUploadField component uses the static `supabase` client from `src/lib/supabase.js` (anon key, no auth) for uploads — this SHALL continue to work for both authenticated and unauthenticated users
2. IF the Supabase environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are not configured, THE `supabase` export is null and `uploadFile` will throw — THE ImageUploadField SHALL catch this and display "Upload failed due to network error" without crashing the page
3. THE Supabase Storage bucket `client-assets` MUST have a public read policy and an insert policy allowing anonymous uploads to the `builder-preview/` path prefix for the builder to function (this is an infrastructure prerequisite, not a code change)
