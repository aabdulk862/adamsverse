# Requirements Document

## Introduction

Adverse WeBuilder evolves the existing Adverse Solutions React package system into a scalable, AI-native SMB website platform. The system transforms the current hardcoded package rendering approach into a config-driven, theme-aware, section-based architecture that enables rapid package creation, centralized styling, structured content editing, and future AI-assisted generation — all while preserving the existing React routing, animation system, and Netlify deployment pipeline.

This is NOT a generic website builder or drag-and-drop page editor. It is a constrained, industry-aware, premium-by-default platform designed for operational scalability and intelligent website generation for small and medium businesses.

## Glossary

- **Package**: A complete website configuration for a specific business type (e.g., restaurant, salon, auto repair) consisting of structured content, section layout, and theme assignment
- **Package_Config**: A JSON object that fully describes a package's sections, content, theme reference, and metadata — replacing hardcoded component trees
- **Section**: A modular, reusable UI component (e.g., HeroSection, GallerySection) that renders structured content according to a layout variant and theme tokens
- **Section_Registry**: A centralized mapping of section type identifiers to their React component implementations, enabling dynamic rendering from configuration
- **Theme_Engine**: The centralized system that manages design tokens (colors, typography, spacing, shadows, motion presets, card styles, button variants) and applies them to scoped DOM elements
- **Design_Token**: A named value (color, font, spacing, radius, shadow, motion preset) stored in the Theme_Engine and consumed by sections via CSS custom properties
- **Content_Layer**: The abstraction that separates business content (text, images, metadata) from layout and styling concerns, stored as structured JSON data
- **Section_Renderer**: The dynamic component that reads a Package_Config and renders the appropriate Section components in sequence with correct props and theme context
- **Layout_Variant**: A named visual arrangement within a section type (e.g., "split", "centered", "overlay" for HeroSection) selectable via configuration
- **Editable_Field**: A structured content field exposed for lightweight client editing without affecting layout or design integrity
- **Package_Schema**: A JSON Schema definition that validates Package_Config objects, ensuring structural correctness for both manual and AI-generated configurations
- **Motion_Preset**: A named animation configuration (duration, easing, delay, trigger) stored as a design token and applied consistently across sections
- **Upload_Service**: The module responsible for uploading files to Supabase Storage, enforcing size and type constraints, and returning public URLs for stored assets
- **Asset_Gallery**: A managed collection of uploaded images associated with a package, supporting add, remove, and reorder operations within the Content_Layer

## Requirements

### Requirement 1: Centralized Theme Engine

**User Story:** As a developer, I want a centralized theme engine that manages all design tokens in one place, so that I can instantly swap visual identities across packages without modifying component code.

#### Acceptance Criteria

