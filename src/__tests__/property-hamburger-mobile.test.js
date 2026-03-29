// Bugfix: learn-navbar-fix, Property 1 (exploration): Hamburger button mobile styling
// **Validates: Requirements 2.1**

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

describe("[Exploration] Property 1: Hamburger button has correct mobile styling", () => {
  const mobileBlock = extractMobileMediaBlock(cssContent);

  const expectedProperties = [
    { property: "display", value: "flex" },
    { property: "align-items", value: "center" },
    { property: "justify-content", value: "center" },
    { property: "min-width", value: "44px" },
    { property: "min-height", value: "44px" },
  ];

  it("mobile media query exists", () => {
    expect(mobileBlock).not.toBeNull();
  });

  it(".site-navbar-hamburger in mobile media query has display:flex, centering, and 44x44 touch target", () => {
    const declarations = extractDeclarations(mobileBlock, ".site-navbar-hamburger");

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
});
