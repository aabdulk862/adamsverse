// Feature: adverse-webuilder, Property 1: Theme application sets correct CSS custom properties
// Feature: adverse-webuilder, Property 2: Theme backward compatibility
// Feature: adverse-webuilder, Property 3: Invalid theme rejection preserves previous state
// **Validates: Requirements 1.2, 1.3, 1.5, 1.6, 1.7**

import { describe, it, expect, beforeEach } from "vitest";
import fc from "fast-check";
import applyTheme from "../utils/applyTheme";

// --- Generators ---

/** Generate a random hex color string like "#a1b2c3" */
const hexColor = () =>
  fc.stringMatching(/^[0-9a-f]{6}$/).map((hex) => `#${hex}`);

/** Generate a non-empty string suitable for CSS values */
const cssValue = () =>
  fc
    .string({ minLength: 1, maxLength: 20 })
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

/** Generate a valid colors group (10 required keys) */
const colorsArb = () =>
  fc.record({
    bgBase: hexColor(),
    bgSurface: hexColor(),
    bgMuted: hexColor(),
    textPrimary: hexColor(),
    textSecondary: hexColor(),
    textMuted: hexColor(),
    accent: hexColor(),
    accentHover: hexColor(),
    accentText: hexColor(),
    border: hexColor(),
  });

/** Generate a valid typography group (8 required keys) */
const typographyArb = () =>
  fc.record({
    fontDisplay: cssValue(),
    fontBody: cssValue(),
    weightLight: cssValue(),
    weightRegular: cssValue(),
    weightMedium: cssValue(),
    weightBold: cssValue(),
    trackingDisplay: cssValue(),
    trackingBody: cssValue(),
  });

/** Generate a valid shape group (5 required keys) */
const shapeArb = () =>
  fc.record({
    radiusSmall: cssValue(),
    radiusMedium: cssValue(),
    radiusLarge: cssValue(),
    buttonStyle: fc.constantFrom("sharp", "rounded", "pill"),
    cardStyle: fc.constantFrom("flat", "bordered", "elevated"),
  });

/** Generate a valid spacing group (4 keys) */
const spacingArb = () =>
  fc.record({
    sectionPadding: cssValue(),
    containerMaxWidth: cssValue(),
    gridGap: cssValue(),
    stackGap: cssValue(),
  });

/** Generate a valid shadow group (4 keys) */
const shadowArb = () =>
  fc.record({
    shadowSmall: cssValue(),
    shadowMedium: cssValue(),
    shadowLarge: cssValue(),
    shadowCard: cssValue(),
  });

/** Generate a valid motion group (5 keys) */
const motionArb = () =>
  fc.record({
    durationFast: cssValue(),
    durationNormal: cssValue(),
    durationSlow: cssValue(),
    easingDefault: cssValue(),
    easingBounce: cssValue(),
  });

/**
 * Generate a full valid theme with all groups (required + optional).
 * Includes name and label metadata fields for schema compliance.
 */
const fullThemeArb = () =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    label: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    colors: colorsArb(),
    typography: typographyArb(),
    shape: shapeArb(),
    spacing: spacingArb(),
    shadow: shadowArb(),
    motion: motionArb(),
  });

/**
 * Generate a valid theme with only the required groups (colors, typography, shape).
 * No spacing, shadow, or motion — backward-compatible shape.
 */
const backwardCompatibleThemeArb = () =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    label: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    colors: colorsArb(),
    typography: typographyArb(),
    shape: shapeArb(),
  });

/**
 * Generate an invalid theme by removing one or more required color keys.
 */
const invalidThemeMissingColorKeys = () =>
  fc.record({
    name: fc.constant("invalid-theme"),
    label: fc.constant("Invalid"),
    colors: fc.record({
      bgBase: hexColor(),
      bgSurface: hexColor(),
      // Missing bgMuted, textPrimary, textSecondary, textMuted, accent, accentHover, accentText, border
    }),
    typography: typographyArb(),
    shape: shapeArb(),
  });

/**
 * Generate an invalid theme by using wrong types for color values (numbers instead of strings).
 */
const invalidThemeWrongTypes = () =>
  fc.record({
    name: fc.constant("wrong-types"),
    label: fc.constant("Wrong Types"),
    colors: fc.record({
      bgBase: fc.integer(),
      bgSurface: fc.integer(),
      bgMuted: fc.integer(),
      textPrimary: fc.integer(),
      textSecondary: fc.integer(),
      textMuted: fc.integer(),
      accent: fc.integer(),
      accentHover: fc.integer(),
      accentText: fc.integer(),
      border: fc.integer(),
    }),
    typography: typographyArb(),
    shape: shapeArb(),
  });

/**
 * Generate an invalid theme by removing required typography keys.
 */
