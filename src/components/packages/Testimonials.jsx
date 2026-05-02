import styles from "./Testimonials.module.css";

const LAYOUT_CLASS_MAP = {
  professional: "testimonialsProfessional",
  beauty: "testimonialsBeauty",
  homeServices: "testimonialsHomeServices",
  foodHospitality: "testimonialsFoodHospitality",
};

export default function Testimonials({ content, theme, layout }) {
  const { heading, items } = content || {};
  const variantClass = LAYOUT_CLASS_MAP[layout];
  const sectionClassName = [
    styles.testimonials,
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
              <blockquote key={index} className={styles.card}>
                {layout === "homeServices" && (
                  <div className={styles.stars} aria-label="5 out of 5 stars">
                    ★★★★★
                  </div>
                )}
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
