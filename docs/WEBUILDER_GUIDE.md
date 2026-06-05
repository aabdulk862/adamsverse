# Adverse WeBuilder — Developer Onboarding Guide

A guide to creating new packages, themes, and sections using the config-driven WeBuilder system.

## How It Works

The WeBuilder system renders package websites from JSON configuration rather than custom component code. The pipeline:

1. **Package_Config** (JSON) defines what sections to show and their content
2. **Theme** (JSON) defines the visual identity — colors, fonts, shapes
3. **Section Registry** maps section types to reusable React components
4. **Section Renderer** reads the config and assembles the page dynamically

This means you can create a new website package by writing JSON alone — no React components, no CSS files.

---

## Creating a New Package

### 1. Add the Package_Config to `src/data/packages.js`

Add a new object to the `packages` array. Here's the minimum structure:

```javascript
{
  slug: "pet-grooming",           // URL-safe identifier (lowercase, hyphens only)
  name: "Pet Grooming Salon",     // Display name
  category: "Pet Services",       // Used for layout variant selection
  description: "A friendly pet grooming website with service listings and booking.",
  sections: {
    hero: { /* ... */ },
    services: { /* ... */ },
    gallery: { /* ... */ },
    testimonials: { /* ... */ },
    cta: { /* ... */ }
  }
}
```

### 2. Section Content Schemas

Each section type expects specific fields:

#### Hero
```json
{
  "headline": "Welcome to Our Business",
  "subheadline": "Supporting text below the headline",
  "ctaText": "Get Started",
  "heroImage": "https://images.unsplash.com/photo-..."
}
```
- `headline` — required
- `subheadline`, `ctaText`, `heroImage` — optional

#### Services
```json
{
  "heading": "Our Services",
  "items": [
    { "title": "Service Name", "description": "What we do", "icon": "🔧" }
  ]
}
```
- `heading` — required
- `items` — required, array of 1–20 objects (each needs `title` + `description`, `icon` is optional)

#### Gallery
```json
{
  "heading": "Our Work",
  "images": [
    { "src": "https://example.com/photo.jpg", "alt": "Description of image" }
  ]
}
```
- `heading` — required
- `images` — required, array of 1–30 objects (each needs `src` + `alt`)

#### Testimonials
```json
{
  "heading": "What Clients Say",
  "items": [
    { "quote": "Great service!", "author": "Jane Smith", "role": "CEO", "avatar": "https://..." }
  ]
}
```
- `heading` — required
- `items` — required, array of 1–20 objects (each needs `quote` + `author`, `role` and `avatar` are optional)

#### CTA
```json
{
  "heading": "Ready to Get Started?",
  "body": "Contact us today.",
  "buttonText": "Contact Us"
}
```
- `heading` — required
- `buttonText` — required
- `body` — optional

#### Contact
```json
{
  "heading": "Get In Touch",
  "phone": "+1-555-0100",
  "email": "info@business.com",
  "address": "123 Main Street",
  "hours": "Mon-Fri 9am-5pm"
}
```
- `heading` — required
- `phone`, `email`, `address`, `hours` — all optional

### 3. Optional Fields

You can also include:

```javascript
{
  packageType: "static",  // "static" | "semi-dynamic" | "dynamic" (defaults to "static")
  metadata: {
    phone: "+1-555-0100",
    email: "info@business.com",
    address: "123 Main St",
    hours: "Mon-Sat 9am-5pm"
  }
}
```

### 4. Validate Your Config

You can programmatically validate any config:

```javascript
import { validatePackageConfig, getValidationErrors } from "./src/schemas/packageSchema.js";

const isValid = validatePackageConfig(myConfig);
if (!isValid) {
  console.log(getValidationErrors());
}
```

---

## Creating a New Theme

### 1. Add the Theme to `src/data/themes.js`

Themes are organized by package slug. Each package gets an array of up to 3 themes:

