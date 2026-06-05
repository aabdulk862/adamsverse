# Design Document: WeBuilder Phase 2 — Client Dashboard Editor

## Overview

Phase 2 adds a client-facing site editor inside the existing `/dashboard/projects/:id` route. Authenticated clients can edit content, customize themes, reorder sections, preview at multiple viewports, and publish — all without leaving their project dashboard. The system reuses the same `ContentEditor`, `LivePreview`, `ThemePicker`, and `BuilderLayout` components already powering `/builder`, with Supabase as the persistence layer instead of localStorage.

**Scope:**
- Add "Edit Site" tab to `ProjectDetailPage` (reuses existing builder components)
- Auto-save edits to Supabase `projects.intake_data` via debounced writes
- Viewport preview toggle (desktop/tablet/phone) in the preview toolbar
- Section reordering via native drag API stored in `intake_data.sectionOrder`
- Publish flow gated by Stripe subscription status
- New hook `useDashboardEditor` to manage editor state and persistence
- Subscription billing gate (profiles table field, stripe-webhook update)

**Not in scope:** Public site hosting pipeline for published sites, custom domain setup, SSR rendering of published sites.

## Architecture

```mermaid
graph TD
    subgraph "ProjectDetailPage"
        TABS[Tab Bar: Overview | Edit Site | Messages | Files | Feedback]
        EST[Editor State Tab]
    end

    subgraph "useDashboardEditor Hook"
        UDE[State: config, theme, sectionOrder, saveStatus]
        AS[Auto-Save Logic: debounce 1s → Supabase]
        RT[Retry Logic: 1 retry after 3s on failure]
    end

    subgraph "Reused Builder Components (unchanged interfaces)"
        BL[BuilderLayout]
        CE[ContentEditor]
        TP[ThemePicker]
        LP[LivePreview]
    end

    subgraph "New Components"
        VT[ViewportToggle]
        SO[SectionOrderList]
        PB[PublishButton]
    end

    subgraph "Persistence"
        SB[(Supabase projects.intake_data)]
        SP[(Supabase profiles.subscription_status)]
    end

    subgraph "Stripe"
        WH[stripe-webhook Edge Function]
    end

    TABS -->|activeTab=editor| EST
    EST --> UDE
    UDE --> BL
    BL -->|editor prop| CE
    BL -->|editor prop| TP
    BL -->|editor prop| SO
    BL -->|preview prop| LP
    BL -->|preview prop| VT
    BL -->|children| PB

    UDE --> AS
    AS --> SB
    PB --> SP
    WH --> SP
```

**Data Flow:**
1. `ProjectDetailPage` fetches project via existing `useProjects` hook (already includes `intake_data`)
2. When "Edit Site" tab activates, `useDashboardEditor` initializes from `project.intake_data`
3. Edits flow through the same `onFieldChange` / `onSelectTheme` / `onCustomizeColor` callbacks
4. `useDashboardEditor` debounce-writes updated `intake_data` to Supabase after 1s of inactivity
5. `SectionRenderer` reads `config.sectionOrder` (if present) to determine render order
6. Publish button checks `profiles.subscription_status` before updating project status

## Components and Interfaces

### useDashboardEditor Hook (New)

```javascript
// src/hooks/useDashboardEditor.js

/**
 * @param {Object} options
 * @param {string} options.projectId - Supabase project UUID
 * @param {object} options.intakeData - Initial intake_data from project fetch
 * @returns {[Object, Object]} [state, actions]
 *
 * State shape:
 * {
 *   config: object | null,        // Working Package_Config
 *   activeTheme: object | null,   // Resolved theme object
 *   baseThemeIndex: number,       // Index into themes[slug] array
 *   customColors: object | null,  // Color overrides
 *   sectionOrder: string[],       // Ordered section keys
 *   saveStatus: 'idle' | 'saving' | 'saved' | 'error',
 *   isReadOnly: boolean,          // true if packageType === 'static'
 *   isPublished: boolean,         // project.status === 'published'
 * }
 *
 * Actions:
 * {
 *   updateField(sectionKey, fieldPath, value),
 *   selectTheme(index),
 *   customizeColor(tokenKey, value),
 *   resetTheme(),
 *   reorderSections(newOrder: string[]),
 *   publish(),
 * }
 */
export function useDashboardEditor({ projectId, intakeData }) { }
```

