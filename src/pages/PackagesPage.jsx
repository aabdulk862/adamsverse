import { Link } from "react-router-dom";
import packages from "../data/packages";
import styles from "./PackagesPage.module.css";

const categoryOrder = [
  "Professional",
  "Beauty & Wellness",
  "Home Services",
  "Food & Hospitality",
];

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
        <div className={styles.pricingNote}>
          <p><strong>Base fee</strong> per package · determined by project scope</p>
          <span className={styles.pricingDivider}></span>
          <p><strong>Maintenance</strong> available · billed monthly</p>
          <span className={styles.pricingDivider}></span>
          <p><strong>Custom requests</strong> welcome · <Link to="/contact">let's talk</Link></p>
        </div>
      </div>

      {grouped.map((group) => (
        <section key={group.category} className={styles.categorySection}>
          <h2 className={styles.categoryHeading}>{group.category}</h2>
          <div className={styles.grid}>
            {group.items.map((pkg) => (
              <div key={pkg.slug} className={styles.card} data-testid="package-card">
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
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
