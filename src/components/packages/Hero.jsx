import styles from "./Hero.module.css";

export default function Hero({ content, theme }) {
  const { headline, subheadline, ctaText } = content || {};

  return (
    <section className={styles.hero}>
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
