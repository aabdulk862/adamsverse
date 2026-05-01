import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import packages from "../data/packages";
import themes from "../data/themes";
import applyTheme from "../utils/applyTheme";
import loadFonts from "../utils/fontLoader";
import Hero from "../components/packages/Hero";
import Services from "../components/packages/Services";
import Gallery from "../components/packages/Gallery";
import Testimonials from "../components/packages/Testimonials";
import CTA from "../components/packages/CTA";
import styles from "./PackageDetailPage.module.css";

const THEME_KEYS = ["luxury", "light", "feminine"];

export default function PackageDetailPage() {
  const { slug } = useParams();
  const pkg = packages.find((p) => p.slug === slug);
  const wrapperRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState("luxury");

  useEffect(() => {
    if (wrapperRef.current && themes[activeTheme]) {
      applyTheme(wrapperRef.current, themes[activeTheme]);
      loadFonts(themes[activeTheme]);
    }
  }, [activeTheme]);

  // Package not found
  if (!pkg) {
    return (
      <div className="container">
        <div className={styles.notFound} data-testid="not-found">
          <h2>Package Not Found</h2>
          <p>
            The package you&apos;re looking for doesn&apos;t exist or may have
            been removed.
          </p>
          <Link to="/packages" className={styles.backLink}>
            ← Back to Packages
          </Link>
        </div>
      </div>
    );
  }

  // Valid slug but not restaurant — coming soon
  if (slug !== "restaurant") {
    return (
      <div className="container">
        <div className={styles.comingSoon} data-testid="coming-soon">
          <h2>{pkg.name}</h2>
          <p>This package is coming soon. Check back for the full preview.</p>
          <Link to="/packages" className={styles.backLink}>
            ← Back to Packages
          </Link>
        </div>
      </div>
    );
  }

  // Restaurant — full preview
  const theme = themes[activeTheme];

  return (
    <div>
      {/* Sticky Theme Toggle */}
      <div className={styles.themeToggle} data-testid="theme-toggle">
        <Link to="/packages" className={styles.backLink}>
          ← All Packages
        </Link>
        <span className={styles.themeLabel}>Theme:</span>
        {THEME_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`${styles.themeButton}${activeTheme === key ? ` ${styles.themeButtonActive}` : ""}`}
            onClick={() => setActiveTheme(key)}
            aria-pressed={activeTheme === key}
          >
            {themes[key].label}
          </button>
        ))}
        <span className={styles.themeHint}>More themes coming soon</span>
      </div>

      {/* Preview Wrapper — theme tokens scoped here */}
      <div
        ref={wrapperRef}
        className={styles.previewWrapper}
        data-testid="preview-wrapper"
      >
        <Hero content={pkg.sections.hero} theme={theme} />
        <Services content={pkg.sections.services} theme={theme} />
        <Gallery content={pkg.sections.gallery} theme={theme} />
        <Testimonials content={pkg.sections.testimonials} theme={theme} />
        <CTA content={pkg.sections.cta} theme={theme} />
      </div>

      {/* Persistent "Get Started" CTA */}
      <div className={styles.persistentCta}>
        <span>Like what you see?</span>
        <Link to="/contact" className={styles.persistentCtaButton}>
          Get Started
        </Link>
      </div>
    </div>
  );
}
