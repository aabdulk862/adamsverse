import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import styles from "./ContactSection.module.css";

const LAYOUT_CLASS_MAP = {
  professional: "contactProfessional",
  beauty: "contactBeauty",
};

const DEFAULT_LAYOUT = "professional";

export default function ContactSection({ content, theme, layout, packageName }) {
  const { heading, phone, email, address, hours } = content || {};
  const resolvedLayout = LAYOUT_CLASS_MAP[layout] ? layout : DEFAULT_LAYOUT;
  const variantClass = LAYOUT_CLASS_MAP[resolvedLayout];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const sectionClassName = [
    styles.contact,
    variantClass ? styles[variantClass] : "",
  ]
    .filter(Boolean)
    .join(" ");

  const hasContactInfo = phone || email || address || hours;

  return (
    <motion.section
      ref={ref}
      className={sectionClassName}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className={styles.inner}>
        {heading && <h2 className={styles.heading}>{heading}</h2>}
        {hasContactInfo && (
          <div className={styles.details}>
            {phone && (
              <div className={styles.item}>
                <span className={styles.itemIcon} aria-hidden="true">📞</span>
                <div className={styles.itemContent}>
                  <span className={styles.itemLabel}>Phone</span>
                  <a href={`tel:${phone}`} className={styles.itemValue}>{phone}</a>
                </div>
              </div>
            )}
            {email && (
              <div className={styles.item}>
                <span className={styles.itemIcon} aria-hidden="true">✉️</span>
                <div className={styles.itemContent}>
                  <span className={styles.itemLabel}>Email</span>
                  <a href={`mailto:${email}`} className={styles.itemValue}>{email}</a>
                </div>
              </div>
            )}
            {address && (
              <div className={styles.item}>
                <span className={styles.itemIcon} aria-hidden="true">📍</span>
                <div className={styles.itemContent}>
                  <span className={styles.itemLabel}>Address</span>
                  <span className={styles.itemValue}>{address}</span>
                </div>
              </div>
            )}
            {hours && (
              <div className={styles.item}>
                <span className={styles.itemIcon} aria-hidden="true">🕐</span>
                <div className={styles.itemContent}>
                  <span className={styles.itemLabel}>Hours</span>
                  <span className={styles.itemValue}>{hours}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}
