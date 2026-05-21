// Feature: adverse-webuilder, Property 6: Section rendering order matches configuration
// Feature: adverse-webuilder, Property 7: Unknown section types handled gracefully
// Feature: adverse-webuilder, Property 15: Compositional correctness
// Feature: adverse-webuilder, Property 18: Slug resolution preserves routing
// **Validates: Requirements 3.1, 3.2, 3.4, 9.5, 11.5**

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import fc from "fast-check";
import { render } from "@testing-library/react";
import SectionRenderer from "../components/packages/SectionRenderer";
import packages from "../data/packages";
import themes from "../data/themes";

// Mock IntersectionObserver for scroll animation hooks
beforeAll(() => {
  global.IntersectionObserver = class {
    constructor(callback) {
      this._callback = callback;
    }
    observe() {
      this._callback([{ isIntersecting: true, intersectionRatio: 1 }]);
    }
    unobserve() {}
    disconnect() {}
  };
});

afterAll(() => {
  delete global.IntersectionObserver;
});

// --- Constants ---
const KNOWN_SECTION_TYPES = ["hero", "services", "gallery", "testimonials", "cta", "contact"];
const NUM_RUNS = 25;

// --- Generators ---

/** Safe string for content fields */
const safeString = () => fc.stringMatching(/^[A-Za-z][A-Za-z0-9 ]{0,20}$/);

/** Generate a valid hero section content */
const heroContentArb = () =>
  fc.record({
    headline: safeString(),
    subheadline: safeString(),
    ctaText: safeString(),
    heroImage: fc.constant("https://images.unsplash.com/photo-test"),
  });

/** Generate a valid services section content */
const servicesContentArb = () =>
  fc.record({
    heading: safeString(),
    items: fc.array(
      fc.record({
        title: safeString(),
        description: safeString(),
        icon: fc.constant("🔧"),
      }),
      { minLength: 1, maxLength: 3 }
    ),
  });

/** Generate a valid gallery section content */
const galleryContentArb = () =>
  fc.record({
    heading: safeString(),
    images: fc.array(
      fc.record({
        src: fc.constant("https://images.unsplash.com/photo-gallery"),
        alt: safeString(),
      }),
      { minLength: 1, maxLength: 3 }
    ),
  });

/** Generate a valid testimonials section content */
const testimonialsContentArb = () =>
  fc.record({
    heading: safeString(),
    items: fc.array(
      fc.record({
        quote: safeString(),
        author: safeString(),
        role: safeString(),
      }),
      { minLength: 1, maxLength: 3 }
    ),
  });

/** Generate a valid CTA section content */
const ctaContentArb = () =>
  fc.record({
    heading: safeString(),
    body: safeString(),
    buttonText: safeString(),
  });

/** Generate a valid contact section content */
const contactContentArb = () =>
  fc.record({
    heading: safeString(),
    phone: fc.constant("+1-555-0100"),
    email: fc.constant("test@example.com"),
    address: safeString(),
    hours: fc.constant("Mon-Fri 9am-5pm"),
  });

/** Map of section type to its content generator */
const sectionContentGenerators = {
  hero: heroContentArb,
  services: servicesContentArb,
  gallery: galleryContentArb,
  testimonials: testimonialsContentArb,
  cta: ctaContentArb,
  contact: contactContentArb,
};

/** Generate a subset of known section types (at least 1) in a random order */
const sectionSubsetArb = () =>
  fc
    .shuffledSubarray(KNOWN_SECTION_TYPES, { minLength: 1, maxLength: 6 })
    .filter((arr) => arr.length >= 1);

/** Generate a valid sections object from a list of section type keys */
const sectionsObjectArb = (keys) => {
  const entries = keys.map((key) =>
    sectionContentGenerators[key]().map((content) => [key, content])
  );
  return fc.tuple(...entries).map((pairs) => Object.fromEntries(pairs));
};

/** Get a valid themeRef from the actual theme registry */
const validThemeRefArb = () => {
  const allThemeNames = [];
  for (const slug of Object.keys(themes)) {
    for (const t of themes[slug]) {
      allThemeNames.push(t.name);
    }
  }
  return fc.constantFrom(...allThemeNames);
};

/** Generate a valid Package_Config with specified section keys */
const validConfigArb = (sectionKeys) =>
  fc
    .tuple(sectionsObjectArb(sectionKeys), validThemeRefArb())
    .map(([sections, themeRef]) => ({
      slug: "test-package",
      name: "Test Package",
      category: "Professional",
      description: "A test package for property testing.",
      packageType: "static",
      themeRef,
      sections,
    }));

/** Generate an unknown section type string not in the registry */
const RESERVED_OBJECT_KEYS = [
  "constructor", "toString", "valueOf", "hasOwnProperty",
  "isPrototypeOf", "propertyIsEnumerable", "toLocaleString",
  "__proto__", "__defineGetter__", "__defineSetter__",
  "__lookupGetter__", "__lookupSetter__",
];
const unknownSectionTypeArb = () =>
  fc
    .stringMatching(/^[a-z]{4,12}$/)
    .filter(
      (s) =>
        !KNOWN_SECTION_TYPES.includes(s) &&
        !RESERVED_OBJECT_KEYS.includes(s)
    );

