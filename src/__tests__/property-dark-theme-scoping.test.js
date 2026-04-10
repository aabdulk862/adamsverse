// Feature: dark-mode-toggle, Property 5: Dark theme overrides are scoped exclusively
// **Validates: Requirements 6.2, 6.3**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import fs from "fs";
import path from "path";

const cssContent = fs.readFileSync(
  path.resolve(__dirname, "../styles.css"),
  "utf-8",
);

/**
 * Extract the :root { ... } block content from the CSS.
 * Uses brace counting to handle nested content correctly.
 */
function extractRootBlock(css) {
  const startIdx = css.indexOf(":root");
  if (startIdx === -1) return "";
  const braceStart = css.indexOf("{", startIdx);
  if (braceStart === -1) return "";
  let depth = 1;
  let i = braceStart + 1;
  while (i < css.length && depth > 0) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") depth--;
    i++;
  }
  return css.substring(braceStart + 1, i - 1);
}

/**
 * Extract the [data-theme="dark"] { ... } block content from the CSS.
 */
function extractDarkBlock(css) {
  const regex = /\[data-theme=["']dark["']\]\s*\{/;
  const match = css.match(regex);
  if (!match) return "";
  const braceStart = css.indexOf("{", match.index);
  if (braceStart === -1) return "";
  let depth = 1;
  let i = braceStart + 1;
  while (i < css.length && depth > 0) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") depth--;
    i++;
  }
  return css.substring(braceStart + 1, i - 1);
}

// Dark theme hex colors that must only appear inside [data-theme="dark"] selectors
const darkThemeHexColors = [
  "#0b0f19",
  "#111827",
  "#1e293b",
  "#1a2744",
];

// Light theme values that must remain in :root
const lightThemeValues = [
  { prop: "--bg-primary", value: "#ffffff" },
  { prop: "--bg-secondary", value: "#f8fafc" },
  { prop: "--bg-tertiary", value: "#f1f5f9" },
  { prop: "--text-primary", value: "#0f172a" },
  { prop: "--accent-primary", value: "#2563eb" },
  { prop: "--card-bg", value: "#ffffff" },
  { prop: "--navbar-bg", value: "#ffffff" },
  { prop: "--border-light", value: "#e2e8f0" },
];

// Old banned dark colors that must not appear anywhere
const bannedDarkColors = ["#101830", "#1e2d50"];

const rootBlock = extractRootBlock(cssContent);
const darkBlock = extractDarkBlock(cssContent);

describe("Property 5: Dark theme overrides are scoped exclusively", () => {
  it(":root block does NOT contain any dark theme hex colors", () => {
    fc.assert(
      fc.property(fc.constantFrom(...darkThemeHexColors), (darkColor) => {
        const lowerRoot = rootBlock.toLowerCase();
        const lowerColor = darkColor.toLowerCase();
        expect(lowerRoot).not.toContain(lowerColor);
      }),
      { numRuns: 100 },
    );
  });

  it("dark theme hex colors only appear within [data-theme=\"dark\"] selectors", () => {
    // Strip all [data-theme="dark"] blocks from the CSS, then verify
    // none of the dark-only hex colors remain
    const cssWithoutDarkBlocks = cssContent.replace(
      /\[data-theme=["']dark["']\][^{]*\{[^}]*\}/g,
      "",
    );

    fc.assert(
      fc.property(fc.constantFrom(...darkThemeHexColors), (darkColor) => {
        const lowerCss = cssWithoutDarkBlocks.toLowerCase();
        const lowerColor = darkColor.toLowerCase();
        expect(lowerCss).not.toContain(lowerColor);
      }),
      { numRuns: 100 },
    );
  });

  it(":root block still contains the original light theme values", () => {
    fc.assert(
      fc.property(fc.constantFrom(...lightThemeValues), ({ prop, value }) => {
        // Build a regex that matches the property declaration with the expected value
        const escaped = prop.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
        const regex = new RegExp(`${escaped}:\\s*${value.replace(/[()]/g, "\\$&")}`, "i");
        expect(rootBlock).toMatch(regex);
      }),
      { numRuns: 100 },
    );
  });

  it("old banned dark colors do not appear anywhere in the CSS", () => {
    fc.assert(
      fc.property(fc.constantFrom(...bannedDarkColors), (bannedColor) => {
        const lowerCss = cssContent.toLowerCase();
        const lowerColor = bannedColor.toLowerCase();
        expect(lowerCss).not.toContain(lowerColor);
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: dark-mode-toggle, Property 7: Dark theme overrides all color-related custom properties
// **Validates: Requirements 2.1**

/**
 * Extract all custom property declarations from a CSS block.
 * Returns an array of { name, value } objects.
 */
function extractCustomProperties(blockContent) {
  const props = [];
  const regex = /--([\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(blockContent)) !== null) {
    props.push({ name: `--${match[1]}`, value: match[2].trim() });
  }
  return props;
}

/**
 * Determine if a custom property value is color-related.
 * Returns true for hex colors (#...) and rgba(...) values.
 */
function isColorValue(value) {
  return /^#[0-9a-fA-F]{3,8}$/.test(value) || /^rgba?\(/.test(value);
}

// Properties that are intentionally not overridden in dark theme:
// - Status colors (success/error) remain the same across themes
// - --accent-border-heavy is not in the design doc's dark override list
// - --accent-dark-bg variants are light-theme-specific accent helpers
const INTENTIONALLY_NOT_OVERRIDDEN = new Set([
  "--success-color",
  "--error-color",
  "--accent-border-heavy",
  "--accent-dark-bg",
  "--accent-dark-bg-strong",
]);

// Shadow properties that contain colors and are explicitly overridden per design doc
const SHADOW_PROPERTIES = new Set([
  "--shadow-sm",
  "--shadow-md",
  "--shadow-lg",
  "--card-shadow",
  "--card-shadow-hover",
]);

// Collect color-related :root properties that should have dark overrides
const rootProps = extractCustomProperties(rootBlock);
const darkProps = extractCustomProperties(darkBlock);
const darkPropNames = new Set(darkProps.map((p) => p.name));

const colorPropsRequiringDarkOverride = rootProps.filter((p) => {
  if (INTENTIONALLY_NOT_OVERRIDDEN.has(p.name)) return false;
  if (SHADOW_PROPERTIES.has(p.name)) return true;
  return isColorValue(p.value);
});

describe("Property 7: Dark theme overrides all color-related custom properties", () => {
  it("every color-related :root custom property has a corresponding dark override", () => {
    // Sanity check: we should have found a meaningful number of color properties
    expect(colorPropsRequiringDarkOverride.length).toBeGreaterThan(10);

    fc.assert(
      fc.property(
        fc.constantFrom(...colorPropsRequiringDarkOverride),
        (rootProp) => {
          expect(
            darkPropNames.has(rootProp.name),
            `Missing dark override for ${rootProp.name} (light value: ${rootProp.value})`,
          ).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("dark block does not contain properties absent from :root", () => {
    const rootPropNames = new Set(rootProps.map((p) => p.name));

    fc.assert(
      fc.property(fc.constantFrom(...darkProps), (darkProp) => {
        expect(
          rootPropNames.has(darkProp.name),
          `Dark override ${darkProp.name} has no corresponding :root definition`,
        ).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
