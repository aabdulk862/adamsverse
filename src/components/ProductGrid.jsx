import { products } from "../data/productRegistry";
import ProductCard from "./ProductCard";
import AnimatedSection from "./AnimatedSection";
import styles from "./ProductGrid.module.css";

/**
 * ProductGrid — Featured product (Website Packages) at top,
 * then tools/platforms as secondary ecosystem proof.
 */
export default function ProductGrid() {
  const [featured, ...rest] = products;

  return (
    <section className={styles.wrapper} aria-label="Our Products">
      <AnimatedSection>
        <div className={styles.featured}>
          <ProductCard product={featured} />
        </div>

        <div className={styles.toolsHeader}>
          <h3 className={styles.toolsHeading}>Products & Platforms</h3>
          <p className={styles.toolsSubtitle}>
            Tools and systems we've built to solve real problems.
          </p>
        </div>

        <div className={styles.secondary}>
          {rest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </AnimatedSection>
    </section>
  );
}