const invalidThemeMissingTypographyKeys = () =>
  fc.record({
    name: fc.constant("missing-typo"),
    label: fc.constant("Missing Typography"),
    colors: colorsArb(),
    typography: fc.record({
      fontDisplay: cssValue(),
      // Missing fontBody, weightLight, weightRegular, weightMedium, weightBold, trackingDisplay, trackingBody
    }),
    shape: shapeArb(),
  });

/**
 * Helper: compute the expected CSS custom property name for a typography key.
 * Mirrors the typographyKeyToSuffix logic in applyTheme.js.
 */
function typographyKeyToSuffix(key) {
  if (key.startsWith("font") && key.length > 4) {
    return key.charAt(4).toLowerCase() + key.slice(5);
  }
  return key;
}

// --- Property 1: Theme application sets correct CSS custom properties ---

describe("Property 1: Theme application sets correct CSS custom properties", () => {
  it("sets --color-{key} for every color token in a full theme", () => {
    fc.assert(
      fc.property(fullThemeArb(), (theme) => {
        const element = document.createElement("div");
        const result = applyTheme(element, theme);

        expect(result.success).toBe(true);

        for (const [key, value] of Object.entries(theme.colors)) {
          const actual = element.style.getPropertyValue(`--color-${key}`);
          expect(actual).toBe(value);
        }
      }),
      { numRuns: 25 },
    );
  });

  it("sets --font-{suffix} for every typography token in a full theme", () => {
    fc.assert(
      fc.property(fullThemeArb(), (theme) => {
        const element = document.createElement("div");
        const result = applyTheme(element, theme);

        expect(result.success).toBe(true);

        for (const [key, value] of Object.entries(theme.typography)) {
          const suffix = typographyKeyToSuffix(key);
          const actual = element.style.getPropertyValue(`--font-${suffix}`);
          expect(actual).toBe(value);
        }
      }),
      { numRuns: 25 },
    );
  });

  it("sets --shape-{key} for every shape token in a full theme", () => {
    fc.assert(
      fc.property(fullThemeArb(), (theme) => {
        const element = document.createElement("div");
        const result = applyTheme(element, theme);

        expect(result.success).toBe(true);

        for (const [key, value] of Object.entries(theme.shape)) {
          const actual = element.style.getPropertyValue(`--shape-${key}`);
          expect(actual).toBe(value);
        }
      }),
      { numRuns: 25 },
    );
  });

  it("sets --spacing-{key} for every spacing token when present", () => {
    fc.assert(
      fc.property(fullThemeArb(), (theme) => {
        const element = document.createElement("div");
        const result = applyTheme(element, theme);

        expect(result.success).toBe(true);

        for (const [key, value] of Object.entries(theme.spacing)) {
          const actual = element.style.getPropertyValue(`--spacing-${key}`);
          expect(actual).toBe(value);
        }
      }),
      { numRuns: 25 },
    );
  });

  it("sets --shadow-{key} for every shadow token when present", () => {
    fc.assert(
      fc.property(fullThemeArb(), (theme) => {
        const element = document.createElement("div");
        const result = applyTheme(element, theme);

        expect(result.success).toBe(true);

        for (const [key, value] of Object.entries(theme.shadow)) {
          const actual = element.style.getPropertyValue(`--shadow-${key}`);
          expect(actual).toBe(value);
        }
      }),
      { numRuns: 25 },
    );
  });

  it("sets --motion-{key} for every motion token when present", () => {
    fc.assert(
      fc.property(fullThemeArb(), (theme) => {
        const element = document.createElement("div");
        const result = applyTheme(element, theme);

        expect(result.success).toBe(true);

        for (const [key, value] of Object.entries(theme.motion)) {
          const actual = element.style.getPropertyValue(`--motion-${key}`);
          expect(actual).toBe(value);
        }
      }),
      { numRuns: 25 },
    );
  });
});

// --- Property 2: Theme backward compatibility ---

