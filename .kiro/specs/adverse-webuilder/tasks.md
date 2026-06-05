# Implementation Plan: Adverse WeBuilder

## Overview

Transform the existing hardcoded package rendering system into a config-driven, theme-aware, section-based architecture. Implementation follows an incremental strategy: centralize theming → create schemas → build section registry → implement dynamic renderer → abstract content layer → add editing → add upload service. Each step builds on the previous, preserving all existing functionality.

## Tasks

- [x] 1. Extend Theme Engine with validation and optional token groups
  - [x] 1.1 Create theme JSON Schema and validation module
    - Create `src/schemas/themeSchema.js` with JSON Schema (draft 2020-12) defining required groups (colors: 10 keys, typography: 8 keys, shape: 5 keys) and optional groups (spacing: 4 keys, shadow: 4 keys, motion: 5 keys)
    - Export `validateTheme(theme)` function using `ajv` with `allErrors: true`
    - Export `getThemeSchema()` returning the raw schema object
    - Include `description` and `examples` on every property for AI-readiness
    - _Requirements: 1.1, 1.2, 9.3_

  - [x] 1.2 Extend `src/utils/applyTheme.js` with validation and optional groups
    - Add import of `validateTheme` from themeSchema
    - Add support for `--spacing-`, `--shadow-`, and `--motion-` prefixed CSS custom properties when those groups are present
    - Return `{ success: boolean, errors?: string[] }` from `applyTheme`
    - Reject invalid themes entirely, preserving previous CSS vars on the element
    - Batch all CSS property updates into a single DOM write (requestAnimationFrame)
    - Preserve backward compatibility: existing calls with only colors/typography/shape continue to work
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 8.3_

  - [x] 1.3 Write property tests for Theme Engine (Properties 1, 2, 3)
    - **Property 1: Theme application sets correct CSS custom properties**
    - **Property 2: Theme backward compatibility**
    - **Property 3: Invalid theme rejection preserves previous state**
    - Create `src/__tests__/property-webuilder-theme-engine.test.js`
    - Use fast-check generators for valid themes, partial themes, and invalid themes
    - Minimum 100 iterations per property
    - **Validates: Requirements 1.2, 1.3, 1.5, 1.6, 1.7**

- [x] 2. Create Package Configuration Schema
  - [x] 2.1 Create `src/schemas/packageSchema.js` with JSON Schema and validator
    - Define Package_Config schema: slug (1-128 chars, lowercase alphanumeric + hyphens), name (1-256 chars), category (1-128 chars), description (0-1024 chars), packageType (enum: static/semi-dynamic/dynamic, default: static), themeRef (string), sections (object, min 1 key), metadata (optional: phone, email, address, hours, max 512 chars each)
    - Include `description` and `examples` keywords on every property at all nesting levels
    - Compile with `ajv` (allErrors: true) and export `validatePackageConfig(config)` and `getValidationErrors()`
    - Ensure existing 12 packages pass validation without modification
    - _Requirements: 2.1, 2.4, 2.5, 2.6, 2.7, 7.1, 7.5, 9.1, 9.2_

  - [x] 2.2 Write property tests for Package Schema (Properties 4, 5, 17)
    - **Property 4: Package_Config JSON serialization round-trip**
    - **Property 5: Schema validation error reporting**
    - **Property 17: Schema self-documentation completeness**
    - Create `src/__tests__/property-webuilder-schema-validation.test.js`
    - Use fast-check generators for valid configs, invalid configs, and schema introspection
    - **Validates: Requirements 2.3, 2.5, 9.1, 9.2**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Build Section Registry and reusable section architecture
  - [x] 4.1 Create `src/registry/sectionRegistry.js` with section type manifest
    - Define registry entries for: hero, services, gallery, testimonials, cta, contact
    - Each entry includes: type identifier, dynamic import loader, content schema (JSON Schema with required/optional fields), and supported layout variants array
    - Export `resolveSection(type)` returning React.lazy component or null
    - Export `getManifest()` returning full registry for AI consumption
    - Provide JSDoc type definitions for IDE autocompletion
    - _Requirements: 4.1, 4.2, 8.4, 9.4, 10.3, 10.4_

  - [x] 4.2 Refactor existing section components to support new interface
    - Update `Hero.jsx`, `Services.jsx`, `Gallery.jsx`, `Testimonials.jsx`, `CTA.jsx` to accept `{ content, theme, layout, packageName }` props (already matching current interface)
    - Add graceful handling for empty/partial/undefined content props (omit missing fields, no "undefined" in DOM)
    - Add layout variant fallback to default when unknown layout string is passed
    - Ensure all sections consume theme tokens exclusively via CSS custom properties
    - _Requirements: 4.3, 4.5, 4.7, 5.6_

  - [x] 4.3 Create `src/components/packages/ContactSection.jsx` and CSS module
    - Implement ContactSection with content schema: heading (required), phone, email, address, hours (all optional)
    - Support at least 2 layout variants (professional, beauty)
    - Apply Framer Motion fade-and-translate entrance animation
    - Handle partial/empty content gracefully
    - _Requirements: 4.1, 4.4, 4.6_

  - [x] 4.4 Write property tests for section components (Properties 8, 9)
    - **Property 8: Section components handle partial content gracefully**
    - **Property 9: Layout variant fallback**
    - Create `src/__tests__/property-webuilder-section-components.test.jsx`
    - Test all 6 section types with empty, partial, and undefined content
    - Test unknown layout strings fall back to default
    - **Validates: Requirements 4.5, 4.7, 5.6**

