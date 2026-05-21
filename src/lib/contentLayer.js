import { sectionRegistry } from "../registry/sectionRegistry.js";

/**
 * Non-editable top-level config fields that cannot be modified through the editing interface.
 * @type {Set<string>}
 */
const NON_EDITABLE_CONFIG_FIELDS = new Set([
  "slug",
  "name",
  "category",
  "packageType",
  "themeRef",
]);

/**
 * Non-editable concepts that are rejected at the section level.
 * These represent structural concerns (layout, ordering) rather than content.
 * @type {Set<string>}
 */
const NON_EDITABLE_SECTION_CONCEPTS = new Set([
  "layout",
  "variant",
  "order",
  "sectionType",
  "type",
]);

/**
 * Editable field definitions per section type.
 * Each entry defines the path, type, and constraints for editable fields.
 *
 * @type {Record<string, Array<{ path: string, type: string, maxLength?: number }>>}
 */
const EDITABLE_FIELDS = {
  hero: [
    { path: "headline", type: "string", maxLength: 500 },
    { path: "subheadline", type: "string", maxLength: 500 },
    { path: "ctaText", type: "string", maxLength: 500 },
    { path: "heroImage", type: "url", maxLength: 500 },
  ],
  services: [
    { path: "heading", type: "string", maxLength: 500 },
    { path: "items", type: "array", maxLength: 50 },
  ],
  gallery: [
    { path: "heading", type: "string", maxLength: 500 },
    { path: "images", type: "array", maxLength: 50 },
  ],
  testimonials: [
    { path: "heading", type: "string", maxLength: 500 },
    { path: "items", type: "array", maxLength: 50 },
  ],
  cta: [
    { path: "heading", type: "string", maxLength: 500 },
    { path: "body", type: "string", maxLength: 500 },
    { path: "buttonText", type: "string", maxLength: 500 },
  ],
  contact: [
    { path: "heading", type: "string", maxLength: 500 },
    { path: "phone", type: "string", maxLength: 500 },
    { path: "email", type: "string", maxLength: 500 },
    { path: "address", type: "string", maxLength: 500 },
    { path: "hours", type: "string", maxLength: 500 },
  ],
};

/**
 * Resolves content for a section from the package config.
 *
 * Looks up the section key in the config's sections object and returns
 * the content object if found, or an error if the key is missing.
 *
 * @param {object} config - The package configuration
 * @param {string} sectionKey - Section identifier (e.g., "hero", "services")
 * @returns {{ success: true, content: object } | { success: false, error: string }}
 */
export function resolveContent(config, sectionKey) {
  if (!config || typeof config !== "object") {
    return { success: false, error: "Invalid config: config must be an object" };
  }

  if (!config.sections || typeof config.sections !== "object") {
    return {
      success: false,
      error: `Content resolution failed: package "${config.slug || "unknown"}" has no sections object`,
    };
  }

  if (!sectionKey || typeof sectionKey !== "string") {
    return { success: false, error: "Invalid sectionKey: must be a non-empty string" };
  }

  if (!Object.prototype.hasOwnProperty.call(config.sections, sectionKey)) {
    return {
      success: false,
      error: `Content resolution failed: section "${sectionKey}" not found in package "${config.slug || "unknown"}"`,
    };
  }

  const content = config.sections[sectionKey];
  if (content === undefined || content === null) {
    return {
      success: false,
      error: `Content resolution failed: section "${sectionKey}" not found in package "${config.slug || "unknown"}"`,
    };
  }

  return { success: true, content };
}

/**
 * Determines the section type from the section key.
 * In the current architecture, the section key IS the section type.
 *
 * @param {string} sectionKey - Section key from the config
 * @returns {string} The section type identifier
 */
function getSectionType(sectionKey) {
  return sectionKey;
}

/**
 * Validates a string value against the string field constraints.
 *
 * @param {*} value - The value to validate
 * @param {number} maxLength - Maximum allowed string length
 * @returns {{ valid: boolean, error?: string }}
 */
function validateStringField(value, maxLength) {
  if (typeof value !== "string") {
    return { valid: false, error: `Value must be a string, got ${typeof value}` };
  }
  if (value.length > maxLength) {
    return {
      valid: false,
      error: `String exceeds maximum length of ${maxLength} characters (got ${value.length})`,
    };
  }
  return { valid: true };
}

