import styles from "./Hero.module.css";

const LAYOUT_CLASS_MAP = {
  professional: "heroProfessional",
  beauty: "heroBeauty",
  homeServices: "heroHomeServices",
  foodHospitality: "heroFoodHospitality",
};

export default function Hero({ content, theme, layout }) {
  const { headline, subheadline, ctaText } = content || {};
  const variantClass = LAYOUT_CLASS_MAP[layout];
  const heroClassName = [
    styles.hero,
    variantClass ? styles[variantClass] : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Professional layout uses a split design: text left, image placeholder right
  if (layout === "professional") {
    return (
      <section className={heroClassName} data-testid="hero">
        <div className={styles.splitInner}>
          <div className={styles.splitText}>
            {headline && <h1 className={styles.headline}>{headline}</h1>}
            {subheadline && (
              <p className={styles.subheadline}>{subheadline}</p>
            )}
            {ctaText && (
              <button type="button" className={styles.cta}>
                {ctaText}
              </button>
            )}
          </div>
          <div
            className={styles.splitImage}
            role="img"
            aria-label="Professional service image placeholder"
          />
        </div>
      </section>
    );
  }

  // Beauty, Home Services, Food & Hospitality — centered overlay text
  return (
    <section className={heroClassName} data-testid="hero">
      <div className={styles.overlay} />
      <div className={styles.inner}>
        {headline && <h1 className={styles.headline}>{headline}</h1>}
        {subheadline && <p className={styles.subheadline}>{subheadline}</p>}
        {ctaText && (
          <button type="button" className={styles.cta}>
            {ctaText}
          </button>
        )}
      </div>
    </section>
  );
}
