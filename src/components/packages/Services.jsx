import styles from "./Services.module.css";

const LAYOUT_CLASS_MAP = {
  professional: "servicesProfessional",
  beauty: "servicesBeauty",
  homeServices: "servicesHomeServices",
  foodHospitality: "servicesFoodHospitality",
};

// Layouts where the icon renders inline before the title in a flex row
const INLINE_ICON_LAYOUTS = new Set(["professional", "homeServices"]);

const DEFAULT_LAYOUT = "professional";

export default function Services({ content, theme, layout }) {
  const { heading, items } = content || {};

  // Fall back to default layout when unknown variant is passed
  const resolvedLayout = LAYOUT_CLASS_MAP[layout] ? layout : DEFAULT_LAYOUT;
  const variantClass = LAYOUT_CLASS_MAP[resolvedLayout];
  const sectionClassName = [
    styles.services,
    variantClass ? styles[variantClass] : "",
  ]
    .filter(Boolean)
    .join(" ");

  const isInlineIcon = INLINE_ICON_LAYOUTS.has(resolvedLayout);

  return (
    <section className={sectionClassName}>
      <div className={styles.inner}>
        {heading && <h2 className={styles.heading}>{heading}</h2>}
        {items && items.length > 0 && (
          <div className={styles.grid}>
            {items.map((item, index) => (
              <div key={index} className={styles.card}>
                {resolvedLayout === "professional" && (
                  <span className={styles.cardNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}
                {/* Beauty & Food & Hospitality: icon centered above the title */}
                {item.icon && !isInlineIcon && (
                  <span className={`${styles.serviceIcon} ${styles.serviceIconCentered}`}>
                    {item.icon}
                  </span>
                )}
                {/* Professional & Home Services: icon inline before the title */}
                {isInlineIcon && item.icon ? (
                  <div className={styles.titleRow}>
                    <span className={styles.serviceIcon}>{item.icon}</span>
                    {item.title && (
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                    )}
                  </div>
                ) : (
                  item.title && (
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                  )
                )}
                {item.description && (
                  <p className={styles.cardDescription}>{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