/**
 * Validates a URL value against the URL field constraints.
 *
 * @param {*} value - The value to validate
 * @param {number} maxLength - Maximum allowed string length
 * @returns {{ valid: boolean, error?: string }}
 */
function validateUrlField(value, maxLength) {
  if (typeof value !== "string") {
    return { valid: false, error: `URL must be a string, got ${typeof value}` };
  }
  if (value.length > maxLength) {
    return {
      valid: false,
      error: `URL exceeds maximum length of ${maxLength} characters (got ${value.length})`,
    };
  }
  if (!value.startsWith("http://") && !value.startsWith("https://") && !value.startsWith("/")) {
    return {
      valid: false,
      error: `URL must start with http://, https://, or /. Got: "${value.substring(0, 50)}"`,
    };
  }
  return { valid: true };
}

/**
 * Validates an array value against the array field constraints.
 *
 * @param {*} value - The value to validate
 * @param {number} maxItems - Maximum allowed array length
 * @returns {{ valid: boolean, error?: string }}
 */
function validateArrayField(value, maxItems) {
  if (!Array.isArray(value)) {
    return { valid: false, error: `Value must be an array, got ${typeof value}` };
  }
  if (value.length > maxItems) {
    return {
      valid: false,
      error: `Array exceeds maximum of ${maxItems} items (got ${value.length})`,
    };
  }
  return { valid: true };
}

/**
 * Gets a value from an object using a dot-notation path.
 *
 * @param {object} obj - The object to traverse
 * @param {string} path - Dot-notation path (e.g., "items.0.title")
 * @returns {*} The value at the path, or undefined if not found
 */
function getByPath(obj, path) {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

/**
 * Sets a value on an object using a dot-notation path, returning a new object (immutable).
 *
 * @param {object} obj - The source object
 * @param {string} path - Dot-notation path (e.g., "items.0.title")
 * @param {*} value - The value to set
 * @returns {object} A new object with the value set at the path
 */
function setByPath(obj, path, value) {
  const parts = path.split(".");
  if (parts.length === 1) {
    return { ...obj, [parts[0]]: value };
  }

  const [head, ...rest] = parts;
  const child = obj[head];
  const isArrayIndex = /^\d+$/.test(rest[0]);

  if (Array.isArray(child)) {
    const newChild = [...child];
    const index = parseInt(rest[0], 10);
    if (rest.length === 1) {
      newChild[index] = value;
    } else {
      newChild[index] = setByPath(child[index] || {}, rest.slice(1).join("."), value);
    }
    return { ...obj, [head]: newChild };
  }

  return {
    ...obj,
    [head]: setByPath(child || {}, rest.join("."), value),
  };
}

/**
 * Determines the field type for a given field path within a section type.
 * Handles nested paths like "items.0.title" by looking at the root field.
 *
 * @param {string} sectionType - The section type identifier
 * @param {string} fieldPath - The dot-notation field path
 * @returns {{ editable: boolean, type?: string, maxLength?: number } | null}
 */
function getFieldInfo(sectionType, fieldPath) {
  const fields = EDITABLE_FIELDS[sectionType];
  if (!fields) return null;

  // Check for exact match first
  const exactMatch = fields.find((f) => f.path === fieldPath);
  if (exactMatch) return { editable: true, ...exactMatch };

  // Check if the path is a sub-path of an array field (e.g., "items.0.title")
  const rootField = fieldPath.split(".")[0];
  const parentField = fields.find((f) => f.path === rootField);
  if (parentField && parentField.type === "array") {
    // Sub-fields of arrays are editable as part of the array
    return { editable: true, type: "string", maxLength: 500 };
  }

  return null;
}

/**
 * Persists the updated config to localStorage keyed by package slug.
 *
 * @param {object} config - The updated package configuration to persist
 * @returns {{ success: boolean, error?: string }}
 */
function persistConfig(config) {
  try {
    const key = `webuilder_package_${config.slug}`;
    const serialized = JSON.stringify(config);
    localStorage.setItem(key, serialized);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: `Failed to persist config: ${err.message || "localStorage write failed"}`,
    };
  }
}

/**
 * Loads a persisted config from localStorage by package slug.
 *
 * @param {string} slug - The package slug to look up
 * @returns {object | null} The persisted config, or null if not found
 */
