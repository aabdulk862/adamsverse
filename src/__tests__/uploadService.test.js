import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateFile,
  uploadFile,
  deleteFile,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from "../lib/uploadService.js";

// Mock the supabase module
vi.mock("../lib/supabase", () => {
  const mockUpload = vi.fn();
  const mockRemove = vi.fn();
  const mockGetPublicUrl = vi.fn();

  return {
    supabase: {
      storage: {
        from: vi.fn(() => ({
          upload: mockUpload,
          remove: mockRemove,
          getPublicUrl: mockGetPublicUrl,
        })),
      },
    },
    __mockUpload: mockUpload,
    __mockRemove: mockRemove,
    __mockGetPublicUrl: mockGetPublicUrl,
  };
});

// Import mocks after vi.mock
const { __mockUpload, __mockRemove, __mockGetPublicUrl } = await import(
  "../lib/supabase"
);

/**
 * Helper to create a mock File object.
 */
function createMockFile(name, size, type) {
  const content = new Uint8Array(size);
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  // Override size for testing since Blob size may differ
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("validateFile", () => {
  it("accepts a valid JPEG file under 5 MB", () => {
    const file = createMockFile("photo.jpg", 1024 * 1024, "image/jpeg");
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it("accepts a valid PNG file", () => {
    const file = createMockFile("logo.png", 500000, "image/png");
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it("accepts a valid WebP file", () => {
    const file = createMockFile("banner.webp", 2000000, "image/webp");
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it("accepts a valid SVG file", () => {
    const file = createMockFile("icon.svg", 5000, "image/svg+xml");
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it("accepts a file at exactly 5 MB", () => {
    const file = createMockFile("exact.jpg", MAX_FILE_SIZE, "image/jpeg");
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it("rejects a file exceeding 5 MB", () => {
    const file = createMockFile("large.jpg", MAX_FILE_SIZE + 1, "image/jpeg");
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("large.jpg");
    expect(result.error).toContain("exceeds maximum size of 5 MB");
    expect(result.error).toContain(String(MAX_FILE_SIZE + 1));
  });

  it("rejects an unsupported MIME type (PDF)", () => {
    const file = createMockFile("doc.pdf", 1000, "application/pdf");
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("doc.pdf");
    expect(result.error).toContain("application/pdf");
    expect(result.error).toContain("image/jpeg");
    expect(result.error).toContain("image/png");
    expect(result.error).toContain("image/webp");
    expect(result.error).toContain("image/svg+xml");
  });

  it("rejects an unsupported MIME type (GIF)", () => {
    const file = createMockFile("anim.gif", 1000, "image/gif");
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("image/gif");
    expect(result.error).toContain("unsupported type");
  });

  it("rejects a file with empty MIME type", () => {
    const file = createMockFile("noext", 1000, "");
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("unsupported type");
  });
});

describe("uploadFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects files exceeding size limit without calling Supabase", async () => {
    const file = createMockFile("big.jpg", MAX_FILE_SIZE + 100, "image/jpeg");
    const result = await uploadFile(file, "test-slug");
    expect(result.success).toBe(false);
    expect(result.error).toContain("exceeds maximum size");
    expect(__mockUpload).not.toHaveBeenCalled();
  });

  it("rejects files with invalid MIME type without calling Supabase", async () => {
    const file = createMockFile("doc.pdf", 1000, "application/pdf");
    const result = await uploadFile(file, "test-slug");
    expect(result.success).toBe(false);
    expect(result.error).toContain("unsupported type");
    expect(__mockUpload).not.toHaveBeenCalled();
  });

  it("uploads a valid file and returns public URL", async () => {
    const file = createMockFile("photo.jpg", 1000, "image/jpeg");
    __mockUpload.mockResolvedValue({ data: { path: "test-slug/uuid_photo.jpg" }, error: null });
    __mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://storage.supabase.co/client-assets/test-slug/uuid_photo.jpg" },
    });

    const result = await uploadFile(file, "test-slug");
    expect(result.success).toBe(true);
    expect(result.url).toContain("https://storage.supabase.co");
    expect(result.url).toContain("test-slug");
  });

  it("generates unique filenames with UUID prefix", async () => {
    const file = createMockFile("photo.jpg", 1000, "image/jpeg");
    __mockUpload.mockResolvedValue({ data: { path: "slug/uuid_photo.jpg" }, error: null });
    __mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://storage.supabase.co/client-assets/slug/uuid_photo.jpg" },
    });

    await uploadFile(file, "my-slug");

    // Check that upload was called with a path containing UUID prefix
    const uploadCall = __mockUpload.mock.calls[0];
    const uploadedPath = uploadCall[0];
    // Path should be: my-slug/{uuid}_photo.jpg
    expect(uploadedPath).toMatch(/^my-slug\/[a-f0-9-]+_photo\.jpg$/);
  });

  it("returns descriptive error on authentication failure", async () => {
    const file = createMockFile("photo.jpg", 1000, "image/jpeg");
    __mockUpload.mockResolvedValue({
      data: null,
      error: { message: "Unauthorized", statusCode: 401 },
    });

    const result = await uploadFile(file, "test-slug");
    expect(result.success).toBe(false);
    expect(result.error).toContain("authentication error");
  });

  it("returns descriptive error on quota exceeded", async () => {
    const file = createMockFile("photo.jpg", 1000, "image/jpeg");
    __mockUpload.mockResolvedValue({
      data: null,
      error: { message: "Payload too large", statusCode: 413 },
    });

    const result = await uploadFile(file, "test-slug");
    expect(result.success).toBe(false);
    expect(result.error).toContain("storage quota exceeded");
  });

  it("returns descriptive error on network failure", async () => {
    const file = createMockFile("photo.jpg", 1000, "image/jpeg");
    __mockUpload.mockRejectedValue(new Error("Network timeout"));

    const result = await uploadFile(file, "test-slug");
    expect(result.success).toBe(false);
    expect(result.error).toContain("network error");
    expect(result.error).toContain("Network timeout");
  });

  it("handles missing public URL gracefully", async () => {
    const file = createMockFile("photo.jpg", 1000, "image/jpeg");
    __mockUpload.mockResolvedValue({ data: { path: "slug/uuid_photo.jpg" }, error: null });
    __mockGetPublicUrl.mockReturnValue({ data: null });

    const result = await uploadFile(file, "test-slug");
    expect(result.success).toBe(false);
    expect(result.error).toContain("failed to retrieve public URL");
  });
});

describe("deleteFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully deletes a file", async () => {
    __mockRemove.mockResolvedValue({ data: [{}], error: null });

    const result = await deleteFile("test-slug/uuid_photo.jpg");
    expect(result.success).toBe(true);
  });

  it("returns error on delete failure", async () => {
    __mockRemove.mockResolvedValue({
      data: null,
      error: { message: "File not found", statusCode: 404 },
    });

    const result = await deleteFile("test-slug/nonexistent.jpg");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns error on network failure during delete", async () => {
    __mockRemove.mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await deleteFile("test-slug/photo.jpg");
    expect(result.success).toBe(false);
    expect(result.error).toContain("network error");
    expect(result.error).toContain("ECONNREFUSED");
  });

  it("returns error on authentication failure during delete", async () => {
    __mockRemove.mockResolvedValue({
      data: null,
      error: { message: "Forbidden", statusCode: 403 },
    });

    const result = await deleteFile("test-slug/photo.jpg");
    expect(result.success).toBe(false);
    expect(result.error).toContain("authentication error");
  });
});

describe("constants", () => {
  it("MAX_FILE_SIZE is 5 MB", () => {
    expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
  });

  it("ALLOWED_MIME_TYPES contains all required types", () => {
    expect(ALLOWED_MIME_TYPES).toContain("image/jpeg");
    expect(ALLOWED_MIME_TYPES).toContain("image/png");
    expect(ALLOWED_MIME_TYPES).toContain("image/webp");
    expect(ALLOWED_MIME_TYPES).toContain("image/svg+xml");
    expect(ALLOWED_MIME_TYPES).toHaveLength(4);
  });
});