- [x] 5. Implement Dynamic Section Renderer
  - [x] 5.1 Create `src/components/packages/SectionRenderer.jsx`
    - Accept `{ config, theme, layout, packageName }` props
    - Validate config against Package_Schema; show error UI if invalid
    - Validate themeRef exists in theme registry; show error if not found
    - Resolve sections from registry in configured order
    - Render first section (hero) synchronously without lazy-load or scroll animation
    - Wrap subsequent sections in React.lazy + Suspense + scroll animation
    - Insert SectionDivider between each pair of rendered sections
    - Skip unknown section types with console.warn, no adjacent divider
    - Apply lazy loading attributes: eager for hero images, lazy for below-fold
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.2, 8.1, 8.2, 8.5, 9.5, 9.6_

  - [x] 5.2 Integrate SectionRenderer into PackageDetailPage
    - Replace hardcoded section rendering in `PackageDetailPage.jsx` with SectionRenderer
    - Preserve theme toggle, sticky header, persistent CTA, and contact link logic
    - Maintain DOM-structural equivalence for all 12 existing packages
    - Preserve existing route resolution at `/packages/:slug`
    - _Requirements: 3.5, 11.1, 11.5, 11.8_

  - [x] 5.3 Write property tests for Section Renderer (Properties 6, 7, 15, 18)
    - **Property 6: Section rendering order matches configuration**
    - **Property 7: Unknown section types handled gracefully**
    - **Property 15: Compositional correctness**
    - **Property 18: Slug resolution preserves routing**
    - Create `src/__tests__/property-webuilder-section-renderer.test.jsx`
    - **Validates: Requirements 3.1, 3.2, 3.4, 9.5, 11.5**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Content Abstraction Layer
  - [x] 7.1 Create `src/lib/contentLayer.js` with content resolution and editing
    - Implement `resolveContent(config, sectionKey)` returning content object or error
    - Implement `editField(config, sectionKey, fieldPath, newValue)` with validation
    - Implement `getEditableFields(sectionType)` returning editable field metadata
    - Validate edits: strings ≤ 500 chars, URLs start with http://, https://, or /, arrays ≤ 50 items
    - Reject edits on non-editable fields (layout, section order, theme assignment)
    - Reject all edits on static packages with appropriate error
    - Preserve all non-targeted fields unchanged on successful edit
    - Persist accepted edits to Package_Config JSON (survives reload)
    - Handle persistence failures: retain previous value, return error
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 7.3, 7.4, 7.6_

  - [x] 7.2 Write property tests for Content Layer (Properties 10, 11, 12, 13, 14)
    - **Property 10: Content resolution by key**
    - **Property 11: Edit invariant — non-editable fields preserved**
    - **Property 12: Edit validation rejects invalid values and preserves state**
    - **Property 13: Edit persistence round-trip**
    - **Property 14: Static packages reject all edits**
    - Create `src/__tests__/property-webuilder-content-layer.test.js`
    - **Validates: Requirements 5.3, 5.4, 6.3, 6.4, 6.5, 6.6, 6.7, 7.6**

