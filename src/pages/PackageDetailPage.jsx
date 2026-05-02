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

const CATEGORY_LAYOUT_MAP = {
  "Professional": "professional",
  "Beauty & Wellness": "beauty",
  "Home Services": "homeServices",
  "Food & Hospitality": "foodHospitality",
};

export default function PackageDetailPage() {
  const { slug } = useParams();
  const pkg = packages.find((p) => p.slug === slug);
  const wrapperRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState(0);

  const packageThemes = themes[slug] || [];

  useEffect(() => {
    if (wrapperRef.current && packageThemes[activeTheme]) {
      applyTheme(wrapperRef.current, packageThemes[activeTheme]);
      loadFonts(packageThemes[activeTheme]);
    }
  }, [activeTheme, packageThemes]);

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

  // Derive layout from category
  const layout = CATEGORY_LAYOUT_MAP[pkg.category];
  const theme = packageThemes[activeTheme];

  return (
    <div>
      {/* Sticky Theme Toggle */}
      <div className={styles.themeToggle} data-testid="theme-toggle">
        <Link to="/packages" className={styles.backLink}>
          ← All Packages
        </Link>
        {packageThemes.length > 0 && (
          <>
            <span className={styles.themeLabel}>Theme:</span>
            {packageThemes.map((themeObj, index) => (
              <button
                key={themeObj.name}
                type="button"
                className={`${styles.themeButton}${activeTheme === index ? ` ${styles.themeButtonActive}` : ""}`}
                onClick={() => setActiveTheme(index)}
                aria-pressed={activeTheme === index}
              >
                {themeObj.label}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Preview Wrapper — theme tokens scoped here */}
      <div
        ref={wrapperRef}
        className={styles.previewWrapper}
        data-testid="preview-wrapper"
      >
        <Hero content={pkg.sections.hero} theme={theme} layout={layout} />
        <Services content={pkg.sections.services} theme={theme} layout={layout} />
        <Gallery content={pkg.sections.gallery} theme={theme} layout={layout} />
        <Testimonials content={pkg.sections.testimonials} theme={theme} layout={layout} />
        <CTA content={pkg.sections.cta} theme={theme} layout={layout} />
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