1. THE Theme_Engine SHALL store design tokens for colors (10 keys: bgBase, bgSurface, bgMuted, textPrimary, textSecondary, textMuted, accent, accentHover, accentText, border), typography (8 keys: fontDisplay, fontBody, weightLight, weightRegular, weightMedium, weightBold, trackingDisplay, trackingBody), and shape (5 keys: radiusSmall, radiusMedium, radiusLarge, buttonStyle, cardStyle) in a structured format compatible with the existing theme data schema
2. THE Theme_Engine SHALL extend the existing token set to include spacing tokens (sectionPadding, containerMaxWidth, gridGap, stackGap), shadow tokens (shadowSmall, shadowMedium, shadowLarge, shadowCard), and motion preset tokens (durationFast, durationNormal, durationSlow, easingDefault, easingBounce), where these extended token groups are optional in theme objects so that existing themes lacking them remain valid
3. WHEN a theme is applied to a scoped DOM element, THE Theme_Engine SHALL set all design tokens as CSS custom properties using the existing `--color-`, `--font-`, and `--shape-` prefix conventions plus new `--spacing-`, `--shadow-`, and `--motion-` prefixes, setting only the prefixes for token groups present in the theme object
4. WHEN a theme is swapped at runtime by calling `applyTheme()` with a new theme object on the same scoped element, THE Theme_Engine SHALL update all CSS custom properties on the scoped element within a single animation frame to prevent partial rendering of mixed old and new token values
5. THE Theme_Engine SHALL preserve backward compatibility with the existing `applyTheme(element, theme)` signature and `loadFonts(theme)` signature by extending rather than replacing their interfaces, ensuring that existing call sites passing theme objects with only colors, typography, and shape groups continue to function without modification
6. IF a theme object fails schema validation due to missing required token keys or invalid token values, THEN THE Theme_Engine SHALL reject the theme entirely without applying any tokens, preserve the previously applied theme state on the scoped element, and return an error indicating which specific token keys are missing or which values failed validation
7. WHEN a theme containing spacing tokens is applied to a scoped DOM element, THE Theme_Engine SHALL set `--spacing-{key}` custom properties; WHEN a theme containing shadow tokens is applied, THE Theme_Engine SHALL set `--shadow-{key}` custom properties; WHEN a theme containing motion tokens is applied, THE Theme_Engine SHALL set `--motion-{key}` custom properties

### Requirement 2: Package Configuration Schema

**User Story:** As a developer, I want packages defined as validated JSON configurations, so that new packages can be created without writing custom React component trees.

#### Acceptance Criteria

1. THE Package_Schema SHALL define the structure of a Package_Config including: slug (string, 1–128 characters, lowercase alphanumeric and hyphens only), name (string, 1–256 characters), category (string, 1–128 characters), description (string, 0–1024 characters), theme reference (string matching a registered theme identifier in the Theme_Engine), sections (object with named section keys, each key mapping to a section configuration containing section-type-specific content fields), and metadata (optional object containing business info fields: phone, email, address, hours, each as optional strings with a maximum length of 512 characters)
2. WHEN a Package_Config is loaded for rendering, THE Section_Renderer SHALL validate the configuration against the Package_Schema before rendering any section components
3. IF a Package_Config fails schema validation, THEN THE Section_Renderer SHALL display an error message identifying each invalid field path and its expected type, and SHALL NOT render any section components for that package
4. THE Package_Schema SHALL accept the existing package data shape (slug, name, category, description, sections object with hero/services/gallery/testimonials/cta keys and their current field structures) as a valid configuration without requiring modifications to existing package data
5. FOR ALL valid Package_Config objects, THE Package_Schema SHALL ensure that serializing to JSON via JSON.stringify and parsing back via JSON.parse produces a deeply equal Package_Config object (no non-serializable values such as functions, undefined, or circular references are permitted in the schema)
6. THE Package_Schema SHALL be defined using JSON Schema (draft 2020-12) and validated at runtime using the existing `ajv` dependency with the `allErrors` option enabled
7. THE Package_Schema SHALL require the sections object to contain at least 1 section key, and each section configuration SHALL include all fields defined as required by the corresponding section content schema in the Section_Registry

### Requirement 3: Dynamic Section Renderer

**User Story:** As a developer, I want a dynamic renderer that assembles pages from configuration, so that package layouts are driven by data rather than hardcoded component imports.

#### Acceptance Criteria

1. WHEN a Package_Config is provided, THE Section_Renderer SHALL render each section entry in the configured order by resolving the section type from the Section_Registry and passing the section's content object, the active theme object, and the layout variant (derived from the Package_Config's category via the existing CATEGORY_LAYOUT_MAP) to each resolved Section component as props
2. IF a section type in the Package_Config does not exist in the Section_Registry, THEN THE Section_Renderer SHALL skip the unknown section without rendering a SectionDivider adjacent to it, log a warning to the console identifying the unrecognized section type string, and continue rendering the remaining sections without crashing the page
3. THE Section_Renderer SHALL apply scroll-based entrance animations to each section using the existing `useScrollAnimation` hook pattern, except for the first section in the configured order which SHALL render immediately without scroll-triggered animation
4. THE Section_Renderer SHALL insert exactly one SectionDivider component between each pair of consecutively rendered sections, passing the layout variant to each SectionDivider, with no divider before the first section or after the last section
5. WHEN the Section_Renderer replaces the current PackageDetailPage rendering logic, THE Section_Renderer SHALL produce DOM-structurally equivalent output for all existing packages such that the same CSS classes, animation states, section ordering, divider placement, and prop values are applied as the current hardcoded implementation

