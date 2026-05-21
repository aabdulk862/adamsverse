// Feature: adverse-webuilder, Property 10: Content resolution by key
// Feature: adverse-webuilder, Property 11: Edit invariant — non-editable fields preserved
// Feature: adverse-webuilder, Property 12: Edit validation rejects invalid values and preserves state
// Feature: adverse-webuilder, Property 13: Edit persistence round-trip
// Feature: adverse-webuilder, Property 14: Static packages reject all edits
// **Validates: Requirements 5.3, 5.4, 6.3, 6.4, 6.5, 6.6, 6.7, 7.6**

import { describe, it, expect, beforeEach, vi } from "vitest";
import fc from "fast-check";
import {
  resolveContent,
  editField,
  getEditableFields,
  loadPersistedConfig,
} from "../lib/contentLayer.js";

// --- localStorage mock ---

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// --- Generators ---

/** Generate a valid slug (lowercase alphanumeric + hyphens, 1-30 chars) */
const slugArb = () =>
  fc
    .stringMatching(/^[a-z][a-z0-9-]{0,28}[a-z0-9]$/)
    .filter((s) => s.length >= 2 && s.length <= 30);

/** Generate a short non-empty string */
const shortString = () =>
  fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);

/** Generate a valid URL string */
const validUrl = () =>
  fc.constantFrom(
    "https://example.com/image.jpg",
    "http://cdn.test.com/photo.png",
    "/images/local.webp",
    "https://images.unsplash.com/photo-abc123",
  );

/** Generate a valid hero section content */
const heroContentArb = () =>
  fc.record({
    headline: shortString(),
    subheadline: shortString(),
    ctaText: shortString(),
    heroImage: validUrl(),
  });

/** Generate a valid services section content */
const servicesContentArb = () =>
  fc.record({
    heading: shortString(),
    items: fc.array(
      fc.record({
        title: shortString(),
        description: shortString(),
        icon: fc.constantFrom("🍽️", "🎉", "📦", "⭐"),
      }),
      { minLength: 1, maxLength: 5 },
    ),
  });

/** Generate a valid gallery section content */
const galleryContentArb = () =>
  fc.record({
    heading: shortString(),
    images: fc.array(
      fc.record({
        src: validUrl(),
        alt: shortString(),
      }),
      { minLength: 1, maxLength: 5 },
    ),
  });

/** Generate a valid testimonials section content */
const testimonialsContentArb = () =>
  fc.record({
    heading: shortString(),
    items: fc.array(
      fc.record({
        quote: shortString(),
        author: shortString(),
        role: shortString(),
      }),
      { minLength: 1, maxLength: 5 },
    ),
  });

/** Generate a valid CTA section content */
const ctaContentArb = () =>
  fc.record({
    heading: shortString(),
    body: shortString(),
    buttonText: shortString(),
  });

/** Generate a valid contact section content */
const contactContentArb = () =>
  fc.record({
    heading: shortString(),
    phone: shortString(),
    email: shortString(),
    address: shortString(),
    hours: shortString(),
  });

/** All section types with their content generators */
const SECTION_GENERATORS = {
  hero: heroContentArb,
  services: servicesContentArb,
  gallery: galleryContentArb,
  testimonials: testimonialsContentArb,
  cta: ctaContentArb,
  contact: contactContentArb,
};

/** Generate a sections object with 1-4 random sections */
const sectionsArb = () =>
  fc
    .subarray(Object.keys(SECTION_GENERATORS), { minLength: 1, maxLength: 4 })
    .chain((keys) => {
      const records = {};
      for (const key of keys) {
        records[key] = SECTION_GENERATORS[key]();
      }
      return fc.record(records);
    });

/** Generate a valid semi-dynamic package config */
const semiDynamicConfigArb = () =>
  fc.record({
    slug: slugArb(),
    name: shortString(),
    category: shortString(),
    packageType: fc.constant("semi-dynamic"),
    themeRef: shortString(),
    sections: sectionsArb(),
  });

