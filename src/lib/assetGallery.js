import { uploadFile, deleteFile } from "./uploadService.js";
import { editField } from "./contentLayer.js";

/**
 * Extracts the storage file path from a Supabase public URL.
 * The path is the portion after `/object/public/client-assets/`.
 *
 * @param {string} url - The public URL from Supabase Storage
 * @returns {string | null} The file path within the bucket, or null if not extractable
 */
export function extractStoragePath(url) {
  if (!url || typeof url !== "string") return null;

  // Match the path after the bucket name in a Supabase public URL
  const marker = "/object/public/client-assets/";
  const idx = url.indexOf(marker);
  if (idx !== -1) {
    return url.slice(idx + marker.length);
  }

  // Fallback: try to extract slug/filename pattern
  const match = url.match(/client-assets\/(.+)$/);
  if (match) return match[1];

  return null;
}

/**
 * Validates that a package config is not static.
 * Static packages reject all edit operations.
 *
 * @param {object} config - The package configuration
 * @returns {{ valid: true } | { valid: false, error: string }}
 */
function validateNotStatic(config) {
  const packageType = config?.packageType || "static";
  if (packageType === "static") {
    return {
      valid: false,
      error: "Static packages do not support content editing",
    };
  }
  return { valid: true };
}

/**
 * Determines if a value is a File object.
 *
 * @param {*} value - The value to check
 * @returns {boolean}
 */
function isFileObject(value) {
  return (
    typeof File !== "undefined" &&
    value instanceof File
  );
}

/**
 * Edits a URL-type field, supporting both direct URL strings and File uploads.
 *
 * If the input is a File object, it uploads via the Upload Service and stores
 * the returned URL. If it's a string URL, it uses the normal editField flow.
 *
 * @param {object} config - Current package config
 * @param {string} sectionKey - Target section identifier
 * @param {string} fieldPath - Dot-notation field path within the section content
 * @param {File | string} fileOrUrl - A File object to upload, or a URL string
 * @returns {Promise<{ success: true, updatedConfig: object } | { success: false, error: string }>}
 */
export async function editFieldWithUpload(config, sectionKey, fieldPath, fileOrUrl) {
  // Validate config is not static
  const staticCheck = validateNotStatic(config);
  if (!staticCheck.valid) {
    return { success: false, error: staticCheck.error };
  }

  // If it's a string URL, delegate to the normal editField
  if (typeof fileOrUrl === "string") {
    return editField(config, sectionKey, fieldPath, fileOrUrl);
  }

  // If it's a File, upload it first
  if (isFileObject(fileOrUrl)) {
    const slug = config.slug;
    if (!slug) {
      return { success: false, error: "Config is missing a slug for upload path" };
    }

    const uploadResult = await uploadFile(fileOrUrl, slug);
    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }

    // Store the returned URL via editField
    return editField(config, sectionKey, fieldPath, uploadResult.url);
  }

  return {
    success: false,
    error: "Invalid input: expected a File object or a URL string",
  };
}

/**
 * Adds an image to the gallery by uploading a file and appending the result
 * to the gallery images array.
 *
 * @param {object} config - Current package config
 * @param {string} sectionKey - Target section identifier (e.g., "gallery")
 * @param {File} file - The file to upload
 * @returns {Promise<{ success: true, updatedConfig: object } | { success: false, error: string }>}
 */
export async function addGalleryImage(config, sectionKey, file) {
  // Validate config is not static
  const staticCheck = validateNotStatic(config);
  if (!staticCheck.valid) {
    return { success: false, error: staticCheck.error };
  }

  if (!config || typeof config !== "object") {
    return { success: false, error: "Invalid config: config must be an object" };
  }

  if (!config.sections || !config.sections[sectionKey]) {
    return {
      success: false,
      error: `Section "${sectionKey}" not found in package "${config.slug || "unknown"}"`,
    };
  }

  if (!isFileObject(file)) {
    return { success: false, error: "Invalid input: expected a File object" };
  }

  const slug = config.slug;
  if (!slug) {
    return { success: false, error: "Config is missing a slug for upload path" };
  }

  // Upload the file
  const uploadResult = await uploadFile(file, slug);
  if (!uploadResult.success) {
    return { success: false, error: uploadResult.error };
  }

  // Get current images array
  const currentImages = config.sections[sectionKey].images || [];

  // Append the new image entry
  const newImage = { src: uploadResult.url, alt: file.name };
  const updatedImages = [...currentImages, newImage];

  // Persist via editField
  return editField(config, sectionKey, "images", updatedImages);
}

