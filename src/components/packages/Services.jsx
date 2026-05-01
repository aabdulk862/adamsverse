import styles from "./Services.module.css";

export default function Services({ content, theme }) {
  const { heading, items } = content || {};

  return (
    <section className={styles.services}>
      <div className={styles.inner}>
        {heading && <h2 className={styles.heading}>{heading}</h2>}
        {items && items.length > 0 && (
          <div className={styles.grid}>
            {items.map((item, index) => (
              <div key={index} className={styles.card}>
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
