import styles from "./SectionDivider.module.css";

/**
 * SectionDivider — Decorative divider rendered between consecutive sections.
 *
 * Accepts a `layout` prop and renders a layout-specific divider element
 * styled with CSS custom properties from applyTheme() so it adapts on
 * theme switch.
 *
 * - professional:      thin 1px <hr>, theme border color, 60% width, centered
 * - beauty:            inline SVG wave/arc, filled with theme bgMuted color
 * - homeServices:      bold 4px <div> bar, full width, theme accent color
 * - foodHospitality:   gradient fade from transparent → bgMuted → transparent
 *
 * Returns null for unrecognized layout values.
 */
export default function SectionDivider({ layout }) {
  if (layout === "professional") {
    return (
      <hr
        className={styles.professional}
        aria-hidden="true"
        data-testid="section-divider"
      />
    );
  }

  if (layout === "beauty") {
    return (
      <div
        className={styles.beauty}
        aria-hidden="true"
        data-testid="section-divider"
      >
        <svg
          className={styles.wave}
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30"
            fill="none"
            stroke="var(--color-bgMuted)"
            strokeWidth="3"
          />
          <path
            d="M0,60 C200,30 400,60 600,30 C800,0 1000,30 1200,0 L1200,60 Z"
            fill="var(--color-bgMuted)"
            opacity="0.4"
          />
        </svg>
      </div>
    );
  }

  if (layout === "homeServices") {
    return (
      <div
        className={styles.homeServices}
        aria-hidden="true"
        data-testid="section-divider"
      />
    );
  }

  if (layout === "foodHospitality") {
    return (
      <div
        className={styles.foodHospitality}
        aria-hidden="true"
        data-testid="section-divider"
      />
    );
  }

  // Unrecognized layout — render nothing
  return null;
}
