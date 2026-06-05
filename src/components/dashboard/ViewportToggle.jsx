import styles from "./ViewportToggle.module.css";

const VIEWPORTS = [
  { key: "desktop", icon: "fa-solid fa-desktop", label: "Desktop (1280px)" },
  { key: "tablet", icon: "fa-solid fa-tablet-screen-button", label: "Tablet (768px)" },
  { key: "phone", icon: "fa-solid fa-mobile-screen-button", label: "Phone (375px)" },
];

/**
 * ViewportToggle — toolbar with desktop/tablet/phone preview width options.
 * Hidden on screens < 1024px via CSS.
 */
export default function ViewportToggle({ activeViewport, onChange }) {
  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Preview viewport">
      {VIEWPORTS.map(({ key, icon, label }) => (
        <button
          key={key}
          type="button"
          className={`${styles.btn}${activeViewport === key ? ` ${styles.active}` : ""}`}
          aria-pressed={activeViewport === key}
          aria-label={label}
          onClick={() => onChange(key)}
        >
          <i className={icon} />
        </button>
      ))}
    </div>
  );
}
