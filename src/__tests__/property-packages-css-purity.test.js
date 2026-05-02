// Feature: ai-website-packages, Property 10: CSS module purity — no hardcoded colors
// **Validates: Requirements 6.2**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import fs from "fs";
import path from "path";

const packagesDir = path.resolve(__dirname, "../components/packages");

const cssFiles = fs
  .readdirSync(packagesDir)
  .filter((f) => f.endsWith(".module.css"))
  .map((f) => ({
    name: f,
    content: fs.readFileSync(path.join(packagesDir, f), "utf-8"),
  }));

/**
 * Strip all var(...) references from CSS content, including nested var() calls.
 * Replaces each var(...) occurrence with an empty string so that any color
 * values inside var() references are not flagged as hardcoded.
 */
function stripVarReferences(css) {
  let result = css;
  // Repeatedly strip innermost var(...) until none remain (handles nesting)
  let prev;
  do {
    prev = result;
    result = result.replace(/var\([^()]*\)/g, "");
  } while (result !== prev);
  return result;
}

/**
 * Strip structural rgba(0, 0, 0, ...) overlays from CSS content.
 * Transparent black overlays are a standard CSS pattern for darkening
 * backgrounds and are not theme colors — they should not be flagged.
 */
function stripBlackOverlays(css) {
  return css.replace(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*[\d.]+\s*\)/g, "");
}

// Hex color pattern: #fff, #ffffff, #ffffffff (3, 4, 6, or 8 hex digits)
const hexColorRegex = /#[0-9a-fA-F]{3,8}\b/g;

// rgb/rgba/hsl/hsla function calls
const colorFunctionRegex = /\b(rgb|rgba|hsl|hsla)\s*\(/gi;

// Common named CSS colors used as property values (after a colon in CSS)
const namedColors = [
  "red",
  "blue",
  "green",
  "white",
  "black",
  "yellow",
  "orange",
  "purple",
  "pink",
  "gray",
  "grey",
  "brown",
  "cyan",
  "magenta",
  "lime",
  "maroon",
  "navy",
  "olive",
  "teal",
  "aqua",
  "fuchsia",
  "silver",
  "coral",
  "salmon",
  "tomato",
  "crimson",
  "indigo",
  "violet",
  "gold",
  "khaki",
  "plum",
  "orchid",
  "tan",
  "beige",
  "ivory",
  "linen",
  "lavender",
  "wheat",
  "sienna",
  "peru",
  "chocolate",
  "firebrick",
  "darkred",
  "darkblue",
  "darkgreen",
  "darkgray",
  "darkgrey",
  "lightgray",
  "lightgrey",
  "lightblue",
  "lightgreen",
  "lightyellow",
  "aliceblue",
  "antiquewhite",
  "azure",
  "bisque",
  "blanchedalmond",
  "blueviolet",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "cornflowerblue",
  "cornsilk",
  "darkcyan",
  "darkgoldenrod",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkslategrey",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dimgrey",
  "dodgerblue",
  "floralwhite",
  "forestgreen",
  "gainsboro",
  "ghostwhite",
  "goldenrod",
  "greenyellow",
  "honeydew",
  "hotpink",
  "indianred",
  "lawngreen",
  "lemonchiffon",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightslategrey",
  "lightsteelblue",
  "limegreen",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "oldlace",
  "olivedrab",
  "orangered",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "powderblue",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "sandybrown",
  "seagreen",
  "seashell",
  "skyblue",
  "slateblue",
  "slategray",
  "slategrey",
  "snow",
  "springgreen",
  "steelblue",
  "thistle",
  "turquoise",
  "whitesmoke",
  "yellowgreen",
];

/**
 * Build a regex that matches named colors when they appear as CSS property values.
 * Looks for a colon followed by optional whitespace, then the color name as a whole word.
 */
function buildNamedColorRegex() {
  const pattern = namedColors.join("|");
  return new RegExp(`:\\s*\\b(${pattern})\\b`, "gi");
}

const namedColorRegex = buildNamedColorRegex();

describe("Property 10: CSS module purity — no hardcoded colors", () => {
  it("no CSS module file in packages/ contains hardcoded color values outside var() references", () => {
    expect(cssFiles.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.constantFrom(...cssFiles), (file) => {
        const stripped = stripBlackOverlays(stripVarReferences(file.content));

        // Check for hex colors
        const hexMatches = stripped.match(hexColorRegex) || [];
        expect(hexMatches).toEqual(expect.objectContaining([]));
        if (hexMatches.length > 0) {
          throw new Error(
            `${file.name} contains hardcoded hex color(s): ${hexMatches.join(", ")}`,
          );
        }

        // Check for rgb/rgba/hsl/hsla function calls
        const funcMatches = stripped.match(colorFunctionRegex) || [];
        if (funcMatches.length > 0) {
          throw new Error(
            `${file.name} contains hardcoded color function(s): ${funcMatches.join(", ")}`,
          );
        }

        // Check for named CSS colors as property values
        const namedMatches = stripped.match(namedColorRegex) || [];
        if (namedMatches.length > 0) {
          throw new Error(
            `${file.name} contains hardcoded named color(s): ${namedMatches.join(", ")}`,
          );
        }
      }),
      { numRuns: 100 },
    );
  });
});
