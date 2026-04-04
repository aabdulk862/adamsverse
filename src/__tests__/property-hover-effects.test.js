// Feature: saas-platform-revamp, Property 10: Hover effects are subtle — no excessive scale transforms
// **Validates: Requirements 5.3, 12.2, 12.3**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import fs from "fs";
import path from "path";

const cssContent = fs.readFileSync(
  path.resolve(__dirname, "../styles.css"),
  "utf-8",
);

/**
 * Extract all hover rule blocks from CSS.
 * Returns an array of { selector, body } objects.
 */
function extractHoverRules(css) {
  const rules = [];
  const regex = /([^{}]*:hover[^{}]*)\{([^}]*)\}/gi;
  let match;
  while ((match = regex.exec(css)) !== null) {
    rules.push({
      selector: match[1].trim(),
      body: match[2].trim(),
    });
  }
  return rules;
}

describe("Property 10: Hover effects are subtle — no excessive scale transforms", () => {
  const hoverRules = extractHoverRules(cssContent);

  it("no hover rule includes scale() > 1.05", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          ...(hoverRules.length > 0
            ? hoverRules
            : [{ selector: "none", body: "" }]),
        ),
        (rule) => {
          if (rule.selector === "none") return;
          // Match scale(value) patterns
          const scaleMatches = rule.body.match(/scale\(\s*([\d.]+)\s*\)/gi);
          if (scaleMatches) {
            scaleMatches.forEach((scaleStr) => {
              const valueMatch = scaleStr.match(/scale\(\s*([\d.]+)\s*\)/i);
              if (valueMatch) {
                const scaleValue = parseFloat(valueMatch[1]);
                expect(scaleValue).toBeLessThanOrEqual(1.05);
              }
            });
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("translateY shifts in hover rules are at most 4px", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          ...(hoverRules.length > 0
            ? hoverRules
            : [{ selector: "none", body: "" }]),
        ),
        (rule) => {
          if (rule.selector === "none") return;
          // Match translateY(-Npx) or translateY(Npx) patterns
          const translateMatches = rule.body.match(
            /translateY\(\s*-?([\d.]+)px\s*\)/gi,
          );
          if (translateMatches) {
            translateMatches.forEach((translateStr) => {
              const valueMatch = translateStr.match(
                /translateY\(\s*-?([\d.]+)px\s*\)/i,
              );
              if (valueMatch) {
                const pxValue = parseFloat(valueMatch[1]);
                expect(pxValue).toBeLessThanOrEqual(4);
              }
            });
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
