// Feature: ai-website-packages, Property 7: applyTheme sets correct CSS custom properties
// Feature: ai-website-packages, Property 8: Theme scoping invariant
// Feature: ai-website-packages, Property 9: Theme update replaces all properties
// **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

import { describe, it, expect, beforeEach } from "vitest";
import fc from "fast-check";
import applyTheme from "../utils/applyTheme";

// --- Generators ---

/** Generate a random hex color string like "#a1b2c3" */
const hexColor = () =>
  fc.stringMatching(/^[0-9a-f]{6}$/).map((hex) => `#${hex}`);

/**
 * Generate a non-empty alphanumeric string for font names / values.
 * CSS setProperty trims leading/trailing whitespace, so we generate
 * strings that match what the DOM will actually store.
 */
const nonEmptyString = () =>
  fc
    .string({ minLength: 1, maxLength: 20 })
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

/** Generate a random theme object matching the full schema */
const themeArb = () =>
  fc.record({
    colors: fc.record({
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
    }),
    typography: fc.record({
      fontDisplay: nonEmptyString(),
      fontBody: nonEmptyString(),
      weightLight: nonEmptyString(),
      weightRegular: nonEmptyString(),
      weightMedium: nonEmptyString(),
      weightBold: nonEmptyString(),
      trackingDisplay: nonEmptyString(),
      trackingBody: nonEmptyString(),
    }),
    shape: fc.record({
      radiusSmall: nonEmptyString(),
      radiusMedium: nonEmptyString(),
      radiusLarge: nonEmptyString(),
      buttonStyle: fc.constantFrom("sharp", "rounded", "pill"),
      cardStyle: fc.constantFrom("flat", "bordered", "elevated"),
    }),
  });

/**
 * Helper: compute the expected CSS custom property name for a typography key.
 * Mirrors the typographyKeyToSuffix logic in applyTheme.js:
 *   fontDisplay → display, fontBody → body, weightLight → weightLight
 */
function typographyKeyToSuffix(key) {
  if (key.startsWith("font") && key.length > 4) {
    return key.charAt(4).toLowerCase() + key.slice(5);
  }
  return key;
}

// --- Tests ---

describe("Property 7: applyTheme sets correct CSS custom properties", () => {
  let element;

  beforeEach(() => {
    element = document.createElement("div");
    document.body.appendChild(element);
  });

  it("sets --color-{key} for every color token", () => {
    fc.assert(
      fc.property(themeArb(), (theme) => {
        element = document.createElement("div");
        applyTheme(element, theme);

        for (const [key, value] of Object.entries(theme.colors)) {
          const actual = element.style.getPropertyValue(`--color-${key}`);
          expect(actual).toBe(value);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("sets --font-{suffix} for every typography token", () => {
    fc.assert(
      fc.property(themeArb(), (theme) => {
        element = document.createElement("div");
        applyTheme(element, theme);

        for (const [key, value] of Object.entries(theme.typography)) {
          const suffix = typographyKeyToSuffix(key);
          const actual = element.style.getPropertyValue(`--font-${suffix}`);
          expect(actual).toBe(value);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("sets --shape-{key} for every shape token", () => {
    fc.assert(
      fc.property(themeArb(), (theme) => {
        element = document.createElement("div");
        applyTheme(element, theme);

        for (const [key, value] of Object.entries(theme.shape)) {
          const actual = element.style.getPropertyValue(`--shape-${key}`);
          expect(actual).toBe(value);
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe("Property 8: Theme scoping invariant", () => {
  beforeEach(() => {
    // Clear any leftover custom properties on documentElement
    const root = document.documentElement;
    for (let i = root.style.length - 1; i >= 0; i--) {
      const prop = root.style.item(i);
      if (
        prop.startsWith("--color-") ||
        prop.startsWith("--font-") ||
        prop.startsWith("--shape-")
      ) {
        root.style.removeProperty(prop);
      }
    }
  });

  it("does not set --color-*, --font-*, or --shape-* on document.documentElement", () => {
    fc.assert(
      fc.property(themeArb(), (theme) => {
        const div = document.createElement("div");
        document.body.appendChild(div);

        applyTheme(div, theme);

        const root = document.documentElement;
        for (let i = 0; i < root.style.length; i++) {
          const prop = root.style.item(i);
          expect(prop.startsWith("--color-")).toBe(false);
          expect(prop.startsWith("--font-")).toBe(false);
          expect(prop.startsWith("--shape-")).toBe(false);
        }

        document.body.removeChild(div);
      }),
      { numRuns: 100 },
    );
  });
});

describe("Property 9: Theme update replaces all properties", () => {
  it("after applying theme B over theme A, all properties reflect theme B", () => {
    fc.assert(
      fc.property(themeArb(), themeArb(), (themeA, themeB) => {
        const div = document.createElement("div");

        // Apply theme A first
        applyTheme(div, themeA);
        // Then apply theme B
        applyTheme(div, themeB);

        // All color properties should match theme B
        for (const [key, value] of Object.entries(themeB.colors)) {
          const actual = div.style.getPropertyValue(`--color-${key}`);
          expect(actual).toBe(value);
        }

        // All typography properties should match theme B
        for (const [key, value] of Object.entries(themeB.typography)) {
          const suffix = typographyKeyToSuffix(key);
          const actual = div.style.getPropertyValue(`--font-${suffix}`);
          expect(actual).toBe(value);
        }

        // All shape properties should match theme B
        for (const [key, value] of Object.entries(themeB.shape)) {
          const actual = div.style.getPropertyValue(`--shape-${key}`);
          expect(actual).toBe(value);
        }
      }),
      { numRuns: 100 },
    );
  });
});
