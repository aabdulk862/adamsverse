import { validateTheme } from "../schemas/themeSchema.js";

/**
 * Converts a typography key to its CSS custom property suffix.
 * Keys starting with "font" (e.g., fontDisplay, fontBody) have the
 * "font" prefix stripped and the remainder lowercased to avoid
 * redundancy with the --font- prefix (fontDisplay → display).
 * All other keys are used as-is (weightLight → weightLight).
 */
function typographyKeyToSuffix(key) {
  if (key.startsWith("font") && key.length > 4) {
    return key.charAt(4).toLowerCase() + key.slice(5);
  }
  return key;
}

/**
 * Token group prefix mapping used to set CSS custom properties.
 * Each group in the theme maps to a specific CSS variable prefix.
 */
const TOKEN_PREFIX_MAP = {
  colors: "--color-",
  typography: "--font-",
  shape: "--shape-",
  spacing: "--spacing-",
  shadow: "--shadow-",
  motion: "--motion-",
};

/**
 * Metadata field names that are not token groups. Missing these should not
 * block backward-compatible theme application.
 */
const METADATA_FIELDS = new Set(["name", "label"]);

/**
 * Determines whether all validation errors are about metadata fields only
 * (name, label) rather than actual token groups. This enables backward
 * compatibility for callers passing themes without name/label metadata.
 *
 * @param {Array<{ path: string, message: string }>} errors
 * @returns {boolean}
 */
function areOnlyMetadataErrors(errors) {
  return errors.every((err) => {
    // Check for "must have required property 'name'" or "'label'" at root level
    if (err.path === "/" && err.message) {
      const match = err.message.match(/must have required property '(\w+)'/);
      if (match && METADATA_FIELDS.has(match[1])) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Collects all CSS custom property updates for a theme into a flat array
 * of [propertyName, value] pairs. This pre-computes the entire batch before
 * any DOM writes occur, ensuring atomicity.
 *
 * @param {Object} theme - Validated theme object
 * @returns {Array<[string, string]>} Array of [cssPropertyName, value] pairs
 */
function collectPropertyUpdates(theme) {
  const updates = [];

  // Required groups: colors, typography, shape
  if (theme.colors) {
    for (const [key, value] of Object.entries(theme.colors)) {
      updates.push([`${TOKEN_PREFIX_MAP.colors}${key}`, value]);
    }
  }

  if (theme.typography) {
    for (const [key, value] of Object.entries(theme.typography)) {
      const suffix = typographyKeyToSuffix(key);
      updates.push([`${TOKEN_PREFIX_MAP.typography}${suffix}`, value]);
    }
  }

  if (theme.shape) {
    for (const [key, value] of Object.entries(theme.shape)) {
      updates.push([`${TOKEN_PREFIX_MAP.shape}${key}`, value]);
    }
  }

  // Optional groups: spacing, shadow, motion — only set when present in theme
  if (theme.spacing) {
    for (const [key, value] of Object.entries(theme.spacing)) {
      updates.push([`${TOKEN_PREFIX_MAP.spacing}${key}`, value]);
    }
  }

  if (theme.shadow) {
    for (const [key, value] of Object.entries(theme.shadow)) {
      updates.push([`${TOKEN_PREFIX_MAP.shadow}${key}`, value]);
    }
  }

  if (theme.motion) {
    for (const [key, value] of Object.entries(theme.motion)) {
      updates.push([`${TOKEN_PREFIX_MAP.motion}${key}`, value]);
    }
  }

  return updates;
}

/**
 * Applies a validated theme object as scoped CSS custom properties on a DOM element.
 *
 * Sets CSS custom properties using the following prefix conventions:
 *   --color-{key}   for each entry in theme.colors
 *   --font-{suffix} for each entry in theme.typography
 *   --shape-{key}   for each entry in theme.shape
 *   --spacing-{key} for each entry in theme.spacing (when present)
 *   --shadow-{key}  for each entry in theme.shadow (when present)
 *   --motion-{key}  for each entry in theme.motion (when present)
 *
 * All CSS property updates are batched into a single DOM write operation:
 * updates are pre-computed without DOM interaction, then applied in one
 * uninterrupted synchronous pass. Since JavaScript is single-threaded and
 * the browser cannot repaint during synchronous execution, all property
 * updates occur within a single animation frame — preventing partial
 * rendering of mixed old and new token values during theme swaps.
 *
 * If the theme fails validation (missing required token keys or invalid values),
 * the theme is rejected entirely and the previous CSS vars on the element are preserved.
 *
 * Backward compatible: existing calls with only colors/typography/shape continue
 * to work. The return value is additive — callers that ignore it are unaffected.
 *
 * @param {HTMLElement} element - The DOM element to scope the theme to
 * @param {Object} theme - A theme object with colors, typography, shape, and optional spacing/shadow/motion
 * @returns {{ success: boolean, errors?: string[] }}
 */
export default function applyTheme(element, theme) {
  if (!element || !theme) {
    return { success: false, errors: ["Element and theme are required"] };
  }

  // Validate theme against schema
  const validation = validateTheme(theme);

  if (!validation.valid) {
    // Allow backward compatibility: if only name/label are missing, proceed.
    // This ensures existing callers passing theme objects without metadata
    // fields continue to work without modification.
    if (!areOnlyMetadataErrors(validation.errors)) {
      // Reject invalid themes entirely — preserve previous CSS vars on element
      return {
        success: false,
        errors: validation.errors.map(
          (err) => `${err.path}: ${err.message}`
        ),
      };
    }
  }

  // Batch phase: collect all property updates before touching the DOM.
  // This separation of computation from DOM mutation ensures all updates
  // are applied in a single uninterrupted write pass with no interleaved reads,
  // minimizing layout thrashing.
  const updates = collectPropertyUpdates(theme);

  // Write phase: apply all collected updates in one synchronous pass.
  // No DOM reads are interleaved between writes. The browser cannot repaint
  // during this synchronous block, so all properties update atomically
  // within a single animation frame.
  for (const [prop, value] of updates) {
    element.style.setProperty(prop, value);
  }

  return { success: true };
}