### Requirement 4: Reusable Section System

**User Story:** As a developer, I want modular section components that support multiple layout variants, so that I can compose diverse page layouts from a shared component library.

#### Acceptance Criteria

1. THE Section_Registry SHALL include at minimum: HeroSection, ServicesSection, GallerySection, TestimonialsSection, CTASection, and ContactSection
2. EACH Section component SHALL accept a `layout` prop that selects from at least 2 visual arrangements per section type, where each arrangement produces a distinct DOM structure or CSS class combination verifiable by inspecting the rendered output
3. EACH Section component SHALL consume theme tokens exclusively through CSS custom properties (--color-*, --font-*, --shape-*) set by the Theme_Engine on an ancestor element, with zero hardcoded color values, font-family declarations, or border-radius values in component stylesheets
4. EACH Section component SHALL accept a structured content object as a prop, where the content object conforms to a defined per-section schema (e.g., HeroSection requires `{ headline, subheadline, ctaText, heroImage }`, ServicesSection requires `{ heading, items }` where items is an array of `{ title, description, icon }`)
5. WHEN a Section component receives an empty content object ({}), a partial content object (missing one or more schema fields), or an undefined content prop, THE Section component SHALL render without throwing a runtime error, omitting UI elements for missing fields rather than displaying "undefined" or empty DOM nodes with no visible content
6. EACH Section component SHALL wrap its content in a Framer Motion animated container that applies a fade-and-translate entrance animation (opacity 0→1, translateY offset→0) triggered on viewport intersection, consistent with the AnimatedSection pattern used in existing package section components
7. WHEN a Section component's `layout` prop receives a value not matching any defined variant identifier for that section type, THE Section component SHALL fall back to its default layout variant and render without throwing an error

### Requirement 5: Content Abstraction Layer

**User Story:** As a developer, I want business content separated from layout and styling, so that content can be updated independently without touching component code or theme configuration.

#### Acceptance Criteria

1. THE Content_Layer SHALL store all business content as structured data objects keyed separately from section layout configuration and theme assignment, such that modifying a content value (e.g., changing a headline string) requires no changes to component files or theme token definitions
2. THE Content_Layer SHALL define a content schema for each section type specifying required and optional fields with their expected types: HeroSection (headline: string required, subheadline: string optional, ctaText: string optional, heroImage: URL string optional), ServicesSection (heading: string required, items: array of {title: string required, description: string required, icon: string optional} with 1 to 20 items), GallerySection (heading: string required, images: array of {src: URL string required, alt: string required} with 1 to 30 images), TestimonialsSection (heading: string required, items: array of {quote: string required, author: string required, role: string optional, avatar: URL string optional} with 1 to 20 items), CTASection (heading: string required, body: string optional, buttonText: string required)
3. WHEN a Package_Config references content, THE Content_Layer SHALL resolve content objects by key lookup within the package data structure or by inline definition within the package configuration
4. IF a content reference cannot be resolved to a valid content object, THEN THE Content_Layer SHALL return a resolution error indicating the missing content key and the package identifier, and the corresponding section SHALL not render
5. THE Content_Layer SHALL support the existing package content structure (hero, services, gallery, testimonials, cta sections with their current field shapes) without requiring migration of existing data
6. IF a content field contains an empty string or null value, THEN THE Section component SHALL omit that element from the rendered output rather than displaying empty markup

