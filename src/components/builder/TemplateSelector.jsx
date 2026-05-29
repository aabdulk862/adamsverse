import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import packages from "../../data/packages.js";
import styles from "./TemplateSelector.module.css";

/**
 * Category definitions derived from the 12 packages in packages.js.
 * Each category maps to a set of package slugs.
 */
const CATEGORIES = [
  {
    name: "Food & Hospitality",
    icon: "🍽️",
    description: "Restaurants, cafes, and hotels",
  },
  {
    name: "Beauty & Wellness",
    icon: "✨",
    description: "Salons, studios, and fitness",
  },
  {
    name: "Home Services",
    icon: "🏠",
    description: "Repair, cleaning, and landscaping",
  },
  {
    name: "Professional",
    icon: "💼",
    description: "Agents, photographers, and attorneys",
  },
];

/**
 * TemplateSelector — Step 1 of the builder flow.
 * Displays category filter cards and a responsive template grid.
 *
 * Props:
 * - onSelectTemplate: (slug: string) => void — called when user picks a template
 * - onSelectBlank: () => void — called when user picks "Start Blank"
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
export default function TemplateSelector({ onSelectTemplate, onSelectBlank }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categoryRefs = useRef([]);
  const templateRefs = useRef([]);

  const filteredPackages = selectedCategory
    ? packages.filter((pkg) => pkg.category === selectedCategory)
    : [];

  /**
   * Handle arrow key navigation within the category radiogroup.
   */
  const handleCategoryKeyDown = (e, index) => {
    let nextIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % CATEGORIES.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + CATEGORIES.length) % CATEGORIES.length;
    } else {
      return;
    }
    categoryRefs.current[nextIndex]?.focus();
    setSelectedCategory(CATEGORIES[nextIndex].name);
  };

  /**
   * Handle arrow key navigation within the template grid.
   */
  const handleTemplateKeyDown = (e, index) => {
    let nextIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % filteredPackages.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + filteredPackages.length) % filteredPackages.length;
    } else {
      return;
    }
    templateRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={styles.selector}>
      <header className={styles.header}>
        <h2 className={styles.title}>Choose Your Starting Point</h2>
        <p className={styles.subtitle}>
          Pick a business category to see relevant templates, or start with a
          blank canvas.
        </p>
      </header>

      {/* Category filter cards */}
      <div
        className={styles.categories}
        role="radiogroup"
        aria-label="Business categories"
      >
        {CATEGORIES.map((cat, index) => (
          <button
            key={cat.name}
            type="button"
            ref={(el) => (categoryRefs.current[index] = el)}
            className={`${styles.categoryCard} ${
              selectedCategory === cat.name ? styles.categoryActive : ""
            }`}
            onClick={() => setSelectedCategory(cat.name)}
            onKeyDown={(e) => handleCategoryKeyDown(e, index)}
            role="radio"
            aria-checked={selectedCategory === cat.name}
            aria-label={cat.name}
            tabIndex={selectedCategory === cat.name || (!selectedCategory && index === 0) ? 0 : -1}
          >
            <span className={styles.categoryIcon} aria-hidden="true">
              {cat.icon}
            </span>
            <span className={styles.categoryName}>{cat.name}</span>
            <span className={styles.categoryDesc}>{cat.description}</span>
          </button>
        ))}
      </div>

      {/* Template grid */}
      <AnimatePresence mode="wait">
        {selectedCategory && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={styles.templateSection}
          >
            <h3 className={styles.sectionHeading}>
              {selectedCategory} Templates
            </h3>

            {filteredPackages.length > 0 ? (
              <div className={styles.templateGrid} role="grid" aria-label="Available templates">
                {filteredPackages.map((pkg, index) => (
                  <motion.button
                    key={pkg.slug}
                    type="button"
                    ref={(el) => (templateRefs.current[index] = el)}
                    className={styles.templateCard}
                    onClick={() => onSelectTemplate(pkg.slug)}
                    onKeyDown={(e) => handleTemplateKeyDown(e, index)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.05 }}
                    aria-label={`Select ${pkg.name} template`}
                  >
                    <div className={styles.templateThumb}>
                      {pkg.sections?.hero?.heroImage ? (
                        <img
                          src={pkg.sections.hero.heroImage}
                          alt={`${pkg.name} preview`}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.templatePlaceholder}>
                          <span aria-hidden="true">🖼️</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.templateInfo}>
                      <span className={styles.templateName}>{pkg.name}</span>
                      <span className={styles.templateDesc}>
                        {pkg.description}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState} role="status">
                <p>No templates available for this category yet.</p>
                <button
                  type="button"
                  className={styles.blankButton}
                  onClick={onSelectBlank}
                >
                  Start with a Blank Template
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Blank option — always visible */}
      <div className={styles.blankSection}>
        <button
          type="button"
          className={styles.blankCard}
          onClick={onSelectBlank}
          aria-label="Start with a blank template"
        >
          <div className={styles.blankIcon} aria-hidden="true">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <div className={styles.blankInfo}>
            <span className={styles.blankTitle}>Start Blank</span>
            <span className={styles.blankDesc}>
              Begin with all 6 sections and placeholder content. Customize
              everything from scratch.
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
