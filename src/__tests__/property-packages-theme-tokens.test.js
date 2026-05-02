// Feature: design-packages-overhaul, Property 5: Theme token completeness
// Feature: design-packages-overhaul, Property 6: Theme enum validation
// **Validates: Requirements 5.1, 5.11**
//
// themes.js now exports a Package_Theme_Map keyed by slug, where each slug
// maps to an array of 3 theme objects. This test generates (slug, index) pairs
// and validates every individual theme object.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import themes from "../data/themes";

const slugs = Object.keys(themes);

// Build a flat list of { slug, index } pairs covering every theme object
const allThemeRefs = slugs.flatMap((slug) =>
  themes[slug].map((_, index) => ({ slug, index })),
);

const requiredColorKeys = [
  "bgBase",
  "bgSurface",
  "bgMuted",
  "textPrimary",
  "textSecondary",
  "textMuted",
  "accent",
  "accentHover",
  "accentText",
  "border",
];

const requiredTypographyKeys = [
  "fontDisplay",
  "fontBody",
  "weightLight",
  "weightRegular",
  "weightMedium",
  "weightBold",
  "trackingDisplay",
  "trackingBody",
];

const requiredShapeKeys = [
  "radiusSmall",
  "radiusMedium",
  "radiusLarge",
  "buttonStyle",
  "cardStyle",
];

const validButtonStyles = ["sharp", "rounded", "pill"];
const validCardStyles = ["flat", "bordered", "elevated"];

describe("Property 5: Theme token completeness", () => {
  it("every theme has all required color keys with non-empty string values", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allThemeRefs), ({ slug, index }) => {
        const theme = themes[slug][index];
        expect(theme.colors).toBeDefined();
        for (const key of requiredColorKeys) {
          expect(theme.colors).toHaveProperty(key);
          expect(typeof theme.colors[key]).toBe("string");
          expect(theme.colors[key].length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("every theme has all required typography keys with non-empty string values", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allThemeRefs), ({ slug, index }) => {
        const theme = themes[slug][index];
        expect(theme.typography).toBeDefined();
        for (const key of requiredTypographyKeys) {
          expect(theme.typography).toHaveProperty(key);
          expect(typeof theme.typography[key]).toBe("string");
          expect(theme.typography[key].length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("every theme has all required shape keys with non-empty string values", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allThemeRefs), ({ slug, index }) => {
        const theme = themes[slug][index];
        expect(theme.shape).toBeDefined();
        for (const key of requiredShapeKeys) {
          expect(theme.shape).toHaveProperty(key);
          expect(typeof theme.shape[key]).toBe("string");
          expect(theme.shape[key].length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("every theme has name and label as non-empty strings", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allThemeRefs), ({ slug, index }) => {
        const theme = themes[slug][index];
        expect(typeof theme.name).toBe("string");
        expect(theme.name.length).toBeGreaterThan(0);
        expect(typeof theme.label).toBe("string");
        expect(theme.label.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });
});

describe("Property 6: Theme enum validation", () => {
  it("every theme buttonStyle is one of sharp, rounded, or pill", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allThemeRefs), ({ slug, index }) => {
        const theme = themes[slug][index];
        expect(validButtonStyles).toContain(theme.shape.buttonStyle);
      }),
      { numRuns: 100 },
    );
  });

  it("every theme cardStyle is one of flat, bordered, or elevated", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allThemeRefs), ({ slug, index }) => {
        const theme = themes[slug][index];
        expect(validCardStyles).toContain(theme.shape.cardStyle);
      }),
      { numRuns: 100 },
    );
  });
});
