---
inclusion: fileMatch
fileMatchPattern: "**/packages.js,**/themes.js,**/PackageDetailPage*,**/SectionRenderer*,**/packageSchema*,**/themeSchema*"
---

# Adverse LLC — Packages & Themes Reference

## Package Config Structure

#[[file:src/data/packages.js]]

Every package in `src/data/packages.js` follows this shape:

```javascript
{
  slug: "business-type",        // URL-safe, lowercase, hyphens (1-128 chars)
  name: "Business Name",        // Display name (1-256 chars)
  category: "Category Name",    // Determines layout variant
  description: "...",           // 0-1024 chars
  packageType: "static",        // "static" | "semi-dynamic" | "dynamic"
  sections: {
    hero: { headline, subheadline?, ctaText?, heroImage? },
    services: { heading, items: [{ title, description, icon? }] },
    gallery: { heading, images: [{ src, alt }] },
    testimonials: { heading, items: [{ quote, author, role?, avatar? }] },
    cta: { heading, body?, buttonText }
  },
  metadata: { phone?, email?, address?, hours? }
}
```

## Theme Structure

#[[file:src/data/themes.js]]

Themes are keyed by package slug. Each package gets up to 3 themes:

```javascript
"slug": [
  {
    name: "slug-variant",       // Unique identifier
    label: "Variant Name",      // UI display name
    colors: { /* 10 required keys */ },
    typography: { /* 8 required keys */ },
    shape: { /* 5 required keys */ },
    spacing: { /* 4 optional keys */ },
    shadow: { /* 4 optional keys */ },
    motion: { /* 5 optional keys */ }
  }
]
```

### Required Color Keys (10)
bgBase, bgSurface, bgMuted, textPrimary, textSecondary, textMuted, accent, accentHover, accentText, border

### Required Typography Keys (8)
fontDisplay, fontBody, weightLight, weightRegular, weightMedium, weightBold, trackingDisplay, trackingBody

### Required Shape Keys (5)
radiusSmall, radiusMedium, radiusLarge, buttonStyle (sharp|rounded|pill), cardStyle (flat|bordered|elevated)

## Category → Layout Variant Mapping

| Category | Layout | Style |
|----------|--------|-------|
| Professional | professional | Left-aligned, clean, sharp |
| Beauty & Wellness | beauty | Centered, soft, rounded |
| Home Services | homeServices | Bold, dark overlays, uppercase |
| Food & Hospitality | foodHospitality | Elegant, warm, centered overlay |
| (unknown) | professional | Fallback |

## Validation

- Package configs validated by `src/schemas/packageSchema.js`
- Themes validated by `src/schemas/themeSchema.js`
- Both use ajv with JSON Schema draft 2020-12
- Run `validatePackageConfig(config)` / `validateTheme(theme)` at runtime

## Section Registry

#[[file:src/registry/sectionRegistry.js]]

Available section types: hero, services, gallery, testimonials, cta, contact

Each entry has: type, loader (dynamic import), contentSchema, layouts array.