- [x] 8. Implement theme reference validation in renderer
  - [x] 8.1 Add theme registry lookup and invalid reference rejection
    - In SectionRenderer, validate that `config.themeRef` matches a registered theme name in the themes data
    - If theme reference is invalid, render error UI identifying the invalid theme name
    - Wire Content_Layer into SectionRenderer for content resolution
    - _Requirements: 9.5, 9.6_

  - [x] 8.2 Write property test for theme reference validation (Property 16)
    - **Property 16: Invalid theme reference rejection**
    - Create `src/__tests__/property-webuilder-composition.test.jsx`
    - **Validates: Requirements 9.6**

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement File Upload Service
  - [x] 10.1 Create `src/lib/uploadService.js` for Supabase Storage uploads
    - Implement file validation: max 5 MB size, allowed MIME types (image/jpeg, image/png, image/webp, image/svg+xml)
    - Upload to Supabase Storage under `client-assets/{slug}/` bucket path
    - Generate unique file names with UUID prefix to prevent overwrites
    - Return public URL on success
    - Return descriptive errors for: size exceeded, invalid MIME type, network failure, auth failure, quota exceeded
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.12, 12.14_

  - [x] 10.2 Integrate Upload Service with Content Layer
    - Support file upload as input method for URL-type editable fields
    - On successful upload, store returned URL as field value via edit persistence
    - Implement Asset_Gallery operations: add (upload + append), remove (delete from storage + remove from array), reorder (update array order)
    - Handle delete failures: preserve gallery state, return error
    - _Requirements: 12.7, 12.8, 12.9, 12.10, 12.11, 12.13_

  - [x] 10.3 Write unit tests for Upload Service
    - Test file size validation (reject > 5 MB)
    - Test MIME type validation (reject non-image types)
    - Test unique filename generation
    - Test error handling for network/auth/quota failures
    - Test Asset_Gallery add/remove/reorder operations
    - _Requirements: 12.2, 12.3, 12.4, 12.5, 12.12, 12.13_

- [x] 11. Preservation verification and final wiring
  - [x] 11.1 Verify existing architecture preservation
    - Confirm all existing routes in App.jsx are unchanged
    - Confirm Navbar, Footer, ThemeProvider, ErrorBoundary hierarchy preserved
    - Confirm Framer Motion AnimatePresence page transitions unchanged
    - Confirm React.lazy/Suspense lazy-loading strategy preserved
    - Confirm netlify.toml unchanged
    - Run `npm run build` with zero errors
    - Run `npm run test` with all existing tests passing
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.6, 11.7, 11.8_

  - [x] 11.2 Verify developer experience for new package creation
    - Confirm a new package can be created with only a Package_Config JSON (no new components needed)
    - Confirm a new theme can be created with only a theme object (no CSS modifications)
    - Confirm Section_Registry reports content schema conflicts via console warnings
    - _Requirements: 10.1, 10.2, 10.5_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (18 properties across 6 test files)
- Unit tests validate specific examples and edge cases
- The implementation language is JavaScript/JSX (matching the existing React/Vite project)
- All property tests use `fast-check` (v4.6.0) with Vitest, following the existing `property-*.test.js` naming convention in `src/__tests__/`
- The existing `applyTheme(element, theme)` signature is extended (not replaced) to maintain backward compatibility
- The existing `ajv` dependency (v8.20.0) is used for all JSON Schema validation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["1.3", "2.2"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3"] },
    { "id": 5, "tasks": ["4.4", "5.1"] },
    { "id": 6, "tasks": ["5.2"] },
    { "id": 7, "tasks": ["5.3"] },
    { "id": 8, "tasks": ["7.1"] },
    { "id": 9, "tasks": ["7.2", "8.1"] },
    { "id": 10, "tasks": ["8.2"] },
    { "id": 11, "tasks": ["10.1"] },
    { "id": 12, "tasks": ["10.2"] },
    { "id": 13, "tasks": ["10.3"] },
    { "id": 14, "tasks": ["11.1", "11.2"] }
  ]
}
```