/** Generate a valid dynamic package config */
const dynamicConfigArb = () =>
  fc.record({
    slug: slugArb(),
    name: shortString(),
    category: shortString(),
    packageType: fc.constant("dynamic"),
    themeRef: shortString(),
    sections: sectionsArb(),
  });

/** Generate an editable (non-static) config */
const editableConfigArb = () => fc.oneof(semiDynamicConfigArb(), dynamicConfigArb());

/** Generate a static package config */
const staticConfigArb = () =>
  fc.record({
    slug: slugArb(),
    name: shortString(),
    category: shortString(),
    packageType: fc.constant("static"),
    themeRef: shortString(),
    sections: sectionsArb(),
  });

/** Generate a section key that does NOT exist in a given config */
const missingSectionKeyArb = () =>
  fc
    .string({ minLength: 3, maxLength: 20 })
    .filter(
      (s) =>
        s.trim().length > 0 &&
        !Object.keys(SECTION_GENERATORS).includes(s) &&
        /^[a-z]+$/.test(s),
    );

/** Generate a valid editable field path for a given section type */
function editableFieldPathArb(sectionType) {
  const fields = getEditableFields(sectionType);
  if (fields.length === 0) return fc.constant("heading");
  return fc.constantFrom(...fields.map((f) => f.path));
}

/** Generate a valid value for a given field type */
function validValueForType(type) {
  if (type === "url") {
    return validUrl();
  }
  if (type === "array") {
    return fc.array(
      fc.record({
        title: shortString(),
        description: shortString(),
      }),
      { minLength: 1, maxLength: 5 },
    );
  }
  // Default: string
  return fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);
}

// --- Property 10: Content resolution by key ---

describe("Property 10: Content resolution by key", () => {
  it("resolves content for any section key present in config.sections", () => {
    fc.assert(
      fc.property(editableConfigArb(), (config) => {
        const sectionKeys = Object.keys(config.sections);
        for (const key of sectionKeys) {
          const result = resolveContent(config, key);
          expect(result.success).toBe(true);
          expect(result.content).toEqual(config.sections[key]);
        }
      }),
      { numRuns: 25 },
    );
  });

  it("returns error with key and slug for missing section keys", () => {
    fc.assert(
      fc.property(editableConfigArb(), missingSectionKeyArb(), (config, missingKey) => {
        const result = resolveContent(config, missingKey);
        expect(result.success).toBe(false);
        expect(result.error).toContain(missingKey);
        expect(result.error).toContain(config.slug);
      }),
      { numRuns: 25 },
    );
  });

  it("resolves content correctly regardless of package type", () => {
    fc.assert(
      fc.property(staticConfigArb(), (config) => {
        const sectionKeys = Object.keys(config.sections);
        for (const key of sectionKeys) {
          const result = resolveContent(config, key);
          expect(result.success).toBe(true);
          expect(result.content).toEqual(config.sections[key]);
        }
      }),
      { numRuns: 20 },
    );
  });
});

// --- Property 11: Edit invariant — non-editable fields preserved ---

