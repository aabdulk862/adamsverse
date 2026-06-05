# Implementation Plan: WeBuilder Integration

## Overview

Wire the existing `useBuilderState` hook into `BuilderPage.jsx` and connect all builder components so the `/builder` route delivers a functional end-to-end builder experience. No new components or hooks — purely orchestration, prop wiring, CSS updates, a SignUpPage redirect fix, and test mock updates.

## Tasks

- [x] 1. BuilderPage hook integration and step rendering
  - [x] 1.1 Replace local state with useBuilderState hook
    - Remove `useState("select")` and `useUser()` from BuilderPage
    - Import `useBuilderState` from `../hooks/useBuilderState`
    - Call `useBuilderState({ userId })` where `userId` comes from `useAuth().userId`
    - Use `state.step` and `state.hasSavedSession` for all rendering decisions
    - Add `AnimatePresence mode="wait"` wrapper around step blocks
    - Assign unique `key` props: `"resume"`, `"select"`, `"edit"`
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 10.1, 10.2, 10.3, 10.4_

  - [x] 1.2 Add session resume prompt
    - When `state.hasSavedSession && state.step === "select"`, render resume prompt instead of TemplateSelector
    - Add `getSavedSessionName()` helper that peeks at localStorage for `config.name`
    - Render "Welcome Back" heading with saved session name context
    - "Resume" button calls `actions.resumeSession`
    - "Start Fresh" button calls `actions.startFresh`
    - Animate with Framer Motion (opacity 0→1, y 12→0, duration 0.2s)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 1.3 Wire TemplateSelector props
    - Pass `actions.selectTemplate` as `onSelectTemplate`
    - Pass `actions.selectBlankTemplate` as `onSelectBlank`
    - Render when `state.step === "select" && !state.hasSavedSession`
    - Also render as fallback when `state.step === "edit" && !state.config` (edge case)
    - _Requirements: 1.3, 1.4, 12.1_

- [x] 2. Edit step layout and component wiring
  - [x] 2.1 Wire BuilderLayout with editor and preview panels
    - Import BuilderLayout, ContentEditor, LivePreview, ThemePicker, HandoffButton
    - Render BuilderLayout when `state.step === "edit" && state.config`
    - Pass editor panel (editorScroll wrapper containing ContentEditor + ThemePicker) as `editor` prop
    - Pass LivePreview as `preview` prop
    - Pass HandoffButton as `children`
    - Wrap editor content in `.editorScroll` div for independent scrolling
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 2.2 Wire ContentEditor props
    - Pass `state.config` as `config`
    - Pass `actions.updateField` directly as `onFieldChange` (no adapter)
    - Pass `false` as `readOnly`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 2.3 Wire ThemePicker props
    - Pass `state.packageSlug` as `packageSlug`
    - Pass `state.baseThemeIndex` as `activeThemeIndex`
    - Pass `state.customColors` as `customColors`
    - Pass `actions.selectTheme` as `onSelectTheme`
    - Pass `actions.customizeColor` as `onCustomizeColor`
    - Pass `actions.resetTheme` as `onReset`
    - Position below ContentEditor in the editor panel
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 2.4 Wire LivePreview props
    - Pass `state.config` as `config`
    - Pass `state.activeTheme` as `theme`
    - Pass `undefined` as `layout` (LivePreview derives internally from config.category)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 2.5 Wire HandoffButton props
    - Pass `state.config` as `config`
    - Pass `state.config?.name || "Custom Website"` as `packageName`
    - Pass `state.activeTheme?.label || ""` as `themeLabel`
    - Pass `state.category || ""` as `category`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 3. Back navigation and persistence feedback
  - [x] 3.1 Add "Back to Templates" button
    - Add button in `.editorHeader` div above ContentEditor
    - On click, call `actions.startFresh`
    - Position in editor panel header area, styled with `.backButton` class
    - _Requirements: 8.1, 8.2, 8.4_

  - [x] 3.2 Add toast and saving indicator
    - Add local `useState` for `toastMessage`
    - Add `useEffect` that sets toast when `state.storageAvailable === false`
    - Add `useEffect` that sets toast when `state.supabaseSaveError` changes to non-null
    - Auto-dismiss toast after 5 seconds via `setTimeout`
    - Render saving indicator when `state.isSavingToSupabase` is true
    - Toast: fixed at bottom-center, `role="status"`, `aria-live="polite"`
    - Saving indicator: fixed at top-right, subtle "Saving…" text
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 4. CSS module updates
  - [x] 4.1 Update BuilderPage.module.css
    - Remove placeholder styles: `.editorPreviewLayout`, `.editorPanel`, `.previewPanel`, `.placeholder`, `.placeholderButton`, `.authInfo`
    - Add `.resumePrompt`, `.resumePrompt h2`, `.resumePrompt p`, `.resumeActions`
    - Add `.editorScroll` with `overflow-y: auto` and `max-height: calc(100vh - 160px)`
    - Add `.editorHeader` with border-bottom separator
    - Add `.backButton` with hover state
    - Add `.toast` with fixed positioning, slideUp animation, z-index
    - Add `.savingIndicator` with fixed positioning at top-right
    - Add `@keyframes slideUp`
    - _Requirements: 3.5, 9.5, 9.6_

