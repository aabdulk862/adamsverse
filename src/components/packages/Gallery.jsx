import { useState } from "react";
import styles from "./Gallery.module.css";

const LAYOUT_CLASS_MAP = {
  professional: "galleryProfessional",
  beauty: "galleryBeauty",
  homeServices: "galleryHomeServices",
  foodHospitality: "galleryFoodHospitality",
};

export default function Gallery({ content, theme, layout }) {
  const { heading, images } = content || {};
  const [erroredImages, setErroredImages] = useState(new Set());

  const variantClass = LAYOUT_CLASS_MAP[layout];
  const sectionClassName = [
    styles.gallery,
    variantClass ? styles[variantClass] : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleImageError = (index) => {
    setErroredImages((prev) => new Set(prev).add(index));
  };

  return (
    <section className={sectionClassName}>
      <div className={styles.inner}>
        {heading && <h2 className={styles.heading}>{heading}</h2>}
        {images && images.length > 0 && (
          <div className={styles.grid}>
            {images.map((image, index) => (
              <div key={index} className={styles.imageWrapper}>
                {erroredImages.has(index) ? (
                  <div
                    className={styles.fallback}
                    role="img"
                    aria-label={image.alt || "Image unavailable"}
                  >
                    <span className={styles.fallbackText}>
                      Image unavailable
                    </span>
                  </div>
                ) : (
                  <img
                    className={styles.image}
                    src={image.src}
                    alt={image.alt || ""}
                    loading="lazy"
                    width="800"
                    height="600"
                    onError={() => handleImageError(index)}
                  />
                )}
                {layout === "professional" && image.alt && (
                  <div className={styles.caption}>{image.alt}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
