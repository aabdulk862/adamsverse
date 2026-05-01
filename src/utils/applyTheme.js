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
 * Applies a theme object as scoped CSS custom properties on a DOM element.
 *
 * Sets:
 *   --color-{key} for each entry in theme.colors
 *   --font-{suffix} for each entry in theme.typography
 *   --shape-{key} for each entry in theme.shape
 *
 * @param {HTMLElement} element - The DOM element to scope the theme to
 * @param {Object} theme - A theme object with colors, typography, and shape groups
 */
export default function applyTheme(element, theme) {
  if (!element || !theme) {
    return;
  }

  if (theme.colors) {
    for (const [key, value] of Object.entries(theme.colors)) {
      element.style.setProperty(`--color-${key}`, value);
    }
  }

  if (theme.typography) {
    for (const [key, value] of Object.entries(theme.typography)) {
      const suffix = typographyKeyToSuffix(key);
      element.style.setProperty(`--font-${suffix}`, value);
    }
  }

  if (theme.shape) {
    for (const [key, value] of Object.entries(theme.shape)) {
      element.style.setProperty(`--shape-${key}`, value);
    }
  }
}