/**
 * Removes an image from the gallery by deleting it from Supabase Storage
 * and removing the entry from the images array.
 *
 * If the delete from storage fails, the gallery state is preserved and an error is returned.
 *
 * @param {object} config - Current package config
 * @param {string} sectionKey - Target section identifier (e.g., "gallery")
 * @param {number} imageIndex - The index of the image to remove
 * @returns {Promise<{ success: true, updatedConfig: object } | { success: false, error: string }>}
 */
export async function removeGalleryImage(config, sectionKey, imageIndex) {
  // Validate config is not static
  const staticCheck = validateNotStatic(config);
  if (!staticCheck.valid) {
    return { success: false, error: staticCheck.error };
  }

  if (!config || typeof config !== "object") {
    return { success: false, error: "Invalid config: config must be an object" };
  }

  if (!config.sections || !config.sections[sectionKey]) {
    return {
      success: false,
      error: `Section "${sectionKey}" not found in package "${config.slug || "unknown"}"`,
    };
  }

  const currentImages = config.sections[sectionKey].images;
  if (!Array.isArray(currentImages)) {
    return {
      success: false,
      error: `Section "${sectionKey}" does not have an images array`,
    };
  }

  if (typeof imageIndex !== "number" || imageIndex < 0 || imageIndex >= currentImages.length) {
    return {
      success: false,
      error: `Invalid image index: ${imageIndex}. Valid range: 0 to ${currentImages.length - 1}`,
    };
  }

  const imageToRemove = currentImages[imageIndex];
  const storagePath = extractStoragePath(imageToRemove.src);

  // Attempt to delete from storage if we can extract a path
  if (storagePath) {
    const deleteResult = await deleteFile(storagePath);
    if (!deleteResult.success) {
      // Preserve gallery state on delete failure
      return {
        success: false,
        error: `Failed to delete file from storage: ${deleteResult.error}`,
      };
    }
  }

  // Remove the image entry from the array
  const updatedImages = currentImages.filter((_, idx) => idx !== imageIndex);

  // Persist via editField
  return editField(config, sectionKey, "images", updatedImages);
}

/**
 * Reorders gallery images by accepting a new ordered array of indices.
 * The images array is reordered to match the specified order.
 * No files are modified in Supabase Storage.
 *
 * @param {object} config - Current package config
 * @param {string} sectionKey - Target section identifier (e.g., "gallery")
 * @param {number[]} newOrder - Array of image indices representing the new order
 * @returns {{ success: true, updatedConfig: object } | { success: false, error: string }}
 */
export function reorderGalleryImages(config, sectionKey, newOrder) {
  // Validate config is not static
  const staticCheck = validateNotStatic(config);
  if (!staticCheck.valid) {
    return { success: false, error: staticCheck.error };
  }

  if (!config || typeof config !== "object") {
    return { success: false, error: "Invalid config: config must be an object" };
  }

  if (!config.sections || !config.sections[sectionKey]) {
    return {
      success: false,
      error: `Section "${sectionKey}" not found in package "${config.slug || "unknown"}"`,
    };
  }

  const currentImages = config.sections[sectionKey].images;
  if (!Array.isArray(currentImages)) {
    return {
      success: false,
      error: `Section "${sectionKey}" does not have an images array`,
    };
  }

  if (!Array.isArray(newOrder)) {
    return { success: false, error: "newOrder must be an array of indices" };
  }

  // Validate that newOrder is a valid permutation of current indices
  if (newOrder.length !== currentImages.length) {
    return {
      success: false,
      error: `newOrder length (${newOrder.length}) does not match images array length (${currentImages.length})`,
    };
  }

  const sortedOrder = [...newOrder].sort((a, b) => a - b);
  const expectedOrder = Array.from({ length: currentImages.length }, (_, i) => i);
  const isValidPermutation = sortedOrder.every((val, idx) => val === expectedOrder[idx]);

  if (!isValidPermutation) {
    return {
      success: false,
      error: "newOrder must be a valid permutation of image indices (each index 0 to N-1 appearing exactly once)",
    };
  }

  // Reorder the images array according to newOrder
  const reorderedImages = newOrder.map((idx) => currentImages[idx]);

  // Persist via editField
  return editField(config, sectionKey, "images", reorderedImages);
}
