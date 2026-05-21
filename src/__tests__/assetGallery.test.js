import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  editFieldWithUpload,
  addGalleryImage,
  removeGalleryImage,
  reorderGalleryImages,
  extractStoragePath,
} from "../lib/assetGallery.js";

// Mock uploadService
vi.mock("../lib/uploadService.js", () => ({
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
}));

import { uploadFile, deleteFile } from "../lib/uploadService.js";

// Mock localStorage for persistence
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

/** Helper to create a mock File object */
function createMockFile(name = "test.jpg", size = 1024, type = "image/jpeg") {
  const file = new File(["x".repeat(size)], name, { type });
  return file;
}

/** Sample semi-dynamic config with gallery */
const sampleConfig = {
  slug: "test-salon",
  name: "Test Salon",
  category: "Beauty",
  packageType: "semi-dynamic",
  themeRef: "beauty-rose",
  sections: {
    hero: {
      headline: "Welcome",
      subheadline: "Best salon in town",
      ctaText: "Book Now",
      heroImage: "https://example.supabase.co/storage/v1/object/public/client-assets/test-salon/abc_hero.jpg",
    },
    gallery: {
      heading: "Our Work",
      images: [
        { src: "https://example.supabase.co/storage/v1/object/public/client-assets/test-salon/img1_photo1.jpg", alt: "Photo 1" },
        { src: "https://example.supabase.co/storage/v1/object/public/client-assets/test-salon/img2_photo2.jpg", alt: "Photo 2" },
        { src: "https://example.supabase.co/storage/v1/object/public/client-assets/test-salon/img3_photo3.jpg", alt: "Photo 3" },
      ],
    },
  },
};

/** Static config for rejection tests */
const staticConfig = {
  slug: "static-pkg",
  name: "Static Package",
  category: "Professional",
  packageType: "static",
  themeRef: "professional-slate",
  sections: {
    hero: { headline: "Hello" },
    gallery: { heading: "Gallery", images: [] },
  },
};

