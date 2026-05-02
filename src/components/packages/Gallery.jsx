import { useState, useCallback } from "react";
import styles from "./Gallery.module.css";
import Lightbox from "./Lightbox";

const LAYOUT_CLASS_MAP = {
  professional: "galleryProfessional",
  beauty: "galleryBeauty",
  homeServices: "galleryHomeServices",
  foodHospitality: "galleryFoodHospitality",
};

export default function Gallery({ content, theme, layout }) {
  const { heading, images } = content || {};
  const [erroredImages, setErroredImages] = useState(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goToPrev = useCallback(() => {
    if (!images || images.length === 0) return;
    setLightboxIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }, [images]);

  const goToNext = useCallback(() => {
    if (!images || images.length === 0) return;
    setLightboxIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }, [images]);

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
                    style={{ cursor: "pointer" }}
                    onClick={() => openLightbox(index)}
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

      {lightboxOpen && images && images.length > 0 && (
        <Lightbox
          images={images}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
        />
      )}
    </section>
  );
}
