// Feature: saas-platform-revamp, Property 2: Text contrast ratios meet WCAG minimums
// **Validates: Requirements 1.3**

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

/**
 * Compute WCAG contrast ratio between two colors.
 */
function contrastRatio(color1, color2) {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Extract CSS custom property value from :root block.
 */
function getCssVar(name) {
  const regex = new RegExp(
    `${name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}:\\s*(#[0-9a-fA-F]{6})`,
  );
  const match = cssContent.match(regex);
  return match ? match[1] : null;
}

describe("Property 2: Text contrast ratios meet WCAG minimums", () => {
  // Text/background pairs: [textVar, bgVar, minRatio, description]
  const colorPairs = [
    // Body text on primary background
    {
      text: "--text-primary",
      bg: "--bg-primary",
      minRatio: 4.5,
      label: "body text on primary bg",
    },
    // Body text on secondary background
    {
      text: "--text-primary",
      bg: "--bg-secondary",
      minRatio: 4.5,
      label: "body text on secondary bg",
    },
    // Secondary text on primary background
    {
      text: "--text-secondary",
      bg: "--bg-primary",
      minRatio: 4.5,
      label: "secondary text on primary bg",
    },
    // Muted text on primary background (large text threshold)
    {
      text: "--text-muted",
      bg: "--bg-primary",
      minRatio: 3.0,
      label: "muted text on primary bg (large text)",
    },
    // Muted text on secondary background (large text threshold)
    {
      text: "--text-muted",
      bg: "--bg-secondary",
      minRatio: 3.0,
      label: "muted text on secondary bg (large text)",
    },
  ];

  it("all text-color/background-color pairs meet WCAG contrast minimums", () => {
    fc.assert(
      fc.property(fc.constantFrom(...colorPairs), (pair) => {
        const textHex = getCssVar(pair.text);
        const bgHex = getCssVar(pair.bg);
        expect(textHex).not.toBeNull();
        expect(bgHex).not.toBeNull();

        const ratio = contrastRatio(hexToRgb(textHex), hexToRgb(bgHex));
        expect(ratio).toBeGreaterThanOrEqual(pair.minRatio);
      }),
      { numRuns: 100 },
    );
  });
});