describe("extractStoragePath", () => {
  it("extracts path from a standard Supabase public URL", () => {
    const url = "https://example.supabase.co/storage/v1/object/public/client-assets/test-salon/abc_hero.jpg";
    expect(extractStoragePath(url)).toBe("test-salon/abc_hero.jpg");
  });

  it("returns null for non-Supabase URLs", () => {
    expect(extractStoragePath("https://images.unsplash.com/photo-123")).toBeNull();
  });

  it("returns null for null/undefined input", () => {
    expect(extractStoragePath(null)).toBeNull();
    expect(extractStoragePath(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractStoragePath("")).toBeNull();
  });
});

describe("editFieldWithUpload", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("delegates to editField when given a URL string", async () => {
    const result = await editFieldWithUpload(
      sampleConfig, "hero", "heroImage", "https://example.com/new-image.jpg"
    );
    expect(result.success).toBe(true);
    expect(result.updatedConfig.sections.hero.heroImage).toBe("https://example.com/new-image.jpg");
  });

  it("uploads a File and stores the returned URL", async () => {
    uploadFile.mockResolvedValueOnce({
      success: true,
      url: "https://example.supabase.co/storage/v1/object/public/client-assets/test-salon/uuid_test.jpg",
    });

    const file = createMockFile("test.jpg");
    const result = await editFieldWithUpload(sampleConfig, "hero", "heroImage", file);

    expect(uploadFile).toHaveBeenCalledWith(file, "test-salon");
    expect(result.success).toBe(true);
    expect(result.updatedConfig.sections.hero.heroImage).toBe(
      "https://example.supabase.co/storage/v1/object/public/client-assets/test-salon/uuid_test.jpg"
    );
  });

  it("returns error when upload fails", async () => {
    uploadFile.mockResolvedValueOnce({
      success: false,
      error: "Upload failed due to network error: timeout",
    });

    const file = createMockFile("test.jpg");
    const result = await editFieldWithUpload(sampleConfig, "hero", "heroImage", file);

    expect(result.success).toBe(false);
    expect(result.error).toContain("network error");
  });

  it("rejects edits on static packages", async () => {
    const result = await editFieldWithUpload(
      staticConfig, "hero", "heroImage", "https://example.com/img.jpg"
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("Static packages");
  });

  it("returns error for invalid input (not File or string)", async () => {
    const result = await editFieldWithUpload(sampleConfig, "hero", "heroImage", 123);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid input");
  });

  it("returns error when config has no slug", async () => {
    const noSlugConfig = { ...sampleConfig, slug: "" };
    const file = createMockFile("test.jpg");
    const result = await editFieldWithUpload(noSlugConfig, "hero", "heroImage", file);
    expect(result.success).toBe(false);
    expect(result.error).toContain("slug");
  });
});

describe("addGalleryImage", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("uploads file and appends image to gallery array", async () => {
    uploadFile.mockResolvedValueOnce({
      success: true,
      url: "https://example.supabase.co/storage/v1/object/public/client-assets/test-salon/uuid_new.jpg",
    });

    const file = createMockFile("new-photo.jpg");
    const result = await addGalleryImage(sampleConfig, "gallery", file);

    expect(uploadFile).toHaveBeenCalledWith(file, "test-salon");
    expect(result.success).toBe(true);
    expect(result.updatedConfig.sections.gallery.images).toHaveLength(4);
    expect(result.updatedConfig.sections.gallery.images[3]).toEqual({
      src: "https://example.supabase.co/storage/v1/object/public/client-assets/test-salon/uuid_new.jpg",
      alt: "new-photo.jpg",
    });
  });

  it("preserves existing images when adding", async () => {
    uploadFile.mockResolvedValueOnce({
      success: true,
      url: "https://example.supabase.co/storage/v1/object/public/client-assets/test-salon/uuid_new.jpg",
    });

    const file = createMockFile("new-photo.jpg");
    const result = await addGalleryImage(sampleConfig, "gallery", file);

    expect(result.success).toBe(true);
    // Original images preserved
    expect(result.updatedConfig.sections.gallery.images[0]).toEqual(sampleConfig.sections.gallery.images[0]);
    expect(result.updatedConfig.sections.gallery.images[1]).toEqual(sampleConfig.sections.gallery.images[1]);
    expect(result.updatedConfig.sections.gallery.images[2]).toEqual(sampleConfig.sections.gallery.images[2]);
  });

  it("returns error when upload fails", async () => {
    uploadFile.mockResolvedValueOnce({
      success: false,
      error: "Upload failed: storage quota exceeded",
    });

    const file = createMockFile("new-photo.jpg");
    const result = await addGalleryImage(sampleConfig, "gallery", file);

    expect(result.success).toBe(false);
    expect(result.error).toContain("quota exceeded");
  });

  it("rejects on static packages", async () => {
    const file = createMockFile("test.jpg");
    const result = await addGalleryImage(staticConfig, "gallery", file);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Static packages");
  });

  it("returns error for non-File input", async () => {
    const result = await addGalleryImage(sampleConfig, "gallery", "not-a-file");
    expect(result.success).toBe(false);
    expect(result.error).toContain("File object");
  });

  it("returns error for missing section", async () => {
    const file = createMockFile("test.jpg");
    const result = await addGalleryImage(sampleConfig, "nonexistent", file);
    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });

  it("handles gallery with no existing images array", async () => {
    uploadFile.mockResolvedValueOnce({
      success: true,
      url: "https://example.supabase.co/storage/v1/object/public/client-assets/test-salon/uuid_first.jpg",
    });

    const configNoImages = {
      ...sampleConfig,
      sections: {
        ...sampleConfig.sections,
        gallery: { heading: "Gallery" },
      },
    };

    const file = createMockFile("first.jpg");
    const result = await addGalleryImage(configNoImages, "gallery", file);

    expect(result.success).toBe(true);
    expect(result.updatedConfig.sections.gallery.images).toHaveLength(1);
    expect(result.updatedConfig.sections.gallery.images[0].alt).toBe("first.jpg");
  });
});