**Key differences from `useBuilderState`:**
- No localStorage persistence — Supabase only
- No template selection step — config is always provided
- No session resume logic — project is the source of truth
- Adds `sectionOrder` management
- Adds `publish()` action
- Simpler: no `step` state machine, always in "edit" mode

**Persistence strategy:**
- Debounce: 1000ms after last edit
- Supabase query: `UPDATE projects SET intake_data = $1, updated_at = now() WHERE id = $2`
- Only updates `intake_data` column — never touches `status`, `name`, or other fields
- On failure: show error toast, retry once after 3000ms
- Uses `useSupabaseClient()` for RLS-authenticated writes

### ProjectDetailPage Modifications

```javascript
// Additions to src/pages/ProjectDetailPage.jsx

// 1. Conditionally add "Edit Site" tab
const tabs = useMemo(() => {
  const base = [
    { key: "overview", label: "Overview", icon: "fa-solid fa-circle-info" },
  ];
  // Insert editor tab if intake_data exists and has sections
  if (project?.intake_data?.sections) {
    base.push({ key: "editor", label: "Edit Site", icon: "fa-solid fa-pen-to-square" });
  }
  base.push(
    { key: "messages", label: "Messages", icon: "fa-solid fa-comments" },
    { key: "files", label: "Files", icon: "fa-solid fa-folder-open" },
    { key: "feedback", label: "Feedback", icon: "fa-solid fa-message" },
  );
  return base;
}, [project?.intake_data]);

// 2. Render editor tab content (lazy-loaded)
{activeTab === "editor" && (
  <DashboardEditor
    projectId={id}
    project={project}
  />
)}
```

The `TABS` constant becomes dynamic (computed from project data). Existing tabs remain in their current positions; "Edit Site" is inserted between "Overview" and "Messages".

### DashboardEditor Component (New)

```javascript
// src/components/dashboard/DashboardEditor.jsx
import { useDashboardEditor } from "../../hooks/useDashboardEditor";
import BuilderLayout from "../builder/BuilderLayout";
import ContentEditor from "../builder/ContentEditor";
import ThemePicker from "../builder/ThemePicker";
import LivePreview from "../builder/LivePreview";
import ViewportToggle from "./ViewportToggle";
import SectionOrderList from "./SectionOrderList";
import PublishButton from "./PublishButton";

/**
 * DashboardEditor — wraps builder components with dashboard-specific
 * state management and persistence. Rendered inside ProjectDetailPage
 * when the "Edit Site" tab is active.
 *
 * @param {Object} props
 * @param {string} props.projectId
 * @param {object} props.project - Full project object from useProjects
 */
export default function DashboardEditor({ projectId, project }) { }
```

**Internal layout:** Same sidebar + preview pattern as BuilderPage. The sidebar has 3 sub-tabs: Content, Design, Sections. The preview area includes the ViewportToggle toolbar above the LivePreview.

### ViewportToggle Component (New)

```javascript
// src/components/dashboard/ViewportToggle.jsx

/**
 * @param {Object} props
 * @param {'desktop' | 'tablet' | 'phone'} props.activeViewport
 * @param {(viewport: string) => void} props.onChange
 */
export default function ViewportToggle({ activeViewport, onChange }) { }
```

Renders 3 icon buttons (monitor, tablet, phone). Controls a CSS `max-width` constraint on the LivePreview wrapper:
- Desktop: `1280px` (no constraint on most screens)
- Tablet: `768px`
- Phone: `375px`

The container uses `margin: 0 auto` for centering when constrained. Only visible on screens ≥ 1024px (hidden via CSS media query on smaller viewports).

### SectionOrderList Component (New)

```javascript
// src/components/dashboard/SectionOrderList.jsx

/**
 * @param {Object} props
 * @param {string[]} props.sectionOrder - Current ordered keys
 * @param {object} props.sections - Config sections object (for labels)
 * @param {(newOrder: string[]) => void} props.onReorder
 */
export default function SectionOrderList({ sectionOrder, sections, onReorder }) { }
```

**Implementation approach:** Native HTML Drag and Drop API (no third-party library).
- Each section is a `<div draggable="true">` with a grip icon
- `onDragStart` / `onDragOver` / `onDrop` handlers reorder the array
- Touch support via `pointer-events` (HTML DnD has reasonable touch support in modern browsers; for fallback, up/down arrow buttons are also provided)
- Calls `onReorder(newOrder)` which triggers auto-save

