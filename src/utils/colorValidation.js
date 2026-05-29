/**
 * Color validation utilities for the ThemePicker component.
 *
 * Validates hex color strings in the formats:
 * - #RGB (3 hex digits)
 * - #RRGGBB (6 hex digits)
 * - #RRGGBBAA (8 hex digits)
 *
 * Requirements: 5.5
 */

/**
 * Hex color validation regex.
 * Accepts: #RGB, #RRGGBB, #RRGGBBAA
 */
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/**
 * Validates a hex color string.
 * @param {string} value - The string to validate
 * @returns {boolean} True if the value is a valid hex color
 */
export function isValidHexColor(value) {
  return HEX_COLOR_REGEX.test(value);
}