describe("removeGalleryImage", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("deletes file from storage and removes from array", async () => {
    deleteFile.mockResolvedValueOnce({ success: true });

    const result = await removeGalleryImage(sampleConfig, "gallery", 1);

    expect(deleteFile).toHaveBeenCalledWith("test-salon/img2_photo2.jpg");
    expect(result.success).toBe(true);
    expect(result.updatedConfig.sections.gallery.images).toHaveLength(2);
    expect(result.updatedConfig.sections.gallery.images[0].alt).toBe("Photo 1");
    expect(result.updatedConfig.sections.gallery.images[1].alt).toBe("Photo 3");
  });

  it("preserves gallery state when delete fails", async () => {
    deleteFile.mockResolvedValueOnce({
      success: false,
      error: "Delete failed due to network error: timeout",
    });

    const result = await removeGalleryImage(sampleConfig, "gallery", 0);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed to delete file from storage");
  });

  it("rejects on static packages", async () => {
    const result = await removeGalleryImage(staticConfig, "gallery", 0);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Static packages");
  });

  it("returns error for invalid index (negative)", async () => {
    const result = await removeGalleryImage(sampleConfig, "gallery", -1);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid image index");
  });

  it("returns error for invalid index (out of bounds)", async () => {
    const result = await removeGalleryImage(sampleConfig, "gallery", 5);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid image index");
  });

  it("returns error for missing section", async () => {
    const result = await removeGalleryImage(sampleConfig, "nonexistent", 0);
    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });

  it("returns error when section has no images array", async () => {
    const result = await removeGalleryImage(sampleConfig, "hero", 0);
    expect(result.success).toBe(false);
    expect(result.error).toContain("does not have an images array");
  });

  it("skips storage delete for non-Supabase URLs", async () => {
    const configWithExternalUrl = {
      ...sampleConfig,
      sections: {
        ...sampleConfig.sections,
        gallery: {
          heading: "Gallery",
          images: [
            { src: "https://images.unsplash.com/photo-123", alt: "External" },
          ],
        },
      },
    };

    const result = await removeGalleryImage(configWithExternalUrl, "gallery", 0);

    expect(deleteFile).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.updatedConfig.sections.gallery.images).toHaveLength(0);
  });
});

describe("reorderGalleryImages", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("reorders images according to new order", () => {
    const result = reorderGalleryImages(sampleConfig, "gallery", [2, 0, 1]);

    expect(result.success).toBe(true);
    expect(result.updatedConfig.sections.gallery.images[0].alt).toBe("Photo 3");
    expect(result.updatedConfig.sections.gallery.images[1].alt).toBe("Photo 1");
    expect(result.updatedConfig.sections.gallery.images[2].alt).toBe("Photo 2");
  });

  it("identity reorder preserves original order", () => {
    const result = reorderGalleryImages(sampleConfig, "gallery", [0, 1, 2]);

    expect(result.success).toBe(true);
    expect(result.updatedConfig.sections.gallery.images).toEqual(sampleConfig.sections.gallery.images);
  });

  it("rejects on static packages", () => {
    const result = reorderGalleryImages(staticConfig, "gallery", []);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Static packages");
  });

  it("rejects when newOrder length doesn't match images length", () => {
    const result = reorderGalleryImages(sampleConfig, "gallery", [0, 1]);
    expect(result.success).toBe(false);
    expect(result.error).toContain("does not match");
  });

  it("rejects invalid permutation (duplicate indices)", () => {
    const result = reorderGalleryImages(sampleConfig, "gallery", [0, 0, 1]);
    expect(result.success).toBe(false);
    expect(result.error).toContain("valid permutation");
  });

  it("rejects invalid permutation (out of range indices)", () => {
    const result = reorderGalleryImages(sampleConfig, "gallery", [0, 1, 5]);
    expect(result.success).toBe(false);
    expect(result.error).toContain("valid permutation");
  });

  it("rejects non-array newOrder", () => {
    const result = reorderGalleryImages(sampleConfig, "gallery", "not-array");
    expect(result.success).toBe(false);
    expect(result.error).toContain("must be an array");
  });

  it("returns error for missing section", () => {
    const result = reorderGalleryImages(sampleConfig, "nonexistent", [0]);
    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });

  it("returns error when section has no images array", () => {
    const result = reorderGalleryImages(sampleConfig, "hero", [0]);
    expect(result.success).toBe(false);
    expect(result.error).toContain("does not have an images array");
  });
});
