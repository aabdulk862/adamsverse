import { Suspense } from "react";
import { validatePackageConfig, getValidationErrors } from "../../schemas/packageSchema";
import { resolveSection, sectionRegistry } from "../../registry/sectionRegistry";
import { resolveContent } from "../../lib/contentLayer";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import SectionDivider from "./SectionDivider";
import themes from "../../data/themes";

// Direct imports for synchronous first-section rendering (no lazy-load)
import Hero from "./Hero";
import Services from "./Services";
import Gallery from "./Gallery";
import Testimonials from "./Testimonials";
import CTA from "./CTA";
import ContactSection from "./ContactSection";

/**
 * Map of section types to their synchronously-imported components.
 * Used for the first section to avoid React.lazy wrapper.
 */
const SYNC_COMPONENTS = {
  hero: Hero,
  services: Services,
  gallery: Gallery,
  testimonials: Testimonials,
  cta: CTA,
  contact: ContactSection,
};

/**
 * Checks whether a themeRef exists in the theme registry.
 * Searches all theme arrays across all packages for a matching `name` field.
 *
 * @param {string} themeRef - Theme name to look up
 * @returns {boolean} true if the theme exists in the registry
 */
function themeRefExists(themeRef) {
  for (const slug of Object.keys(themes)) {
    const packageThemes = themes[slug];
    if (packageThemes.some((t) => t.name === themeRef)) {
      return true;
    }
  }
  return false;
}

/**
 * Error UI displayed when config validation fails.
 */
function ValidationErrorUI({ errors }) {
  return (
    <div
      data-testid="section-renderer-error"
      style={{
        padding: "2rem",
        margin: "2rem auto",
        maxWidth: "600px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        color: "#991b1b",
      }}
    >
      <h2 style={{ margin: "0 0 1rem", fontSize: "1.25rem" }}>
        Invalid Package Configuration
      </h2>
      <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
        {errors.map((err, i) => (
          <li key={i} style={{ marginBottom: "0.5rem" }}>
            <strong>{err.path}</strong>: {err.message}
            {err.expected && err.expected !== "unknown" && (
              <span> (expected: {err.expected})</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Error UI displayed when themeRef doesn't match any registered theme.
 */
function ThemeRefErrorUI({ themeRef }) {
  return (
    <div
      data-testid="section-renderer-theme-error"
      style={{
        padding: "2rem",
        margin: "2rem auto",
        maxWidth: "600px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        color: "#991b1b",
      }}
    >
      <h2 style={{ margin: "0 0 1rem", fontSize: "1.25rem" }}>
        Invalid Theme Reference
      </h2>
      <p style={{ margin: 0 }}>
        The theme <strong>&quot;{themeRef}&quot;</strong> does not exist in the
        theme registry. Please use a valid theme name.
      </p>
    </div>
  );
}

/**
 * Loading fallback for lazy-loaded sections.
 */
function SectionFallback() {
  return (
    <div
      data-testid="section-loading"
      style={{
        minHeight: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.5,
      }}
    >
      Loading...
    </div>
  );
}

/**
 * Wrapper that applies scroll-triggered entrance animation to a section.
 */
function AnimatedSection({ children }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: isVisible
          ? "opacity 600ms ease-out, transform 600ms ease-out"
          : "none",
      }}
    >
      {children}
    </div>
  );
}

/**
 * SectionRenderer — Dynamic config-driven renderer that reads a Package_Config,
 * validates it, resolves sections from the registry, and renders the section
 * sequence with dividers and animations.
 *
 * @param {Object} props
 * @param {object} props.config - Package configuration object
 * @param {object} props.theme - Active theme object
 * @param {string} props.layout - Layout variant derived from category
 * @param {string} props.packageName - Display name for branding
 */
export default function SectionRenderer({ config, theme, layout, packageName }) {
  // 1. Validate config against Package_Schema
  if (!validatePackageConfig(config)) {
    const errors = getValidationErrors();
    return <ValidationErrorUI errors={errors} />;
  }

  // 2. Validate themeRef exists in theme registry
  if (config.themeRef && !themeRefExists(config.themeRef)) {
    return <ThemeRefErrorUI themeRef={config.themeRef} />;
  }

  // 3. Resolve sections from registry in configured order
  const sectionKeys = Object.keys(config.sections);

  // Filter to only renderable sections (those in the registry with resolvable content)
  const renderableSections = [];
  for (const key of sectionKeys) {
    // Check if the section type exists in the registry
    if (!sectionRegistry[key]) {
      console.warn(
        `[SectionRenderer] Unknown section type "${key}" — skipping.`
      );
      continue;
    }

    // Resolve content through the Content Layer
    const resolution = resolveContent(config, key);
    if (!resolution.success) {
      console.warn(
        `[SectionRenderer] Content resolution failed for section "${key}": ${resolution.error} — skipping.`
      );
      continue;
    }

    renderableSections.push({ key, content: resolution.content });
  }

  // 4. Render sections with dividers
  const elements = [];

  for (let i = 0; i < renderableSections.length; i++) {
    const { key, content } = renderableSections[i];
    const isFirst = i === 0;

    // Insert divider between consecutive rendered sections
    if (i > 0) {
      elements.push(
        <SectionDivider key={`divider-${i}`} layout={layout} />
      );
    }

    if (isFirst) {
      // First section (hero): render synchronously, no lazy-load, no scroll animation
      // Use direct import for synchronous rendering
      const SyncComponent = SYNC_COMPONENTS[key];
      elements.push(
        <div key={key} data-section={key} data-loading="eager">
          <SyncComponent
            content={content}
            theme={theme}
            layout={layout}
            packageName={packageName}
          />
        </div>
      );
    } else {
      // Subsequent sections: wrap in React.lazy + Suspense + scroll animation
      // Apply lazy loading for below-fold images
      const LazyComponent = resolveSection(key);
      elements.push(
        <AnimatedSection key={key}>
          <div data-section={key} data-loading="lazy">
            <Suspense fallback={<SectionFallback />}>
              <LazyComponent
                content={content}
                theme={theme}
                layout={layout}
                packageName={packageName}
              />
            </Suspense>
          </div>
        </AnimatedSection>
      );
    }
  }

  return <>{elements}</>;
}
