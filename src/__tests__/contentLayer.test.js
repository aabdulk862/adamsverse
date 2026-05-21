import { describe, it, expect, beforeEach, vi } from "vitest";
import { resolveContent, editField, getEditableFields, loadPersistedConfig } from "../lib/contentLayer.js";

/**
 * Unit tests for the Content Layer module.
 * Tests content resolution, field editing, validation, and persistence.
 */

// Mock localStorage for persistence tests
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get _store() { return store; },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

/** Sample semi-dynamic package config for testing */
const sampleConfig = {
  slug: "test-restaurant",
  name: "Test Restaurant",
  category: "Food & Hospitality",
  description: "A test restaurant package",
  packageType: "semi-dynamic",
  themeRef: "restaurant-candlelit",
  sections: {
    hero: {
      headline: "Welcome to Our Restaurant",
      subheadline: "Fine dining at its best",
      ctaText: "Reserve Now",
      heroImage: "https://images.unsplash.com/photo-123",
    },
    services: {
      heading: "Our Services",
      items: [
        { title: "Private Dining", description: "Intimate gatherings", icon: "🍽️" },
        { title: "Catering", description: "Events and parties", icon: "🎉" },
      ],
    },
    gallery: {
      heading: "Our Gallery",
      images: [
        { src: "https://images.unsplash.com/photo-1", alt: "Dish one" },
        { src: "https://images.unsplash.com/photo-2", alt: "Dish two" },
      ],
    },
  },
};

/** Sample static package config */
const staticConfig = {
  slug: "static-pkg",
  name: "Static Package",
  category: "Professional",
  description: "A static package",
  packageType: "static",
  themeRef: "professional-slate",
  sections: {
    hero: { headline: "Hello World" },
  },
};

describe("resolveContent", () => {
  it("resolves content for an existing section key", () => {
    const result = resolveContent(sampleConfig, "hero");
    expect(result.success).toBe(true);
    expect(result.content).toEqual(sampleConfig.sections.hero);
  });

  it("resolves content for services section", () => {
    const result = resolveContent(sampleConfig, "services");
    expect(result.success).toBe(true);
    expect(result.content.heading).toBe("Our Services");
    expect(result.content.items).toHaveLength(2);
  });

  it("returns error for missing section key", () => {
    const result = resolveContent(sampleConfig, "nonexistent");
    expect(result.success).toBe(false);
    expect(result.error).toContain("nonexistent");
    expect(result.error).toContain("test-restaurant");
  });

  it("returns error for null config", () => {
    const result = resolveContent(null, "hero");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid config");
  });

  it("returns error for config without sections", () => {
    const result = resolveContent({ slug: "test" }, "hero");
    expect(result.success).toBe(false);
    expect(result.error).toContain("no sections");
  });

  it("returns error for empty sectionKey", () => {
    const result = resolveContent(sampleConfig, "");
    expect(result.success).toBe(false);
    expect(result.error).toContain("non-empty string");
  });
});

