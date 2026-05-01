import styles from "./Gallery.module.css";

export default function Gallery({ content, theme }) {
  const { heading, images } = content || {};

  return (
    <section className={styles.gallery}>
      <div className={styles.inner}>
        {heading && <h2 className={styles.heading}>{heading}</h2>}
        {images && images.length > 0 && (
          <div className={styles.grid}>
            {images.map((image, index) => (
              <div key={index} className={styles.imageWrapper}>
                <img
                  className={styles.image}
                  src={image.src}
                  alt={image.alt || ""}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
