// Feature: saas-platform-revamp, Property 3: All cards use solid backgrounds without glassmorphism
// **Validates: Requirements 1.4, 6.3**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import fs from "fs";
import path from "path";

const cssContent = fs.readFileSync(
  path.resolve(__dirname, "../styles.css"),
  "utf-8",
);

/**
 * Extract all CSS rule blocks for card-related selectors.
 * Returns an array of { selector, body } objects.
 */
function extractCardRules(css) {
  const rules = [];
  // Match selectors containing "card" (case-insensitive) followed by their rule body
  const regex = /([^{}]*card[^{}]*)\{([^}]*)\}/gi;
  let match;
  while ((match = regex.exec(css)) !== null) {
    rules.push({
      selector: match[1].trim(),
      body: match[2].trim(),
    });
  }
  return rules;
}

describe("Property 3: All cards use solid backgrounds", () => {
  const cardRules = extractCardRules(cssContent);

  it("no card-related selectors use backdrop-filter", () => {
    // Filter to only rules that define background-related properties
    fc.assert(
      fc.property(
        fc.constantFrom(
          ...(cardRules.length > 0
            ? cardRules
            : [{ selector: "none", body: "" }]),
        ),
        (rule) => {
          if (rule.selector === "none") return; // skip if no card rules
          expect(rule.body).not.toMatch(/backdrop-filter/i);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("card background colors have alpha=1.0 (no translucent rgba backgrounds)", () => {
    // Check that card rules with background properties don't use rgba with alpha < 1
    const cardRulesWithBg = cardRules.filter(
      (r) => r.body.match(/background\s*:/) && !r.selector.includes(":hover"),
    );

    fc.assert(
      fc.property(
        fc.constantFrom(
          ...(cardRulesWithBg.length > 0
            ? cardRulesWithBg
            : [{ selector: "none", body: "" }]),
        ),
        (rule) => {
          if (rule.selector === "none") return;
          // Check for rgba with alpha < 1 used as background (not in gradients to other colors)
          const rgbaMatches = rule.body.match(
            /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/g,
          );
          if (rgbaMatches) {
            rgbaMatches.forEach((rgba) => {
              const alphaMatch = rgba.match(/,\s*([\d.]+)\s*\)/);
              if (alphaMatch) {
                const alpha = parseFloat(alphaMatch[1]);
                // If this is a background property (not shadow), alpha should be 1.0
                // We only flag if the rgba is used directly as background value
                const isBgProperty = rule.body.match(
                  new RegExp(
                    `background\\s*:\\s*[^;]*${rgba.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
                  ),
                );
                if (isBgProperty) {
                  expect(alpha).toBe(1.0);
                }
              }
            });
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