describe("Property 2: Theme backward compatibility", () => {
  it("succeeds with only required groups (colors, typography, shape) — no optional groups", () => {
    fc.assert(
      fc.property(backwardCompatibleThemeArb(), (theme) => {
        const element = document.createElement("div");
        const result = applyTheme(element, theme);

        expect(result.success).toBe(true);
        expect(result.errors).toBeUndefined();
      }),
      { numRuns: 25 },
    );
  });

  it("sets all expected CSS custom properties for required groups", () => {
    fc.assert(
      fc.property(backwardCompatibleThemeArb(), (theme) => {
        const element = document.createElement("div");
        applyTheme(element, theme);

        // Colors are set
        for (const [key, value] of Object.entries(theme.colors)) {
          expect(element.style.getPropertyValue(`--color-${key}`)).toBe(value);
        }

        // Typography is set
        for (const [key, value] of Object.entries(theme.typography)) {
          const suffix = typographyKeyToSuffix(key);
          expect(element.style.getPropertyValue(`--font-${suffix}`)).toBe(value);
        }

        // Shape is set
        for (const [key, value] of Object.entries(theme.shape)) {
          expect(element.style.getPropertyValue(`--shape-${key}`)).toBe(value);
        }
      }),
      { numRuns: 25 },
    );
  });

  it("does NOT set --spacing-*, --shadow-*, or --motion-* properties when those groups are absent", () => {
    fc.assert(
      fc.property(backwardCompatibleThemeArb(), (theme) => {
        const element = document.createElement("div");
        applyTheme(element, theme);

        // Check that no spacing, shadow, or motion properties are set
        const spacingKeys = ["sectionPadding", "containerMaxWidth", "gridGap", "stackGap"];
        const shadowKeys = ["shadowSmall", "shadowMedium", "shadowLarge", "shadowCard"];
        const motionKeys = ["durationFast", "durationNormal", "durationSlow", "easingDefault", "easingBounce"];

        for (const key of spacingKeys) {
          expect(element.style.getPropertyValue(`--spacing-${key}`)).toBe("");
        }
        for (const key of shadowKeys) {
          expect(element.style.getPropertyValue(`--shadow-${key}`)).toBe("");
        }
        for (const key of motionKeys) {
          expect(element.style.getPropertyValue(`--motion-${key}`)).toBe("");
        }
      }),
      { numRuns: 25 },
    );
  });
});

// --- Property 3: Invalid theme rejection preserves previous state ---

describe("Property 3: Invalid theme rejection preserves previous state", () => {
  it("rejects themes with missing required color keys and preserves previous CSS vars", () => {
    fc.assert(
      fc.property(
        backwardCompatibleThemeArb(),
        invalidThemeMissingColorKeys(),
        (validTheme, invalidTheme) => {
          const element = document.createElement("div");

          // Apply a valid theme first
          const firstResult = applyTheme(element, validTheme);
          expect(firstResult.success).toBe(true);

          // Capture the state after valid theme
          const previousBgBase = element.style.getPropertyValue("--color-bgBase");

          // Attempt to apply invalid theme
          const secondResult = applyTheme(element, invalidTheme);
          expect(secondResult.success).toBe(false);
          expect(secondResult.errors).toBeDefined();
          expect(secondResult.errors.length).toBeGreaterThan(0);

          // Previous CSS vars should be preserved
          expect(element.style.getPropertyValue("--color-bgBase")).toBe(previousBgBase);
        },
      ),
      { numRuns: 25 },
    );
  });

  it("rejects themes with wrong value types and preserves previous CSS vars", () => {
    fc.assert(
      fc.property(
        backwardCompatibleThemeArb(),
        invalidThemeWrongTypes(),
        (validTheme, invalidTheme) => {
          const element = document.createElement("div");

          // Apply a valid theme first
          applyTheme(element, validTheme);

          // Capture previous state
          const previousAccent = element.style.getPropertyValue("--color-accent");

          // Attempt to apply invalid theme
          const result = applyTheme(element, invalidTheme);
          expect(result.success).toBe(false);
          expect(result.errors).toBeDefined();
          expect(result.errors.length).toBeGreaterThan(0);

          // Previous CSS vars preserved
          expect(element.style.getPropertyValue("--color-accent")).toBe(previousAccent);
        },
      ),
      { numRuns: 25 },
    );
  });

  it("rejects themes with missing required typography keys and preserves previous CSS vars", () => {
    fc.assert(
      fc.property(
        backwardCompatibleThemeArb(),
        invalidThemeMissingTypographyKeys(),
        (validTheme, invalidTheme) => {
          const element = document.createElement("div");

          // Apply a valid theme first
          applyTheme(element, validTheme);

          // Capture previous state
          const previousFontDisplay = element.style.getPropertyValue("--font-display");

          // Attempt to apply invalid theme
          const result = applyTheme(element, invalidTheme);
          expect(result.success).toBe(false);
          expect(result.errors).toBeDefined();
          expect(result.errors.length).toBeGreaterThan(0);

          // Previous CSS vars preserved
          expect(element.style.getPropertyValue("--font-display")).toBe(previousFontDisplay);
        },
      ),
      { numRuns: 25 },
    );
  });

  it("returns errors identifying the specific invalid keys", () => {
    fc.assert(
      fc.property(invalidThemeMissingColorKeys(), (invalidTheme) => {
        const element = document.createElement("div");
        const result = applyTheme(element, invalidTheme);

        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();

        // Errors should contain information about missing required properties
        const errorText = result.errors.join(" ");
        expect(errorText).toContain("required");
      }),
      { numRuns: 25 },
    );
  });
});
