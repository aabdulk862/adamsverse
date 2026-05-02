import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import packages from "../data/packages";
import styles from "./PackagesPage.module.css";

export const CATEGORY_COLORS = {
  "Professional": {
    accent: "#2563eb",
    accentLight: "#dbeafe",
    border: "#93c5fd",
    gradient: "linear-gradient(135deg, #1e3a5f, #2563eb)"
  },
  "Beauty & Wellness": {
    accent: "#d946ef",
    accentLight: "#fae8ff",
    border: "#e879f9",
    gradient: "linear-gradient(135deg, #701a75, #d946ef)"
  },
  "Home Services": {
    accent: "#16a34a",
    accentLight: "#dcfce7",
    border: "#86efac",
    gradient: "linear-gradient(135deg, #14532d, #16a34a)"
  },
  "Food & Hospitality": {
    accent: "#ea580c",
    accentLight: "#fff7ed",
    border: "#fdba74",
    gradient: "linear-gradient(135deg, #7c2d12, #ea580c)"
  }
};

const categoryOrder = [
  "Professional",
  "Beauty & Wellness",
  "Home Services",
  "Food & Hospitality",
];

/**
 * Derives a thumbnail URL from a gallery image src by replacing w=800 with w=400.
 */
function getThumbnailUrl(galleryImageSrc) {
  if (!galleryImageSrc) return null;
  return galleryImageSrc.replace("w=800", "w=400");
}

function PackageCard({ pkg, categoryColors }) {
  const [imgError, setImgError] = useState(false);

  const firstImage = pkg.sections?.gallery?.images?.[0];
  const thumbnailSrc = firstImage ? getThumbnailUrl(firstImage.src) : null;
  const thumbnailAlt = firstImage?.alt || `${pkg.name} preview`;

  const handleImgError = useCallback(() => {
    setImgError(true);
  }, []);

  return (
    <div
      className={styles.card}
      data-testid="package-card"
      style={{
        '--category-accent': categoryColors.accent,
        '--category-border': categoryColors.border,
        '--category-accent-light': categoryColors.accentLight,
      }}
    >
      <div className={styles.cardThumbnailWrapper}>
        {thumbnailSrc && !imgError ? (
          <img
            src={thumbnailSrc}
            alt={thumbnailAlt}
            className={styles.cardThumbnail}
            loading="lazy"
            width={400}
            height={250}
            onError={handleImgError}
          />
        ) : (
          <div
            className={styles.cardThumbnailPlaceholder}
            style={{ backgroundColor: categoryColors.accentLight }}
            role="img"
            aria-label={`${pkg.name} placeholder`}
          >
            <span className={styles.placeholderIcon}>🖼</span>
          </div>
        )}
      </div>
      <h3 className={styles.cardName}>{pkg.name}</h3>
      <p className={styles.cardDescription}>{pkg.description}</p>
      <div className={styles.cardActions}>
        <Link
          to={`/packages/${pkg.slug}`}
          className={styles.previewLink}
        >
          Preview
        </Link>
        <Link to="/contact" className={styles.ctaButton}>
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default function PackagesPage() {
  const grouped = categoryOrder.map((cat) => ({
    category: cat,
    items: packages.filter((pkg) => pkg.category === cat),
  }));

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Packages</h1>
        <p className="page-subtitle">
          Browse our AI-powered website packages. Preview any design and make it
          yours.
        </p>
      </div>

      <div className={styles.pricingNote}>
        <p><strong>Base fee</strong> per package · determined by project scope</p>
        <span className={styles.pricingDivider}></span>
        <p><strong>Maintenance</strong> available · billed monthly</p>
        <span className={styles.pricingDivider}></span>
        <p><strong>Custom requests</strong> welcome · <Link to="/contact">let's talk</Link></p>
      </div>

      {grouped.map((group) => {
        const colors = CATEGORY_COLORS[group.category] || {};
        return (
          <section key={group.category} className={styles.categorySection}>
            <h2 className={styles.categoryHeading}>
              {group.category}
            </h2>
            <div className={styles.grid}>
              {group.items.map((pkg) => (
                <PackageCard
                  key={pkg.slug}
                  pkg={pkg}
                  categoryColors={colors}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