### PublishButton Component (New)

```javascript
// src/components/dashboard/PublishButton.jsx

/**
 * @param {Object} props
 * @param {string} props.projectId
 * @param {boolean} props.isPublished - Whether the project is already published
 * @param {() => Promise<void>} props.onPublish
 */
export default function PublishButton({ projectId, isPublished, onPublish }) { }
```

**Flow:**
1. Click "Publish" (or "Update Site" if already published)
2. Check `profiles.subscription_status` via Supabase query
3. If no active subscription → show modal directing to `/dashboard/billing`
4. If active → call `onPublish()` which updates project status + `published_at`
5. Show confirmation with public URL: `https://sites.adversesolutions.com/{slug}`

### SectionRenderer Modification (Minimal)

```javascript
// In src/components/packages/SectionRenderer.jsx
// Change from:
const sectionKeys = Object.keys(config.sections);
// To:
const sectionKeys = config.sectionOrder && Array.isArray(config.sectionOrder)
  ? config.sectionOrder.filter(key => config.sections[key])
  : Object.keys(config.sections);
```

This is a 3-line change. When `config.sectionOrder` is absent (all existing packages, all static data), behavior is unchanged. When present (dashboard-edited projects), sections render in the specified order.

## Data Model Changes

### projects table (existing — no schema migration needed)

The `intake_data` JSONB column already stores arbitrary JSON. Phase 2 adds these keys inside the JSON:

```jsonc
{
  // Existing fields (unchanged)
  "slug": "custom-builder",
  "name": "Custom Website",
  "category": "Professional",
  "packageType": "semi-dynamic",
  "sections": { /* ... */ },

  // New fields (Phase 2)
  "sectionOrder": ["hero", "services", "gallery", "testimonials", "cta", "contact"],
  "_themeState": {
    "baseThemeIndex": 0,
    "customColors": { "accent": "#ff6600" }
  }
}
```

- `sectionOrder`: Optional array. When absent, `Object.keys(sections)` is used.
- `_themeState`: Internal metadata (underscore prefix convention). Stores theme selection state for the editor UI.

### projects table — new column

```sql
ALTER TABLE projects ADD COLUMN published_at TIMESTAMPTZ DEFAULT NULL;
```

Set when a project is published. `NULL` means draft. Used to show "last published" time in the UI.

### profiles table — new columns

```sql
ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN subscription_tier TEXT DEFAULT NULL;
```

Values for `subscription_status`: `'active'`, `'inactive'`, `'past_due'`, `'cancelled'`
Values for `subscription_tier`: `'starter'`, `'pro'`, `NULL`

Updated by the `stripe-webhook` edge function on `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` events.

## Stripe Webhook Updates

The existing `stripe-webhook` edge function handles `payment_intent.succeeded` and `payment_intent.payment_failed`. Phase 2 adds subscription event handling:

```javascript
// Inside supabase/functions/stripe-webhook/index.ts (additions)

case "customer.subscription.created":
case "customer.subscription.updated": {
  const subscription = event.data.object;
  const clerkUserId = subscription.metadata.clerk_user_id;
  const status = subscription.status === "active" ? "active" : "past_due";
  const tier = subscription.metadata.tier || "starter";

  await supabaseAdmin
    .from("profiles")
    .update({ subscription_status: status, subscription_tier: tier })
    .eq("id", clerkUserId);
  break;
}

case "customer.subscription.deleted": {
  const subscription = event.data.object;
  const clerkUserId = subscription.metadata.clerk_user_id;

  await supabaseAdmin
    .from("profiles")
    .update({ subscription_status: "cancelled", subscription_tier: null })
    .eq("id", clerkUserId);
  break;
}
```

## File Structure (New Files)

```
src/
├── hooks/
│   └── useDashboardEditor.js          # Editor state + auto-save hook
├── components/
│   └── dashboard/
│       ├── DashboardEditor.jsx         # Main editor wrapper
│       ├── DashboardEditor.module.css
│       ├── ViewportToggle.jsx          # Desktop/tablet/phone toggle
│       ├── ViewportToggle.module.css
│       ├── SectionOrderList.jsx        # Drag-to-reorder section list
│       ├── SectionOrderList.module.css
│       ├── PublishButton.jsx           # Publish/update CTA
│       └── PublishButton.module.css
```