- [x] 5. SignUpPage redirect fix
  - [x] 5.1 Add dynamic redirect URL to SignUpPage
    - Import `useSearchParams` from `react-router-dom`
    - Read `redirect` query parameter: `searchParams.get("redirect") || "/dashboard"`
    - Replace hardcoded `forceRedirectUrl="/dashboard"` with the dynamic value
    - _Requirements: 13.1, 13.2, 13.4_

- [x] 6. Test file updates
  - [x] 6.1 Update builder-auth-navbar.test.jsx
    - Add `vi.mock` for `../hooks/useBuilderState` returning default state + mock actions
    - Add `vi.mock` for `../hooks/useSupabaseClient` returning null
    - Add `vi.mock` for BuilderLayout, ContentEditor, LivePreview, ThemePicker, HandoffButton
    - Remove the "shows user info in edit step" test (auth info no longer rendered inline)
    - Keep "renders for unauthenticated user" test (verify `aria-label="Website Builder"` and template-selector)
    - Keep "does not require authentication" test
    - For the auth-aware test using `vi.doMock`, override `useBuilderState` mock to return `isAuthenticated: true`
    - _Requirements: 11.7, 11.8, 11.9_

  - [x] 6.2 Update builder-error-boundary.test.jsx
    - Add same `vi.mock` calls for useBuilderState, useSupabaseClient, and builder components
    - Keep the `shouldThrow` mechanism on TemplateSelector mock (same pattern)
    - Preserve all three existing assertions: renders normally, shows error fallback, reload button works
    - _Requirements: 11.7, 11.8_

- [x] 7. Verification
  - [x] 7.1 Run full verification suite
    - Run `npm run lint` — zero errors
    - Run `npm run test` — all tests pass (including updated test files)
    - Run `npm run build` — successful production build
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

## Notes

- No new npm dependencies are introduced
- No existing component interfaces are modified
- BuilderErrorBoundary class stays inside BuilderPage.jsx (not extracted)
- The `useUser()` import is removed entirely — auth display is handled by HandoffButton and Clerk UI
- All action props are passed as direct references (no wrapper functions) for referential stability
- LivePreview derives its own layout from config.category internally — BuilderPage does not need CATEGORY_LAYOUT_MAP

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "4.1"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5"] },
    { "id": 3, "tasks": ["3.1", "3.2"] },
    { "id": 4, "tasks": ["5.1", "6.1", "6.2"] },
    { "id": 5, "tasks": ["7.1"] }
  ]
}
```
