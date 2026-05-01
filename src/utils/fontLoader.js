/**
 * Tracks font families that have already been loaded to avoid duplicate
 * <link> tag injection.
 * @type {Set<string>}
 */
const loadedFonts = new Set();

/**
 * Constructs a Google Fonts CSS2 URL for a given font family and weight list.
 *
 * @param {string} family - The font family name (e.g. "Cormorant Garamond")
 * @param {string[]} weights - Array of weight strings (e.g. ["300","400","500","700"])
 * @returns {string} The full Google Fonts URL
 */
function buildGoogleFontsUrl(family, weights) {
  const encodedFamily = family.replace(/ /g, "+");
  const weightParam = weights.join(";");
  return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weightParam}&display=swap`;
}

/**
 * Injects a Google Fonts <link> tag into document.head for the given font
 * family, unless one already exists.
 *
 * @param {string} family - The font family name
 * @param {string[]} weights - Array of weight strings
 */
function injectFontLink(family, weights) {
  // Skip if already tracked in memory
  if (loadedFonts.has(family)) {
    return;
  }

  // Also check the DOM for an existing link (covers page-reload scenarios)
  const existing = document.querySelector(
    `link[data-package-font="${family}"]`,
  );
  if (existing) {
    loadedFonts.add(family);
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = buildGoogleFontsUrl(family, weights);
  link.setAttribute("data-package-font", family);
  document.head.appendChild(link);

  loadedFonts.add(family);
}

/**
 * Loads Google Fonts for the display and body font families defined in a
 * theme's typography tokens. Skips duplicate injections for fonts that have
 * already been loaded.
 *
 * @param {Object} theme - A theme object with a `typography` group containing
 *   fontDisplay, fontBody, weightLight, weightRegular, weightMedium, and
 *   weightBold keys.
 */
export default function loadFonts(theme) {
  if (!theme || !theme.typography) {
    return;
  }

  const {
    fontDisplay,
    fontBody,
    weightLight,
    weightRegular,
    weightMedium,
    weightBold,
  } = theme.typography;

  const weights = [weightLight, weightRegular, weightMedium, weightBold].filter(
    Boolean,
  );

  if (fontDisplay) {
    injectFontLink(fontDisplay, weights);
  }

  if (fontBody) {
    injectFontLink(fontBody, weights);
  }
}

/**
 * Resets the internal loaded-fonts tracker. Useful for testing.
 */
export function _resetLoadedFonts() {
  loadedFonts.clear();
}