### Requirement 6: Lightweight Editing Architecture

**User Story:** As a business owner, I want to edit my website content through structured fields, so that I can update text and images without breaking the design or layout.

#### Acceptance Criteria

1. THE Content_Layer SHALL mark specific fields as Editable_Fields by annotating them in the content schema with an `editable: true` flag, limited to fields of type string, URL, or array of objects as defined in the section content schemas from Requirement 5
2. WHEN a field is marked as editable, THE Content_Layer SHALL expose that field for modification through a structured data interface that accepts the field identifier, section identifier, and new value as inputs and returns a success or failure result
3. THE Content_Layer SHALL restrict editable operations to content fields only — layout variants, section order, theme assignment, and component configuration SHALL remain non-editable by business users
4. WHEN an Editable_Field is modified, THE Content_Layer SHALL validate the new value against the field's type constraint before accepting the change: string fields SHALL NOT exceed 500 characters, URL fields SHALL conform to valid URL format (beginning with http://, https://, or /), and array fields SHALL NOT exceed 50 items
5. IF an Editable_Field modification fails validation, THEN THE Content_Layer SHALL reject the change, preserve the previous field value, and return an error indicating which constraint was violated and the expected format
6. THE Content_Layer SHALL preserve all non-editable fields unchanged when editable fields are modified (invariant property)
7. WHEN an Editable_Field modification is accepted, THE Content_Layer SHALL persist the updated content to the Package_Config JSON so that the change survives page reload
8. IF the Content_Layer fails to persist an accepted edit, THEN THE Content_Layer SHALL retain the previous field value in memory and return an error indicating the save failure

### Requirement 7: Package Type Classification

**User Story:** As a platform operator, I want packages classified by update frequency, so that the system can optimize rendering and caching strategies per package type.

#### Acceptance Criteria

1. THE Package_Schema SHALL include a `packageType` field with exactly three valid values: "static", "semi-dynamic", and "dynamic"
2. WHEN a package is classified as "static", THE Section_Renderer SHALL render all sections once from the Package_Config content without registering content change listeners or initiating content fetch requests after initial render
3. WHEN a package is classified as "semi-dynamic", THE Section_Renderer SHALL re-render only the section whose content was modified through the editing architecture (Requirement 6) while preserving the rendered output of all unmodified sections without re-mounting them
4. WHEN a package is classified as "dynamic", THE Section_Renderer SHALL fetch content from the Content_Layer on each page navigation to the package route and re-render sections with the retrieved content, supporting data that changes between page visits (e.g., menus, availability, pricing)
5. IF the `packageType` field is omitted from a Package_Config, THEN THE Package_Schema SHALL default the value to "static" during validation
6. IF a package is classified as "static" and a content modification is attempted through the editing architecture, THEN THE Section_Renderer SHALL reject the modification and return an error indicating that static packages do not support content editing

### Requirement 8: Performance Preservation

**User Story:** As a user, I want the platform to remain extremely fast and responsive, so that the new architecture does not degrade the existing premium browsing experience.

#### Acceptance Criteria

1. THE Section_Renderer SHALL lazy-load section components that are below the viewport fold using React.lazy and Suspense boundaries
2. THE Section_Renderer SHALL render the first visible section (HeroSection) synchronously without lazy-loading to ensure immediate above-the-fold content display
3. WHEN a theme is applied, THE Theme_Engine SHALL batch all CSS custom property updates into a single DOM write operation to minimize layout thrashing
4. THE Section_Registry SHALL use dynamic imports for section components so that unused section types are not included in the initial JavaScript bundle
5. WHEN images are referenced in content, THE Section components SHALL apply lazy loading (loading="lazy") to images below the fold and eager loading to above-the-fold hero images
6. THE platform SHALL maintain the existing SPA page transition behavior using Framer Motion AnimatePresence as defined in the current App.jsx routing structure

