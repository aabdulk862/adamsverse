import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import packages from "../data/packages";
import themes from "../data/themes";
import applyTheme from "../utils/applyTheme";
import loadFonts from "../utils/fontLoader";
import SectionRenderer from "../components/packages/SectionRenderer";
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

  useEffect(() => {
    if (wrapperRef.current && packageThemes[activeTheme]) {
      applyTheme(wrapperRef.current, packageThemes[activeTheme]);
      loadFonts(packageThemes[activeTheme]);
    }
  }, [activeTheme, packageThemes]);

  // Set document title and OG meta tags
  useEffect(() => {
    if (pkg) {
      document.title = `${pkg.name} Website Package — Adverse Solutions`;

      const setMeta = (property, content) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("property", property);
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
      };

      setMeta("og:title", `${pkg.name} Website Package — Adverse Solutions`);
      setMeta("og:description", pkg.description);
      setMeta("og:type", "website");
      if (pkg.sections?.hero?.heroImage) {
        setMeta("og:image", pkg.sections.hero.heroImage);
      }
    }
  }, [pkg]);

  // Build contact link with package + theme params
  const contactLink = useMemo(() => {
    if (!pkg) return "/contact";
    const theme = packageThemes[activeTheme];
    const params = new URLSearchParams();
    params.set("package", pkg.name);
    if (theme?.label) params.set("theme", theme.label);
    return `/contact?${params.toString()}`;
  }, [pkg, packageThemes, activeTheme]);

  // Construct Package_Config from existing package data for SectionRenderer
  const config = useMemo(() => {
    if (!pkg) return null;
    const firstThemeName = packageThemes[0]?.name || "";
    return {
      slug: pkg.slug,
      name: pkg.name,
      category: pkg.category,
      description: pkg.description || "",
      packageType: pkg.packageType || "static",
      themeRef: pkg.themeRef || firstThemeName,
      sections: pkg.sections,
      ...(pkg.metadata ? { metadata: pkg.metadata } : {}),
    };
  }, [pkg, packageThemes]);

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
        style={
          activeAccentColor
            ? { "--theme-accent": activeAccentColor }
            : undefined
        }
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
                    ? {
                        borderColor: themeObj.colors.accent,
                        color: themeObj.colors.accent,
                      }
                    : undefined
                }
              >
                <span
                  className={styles.themeSwatch}
                  style={{
                    backgroundColor:
                      themeObj.colors?.accent || "var(--accent-primary)",
                  }}
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
        <SectionRenderer
          config={config}
          theme={theme}
          layout={layout}
          packageName={pkg.name}
        />
      </div>

      {/* Persistent "Get Started" CTA */}
      <div
        className={styles.persistentCta}
        style={
          activeAccentColor
            ? { "--theme-accent": activeAccentColor }
            : undefined
        }
      >
        <span>
          Launch with {pkg.name} · {theme?.label || "Default"}
        </span>
        <Link to={contactLink} className={styles.persistentCtaButton}>
          Get Started
        </Link>
      </div>
    </div>
  );
}
