import styles from "./Services.module.css";

const LAYOUT_CLASS_MAP = {
  professional: "servicesProfessional",
  beauty: "servicesBeauty",
  homeServices: "servicesHomeServices",
  foodHospitality: "servicesFoodHospitality",
};

export default function Services({ content, theme, layout }) {
  const { heading, items } = content || {};
  const variantClass = LAYOUT_CLASS_MAP[layout];
  const sectionClassName = [
    styles.services,
    variantClass ? styles[variantClass] : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClassName}>
      <div className={styles.inner}>
        {heading && <h2 className={styles.heading}>{heading}</h2>}
        {items && items.length > 0 && (
          <div className={styles.grid}>
            {items.map((item, index) => (
              <div key={index} className={styles.card}>
                {layout === "professional" && (
                  <span className={styles.cardNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}
                {item.title && (
                  <h3 className={styles.cardTitle}>{item.title}</h3>
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
