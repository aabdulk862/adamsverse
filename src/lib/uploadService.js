import { supabase } from "./supabase";

/**
 * Maximum allowed file size in bytes (5 MB).
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed MIME types for upload.
 */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

/**
 * The Supabase Storage bucket name for client assets.
 */
const BUCKET_NAME = "client-assets";

/**
 * Generates a UUID using the Web Crypto API.
 * Falls back to a timestamp-based ID if crypto.randomUUID is unavailable.
 * @returns {string}
 */
function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Validates a file against size and MIME type constraints.
 * @param {File} file - The file to validate
 * @returns {{ valid: true } | { valid: false, error: string }}
 */
export function validateFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File '${file.name}' exceeds maximum size of 5 MB (actual: ${file.size} bytes)`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File '${file.name}' has unsupported type '${file.type}'. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Validates and uploads a file to Supabase Storage.
 * @param {File} file - The file to upload
 * @param {string} slug - Package slug for bucket path organization
 * @returns {Promise<{ success: true, url: string } | { success: false, error: string }>}
 */
export async function uploadFile(file, slug) {
  // Validate file before upload
  const validation = validateFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Generate unique filename to prevent overwrites
  const uuid = generateUUID();
  const uniqueFilename = `${uuid}_${file.name}`;
  const filePath = `${slug}/${uniqueFilename}`;

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return { success: false, error: categorizeUploadError(error) };
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      return {
        success: false,
        error: "Upload succeeded but failed to retrieve public URL",
      };
    }

    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    return {
      success: false,
      error: `Upload failed due to network error: ${err.message || "Unknown error"}`,
    };
  }
}

/**
 * Deletes a file from Supabase Storage.
 * @param {string} filePath - The full path within the bucket (e.g., "slug/uuid_filename.jpg")
 * @returns {Promise<{ success: true } | { success: false, error: string }>}
 */
export async function deleteFile(filePath) {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      return { success: false, error: categorizeUploadError(error) };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: `Delete failed due to network error: ${err.message || "Unknown error"}`,
    };
  }
}

/**
 * Categorizes a Supabase Storage error into a descriptive message.
 * @param {object} error - The Supabase error object
 * @returns {string} A descriptive error message
 */
function categorizeUploadError(error) {
  const message = error.message || error.error || String(error);
  const statusCode = error.statusCode || error.status;

  // Authentication errors (401, 403)
  if (statusCode === 401 || statusCode === 403 || /auth|unauthorized|forbidden/i.test(message)) {
    return `Upload failed due to authentication error: ${message}`;
  }

  // Quota exceeded (413, 507, or quota-related messages)
  if (
    statusCode === 413 ||
    statusCode === 507 ||
    /quota|storage.*limit|payload.*too.*large|exceeded/i.test(message)
  ) {
    return "Upload failed: storage quota exceeded";
  }

  // Network-related errors
  if (/network|timeout|ECONNREFUSED|ENOTFOUND|fetch/i.test(message)) {
    return `Upload failed due to network error: ${message}`;
  }

  // Generic fallback
  return `Upload failed due to network error: ${message}`;
}