## Modified Files

| File | Change |
|------|--------|
| `src/pages/ProjectDetailPage.jsx` | Dynamic tabs, lazy-load DashboardEditor when "Edit Site" active |
| `src/components/packages/SectionRenderer.jsx` | 3-line addition: read `config.sectionOrder` for render order |
| `supabase/functions/stripe-webhook/index.ts` | Add subscription event handlers |

## Component Hierarchy (Editor Tab Active)

```
ProjectDetailPage
└── DashboardEditor
    ├── SaveStatusIndicator (inline — "Saving…" / "Saved" / error toast)
    └── BuilderLayout
        ├── editor prop:
        │   ├── Tab Bar [Content | Design | Sections]
        │   ├── ContentEditor (activeTab=content)
        │   ├── ThemePicker (activeTab=design)
        │   └── SectionOrderList (activeTab=sections)
        ├── preview prop:
        │   ├── ViewportToggle
        │   └── LivePreview (wrapped in viewport-constrained container)
        └── children:
            └── PublishButton
```

## State Transitions

```
┌─────────────────────────────────────────────────────┐
│ useDashboardEditor                                   │
│                                                      │
│  init(intakeData) ─── config derived from intakeData │
│       │                themeState from _themeState    │
│       │                sectionOrder from sectionOrder │
│       ▼                                              │
│  ┌──────────┐  edit  ┌───────────┐  1s debounce     │
│  │  idle    │ ─────► │  dirty    │ ─────────────►   │
│  └──────────┘        └───────────┘                   │
│       ▲                                    │         │
│       │                                    ▼         │
│       │              ┌───────────┐  supabase write   │
│       │    success   │  saving   │ ─────────────►   │
│       ◄──────────────┤           │                   │
│       │              └───────────┘                   │
│       │                    │ failure                  │
│       │                    ▼                          │
│       │              ┌───────────┐  retry after 3s   │
│       ◄──────────────┤  error    │ ─────────────►   │
│       │    (retry ok) └───────────┘  (back to saving)│
└─────────────────────────────────────────────────────┘
```

## Validation Strategy

- `intake_data` is validated against `packageSchema` when loading into the editor. If validation fails → show error UI with "Download Config" fallback (Requirement 8.4).
- The `editField()` function from Content Layer is NOT used in the dashboard editor — it was designed for the Content Layer's localStorage persistence. Instead, `useDashboardEditor` does direct immutable state updates (same as `useBuilderState.updateField`) and persists to Supabase.
- Theme validation is handled by `applyTheme()` which already gracefully handles missing keys.

## Security

- All Supabase writes use `useSupabaseClient()` (Clerk JWT) — RLS ensures clients can only update their own projects
- The `published_at` and `status` update is a single RPC or direct write protected by `client_id = auth.uid()` RLS policy
- Subscription status is only writable by the service role (stripe-webhook edge function) — clients cannot spoof their subscription tier
- `PublishButton` does a read of `profiles.subscription_status` before allowing publish — this is a client-side check. The edge function for setting `published_at` should also verify subscription status server-side as defense-in-depth

## Backward Compatibility

1. `SectionRenderer` change is additive — existing configs without `sectionOrder` use `Object.keys()` as before
2. `ProjectDetailPage` tabs are dynamic — projects without `intake_data.sections` simply don't see the "Edit Site" tab
3. `_themeState` uses underscore prefix convention to separate internal metadata from rendered content
4. No changes to `packages.js`, `themes.js`, or any existing test files
5. `ContentEditor` and `LivePreview` interfaces are unchanged — same props as BuilderPage passes
6. The existing `/builder` route continues to work independently

## Testing Plan

New tests (added to `src/__tests__/`):

| Test File | Coverage |
|-----------|----------|
| `unit-dashboard-editor-hook.test.js` | `useDashboardEditor` — init from intakeData, updateField immutability, auto-save debounce, retry on failure |
| `unit-section-order.test.js` | `SectionRenderer` respects `sectionOrder`, falls back to `Object.keys` when absent |
| `unit-publish-gate.test.js` | PublishButton checks subscription status, shows modal when inactive |

Property tests are not needed for this phase — the existing WeBuilder property tests already cover content editing, theme application, and section rendering correctness. The dashboard editor reuses the same underlying logic.
