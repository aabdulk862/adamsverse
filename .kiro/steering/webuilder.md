---
inclusion: fileMatch
fileMatchPattern: "**/packages/**,**/SectionRenderer*,**/contentLayer*,**/uploadService*,**/assetGallery*,**/PackageDetail*"
---

# Adverse WeBuilder — Deep Implementation Context

## What This Is

Adverse Solutions is a premium SMB website platform. The WeBuilder system renders websites from JSON configuration (Package_Config + Theme) rather than custom component code.

## Architecture

- **Package_Config** (JSON) → defines sections and content
- **Theme** (JSON) → defines colors, typography, shape tokens
- **Section Registry** (`src/registry/sectionRegistry.js`) → maps section types to React components
- **Section Renderer** (`src/components/packages/SectionRenderer.jsx`) → reads config, renders page
- **Content Layer** (`src/lib/contentLayer.js`) → content resolution + editing APIs
- **Upload Service** (`src/lib/uploadService.js`) → Supabase Storage file uploads
- **Asset Gallery** (`src/lib/assetGallery.js`) → gallery add/remove/reorder

## Available Section Types

hero, services, gallery, testimonials, cta, contact

## Layout Variants (derived from category)

- Professional → `professional`
- Beauty & Wellness → `beauty`
- Home Services → `homeServices`
- Food & Hospitality → `foodHospitality`

## Key Files

| Purpose | Path |
|---------|------|
| Package data | `src/data/packages.js` |
| Theme data | `src/data/themes.js` |
| Package schema | `src/schemas/packageSchema.js` |
| Theme schema | `src/schemas/themeSchema.js` |
| Section registry | `src/registry/sectionRegistry.js` |
| Section renderer | `src/components/packages/SectionRenderer.jsx` |
| Content layer | `src/lib/contentLayer.js` |
| Upload service | `src/lib/uploadService.js` |
| Package detail page | `src/pages/PackageDetailPage.jsx` |

## Conventions

- All section components accept `{ content, theme, layout, packageName }` props
- Content is destructured with `content || {}` for graceful empty handling
- Layout falls back to "professional" for unknown variants
- All styling uses CSS custom properties (`--color-*`, `--font-*`, `--shape-*`) — no hardcoded colors
- Property tests use `fast-check` with Vitest, named `property-*.test.js` in `src/__tests__/`
- Schemas use JSON Schema draft 2020-12 with `ajv` (allErrors: true)

## Business Model Context

- Phase 1: Preview-only builder (free, lead-gen tool, no database)
- Phase 2: Client editing dashboard (Supabase persistence, auth-gated, content-only edits)
- `packageType: "static"` → no client edits allowed
- `packageType: "semi-dynamic"` → client can edit content fields
- `packageType: "dynamic"` → content fetched on each navigation

## Tech Stack

- React 19 + Vite + React Router DOM
- Framer Motion (page transitions + section animations)
- Tailwind CSS
- Supabase (auth + storage)
- Stripe (payments)
- Netlify (deployment)
- Vitest + fast-check (testing)
- ajv (JSON Schema validation)
