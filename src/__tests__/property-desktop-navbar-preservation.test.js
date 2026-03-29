// Bugfix: learn-navbar-fix, Property 2 (preservation): Desktop navbar rules unchanged
// **Validates: Requirements 3.1, 3.4**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import fs from "fs";
import path from "path";

const cssContent = fs.readFileSync(
  path.resolve(__dirname, "../../public/guide-system.css"),
  "utf-8",
);

/**
 * Extract declarations for a given selector within a CSS block.
 * Uses a regex that matches the selector followed by { ... }.
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

describe("[Preservation] Property 2: Desktop navbar rules are unchanged", () => {
  it(".site-navbar has expected desktop properties (position, background, z-index, border)", () => {
    const declarations = extractDeclarations(cssContent, ".site-navbar");

    const expectedProperties = [
      { property: "position", value: "fixed" },
      { property: "top", value: "0" },
      { property: "left", value: "0" },
      { property: "right", value: "0" },
      { property: "z-index", value: "10000" },
      { property: "background", value: "#ffffff" },
      { property: "border-bottom", value: "1px solid #e5e7eb" },
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...expectedProperties),
        ({ property, value }) => {
          expect(declarations).toHaveProperty(property);
          expect(declarations[property]).toBe(value);
        },
      ),
      { numRuns: 100 },
    );
  });

  it(".site-navbar-brand has expected properties (flex layout, typography)", () => {
    const declarations = extractDeclarations(cssContent, ".site-navbar-brand");

    const expectedProperties = [
      { property: "display", value: "flex" },
      { property: "align-items", value: "center" },
      { property: "gap", value: "8px" },
      { property: "text-decoration", value: "none" },
      { property: "font-weight", value: "700" },
      { property: "font-size", value: "1.1rem" },
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...expectedProperties),
        ({ property, value }) => {
          expect(declarations).toHaveProperty(property);
          expect(declarations[property]).toBe(value);
        },
      ),
      { numRuns: 100 },
    );
  });

  it(".site-navbar-links has expected desktop properties (display: flex, gap)", () => {
    const declarations = extractDeclarations(cssContent, ".site-navbar-links");

    const expectedProperties = [
      { property: "display", value: "flex" },
      { property: "align-items", value: "center" },
      { property: "list-style", value: "none" },
      { property: "gap", value: "16px" },
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...expectedProperties),
        ({ property, value }) => {
          expect(declarations).toHaveProperty(property);
          expect(declarations[property]).toBe(value);
        },
      ),
      { numRuns: 100 },
    );
  });

  it(".site-navbar-cta base styling is unchanged (padding, border-radius, background, color)", () => {
    const declarations = extractDeclarations(cssContent, ".site-navbar-cta");

    const expectedProperties = [
      { property: "padding", value: "8px 16px" },
      { property: "border-radius", value: "999px" },
      { property: "background", value: "#0066ff" },
      { property: "color", value: "#fff !important" },
      { property: "font-size", value: "0.875rem" },
      { property: "font-weight", value: "600" },
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...expectedProperties),
        ({ property, value }) => {
          expect(declarations).toHaveProperty(property);
          expect(declarations[property]).toBe(value);
        },
      ),
      { numRuns: 100 },
    );
  });

  it(".site-navbar-overlay.open still has display: flex", () => {
    const declarations = extractDeclarations(cssContent, ".site-navbar-overlay.open");

    fc.assert(
      fc.property(
        fc.constantFrom({ property: "display", value: "flex" }),
        ({ property, value }) => {
          expect(declarations).toHaveProperty(property);
          expect(declarations[property]).toBe(value);
        },
      ),
      { numRuns: 100 },
    );
  });
});
