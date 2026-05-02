import { useState } from "react";
import styles from "./Hero.module.css";

const LAYOUT_CLASS_MAP = {
  professional: "heroProfessional",
  beauty: "heroBeauty",
  homeServices: "heroHomeServices",
  foodHospitality: "heroFoodHospitality",
};

export default function Hero({ content, theme, layout, packageName }) {
  const { headline, subheadline, ctaText, heroImage } = content || {};
  const [imageError, setImageError] = useState(false);

  const variantClass = LAYOUT_CLASS_MAP[layout];
  const heroClassName = [styles.hero, variantClass ? styles[variantClass] : ""]
    .filter(Boolean)
    .join(" ");

  const hasImage = heroImage && !imageError;

  // Professional layout: split on desktop, full-bleed on mobile
  if (layout === "professional") {
    const bgStyle = hasImage
      ? { backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }
      : undefined;

    return (
      <section className={heroClassName} data-testid="hero" style={bgStyle}>
        {/* Mobile: overlay for text legibility over background image */}
        <div className={styles.mobileOverlay} />
        {/* Hidden img to detect load failure */}
        {heroImage && !imageError && (
          <img
            src={heroImage}
            alt=""
            onError={() => setImageError(true)}
            style={{ display: "none" }}
          />
        )}
        {/* Mobile: centered text overlay (visible < 768px) */}
        <div className={styles.mobileContent}>
          {packageName && (
            <span className={styles.brandingLabel}>{packageName}</span>
          )}
          {headline && <h1 className={styles.headline}>{headline}</h1>}
          {subheadline && <p className={styles.subheadline}>{subheadline}</p>}
          {ctaText && (
            <button type="button" className={styles.cta}>
              {ctaText}
            </button>
          )}
        </div>
        {/* Desktop: split layout (visible >= 768px) */}
        <div className={styles.splitInner}>
          <div className={styles.splitText}>
            {packageName && (
              <span className={styles.brandingLabel}>{packageName}</span>
            )}
            {headline && <h1 className={styles.headline}>{headline}</h1>}
            {subheadline && <p className={styles.subheadline}>{subheadline}</p>}
            {ctaText && (
              <button type="button" className={styles.cta}>
                {ctaText}
              </button>
            )}
          </div>
          {hasImage ? (
            <div className={styles.splitImage}>
              <img
                src={heroImage}
                alt=""
                className={styles.heroImage}
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div
              className={styles.splitImage}
              role="img"
              aria-label="Professional service image placeholder"
            >
              <span className={styles.photoPlaceholder}>
                Add your photo here
              </span>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Beauty, Home Services, Food & Hospitality — centered overlay text
  const bgStyle = hasImage
    ? { backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : undefined;

  const showBgPhotoHint =
    !hasImage && (layout === "homeServices" || layout === "foodHospitality");

  return (
    <section className={heroClassName} data-testid="hero" style={bgStyle}>
      <div className={styles.overlay} />
      {showBgPhotoHint && (
        <span className={styles.bgPhotoPlaceholder}>Add your photo here</span>
      )}
      {heroImage && !imageError && (
        <img
          src={heroImage}
          alt=""
          onError={() => setImageError(true)}
          style={{ display: "none" }}
        />
      )}
      <div className={styles.inner}>
        {packageName && (
          <span className={styles.brandingLabel}>{packageName}</span>
        )}
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
