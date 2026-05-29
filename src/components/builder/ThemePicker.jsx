import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import themes from "../../data/themes.js";
import { isValidHexColor } from "../../utils/colorValidation.js";
import styles from "./ThemePicker.module.css";

/**
 * All 10 color tokens available for customization.
 */
const COLOR_TOKENS = [
  { key: "bgBase", label: "Background Base" },
  { key: "bgSurface", label: "Background Surface" },
  { key: "bgMuted", label: "Background Muted" },
  { key: "textPrimary", label: "Text Primary" },
  { key: "textSecondary", label: "Text Secondary" },
  { key: "textMuted", label: "Text Muted" },
  { key: "accent", label: "Accent" },
  { key: "accentHover", label: "Accent Hover" },
  { key: "accentText", label: "Accent Text" },
  { key: "border", label: "Border" },
];

/**
 * ThemePicker — Theme selection and color customization panel.
 *
 * Displays 3 theme cards for the selected package, each showing label and
 * color swatches (accent, bgBase, textPrimary). Provides a color customization
 * mode with 10 color picker inputs and hex validation. Includes a reset button
 * to restore the original theme.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 *
 * @param {Object} props
 * @param {string} props.packageSlug - Key into themes.js
 * @param {number} props.activeThemeIndex - Currently selected theme index
 * @param {Record<string, string>|null} props.customColors - Color token overrides
 * @param {(index: number) => void} props.onSelectTheme - Theme selection handler
 * @param {(tokenKey: string, value: string) => void} props.onCustomizeColor - Color customization handler
 * @param {() => void} props.onReset - Reset theme to original state
 */
export default function ThemePicker({
  packageSlug,
  activeThemeIndex,
  customColors,
  onSelectTheme,
  onCustomizeColor,
  onReset,
}) {
  const [showCustomize, setShowCustomize] = useState(false);
  const [errors, setErrors] = useState({});

  const packageThemes = themes[packageSlug] || [];

  /**
   * Get the current effective color for a token, considering custom overrides.
   */
  function getEffectiveColor(tokenKey) {
    if (customColors && customColors[tokenKey]) {
      return customColors[tokenKey];
    }
    const baseTheme = packageThemes[activeThemeIndex];
    return baseTheme?.colors?.[tokenKey] || "#000000";
  }

  /**
   * Handle color input change with hex validation.
   */
  function handleColorChange(tokenKey, value) {
    if (isValidHexColor(value)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[tokenKey];
        return next;
      });
      onCustomizeColor(tokenKey, value);
    } else {
      setErrors((prev) => ({
        ...prev,
        [tokenKey]: "Enter a valid hex color (#RGB, #RRGGBB, or #RRGGBBAA)",
      }));
    }
  }

  /**
   * Handle reset: clear errors, close customization, and call onReset.
   */
  function handleReset() {
    setErrors({});
    onReset();
  }

  const hasCustomizations = customColors && Object.keys(customColors).length > 0;

  return (
    <div className={styles.themePicker} aria-label="Theme selection">
      {/* Theme Cards */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Choose a Theme</h3>
        <div className={styles.themeGrid} role="radiogroup" aria-label="Available themes">
          {packageThemes.map((theme, index) => (
            <button
              key={theme.name}
              type="button"
              className={`${styles.themeCard} ${index === activeThemeIndex ? styles.themeCardActive : ""}`}
              onClick={() => onSelectTheme(index)}
              role="radio"
              aria-checked={index === activeThemeIndex}
              aria-label={`${theme.label} theme`}
            >
              <span className={styles.themeLabel}>{theme.label}</span>
              <div className={styles.swatchRow} aria-hidden="true">
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: theme.colors.accent }}
                  title={`Accent: ${theme.colors.accent}`}
                />
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: theme.colors.bgBase }}
                  title={`Background: ${theme.colors.bgBase}`}
                />
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: theme.colors.textPrimary }}
                  title={`Text: ${theme.colors.textPrimary}`}
                />
              </div>
              {/* Accessibility: text labels for color values (Requirement 10.6) */}
              <span className={styles.swatchLabels}>
                {theme.colors.accent} · {theme.colors.bgBase} · {theme.colors.textPrimary}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Customize Colors Toggle */}
      <div className={styles.section}>
        <button
          type="button"
          className={styles.customizeToggle}
          onClick={() => setShowCustomize((prev) => !prev)}
          aria-expanded={showCustomize}
          aria-controls="color-customization-panel"
        >
          {showCustomize ? "Hide Color Customization" : "Customize Colors"}
        </button>
      </div>

      {/* Color Customization Panel */}
      <AnimatePresence>
        {showCustomize && (
          <motion.div
            id="color-customization-panel"
            className={styles.customizePanel}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.colorGrid}>
              {COLOR_TOKENS.map(({ key, label }) => {
                const currentColor = getEffectiveColor(key);
                const hasError = !!errors[key];

                return (
                  <div key={key} className={styles.colorField}>
                    <label
                      htmlFor={`color-${key}`}
                      className={styles.colorLabel}
                    >
                      {label}
                    </label>
                    <div className={styles.colorInputRow}>
                      <input
                        type="color"
                        id={`color-picker-${key}`}
                        className={styles.colorPicker}
                        value={currentColor.length === 7 ? currentColor : "#000000"}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        aria-label={`${label} color picker`}
                      />
                      <input
                        type="text"
                        id={`color-${key}`}
                        className={`${styles.colorTextInput} ${hasError ? styles.colorTextInputError : ""}`}
                        value={customColors?.[key] || currentColor}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        placeholder={currentColor}
                        aria-label={`${label} hex value`}
                        aria-describedby={hasError ? `color-error-${key}` : undefined}
                        aria-invalid={hasError}
                      />
                      <span
                        className={styles.colorPreview}
                        style={{ backgroundColor: currentColor }}
                        aria-hidden="true"
                      />
                    </div>
                    {/* Text label showing current hex value (Requirement 10.6) */}
                    <span className={styles.colorValue}>{currentColor}</span>
                    {hasError && (
                      <span
                        id={`color-error-${key}`}
                        className={styles.colorError}
                        role="alert"
                        aria-live="polite"
                      >
                        {errors[key]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Button */}
      {hasCustomizations && (
        <div className={styles.section}>
          <button
            type="button"
            className={styles.resetButton}
            onClick={handleReset}
            aria-label="Reset theme to original colors"
          >
            Reset to Original Theme
          </button>
        </div>
      )}
    </div>
  );
}
