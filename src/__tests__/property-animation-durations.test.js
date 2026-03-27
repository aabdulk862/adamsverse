// Feature: saas-platform-revamp, Property 11: Animation durations respect platform limits
// **Validates: Requirements 12.1**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import fs from "fs";
import path from "path";

const animatedSectionSource = fs.readFileSync(
  path.resolve(__dirname, "../components/AnimatedSection.jsx"),
  "utf-8",
);

const profileHeaderSource = fs.readFileSync(
  path.resolve(__dirname, "../components/ProfileHeader.jsx"),
  "utf-8",
);

/**
 * Extract duration assignments from component source code.
 * Looks for patterns like: duration = isMobile ? X : Y
 * or const dur = isMobile ? X : Y
 * or duration: dur, duration, etc.
 */
function extractDurations(source) {
  const results = { desktop: null, mobile: null };

  // Pattern: isMobile ? mobile : desktop
  const ternaryMatch = source.match(
    /(?:duration|dur)\s*=\s*isMobile\s*\?\s*([\d.]+)\s*:\s*([\d.]+)/,
  );
  if (ternaryMatch) {
    results.mobile = parseFloat(ternaryMatch[1]);
    results.desktop = parseFloat(ternaryMatch[2]);
  }

  return results;
}

describe("Property 11: Animation durations respect platform limits", () => {
  const components = [
    { name: "AnimatedSection", source: animatedSectionSource },
    { name: "ProfileHeader", source: profileHeaderSource },
  ];

  it("desktop animation duration is at most 0.5s and mobile is at most 0.3s", () => {
    fc.assert(
      fc.property(fc.constantFrom(...components), (component) => {
        const durations = extractDurations(component.source);

        if (durations.desktop !== null) {
          expect(durations.desktop).toBeLessThanOrEqual(0.5);
        }
        if (durations.mobile !== null) {
          expect(durations.mobile).toBeLessThanOrEqual(0.3);
        }
      }),
      { numRuns: 100 },
    );
  });
});
