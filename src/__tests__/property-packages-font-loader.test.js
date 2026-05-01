// Feature: ai-website-packages, Property 12: Font loader injects correct Google Fonts links
// Feature: ai-website-packages, Property 13: Font loader idempotence
// **Validates: Requirements 7.1, 7.2, 7.3**

import { describe, it, expect, afterEach } from "vitest";
import fc from "fast-check";
import loadFonts, { _resetLoadedFonts } from "../utils/fontLoader";

// --- Helpers ---

/** Remove all <link> tags injected by the font loader from document.head */
function cleanupFontLinks() {
  document
    .querySelectorAll("link[data-package-font]")
    .forEach((el) => el.remove());
}

/** Generate a simple alphanumeric font family name (1-3 words) */
const fontFamilyArb = () =>
  fc
    .array(
      fc.stringMatching(/^[A-Za-z][A-Za-z0-9]{1,10}$/),
      { minLength: 1, maxLength: 3 },
    )
    .map((parts) => parts.join(" "));

/** Generate a valid CSS font weight string */
const weightArb = () =>
  fc.constantFrom("100", "200", "300", "400", "500", "600", "700", "800", "900");

/** Generate a theme object with random typography values */
const themeArb = () =>
  fc.record({
    typography: fc.record({
      fontDisplay: fontFamilyArb(),
      fontBody: fontFamilyArb(),
      weightLight: weightArb(),
      weightRegular: weightArb(),
      weightMedium: weightArb(),
      weightBold: weightArb(),
      trackingDisplay: fc.constant("0.02em"),
      trackingBody: fc.constant("0.01em"),
    }),
  });

// --- Tests ---

describe("Property 12: Font loader injects correct Google Fonts links", () => {
  afterEach(() => {
    cleanupFontLinks();
    _resetLoadedFonts();
  });

  it("injects link tags with correct font family names in the URL", () => {
    fc.assert(
      fc.property(themeArb(), (theme) => {
        cleanupFontLinks();
        _resetLoadedFonts();

        loadFonts(theme);

        const { fontDisplay, fontBody } = theme.typography;
        const links = document.querySelectorAll("link[data-package-font]");

        // Determine expected unique font families
        const uniqueFonts = new Set([fontDisplay, fontBody]);

        expect(links.length).toBe(uniqueFonts.size);

        // Each unique font should have a link tag with the correct data attribute
        for (const family of uniqueFonts) {
          const link = document.querySelector(
            `link[data-package-font="${family}"]`,
          );
          expect(link).not.toBeNull();

          // The href should contain the font family name with spaces replaced by +
          const encodedFamily = family.replace(/ /g, "+");
          expect(link.href).toContain(
            `https://fonts.googleapis.com/css2?family=${encodedFamily}`,
          );
        }
      }),
      { numRuns: 100 },
    );
  });

  it("injects link tags with correct font weights in the URL", () => {
    fc.assert(
      fc.property(themeArb(), (theme) => {
        cleanupFontLinks();
        _resetLoadedFonts();

        loadFonts(theme);

        const { fontDisplay, fontBody, weightLight, weightRegular, weightMedium, weightBold } =
          theme.typography;
        const expectedWeights = [weightLight, weightRegular, weightMedium, weightBold]
          .filter(Boolean)
          .join(";");

        const uniqueFonts = new Set([fontDisplay, fontBody]);

        for (const family of uniqueFonts) {
          const link = document.querySelector(
            `link[data-package-font="${family}"]`,
          );
          expect(link).not.toBeNull();
          expect(link.href).toContain(`wght@${expectedWeights}`);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("sets rel=stylesheet and display=swap on injected link tags", () => {
    fc.assert(
      fc.property(themeArb(), (theme) => {
        cleanupFontLinks();
        _resetLoadedFonts();

        loadFonts(theme);

        const links = document.querySelectorAll("link[data-package-font]");
        for (const link of links) {
          expect(link.rel).toBe("stylesheet");
          expect(link.href).toContain("display=swap");
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe("Property 13: Font loader idempotence", () => {
  afterEach(() => {
    cleanupFontLinks();
    _resetLoadedFonts();
  });

  it("calling loadFonts N times with the same theme produces no duplicate link tags", () => {
    fc.assert(
      fc.property(
        themeArb(),
        fc.integer({ min: 1, max: 5 }),
        (theme, repeatCount) => {
          cleanupFontLinks();
          _resetLoadedFonts();

          // Call once and record the count
          loadFonts(theme);
          const countAfterFirst = document.querySelectorAll(
            "link[data-package-font]",
          ).length;

          // Call N-1 more times
          for (let i = 1; i < repeatCount; i++) {
            loadFonts(theme);
          }

          const countAfterN = document.querySelectorAll(
            "link[data-package-font]",
          ).length;

          // The count should not increase after repeated calls
          expect(countAfterN).toBe(countAfterFirst);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("the number of link tags equals the number of unique font families (max 2)", () => {
    fc.assert(
      fc.property(
        themeArb(),
        fc.integer({ min: 1, max: 5 }),
        (theme, repeatCount) => {
          cleanupFontLinks();
          _resetLoadedFonts();

          const { fontDisplay, fontBody } = theme.typography;
          const expectedCount = fontDisplay === fontBody ? 1 : 2;

          for (let i = 0; i < repeatCount; i++) {
            loadFonts(theme);
          }

          const linkCount = document.querySelectorAll(
            "link[data-package-font]",
          ).length;
          expect(linkCount).toBe(expectedCount);
        },
      ),
      { numRuns: 100 },
    );
  });
});
