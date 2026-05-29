import { useRef, useEffect } from "react";
import SectionRenderer from "../packages/SectionRenderer";
import applyTheme from "../../utils/applyTheme";
import loadFonts from "../../utils/fontLoader";
import styles from "./LivePreview.module.css";

/**
 * CATEGORY_LAYOUT_MAP — maps business categories to layout variant strings.
 * Duplicated from PackageDetailPage to keep LivePreview self-contained.
 */
const CATEGORY_LAYOUT_MAP = {
  Professional: "professional",
  "Beauty & Wellness": "beauty",
  "Home Services": "homeServices",
  "Food & Hospitality": "foodHospitality",
};

/**
 * LivePreview — real-time rendered preview using SectionRenderer.
 * Applies theme tokens via applyTheme on a scoped container element
 * and loads Google Fonts via loadFonts when the theme changes.
 *
 * Reusable: can be imported by the dashboard for "Preview Site" modal (Phase 2).
 *
 * @param {Object} props
 * @param {object|null} props.config - Package_Config to render
 * @param {object|null} props.theme - Active theme object (colors, typography, shape, etc.)
 * @param {string} props.layout - Layout variant string (e.g. "professional", "beauty")
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */
export default function LivePreview({ config, theme, layout }) {
  const containerRef = useRef(null);

  // Apply theme tokens as CSS custom properties on the scoped container
  useEffect(() => {
    if (containerRef.current && theme) {
      applyTheme(containerRef.current, theme);
      loadFonts(theme);
    }
  }, [theme]);

  // Handle empty/null config gracefully — show placeholder
  if (!config || !config.sections) {
    return (
      <div
        className={styles.previewContainer}
        role="region"
        aria-label="Website preview"
      >
        <div className={styles.placeholder}>
          <p>Select a template to see your website preview.</p>
        </div>
      </div>
    );
  }

  // Derive layout from config category if not explicitly provided
  const resolvedLayout =
    layout || CATEGORY_LAYOUT_MAP[config.category] || "professional";

  return (
    <div
      ref={containerRef}
      className={styles.previewContainer}
      role="region"
      aria-label="Website preview"
    >
      <SectionRenderer
        config={config}
        theme={theme}
        layout={resolvedLayout}
        packageName={config.name || ""}
      />
    </div>
  );
}
