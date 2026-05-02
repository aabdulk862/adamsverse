import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import packages from "../data/packages";
import themes from "../data/themes";
import applyTheme from "../utils/applyTheme";
import loadFonts from "../utils/fontLoader";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import Hero from "../components/packages/Hero";
import Services from "../components/packages/Services";
import Gallery from "../components/packages/Gallery";
import Testimonials from "../components/packages/Testimonials";
import CTA from "../components/packages/CTA";
import SectionDivider from "../components/packages/SectionDivider";
import styles from "./PackageDetailPage.module.css";

const CATEGORY_LAYOUT_MAP = {
  Professional: "professional",
  "Beauty & Wellness": "beauty",
  "Home Services": "homeServices",
  "Food & Hospitality": "foodHospitality",
};

const LAYOUT_SPACING_MAP = {
  professional: styles.spacingProfessional,
  beauty: styles.spacingBeauty,
  homeServices: styles.spacingHomeServices,
  foodHospitality: styles.spacingFoodHospitality,
};

export default function PackageDetailPage() {
  const { slug } = useParams();
  const pkg = packages.find((p) => p.slug === slug);
  const wrapperRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState(0);

  const packageThemes = themes[slug] || [];

  // Scroll animation hooks — one per animated section (Hero is exempt)
  // Hooks must be called unconditionally (before any early returns)
  const servicesAnim = useScrollAnimation();
  const galleryAnim = useScrollAnimation();
  const testimonialsAnim = useScrollAnimation();
  const ctaAnim = useScrollAnimation();

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
  const activeAccentColor = theme?.colors?.accent || null;

  return (
    <div>
      {/* Sticky Theme Toggle */}
      <div
        className={styles.themeToggle}
        data-testid="theme-toggle"
        style={activeAccentColor ? { "--theme-accent": activeAccentColor } : undefined}
      >
        <Link to="/packages" className={styles.backLink}>
          ← All Packages
        </Link>
        <div className={styles.packageInfo}>
          <span className={styles.packageInfoName}>{pkg.name}</span>
          <span className={styles.packageInfoCategory}>{pkg.category}</span>
        </div>
        {packageThemes.length > 0 && (
          <div className={styles.themeButtonsRow}>
            <span className={styles.themeLabel}>Theme:</span>
            {packageThemes.map((themeObj, index) => (
              <button
                key={themeObj.name}
                type="button"
                className={`${styles.themeButton}${activeTheme === index ? ` ${styles.themeButtonActive}` : ""}`}
                onClick={() => setActiveTheme(index)}
                aria-pressed={activeTheme === index}
                style={
                  activeTheme === index && themeObj.colors?.accent
                    ? { borderColor: themeObj.colors.accent, color: themeObj.colors.accent }
                    : undefined
                }
              >
                <span
                  className={styles.themeSwatch}
                  style={{ backgroundColor: themeObj.colors?.accent || "var(--accent-primary)" }}
                  aria-hidden="true"
                />
                {themeObj.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview Wrapper — theme tokens scoped here */}
      <div
        ref={wrapperRef}
        className={`${styles.previewWrapper}${LAYOUT_SPACING_MAP[layout] ? ` ${LAYOUT_SPACING_MAP[layout]}` : ""}`}
        data-testid="preview-wrapper"
      >
        <Hero content={pkg.sections.hero} theme={theme} layout={layout} packageName={pkg.name} />

        <SectionDivider layout={layout} />

        <div
          ref={servicesAnim.ref}
          className={`${styles.sectionAnimated} ${servicesAnim.isVisible ? styles.sectionVisible : ""}`}
        >
          <Services
            content={pkg.sections.services}
            theme={theme}
            layout={layout}
          />
        </div>

        <SectionDivider layout={layout} />

        <div
          ref={galleryAnim.ref}
          className={`${styles.sectionAnimated} ${galleryAnim.isVisible ? styles.sectionVisible : ""}`}
        >
          <Gallery content={pkg.sections.gallery} theme={theme} layout={layout} />
        </div>

        <SectionDivider layout={layout} />

        <div
          ref={testimonialsAnim.ref}
          className={`${styles.sectionAnimated} ${testimonialsAnim.isVisible ? styles.sectionVisible : ""}`}
        >
          <Testimonials
            content={pkg.sections.testimonials}
            theme={theme}
            layout={layout}
          />
        </div>

        <SectionDivider layout={layout} />

        <div
          ref={ctaAnim.ref}
          className={`${styles.sectionAnimated} ${ctaAnim.isVisible ? styles.sectionVisible : ""}`}
        >
          <CTA content={pkg.sections.cta} theme={theme} layout={layout} />
        </div>
      </div>

      {/* Persistent "Get Started" CTA */}
      <div
        className={styles.persistentCta}
        style={activeAccentColor ? { "--theme-accent": activeAccentColor } : undefined}
      >
        <span>Like what you see?</span>
        <Link to="/contact" className={styles.persistentCtaButton}>
          Get Started
        </Link>
      </div>
    </div>
  );
}
