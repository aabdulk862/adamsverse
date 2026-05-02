import styles from "./CTA.module.css";

const LAYOUT_CLASS_MAP = {
  professional: "ctaProfessional",
  beauty: "ctaBeauty",
  homeServices: "ctaHomeServices",
  foodHospitality: "ctaFoodHospitality",
};

export default function CTA({ content, theme, layout }) {
  const { heading, body, buttonText } = content || {};
  const variantClass = LAYOUT_CLASS_MAP[layout];
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
