// Feature: dark-mode-toggle, Property 4: Dark theme contrast ratios meet WCAG minimums
// **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

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
 * Parse an rgba() color string to {r, g, b, a}.
 */
function parseRgba(rgba) {
  const match = rgba.match(
    /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/,
  );
  if (!match) return null;
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
    a: parseFloat(match[4]),
  };
}

/**
 * Composite an rgba foreground color over an opaque background.
 * Returns the effective {r, g, b} after alpha blending.
 */
function compositeOver(fg, bg) {
  const a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
  };
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
 * Compute WCAG contrast ratio between two RGB colors.
 */
function contrastRatio(color1, color2) {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Extract the [data-theme="dark"] block from the CSS.
 */
function getDarkBlock() {
  const match = cssContent.match(/\[data-theme=["']dark["']\]\s*\{([^}]+)\}/);
  return match ? match[1] : "";
}

/**
 * Extract a CSS custom property value from the dark theme block.
 * Supports hex (#rrggbb) and rgba() values.
 */
function getDarkVar(name) {
  const darkBlock = getDarkBlock();
  const escaped = name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  // Try hex first
  const hexRegex = new RegExp(`${escaped}:\\s*(#[0-9a-fA-F]{6})`);
  const hexMatch = darkBlock.match(hexRegex);
  if (hexMatch) return hexMatch[1];
  // Try rgba
  const rgbaRegex = new RegExp(`${escaped}:\\s*(rgba\\([^)]+\\))`);
  const rgbaMatch = darkBlock.match(rgbaRegex);
  if (rgbaMatch) return rgbaMatch[1];
  return null;
}

/**
 * Resolve a dark theme CSS variable to an effective RGB color.
 * For hex values, parses directly. For rgba values, composites over bgRgb.
 */
function resolveToRgb(value, bgRgb) {
  if (value.startsWith("#")) {
    return hexToRgb(value);
  }
  if (value.startsWith("rgba")) {
    const fg = parseRgba(value);
    if (!fg) return null;
    return compositeOver(fg, bgRgb);
  }
  return null;
}

describe("Property 4: Dark theme contrast ratios meet WCAG minimums", () => {
  const bgHex = getDarkVar("--bg-primary");
  const bgRgb = bgHex ? hexToRgb(bgHex) : null;

  // Color pairs to validate: [varName, minRatio, label]
  const colorPairs = [
    {
      varName: "--text-primary",
      minRatio: 4.5,
      label: "text-primary vs bg-primary (normal text)",
    },
    {
      varName: "--text-secondary",
      minRatio: 4.5,
      label: "text-secondary vs bg-primary (normal text)",
    },
    {
      varName: "--accent-primary",
      minRatio: 3,
      label: "accent-primary vs bg-primary (interactive)",
    },
    {
      varName: "--border-light",
      minRatio: 3,
      label: "border-light vs bg-primary (interactive border)",
    },
    {
      varName: "--border-hover",
      minRatio: 3,
      label: "border-hover vs bg-primary (interactive border)",
    },
  ];

  it("dark background is defined and parseable", () => {
    expect(bgHex).not.toBeNull();
    expect(bgRgb).not.toBeNull();
  });

  it("all dark theme color pairs meet WCAG contrast minimums", () => {
    fc.assert(
      fc.property(fc.constantFrom(...colorPairs), (pair) => {
        const rawValue = getDarkVar(pair.varName);
        expect(rawValue).not.toBeNull();

        const fgRgb = resolveToRgb(rawValue, bgRgb);
        expect(fgRgb).not.toBeNull();

        const ratio = contrastRatio(fgRgb, bgRgb);
        expect(ratio).toBeGreaterThanOrEqual(pair.minRatio);
      }),
      { numRuns: 100 },
    );
  });
});