### Requirement 9: AI-Ready Schema Infrastructure

**User Story:** As a platform architect, I want all configurations to be schema-driven and composable, so that AI systems can generate valid package configurations without human intervention.

#### Acceptance Criteria

1. THE Package_Schema SHALL include a `description` field on every property at all nesting levels and an `enum` or `format` constraint on every property that accepts a restricted set of values, enabling AI systems to determine the purpose and valid inputs for each configuration field without external documentation
2. THE Package_Schema SHALL include an `examples` keyword with at least one valid example value for every required field, conforming to the field's type and constraints as defined in the schema
3. THE Theme_Engine SHALL expose a theme schema defined in JSON Schema format that specifies all required token keys (colors: 10 keys, typography: 8 keys, shape: 5 keys as defined in Requirement 1), their value formats (e.g., CSS color strings for color tokens, font-family strings for typography tokens, CSS length strings for shape tokens), and valid value patterns so that any object passing schema validation is a renderable theme
4. THE Section_Registry SHALL expose a manifest as a programmatically importable JavaScript object that lists all registered section types, each entry containing the section type identifier, its content schema (with required and optional fields and their types), and an array of supported layout variant names
5. FOR ALL Package_Config objects generated by composing valid section configs (passing their content schema validation) with valid theme references (referencing an existing theme name), THE Section_Renderer SHALL render the package without throwing exceptions, without producing empty output, and with all referenced sections visible in the DOM (compositional correctness property)
6. IF an AI-generated Package_Config passes Package_Schema validation but references a theme name that does not exist in the theme registry, THEN THE Section_Renderer SHALL reject the configuration with an error message identifying the invalid theme reference

### Requirement 10: Developer Experience

**User Story:** As a developer, I want to create new packages, themes, and sections with minimal custom code, so that the platform can scale rapidly to support new industries.

#### Acceptance Criteria

1. WHEN a developer creates a new package using only section types already registered in the Section_Registry (HeroSection, ServicesSection, GallerySection, TestimonialsSection, CTASection, ContactSection), THE developer SHALL only need to author a Package_Config JSON file and optionally a content JSON file — no new React components required
2. WHEN a developer creates a new theme, THE developer SHALL only need to define a theme object conforming to the Theme_Engine schema — no CSS file modifications required
3. WHEN a developer creates a new section type, THE developer SHALL register the component in the Section_Registry by providing the React component reference, a content schema defining required and optional fields with their types, and the list of supported layout variant identifiers
4. THE Section_Registry SHALL provide TypeScript-compatible type definitions (via JSDoc or .d.ts files) for section props, content schemas, and theme token interfaces such that IDE autocompletion resolves all defined fields without errors
5. IF a developer registers a section with a content schema that conflicts with the Package_Schema structure (duplicate field names with incompatible types, or missing fields marked as required by the Package_Schema), THEN THE Section_Registry SHALL report the conflict through console warnings at module load time before any rendering occurs

### Requirement 11: Existing Architecture Preservation

**User Story:** As a developer, I want the new system to integrate into the existing codebase without breaking current functionality, so that the evolution is incremental and safe.

#### Acceptance Criteria

