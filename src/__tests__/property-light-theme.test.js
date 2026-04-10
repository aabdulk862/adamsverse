// Feature: saas-platform-revamp, Property 1: Light theme — no dark theme remnants
// **Validates: Requirements 1.1, 1.5**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import fs from "fs";
import path from "path";

const cssContent = fs.readFileSync(
  path.resolve(__dirname, "../styles.css"),
  "utf-8",
);

/**
 * Parse a hex color to {r, g, b}.
 */
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Compute relative luminance per WCAG 2.0.
 */
function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

describe("Property 1: Light theme — no dark theme remnants", () => {
  // Old dark theme colors that must not appear
  const oldDarkColors = ["#101830", "#1e2d50"];

  it("CSS does not contain old dark theme color values", () => {
    fc.assert(
      fc.property(fc.constantFrom(...oldDarkColors), (darkColor) => {
        const lowerCss = cssContent.toLowerCase();
        const lowerColor = darkColor.toLowerCase();
        expect(lowerCss).not.toContain(lowerColor);
      }),
      { numRuns: 100 },
    );
  });

  it("body background resolves to a light color (luminance > 0.8)", () => {
    // Body background uses var(--bg-primary) which resolves to #ffffff in light theme
    // Check that :root defines --bg-primary as a light color
    const rootBgMatch = cssContent.match(/--bg-primary:\s*(#[0-9a-fA-F]{6})/);
    expect(rootBgMatch).not.toBeNull();

    const bgColor = rootBgMatch[1];
    const rgb = hexToRgb(bgColor);
    const luminance = relativeLuminance(rgb);

    fc.assert(
      fc.property(fc.constant(luminance), (lum) => {
        expect(lum).toBeGreaterThan(0.8);
      }),
      { numRuns: 100 },
    );
  });
});
