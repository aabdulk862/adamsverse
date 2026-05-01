import { Link } from "react-router-dom";
import packages from "../data/packages";
import styles from "./PackagesPage.module.css";

export default function PackagesPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Packages</h1>
        <p className="page-subtitle">
          Browse our AI-powered website packages. Preview any design and make it
          yours. Each package includes a base fee determined by the scope of your
          project. We're also available for ongoing maintenance at a monthly rate.
        </p>
      </div>

      <div className={styles.grid}>
        {packages.map((pkg) => (
          <div key={pkg.slug} className={styles.card} data-testid="package-card">
            <h2 className={styles.cardName}>{pkg.name}</h2>
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
    </div>
  );
}