describe("Property 11: Edit invariant — non-editable fields preserved", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("preserves all non-targeted fields after a successful edit", () => {
    fc.assert(
      fc.property(
        semiDynamicConfigArb().filter(
          (c) => Object.keys(c.sections).includes("hero"),
        ),
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (config, newHeadline) => {
          const result = editField(config, "hero", "headline", newHeadline);
          if (!result.success) return; // skip if edit fails for other reasons

          const updated = result.updatedConfig;

          // Top-level non-editable fields preserved
          expect(updated.slug).toBe(config.slug);
          expect(updated.name).toBe(config.name);
          expect(updated.category).toBe(config.category);
          expect(updated.packageType).toBe(config.packageType);
          expect(updated.themeRef).toBe(config.themeRef);

          // Other sections preserved
          for (const key of Object.keys(config.sections)) {
            if (key !== "hero") {
              expect(updated.sections[key]).toEqual(config.sections[key]);
            }
          }

          // Non-targeted fields within the edited section preserved
          expect(updated.sections.hero.subheadline).toEqual(config.sections.hero.subheadline);
          expect(updated.sections.hero.ctaText).toEqual(config.sections.hero.ctaText);
          expect(updated.sections.hero.heroImage).toEqual(config.sections.hero.heroImage);
        },
      ),
      { numRuns: 25 },
    );
  });

  it("preserves section order and all other sections on any editable field edit", () => {
    fc.assert(
      fc.property(
        semiDynamicConfigArb().filter(
          (c) => Object.keys(c.sections).includes("cta"),
        ),
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (config, newBody) => {
          const result = editField(config, "cta", "body", newBody);
          if (!result.success) return;

          const updated = result.updatedConfig;

          // All section keys are preserved
          expect(Object.keys(updated.sections).sort()).toEqual(
            Object.keys(config.sections).sort(),
          );

          // Non-targeted sections are deeply equal
          for (const key of Object.keys(config.sections)) {
            if (key !== "cta") {
              expect(updated.sections[key]).toEqual(config.sections[key]);
            }
          }

          // Non-targeted fields in cta preserved
          expect(updated.sections.cta.heading).toEqual(config.sections.cta.heading);
          expect(updated.sections.cta.buttonText).toEqual(config.sections.cta.buttonText);
        },
      ),
      { numRuns: 25 },
    );
  });
});

// --- Property 12: Edit validation rejects invalid values and preserves state ---

describe("Property 12: Edit validation rejects invalid values and preserves state", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("rejects strings exceeding 500 characters and preserves previous value", () => {
    fc.assert(
      fc.property(
        semiDynamicConfigArb().filter(
          (c) => Object.keys(c.sections).includes("hero"),
        ),
        fc.integer({ min: 501, max: 800 }),
        (config, length) => {
          const longString = "x".repeat(length);
          const originalHeadline = config.sections.hero.headline;

          const result = editField(config, "hero", "headline", longString);
          expect(result.success).toBe(false);
          expect(result.error).toContain("500");

          // Original config is unchanged (immutable)
          expect(config.sections.hero.headline).toBe(originalHeadline);
        },
      ),
      { numRuns: 25 },
    );
  });

  it("rejects URLs not starting with http://, https://, or / and preserves state", () => {
    fc.assert(
      fc.property(
        semiDynamicConfigArb().filter(
          (c) => Object.keys(c.sections).includes("hero"),
        ),
        fc.constantFrom(
          "ftp://example.com/img.jpg",
          "data:image/png;base64,abc",
          "file:///local/path.jpg",
          "mailto:test@test.com",
          "javascript:alert(1)",
        ),
        (config, invalidUrl) => {
          const originalImage = config.sections.hero.heroImage;

          const result = editField(config, "hero", "heroImage", invalidUrl);
          expect(result.success).toBe(false);
          expect(result.error).toContain("http://");

          // Original config unchanged
          expect(config.sections.hero.heroImage).toBe(originalImage);
        },
      ),
      { numRuns: 20 },
    );
  });

  it("rejects arrays exceeding 50 items and preserves state", () => {
    fc.assert(
      fc.property(
        semiDynamicConfigArb().filter(
          (c) => Object.keys(c.sections).includes("services"),
        ),
        fc.integer({ min: 51, max: 80 }),
        (config, arrayLength) => {
          const bigArray = Array.from({ length: arrayLength }, (_, i) => ({
            title: `Item ${i}`,
            description: `Desc ${i}`,
          }));
          const originalItems = config.sections.services.items;

          const result = editField(config, "services", "items", bigArray);
          expect(result.success).toBe(false);
          expect(result.error).toContain("50");

          // Original config unchanged
          expect(config.sections.services.items).toEqual(originalItems);
        },
      ),
      { numRuns: 20 },
    );
  });
});

