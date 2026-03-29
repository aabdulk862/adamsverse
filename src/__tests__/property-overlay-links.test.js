// Bugfix: learn-navbar-fix, Property 1 (exploration): Overlay link styling
// **Validates: Requirements 2.2**

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

describe("[Exploration] Property 1: Overlay links have correct styling", () => {
  it(".site-navbar-overlay a has border-radius: 12px", () => {
    const declarations = extractDeclarations(cssContent, ".site-navbar-overlay a");

    fc.assert(
      fc.property(
        fc.constantFrom({ property: "border-radius", value: "12px" }),
        ({ property, value }) => {
          expect(declarations).toHaveProperty(property);
          expect(declarations[property]).toBe(value);
        },
      ),
      { numRuns: 100 },
    );
  });

  it(".site-navbar-overlay a:hover has background: #f8f9fa", () => {
    const declarations = extractDeclarations(cssContent, ".site-navbar-overlay a:hover");

    fc.assert(
      fc.property(
        fc.constantFrom({ property: "background", value: "#f8f9fa" }),
        ({ property, value }) => {
          expect(declarations).toHaveProperty(property);
          expect(declarations[property]).toBe(value);
        },
      ),
      { numRuns: 100 },
    );
  });
});