1. THE platform SHALL preserve the existing React Router DOM routing structure including all current routes (/, /packages, /packages/:slug, /about, /services, /contact, /learn, /login, /dashboard/*, /admin/*, /agents/*, and the catch-all 404 route)
2. THE platform SHALL preserve the existing Navbar, Footer, ThemeProvider (light/dark toggle), and ErrorBoundary component hierarchy as defined in App.jsx, including the conditional hiding of Navbar and Footer on /agents/* routes
3. THE platform SHALL preserve the existing Framer Motion page transition configuration (AnimatePresence mode="wait" with initial opacity 0 / y 12, animate opacity 1 / y 0, exit opacity 0 / y -12, duration 0.25s)
4. THE platform SHALL preserve the existing Netlify deployment configuration (netlify.toml build command, publish directory, security headers, static asset caching, and all redirect rules including the catch-all SPA redirect from /* to /index.html with status 200)
5. WHEN the new Section_Renderer is active, THE existing PackageDetailPage route (/packages/:slug) SHALL continue to resolve the package by slug from the data source and render the package detail view at the same URL without requiring changes to inbound links
6. THE platform SHALL preserve the existing Vite build configuration, Tailwind CSS integration, and testing infrastructure (Vitest with fast-check) such that the command "npm run build" completes with zero errors and "npm run test" passes all existing test suites
7. WHEN any code change is introduced as part of the new system integration, THE platform SHALL ensure that all existing Vitest test files in src/__tests__/ pass without modification to the test files themselves
8. THE platform SHALL preserve the existing lazy-loading strategy (React.lazy with Suspense fallback) for PackageDetailPage, authenticated pages, agent pages, and admin pages


### Requirement 12: File and Image Upload to Supabase Storage

**User Story:** As a business owner, I want to upload images and files for my website through the editing interface, so that I can manage my own visual assets without developer assistance.

#### Acceptance Criteria

1. THE Upload_Service SHALL upload files to Supabase Storage using the existing `@supabase/supabase-js` dependency, storing each file under the bucket path `client-assets/{slug}/` where `{slug}` is the package slug from the Package_Config
2. WHEN a file is selected for upload, THE Upload_Service SHALL validate the file size does not exceed 5 MB before initiating the upload to Supabase Storage
3. WHEN a file is selected for upload, THE Upload_Service SHALL validate the file MIME type is one of: `image/jpeg`, `image/png`, `image/webp`, or `image/svg+xml` before initiating the upload to Supabase Storage
4. IF a file exceeds the 5 MB size limit, THEN THE Upload_Service SHALL reject the upload without sending any data to Supabase Storage and return an error indicating the file size, the maximum allowed size, and the file name
5. IF a file has a MIME type not in the allowed set, THEN THE Upload_Service SHALL reject the upload without sending any data to Supabase Storage and return an error indicating the rejected MIME type, the allowed types, and the file name
6. WHEN a file is successfully uploaded to Supabase Storage, THE Upload_Service SHALL retrieve the public URL for the stored file and return the URL string to the caller
7. WHEN a successful upload produces a public URL, THE Content_Layer SHALL store the returned URL as the field value for the Editable_Field that initiated the upload, following the same edit persistence mechanism defined in Requirement 6 acceptance criteria 7
8. WHEN an Editable_Field of type URL is modified through the editing architecture (Requirement 6), THE Content_Layer SHALL support file upload as an input method in addition to direct URL text entry, delegating to the Upload_Service when a file is provided instead of a URL string
9. THE Asset_Gallery SHALL support adding images by uploading files through the Upload_Service, where each successfully uploaded image is appended to the gallery array in the Content_Layer
10. THE Asset_Gallery SHALL support removing images by identifier, where removal deletes the file from Supabase Storage at the corresponding bucket path and removes the image entry from the gallery array in the Content_Layer
11. THE Asset_Gallery SHALL support reordering images by accepting a new ordered array of image identifiers, where the Content_Layer updates the gallery array to match the specified order without modifying the files in Supabase Storage
12. IF the Supabase Storage upload request fails due to network error, authentication failure, or storage quota exceeded, THEN THE Upload_Service SHALL return an error indicating the failure reason without modifying the Content_Layer field value, preserving the previous value
13. IF the Supabase Storage delete request fails during gallery image removal, THEN THE Upload_Service SHALL return an error indicating the failure reason without removing the image entry from the Content_Layer gallery array, preserving the previous gallery state
14. FOR ALL successful upload operations, THE Upload_Service SHALL generate a unique file name by prepending a timestamp or UUID to the original file name to prevent overwrites of existing files in the same bucket path
