import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";

/**
 * ProductCard — Renders a single product from the product registry.
 *
 * @param {Object} props
 * @param {import('../data/productRegistry').Product} props.product - Product object from registry
 * @param {boolean} [props.isAuthenticated=true] - Whether user is logged in (defaults to true; lock icon shows when false)
 */
export default function ProductCard({ product, isAuthenticated = true }) {
  const { name, description, icon, url, status, isExternal, requiresSubscription } = product;
  const [isTouched, setIsTouched] = useState(false);
  const touchTimeoutRef = useRef(null);

  const isComingSoon = status === "coming-soon";
  const isBeta = status === "beta";
  const showLock = requiresSubscription && !isAuthenticated;

  const ariaLabel = `${name} – ${status === "coming-soon" ? "Coming Soon" : status === "beta" ? "Beta" : "Live"}`;

  const handleTouchStart = useCallback(() => {
    setIsTouched(true);
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (isComingSoon) {
        e.preventDefault();
        setIsTouched(false);
        return;
      }
      // Provide 200ms visual feedback before navigation
      e.preventDefault();
      touchTimeoutRef.current = setTimeout(() => {
        setIsTouched(false);
        // Trigger navigation after feedback
        if (isExternal) {
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          // Programmatic navigation for internal links on touch
          e.target.closest("a")?.click();
        }
      }, 200);
    },
    [isComingSoon, isExternal, url]
  );

  // Cleanup timeout on unmount
  const cleanupRef = useCallback(
    (node) => {
      if (!node) {
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
        }
      }
    },
    []
  );

  const cardContent = (
    <>
      <div className={styles.header}>
        <i className={`${styles.icon} ${icon}`} aria-hidden="true"></i>
        <div className={styles.titleRow}>
          <h3 className={styles.name}>{name}</h3>
          {isBeta && <span className={`${styles.badge} ${styles.badgeBeta}`}>Beta</span>}
          {isComingSoon && <span className={`${styles.badge} ${styles.badgeComingSoon}`}>Coming Soon</span>}
          {showLock && <i className={`fas fa-lock ${styles.lock}`} aria-hidden="true"></i>}
        </div>
      </div>
      <p className={styles.description}>{description}</p>
      <div className={styles.footer}>
        {isExternal && !isComingSoon && (
          <i className={`fas fa-external-link-alt ${styles.externalIcon}`} aria-hidden="true"></i>
        )}
      </div>
    </>
  );

  const className = [
    styles.card,
    isComingSoon && styles.muted,
    isTouched && styles.touched,
  ]
    .filter(Boolean)
    .join(" ");

  // Coming soon cards are non-clickable
  if (isComingSoon) {
    return (
      <div
        className={className}
        aria-label={ariaLabel}
        role="article"
        ref={cleanupRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {cardContent}
      </div>
    );
  }

  // External links open in new tab
  if (isExternal) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
        ref={cleanupRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => {
          setIsTouched(true);
          setTimeout(() => setIsTouched(false), 200);
        }}
      >
        {cardContent}
      </a>
    );
  }

  // Internal links use React Router
  return (
    <Link
      to={url}
      className={className}
      aria-label={ariaLabel}
      ref={cleanupRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={(e) => {
        setIsTouched(true);
        setTimeout(() => setIsTouched(false), 200);
      }}
    >
      {cardContent}
    </Link>
  );
}
