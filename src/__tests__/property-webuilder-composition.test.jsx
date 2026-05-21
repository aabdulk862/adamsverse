// Feature: adverse-webuilder, Property 16: Invalid theme reference rejection
// **Validates: Requirements 9.6**

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fc from "fast-check";
import { render } from "@testing-library/react";
import SectionRenderer from "../components/packages/SectionRenderer";
import themes from "../data/themes";

// Mock IntersectionObserver for scroll animation hooks
beforeAll(() => {
  global.IntersectionObserver = class {
    constructor(callback) {
      this._callback = callback;
    }
    observe() {
      this._callback([{ isIntersecting: true, intersectionRatio: 1 }]);
    }
    unobserve() {}
    disconnect() {}
  };
});

afterAll(() => {
  delete global.IntersectionObserver;
});

// --- Constants ---
const NUM_RUNS = 25;

// Collect all valid theme names from the registry
const ALL_THEME_NAMES = [];
for (const slug of Object.keys(themes)) {
  for (const t of themes[slug]) {
    ALL_THEME_NAMES.push(t.name);
  }
}

// --- Generators ---

/**
 * Generate a string that does NOT match any registered theme name.
 * Uses a prefix "invalid-theme-" combined with random alphanumeric to ensure
 * it never collides with real theme names.
 */
const invalidThemeRefArb = () =>
  fc
    .stringMatching(/^[a-z][a-z0-9-]{3,30}$/)
    .filter((s) => !ALL_THEME_NAMES.includes(s));

/**
 * Generate a valid Package_Config that passes schema validation
 * but has an invalid themeRef (not in the theme registry).
 */
const validConfigWithInvalidThemeRef = () =>
  invalidThemeRefArb().map((themeRef) => ({
    slug: "test-package",
    name: "Test Package",
    category: "Professional",
    description: "A test package for property testing.",
    packageType: "static",
    themeRef,
    sections: {
      hero: {
        headline: "Welcome",
        subheadline: "Test subheadline",
        ctaText: "Get Started",
        heroImage: "https://images.unsplash.com/photo-test",
      },
    },
  }));

// A minimal valid theme object for rendering
const minimalTheme = {
  name: "test-theme",
  colors: {
    bgBase: "#111",
    bgSurface: "#222",
    bgMuted: "#333",
    textPrimary: "#fff",
    textSecondary: "#ccc",
    textMuted: "#999",
    accent: "#0af",
    accentHover: "#0cf",
    accentText: "#000",
    border: "#444",
  },
  typography: {
    fontDisplay: "Inter",
    fontBody: "Inter",
    weightLight: "300",
    weightRegular: "400",
    weightMedium: "500",
    weightBold: "700",
    trackingDisplay: "0em",
    trackingBody: "0em",
  },
  shape: {
    radiusSmall: "2px",
    radiusMedium: "4px",
    radiusLarge: "8px",
    buttonStyle: "rounded",
    cardStyle: "flat",
  },
};

// --- Property 16: Invalid theme reference rejection ---

describe("Property 16: Invalid theme reference rejection", () => {
  it("rejects configs with invalid themeRef and renders error UI identifying the invalid theme name", () => {
    fc.assert(
      fc.property(validConfigWithInvalidThemeRef(), (config) => {
        const { container, unmount } = render(
          <SectionRenderer
            config={config}
            theme={minimalTheme}
            layout="professional"
            packageName="Test"
          />
        );

        // Should render the theme error UI
        const errorEl = container.querySelector(
          '[data-testid="section-renderer-theme-error"]'
        );
        expect(errorEl).not.toBeNull();

        // The error message should contain the invalid theme name
        expect(errorEl.textContent).toContain(config.themeRef);

        // Should NOT render any sections
        const sectionElements = container.querySelectorAll("[data-section]");
        expect(sectionElements.length).toBe(0);

        // Should NOT render the generic validation error UI
        const validationError = container.querySelector(
          '[data-testid="section-renderer-error"]'
        );
        expect(validationError).toBeNull();

        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
