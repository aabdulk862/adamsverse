import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";
import packages from "../data/packages";
import styles from "./PackagesShowcase.module.css";

/**
 * PackagesShowcase — Displays at least 3 package cards from existing
 * packages data with preview images and names. Each card links to
 * /packages/:slug. Includes a link to /packages for browsing all packages.
 *
 * Uses design tokens from tokens.css for consistent styling.
 *
 * Requirements: 1.5
 */

const FEATURED_SLUGS = ["restaurant", "real-estate-agent", "auto-repair", "hair-salon"];

export default function PackagesShowcase() {
  const featuredPackages = packages.filter((p) =>
    FEATURED_SLUGS.includes(p.slug)
  );

  return (
    <section className={styles.showcase} aria-labelledby="packages-showcase-heading">
      <AnimatedSection>
        <div className={styles.container}>
          <h2 id="packages-showcase-heading" className={styles.heading}>
            Website Packages
          </h2>
          <p className={styles.subtitle}>
            Ready-to-launch designs for your industry. Preview live, pick a theme, launch.
          </p>

          <div className={styles.grid}>
            {featuredPackages.map((pkg) => (
              <Link
                key={pkg.slug}
                to={`/packages/${pkg.slug}`}
                className={styles.card}
                aria-label={`View ${pkg.name} package`}
              >
                <div className={styles.thumb}>
                  {pkg.sections?.hero?.heroImage ? (
                    <img
                      src={pkg.sections.hero.heroImage.replace("w=800", "w=400")}
                      alt={`${pkg.name} preview`}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className={styles.placeholder}>
                      <span>{pkg.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className={styles.overlay}>
                    <span className={styles.name}>{pkg.name}</span>
                    <span className={styles.category}>{pkg.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.cta}>
            <Link to="/packages" className={styles.browseLink}>
              Browse all packages <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
