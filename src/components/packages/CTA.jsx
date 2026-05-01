import styles from "./CTA.module.css";

export default function CTA({ content, theme }) {
  const { heading, body, buttonText } = content || {};

  return (
    <section className={styles.cta}>
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