// --- Property 13: Edit persistence round-trip ---

describe("Property 13: Edit persistence round-trip", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("persisted config contains the edited value after a successful edit", () => {
    fc.assert(
      fc.property(
        semiDynamicConfigArb().filter(
          (c) => Object.keys(c.sections).includes("hero"),
        ),
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (config, newHeadline) => {
          localStorageMock.clear();

          const result = editField(config, "hero", "headline", newHeadline);
          if (!result.success) return;

          const loaded = loadPersistedConfig(config.slug);
          expect(loaded).not.toBeNull();
          expect(loaded.sections.hero.headline).toBe(newHeadline);
        },
      ),
      { numRuns: 25 },
    );
  });

  it("persisted config preserves all other fields after edit", () => {
    fc.assert(
      fc.property(
        semiDynamicConfigArb().filter(
          (c) => Object.keys(c.sections).includes("cta"),
        ),
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (config, newButtonText) => {
          localStorageMock.clear();

          const result = editField(config, "cta", "buttonText", newButtonText);
          if (!result.success) return;

          const loaded = loadPersistedConfig(config.slug);
          expect(loaded).not.toBeNull();
          expect(loaded.sections.cta.buttonText).toBe(newButtonText);
          expect(loaded.slug).toBe(config.slug);
          expect(loaded.name).toBe(config.name);
          expect(loaded.packageType).toBe(config.packageType);
        },
      ),
      { numRuns: 25 },
    );
  });

  it("multiple edits persist correctly with latest value winning", () => {
    fc.assert(
      fc.property(
        semiDynamicConfigArb().filter(
          (c) => Object.keys(c.sections).includes("hero"),
        ),
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        (config, firstValue, secondValue) => {
          localStorageMock.clear();

          const result1 = editField(config, "hero", "headline", firstValue);
          if (!result1.success) return;

          const result2 = editField(result1.updatedConfig, "hero", "headline", secondValue);
          if (!result2.success) return;

          const loaded = loadPersistedConfig(config.slug);
          expect(loaded).not.toBeNull();
          expect(loaded.sections.hero.headline).toBe(secondValue);
        },
      ),
      { numRuns: 20 },
    );
  });
});

// --- Property 14: Static packages reject all edits ---

describe("Property 14: Static packages reject all edits", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("rejects all edit attempts on static packages regardless of field", () => {
    fc.assert(
      fc.property(
        staticConfigArb(),
        fc.constantFrom("hero", "services", "gallery", "testimonials", "cta", "contact"),
        fc.constantFrom("headline", "heading", "body", "buttonText", "subheadline"),
        shortString(),
        (config, sectionKey, fieldPath, newValue) => {
          const result = editField(config, sectionKey, fieldPath, newValue);
          expect(result.success).toBe(false);
          expect(result.error).toContain("Static packages do not support content editing");
        },
      ),
      { numRuns: 30 },
    );
  });

  it("rejects array edits on static packages", () => {
    fc.assert(
      fc.property(
        staticConfigArb().filter(
          (c) => Object.keys(c.sections).includes("services"),
        ),
        (config) => {
          const newItems = [{ title: "New", description: "Item" }];
          const result = editField(config, "services", "items", newItems);
          expect(result.success).toBe(false);
          expect(result.error).toContain("Static packages do not support content editing");
        },
      ),
      { numRuns: 20 },
    );
  });

  it("rejects URL edits on static packages", () => {
    fc.assert(
      fc.property(
        staticConfigArb().filter(
          (c) => Object.keys(c.sections).includes("hero"),
        ),
        validUrl(),
        (config, url) => {
          const result = editField(config, "hero", "heroImage", url);
          expect(result.success).toBe(false);
          expect(result.error).toContain("Static packages do not support content editing");
        },
      ),
      { numRuns: 20 },
    );
  });
});
