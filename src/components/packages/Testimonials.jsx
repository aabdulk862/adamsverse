import styles from "./Testimonials.module.css";

export default function Testimonials({ content, theme }) {
  const { heading, items } = content || {};

  return (
    <section className={styles.testimonials}>
      <div className={styles.inner}>
        {heading && <h2 className={styles.heading}>{heading}</h2>}
        {items && items.length > 0 && (
          <div className={styles.grid}>
            {items.map((item, index) => (
              <blockquote key={index} className={styles.card}>
                {item.quote && (
                  <p className={styles.quote}>{item.quote}</p>
                )}
                <footer className={styles.attribution}>
                  {item.author && (
                    <span className={styles.author}>{item.author}</span>
                  )}
                  {item.role && (
                    <span className={styles.role}>{item.role}</span>
                  )}
                </footer>
              </blockquote>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