export function loadPersistedConfig(slug) {
  try {
    const key = `webuilder_package_${slug}`;
    const serialized = localStorage.getItem(key);
    if (!serialized) return null;
    return JSON.parse(serialized);
  } catch {
    return null;
  }
}

/**
 * Applies an edit to an editable field in the package config.
 *
 * Validates that:
 * - The package is not static (static packages reject all edits)
 * - The field is editable (not a structural/non-editable field)
 * - The new value passes type-specific validation constraints
 *
 * On success, persists the updated config to localStorage and returns
 * the updated config. On failure, preserves the previous value and
 * returns an error.
 *
 * @param {object} config - Current package config
 * @param {string} sectionKey - Target section identifier
 * @param {string} fieldPath - Dot-notation field path within the section content
 * @param {*} newValue - New field value
 * @returns {{ success: true, updatedConfig: object } | { success: false, error: string }}
 */
export function editField(config, sectionKey, fieldPath, newValue) {
  if (!config || typeof config !== "object") {
    return { success: false, error: "Invalid config: config must be an object" };
  }

  if (!sectionKey || typeof sectionKey !== "string") {
    return { success: false, error: "Invalid sectionKey: must be a non-empty string" };
  }

  if (!fieldPath || typeof fieldPath !== "string") {
    return { success: false, error: "Invalid fieldPath: must be a non-empty string" };
  }

  // Reject edits on static packages
  const packageType = config.packageType || "static";
  if (packageType === "static") {
    return {
      success: false,
      error: "Static packages do not support content editing",
    };
  }

  // Reject edits on non-editable top-level config fields
  if (NON_EDITABLE_CONFIG_FIELDS.has(sectionKey)) {
    return {
      success: false,
      error: `Field "${sectionKey}" is not editable: it is a protected configuration field`,
    };
  }

  // Reject edits on non-editable section concepts
  if (NON_EDITABLE_SECTION_CONCEPTS.has(fieldPath)) {
    return {
      success: false,
      error: `Field "${fieldPath}" is not editable: layout, section order, and theme assignment cannot be modified`,
    };
  }

  // Verify the section exists
  if (!config.sections || !config.sections[sectionKey]) {
    return {
      success: false,
      error: `Section "${sectionKey}" not found in package "${config.slug || "unknown"}"`,
    };
  }

  // Determine the section type and check if the field is editable
  const sectionType = getSectionType(sectionKey);
  const fieldInfo = getFieldInfo(sectionType, fieldPath);

  if (!fieldInfo || !fieldInfo.editable) {
    return {
      success: false,
      error: `Field "${fieldPath}" is not editable in section type "${sectionType}"`,
    };
  }

  // Validate the new value based on field type
  let validation;
  if (fieldInfo.type === "url") {
    validation = validateUrlField(newValue, fieldInfo.maxLength || 500);
  } else if (fieldInfo.type === "array") {
    validation = validateArrayField(newValue, fieldInfo.maxLength || 50);
  } else {
    // Default to string validation
    validation = validateStringField(newValue, fieldInfo.maxLength || 500);
  }

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Apply the edit immutably
  const currentSectionContent = config.sections[sectionKey];
  const updatedSectionContent = setByPath(currentSectionContent, fieldPath, newValue);

  const updatedConfig = {
    ...config,
    sections: {
      ...config.sections,
      [sectionKey]: updatedSectionContent,
    },
  };

  // Persist the updated config
  const persistResult = persistConfig(updatedConfig);
  if (!persistResult.success) {
    return {
      success: false,
      error: persistResult.error,
    };
  }

  return { success: true, updatedConfig };
}

/**
 * Returns the list of editable fields for a given section type.
 *
 * Each field entry includes:
 * - path: dot-notation path to the field within the section content
 * - type: field type ("string", "url", or "array")
 * - maxLength: maximum length constraint (characters for strings/URLs, items for arrays)
 *
 * @param {string} sectionType - Section type identifier (e.g., "hero", "services")
 * @returns {Array<{ path: string, type: string, maxLength?: number }>}
 */
export function getEditableFields(sectionType) {
  if (!sectionType || typeof sectionType !== "string") {
    return [];
  }

  const fields = EDITABLE_FIELDS[sectionType];
  if (!fields) {
    return [];
  }

  // Return a copy to prevent external mutation
  return fields.map((f) => ({ ...f }));
}
