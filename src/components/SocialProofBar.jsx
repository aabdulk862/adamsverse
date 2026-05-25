import AnimatedSection from "./AnimatedSection";
import styles from "./SocialProofBar.module.css";

const capabilities = [
  { icon: "fas fa-bolt", label: "Launch in Days" },
  { icon: "fas fa-search", label: "Built for Google" },
  { icon: "fas fa-shield-alt", label: "Enterprise-Grade" },
  { icon: "fas fa-headset", label: "Direct Access" },
];

export default function SocialProofBar() {
  return (
    <section className={styles.socialProofBar} aria-label="Core capabilities">
      {capabilities.map((cap, index) => (
        <AnimatedSection
          key={cap.label}
          delay={index * 0.1}
          className={styles.metric}
        >
          <span className={styles.value}>
            <i className={cap.icon} aria-hidden="true"></i>
          </span>
          <span className={styles.label}>{cap.label}</span>
        </AnimatedSection>
      ))}
    </section>
  );
}