```javascript
"pet-grooming": [
  {
    name: "pet-grooming-pawprint",   // Unique identifier (referenced by themeRef)
    label: "Pawprint",               // Display name in the theme toggle UI
    colors: { /* 10 required keys */ },
    typography: { /* 8 required keys */ },
    shape: { /* 5 required keys */ }
  },
  // ... up to 3 themes per package
]
```

### 2. Required Color Tokens (10 keys)

```javascript
colors: {
  bgBase: "#faf8f5",        // Page background
  bgSurface: "#f0ebe4",     // Card/surface background
  bgMuted: "#e4ddd4",       // Subtle section background
  textPrimary: "#2a2420",   // Headings and body text
  textSecondary: "#5a4e44", // Subheadings and supporting text
  textMuted: "#8a7e74",     // Captions and de-emphasized text
  accent: "#d4804a",        // Buttons, links, interactive elements
  accentHover: "#e0925a",   // Hover state for accent elements
  accentText: "#ffffff",    // Text on accent-colored backgrounds
  border: "#d8cec4"         // Dividers and card borders
}
```

### 3. Required Typography Tokens (8 keys)

```javascript
typography: {
  fontDisplay: "Fredoka",       // Headings font (loaded via Google Fonts)
  fontBody: "Nunito",           // Body text font
  weightLight: "300",           // Light weight
  weightRegular: "400",         // Regular weight
  weightMedium: "500",          // Medium weight
  weightBold: "700",            // Bold weight
  trackingDisplay: "0.01em",    // Letter-spacing for headings
  trackingBody: "0.005em"       // Letter-spacing for body
}
```

### 4. Required Shape Tokens (5 keys)

```javascript
shape: {
  radiusSmall: "8px",       // Chips, badges
  radiusMedium: "14px",     // Buttons, inputs
  radiusLarge: "24px",      // Cards, modals
  buttonStyle: "pill",      // "sharp" | "rounded" | "pill"
  cardStyle: "elevated"     // "flat" | "bordered" | "elevated"
}
```

### 5. Optional Token Groups

You can also include `spacing`, `shadow`, and `motion` groups. Themes without them remain valid:

```javascript
spacing: {
  sectionPadding: "4rem 1.5rem",
  containerMaxWidth: "1100px",
  gridGap: "1.5rem",
  stackGap: "1rem"
},
shadow: {
  shadowSmall: "0 1px 2px rgba(0,0,0,0.08)",
  shadowMedium: "0 3px 10px rgba(0,0,0,0.12)",
  shadowLarge: "0 6px 24px rgba(0,0,0,0.18)",
  shadowCard: "0 2px 6px rgba(0,0,0,0.08)"
},
motion: {
  durationFast: "120ms",
  durationNormal: "250ms",
  durationSlow: "450ms",
  easingDefault: "cubic-bezier(0.4, 0, 0.2, 1)",
  easingBounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
}
```

### 6. Validate Your Theme

```javascript
import { validateTheme } from "./src/schemas/themeSchema.js";

const result = validateTheme(myTheme);
if (!result.valid) {
  console.log(result.errors);
}
```

---

## Layout Variants

The `category` field on a package determines which layout variant is applied to all sections. The mapping:

| Category | Layout Variant | Style |
|----------|---------------|-------|
| Professional | `professional` | Left-aligned, clean lines, sharp edges |
| Beauty & Wellness | `beauty` | Centered, soft gradients, rounded cards |
| Home Services | `homeServices` | Bold, dark overlays, uppercase headings |
| Food & Hospitality | `foodHospitality` | Elegant, warm tones, centered overlay |

If your category doesn't match any of these, sections fall back to `professional`.

---

## Adding a New Section Type

If the existing 6 section types don't cover your needs:

### 1. Create the Component

Create `src/components/packages/YourSection.jsx`:

