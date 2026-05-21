import styles from "./CTA.module.css";

const LAYOUT_CLASS_MAP = {
  professional: "ctaProfessional",
  beauty: "ctaBeauty",
  homeServices: "ctaHomeServices",
  foodHospitality: "ctaFoodHospitality",
};

const DEFAULT_LAYOUT = "professional";

export default function CTA({ content, theme, layout }) {
  const { heading, body, buttonText } = content || {};

  // Fall back to default layout when unknown variant is passed
  const resolvedLayout = LAYOUT_CLASS_MAP[layout] ? layout : DEFAULT_LAYOUT;
  const variantClass = LAYOUT_CLASS_MAP[resolvedLayout];
  const sectionClassName = [
    styles.cta,
    variantClass ? styles[variantClass] : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClassName}>
      <div className={styles.inner}>
        {heading && <h2 className={styles.heading}>{heading}</h2>}
        {body && <p className={styles.body}>{body}</p>}
        {buttonText && (
          <button type="button" className={styles.button}>
            {buttonText}
          </button>
        )}
      </div>
    </section>
  );
}