// A minimal valid theme object for rendering
const minimalTheme = {
  name: "test-theme",
  colors: {
    bgBase: "#111",
    bgSurface: "#222",
    bgMuted: "#333",
    textPrimary: "#fff",
    textSecondary: "#ccc",
    textMuted: "#999",
    accent: "#0af",
    accentHover: "#0cf",
    accentText: "#000",
    border: "#444",
  },
  typography: {
    fontDisplay: "Inter",
    fontBody: "Inter",
    weightLight: "300",
    weightRegular: "400",
    weightMedium: "500",
    weightBold: "700",
    trackingDisplay: "0em",
    trackingBody: "0em",
  },
  shape: {
    radiusSmall: "2px",
    radiusMedium: "4px",
    radiusLarge: "8px",
    buttonStyle: "rounded",
    cardStyle: "flat",
  },
};

// --- Property 6: Section rendering order matches configuration ---

describe("Property 6: Section rendering order matches configuration", () => {
  it("renders sections in DOM in the same order as config.sections and inserts N-1 dividers", () => {
    fc.assert(
      fc.property(sectionSubsetArb(), (sectionKeys) => {
        // Build a valid config with the given section keys in order
        const sections = {};
        for (const key of sectionKeys) {
          if (key === "hero") sections[key] = { headline: "Test Hero", subheadline: "Sub", ctaText: "CTA", heroImage: "https://example.com/img.jpg" };
          else if (key === "services") sections[key] = { heading: "Services", items: [{ title: "Svc", description: "Desc", icon: "🔧" }] };
          else if (key === "gallery") sections[key] = { heading: "Gallery", images: [{ src: "https://example.com/img.jpg", alt: "Photo" }] };
          else if (key === "testimonials") sections[key] = { heading: "Reviews", items: [{ quote: "Great", author: "Jane" }] };
          else if (key === "cta") sections[key] = { heading: "CTA", body: "Join", buttonText: "Go" };
          else if (key === "contact") sections[key] = { heading: "Contact", phone: "555-0100" };
        }

        const config = {
          slug: "test-pkg",
          name: "Test",
          category: "Professional",
          description: "Test package",
          packageType: "static",
          themeRef: "restaurant-candlelit",
          sections,
        };

        const { container, unmount } = render(
          <SectionRenderer config={config} theme={minimalTheme} layout="professional" packageName="Test" />
        );

        // Verify section order via data-section attributes
        const sectionElements = container.querySelectorAll("[data-section]");
        const renderedOrder = Array.from(sectionElements).map((el) => el.getAttribute("data-section"));

        expect(renderedOrder).toEqual(sectionKeys);

        // Verify exactly N-1 dividers
        const dividers = container.querySelectorAll('[data-testid="section-divider"]');
        expect(dividers.length).toBe(sectionKeys.length - 1);

        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// --- Property 7: Unknown section types handled gracefully ---

describe("Property 7: Unknown section types handled gracefully", () => {
  it("skips unknown section types without crashing and no adjacent divider for skipped sections", () => {
    fc.assert(
      fc.property(
        unknownSectionTypeArb(),
        fc.constantFrom("hero", "services", "cta"),
        (unknownType, knownType) => {
          // Suppress console.warn for unknown section types
          const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

          // Build config with known + unknown sections
          const sections = {};
          // Put a known section first
          if (knownType === "hero") sections[knownType] = { headline: "Hello", subheadline: "World", ctaText: "Go", heroImage: "https://example.com/img.jpg" };
          else if (knownType === "services") sections[knownType] = { heading: "Services", items: [{ title: "A", description: "B", icon: "🔧" }] };
          else if (knownType === "cta") sections[knownType] = { heading: "CTA", body: "Join", buttonText: "Go" };

          // Add unknown section
          sections[unknownType] = { heading: "Unknown" };

          const config = {
            slug: "test-pkg",
            name: "Test",
            category: "Professional",
            description: "Test package",
            packageType: "static",
            themeRef: "restaurant-candlelit",
            sections,
          };

          const { container, unmount } = render(
            <SectionRenderer config={config} theme={minimalTheme} layout="professional" packageName="Test" />
          );

          // Should not crash — the known section should render
          const sectionElements = container.querySelectorAll("[data-section]");
          const renderedTypes = Array.from(sectionElements).map((el) => el.getAttribute("data-section"));

          // Unknown type should NOT appear in rendered sections
          expect(renderedTypes).not.toContain(unknownType);
          // Known type should appear
          expect(renderedTypes).toContain(knownType);

          // No divider should be adjacent to a skipped section
          // With only 1 rendered section, there should be 0 dividers
          const dividers = container.querySelectorAll('[data-testid="section-divider"]');
          expect(dividers.length).toBe(renderedTypes.length - 1);

          // console.warn should have been called for the unknown type
          expect(warnSpy).toHaveBeenCalled();

          warnSpy.mockRestore();
          unmount();
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it("renders valid sections around unknown ones in correct order with proper divider count", () => {
    fc.assert(
      fc.property(unknownSectionTypeArb(), (unknownType) => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        // Config: hero, unknown, services — should render hero + services with 1 divider
        const sections = {
          hero: { headline: "Hello", subheadline: "World", ctaText: "Go", heroImage: "https://example.com/img.jpg" },
          [unknownType]: { heading: "Mystery" },
          services: { heading: "Services", items: [{ title: "A", description: "B", icon: "🔧" }] },
        };

        const config = {
          slug: "test-pkg",
          name: "Test",
          category: "Professional",
          description: "Test package",
          packageType: "static",
          themeRef: "restaurant-candlelit",
          sections,
        };

        const { container, unmount } = render(
          <SectionRenderer config={config} theme={minimalTheme} layout="professional" packageName="Test" />
        );

        const sectionElements = container.querySelectorAll("[data-section]");
        const renderedTypes = Array.from(sectionElements).map((el) => el.getAttribute("data-section"));

        // Should render hero and services in order, skipping unknown
        expect(renderedTypes).toEqual(["hero", "services"]);

        // Exactly 1 divider between the 2 rendered sections
        const dividers = container.querySelectorAll('[data-testid="section-divider"]');
        expect(dividers.length).toBe(1);

        warnSpy.mockRestore();
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// --- Property 15: Compositional correctness ---

describe("Property 15: Compositional correctness", () => {
  it("valid configs with valid theme refs render non-empty output with all sections visible", () => {
    fc.assert(
      fc.property(sectionSubsetArb(), validThemeRefArb(), (sectionKeys, themeRef) => {
        // Build valid sections content
        const sections = {};
        for (const key of sectionKeys) {
          if (key === "hero") sections[key] = { headline: "Hero Title", subheadline: "Sub", ctaText: "Click", heroImage: "https://example.com/img.jpg" };
          else if (key === "services") sections[key] = { heading: "Services", items: [{ title: "Svc", description: "Desc", icon: "✨" }] };
          else if (key === "gallery") sections[key] = { heading: "Gallery", images: [{ src: "https://example.com/img.jpg", alt: "Image" }] };
          else if (key === "testimonials") sections[key] = { heading: "Testimonials", items: [{ quote: "Nice", author: "Bob" }] };
          else if (key === "cta") sections[key] = { heading: "Ready?", body: "Let's go", buttonText: "Start" };
          else if (key === "contact") sections[key] = { heading: "Contact Us", phone: "555-0100" };
        }

        const config = {
          slug: "comp-test",
          name: "Composition Test",
          category: "Professional",
          description: "Testing compositional correctness.",
          packageType: "static",
          themeRef,
          sections,
        };

        const { container, unmount } = render(
          <SectionRenderer config={config} theme={minimalTheme} layout="professional" packageName="Comp Test" />
        );

        // Should produce non-empty DOM output
        expect(container.innerHTML.length).toBeGreaterThan(0);

        // Should not show error UI
        expect(container.querySelector('[data-testid="section-renderer-error"]')).toBeNull();
        expect(container.querySelector('[data-testid="section-renderer-theme-error"]')).toBeNull();

        // All referenced sections should be visible in rendered output
        const sectionElements = container.querySelectorAll("[data-section]");
        const renderedTypes = Array.from(sectionElements).map((el) => el.getAttribute("data-section"));

        for (const key of sectionKeys) {
          expect(renderedTypes).toContain(key);
        }

        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// --- Property 18: Slug resolution preserves routing ---

describe("Property 18: Slug resolution preserves routing", () => {
  it("actual package slugs resolve correctly and render sections matching their config", () => {
    // Get the first theme name for each package slug
    const getThemeRef = (slug) => {
      const pkgThemes = themes[slug];
      return pkgThemes && pkgThemes.length > 0 ? pkgThemes[0].name : null;
    };

    // Use actual packages from the data source
    const validPackages = packages.filter((pkg) => getThemeRef(pkg.slug) !== null);

    fc.assert(
      fc.property(fc.constantFrom(...validPackages), (pkg) => {
        const themeRef = getThemeRef(pkg.slug);
        const config = {
          slug: pkg.slug,
          name: pkg.name,
          category: pkg.category,
          description: pkg.description,
          packageType: "static",
          themeRef,
          sections: pkg.sections,
        };

        const { container, unmount } = render(
          <SectionRenderer config={config} theme={minimalTheme} layout="professional" packageName={pkg.name} />
        );

        // Should not show error UI
        expect(container.querySelector('[data-testid="section-renderer-error"]')).toBeNull();
        expect(container.querySelector('[data-testid="section-renderer-theme-error"]')).toBeNull();

        // All section types from the package config should be rendered in order
        const configSectionKeys = Object.keys(pkg.sections).filter(
          (key) => ["hero", "services", "gallery", "testimonials", "cta", "contact"].includes(key)
        );
        const sectionElements = container.querySelectorAll("[data-section]");
        const renderedTypes = Array.from(sectionElements).map((el) => el.getAttribute("data-section"));

        expect(renderedTypes).toEqual(configSectionKeys);

        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