```jsx
import styles from "./YourSection.module.css";

const LAYOUT_CLASS_MAP = {
  professional: "yourSectionProfessional",
  beauty: "yourSectionBeauty",
};

const DEFAULT_LAYOUT = "professional";

export default function YourSection({ content, theme, layout, packageName }) {
  const { heading, customField } = content || {};
  const resolvedLayout = LAYOUT_CLASS_MAP[layout] ? layout : DEFAULT_LAYOUT;
  const variantClass = LAYOUT_CLASS_MAP[resolvedLayout];

  return (
    <section className={`${styles.yourSection} ${styles[variantClass] || ""}`}>
      {heading && <h2>{heading}</h2>}
      {customField && <p>{customField}</p>}
    </section>
  );
}
```

Rules:
- Accept `{ content, theme, layout, packageName }` props
- Destructure content with `content || {}` for graceful empty handling
- Fall back to a default layout for unknown variant strings
- Use CSS custom properties (`var(--color-*)`, `var(--font-*)`, `var(--shape-*)`) — no hardcoded colors

### 2. Register It

In `src/registry/sectionRegistry.js`, add an entry:

```javascript
yourSection: {
  type: "yourSection",
  loader: () => import("../components/packages/YourSection.jsx"),
  contentSchema: {
    type: "object",
    required: ["heading"],
    properties: {
      heading: { type: "string", description: "Section heading", examples: ["Our Story"] },
      customField: { type: "string", description: "Custom content field" }
    }
  },
  layouts: ["professional", "beauty"]
}
```

### 3. Use It in a Package

```javascript
sections: {
  hero: { /* ... */ },
  yourSection: { heading: "Our Story", customField: "We started in 2020..." },
  cta: { /* ... */ }
}
```

---

## File Structure Reference

```
src/
├── schemas/
│   ├── packageSchema.js     # Package_Config JSON Schema + validator
│   └── themeSchema.js       # Theme JSON Schema + validator
├── registry/
│   └── sectionRegistry.js   # Section type → component mapping
├── lib/
│   ├── contentLayer.js      # Content resolution + editing
│   ├── uploadService.js     # Supabase Storage file uploads
│   └── assetGallery.js      # Gallery add/remove/reorder operations
├── components/packages/
│   ├── SectionRenderer.jsx  # Dynamic config-driven page renderer
│   ├── Hero.jsx             # Hero section component
│   ├── Services.jsx         # Services section component
│   ├── Gallery.jsx          # Gallery section component
│   ├── Testimonials.jsx     # Testimonials section component
│   ├── CTA.jsx              # CTA section component
│   └── ContactSection.jsx   # Contact section component
├── data/
│   ├── packages.js          # All package configurations
│   └── themes.js            # All theme definitions (keyed by slug)
├── pages/
│   └── PackageDetailPage.jsx # Route handler for /packages/:slug
└── utils/
    ├── applyTheme.js        # Applies theme tokens as CSS custom properties
    └── fontLoader.js        # Loads Google Fonts for active theme
```

---

## Quick Checklist: New Package

- [ ] Add package object to `src/data/packages.js`
- [ ] Set `slug` (lowercase, hyphens, unique)
- [ ] Set `category` to one of: Professional, Beauty & Wellness, Home Services, Food & Hospitality
- [ ] Fill in `sections` with at least a `hero` section
- [ ] Add 3 themes to `src/data/themes.js` under the package slug
- [ ] Each theme needs: `name`, `label`, `colors` (10), `typography` (8), `shape` (5)
- [ ] Run `npm run build` to verify no errors
- [ ] Run `npm run test` to verify no regressions
- [ ] Visit `/packages/{your-slug}` to preview

---

## Validation & Testing

```bash
# Build (must pass with zero errors)
npm run build

# Run all tests
npm run test

# Run only WeBuilder property tests
npx vitest --run src/__tests__/property-webuilder-*
```

The property tests verify:
- Theme application correctness (Properties 1–3)
- Schema validation and round-trip (Properties 4–5, 17)
- Section rendering order and graceful degradation (Properties 6–9)
- Content layer editing invariants (Properties 10–14)
- Compositional correctness and theme ref validation (Properties 15–16)
- Slug routing preservation (Property 18)
