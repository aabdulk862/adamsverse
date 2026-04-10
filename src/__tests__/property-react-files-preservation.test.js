// Bugfix: learn-navbar-fix, Property 2 (preservation): React app files unchanged
// **Validates: Requirements 3.2**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";

/**
 * Compute SHA-256 hex digest of a file's contents.
 */
function sha256(filePath) {
  const content = fs.readFileSync(filePath);
  return createHash("sha256").update(content).digest("hex");
}

const STYLES_PATH = path.resolve(__dirname, "../styles.css");
const NAVBAR_PATH = path.resolve(__dirname, "../components/Navbar.jsx");

const stylesContent = fs.readFileSync(STYLES_PATH, "utf-8");
const navbarContent = fs.readFileSync(NAVBAR_PATH, "utf-8");

// Expected hashes computed from the unmodified React app files.
const EXPECTED_STYLES_HASH =
  "8ad28f1bb5bb1c1d25e21d60ba6e7b43f47d3ab1b07fcc045221f38ce3cc4b5b";
const EXPECTED_NAVBAR_HASH =
  "bba0f484c81e5688ce1b212e6115d60f1b39b55188dedc88c7fc32d5f35d3173";

// Key content markers that must exist in each file
const STYLES_MARKERS = [
  { name: ".navbar selector", pattern: ".navbar {" },
  { name: ".navbar-inner selector", pattern: ".navbar-inner {" },
  { name: ".navbar-links selector", pattern: ".navbar-links {" },
  { name: ".navbar-hamburger selector", pattern: ".navbar-hamburger {" },
  { name: ".navbar-overlay selector", pattern: ".navbar-overlay {" },
  { name: ".navbar-cta selector", pattern: ".navbar-cta" },
  { name: "CSS variables section", pattern: ":root {" },
  { name: "hero section styles", pattern: ".hero {" },
  { name: "card styles", pattern: ".card {" },
  { name: "footer styles", pattern: ".footer {" },
];

const NAVBAR_MARKERS = [
  { name: "default export", pattern: "export default function Navbar()" },
  { name: "useState hook", pattern: "useState(false)" },
  { name: "navbar className", pattern: "className={`navbar${" },
  { name: "navbar-inner className", pattern: 'className="navbar-inner"' },
  { name: "navbar-hamburger className", pattern: 'className="navbar-hamburger"' },
  { name: "navbar-overlay className", pattern: 'className="navbar-overlay"' },
  { name: "navbar-cta className", pattern: 'className="navbar-cta"' },
  { name: "Link import", pattern: 'import { Link } from "react-router-dom"' },
  { name: "logo import", pattern: 'import logo from "../assets/images/logo5.png"' },
  { name: "PAGE_LINKS constant", pattern: "const PAGE_LINKS" },
];

describe("[Preservation] Property 2: React app files are not modified", () => {
  it("src/styles.css content is unchanged (SHA-256 matches)", () => {
    const actual = sha256(STYLES_PATH);
    expect(actual).toBe(EXPECTED_STYLES_HASH);
  });

  it("src/components/Navbar.jsx content is unchanged (SHA-256 matches)", () => {
    const actual = sha256(NAVBAR_PATH);
    expect(actual).toBe(EXPECTED_NAVBAR_HASH);
  });

  it("src/styles.css contains all expected CSS selectors and sections", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...STYLES_MARKERS),
        ({ name, pattern }) => {
          expect(
            stylesContent.includes(pattern),
            `styles.css should contain ${name}: "${pattern}"`,
          ).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("src/components/Navbar.jsx contains all expected component content", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...NAVBAR_MARKERS),
        ({ name, pattern }) => {
          expect(
            navbarContent.includes(pattern),
            `Navbar.jsx should contain ${name}: "${pattern}"`,
          ).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