describe("editField", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("successfully edits a string field", () => {
    const result = editField(sampleConfig, "hero", "headline", "New Headline");
    expect(result.success).toBe(true);
    expect(result.updatedConfig.sections.hero.headline).toBe("New Headline");
  });

  it("preserves non-targeted fields on edit", () => {
    const result = editField(sampleConfig, "hero", "headline", "New Headline");
    expect(result.success).toBe(true);
    expect(result.updatedConfig.sections.hero.subheadline).toBe("Fine dining at its best");
    expect(result.updatedConfig.sections.hero.ctaText).toBe("Reserve Now");
    expect(result.updatedConfig.sections.hero.heroImage).toBe("https://images.unsplash.com/photo-123");
    // Other sections unchanged
    expect(result.updatedConfig.sections.services).toEqual(sampleConfig.sections.services);
    expect(result.updatedConfig.sections.gallery).toEqual(sampleConfig.sections.gallery);
  });

  it("preserves top-level config fields on edit", () => {
    const result = editField(sampleConfig, "hero", "headline", "New Headline");
    expect(result.success).toBe(true);
    expect(result.updatedConfig.slug).toBe("test-restaurant");
    expect(result.updatedConfig.name).toBe("Test Restaurant");
    expect(result.updatedConfig.category).toBe("Food & Hospitality");
    expect(result.updatedConfig.packageType).toBe("semi-dynamic");
    expect(result.updatedConfig.themeRef).toBe("restaurant-candlelit");
  });

  it("rejects edits on static packages", () => {
    const result = editField(staticConfig, "hero", "headline", "New Headline");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Static packages do not support content editing");
  });

  it("rejects strings exceeding 500 characters", () => {
    const longString = "a".repeat(501);
    const result = editField(sampleConfig, "hero", "headline", longString);
    expect(result.success).toBe(false);
    expect(result.error).toContain("500");
  });

  it("accepts strings at exactly 500 characters", () => {
    const exactString = "a".repeat(500);
    const result = editField(sampleConfig, "hero", "headline", exactString);
    expect(result.success).toBe(true);
    expect(result.updatedConfig.sections.hero.headline).toBe(exactString);
  });

  it("rejects URLs not starting with http://, https://, or /", () => {
    const result = editField(sampleConfig, "hero", "heroImage", "ftp://example.com/image.jpg");
    expect(result.success).toBe(false);
    expect(result.error).toContain("http://");
    expect(result.error).toContain("https://");
  });

  it("accepts URLs starting with http://", () => {
    const result = editField(sampleConfig, "hero", "heroImage", "http://example.com/image.jpg");
    expect(result.success).toBe(true);
  });

  it("accepts URLs starting with https://", () => {
    const result = editField(sampleConfig, "hero", "heroImage", "https://example.com/image.jpg");
    expect(result.success).toBe(true);
  });

  it("accepts URLs starting with /", () => {
    const result = editField(sampleConfig, "hero", "heroImage", "/images/hero.jpg");
    expect(result.success).toBe(true);
  });

  it("rejects arrays exceeding 50 items", () => {
    const bigArray = Array.from({ length: 51 }, (_, i) => ({
      title: `Item ${i}`,
      description: `Description ${i}`,
      icon: "📦",
    }));
    const result = editField(sampleConfig, "services", "items", bigArray);
    expect(result.success).toBe(false);
    expect(result.error).toContain("50");
  });

  it("accepts arrays at exactly 50 items", () => {
    const exactArray = Array.from({ length: 50 }, (_, i) => ({
      title: `Item ${i}`,
      description: `Description ${i}`,
      icon: "📦",
    }));
    const result = editField(sampleConfig, "services", "items", exactArray);
    expect(result.success).toBe(true);
  });

  it("rejects edits on non-editable config fields (slug)", () => {
    const result = editField(sampleConfig, "slug", "value", "new-slug");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not editable");
  });

  it("rejects edits on non-editable config fields (themeRef)", () => {
    const result = editField(sampleConfig, "themeRef", "value", "new-theme");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not editable");
  });

  it("rejects edits on layout field path", () => {
    const result = editField(sampleConfig, "hero", "layout", "centered");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not editable");
  });

  it("rejects edits on non-existent section", () => {
    const result = editField(sampleConfig, "nonexistent", "heading", "New Heading");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });

  it("rejects non-string values for string fields", () => {
    const result = editField(sampleConfig, "hero", "headline", 123);
    expect(result.success).toBe(false);
    expect(result.error).toContain("string");
  });

  it("rejects non-array values for array fields", () => {
    const result = editField(sampleConfig, "services", "items", "not an array");
    expect(result.success).toBe(false);
    expect(result.error).toContain("array");
  });

  it("persists edits to localStorage", () => {
    editField(sampleConfig, "hero", "headline", "Persisted Headline");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "webuilder_package_test-restaurant",
      expect.any(String)
    );
    const stored = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(stored.sections.hero.headline).toBe("Persisted Headline");
  });

  it("handles persistence failure gracefully", () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });
    const result = editField(sampleConfig, "hero", "headline", "Will Fail");
    expect(result.success).toBe(false);
    expect(result.error).toContain("persist");
  });

  it("works with dynamic package type", () => {
    const dynamicConfig = { ...sampleConfig, packageType: "dynamic" };
    const result = editField(dynamicConfig, "hero", "headline", "Dynamic Edit");
    expect(result.success).toBe(true);
    expect(result.updatedConfig.sections.hero.headline).toBe("Dynamic Edit");
  });
});

describe("getEditableFields", () => {
  it("returns editable fields for hero section", () => {
    const fields = getEditableFields("hero");
    expect(fields).toHaveLength(4);
    expect(fields.map((f) => f.path)).toContain("headline");
    expect(fields.map((f) => f.path)).toContain("subheadline");
    expect(fields.map((f) => f.path)).toContain("ctaText");
    expect(fields.map((f) => f.path)).toContain("heroImage");
  });

  it("returns editable fields for services section", () => {
    const fields = getEditableFields("services");
    expect(fields).toHaveLength(2);
    expect(fields.map((f) => f.path)).toContain("heading");
    expect(fields.map((f) => f.path)).toContain("items");
  });

  it("returns editable fields for contact section", () => {
    const fields = getEditableFields("contact");
    expect(fields).toHaveLength(5);
    expect(fields.map((f) => f.path)).toContain("heading");
    expect(fields.map((f) => f.path)).toContain("phone");
    expect(fields.map((f) => f.path)).toContain("email");
    expect(fields.map((f) => f.path)).toContain("address");
    expect(fields.map((f) => f.path)).toContain("hours");
  });

  it("returns correct types for fields", () => {
    const heroFields = getEditableFields("hero");
    const imageField = heroFields.find((f) => f.path === "heroImage");
    expect(imageField.type).toBe("url");

    const servicesFields = getEditableFields("services");
    const itemsField = servicesFields.find((f) => f.path === "items");
    expect(itemsField.type).toBe("array");
  });

  it("returns empty array for unknown section type", () => {
    const fields = getEditableFields("unknown");
    expect(fields).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    const fields = getEditableFields("");
    expect(fields).toEqual([]);
  });

  it("returns a copy (not a reference to internal data)", () => {
    const fields1 = getEditableFields("hero");
    const fields2 = getEditableFields("hero");
    expect(fields1).toEqual(fields2);
    expect(fields1).not.toBe(fields2);
    fields1[0].path = "mutated";
    expect(getEditableFields("hero")[0].path).toBe("headline");
  });
});

describe("loadPersistedConfig", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("returns null when no persisted config exists", () => {
    const result = loadPersistedConfig("nonexistent");
    expect(result).toBeNull();
  });

  it("returns persisted config after edit", () => {
    editField(sampleConfig, "hero", "headline", "Saved Headline");
    const loaded = loadPersistedConfig("test-restaurant");
    expect(loaded).not.toBeNull();
    expect(loaded.sections.hero.headline).toBe("Saved Headline");
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorageMock.getItem.mockReturnValueOnce("not valid json{{{");
    const result = loadPersistedConfig("test");
    expect(result).toBeNull();
  });
});
