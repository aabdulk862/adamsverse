// Bugfix: learn-navbar-fix, Property 1 (exploration): Overlay gap, mobile padding, overlay CTA typography
// **Validates: Requirements 2.3, 2.4, 2.5**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import fs from "fs";
import path from "path";

const cssContent = fs.readFileSync(
  path.resolve(__dirname, "../../public/guide-system.css"),
  "utf-8",
);

/**
 * Extract the content of the @media (max-width: 600px) block.
 * Handles nested braces by counting open/close braces.
 */
function extractMobileMediaBlock(css) {
  const marker = "@media (max-width: 600px)";
  const idx = css.indexOf(marker);
  if (idx === -1) return null;

  const openBrace = css.indexOf("{", idx);
  if (openBrace === -1) return null;

  let depth = 1;
  let i = openBrace + 1;
  while (i < css.length && depth > 0) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") depth--;
    i++;
  }
  return css.slice(openBrace + 1, i - 1);
}

/**
 * Extract declarations for a given selector within a CSS block.
 */
function extractDeclarations(cssBlock, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped + "\\s*\\{([^}]*)\\}", "s");
  const match = cssBlock.match(regex);
  if (!match) return {};

  const declarations = {};
  const lines = match[1].split(";").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const prop = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();
    declarations[prop] = val;
  }
  return declarations;
}

describe("[Exploration] Property 1: Overlay gap, mobile padding, and CTA typography", () => {
  it(".site-navbar-overlay has gap: 8px", () => {
    const declarations = extractDeclarations(cssContent, ".site-navbar-overlay");

    fc.assert(
      fc.property(
        fc.constantFrom({ property: "gap", value: "8px" }),
        ({ property, value }) => {
          expect(declarations).toHaveProperty(property);
          expect(declarations[property]).toBe(value);
        },
      ),
      { numRuns: 100 },
    );
  });

  it(".site-navbar-inner in mobile media query has padding: 12px 16px", () => {
    const mobileBlock = extractMobileMediaBlock(cssContent);
    expect(mobileBlock).not.toBeNull();

    const declarations = extractDeclarations(mobileBlock, ".site-navbar-inner");

    fc.assert(
      fc.property(
        fc.constantFrom({ property: "padding", value: "12px 16px" }),
        ({ property, value }) => {
          expect(declarations).toHaveProperty(property);
          expect(declarations[property]).toBe(value);
        },
      ),
      { numRuns: 100 },
    );
  });

  it(".site-navbar-overlay .site-navbar-cta has font-size: 0.875rem and font-weight: 600", () => {
    const declarations = extractDeclarations(
      cssContent,
      ".site-navbar-overlay .site-navbar-cta",
    );

    fc.assert(
      fc.property(
        fc.constantFrom(
          { property: "font-size", value: "0.875rem" },
          { property: "font-weight", value: "600" },
        ),
        ({ property, value }) => {
          expect(declarations).toHaveProperty(property);
          expect(declarations[property]).toBe(value);
        },
      ),
      { numRuns: 100 },
    );
  });
});
