import { products } from "../data/productRegistry";
import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";

/**
 * ProductGrid — Renders all products from the registry in a responsive grid.
 * 2x2 on desktop (>768px), single column on mobile (≤768px).
 * The first product (Website Packages) spans full width as the featured product.
 */
export default function ProductGrid() {
  const [featured, ...rest] = products;

  return (
    <section className={styles.grid} aria-label="Our Products">
      <div className={styles.featured}>
        <ProductCard product={featured} />
      </div>
      <div className={styles.secondary}>
        {rest.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
